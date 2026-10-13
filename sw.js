// Unfair Chess service worker
// - Engines (stockfish-*.js / .wasm and engines/*, ~100 MB) are cached permanently: the browser's normal HTTP
//   cache drops files this large, which made every reload download the full net again.
// - The page itself is served from cache instantly (reloads don't wait on GitHub), then checked
//   against the network in the background. If it changed, open pages get an "updated" message.
const ENGINE_CACHE = 'uc-engines-v19';
const PAGE_CACHE = 'uc-page-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  const keep = [ENGINE_CACHE, PAGE_CACHE];
  for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
  await self.clients.claim();
})()));

const pageKey = () => new Request(self.registration.scope);

// Cross-origin isolation (COOP + COEP) unlocks SharedArrayBuffer, which the multi-threaded
// Stockfish build needs. GitHub Pages can't set these headers, so they're added here.
// "credentialless" still lets the Google Fonts stylesheet load.
function isolate(res) {
  if (!res || res.type === 'opaque' || res.type === 'error') return res;
  const h = new Headers(res.headers);
  h.set('Cross-Origin-Opener-Policy', 'same-origin');
  h.set('Cross-Origin-Embedder-Policy', 'credentialless');
  h.set('Cross-Origin-Resource-Policy', 'same-origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const file = url.pathname.split('/').pop();

  if (/^stockfish-.*\.(js|wasm)$/.test(file) || url.pathname.includes('/engines/')) {
    e.respondWith((async () => {
      const cache = await caches.open(ENGINE_CACHE);
      const hit = await cache.match(url.pathname);
      if (hit) return isolate(hit);
      const res = await fetch(req);
      if (res.ok) e.waitUntil(cache.put(url.pathname, res.clone()));
      return isolate(res);
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
      if (cached) { e.waitUntil(network); return isolate(cached.clone()); }
      return isolate(await network);
    })());
  }
});
