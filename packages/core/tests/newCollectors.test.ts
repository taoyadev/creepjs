import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { collectDomBlockersFingerprint } from '../src/collectors/domBlockers';
import { collectFontPreferencesFingerprint } from '../src/collectors/fontPreferences';
import { collectColorGamutFingerprint } from '../src/collectors/colorGamut';
import { collectContrastPreference } from '../src/collectors/contrast';
import { collectForcedColorsFingerprint } from '../src/collectors/forcedColors';
import { collectReducedMotionPreference } from '../src/collectors/reducedMotion';
import { collectReducedTransparencyPreference } from '../src/collectors/reducedTransparency';
import { collectHDRStatus } from '../src/collectors/hdr';
import { collectAudioBaseLatencyFingerprint } from '../src/collectors/audioBaseLatency';
import { collectApplePayFingerprint } from '../src/collectors/applePay';

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes('srgb') || query.includes('no-preference') || query.includes('standard'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as any;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('new collectors', () => {
  it('collectDomBlockersFingerprint returns structure', () => {
    const result = collectDomBlockersFingerprint();
    expect(result).toBeDefined();
    expect(Array.isArray(result?.detected)).toBe(true);
  });

  it('collectFontPreferencesFingerprint captures families', () => {
    const result = collectFontPreferencesFingerprint();
    expect(result).toBeDefined();
  });

  it('matchMedia collectors return expected defaults', () => {
    expect(collectColorGamutFingerprint()).toBe('srgb');
    expect(collectContrastPreference()).toBe('no-preference');
    expect(collectForcedColorsFingerprint()).toEqual({ active: false });
    expect(collectReducedMotionPreference()).toBe('no-preference');
    expect(collectReducedTransparencyPreference()).toBe('no-preference');
    expect(collectHDRStatus()).toBe('standard');
  });

  it('collectAudioBaseLatencyFingerprint returns undefined without AudioContext', async () => {
    expect(await collectAudioBaseLatencyFingerprint()).toBeUndefined();
  });

  it('collectApplePayFingerprint reports unsupported when API missing', async () => {
    const fingerprint = await collectApplePayFingerprint();
    expect(fingerprint).toEqual({ isSupported: false });
  });
});
