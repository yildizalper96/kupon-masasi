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
