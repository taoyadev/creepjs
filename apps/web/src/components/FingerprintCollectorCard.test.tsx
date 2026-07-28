import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FingerprintCollectorCard } from './FingerprintCollectorCard';

describe('FingerprintCollectorCard', () => {
  it('exposes keyboard-operable disclosure semantics and technique help', () => {
    const html = renderToStaticMarkup(
      <FingerprintCollectorCard
        title="Canvas 2d"
        techniqueKey="canvas"
        timing={2.4}
      >
        Collector result
      </FingerprintCollectorCard>
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls=');
    expect(html).toContain('aria-label="About Canvas 2d"');
    expect(html).toContain('Collector result');
  });
});
