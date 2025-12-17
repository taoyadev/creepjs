import type { TextMetricsFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect TextMetrics fingerprint
 * Tests text measurement API for browser differences
 */
export function collectTextMetricsFingerprint():
  | TextMetricsFingerprint
  | undefined {
  if (typeof document === 'undefined') return undefined;

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const testStrings = [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      '你好世界',
      'مرحبا بالعالم',
      '😀😃😄😁',
    ];

    const fonts = [
      '12px Arial',
      '14px Times New Roman',
      '16px Courier New',
      '18px Verdana',
    ];

    const metrics: number[] = [];

    fonts.forEach((font) => {
      ctx.font = font;
      testStrings.forEach((text) => {
        const m = ctx.measureText(text);
        metrics.push(
          m.width,
          m.actualBoundingBoxLeft,
          m.actualBoundingBoxRight,
          m.actualBoundingBoxAscent,
          m.actualBoundingBoxDescent,
          m.fontBoundingBoxAscent,
          m.fontBoundingBoxDescent,
          m.alphabeticBaseline || 0
        );
      });
    });

    const hash = murmurHash3(metrics.join(','));

    return {
      hash: String(hash),
      data: metrics,
    };
  } catch (error) {
    console.error('TextMetrics fingerprinting error:', error);
    return undefined;
  }
}
