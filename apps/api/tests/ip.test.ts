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
    await app.fetch(new Request('http://localhost/v1/ip/8.8.8.8', { headers }), env);

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
      vi.fn().mockResolvedValue(new Response('upstream unavailable', { status: 503 }))
    );

    const res = await app.fetch(
      new Request('http://localhost/v1/ip/8.8.8.8', {
        headers: { 'X-API-Token': TOKEN },
      }),
      env
    );
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toContain('IPbot API error 503');
  });
});
