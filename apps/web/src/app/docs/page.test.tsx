import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DocsPage from './page';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe('/docs prerendered HTML', () => {
  it('ships every tab panel and hides the inactive ones', () => {
    const html = renderToStaticMarkup(<DocsPage />);

    // Text from the API tab, which is not the default tab.
    expect(html).toContain('All API requests require authentication');
    const panels = [...html.matchAll(/<div[^>]*role="tabpanel"[^>]*>/g)].map(
      ([tag]) => tag
    );
    expect(panels).toHaveLength(5);
    expect(
      panels.filter((tag) => tag.includes('data-state="active"'))
    ).toHaveLength(1);
    for (const tag of panels) {
      expect(tag).toContain('data-[state=inactive]:hidden');
    }
  });
});
