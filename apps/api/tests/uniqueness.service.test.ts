import { describe, expect, it } from 'vitest';
import {
  extractUniquenessBuckets,
  getUniquenessEstimates,
  recordUniquenessStats,
} from '../src/services/uniqueness';
import { createTestEnv, readStatsCount } from './utils';

describe('uniqueness service', () => {
  it('extracts at most five coarse buckets from a fingerprint payload', () => {
    const buckets = extractUniquenessBuckets({
      canvas: { hash: 'canvashash12345678' },
      webgl: {
        renderer: 'ANGLE Apple GPU',
      },
      timezone: {
        timezone: 'America/Los_Angeles',
      },
      fonts: {
        count: 43,
      },
      screen: {
        width: 1920,
        height: 1080,
        devicePixelRatio: 2,
      },
    });

    expect(buckets).toHaveLength(5);
    expect(buckets.map((bucket) => bucket.component)).toEqual([
      'canvas',
      'webgl',
      'timezone',
      'fonts',
      'screen',
    ]);
    expect(buckets[0]?.bucket).toBe('canvasha');
    expect(buckets[1]?.bucket).not.toBe('angle apple gpu');
  });

  it('returns empty estimates when no comparable query parameters are provided', async () => {
    const env = createTestEnv({ fpStats: { 'fpstats:v1:total': '5' } });
    const result = await getUniquenessEstimates('', env);

    expect(result).toEqual({
      totalSamples: 5,
      kAnonThreshold: 20,
      estimates: {},
    });
  });

  it('continues legacy KV counts once counting moves to the stats object', async () => {
    const env = createTestEnv({
      fpStats: { 'fpstats:v1:total': '41', 'fpstats:v1:timezone:abc': '7' },
    });

    await recordUniquenessStats(
      { timezone: { timezone: 'Europe/Berlin' } },
      env
    );
    await recordUniquenessStats(
      { timezone: { timezone: 'Europe/Berlin' } },
      env
    );

    expect(await readStatsCount(env, 'fpstats:v1:total')).toBe(43);
    // KV is only the seed: it is no longer written.
    expect(await env.FP_STATS.get('fpstats:v1:total', 'text')).toBe('41');
  });
});
