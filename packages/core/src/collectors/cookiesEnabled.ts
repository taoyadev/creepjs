/**
 * Indicates whether cookies are enabled for the current document.
 */
export function collectCookiesEnabled(): boolean | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  if (typeof navigator.cookieEnabled === 'boolean') {
    return navigator.cookieEnabled;
  }

  if (typeof document !== 'undefined') {
    try {
      document.cookie = 'creepjs_test_cookie=1';
      const enabled = document.cookie.includes('creepjs_test_cookie=1');
      document.cookie =
        'creepjs_test_cookie=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return enabled;
    } catch (error) {
      void error;
      return undefined;
    }
  }

  return undefined;
}
