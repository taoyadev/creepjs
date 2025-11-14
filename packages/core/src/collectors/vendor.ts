/**
 * Returns the Navigator vendor string if available.
 */
export function collectVendor(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return navigator.vendor || undefined;
}
