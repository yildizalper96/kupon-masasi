// Yasal sayfa penceresi (23 Kas 2026): uygulama icindeki /kosullar/ ve /gizlilik/ linkleri yeni sekme yerine sayfa ici
// pencerede acilir. Icerik statik sayfadan (tools/yasal-sayfalar.mjs) cekilir, <main> icinden ust/alt kisim atilir.
// Cekilemezse (cevrimdisi, yerel sunucu) link eskisi gibi yeni sekmede acilir.
(function () {
  var onb = {};
  function kapat() { var m = document.getElementById('kmyasal'); if (!m) return; m.remove(); document.removeEventListener('keydown', tus); if (kapat.odak && kapat.odak.focus) kapat.odak.focus(); }
  function tus(e) { if (e.key === 'Escape') kapat(); }
  function ac(yol, a) {
    kapat(); kapat.odak = a;
    var m = document.createElement('div');
    m.id = 'kmyasal'; m.className = 'kmyasal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = '<div class="kmyasal-i"><button type="button" class="kmyasal-x" aria-label="Kapat">×</button><div class="kmyasal-g" tabindex="-1"><p class="kmyasal-y">Yükleniyor…</p></div></div>';
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.kmyasal-x') || (e.target.closest('a[href="/"]'))) { e.preventDefault(); kapat(); } });
    document.addEventListener('keydown', tus);
    document.body.appendChild(m);
    var g = m.querySelector('.kmyasal-g'), x = m.querySelector('.kmyasal-x');
    function yer() { x.style.right = (10 + g.offsetWidth - g.clientWidth) + 'px'; }
    yer();
    m.querySelector('.kmyasal-x').focus();
    (onb[yol] ? Promise.resolve(onb[yol]) : fetch(yol, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw 0;
      return r.text();
    }).then(function (t) {
      var d = new DOMParser().parseFromString(t, 'text/html'), mn = d.querySelector('main');
      if (!mn || !mn.querySelector('h1')) throw 0;
      mn.querySelectorAll('header,footer,script').forEach(function (x) { x.remove(); });
      return (onb[yol] = mn.innerHTML);
    })).then(function (h) {
      if (!document.body.contains(m)) return;
      g.innerHTML = h;
      var h1 = g.querySelector('h1'); if (h1) m.setAttribute('aria-label', h1.textContent);
      g.scrollTop = 0; yer();
    }).catch(function () { kapat(); window.open(yol, '_blank', 'noopener'); });
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var y = a.getAttribute('href').replace(/^https:\/\/simuleto\.com/, '');
    if (y !== '/kosullar/' && y !== '/gizlilik/') return;
    e.preventDefault();
    ac(y, a);
  }, true);
})();

// Ilk acilis yasal notu (23 Kas 2026): 18+ ve "simulatordur, bahis yaptirmaz" uyarisi. Bir kez gosterilir,
// "Anladim" ile kapanir (localStorage km_18). Sayfayi kilitlemez: altta serit. Depolama yoksa her acilista yine cikar.
(function () {
  var K = 'km_18';
  function oku() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function yaz() { try { localStorage.setItem(K, String(Date.now())); } catch (e) { } }
  if (oku()) return;
  function goster() {
    if (document.getElementById('km18')) return;
    var d = document.createElement('div');
    d.id = 'km18'; d.className = 'km18'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-live', 'polite'); d.setAttribute('aria-label', 'Yaş ve kullanım uyarısı');
    d.innerHTML = '<div class="km18-i"><b class="km18-r">18+</b><p><b>Simuleto bir analiz ve kupon simülatörüdür, bahis yaptırmaz.</b> Olasılıklar tahmindir, hiçbir bahis risksiz değildir. 18 yaşından küçükler için değildir. ' +
      '<a href="/kosullar/" target="_blank" rel="noopener">Kullanım Koşulları</a> · <a href="/gizlilik/" target="_blank" rel="noopener">Gizlilik</a></p>' +
      '<button type="button" class="km18-b">Anladım, 18 yaşından büyüğüm</button></div>';
    d.querySelector('button').addEventListener('click', function () { yaz(); d.classList.add('kapan'); setTimeout(function () { d.remove(); }, 250); });
    document.body.appendChild(d);
  }
  if (document.body) goster(); else document.addEventListener('DOMContentLoaded', goster);
})();
