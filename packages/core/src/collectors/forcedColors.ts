import type { ForcedColorsFingerprint } from '../types';

export function collectForcedColorsFingerprint():
  | ForcedColorsFingerprint
  | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  const active = window.matchMedia('(forced-colors: active)').matches;
  return { active };
}
