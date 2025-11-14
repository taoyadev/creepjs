import type { ColorGamutFingerprint } from '../types';

const GAMUT_QUERIES: ColorGamutFingerprint[] = ['rec2020', 'p3', 'srgb'];

export function collectColorGamutFingerprint():
  | ColorGamutFingerprint
  | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  for (const gamut of GAMUT_QUERIES) {
    if (window.matchMedia(`(color-gamut: ${gamut})`).matches) {
      return gamut;
    }
  }

  return undefined;
}
