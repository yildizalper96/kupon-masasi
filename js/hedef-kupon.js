/* Hedef oranlı kupon (20 Kas 2026, 2. sürüm).
 * 1) Maçlar ana sayfası: uygulamanın "Günün düşük riskli kuponu" kutusuna (coupon()) sekmeler eklenir:
 *    Düşük risk | 2.00 | 3.00 | 5.00. Hedef sekmesinde o günün başlamamış maçlarından kupon kurulur.
 * 2) Simülatör: "+ Yeni kupon" yanına "Hedef orana göre kur" düğmesi; pencerede önümüzdeki 48 saatin maçlarından kurar.
 * Kural: yalnızca SAĞLAM seçimler (ihtimal %65-93, model seçimleri pick(m).o), maç başına en çok bir seçim. Tahmini oranların
 * çarpımı hedefi geçen ve birlikte tutma ihtimali en yüksek kombinasyon dinamik programlamayla bulunur. Maç sayısı Otomatik
 * (en yüksek ihtimal) ya da kullanıcının seçtiği 2/3/4. Satırlar uygulamanın kendi kupon satırıyla (cl: "Neden bu seçim?")
 * çizilir, ekleme uygulamanın "data-kall" akışıyla (KPC). Bahis tavsiyesi değildir; hiçbir bahis risksiz değildir.
 */
(function () {
  if (typeof window.kupHtml !== 'function' || typeof pick !== 'function' || typeof KPC === 'undefined' || typeof cl !== 'function') return;

  var HEDEFLER = [2, 3, 5], SAYILAR = [0, 2, 3, 4], ADIM = 0.01, MAXSEC = 8, PMIN = 0.65, PMAX = 0.93, SAAT = 48;
  var ls = function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  var lsy = function (k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { } };
  var sekme = ls('km_hedef2', 'lo'); if (sekme !== 'lo' && HEDEFLER.indexOf(+sekme) < 0) sekme = 'lo';
  var sayi = +ls('km_hedefn', 0); if (SAYILAR.indexOf(sayi) < 0) sayi = 0;
  var mHedef = 2; // pencere (simülatör) hedefi

  function adaylar(ms) {
    var now = Date.now(), out = [];
    (ms || []).forEach(function (m) {
      if (!m || m.np || !m.p || +m.t <= now + 10 * 60e3) return;
      try { if (stt(m).k !== 'wait') return; } catch (e) { return; }
      var sec = [];
      (pick(m).o || []).forEach(function (x) {
        var p = null, o = null; try { p = kprob(m, x.k); o = kodd(m, x.k); } catch (e) { }
        if (!p || !o || p < PMIN || p > PMAX || o < 1.08) return;
        sec.push({ m: m, k: x.k, p: p, o: o });
      });
      if (sec.length) out.push(sec);
    });
    return out;
  }

  // log(oran) toplamı >= log(T), log(p) toplamı en büyük; n=0: en iyi sayı, n>0: tam n seçim
  function kur(ms, T, n) {
    var G = adaylar(ms); if (!G.length) return { yok: 'aday' };
    var cap = Math.ceil(Math.log(T) / ADIM), NEG = -1e9, K = MAXSEC + 1, W = (cap + 1) * K;
    var idx = function (b, c) { return b * K + c; };
    var dp = new Float64Array(W).fill(NEG); dp[0] = 0;
    var izler = [];
    G.forEach(function (sec) {
      var nd = dp.slice(), iz = new Int32Array(W).fill(-1);
      for (var b = 0; b <= cap; b++) for (var c = 0; c < MAXSEC; c++) {
        var v = dp[idx(b, c)]; if (v <= NEG / 2) continue;
        for (var j = 0; j < sec.length; j++) {
          var x = sec[j], k = idx(Math.min(cap, b + Math.floor(Math.log(x.o) / ADIM)), c + 1), nv = v + Math.log(x.p);
          if (nv > nd[k] + 1e-12) { nd[k] = nv; iz[k] = j * W + idx(b, c); }
        }
      }
      izler.push(iz); dp = nd;
    });
    var best = -1, bv = NEG;
    for (var c = 1; c <= MAXSEC; c++) { if (n && c !== n) continue; var v = dp[idx(cap, c)]; if (v > bv + 1e-12) { bv = v; best = idx(cap, c); } }
    if (best < 0) return { yok: n ? 'sayi' : 'hedef' };
    var legs = [], cur = best;
    for (var g = G.length - 1; g >= 0; g--) { var z = izler[g][cur]; if (z < 0) continue; legs.push(G[g][Math.floor(z / W)]); cur = z % W; }
    legs.sort(function (a, b) { return +a.m.t - +b.m.t; });
    return { legs: legs, od: legs.reduce(function (a, x) { return a * x.o; }, 1), p: legs.reduce(function (a, x) { return a * x.p; }, 1) };
  }

  var cips = function (attr, list, on, fmt) { return list.map(function (v) { return '<button class="hk-c' + (String(v) === String(on) ? ' on' : '') + '" ' + attr + '="' + v + '">' + fmt(v) + '</button>'; }).join(''); };
  var sayiCips = function () { return '<div class="hk-n"><span>Maç sayısı</span>' + cips('data-khn', SAYILAR, sayi, function (v) { return v ? v : 'Otomatik'; }) + '</div>'; };

  // hedef paneli: uygulamanın kupon satırları + toplam + Kupona ekle
  function panel(ms, T) {
    var r = kur(ms, T, sayi), h = sayiCips();
    if (!r.legs) {
      var t = r.yok === 'aday' ? 'Bu aralıkta %65 üzeri sağlam seçim yok.' : r.yok === 'sayi' ? sayi + ' maçla ' + T.toFixed(2) + ' oranına sağlam seçimlerle ulaşılamıyor. Maç sayısını artır ya da Otomatik seç.' : 'Sağlam seçimlerle ' + T.toFixed(2) + ' oranına ulaşılamıyor. Daha düşük bir hedef dene.';
      return h + '<p class="mut hk-bos">' + t + '</p>';
    }
    var i = KPC.push(r.legs.map(function (x) { return { mk: [x.m.c, x.m.h, x.m.a].join('|'), k: x.k }; })) - 1;
    return h + '<div class="mut">Her seçimin ihtimali en az %65. Model, ' + T.toFixed(2) + ' oranına ulaşan en yüksek ihtimalli birleşimi seçti. Hiçbir bahis risksiz değildir.</div>' +
      r.legs.map(function (x) { return cl({ m: x.m }, { k: x.k, p: x.p, o: 1 / x.p }); }).join('') +
      '<div class="pk"><span class="big">' + r.od.toFixed(2) + '</span><span class="s">Toplam tahmini oran<br>Birlikte tutma ihtimali ~%' + Math.round(r.p * 100) + '</span></div>' +
      '<button class="kpb" data-kall="' + i + '">Kupona ekle (' + r.legs.length + ' seçim)</button>';
  }
  function ozet(ms, T) { var r = kur(ms, T, sayi); return r.legs ? 'Hedef ' + T.toFixed(2) + ' · ' + r.legs.length + ' seçim · tahmini oran ' + r.od.toFixed(2) : 'Hedef ' + T.toFixed(2); }

  /* ---------- 1) Maçlar ana sayfası: Günün kuponu sekmeleri ---------- */
  var KUTU = [];
  if (typeof window.coupon === 'function') {
    var _coupon = window.coupon;
    window.coupon = function (ms, ttl) {
      var h = _coupon.apply(this, arguments);
      try {
        if (!adaylar(ms).length) return h; // gecmis gun ya da baslamamis mac yok
        var id = KUTU.push(ms) - 1, kutu = /^<details class='box cpn'/.test(h);
        var bas = kutu ? h.slice(0, h.indexOf('</summary>')) : "<details class='box cpn' id='cpd'><summary class='cps'><h3>Günün kuponu</h3><span class='mut'></span></summary>";
        var lo = kutu ? h.slice(h.indexOf('</summary>') + 10, h.lastIndexOf('</details>')) : (h || '<p class="mut">Bu gün düşük riskli kupon yok.</p>');
        var loOz = (bas.match(/<span class='mut'>([^<]*)<\/span>$/) || [])[1] || '';
        bas = bas.replace(/<h3>[^<]*<\/h3>/, '<h3>Günün kuponu</h3>');
        if (sekme !== 'lo') bas = bas.replace(/<span class='mut'>[^<]*<\/span>$/, "<span class='mut'>" + ozet(ms, +sekme) + '</span>');
        else if (loOz) bas = bas.replace(/<span class='mut'>[^<]*<\/span>$/, "<span class='mut'>Düşük risk · " + loOz + '</span>');
        var tabs = '<div class="hk-t" data-hkid="' + id + '">' + cips('data-khs', ['lo'].concat(HEDEFLER), sekme, function (v) { return v === 'lo' ? 'Düşük risk' : (+v).toFixed(2); }) + '</div>';
        return bas + '</summary>' + tabs + '<div class="hk-lo"' + (sekme === 'lo' ? '' : ' hidden') + ' data-lo-oz="' + loOz.replace(/"/g, '') + '">' + lo + '</div><div class="hk-p">' + (sekme === 'lo' ? '' : panel(ms, +sekme)) + '</div></details>';
      } catch (e) { if (window.console) console.warn('hedef-kupon (gunun kuponu):', e); return h; }
    };
  }
  function kutuyuCiz(el) {
    var t = el.querySelector('.hk-t'), ms = KUTU[+t.getAttribute('data-hkid')]; if (!ms) return;
    t.querySelectorAll('[data-khs]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-khs') === String(sekme)); });
    var lo = el.querySelector('.hk-lo'), p = el.querySelector('.hk-p'), oz = el.querySelector('summary .mut');
    if (sekme === 'lo') { lo.hidden = false; p.innerHTML = ''; if (oz) oz.textContent = lo.getAttribute('data-lo-oz') ? 'Düşük risk · ' + lo.getAttribute('data-lo-oz') : ''; }
    else { lo.hidden = true; p.innerHTML = panel(ms, +sekme); if (oz) oz.textContent = ozet(ms, +sekme); }
  }

  /* ---------- 2) Simülatör: Hedef orana göre kur penceresi ---------- */
  var gelecek = function () { var s = Date.now() + SAAT * 3600e3; return (R || []).filter(function (m) { return +m.t <= s; }); };
  function pencereIc() {
    return '<div class="hk-mh"><b>Hedef orana göre kur</b><button class="hk-x" data-khx="1" aria-label="Kapat">✕</button></div>' +
      '<p class="mut">Önümüzdeki ' + SAAT + ' saatin maçlarından, hedef orana ulaşan en yüksek ihtimalli sağlam seçimler.</p>' +
      '<div class="hk-t">' + cips('data-khm', HEDEFLER, mHedef, function (v) { return (+v).toFixed(2); }) + '</div>' +
      '<div class="hk-p">' + panel(gelecek(), mHedef) + '</div>';
  }
  function pencereAc() {
    var e = document.getElementById('kmhkm'); if (e) e.remove();
    e = document.createElement('div'); e.id = 'kmhkm';
    e.innerHTML = '<div class="hk-m box cpn" role="dialog" aria-modal="true">' + pencereIc() + '</div>';
    e.addEventListener('click', function (ev) { if (ev.target === e) e.remove(); });
    document.body.appendChild(e);
  }
  var DUGME = '<button class="kpb2 smk-pl hk-b" data-kho="1">Hedef orana göre kur</button>';
  var _kupHtml = window.kupHtml;
  window.kupHtml = function () {
    var h = _kupHtml();
    try {
      var m1 = "data-kgok='1'>+ Yeni kupon</button>", m2 = "Arkadaş kuponu</button>", m3 = "<button class='kpb sme-go' data-kgok='1'>Maçlara git</button>", i;
      if ((i = h.indexOf(m3)) >= 0) h = h.slice(0, i + m3.length) + '<button class="kpb2 hk-b hk-bw" data-kho="1">Hedef orana göre hazır kupon kur</button>' + h.slice(i + m3.length);
      else if ((i = h.indexOf(m1)) >= 0) h = h.slice(0, i + m1.length) + DUGME + h.slice(i + m1.length);
      else if ((i = h.indexOf(m2)) >= 0) h = h.slice(0, i + m2.length) + DUGME + h.slice(i + m2.length);
      else h = '<div class="hk-ust">' + DUGME + '</div>' + h;
    } catch (e) { if (window.console) console.warn('hedef-kupon (simulator):', e); }
    return h;
  };

  /* ---------- tıklamalar ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null; if (!t) return;
    var b;
    if ((b = t.closest('[data-kho]'))) { e.preventDefault(); e.stopPropagation(); pencereAc(); return; }
    if ((b = t.closest('[data-khx]'))) { e.preventDefault(); e.stopPropagation(); var w = document.getElementById('kmhkm'); if (w) w.remove(); return; }
    if ((b = t.closest('[data-kall]')) && b.closest('#kmhkm')) { setTimeout(function () { var w = document.getElementById('kmhkm'); if (w) w.remove(); }, 0); return; }
    if ((b = t.closest('[data-khs]'))) {
      e.preventDefault(); e.stopPropagation();
      var v = b.getAttribute('data-khs'); sekme = v === 'lo' ? 'lo' : +v; lsy('km_hedef2', sekme);
      var k = b.closest('details'); if (k) kutuyuCiz(k); return;
    }
    if ((b = t.closest('[data-khm]'))) {
      e.preventDefault(); e.stopPropagation(); mHedef = +b.getAttribute('data-khm');
      var m = document.querySelector('#kmhkm .hk-m'); if (m) m.innerHTML = pencereIc(); return;
    }
    if ((b = t.closest('[data-khn]'))) {
      e.preventDefault(); e.stopPropagation(); sayi = +b.getAttribute('data-khn'); lsy('km_hedefn', sayi);
      var mm = b.closest('#kmhkm .hk-m'); if (mm) { mm.innerHTML = pencereIc(); return; }
      var kk = b.closest('details'); if (kk) kutuyuCiz(kk);
    }
  }, true);

  (function css() {
    var s = document.createElement('style');
    s.textContent = '.hk-t{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 8px}.hk-n{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 8px;font-size:12.5px;color:var(--mut)}.hk-n span{margin-right:2px}' +
      '.hk-c{font:600 13px var(--f,inherit);padding:6px 13px;border-radius:999px;border:1px solid var(--ln);background:none;color:var(--mut);cursor:pointer}.hk-n .hk-c{padding:4px 10px;font-size:12px}' +
      '.hk-c.on{background:var(--sf2,var(--sf));color:var(--ink);border-color:var(--ink)}.hk-bos{margin:6px 0}' +
      '#kmhkm{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}' +
      '#kmhkm .hk-m{max-width:460px;width:100%;max-height:calc(100vh - 32px);overflow:auto;margin:0;background:var(--bg)}' +
      '.hk-mh{display:flex;justify-content:space-between;align-items:center;gap:10px}.hk-mh b{font-size:17px}.hk-x{background:none;border:0;color:var(--mut);font-size:18px;cursor:pointer;padding:4px 8px}' +
      '.hk-ust{display:flex;justify-content:flex-end;margin:0 0 10px}.hk-bw{width:100%!important;margin-top:10px!important}';
    document.head.appendChild(s);
  })();

  window.KMHK = { kur: kur, adaylar: adaylar };
})();
