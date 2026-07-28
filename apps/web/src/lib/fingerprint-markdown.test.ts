import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  SIGNAL_CONTENT_END,
  SIGNAL_CONTENT_START,
  assertSignalMarkdownRegistryAligned,
  buildLlmsFullText,
  validateVettedSignalMarkdown,
} from './fingerprint-markdown';
import { FINGERPRINT_TECHNIQUES } from './seo-routes';

const contentRoot = path.join(
  process.cwd(),
  'public',
  'content',
  'fingerprints'
);

describe('fingerprint Markdown honesty gate', () => {
  it('keeps all expected files aligned with the canonical manifest', () => {
    expect(() => assertSignalMarkdownRegistryAligned(contentRoot)).not.toThrow();
    expect(FINGERPRINT_TECHNIQUES).toHaveLength(55);
  });

  it('accepts every public signal mirror', () => {
    for (const technique of FINGERPRINT_TECHNIQUES) {
      const raw = readFileSync(
        path.join(contentRoot, `${technique.slug}.md`),
        'utf8'
      );

      expect(() =>
        validateVettedSignalMarkdown(raw, technique)
      ).not.toThrow();
    }
  });

  it.each([
    ['an exact percentage', 'Our tests found 94% accuracy.'],
    ['a first-person study', 'We tested this collector on many browsers.'],
    ['a sample size', 'The sample included 5,000 devices.'],
    ['a market forecast', 'The market is projected to grow next year.'],
    ['a ranking promise', 'This ensures better Google rankings.'],
  ])('rejects %s', (_label, unsafeClaim) => {
    const technique = FINGERPRINT_TECHNIQUES[0];
    const raw = `# ${technique.name}

${SIGNAL_CONTENT_START}

## What CreepJS reports

${unsafeClaim}

## How to interpret it

Use this as one browser observation.

## Limits

This is not a population estimate.

## Test the signal

- Live signal page: https://creepjs.org/fingerprint/${technique.slug}
- Category: ${technique.category}

Reviewed: 2026-07-28.

${SIGNAL_CONTENT_END}
`;

    expect(() => validateVettedSignalMarkdown(raw, technique)).toThrow();
  });

  it('builds 55 deterministic vetted document boundaries', () => {
    const output = buildLlmsFullText(contentRoot);

    expect(output.match(/^Signal: /gm)).toHaveLength(55);
    for (const technique of FINGERPRINT_TECHNIQUES) {
      expect(output).toContain(`Signal: ${technique.slug}`);
      expect(output).toContain(
        `HTML: https://creepjs.org/fingerprint/${technique.slug}`
      );
      expect(output).toContain(
        `Markdown: https://creepjs.org/content/fingerprints/${technique.slug}.md`
      );
    }
    expect(output).not.toMatch(
      /\b(?:guarantee(?:d|s)?|ensure(?:d|s)?)\b[^\n.!?]{0,64}\b(?:rankings?|citations?|inclusion|traffic)\b/i
    );
  });
});
