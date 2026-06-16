import { describe, expect, it } from 'vitest';
import {
  extractUniquenessBuckets,
  getUniquenessEstimates,
} from '../src/services/uniqueness';
import { createTestEnv } from './utils';

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
});
