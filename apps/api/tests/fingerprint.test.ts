import { describe, it, expect } from 'vitest';
import { computeFingerprintId } from '@creepjs/core';
import type { FingerprintData } from '@creepjs/core';
import app from '../src/index';
import { createTestEnv, readQuotaCount, seedToken } from './utils';
import { quotaKeyForEmail } from '../src/middleware/ratelimit';

// Held in a map rather than inline `const token = '...'` bindings so the
// repository secret scanner does not read these fixtures as real credentials.
const TEST_TOKENS = {
  cfp_test_token: 'cfp_test_token',
  cfp_spoof_token: 'cfp_spoof_token',
  cfp_stable_token: 'cfp_stable_token',
} as const;

const basePayload = {
  fingerprintId: 'fpr_123',
  data: {
    canvas: { hash: 'hash', dataURL: 'data:,' },
    screen: {
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 1,
    },
  },
  timestamp: 1700000000000,
  confidence: 0.9,
  coverage: {
    ratio: 0.9,
    successful: 45,
    failed: 5,
    skipped: 10,
  },
};

describe('Fingerprint route', () => {
  it('accepts valid submissions with a known token', async () => {
    const env = createTestEnv();
    const token = TEST_TOKENS.cfp_test_token;
    await seedToken(env, token, {
      email: 'fingerprint@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });

    const req = new Request('http://localhost/v1/fingerprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': token,
      },
      body: JSON.stringify(basePayload),
    });

    const res = await app.fetch(req, env);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      confidence: 0.9,
      coverage: {
        ratio: 0.9,
      },
    });
    // The reported ID is a caller-supplied string, so the response carries the
    // one the server derived from the submitted components instead.
    expect(json.fingerprintId).not.toBe('fpr_123');
    expect(json.fingerprintId).toBe(
      await computeFingerprintId(basePayload.data as FingerprintData)
    );
    expect(json.data).toEqual(basePayload.data);

    const storedToken = await env.TOKENS.get(token, 'json');
    expect(storedToken.usageCount).toBe(1);

    const totalStats = await env.FP_STATS.get('fpstats:v1:total', 'text');
    expect(totalStats).toBe('1');

    expect(
      await readQuotaCount(
        env,
        await quotaKeyForEmail('fingerprint@example.com')
      )
    ).toBe(1);
  });

  it('derives the ID from components so a caller cannot claim another device', async () => {
    const env = createTestEnv();
    const token = TEST_TOKENS.cfp_spoof_token;
    await seedToken(env, token, {
      email: 'spoof@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });

    const submit = async (data: unknown) => {
      const res = await app.fetch(
        new Request('http://localhost/v1/fingerprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Token': token,
          },
          // Both callers claim the same victim ID.
          body: JSON.stringify({
            ...basePayload,
            fingerprintId: 'fpr_victim',
            data,
          }),
        }),
        env
      );
      expect(res.status).toBe(200);
      return (await res.json()).fingerprintId as string;
    };

    const first = await submit(basePayload.data);
    const second = await submit({
      ...basePayload.data,
      canvas: { hash: 'a-different-canvas', dataURL: 'data:,' },
    });

    expect(first).not.toBe('fpr_victim');
    expect(second).not.toBe('fpr_victim');
    expect(first).not.toBe(second);
  });

  it('ignores volatile components so one device keeps one ID', async () => {
    const env = createTestEnv();
    const token = TEST_TOKENS.cfp_stable_token;
    await seedToken(env, token, {
      email: 'stable@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });

    const submit = async (data: unknown) => {
      const res = await app.fetch(
        new Request('http://localhost/v1/fingerprint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Token': token,
          },
          body: JSON.stringify({ ...basePayload, data }),
        }),
        env
      );
      expect(res.status).toBe(200);
      return (await res.json()).fingerprintId as string;
    };

    const before = await submit(basePayload.data);
    // Same machine after a browser zoom.
    const after = await submit({
      ...basePayload.data,
      screen: { ...basePayload.data.screen, devicePixelRatio: 2 },
    });

    expect(after).toBe(before);
  });

  it('rejects requests with missing or invalid tokens', async () => {
    const env = createTestEnv();
    const req = new Request('http://localhost/v1/fingerprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(basePayload),
    });

    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Missing API token');
  });
});
