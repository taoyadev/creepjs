import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CheckerSectionNav } from './CheckerSectionNav';

describe('CheckerSectionNav', () => {
  it('renders ordinary semantic anchors with an initial current location', () => {
    const html = renderToStaticMarkup(<CheckerSectionNav />);

    expect(html).toContain('aria-label="Checker sections"');
    expect(html).toContain('href="#scan"');
    expect(html).toContain('href="#trust"');
    expect(html).toContain('href="#privacy"');
    expect(html).toContain('aria-current="location"');
  });
});
