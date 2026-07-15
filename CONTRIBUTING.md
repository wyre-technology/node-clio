# Contributing to node-clio

Thanks for your interest in contributing to `@wyre-technology/node-clio`.

## Development setup

```bash
git clone git@github.com:wyre-technology/node-clio.git
cd node-clio
npm install
```

## Workflow

1. Create a branch off `main`.
2. Make your changes. Keep resource classes and types aligned with the actual
   [Clio API reference](https://docs.developers.clio.com/api-reference/) — do not
   guess field names, verify them against the docs.
3. Add or update tests under `tests/` using MSW fixtures/handlers. Every resource
   method needs coverage for the success path plus the relevant error paths
   (401/404/429/422).
4. Run the full check suite locally before opening a PR:

   ```bash
   npm run lint    # tsc --noEmit
   npm run build   # tsup dual CJS+ESM build
   npm test        # vitest + MSW
   ```

5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
   (`fix:`, `feat:`, `docs:`, `chore:`, etc.) — this repo releases via
   [semantic-release](https://semantic-release.gitbook.io/), and commit type
   drives the version bump.
6. Open a PR against `main`. CI must be green (lint, build, test on Node 20 and 22)
   before merge.

## Scope discipline

This SDK is deliberately conservative for v1 because it handles privileged
attorney-client data. Before adding a new method, check whether it falls inside
the v1 scope limits documented in the README (no `delete()` on any resource, no
document content transfer, `communications`/`bills` are read-only). Expanding
scope beyond v1 requires updating the README's limitations section in the same PR,
with the reasoning for the change.

## Reporting issues

Open a [GitHub issue](https://github.com/wyre-technology/node-clio/issues) with:
- The SDK version
- A minimal reproduction
- The relevant Clio API response (redact any client/matter data)

## License

By contributing, you agree that your contributions will be licensed under the
Apache License, Version 2.0 (see [LICENSE](./LICENSE)).
