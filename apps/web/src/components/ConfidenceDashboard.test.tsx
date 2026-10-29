import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { FingerprintResult } from '@creepjs/core';
import { ConfidenceDashboard } from './ConfidenceDashboard';

describe('coverage interpretation', () => {
  it('averages actual collector durations and never invents an unrequested baseline count', () => {
    const result: FingerprintResult = {
      fingerprintId: 'example',
      data: {},
      timestamp: 1,
      confidence: 0.5,
      coverage: { ratio: 0.5, successful: 1, failed: 1, skipped: 0 },
      timings: { total: 25 },
      collectors: {
        canvas: { status: 'success', duration: 10 },
        webgl: { status: 'error', duration: 30 },
      },
    };
    const html = renderToStaticMarkup(
      <ConfidenceDashboard result={result} baseline={null} />
    );
    expect(html).toContain('>20ms</div>');
    expect(html).toContain('Avg per Attempted');
    expect(html).not.toContain('Baseline warming up');
    expect(html).not.toContain('0/20');
  });
});
