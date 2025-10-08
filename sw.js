// Simple service worker for caching
const CACHE_NAME = 'saksham-ai-cache-v1';
const urlsToCache = [
  '/',
  '/Ai-by-Saksham/index.html',
  '/Ai-by-Saksham/favicon.png'
  // Add other pages or assets you want to cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
