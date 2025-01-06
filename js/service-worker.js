// Define cache name
const CACHE_NAME = 'my-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/mainStyles.css',
  '/js/app.js',
  '/js/userDashboard.js',
  '/css/userDashboard.css',
  '/pages/transactions.html',
];

// Install event: caching files
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching all files');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate event: cleaning old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: serving cached files or fetching from network
self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetching:', event.request.url);
  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
