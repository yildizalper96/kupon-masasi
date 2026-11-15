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
  function bayrak(c) { const y = bayrak0(c); return typeof window.kmLigLogo === 'function' ? window.kmLigLogo(c, y) : y; }
  function bayrak0(c) {
    const b = BAYRAK[ULKE[c]];
    if (!b) return `<i class="dznok" style="background:${esc(ligRenk(c))}"></i>`;
    const id = 'dzb' + (bid++);
    return `<svg class="dzbay" viewBox="0 0 24 24" aria-hidden="true"><clipPath id="${id}"><circle cx="12" cy="12" r="12"/></clipPath><g clip-path="url(#${id})">${b}</g></svg>`;
  }
  function ligAc(c) {
    // Ligler sekmesine gec, ligi ac (uygulamanin kendi [data-lg] davranisiyla ayni)
    const nb = document.querySelector('nav button[data-t="l"]');
    if (nb && typeof tab !== 'undefined' && tab !== 'l') nb.click();
    try { Q = (window.kmLigQ ? window.kmLigQ(c) : LGNM[c]); QX = ''; const e = document.getElementById('q'); render(); if (e) e.value = LGNM[c] || Q; window.scrollTo(0, 0); } catch (e) { }
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
    // takim notlari artik yalnizca takim ve lig sayfasinda (pages.js takimNotlari)
  }
  // ana sayfa sag sutun: FotMob "Haberler" karsiligi = uygulamadaki kaynakli takim notlari (NW), son 4; fotograf yok
  function haberEkle() {
    let l = []; try { l = (typeof NW !== 'undefined' && Array.isArray(NW)) ? NW.slice() : []; } catch (e) { }
    if (!l.length || sag.querySelector('.dzhaber')) return;
    l.sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
    const tarih = d => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${m[3]}.${m[2]}` : esc(d || ''); };
    sag.insertAdjacentHTML('beforeend', `<section class="dzk dzhaber"><h3>Takım notları</h3>${l.slice(0, 4).map(x => `<div class="dzhb"><div class="dzhb-u"><b data-tm="${esc(x.tm)}">${esc(x.tm)}</b><small>${tarih(x.d)}</small></div><p>${esc(String(x.x || '').slice(0, 220))}${String(x.x || '').length > 220 ? '…' : ''}</p><small>Kaynak: ${esc((window.KMKAY || String)(x.src || ''))}</small></div>`).join('')}</section>`);
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
    // Kullanici istegi (12 Kas 2026): "Ctrl K" yazisi gorunmesin; kisayol (Ctrl/Cmd K) gizli calismaya devam eder
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
  const kapaliUygula = () => { app.querySelectorAll(':scope > .box').forEach(b => { if (b.querySelector(':scope > .lg2')) b.classList.toggle('dzkapali', kapali.has(kartAd(b))); }); };
  app.addEventListener('click', e => {
    const h = e.target.closest && e.target.closest('#app > .box > .lg2');
    if (!h || e.target.closest('[data-tm],[data-fav],button,a')) return;
    const b = h.parentElement, ad = kartAd(b); if (!ad || !b.querySelector(':scope > .mr')) return;
    kapali.has(ad) ? kapali.delete(ad) : kapali.add(ad);
    try { sessionStorage.setItem('dzKapali', JSON.stringify([...kapali])); } catch (x) { }
    b.classList.toggle('dzkapali', kapali.has(ad));
  });

  // lig karti basliklarinda harf rozeti yerine yuvarlak bayrak (lig adindan kod bulunur; bayragi yoksa rozet kalir)
  const bayrakUygula = () => {
    let ad2kod = {}; try { Object.keys(LN).forEach(c => { const n = LN[c].split(' – ').pop(); if (n) ad2kod[n] = c; }); } catch (e) { return; }
    app.querySelectorAll(':scope > .box > .lg2').forEach(h => {
      if (h.dataset.dzb) return; h.dataset.dzb = '1';
      const c = ad2kod[kartAd(h.parentElement)], rz = h.querySelector(':scope > .bd');
      if (!c || !rz || !(BAYRAK[ULKE[c]] || (window.kmLigId && window.kmLigId(c)))) return;
      rz.insertAdjacentHTML('beforebegin', bayrak(c).replace('class="dzbay"', 'class="dzbay dzlgb"')); rz.remove();
    });
  };

  // ===== TELEFON (<=1099px): ust bar (Canli + takvim + filtre), gun seridi, alttaki arama dugmesi =====
  const DAR = matchMedia('(max-width:1099px)');
  const SV = (d, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const anaSayfa = () => {
    try { det = null; PMV = null; Q = ''; QX = ''; const e = document.getElementById('q'); if (e) e.value = ''; } catch (e) { }
    const nb = document.querySelector('nav button[data-t="k"]');
    try { if (typeof tab !== 'undefined' && tab === 'k') render(); else if (nb) nb.click(); } catch (e) { if (nb) nb.click(); }
  };
  const hr = document.querySelector('header .hr');
  let canliB = null, filB = null;
  if (hr && !hr.querySelector('.kmust')) {
    const u = document.createElement('div'); u.className = 'kmust';
    u.innerHTML = `<div class="kmust-p"><button class="kmcanli" type="button"><i></i>Canlı</button><button class="kmtakvim" type="button" aria-label="Bugüne dön">${SV('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4"/>', 1.8)}<b>${new Date().getDate()}</b></button></div><button class="kmfil" type="button" aria-label="Filtre">${SV('<path d="M4 6h16M7 12h10M10 18h4"/>', 2.2)}</button>`;
    hr.appendChild(u);
    const kapa = document.createElement('button'); kapa.className = 'kmarakapa'; kapa.type = 'button'; kapa.textContent = 'Vazgeç';
    hr.appendChild(kapa);
    canliB = u.querySelector('.kmcanli'); filB = u.querySelector('.kmfil');
    canliB.onclick = () => { if (!document.getElementById('lv')) anaSayfa(); const b = document.getElementById('lv'); if (b) b.click(); };
    u.querySelector('.kmtakvim').onclick = () => { try { day = dk(new Date()); } catch (e) { } anaSayfa(); window.scrollTo(0, 0); };
    filB.onclick = () => { if (!document.getElementById('flt')) anaSayfa(); const b = document.getElementById('flt'); if (b) b.click(); };
    kapa.onclick = () => { document.body.classList.remove('kmaraac'); const q = document.getElementById('q'); if (q && q.value) { q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })); } };
  }
  if (!document.getElementById('kmara')) {
    const a = document.createElement('button'); a.id = 'kmara'; a.type = 'button'; a.setAttribute('aria-label', 'Ara');
    a.innerHTML = SV('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/>', 2.2);
    a.onclick = () => aramaAc();
    document.body.appendChild(a);
  }
  // alt menu ikonlari (telefon): dolgulu, sade ikonlar; masaustunde yalnizca profil ikonu gorunur
  const NIK = {
    k: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.6"/><path d="M12 5v14M2.5 9.6h2.8v4.8H2.5M21.5 9.6h-2.8v4.8h2.8"/><circle cx="12" cy="12" r="2.4"/></svg>',
    l: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v1.6h3.4v2.6a4.6 4.6 0 0 1-4.1 4.6A5.1 5.1 0 0 1 13.2 15v2.2h3.3V21h-9v-3.8h3.3V15a5.1 5.1 0 0 1-3.1-3.2A4.6 4.6 0 0 1 3.6 7.2V4.6H7zm0 3.4H5.4v.8A2.8 2.8 0 0 0 7.1 9.8 6 6 0 0 1 7 8.8zm10 0v2.4c0 .3 0 .7-.1 1a2.8 2.8 0 0 0 1.7-2.6v-.8z"/></svg>',
    g: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="11" width="4" height="9" rx="1.4"/><rect x="10" y="4" width="4" height="16" rx="1.4"/><rect x="16" y="8" width="4" height="12" rx="1.4"/></svg>',
    s: '<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M6.2 2.5h11.6c.7 0 1.2.5 1.2 1.2V21l-2.4-1.5-2.3 1.5-2.3-1.5-2.3 1.5-2.3-1.5L5 21V3.7c0-.7.5-1.2 1.2-1.2zM8.5 7v2h7V7zm0 4v2h7v-2zm0 4v2h4.5v-2z"/></svg>',
    u: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.8" r="4.3"/><path d="M3.8 20.6c.4-4.3 3.9-6.8 8.2-6.8s7.8 2.5 8.2 6.8c0 .5-.4.9-.9.9H4.7c-.5 0-.9-.4-.9-.9z"/></svg>',
  };
  document.querySelectorAll('nav button[data-t]').forEach(b => { const i = NIK[b.dataset.t], k = b.querySelector('b'); if (i && k) k.innerHTML = i; });

  // ===== tam ekran arama (telefon): ustte baslik + suzgec haplari, son aramalar / oneriler, altta arama kutusu =====
  const SON = 'kmSonAra';
  const sonOku = () => { try { const v = JSON.parse(localStorage.getItem(SON) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const sonYaz = x => { try { const l = sonOku().filter(y => !(y.t === x.t && y.k === x.k)); l.unshift(x); localStorage.setItem(SON, JSON.stringify(l.slice(0, 8))); } catch (e) { } };
  const ara = document.createElement('div'); ara.id = 'kmarae'; ara.hidden = true;
  ara.innerHTML = `<div class="kma-ic"><h1>Ara</h1><div class="kma-f">${[['tum', 'Tümü'], ['tm', 'Takımlar'], ['lg', 'Ligler'], ['pl', 'Oyuncular'], ['m', 'Maçlar']].map(([k, l], i) => `<button type="button" data-kmaf="${k}" class="${i ? '' : 'on'}">${l}</button>`).join('')}</div><div class="kma-g"></div></div>
    <div class="kma-alt"><label class="kma-k">${SV('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/>', 2.2)}<input type="search" placeholder="Ara" enterkeyhint="search" autocomplete="off" aria-label="Ara"></label><button type="button" class="kma-x" aria-label="Kapat">${SV('<path d="M6 6l12 12M18 6L6 18"/>', 2.2)}</button></div>`;
  document.body.appendChild(ara);
  const aInp = ara.querySelector('input'), aG = ara.querySelector('.kma-g');
  let aF = 'tum';
  const nz = s => String(s || '').toLocaleLowerCase('tr');
  const TREND = SV('<path d="M3 16l6-6 4 4 8-8M15 6h6v6"/>', 2.2);
  // arama acikken alttaki sayfa kaymaz ve gorunmez: govde sabitlenir, ekran gorunur alana (klavye ustu) oturur
  let aY = 0;
  function aramaAc() { aY = window.scrollY; const b = document.body; b.style.position = 'fixed'; b.style.top = -aY + 'px'; b.style.left = '0'; b.style.right = '0'; ara.hidden = false; b.classList.add('kmaraacik'); aInp.value = ''; aCiz(); vvAyar(); setTimeout(() => aInp.focus(), 40); }
  function aramaKapa() { const b = document.body; ara.hidden = true; b.classList.remove('kmaraacik'); aInp.blur(); b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = ''; window.scrollTo(0, aY); }
  function aGit(x) {
    sonYaz(x); aramaKapa(); aY = 0;
    try {
      if (x.t === 'tm') { push(); det = null; PMV = null; tab = 'k'; Q = x.k; QX = Q; const q = document.getElementById('q'); if (q) q.value = Q; render(); }
      else if (x.t === 'lg') ligAc(x.k);
      else if (x.t === 'pl') { if (typeof plOpen === 'function') plOpen(x.k, x.n); }
      else if (x.t === 'm') { push(); if (typeof tab !== 'undefined' && tab === 'g') tab = 'k'; det = x.k; dt = 'p'; PMV = null; render(); }
      window.scrollTo(0, 0);
    } catch (e) { }
  }
  function takimlar() { const s = new Set(); try { R.forEach(m => { s.add(m.h); s.add(m.a); }); } catch (e) { } return [...s]; }
  function oneri() {
    const son = sonOku();
    if (son.length) return `<h4>Son aramalar</h4><div class="kma-c">${son.map((x, i) => `<button type="button" data-kmas="${i}">${x.t === 'tm' ? bdG(x.k) : TREND}<span>${esc(x.n)}</span></button>`).join('')}</div>`;
    const tk = new Set(takimlar());
    let fav = []; try { fav = [...FAV].filter(n => tk.has(n)); } catch (e) { }
    const pop = ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Real Madrid', 'Barcelona', 'Man City', 'Arsenal', 'Liverpool', 'Bayern'].filter(n => tk.has(n));
    const l = [...new Set([...fav, ...pop])].slice(0, 6);
    return l.length ? `<h4>Öneriler</h4><div class="kma-c">${l.map(n => `<button type="button" data-kmat="tm" data-kmak="${esc(n)}">${TREND}<span>${esc(n)}</span></button>`).join('')}</div>` : '';
  }
  const bdG = n => { try { return typeof bd === 'function' ? bd(n) : ''; } catch (e) { return ''; } };
  function aCiz() {
    const q = nz(aInp.value.trim());
    ara.querySelectorAll('[data-kmaf]').forEach(b => b.classList.toggle('on', b.dataset.kmaf === aF));
    if (q.length < 2) { aG.innerHTML = oneri(); return; }
    const bol = [];
    const sat = (t, k, n, ic, alt) => `<button type="button" class="kma-r" data-kmat="${t}" data-kmak="${esc(k)}" data-kman="${esc(n)}">${ic}<span><b>${esc(n)}</b>${alt ? `<small>${esc(alt)}</small>` : ''}</span></button>`;
    if (aF === 'tum' || aF === 'tm') { const l = takimlar().filter(n => nz(n).includes(q)).sort((a, b) => nz(a).indexOf(q) - nz(b).indexOf(q)).slice(0, aF === 'tum' ? 5 : 30); if (l.length) bol.push(['Takımlar', l.map(n => { let u = ''; try { const t = TM[n]; u = t && t.l ? ligAdi(t.l) : ''; } catch (e) { } return sat('tm', n, n, bdG(n), u); }).join('')]); }
    if (aF === 'tum' || aF === 'lg') { let ks = []; try { ks = (typeof LORD !== 'undefined' ? LORD : Object.keys(LN)); } catch (e) { } const l = ks.filter(c => nz(ligAdi(c)).includes(q) || nz(c) === q).slice(0, aF === 'tum' ? 4 : 30); if (l.length) bol.push(['Ligler', l.map(c => { let u = ''; try { u = LN[c] ? LN[c].split(' – ')[0] : ''; } catch (e) { } return sat('lg', c, ligAdi(c), `<span class="kma-lg">${bayrak(c)}</span>`, u); }).join('')]); }
    if ((aF === 'tum' || aF === 'pl') && q.length >= 3 && typeof window.kmOyuncuAra === 'function') { const l = window.kmOyuncuAra(q).slice(0, aF === 'tum' ? 5 : 16); if (l.length) bol.push(['Oyuncular', l.map(p => sat('pl', p.k, p.n, `<span class="kma-av">${p.f ? `<img src="${esc(p.f)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<i>${esc(String(p.n).split(' ').pop().slice(0, 2).toUpperCase())}</i></span>`, p.tm)).join('')]); }
    if (aF === 'tum' || aF === 'm') {
      let l = []; try { const now = Date.now() - 3 * 36e5; l = R.filter(m => nz(m.h + ' ' + m.a).includes(q)).sort((a, b) => ((a.t < now) - (b.t < now)) || (a.t < now ? b.t - a.t : a.t - b.t)).slice(0, aF === 'tum' ? 5 : 30); } catch (e) { }
      if (l.length) bol.push(['Maçlar', l.map(m => { const d = new Date(m.t), k = [m.c, m.h, m.a].join('|'); let sk = ''; try { const s = stt(m); sk = s.sc ? `${s.sc[0]} - ${s.sc[1]}` : hm(m.t); } catch (e) { } return `<button type="button" class="kma-r kma-m" data-kmat="m" data-kmak="${esc(k)}" data-kman="${esc(m.h + ' – ' + m.a)}"><span class="kma-mt"><span>${esc(m.h)}</span>${bdG(m.h)}<b>${esc(sk)}</b>${bdG(m.a)}<span>${esc(m.a)}</span></span><small>${esc(d.getDate() + ' ' + AY[d.getMonth()])} · ${esc(ligAdi(m.c))}</small></button>`; }).join('')]);
    }
    aG.innerHTML = bol.length ? bol.map(([h, x]) => `<h4>${h}</h4><div class="kma-l">${x}</div>`).join('') : '<p class="kma-bos">Sonuç bulunamadı.</p>';
  }
  aInp.addEventListener('input', aCiz);
  aInp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const r = aG.querySelector('.kma-r'); if (r) r.click(); } else if (e.key === 'Escape') aramaKapa(); });
  ara.querySelector('.kma-x').onclick = aramaKapa;
  ara.addEventListener('click', e => {
    const f = e.target.closest('[data-kmaf]'); if (f) { aF = f.dataset.kmaf; aCiz(); return; }
    const s = e.target.closest('[data-kmas]'); if (s) { const x = sonOku()[+s.dataset.kmas]; if (x) aGit(x); return; }
    const r = e.target.closest('[data-kmat]'); if (r) { e.preventDefault(); e.stopPropagation(); aGit({ t: r.dataset.kmat, k: r.dataset.kmak, n: r.dataset.kman || r.dataset.kmak }); }
  }, true);
  // klavye acilinca alttaki kutu klavyenin ustune cikar
  function vvAyar() { const v = window.visualViewport; if (!v) return; ara.style.top = v.offsetTop + 'px'; ara.style.height = v.height + 'px'; }
  if (window.visualViewport) { visualViewport.addEventListener('resize', vvAyar); visualViewport.addEventListener('scroll', vvAyar); }
  // uzun ulke adlari (ilk sozcuk ulkenin kendisiyse) mac satirlarinda kisa yazilir; bayrak zaten ulkeyi gosterir
  const KISA = { 'İrlanda Cumhuriyeti': 'İrlanda', 'Bosna-Hersek': 'Bosna', 'Faroe Adaları': 'Faroe' };
  function kisaAd() { if (!DAR.matches) return; app.querySelectorAll('.mr .tz [data-tm], .kmsnm b, .kmh2s span, .kmfs em').forEach(e => { const k = KISA[e.textContent.trim()]; if (k && e.children.length === 0) e.textContent = k; }); }
  const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const gunEt = d => {
    const g = n => dk(new Date(Date.now() + n * 864e5));
    if (d === g(0)) return 'Bugün'; if (d === g(1)) return 'Yarın'; if (d === g(-1)) return 'Dün';
    const x = new Date(d + 'T12:00'); return x.toLocaleDateString('tr-TR', { weekday: 'short' }) + ' ' + x.getDate() + ' ' + AY[x.getMonth()];
  };
  function gunler() {
    try {
      const t = dk(new Date()), LDS = new Set((typeof LGR !== 'undefined' ? LGR : []).map(r => dk(new Date(r.t))));
      return [...new Set(R.filter(m => dk(m.t) >= t || LDS.has(dk(m.t))).map(m => dk(m.t)))].sort();
    } catch (e) { return []; }
  }
  function gunSeridi() {
    if (!DAR.matches) return;
    const stk = app.querySelector(':scope > .stk');
    if (!stk || app.querySelector(':scope > .kmgun')) return;
    const ds = gunler(); if (!ds.length) return;
    const t = dk(new Date()), cur = typeof day !== 'undefined' ? day : '';
    let l = [...ds.filter(d => d < t).slice(-7), ...ds.filter(d => d >= t)];
    if (cur && !l.includes(cur) && ds.includes(cur)) l = [...l, cur].sort();
    const el = document.createElement('div'); el.className = 'kmgun';
    el.innerHTML = l.map(d => `<button type="button" data-kmgun="${esc(d)}" class="${d === cur ? 'on' : ''}">${esc(gunEt(d))}</button>`).join('');
    stk.before(el);
    el.querySelectorAll('[data-kmgun]').forEach(b => b.onclick = () => { try { day = b.dataset.kmgun; render(); } catch (e) { } });
    const on = el.querySelector('.on'); if (on) el.scrollLeft = on.offsetLeft - (el.clientWidth - on.offsetWidth) / 2;
  }
  // Ligler sayfasi (telefon): buyuk baslik + "Lig bul" kutusu, liste ada gore suzulur
  function ligAramasi() {
    if (!DAR.matches) return;
    const g = app.querySelector(':scope > .lgg'); if (!g || app.querySelector(':scope > .kmligara')) return;
    const h = g.previousElementSibling; if (h && h.tagName === 'H3') { h.classList.add('kmligb'); h.textContent = 'Ligler'; }
    const l = document.createElement('label'); l.className = 'kmligara';
    l.innerHTML = `${SV('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/>', 2.2)}<input type="search" placeholder="Lig bul" aria-label="Lig bul">`;
    g.before(l);
    const t = document.createElement('h4'); t.className = 'kmligt'; t.textContent = 'Tüm ligler'; g.before(t);
    const n = s => String(s).toLocaleLowerCase('tr');
    const inp = l.querySelector('input');
    inp.oninput = () => { const q = n(inp.value.trim()); let k = 0; g.querySelectorAll('.lgc').forEach(c => { const ok = !q || n(c.textContent).includes(q); c.hidden = !ok; if (ok) k++; }); t.textContent = q ? (k ? `${k} lig` : 'Eşleşen lig yok') : 'Tüm ligler'; };
  }
  // takim / lig / oyuncu sayfasi (telefon): ustte geri dugmesi, sekmeler ayri yapiskan seritte (mac sayfasi gibi)
  function mobilBaslik() {
    if (!DAR.matches) return;
    const k = app.querySelector(':scope > .kmth, :scope > .kmph'); if (!k || k.dataset.mb) return; k.dataset.mb = '1';
    const r = document.createElement('div'); r.className = 'kmmb-ust';
    const g = k.querySelector('[data-kmpgeri]');
    if (g) r.appendChild(g); else r.innerHTML = '<button class="kmgeri" data-kmpgeri="1" aria-label="Geri"></button>';
    k.prepend(r);
    const s = k.querySelector(':scope > .kmsek');
    if (s) { const y = document.createElement('div'); y.className = 'kmyap kmyapt'; k.after(y); y.appendChild(s); }
  }
  // gorsel on yukleme: bosta iken yakin gunlerin takim logolari, lig logolari ve bugunun resmi 11 fotograflari indirilir;
  // service worker kalici onbellege alir, sayfa acilinca gorseller aninda gelir
  const ONY = new Set();
  function onYukle() {
    const bag = navigator.connection || {}, kisit = bag.saveData || /(^|-)2g/.test(bag.effectiveType || '');
    const l = [];
    const ekle = u => { if (u && !ONY.has(u)) { ONY.add(u); l.push(u); } };
    try {
      const simdi = Date.now(), tid = window.kmTeamId || (() => null);
      R.filter(m => Math.abs(m.t - simdi) < 3 * 864e5).forEach(m => [m.h, m.a].forEach(n => { const id = tid(n); if (id) ekle(`https://media.api-sports.io/football/teams/${id}.png`); }));
      if (!kisit) { try { Object.keys(TM).forEach(n => { const id = tid(n); if (id) ekle(`https://media.api-sports.io/football/teams/${id}.png`); }); } catch (e) { } R.filter(m => Math.abs(m.t - simdi) < 10 * 864e5).forEach(m => [m.h, m.a].forEach(n => { const id = tid(n); if (id) ekle(`https://media.api-sports.io/football/teams/${id}.png`); })); }
      Object.keys(LN).forEach(c => { const id = window.kmLigId && window.kmLigId(c); if (id) ekle(`https://media.api-sports.io/football/leagues/${id}.png`); });
      if (!kisit && window.KMX && typeof KMX.luRaw === 'function') R.filter(m => Math.abs(m.t - simdi) < 864e5).forEach(m => { let r = null; try { r = KMX.luRaw(m); } catch (e) { } if (!r) return; ['h', 'a'].forEach(s => [...((r[s] || {}).xi || []), ...((r[s] || {}).bn || [])].forEach(p => { if (p && +p.id > 0) ekle(`https://media.api-sports.io/football/players/${+p.id}.png`); })); });
    } catch (e) { }
    if (!l.length) return;
    let i = 0;
    const parti = () => { const s = l.slice(i, i += 12); s.forEach(u => { const im = new Image(); im.decoding = 'async'; im.referrerPolicy = 'no-referrer'; im.src = u; }); if (i < l.length) setTimeout(parti, 120); };
    (window.requestIdleCallback || (f => setTimeout(f, 600)))(parti);
  }
  let onyZ = 0;
  const onYukleZamanla = () => { clearTimeout(onyZ); onyZ = setTimeout(onYukle, 900); };
  const durumEsle = () => {
    try { if (canliB) canliB.classList.toggle('on', !!LV); if (filB) filB.classList.toggle('on', !!FS); } catch (e) { }
  };

  new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) { sagCiz(); ustaDon(); kapaliUygula(); bayrakUygula(); gunSeridi(); ligAramasi(); mobilBaslik(); kisaAd(); durumEsle(); onYukleZamanla(); } }).observe(app, { childList: true });
  gunSeridi(); durumEsle();
  solCiz(); sagCiz();

  // Geri/ileri: her gecmis kaydina kaydirma konumu (orta/sag/sol sutun ve pencere) ve sayfa ici durum (sekme, sayfa) eklenir;
  // geri donuste once durum, cizimden sonra kaydirma geri yuklenir (ustaDon'un basa almasindan sonra).
  try {
    const kay = () => ({ a: app.scrollTop, r: sag.scrollTop, l: sol.scrollTop, w: window.pageYOffset || 0 });
    let bekle = null;
    const uygula = () => { const k = bekle; if (!k) return; try { app.scrollTop = k.a; sag.scrollTop = k.r; sol.scrollTop = k.l; if (!MQ.matches) window.scrollTo(0, k.w); } catch (e) { } };
    const yamala = arr => {
      if (!Array.isArray(arr) || arr.__km) return; arr.__km = 1;
      arr.push = function (x) { try { if (x && typeof x === 'object') { x._sc = kay(); x._km = window.KM_DURUM_AL ? window.KM_DURUM_AL() : null; } } catch (e) { } return Array.prototype.push.apply(this, arguments); };
      arr.pop = function () { const x = Array.prototype.pop.call(this); try { if (x && x._sc) { if (x._km && window.KM_DURUM_VER) window.KM_DURUM_VER(x._km); bekle = x._sc; [0, 60, 200, 450].forEach(t => setTimeout(uygula, t)); setTimeout(() => { bekle = null; }, 500); } } catch (e) { } return x; };
    };
    yamala(NAVS); yamala(FWD);
  } catch (e) { }
})();
