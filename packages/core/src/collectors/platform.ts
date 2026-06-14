/**
 * Returns the user-facing platform identifier.
 */
export function collectPlatform(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return navigator.platform || undefined;
}
