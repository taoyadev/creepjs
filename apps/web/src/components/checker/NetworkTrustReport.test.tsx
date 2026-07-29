import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { FingerprintResult } from '@creepjs/core';
import { NetworkTrustReport } from './NetworkTrustReport';

const result = {
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
  },
} as FingerprintResult;

describe('NetworkTrustReport', () => {
  it('keeps browser evidence visible when network context is blocked', () => {
    const html = renderToStaticMarkup(
      <NetworkTrustReport
        result={result}
        ownIp={{ status: 'error', data: null }}
        onRetryIp={() => undefined}
      />
    );

    expect(html).toContain('id="trust"');
    expect(html).toContain('Browser consistency');
    expect(html).toContain('Network context');
    expect(html).toContain('Retry network context');
    expect(html).not.toContain('Investigate this IP');
  });
});
