import { AuthenticationError } from './errors.js';
import { OAUTH_BASE_URLS, type ClioRegion } from './config.js';
import type { TokenRefresher } from './http.js';

/**
 * OAuth 2.0 Authorization Code grant support for Clio.
 *
 * Clio apps are registered manually (client_id + client_secret) via a region-specific
 * developer portal — there is no Dynamic Client Registration endpoint. Unlike many
 * OAuth providers, Clio does **not** accept a `scope` parameter at authorize time:
 * access permissions (which resources, read-only vs read/write) are selected once,
 * per app, in the developer portal at app-creation time, and apply to every user who
 * authorizes that app. See
 * https://docs.developers.clio.com/api-docs/clio-manage/authorization/ for the full
 * flow and https://docs.developers.clio.com/api-docs/clio-manage/permissions/ for how
 * access permissions work.
 */

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  /** Which regional Clio deployment issued (or will issue) this app's credentials. Defaults to `'us'`. */
  region?: ClioRegion;
  /** Override the OAuth host entirely (mostly for testing). */
  oauthBaseUrl?: string;
}

export interface TokenResponse {
  accessToken: string;
  /**
   * Present on the authorization-code exchange. On a refresh-token exchange,
   * Clio's documented response does not include a new refresh token (Clio refresh
   * tokens do not expire or rotate) -- callers should keep using the refresh token
   * they already have. See {@link refreshAccessToken}.
   */
  refreshToken?: string;
  tokenType: string;
  /** Seconds until the access token expires. Clio documents 2,592,000 (30 days). */
  expiresIn: number;
}

interface RawTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

function resolveOAuthBaseUrl(creds: Pick<OAuthCredentials, 'region' | 'oauthBaseUrl'>): string {
  return creds.oauthBaseUrl ?? OAUTH_BASE_URLS[creds.region ?? 'us'];
}

/**
 * Builds the URL to redirect a user to for the OAuth 2.0 Authorization Code grant.
 * The user approves access on Clio's site (to whatever permissions your app was
 * registered with in the developer portal -- there is no per-request `scope`) and is
 * redirected back to `redirectUri` with a `code` query parameter, valid for 10
 * minutes, which you then pass to {@link exchangeAuthorizationCode}.
 */
export function buildAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  /** Opaque value round-tripped back to your redirect URI; use it to prevent CSRF. */
  state?: string;
  /**
   * When true, a user who declines is redirected back to `redirectUri` (with
   * `error=access_denied`) instead of being shown a Clio-hosted error page.
   * Defaults to `false`.
   */
  redirectOnDecline?: boolean;
  region?: ClioRegion;
  oauthBaseUrl?: string;
}): string {
  const base = resolveOAuthBaseUrl(params);
  const url = new URL(`${base}/oauth/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  if (params.state) url.searchParams.set('state', params.state);
  if (params.redirectOnDecline) url.searchParams.set('redirect_on_decline', 'true');
  return url.toString();
}

async function postToken(
  oauthBaseUrl: string,
  body: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<TokenResponse> {
  const response = await fetchImpl(`${oauthBaseUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(body).toString(),
  });

  const rawText = await response.text();
  let parsed: RawTokenResponse;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new AuthenticationError(`Token endpoint returned a non-JSON response: ${rawText}`, rawText);
  }

  if (!response.ok || parsed.error) {
    throw new AuthenticationError(
      parsed.error_description ?? parsed.error ?? `Token request failed with HTTP ${response.status}`,
      parsed
    );
  }

  return {
    accessToken: parsed.access_token,
    refreshToken: parsed.refresh_token,
    tokenType: parsed.token_type,
    expiresIn: parsed.expires_in,
  };
}

/**
 * Exchanges an authorization code (obtained after the user approves access at the
 * {@link buildAuthorizationUrl} URL) for an access token + refresh token pair.
 * The code is only valid for 10 minutes.
 */
export async function exchangeAuthorizationCode(
  params: OAuthCredentials & { code: string; redirectUri: string; fetchImpl?: typeof fetch }
): Promise<Required<Pick<TokenResponse, 'refreshToken'>> & TokenResponse> {
  const oauthBaseUrl = resolveOAuthBaseUrl(params);
  const tokens = await postToken(
    oauthBaseUrl,
    {
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    },
    params.fetchImpl ?? fetch
  );
  if (!tokens.refreshToken) {
    throw new AuthenticationError('Token endpoint did not return a refresh_token', tokens);
  }
  return tokens as Required<Pick<TokenResponse, 'refreshToken'>> & TokenResponse;
}

/**
 * Exchanges a refresh token for a new access token. Clio's refresh tokens do not
 * expire and are not rotated on refresh -- the response only contains a new
 * `access_token`/`expires_in` (no new `refresh_token`), so keep reusing the refresh
 * token you already have.
 */
export async function refreshAccessToken(
  params: OAuthCredentials & { refreshToken: string; fetchImpl?: typeof fetch }
): Promise<TokenResponse> {
  const oauthBaseUrl = resolveOAuthBaseUrl(params);
  return postToken(
    oauthBaseUrl,
    {
      grant_type: 'refresh_token',
      refresh_token: params.refreshToken,
      client_id: params.clientId,
      client_secret: params.clientSecret,
    },
    params.fetchImpl ?? fetch
  );
}

/**
 * {@link TokenRefresher} implementation backed by {@link refreshAccessToken}, used
 * internally by {@link ClioClient} to auto-refresh on a 401 response.
 */
export class OAuthTokenRefresher implements TokenRefresher {
  constructor(
    private readonly credentials: OAuthCredentials,
    private readonly refreshToken: string,
    private readonly onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void,
    private readonly fetchImpl?: typeof fetch
  ) {}

  async refresh(): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const tokens = await refreshAccessToken({
      ...this.credentials,
      refreshToken: this.refreshToken,
      fetchImpl: this.fetchImpl,
    });
    // Clio doesn't rotate refresh tokens on refresh -- report back the original,
    // stable refresh token rather than the (absent) one on the raw response.
    const result = { accessToken: tokens.accessToken, refreshToken: this.refreshToken, expiresIn: tokens.expiresIn };
    this.onTokenRefresh?.(result);
    return result;
  }
}
