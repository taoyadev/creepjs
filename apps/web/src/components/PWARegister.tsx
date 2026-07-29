'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let reloading = false;

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available; let the user opt in without
              // blocking the page (no confirm() dialogs).
              toast('A new version of CreepJS is available', {
                action: {
                  label: 'Refresh',
                  onClick: () =>
                    newWorker.postMessage({ type: 'SKIP_WAITING' }),
                },
                duration: Infinity,
              });
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

    // Reload once the new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  }, []);

  return null;
}
