/* Kupon analizi (simulasyon): Simulator sekmesindeki kuponu bir butun olarak degerlendirir.
 *
 * - Kuponun tamaminin tutma ihtimali: uygulamanin kendi kpTot()/kjp() hesabi (ekrandaki rakamla ayni).
 * - "Kac secim yatar" dagilimi: farkli maclar bagimsiz; ayni maclardaki secimler ksp() skor dagilimindan
 *   (tum olasi skorlar uzerinden, rastgelelik yok). Tek secimli maclar l.p ile Bernoulli.
 * - Zayif halka: her secim cikarildiginda kuponun ihtimali/orani nasil degisir (kpTot ile).
 * - Dayanak: model ihtimali, piyasa beklentisi (varsa), form, karsilikli maclar, kadro/eksik, ve modelin
 *   gecmis isabeti (LGR kayitlari, ihtimal bandina gore). Veri yoksa "veri yok" denir, uydurulmaz.
 * Bu bir bahis tavsiyesi degildir; hicbir bahis risksiz degildir.
 */
(function () {
  if (typeof window.kupHtml !== 'function' || typeof kgrp !== 'function') return;

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pc = function (x) { var r = Math.round(x * 100); return (r === 0 && x > 0.0005) ? (x < 0.005 ? '0,' + Math.round(x * 1000) : 1) : r; };
  var mkey2 = function (m) { return [m.c, m.h, m.a].join('|'); };

  var WEAK = 0.65, STRONG = 0.78;           // secim esikleri
  var MARKET_GAP = 0.08;                     // model-piyasa farki (olasilik puani)

  /* ---------- dayanak verileri ---------- */
  var MK = { '1': [0], 'X': [1], '2': [2], '1X': [0, 1], 'X2': [1, 2], '12': [0, 2] };
  function market(m, k) {
    try {
      var e = window.KMX && KMX.byKey && KMX.byKey[mkey2(m)];
      if (!e || !e.odds) return null;
      var o = e.odds;
      if (MK[k] && o.p) return MK[k].reduce(function (a, i) { return a + o.p[i]; }, 0);
      if (k === 'Ü2.5' && o.ou) return o.ou[0];
      if (k === 'A2.5' && o.ou) return o.ou[1];
      if (k === 'KG Var' && o.bt) return o.bt[0];
      if (k === 'KG Yok' && o.bt) return o.bt[1];
    } catch (e) {}
    return null;
  }
  function formOf(n) {
    try {
      var g = (typeof SLG !== 'undefined' && SLG[n]) ? SLG[n].slice(-5) : [];
      if (!g.length) return null;
      var c = { G: 0, B: 0, M: 0 }; g.forEach(function (r) { c[r.r] = (c[r.r] || 0) + 1; });
      return c.G + 'G ' + c.B + 'B ' + c.M + 'M';
    } catch (e) { return null; }
  }
  function h2hOf(m) {
    try {
      var l = HH[[m.h, m.a].sort().join('|')];
      if (!l || !l.length) return null;
      var c = { G: 0, B: 0, M: 0 };
      l.forEach(function (r) { c[r.x === r.y ? 'B' : ((r.x > r.y ? r.h : r.a) === m.h ? 'G' : 'M')]++; });
      return l.length + ' maçta ' + m.h + ': ' + c.G + 'G ' + c.B + 'B ' + c.M + 'M';
    } catch (e) { return null; }
  }
  function lineupOf(m) {
    try {
      var lu = LU[mkey2(m)];
      if (lu) {
        var out = ((lu.h && lu.h.out) || []).length + ((lu.a && lu.a.out) || []).length;
        return { txt: (lu.confirmed || /resmi/i.test(lu.t || '') ? 'Resmi 11 açıklandı' : (lu.t || 'Muhtemel 11') + ' var'), confirmed: !!(lu.confirmed || /resmi/i.test(lu.t || '')), out: out };
      }
      var e = window.KMX && KMX.byKey && KMX.byKey[mkey2(m)];
      if (e && window.KMX.sq && (KMX.sq[e.hid] || KMX.sq[e.aid])) return { txt: 'Yalnızca davet listesi var', confirmed: false, out: null };
    } catch (e) {}
    return { txt: 'Kadro verisi yok', confirmed: false, out: null };
  }
  // modelin gecmis isabeti: LGR kayitlarinda (hit/miss) ihtimal bandina gore
  var CAL = null;
  function calib(p) {
    try {
      if (!CAL) {
        CAL = {};
        var byMk = {}; R.forEach(function (mm) { byMk[mkey2(mm)] = mm; });
        LGR.forEach(function (r) {
          var mm = byMk[r.mk]; if (!mm) return;
          var s = pso(mm, { k: r.k, p: r.p }); if (s !== 'hit' && s !== 'miss') return;
          var b = Math.min(9, Math.floor(r.p * 10)); // 0.7-0.8 -> 7
          var c = CAL[b] || (CAL[b] = { n: 0, h: 0 }); c.n++; if (s === 'hit') c.h++;
        });
        setTimeout(function () { CAL = null; }, 60000);
      }
      var b = Math.min(9, Math.floor(p * 10)), c = CAL[b];
      if (!c || c.n < 10) return null;
      return { lo: b * 10, hi: b * 10 + 10, n: c.n, rate: c.h / c.n };
    } catch (e) { return null; }
  }
  function leftTxt(m) {
    var d = +m.t - Date.now(); if (d <= 0) return null;
    var h = Math.floor(d / 3600e3), mi = Math.round((d % 3600e3) / 60e3);
    return h >= 48 ? Math.round(h / 24) + ' gün' : h >= 1 ? h + ' sa ' + mi + ' dk' : mi + ' dk';
  }

  /* ---------- hesap ---------- */
  function convolve(a, b) { var o = new Array(a.length + b.length - 1).fill(0); a.forEach(function (x, i) { b.forEach(function (y, j) { o[i + j] += x * y; }); }); return o; }

  function groupFail(g) {            // grupta tam j secim yatma ihtimali [P(0),P(1),...]
    var n = g.it.length;
    if (n === 1) { var p = +g.it[0][0].p; return [p, 1 - p]; }
    var m = kmatch(g.it[0][0]), f = new Array(n + 1).fill(0);
    if (!m) { var d = [1]; g.it.forEach(function (x) { d = convolve(d, [+x[0].p, 1 - x[0].p]); }); return d; }
    ksp(m).forEach(function (s) { var fails = 0; g.it.forEach(function (x) { if (!kxs(x[0].k, s)) fails++; }); f[fails] += s[4]; });
    var target = kjp(g), f0 = f[0];       // ekrandaki ortak ihtimalle ayni olsun
    if (f0 > 0 && f0 < 1 && target > 0 && target < 1) { var sc = (1 - target) / (1 - f0); for (var j = 1; j <= n; j++) f[j] *= sc; f[0] = target; }
    return f;
  }

  function analyze(legs) {
    var info = legs.map(function (l, i) {
      var m = kmatch(l), res = 'wait';
      try { if (m) res = pso(m, { k: l.k }); } catch (e) {}
      var p = +l.p;
      return { i: i, l: l, m: m, res: res, p: res === 'hit' ? 1 : res === 'miss' ? 0 : p, p0: p,
        lab: m ? labx(l.k, m) : l.k, mname: m ? m.h + ' – ' + m.a : l.mk };
    });
    var pend = info.filter(function (x) { return x.res !== 'hit' && x.res !== 'miss'; });
    var sureFail = info.filter(function (x) { return x.res === 'miss'; }).length;
    var pl = pend.map(function (x) { return x.l; });
    var a = { info: info, n: info.length, pend: pend, sureFail: sureFail, done: info.length - pend.length };
    var tot = pl.length ? kpTot(pl) : { p: 1, od: 1 };
    a.pAll = sureFail ? 0 : tot.p; a.od = tot.od;
    // yatan secim sayisi dagilimi (kesin yatanlar dahil)
    var D = [1]; if (pl.length) kgrp(pl).forEach(function (g) { D = convolve(D, groupFail(g)); });
    a.D = D; if (sureFail) { a.D = new Array(sureFail).fill(0).concat(D); }
    a.E = info.reduce(function (s, x) { return s + x.p; }, 0);
    a.minP = pend.length ? Math.min.apply(null, pend.map(function (x) { return x.p; })) : 1;
    // her secimin cikarilmasi
    pend.forEach(function (x) {
      if (pl.length < 2) { x.without = null; return; }
      var rest = pl.filter(function (l) { return l !== x.l; }), t = kpTot(rest);
      x.without = { p: t.p, od: t.od };
    });
    var weak = pend.slice().sort(function (u, v) { return u.p - v.p; });
    a.weakest = weak[0] || null;
    a.weakList = weak.filter(function (x) { return x.p < WEAK; });
    a.risk = sureFail ? 'high' : (a.pAll >= 0.55 && a.minP >= 0.70) ? 'low' : a.pAll >= 0.35 ? 'mid' : 'high';
    // veri notlari (secim basina)
    info.forEach(function (x) {
      x.mk = x.m ? market(x.m, x.l.k) : null;
      x.cal = (x.res === 'wait' || x.res === 'live' || x.res === 'unk') ? calib(x.p0) : null;
      x.form = x.m ? [formOf(x.m.h), formOf(x.m.a)] : [null, null];
      x.h2h = x.m ? h2hOf(x.m) : null;
      x.lu = x.m ? lineupOf(x.m) : null;
      x.left = x.m ? leftTxt(x.m) : null;
      x.tag = x.res === 'hit' ? 'Tuttu' : x.res === 'miss' ? 'Yattı' : x.p >= STRONG ? 'Sağlam' : x.p >= WEAK ? 'Dikkat' : 'Zayıf';
      x.cls = x.res === 'hit' ? 'low' : x.res === 'miss' ? 'high' : x.p >= STRONG ? 'low' : x.p >= WEAK ? 'mid' : 'high';
    });
    return a;
  }

  /* ---------- Turkce oneriler ---------- */
  function advice(a) {
    var out = [], n = a.pend.length;
    if (!n) { out.push({ c: 'mid', t: a.sureFail ? 'Kuponda yatan seçim var, kupon tutmadı.' : 'Kuponun tüm maçları bitti ve seçimlerin hepsi tuttu.' }); return out; }
    var weak = a.weakest;
    if (a.risk === 'low') out.push({ c: 'low', t: 'Düşük riskli görünüyor: ' + n + ' seçimin hepsinin tutma ihtimali %' + pc(a.pAll) + ', en zayıf seçim bile %' + pc(a.minP) + '. Yine de hiçbir bahis risksiz değildir.' });
    else if (a.risk === 'mid') out.push({ c: 'mid', t: 'Orta riskli: hepsinin tutma ihtimali %' + pc(a.pAll) + '.' + (n > 1 && weak ? ' En zayıf halka: ' + weak.lab + ' (%' + pc(weak.p) + ').' : '') });
    else out.push({ c: 'high', t: 'Yüksek riskli: hepsinin tutma ihtimali yalnızca %' + pc(a.pAll) + '.' + (a.weakList.length ? ' ' + a.weakList.length + ' seçim %' + pc(WEAK) + '\'in altında.' : '') });
    if (n > 1) {
      var best = a.D.indexOf(Math.max.apply(null, a.D));
      out.push({ c: 'info', t: 'Beklenen tutan seçim: ' + a.E.toFixed(1) + ' / ' + a.n + '. En olası sonuç: ' + (best === 0 ? 'hepsi tutar' : best === 1 ? 'bir seçim yatar' : best + ' seçim yatar') + '.' });
    }
    // zayif halka onerileri
    if (n > 1) {
      var cands = a.weakList.length ? a.weakList : (a.risk !== 'low' && weak ? [weak] : []);
      cands.slice(0, 2).forEach(function (x) {
        if (!x.without) return;
        out.push({ c: x.p < WEAK ? 'high' : 'mid', rm: x.i, t: (x.p < WEAK ? 'Çıkarmayı düşün: ' : 'Sadeleştirmek istersen: ') + x.lab + ' (' + x.mname + ', %' + pc(x.p) + '). Çıkarırsan hepsinin tutma ihtimali %' + pc(a.pAll) + ' → %' + pc(x.without.p) + ', tahmini oran ' + a.od.toFixed(2) + ' → ' + x.without.od.toFixed(2) + ' olur.' });
      });
    }
    // model-piyasa uyumsuzlugu
    a.pend.forEach(function (x) {
      if (x.mk == null) return;
      if (x.p0 - x.mk >= MARKET_GAP) out.push({ c: 'mid', t: x.lab + ': modelimiz (%' + pc(x.p0) + ') piyasa beklentisinden (%' + pc(x.mk) + ') iyimser, temkinli ol.' });
      else if (x.mk - x.p0 >= MARKET_GAP) out.push({ c: 'info', t: x.lab + ': piyasa beklentisi (%' + pc(x.mk) + ') modelimizden (%' + pc(x.p0) + ') daha olumlu.' });
    });
    // ayni mactan birden fazla secim
    kgrp(a.pend.map(function (x) { return x.l; })).forEach(function (g) {
      if (g.it.length > 1) { var m = kmatch(g.it[0][0]); out.push({ c: 'info', t: (m ? m.h + ' – ' + m.a : g.mk) + ' maçından ' + g.it.length + ' seçim var: birlikte ihtimali %' + pc(kjp(g)) + ' (ayrı ayrı çarpmaktan farklıdır).' }); }
    });
    // kadro durumu
    var soon = a.pend.filter(function (x) { return x.m && (+x.m.t - Date.now()) < 3 * 3600e3 && (+x.m.t - Date.now()) > -3 * 3600e3 && x.lu && !x.lu.confirmed; });
    if (soon.length) out.push({ c: 'info', t: 'Yakında başlayacak ' + soon.length + ' maçın resmi 11\'i henüz yok; açıklanınca ihtimaller değişebilir.' });
    return out;
  }

  /* ---------- gorunum ---------- */
  (function css() {
    var s = document.createElement('style');
    s.textContent = '.ka{padding:12px 14px}.ka h3{margin:0 0 4px}.ka h3 small{font-weight:500;opacity:.65;font-size:12px;margin-left:6px}' +
      '.ka-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 2px}.ka-big{font:700 30px/1 var(--n,inherit)}.ka-sub{font-size:12.5px;opacity:.7}' +
      '.ka-badge{padding:3px 10px;border-radius:99px;font-weight:700;font-size:13px;color:#fff;white-space:nowrap}' +
      '.ka-badge.low,.ka-tag.low{background:var(--ok,#1b7a4b)}.ka-badge.mid,.ka-tag.mid{background:var(--warn,#b86e00)}.ka-badge.high,.ka-tag.high{background:var(--hot,#b3362f)}' +
      '.ka-bar{display:flex;height:10px;border-radius:5px;overflow:hidden;background:var(--ln,#2a3a46);margin:10px 0 4px}.ka-bar i{display:block;height:100%}' +
      '.ka-leg2{display:flex;gap:12px;flex-wrap:wrap;font-size:12.5px;opacity:.85;margin-bottom:6px}.ka-leg2 span::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:var(--c)}' +
      '.ka-adv{margin:10px 0 2px;display:flex;flex-direction:column;gap:6px}.ka-a{border-left:3px solid var(--c,#8895a0);padding:6px 10px;font-size:13.5px;line-height:1.45;background:color-mix(in srgb,var(--c,#8895a0) 9%,transparent);border-radius:0 8px 8px 0}' +
      '.ka-a.low{--c:var(--ok,#1b7a4b)}.ka-a.mid{--c:var(--warn,#b86e00)}.ka-a.high{--c:var(--hot,#b3362f)}.ka-a.info{--c:#7f8ea0}.ka-a button{margin-top:6px;display:block}' +
      '.ka h4{margin:14px 0 4px;font-size:14px}' +
      '.ka-leg{border-top:1px solid var(--ln,#2a3a46);padding:9px 0}.ka-lt{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.ka-lt b{font-size:14.5px;line-height:1.3}.ka-lt small{display:block;opacity:.65;font-size:12px;margin-top:2px}' +
      '.ka-tag{padding:2px 8px;border-radius:99px;font-size:11.5px;font-weight:700;color:#fff;white-space:nowrap}.ka-pb{height:5px;border-radius:3px;background:var(--ln,#2a3a46);margin:7px 0 5px;overflow:hidden}.ka-pb i{display:block;height:100%}' +
      '.ka-chips{display:flex;flex-wrap:wrap;gap:5px}.ka-chip{font-size:11.5px;padding:2px 8px;border-radius:99px;border:1px solid var(--ln,#2a3a46);opacity:.9}.ka-chip.na{opacity:.5;border-style:dashed}' +
      '.ka-note{font-size:12px;opacity:.65;line-height:1.5;margin-top:10px}';
    document.head.appendChild(s);
  })();

  function colorOf(c) { return c === 'low' ? 'var(--ok,#1b7a4b)' : c === 'mid' ? 'var(--warn,#b86e00)' : 'var(--hot,#b3362f)'; }

  function legHtml(x, draft) {
    var chips = [];
    chips.push(x.mk != null ? '<span class="ka-chip">Piyasa %' + pc(x.mk) + '</span>' : '<span class="ka-chip na">Piyasa verisi yok</span>');
    if (x.m) {
      var fh = x.form[0], fa = x.form[1];
      chips.push(fh || fa ? '<span class="ka-chip">Form: ' + (fh ? esc(x.m.h) + ' ' + fh : '') + (fh && fa ? ' · ' : '') + (fa ? esc(x.m.a) + ' ' + fa : '') + '</span>' : '<span class="ka-chip na">Form verisi yok</span>');
      chips.push(x.h2h ? '<span class="ka-chip">Karşılıklı: ' + esc(x.h2h) + '</span>' : '<span class="ka-chip na">Karşılıklı maç verisi yok</span>');
      chips.push('<span class="ka-chip' + (x.lu && x.lu.confirmed ? '' : ' na') + '">' + esc(x.lu ? x.lu.txt : 'Kadro verisi yok') + (x.lu && x.lu.out != null ? ' · eksik: ' + x.lu.out : '') + '</span>');
    }
    if (x.cal) chips.push('<span class="ka-chip">Geçmiş: %' + x.cal.lo + '-' + x.cal.hi + ' bandında ' + x.cal.n + ' tahminin %' + pc(x.cal.rate) + '\'i tuttu</span>');
    if (x.left) chips.push('<span class="ka-chip">Başlamasına ' + esc(x.left) + '</span>');
    var rm = (draft && x.res !== 'hit' && x.res !== 'miss' && x.p < WEAK && x.without) ? '<button class="kpb2" data-krm="' + x.i + '">Kupondan çıkar</button>' : '';
    return '<div class="ka-leg"><div class="ka-lt"><div><b>' + esc(x.lab) + '</b><small>' + esc(x.mname) + '</small></div><div style="text-align:right"><b>%' + pc(x.p) + '</b><br><span class="ka-tag ' + x.cls + '">' + x.tag + '</span></div></div>' +
      '<div class="ka-pb"><i style="width:' + pc(x.p) + '%;background:' + colorOf(x.cls) + '"></i></div><div class="ka-chips">' + chips.join('') + '</div>' + rm + '</div>';
  }

  function html(legs, opts) {
    opts = opts || {};
    if (!legs || !legs.length) return '';
    var a;
    try { a = analyze(legs); } catch (e) { if (window.console) console.warn('kupon-analiz:', e); return ''; }
    var adv = advice(a), draft = !!opts.draft;
    var D = a.D, d0 = D[0] || 0, d1 = D[1] || 0, d2 = Math.max(0, 1 - d0 - d1);
    var bar = a.n > 1 ? '<div class="ka-bar"><i style="width:' + pc(d0) + '%;background:var(--ok,#1b7a4b)"></i><i style="width:' + pc(d1) + '%;background:var(--warn,#b86e00)"></i><i style="width:' + pc(d2) + '%;background:var(--hot,#b3362f)"></i></div>' +
      '<div class="ka-leg2"><span style="--c:var(--ok,#1b7a4b)">Hepsi tutar %' + pc(d0) + '</span><span style="--c:var(--warn,#b86e00)">1 seçim yatar %' + pc(d1) + '</span><span style="--c:var(--hot,#b3362f)">2+ yatar %' + pc(d2) + '</span></div>' : '';
    var label = a.risk === 'low' ? 'Düşük riskli' : a.risk === 'mid' ? 'Orta riskli' : 'Yüksek riskli';
    var advH = adv.map(function (z) { return '<div class="ka-a ' + z.c + '">' + esc(z.t) + (draft && z.rm != null ? '<button class="kpb2" data-krm="' + z.rm + '">Bu seçimi kupondan çıkar</button>' : '') + '</div>'; }).join('');
    var legsH = a.info.slice().sort(function (u, v) { return u.p - v.p; }).map(function (x) { return legHtml(x, draft); }).join('');
    return '<div class="box ka" id="kmka"><h3>Kupon analizi<small>simülasyon</small></h3>' +
      '<div class="ka-head"><span class="ka-badge ' + a.risk + '">' + label + '</span><span class="ka-big">%' + pc(a.pAll) + '</span><span class="ka-sub">hepsinin tutma ihtimali · tahmini oran ' + a.od.toFixed(2) + '</span></div>' + bar +
      '<div class="ka-adv">' + advH + '</div><h4>Seçimler (en zayıftan en sağlama)</h4>' + legsH +
      '<div class="ka-note">Bu bir bahis tavsiyesi değil, istatistiksel simülasyondur. İhtimaller modelin maç öncesi tahminidir; farklı maçlar birbirinden bağımsız varsayılır. Kadro, sakatlık ve maç içi gelişmeler ihtimalleri değiştirebilir. Hiçbir bahis risksiz değildir.</div></div>';
  }

  window.KMA = { analyze: analyze, advice: advice, html: html };

  // Simulator sayfasina ekle: taslak kuponun hemen altina
  var _kupHtml = window.kupHtml;
  window.kupHtml = function () {
    var h = _kupHtml();
    try {
      if (KPD && KPD.length) {
        var a = html(KPD, { draft: true }), mark = '<h3>Kayıtlı simülasyonlarım</h3>', i = h.indexOf(mark);
        h = i >= 0 ? h.slice(0, i) + a + h.slice(i) : h + a;
      }
    } catch (e) { if (window.console) console.warn('kupon-analiz ekleme:', e); }
    return h;
  };
})();
