import { describe, expect, it } from 'vitest';
import app from '../src/index';
import { createTestEnv } from './utils';

describe('CORS middleware', () => {
  it('keeps data endpoints publicly consumable from any origin', async () => {
    const env = createTestEnv({
      bindings: {
        ENVIRONMENT: 'production',
        CORS_ORIGIN: 'https://creepjs.org',
      },
    });

    const res = await app.fetch(
      new Request('http://localhost/v1/health', {
        headers: {
          Origin: 'https://third-party.example',
        },
      }),
      env
    );

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('lets any origin preflight the fingerprint and public IP endpoints', async () => {
    const env = createTestEnv({
      bindings: {
        ENVIRONMENT: 'production',
        CORS_ORIGIN: 'https://creepjs.org',
      },
    });

    for (const [path, method] of [
      ['/v1/fingerprint', 'POST'],
      ['/v1/ip/public/8.8.8.8', 'GET'],
    ] as const) {
      const res = await app.fetch(
        new Request(`http://localhost${path}`, {
          method: 'OPTIONS',
          headers: {
            Origin: 'https://third-party.example',
            'Access-Control-Request-Method': method,
          },
        }),
        env
      );

      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    }
  });

  it('does not allow foreign origins to mint tokens', async () => {
    const env = createTestEnv({
      bindings: {
        ENVIRONMENT: 'production',
        CORS_ORIGIN: 'https://creepjs.org',
      },
    });

    const res = await app.fetch(
      new Request('http://localhost/v1/token', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://third-party.example',
          'Access-Control-Request-Method': 'POST',
        },
      }),
      env
    );

    // Non-matching origin gets no Access-Control-Allow-Origin header at all.
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('falls back to the production site origin for /v1/token when CORS_ORIGIN is unset', async () => {
    const env = createTestEnv({
      bindings: {
        ENVIRONMENT: 'production',
        CORS_ORIGIN: '',
      },
    });

    const res = await app.fetch(
      new Request('http://localhost/v1/token', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://creepjs.org',
          'Access-Control-Request-Method': 'POST',
        },
      }),
      env
    );

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://creepjs.org'
    );
  });

  it('exposes quota headers to cross-origin callers', async () => {
    const env = createTestEnv();

    const res = await app.fetch(
      new Request('http://localhost/v1/health', {
        headers: { Origin: 'https://third-party.example' },
      }),
      env
    );

    const exposed = (res.headers.get('Access-Control-Expose-Headers') ?? '')
      .split(',')
      .map((h) => h.trim().toLowerCase());
    expect(exposed).toEqual(
      expect.arrayContaining([
        'retry-after',
        'x-ratelimit-limit',
        'x-ratelimit-remaining',
        'x-ratelimit-reset',
      ])
    );
  });
});
