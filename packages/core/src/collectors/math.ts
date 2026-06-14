import type { MathFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect Math runtime fingerprint
 * Tests various Math operations to detect browser/system differences
 */
export function collectMathFingerprint(): MathFingerprint | undefined {
  if (typeof Math === 'undefined') return undefined;

  try {
    const data: Record<string, number> = {
      // Trigonometric functions
      acos: Math.acos(0.123),
      acosh: Math.acosh(1.234),
      asin: Math.asin(0.123),
      asinh: Math.asinh(1.234),
      atan: Math.atan(0.123),
      atanh: Math.atanh(0.123),
      atan2: Math.atan2(0.123, 0.456),

      // Exponential and logarithmic
      exp: Math.exp(1),
      expm1: Math.expm1(1),
      log: Math.log(Math.E),
      log1p: Math.log1p(1),
      log10: Math.log10(10),
      log2: Math.log2(2),

      // Power and root
      pow: Math.pow(2, 10),
      sqrt: Math.sqrt(2),
      cbrt: Math.cbrt(8),

      // Hyperbolic
      cosh: Math.cosh(1),
      sinh: Math.sinh(1),
      tanh: Math.tanh(1),

      // Rounding
      ceil: Math.ceil(0.123),
      floor: Math.floor(0.123),
      round: Math.round(0.123),
      trunc: Math.trunc(0.123),

      // Other
      abs: Math.abs(-123),
      sign: Math.sign(-123),
      cos: Math.cos(1),
      sin: Math.sin(1),
      tan: Math.tan(1),
    };

    // Test precision differences
    const precision = [
      Math.PI,
      Math.E,
      Math.LN10,
      Math.LN2,
      Math.LOG10E,
      Math.LOG2E,
      Math.SQRT1_2,
      Math.SQRT2,
    ];

    const values = [...Object.values(data), ...precision];
    const hash = murmurHash3(values.join(','));

    return {
      hash: String(hash),
      data: data,
      constants: {
        PI: Math.PI,
        E: Math.E,
        LN10: Math.LN10,
        LN2: Math.LN2,
        LOG10E: Math.LOG10E,
        LOG2E: Math.LOG2E,
        SQRT1_2: Math.SQRT1_2,
        SQRT2: Math.SQRT2,
      },
    };
  } catch (error) {
    console.error('Math fingerprinting error:', error);
    return undefined;
  }
}
