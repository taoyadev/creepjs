import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import app from '../src/index';
import { createTestEnv, seedToken } from './utils';
import { errorHandler } from '../src/middleware/error';
import { requestLoggerMiddleware } from '../src/middleware/request-logger';
import type { Env } from '../src/types';

const TOKEN = 'cfp_logging_test';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('request logging middleware', () => {
  it('emits a structured api.request log with a request id', async () => {
    const env = createTestEnv();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const res = await app.fetch(new Request('http://localhost/v1/health'), env);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"msg":"api.request"')
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"path":"/v1/health"')
    );
  });

  it('includes rate-limit headers and fingerprint.accepted logging for fingerprint submissions', async () => {
    const env = createTestEnv();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await seedToken(env, TOKEN, {
      email: 'log@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });

    const res = await app.fetch(
      new Request('http://localhost/v1/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': TOKEN,
        },
        body: JSON.stringify({
          fingerprintId: 'fp_log',
          data: {
            canvas: { hash: 'abc12345', dataURL: 'data:,' },
          },
          timestamp: 1700000000000,
          confidence: 0.9,
        }),
      }),
      env
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('1000');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('999');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"msg":"fingerprint.accepted"')
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"request_id"')
    );
  });

  it('includes retry_after in structured logs when the public IP limit is exceeded', async () => {
    const env = createTestEnv({ bindings: { PUBLIC_IP_DAILY_PER_IP: '1' } });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ ip: '8.8.8.8', score: { risk_score: 1 } }),
          {
            status: 200,
            headers: {
              'x-ratelimit-limit': '600',
              'x-ratelimit-remaining': '599',
              'x-ratelimit-reset': '1781317560',
              'x-ratelimit-tier': 'pro',
            },
          }
        )
      )
    );

    const makeReq = (ip: string) =>
      new Request(`http://localhost/v1/ip/public/${ip}`, {
        headers: { 'CF-Connecting-IP': '203.0.113.7' },
      });

    await app.fetch(makeReq('8.8.8.8'), env);
    await app.fetch(makeReq('1.1.1.1'), env);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"retry_after":86400')
    );
  });

  it('emits api.error logs for unhandled exceptions', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const miniApp = new Hono<Env>();
    miniApp.onError(errorHandler);
    miniApp.use('*', requestLoggerMiddleware);
    miniApp.get('/boom', () => {
      throw new Error('kaboom');
    });

    const env = createTestEnv();
    const res = await miniApp.fetch(new Request('http://localhost/boom'), env);

    expect(res.status).toBe(500);
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
    expect(await res.json()).toEqual({ error: 'Internal server error' });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('"msg":"api.error"')
    );
  });

  it('returns the JSON error shape from the real app when a binding throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const env = createTestEnv();
    env.TOKENS.get = (() => {
      throw new Error('KV unavailable');
    }) as unknown as KVNamespace['get'];

    const res = await app.fetch(
      new Request('http://localhost/v1/fingerprint', {
        method: 'POST',
        headers: { 'X-API-Token': TOKEN, 'Content-Type': 'application/json' },
        body: '{}',
      }),
      env
    );

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });

  it('passes HTTPException responses through unchanged', async () => {
    const miniApp = new Hono<Env>();
    miniApp.onError(errorHandler);
    miniApp.get('/teapot', () => {
      throw new HTTPException(418, { message: 'short and stout' });
    });

    const res = await miniApp.fetch(
      new Request('http://localhost/teapot'),
      createTestEnv()
    );

    expect(res.status).toBe(418);
    expect(await res.text()).toBe('short and stout');
  });
});
