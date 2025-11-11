import type { ScreenFingerprint } from '../types';

/**
 * Collect Screen fingerprint
 */
export function collectScreenFingerprint(): ScreenFingerprint | undefined {
  if (typeof window === 'undefined' || typeof screen === 'undefined') {
    return undefined;
  }

  try {
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      devicePixelRatio: window.devicePixelRatio || 1,
    };
  } catch (error) {
    console.error('Screen fingerprinting error:', error);
    return undefined;
  }
}
