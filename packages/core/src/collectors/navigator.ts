import type { NavigatorFingerprint } from '../types';

/**
 * Collect Navigator API fingerprint
 */
export function collectNavigatorFingerprint():
  | NavigatorFingerprint
  | undefined {
  if (typeof navigator === 'undefined') return undefined;

  try {
    const nav = navigator as typeof navigator & {
      deviceMemory?: number;
      connection?: {
        effectiveType?: string;
        rtt?: number;
        downlink?: number;
        saveData?: boolean;
      };
      getBattery?: () => Promise<{
        charging: boolean;
        chargingTime: number;
        dischargingTime: number;
        level: number;
      }>;
      permissions?: {
        query: (descriptor: { name: string }) => Promise<{status: string}>;
      };
      plugins?: { length: number };
      mimeTypes?: { length: number };
      webdriver?: boolean;
      pdfViewerEnabled?: boolean;
    };

    return {
      userAgent: navigator.userAgent,
      appVersion: navigator.appVersion,
      appName: navigator.appName,
      language: navigator.language,
      languages: [...navigator.languages],
      platform: navigator.platform,
      product: navigator.product,
      productSub: navigator.productSub,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: nav.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || null,
      onLine: navigator.onLine,
      webdriver: nav.webdriver,
      pdfViewerEnabled: nav.pdfViewerEnabled,
      pluginsLength: nav.plugins?.length || 0,
      mimeTypesLength: nav.mimeTypes?.length || 0,
      connection: nav.connection ? {
        effectiveType: nav.connection.effectiveType,
        rtt: nav.connection.rtt,
        downlink: nav.connection.downlink,
        saveData: nav.connection.saveData,
      } : undefined,
    };
  } catch (error) {
    console.error('Navigator fingerprinting error:', error);
    return undefined;
  }
}
