export type MaybePromise<T> = T | Promise<T>;

const DEFAULT_IDLE_DELAY = 16;

/**
 * Waits until the browser is idle (using requestIdleCallback when available) before resolving.
 * Falls back to setTimeout so code also works in Node/jsdom environments.
 */
export function waitForIdle(delay: number = DEFAULT_IDLE_DELAY): Promise<void> {
  if (typeof window !== 'undefined') {
    const idle = (window as typeof window & { requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number }).requestIdleCallback;
    if (typeof idle === 'function') {
      return new Promise((resolve) => {
        idle(() => resolve(), { timeout: delay });
      });
    }
  }

  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

/**
 * Sequentially maps `items` but yields to the event loop between each iteration to avoid long main-thread tasks.
 */
export async function mapWithIdleBreaks<T, R>(
  items: readonly T[],
  iteratee: (item: T, index: number) => MaybePromise<R>,
  idleDelay: number = DEFAULT_IDLE_DELAY
): Promise<R[]> {
  const results: R[] = [];

  for (let index = 0; index < items.length; index += 1) {
    results.push(await iteratee(items[index], index));
    if (index < items.length - 1) {
      await waitForIdle(idleDelay);
    }
  }

  return results;
}
