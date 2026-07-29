import { readFileSync } from 'node:fs';
import path from 'node:path';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FINGERPRINT_TECHNIQUES } from '@/lib/seo-routes';

import { getSignalCollector } from './FingerprintPlayground';
import FingerprintPage, { generateStaticParams } from './page';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

describe('fingerprint signal pages', () => {
  it('builds every canonical signal from the shared registry', () => {
    expect(generateStaticParams()).toEqual(
      FINGERPRINT_TECHNIQUES.map(({ slug }) => ({ type: slug }))
    );

    for (const technique of FINGERPRINT_TECHNIQUES) {
      expect(getSignalCollector(technique.slug, {} as never)).toBeTypeOf(
        'function'
      );
    }
  });

  it('renders one server H1 and one reviewed article for all 55 signals', async () => {
    for (const technique of FINGERPRINT_TECHNIQUES) {
      const page = await FingerprintPage({
        params: Promise.resolve({ type: technique.slug }),
      });
      const html = renderToStaticMarkup(page);

      expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
      expect(html.match(/<article(?:\s|>)/g)).toHaveLength(1);
      expect(html).toContain(`>${technique.name}</h1>`);
      expect(html).toContain('What CreepJS reports');
      expect(html).toContain('How to interpret it');
      expect(html).toContain('Limits');
      expect(html).toContain('Test the signal');
      expect(html).toContain(
        `https://creepjs.org/fingerprint/${technique.slug}`
      );
    }
  });

  it('fails closed for an unknown signal slug', async () => {
    await expect(
      FingerprintPage({
        params: Promise.resolve({ type: 'unknown-signal' }),
      })
    ).rejects.toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  it('keeps reviewed education out of the client island', () => {
    const source = readFileSync(
      path.join(
        process.cwd(),
        'src',
        'app',
        'fingerprint',
        '[type]',
        'FingerprintPlayground.tsx'
      ),
      'utf8'
    );

    for (const forbidden of [
      '/content/fingerprints/',
      'loadMarkdownContent',
      'ReactMarkdown',
      'remarkGfm',
      'rehypeHighlight',
      'highlight.js',
      'longDescription',
      'useCases',
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
