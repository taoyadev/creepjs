import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  lookupIP,
  isHighRisk,
  isValidIp,
  IpbotError,
  type IpbotResponse,
} from '../src/services/ipbot';
import { createTestEnv } from './utils';

// Real upstream response for 8.8.8.8 (captured from api.ipbot.com) — low risk.
const GOOGLE_DNS: IpbotResponse = {
  ip: '8.8.8.8',
  stack: 'ipv4',
  location: { country_code: 'US', city: 'Mountain View', timezone: '-07:00' },
  network: { asn: 'AS15169', org: 'Google LLC' },
  routing: { rpki_status: 'valid', confidence: 'high' },
  score: { ip_score: 70, risk_score: 30, band: 'good', verdict: 'allow' },
  classification: {
    is_datacenter: false,
    is_proxy: false,
    threat_level: 'Low',
  },
};

const HIGH_RISK_IP: IpbotResponse = {
  ip: '45.45.45.45',
  score: { ip_score: 10, risk_score: 88, band: 'malicious', verdict: 'block' },
  classification: { is_proxy: true, threat_level: 'High' },
};

const RL_HEADERS = {
  'x-ratelimit-limit': '600',
  'x-ratelimit-remaining': '598',
  'x-ratelimit-reset': '1781317560',
  'x-ratelimit-tier': 'pro',
};

const ok = (
  body: IpbotResponse,
  headers: Record<string, string> = RL_HEADERS
) => new Response(JSON.stringify(body), { status: 200, headers });

const throttled = (headers: Record<string, string> = {}) =>
  new Response('rate limited', { status: 429, headers });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('isValidIp', () => {
  it('accepts IPv4 and IPv6, rejects garbage', () => {
    expect(isValidIp('8.8.8.8')).toBe(true);
    expect(isValidIp('192.168.0.1')).toBe(true);
    expect(isValidIp('2001:4860:4860::8888')).toBe(true);
    expect(isValidIp('256.0.0.1')).toBe(false);
    expect(isValidIp('not-an-ip')).toBe(false);
    expect(isValidIp('8.8.8.8/../v1/admin')).toBe(false);
    expect(isValidIp('')).toBe(false);
  });
});

describe('isHighRisk', () => {
  it('classifies low-risk and high-risk results', () => {
    expect(isHighRisk(GOOGLE_DNS)).toBe(false);
    expect(isHighRisk(HIGH_RISK_IP)).toBe(true);
    expect(isHighRisk({ ip: 'x', score: { verdict: 'challenge' } })).toBe(true);
    expect(isHighRisk({ ip: 'x', classification: { is_tor: true } })).toBe(
      true
    );
  });
});

describe('lookupIP', () => {
  it('calls the correct URL with X-API-Key and returns parsed data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);

    const env = createTestEnv();
    const result = await lookupIP('8.8.8.8', env);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.ipbot.test/v1/ip/8.8.8.8',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'X-API-Key': 'ipb_test_key' }),
      })
    );
    expect(result.cached).toBe(false);
    expect(result.highRisk).toBe(false);
    expect(result.data.network?.org).toBe('Google LLC');
    expect(result.rateLimit).toMatchObject({
      limit: 600,
      remaining: 598,
      tier: 'pro',
    });
  });

  it('caches low-risk results for 24h and serves cache hits without refetching', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);
    const env = createTestEnv();

    await lookupIP('8.8.8.8', env);

    // Inspect what was written to the cache.
    const putSpy = vi.spyOn(env.IP_CACHE, 'put');
    const stored = await env.IP_CACHE.get('ipbot:8.8.8.8', 'json');
    expect(stored).toBeTruthy();

    const second = await lookupIP('8.8.8.8', env);
    expect(second.cached).toBe(true);
    expect(second.data.ip).toBe('8.8.8.8');
    expect(fetchMock).toHaveBeenCalledTimes(1); // no second upstream call
    putSpy.mockRestore();
  });

  it('uses a 1h TTL for high-risk results, 24h otherwise', async () => {
    const env = createTestEnv();
    const putSpy = vi.spyOn(env.IP_CACHE, 'put');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(GOOGLE_DNS)));
    await lookupIP('8.8.8.8', env);
    expect(putSpy).toHaveBeenLastCalledWith(
      'ipbot:8.8.8.8',
      expect.any(String),
      { expirationTtl: 86400 }
    );

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(HIGH_RISK_IP)));
    const risky = await lookupIP('45.45.45.45', env);
    expect(risky.highRisk).toBe(true);
    expect(putSpy).toHaveBeenLastCalledWith(
      'ipbot:45.45.45.45',
      expect.any(String),
      { expirationTtl: 3600 }
    );
  });

  it('retries on 429 then succeeds', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(throttled({ 'retry-after': '1' }))
      .mockResolvedValueOnce(ok(GOOGLE_DNS));
    vi.stubGlobal('fetch', fetchMock);
    const env = createTestEnv();

    const promise = lookupIP('8.8.8.8', env);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.cached).toBe(false);
  });

  it('throws IpbotError(429) after exhausting retries', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue(throttled());
    vi.stubGlobal('fetch', fetchMock);
    const env = createTestEnv();

    const settled = lookupIP('1.2.3.4', env).catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await settled;

    expect(err).toBeInstanceOf(IpbotError);
    expect((err as IpbotError).status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(4); // initial + 3 retries
  });

  it('rejects invalid IPs without calling upstream', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const env = createTestEnv();

    await expect(lookupIP('not-an-ip', env)).rejects.toThrow(IpbotError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when credentials are missing', async () => {
    const env = createTestEnv({ bindings: { IPBOT_API_KEY: '' } });
    await expect(lookupIP('8.8.8.8', env)).rejects.toThrow(/not configured/i);
  });
});
