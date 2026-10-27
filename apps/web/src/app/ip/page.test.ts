import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  path.join(process.cwd(), 'src', 'app', 'ip', 'page.tsx'),
  'utf8'
);

describe('/ip risk banner contrast', () => {
  it('pairs a dark light-mode tone with a light dark-mode tone', () => {
    const tones = [
      ...source.matchAll(/className:\s*'[^'\n]*bg-(\w+)-500\/10 ([^'\n]+)'/g),
    ].map((match) => ({ hue: match[1], text: match[2] }));

    expect(tones.map(({ hue }) => hue)).toEqual(['slate', 'red', 'emerald']);
    // -200 text on a 10% tint of white is ~1.1–1.3:1; -800 clears WCAG AA.
    for (const { hue, text } of tones) {
      expect(text).toBe(`text-${hue}-800 dark:text-${hue}-200`);
    }
  });

  it('sets the banner text in the tone colour, not the muted grey', () => {
    // Muted grey on the light tints measured 4.2–4.3:1 in the browser.
    const start = source.indexOf(
      "<Card className={cn('border-2', tone.className)}>"
    );
    const banner = source.slice(start, source.indexOf('</Card>', start));

    expect(start).toBeGreaterThan(-1);
    expect(banner).toContain('{tone.badge}');
    expect(banner).not.toContain('text-muted-foreground');
  });
});
