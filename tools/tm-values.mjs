// Transfermarkt guncel piyasa degerleri: data/tm/p/*.json deger gecmisini (v) ve data/players/foot.json v alanini tazeler.
// Kaggle veri seti 12 Haz 2026'da dondu; bu arac Transfermarkt'in herkese acik deger grafigi ucundan (oyuncu basina 1 istek) yeni noktalari ekler.
// API-Football kotasi HARCAMAZ. Nazik hiz: ~2 istek/sn. Yarida kesilirse kaldigi yerden devam eder (.tm-values-ilerleme.json).
// Kullanim: node tools/tm-values.mjs [--gun 30]   (--gun: son N gunde guncellenmis oyunculari atla; varsayilan 20)
import fs from 'node:fs';
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const gi = process.argv.indexOf('--gun'); const GUN = gi > 0 ? +process.argv[gi + 1] : 20;
const PROG = 'data/tm/.tm-values-ilerleme.json';
const prog = fs.existsSync(PROG) ? rd(PROG) : {};
const files = {}; for (let i = 0; i < 100; i++) { const f = `data/tm/p/${i}.json`; if (fs.existsSync(f)) files[i] = rd(f); }
const ids = []; for (const [i, o] of Object.entries(files)) for (const id of Object.keys(o)) if (!(prog[id] && Date.now() - prog[id] < GUN * 864e5)) ids.push(id);
console.log('guncellenecek oyuncu', ids.length);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(id) {
  for (let k = 0; k < 3; k++) {
    try { const r = await fetch(`https://www.transfermarkt.com/ceapi/marketValueDevelopment/graph/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } });
      if (r.status === 404) return null; if (r.status === 429 || r.status >= 500) { await sleep(5000 * (k + 1)); continue; }
      if (!r.ok) return null; return await r.json(); } catch (e) { await sleep(3000); }
  }
  return undefined;
}
const cur = {}; // tm kimligi -> guncel deger EUR
let n = 0, deg = 0, hata = 0;
const kaydet = () => { for (const [i, o] of Object.entries(files)) fs.writeFileSync(`data/tm/p/${i}.json`, JSON.stringify(o)); fs.writeFileSync(PROG, JSON.stringify(prog)); };
for (const id of ids) {
  const j = await get(id); n++;
  if (j === undefined) { hata++; } else {
    prog[id] = Date.now();
    const l = (j && j.list) || [];
    if (l.length) {
      const p = files[+id % 100][id]; const m = {}; for (const x of p.v || []) m[x[0]] = x;
      const once = JSON.stringify(p.v || []);
      for (const x of l) { if (!(x.x > 0) || !(x.y >= 0)) continue; const ay = new Date(x.x).toISOString().slice(0, 7); m[ay] = [ay, Math.round(x.y / 1000)]; }
      p.v = Object.values(m).sort((a, b) => a[0] < b[0] ? -1 : 1);
      if (JSON.stringify(p.v) !== once) deg++;
      const son = l[l.length - 1]; if (son && son.y > 0) cur[id] = son.y;
    }
  }
  if (n % 200 === 0) { kaydet(); console.log(n, '/', ids.length, 'degisen', deg, 'hata', hata); }
  await sleep(450);
}
kaydet();
// foot.json + foot-ad: v (guncel deger EUR) alanini tazele
const yaz = (f, o) => { let c = 0; for (const v of Object.values(o)) if (v && v.t && cur[v.t] && v.v !== cur[v.t]) { v.v = cur[v.t]; c++; } fs.writeFileSync(f, JSON.stringify(o)); return c; };
let fc = yaz('data/players/foot.json', rd('data/players/foot.json'));
for (const fn of fs.readdirSync('data/players/foot-ad')) { const f = 'data/players/foot-ad/' + fn; const o = rd(f); if (Object.values(o).some(v => v && v.t && cur[v.t])) fc += yaz(f, o); }
console.log('bitti: istek', n, 'degisen gecmis', deg, 'hata', hata, 'foot v guncellenen', fc);
