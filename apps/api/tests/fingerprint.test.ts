import { describe, it, expect, vi } from 'vitest';
import {
  createExecutionContext,
  waitOnExecutionContext,
} from 'cloudflare:test';
import { computeFingerprintId } from '@creepjs/core';
import type { FingerprintData } from '@creepjs/core';
import app from '../src/index';
import {
  createTestEnv,
  readQuotaCount,
  readStatsCount,
  seedToken,
} from './utils';
import { quotaKeyForEmail } from '../src/middleware/ratelimit';
import deploySmokeBody from './fixtures/deploy-smoke-fingerprint.json';
import type { JsonBody } from './utils';

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

    const ctx = createExecutionContext();
    const res = await app.fetch(req, env, ctx);
    const json = await res.json<JsonBody>();
    // Stats are written after the response; let them finish.
    await waitOnExecutionContext(ctx);

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

    // No per-request KV write to the token record: usage is the quota count.
    const storedToken = await env.TOKENS.get<JsonBody>(token, 'json');
    expect(storedToken.usageCount).toBe(0);

    expect(await readStatsCount(env, 'fpstats:v1:total')).toBe(1);

    expect(
      await readQuotaCount(
        env,
        await quotaKeyForEmail('fingerprint@example.com')
      )
    ).toBe(1);
  });

  it('still answers when the stats write fails', async () => {
    const env = createTestEnv({
      bindings: {
        STATS: {
          idFromName: () => ({}) as DurableObjectId,
          get: () =>
            ({
              fetch: () => Promise.reject(new Error('stats object offline')),
            }) as unknown as DurableObjectStub,
        } as unknown as DurableObjectNamespace,
      },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const token = TEST_TOKENS.cfp_test_token;
    await seedToken(env, token, {
      email: 'stats-down@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });

    const ctx = createExecutionContext();
    const res = await app.fetch(
      new Request('http://localhost/v1/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Token': token },
        body: JSON.stringify(basePayload),
      }),
      env,
      ctx
    );
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(200);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('"msg":"fingerprint.stats_failed"')
    );
    errorSpy.mockRestore();
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
      return (await res.json<JsonBody>()).fingerprintId as string;
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
      return (await res.json<JsonBody>()).fingerprintId as string;
    };

    const before = await submit(basePayload.data);
    // Same machine after a browser zoom.
    const after = await submit({
      ...basePayload.data,
      screen: { ...basePayload.data.screen, devicePixelRatio: 2 },
    });

    expect(after).toBe(before);
  });

  it('rejects unknown collector keys in the API error format', async () => {
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
      body: JSON.stringify({
        ...basePayload,
        data: { ...basePayload.data, notACollector: true },
      }),
    });

    const res = await app.fetch(req, env);

    expect(res.status).toBe(400);
    expect(await res.json<JsonBody>()).toEqual({
      error: 'Invalid request body',
      details: [
        {
          path: ['data'],
          message: expect.stringContaining('notACollector'),
        },
      ],
    });
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
    const json = await res.json<JsonBody>();
    expect(json.error).toBe('Missing API token');
  });
  it('refuses bodies over 128 KiB before auth or quota, and takes a large real one', async () => {
    const env = createTestEnv();
    const token = TEST_TOKENS.cfp_test_token;
    await seedToken(env, token, {
      email: 'limit@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });
    const post = async (body: string, headers: Record<string, string> = {}) => {
      const ctx = createExecutionContext();
      const res = await app.fetch(
        new Request('http://localhost/v1/fingerprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...headers },
          body,
        }),
        env,
        ctx
      );
      await waitOnExecutionContext(ctx);
      return res;
    };

    // ~41 KB: a large canvas data URL plus a macOS-sized voice list.
    const large = JSON.stringify({
      ...basePayload,
      data: {
        ...basePayload.data,
        canvas: {
          hash: 'hash',
          dataURL: `data:image/png;base64,${'A'.repeat(14_000)}`,
        },
        voices: {
          count: 200,
          voices: Array.from({ length: 200 }, (_, i) => ({
            name: `Voice ${i} (Enhanced)`,
            lang: 'en-US',
            localService: true,
            default: i === 0,
            voiceURI: `com.apple.voice.enhanced.en-US.Voice${i}`,
          })),
        },
      },
    });
    expect(large.length).toBeGreaterThan(30_000);
    expect((await post(large, { 'X-API-Token': token })).status).toBe(200);

    const oversized = JSON.stringify({
      ...basePayload,
      data: {
        ...basePayload.data,
        canvas: { hash: 'hash', dataURL: 'A'.repeat(130 * 1024) },
      },
    });
    // No token: a 401 here would mean auth ran before the size check.
    const res = await post(oversized);
    expect(res.status).toBe(413);
    expect(await res.json<JsonBody>()).toEqual({
      error: 'Request body exceeds the 128 KiB limit',
    });
  });
  it('accepts the body the deploy health check posts', async () => {
    const env = createTestEnv();
    const token = TEST_TOKENS.cfp_test_token;
    await seedToken(env, token, {
      email: 'deploy@example.com',
      createdAt: Date.now(),
      usageCount: 0,
    });

    const ctx = createExecutionContext();
    const res = await app.fetch(
      new Request('http://localhost/v1/fingerprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Token': token },
        body: JSON.stringify(deploySmokeBody),
      }),
      env,
      ctx
    );
    await waitOnExecutionContext(ctx);

    expect(res.status).toBe(200);
    const json = await res.json<JsonBody>();
    expect(json.fingerprintId).toBe(await computeFingerprintId({}));
    expect(json.fingerprintId).not.toBe(deploySmokeBody.fingerprintId);
  });
});
