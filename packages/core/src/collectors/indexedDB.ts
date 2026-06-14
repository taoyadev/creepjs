/**
 * Determines whether IndexedDB is accessible in the current context.
 */
export function collectIndexedDBSupport(): boolean | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return typeof window.indexedDB !== 'undefined';
  } catch (error) {
    void error;
    // SecurityError when referencing it means it exists but is blocked.
    return true;
  }
}
