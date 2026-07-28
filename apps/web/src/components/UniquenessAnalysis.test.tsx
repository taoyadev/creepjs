import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { UniquenessAnalysis } from './UniquenessAnalysis';

describe('UniquenessAnalysis', () => {
  it('shows only warming state below k=20', () => {
    const html = renderToStaticMarkup(
      <UniquenessAnalysis
        baseline={{
          totalSamples: 7,
          kAnonThreshold: 20,
          estimates: {},
        }}
      />
    );

    expect(html).toContain('Baseline warming up (7/20)');
    expect(html).toContain('fabricated uniqueness percentage');
    expect(html).not.toMatch(/\\d+% rare/);
    expect(html).not.toContain('Uniqueness Score');
  });

  it('shows only API-backed rarity after the baseline is ready', () => {
    const html = renderToStaticMarkup(
      <UniquenessAnalysis
        baseline={{
          totalSamples: 20,
          kAnonThreshold: 20,
          estimates: {
            canvas: {
              component: 'canvas',
              bucket: 'hash',
              sampleSize: 2,
              rarity: 0.1,
              suppressed: false,
            },
          },
        }}
      />
    );

    expect(html).toContain('90% rare');
    expect(html).toContain('2 matching samples');
  });
});
