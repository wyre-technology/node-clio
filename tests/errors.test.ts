import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server.js';
import { BASE_URL, OAUTH_BASE_URL } from './mocks/constants.js';
import { createTestClient } from './helpers.js';
import {
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from '../src/index.js';
import { sampleMatter } from './fixtures/matters.js';

/**
 * Cross-cutting HTTP error-handling behavior, implemented once in `src/http.ts` and
 * shared by every resource -- exercised here via the Matters endpoints rather than
 * duplicated per-resource. Covers (per the project brief): successful response
 * parsing (see the per-resource test files), 401 -> refresh -> retry, 404 ->
 * NotFoundError, 429 -> RateLimitError, and a validation error -> ValidationError
 * with field details.
 */
describe('HTTP error handling', () => {
  it('401 -> refreshes the access token -> retries once -> succeeds', async () => {
    let matterRequestCount = 0;
    const seenAuthHeaders: Array<string | null> = [];

    server.use(
      http.get(`${BASE_URL}/matters/:id.json`, ({ request }) => {
        matterRequestCount += 1;
        seenAuthHeaders.push(request.headers.get('authorization'));
        if (matterRequestCount === 1) {
          return HttpResponse.json(
            { error: { type: 'AuthenticationError', message: 'Access token expired' } },
            { status: 401 }
          );
        }
        return HttpResponse.json({ data: sampleMatter });
      }),
      http.post(`${OAUTH_BASE_URL}/oauth/token`, async ({ request }) => {
        const body = await request.text();
        expect(body).toContain('grant_type=refresh_token');
        expect(body).toContain('refresh_token=test-refresh-token');
        return HttpResponse.json({
          token_type: 'bearer',
          access_token: 'refreshed-access-token',
          expires_in: 2_592_000,
        });
      })
    );

    const client = createTestClient({
      accessToken: 'expired-access-token',
      refreshToken: 'test-refresh-token',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });

    const matter = await client.matters.get(1001);

    expect(matter).toEqual(sampleMatter);
    expect(matterRequestCount).toBe(2);
    expect(seenAuthHeaders[0]).toBe('Bearer expired-access-token');
    expect(seenAuthHeaders[1]).toBe('Bearer refreshed-access-token');
  });

  it('401 without refresh credentials throws AuthenticationError immediately', async () => {
    server.use(
      http.get(`${BASE_URL}/matters/:id.json`, () =>
        HttpResponse.json({ error: { type: 'AuthenticationError', message: 'Access token expired' } }, { status: 401 })
      )
    );

    const client = createTestClient({ accessToken: 'expired-access-token' });

    await expect(client.matters.get(1001)).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('404 -> NotFoundError', async () => {
    server.use(
      http.get(`${BASE_URL}/matters/:id.json`, () =>
        HttpResponse.json({ error: { type: 'NotFoundError', message: 'Matter not found' } }, { status: 404 })
      )
    );

    const client = createTestClient();

    await expect(client.matters.get(999999)).rejects.toBeInstanceOf(NotFoundError);
    await expect(client.matters.get(999999)).rejects.toThrow('Matter not found');
  });

  it('403 -> ForbiddenError', async () => {
    // Exact response shape confirmed from Clio's Permissions doc.
    server.use(
      http.get(`${BASE_URL}/matters/:id.json`, () =>
        HttpResponse.json(
          { error: { type: 'ForbiddenError', message: 'User is forbidden from taking that action' } },
          { status: 403 }
        )
      )
    );

    const client = createTestClient();

    await expect(client.matters.get(1001)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('429 -> RateLimitError with retryAfter from the Retry-After header', async () => {
    server.use(
      http.get(`${BASE_URL}/matters.json`, () =>
        HttpResponse.json(
          { error: { type: 'TooManyRequestsError', message: 'Rate limit exceeded' } },
          { status: 429, headers: { 'Retry-After': '30' } }
        )
      )
    );

    const client = createTestClient();

    const error = await client.matters.list().catch((e) => e);
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(30);
  });

  it('422 with error.fields -> ValidationError with field details', async () => {
    server.use(
      http.post(`${BASE_URL}/matters.json`, () =>
        HttpResponse.json(
          {
            error: {
              type: 'ValidationError',
              message: 'Validation failed',
              fields: { description: ["can't be blank"] },
            },
          },
          { status: 422 }
        )
      )
    );

    const client = createTestClient();

    const error = await client.matters.create({ client: { id: 501 }, description: '' }).catch((e) => e);
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).errors).toEqual([{ field: 'description', message: "can't be blank" }]);
  });

  it('422 with a top-level errors hash -> ValidationError with field details (alternate Rails shape)', async () => {
    server.use(
      http.post(`${BASE_URL}/matters.json`, () =>
        HttpResponse.json(
          { errors: { description: ["can't be blank"], client: ['must be present'] } },
          { status: 422 }
        )
      )
    );

    const client = createTestClient();

    const error = await client.matters.create({ client: { id: 501 }, description: '' }).catch((e) => e);
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).errors).toEqual(
      expect.arrayContaining([
        { field: 'description', message: "can't be blank" },
        { field: 'client', message: 'must be present' },
      ])
    );
  });
});
