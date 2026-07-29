import { describe, it, expect } from 'vitest';
import {
  murmurHash3,
  base62Encode,
  base62EncodeBytes,
  canonicalize,
  generateFingerprintId,
} from '../src/utils/hash';

describe('Hash utilities', () => {
  describe('murmurHash3', () => {
    it('should generate consistent hashes', () => {
      const hash1 = murmurHash3('test');
      const hash2 = murmurHash3('test');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = murmurHash3('test1');
      const hash2 = murmurHash3('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should respect seed parameter', () => {
      const hash1 = murmurHash3('test', 0);
      const hash2 = murmurHash3('test', 1);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('base62Encode', () => {
    it('should encode 0 correctly', () => {
      expect(base62Encode(0)).toBe('0');
    });

    it('should encode positive numbers', () => {
      expect(base62Encode(1)).toBe('1');
      expect(base62Encode(61)).toBe('z');
      expect(base62Encode(62)).toBe('10');
    });

    it('should produce different strings for different numbers', () => {
      const encoded1 = base62Encode(12345);
      const encoded2 = base62Encode(67890);
      expect(encoded1).not.toBe(encoded2);
    });
  });

  describe('base62EncodeBytes', () => {
    it('should encode zero bytes as 0', () => {
      expect(base62EncodeBytes(new Uint8Array([0, 0]))).toBe('0');
    });

    it('should agree with base62Encode on small values', () => {
      expect(base62EncodeBytes(new Uint8Array([0, 62]))).toBe(base62Encode(62));
    });

    it('should preserve full width beyond Number.MAX_SAFE_INTEGER', () => {
      const a = new Uint8Array(16).fill(0xff);
      const b = new Uint8Array(16).fill(0xff);
      b[15] = 0xfe;
      expect(base62EncodeBytes(a)).not.toBe(base62EncodeBytes(b));
    });
  });

  describe('canonicalize', () => {
    it('should serialize the same object identically regardless of key order', () => {
      expect(canonicalize({ a: 1, b: 2 })).toBe(canonicalize({ b: 2, a: 1 }));
    });

    it('should treat an undefined member as an absent one', () => {
      expect(canonicalize({ a: 1, b: undefined })).toBe(canonicalize({ a: 1 }));
    });

    it('should distinguish null from absent', () => {
      expect(canonicalize({ a: 1, b: null })).not.toBe(canonicalize({ a: 1 }));
    });

    it('should preserve array order', () => {
      expect(canonicalize([1, 2])).not.toBe(canonicalize([2, 1]));
    });

    it('should survive a JSON round trip', () => {
      const value = { z: [3, { y: 'x' }], a: { nested: true } };
      expect(canonicalize(JSON.parse(JSON.stringify(value)))).toBe(
        canonicalize(value)
      );
    });

    it('should render non-finite numbers as null', () => {
      expect(canonicalize({ a: NaN })).toBe(canonicalize({ a: null }));
    });
  });

  describe('generateFingerprintId', () => {
    it('should generate consistent IDs for same data', async () => {
      const data = { test: 'value' };
      const id1 = await generateFingerprintId(data);
      const id2 = await generateFingerprintId(data);
      expect(id1).toBe(id2);
    });

    it('should generate different IDs for different data', async () => {
      const id1 = await generateFingerprintId({ test: 'value1' });
      const id2 = await generateFingerprintId({ test: 'value2' });
      expect(id1).not.toBe(id2);
    });

    it('should ignore key order so a decoded request body hashes identically', async () => {
      const id1 = await generateFingerprintId({ a: 1, b: 2 });
      const id2 = await generateFingerprintId({ b: 2, a: 1 });
      expect(id1).toBe(id2);
    });

    it('should handle complex objects', async () => {
      const data = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
      };
      const id = await generateFingerprintId(data);
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should carry more than 32 bits of digest', async () => {
      // A 32-bit ID is at most 6 base62 chars; 128 bits reaches 22.
      const id = await generateFingerprintId({ test: 'width' });
      expect(id.length).toBeGreaterThan(16);
      expect(id.length).toBeLessThanOrEqual(22);
    });
  });
});
