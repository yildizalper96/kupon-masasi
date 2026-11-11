/* API-Football'dan gelen maclari (data/fixtures/latest.json) uygulamaya ekler.
 *
 * Kural: uygulamada zaten elle yazili olan maclar (ayni lig|ev|deplasman) DEGISTIRILMEZ.
 * Yalnizca yeni maclar R listesine eklenir, biten maclarin skoru (RES) bos olanlara yazilir.
 * Tahmin (p) yoksa mac "olasilik yok" (np) olarak gorunur; uygulama bu durumu zaten tasiyor.
 * Uretici: tools/fetch-fixtures.mjs
 */
(function () {
  var FXAT = '';
  var FIN = { FT: 1, AET: 1, PEN: 1 };

  async function loadFixtures(force) {
    try {
      var db = await claude.use('db');
      if (!db) return false;
      var sn = await db.doc('fixtures/latest').get();
      if (!sn.exists) return false;
      var d = sn.data();
      if (!d || !Array.isArray(d.m) || (!force && d.at === FXAT)) return false;
      FXAT = d.at;

      // yeni ligler: ad, uzun ad, renk
      Object.keys(d.lg || {}).forEach(function (c) {
        var v = d.lg[c];
        if (!(c in N)) N[c] = v.n;
        if (!(c in LN)) LN[c] = v.ln;
        if (!(c in C)) C[c] = v.col;
        // "Ligler" sekmesi: sira listesi (LORD) ve kisa ad tablosu (LGNM). Maci olmayan lig zaten gizlenir.
        if (typeof LORD !== 'undefined' && LORD.indexOf(c) < 0) LORD.push(c);
        if (typeof LGNM !== 'undefined' && !(c in LGNM)) LGNM[c] = v.n;
        // lig sayfasi: arama metni bu takma adlardan biriyle eslesirse lig sayfasi acilir (lgm -> LGAN)
        if (typeof LGAN !== 'undefined' && !(c in LGAN)) {
          var al = [v.n, v.ln, (v.ln || '').split(' – ').pop()].concat(v.al || []);
          LGAN[c] = al.map(function (x) { return nzq(String(x)); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
        }
      });

      var have = new Set(R.map(function (m) { return m.c + '|' + m.h + '|' + m.a; }));
      var added = 0, changed = 0;
      var setRes = function (key, x) {
        // biten skor: bos veya canli ('L...') kaydin uzerine yazilir; canli skor: yalnizca bos/canli kaydin uzerine
        if (!x.sc) return;
        var cur = RES[key], sc = x.sc[0] + '-' + x.sc[1], v = null;
        if (FIN[x.st]) { if (!cur || cur.charAt(0) === 'L') v = sc; }
        else if (x.st && x.st !== 'NS' && x.st !== 'TBD' && x.st !== 'PST' && x.st !== 'CANC' && x.st !== 'ABD' && x.st !== 'AWD' && x.st !== 'WO') {
          if (!cur || cur.charAt(0) === 'L') v = 'L' + sc;
        }
        if (v !== null && v !== cur) { RES[key] = v; changed++; }
      };
      d.m.forEach(function (x) {
        var key = x.c + '|' + x.h + '|' + x.a;
        if (have.has(key)) { setRes(key, x); return; } // elle yazili (veya onceden eklenmis) mac: yalnizca skor/durum
        // mac listesinde yeni
        if (!(x.c in LN)) return; // bilinmeyen lig
        have.add(key);
        var m = { c: x.c, t: new Date(x.t), h: x.h, a: x.a, p: x.p || [1 / 3, 1 / 3, 1 / 3], np: !x.p, api: x.id };
        R.push(m);
        added++;
        setRes(key, x);
      });
      return added + changed;
    } catch (e) {
      if (window.console) console.warn('fixtures-api:', e);
      return false;
    }
  }

  async function boot() {
    var n = await loadFixtures(true);
    if (n) {
      try { R.sort(function (a, b) { return a.t - b.t; }); } catch (e) {}
      try { var y = window.scrollY; render(); window.scrollTo(0, y); } catch (e) {}
    }
    setInterval(async function () {
      if (document.visibilityState != 'visible') return;
      var ae = document.activeElement;
      if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
      var n2 = await loadFixtures(false);
      if (n2) { try { R.sort(function (a, b) { return a.t - b.t; }); var y2 = window.scrollY; render(); window.scrollTo(0, y2); } catch (e) {} }
    }, 60000);
  }

  window.loadFixtures = loadFixtures;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
