/**
 * Clio runs four separate regional deployments. There is no single global API
 * endpoint — a token minted for one region is not valid against another region's
 * API host.
 */
export type ClioRegion = 'us' | 'ca' | 'eu' | 'au';

/** `https://app.clio.com/api/v4` and friends — where matters/contacts/etc. live. */
export const API_BASE_URLS: Record<ClioRegion, string> = {
  us: 'https://app.clio.com/api/v4',
  eu: 'https://eu.app.clio.com/api/v4',
  ca: 'https://ca.app.clio.com/api/v4',
  au: 'https://au.app.clio.com/api/v4',
};

/**
 * OAuth 2.0 authorize/token hosts.
 *
 * Confirmed against https://docs.developers.clio.com/handbook/getting-started/regions/
 * and https://docs.developers.clio.com/api-docs/clio-manage/authorization/: Clio Manage's
 * OAuth authorize/token endpoints are region-specific, living on the same host as that
 * region's data API (just without the `/api/v4` suffix) — an EU/CA/AU app must exchange
 * its code against that region's own `oauth/token` host, not `app.clio.com`. (Empirically
 * verified live: `eu/ca/au.app.clio.com/oauth/authorize` all respond distinctly from
 * `app.clio.com`, redirecting to that region's own login page.) This SDK threads the
 * same `region` value through to both the data API base URL and the OAuth host so
 * callers only specify region once. Note a Clio developer app registration is itself
 * region-specific (separate client_id/client_secret per region).
 */
export const OAUTH_BASE_URLS: Record<ClioRegion, string> = {
  us: 'https://app.clio.com',
  eu: 'https://eu.app.clio.com',
  ca: 'https://ca.app.clio.com',
  au: 'https://au.app.clio.com',
};

export interface ClioClientConfig {
  /** OAuth access token. Required. */
  accessToken: string;
  /** OAuth refresh token. Required for automatic refresh-on-401 handling. */
  refreshToken?: string;
  /** OAuth client ID, registered in the region-specific Clio developer portal. Required for refresh. */
  clientId?: string;
  /** OAuth client secret. Required for refresh. */
  clientSecret?: string;
  /** Which regional Clio deployment to talk to. Defaults to `'us'`. */
  region?: ClioRegion;
  /** Override the API base URL entirely (mostly for testing). */
  baseUrl?: string;
  /** Override the OAuth base URL entirely (mostly for testing). */
  oauthBaseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 30000. */
  timeoutMs?: number;
  /** Invoked whenever the client refreshes the access token, so callers can persist the new pair. */
  onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string; expiresIn: number }) => void;
}

export const DEFAULT_TIMEOUT_MS = 30_000;
