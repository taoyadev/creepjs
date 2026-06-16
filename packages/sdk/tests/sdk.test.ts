import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CreepJS,
  CreepJSSDKError,
  getFingerprint,
  getIpIntelligence,
} from '../src/index';

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
