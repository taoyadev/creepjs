import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CollectorSummary } from '../src/types';

const { mockRunSources, mockCollectLiesFingerprint, mockComputeFingerprintId } =
  vi.hoisted(() => ({
    mockRunSources: vi.fn(),
    mockCollectLiesFingerprint: vi.fn(),
    mockComputeFingerprintId: vi.fn(),
  }));

vi.mock('../src/sources/types', () => ({
  runSources: mockRunSources,
}));

vi.mock('../src/collectors/lies', () => ({
  collectLiesFingerprint: mockCollectLiesFingerprint,
}));

vi.mock('../src/utils/identity', () => ({
  computeFingerprintId: mockComputeFingerprintId,
}));

import { collectFingerprint } from '../src/index';

afterEach(() => {
  vi.restoreAllMocks();
  mockRunSources.mockReset();
  mockCollectLiesFingerprint.mockReset();
  mockComputeFingerprintId.mockReset();
});

describe('collectFingerprint', () => {
  it('aggregates source collectors, lies, coverage, and timings into the final result', async () => {
    mockRunSources.mockResolvedValue({
      canvas: {
        status: 'success',
        value: { hash: 'canvas-hash', dataURL: 'data:,' },
        duration: 12,
      },
      webgl: {
        status: 'success',
        value: {
          renderer: 'ANGLE',
          vendor: 'WebKit',
          version: 'WebGL 1.0',
          shadingLanguageVersion: 'GLSL 1.0',
        },
        duration: 8,
      },
      timezone: {
        status: 'error',
        error: 'blocked',
        duration: 4,
      },
      audio: {
        status: 'skipped',
        duration: 2,
      },
    } satisfies Record<string, CollectorSummary>);
    mockCollectLiesFingerprint.mockResolvedValue({
      hash: 'lies-hash',
      liesCount: 0,
      trustScore: 100,
      inconsistencies: [],
    });
    mockComputeFingerprintId.mockResolvedValue('fp_test_id');

    const result = await collectFingerprint({
      idleDelay: 0,
      concurrency: 1,
    });

    expect(mockRunSources).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        idleDelay: 0,
        concurrency: 1,
        onProgress: undefined,
      })
    );
    expect(mockCollectLiesFingerprint).toHaveBeenCalledWith(
      expect.objectContaining({
        canvas: { hash: 'canvas-hash', dataURL: 'data:,' },
        webgl: expect.objectContaining({ renderer: 'ANGLE' }),
      })
    );
    expect(result.fingerprintId).toBe('fp_test_id');
    expect(result.collectors.lies!.status).toBe('success');
    expect(result.coverage).toMatchObject({
      successful: 3,
      failed: 1,
      skipped: 1,
      ratio: 0.75,
    });
    expect(result.data.lies).toMatchObject({
      hash: 'lies-hash',
      trustScore: 100,
    });
    expect(result.timings.canvas).toBe(12);
    expect(result.timings.total).toBeTypeOf('number');
  });

  it('omits lies data when the lies collector is skipped', async () => {
    mockRunSources.mockResolvedValue({
      canvas: {
        status: 'success',
        value: { hash: 'canvas-hash', dataURL: 'data:,' },
        duration: 5,
      },
    } satisfies Record<string, CollectorSummary>);
    mockCollectLiesFingerprint.mockResolvedValue(undefined);
    mockComputeFingerprintId.mockResolvedValue('fp_skipped_lies');

    const result = await collectFingerprint({ idleDelay: 0, concurrency: 1 });

    expect(result.collectors.lies!.status).toBe('skipped');
    expect(result.data.lies).toBeUndefined();
    expect(result.coverage.successful).toBe(1);
    expect(result.coverage.skipped).toBe(1);
  });
});
