/**
 * Lies Detection System
 * Analyzes fingerprint data for inconsistencies and potential spoofing
 */

import type { FingerprintData, LiesFingerprint } from '../types';

const LIE_DEFAULT_WEIGHT = 1;
const LIE_WEIGHTS: Record<string, number> = {
  screenDimensionsZero: 3,
  availSizeExceedsScreen: 2,
  windowDimensionsZero: 3,
  outerSmallerThanInner: 2,
  suspiciousPixelRatio: 2,
  userAgentPlatformMismatch: 3,
  mobileWithoutTouch: 2,
  emptyLanguages: 1,
  suspiciousHardwareConcurrency: 2,
  missingPlugins: 1,
  genericWebGL: 1,
  webglVendorMismatch: 4,
  timezoneSpoofed: 4,
  impossibleTimezoneOffset: 4,
  suspiciousCanvasHash: 3,
  canvasBlocked: 3,
  unusualAudioSampleRate: 2,
  mathConstantsModified: 5,
  noMediaDevices: 3,
  tooFewFonts: 2,
  tooManyFonts: 2,
  privacyToolsDetected: 5,
};

const TOTAL_LIE_WEIGHT = Object.values(LIE_WEIGHTS).reduce(
  (sum, weight) => sum + weight,
  0
);

const BENIGN_RESISTANCE_KEYS = new Set([
  'deviceEventsBlocked',
  'batteryMissing',
  'notificationMissing',
  'permissionsInconsistent',
  'connectionRttZero',
  'navigatorInconsistent',
  'screenInconsistent',
  'windowSizeInconsistent',
]);

/**
 * Collect lies detection data by analyzing other fingerprint data for inconsistencies
 */
export async function collectLiesFingerprint(
  data: FingerprintData
): Promise<LiesFingerprint | undefined> {
  try {
    const lies: Record<string, boolean> = {};
    const inconsistencies: string[] = [];

    // Screen vs Window dimensions
    if (data.screen) {
      const { width, height, availWidth, availHeight, devicePixelRatio } =
        data.screen;

      if (width === 0 || height === 0) {
        lies.screenDimensionsZero = true;
        inconsistencies.push(
          'Screen dimensions are zero (possible headless browser)'
        );
      }

      if (availWidth > width || availHeight > height) {
        lies.availSizeExceedsScreen = true;
        inconsistencies.push('Available screen size exceeds total screen size');
      }

      // Check if window dimensions match screen
      if (typeof window !== 'undefined') {
        if (window.outerWidth === 0 || window.outerHeight === 0) {
          lies.windowDimensionsZero = true;
          inconsistencies.push('Window dimensions are zero');
        }

        if (
          window.outerWidth < window.innerWidth ||
          window.outerHeight < window.innerHeight
        ) {
          lies.outerSmallerThanInner = true;
          inconsistencies.push(
            'Outer window size is smaller than inner (impossible)'
          );
        }
      }

      // Check devicePixelRatio
      if (devicePixelRatio < 0.5 || devicePixelRatio > 5) {
        lies.suspiciousPixelRatio = true;
        inconsistencies.push(`Unusual devicePixelRatio: ${devicePixelRatio}`);
      }
    }

    // Navigator consistency checks
    if (data.navigator) {
      const { userAgent, platform } = data.navigator;

      // User-Agent vs Platform mismatch
      const ua = userAgent.toLowerCase();
      const plat = platform.toLowerCase();

      if (
        (ua.includes('win') && !plat.includes('win')) ||
        (ua.includes('mac') && !plat.includes('mac')) ||
        (ua.includes('linux') && !plat.includes('linux'))
      ) {
        lies.userAgentPlatformMismatch = true;
        inconsistencies.push(
          `User-Agent (${userAgent}) doesn't match platform (${platform})`
        );
      }

      // Mobile UA without touch support
      const touchPoints = data.touchSupport?.maxTouchPoints ?? 0;
      if (
        (ua.includes('mobile') ||
          ua.includes('android') ||
          ua.includes('iphone')) &&
        touchPoints === 0
      ) {
        lies.mobileWithoutTouch = true;
        inconsistencies.push('Mobile User-Agent but no touch support');
      }

      // Empty languages array
      const languages = data.languages?.flat() ?? [];
      if (languages.length === 0) {
        lies.emptyLanguages = true;
        inconsistencies.push('Navigator languages array is empty');
      }

      // Suspicious hardware concurrency
      if (typeof data.hardwareConcurrency === 'number') {
        if (
          data.hardwareConcurrency === 0 ||
          data.hardwareConcurrency === 1 ||
          data.hardwareConcurrency > 128
        ) {
          lies.suspiciousHardwareConcurrency = true;
          inconsistencies.push(
            `Unusual hardware concurrency: ${data.hardwareConcurrency}`
          );
        }
      }

      // Missing plugins/mimeTypes on non-mobile
      if (
        !ua.includes('mobile') &&
        !ua.includes('android') &&
        !ua.includes('iphone')
      ) {
        if (Array.isArray(data.plugins) && data.plugins.length === 0) {
          lies.missingPlugins = true;
          inconsistencies.push(
            'Desktop browser reported zero plugins after enumeration'
          );
        }
      }
    }

    // WebGL consistency
    if (data.webgl) {
      const { vendor, renderer, unmaskedVendor, unmaskedRenderer } = data.webgl;

      // Check for generic/suspicious values
      const genericMasked = vendor === 'Google Inc.' && renderer === 'ANGLE';
      const hasUnmaskedValues = Boolean(unmaskedVendor && unmaskedRenderer);
      if (genericMasked && !hasUnmaskedValues) {
        lies.genericWebGL = true;
        inconsistencies.push(
          'WebGL exposes only generic Google/ANGLE identifiers'
        );
      }

      // Check if unmasked values differ significantly
      if (unmaskedVendor && unmaskedRenderer && vendor) {
        const maskedVendor = vendor.toLowerCase();
        const rawVendor = unmaskedVendor.toLowerCase();
        const mismatch =
          maskedVendor.length > 0 &&
          !rawVendor.includes(maskedVendor) &&
          maskedVendor !== 'google inc.';
        if (mismatch) {
          lies.webglVendorMismatch = true;
          inconsistencies.push(
            'WebGL vendor mismatch between masked and unmasked'
          );
        }
      }
    }

    // Timezone consistency
    if (data.timezone) {
      const { timezone, timezoneOffset } = data.timezone;

      // Check for timezone spoofing
      if (timezone === 'UTC' && timezoneOffset !== 0) {
        lies.timezoneSpoofed = true;
        inconsistencies.push('Timezone is UTC but offset is not 0');
      }

      // Check for impossible timezone offset
      if (Math.abs(timezoneOffset) > 840) {
        // Max is UTC+14 (840 minutes)
        lies.impossibleTimezoneOffset = true;
        inconsistencies.push(`Impossible timezone offset: ${timezoneOffset}`);
      }
    }

    // Canvas consistency
    if (data.canvas) {
      // Check for empty or suspiciously short canvas hash
      if (!data.canvas.hash || data.canvas.hash.length < 10) {
        lies.suspiciousCanvasHash = true;
        inconsistencies.push('Canvas hash is too short or missing');
      }

      // Check for blocked canvas
      if (data.canvas.dataURL && data.canvas.dataURL.length < 100) {
        lies.canvasBlocked = true;
        inconsistencies.push(
          'Canvas appears to be blocked (data URL too short)'
        );
      }
    }

    // Audio consistency
    if (data.audio) {
      const { sampleRate } = data.audio;

      // Check for unusual sample rates
      if (
        sampleRate !== 44100 &&
        sampleRate !== 48000 &&
        sampleRate !== 96000
      ) {
        lies.unusualAudioSampleRate = true;
        inconsistencies.push(`Unusual audio sample rate: ${sampleRate}`);
      }
    }

    // Math consistency
    if (data.math) {
      const { constants } = data.math;

      // Check if Math constants are modified (rare but possible with privacy tools)
      if (constants) {
        const piDiff = Math.abs(constants.PI - Math.PI);
        const eDiff = Math.abs(constants.E - Math.E);

        if (piDiff > 0.0001 || eDiff > 0.0001) {
          lies.mathConstantsModified = true;
          inconsistencies.push('Math constants appear to be modified');
        }
      }
    }

    // Media devices consistency
    if (data.media && data.navigator) {
      const { deviceCount } = data.media;
      const ua = data.navigator.userAgent.toLowerCase();

      // Desktop browser with no media devices is suspicious
      if (
        !ua.includes('mobile') &&
        deviceCount.audioInput === 0 &&
        deviceCount.videoInput === 0
      ) {
        lies.noMediaDevices = true;
        inconsistencies.push('Desktop browser with no media devices detected');
      }
    }

    // Fonts consistency
    if (data.fonts) {
      const { count } = data.fonts;

      // Very few fonts is suspicious
      if (count < 5) {
        lies.tooFewFonts = true;
        inconsistencies.push(`Unusually low font count: ${count}`);
      }

      // Extremely high font count is also suspicious
      if (count > 500) {
        lies.tooManyFonts = true;
        inconsistencies.push(`Unusually high font count: ${count}`);
      }
    }

    // Resistance detection analysis
    if (data.resistance) {
      const { totalDetections, privacyToolDetected, detections } =
        data.resistance;
      const benignSignals = detections
        ? Object.entries(detections).reduce(
            (sum, [key, value]) =>
              value && BENIGN_RESISTANCE_KEYS.has(key) ? sum + 1 : sum,
            0
          )
        : 0;
      const meaningfulSignals = Math.max(0, totalDetections - benignSignals);

      if (
        (privacyToolDetected && meaningfulSignals >= 4) ||
        meaningfulSignals >= 8
      ) {
        lies.privacyToolsDetected = true;
        inconsistencies.push(
          `Privacy tooling indicators detected (${meaningfulSignals} strong signals)`
        );
      }
    }

    // Count total lies
    const liesCount = Object.values(lies).filter((v) => v === true).length;

    // Calculate trust score (0-100, higher is more trustworthy)
    const triggeredWeight = Object.entries(lies).reduce(
      (sum, [flag, value]) =>
        value ? sum + (LIE_WEIGHTS[flag] ?? LIE_DEFAULT_WEIGHT) : sum,
      0
    );
    const unknownTriggered = Object.keys(lies).filter(
      (flag) => !(flag in LIE_WEIGHTS)
    ).length;
    const maxWeight = TOTAL_LIE_WEIGHT + unknownTriggered * LIE_DEFAULT_WEIGHT;
    const trustScore =
      maxWeight === 0
        ? 100
        : Math.max(0, Math.round(100 * (1 - triggeredWeight / maxWeight)));

    // Generate hash
    const dataString = JSON.stringify({
      lies,
      liesCount,
      trustScore,
      inconsistencies,
    });
    const hash = await hashString(dataString);

    return {
      hash,
      lies,
      liesCount,
      trustScore,
      inconsistencies,
    };
  } catch (error) {
    console.error('Lies detection failed:', error);
    return undefined;
  }
}

/**
 * Simple hash function for string data
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
