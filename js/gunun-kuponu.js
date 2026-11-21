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
  var SIRA = ['lo', 'orta', 'yuksek'], sekme = 'lo', KUTU = [], BASLIK = null, MIK = 0;
  var miktar = function () { var v = MIK || (typeof KPST !== 'undefined' && +KPST) || 10; return String(v); };

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
      return bas + '</summary>' + tabs + '<div class="gk-lo"' + (sekme === 'lo' ? '' : ' hidden') + ' data-oz="' + loOz.replace(/"/g, '') + '">' + lo + '</div><div class="gk-p">' + (sekme === 'lo' ? '' : panel(ms, sekme)) + '</div><div class="gk-shr"><label>Miktar<input data-gkst inputmode="decimal" value="' + miktar() + '"></label><button class="gk-sh" data-gksh="1">Görsel olarak paylaş</button></div></details>';
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

  /* Paylaşılabilir görsel (21 Kas 2026): görünen sekmenin kuponu 1080x1350 PNG olur (Instagram/X/WhatsApp).
   * Telefonda paylaşım menüsü açılır (Web Share), olmazsa dosya iner. Köşede simuleto.com; "simülasyon, bahis tavsiyesi değildir". */
  function satirSar(ctx, t, w) { var k = String(t).split(' '), out = [], cur = ''; k.forEach(function (x) { var y = cur ? cur + ' ' + x : x; if (ctx.measureText(y).width > w && cur) { out.push(cur); cur = x; } else cur = y; }); if (cur) out.push(cur); return out; }
  function kirp(ctx, t, w) { t = String(t); if (ctx.measureText(t).width <= w) return t; while (t.length > 1 && ctx.measureText(t + '…').width > w) t = t.slice(0, -1); return t + '…'; }
  // marka logosu: "simulet" + top seklinde "o" (index.html #kmball yolu, uygulamadaki .wm ile ayni oranlar)
  function logo(x, F, X, Y, sz) {
    x.save(); x.fillStyle = '#e8edf1'; x.font = '700 ' + sz + 'px ' + F; try { x.letterSpacing = (-0.035 * sz) + 'px'; } catch (e) { }
    x.fillText('simulet', X, Y); var w = x.measureText('simulet').width; try { x.letterSpacing = '0px'; } catch (e) { }
    var el = document.getElementById('kmball'), d = el && el.getAttribute('d'), b = 0.63 * sz, bx = X + w + 0.045 * sz, by = Y - b + 0.012 * sz;
    if (d && window.Path2D) {
      var k = b / 424; x.translate(bx, by); x.scale(k, k); x.translate(-44, -44);
      var pth = new Path2D(d); x.fillStyle = '#8EAAEB'; x.strokeStyle = '#8EAAEB'; x.lineWidth = 16; x.lineJoin = 'round'; x.fill(pth, 'evenodd'); x.stroke(pth);
    } else { x.fillText('o', bx, Y); }
    x.restore();
  }
  var para = function (v) { return (+v).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  function gorsel(baslik, risk, legs, mik) {
    var W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d'), F = (getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif');
    var RC = { 'Düşük risk': '#22a565', 'Orta risk': '#e0a030', 'Yüksek risk': '#e05248' }[risk] || '#7f8ea0';
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141d27'); g.addColorStop(1, '#0b1117'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    var P = 72;
    x.textBaseline = 'alphabetic'; logo(x, F, P, 122, 64);
    x.fillStyle = '#93a1ad'; x.font = '500 30px ' + F; x.textAlign = 'right';
    x.fillText(new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' }), W - P, 118); x.textAlign = 'left';
    x.fillStyle = '#ffffff'; x.font = '800 74px ' + F; x.fillText(baslik, P, 250);
    x.font = '700 34px ' + F; var bw = x.measureText(risk).width + 48;
    x.fillStyle = RC; x.beginPath(); if (x.roundRect) x.roundRect(P, 284, bw, 60, 30); else x.rect(P, 284, bw, 60); x.fill();
    x.fillStyle = '#fff'; x.fillText(risk, P + 24, 326);
    var y = 390, kh = legs.length > 3 ? 158 : 186;
    legs.forEach(function (l) {
      x.fillStyle = 'rgba(255,255,255,.05)'; x.beginPath(); if (x.roundRect) x.roundRect(P, y, W - 2 * P, kh - 24, 26); else x.rect(P, y, W - 2 * P, kh - 24); x.fill();
      var ix = P + 32, rw = 210;
      x.fillStyle = '#ffffff'; x.font = '700 40px ' + F; x.fillText(kirp(x, l.mac, W - 2 * P - 64 - rw), ix, y + 60);
      x.fillStyle = '#93a1ad'; x.font = '500 28px ' + F; x.fillText(kirp(x, l.alt, W - 2 * P - 64 - rw), ix, y + 100);
      x.fillStyle = '#dfe6ec'; x.font = '600 34px ' + F; x.fillText(kirp(x, l.sec, W - 2 * P - 64 - rw), ix, y + 146);
      x.textAlign = 'right'; x.fillStyle = '#ffffff'; x.font = '800 56px ' + F; x.fillText(l.od.toFixed(2), W - P - 32, y + 82);
      x.fillStyle = '#93a1ad'; x.font = '600 30px ' + F; x.fillText('%' + Math.round(l.p * 100), W - P - 32, y + 124); x.textAlign = 'left';
      y += kh;
    });
    var od = legs.reduce(function (a, l) { return a * l.od; }, 1), pr = legs.reduce(function (a, l) { return a * l.p; }, 1);
    y = Math.max(y + 6, H - 368);
    x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(P, y, W - 2 * P, 2);
    x.fillStyle = '#ffffff'; x.font = '800 96px ' + F; x.fillText(od.toFixed(2), P, y + 120);
    x.fillStyle = '#93a1ad'; x.font = '500 30px ' + F; x.fillText('toplam tahmini oran', P, y + 166);
    x.textAlign = 'right'; x.fillStyle = '#ffffff'; x.font = '800 64px ' + F; x.fillText('%' + Math.round(pr * 100), W - P, y + 110);
    x.fillStyle = '#93a1ad'; x.font = '500 30px ' + F; x.fillText('birlikte tutma ihtimali', W - P, y + 166); x.textAlign = 'left';
    if (mik > 0) {
      var py = y + 196; x.fillStyle = 'rgba(255,255,255,.06)'; x.beginPath(); if (x.roundRect) x.roundRect(P, py, W - 2 * P, 78, 22); else x.rect(P, py, W - 2 * P, 78); x.fill();
      x.fillStyle = '#93a1ad'; x.font = '500 30px ' + F; x.fillText('Miktar', P + 30, py + 50);
      var mw = x.measureText('Miktar').width; x.fillStyle = '#ffffff'; x.font = '700 34px ' + F; x.fillText(para(mik), P + 30 + mw + 16, py + 51);
      x.textAlign = 'right'; x.fillStyle = '#3fd08a'; x.font = '800 38px ' + F; var kz = para(mik * od); x.fillText(kz, W - P - 30, py + 52);
      var kw = x.measureText(kz).width; x.fillStyle = '#93a1ad'; x.font = '500 30px ' + F; x.fillText('Olası kazanç', W - P - 30 - kw - 16, py + 50); x.textAlign = 'left';
    }
    x.fillStyle = '#6f7d89'; x.font = '500 22px ' + F; x.textAlign = 'center';
    x.fillText('simuleto.com · Simülasyondur, bahis tavsiyesi değildir · Hiçbir bahis risksiz değildir · 18+', W / 2, H - 50); x.textAlign = 'left';
    return cv;
  }
  function paylas(el) {
    var lo = el.querySelector('.gk-lo'), pan = sekme === 'lo' ? lo : el.querySelector('.gk-p'), b = pan && pan.querySelector('[data-kall]');
    var L = b ? KPC[+b.getAttribute('data-kall')] : null;
    if (!L || !L.length) { try { kToast('Paylaşılacak kupon yok', 2); } catch (e) { } return; }
    var legs = L.map(function (q) {
      var m = (R || []).find(function (r) { return [r.c, r.h, r.a].join('|') === q.mk; }); if (!m) return null;
      var p = null, od = null; try { p = kprob(m, q.k); od = kodd(m, q.k); } catch (e) { }
      if (!p) return null;
      var lig = (typeof LGNM !== 'undefined' && LGNM[m.c]) || m.c, saat = ''; try { saat = new Date(m.t).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); } catch (e) { }
      var sec = q.k; try { sec = String(labx(q.k, m)).replace(/\s*\([^)]*\)\s*$/, ''); } catch (e) { }
      return { mac: m.h + ' – ' + m.a, alt: lig + ' · ' + saat, sec: sec, p: p, od: od || 1 / p };
    }).filter(Boolean);
    if (!legs.length) return;
    var h3 = el.querySelector('summary h3'), risk = sekme === 'lo' ? 'Düşük risk' : KAT[sekme].ad;
    var inp = el.querySelector('[data-gkst]'), mik = inp ? parseFloat(String(inp.value).replace(',', '.')) : 0; if (!(mik > 0 && mik < 1e7)) mik = 0; else MIK = mik;
    var cv = gorsel(h3 ? h3.textContent : 'Günün kuponu', risk, legs, mik);
    cv.toBlob(function (blob) {
      if (!blob) return;
      var ad = 'simuleto-kupon.png', file = null; try { file = new File([blob], ad, { type: 'image/png' }); } catch (e) { }
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Simuleto', text: (h3 ? h3.textContent : 'Günün kuponu') + ' · ' + risk + ' · simuleto.com' }).catch(function () { });
        return;
      }
      var u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = ad; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
      try { kToast('Kupon görseli indirildi', 1); } catch (e) { }
    }, 'image/png');
  }
  window.KMGK_gorsel = gorsel;

  document.addEventListener('click', function (e) {
    var sh = e.target && e.target.closest && e.target.closest('[data-gksh]');
    if (sh) { e.preventDefault(); e.stopPropagation(); var d = sh.closest('details'); if (d) paylas(d); return; }
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
      '.gk-shr{display:flex;gap:8px;align-items:center;margin:8px 0 0}.gk-shr label{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--mut);flex:none}.gk-shr input{width:64px;font:600 13.5px var(--f,inherit);padding:8px 10px;border-radius:999px;border:1px solid var(--ln);background:none;color:var(--ink);text-align:center}' +
      '.gk-sh{display:block;flex:1;min-width:0;margin:0;padding:9px 12px;border-radius:999px;border:1px solid var(--ln);background:none;color:var(--ink);font:600 13.5px var(--f,inherit);cursor:pointer}.gk-sh:hover{border-color:var(--ink)}' +
      '.gk-lig{margin-bottom:12px}.gk-c.on{background:var(--sf2,var(--sf));color:var(--ink);border-color:var(--ink)}' +
      '@media (max-width:360px){.gk-t{gap:4px}.gk-c{font-size:11.5px;padding:7px 1px;letter-spacing:-.1px}}';
    document.head.appendChild(s);
  })();

  window.KMGK = { sec: sec };
})();
