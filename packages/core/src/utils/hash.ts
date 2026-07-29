/**
 * MurmurHash3 32-bit implementation
 * Based on: https://github.com/garycourt/murmurhash-js
 */
export function murmurHash3(key: string, seed: number = 0): number {
  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  let h1 = seed;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let i = 0;

  while (i < bytes) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 =
      ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    const h1b =
      ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  let k1 = 0;

  // Handle remainder bytes
  if (remainder >= 3) {
    k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
  }
  if (remainder >= 2) {
    k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
  }
  if (remainder >= 1) {
    k1 ^= key.charCodeAt(i) & 0xff;
    k1 =
      ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 =
    ((h1 & 0xffff) * 0x85ebca6b +
      ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 13;
  h1 =
    ((h1 & 0xffff) * 0xc2b2ae35 +
      ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

/**
 * Base62 encoding for compact fingerprint IDs
 */
const BASE62_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function base62Encode(num: number): string {
  if (num === 0) return '0';

  let result = '';
  let n = num;

  while (n > 0) {
    result = BASE62_CHARS[n % 62] + result;
    n = Math.floor(n / 62);
  }

  return result;
}

/**
 * Base62 encoding for arbitrary-width digests (base62Encode only covers values
 * that fit in a JS number, which caps out well below a 128-bit identifier).
 */
export function base62EncodeBytes(bytes: Uint8Array): string {
  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) | BigInt(byte);
  }

  if (value === 0n) return '0';

  let result = '';
  while (value > 0n) {
    result = BASE62_CHARS[Number(value % 62n)] + result;
    value /= 62n;
  }

  return result;
}

/**
 * Deterministic serialization for hashing.
 *
 * `JSON.stringify` preserves insertion order, so the same components serialize
 * differently depending on who built the object. That is fine while only the
 * collector builds it, but the API has to re-derive the same string from a
 * decoded request body. Keys are sorted, and `undefined` members are dropped so
 * a locally-absent collector hashes identically to one that never survived JSON
 * transport.
 */
export function canonicalize(value: unknown): string {
  if (value === null) return 'null';

  const type = typeof value;

  if (type === 'string' || type === 'boolean') return JSON.stringify(value);
  if (type === 'number') {
    return Number.isFinite(value as number) ? JSON.stringify(value) : 'null';
  }
  if (type === 'bigint') return JSON.stringify((value as bigint).toString());
  if (type !== 'object') return 'null';

  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort();

  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(',')}}`;
}

/** Bytes of SHA-256 output kept in a fingerprint ID (128 bits). */
export const FINGERPRINT_ID_BYTES = 16;

/**
 * Generate a fingerprint ID from data.
 *
 * Uses SHA-256 truncated to 128 bits. A 32-bit hash collides for ~50% of
 * populations near 77k devices, which is inside the range this service targets,
 * and a non-cryptographic hash also lets a caller construct a collision on
 * purpose to impersonate another device.
 */
export async function generateFingerprintId(data: unknown): Promise<string> {
  const encoded = new TextEncoder().encode(canonicalize(data));
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return base62EncodeBytes(
    new Uint8Array(digest).slice(0, FINGERPRINT_ID_BYTES)
  );
}
