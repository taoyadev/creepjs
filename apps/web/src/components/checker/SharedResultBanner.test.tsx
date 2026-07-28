import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SharedResultBanner } from './SharedResultBanner';

describe('SharedResultBanner', () => {
  it('labels URL data as context and preserves the live-scan distinction', () => {
    const html = renderToStaticMarkup(
      <SharedResultBanner
        snapshot={{
          fingerprintId: 'abc123',
          coverage: 88,
          baselineCount: 19,
        }}
      />
    );

    expect(html).toContain('Shared snapshot context');
    expect(html).toContain('does not reproduce another browser');
    expect(html).toContain('Your own scan is still running');
    expect(html).toContain('88.0%');
  });

  it('compares the completed local ID without calling it an identity match', () => {
    const html = renderToStaticMarkup(
      <SharedResultBanner
        snapshot={{
          fingerprintId: 'abc123',
          coverage: null,
          baselineCount: null,
        }}
        currentFingerprintId="different"
      />
    );

    expect(html).toContain('diagnostic ID differs');
    expect(html).not.toContain('identity');
  });
});
