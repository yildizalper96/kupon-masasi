// Transfermarkt oyuncu profili: sozlesme bitisi (cx) ve guncel piyasa degeri. data/tm/p/*.json (cx, v gecmisine son nokta)
// ve data/players/foot.json + foot-ad (v EUR) tazelenir. Oyuncu basina 1 istek, ~2 istek/sn; API-Football kotasi HARCAMAZ.
// Yarida kesilirse kaldigi yerden devam eder (data/tm/.tm-profil-ilerleme.json, git'e girmez).
// Kullanim: node tools/tm-profil.mjs [--gun 20]   (son N gunde bakilanlari atla)
import fs from 'node:fs';
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const gi = process.argv.indexOf('--gun'); const GUN = gi > 0 ? +process.argv[gi + 1] : 20;
const PROG = 'data/tm/.tm-profil-ilerleme.json';
const prog = fs.existsSync(PROG) ? rd(PROG) : {};
const files = {}; for (let i = 0; i < 100; i++) { const f = `data/tm/p/${i}.json`; if (fs.existsSync(f)) files[i] = rd(f); }
const ids = []; for (const o of Object.values(files)) for (const id of Object.keys(o)) if (!(prog[id] && Date.now() - prog[id] < GUN * 864e5)) ids.push(id);
console.log('bakilacak oyuncu', ids.length);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(id) {
  for (let k = 0; k < 3; k++) {
    try { const r = await fetch(`https://tmapi-alpha.transfermarkt.technology/player/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' } });
      if (r.status === 404) return null; if (r.status === 429 || r.status >= 500) { await sleep(5000 * (k + 1)); continue; }
      if (!r.ok) return null; const j = await r.json(); return (j && j.data) || null; } catch (e) { await sleep(3000); }
  }
  return undefined;
}
const cur = {}; let n = 0, ncx = 0, nv = 0, hata = 0;
const kaydet = () => { for (const [i, o] of Object.entries(files)) fs.writeFileSync(`data/tm/p/${i}.json`, JSON.stringify(o)); fs.writeFileSync(PROG, JSON.stringify(prog)); };
for (const id of ids) {
  const d = await get(id); n++;
  if (d === undefined) hata++; else {
    prog[id] = Date.now();
    if (d) {
      const p = files[+id % 100][id];
      const cu = d.attributes && d.attributes.contractUntil;
      if (cu && /^\d{4}-\d{2}-\d{2}/.test(cu) && p.cx !== cu.slice(0, 10)) { p.cx = cu.slice(0, 10); ncx++; }
      const mv = d.marketValueDetails && d.marketValueDetails.current;
      if (mv && mv.value > 0 && mv.determined) {
        cur[id] = mv.value; const ay = mv.determined.slice(0, 7), k = Math.round(mv.value / 1000);
        const v = p.v || (p.v = []); const i = v.findIndex(x => x[0] === ay);
        if (i >= 0) { if (v[i][1] !== k) { v[i][1] = k; nv++; } }
        else if (!v.length || v[v.length - 1][0] < ay) { v.push([ay, k]); nv++; }
      }
    }
  }
  if (n % 200 === 0) { kaydet(); console.log(n, '/', ids.length, 'sozlesme', ncx, 'deger', nv, 'hata', hata); }
  await sleep(450);
}
kaydet();
const yaz = (f, o) => { let c = 0; for (const v of Object.values(o)) if (v && v.t && cur[v.t] && v.v !== cur[v.t]) { v.v = cur[v.t]; c++; } if (c) fs.writeFileSync(f, JSON.stringify(o)); return c; };
let fc = yaz('data/players/foot.json', rd('data/players/foot.json'));
for (const fn of fs.readdirSync('data/players/foot-ad')) fc += yaz('data/players/foot-ad/' + fn, rd('data/players/foot-ad/' + fn));
console.log('bitti: istek', n, 'sozlesme degisen', ncx, 'deger gecmisi degisen', nv, 'hata', hata, 'foot v', fc);
