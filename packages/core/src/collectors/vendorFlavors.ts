/**
 * Inspects known vendor-specific globals to differentiate browsers sharing engines.
 */
export function collectVendorFlavors(): string[] | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const candidates = [
    'chrome',
    'safari',
    '__crWeb',
    '__gCrWeb',
    'yandex',
    '__yb',
    '__ybro',
    '__firefox__',
    '__edgeTrackingPreventionStatistics',
    'webkit',
    'oprt',
    'samsungAr',
    'ucweb',
    'UCShellJava',
    'puffinDevice',
  ];

  const found: string[] = [];
  const globalWindow = window as typeof window & Record<string, unknown>;

  for (const key of candidates) {
    const value = globalWindow[key];
    if (value && typeof value === 'object') {
      found.push(key);
    }
  }

  return found.length ? found.sort() : undefined;
}
