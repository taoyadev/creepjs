import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DocsPage from './page';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe('/docs prerendered HTML', () => {
  it('ships usable task navigation, examples, API limits, and recovery without JS tabs', () => {
    const html = renderToStaticMarkup(<DocsPage />);
    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    for (const id of [
      'quickstart',
      'api',
      'collectors',
      'faq',
      'introduction',
    ]) {
      expect(html).toContain(`href="#${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('Public IP and own-IP lookups do not need a token.');
    expect(html).toContain('128 KiB');
    expect(html).toContain('429');
    expect(html).toContain('npm package is not published yet');
    expect(html).toContain('cache: false');
    expect(html).not.toContain('role="tabpanel"');
    expect(html).not.toContain('All API requests require authentication');
  });
});
