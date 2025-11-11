/**
 * Lies Detection System
 * Analyzes fingerprint data for inconsistencies and potential spoofing
 */

import type { FingerprintData, LiesFingerprint } from '../types';

/**
 * Collect lies detection data by analyzing other fingerprint data for inconsistencies
 */
export async function collectLiesFingerprint(data: FingerprintData): Promise<LiesFingerprint | undefined> {
  try {
    const lies: Record<string, boolean> = {};
    const inconsistencies: string[] = [];

    // Screen vs Window dimensions
    if (data.screen) {
      const { width, height, availWidth, availHeight, devicePixelRatio } = data.screen;

      if (width === 0 || height === 0) {
        lies.screenDimensionsZero = true;
        inconsistencies.push('Screen dimensions are zero (possible headless browser)');
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

        if (window.outerWidth < window.innerWidth || window.outerHeight < window.innerHeight) {
          lies.outerSmallerThanInner = true;
          inconsistencies.push('Outer window size is smaller than inner (impossible)');
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
      const { userAgent, platform, languages, maxTouchPoints, hardwareConcurrency } = data.navigator;

      // User-Agent vs Platform mismatch
      const ua = userAgent.toLowerCase();
      const plat = platform.toLowerCase();

      if ((ua.includes('win') && !plat.includes('win')) ||
          (ua.includes('mac') && !plat.includes('mac')) ||
          (ua.includes('linux') && !plat.includes('linux'))) {
        lies.userAgentPlatformMismatch = true;
        inconsistencies.push(`User-Agent (${platform}) doesn't match Platform (${platform})`);
      }

      // Mobile UA without touch support
      if ((ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) && maxTouchPoints === 0) {
        lies.mobileWithoutTouch = true;
        inconsistencies.push('Mobile User-Agent but no touch support');
      }

      // Empty languages array
      if (!languages || languages.length === 0) {
        lies.emptyLanguages = true;
        inconsistencies.push('Navigator languages array is empty');
      }

      // Suspicious hardware concurrency
      if (hardwareConcurrency === 0 || hardwareConcurrency === 1 || hardwareConcurrency > 128) {
        lies.suspiciousHardwareConcurrency = true;
        inconsistencies.push(`Unusual hardware concurrency: ${hardwareConcurrency}`);
      }

      // Missing plugins/mimeTypes on non-mobile
      if (!ua.includes('mobile') && !ua.includes('android') && !ua.includes('iphone')) {
        if (data.navigator.pluginsLength === 0) {
          lies.missingPlugins = true;
          inconsistencies.push('Desktop browser with no plugins (unusual)');
        }
      }
    }

    // WebGL consistency
    if (data.webgl) {
      const { vendor, renderer, unmaskedVendor, unmaskedRenderer } = data.webgl;

      // Check for generic/suspicious values
      if (vendor === 'Google Inc.' && renderer === 'ANGLE') {
        lies.genericWebGL = true;
        inconsistencies.push('Generic WebGL vendor/renderer (possible spoofing)');
      }

      // Check if unmasked values differ significantly
      if (unmaskedVendor && unmaskedRenderer) {
        if (!unmaskedVendor.includes(vendor) && !vendor.includes('Google')) {
          lies.webglVendorMismatch = true;
          inconsistencies.push('WebGL vendor mismatch between masked and unmasked');
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
      if (Math.abs(timezoneOffset) > 840) { // Max is UTC+14 (840 minutes)
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
        inconsistencies.push('Canvas appears to be blocked (data URL too short)');
      }
    }

    // Audio consistency
    if (data.audio) {
      const { sampleRate } = data.audio;

      // Check for unusual sample rates
      if (sampleRate !== 44100 && sampleRate !== 48000 && sampleRate !== 96000) {
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
      if (!ua.includes('mobile') && deviceCount.audioInput === 0 && deviceCount.videoInput === 0) {
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
      const { totalDetections, privacyToolDetected } = data.resistance;

      if (privacyToolDetected || totalDetections > 3) {
        lies.privacyToolsDetected = true;
        inconsistencies.push(`Privacy tools or anti-fingerprinting detected (${totalDetections} signals)`);
      }
    }

    // Count total lies
    const liesCount = Object.values(lies).filter(v => v === true).length;

    // Calculate trust score (0-100, higher is more trustworthy)
    const maxPossibleLies = 25; // Approximate max number of lie types we check
    const trustScore = Math.max(0, Math.round(100 * (1 - liesCount / maxPossibleLies)));

    // Generate hash
    const dataString = JSON.stringify({ lies, liesCount, trustScore, inconsistencies });
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
