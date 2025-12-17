import type { ScreenResolutionFingerprint } from '../types';

const parseDimension = (value: unknown): number | null => {
  const numeric = typeof value === 'string' ? Number(value) : (value as number);
  return typeof numeric === 'number' && Number.isFinite(numeric)
    ? numeric
    : null;
};

const isSafari17PrivateMode = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  if (!ua.includes('Safari/')) {
    return false;
  }
  if (ua.includes('Chrome/') || ua.includes('Chromium/')) {
    return false;
  }
  const versionMatch = /Version\/(\d+)/.exec(ua);
  if (!versionMatch) {
    return false;
  }
  const version = Number(versionMatch[1]);
  return Number.isFinite(version) && version >= 17;
};

/**
 * Returns the sorted screen resolution tuple (width >= height) when reliable.
 * Safari 17 private browsing always reports dynamic document size, so we skip there.
 */
export function collectScreenResolution():
  | ScreenResolutionFingerprint
  | undefined {
  if (typeof window === 'undefined' || typeof window.screen === 'undefined') {
    return undefined;
  }

  if (isSafari17PrivateMode()) {
    return undefined;
  }

  const width = parseDimension(window.screen.width);
  const height = parseDimension(window.screen.height);

  if (width === null && height === null) {
    return undefined;
  }

  if (width !== null && height !== null) {
    return width >= height ? [width, height] : [height, width];
  }

  return [width ?? height, null];
}
