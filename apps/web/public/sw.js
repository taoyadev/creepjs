// Service Worker for CreepJS PWA
const CACHE_NAME = 'creepjs-v3';
const RUNTIME_CACHE = 'creepjs-runtime-v2';
const RUNTIME_CACHE_LIMIT = 60;

// Assets to cache on install (must be real, 200-returning routes)
const PRECACHE_ASSETS = [
  '/',
  '/checker',
  '/ip',
  '/docs',
  '/playground',
  '/site.webmanifest',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Cache each asset independently so a single missing/redirected route
      // cannot fail the whole precache (cache.addAll is all-or-nothing).
      Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((error) => {
            console.warn('SW precache skipped:', asset, error);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

async function trimRuntimeCache() {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  // Cache keys are returned in insertion order; drop oldest entries first.
  for (let i = 0; i < keys.length - RUNTIME_CACHE_LIMIT; i++) {
    await cache.delete(keys[i]);
  }
}

async function putRuntime(request, response) {
  if (response && response.status === 200) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
    await trimRuntimeCache();
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    await putRuntime(request, response);
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  return putRuntime(request, response);
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => putRuntime(request, response))
    .catch(() => undefined);
  return cached || network.then((response) => response || caches.match('/'));
}

// Fetch event - same-origin only; API and third-party requests bypass the SW
// entirely (live IP/fingerprint data must never be served stale from cache).
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    // Content-hashed immutable assets
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
