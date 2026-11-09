// Keeps a copy of the page and its tools on the phone so it opens without internet.
// Change the number below whenever you upload a new version of pro.html.
const CACHE = 'invoice-label-v1';
const FILES = ['pro.html', 'pdf-lib_min.js', 'pdf_min.js', 'pdf_worker_min.js', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const name = url.pathname.split('/').pop();
  if (!FILES.includes(name)) return;          // only our own files; the old index.html is not touched
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request).then(r => { if (r && r.ok) cache.put(e.request, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || Response.error();
    })
  );
});
