import { describe, expect, it } from 'vitest';
import app from '../src/index';
import { createTestEnv, seedToken } from './utils';

const TOKEN = 'cfp_stats_test';

const payload = {
  fingerprintId: 'fpr_stats',
  data: {
    canvas: { hash: 'canvashash12345678', dataURL: 'data:,' },
    webgl: {
      renderer: 'ANGLE Apple GPU',
      vendor: 'WebKit',
      version: 'WebGL 1.0',
      shadingLanguageVersion: 'WebGL GLSL ES 1.0',
    },
    timezone: {
      timezone: 'America/Los_Angeles',
      timezoneOffset: 480,
      locale: 'en-US',
    },
    fonts: {
      count: 43,
      available: ['Arial', 'Helvetica'],
    },
    screen: {
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040,
      colorDepth: 24,
      pixelDepth: 24,
      devicePixelRatio: 2,
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

async function seed(env: ReturnType<typeof createTestEnv>) {
  await seedToken(env, TOKEN, {
    email: 'stats@example.com',
    createdAt: Date.now(),
    usageCount: 0,
  });
}

describe('Uniqueness stats route', () => {
  it('suppresses buckets below the k-anonymity threshold', async () => {
    const env = createTestEnv({ bindings: { FP_STATS_K_ANON: '2' } });
    await seed(env);

    await app.fetch(
      new Request('http://localhost/v1/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': TOKEN,
        },
        body: JSON.stringify(payload),
      }),
      env
    );

    const res = await app.fetch(
      new Request(
        'http://localhost/v1/stats/uniqueness?canvas=canvashash12345678&timezone=America/Los_Angeles'
      ),
      env
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.totalSamples).toBe(1);
    expect(json.estimates.canvas).toMatchObject({
      suppressed: true,
      sampleSize: null,
      rarity: null,
    });
  });

  it('returns rarity estimates once the bucket clears k-anonymity', async () => {
    const env = createTestEnv({ bindings: { FP_STATS_K_ANON: '2' } });
    await seed(env);

    const request = new Request('http://localhost/v1/fingerprint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Token': TOKEN,
      },
      body: JSON.stringify(payload),
    });

    await app.fetch(request.clone(), env);
    await app.fetch(request, env);

    const res = await app.fetch(
      new Request(
        'http://localhost/v1/stats/uniqueness?canvas=canvashash12345678&fonts=43&screen=1920x1080@2.0'
      ),
      env
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.totalSamples).toBe(2);
    expect(json.estimates.canvas).toMatchObject({
      suppressed: false,
      sampleSize: 2,
      rarity: 1,
    });
    expect(json.estimates.fonts).toMatchObject({
      suppressed: false,
      sampleSize: 2,
      rarity: 1,
    });
  });
});
