import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HomeFingerprintScan } from './HomeFingerprintScan';
import { SIGNAL_ROWS } from './fingerprint-summary';

describe('HomeFingerprintScan first render', () => {
  it('shows the automatic scan state without an invented result', () => {
    const html = renderToStaticMarkup(<HomeFingerprintScan />);
    const buttons = html.match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? [];

    expect(html).toContain('Scanning this browser');
    expect(html).toContain('role="progressbar"');
    expect(html).not.toContain('Run local scan');
    expect(html).not.toContain('id="home-fingerprint-id"');
    expect(html).not.toContain('Not returned');
    expect(
      buttons.some(
        (button) =>
          button.includes('disabled=""') && button.endsWith('Scanning</button>')
      )
    ).toBe(true);
    expect(html).toContain('href="/checker"');
    for (const row of SIGNAL_ROWS) expect(html).toContain(`${row.label}</dt>`);
  });
});
