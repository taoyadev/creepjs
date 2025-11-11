import { describe, it, expect } from 'vitest';
import {
  murmurHash3,
  base62Encode,
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

  describe('generateFingerprintId', () => {
    it('should generate consistent IDs for same data', () => {
      const data = { test: 'value' };
      const id1 = generateFingerprintId(data);
      const id2 = generateFingerprintId(data);
      expect(id1).toBe(id2);
    });

    it('should generate different IDs for different data', () => {
      const id1 = generateFingerprintId({ test: 'value1' });
      const id2 = generateFingerprintId({ test: 'value2' });
      expect(id1).not.toBe(id2);
    });

    it('should handle complex objects', () => {
      const data = {
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
      };
      const id = generateFingerprintId(data);
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
