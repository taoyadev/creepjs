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
  it('keeps the one visible guide FAQ and adds no HowTo or Dataset schema', () => {
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
    ).toEqual(['guide/what-is-browser-fingerprinting/page.tsx']);
    expect(schemaUses.some(({ type }) => type === 'HowTo')).toBe(false);
    expect(schemaUses.some(({ type }) => type === 'Dataset')).toBe(false);
  });
});
