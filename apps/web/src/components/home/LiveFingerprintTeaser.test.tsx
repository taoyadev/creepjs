import React from 'react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LiveFingerprintTeaser } from './LiveFingerprintTeaser';

const source = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

/** `import … from '@creepjs/core'` statements that bring in a value. */
const valueImportsFromCore = (code: string) =>
  [
    ...code.matchAll(
      /^import\s+(?!type\b)([^;]*?)\s+from\s+'@creepjs\/core';/gm
    ),
  ]
    .map(([, clause]) => clause)
    .filter((clause) => {
      const names = clause.replace(/[{}]/g, '').split(',');
      return names.some(
        (name) => name.trim() && !name.trim().startsWith('type ')
      );
    });

describe('LiveFingerprintTeaser', () => {
  it('reserves its card and waits for the visitor before scanning', () => {
    const html = renderToStaticMarkup(<LiveFingerprintTeaser />);

    expect(html).toContain('min-h-[22rem]');
    expect(html).toContain('Run local scan');
    expect(html).toContain('STUN server');
    expect(html).not.toContain('role="progressbar"');
    expect(html).toContain('href="/checker"');
    expect(html).not.toContain('Uniqueness Score');
  });

  it.each([
    ['the homepage teaser', './LiveFingerprintTeaser.tsx'],
    ['the playground', '../playground/PlaygroundApp.tsx'],
  ])('keeps the collectors out of %s until it runs a scan', (_label, path) => {
    const code = source(path);

    expect(valueImportsFromCore(code)).toEqual([]);
    expect(code).toContain("import('@creepjs/core')");
  });
});
