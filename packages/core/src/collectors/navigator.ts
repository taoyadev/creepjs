import type { NavigatorFingerprint } from '../types';

/**
 * Collect Navigator API fingerprint
 */
export function collectNavigatorFingerprint():
  | NavigatorFingerprint
  | undefined {
  if (typeof navigator === 'undefined') return undefined;

  try {
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        rtt?: number;
        downlink?: number;
        saveData?: boolean;
      };
      webdriver?: boolean;
    };

    return {
      userAgent: navigator.userAgent,
      appVersion: navigator.appVersion,
      appName: navigator.appName,
      language: navigator.language,
      platform: navigator.platform,
      product: navigator.product,
      productSub: navigator.productSub,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || null,
      onLine: navigator.onLine,
      webdriver: nav.webdriver,
      connection: nav.connection
        ? {
            effectiveType: nav.connection.effectiveType,
            rtt: nav.connection.rtt,
            downlink: nav.connection.downlink,
            saveData: nav.connection.saveData,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Navigator fingerprinting error:', error);
    return undefined;
  }
}
