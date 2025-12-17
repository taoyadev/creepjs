import type { MimeTypesFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect MimeTypes list fingerprint
 * Tests browser-supported MIME types
 */
export function collectMimeTypesFingerprint():
  | MimeTypesFingerprint
  | undefined {
  if (typeof navigator === 'undefined') return undefined;

  try {
    const nav = navigator as typeof navigator & {
      mimeTypes?: MimeTypeArray;
    };

    if (!nav.mimeTypes) {
      return {
        hash: '0',
        count: 0,
        types: [],
      };
    }

    const mimeTypes: Array<{
      type: string;
      description: string;
      suffixes: string;
    }> = [];

    for (let i = 0; i < nav.mimeTypes.length; i++) {
      const mimeType = nav.mimeTypes[i];
      if (mimeType) {
        mimeTypes.push({
          type: mimeType.type,
          description: mimeType.description,
          suffixes: mimeType.suffixes,
        });
      }
    }

    // Sort for consistent hashing
    mimeTypes.sort((a, b) => a.type.localeCompare(b.type));

    const hash = murmurHash3(JSON.stringify(mimeTypes));

    return {
      hash: String(hash),
      count: mimeTypes.length,
      types: mimeTypes,
    };
  } catch (error) {
    console.error('MimeTypes fingerprinting error:', error);
    return undefined;
  }
}
