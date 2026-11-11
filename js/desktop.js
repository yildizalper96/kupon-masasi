// Tasarim v2 dilim 2: masaustu uc sutun iskeleti (>=1100px).
// Uygulama #app icine cizer; bu dosya yanina sol (ligler) ve sag (gunun kuponu, notlar) sutunlarini ekler.
// Telefon/tablette hicbir sey degismez (sutunlar CSS ile gizli, tasinan kutular yerinde kalir).
(function () {
  const MQ = matchMedia('(min-width:1100px)');
  const app = document.getElementById('app');
  if (!app) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // iskelet: <div id="dz"><aside id="dzl"></aside>#app<aside id="dzr"></aside></div>
  const dz = document.createElement('div'); dz.id = 'dz';
  const sol = document.createElement('aside'); sol.id = 'dzl';
  const sag = document.createElement('aside'); sag.id = 'dzr';
  app.parentNode.insertBefore(dz, app);
  dz.append(sol, app, sag);

  const ONE = ['SL', 'PL', 'CL', 'LL', 'SA', 'BL', 'EL', 'L1', 'ECL', 'POR', 'ERE', 'BEL', 'SCO', 'KSA'];
  function ligAdi(c) {
    try { if (LGNM[c]) return LGNM[c]; } catch (e) { }
    try { const ln = LN[c]; if (ln) return ln.split(' – ').pop(); } catch (e) { }
    return c;
  }
  function ligRenk(c) { try { return C[c] || '#8a94a3'; } catch (e) { return '#8a94a3'; } }
  function ligAc(c) {
    // Ligler sekmesine gec, ligi ac (uygulamanin kendi [data-lg] davranisiyla ayni)
    const nb = document.querySelector('nav button[data-t="l"]');
    if (nb && typeof tab !== 'undefined' && tab !== 'l') nb.click();
    try { Q = LGNM[c]; QX = ''; const e = document.getElementById('q'); if (e) e.value = Q; render(); window.scrollTo(0, 0); } catch (e) { }
  }
  function solCiz() {
    let kodlar = ONE;
    try { kodlar = ONE.filter(c => LGNM[c]); } catch (e) { }
    sol.innerHTML = `<section class="dzk"><h3>Öne çıkan ligler</h3><ul class="dzlig">${kodlar.map(c =>
      `<li><button data-dzlg="${esc(c)}"><i style="background:${esc(ligRenk(c))}"></i>${esc(ligAdi(c))}</button></li>`).join('')}</ul></section>
      <section class="dzk"><button class="dztum" data-dztum>Tüm ligler<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 6l6 6-6 6"/></svg></button></section>`;
    sol.querySelectorAll('[data-dzlg]').forEach(b => b.onclick = () => ligAc(b.dataset.dzlg));
    const t = sol.querySelector('[data-dztum]');
    if (t) t.onclick = () => { const nb = document.querySelector('nav button[data-t="l"]'); try { Q = ''; QX = ''; const e = document.getElementById('q'); if (e) e.value = ''; } catch (e) { } if (nb) nb.click(); window.scrollTo(0, 0); };
  }

  // sag sutun: Maclar sekmesindeki "Gunun dusuk riskli kuponu" ve "Veri kaynagi" kutularini tasi
  function sagCiz() {
    if (!MQ.matches) return;
    const kutular = [app.querySelector(':scope > #cpd'), app.querySelector(':scope > details.note'), app.querySelector(':scope > .nwb')].filter(Boolean);
    sag.innerHTML = '';
    kutular.forEach(k => sag.appendChild(k));
    const cp = sag.querySelector('#cpd'); if (cp && !cp.dataset.dzAcik) { cp.open = true; cp.dataset.dzAcik = '1'; }
  }
  // genislik telefona dusunce tasinan kutular uygulamaya geri doner (bir sonraki cizimde zaten oraya gelir)
  MQ.addEventListener('change', () => { if (!MQ.matches) { [...sag.children].forEach(k => app.appendChild(k)); sag.innerHTML = ''; } else sagCiz(); });

  // yalnizca uygulama yeniden cizdiginde (dugum eklendiginde) calis; bizim tasimamiz sadece dugum cikarir
  new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) sagCiz(); }).observe(app, { childList: true });
  solCiz(); sagCiz();
})();
