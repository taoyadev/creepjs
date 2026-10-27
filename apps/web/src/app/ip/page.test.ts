import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('/ip risk banner contrast', () => {
  it('pairs a dark light-mode tone with a light dark-mode tone', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'src', 'app', 'ip', 'page.tsx'),
      'utf8'
    );
    const tones = [
      ...source.matchAll(/className:\s*'[^'\n]*bg-(\w+)-500\/10 ([^'\n]+)'/g),
    ].map((match) => ({ hue: match[1], text: match[2] }));

    expect(tones.map(({ hue }) => hue)).toEqual(['slate', 'red', 'emerald']);
    // -200 text on a 10% tint of white is ~1.1–1.3:1; -800 clears WCAG AA.
    for (const { hue, text } of tones) {
      expect(text).toBe(`text-${hue}-800 dark:text-${hue}-200`);
    }
  });
});
