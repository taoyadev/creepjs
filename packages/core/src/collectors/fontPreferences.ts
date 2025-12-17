import type { FontPreferencesFingerprint } from '../types';

const GENERIC_FONTS = [
  { key: 'serif', css: 'serif' },
  { key: 'sansSerif', css: 'sans-serif' },
  { key: 'monospace', css: 'monospace' },
] as const;

export function collectFontPreferencesFingerprint():
  | FontPreferencesFingerprint
  | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const root = document.body || document.documentElement;
  if (!root) {
    return undefined;
  }

  const container = document.createElement('div');
  container.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;visibility:hidden;';

  const result: FontPreferencesFingerprint = {};

  for (const font of GENERIC_FONTS) {
    const span = document.createElement('span');
    span.style.fontFamily = font.css;
    span.style.fontSize = '32px';
    span.textContent = 'mmmmmmmmmmmmmmmmmmmmmm';
    container.appendChild(span);
  }

  root.appendChild(container);

  Array.from(container.children).forEach((child, index) => {
    const element = child as HTMLElement;
    const computed = window.getComputedStyle(element);
    const family = computed.fontFamily;
    const key = GENERIC_FONTS[index]?.key;
    if (key) {
      (result as Record<string, string>)[key] = family;
    }
  });

  root.removeChild(container);

  return result;
}
