/**
 * Checks for the deprecated WebSQL openDatabase API support.
 */
export function collectOpenDatabaseSupport(): boolean | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return (
    typeof (window as Window & { openDatabase?: unknown }).openDatabase ===
    'function'
  );
}
