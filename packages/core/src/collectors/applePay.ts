import type { ApplePayFingerprint } from '../types';

export async function collectApplePayFingerprint(): Promise<
  ApplePayFingerprint | undefined
> {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const { ApplePaySession } = window as typeof window & {
    ApplePaySession?: {
      canMakePayments?: () => boolean | Promise<boolean>;
      supportsVersion?: (version: number) => boolean;
      supportedVersions?: number[];
    };
  };

  if (!ApplePaySession) {
    return { isSupported: false };
  }

  const fingerprint: ApplePayFingerprint = {
    isSupported: true,
  };

  if (Array.isArray(ApplePaySession.supportedVersions)) {
    fingerprint.supportedVersions = ApplePaySession.supportedVersions;
  }

  if (typeof ApplePaySession.canMakePayments === 'function') {
    try {
      const result = ApplePaySession.canMakePayments();
      fingerprint.canMakePayments =
        typeof result === 'boolean' ? result : await result;
    } catch (_applePayError) {
      void _applePayError;
      // Swallow errors—Safari may throw if Apple Pay not configured
      fingerprint.canMakePayments = undefined;
    }
  }

  return fingerprint;
}
