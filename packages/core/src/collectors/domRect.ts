import type { DomRectFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect DomRect measurement fingerprint
 * Tests DOM rectangle measurement precision and behavior
 */
export function collectDomRectFingerprint(): DomRectFingerprint | undefined {
  if (typeof document === 'undefined' || typeof DOMRect === 'undefined') {
    return undefined;
  }

  try {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.style.width = '100.5px';
    div.style.height = '100.5px';

    document.body.appendChild(div);

    // Get various rect measurements
    const boundingRect = div.getBoundingClientRect();
    const clientRects = div.getClientRects();

    const measurements: number[] = [
      boundingRect.x,
      boundingRect.y,
      boundingRect.width,
      boundingRect.height,
      boundingRect.top,
      boundingRect.right,
      boundingRect.bottom,
      boundingRect.left,
      clientRects.length,
    ];

    // Test DOMRect constructor
    let domRectSupport = false;
    try {
      const testRect = new DOMRect(0, 0, 100, 100);
      domRectSupport = testRect instanceof DOMRect;
    } catch (_domRectError) {
      void _domRectError;
      domRectSupport = false;
    }

    // Test DOMRectReadOnly
    const domRectReadOnlySupport = typeof DOMRectReadOnly !== 'undefined';

    // Test Range.getBoundingClientRect
    let rangeRectSupport = false;
    try {
      const range = document.createRange();
      range.selectNode(div);
      const rangeRect = range.getBoundingClientRect();
      measurements.push(rangeRect.width, rangeRect.height);
      rangeRectSupport = true;
    } catch (_rangeError) {
      void _rangeError;
      rangeRectSupport = false;
    }

    document.body.removeChild(div);

    const hash = murmurHash3(measurements.join(','));

    return {
      hash: String(hash),
      measurements,
      domRectSupport,
      domRectReadOnlySupport,
      rangeRectSupport,
    };
  } catch (error) {
    console.error('DomRect fingerprinting error:', error);
    return undefined;
  }
}
