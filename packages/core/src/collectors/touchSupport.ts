import type { TouchSupportFingerprint } from '../types';

/**
 * Heuristic touch support detection combining multiple Navigator capabilities.
 */
export function collectTouchSupport(): TouchSupportFingerprint | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const nav = navigator as Navigator & { msMaxTouchPoints?: number };
  let maxTouchPoints = 0;
  if (typeof nav.maxTouchPoints === 'number') {
    maxTouchPoints = nav.maxTouchPoints;
  } else if (typeof nav.msMaxTouchPoints === 'number') {
    maxTouchPoints = nav.msMaxTouchPoints;
  }

  let touchEvent = false;
  if (typeof document !== 'undefined') {
    try {
      document.createEvent('TouchEvent');
      touchEvent = true;
    } catch (error) {
      void error;
      touchEvent = false;
    }
  }

  const touchStart = typeof window !== 'undefined' && 'ontouchstart' in window;

  return {
    maxTouchPoints,
    touchEvent,
    touchStart,
  };
}
