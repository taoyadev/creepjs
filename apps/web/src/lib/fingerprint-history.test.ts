import type { FingerprintResult } from '@creepjs/core';
import { describe, expect, it } from 'vitest';
import { toStoredHistoryResult } from './fingerprint-history';

const result = {
  fingerprintId: 'abc',
  timestamp: 1,
  confidence: 1,
  data: {
    webrtc: {
      hash: 'h',
      supported: true,
      candidates: {
        local: ['192.168.1.20'],
        public: ['203.0.113.7'],
        ipv4: ['192.168.1.20', '203.0.113.7'],
        ipv6: ['2001:db8::1'],
      },
    },
    media: {
      deviceCount: { audioInput: 1, audioOutput: 0, videoInput: 1 },
      devices: [
        { kind: 'videoinput', label: 'FaceTime HD Camera', groupId: 'g-1' },
      ],
    },
    timezone: { timezone: 'UTC' },
  },
} as unknown as FingerprintResult;

describe('toStoredHistoryResult', () => {
  it('drops WebRTC addresses and device labels but keeps the rest', () => {
    const stored = toStoredHistoryResult(result);
    const json = JSON.stringify(stored);

    for (const secret of [
      '192.168.1.20',
      '203.0.113.7',
      '2001:db8::1',
      'FaceTime',
      'g-1',
    ]) {
      expect(json).not.toContain(secret);
    }
    expect(stored.data.media?.deviceCount.videoInput).toBe(1);
    expect(stored.data.media?.devices).toEqual([
      { kind: 'videoinput', label: '', groupId: '' },
    ]);
    expect(stored.data.webrtc?.hash).toBe('h');
    expect(stored.data).toHaveProperty('timezone', { timezone: 'UTC' });
    expect(result.data.webrtc?.candidates.public).toEqual(['203.0.113.7']);
  });

  it('leaves a result without those collectors unchanged', () => {
    const bare = { ...result, data: {} } as FingerprintResult;
    expect(toStoredHistoryResult(bare)).toEqual(bare);
  });
});
