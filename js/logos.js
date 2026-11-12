// Takim logolari (deneme, 12 Kas 2026): API-Football takim kimligi -> media.api-sports.io logosu.
// Sozluk: data/teams/ids.json (tools/fetch-fixtures.mjs biriktirir). Kimligi olmayan takimda ya da logo
// yuklenemezse uygulamanin bas harf rozeti gorunur (img onerror ile kaldirilir).
// Not: logolar ilgili kuluplerin markasidir; yayin hakki API sartlarina gore kullanicinin sorumlulugundadir.
(function () {
  let T = {};
  window.kmLogo = function (n) {
    const id = T[n];
    if (!id) return '';
    return `<img class='tlg' src='https://media.api-sports.io/football/teams/${id}.png' alt='' loading='lazy' decoding='async' referrerpolicy='no-referrer' onload='this.parentNode.classList.add("hl")' onerror='this.remove()'>`;
  };
  fetch('data/teams/ids.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || !j.t) return;
    T = j.t;
    try { if (typeof render === 'function') render(); } catch (e) { }
  }).catch(() => { });
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
    return `<span class="kmlgl ${cls || ''}">${yedek || ''}<img src="https://media.api-sports.io/football/leagues/${id}.png" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.parentNode.classList.add('ok')" onerror="this.remove()"></span>`;
  };
})();
