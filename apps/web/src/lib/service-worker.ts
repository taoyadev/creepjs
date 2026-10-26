export interface ServiceWorkerHooks {
  /** Offer the update; call `accept` when the visitor opts in. */
  promptRefresh: (accept: () => void) => void;
  reload: () => void;
}

/**
 * Register /sw.js and reload only after the visitor accepted an update.
 *
 * `controllerchange` also fires when a first-time visitor's worker claims the
 * page; reloading then would kill a running checker scan and re-spend an /ip
 * lookup, so it is ignored unless the visitor asked for the new version.
 */
export function registerServiceWorker(
  container: ServiceWorkerContainer,
  { promptRefresh, reload }: ServiceWorkerHooks
): void {
  let refreshRequested = false;
  let reloading = false;

  const offer = (worker: ServiceWorker) =>
    promptRefresh(() => {
      refreshRequested = true;
      worker.postMessage({ type: 'SKIP_WAITING' });
    });

  container
    .register('/sw.js')
    .then((registration) => {
      // An update installed during an earlier visit is still waiting.
      if (registration.waiting && container.controller) {
        offer(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && container.controller) {
            offer(newWorker);
          }
        });
      });
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

  container.addEventListener('controllerchange', () => {
    if (!refreshRequested || reloading) return;
    reloading = true;
    reload();
  });
}
