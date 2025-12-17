import type { AudioBaseLatencyFingerprint } from '../types';

export async function collectAudioBaseLatencyFingerprint(): Promise<
  AudioBaseLatencyFingerprint | undefined
> {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const AudioContextClass =
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return undefined;
  }

  const context = new AudioContextClass();
  try {
    const fingerprint: AudioBaseLatencyFingerprint = {
      supported: true,
      baseLatency: (context as AudioContext & { baseLatency?: number })
        .baseLatency,
      // `outputLatency` is experimental and not on the standard AudioContext type
      outputLatency: (context as AudioContext & { outputLatency?: number })
        .outputLatency,
      sampleRate: context.sampleRate,
    };

    await context.close();
    return fingerprint;
  } catch (error) {
    await context.close().catch(() => undefined);
    throw error;
  }
}
