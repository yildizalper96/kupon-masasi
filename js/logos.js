// Takim logolari (deneme, 12 Kas 2026): API-Football takim kimligi -> media.api-sports.io logosu.
// Sozluk: data/teams/ids.json (tools/fetch-fixtures.mjs biriktirir). Kimligi olmayan takimda ya da logo
// yuklenemezse uygulamanin bas harf rozeti gorunur (img onerror ile kaldirilir).
// Not: logolar ilgili kuluplerin markasidir; yayin hakki API sartlarina gore kullanicinin sorumlulugundadir.
(function () {
  // kimlik sozlugu cihazda saklanir: ilk cizimde logolar hazir olur (ag cevabi beklenmez), sonra arka planda guncellenir
  const ANAH = 'kmTeamIds';
  let T = {};
  try { const v = JSON.parse(localStorage.getItem(ANAH) || 'null'); if (v && typeof v === 'object') T = v; } catch (e) { }
  window.kmTeamId = n => T[n] || null;
  const LL = {};
  window.kmLogoOk = (el, id) => { LL[id] = 1; try { el.classList.add('ok'); (el.parentNode || el).classList.add('hl'); } catch (e) { } };
  window.kmLogoErr = el => { try { if (!el.dataset.r) { el.dataset.r = '1'; const s = el.src; setTimeout(() => { el.src = s + (s.indexOf('?') < 0 ? '?r=1' : ''); }, 800); } else el.remove(); } catch (e) { el.remove(); } };
  // milli takim (Uluslar Ligi) logolari bayraktir: telefonda yuvarlak kesilir (class mf)
  let MS = null, MN = -1;
  const milli = n => { try { if (MN !== R.length) { MS = new Set(); R.forEach(m => { if (m.c === 'UNL') { MS.add(m.h); MS.add(m.a); } }); MN = R.length; } return MS.has(n); } catch (e) { return false; } };
  window.kmLogo = function (n) {
    const id = T[n];
    if (!id) return '';
    // bir kez yuklenen logo (LL) yeniden cizimde dogrudan gorunur (ok): bas harf/bos daire an bile gorunmez.
    // yukleme hatasinda bir kez yeniden denenir; ancak o da olmazsa bas harf rozeti kalir.
    return `<img class='tlg${milli(n) ? ' mf' : ''}${LL[id] ? ' ok' : ''}' src='https://media.api-sports.io/football/teams/${id}.png' alt='' decoding='async' referrerpolicy='no-referrer' onload='kmLogoOk(this,${id})' onerror='kmLogoErr(this)'>`;
  };
  const idYukle = () => fetch('data/teams/ids.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || !j.t) return;
    const yeni = JSON.stringify(j.t), degisti = yeni !== JSON.stringify(T);
    T = j.t;
    try { localStorage.setItem(ANAH, yeni); } catch (e) { }
    if (degisti) { try { if (typeof render === 'function') render(); } catch (e) { } }
  }).catch(() => { });
  (window.kmBoot||function(p){return p})(idYukle()); (window.kmReloaders = window.kmReloaders || []).push(idYukle);
})();
// Lig logolari (API-Football): kimlik once fixtures latest.json meta'sindan (KMX.lgId), yoksa sabit tablodan (tools/fetch-fixtures.mjs LEAGUES).
// Yuklenmezse img kaldirilir; altindaki yedek (bayrak/harf) gorunur.
(function () {
  const LGID = { PL: 39, LL: 140, SA: 135, BL: 78, L1: 61, SL: 203, ERE: 88, POR: 94, BEL: 144, SCO: 179, KSA: 307, CL: 2, EL: 3, ECL: 848, UNL: 5, FAC: 45, EFL: 48, CDR: 143, CIT: 137, DFB: 81, CDF: 66, TUK: 206, KNV: 90, TDP: 96, BCP: 147, SFA: 181, USC: 531, BRA: 71, CBR: 73, ARG: 128, CAR: 130, MLS: 253, MX: 262 };
  window.kmLigId = function (c) { try { const k = window.KMX && KMX.lgId && KMX.lgId[c]; if (k) return k; } catch (e) { } return LGID[c] || null; };
  // yedek: logo yuklenmezse gosterilecek html (bayrak ya da renkli nokta)
  window.kmLigLogo = function (c, yedek, cls) {
    const id = window.kmLigId(c);
    if (!id) return yedek || '';
    return `<span class="kmlo ${cls || ''}">${yedek || ''}<img src="https://media.api-sports.io/football/leagues/${id}.png" alt="" decoding="async" referrerpolicy="no-referrer" onload="(this.parentNode||this).classList.add('ok')" onerror="this.remove()"></span>`;
  };
})();
// Lig sayfasini acmak icin arama metni: yalnizca bu lige eslesen ad (or. "Serie A" Brezilya Serie A ile de eslesir)
window.kmLigQ = function (c) {
  try { const l = [LGNM[c]].concat(LGAN[c] || []); const tk = new Set(); R.forEach(m => { tk.add(nzq(m.h)); tk.add(nzq(m.a)); }); const ok = a => { const r = lgm(a); return r.length === 1 && r[0] === c; }; return l.find(a => ok(a) && !tk.has(nzq(a))) || l.find(ok) || LGNM[c]; } catch (e) { return (typeof LGNM !== 'undefined' && LGNM[c]) || c; }
};
