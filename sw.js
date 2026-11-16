/* Kupon Masasi service worker.
 * Strateji: ag oncelikli (network-first). Cevrimiciyken her zaman guncel kod ve veri gelir
 * (GitHub Actions veriyi surekli guncelledigi icin eski onbellek gostermek istemiyoruz);
 * cevrimdisiyken son basarili cevap onbellekten verilir. Sadece ayni kaynak, sadece GET.
 * Surum degistirmek icin CACHE adini artir (eski onbellekler silinir). */
const CACHE = 'km-v9';
// Takim/lig logolari ve oyuncu fotograflari (media.api-sports.io): onbellek oncelikli, kalici.
// Gorsel bir kez indikten sonra her acilista aninda gelir; arka planda 7 gunde bir tazelenir.
const IMG = 'km-img-v1';
const IMG_HOST = 'media.api-sports.io';
const IMG_MAX = 1500, IMG_TAZE = 7 * 864e5;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/config.js', 'js/cloud.js', 'js/data-shim.js', 'js/i18n-keys.js', 'js/app.js', 'js/fixtures-api.js', 'js/gestures.js', 'js/dokunma.js', 'js/menu.js', 'js/extras.js',
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
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// CORS ile indirilir (sunucu izin veriyor): opak olmayan, kucuk onbellek kaydi; tarih basligi tazelik icin saklanir
function gorselIndir(url) {
  return fetch(url.href, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer' }).then(res => {
    if (res && res.ok) {
      // kendi zaman damgamizla saklanir (CORS cevabinda Date basligi okunamaz)
      res.clone().blob().then(b => caches.open(IMG).then(c => c.put(url.href, new Response(b, { headers: { 'content-type': res.headers.get('content-type') || 'image/png', 'x-km-t': String(Date.now()) } })).then(() => budama(c)))).catch(() => {});
    }
    return res;
  });
}
let budaSay = 0;
function budama(c) {
  if (++budaSay % 50) return;
  c.keys().then(k => { if (k.length > IMG_MAX) return Promise.all(k.slice(0, k.length - IMG_MAX).map(r => c.delete(r))); }).catch(() => {});
}
function gorsel(req, url) {
  return caches.open(IMG).then(c => c.match(url.href)).then(hit => {
    if (hit) {
      const t = +hit.headers.get('x-km-t') || 0;
      if (Date.now() - t > IMG_TAZE) gorselIndir(url).catch(() => {});
      return hit;
    }
    return gorselIndir(url).catch(() => fetch(req));
  }).catch(() => fetch(req));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === IMG_HOST) { e.respondWith(gorsel(req, url)); return; }
  if (url.origin !== self.location.origin) return;

  // cache:'no-cache': tarayicinin HTTP onbellegi (GitHub Pages max-age=600) atlanir, sunucuya sorulur
  // (degismediyse 304, kucuk); yeni yayin sayfa yenilenince hemen gelir
  e.respondWith(
    (req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req, { cache: 'no-cache' }))
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
