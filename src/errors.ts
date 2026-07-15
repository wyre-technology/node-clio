/**
 * Error class hierarchy for the Clio API client.
 *
 * All errors raised by this SDK extend {@link ServiceError}. HTTP-status-specific
 * subclasses let callers use `instanceof` checks instead of comparing status codes.
 */

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 401 — missing, invalid, or expired credentials. */
export class AuthenticationError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 401, response);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 403 — authenticated, but the token's scopes don't permit this operation. */
export class ForbiddenError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 403, response);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 404 — the requested resource does not exist. */
export class NotFoundError extends ServiceError {
  constructor(message: string, response: unknown) {
    super(message, 404, response);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400/422 — the request body failed validation. Carries field-level detail when available. */
export class ValidationError extends ServiceError {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>,
    response: unknown,
    statusCode = 400
  ) {
    super(message, statusCode, response);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 429 — too many requests. `retryAfter` is in seconds when Clio provides it. */
export class RateLimitError extends ServiceError {
  constructor(
    message: string,
    public retryAfter: number,
    response: unknown
  ) {
    super(message, 429, response);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 5xx — an error on Clio's side. */
export class ServerError extends ServiceError {
  constructor(message: string, statusCode: number, response: unknown) {
    super(message, statusCode, response);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
