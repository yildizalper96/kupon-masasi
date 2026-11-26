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

  // pre: tarayicida saklanan son veri (km_fx). Verilirse hic await olmadan ESZAMANLI calisir; ilk ekran beklemeden bugunun maclariyla acilir.
  async function loadFixtures(force, pre) {
    try {
      var db = null, d, stP = null;
      if (pre) d = pre;
      else {
        db = await claude.use('db');
        if (!db) return false;
        stP = db.doc('standings/BRA').get(); stP.catch(function () {}); // paralel: puan tablosu maclarla birlikte iner
        var sn = await db.doc('fixtures/latest').get();
        if (!sn.exists) return false;
        d = sn.data();
      }
      if (!d || !Array.isArray(d.m) || (!force && d.at === FXAT)) return false;
      FXAT = d.at; window.kmFxAt = d.at;
      if (!pre) { try { localStorage.setItem('km_fx', JSON.stringify(d)); } catch (e) {} }

      // yeni ligler: ad, uzun ad, renk
      Object.keys(d.lg || {}).forEach(function (c) {
        var v = d.lg[c];
        if (v.id) { (window.KMX = window.KMX || {}).lgId = window.KMX.lgId || {}; window.KMX.lgId[c] = v.id; }
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

      // puan durumu: ucretsiz API plani 2026 sezonunu vermedigi icin dis kaynaklardan (Wikipedia, ge.globo) girilen tablolar: data/standings/<LIG>.json
      // TM kaydi: r sira, p puan, w galibiyet, d beraberlik, o MAGLUBIYET, f atilan, a yenilen (uygulamanin ortak puan tablosu bicimi)
      for (var sc of (db ? ['BRA'] : [])) {
        if (!d.lg || !(sc in d.lg) || typeof TM === 'undefined') continue;
        try {
          var ss = await (sc === 'BRA' && stP ? stP : db.doc('standings/' + sc).get());
          if (!ss.exists) continue;
          var sd = ss.data();
          (sd.rows || []).forEach(function (r) { if (!TM[r.n] || TM[r.n].l === sc) TM[r.n] = { l: sc, r: r.r, p: r.p, w: r.w, d: r.d, o: r.l, f: r.f, a: r.a, fm: r.form || '' }; });
          window.KMLX = window.KMLX || {};
          window.KMLX[sc] = sd;
          // oyuncu istatistikleri (dis kaynak: Transfermarkt): PS kaydi [ad, mac, dk, gol, asist, sari, mevki, forma no] -> Kadro ve Oyuncu istatistikleri sekmeleri
          // app.js refresh() PS'yi sonuc dosyasindan yeniden yukler; bu yuzden her yuklemeden sonra kmPsDis() yeniden uygular
          // 26 Kas 2026: oyuncu istatistigi yalnizca API-Football (data/players/api.json); dis kaynak PS'ye yazilmaz
          if (false && sd.players) {
            window.kmPsDis = function () {
              if (typeof PS === 'undefined') return;
              Object.keys(sd.players).forEach(function (t) {
                var v = sd.players[t];
                PS[sc + '|' + t] = { src: sd.playersSrc || 'Transfermarkt', at: sd.playersAt || '', kr: v.kr || 'yok', p: v.p, m: [] };
              });
            };
            window.kmPsDis();
          }
          // sezon maclari (dis kaynak: ge.globo; puan tablosuyla birebir dogrulandi): lig kaydi SLG (form, son maclar), mac listesi R ve skorlar RES
          if (Array.isArray(sd.matches) && typeof SLG !== 'undefined') {
            var seen = {};
            sd.matches.forEach(function (m) { [m.h, m.a].forEach(function (n) { if (!seen[n]) { seen[n] = 1; SLG[n] = []; } }); });
            var haveR = new Set(R.map(function (m) { return m.c + '|' + m.h + '|' + m.a; }));
            sd.matches.forEach(function (m) {
              var rs = function (f, c) { return f > c ? 'G' : f < c ? 'M' : 'B'; };
              SLG[m.h].push({ w: m.r, H: 1, o: m.a, f: m.x, c: m.y, r: rs(m.x, m.y) });
              SLG[m.a].push({ w: m.r, H: 0, o: m.h, f: m.y, c: m.x, r: rs(m.y, m.x) });
              var k = sc + '|' + m.h + '|' + m.a;
              if (!haveR.has(k)) { haveR.add(k); R.push({ c: sc, t: new Date(m.t), h: m.h, a: m.a, p: [1 / 3, 1 / 3, 1 / 3], np: true }); }
              if (!RES[k]) RES[k] = m.x + '-' + m.y;
            });
          }

        } catch (e) { }
      }

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
        if (have.has(key)) { if (x.id) { var r0 = R.find(function (q) { return !q.api && q.c === x.c && q.h === x.h && q.a === x.a; }); if (r0) r0.api = x.id; } setRes(key, x); return; } // elle yazili (veya onceden eklenmis) mac: yalnizca skor/durum
        // mac listesinde yeni
        if (!(x.c in LN)) return; // bilinmeyen lig
        // ayni yarismada ayni saatte, takimlardan biri ortak baska bir kayit varsa bu bir kopyadir (ornegin ayni takimin Ingilizce/Turkce adi): ekleme
        var xt = +new Date(x.t);
        if (R.some(function (r) { return r.c === x.c && Math.abs(+r.t - xt) < 3600e3 && (r.h === x.h || r.a === x.a || r.h === x.a || r.a === x.h); })) { have.add(key); return; }
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
        // ilk yari / mac sonu verisi (tools/match-phases.mjs): olaylar, istatistik, oyuncu puanlari, skor
        if (e.live && e.live.ev) {
          var lv = e.live, hm = '';
          try { var dt = new Date(e.liveAt); hm = ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2); } catch (x) {}
          if (typeof LVD !== 'undefined' && (!LVD[k] || LVD[k].src === 'API-Football' || !(LVD[k].ev && LVD[k].ev.length))) {
            LVD[k] = { m: lv.fin ? 'MS' : 'İlk yarı', at: hm, s: e.h + ' ' + lv.g[0] + '-' + lv.g[1] + ' ' + e.a, src: 'API-Football', ev: lv.ev, st: lv.sx };
            ch++;
          }
          if (typeof STX !== 'undefined' && (lv.t.length || lv.p.h.length) && (!STX[k] || STX[k].src === 'API-Football')) {
            STX[k] = { p: lv.p, t: lv.t, src: 'API-Football', at: hm }; ch++;
          }
          if (typeof RES !== 'undefined') {
            var cur = RES[k];
            if (lv.fin) { if (cur == null || /^L/.test(String(cur))) { RES[k] = lv.g[0] + '-' + lv.g[1]; ch++; } }
            else if (cur == null && Date.now() - Date.parse(e.liveAt) < 25 * 60e3) { RES[k] = 'L' + lv.g[0] + '-' + lv.g[1]; ch++; }
          }
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
    if (m.gp) h += "<div class='mut' style='padding-top:6px'>Modelimiz (güç modeli): 1 " + pc(m.gp[0]) + ' · X ' + pc(m.gp[1]) + ' · 2 ' + pc(m.gp[2]) + ' · beklenen gol ' + (m.gl[0].toFixed(1) + '-' + m.gl[1].toFixed(1)).replace(/[.]/g, ',') + '</div>';
    h += "<div class='mut' style='padding-top:6px'>Birçok bahisçinin oranlarından, bahisçi payı çıkarılarak hesaplanan ortalama olasılıklar; modelle karşılaştırmak içindir. Hiçbir bahis risksiz değildir.</div></div>";
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
      if (o.length && window.kmEksSatir) return o.map(window.kmEksSatir).join('');
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
    if (m.gp) h += row('Modelimiz (güç modeli)', '1 ' + pc(m.gp[0]) + ' · X ' + pc(m.gp[1]) + ' · 2 ' + pc(m.gp[2]) + ' · beklenen gol ' + (m.gl[0].toFixed(1) + '-' + m.gl[1].toFixed(1)).replace(/[.]/g, ','));
    h += '<p class="kmkay">Birçok bahisçinin oranlarından, bahisçi payı çıkarılarak hesaplanan ortalama olasılıklar; modelle karşılaştırmak içindir. Hiçbir bahis risksiz değildir.</p></section>';
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

  // Veri bayatsa kullaniciya acikca soyle: baslama saati gecmis (son 8 saat) ama durumu hala "bekliyor" olan mac
  // varsa ve veri 40 dk'dan eskiyse (ornegin API gunluk kotasi dolmussa) kucuk bir uyari goster.
  // Kullanici istegiyle kapali (12 Kas 2026): bant gosterilmez, eski bant varsa kaldirilir.
  function staleNote() {
    try { var old = document.getElementById('kmstale'); if (old) old.remove(); return; } catch (e) { return; }
    try {
      var now = Date.now(), at = Date.parse(FXAT) || 0, bad = 0;
      if (at && now - at > 40 * 60e3) {
        R.forEach(function (m) { if (m.t < now - 5 * 60e3 && m.t > now - 8 * 3600e3 && (stt(m).k === 'wait' || stt(m).k === 'unk')) bad++; });
      }
      var el = document.getElementById('kmstale');
      if (!bad) { if (el) el.remove(); return; }
      if (!el) {
        el = document.createElement('div'); el.id = 'kmstale';
        el.style.cssText = 'position:fixed;left:12px;right:12px;bottom:84px;z-index:50;max-width:420px;margin:0 auto;background:var(--sf2,#222);color:var(--ink,#eee);border:1px solid var(--ln,#444);border-radius:10px;padding:9px 12px;font:400 12.5px/1.4 var(--f,system-ui);box-shadow:0 4px 18px rgba(0,0,0,.35)';
        document.body.appendChild(el);
      }
      var d = new Date(at), hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
      el.textContent = 'Başlamış ' + bad + ' maçın skoru şu an güncellenemiyor (veri son ' + hh + ' itibarıyla). Kaynak günlük kotası dolmuş olabilir; skorlar ve kadrolar kota yenilenince gelir.';
    } catch (e) {}
  }

  /* Biten maclar arsivi (data/fixtures/finished.json): latest.json penceresinden dusen gunler (ornegin elle listelerin bittigi
   * gun ile API penceresi arasi) ana listeden kaybolmasin. Kopya olmasin diye: ayni API id'si R'de varsa veya o lig/gun icin
   * R'de zaten (arsiv disi) mac varsa eklenmez. */
  var FINAT = '';
  function finEkle(l) {
    if (!Array.isArray(l)) return 0;
    var ids = new Set(), lgGun = new Set(), n = 0;
    R.forEach(function (m) { if (m.api) ids.add(m.api); if (!m._fin) lgGun.add(m.c + '|' + dk(m.t)); });
    l.forEach(function (x) {
      if (!x || !x.c || !(x.c in LN) || ids.has(x.id)) return;
      var t = new Date(x.t); if (isNaN(t) || !Number.isFinite(+x.x) || !Number.isFinite(+x.y)) return;
      var ok = Array.isArray(x.p) && x.p.length === 3, key = x.c + '|' + x.h + '|' + x.a;
      // ayni mac R'de (elle girilmis kayit, api id'siz) varsa yalniz skoru yaz (25 Kas 2026: Fransa-Turkiye "gelecek" kaliyordu)
      if (lgGun.has(x.c + '|' + dk(t))) { if ((!RES[key] || RES[key].charAt(0) === 'L') && R.some(function (m) { return m.c === x.c && m.h === x.h && m.a === x.a && Math.abs(m.t - t) < 864e5; })) RES[key] = x.x + '-' + x.y; return; }
      R.push({ c: x.c, t: t, h: x.h, a: x.a, p: ok ? x.p : [1 / 3, 1 / 3, 1 / 3], np: !ok, api: x.id, _fin: 1 });
      ids.add(x.id);
      if (!RES[key] || RES[key].charAt(0) === 'L') RES[key] = x.x + '-' + x.y;
      n++;
    });
    return n;
  }
  function finYukle() {
    return fetch('data/fixtures/finished.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (!j || !Array.isArray(j.m) || j.at === FINAT) return 0; FINAT = j.at; return finEkle(j.m); }).catch(function () { return 0; });
  }

  async function boot() {
    var n = false, dl = false, mg = false;
    var bekle = window.__fxWait;
    var emniyet = setTimeout(function () { if (window.__fxWait) { window.__fxWait = false; try { render(); } catch (e) {} } }, 7000);
    try { var pf = loadFixtures(true), pd = loadDetails(), pg = gucYukle(); n = await pf; if (await finYukle()) n = true; dl = await pd; mg = mergeDetails(); if (await pg) mg = true; } catch (e) {}
    clearTimeout(emniyet); window.__fxWait = false;
    staleNote();
    if (n || dl || mg || bekle) {
      try { R.sort(function (a, b) { return a.t - b.t; }); } catch (e) {}
      try { var y = window.scrollY; render(); window.scrollTo(0, y); } catch (e) {}
    }
    setInterval(async function () {
      if (document.visibilityState != 'visible') return;
      var ae = document.activeElement;
      if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
      var n2 = await loadFixtures(false);
      var d2 = await loadDetails(); var m2 = mergeDetails();
      staleNote();
      if (n2 || d2 || m2) { try { R.sort(function (a, b) { return a.t - b.t; }); var y2 = window.scrollY; render(); window.scrollTo(0, y2); } catch (e) {} }
    }, 60000);
  }

  /* Yedek model (20 Kas 2026): piyasa beklentisi / API tahmini olmayan maclar icin sezon gol ortalamalarindan Poisson.
   * TM[takim] = {l lig, w,d,o, f atilan, a yenilen}. Iki takim ayni ligde ve en az 3 maci varsa hesaplanir; yoksa mac "olasilik yok" kalir.
   * Lig ortalamasina dogru buzulur (4 sanal mac); ev sahibi carpani 1.12 / 0.88. m.pm=1 isaretli maclar her cizimde yeniden hesaplanir. */
  // Guc modeli (tools/model-guc.mjs, data/model/guc.json): tum yarismalardaki sonuclardan takim hucum/savunma gucu.
  // fx: { macId: [beklenen ev golu, beklenen dep golu] }. Piyasa beklentisi varsa 1X2 piyasadan kalir; model "Modelimiz" satiri,
  // gol pazarlari (piyasa 2,5 gol yoksa) ve piyasasiz maclarin yedegi olarak kullanilir.
  var KMG = null;
  function gucYukle() { return fetch('data/model/guc.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.fx) { KMG = j; window.KMG = j; return true; } return false; }).catch(function () { return false; }); }
  function gucMatris(lh, la, rho) {
    var pois = function (l, k) { var p = Math.exp(-l); for (var i = 1; i <= k; i++) p *= l / i; return p; };
    var p1 = 0, px = 0, p2 = 0, s = 0;
    for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) {
      var t = 1; if (rho) { if (!i && !j) t = 1 - lh * la * rho; else if (!i && j === 1) t = 1 + lh * rho; else if (i === 1 && !j) t = 1 + la * rho; else if (i === 1 && j === 1) t = 1 - rho; }
      var q = Math.max(0, pois(lh, i) * pois(la, j) * t); s += q; if (i > j) p1 += q; else if (i === j) px += q; else p2 += q;
    }
    return [p1 / s, px / s, p2 / s];
  }
  window.gucMatris = gucMatris;
  function modelDoldur() {
    if (typeof R === undefined || typeof TM === undefined) return;
    if (KMG && KMG.fx) R.forEach(function (m) {
      var id = m && (m.api || m.id), g = id && KMG.fx[id]; if (!g) return;
      if (!m.gl || m.gl[0] !== g[0] || m.gl[1] !== g[1]) { m.gl = g; m.gp = gucMatris(g[0], g[1], KMG.rho || 0); m._gk = null; }
      if (m.np || m.pm === 1) { m.p = m.gp.slice(); m.np = false; m.pm = 2; }
      else if (m.pm === 2) m.p = m.gp.slice();
    });
    var lg = {};
    Object.keys(TM).forEach(function (n) { var t = TM[n]; if (!t || !t.l) return; var g = (t.w || 0) + (t.d || 0) + (t.o || 0); if (!g || t.f == null) return; var o = lg[t.l] || (lg[t.l] = { f: 0, g: 0 }); o.f += +t.f || 0; o.g += g; });
    var pois = function (l, k) { var p = Math.exp(-l); for (var i = 1; i <= k; i++) p *= l / i; return p; };
    R.forEach(function (m) {
      if (!m || (!m.np && m.pm !== 1)) return;
      var A = TM[m.h], B = TM[m.a];
      var gA = A ? (A.w || 0) + (A.d || 0) + (A.o || 0) : 0, gB = B ? (B.w || 0) + (B.d || 0) + (B.o || 0) : 0;
      var L = A && B && A.l === B.l ? lg[A.l] : null;
      if (!L || gA < 3 || gB < 3 || !L.g) { if (m.pm) { m.pm = 0; m.np = true; m.p = [1 / 3, 1 / 3, 1 / 3]; } return; }
      var mu = L.f / L.g, k = 4;
      var at = function (t, g) { return ((+t.f || 0) + mu * k) / (g + k) / mu; }, df = function (t, g) { return ((+t.a || 0) + mu * k) / (g + k) / mu; };
      var lh = mu * at(A, gA) * df(B, gB) * 1.12, la = mu * at(B, gB) * df(A, gA) * 0.88;
      var p1 = 0, px = 0, p2 = 0;
      for (var i = 0; i <= 10; i++) for (var j = 0; j <= 10; j++) { var q = pois(lh, i) * pois(la, j); if (i > j) p1 += q; else if (i === j) px += q; else p2 += q; }
      var s = p1 + px + p2; if (!(s > 0)) return;
      m.p = [p1 / s, px / s, p2 / s]; m.np = false; m.pm = 1;
    });
  }
  window.modelDoldur = modelDoldur;
  try { var _rm = render; render = function () { try { modelDoldur(); } catch (e) {} return _rm.apply(this, arguments); }; } catch (e) {}

  window.loadFixtures = loadFixtures;
  // acilistan sonra taze veriyle sessiz yenileme (index.html kmFresh): cizim tutulur, sonda tek kez cizilir
  (window.kmReloaders = window.kmReloaders || []).push(async function () { var pf = loadFixtures(true), pd = loadDetails(), pg = gucYukle(); await pf; FINAT = ''; await finYukle(); await pd; await pg; mergeDetails(); try { R.sort(function (a, b) { return a.t - b.t; }); } catch (e) {} });
  (window.kmReloaders).push(function () { return typeof refresh === 'function' ? refresh() : null; });
  // render tutma: kmHold acikken cizim ertelenir (ara durum gorunmez)
  try { var _rn = render; render = function () { if (window.kmHold) { window.kmHoldP = 1; return; } return _rn.apply(this, arguments); }; } catch (e) {}
  // ilk ekran: saklanan son veriyle hemen ciz (yukleniyor yazisi yok); taze veri gelince sessizce guncellenir
  try {
    var fxc = JSON.parse(localStorage.getItem('km_fx') || 'null');
    if (fxc && Array.isArray(fxc.m)) {
      loadFixtures(true, fxc); FXAT = ''; window.__fxWait = false;
      try { R.sort(function (a, b) { return a.t - b.t; }); } catch (e) {}
      try { render(); } catch (e) {}
    }
  } catch (e) {}
  (window.kmBoot||function(p){return p})(boot()); // ilk acilis kapisi bu yuklemeyi bekler (index.html kmBoot)
})();
