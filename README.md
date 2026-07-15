# @wyre-technology/node-clio

Node.js / TypeScript client for the [Clio Manage API](https://docs.developers.clio.com/) (v4).

Zero runtime dependencies — built on native `fetch`. Dual CJS/ESM build, full TypeScript types.

> **Status: v1, deliberately conservative.** This SDK handles privileged attorney-client
> data. See [Scope limitations](#scope-limitations-v1) before you rely on it for anything
> beyond read + basic create/update on the core practice-management objects.

## Install

```bash
npm install @wyre-technology/node-clio
```

This package is published to GitHub Packages. Add to your `.npmrc`:

```
@wyre-technology:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

## Quick start

### 1. Get an access token (OAuth 2.0, Authorization Code grant)

Clio apps are registered manually per region at a developer portal — there is no
Dynamic Client Registration. Register your app at the portal matching the region
whose data you want to access:

| Region | Developer portal |
|---|---|
| US | https://developers.clio.com |
| Canada | https://ca.developers.clio.com |
| EU | https://eu.developers.clio.com |
| Australia | https://au.developers.clio.com |

Unlike many OAuth providers, Clio does **not** take a `scope` parameter at
authorize time. Access permissions (which resources, read-only vs read/write) are
selected once when you create the app in the developer portal, and apply to every
user who authorizes it — see [Permissions](https://docs.developers.clio.com/api-docs/clio-manage/permissions/).

```ts
import { buildAuthorizationUrl, exchangeAuthorizationCode } from '@wyre-technology/node-clio';

// 1a. Send the user to Clio to approve access.
const authUrl = buildAuthorizationUrl({
  clientId: process.env.CLIO_CLIENT_ID!,
  redirectUri: 'https://your-app.example.com/oauth/callback',
  region: 'us', // 'us' | 'ca' | 'eu' | 'au'
});
// redirect the user's browser to authUrl ...

// 1b. In your OAuth callback handler, exchange the returned `code` for tokens.
// The code is only valid for 10 minutes.
const tokens = await exchangeAuthorizationCode({
  code: incomingRequest.query.code,
  redirectUri: 'https://your-app.example.com/oauth/callback',
  clientId: process.env.CLIO_CLIENT_ID!,
  clientSecret: process.env.CLIO_CLIENT_SECRET!,
  region: 'us',
});
// tokens.accessToken, tokens.refreshToken, tokens.expiresIn -- persist these.
// Clio access tokens last 30 days (2,592,000s); refresh tokens do not expire
// and are never rotated -- the same refreshToken keeps working indefinitely.
```

### 2. Construct the client

```ts
import { ClioClient } from '@wyre-technology/node-clio';

const client = new ClioClient({
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  clientId: process.env.CLIO_CLIENT_ID,
  clientSecret: process.env.CLIO_CLIENT_SECRET,
  region: 'us', // defaults to 'us' if omitted
  onTokenRefresh: (newTokens) => {
    // Persist the new accessToken. refreshToken is the same one you started with
    // (Clio doesn't rotate refresh tokens), included here for convenience.
    saveTokensSomewhere(newTokens);
  },
});

const openMatters = await client.matters.list({ status: 'open' });
```

If `refreshToken`, `clientId`, and `clientSecret` are all provided, the client
automatically refreshes the access token and retries once on a `401` response.
Without them, a `401` surfaces as an `AuthenticationError`.

## The `region` parameter

Clio runs four separate regional deployments with **no shared global endpoint** —
a token minted in one region cannot be used against another region's API host.
Pass the `region` your Clio account/app lives in:

| `region` | Data API base URL |
|---|---|
| `'us'` (default) | `https://app.clio.com/api/v4` |
| `'eu'` | `https://eu.app.clio.com/api/v4` |
| `'ca'` | `https://ca.app.clio.com/api/v4` |
| `'au'` | `https://au.app.clio.com/api/v4` |

The OAuth authorize/token hosts mirror the same region — confirmed against Clio's
[Regions doc](https://docs.developers.clio.com/handbook/getting-started/regions/):
Clio Manage's OAuth endpoints live on the same regional host as the data API
(`https://{region}.app.clio.com/oauth/authorize` and `/oauth/token`, no `eu`/`ca`/`au`
prefix for `us`). `buildAuthorizationUrl`, `exchangeAuthorizationCode`, and
`refreshAccessToken` all accept the same `region` option and route to the matching
host. Note that a Clio developer app is region-specific too — if you serve customers
in multiple regions you need a separate app registration (separate `client_id`/`client_secret`)
per region, created at that region's own developer portal.

## Method reference

Every resource is available as a property on `ClioClient`. `list()` returns a
`Page<T>` (`{ data, meta, hasMore, nextUrl }`); pass `meta.paging.next` through
`extractPageToken()` (or the raw URL's `page_token` param) back into `params.page_token`
to fetch the next page. Clio's cursor pagination requires `order: 'id(asc)'` and no
`offset` for unlimited results — see [Pagination](https://docs.developers.clio.com/api-docs/clio-manage/paging/).

**Important:** if you don't pass `fields`, Clio returns only a minimal default field
set (usually just `id`/`etag`) for most endpoints — not the full record. Pass
`fields: 'id,etag,display_number,status,...'` (nested: `'client{id,name}'`) explicitly
to get anything else. See [Fields](https://docs.developers.clio.com/api-docs/clio-manage/fields/).

| Resource | Methods | Endpoint(s) | Notes |
|---|---|---|---|
| `client.matters` | `list(params?)`, `get(id, params?)`, `create(data, params?)`, `update(id, data, params?)` | `/matters.json` | Core case/file object: client, responsible attorney, status, practice area, custom fields |
| `client.contacts` | `list(params?)`, `get(id, params?)`, `create(data, params?)`, `update(id, data, params?)` | `/contacts.json` | People (`type: 'Person'`) and companies (`type: 'Company'`) |
| `client.activities` | `list(params?)`, `get(id, params?)`, `create(data, params?)` | `/activities.json` | Time entries (`TimeEntry`) and expense entries (`ExpenseEntry`/`HardCostEntry`/`SoftCostEntry`) |
| `client.communications` | `list(params?)`, `get(id, params?)` | `/communications.json` | **Read-only** — logged emails/calls. See [Scope limitations](#scope-limitations-v1) |
| `client.tasks` | `list(params?)`, `get(id, params?)`, `create(data, params?)`, `update(id, data, params?)` | `/tasks.json` | |
| `client.documents` | `list(params?)`, `get(id, params?)` | `/documents.json` | **Metadata only.** See [Scope limitations](#scope-limitations-v1) |
| `client.calendarEntries` | `list(params?)`, `get(id, params?)` | `/calendar_entries.json` (note: underscore) | **Read-only.** See [Scope limitations](#scope-limitations-v1) |
| `client.bills` | `list(params?)`, `get(id, params?)` | `/bills.json` | **Read-only.** See [Scope limitations](#scope-limitations-v1) |

`create()`/`update()` send `PATCH`/`POST` with the request body wrapped in `{ data: ... }`,
matching Clio's documented request envelope. `id` is a `number` for every resource
except `calendarEntries`, whose response schema documents `id` as a `string` (see
`CalendarEntry` in `src/types/calendar-entries.ts`).

See the TypeScript types exported from each `src/types/*.ts` file (re-exported from
the package root) for full request/response field shapes, confirmed field-by-field
against Clio's [API reference](https://docs.developers.clio.com/clio-manage/api-reference/).

## Scope limitations (v1)

This SDK intentionally does **not** implement everything the Clio API exposes.
Each limitation below is a deliberate v1 decision, not an oversight:

- **No `delete()` on any resource.** This SDK is a foundation the MCP-server layer
  builds on; that layer classifies and warns on destructive calls. Rather than half-build
  delete support without that guardrail in place, deletion is omitted entirely for v1.
- **`communications` is read-only.** Logged emails/calls/notes routinely contain
  privileged attorney-client content; write/mutate support is out of scope until that
  data path gets its own review.
- **`bills` is read-only.** Billing and trust-accounting mutations touch regulated
  funds-handling workflows and are out of scope for v1.
- **`documents` is metadata-only — no content upload/download.** Documents are the
  highest-sensitivity object in a legal practice-management system; content transfer
  deserves a dedicated security review before this SDK moves bytes in or out.

## Error handling

All errors extend `ServiceError` (`message`, `statusCode`, `response`). `response`
always carries the raw parsed (or raw text, if not JSON) response body, so nothing
is lost even where a typed field is missing.

> **Note on `ValidationError.errors`:** Clio's docs confirm the general error
> envelope (`{ "error": { "type", "message" } }`, used for e.g. 403s) but don't
> publish a worked JSON example for field-level 422 validation errors. This SDK
> defensively parses both `error.fields` and a top-level `errors` hash (the two
> shapes Rails JSON APIs commonly use) into `errors`. If Clio's real shape differs,
> `errors` may come back empty — `message` and `response` are always reliable.

```ts
import {
  ServiceError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from '@wyre-technology/node-clio';

try {
  await client.matters.get(12345);
} catch (err) {
  if (err instanceof NotFoundError) {
    // 404
  } else if (err instanceof ValidationError) {
    // 400/422 -- err.errors is Array<{ field: string; message: string }>
  } else if (err instanceof RateLimitError) {
    // 429 -- err.retryAfter is seconds, when Clio provides it
  } else if (err instanceof AuthenticationError) {
    // 401 that survived a refresh attempt (or no refresh credentials configured)
  } else if (err instanceof ForbiddenError) {
    // 403 -- the app's access permissions (set in the developer portal) don't cover this resource
  } else if (err instanceof ServerError) {
    // 5xx
  } else if (err instanceof ServiceError) {
    // anything else
  }
}
```

## Development

```bash
npm install
npm run lint   # tsc --noEmit
npm run build  # tsup, dual CJS+ESM
npm test       # vitest + MSW fixtures
```

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[Apache-2.0](./LICENSE)
