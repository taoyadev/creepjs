import { describe, expect, it } from 'vitest';
import app from '../src/index';
import { createTestEnv } from './utils';

describe('CORS middleware', () => {
  it('falls back to the production site origin when CORS_ORIGIN is unset in production', async () => {
    const env = createTestEnv({
      bindings: {
        ENVIRONMENT: 'production',
        CORS_ORIGIN: '',
      },
    });

    const res = await app.fetch(
      new Request('http://localhost/v1/health', {
        headers: {
          Origin: 'https://creepjs.org',
        },
      }),
      env
    );

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://creepjs.org'
    );
  });
});
