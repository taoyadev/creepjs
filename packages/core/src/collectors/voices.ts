import type { VoicesFingerprint } from '../types';
import { withTimeout } from '../utils/async';

/**
 * How long to wait for an empty voice list to populate. Chrome fills it in
 * through `voiceschanged` shortly after load; some platforms never fire it.
 */
const VOICES_TIMEOUT_MS = 1000;

/**
 * Resolve the voice list, waiting for `voiceschanged` when it starts empty.
 *
 * Listens with addEventListener rather than assigning `onvoiceschanged`: the
 * SDK runs inside customer pages, and the property belongs to them.
 */
function loadVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const voices = synth.getVoices();
  if (voices.length > 0) {
    return Promise.resolve(voices);
  }

  let onChange: (() => void) | undefined;
  const changed = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    onChange = () => resolve(synth.getVoices());
    synth.addEventListener('voiceschanged', onChange, { once: true });
  });

  // On timeout, take whatever the list holds by then (usually still empty).
  return withTimeout(changed, VOICES_TIMEOUT_MS, 'voices')
    .catch(() => synth.getVoices())
    .finally(() => {
      if (onChange) synth.removeEventListener('voiceschanged', onChange);
    });
}

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
    const voices = await loadVoices(window.speechSynthesis);
    if (voices.length === 0) {
      return undefined;
    }

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
