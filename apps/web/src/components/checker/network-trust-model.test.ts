import { describe, expect, it } from 'vitest';
import type { FingerprintResult } from '@creepjs/core';
import { buildNetworkTrustModel } from './network-trust-model';

function fingerprint(overrides: Record<string, unknown> = {}) {
  return {
    confidence: 0.9,
    coverage: { ratio: 0.9, successful: 45, failed: 1, skipped: 4 },
    data: {
      lies: { liesCount: 0 },
      navigator: { webdriver: false },
      resistance: {
        detections: {},
        totalDetections: 0,
        privacyToolDetected: false,
      },
      ...overrides,
    },
  } as FingerprintResult;
}

describe('network trust model', () => {
  it('degrades to browser-only evidence when own-IP fails', () => {
    const model = buildNetworkTrustModel(fingerprint(), {
      status: 'error',
      data: null,
    });

    expect(model.headline).toBe('No elevated indicator was observed');
    expect(model.dimensions).toContainEqual(
      expect.objectContaining({
        label: 'Network context',
        value: 'Unavailable',
      })
    );
    expect(model.summary).not.toMatch(/probability|identity verified/i);
  });

  it('calls for review without converting indicators into a probability', () => {
    const model = buildNetworkTrustModel(
      fingerprint({
        lies: { liesCount: 2 },
        navigator: { webdriver: true },
      }),
      {
        status: 'ready',
        data: {
          ip: '203.0.113.8',
          risk: {
            score: 70,
            band: 'high',
            verdict: 'review',
            highRisk: true,
          },
        },
      }
    );

    expect(model.tone).toBe('review');
    expect(model.headline).toMatch(/review/i);
    expect(model.dimensions).toContainEqual(
      expect.objectContaining({ label: 'IP risk context', tone: 'review' })
    );
    expect(JSON.stringify(model)).not.toMatch(/70%|fraud probability/i);
  });

  it('labels a geo-only response without inventing a risk verdict', () => {
    const model = buildNetworkTrustModel(fingerprint(), {
      status: 'ready',
      data: {
        ip: '203.0.113.8',
        location: { country_code: 'US' },
      },
    });

    expect(model.dimensions).toContainEqual(
      expect.objectContaining({
        label: 'IP risk context',
        value: 'Geo and ASN context only',
        tone: 'neutral',
      })
    );
  });
});
