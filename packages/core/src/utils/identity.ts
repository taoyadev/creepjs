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
 */
export const IDENTITY_SCHEMA_VERSION = 2;

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

  if (data.audio) {
    // `suspended` vs `running` depends on autoplay policy and on how quickly
    // the context resumed, not on the device.
    projected.audio = omitKeys(data.audio, ['state']);
  }

  if (data.canvas) {
    // The rendered PNG is returned for display but must not drive identity:
    // it is the raw artifact the hash already summarizes.
    projected.canvas = omitKeys(data.canvas, ['dataURL']);
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
