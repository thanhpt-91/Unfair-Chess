// Unfair Chess service worker
// - Engines (stockfish-*.js / .wasm, ~100 MB) are cached permanently: the browser's normal HTTP
//   cache drops files this large, which made every reload download the full net again.
// - The page itself is served from cache instantly (reloads don't wait on GitHub), then checked
//   against the network in the background. If it changed, open pages get an "updated" message.
const ENGINE_CACHE = 'uc-engines-v19';
const PAGE_CACHE = 'uc-page-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const keep = [ENGINE_CACHE, PAGE_CACHE];
  for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
  await self.clients.claim();
})()));

const pageKey = () => new Request(self.registration.scope);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const file = url.pathname.split('/').pop();

  if (/^stockfish-.*\.(js|wasm)$/.test(file)) {
    e.respondWith((async () => {
      const cache = await caches.open(ENGINE_CACHE);
      const hit = await cache.match(url.pathname);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) e.waitUntil(cache.put(url.pathname, res.clone()));
      return res;
    })());
    return;
  }

  if (req.mode === 'navigate' || file === '' || file === 'index.html') {
    e.respondWith((async () => {
      const cache = await caches.open(PAGE_CACHE);
      const cached = await cache.match(pageKey());
      const network = fetch(pageKey(), { cache: 'no-cache' }).then(async res => {
        if (!res.ok) return cached || res;
        const fresh = await res.clone().text();
        const old = cached ? await cached.clone().text() : null;
        await cache.put(pageKey(), res.clone());
        if (old !== null && old !== fresh) {
          for (const c of await self.clients.matchAll({ type: 'window' })) c.postMessage({ type: 'uc-updated' });
        }
        return res;
      }).catch(() => cached || Response.error());
      if (cached) { e.waitUntil(network); return cached.clone(); }
      return network;
    })());
  }
});
