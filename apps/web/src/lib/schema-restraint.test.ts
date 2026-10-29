import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(entryPath);
    return /\.(?:ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts')
      ? [entryPath]
      : [];
  });
}

describe('structured-data restraint', () => {
  it('adds no FAQ, HowTo, or Dataset schema to the task pages', () => {
    const appRoot = path.join(process.cwd(), 'src', 'app');
    const schemaUses = sourceFiles(appRoot).flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return [...source.matchAll(/['"]@type['"]:\s*['"]([^'"]+)['"]/g)].map(
        (match) => ({ file, type: match[1] })
      );
    });

    expect(
      schemaUses
        .filter(({ type }) => type === 'FAQPage')
        .map(({ file }) => path.relative(appRoot, file))
    ).toEqual([]);
    expect(schemaUses.some(({ type }) => type === 'HowTo')).toBe(false);
    expect(schemaUses.some(({ type }) => type === 'Dataset')).toBe(false);
  });

  it('emits only site-wide schema from the root layout', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src', 'app', 'layout.tsx'),
      'utf8'
    );
    const builders = [...source.matchAll(/structuredData\.(\w+)\(/g)].map(
      (match) => match[1]
    );

    // Pages emit their own WebApplication/WebPage; a root copy would make
    // every tool page describe itself twice.
    expect(builders).toEqual(['organization', 'website']);
  });
});
