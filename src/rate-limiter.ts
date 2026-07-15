/**
 * A minimal token-bucket rate limiter.
 *
 * Clio documents a default rate limit of 50 requests per 60-second window per
 * access token (https://docs.developers.clio.com/api-docs/clio-manage/rate-limits/),
 * reported via `X-RateLimit-Limit`/`X-RateLimit-Remaining`/`X-RateLimit-Reset`
 * response headers, with a `Retry-After` header on the resulting 429. Off-peak
 * hours and per-endpoint limits can differ and this SDK doesn't read those headers
 * to adapt dynamically — this limiter is a client-side courtesy that mirrors
 * Clio's documented default, not a substitute for handling `RateLimitError`
 * (see `http.ts`), which remains the source of truth for what the server allows.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly maxTokens: number = 50,
    private readonly refillIntervalMs: number = 60_000
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed <= 0) return;

    const refillAmount = (elapsed / this.refillIntervalMs) * this.maxTokens;
    if (refillAmount > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + refillAmount);
      this.lastRefill = now;
    }
  }

  /** Resolves once a token is available, consuming it. */
  async acquire(): Promise<void> {
    for (;;) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      const waitMs = this.refillIntervalMs / this.maxTokens;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}
