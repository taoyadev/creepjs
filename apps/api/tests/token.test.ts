import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { createTestEnv } from './utils';

describe('Token route', () => {
  it('issues a token and stores metadata', async () => {
    const env = createTestEnv();
    const req = new Request('http://localhost/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '1.1.1.1',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const res = await app.fetch(req, env);
    const json = await res.json<Record<string, unknown>>();

    expect(res.status).toBe(200);
    expect(json.token).toMatch(/^cfp_/);
    expect(json.email).toBe('test@example.com');

    const stored = await env.TOKENS.get(json.token as string, 'json');
    expect(stored).toMatchObject({
      email: 'test@example.com',
      usageCount: 0,
    });
  });

  it('mints unguessable tokens: two requests for one email differ', async () => {
    const env = createTestEnv();
    const mint = () =>
      app.fetch(
        new Request('http://localhost/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': '3.3.3.3',
          },
          body: JSON.stringify({ email: 'same@example.com' }),
        }),
        env
      );

    const first = await (await mint()).json<Record<string, unknown>>();
    const second = await (await mint()).json<Record<string, unknown>>();

    expect(first.token).toMatch(/^cfp_[0-9A-Za-z]{24}$/);
    expect(second.token).toMatch(/^cfp_[0-9A-Za-z]{24}$/);
    expect(first.token).not.toBe(second.token);
  });

  it('enforces per-IP rate limit', async () => {
    const env = createTestEnv();
    const makeRequest = () =>
      app.fetch(
        new Request('http://localhost/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': '2.2.2.2',
          },
          body: JSON.stringify({ email: 'limit@example.com' }),
        }),
        env
      );

    for (let i = 0; i < 10; i++) {
      const res = await makeRequest();
      expect(res.status).toBe(200);
    }

    const blocked = await makeRequest();
    expect(blocked.status).toBe(429);
    const error = await blocked.json();
    expect(error).toMatchObject({
      error: 'Rate limit exceeded. Try again in 24 hours.',
    });
  });
});
