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
  // yuvarlak bayraklar (basitlestirilmis, 24x24 icinde daire)
  const yatay = (...r) => r.map((c, i) => `<rect y="${i * 24 / r.length}" width="24" height="${24 / r.length + .5}" fill="${c}"/>`).join('');
  const dikey = (...r) => r.map((c, i) => `<rect x="${i * 24 / r.length}" width="${24 / r.length + .5}" height="24" fill="${c}"/>`).join('');
  const AB = '<rect width="24" height="24" fill="#2b4fa8"/>' + Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${(12 + 6.5 * Math.cos(a)).toFixed(2)}" cy="${(12 + 6.5 * Math.sin(a)).toFixed(2)}" r="1.1" fill="#f5c400"/>`; }).join('');
  const BAYRAK = {
    TR: '<rect width="24" height="24" fill="#d8232a"/><circle cx="10" cy="12" r="5.2" fill="#fff"/><circle cx="11.4" cy="12" r="4.2" fill="#d8232a"/><circle cx="16.3" cy="12" r="1.7" fill="#fff"/>',
    ENG: '<rect width="24" height="24" fill="#fff"/><rect x="9.6" width="4.8" height="24" fill="#cf1f2e"/><rect y="9.6" width="24" height="4.8" fill="#cf1f2e"/>',
    ESP: yatay('#c60b1e', '#ffc400', '#ffc400', '#c60b1e'), ITA: dikey('#009246', '#fff', '#ce2b37'), GER: yatay('#111', '#dd0000', '#ffce00'),
    FRA: dikey('#002395', '#fff', '#ed2939'), POR: '<rect width="24" height="24" fill="#d52b1e"/><rect width="10" height="24" fill="#046a38"/>',
    NED: yatay('#ae1c28', '#fff', '#21468b'), BEL: dikey('#111', '#fdda24', '#ef3340'),
    SCO: '<rect width="24" height="24" fill="#0065bd"/><path d="M0 0L24 24M24 0L0 24" stroke="#fff" stroke-width="4"/>',
    KSA: '<rect width="24" height="24" fill="#006c35"/><rect x="5" y="14" width="14" height="1.8" rx=".9" fill="#fff"/>', EU: AB,
  };
  const ULKE = { SL: 'TR', PL: 'ENG', LL: 'ESP', SA: 'ITA', BL: 'GER', L1: 'FRA', POR: 'POR', ERE: 'NED', BEL: 'BEL', SCO: 'SCO', KSA: 'KSA', CL: 'EU', EL: 'EU', ECL: 'EU', UNL: 'EU', USC: 'EU', FAC: 'ENG', EFL: 'ENG', CDR: 'ESP', CIT: 'ITA', DFB: 'GER', CDF: 'FRA', TUK: 'TR', KNV: 'NED', TDP: 'POR', BCP: 'BEL', SFA: 'SCO' };
  let bid = 0;
  function bayrak(c) {
    const b = BAYRAK[ULKE[c]];
    if (!b) return `<i class="dznok" style="background:${esc(ligRenk(c))}"></i>`;
    const id = 'dzb' + (bid++);
    return `<svg class="dzbay" viewBox="0 0 24 24" aria-hidden="true"><clipPath id="${id}"><circle cx="12" cy="12" r="12"/></clipPath><g clip-path="url(#${id})">${b}</g></svg>`;
  }
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
      `<li><button data-dzlg="${esc(c)}">${bayrak(c)}${esc(ligAdi(c))}</button></li>`).join('')}</ul></section>
      <section class="dzk dztumk"><button class="dztum" data-dztum aria-expanded="false">Tüm ligler<i class="dzok"></i></button><div class="dztumic" hidden></div></section>`;
    sol.querySelectorAll('[data-dzlg]').forEach(b => b.onclick = () => ligAc(b.dataset.dzlg));
    const t = sol.querySelector('[data-dztum]'), ic = sol.querySelector('.dztumic');
    if (t && ic) t.onclick = () => {
      const acik = ic.hidden; ic.hidden = !acik; t.setAttribute('aria-expanded', String(acik)); t.parentElement.classList.toggle('acik', acik);
      if (acik) tumListe(ic);
    };
  }
  // Tum ligler: ulkeye gore gruplu, filtrelenebilir liste (FotMob gibi yerinde acilir)
  function tumListe(ic) {
    let kodlar = []; try { kodlar = (typeof LORD !== 'undefined' ? LORD : Object.keys(LN)).filter(c => LGNM[c] || LN[c]); } catch (e) { }
    const grup = new Map();
    kodlar.forEach(c => { let u = ''; try { u = LN[c] ? LN[c].split(' – ')[0] : ''; } catch (e) { } u = u || 'Diğer'; if (!grup.has(u)) grup.set(u, []); grup.get(u).push(c); });
    const ciz = q => {
      const n = s => String(s).toLocaleLowerCase('tr');
      const html = [...grup].map(([u, cs]) => {
        const l = cs.filter(c => !q || n(ligAdi(c)).includes(q) || n(u).includes(q));
        return l.length ? `<div class="dzgrup"><small>${esc(u)}</small>${l.map(c => `<button data-dzlg="${esc(c)}">${bayrak(c)}${esc(ligAdi(c))}</button>`).join('')}</div>` : '';
      }).join('');
      liste.innerHTML = html || '<p class="dzbos">Eşleşen lig yok.</p>';
      liste.querySelectorAll('[data-dzlg]').forEach(b => b.onclick = () => ligAc(b.dataset.dzlg));
    };
    ic.innerHTML = `<label class="dzfil"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M7 12h10M10 17h4"/></svg><input placeholder="Filtre" aria-label="Lig filtrele"></label><div class="dzliste"></div>`;
    const liste = ic.querySelector('.dzliste'), inp = ic.querySelector('input');
    inp.oninput = () => ciz(inp.value.trim().toLocaleLowerCase('tr'));
    ciz('');
  }

  // sag sutun: Maclar sekmesindeki "Gunun dusuk riskli kuponu" ve "Veri kaynagi" kutularini tasi
  let ilkCocuk = null;
  function sagCiz() {
    if (!MQ.matches) return;
    const kutular = [app.querySelector(':scope > .mside'), app.querySelector(':scope > #kmka'), ...app.querySelectorAll(':scope > .box.ka:not(#kmka)'), app.querySelector(':scope > #cpd'), app.querySelector(':scope > details.note'), app.querySelector(':scope > .tbx'), app.querySelector(':scope > .nwb')].filter(Boolean);
    // uygulama sayfayi yeniden cizmediyse (yalnizca kucuk bir ekleme) ve tasinacak kutu yoksa sag sutuna dokunma
    if (!kutular.length && app.firstElementChild === ilkCocuk) return;
    ilkCocuk = app.firstElementChild;
    sag.innerHTML = '';
    kutular.forEach(k => sag.appendChild(k));
    const cp = sag.querySelector('#cpd'); if (cp && !cp.dataset.dzAcik) { cp.open = true; cp.dataset.dzAcik = '1'; }
  }
  // genislik telefona dusunce tasinan kutular uygulamaya geri doner (bir sonraki cizimde zaten oraya gelir)
  MQ.addEventListener('change', () => { if (!MQ.matches) { [...sag.children].forEach(k => app.appendChild(k)); sag.innerHTML = ''; } else sagCiz(); });

  // yalnizca uygulama yeniden cizdiginde (dugum eklendiginde) calis; bizim tasimamiz sadece dugum cikarir
  // logo: her genislikte ana sayfaya (Maclar, bugun/varsayilan gun, arama ve mac detayi kapali)
  const marka = document.querySelector('header .brand');
  if (marka) {
    marka.style.cursor = 'pointer'; marka.setAttribute('role', 'link'); marka.title = 'Ana sayfa';
    marka.addEventListener('click', () => {
      try { det = null; PMV = null; Q = ''; QX = ''; LV = false; TS = false; const e = document.getElementById('q'); if (e) e.value = ''; } catch (e) { }
      const nb = document.querySelector('nav button[data-t="k"]');
      try { if (typeof tab !== 'undefined' && tab === 'k') render(); else if (nb) nb.click(); } catch (e) { if (nb) nb.click(); }
      window.scrollTo(0, 0);
    });
  }

  // bagimsiz kaydirma: masaustunde sutunlar kendi icinde kayar (CSS). Ust bar yuksekligi --dzhdr.
  const hdr = document.querySelector('header');
  const hdrOlc = () => { if (hdr) document.documentElement.style.setProperty('--dzhdr', hdr.offsetHeight + 'px'); };
  hdrOlc(); addEventListener('resize', hdrOlc);
  // yeni sayfa (sekme/mac/takim/arama) acilinca orta ve sag sutun en uste doner (uygulamanin scrollTo'su artik pencereyi kaydirmaz)
  let sayfaAnahtar = '';
  const ustaDon = () => {
    let k = ''; try { k = [tab, det, dt, Q, QX, PMV ? 1 : 0].join('|'); } catch (e) { }
    if (k !== sayfaAnahtar) { sayfaAnahtar = k; app.scrollTop = 0; sag.scrollTop = 0; }
  };

  // arama: FotMob gibi "Ctrl K" ipucu ve kisayolu (Mac'te Cmd K), Esc ile cik
  const qi = document.getElementById('q'), sb = qi && qi.closest('.sb');
  if (qi && sb && !sb.querySelector('.dzkbd')) {
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || '');
    sb.insertAdjacentHTML('beforeend', `<kbd class="dzkbd">${mac ? '⌘' : 'Ctrl'} K</kbd>`);
    const ipucu = () => sb.classList.toggle('dzdolu', !!qi.value || document.activeElement === qi);
    qi.addEventListener('input', ipucu); qi.addEventListener('focus', ipucu); qi.addEventListener('blur', ipucu);
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); qi.focus(); qi.select(); ipucu(); }
      else if (e.key === 'Escape' && document.activeElement === qi) { qi.blur(); ipucu(); }
    });
  }

  // lig kartlarini ac/kapa (FotMob gibi baslikta ok); durum oturum boyunca lig adina gore hatirlanir
  const kapali = new Set((() => { try { return JSON.parse(sessionStorage.getItem('dzKapali') || '[]'); } catch (e) { return []; } })());
  const kartAd = b => (b.querySelector(':scope > .lg2 > div') || {}).childNodes?.[0]?.textContent?.trim() || '';
  const kapaliUygula = () => { if (!MQ.matches) return; app.querySelectorAll(':scope > .box').forEach(b => { if (b.querySelector(':scope > .lg2')) b.classList.toggle('dzkapali', kapali.has(kartAd(b))); }); };
  app.addEventListener('click', e => {
    if (!MQ.matches) return;
    const h = e.target.closest && e.target.closest('#app > .box > .lg2');
    if (!h || e.target.closest('[data-tm],[data-fav],button,a')) return;
    const b = h.parentElement, ad = kartAd(b); if (!ad || !b.querySelector(':scope > .mr')) return;
    kapali.has(ad) ? kapali.delete(ad) : kapali.add(ad);
    try { sessionStorage.setItem('dzKapali', JSON.stringify([...kapali])); } catch (x) { }
    b.classList.toggle('dzkapali', kapali.has(ad));
  });

  // lig karti basliklarinda harf rozeti yerine yuvarlak bayrak (lig adindan kod bulunur; bayragi yoksa rozet kalir)
  const bayrakUygula = () => {
    if (!MQ.matches) return;
    let ad2kod = {}; try { Object.keys(LN).forEach(c => { const n = LN[c].split(' – ').pop(); if (n) ad2kod[n] = c; }); } catch (e) { return; }
    app.querySelectorAll(':scope > .box > .lg2').forEach(h => {
      if (h.dataset.dzb) return; h.dataset.dzb = '1';
      const c = ad2kod[kartAd(h.parentElement)], rz = h.querySelector(':scope > .bd');
      if (!c || !rz || !BAYRAK[ULKE[c]]) return;
      rz.insertAdjacentHTML('beforebegin', bayrak(c).replace('class="dzbay"', 'class="dzbay dzlgb"')); rz.remove();
    });
  };

  new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) { sagCiz(); ustaDon(); kapaliUygula(); bayrakUygula(); } }).observe(app, { childList: true });
  solCiz(); sagCiz();
})();
