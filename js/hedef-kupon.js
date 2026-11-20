/* Hedef oranlı kupon kurucu (20 Kas 2026): Simülatör sayfasının başına konur.
 * Kullanıcı bir hedef oran seçer (1.50 / 2.00 / 3.00 / 5.00). Önümüzdeki 48 saatte başlayacak maçların model seçimlerinden
 * (pick(m).o, her maçtan en çok bir seçim), tahmini oranların çarpımı hedefe ulaşan ve birlikte tutma ihtimali EN YÜKSEK
 * kombinasyon dinamik programlamayla bulunur. Düşük oranlı "banko" seçimler böylece kullanılabilir bir kupona dönüşür.
 * Ekleme uygulamanın kendi "data-kall" akışıyla (KPC) yapılır. Bahis tavsiyesi değildir; hiçbir bahis risksiz değildir.
 */
(function () {
  if (typeof window.kupHtml !== 'function' || typeof pick !== 'function' || typeof KPC === 'undefined') return;

  var HEDEFLER = [1.5, 2, 3, 5], ADIM = 0.01, MAXSEC = 6, PMIN = 0.55, PMAX = 0.93, SAAT = 48;
  var hedef = 2;
  try { var kh = parseFloat(localStorage.getItem('km_hedef')); if (HEDEFLER.indexOf(kh) >= 0) hedef = kh; } catch (e) { }

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var oran = function (m, k) { try { return kodd(m, k); } catch (e) { return null; } };
  var ihtimal = function (m, k) { try { return kprob(m, k); } catch (e) { return null; } };
  var etiket = function (k, m) { try { return labx(k, m); } catch (e) { return k; } };

  function adaylar() {
    var now = Date.now(), son = now + SAAT * 3600e3, out = [];
    (R || []).forEach(function (m) {
      if (!m || m.np || !m.p || +m.t <= now + 10 * 60e3 || +m.t > son) return;
      try { if (stt(m).k !== 'wait') return; } catch (e) { return; }
      var sec = [];
      (pick(m).o || []).forEach(function (x) {
        var p = ihtimal(m, x.k), o = oran(m, x.k);
        if (!p || !o || p < PMIN || p > PMAX || o < 1.08) return;
        sec.push({ m: m, k: x.k, p: p, o: o });
      });
      if (sec.length) out.push(sec);
    });
    return out;
  }

  // en iyi kombinasyon: log(oran) toplamı >= log(hedef), log(p) toplamı en büyük, en çok MAXSEC seçim
  function kur(T) {
    var G = adaylar(); if (!G.length) return null;
    var cap = Math.ceil(Math.log(T) / ADIM), NEG = -1e9;
    var W = (cap + 1) * (MAXSEC + 1), idx = function (b, n) { return b * (MAXSEC + 1) + n; };
    var dp = new Float64Array(W).fill(NEG); dp[idx(0, 0)] = 0;
    var izler = [];
    G.forEach(function (sec) {
      var nd = dp.slice(), iz = new Int32Array(W).fill(-1); // -1: bu maç alınmadı
      for (var b = 0; b <= cap; b++) for (var n = 0; n < MAXSEC; n++) {
        var v = dp[idx(b, n)]; if (v <= NEG / 2) continue;
        sec.forEach(function (x, j) {
          var nb = Math.min(cap, b + Math.floor(Math.log(x.o) / ADIM)), k = idx(nb, n + 1), nv = v + Math.log(x.p);
          if (nv > nd[k] + 1e-12) { nd[k] = nv; iz[k] = j * W + idx(b, n); }
        });
      }
      izler.push(iz); dp = nd;
    });
    var best = -1, bv = NEG;
    for (var n = 1; n <= MAXSEC; n++) { var v = dp[idx(cap, n)]; if (v > bv + 1e-12) { bv = v; best = idx(cap, n); } }
    if (best < 0) return null;
    var legs = [], cur = best;
    for (var g = G.length - 1; g >= 0; g--) {
      var z = izler[g][cur]; if (z < 0) continue;
      legs.push(G[g][Math.floor(z / W)]); cur = z % W;
    }
    legs.sort(function (a, b) { return +a.m.t - +b.m.t; });
    var od = legs.reduce(function (a, x) { return a * x.o; }, 1), p = legs.reduce(function (a, x) { return a * x.p; }, 1);
    return { legs: legs, od: od, p: p };
  }

  function saat(m) { try { var d = new Date(m.t); return d.toLocaleDateString('tr-TR', { weekday: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }

  function kutu() {
    var r = null; try { r = kur(hedef); } catch (e) { if (window.console) console.warn('hedef-kupon:', e); }
    var cips = HEDEFLER.map(function (h) { return '<button class="hk-c' + (h === hedef ? ' on' : '') + '" data-khd="' + h + '">' + h.toFixed(2) + '</button>'; }).join('');
    var ic;
    if (!r) ic = '<p class="mut">Önümüzdeki ' + SAAT + ' saatte bu hedefe uygun seçim yok. Daha düşük bir hedef dene.</p>';
    else {
      var i = KPC.push(r.legs.map(function (x) { return { mk: [x.m.c, x.m.h, x.m.a].join('|'), k: x.k }; })) - 1;
      ic = r.legs.map(function (x) {
        return '<div class="hk-l"><div><b>' + esc(etiket(x.k, x.m)) + '</b><small>' + esc(x.m.h + ' – ' + x.m.a) + ' · ' + esc(saat(x.m)) + '</small></div><div class="hk-r"><span>%' + Math.round(x.p * 100) + '</span><em>' + x.o.toFixed(2) + '</em></div></div>';
      }).join('') +
        '<div class="hk-t"><div><span class="hk-big">' + r.od.toFixed(2) + '</span><small>toplam tahmini oran</small></div><div><span class="hk-big">%' + Math.round(r.p * 100) + '</span><small>birlikte tutma ihtimali</small></div></div>' +
        '<button class="kpb" data-kall="' + i + '">Kupona ekle (' + r.legs.length + ' seçim)</button>';
    }
    return '<div class="box hk" id="kmhk"><h3>Hedef oranlı kupon<small>simülasyon</small></h3>' +
      '<p class="hk-a">Hedef oranı seç; model, bu orana ulaşan en yüksek ihtimalli seçimleri birleştirsin. Düşük oranlı seçimler tek başına anlamsız görünse de kuponun sağlam parçası olur.</p>' +
      '<div class="hk-cs">' + cips + '</div>' + ic +
      '<div class="ka-note">Oranlar modelin tahmini oranıdır, bahis sitesi oranı değildir. Seçimler önümüzdeki ' + SAAT + ' saatteki maçlardan, her maçtan en çok bir tane. Bahis tavsiyesi değildir; hiçbir bahis risksiz değildir.</div></div>';
  }

  (function css() {
    var s = document.createElement('style');
    s.textContent = '.hk{padding:12px 14px}.hk h3{margin:0 0 4px}.hk h3 small{font-weight:500;opacity:.65;font-size:12px;margin-left:6px}' +
      '.hk-a{font-size:13px;opacity:.8;margin:4px 0 8px;line-height:1.45}.hk-cs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}' +
      '.hk-c{font:inherit;font-weight:700;font-size:13.5px;padding:6px 14px;border-radius:99px;border:1px solid var(--ln,#2a3a46);background:transparent;color:inherit;cursor:pointer}' +
      '.hk-c.on{background:var(--acc,#1b7a4b);border-color:var(--acc,#1b7a4b);color:#fff}' +
      '.hk-l{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid var(--ln,#2a3a46);padding:8px 0}.hk-l b{font-size:14px;line-height:1.3}.hk-l small{display:block;opacity:.65;font-size:12px;margin-top:2px}' +
      '.hk-r{display:flex;gap:10px;align-items:center;flex:none;font-weight:700}.hk-r em{font-style:normal;opacity:.7;font-weight:600}' +
      '.hk-t{display:flex;gap:24px;border-top:1px solid var(--ln,#2a3a46);padding:10px 0 8px}.hk-big{font:800 24px/1 var(--f,inherit);display:block}.hk-t small{font-size:12px;opacity:.65}';
    document.head.appendChild(s);
  })();

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-khd]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var h = parseFloat(b.getAttribute('data-khd')); if (HEDEFLER.indexOf(h) < 0 || h === hedef) return;
    hedef = h; try { localStorage.setItem('km_hedef', String(h)); } catch (x) { }
    var el = document.getElementById('kmhk'); if (!el) return;
    var w = document.createElement('div'); w.innerHTML = kutu(); el.replaceWith(w.firstChild);
  }, true);

  var _kupHtml = window.kupHtml;
  window.kupHtml = function () {
    var h = _kupHtml();
    try { h = kutu() + h; } catch (e) { if (window.console) console.warn('hedef-kupon ekleme:', e); }
    return h;
  };
  window.KMHK = { kur: kur };
})();
