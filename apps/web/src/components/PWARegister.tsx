'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { registerServiceWorker } from '@/lib/service-worker';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    registerServiceWorker(navigator.serviceWorker, {
      // New service worker available; let the user opt in without
      // blocking the page (no confirm() dialogs).
      promptRefresh: (accept) =>
        toast('A new version of CreepJS is available', {
          action: { label: 'Refresh', onClick: accept },
          duration: Infinity,
        }),
      reload: () => window.location.reload(),
    });
  }, []);

  return null;
}
