// Istemci hata kaydi (23 Kas 2026). Ilk yuklenen betik: sonraki betiklerdeki yakalanmamis hatalari ve reddedilen
// promise'leri toplar. Cihazda son 20 kayit (localStorage km_hata; konsoldan: KMHATA.liste()).
// Sunucuya gonderim KAPALI: supabase/schema.sql madde 7 (client_errors tablosu) panelde calistirilinca GONDER = true yap.
// Gonderilen: hata metni, dosya:satir, sayfa adresi (hash), tarayici ozeti, zaman. Kisisel veri (e-posta, kupon) gonderilmez.
(function () {
  var GONDER = false, MAX_OTURUM = 10, MAX_CIHAZ = 20, K = 'km_hata';
  var gorulen = {}, say = 0;
  function oku() { try { var a = JSON.parse(localStorage.getItem(K) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function yaz(a) { try { localStorage.setItem(K, JSON.stringify(a.slice(-MAX_CIHAZ))); } catch (e) { } }
  function kes(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }
  function kaydet(m, kaynak, yigin) {
    m = kes(m, 300);
    if (!m || m === 'Script error.' || say >= MAX_OTURUM) return;
    // yalniz kendi dosyalarimiz (tarayici eklentisi hatalari degil)
    if (kaynak && /^https?:/.test(kaynak) && kaynak.indexOf(location.origin) !== 0) return;
    var anahtar = m + '|' + kaynak; if (gorulen[anahtar]) return; gorulen[anahtar] = 1; say++;
    var k = { t: new Date().toISOString(), m: m, s: kes(String(kaynak || '').replace(location.origin, ''), 160), y: kes(yigin, 600), u: kes(location.pathname + location.hash.replace(/#access_token=.*/, ''), 160), ua: kes(navigator.userAgent, 160) };
    var a = oku(); a.push(k); yaz(a);
    if (!GONDER) return;
    var c = window.KM_SUPABASE; if (!c || !c.url || !c.anonKey) return;
    try { fetch(c.url + '/rest/v1/client_errors', { method: 'POST', keepalive: true, headers: { apikey: c.anonKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ msg: k.m, src: k.s, stack: k.y, page: k.u, ua: k.ua }) }).catch(function () { }); } catch (e) { }
  }
  window.addEventListener('error', function (e) {
    if (!e || (e.target && e.target !== window)) return; // kaynak (resim/betik) yukleme hatalari degil
    hataOlayi(e);
  });
  function hataOlayi(e) { kaydet(e.message, (e.filename || '') + (e.lineno ? ':' + e.lineno + ':' + (e.colno || 0) : ''), e.error && e.error.stack); }
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason; if (!r) return;
    var m = r && r.message ? r.message : String(r);
    if (/abort|Failed to fetch|NetworkError|Load failed/i.test(m)) return; // ag kesintisi hata sayilmaz
    kaydet('Promise: ' + m, location.origin + '/', r && r.stack);
  });
  window.KMHATA = { liste: oku, temizle: function () { yaz([]); } };
})();
