import type { ClientRectsFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect Client Rects fingerprint (emoji rendering)
 */
export function collectClientRectsFingerprint():
  | ClientRectsFingerprint
  | undefined {
  if (typeof document === 'undefined') return undefined;

  try {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.fontSize = '48px';

    const emojis = ['😀', '😃', '😄', '😁', '🎨', '🔥', '⚡', '🌟'];
    const rects: number[] = [];

    document.body.appendChild(div);

    emojis.forEach((emoji) => {
      div.textContent = emoji;
      const rect = div.getBoundingClientRect();
      rects.push(rect.width, rect.height, rect.x, rect.y);
    });

    document.body.removeChild(div);

    const hash = murmurHash3(rects.join(','));

    return {
      hash: String(hash),
      data: rects,
    };
  } catch (error) {
    console.error('Client rects fingerprinting error:', error);
    return undefined;
  }
}
