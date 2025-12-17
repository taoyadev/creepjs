import type { ServiceWorkerFingerprint } from '../types';

function unsupportedFingerprint(): ServiceWorkerFingerprint {
  return {
    hash: 'serviceworker-not-supported',
    supported: false,
    controller: false,
    ready: false,
    features: {
      pushManager: false,
      sync: false,
      periodicSync: false,
      backgroundFetch: false,
      cacheAPI: false,
      notifications: false,
      paymentManager: false,
      cookieStore: false,
      getRegistrations: false,
    },
  };
}

export async function collectServiceWorkerFingerprint(): Promise<
  ServiceWorkerFingerprint | undefined
> {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const supported = 'serviceWorker' in navigator;
  if (!supported) {
    return unsupportedFingerprint();
  }

  const sw = navigator.serviceWorker;
  const controller = Boolean(sw.controller);

  let ready = false;
  let scriptURL: string | undefined;
  let scope: string | undefined;
  let state: string | undefined;

  try {
    const registration = await Promise.race([
      sw.ready,
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 100);
      }),
    ]);

    if (registration) {
      ready = true;
      scriptURL = registration.active?.scriptURL;
      scope = registration.scope;
      state = registration.active?.state;
    }
  } catch (_readyError) {
    void _readyError;
    // Ignore readiness errors
  }

  const proto =
    typeof ServiceWorkerRegistration !== 'undefined'
      ? ServiceWorkerRegistration.prototype
      : ({} as ServiceWorkerRegistration);
  const features = {
    pushManager: 'PushManager' in window,
    sync: 'SyncManager' in window || 'sync' in proto,
    periodicSync: 'PeriodicSyncManager' in window || 'periodicSync' in proto,
    backgroundFetch:
      'BackgroundFetchManager' in window || 'backgroundFetch' in proto,
    cacheAPI: typeof caches !== 'undefined',
    notifications: typeof Notification !== 'undefined',
    paymentManager:
      (typeof window !== 'undefined' && 'PaymentManager' in window) ||
      'paymentManager' in proto,
    cookieStore: 'CookieStore' in globalThis || 'cookieStore' in proto,
    getRegistrations: typeof sw.getRegistrations === 'function',
  } satisfies ServiceWorkerFingerprint['features'];

  const permissions: ServiceWorkerFingerprint['permissions'] = {};
  const navWithPermissions = navigator as Navigator & {
    permissions?: Permissions;
  };
  const permissionsApi = navWithPermissions.permissions;

  if (permissionsApi?.query) {
    try {
      const notifPerm = await Promise.race([
        permissionsApi.query({ name: 'notifications' as PermissionName }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 100)),
      ]);
      if (notifPerm) {
        permissions.notifications = notifPerm.state;
      }
    } catch (_notificationPermissionError) {
      void _notificationPermissionError;
      // ignore
    }

    try {
      const pushPerm = await Promise.race([
        permissionsApi.query({
          name: 'push',
          userVisibleOnly: true,
        } as PermissionDescriptor),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 100)),
      ]);
      if (pushPerm) {
        permissions.push = pushPerm.state;
      }
    } catch (_pushPermissionError) {
      void _pushPermissionError;
      // ignore
    }
  }

  const payload = {
    supported,
    controller,
    ready,
    scope,
    state,
    features,
    permissions,
  } satisfies Omit<ServiceWorkerFingerprint, 'hash' | 'scriptURL'> & {
    scriptURL?: string;
  };

  const hash = await hashString(payload);

  return {
    hash,
    supported,
    controller,
    ready,
    scriptURL,
    scope,
    state,
    features,
    permissions,
  };
}

async function hashString(payload: unknown): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
