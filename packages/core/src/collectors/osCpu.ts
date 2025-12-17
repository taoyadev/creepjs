/**
 * Returns the operating system CPU identifier if provided by the browser.
 */
export function collectOsCpu(): string | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return (navigator as Navigator & { oscpu?: string }).oscpu ?? undefined;
}
