import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FINGERPRINT_TECHNIQUES } from '@/lib/seo-routes';
import { SignalGrid } from './SignalGrid';

describe('SignalGrid', () => {
  it('renders every registered fingerprint technique as a crawlable link', () => {
    const html = renderToStaticMarkup(<SignalGrid />);
    const links = html.match(/href="\/fingerprint\//g) ?? [];

    expect(links).toHaveLength(FINGERPRINT_TECHNIQUES.length);
    expect(html).toContain('Canvas Fingerprint');
    expect(html).toContain('Anti-Fingerprinting Detection');
  });
});
