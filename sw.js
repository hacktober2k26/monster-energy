// Monster Energy Service Worker — v1
// Caches core assets for offline play

const CACHE = 'monster-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/modules/core.js',
  '/js/modules/cart.js',
  '/js/modules/payment.js',
  '/js/modules/news-events.js',
  '/js/modules/flavours-modal.js',
  '/js/modules/game.js',
  '/js/modules/snake.js',
  '/js/modules/reflex.js',
  '/js/modules/game-hub.js',
  '/assets/images/logo.png',
  '/assets/images/green.png',
  '/assets/images/cyan.png',
  '/assets/images/purple.png',
  '/assets/images/red.png',
];

// Install: pre-cache everything
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and cross-origin (fonts/CDN)
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('.html') || url.pathname === '/') {
    // Network-first for pages
    e.respondWith(
      fetch(e.request)
        .then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res; })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first for assets
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const c = res.clone();
          caches.open(CACHE).then(ca => ca.put(e.request, c));
          return res;
        });
      })
    );
  }
});
