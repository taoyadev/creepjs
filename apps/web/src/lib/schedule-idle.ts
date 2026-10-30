/**
 * Run work once the browser is idle after startup, or after `timeout` at the
 * latest. Returns a cancel function for effect cleanup.
 */
export function scheduleIdle(callback: () => void, timeout = 1200) {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, 180);
  return () => window.clearTimeout(timeoutId);
}
