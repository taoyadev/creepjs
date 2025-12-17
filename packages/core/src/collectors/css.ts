import type { CSSFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect CSS computed styles fingerprint
 */
export function collectCSSFingerprint(): CSSFingerprint | undefined {
  if (typeof document === 'undefined' || typeof window === 'undefined')
    return undefined;

  try {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.width = '100px';
    div.style.height = '100px';

    document.body.appendChild(div);

    const computed = window.getComputedStyle(div);

    // Collect important CSS properties
    const properties = [
      'width',
      'height',
      'display',
      'position',
      'left',
      'color',
      'font-family',
      'font-size',
      'line-height',
      'background-color',
      'border-width',
      'border-style',
      'padding',
      'margin',
      'box-sizing',
      'overflow',
      'text-align',
      'vertical-align',
      'visibility',
      'z-index',
      'opacity',
      'transform',
      'transition',
    ];

    const styles: Record<string, string> = {};
    properties.forEach((prop) => {
      styles[prop] = computed.getPropertyValue(prop);
    });

    // Get all CSS system fonts
    const systemFonts = [
      'caption',
      'icon',
      'menu',
      'message-box',
      'small-caption',
      'status-bar',
    ];

    const fonts: Record<string, string> = {};
    systemFonts.forEach((font) => {
      div.style.font = font;
      const fontComputed = window.getComputedStyle(div);
      fonts[font] = fontComputed.font || fontComputed.fontFamily;
    });

    document.body.removeChild(div);

    const allValues = [...Object.values(styles), ...Object.values(fonts)];
    const hash = murmurHash3(allValues.join(','));

    return {
      hash: String(hash),
      styles: styles,
      systemFonts: fonts,
    };
  } catch (error) {
    console.error('CSS fingerprinting error:', error);
    return undefined;
  }
}
