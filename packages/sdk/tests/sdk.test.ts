import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CreepJS,
  CreepJSSDKError,
  getFingerprint,
  getIpIntelligence,
} from '../src/index';
// Source import: the SDK duplicates this constant rather than importing core,
// and this test is what keeps the two in step.
import { IDENTITY_SCHEMA_VERSION } from '../../core/src/utils/identity';

const mockFingerprint = {
  fingerprintId: 'fp_123',
  data: {
    canvas: { hash: 'canvas-hash', dataURL: 'data:,' },
  },
  timestamp: 1700000000000,
  confidence: 0.9,
  coverage: {
    ratio: 0.9,
    successful: 10,
    failed: 1,
    skipped: 2,
  },
  collectors: {},
  timings: {},
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('CreepJS SDK', () => {
  it('exports the public SDK surface', () => {
    expect(CreepJS).toBeDefined();
    expect(typeof getFingerprint).toBe('function');
    expect(typeof getIpIntelligence).toBe('function');
  });

  it('loads collectFingerprint from the registered full bundle and posts to the API', async () => {
    vi.stubGlobal('__CREEPJS_CORE__', {
      collectFingerprint: vi.fn().mockResolvedValue(mockFingerprint),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            fingerprintId: 'fp_123',
            timestamp: 1700000000000,
            confidence: 0.9,
            coverage: mockFingerprint.coverage,
          }),
          { status: 200 }
        )
      )
    );

    const sdk = new CreepJS({ token: 'cfp_test_token', cache: false });
    const result = await sdk.getFingerprint();

    expect(result.fingerprintId).toBe('fp_123');
    expect(result.coverage.ratio).toBe(0.9);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.creepjs.org/v1/fingerprint',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-API-Token': 'cfp_test_token',
        }),
      })
    );
  });

  it('returns cached fingerprints when they are still valid', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    vi.stubGlobal('__CREEPJS_CORE__', {
      collectFingerprint: vi.fn().mockResolvedValue(mockFingerprint),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            fingerprintId: 'fp_123',
            timestamp: 1700000000000,
            confidence: 0.9,
            coverage: mockFingerprint.coverage,
          }),
          { status: 200 }
        )
      )
    );

    const sdk = new CreepJS({ token: 'cfp_test_token', cache: true });
    const first = await sdk.getFingerprint();
    const second = await sdk.getFingerprint();

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  describe('cacheTtl', () => {
    const stubCacheAndApi = () => {
      const storage = new Map<string, string>();
      vi.stubGlobal('localStorage', {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      });
      vi.stubGlobal('__CREEPJS_CORE__', {
        collectFingerprint: vi.fn().mockResolvedValue(mockFingerprint),
      });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() =>
          Promise.resolve(
            new Response(
              JSON.stringify({
                fingerprintId: 'fp_123',
                timestamp: 1700000000000,
                confidence: 0.9,
                coverage: mockFingerprint.coverage,
              }),
              { status: 200 }
            )
          )
        )
      );
      return storage;
    };

    const SECOND = 1000;
    const DAY = 24 * 60 * 60 * SECOND;

    afterEach(() => {
      vi.useRealTimers();
    });

    it('is in seconds, as documented', async () => {
      vi.useFakeTimers({ toFake: ['Date'], now: 1_800_000_000_000 });
      stubCacheAndApi();
      const sdk = new CreepJS({ token: 'cfp_test_token', cacheTtl: 3600 });

      await sdk.getFingerprint();
      vi.setSystemTime(Date.now() + 10 * SECOND);
      expect((await sdk.getFingerprint()).cached).toBe(true);

      vi.setSystemTime(Date.now() + 3600 * SECOND);
      expect((await sdk.getFingerprint()).cached).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('caps a lifetime written in milliseconds at seven days', async () => {
      vi.useFakeTimers({ toFake: ['Date'], now: 1_800_000_000_000 });
      stubCacheAndApi();
      const sdk = new CreepJS({ token: 'cfp_test_token', cacheTtl: 3_600_000 });

      await sdk.getFingerprint();
      vi.setSystemTime(Date.now() + 6 * DAY);
      expect((await sdk.getFingerprint()).cached).toBe(true);

      vi.setSystemTime(Date.now() + 1 * DAY + SECOND);
      expect((await sdk.getFingerprint()).cached).toBe(false);
    });

    it('turns caching off at 0', async () => {
      const storage = stubCacheAndApi();
      const sdk = new CreepJS({ token: 'cfp_test_token', cacheTtl: 0 });

      await sdk.getFingerprint();
      expect((await sdk.getFingerprint()).cached).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(storage.size).toBe(0);
    });
  });

  it('treats a throwing localStorage getter as no cache', async () => {
    // Chrome with site data blocked, or a sandboxed iframe: merely reading
    // the global throws, which `typeof localStorage` does not guard against.
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Access is denied', 'SecurityError');
      },
    });
    vi.stubGlobal('__CREEPJS_CORE__', {
      collectFingerprint: vi.fn().mockResolvedValue(mockFingerprint),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            fingerprintId: 'fp_123',
            timestamp: 1700000000000,
            confidence: 0.9,
            coverage: mockFingerprint.coverage,
          }),
          { status: 200 }
        )
      )
    );

    try {
      const sdk = new CreepJS({ token: 'cfp_test_token', cache: true });
      const result = await sdk.getFingerprint();

      expect(result.fingerprintId).toBe('fp_123');
      expect(result.cached).toBe(false);
      expect(() => sdk.clearCache()).not.toThrow();
    } finally {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });

  it('keys the cache by the core identity schema version', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    vi.stubGlobal('__CREEPJS_CORE__', {
      collectFingerprint: vi.fn().mockResolvedValue(mockFingerprint),
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify(mockFingerprint), { status: 200 })
        )
    );

    await new CreepJS({
      token: 'cfp_test_token',
      cache: true,
    }).getFingerprint();

    // A stale epoch would keep serving IDs from a retired projection until
    // the cache TTL ran out, without ever reaching the API.
    expect([...storage.keys()]).toEqual([
      expect.stringContaining(`:v${IDENTITY_SCHEMA_VERSION}:`),
    ]);
  });

  it('wraps API failures in typed errors', async () => {
    vi.stubGlobal('__CREEPJS_CORE__', {
      collectFingerprint: vi.fn().mockResolvedValue(mockFingerprint),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('bad gateway', { status: 502 }))
    );

    const sdk = new CreepJS({ token: 'cfp_test_token', cache: false });

    await expect(sdk.getFingerprint()).rejects.toMatchObject<CreepJSSDKError>({
      name: 'CreepJSSDKError',
      code: 'api_error',
      status: 502,
    });
  });

  it('exposes a thin IP intelligence wrapper', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: { ip: '8.8.8.8' },
            cached: false,
            highRisk: false,
            rateLimit: { limit: 1000, remaining: 999, reset: 0, tier: 'pro' },
          }),
          { status: 200 }
        )
      )
    );

    const result = await getIpIntelligence('8.8.8.8', {
      token: 'cfp_test_token',
    });

    expect(result.data).toMatchObject({ ip: '8.8.8.8' });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.creepjs.org/v1/ip/8.8.8.8',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'X-API-Token': 'cfp_test_token',
        }),
      })
    );
  });
});
