import type { FontsFingerprint } from '../types';

/**
 * List of common fonts to detect
 */
const COMMON_FONTS = [
  'Arial',
  'Verdana',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Palatino',
  'Garamond',
  'Bookman',
  'Comic Sans MS',
  'Trebuchet MS',
  'Impact',
  'Lucida Console',
  'Tahoma',
  'Lucida Sans Unicode',
  'Geneva',
  'Monaco',
  'Andale Mono',
];

/**
 * Detect available fonts by measuring text width
 */
export function collectFontsFingerprint(): FontsFingerprint | undefined {
  if (typeof document === 'undefined') return undefined;

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return undefined;

    const baseFont = 'monospace';
    const testString = 'mmmmmmmmmmlli';
    const baseWidth: Record<string, number> = {};

    // Measure base font width at different sizes
    ctx.font = `72px ${baseFont}`;
    baseWidth[baseFont] = ctx.measureText(testString).width;

    const available: string[] = [];

    for (const font of COMMON_FONTS) {
      ctx.font = `72px "${font}", ${baseFont}`;
      const width = ctx.measureText(testString).width;

      // If width differs from base, font is available
      if (width !== baseWidth[baseFont]) {
        available.push(font);
      }
    }

    return {
      available,
      count: available.length,
    };
  } catch (error) {
    console.error('Fonts fingerprinting error:', error);
    return undefined;
  }
}
