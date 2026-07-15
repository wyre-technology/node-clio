import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server.js';
import { OAUTH_BASE_URL } from './mocks/constants.js';
import { buildAuthorizationUrl, exchangeAuthorizationCode, refreshAccessToken, AuthenticationError } from '../src/index.js';

describe('buildAuthorizationUrl', () => {
  it('builds the authorize URL with only Clio-documented params (no scope)', () => {
    const url = buildAuthorizationUrl({
      clientId: 'test-client-id',
      redirectUri: 'https://app.example.com/callback',
      state: 'xyz',
      region: 'us',
    });

    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://app.clio.com/oauth/authorize');
    expect(parsed.searchParams.get('response_type')).toBe('code');
    expect(parsed.searchParams.get('client_id')).toBe('test-client-id');
    expect(parsed.searchParams.get('redirect_uri')).toBe('https://app.example.com/callback');
    expect(parsed.searchParams.get('state')).toBe('xyz');
    // Clio's /oauth/authorize does not accept a scope param -- permissions are
    // fixed at app-registration time in the developer portal.
    expect(parsed.searchParams.has('scope')).toBe(false);
  });

  it('routes to the region-specific host', () => {
    const url = buildAuthorizationUrl({
      clientId: 'test-client-id',
      redirectUri: 'https://app.example.com/callback',
      region: 'eu',
    });

    expect(url.startsWith('https://eu.app.clio.com/oauth/authorize')).toBe(true);
  });

  it('sets redirect_on_decline when requested', () => {
    const url = buildAuthorizationUrl({
      clientId: 'test-client-id',
      redirectUri: 'https://app.example.com/callback',
      redirectOnDecline: true,
    });

    expect(new URL(url).searchParams.get('redirect_on_decline')).toBe('true');
  });
});

describe('exchangeAuthorizationCode', () => {
  it('posts the authorization_code grant and returns the token pair', async () => {
    server.use(
      http.post(`${OAUTH_BASE_URL}/oauth/token`, async ({ request }) => {
        const body = await request.text();
        const params = new URLSearchParams(body);
        expect(params.get('grant_type')).toBe('authorization_code');
        expect(params.get('code')).toBe('auth-code-123');
        expect(params.get('redirect_uri')).toBe('https://app.example.com/callback');
        expect(params.get('client_id')).toBe('test-client-id');
        expect(params.get('client_secret')).toBe('test-client-secret');
        return HttpResponse.json({
          token_type: 'bearer',
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 2_592_000,
        });
      })
    );

    const tokens = await exchangeAuthorizationCode({
      code: 'auth-code-123',
      redirectUri: 'https://app.example.com/callback',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });

    expect(tokens).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      tokenType: 'bearer',
      expiresIn: 2_592_000,
    });
  });

  it('throws AuthenticationError if the token endpoint omits a refresh_token', async () => {
    server.use(
      http.post(`${OAUTH_BASE_URL}/oauth/token`, () =>
        HttpResponse.json({ token_type: 'bearer', access_token: 'new-access-token', expires_in: 2_592_000 })
      )
    );

    await expect(
      exchangeAuthorizationCode({
        code: 'auth-code-123',
        redirectUri: 'https://app.example.com/callback',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      })
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws AuthenticationError on an OAuth error response', async () => {
    server.use(
      http.post(`${OAUTH_BASE_URL}/oauth/token`, () =>
        HttpResponse.json({ error: 'invalid_grant', error_description: 'Code expired' }, { status: 400 })
      )
    );

    await expect(
      exchangeAuthorizationCode({
        code: 'expired-code',
        redirectUri: 'https://app.example.com/callback',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      })
    ).rejects.toThrow('Code expired');
  });
});

describe('refreshAccessToken', () => {
  it('posts the refresh_token grant and returns a new access token', async () => {
    server.use(
      http.post(`${OAUTH_BASE_URL}/oauth/token`, async ({ request }) => {
        const body = await request.text();
        const params = new URLSearchParams(body);
        expect(params.get('grant_type')).toBe('refresh_token');
        expect(params.get('refresh_token')).toBe('existing-refresh-token');
        // Clio's refresh response does not include a new refresh_token.
        return HttpResponse.json({ token_type: 'bearer', access_token: 'rotated-access-token', expires_in: 2_592_000 });
      })
    );

    const tokens = await refreshAccessToken({
      refreshToken: 'existing-refresh-token',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });

    expect(tokens.accessToken).toBe('rotated-access-token');
    expect(tokens.refreshToken).toBeUndefined();
    expect(tokens.expiresIn).toBe(2_592_000);
  });
});
