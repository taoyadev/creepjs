/**
 * Detects availability of window.sessionStorage.
 */
export function collectSessionStorageSupport(): boolean | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return typeof window.sessionStorage !== 'undefined';
  } catch (error) {
    void error;
    return true;
  }
}
