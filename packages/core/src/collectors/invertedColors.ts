/**
 * Detects whether the user has enabled global color inversion preferences.
 */
export function collectInvertedColorsPreference(): boolean | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  if (window.matchMedia('(inverted-colors: inverted)').matches) {
    return true;
  }

  if (window.matchMedia('(inverted-colors: none)').matches) {
    return false;
  }

  return undefined;
}
