import type { HTMLElementFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect HTMLElement features fingerprint
 * Tests HTMLElement prototype and property characteristics
 */
export function collectHTMLElementFingerprint():
  | HTMLElementFingerprint
  | undefined {
  if (typeof HTMLElement === 'undefined' || typeof document === 'undefined') {
    return undefined;
  }

  try {
    const element = document.createElement('div');

    // Collect prototype properties
    const protoProps = Object.getOwnPropertyNames(HTMLElement.prototype);

    // Test specific properties
    const properties: Record<string, unknown> = {
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
    };

    // Test methods availability
    const methods = [
      'click',
      'focus',
      'blur',
      'animate',
      'attachShadow',
      'closest',
      'matches',
      'querySelector',
      'querySelectorAll',
      'getBoundingClientRect',
      'getClientRects',
      'scrollIntoView',
      'setAttribute',
      'getAttribute',
      'removeAttribute',
      'hasAttribute',
    ];

    const availableMethods = methods.filter(
      (method) =>
        typeof (element as unknown as Record<string, unknown>)[method] ===
        'function'
    );

    // Check for shadow DOM support
    const shadowDOMSupport = 'attachShadow' in element;

    // Check for custom elements support
    const customElementsSupport = 'customElements' in window;

    const data = {
      prototypePropsCount: protoProps.length,
      properties,
      availableMethods,
      shadowDOMSupport,
      customElementsSupport,
    };

    const hash = murmurHash3(JSON.stringify(data));

    return {
      hash: String(hash),
      prototypePropsCount: protoProps.length,
      properties,
      methods: availableMethods,
      shadowDOMSupport,
      customElementsSupport,
    };
  } catch (error) {
    console.error('HTMLElement fingerprinting error:', error);
    return undefined;
  }
}
