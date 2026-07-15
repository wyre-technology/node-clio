# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-07-15

### Added

- Initial release of `@wyre-technology/node-clio`, a TypeScript/JavaScript client
  for the Clio Manage API v4.
- Region-aware `ClioClient` supporting US, EU, CA, and AU deployments.
- OAuth 2.0 authorization-code and refresh-token flows (`src/auth.ts`).
- Automatic access-token refresh on `401` responses when refresh credentials are
  configured.
- Resources: `matters`, `contacts`, `activities`, `communications` (read-only),
  `tasks`, `documents` (metadata only), `calendarEntries` (read-only), `bills`
  (read-only).
- Typed error hierarchy: `ServiceError`, `AuthenticationError`, `ForbiddenError`,
  `NotFoundError`, `ValidationError`, `RateLimitError`, `ServerError`.
- Zero runtime dependencies (native `fetch` only).

### Features

- initial Clio Manage API v4 TypeScript SDK ([cc30c81](https://github.com/wyre-technology/node-clio/commit/cc30c8158ac96f4e513db1f78a3ce02c036db8a0))

[Unreleased]: https://github.com/wyre-technology/node-clio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/wyre-technology/node-clio/releases/tag/v1.0.0
