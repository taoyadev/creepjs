import type { ResistanceFingerprint } from '../types';

/**
 * Collect Resistance Detection fingerprint
 * Detects anti-fingerprinting tools and browser modifications
 */
export function collectResistanceFingerprint():
  | ResistanceFingerprint
  | undefined {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return undefined;
  }

  try {
    const detections: Record<string, boolean> = {};

    // Check for common privacy extensions
    // Brave browser detection
    const nav = navigator as typeof navigator & {
      brave?: { isBrave?: () => Promise<boolean> };
    };
    detections.brave =
      'brave' in nav && typeof nav.brave?.isBrave === 'function';

    // Check for webdriver (automation tools)
    detections.webdriver = navigator.webdriver === true;

    // Enhanced headless browser detection
    detections.headlessChrome = false;
    detections.headlessUserAgent = false;
    detections.chromeHeadless = false;
    detections.puppeteerDetected = false;
    detections.playwrightDetected = false;
    detections.seleniumDetected = false;
    detections.phantomJSDetected = false;

    // Check User-Agent for headless indicators
    const ua = navigator.userAgent;
    if (ua.includes('HeadlessChrome') || ua.includes('Headless')) {
      detections.headlessUserAgent = true;
      detections.headlessChrome = true;
    }

    // Check for Chrome headless mode
    const winNav = window.navigator as typeof navigator & {
      chrome?: { runtime?: unknown };
      connection?: { rtt?: number };
    };

    if (winNav.chrome && !winNav.chrome.runtime) {
      detections.chromeHeadless = true;
    }

    // Check for automation frameworks
    const win = window as typeof window & {
      callPhantom?: unknown;
      _phantom?: unknown;
      __nightmare?: unknown;
      _selenium?: unknown;
      webdriver?: unknown;
      domAutomation?: unknown;
      domAutomationController?: unknown;
      document?: typeof document & {
        $cdc_asdjflasutopfhvcZLmcfl_?: unknown;
        $chrome_asyncScriptInfo?: unknown;
        __webdriver_evaluate?: unknown;
        __selenium_evaluate?: unknown;
        __webdriver_script_function?: unknown;
        __webdriver_script_func?: unknown;
        __webdriver_script_fn?: unknown;
        __fxdriver_evaluate?: unknown;
        __driver_unwrapped?: unknown;
        __webdriver_unwrapped?: unknown;
        __driver_evaluate?: unknown;
        __selenium_unwrapped?: unknown;
        __fxdriver_unwrapped?: unknown;
      };
    };

    // Puppeteer detection
    if (
      win.document?.$cdc_asdjflasutopfhvcZLmcfl_ ||
      win.document?.$chrome_asyncScriptInfo
    ) {
      detections.puppeteerDetected = true;
    }

    // Selenium detection
    if (
      win.document?.__webdriver_evaluate ||
      win.document?.__selenium_evaluate ||
      win.document?.__webdriver_script_function ||
      win.document?.__webdriver_script_func ||
      win.document?.__webdriver_script_fn ||
      win.document?.__fxdriver_evaluate ||
      win.document?.__driver_unwrapped ||
      win.document?.__webdriver_unwrapped ||
      win.document?.__driver_evaluate ||
      win.document?.__selenium_unwrapped ||
      win.document?.__fxdriver_unwrapped ||
      win._selenium ||
      win.domAutomation ||
      win.domAutomationController
    ) {
      detections.seleniumDetected = true;
    }

    // PhantomJS detection
    if (win.callPhantom || win._phantom || win.__nightmare) {
      detections.phantomJSDetected = true;
    }

    // Aggregate headless detection
    detections.headless =
      detections.webdriver ||
      detections.headlessChrome ||
      detections.headlessUserAgent ||
      detections.chromeHeadless ||
      detections.puppeteerDetected ||
      detections.playwrightDetected ||
      detections.seleniumDetected ||
      detections.phantomJSDetected;

    // Check for missing properties that should exist
    detections.missingPlugins = navigator.plugins.length === 0;
    detections.missingMimeTypes = (navigator.mimeTypes?.length || 0) === 0;

    // Check for canvas fingerprint blocking
    detections.canvasBlocked = false;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillText('test', 0, 0);
        const data = canvas.toDataURL();
        detections.canvasBlocked = data.length < 100;
      }
    } catch (_canvasError) {
      void _canvasError;
      detections.canvasBlocked = true;
    }

    // Check for WebGL fingerprint blocking
    detections.webglBlocked = false;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        detections.webglBlocked = true;
      } else {
        const typedGl = gl as WebGLRenderingContext;
        const debugInfo = typedGl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = typedGl.getParameter(
            debugInfo.UNMASKED_VENDOR_WEBGL
          ) as string | null;
          const renderer = typedGl.getParameter(
            debugInfo.UNMASKED_RENDERER_WEBGL
          ) as string | null;
          detections.webglBlocked =
            !vendor ||
            !renderer ||
            vendor === 'Google Inc.' ||
            renderer === 'ANGLE';
        }
      }
    } catch (_webglError) {
      void _webglError;
      detections.webglBlocked = true;
    }

    // Check for font enumeration blocking
    detections.fontsBlocked = false;

    // Check for timezone spoofing
    detections.timezoneSpoofed = false;
    try {
      const d = new Date();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = d.getTimezoneOffset();
      // Basic check - if timezone is UTC but offset isn't 0
      if (timezone === 'UTC' && offset !== 0) {
        detections.timezoneSpoofed = true;
      }
    } catch (_timezoneError) {
      void _timezoneError;
      // Ignore
    }

    // Check for screen dimension inconsistencies
    detections.screenInconsistent = false;
    if (screen.width === 0 || screen.height === 0) {
      detections.screenInconsistent = true;
    }

    // Check for navigator properties inconsistencies
    detections.navigatorInconsistent = false;
    if (navigator.language === '' || navigator.platform === '') {
      detections.navigatorInconsistent = true;
    }

    // Check for empty languages array (common in headless)
    detections.emptyLanguages = false;
    if (!navigator.languages || navigator.languages.length === 0) {
      detections.emptyLanguages = true;
    }

    // Check for connection rtt = 0 (common in headless)
    detections.connectionRttZero = false;
    const navConnection = navigator as typeof navigator & {
      connection?: { rtt?: number; effectiveType?: string };
    };
    if (navConnection.connection?.rtt === 0) {
      detections.connectionRttZero = true;
    }

    // Check for window size inconsistencies (headless often has 0 or unusual values)
    detections.windowSizeInconsistent = false;
    if (
      window.outerWidth === 0 ||
      window.outerHeight === 0 ||
      window.outerWidth < window.innerWidth ||
      window.outerHeight < window.innerHeight
    ) {
      detections.windowSizeInconsistent = true;
    }

    // Check for missing notification API (some headless browsers)
    detections.notificationMissing = false;
    if (!('Notification' in window)) {
      detections.notificationMissing = true;
    }

    // Check for permissions API inconsistencies
    detections.permissionsInconsistent = false;
    if ('permissions' in navigator) {
      const perms = (
        navigator as typeof navigator & {
          permissions?: {
            query?: (descriptor: {
              name: string;
            }) => Promise<{ state: string }>;
          };
        }
      ).permissions;

      if (!perms || typeof perms.query !== 'function') {
        detections.permissionsInconsistent = true;
      }
    }

    // Check for DeviceOrientation/Motion events (often missing in headless)
    detections.deviceEventsBlocked = false;
    if (!('ondeviceorientation' in window) && !('ondevicemotion' in window)) {
      detections.deviceEventsBlocked = true;
    }

    // Check for Battery API (usually missing in headless)
    detections.batteryMissing = false;
    const navBattery = navigator as typeof navigator & {
      getBattery?: () => Promise<unknown>;
    };
    if (!navBattery.getBattery) {
      detections.batteryMissing = true;
    }

    // Check for inconsistent hardware concurrency
    detections.hardwareConcurrencyInconsistent = false;
    if (
      navigator.hardwareConcurrency === 0 ||
      navigator.hardwareConcurrency === 1
    ) {
      detections.hardwareConcurrencyInconsistent = true;
    }

    // Check for User-Agent and Platform mismatch
    detections.userAgentPlatformMismatch = false;
    const uaLower = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (
      (uaLower.includes('win') && !platform.includes('win')) ||
      (uaLower.includes('mac') && !platform.includes('mac')) ||
      (uaLower.includes('linux') && !platform.includes('linux'))
    ) {
      detections.userAgentPlatformMismatch = true;
    }

    // Check for missing touch support on mobile UA
    detections.touchSupportInconsistent = false;
    if (
      (uaLower.includes('mobile') ||
        uaLower.includes('android') ||
        uaLower.includes('iphone')) &&
      navigator.maxTouchPoints === 0
    ) {
      detections.touchSupportInconsistent = true;
    }

    // Check for iframe detection (automation often uses iframes)
    detections.iframeDetected = false;
    try {
      if (window.self !== window.top) {
        detections.iframeDetected = true;
      }
    } catch (_frameError) {
      void _frameError;
      // Cross-origin iframe - can't access window.top
    }

    // Count total detections
    const totalDetections = Object.values(detections).filter(
      (v) => v === true
    ).length;

    return {
      detections,
      totalDetections,
      privacyToolDetected: totalDetections > 2,
    };
  } catch (error) {
    console.error('Resistance fingerprinting error:', error);
    return undefined;
  }
}
