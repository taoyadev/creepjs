import type { HDRStatus } from '../types';

export function collectHDRStatus(): HDRStatus | undefined {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  if (window.matchMedia('(dynamic-range: high)').matches) {
    return 'high';
  }

  if (window.matchMedia('(dynamic-range: standard)').matches) {
    return 'standard';
  }

  return undefined;
}
