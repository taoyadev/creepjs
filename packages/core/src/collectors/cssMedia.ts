import type { CSSMediaFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect CSS Media fingerprint
 * Tests CSS media queries and system preferences
 */
export function collectCSSMediaFingerprint(): CSSMediaFingerprint | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    // Media queries to test
    const mediaQueries = [
      'prefers-color-scheme: dark',
      'prefers-color-scheme: light',
      'prefers-reduced-motion: reduce',
      'prefers-reduced-motion: no-preference',
      'prefers-contrast: more',
      'prefers-contrast: less',
      'prefers-contrast: no-preference',
      'prefers-reduced-transparency: reduce',
      'prefers-reduced-transparency: no-preference',
      'inverted-colors: inverted',
      'inverted-colors: none',
      'forced-colors: active',
      'forced-colors: none',
      'any-hover: hover',
      'any-hover: none',
      'hover: hover',
      'hover: none',
      'any-pointer: fine',
      'any-pointer: coarse',
      'any-pointer: none',
      'pointer: fine',
      'pointer: coarse',
      'pointer: none',
      'display-mode: fullscreen',
      'display-mode: standalone',
      'display-mode: minimal-ui',
      'display-mode: browser',
    ];

    const matches: Record<string, boolean> = {};
    mediaQueries.forEach((query) => {
      matches[query] = window.matchMedia(`(${query})`).matches;
    });

    // Get device pixel ratio ranges
    const pixelRatios = [1, 1.5, 2, 2.5, 3];
    const pixelRatioMatches: Record<string, boolean> = {};
    pixelRatios.forEach((ratio) => {
      pixelRatioMatches[`min-resolution: ${ratio}dppx`] = window.matchMedia(
        `(min-resolution: ${ratio}dppx)`
      ).matches;
    });

    // Get orientation
    const orientation = {
      portrait: window.matchMedia('(orientation: portrait)').matches,
      landscape: window.matchMedia('(orientation: landscape)').matches,
    };

    // Screen size ranges
    const screenSizes = {
      'max-width: 640px': window.matchMedia('(max-width: 640px)').matches,
      'max-width: 768px': window.matchMedia('(max-width: 768px)').matches,
      'max-width: 1024px': window.matchMedia('(max-width: 1024px)').matches,
      'max-width: 1280px': window.matchMedia('(max-width: 1280px)').matches,
      'min-width: 1920px': window.matchMedia('(min-width: 1920px)').matches,
    };

    const data = {
      matches,
      pixelRatioMatches,
      orientation,
      screenSizes,
    };

    const hash = murmurHash3(JSON.stringify(data));

    return {
      hash: String(hash),
      mediaQueryMatches: matches,
      pixelRatioMatches,
      orientation,
      screenSizeMatches: screenSizes,
    };
  } catch (error) {
    console.error('CSS Media fingerprinting error:', error);
    return undefined;
  }
}
