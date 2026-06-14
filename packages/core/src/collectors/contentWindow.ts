import type { ContentWindowFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect ContentWindow features fingerprint
 * Tests iframe contentWindow object characteristics
 */
export function collectContentWindowFingerprint():
  | ContentWindowFingerprint
  | undefined {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return undefined;
  }

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';

    document.body.appendChild(iframe);

    const contentWindow = iframe.contentWindow;
    if (!contentWindow) {
      document.body.removeChild(iframe);
      return undefined;
    }

    // Collect window properties
    const windowProps = Object.getOwnPropertyNames(contentWindow);
    const propsCount = windowProps.length;

    // Check for specific properties
    const properties: Record<string, boolean> = {
      innerWidth: 'innerWidth' in contentWindow,
      innerHeight: 'innerHeight' in contentWindow,
      outerWidth: 'outerWidth' in contentWindow,
      outerHeight: 'outerHeight' in contentWindow,
      screenX: 'screenX' in contentWindow,
      screenY: 'screenY' in contentWindow,
      pageXOffset: 'pageXOffset' in contentWindow,
      pageYOffset: 'pageYOffset' in contentWindow,
      scrollX: 'scrollX' in contentWindow,
      scrollY: 'scrollY' in contentWindow,
    };

    // Check for specific methods
    const methods: Record<string, boolean> = {
      alert: typeof contentWindow.alert === 'function',
      confirm: typeof contentWindow.confirm === 'function',
      prompt: typeof contentWindow.prompt === 'function',
      requestAnimationFrame:
        typeof contentWindow.requestAnimationFrame === 'function',
      requestIdleCallback:
        typeof (
          contentWindow as typeof contentWindow & {
            requestIdleCallback?: unknown;
          }
        ).requestIdleCallback === 'function',
    };

    // Check document properties
    const hasDocument = !!contentWindow.document;
    const documentPropsCount = hasDocument
      ? Object.getOwnPropertyNames(contentWindow.document).length
      : 0;

    document.body.removeChild(iframe);

    const data = {
      propsCount,
      properties,
      methods,
      hasDocument,
      documentPropsCount,
    };

    const hash = murmurHash3(JSON.stringify(data));

    return {
      hash: String(hash),
      windowPropsCount: propsCount,
      properties,
      methods,
      hasDocument,
      documentPropsCount,
    };
  } catch (error) {
    console.error('ContentWindow fingerprinting error:', error);
    return undefined;
  }
}
