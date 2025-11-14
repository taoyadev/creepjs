import type { ContrastPreference } from '../types';

const CONTRAST_OPTIONS: ContrastPreference[] = [
  'more',
  'less',
  'custom',
  'no-preference',
];

export function collectContrastPreference(): ContrastPreference | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  for (const value of CONTRAST_OPTIONS) {
    if (window.matchMedia(`(prefers-contrast: ${value})`).matches) {
      return value;
    }
  }

  return undefined;
}
