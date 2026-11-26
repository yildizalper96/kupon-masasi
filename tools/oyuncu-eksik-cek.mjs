// Oyuncu mac kaydinda (data/api/oyuncu/<tid>.json) eksik biten maclari API-Football'dan ceker ve kayda ekler (26 Kas 2026).
// Yalnizca sitedeki takimlar (data/teams/ids.json), guncel sezon, milli maclar haric. 20 mac/istek (/fixtures?ids=).
// API maci oyuncu verisiz donerse (bazi eleme/kupa maclari) kayda eklenmez: "veri yok" olarak kalir, uydurulmaz.
// Kullanim: node tools/oyuncu-eksik-cek.mjs [--max=60]   (anahtar: .env API_FOOTBALL_KEY ya da ortam degiskeni)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const API = path.join(root, 'data', 'api');
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const wr = (f, o) => { fs.writeFileSync(f + '.tmp', JSON.stringify(o)); fs.renameSync(f + '.tmp', f); };
const MAX = +(process.argv.find(a => a.startsWith('--max='))?.split('=')[1] ?? 60);
const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY) { console.error('HATA: API_FOOTBALL_KEY yok.'); process.exit(1); }
const BITTI = new Set(['FT', 'AET', 'PEN']), SEZON = 2026;
const MILLI = new Set(['UNL', 'WC', 'EURO', 'WCQE', 'EUROQ', 'COPA', 'WCQSA', 'FRI']);

const ids = (rd(path.join(root, 'data', 'teams', 'ids.json')) || {}).t || {};
const UAD = {}; Object.entries(ids).forEach(([n, id]) => { if (!UAD[id]) UAD[id] = n; });
const fx = {}, tn = {};
for (const c of fs.readdirSync(API).filter(d => /^[A-Z][A-Z0-9]*$/.test(d))) {
  if (MILLI.has(c)) continue;
  const f = rd(path.join(API, c, String(SEZON), 'fixtures.json')); if (!f) continue;
  Object.assign(tn, f.tn || {});
  for (const x of f.m || []) if (BITTI.has(x[6])) fx[x[0]] = [c, x[1], x[2], x[3], x[4], x[5], x[7] || ''];
}
const dosya = tid => path.join(API, 'oyuncu', tid + '.json');
const kayit = {}; const al = tid => (kayit[tid] = kayit[tid] || rd(dosya(tid)) || { t: {}, m: {}, p: {} });
const eksik = new Set();
for (const [fid, b] of Object.entries(fx)) for (const t of [b[2], b[3]]) if (UAD[t] && !al(t).m[fid]) eksik.add(+fid);
const L = [...eksik];
console.log(`Eksik mac: ${L.length} (${Math.ceil(L.length / 20)} istek)`);

let istek = 0, eklenen = 0, verisiz = [];
const degisen = new Set();
for (let i = 0; i < L.length && istek < MAX; i += 20) {
  const paket = L.slice(i, i + 20);
  const r = await fetch('https://v3.football.api-sports.io/fixtures?ids=' + paket.join('-'), { headers: { 'x-apisports-key': KEY } });
  istek++;
  const j = await r.json();
  if (j.errors && Object.keys(j.errors).length) { console.error('API hata:', JSON.stringify(j.errors).slice(0, 200)); break; }
  for (const x of j.response || []) {
    const fid = x.fixture.id, b = fx[fid]; if (!b) continue;
    const tp = (x.players || []).filter(t => (t.players || []).length);
    if (!tp.length) { verisiz.push(fid); continue; }
    for (const t of tp) {
      const tid = t.team.id; if (!UAD[tid]) continue;
      const o = al(tid); if (o.m[fid]) continue;
      o.m[fid] = b;
      for (const k of [b[2], b[3]]) if (UAD[k] || tn[k]) o.t[k] = UAD[k] || tn[k];
      for (const p of t.players) {
        const q = p.statistics?.[0]; const dk = q?.games?.minutes || 0; if (!(dk > 0)) continue;
        const e = o.p[p.player.id] || (o.p[p.player.id] = [p.player.name, []]);
        if (String(p.player.name).length > String(e[0]).length) e[0] = p.player.name;
        e[1].push([fid, dk, q.games?.rating ? +(+q.games.rating).toFixed(1) : null, q.goals?.total || 0, q.goals?.assists || 0, q.cards?.yellow || 0, q.cards?.red || 0, q.shots?.total || 0, q.shots?.on || 0, q.passes?.key || 0, q.tackles?.total || 0, q.goals?.saves || 0, q.games?.substitute ? 1 : 0]);
      }
      degisen.add(tid); eklenen++;
    }
  }
  await new Promise(r => setTimeout(r, 300));
}
for (const tid of degisen) {
  const o = kayit[tid];
  Object.values(o.p).forEach(q => q[1].sort((x, y) => String((o.m[y[0]] || [])[1]).localeCompare(String((o.m[x[0]] || [])[1]))));
  wr(dosya(tid), { at: new Date().toISOString(), t: o.t, m: o.m, p: o.p });
}
console.log(`Istek ${istek}, eklenen takim-maci ${eklenen}, yazilan takim ${degisen.size}, oyuncu verisi olmayan mac ${verisiz.length}`);
if (verisiz.length) fs.writeFileSync(path.join(API, 'oyuncu', 'verisiz.json'), JSON.stringify({ at: new Date().toISOString(), m: verisiz.sort() }));
