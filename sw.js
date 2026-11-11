/* Kupon Masasi service worker.
 * Strateji: ag oncelikli (network-first). Cevrimiciyken her zaman guncel kod ve veri gelir
 * (GitHub Actions veriyi surekli guncelledigi icin eski onbellek gostermek istemiyoruz);
 * cevrimdisiyken son basarili cevap onbellekten verilir. Sadece ayni kaynak, sadece GET.
 * Surum degistirmek icin CACHE adini artir (eski onbellekler silinir). */
const CACHE = 'km-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/data-shim.js', 'js/i18n-keys.js', 'js/app.js', 'js/fixtures-api.js', 'js/gestures.js', 'js/extras.js',
  'icons/icon-192.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit =>
          hit || (req.mode === 'navigate'
            ? caches.match('index.html').then(h => h || caches.match('./'))
            : Response.error())
        )
      )
  );
});
