import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ServiceError,
  ValidationError,
} from './errors.js';
import { RateLimiter } from './rate-limiter.js';
import type { ClioErrorResponse } from './types/common.js';
import { DEFAULT_TIMEOUT_MS } from './config.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestParamValue = string | number | boolean | undefined | null | Array<string | number>;

export interface RequestOptions {
  method?: HttpMethod;
  params?: Record<string, RequestParamValue>;
  body?: unknown;
  /** Internal: set on the retry after a 401 refresh so we don't refresh-loop forever. */
  _isRetry?: boolean;
}

export interface TokenRefresher {
  /** Exchanges the configured refresh token for a new access token. Throws on failure. */
  refresh(): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>;
}

export interface HttpClientOptions {
  baseUrl: string;
  getAccessToken: () => string;
  setAccessToken: (token: string) => void;
  tokenRefresher?: TokenRefresher;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Thin HTTP client around native `fetch` implementing:
 * - Clio's documented `.json`-suffixed resource paths (e.g. `/matters.json`,
 *   `/matters/{id}.json`) -- resource classes supply the full path, unmodified
 * - A client-side token-bucket rate limiter
 * - 401 -> refresh access token -> retry once
 * - Typed errors for 400/401/403/404/422/429/5xx
 *
 * `request<T>()` returns the raw parsed JSON body (Clio's `{ data, meta }` envelope
 * intact) -- resource classes are responsible for unwrapping via `unwrap()` (single
 * resources) or reading `.data`/`.meta` directly (list responses, to preserve paging
 * info). This keeps pagination metadata available to callers that need it.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => string;
  private readonly setAccessToken: (token: string) => void;
  private readonly tokenRefresher?: TokenRefresher;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly rateLimiter = new RateLimiter();
  private refreshInFlight: Promise<void> | null = null;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.getAccessToken = options.getAccessToken;
    this.setAccessToken = options.setAccessToken;
    this.tokenRefresher = options.tokenRefresher;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private buildUrl(path: string, params?: RequestOptions['params']): string {
    // Clio's API reference documents every resource path with an explicit `.json`
    // suffix (e.g. `/matters.json`, `/matters/{id}.json`) -- pass paths through as-is
    // rather than normalizing a trailing slash (that would corrupt `.json` paths).
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          // Clio's documented filter syntax for array-valued params is repeated
          // `key[]=value` entries, e.g. `?ids[]=1&ids[]=2` -- not a single
          // comma-joined value.
          for (const item of value) {
            url.searchParams.append(`${key}[]`, String(item));
          }
          continue;
        }
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    await this.rateLimiter.acquire();

    const method = options.method ?? 'GET';
    const url = this.buildUrl(path, options.params);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    return this.handleResponse<T>(response, path, options);
  }

  private async handleResponse<T>(
    response: Response,
    path: string,
    originalOptions: RequestOptions
  ): Promise<T> {
    if (response.ok) {
      if (response.status === 204) return {} as T;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const rawText = await response.text();
        return (rawText ? JSON.parse(rawText) : {}) as T;
      }
      return {} as T;
    }

    // SAFE: read the body as text exactly once, then attempt JSON.parse.
    // Calling response.json() and then response.text() (or vice versa) throws
    // "Body already been read" -- always go through .text() first.
    const rawText = await response.text();
    let responseBody: unknown;
    try {
      responseBody = rawText ? JSON.parse(rawText) : {};
    } catch {
      responseBody = rawText;
    }

    const errorBody = responseBody as ClioErrorResponse;
    const message = errorBody?.error?.message ?? errorBody?.message ?? response.statusText;

    switch (response.status) {
      case 401: {
        if (originalOptions._isRetry || !this.tokenRefresher) {
          throw new AuthenticationError(message || 'Authentication failed', responseBody);
        }
        await this.refreshAccessToken();
        return this.request<T>(path, { ...originalOptions, _isRetry: true });
      }
      case 403:
        throw new ForbiddenError(message || 'Forbidden', responseBody);
      case 404:
        throw new NotFoundError(message || 'Resource not found', responseBody);
      case 400:
      case 422: {
        // Clio's documented error shape for general errors (e.g. 403) is
        // `{ "error": { "type": ..., "message": ... } }` (confirmed in the
        // Permissions doc). Field-level 422 validation errors aren't documented
        // with a worked JSON example anywhere in the API reference, so this
        // defensively handles the two shapes Rails JSON APIs commonly use:
        // `error.fields` (hash of field -> message[]) and a top-level `errors`
        // hash of the same shape. Falls back to a single message-only error.
        const fieldsSource = errorBody?.error?.fields ?? errorBody?.errors ?? {};
        const errors = Object.entries(fieldsSource).flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages]).map((fieldMessage) => ({
            field,
            message: String(fieldMessage),
          }))
        );
        throw new ValidationError(message || 'Validation failed', errors, responseBody, response.status);
      }
      case 429: {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : 0;
        throw new RateLimitError(message || 'Rate limit exceeded', retryAfter, responseBody);
      }
      default:
        if (response.status >= 500) {
          throw new ServerError(message || 'Server error', response.status, responseBody);
        }
        throw new ServiceError(message || 'Request failed', response.status, responseBody);
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.tokenRefresher) return;

    // Coalesce concurrent refreshes triggered by parallel in-flight requests.
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.tokenRefresher
        .refresh()
        .then((tokens) => {
          this.setAccessToken(tokens.accessToken);
        })
        .finally(() => {
          this.refreshInFlight = null;
        });
    }
    return this.refreshInFlight;
  }
}

/**
 * Defensively unwraps Clio's `{ data: ... }` envelope. Some endpoints (and some
 * mocked/older responses) return the bare payload instead -- handle both rather
 * than assume the envelope is always present.
 */
export function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}
