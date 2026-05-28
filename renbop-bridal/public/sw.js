const CACHE_NAME = 'renbop-admin-cache-v1';
const DYNAMIC_CACHE_NAME = 'renbop-api-cache-v1';
const OFFLINE_URL = '/index.html';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg',
    // We will cache assets dynamically as they are requested since Vite uses content hashes
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests for caching
    if (event.request.method !== 'GET') return;

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedRes = response.clone();
                    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
                        cache.put(event.request, clonedRes);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails (offline), return from cache
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Handle static assets (Stale-while-revalidate pattern)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return offline page if navigation fails
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
            });
            return cachedResponse || fetchPromise;
        })
    );
});
