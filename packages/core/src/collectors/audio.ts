import type { AudioFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';
import { withTimeout } from '../utils/async';

const SAMPLE_RATE = 44100;
const RENDER_FRAMES = 5000;
/** Summed tail of the render; the compressor has settled by this frame. */
const SUM_FROM_FRAME = 4500;
/** Safari can suspend offline rendering in a background tab. */
const RENDER_TIMEOUT_MS = 1000;

type OfflineAudioContextCtor = new (
  numberOfChannels: number,
  length: number,
  sampleRate: number
) => OfflineAudioContext;

function getOfflineAudioContext(): OfflineAudioContextCtor | undefined {
  const scope = window as typeof window & {
    webkitOfflineAudioContext?: OfflineAudioContextCtor;
  };
  return scope.OfflineAudioContext ?? scope.webkitOfflineAudioContext;
}

function render(context: OfflineAudioContext): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    // Older Safari returns undefined from startRendering and only fires
    // `complete`; current engines do both.
    context.oncomplete = (event) => resolve(event.renderedBuffer);
    const rendering: Promise<AudioBuffer> | undefined =
      context.startRendering();
    rendering?.then(resolve, reject);
  });
}

/**
 * Collect an audio-stack fingerprint.
 *
 * Renders a compressed triangle wave offline and sums the tail of the output.
 * Oscillator and DynamicsCompressor DSP differs across engines, OS audio
 * libraries and CPU float paths, so the sum does too. An offline context needs
 * no user gesture and plays nothing; a realtime one stays suspended under
 * autoplay policy and produced nothing to measure.
 */
export async function collectAudioFingerprint(): Promise<
  AudioFingerprint | undefined
> {
  if (typeof window === 'undefined') return undefined;

  const OfflineContext = getOfflineAudioContext();
  if (!OfflineContext) return undefined;

  try {
    const context = new OfflineContext(1, RENDER_FRAMES, SAMPLE_RATE);

    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    const buffer = await withTimeout(
      render(context),
      RENDER_TIMEOUT_MS,
      'audio render'
    );
    const samples = buffer.getChannelData(0);

    let sum = 0;
    for (let i = SUM_FROM_FRAME; i < samples.length; i++) {
      sum += Math.abs(samples[i] ?? 0);
    }

    return {
      hash: String(murmurHash3(String(sum))),
      sum,
    };
  } catch (error) {
    console.error('Audio fingerprinting error:', error);
    return undefined;
  }
}
