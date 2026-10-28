import type { FingerprintResult } from '@creepjs/core';

/**
 * Copy of a scan result that is safe to keep in localStorage for the checker
 * history: drops the WebRTC addresses (local/public IPs) and the media device
 * labels and group IDs. Neither is part of the fingerprint ID, and both
 * identify the visitor's network or hardware beyond what a comparison needs.
 */
export function toStoredHistoryResult<T extends FingerprintResult>(
  result: T
): T {
  const { webrtc, media } = result.data;

  return {
    ...result,
    data: {
      ...result.data,
      ...(webrtc && {
        webrtc: {
          ...webrtc,
          candidates: { local: [], public: [], ipv4: [], ipv6: [] },
        },
      }),
      ...(media && {
        media: {
          ...media,
          devices: media.devices.map(({ kind }) => ({
            kind,
            label: '',
            groupId: '',
          })),
        },
      }),
    },
  };
}
