import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { createTestEnv, readQuotaCount } from './utils';
import { hashIpForLog } from '../src/utils/privacy';
import type { JsonBody } from './utils';

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

    const stored = await env.TOKENS.get<JsonBody>(json.token as string, 'json');
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
    // Distinct inboxes, so this exercises the IP cap rather than the per-email one.
    const makeRequest = (n: number) =>
      app.fetch(
        new Request('http://localhost/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': '2.2.2.2',
          },
          body: JSON.stringify({ email: `limit${n}@example.com` }),
        }),
        env
      );

    for (let i = 0; i < 10; i++) {
      const res = await makeRequest(i);
      expect(res.status).toBe(200);
    }

    const blocked = await makeRequest(99);
    expect(blocked.status).toBe(429);
    const error = await blocked.json<JsonBody>();
    expect(error).toMatchObject({
      error: 'Rate limit exceeded. Try again in 24 hours.',
    });
  });

  it('caps tokens per inbox across address variations and IPs', async () => {
    const env = createTestEnv();
    // Sub-addressing and gmail dots reach one inbox, and rotating source IPs
    // was the cheap way to keep minting from it.
    const variants = [
      { email: 'farm@gmail.com', ip: '5.0.0.1' },
      { email: 'f.a.r.m@gmail.com', ip: '5.0.0.2' },
      { email: 'farm+one@googlemail.com', ip: '5.0.0.3' },
      { email: 'FARM+two@gmail.com', ip: '5.0.0.4' },
    ];

    const statuses: number[] = [];
    for (const { email, ip } of variants) {
      const res = await app.fetch(
        new Request('http://localhost/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': ip,
          },
          body: JSON.stringify({ email }),
        }),
        env
      );
      statuses.push(res.status);
    }

    expect(statuses).toEqual([200, 200, 200, 429]);
  });

  it('does not spend the IP allowance when the inbox cap rejects', async () => {
    const env = createTestEnv();
    const mint = (email: string) =>
      app.fetch(
        new Request('http://localhost/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': '6.6.6.6',
          },
          body: JSON.stringify({ email }),
        }),
        env
      );

    for (let i = 0; i < 3; i++) {
      expect((await mint('capped@example.com')).status).toBe(200);
    }
    // Four rejections against the inbox cap must not burn the IP's 10/day.
    for (let i = 0; i < 4; i++) {
      expect((await mint('capped@example.com')).status).toBe(429);
    }

    // Seven of the ten remain, so a different inbox still succeeds.
    expect((await mint('other@example.com')).status).toBe(200);
  });

  it('caps minting across all requesters and refunds the rejected caller', async () => {
    const env = createTestEnv({ bindings: { TOKEN_MINT_DAILY_GLOBAL: '2' } });
    const mint = (n: number) =>
      app.fetch(
        new Request('http://localhost/v1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CF-Connecting-IP': `7.7.7.${n}`,
          },
          body: JSON.stringify({ email: `farm${n}@example.com` }),
        }),
        env
      );

    expect((await mint(1)).status).toBe(200);
    expect((await mint(2)).status).toBe(200);
    // A fresh IP and a fresh inbox no longer buy another token today.
    const rejected = await mint(3);
    expect(rejected.status).toBe(503);
    expect((await rejected.json<{ error: string }>()).error).toMatch(
      /capacity/i
    );
    expect(
      await readQuotaCount(
        env,
        `token-mint:ip:${await hashIpForLog('7.7.7.3')}`
      )
    ).toBe(0);
  });
});
