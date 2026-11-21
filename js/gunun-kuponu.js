/* Günün kuponu: risk sekmeleri (21 Kas 2026).
 * Maçlar ana sayfasındaki "Günün düşük riskli kuponu" kutusu (uygulamanın coupon() fonksiyonu) sarılır ve başlık
 * "Günün kuponu" olur; sekmeler: Düşük risk | Orta risk | Yüksek risk.
 *  - Düşük risk: uygulamanın kendi kuponu (değişmedi; ihtimal %70-87).
 *  - Orta risk: ihtimali %55-67 olan seçimler, bandın ortasına (%61) en yakın en çok 3 tanesi (dengeli).
 *  - Yüksek risk: ihtimali %33-47 olan seçimler, bandın ortasına (%40) en yakın en çok 2 tanesi (yüksek oran).
 * Her maçtan en çok bir seçim; seçim sayısını sistem belirler (uygun seçim azsa daha az, hiç yoksa "yok" yazar).
 * Lig sayfasında (Genel bakış) aynı kutu "Haftanın kuponu" adıyla, o ligin 7 gün içindeki maçlarından.
 * Yalnızca başlamamış maçlar. Satırlar uygulamanın kupon satırıyla (cl: "Neden bu seçim?"), ekleme "data-kall" (KPC).
 * Bahis tavsiyesi değildir; hiçbir bahis risksiz değildir.
 */
(function () {
  if (typeof window.coupon !== 'function' || typeof cl !== 'function' || typeof KPC === 'undefined' || typeof kprob !== 'function') return;

  var KAT = {
    orta: { ad: 'Orta risk', lo: 0.55, hi: 0.675, h: 0.61, n: 3, keys: ['1', '2', '1X', 'X2', 'Ü1.5', 'Ü2.5', 'KG Var', 'EG1', 'DG1'] },
    yuksek: { ad: 'Yüksek risk', lo: 0.33, hi: 0.475, h: 0.40, n: 2, keys: ['1', '2', 'Ü2.5', 'Ü3.5', 'KG Var', 'EG2', 'DG1'] }
  };
  var SIRA = ['lo', 'orta', 'yuksek'], sekme = 'lo', KUTU = [], BASLIK = null;

  var bekleyen = function (ms) { var now = Date.now(); return (ms || []).filter(function (m) { try { return m && !m.np && m.p && +m.t > now + 10 * 60e3 && stt(m).k === 'wait'; } catch (e) { return false; } }); };

  // kategori icin secimler: her mactan bandin ortasina en yakin secim, sonra ortaya en yakin n tanesi (mac saatine gore sirali)
  function sec(ms, kat) {
    var K = KAT[kat], out = [];
    bekleyen(ms).forEach(function (m) {
      var best = null;
      K.keys.forEach(function (k) {
        var p = null; try { p = kprob(m, k); } catch (e) { }
        if (p && p >= K.lo && p < K.hi && (!best || Math.abs(p - K.h) < Math.abs(best.p - K.h))) best = { m: m, k: k, p: p };
      });
      if (best) out.push(best);
    });
    out.sort(function (a, b) { return Math.abs(a.p - K.h) - Math.abs(b.p - K.h); });
    return out.slice(0, K.n).sort(function (a, b) { return +a.m.t - +b.m.t; });
  }
  var oranOf = function (x) { try { return kodd(x.m, x.k) || 1 / x.p; } catch (e) { return 1 / x.p; } };

  function panel(ms, kat) {
    var L = sec(ms, kat), K = KAT[kat];
    if (!L.length) return '<p class="mut">Bu gün ' + K.ad.toLowerCase() + ' bandında uygun seçim yok.</p>';
    var od = L.reduce(function (a, x) { return a * oranOf(x); }, 1), p = L.reduce(function (a, x) { return a * x.p; }, 1);
    var i = KPC.push(L.map(function (x) { return { mk: [x.m.c, x.m.h, x.m.a].join('|'), k: x.k }; })) - 1;
    return L.map(function (x) { return cl({ m: x.m }, { k: x.k, p: x.p, o: 1 / x.p }); }).join('') +
      '<div class="pk"><span class="big">' + od.toFixed(2) + '</span><span class="s">Toplam tahmini oran<br>Birlikte tutma ihtimali ~%' + Math.round(p * 100) + '</span></div>' +
      '<button class="kpb" data-kall="' + i + '">Kupona ekle (' + L.length + ' seçim)</button>';
  }
  function ozet(ms, kat) {
    var L = sec(ms, kat); if (!L.length) return KAT[kat].ad;
    return KAT[kat].ad + ' · ' + L.length + ' seçim · tahmini oran ' + L.reduce(function (a, x) { return a * oranOf(x); }, 1).toFixed(2);
  }

  var _coupon = window.coupon;
  window.coupon = function (ms, ttl) {
    var h = _coupon.apply(this, arguments);
    try {
      if (!bekleyen(ms).length) return h; // gecmis gun: eski kutu aynen
      var id = KUTU.push(ms) - 1, kutu = /^<details class='box cpn'/.test(h);
      var bas = kutu ? h.slice(0, h.indexOf('</summary>')) : "<details class='box cpn' id='cpd'><summary class='cps'><h3>Günün kuponu</h3><span class='mut'></span></summary>";
      var lo = kutu ? h.slice(h.indexOf('</summary>') + 10, h.lastIndexOf('</details>')).replace(/^<div class='mut'>[^<]*<\/div>/, '') : (h || '<p class="mut">Bu gün düşük riskli kupon yok.</p>');
      var loOz = (bas.match(/<span class='mut'>([^<]*)<\/span>$/) || [])[1] || '';
      var oz = sekme === 'lo' ? (loOz ? 'Düşük risk · ' + loOz : 'Düşük risk') : ozet(ms, sekme);
      bas = bas.replace(/<h3>[^<]*<\/h3>/, '<h3>' + (BASLIK || 'Günün kuponu') + '</h3>').replace(/<span class='mut'>[^<]*<\/span>$/, "<span class='mut'>" + oz + '</span>');
      var tabs = '<div class="gk-t" data-gkid="' + id + '">' + SIRA.map(function (k) { return '<button class="gk-c' + (k === sekme ? ' on' : '') + '" data-gks="' + k + '">' + (k === 'lo' ? 'Düşük risk' : KAT[k].ad) + '</button>'; }).join('') + '</div>';
      return bas + '</summary>' + tabs + '<div class="gk-lo"' + (sekme === 'lo' ? '' : ' hidden') + ' data-oz="' + loOz.replace(/"/g, '') + '">' + lo + '</div><div class="gk-p">' + (sekme === 'lo' ? '' : panel(ms, sekme)) + '</div></details>';
    } catch (e) { if (window.console) console.warn('gunun-kuponu:', e); return h; }
  };

  /* Lig sayfası (Genel bakış): o ligin önümüzdeki 7 gündeki maçlarından aynı kutu, "Haftanın kuponu", ilk kartın üstünde */
  if (typeof window.leagueView === 'function') {
    var _lv = window.leagueView;
    window.leagueView = function (c) {
      var h = _lv.apply(this, arguments);
      try {
        if (typeof LGS !== 'undefined' && LGS && LGS.c === c && LGS.s && LGS.s !== 'o') return h;
        var son = Date.now() + 7 * 864e5, ms = bekleyen((R || []).filter(function (m) { return m.c === c && +m.t <= son; }));
        if (!ms.length) return h;
        BASLIK = 'Haftanın kuponu';
        var k; try { k = window.coupon(ms); } finally { BASLIK = null; }
        if (!k || k.indexOf('gk-t') < 0) return h;
        k = k.replace("<details class='box cpn' id='cpd'", "<details class='box cpn gk-lig' id='cpd' open");
        var i = h.indexOf('<section'); return i >= 0 ? h.slice(0, i) + k + h.slice(i) : h + k;
      } catch (e) { if (window.console) console.warn('gunun-kuponu (lig):', e); return h; }
    };
  }

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-gks]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var el = b.closest('details'), t = el && el.querySelector('.gk-t'), ms = t && KUTU[+t.getAttribute('data-gkid')]; if (!ms) return;
    sekme = b.getAttribute('data-gks'); if (SIRA.indexOf(sekme) < 0) sekme = 'lo';
    t.querySelectorAll('[data-gks]').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-gks') === sekme); });
    var lo = el.querySelector('.gk-lo'), p = el.querySelector('.gk-p'), oz = el.querySelector('summary .mut');
    if (sekme === 'lo') { lo.hidden = false; p.innerHTML = ''; if (oz) oz.textContent = lo.getAttribute('data-oz') ? 'Düşük risk · ' + lo.getAttribute('data-oz') : 'Düşük risk'; }
    else { lo.hidden = true; p.innerHTML = panel(ms, sekme); if (oz) oz.textContent = ozet(ms, sekme); }
  }, true);

  (function css() {
    var s = document.createElement('style');
    s.textContent = '.gk-t{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0 6px}' +
      '.gk-c{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:600 13px var(--f,inherit);padding:7px 4px;border-radius:999px;border:1px solid var(--ln);background:none;color:var(--mut);cursor:pointer}' +
      '.gk-lig{margin-bottom:12px}.gk-c.on{background:var(--sf2,var(--sf));color:var(--ink);border-color:var(--ink)}' +
      '@media (max-width:360px){.gk-t{gap:4px}.gk-c{font-size:11.5px;padding:7px 1px;letter-spacing:-.1px}}';
    document.head.appendChild(s);
  })();

  window.KMGK = { sec: sec };
})();
