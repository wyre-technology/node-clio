import { ClioClient } from '../src/index.js';

/** A `ClioClient` pointed at the default US region, matching `tests/mocks/constants.ts`'s `BASE_URL`. */
export function createTestClient(overrides: Partial<ConstructorParameters<typeof ClioClient>[0]> = {}): ClioClient {
  return new ClioClient({
    accessToken: 'test-access-token',
    region: 'us',
    ...overrides,
  });
}
