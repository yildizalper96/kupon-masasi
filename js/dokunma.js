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

  // ---- 2) yatay kaydirma parmagi takip eder (gecis karari app.js'teki touchend'de; burada yalniz gorsel takip + geri yaylanma)
  var sx = 0, sy = 0, yatay = null, el = null, uygun = false, hedef = 0, rafId = 0;
  function ayaripKaydirilir(n) { while (n && n !== document.body) { if (n.scrollWidth > n.clientWidth + 2) { var o = getComputedStyle(n).overflowX; if (o === 'auto' || o === 'scroll') return true; } n = n.parentElement; } return false; }
  document.addEventListener('touchstart', function (e) {
    var t = e.touches[0]; sx = t.clientX; sy = t.clientY; yatay = null;
    el = document.getElementById('app');
    uygun = !!el && e.touches.length === 1 && !ayaripKaydirilir(e.target) && !(e.target.closest && e.target.closest('input,textarea,select,#kmarae,#kpq'));
  }, { passive: true });
  document.addEventListener('touchmove', function (e) {
    if (!uygun || !el || e.touches.length !== 1) return;
    var t = e.touches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (yatay === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) yatay = Math.abs(dx) > Math.abs(dy) * 1.5;
    if (!yatay) return;
    hedef = Math.max(-160, Math.min(160, dx));
    if (!rafId) rafId = requestAnimationFrame(function () { rafId = 0; if (!el) return; el.style.transition = 'none'; el.style.transform = 'translate3d(' + hedef + 'px,0,0)'; });
  }, { passive: true });
  function birak() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (!el || !el.style.transform) return;
    var e2 = el; e2.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1)'; e2.style.transform = 'translate3d(0,0,0)';
    setTimeout(function () { e2.style.transition = ''; e2.style.transform = ''; }, 240);
  }
  document.addEventListener('touchend', birak, { passive: true });
  document.addEventListener('touchcancel', birak, { passive: true });

  // ---- 2b) alt menude parmakla gezerek sekme degistirme (parmak kalkinca altindaki sekme acilir). Konuma/boyuta dokunulmaz.
  (function () {
    var nav = document.querySelector('nav'); if (!nav) return;
    var bas = null, hov = null, gezdi = false;
    var altta = function (x, y) { var e = document.elementFromPoint(x, y); return e && e.closest ? e.closest('nav button') : null; };
    var isaret = function (b) { if (hov === b) return; if (hov) hov.classList.remove('kmhov'); hov = b; if (b) { b.classList.add('kmhov'); try { KMHap(); } catch (e) { } } };
    nav.addEventListener('touchstart', function (e) { var t = e.touches[0]; bas = altta(t.clientX, t.clientY); hov = null; gezdi = false; }, { passive: true });
    nav.addEventListener('touchmove', function (e) {
      if (!bas) return; var t = e.touches[0], b = altta(t.clientX, t.clientY);
      if (b && b !== bas) gezdi = true;
      if (gezdi) isaret(b);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    var bitir = function (e) {
      var b = hov, g = gezdi; if (hov) hov.classList.remove('kmhov'); hov = null; gezdi = false; var b0 = bas; bas = null;
      if (g && b && e.type === 'touchend') { if (e.cancelable) e.preventDefault(); b.click(); }
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
