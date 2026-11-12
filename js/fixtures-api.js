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

  /* ---------------- mac ayrintilari (data/fixtures/details.json) ----------------
   * Uretici: tools/fetch-details.mjs. Icerik: milli takim kadro listesi, ilk 11 + yedekler, eksikler,
   * piyasa beklentisi (bahisci oranlarindan marji cikarilmis ortalama olasilik; bahisci adi/oran YOK),
   * karsilikli maclar. Elle yazili kayitlar (LU/HH) varsa onlar korunur. */
  var KMX = window.KMX = { byKey: {}, sq: {}, at: '' };
  var DETAT = '';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pc = function (x) { return '%' + Math.round(x * 100); };

  async function loadDetails() {
    try {
      var db = await claude.use('db');
      if (!db) return false;
      var sn = await db.doc('fixtures/details').get();
      if (!sn.exists) return false;
      var d = sn.data();
      if (!d || d.at === DETAT) return false;
      DETAT = d.at;
      KMX.sq = d.sq || {};
      KMX.at = d.at;
      KMX.byKey = {};
      Object.keys(d.m || {}).forEach(function (id) { var e = d.m[id]; if (e && e.k) KMX.byKey[e.k] = e; });
      return true;
    } catch (e) { if (window.console) console.warn('details:', e); return false; }
  }

  var reasonTr = function (r) {
    r = String(r || '');
    if (/suspen|red card|yellow/i.test(r)) return 'cezalı';
    if (/question|doubt/i.test(r)) return 'belirsiz';
    return 'sakat';
  };

  // LU (ilk 11) ve HH (karsilikli maclar) birlestirme. Uygulama LU'yu her yenilemede bastan okudugu icin her turda tekrarlanir.
  function mergeDetails() {
    var ch = 0;
    try {
      Object.keys(KMX.byKey).forEach(function (k) {
        var e = KMX.byKey[k], inj = e.inj || [];
        var outOf = function (s) { return inj.filter(function (x) { return x.s === s; }).map(function (x) { return [x.n, reasonTr(x.r)]; }); };
        if (e.lu && e.lu.h && e.lu.h.xi && e.lu.h.xi.length === 11 && (!LU[k] || !LU[k].confirmed)) {
          LU[k] = { t: 'Resmi 11', at: 'API-Football', src: 'API-Football', confirmed: true,
            h: { f: e.lu.h.f, xi: e.lu.h.xi, bn: e.lu.h.bn, out: outOf('h') },
            a: { f: e.lu.a.f, xi: e.lu.a.xi, bn: e.lu.a.bn, out: outOf('a') }, f: [1, 1] };
          ch++;
        }
        if (e.h2h && e.h2h.length) {
          var hk = [e.h, e.a].sort().join('|');
          if (typeof HH !== 'undefined' && !HH[hk]) { HH[hk] = e.h2h.map(function (r) { return { d: r.d, h: r.h, a: r.a, x: r.x, y: r.y }; }); ch++; }
        }
      });
    } catch (e) { if (window.console) console.warn('mergeDetails:', e); }
    return ch;
  }

  // Tasarim icin: API'nin ham ilk 11'i {h:{f,xi:[{id,n,no,pos,grid}],bn:[...]},a:{...}} | null (yalnizca resmi veri)
  KMX.luRaw = function (m) { var e = KMX.byKey[[m.c, m.h, m.a].join('|')]; return (e && e.luRaw) || null; };
  // Oyuncu fotografi: kadro listesinde (KMX.sq) takim+oyuncu adiyla bulunan kimlikten url | null
  KMX.photo = function (team, player) {
    try {
      var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').trim(); };
      var pn = norm(player);
      for (var tid in KMX.sq) {
        var sq = KMX.sq[tid]; if (!sq || norm(sq.n) !== norm(team)) continue;
        var f = (sq.p || []).filter(function (x) { return x.id && (norm(x.n) === pn || (pn.split(' ').pop() === norm(x.n).split(' ').pop() && norm(x.n).split(' ')[0][0] === pn[0])); })[0];
        if (f) return f.ph || ('https://media.api-sports.io/football/players/' + f.id + '.png');
      }
    } catch (e) {}
    return null;
  };

  var GRP = [['K', 'Kaleciler'], ['D', 'Defans'], ['O', 'Orta saha'], ['F', 'Forvet'], ['', 'Diğer']];
  // Kadro sekmesi: ilk 11 yoksa, milli takimlarda davet edilen oyuncular (+ eksikler)
  KMX.squadBox = function (m) {
    var e = KMX.byKey[[m.c, m.h, m.a].join('|')];
    if (!e) return '';
    var sides = [[e.h, e.hid, 'h'], [e.a, e.aid, 'a']].filter(function (s) { return KMX.sq[s[1]] && KMX.sq[s[1]].p && KMX.sq[s[1]].p.length; });
    if (!sides.length) return '';
    var inj = e.inj || [];
    var html = "<div class='lvtt'>Davet edilen oyuncular</div>";
    sides.forEach(function (s) {
      var sq = KMX.sq[s[1]], out = inj.filter(function (x) { return x.s === s[2]; }).map(function (x) { return [x.n, reasonTr(x.r)]; });
      html += "<div class='box lvt'><div class='lvh'>" + (typeof bd === 'function' ? bd(s[0], 1) : '') + '<b>' + esc(s[0]) + '</b><span>' + sq.p.length + ' oyuncu</span></div>';
      GRP.forEach(function (g) {
        var ps = sq.p.filter(function (p) { return (p.p || '') === g[0]; });
        if (!ps.length) return;
        html += "<div class='mut' style='padding:4px 0;line-height:1.5'><b>" + g[1] + ':</b> ' + ps.map(function (p) { return esc(p.n) + (p.no ? ' (' + p.no + ')' : ''); }).join(', ') + '</div>';
      });
      html += '<h4>Eksikler</h4>' + (typeof absB === 'function' ? absB(out) : (out.length ? esc(out.map(function (o) { return o[0] + ' (' + o[1] + ')'; }).join(', ')) : "<div class='mut'>Açıklanan eksik yok.</div>"));
      html += '</div>';
    });
    html += "<div class='mut' style='padding:2px 2px 10px'>Bu liste davet edilen oyuncuları gösterir, maç kadrosu değildir. Resmi ilk 11 açıklanınca (genelde maçtan 1 saat önce) sahada görünür. Kaynak: API-Football.</div>";
    return html;
  };

  // Tahmin sekmesi: piyasa beklentisi
  KMX.oddsBox = function (m) {
    var e = KMX.byKey[[m.c, m.h, m.a].join('|')];
    if (!e || !e.odds) return '';
    var o = e.odds, row = function (l, v) { return "<div class='sr'><span style='text-align:left'>" + l + '</span><b>' + v + '</b></div>'; };
    var h = "<div class='box'><h3>Piyasa beklentisi</h3>";
    if (o.p) h += row('Maç sonucu', '1 ' + pc(o.p[0]) + ' · X ' + pc(o.p[1]) + ' · 2 ' + pc(o.p[2]));
    if (o.ou) h += row('2,5 gol', 'Üst ' + pc(o.ou[0]) + ' · Alt ' + pc(o.ou[1]));
    if (o.bt) h += row('İki takım da gol atar', 'Evet ' + pc(o.bt[0]) + ' · Hayır ' + pc(o.bt[1]));
    if (!m.np && m.p) h += "<div class='mut' style='padding-top:6px'>Modelimiz: 1 " + pc(m.p[0]) + ' · X ' + pc(m.p[1]) + ' · 2 ' + pc(m.p[2]) + '</div>';
    h += "<div class='mut' style='padding-top:6px'>Birçok bahisçinin (" + (o.n || 0) + ") oranlarından, bahisçi payı çıkarılarak hesaplanan ortalama olasılıklar. Bahis sitesi oranı değildir, modelin tahminiyle karşılaştırmak içindir. Hiçbir bahis risksiz değildir.</div></div>";
    return h;
  };

  // ---- masaustu (js/pages.js) kartlari: ayni veri, masaustu kart bicimiyle ----
  KMX.squadCard = function (m) {
    var e = KMX.byKey[[m.c, m.h, m.a].join('|')];
    if (!e) return '';
    var sides = [[e.h, e.hid, 'h'], [e.a, e.aid, 'a']];
    if (!sides.some(function (s) { return KMX.sq[s[1]] && KMX.sq[s[1]].p && KMX.sq[s[1]].p.length; })) return '';
    var inj = e.inj || [];
    var col = function (s) {
      var sq = KMX.sq[s[1]];
      if (!sq || !sq.p || !sq.p.length) return '<div><p class="kmbos">' + esc(s[0]) + ' için kadro listesi yok.</p></div>';
      var h = '<div><p style="margin:0 0 6px"><b>' + esc(s[0]) + '</b> <span style="opacity:.65">· ' + sq.p.length + ' oyuncu</span></p>';
      GRP.forEach(function (g) {
        var ps = sq.p.filter(function (p) { return (p.p || '') === g[0]; });
        if (ps.length) h += '<p style="margin:6px 0;font-size:13px;line-height:1.55"><b>' + g[1] + ':</b> ' + ps.map(function (p) { return esc(p.n) + (p.no ? ' (' + p.no + ')' : ''); }).join(', ') + '</p>';
      });
      return h + '</div>';
    };
    var eks = function (s) {
      var o = inj.filter(function (x) { return x.s === s; });
      return o.length ? o.map(function (x) { return '<p style="margin:4px 0;font-size:13px"><b>' + esc(x.n) + '</b> <span style="opacity:.65">(' + reasonTr(x.r) + ')</span></p>'; }).join('') : '<p class="kmbos">Açıklanan eksik yok.</p>';
    };
    return '<section class="kmc kmkadro"><h3 class="kmb">Davet edilen oyuncular</h3><div class="kmiki">' + col(sides[0]) + col(sides[1]) + '</div>' +
      '<h4 class="kmalt">Sakat ve cezalı oyuncular</h4><div class="kmiki"><div>' + eks('h') + '</div><div>' + eks('a') + '</div></div>' +
      '<p class="kmkay">Davet edilen oyuncuları gösterir, maç kadrosu değildir. Resmi ilk 11 açıklanınca (genelde maçtan 1 saat önce) sahada görünür. Kaynak: API-Football.</p></section>';
  };
  KMX.oddsCard = function (m) {
    var e = KMX.byKey[[m.c, m.h, m.a].join('|')];
    if (!e || !e.odds) return '';
    var o = e.odds, row = function (l, v) { return '<div class="kmsr"><span>' + l + '</span><b>' + v + '</b></div>'; };
    var h = '<section class="kmc kmpiyasa"><h3 class="kmb orta">Piyasa beklentisi</h3>';
    if (o.p) h += row('Maç sonucu', '1 ' + pc(o.p[0]) + ' · X ' + pc(o.p[1]) + ' · 2 ' + pc(o.p[2]));
    if (o.ou) h += row('2,5 gol', 'Üst ' + pc(o.ou[0]) + ' · Alt ' + pc(o.ou[1]));
    if (o.bt) h += row('İki takım da gol atar', 'Evet ' + pc(o.bt[0]) + ' · Hayır ' + pc(o.bt[1]));
    if (!m.np && m.p) h += row('Modelimiz', '1 ' + pc(m.p[0]) + ' · X ' + pc(m.p[1]) + ' · 2 ' + pc(m.p[2]));
    h += '<p class="kmkay">Birçok bahisçinin (' + (o.n || 0) + ') oranlarından, bahisçi payı çıkarılarak hesaplanan ortalama olasılıklar. Bahis sitesi oranı değildir, modelle karşılaştırmak içindir. Hiçbir bahis risksiz değildir.</p></section>';
    return h;
  };

  // Tahmin sekmesine piyasa kutusunu ekle (detail uygulamada global bir fonksiyon)
  if (typeof window.detail === 'function' && !window.detail.__kmx) {
    var _detail = window.detail;
    window.detail = function (m) { var h = _detail(m); try { if (typeof dt !== 'undefined' && dt === 'p') h += KMX.oddsBox(m); } catch (e) {} return h; };
    window.detail.__kmx = 1;
  }

  window.loadDetails = loadDetails;
  window.mergeDetails = mergeDetails;

  async function boot() {
    var n = await loadFixtures(true);
    var dl = await loadDetails(); var mg = mergeDetails();
    if (n || dl || mg) {
      try { R.sort(function (a, b) { return a.t - b.t; }); } catch (e) {}
      try { var y = window.scrollY; render(); window.scrollTo(0, y); } catch (e) {}
    }
    setInterval(async function () {
      if (document.visibilityState != 'visible') return;
      var ae = document.activeElement;
      if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
      var n2 = await loadFixtures(false);
      var d2 = await loadDetails(); var m2 = mergeDetails();
      if (n2 || d2 || m2) { try { R.sort(function (a, b) { return a.t - b.t; }); var y2 = window.scrollY; render(); window.scrollTo(0, y2); } catch (e) {} }
    }, 60000);
  }

  window.loadFixtures = loadFixtures;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
