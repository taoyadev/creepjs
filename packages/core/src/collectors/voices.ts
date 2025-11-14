import type { VoicesFingerprint } from '../types';

/**
 * Collect Speech Synthesis Voices fingerprint
 */
export async function collectVoicesFingerprint(): Promise<
  VoicesFingerprint | undefined
> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return undefined;
  }

  try {
    // Speech synthesis voices may load asynchronously
    const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices());
          };
        }
      });
    };

    const voices = await getVoices();

    return {
      count: voices.length,
      voices: voices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default,
        voiceURI: voice.voiceURI,
      })),
      defaultVoice: voices.find((v) => v.default)?.name,
    };
  } catch (error) {
    console.error('Voices fingerprinting error:', error);
    return undefined;
  }
}
