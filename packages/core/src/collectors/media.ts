import type { MediaDevicesFingerprint } from '../types';

/**
 * Collect Media Devices fingerprint
 */
export async function collectMediaDevicesFingerprint(): Promise<
  MediaDevicesFingerprint | undefined
> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return undefined;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return {
      deviceCount: {
        audioInput: devices.filter((d) => d.kind === 'audioinput').length,
        audioOutput: devices.filter((d) => d.kind === 'audiooutput').length,
        videoInput: devices.filter((d) => d.kind === 'videoinput').length,
      },
      devices: devices.map((d) => ({
        kind: d.kind,
        label: d.label || '(no label)',
        groupId: d.groupId,
      })),
    };
  } catch (error) {
    console.error('Media devices fingerprinting error:', error);
    return undefined;
  }
}
