import { describe, it, expect } from 'vitest';
import { CreepJS } from '../src/index';

describe('CreepJS SDK', () => {
  it('should export CreepJS class', () => {
    expect(CreepJS).toBeDefined();
    expect(typeof CreepJS).toBe('function');
  });

  it('should create instance with default config', () => {
    const instance = new CreepJS({
      token: 'test-token',
    });
    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(CreepJS);
  });

  it('should have getFingerprint method', () => {
    const instance = new CreepJS({
      token: 'test-token',
    });
    expect(instance.getFingerprint).toBeDefined();
    expect(typeof instance.getFingerprint).toBe('function');
  });

  it('should have clearCache method', () => {
    const instance = new CreepJS({
      token: 'test-token',
    });
    expect(instance.clearCache).toBeDefined();
    expect(typeof instance.clearCache).toBe('function');
  });
});
