import type { AudioFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect Audio Context fingerprint
 */
export function collectAudioFingerprint(): Promise<AudioFingerprint | undefined> | undefined {
  if (typeof window === 'undefined' || !('AudioContext' in window || 'webkitAudioContext' in window)) {
    return undefined;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

    oscillator.start(0);

    return new Promise((resolve) => {
      scriptProcessor.onaudioprocess = function (event) {
        const output = event.outputBuffer.getChannelData(0);
        const hash = murmurHash3(output.slice(0, 100).join(','));

        oscillator.stop();
        scriptProcessor.disconnect();
        gainNode.disconnect();
        analyser.disconnect();
        oscillator.disconnect();
        void context.close();

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
