import type { AudioFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect Audio Context fingerprint
 */
export function collectAudioFingerprint():
  | Promise<AudioFingerprint | undefined>
  | undefined {
  if (
    typeof window === 'undefined' ||
    !('AudioContext' in window || 'webkitAudioContext' in window)
  ) {
    return undefined;
  }

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return undefined;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    gainNode.gain.value = 0; // Mute
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);

    // Resume AudioContext if suspended (required for autoplay policy)
    if (context.state === 'suspended') {
      void context.resume().catch(() => {
        // Ignore resume errors
      });
    }

    oscillator.start(0);

    return new Promise((resolve) => {
      let processed = false;

      // Set timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (!processed) {
          processed = true;
          try {
            oscillator.stop();
            scriptProcessor.disconnect();
            gainNode.disconnect();
            analyser.disconnect();
            oscillator.disconnect();
            void context.close();
          } catch {
            // Ignore cleanup errors
          }
          resolve(undefined);
        }
      }, 1000); // 1 second timeout

      scriptProcessor.onaudioprocess = function (event) {
        if (processed) return;
        processed = true;
        clearTimeout(timeout);

        const output = event.outputBuffer.getChannelData(0);
        const hash = murmurHash3(output.slice(0, 100).join(','));

        try {
          oscillator.stop();
          scriptProcessor.disconnect();
          gainNode.disconnect();
          analyser.disconnect();
          oscillator.disconnect();
          void context.close();
        } catch {
          // Ignore cleanup errors
        }

        resolve({
          hash: String(hash),
          sampleRate: context.sampleRate,
          state: context.state,
          maxChannelCount: context.destination.maxChannelCount,
          numberOfInputs: scriptProcessor.numberOfInputs,
          numberOfOutputs: scriptProcessor.numberOfOutputs,
          channelCount: scriptProcessor.channelCount,
          channelCountMode: scriptProcessor.channelCountMode,
          channelInterpretation: scriptProcessor.channelInterpretation,
        });
      };
    });
  } catch (error) {
    console.error('Audio fingerprinting error:', error);
    return undefined;
  }
}
