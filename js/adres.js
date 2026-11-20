/* Sayfa adresleri (hash yonlendirme). Her sayfanin kendi linki olur; paylasilabilir, yenileyince ayni sayfa acilir,
 * tarayici geri/ileri tusu calisir. GitHub Pages icin ek ayar gerekmez.
 *   #/ligler  #/gecmis  #/simulator  #/profil
 *   #/lig/<kod>  #/takim/<ad>  #/oyuncu/<anahtar>/<ad>  #/ara/<metin>  #/mac/<lig>/<ev>/<deplasman>
 * Durum app.js'in degiskenlerinden (tab, Q, QX, det, PMV) okunur; render her cagrildiginda adres guncellenir.
 * Uygulamanin kendi geri yigini (NAVS/FWD) korunur: tek adimlik geri/ileri onunla yapilir (kaydirma konumu geri gelir),
 * daha uzun atlamalarda ve dogrudan acilan linklerde sayfa adresten kurulur.
 * Google girisi donusu (#access_token=...) adresine dokunulmaz; paylasilan kupon (#kupon=...) app.js acilista okur, sonra adres #/simulator olur. Bu dosya en son yuklenir. */
(function () {
  if (typeof render !== 'function' || !window.history || !history.replaceState) return;
  const enc = encodeURIComponent;
  const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
  const OZEL = /access_token=|refresh_token=|error_description=/; // Google girisi donusu: cloud.js okuyup siler
  const TABLAR = { l: 'ligler', g: 'gecmis', c: 'simulator', u: 'profil' };
  const TERS = { ligler: 'l', gecmis: 'g', simulator: 'c', profil: 'u' };
  const SAYFA = { l: 'Ligler', g: 'Geçmiş', c: 'Simülatör', u: 'Profil' };

  // gecerli durumun adresi ve basligi; null: adres degismez (or. kayitli gecmis mac gorunumu)
  function adres() {
    if (PMV) return null;
    if (det && tab !== 'g') {
      const p = String(det).split('|');
      if (p.length === 3) return { h: '#/mac/' + p.map(enc).join('/'), b: p[1] + ' - ' + p[2] };
    }
    if (tab === 'u' || tab === 'c' || tab === 'g') return { h: '#/' + TABLAR[tab], b: SAYFA[tab] };
    const q = String(Q || '').trim();
    if (q && (tab === 'k' || tab === 'l')) {
      if (QX && QX.indexOf('@p:') === 0) return { h: '#/oyuncu/' + enc(QX.slice(3)) + '/' + enc(q), b: q };
      if (QX && Q === QX) return { h: '#/takim/' + enc(QX), b: QX };
      let l = []; try { l = lgm(Q); } catch (e) { }
      if (l.length === 1) return { h: '#/lig/' + enc(l[0]), b: (typeof LGNM !== 'undefined' && LGNM[l[0]]) || q };
      return { h: '#/ara/' + enc(q), b: q };
    }
    return tab === 'l' ? { h: '#/ligler', b: SAYFA.l } : { h: '', b: '' };
  }
  const simdiki = () => { const h = location.hash || ''; return (h === '#' || h === '#/') ? '' : h; };
  const tur = h => (h.match(/^#\/([a-z]+)/) || [])[1] || '';
  const url = h => h || (location.pathname + location.search);
  const baslik = b => { try { document.title = b ? b + ' · Simuleto' : 'Simuleto'; } catch (e) { } };

  function cozumle(h) {
    if (!h || h.indexOf('#/') !== 0) return null;
    const p = h.slice(2).split('/').map(dec);
    if (TERS[p[0]]) return { tab: TERS[p[0]] };
    if (p[0] === 'mac' && p.length >= 4) return { det: p.slice(1, 4).join('|') };
    if (p[0] === 'lig' && p[1]) return { lig: p[1] };
    if (p[0] === 'takim' && p[1]) return { takim: p[1] };
    if (p[0] === 'oyuncu' && p[1]) return { oy: p[1], ad: p[2] || '' };
    if (p[0] === 'ara' && p[1]) return { ara: p[1] };
    return null;
  }
  function uygula(r) {
    det = null; PMV = null; Q = ''; QX = '';
    if (!r) tab = 'k';
    else if (r.tab) tab = r.tab;
    else {
      if (tab !== 'k' && tab !== 'l' && tab !== 'c') tab = 'k';
      if (r.det) { det = r.det; try { dt = dtFor(det); } catch (e) { } }
      else {
        if (tab === 'c') tab = 'k';
        if (r.lig) { try { Q = window.kmLigQ ? window.kmLigQ(r.lig) : LGNM[r.lig]; } catch (e) { } Q = Q || ''; }
        else if (r.takim) { Q = QX = r.takim; }
        else if (r.oy) { Q = r.ad || r.oy; QX = '@p:' + r.oy; }
        else if (r.ara) { Q = r.ara; }
      }
    }
    try { const e = document.getElementById('q'); if (e) e.value = (r && r.lig && typeof LGNM !== 'undefined' && LGNM[r.lig]) || Q; } catch (e) { }
    render();
    try { window.scrollTo(0, 0); } catch (e) { }
  }

  let hazir = false, yon = false, sessiz = false, son = { n: 0, f: 0 };
  const kaydet = () => { son = { n: NAVS.length, f: FWD.length }; };
  const st = () => ({ kmn: NAVS.length });

  function guncelle(degistir) {
    // baslik gecmis kaydi degistikten SONRA yazilir; once yazilirsa onceki kaydin adi bozulur (geri donunce eski ad gorunur)
    if (!hazir || yon) { if (!yon) { try { const b0 = adres(); if (b0) baslik(b0.b); } catch (e) { } } kaydet(); return; }
    if (OZEL.test(location.hash || '')) { kaydet(); return; }
    const a = adres(); if (!a) { kaydet(); return; }
    const cur = simdiki(), hs = history.state, kmn = hs && hs.kmn;
    // uygulama ici geri (Geri dugmesi, kaydirma hareketi): tarayici gecmisi de bir adim geri gider, sayfa yeniden kurulmaz
    if (!degistir && NAVS.length === son.n - 1 && FWD.length === son.f + 1 && kmn === son.n && son.n > 0) {
      sessiz = true; kaydet(); history.back(); return;
    }
    if (a.h !== cur) {
      if (degistir || (tur(cur) === 'ara' && tur(a.h) === 'ara')) history.replaceState(st(), '', url(a.h));
      else history.pushState(st(), '', url(a.h));
    } else if (kmn !== NAVS.length) history.replaceState(st(), '', url(a.h));
    baslik(a.b);
    kaydet();
  }

  window.addEventListener('popstate', e => {
    if (OZEL.test(location.hash || '')) return;
    if (sessiz) { sessiz = false; const a = adres(); if (a) baslik(a.b); if (a && a.h !== simdiki()) history.replaceState(st(), '', url(a.h)); kaydet(); return; }
    yon = true;
    try {
      const n = e.state && e.state.kmn;
      if (n != null && n === NAVS.length - 1) back();
      else if (n != null && n === NAVS.length + 1 && FWD.length) fwd();
      const a = adres(), h = simdiki();
      if (!a || a.h !== h) uygula(cozumle(h));
    } catch (x) { }
    yon = false;
    try { const a = adres(); if (a) baslik(a.b); history.replaceState(st(), '', location.href); } catch (x) { }
    kaydet();
  });

  const _r = render;
  render = function () { const v = _r.apply(this, arguments); try { guncelle(false); } catch (e) { } return v; };

  // acilis: linkte sayfa varsa veri gelince o sayfayi kur
  const ilk = OZEL.test(location.hash || '') ? null : cozumle(simdiki());
  const bitir = () => { hazir = true; try { guncelle(true); } catch (e) { } };
  if (!ilk) { bitir(); return; }
  const veriVar = () => { try { return Array.isArray(R) && R.length > 0; } catch (e) { return false; } };
  if (ilk.tab || veriVar()) { uygula(ilk); bitir(); return; }
  let say = 0;
  const bekle = setInterval(() => { if (veriVar() || ++say > 60) { clearInterval(bekle); uygula(ilk); bitir(); } }, 250);
})();
