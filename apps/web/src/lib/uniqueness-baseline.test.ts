import { describe, expect, it } from 'vitest';
import {
  formatBaselineInsight,
  getBaselineProgress,
  summarizeBaseline,
  type BaselineResponse,
} from './uniqueness-baseline';

function baseline(totalSamples: number): BaselineResponse {
  return {
    totalSamples,
    kAnonThreshold: 20,
    estimates: {
      canvas: {
        component: 'canvas',
        bucket: 'hash',
        sampleSize: 1,
        rarity: 0.05,
        suppressed: false,
      },
    },
  };
}

describe('uniqueness baseline honesty', () => {
  it('suppresses every rarity score while the baseline is warming', () => {
    expect(getBaselineProgress(baseline(19))).toEqual({
      sampleCount: 19,
      threshold: 20,
      warming: true,
    });
    expect(summarizeBaseline(baseline(19))).toMatchObject({
      rarityPercent: null,
      availableComponents: 0,
    });
    expect(formatBaselineInsight(baseline(19).estimates.canvas, 20, 19)).toBe(
      'Baseline warming up (19/20)'
    );
  });

  it('reveals a baseline-backed estimate only after the threshold', () => {
    expect(summarizeBaseline(baseline(20))).toMatchObject({
      rarityPercent: 95,
      availableComponents: 1,
    });
    expect(formatBaselineInsight(baseline(20).estimates.canvas, 20, 20)).toBe(
      '95% rare in the anonymous population baseline'
    );
  });

  it('keeps a low-count bucket suppressed after the global baseline is ready', () => {
    const ready = baseline(20);
    const estimate = { ...ready.estimates.canvas!, suppressed: true };
    expect(formatBaselineInsight(estimate, 20, 20)).toBe(
      'Population rarity hidden until at least 20 matching samples exist'
    );
  });
});
