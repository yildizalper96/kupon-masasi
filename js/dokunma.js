// Dokunma davranisi: (1) parmak degdigi anda gorsel tepki, (2) yatay kaydirma parmagi takip eder, (3) titresim yalniz gercek olayda.
// Alt menu / arama dairesi konumuna DOKUNMA (bkz. memory alt-menu-konumu): burada nav'a transform/bottom yazilmaz.
(function () {
  // ---- 1) basma tepkisi: pointerdown'da sinif, kalkinca/iptalde kaldir
  var SEL = 'button,a,summary,label,select,[role=button],[data-tm],[data-pl],[data-pn],[data-kmm],[data-k],[data-dd],[data-pk],.mr';
  var cur = null, tm = 0;
  function clr() { if (cur) { cur.classList.remove('kmbas'); cur = null; } clearTimeout(tm); }
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button) return;
    var t = e.target && e.target.closest && e.target.closest(SEL);
    if (!t || t.disabled) return;
    clr(); cur = t; t.classList.add('kmbas');
    tm = setTimeout(clr, 4000); // takilirsa kendi kendine kalksin
  }, { passive: true, capture: true });
  ['pointerup', 'pointercancel', 'pointerleave', 'dragstart', 'scroll'].forEach(function (n) { document.addEventListener(n, clr, { passive: true, capture: true }); });
  // iOS :active icin bos touchstart dinleyicisi
  document.addEventListener('touchstart', function () { }, { passive: true });

  // ---- 2) yatay kaydirma parmagi takip eder (FotMob gibi): mac sayfasinda baslik ve sekme seridi sabit, yalniz icerik kayar.
  // Gecis karari app.js'teki touchend'de; burada gorsel takip, gecis olduysa yeni icerik yandan kayarak gelir, olmadiysa geri yaylanir.
  var sx = 0, sy = 0, yatay = null, hedefler = [], uygun = false, hedef = 0, rafId = 0;
  function ayaripKaydirilir(n) { while (n && n !== document.body) { if (n.scrollWidth > n.clientWidth + 2) { var o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') return true; } n = n.parentElement; } return false; }
  function icerik() { // mac/oyuncu/takim sayfasi: sekme seridinden (.kmyap) sonraki kardesler; yoksa tum #app
    var app = document.getElementById('app'); if (!app) return [];
    // mac/lig sayfasinda sekme seridi, ana sayfada gun seridi sabit kalir; yalniz altindaki icerik kayar
    var s = app.querySelector(':scope > .kmyap') || app.querySelector(':scope > .kmgun');
    if (!s) return [app];
    var l = [], n = s.nextElementSibling; while (n) { l.push(n); n = n.nextElementSibling; } return l;
  }
  function yaz(x, gecis) { var W = window.innerWidth || 375; hedefler.forEach(function (e) { e.style.willChange = x === null ? '' : 'transform,opacity'; e.style.transition = gecis ? gecis + ',opacity .26s' : 'none'; e.style.transform = x === null ? '' : 'translate3d(' + x + 'px,0,0)'; e.style.opacity = x === null ? '' : String(Math.max(0.35, 1 - Math.abs(x) / W * 0.9)); }); }
  // 100px'ten sonra direnc: icerik parmagi izler ama ekran bosalmaz
  function direnc(dx) { var a = Math.abs(dx); return (dx < 0 ? -1 : 1) * (a <= 100 ? a : 100 + (a - 100) * 0.35); }
  document.addEventListener('touchstart', function (e) {
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; yatay = null; hedefler = [];
    uygun = e.touches.length === 1 && !ayaripKaydirilir(e.target) && !(e.target.closest && e.target.closest('nav,input,textarea,select,#kmarae,#kpq,#kmara,[data-kmdeg]'));
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (!uygun || e.touches.length !== 1) return;
    var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (yatay === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) { yatay = Math.abs(dx) > Math.abs(dy) * 1.3; if (yatay) hedefler = icerik(); }
    if (!yatay) return;
    if (e.cancelable) e.preventDefault(); // tarayici sayfayi kendisi yana/asagi kaydirmasin (titreme ve yana kayma bunun yuzundendi)
    hedef = direnc(dx);
    if (!rafId) rafId = requestAnimationFrame(function () { rafId = 0; yaz(hedef); });
  }, { passive: false });
  function birak(e) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (!yatay || !hedefler.length) { yatay = null; return; }
    var eski = hedefler, dx = hedef, W = window.innerWidth; yatay = null;
    // app.js touchend'i bizden once calisir; render senkron ya da bir kare sonra olabilir
    requestAnimationFrame(function () {
      if (!eski[0].isConnected) { // yeni icerik geldi: parmagin yonunden kayarak gelsin
        hedefler = icerik(); yaz(dx > 0 ? -W * 0.35 : W * 0.35);
        void document.body.offsetWidth;
        yaz(0, 'transform .26s cubic-bezier(.2,.8,.2,1)');
      } else { hedefler = eski; yaz(0, 'transform .24s cubic-bezier(.2,.8,.2,1)'); }
      var son = hedefler; setTimeout(function () { son.forEach(function (x) { x.style.transition = ''; x.style.transform = ''; x.style.willChange = ''; x.style.opacity = ''; }); }, 280);
    });
  }
  document.addEventListener('touchend', birak, { passive: true });
  document.addEventListener('touchcancel', birak, { passive: true });

  // ---- 2b) alt menu (FotMob/iOS gibi): parmakla gezerken altinda cam "mercek" gezer, uzerinden gecilen sekme ANINDA acilir.
  // Konum/boyut CSS'te; burada nav'a transform/bottom yazilmaz (mercek nav'in icinde ayri oge).
  (function () {
    var nav = document.querySelector('nav'); if (!nav) return;
    var lens = document.createElement('i'); lens.id = 'kmlens'; lens.setAttribute('aria-hidden', 'true'); nav.appendChild(lens);
    var bas = null, acik = null, gezdi = false, x0 = 0;
    var altta = function (x, y) { var e = document.elementFromPoint(x, y); return e && e.closest ? e.closest('nav button:not(.kmmenu)') : null; };
    var mercek = function (x) {
      var r = nav.getBoundingClientRect(), b = nav.querySelector('button'), w = b ? b.getBoundingClientRect().width : 64;
      var l = Math.max(r.left + 4, Math.min(r.right - w - 4, x - w / 2)) - r.left;
      lens.style.width = w + 'px'; lens.style.transform = 'translate3d(' + l + 'px,0,0) scale(1.12)';
    };
    nav.addEventListener('touchstart', function (e) { var t = e.touches[0]; bas = altta(t.clientX, t.clientY); acik = bas; gezdi = false; x0 = t.clientX; }, { passive: true });
    nav.addEventListener('touchmove', function (e) {
      if (!bas) return; var t = e.touches[0];
      if (!gezdi && Math.abs(t.clientX - x0) > 6) { gezdi = true; nav.classList.add('kmgez'); }
      if (!gezdi) return;
      if (e.cancelable) e.preventDefault();
      mercek(t.clientX);
      var b = altta(t.clientX, Math.min(t.clientY, nav.getBoundingClientRect().bottom - 8));
      if (b && b !== acik) { acik = b; b.click(); try { KMHap(); } catch (x) { } }
    }, { passive: false });
    var bitir = function (e) {
      var g = gezdi; gezdi = false; bas = null; nav.classList.remove('kmgez');
      if (g && e.cancelable) e.preventDefault(); // surukleme sonunda ikinci (sentetik) tiklama olmasin
    };
    nav.addEventListener('touchend', bitir, { passive: false });
    nav.addEventListener('touchcancel', bitir, { passive: false });
  })();

  // ---- 3) titresim: yalniz gercek olayda (kupon degisti, favori, bildirim). Yazarken titremez.
  var lbl = null, son = 0;
  window.KMHap = function () {
    var n = Date.now(); if (n - son < 120) return; son = n;
    var a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    try { if (navigator.vibrate) { navigator.vibrate(10); return; } } catch (e) { }
    try { // iOS Safari: anahtar (switch) onay kutusu dokunsal geri bildirim verir (iOS 18+)
      if (!lbl) {
        lbl = document.createElement('label'); lbl.setAttribute('aria-hidden', 'true'); lbl.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
        var i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1; lbl.appendChild(i); document.body.appendChild(lbl);
      }
      lbl.click();
    } catch (e) { }
  };
})();
