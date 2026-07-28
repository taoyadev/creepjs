import { describe, it, expect, vi, afterEach } from 'vitest';
import app from '../src/index';
import { createTestEnv, seedToken } from './utils';
import type { IpbotResponse } from '../src/services/ipbot';

const TOKEN = 'cfp_ip_route_test';

const GOOGLE_DNS: IpbotResponse = {
  ip: '8.8.8.8',
  stack: 'ipv4',
  location: {
    country_code: 'US',
    city: 'Mountain View',
  },
  network: {
    asn: 'AS15169',
    org: 'Google LLC',
  },
  score: {
    ip_score: 70,
    risk_score: 30,
    band: 'good',
    verdict: 'allow',
  },
  classification: {
    is_proxy: false,
    is_vpn: false,
    is_tor: false,
    threat_level: 'Low',
  },
};

const ok = (body: IpbotResponse) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'x-ratelimit-limit': '600',
      'x-ratelimit-remaining': '599',
      'x-ratelimit-reset': '1781317560',
      'x-ratelimit-tier': 'pro',
    },
  });

async function seed(env: ReturnType<typeof createTestEnv>) {
  await seedToken(env, TOKEN, {
    email: 'ip-route@example.com',
    createdAt: Date.now(),
    usageCount: 0,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('IP intelligence route', () => {
  it('requires an API token', async () => {
    const env = createTestEnv();
    const res = await app.fetch(
      new Request('http://localhost/v1/ip/8.8.8.8'),
      env
    );

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toMatchObject({ error: 'Missing API token' });
  });

  it('returns an IPbot lookup payload for a valid token', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn().mockResolvedValue(ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/v1/ip/8.8.8.8', {
        headers: { 'X-API-Token': TOKEN },
      }),
      env
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      cached: false,
      highRisk: false,
      data: {
        ip: '8.8.8.8',
        network: { org: 'Google LLC', asn: 'AS15169' },
        score: { risk_score: 30, band: 'good', verdict: 'allow' },
      },
      rateLimit: {
        limit: 600,
        remaining: 599,
        tier: 'pro',
      },
    });

    const storedToken = await env.TOKENS.get(TOKEN, 'json');
    expect(storedToken.usageCount).toBe(1);
  });

  it('rejects invalid IP path parameters', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/v1/ip/not-an-ip', {
        headers: { 'X-API-Token': TOKEN },
      }),
      env
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/invalid ip address/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('serves a cache hit on the second lookup', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn().mockResolvedValue(ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);

    const headers = { 'X-API-Token': TOKEN };
    await app.fetch(
      new Request('http://localhost/v1/ip/8.8.8.8', { headers }),
      env
    );

    const cached = await app.fetch(
      new Request('http://localhost/v1/ip/8.8.8.8', { headers }),
      env
    );
    const json = await cached.json();

    expect(cached.status).toBe(200);
    expect(json.cached).toBe(true);
    expect(json.data.ip).toBe('8.8.8.8');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps upstream non-2xx responses to 502', async () => {
    const env = createTestEnv();
    await seed(env);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('upstream unavailable', { status: 503 })
        )
    );

    const res = await app.fetch(
      new Request('http://localhost/v1/ip/8.8.8.8', {
        headers: { 'X-API-Token': TOKEN },
      }),
      env
    );
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe(
      'IP intelligence provider is temporarily unavailable'
    );
  });
});

describe('Public IP intelligence route (/v1/ip/public/:ip)', () => {
  const visitor = { 'CF-Connecting-IP': '203.0.113.7' };

  it('works without a token and reports the public quota', async () => {
    const env = createTestEnv();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(GOOGLE_DNS)));

    const res = await app.fetch(
      new Request('http://localhost/v1/ip/public/8.8.8.8', {
        headers: visitor,
      }),
      env
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      cached: false,
      highRisk: false,
      data: { ip: '8.8.8.8', network: { org: 'Google LLC' } },
      rateLimit: { tier: 'public', limit: 30 },
    });
    // Public response must NOT leak the upstream IPbot quota.
    expect(json.rateLimit.tier).toBe('public');
  });

  it('enforces the per-visitor-IP daily limit', async () => {
    const env = createTestEnv({ bindings: { PUBLIC_IP_DAILY_PER_IP: '2' } });
    // Fresh Response per call (its body can only be read once).
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => ok(GOOGLE_DNS))
    );

    const call = (target: string) =>
      app.fetch(
        new Request(`http://localhost/v1/ip/public/${target}`, {
          headers: visitor,
        }),
        env
      );

    expect((await call('1.1.1.1')).status).toBe(200);
    expect((await call('8.8.8.8')).status).toBe(200);
    const blocked = await call('9.9.9.9');
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
    const json = await blocked.json();
    expect(json.error).toMatch(/limit reached/i);
  });

  it('rejects invalid IPs without calling upstream or counting usage', async () => {
    const env = createTestEnv();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/v1/ip/public/not-an-ip', {
        headers: visitor,
      }),
      env
    );

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Batch IP intelligence route (POST /v1/ip/batch)', () => {
  const batch = (
    env: ReturnType<typeof createTestEnv>,
    ips: unknown,
    headers: Record<string, string> = { 'X-API-Token': TOKEN }
  ) =>
    app.fetch(
      new Request('http://localhost/v1/ip/batch', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify({ ips }),
      }),
      env
    );

  const quota = (env: ReturnType<typeof createTestEnv>) =>
    env.RATE_LIMIT.get(`ratelimit:${TOKEN}`, 'json') as Promise<{
      count: number;
      resetAt: number;
    } | null>;

  it('requires an API token', async () => {
    const env = createTestEnv();
    const res = await batch(env, ['8.8.8.8'], {});
    expect(res.status).toBe(401);
    expect(await quota(env)).toBeNull();
  });

  it('reserves one lookup unit per unique valid IP before execution', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn().mockImplementation(() => ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);

    const res = await batch(env, ['8.8.8.8', '1.1.1.1']);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.count).toBe(2);
    expect(json.results).toHaveLength(2);
    expect(json).toMatchObject({
      submittedCount: 2,
      uniqueCount: 2,
      validCount: 2,
      successCount: 2,
      quotaCost: 2,
      aborted: false,
    });
    expect(json.results[0]).toMatchObject({
      ip: '8.8.8.8',
      ok: true,
      outcome: 'success',
    });
    expect(json.results[1]).toMatchObject({
      ip: '1.1.1.1',
      ok: true,
      outcome: 'success',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((await quota(env))?.count).toBe(2);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('998');

    // usageCount is approximate success telemetry, separate from quota cost.
    const storedToken = await env.TOKENS.get(TOKEN, 'json');
    expect(storedToken.usageCount).toBe(2);
  });

  it('trims, dedupes, and preserves first-seen response order', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn().mockImplementation(() => ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);

    const res = await batch(env, [
      '8.8.8.8',
      ' not-an-ip ',
      ' 8.8.8.8 ',
      '1.1.1.1',
    ]);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.count).toBe(3);
    expect(json.results.map((item: { ip: string }) => item.ip)).toEqual([
      '8.8.8.8',
      'not-an-ip',
      '1.1.1.1',
    ]);
    expect(json.results[1]).toMatchObject({
      outcome: 'invalid',
      status: 400,
    });
    expect(json.quotaCost).toBe(2);
    expect((await quota(env))?.count).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const storedToken = await env.TOKENS.get(TOKEN, 'json');
    expect(storedToken.usageCount).toBe(2);
  });

  it('charges one abuse-prevention unit for an invalid-only batch', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await batch(env, ['not-an-ip', 'also.invalid']);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.count).toBe(2);
    expect(json).toMatchObject({
      validCount: 0,
      successCount: 0,
      invalidCount: 2,
      quotaCost: 1,
    });
    expect(json.results.every((item: { outcome: string }) => item.outcome === 'invalid')).toBe(
      true
    );
    expect((await quota(env))?.count).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    const storedToken = await env.TOKENS.get(TOKEN, 'json');
    expect(storedToken.usageCount).toBe(0);
  });

  it('returns 429 with zero upstream calls when full cost cannot be reserved', async () => {
    const resetAt = Date.now() + 60_000;
    const env = createTestEnv({
      rateLimits: {
        [`ratelimit:${TOKEN}`]: JSON.stringify({ count: 999, resetAt }),
      },
    });
    await seed(env);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await batch(env, ['8.8.8.8', '1.1.1.1']);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json).toMatchObject({ status: 429, quotaCost: 2, remaining: 1 });
    expect(res.headers.get('Retry-After')).toBeTruthy();
    expect((await quota(env))?.count).toBe(999);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows a reservation that exactly reaches the daily limit', async () => {
    const env = createTestEnv({
      rateLimits: {
        [`ratelimit:${TOKEN}`]: JSON.stringify({
          count: 998,
          resetAt: Date.now() + 60_000,
        }),
      },
    });
    await seed(env);
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => ok(GOOGLE_DNS)));

    const res = await batch(env, ['8.8.8.8', '1.1.1.1']);

    expect(res.status).toBe(200);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect((await quota(env))?.count).toBe(1000);
  });

  it('aborts later lookups after a dependency failure and returns partial rows', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok(GOOGLE_DNS))
      .mockResolvedValueOnce(
        new Response('provider details must not leak', { status: 503 })
      );
    vi.stubGlobal('fetch', fetchMock);

    const res = await batch(env, [
      '8.8.8.8',
      'not-an-ip',
      '9.9.9.9',
      '1.1.1.1',
    ]);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      successCount: 1,
      invalidCount: 1,
      skippedCount: 1,
      quotaCost: 3,
      aborted: true,
      abortedReason: 'provider-unavailable',
    });
    expect(json.results[1]).toMatchObject({
      ip: 'not-an-ip',
      outcome: 'invalid',
    });
    expect(json.results[2]).toMatchObject({
      ip: '9.9.9.9',
      outcome: 'failed',
      status: 502,
    });
    expect(json.results[2].error).not.toContain('provider details');
    expect(json.results[3]).toMatchObject({
      ip: '1.1.1.1',
      outcome: 'skipped',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((await quota(env))?.count).toBe(3);
    const storedToken = await env.TOKENS.get(TOKEN, 'json');
    expect(storedToken.usageCount).toBe(1);
  });

  it('propagates Retry-After and uses at most one retry in a batch', async () => {
    vi.useFakeTimers();
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok(GOOGLE_DNS))
      .mockResolvedValue(
        new Response('rate limited', {
          status: 429,
          headers: { 'Retry-After': '2' },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const pending = batch(env, ['8.8.8.8', '9.9.9.9', '1.1.1.1']);
    await vi.runAllTimersAsync();
    const res = await pending;
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(res.headers.get('Retry-After')).toBe('2');
    expect(json).toMatchObject({
      aborted: true,
      abortedReason: 'provider-rate-limited',
      retryAfter: 2,
      successCount: 1,
      skippedCount: 1,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3); // success + failed attempt + retry
  });

  it('returns a request-level failure and stops when the first lookup fails', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response('provider details must not leak', { status: 503 })
      );
    vi.stubGlobal('fetch', fetchMock);

    const res = await batch(env, ['9.9.9.9', '1.1.1.1']);
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json).toMatchObject({
      status: 502,
      aborted: true,
      abortedReason: 'provider-unavailable',
    });
    expect(json.error).not.toContain('provider details');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('maps provider auth and local configuration failures without fan-out', async () => {
    const authEnv = createTestEnv();
    await seed(authEnv);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('credential details', { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const authFailure = await batch(authEnv, ['9.9.9.9', '1.1.1.1']);
    expect(authFailure.status).toBe(502);
    expect((await authFailure.json()).error).not.toContain(
      'credential details'
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const configEnv = createTestEnv({ bindings: { IPBOT_API_KEY: '' } });
    await seed(configEnv);
    const configFailure = await batch(configEnv, ['8.8.8.8', '1.1.1.1']);
    const configJson = await configFailure.json();
    expect(configFailure.status).toBe(503);
    expect(configJson).toMatchObject({
      aborted: true,
      abortedReason: 'provider-configuration',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('charges cache hits as lookup units while avoiding repeat upstream calls', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn().mockImplementation(() => ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);

    await batch(env, ['8.8.8.8']);
    const second = await batch(env, ['8.8.8.8']);
    const json = await second.json();

    expect(second.status).toBe(200);
    expect(json.results[0]).toMatchObject({
      ip: '8.8.8.8',
      cached: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect((await quota(env))?.count).toBe(2);
  });

  it('logs batch counts without raw IPs or API tokens', async () => {
    const env = createTestEnv();
    await seed(env);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(GOOGLE_DNS)));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await batch(env, ['8.8.8.8', 'not-an-ip']);

    const logs = logSpy.mock.calls.flat().join('\n');
    expect(logs).toContain('ip.batch_lookup');
    expect(logs).not.toContain('8.8.8.8');
    expect(logs).not.toContain('not-an-ip');
    expect(logs).not.toContain(TOKEN);
    logSpy.mockRestore();
  });

  it.each([
    { label: 'empty array', ips: [], status: 400 },
    {
      label: 'more than 50 entries',
      ips: Array.from({ length: 51 }, () => '8.8.8.8'),
      status: 400,
    },
    { label: 'trimmed-empty entry', ips: ['   '], status: 400 },
    { label: '46-character entry', ips: ['x'.repeat(46)], status: 400 },
  ])('rejects $label before quota or upstream work', async ({ ips, status }) => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await batch(env, ips);

    expect(res.status).toBe(status);
    expect(await quota(env)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts a bounded 45-character malformed item as a per-row error', async () => {
    const env = createTestEnv();
    await seed(env);
    const res = await batch(env, ['x'.repeat(45)]);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.results[0]).toMatchObject({
      outcome: 'invalid',
      status: 400,
    });
    expect((await quota(env))?.count).toBe(1);
  });

  it('rejects bodies larger than 8 KiB before auth, quota, or upstream work', async () => {
    const env = createTestEnv();
    await seed(env);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/v1/ip/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': TOKEN,
        },
        body: JSON.stringify({ ips: ['8.8.8.8'], padding: 'x'.repeat(9000) }),
      }),
      env
    );

    expect(res.status).toBe(413);
    expect(await quota(env)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
