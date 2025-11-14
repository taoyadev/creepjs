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
import { collectPlugins } from '../src/collectors/plugins';
import { collectColorDepth } from '../src/collectors/colorDepth';
import { collectScreenResolution } from '../src/collectors/screenResolution';
import { collectScreenFrameFingerprint } from '../src/collectors/screenFrame';
import { collectTouchSupport } from '../src/collectors/touchSupport';
import { collectLanguages } from '../src/collectors/languages';
import { collectCookiesEnabled } from '../src/collectors/cookiesEnabled';
import { collectSessionStorageSupport } from '../src/collectors/sessionStorage';
import { collectLocalStorageSupport } from '../src/collectors/localStorage';
import { collectDateTimeLocale } from '../src/collectors/dateTimeLocale';
import { collectPrivateClickMeasurement } from '../src/collectors/privateClickMeasurement';

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  window.matchMedia = vi.fn((query: string) => ({
    matches:
      query.includes('srgb') ||
      query.includes('no-preference') ||
      query.includes('standard'),
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

  it('screen collectors expose baseline metrics', async () => {
    expect(typeof collectColorDepth()).toBe('number');
    const resolution = collectScreenResolution();
    expect(resolution).toBeDefined();
    expect(resolution).toHaveLength(2);
    const frame = await collectScreenFrameFingerprint();
    expect(frame).toBeDefined();
    expect(frame?.left).not.toBeUndefined();
  });

  it('navigator parity collectors return structured data', () => {
    expect(collectLanguages()).toBeDefined();
    expect(typeof collectCookiesEnabled()).toBe('boolean');
    expect(collectSessionStorageSupport()).toBeTypeOf('boolean');
    expect(collectLocalStorageSupport()).toBeTypeOf('boolean');
    expect(collectTouchSupport()).toMatchObject({
      maxTouchPoints: expect.any(Number),
      touchEvent: expect.any(Boolean),
    });
    expect(typeof collectDateTimeLocale()).toBe('string');
  });

  it('collectPlugins enumerates plugin metadata when available', () => {
    const originalNavigator = window.navigator;
    const fakeMimeType = {
      type: 'application/test',
      suffixes: 'test',
    } as MimeType;

    const fakePlugin = {
      name: 'TestPlugin',
      description: 'Example plugin',
      length: 1,
      0: fakeMimeType,
      item(index: number) {
        return index === 0 ? fakeMimeType : null;
      },
      namedItem() {
        return null;
      },
    } as unknown as Plugin;

    const fakePluginArray = {
      0: fakePlugin,
      length: 1,
      item(index: number) {
        return index === 0 ? fakePlugin : null;
      },
      namedItem() {
        return null;
      },
    } as unknown as PluginArray;

    const navigatorGetter = vi.spyOn(window, 'navigator', 'get');
    navigatorGetter.mockReturnValue({
      ...originalNavigator,
      plugins: fakePluginArray,
    });

    const plugins = collectPlugins();
    expect(plugins).toEqual([
      {
        name: 'TestPlugin',
        description: 'Example plugin',
        mimeTypes: [{ type: 'application/test', suffixes: 'test' }],
      },
    ]);

    navigatorGetter.mockRestore();
  });

  it('collectCookiesEnabled falls back to document cookie write', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      window.navigator,
      'cookieEnabled'
    );
    Object.defineProperty(window.navigator, 'cookieEnabled', {
      configurable: true,
      get: () => undefined,
    });

    document.cookie = '';
    const enabled = collectCookiesEnabled();
    expect(enabled).toBe(true);

    if (descriptor) {
      Object.defineProperty(window.navigator, 'cookieEnabled', descriptor);
    }
  });

  it('collectPrivateClickMeasurement safely returns undefined when unsupported', () => {
    expect(collectPrivateClickMeasurement()).toBeUndefined();
  });
});
