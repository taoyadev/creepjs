import type { ConsoleErrorsFingerprint } from '../types';
import { murmurHash3 } from '../utils/hash';

/**
 * Collect Console Errors pattern fingerprint
 * Tests error stack traces and console behavior
 */
export function collectConsoleErrorsFingerprint():
  | ConsoleErrorsFingerprint
  | undefined {
  if (typeof console === 'undefined') return undefined;

  try {
    const errors: string[] = [];

    // Test error stack trace format
    try {
      throw new Error('test');
    } catch (error) {
      if (error instanceof Error && error.stack) {
        const firstLine = error.stack.split('\n')[0];
        if (firstLine) {
          errors.push(firstLine);
        }
      }
    }

    // Test console methods availability
    const consoleMethods = [
      'log',
      'warn',
      'error',
      'debug',
      'info',
      'trace',
      'table',
      'group',
      'groupEnd',
      'groupCollapsed',
      'time',
      'timeEnd',
      'count',
      'assert',
      'clear',
      'dir',
      'dirxml',
    ];

    const availableMethods = consoleMethods.filter(
      (method) =>
        typeof (console as unknown as Record<string, unknown>)[method] ===
        'function'
    );

    // Test Error constructor
    const errorProps = Object.getOwnPropertyNames(Error.prototype);

    // Test stack trace depth
    let stackDepth = 0;
    try {
      const testError = new Error();
      if (testError.stack) {
        stackDepth = testError.stack.split('\n').length;
      }
    } catch (_stackError) {
      void _stackError;
      // Ignore
    }

    const data = {
      availableMethods,
      errorProps,
      stackDepth,
      errors,
    };

    const hash = murmurHash3(JSON.stringify(data));

    return {
      hash: String(hash),
      consoleMethods: availableMethods,
      errorProtoProps: errorProps.length,
      stackDepth,
      errorPatterns: errors,
    };
  } catch (error) {
    console.error('Console errors fingerprinting error:', error);
    return undefined;
  }
}
