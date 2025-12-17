import type { ReducedTransparencyPreference } from '../types';

export function collectReducedTransparencyPreference():
  | ReducedTransparencyPreference
  | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
    return 'reduce';
  }

  if (
    window.matchMedia('(prefers-reduced-transparency: no-preference)').matches
  ) {
    return 'no-preference';
  }

  return undefined;
}
