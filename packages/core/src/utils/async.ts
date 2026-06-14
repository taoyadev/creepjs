export type MaybePromise<T> = T | Promise<T>;

const DEFAULT_IDLE_DELAY = 16;

export interface IdleMapOptions {
  idleDelay?: number;
  concurrency?: number;
}

/**
 * Waits until the browser is idle (using requestIdleCallback when available) before resolving.
 * Falls back to setTimeout so code also works in Node/jsdom environments.
 */
export function waitForIdle(delay: number = DEFAULT_IDLE_DELAY): Promise<void> {
  if (typeof window !== 'undefined') {
    const idle = (
      window as typeof window & {
        requestIdleCallback?: (
          cb: IdleRequestCallback,
          opts?: IdleRequestOptions
        ) => number;
      }
    ).requestIdleCallback;
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
  options: IdleMapOptions | number = {}
): Promise<R[]> {
  const normalizedOptions: IdleMapOptions =
    typeof options === 'number' ? { idleDelay: options } : options;
  const idleDelay = normalizedOptions.idleDelay ?? DEFAULT_IDLE_DELAY;
  const concurrency = Math.max(
    1,
    Math.floor(normalizedOptions.concurrency ?? 1)
  );

  const results: R[] = [];
  let cursor = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;
      if (currentIndex >= items.length) {
        break;
      }

      results[currentIndex] = await iteratee(
        items[currentIndex]!,
        currentIndex
      );
      if (currentIndex < items.length - 1) {
        await waitForIdle(idleDelay);
      }
    }
  };

  const workerCount = Math.min(concurrency, items.length || 1);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}
