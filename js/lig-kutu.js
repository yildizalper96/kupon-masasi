/* "Ligler" sekmesi (kullanici istegi, 12 Kas 2026): buyuk lig kutulari, buyuk yazi, lig logosu, genis ekranda 2 sutun.
 * ligView'u sarar: uygulamanin cizdigi .lgc kutularini .lgg izgarasina toplar ve yuvarlak kod rozetinin yerine
 * lig logosunu koyar (media.api-sports.io/football/leagues/<id>.png; kimlik data/fixtures/latest.json lg.<kod>.id,
 * KMX.lgId). Logo yuklenmezse kod rozeti kalir. Not: logolar ilgili organizasyonlarin markasidir (API sartlari). */
(function () {
  if (typeof window.ligView !== 'function') return;
  var css = document.createElement('style');
  css.textContent =
    '#app .lgg{display:grid;grid-template-columns:1fr;gap:12px}' +
    // masaustu: Ligler sayfasinda bos kalan sag sutuna kadar genis (sag sutun bu sayfada bos)
    '@media(min-width:1100px){#dz:has(#app>.lgg)>#app{grid-column:2/4}#dz:has(#app>.lgg)>#dzr{display:none}}' +
    '@media(min-width:900px){#app .lgg{grid-template-columns:1fr 1fr}}' +
    '#app .lgg .lgc{margin:0!important;padding:20px 22px!important;min-height:112px;display:flex;align-items:center;transition:background .15s}' +
    '#app .lgg .lgc:hover{background:var(--sf2,var(--sf))}' +
    '#app .lgg .lgc .lg2{gap:18px!important;padding:0!important;width:100%;align-items:center}' +
    '#app .lgg .lgc .lg2>div:last-child{font:600 20px/1.25 var(--f)!important;color:var(--ink)}' +
    '#app .lgg .lgc small{font:400 13.5px/1.55 var(--f)!important;margin-top:4px!important}' +
    '#app .lgg .lgc b{font-weight:600}' +
    '#app .lgg .lgc .kmlgl{flex:none;width:60px;height:60px;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}' +
    '#app .lgg .lgc .kmlgl img{width:44px;height:44px;object-fit:contain}' +
    '#app .lgg .lgc .bd{width:60px!important;height:60px!important;line-height:60px!important;font-size:15px!important;border-radius:14px!important;flex:none}';
  document.head.appendChild(css);

  var orig = window.ligView;
  window.ligView = function () {
    orig.apply(this, arguments);
    try {
      var app = document.getElementById('app'); if (!app) return;
      var boxes = Array.prototype.slice.call(app.querySelectorAll(':scope > .lgc'));
      if (!boxes.length) return;
      var grid = document.createElement('div'); grid.className = 'lgg';
      boxes[0].parentNode.insertBefore(grid, boxes[0]);
      boxes.forEach(function (b) {
        grid.appendChild(b);
        var id = window.KMX && KMX.lgId && KMX.lgId[b.getAttribute('data-lg2')], bd = b.querySelector('.bd');
        if (!id || !bd) return;
        var tile = document.createElement('span'); tile.className = 'kmlgl';
        var img = new Image(); img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
        img.onload = function () { if (bd.parentNode) bd.parentNode.replaceChild(tile, bd); };
        img.onerror = function () { img.remove(); };
        tile.appendChild(img);
        img.src = 'https://media.api-sports.io/football/leagues/' + id + '.png';
      });
    } catch (e) { if (window.console) console.warn('lig-kutu:', e); }
  };
})();
