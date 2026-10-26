import type { FingerprintData } from '../types';
import { generateFingerprintId } from './hash';

/**
 * Version of the identity projection below.
 *
 * Bumping it changes every issued fingerprint ID, so it doubles as the cache
 * epoch for any consumer that stores an ID (see the SDK cache key).
 *
 * 1 - whole `FingerprintData` blob through 32-bit MurmurHash3
 * 2 - stable-component projection through SHA-256/128
 * 3 - also drops WebRTC candidates, viewport/zoom/colour-scheme media
 *     queries, host-page layout probes, page and permission state, and
 *     network-loaded voices; audio renders offline instead of hashing an
 *     empty buffer
 */
export const IDENTITY_SCHEMA_VERSION = 3;

/**
 * cssMedia queries that track the window or the time of day rather than the
 * device: `display-mode` flips with fullscreen and installed-app launches,
 * and `prefers-color-scheme` follows an OS that switches theme at sunset.
 */
const VOLATILE_MEDIA_QUERY = /^(prefers-color-scheme|display-mode):/;

function omitKeys<T extends object>(
  source: T,
  keys: ReadonlyArray<keyof T>
): Partial<T> {
  const clone: Partial<T> = { ...source };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}

/**
 * Reduce collected data to the components that identify a device.
 *
 * Everything dropped here is either derived from other components (so it adds
 * no entropy) or changes on the same device without the device changing, which
 * would hand the caller a different ID on the next page load.
 */
export function projectIdentityData(
  data: FingerprintData
): Record<string, unknown> {
  const projected: Record<string, unknown> = { ...data };

  // Pure functions of the other components. Beyond adding no entropy, both
  // encode window geometry, which flips when DevTools opens or the window is
  // resized. They stay in the response as diagnostics.
  delete projected.lies;
  delete projected.resistance;

  if (data.navigator) {
    // `connection.rtt`/`downlink` are live bandwidth estimates that move
    // between page loads; `onLine` flips with connectivity.
    projected.navigator = omitKeys(data.navigator, ['connection', 'onLine']);
  }

  if (data.screen) {
    // Changes on browser zoom and when a window moves between displays.
    projected.screen = omitKeys(data.screen, ['devicePixelRatio']);
  }

  if (data.timezone) {
    // Shifts twice a year under DST, which would re-identify every affected
    // device overnight. The IANA `timezone` name is kept and is stable.
    projected.timezone = omitKeys(data.timezone, ['timezoneOffset']);
  }

  if (data.canvas) {
    // The rendered PNG is returned for display but must not drive identity:
    // it is the raw artifact the hash already summarizes.
    projected.canvas = omitKeys(data.canvas, ['dataURL']);
  }

  // Both probes measure a div appended to the host page, so the numbers move
  // with scroll position, inherited page CSS and browser zoom. textMetrics
  // measures the same glyphs on a canvas, free of all three.
  delete projected.clientRects;
  if (data.domRect) {
    projected.domRect = omitKeys(data.domRect, ['hash', 'measurements']);
  }

  if (data.css) {
    // Computed styles inherit from the host page. The system-font keywords
    // reset every font property, so they reflect only the OS.
    projected.css = { systemFonts: data.css.systemFonts };
  }

  if (data.cssMedia) {
    // Resolution, orientation and width breakpoints are viewport geometry:
    // they move with zoom and window size. The hash summarizes them too, so
    // only the filtered preference and pointer queries remain.
    projected.cssMedia = {
      mediaQueryMatches: Object.fromEntries(
        Object.entries(data.cssMedia.mediaQueryMatches).filter(
          ([query]) => !VOLATILE_MEDIA_QUERY.test(query)
        )
      ),
    };
  }

  if (data.webrtc) {
    // ICE candidates carry random ports, ufrags, mDNS hostnames and the
    // current network's addresses: new on every load. Connection states and
    // `stunSupported` depend on how gathering went that time.
    projected.webrtc = omitKeys(data.webrtc, [
      'hash',
      'candidates',
      'connection',
      'iceServers',
    ]);
  }

  if (data.serviceWorker) {
    // Controller, registration and permission state describe the host site
    // and the visitor's grants, not the browser. Feature support is stable.
    projected.serviceWorker = {
      supported: data.serviceWorker.supported,
      features: data.serviceWorker.features,
    };
  }

  if (data.media) {
    // Counts and labels change once camera/mic permission is granted (the
    // list goes from one entry per kind to every device) and when hardware is
    // plugged in; `groupId` is a per-origin random value. Which kinds exist
    // survives all of that.
    const { audioInput, audioOutput, videoInput } = data.media.deviceCount;
    projected.media = {
      audioInput: audioInput > 0,
      audioOutput: audioOutput > 0,
      videoInput: videoInput > 0,
    };
  }

  if (data.voices) {
    // Network voices (Edge's online voices, Chrome's Google voices) are
    // missing whenever their fetch is slow or offline. Local ones are part of
    // the OS install; count and default are derived from the full list.
    projected.voices = data.voices.voices.filter((voice) => voice.localService);
  }

  return projected;
}

/**
 * Derive the fingerprint ID for a set of collected components.
 *
 * Both the browser and the API call this, so a client cannot report an ID the
 * server would not have computed itself.
 */
export async function computeFingerprintId(
  data: FingerprintData
): Promise<string> {
  return generateFingerprintId({
    version: IDENTITY_SCHEMA_VERSION,
    components: projectIdentityData(data),
  });
}
