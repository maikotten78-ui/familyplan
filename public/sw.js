// famiplan Service Worker
const CACHE_NAME = 'famiplan-v9';

// App-Shell Assets die beim Install gecacht werden
const PRECACHE_URLS = ['/', '/index.html', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Netzwerk first – externe APIs direkt durchlassen
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const host = url.hostname;

  // Externe Requests (Firebase, APIs etc.) direkt durchlassen
  if (host !== self.location.hostname) return;

  // Nur GET cachen
  if (e.request.method !== 'GET') return;

  // JS/CSS/Icons: Cache first, dann Netzwerk (Stale-while-revalidate)
  if (url.pathname.startsWith('/assets/') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.webmanifest')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(response => {
            if (response.ok) cache.put(e.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // HTML (Navigation): Netzwerk first, Cache als Fallback
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
  );
});

// Push Notifications
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data?.json() ?? {}; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'famiplan', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'famiplan',
      data: data.data || { url: '/' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const url = e.notification.data?.url || '/';
      // Offenes Fenster suchen – auch wenn nicht vom SW kontrolliert
      const existing = cs.find(c =>
        c.url.startsWith(self.registration.scope) ||
        c.url.includes('famiplan.app')
      );
      if (existing) {
        existing.focus();
        // Nachricht ans Fenster: welcher Tab soll geöffnet werden
        if (e.notification.data?.tab) {
          existing.postMessage({ type: 'OPEN_TAB', tab: e.notification.data.tab });
        }
        return;
      }
      // App ist geschlossen – neu öffnen
      return clients.openWindow(url);
    })
  );
});
