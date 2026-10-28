import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

type Rgb = [number, number, number];

const css = readFileSync(
  path.join(process.cwd(), 'src', 'app', 'globals.css'),
  'utf8'
);

function hslToRgb(h: number, s: number, l: number): Rgb {
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4)];
}

function themeTokens(selector: string): (name: string) => Rgb {
  const block = new RegExp(`${selector} \\{([^}]*)\\}`).exec(css)?.[1];
  if (!block) throw new Error(`globals.css has no ${selector} block`);
  const tokens = new Map(
    [...block.matchAll(/--([\w-]+): ([\d.]+) ([\d.]+)% ([\d.]+)%;/g)].map(
      ([, name, h, s, l]) => [
        name,
        hslToRgb(Number(h), Number(s) / 100, Number(l) / 100),
      ]
    )
  );
  return (name) => {
    const rgb = tokens.get(name);
    if (!rgb) throw new Error(`${selector} has no --${name}`);
    return rgb;
  };
}

function luminance([r, g, b]: Rgb): number {
  const linear = (v: number) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function over([r, g, b]: Rgb, alpha: number, [br, bg, bb]: Rgb): Rgb {
  const mix = (top: number, bottom: number) =>
    top * alpha + bottom * (1 - alpha);
  return [mix(r, br), mix(g, bg), mix(b, bb)];
}

// text-destructive is body text in alerts, badges and inline errors, on the
// page, on muted panels and on its own /10 tint. Those states only render
// after a failure, so page-level audits such as Lighthouse never see them.
describe.each([
  { theme: 'light', selector: ':root' },
  { theme: 'dark', selector: '\\.dark' },
])('$theme destructive colors', ({ selector }) => {
  const token = themeTokens(selector);
  const destructive = token('destructive');

  it.each<[string, Rgb, Rgb]>([
    ['text on the page', destructive, token('background')],
    ['text on a muted panel', destructive, token('muted')],
    [
      'text on its own /10 tint',
      destructive,
      over(destructive, 0.1, token('background')),
    ],
    ['button label on the fill', token('destructive-foreground'), destructive],
  ])('%s meets WCAG AA 4.5:1', (_case, foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
