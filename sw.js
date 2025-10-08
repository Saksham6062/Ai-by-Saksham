const CACHE_NAME = 'saksham-ai-cache-v2';
const OFFLINE_URL = '/Ai-by-Saksham/offline.html';

// List of static assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/Ai-by-Saksham/index.html',
  '/Ai-by-Saksham/offline.html',
  '/Ai-by-Saksham/favicon.png',
  '/Ai-by-Saksham/GoogleAi/index.html',
  '/Ai-by-Saksham/OpenAI/index.html',
  '/Ai-by-Saksham/DeepSeek/index.html',
  '/Ai-by-Saksham/style.css', // if you have external CSS
  '/Ai-by-Saksham/script.js', // if you have external JS
  // Add all images/icons used in your cards
];

// Install event: cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch event: try cache first, then network; fallback to offline page
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          // Cache the new response for future requests
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If both network and cache fail, serve offline page
          if (event.request.destination === 'document') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});
