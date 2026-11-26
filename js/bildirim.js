// Bildirimler (ornek, 25 Kas 2026): sag ustte zil. Yalnizca favori takimlarin (FAV) maclarinda (lig takibi bildirim uretmez)
// baslama, gol, devre arasi ve mac sonu olunca zilde sayi yanar, kisa ses calar, listeye yazilir. Veri: km_fx (fixtures-api.js her yuklemede yazar).
(function () {
  var K_LIST = 'km_bld', K_SNAP = 'km_bld_snap', K_SES = 'km_bld_ses', MAX = 40;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function jget(k, d) { try { var x = JSON.parse(ls(k) || 'null'); return x == null ? d : x; } catch (e) { return d; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var liste = jget(K_LIST, []), sesAcik = ls(K_SES) !== '0';
  // eski kayitlar: ornekleri ve favori olmayan takim bildirimlerini ayikla
  setTimeout(function () { var n0 = liste.length; liste = liste.filter(function (b) { return b.id && (b.kup || izlenir(b)); }); if (liste.length !== n0) { ls(K_LIST, JSON.stringify(liste)); ciz(); } }, 0);

  // ---- ses: iki tonlu kisa zil (WebAudio; ilk dokunusta kilit acilir)
  var ac = null;
  function sesKilit() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} }
  document.addEventListener('pointerdown', sesKilit, { once: true, capture: true });
  function cal() {
    if (!sesAcik) return; sesKilit(); if (!ac) return;
    var t = ac.currentTime;
    [[880, 0], [1320, 0.13]].forEach(function (n) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = n[0];
      g.gain.setValueAtTime(0.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(0.22, t + n[1] + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + 0.45);
      o.connect(g); g.connect(ac.destination); o.start(t + n[1]); o.stop(t + n[1] + 0.5);
    });
  }

  // ---- izlenen maclar
  function favlar() { try { return typeof FAV !== 'undefined' ? FAV : new Set(jget('fav', [])); } catch (e) { return new Set(); } }
  function izlenir(m) { var f = favlar(); return f.has(m.h) || f.has(m.a); }
  var CANLI = { '1H': 1, '2H': 1, ET: 1, P: 1, LIVE: 1 }, BIT = { FT: 1, AET: 1, PEN: 1 };
  function ligAd(c) { try { return (typeof N !== 'undefined' && N[c]) || c; } catch (e) { return c; } }
  function ekle(b) { b.at = Date.now(); b.yeni = 1; liste.unshift(b); if (liste.length > MAX) liste.length = MAX; ls(K_LIST, JSON.stringify(liste)); }

  function tara() {
    var kn = 0; try { kn = kupTara(); } catch (e) {} if (kn) { cal(); ciz(true); }
    var d = jget('km_fx', null); if (!d || !Array.isArray(d.m)) return;
    var snap = jget(K_SNAP, null), ilk = !snap, yeni = {}, n = 0;
    d.m.forEach(function (m) {
      if (!izlenir(m)) return;
      var sc = m.sc || [null, null]; yeni[m.id] = [m.st, sc[0], sc[1]];
      var o = snap && snap[m.id]; if (ilk || !o) return;
      var skor = (sc[0] == null ? '-' : sc[0]) + ' - ' + (sc[1] == null ? '-' : sc[1]);
      var b = { id: m.id, c: m.c, h: m.h, a: m.a, skor: skor };
      if (o[0] === 'NS' && CANLI[m.st]) { b.tip = 'basla'; b.baslik = 'Maç başladı'; ekle(b); n++; }
      if (sc[0] != null && (sc[0] > (o[1] || 0) || sc[1] > (o[2] || 0))) {
        var kim = sc[0] > (o[1] || 0) ? m.h : m.a;
        ekle({ id: m.id, c: m.c, h: m.h, a: m.a, skor: skor, tip: 'gol', baslik: 'GOL! ' + kim + (m.el ? " (" + m.el + "')" : '') }); n++;
      }
      if (m.st === 'HT' && o[0] !== 'HT') { b.tip = 'ht'; b.baslik = 'Devre arası'; ekle(Object.assign({}, b)); n++; }
      if (BIT[m.st] && !BIT[o[0]]) { b.tip = 'ms'; b.baslik = 'Maç sonucu'; ekle(Object.assign({}, b)); n++; }
    });
    ls(K_SNAP, JSON.stringify(yeni));
    if (n) { cal(); ciz(true); }
  }

  // ---- kupon takibi (26 Kas 2026): kayitli simulasyon kuponlarinda bir secim tutunca, kupon tamamen tutunca ve kupon tutmayinca
  var K_KSNAP = 'km_bld_ksnap';
  function kupTara() {
    var L; try { L = (typeof KPS !== 'undefined' && Array.isArray(KPS)) ? KPS : null; } catch (e) { L = null; } if (!L) return 0;
    var snap = jget(K_KSNAP, null), ilk = !snap, yeni = {}, n = 0;
    L.forEach(function (s) {
      if (!s || s.id == null || !Array.isArray(s.legs) || !s.legs.length) return;
      var o = (snap && snap[s.id]) || null, ad = s.name || 'Kupon';
      var leg = s.legs.map(function (l, i) {
        var eski = o && o.l ? o.l[i] : null, st = 'wait', m = null;
        try { m = kmatch(l); st = m ? pso(m, { k: l.k }) : 'wait'; } catch (e) {}
        if (st !== 'hit' && st !== 'miss') st = (eski === 'hit' || eski === 'miss') ? eski : 'wait'; // sonuc kalici (gun degisince R bosalsa da)
        if (o && st === 'hit' && eski !== 'hit' && m && s.legs.length > 1) {
          var z = {}; try { z = stt(m) || {}; } catch (e) {}
          var sc = z.sc || [null, null], tx = l.k; try { tx = labx(l.k, m); } catch (e) {}
          ekle({ id: 'k' + s.id + '_' + i, kup: 1, tip: 'kmac', c: m.c, h: m.h, a: m.a, skor: (sc[0] == null ? '-' : sc[0]) + ' - ' + (sc[1] == null ? '-' : sc[1]), baslik: 'Kupondaki seçim tuttu: ' + tx, alt: ad }); n++;
        }
        return st;
      });
      var kst = leg.some(function (x) { return x === 'miss'; }) ? 'miss' : leg.every(function (x) { return x === 'hit'; }) ? 'hit' : 'wait';
      if (o && kst !== 'wait' && o.s !== kst) {
        var od = NaN; try { od = kpTot(s.legs).od; } catch (e) {}
        var stk = +s.stake || 0, fm = function (x) { try { return kFm(x); } catch (e) { return (+x || 0).toFixed(2); } };
        var bil = s.legs.length + ' seçim' + (isFinite(od) ? ' · Oran ' + od.toFixed(2) : '');
        if (kst === 'hit') ekle({ id: 'k' + s.id, kup: 1, tip: 'khit', baslik: 'Kupon tuttu! ' + ad, alt: bil + (stk && isFinite(od) ? ' · Getiri ' + fm(stk * od) : '') });
        else ekle({ id: 'k' + s.id, kup: 1, tip: 'kmiss', baslik: 'Kupon tutmadı: ' + ad, alt: bil + (stk ? ' · Kasa -' + fm(stk) : '') });
        n++;
      }
      yeni[s.id] = { l: leg, s: kst };
    });
    ls(K_KSNAP, JSON.stringify(yeni));
    return n;
  }

  // ---- arayuz
  var ZIL = "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'><path d='M6 16V11a6 6 0 0 1 12 0v5l1.6 2H4.4z'/><path d='M10 20.5a2.2 2.2 0 0 0 4 0'/></svg>";
  var IK = { gol: '⚽', basla: '▶', ht: '⏸', ms: '🏁', kmac: '✓', khit: '🏆', kmiss: '✕' };
  var panel = document.createElement('div'); panel.id = 'kmbld'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Bildirimler');
  document.body.appendChild(panel);
  function once(t) { var s = Math.round((Date.now() - t) / 1000); if (s < 60) return 'şimdi'; if (s < 3600) return Math.floor(s / 60) + ' dk önce'; if (s < 86400) return Math.floor(s / 3600) + ' sa önce'; return new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }); }
  function okunmamis() { return liste.filter(function (b) { return b.yeni; }).length; }
  function panelCiz() {
    var sat = liste.length ? liste.map(function (b) {
      if (b.kup && !b.h) return "<button class='bld-r" + (b.yeni ? ' yeni' : '') + "' data-bsim='1'><i class='bld-ik t-" + b.tip + "'>" + (IK[b.tip] || '•') + "</i><span><b>" + esc(b.baslik) + "</b><em>" + esc(b.alt) + "</em><small>Simülatör · " + once(b.at) + '</small></span></button>';
      return "<button class='bld-r" + (b.yeni ? ' yeni' : '') + "' data-bq='" + esc(b.h) + "'" + (b.c ? " data-bm='" + esc([b.c, b.h, b.a].join('|')) + "'" : '') + "><i class='bld-ik t-" + b.tip + "'>" + (IK[b.tip] || '•') + "</i><span><b>" + esc(b.baslik) + "</b><em>" + esc(b.h) + ' <strong>' + esc(b.skor) + '</strong> ' + esc(b.a) + "</em><small>" + (b.alt ? esc(b.alt) + ' · ' : '') + esc(ligAd(b.c)) + ' · ' + once(b.at) + '</small></span></button>';
    }).join('') : "<div class='bld-bos'>" + ZIL + "<b>Henüz bildirim yok</b><small>Favori takımlarının maçlarında gol, başlama ve sonuç; kuponlarında tutan seçim ve kupon sonucu burada görünür.</small></div>";
    panel.innerHTML = "<div class='bld-h'><b>Bildirimler</b><button class='bld-ses" + (sesAcik ? ' on' : '') + "' data-bact='ses' title='Bildirim sesi'>" + (sesAcik ? '🔔 Ses açık' : '🔕 Ses kapalı') + "</button></div><div class='bld-l'>" + sat + "</div>" + (liste.length ? "<div class='bld-f'><button data-bact='sil'>Temizle</button></div>" : '');
  }
  var dugmeler = [];
  function ciz(salla) {
    var n = okunmamis();
    dugmeler.forEach(function (b) {
      var r = b.querySelector('.bld-n'); r.textContent = n > 9 ? '9+' : n; r.hidden = !n;
      b.setAttribute('aria-label', n ? 'Bildirimler, ' + n + ' yeni' : 'Bildirimler');
      if (salla) { b.classList.remove('salla'); void b.offsetWidth; b.classList.add('salla'); }
    });
    if (!panel.hidden) panelCiz();
  }
  function dugme(cls) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'kmbell ' + cls; b.setAttribute('aria-haspopup', 'dialog');
    b.innerHTML = ZIL + "<span class='bld-n' hidden></span>";
    b.addEventListener('click', function (e) { e.stopPropagation(); panel.hidden ? ac2(b) : kapa(); });
    dugmeler.push(b); return b;
  }
  function ac2(b) {
    panelCiz(); panel.hidden = false;
    var r = b.getBoundingClientRect(), W = window.innerWidth;
    if (W < 1100) { panel.style.left = '12px'; panel.style.right = '12px'; } else { panel.style.left = 'auto'; panel.style.right = Math.max(12, W - r.right) + 'px'; }
    panel.style.top = (r.bottom + 10) + 'px';
    dugmeler.forEach(function (x) { x.classList.add('on'); });
    // acinca okundu say (rozet soner, satirlar bu acilista vurgulu kalir)
    liste.forEach(function (x) { delete x.yeni; }); ls(K_LIST, JSON.stringify(liste)); dugmeler.forEach(function (x) { x.querySelector('.bld-n').hidden = true; });
  }
  function kapa() { panel.hidden = true; dugmeler.forEach(function (x) { x.classList.remove('on'); }); }
  document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target)) kapa(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') kapa(); });
  panel.addEventListener('click', function (e) {
    e.stopPropagation();
    var t = e.target.closest('[data-bact]');
    if (t) {
      var a = t.getAttribute('data-bact');
      if (a === 'ses') { sesAcik = !sesAcik; ls(K_SES, sesAcik ? '1' : '0'); if (sesAcik) cal(); panelCiz(); }
      if (a === 'sil') { liste = []; ls(K_LIST, '[]'); panelCiz(); ciz(); }
      return;
    }
    if (e.target.closest('[data-bsim]')) { kapa(); location.hash = '#/simulator'; return; }
    var r = e.target.closest('[data-bq]');
    if (r && r.getAttribute('data-bm')) { kapa(); macAc(r.getAttribute('data-bm')); return; }
    if (r) { var q = document.getElementById('q'); if (q) { q.value = r.getAttribute('data-bq'); q.dispatchEvent(new Event('input', { bubbles: true })); } kapa(); }
  });

  // bildirime tiklayinca mac detayi (maç satiri tiklamasiyla ayni yol; listede yoksa once yuklenir)
  function macAc(k) {
    try {
      var ac3 = function () { push(); if (tab !== 'k' && tab !== 'l') tab = 'k'; det = k; dt = dtFor(det); PMV = null; render(); try { scrollTo(0, 0); } catch (e) {} };
      var var_ = true; try { var_ = R.some(function (m) { return [m.c, m.h, m.a].join('|') === k; }); } catch (e) {}
      if (!var_ && window.kmApiMac) window.kmApiMac(k).then(function (ok) { if (ok) ac3(); }); else ac3();
    } catch (e) {}
  }

  var hr = document.querySelector('header .hr'); if (hr) hr.appendChild(dugme('kmb-ust'));
  var nav = document.querySelector('nav'), km = nav && nav.querySelector('.kmm-nav');
  if (nav) { var nb = dugme('kmb-nav'); km ? nav.insertBefore(nb, km) : nav.appendChild(nb); }
  ciz();
  setTimeout(tara, 1500); setInterval(tara, 20000);
  window.addEventListener('storage', function (e) { if (e.key === 'km_fx') tara(); });
  window.kmBildirimTara = tara;
})();
