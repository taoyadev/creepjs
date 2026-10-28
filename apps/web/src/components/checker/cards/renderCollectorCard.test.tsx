import React from 'react';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import type { FingerprintResult } from '@creepjs/core';
import { describe, expect, it } from 'vitest';
import { renderCollectorCard, tabCollectors } from './renderCollectorCard';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe('checker collector cards', () => {
  it('lists every category-tab collector, and only those, under All', () => {
    const keys = (tab: keyof typeof tabCollectors) =>
      tabCollectors[tab].map(({ key }) => key);
    const categoryKeys = (
      [
        'graphics',
        'system',
        'media',
        'network',
        'security',
        'accessibility',
      ] as const
    ).flatMap(keys);

    expect([...keys('all')].sort()).toEqual([...categoryKeys].sort());
    expect(keys('security')).toContain('domBlockers');
  });

  it('shows the population baseline on the cards that have one', () => {
    const fingerprint = {
      data: { canvas: { hash: 'c1' } },
      timings: {},
    } as unknown as FingerprintResult;
    const html = renderToStaticMarkup(
      <>
        {renderCollectorCard.graphics('canvas', fingerprint, {
          totalSamples: 3,
          kAnonThreshold: 20,
          estimates: {
            canvas: {
              component: 'canvas',
              bucket: 'c1',
              sampleSize: 1,
              rarity: 0.5,
            },
          },
        } as Parameters<typeof renderCollectorCard.graphics>[2])}
      </>
    );

    expect(html).toContain('Baseline warming up (3/20)');
  });

  it('leaves CheckerApp without its own copy of the cards', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src/components/checker/CheckerApp.tsx'),
      'utf8'
    );

    expect(source).not.toContain('<FingerprintCollectorCard');
  });
});
