/**
 * Detects availability of window.localStorage.
 */
export function collectLocalStorageSupport(): boolean | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return typeof window.localStorage !== 'undefined';
  } catch (error) {
    void error;
    return true;
  }
}
