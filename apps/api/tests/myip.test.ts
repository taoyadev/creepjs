import { afterEach, describe, expect, it, vi } from 'vitest';
import app from '../src/index';
import { createTestEnv, readQuotaCount, seedQuota } from './utils';
import type { IpbotResponse } from '../src/services/ipbot';
import { hashIpForLog } from '../src/utils/privacy';
import type { JsonBody } from './utils';

const GOOGLE_DNS: IpbotResponse = {
  ip: '8.8.8.8',
  location: {
    country_code: 'US',
    city: 'Mountain View',
    region: 'California',
    postal: '94043',
    latitude: 37.4056,
    longitude: -122.0775,
    timezone: 'America/Los_Angeles',
  },
  network: {
    asn: 'AS15169',
    org: 'Google LLC',
  },
  score: {
    risk_score: 30,
    band: 'good',
    verdict: 'allow',
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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('/my-ip route', () => {
  it('returns mapped IP intelligence for the caller IP', async () => {
    const env = createTestEnv();
    const fetchMock = vi.fn().mockResolvedValue(ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/my-ip', {
        headers: { 'CF-Connecting-IP': '8.8.8.8' },
      }),
      env
    );
    const json = await res.json<JsonBody>();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      ip: '8.8.8.8',
      cached: false,
      location: {
        country_code: 'US',
        city: 'Mountain View',
        region: 'California',
      },
      asn: {
        number: 15169,
        organization: 'Google LLC',
      },
      hostname: null,
      risk: {
        score: 30,
        band: 'good',
        verdict: 'allow',
        highRisk: false,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gracefully falls back for local or private caller IPs', async () => {
    const env = createTestEnv();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(new Request('http://localhost/my-ip'), env);
    const json = await res.json<JsonBody>();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      ip: '0.0.0.0',
      cached: false,
      hostname: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('bills the paid risk lookup against per-visitor and global counters', async () => {
    const env = createTestEnv();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(GOOGLE_DNS)));

    await app.fetch(
      new Request('http://localhost/my-ip', {
        headers: { 'CF-Connecting-IP': '8.8.8.8' },
      }),
      env
    );

    const visitorKey = `myip:ip:${await hashIpForLog('8.8.8.8')}`;
    expect(await readQuotaCount(env, visitorKey)).toBe(1);
    expect(await readQuotaCount(env, 'pubip:global')).toBe(1);
  });

  it('answers a cache hit without touching either quota counter', async () => {
    const env = createTestEnv({
      ipCache: {
        'ipbot:8.8.8.8': JSON.stringify({
          data: GOOGLE_DNS,
          cachedAt: Date.now(),
          highRisk: false,
        }),
      },
    });
    const quotaGet = vi.spyOn(env.QUOTA, 'get');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/my-ip', {
        headers: { 'CF-Connecting-IP': '8.8.8.8' },
      }),
      env
    );
    const json = await res.json<Record<string, unknown>>();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({ ip: '8.8.8.8', cached: true });
    expect(json.risk).toMatchObject({ score: 30 });
    expect(quotaGet).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('degrades to geo-only once the per-visitor risk cap is exhausted', async () => {
    const visitorKey = `myip:ip:${await hashIpForLog('8.8.8.8')}`;
    const env = createTestEnv();
    await seedQuota(env, visitorKey, 10);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/my-ip', {
        headers: { 'CF-Connecting-IP': '8.8.8.8' },
      }),
      env
    );
    const json = await res.json<Record<string, unknown>>();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({ ip: '8.8.8.8', cached: false });
    expect(json.risk).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('respects the shared global upstream budget', async () => {
    const env = createTestEnv();
    await seedQuota(env, 'pubip:global', 2000);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = await app.fetch(
      new Request('http://localhost/my-ip', {
        headers: { 'CF-Connecting-IP': '8.8.8.8' },
      }),
      env
    );
    const json = await res.json<Record<string, unknown>>();

    expect(res.status).toBe(200);
    expect(json.risk).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns a stable fallback shape when upstream lookup fails', async () => {
    const env = createTestEnv();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('upstream unavailable', { status: 503 })
        )
    );

    const res = await app.fetch(
      new Request('http://localhost/my-ip', {
        headers: { 'CF-Connecting-IP': '8.8.8.8' },
      }),
      env
    );
    const json = await res.json<JsonBody>();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      ip: '8.8.8.8',
      cached: false,
      error: 'IP intelligence temporarily unavailable',
    });
  });
});
