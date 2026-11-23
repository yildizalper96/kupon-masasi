// Sag ust menu (FotMob gibi): cizgi (hamburger) dugmesi -> acilir panel: Profil, Simulator, Gecmis, Tema (acik/koyu), Dil (Turkce; English gorunur ama secilemez).
// Tema ve takip edilen ligler hesaba bagli (bulutta data/users/<id>/prefs). Cikis yapinca klasik gorunum: koyu tema, takip karti yok.
(function () {
  var root = document.documentElement;
  // ---- tema
  function temaUygula(t) {
    if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'light' ? '#f2f3f5' : '#000000');
    document.querySelectorAll('[data-kmtema]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-kmtema') === (t === 'light' ? 'light' : 'dark')); });
  }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function uid() { try { return (typeof FUID !== 'undefined' && FUID) || (typeof KPUID !== 'undefined' && KPUID) || null; } catch (e) { return null; } }
  async function db() { try { return (window.claude && claude.use) ? await claude.use('db') : null; } catch (e) { return null; } }
  // ---- hesap tercihleri: tema + takip edilen ligler (bulutta data/users/<id>/prefs = {tema, ligler}; cihazda yalniz giris yapmis kullanici icin onbellek)
  function ligOku() { try { var a = JSON.parse(ls('km_ligtakip') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  var tema = ls('km_tema') === 'light' ? 'light' : 'dark';
  var ligler = ligOku();
  temaUygula(tema);
  function solYenile() { try { if (typeof window.kmSolCiz === 'function') window.kmSolCiz(); } catch (e) { } }
  function prefYaz() {
    var id = uid(); if (!id) return;
    ls('km_tema', tema); ls('km_ligtakip', JSON.stringify(ligler));
    db().then(function (d) { if (d) d.doc('data/users/' + id + '/prefs').set({ tema: tema, ligler: ligler }).catch(function () { }); });
  }
  function temaSec(t) { tema = t; temaUygula(t); prefYaz(); }
  window.kmTemaSec = temaSec;
  function cikisDurumu() { ls('km_tema', null); ls('km_ligtakip', null); tema = 'dark'; ligler = []; temaUygula('dark'); solYenile(); }
  // lig takibi (desktop.js sol sutun kullanir). Giris yoksa profil/giris sayfasina yonlendirir.
  window.KMLig = {
    liste: function () { return uid() ? ligler.slice() : []; },
    degistir: function (c) {
      if (!uid()) {
        try { kToast('Ligleri takip etmek için giriş yap'); } catch (e) { }
        var n = document.querySelector('nav button[data-t="u"]'); if (n) n.click();
        return false;
      }
      var i = ligler.indexOf(c); if (i >= 0) ligler.splice(i, 1); else ligler.push(c);
      prefYaz(); solYenile(); return true;
    }
  };
  // giris / cikis izleme: giriste kullanicinin kayitli tercihleri, cikista klasik gorunum (koyu, takip yok)
  var sonId = null;
  setInterval(function () {
    var id = uid(); if (id === sonId) return;
    var once = sonId; sonId = id;
    if (!id) { if (once) cikisDurumu(); return; }
    solYenile();
    db().then(function (d) {
      if (!d) return;
      d.doc('data/users/' + id + '/prefs').get().then(function (s) {
        var v = (s && s.exists && s.data()) || {};
        if (v.tema === 'light' || v.tema === 'dark') tema = v.tema;
        if (Array.isArray(v.ligler)) ligler = v.ligler.filter(function (x) { return typeof x === 'string'; });
        temaUygula(tema); prefYaz(); solYenile();
      }).catch(function () { });
    });
  }, 1000);
  // oturum dusmusse (giris yok) eski onbellek kalmasin
  setTimeout(function () { if (!uid() && (ls('km_tema') || ls('km_ligtakip'))) cikisDurumu(); }, 10000);

  // ---- masaustu: Ligler listesi sayfasi yok (ligler sol sutundan acilir); bu sayfaya gelinirse Maclar'a don
  if (typeof window.ligView === 'function') { var eskiLig = window.ligView; window.ligView = function () { if (window.matchMedia('(min-width:1100px)').matches) { setTimeout(function () { var n = document.querySelector('nav button[data-t="k"]'); if (n) n.click(); }, 0); return ''; } return eskiLig.apply(this, arguments); }; }

  // ---- menu
  var IC = {
    menu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    u: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    c: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
    g: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    sun: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>'
  };
  var panel = document.createElement('div'); panel.id = 'kmpanel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Menü');
  IC.ok = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
  function kim() { try { if (window.KMCLOUD && KMCLOUD.on) return KMCLOUD.user(); if (typeof PRF !== 'undefined' && PRF && PRF.id) return { name: PRF.name || '', email: '' }; } catch (e) { } return null; }
  function esc(x) { return String(x || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var TEMA = '<span class="kmp-tema">' +
      '<button type="button" data-kmtema="light" aria-label="Açık tema">' + IC.sun + '<em>Açık</em></button>' +
      '<button type="button" data-kmtema="dark" aria-label="Koyu tema">' + IC.moon + '<em>Koyu</em></button>' +
    '</span>';
  var DIL = '<span class="kmp-dils"><button type="button" class="on" aria-pressed="true">Türkçe</button><button type="button" disabled aria-disabled="true" title="Yakında">English</button></span>';
  var NOT = '<div class="kmv-not">Simuleto bir simülatördür, bahis yaptırmaz. Hiçbir bahis risksiz değildir. 18 yaş altı için değildir.<span class="kmv-yasal"><a href="/gizlilik/" target="_blank" rel="noopener">Gizlilik</a> · <a href="/kosullar/" target="_blank" rel="noopener">Kullanım Koşulları</a> · <a href="mailto:support@simuleto.com">İletişim</a></span></div>';
  function satir(git, ic, ad, alt) { return '<button type="button" class="kmv-r" data-kmgit="' + git + '"><i>' + ic + '</i><span><b>' + ad + '</b>' + (alt ? '<small>' + alt + '</small>' : '') + '</span>' + IC.ok + '</button>'; }
  function basHarf(u) { var p = String(u.name || '').trim().split(/\s+/).filter(Boolean); if (!p.length) p = [String(u.email || 'Ü')]; var h = p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : ''); return h.toLocaleUpperCase('tr'); }
  function ciz() {
    var u = kim(), ad = u ? esc(u.name || 'Üye') : '', harf = u ? esc(basHarf(u)) : '';
    panel.innerHTML =
      '<div class="kmv-h">Hesap</div><div class="kmv-grp">' + (u ? satir('u', '<span class="kmv-av">' + harf + '</span>', ad, 'Profil ve ayarlarım') : satir('u', IC.u, 'Giriş yap', 'veya ücretsiz hesap oluştur')) + '</div>' +
      '<div class="kmv-h">Sayfalar</div><div class="kmv-grp">' + satir('c', IC.c, 'Simülatör') + satir('g', IC.g, 'Tahmin geçmişi') + '</div>' +
      '<div class="kmv-h">Görünüm</div><div class="kmv-grp">' +
        '<div class="kmp-sat"><b>Tema</b>' + TEMA + '</div>' +
        '<div class="kmp-sat kmp-dil"><b>' + IC.globe + 'Dil</b>' + DIL + '</div>' +
      '</div>' + NOT;
  }
  ciz();
  document.body.appendChild(panel);

  function dugme(cls) { var b = document.createElement('button'); b.type = 'button'; b.className = 'kmmenu ' + cls; b.setAttribute('aria-label', 'Menü'); b.setAttribute('aria-haspopup', 'dialog'); b.innerHTML = IC.menu; b.addEventListener('click', function (e) { e.stopPropagation(); acik() ? kapa() : ac(b); }); return b; }
  var hr = document.querySelector('header .hr'); if (hr) hr.appendChild(dugme('kmm-ust'));         // telefon/tablet: baslikta sag ust
  var nav = document.querySelector('nav'); if (nav) { var nb = dugme('kmm-nav'); nb.innerHTML = '<b>' + IC.menu + '</b><span class="kmm-et">Menü</span>'; nav.appendChild(nb); } // masaustu: ust bar; telefon: alt barda Profil yerinde              // masaustu: ust bardaki profil yerinde
  var kaynak = null;
  function acik() { return !panel.hidden; }
  function ac(b) {
    kaynak = b; ciz(); panel.hidden = false; temaUygula(tema);
    var r = b.getBoundingClientRect(), W = window.innerWidth;
    panel.style.bottom = 'auto';
    if (W < 1100 && b.closest('nav')) { panel.style.left = '12px'; panel.style.right = '12px'; panel.style.top = 'auto'; panel.style.bottom = (window.innerHeight - r.top + 10) + 'px'; }
    else if (W < 1100) { panel.style.left = '12px'; panel.style.right = '12px'; panel.style.top = (r.bottom + 8) + 'px'; }
    else { panel.style.left = 'auto'; panel.style.right = Math.max(12, W - r.right) + 'px'; panel.style.top = (r.bottom + 10) + 'px'; }
    document.querySelectorAll('.kmmenu').forEach(function (x) { x.classList.add('on'); x.setAttribute('aria-expanded', 'true'); });
  }
  function kapa() { panel.hidden = true; document.querySelectorAll('.kmmenu').forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-expanded', 'false'); }); }
  panel.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t || t.disabled) return;
    if (t.dataset.kmtema) { temaSec(t.dataset.kmtema); try { KMHap(); } catch (x) { } return; }
    if (t.dataset.kmgit) { kapa(); var n = document.querySelector('nav button[data-t="' + t.dataset.kmgit + '"]'); if (n) n.click(); }
  });
  document.addEventListener('click', function (e) { if (acik() && !panel.contains(e.target)) kapa(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && acik()) kapa(); });
  window.addEventListener('resize', function () { if (acik()) kapa(); });
  window.addEventListener('scroll', function () { if (acik()) kapa(); }, { passive: true });
})();
