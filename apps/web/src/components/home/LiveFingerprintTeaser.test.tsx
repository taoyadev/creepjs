import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LiveFingerprintTeaser } from './LiveFingerprintTeaser';

describe('LiveFingerprintTeaser', () => {
  it('reserves its card and exposes bounded progress before hydration', () => {
    const html = renderToStaticMarkup(<LiveFingerprintTeaser />);

    expect(html).toContain('min-h-[22rem]');
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('href="/checker"');
    expect(html).not.toContain('Uniqueness Score');
  });
});
