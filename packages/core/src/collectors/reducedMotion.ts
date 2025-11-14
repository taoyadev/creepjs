import type { ReducedMotionPreference } from '../types';

export function collectReducedMotionPreference():
  | ReducedMotionPreference
  | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduce';
  }

  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    return 'no-preference';
  }

  return undefined;
}
