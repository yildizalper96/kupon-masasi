/* Simuleto service worker (20 Kas 2026: anlik acilis).
 * Uygulama kabugu (index.html, css, js, ikonlar, yazi tipi): ONBELLEK ONCELIKLI. Sayfa agi beklemeden cihazdan acilir.
 *   Guncelleme: tools/build-site.mjs her yayinda CACHE adina kabuk dosyalarinin ozetini (hash) yazar; sw.js degisince
 *   yeni surum kurulur (kabuk agdan bastan indirilir), eski onbellek silinir, sayfa bir kez yenilenir (index.html controllerchange).
 * Veri (data/*.json): AG ONCELIKLI, son basarili cevap kalici "km-data" onbellegine yazilir. Sayfa acilista bu kopyayi
 *   aninda kullanir, hemen ardindan agdan tazesini ister (index.html acilis betigi).
 * Yerelde (localhost) her sey ag oncelikli: gelistirirken degisiklik hemen gorunur. */
const CACHE = 'km-v19'; // build-site.mjs yayinda km-<ozet> yapar
const DATA = 'km-data';
const YEREL = /^(localhost|127\.0\.0\.1)$/.test(self.location.hostname);
// Takim/lig logolari ve oyuncu fotograflari (media.api-sports.io): onbellek oncelikli, kalici.
// Gorsel bir kez indikten sonra her acilista aninda gelir; arka planda 7 gunde bir tazelenir.
const IMG = 'km-img-v1';
const IMG_HOST = 'media.api-sports.io';
const IMG_MAX = 1500, IMG_TAZE = 7 * 864e5;
const FONT = /^fonts\.(googleapis|gstatic)\.com$/;

// kurulum: kabuk listesi index.html icinden cikarilir (yeni dosya eklenince liste elle guncellenmez)
self.addEventListener('install', e => {
  e.waitUntil(
    fetch('index.html', { cache: 'reload' }).then(r => r.text()).then(html => {
      const L = new Set(['./', 'index.html', 'manifest.webmanifest']);
      html.replace(/(?:src|href)=["']([^"'#?]+)["']/g, (m, u) => { if (!/^(https?:|data:|mailto:|\/\/)/.test(u)) L.add(u); return m; });
      return caches.open(CACHE).then(c => Promise.all([...L].map(u => fetch(u, { cache: 'reload' }).then(res => res.ok ? c.put(u, res) : null).catch(() => {}))));
    }).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== IMG && k !== DATA).map(k => caches.delete(k))))
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

function agOncelikli(req, onb) {
  return (req.mode === 'navigate' ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req, { cache: 'no-cache' }))
    .then(res => {
      if (res && res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(onb).then(c => c.put(req, copy)).catch(() => {}); }
      return res;
    })
    .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html').then(h => h || caches.match('./')) : Response.error())));
}
function onbellekOncelikli(req, anahtar) {
  return caches.open(CACHE).then(c => c.match(anahtar || req, { ignoreSearch: req.mode === 'navigate' }).then(hit => hit || fetch(req).then(res => {
    if (res && ((res.ok && (res.type === 'basic' || res.type === 'cors')) || (res.type === 'opaque' && FONT.test(new URL(req.url).hostname)))) { const copy = res.clone(); c.put(anahtar || req, copy).catch(() => {}); }
    return res;
  })));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === IMG_HOST) { e.respondWith(gorsel(req, url)); return; }
  if (FONT.test(url.hostname)) { if (!YEREL) e.respondWith(onbellekOncelikli(req)); return; }
  if (url.origin !== self.location.origin) return;
  if (/\/data\/.*\.json$/.test(url.pathname)) { e.respondWith(agOncelikli(req, DATA)); return; }
  if (YEREL || url.pathname.endsWith('/sw.js')) { e.respondWith(agOncelikli(req, CACHE)); return; }
  // kabuk: cihazdan aninda (sayfa adresi icin index.html kopyasi)
  e.respondWith(onbellekOncelikli(req, req.mode === 'navigate' ? 'index.html' : null));
});
