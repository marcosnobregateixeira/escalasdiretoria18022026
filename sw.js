// SW KILL SWITCH - Desativação forçada para correção de deploy
const CACHE_NAME = 'escalas-ds-v2-hybrid';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deletando cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach(client => client.navigate(client.url));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through: não interfere em nada, apenas busca na rede
  return;
});