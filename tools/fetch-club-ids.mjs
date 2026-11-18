// Transfermarkt kulup adlarini (oyuncu transfer/sezon gecmisi) API-Football takim kimligine esler -> data/tm/clublogo.json { "<TM kulup adi>": apiTeamId }
// Istemci bunu kulup logosu icin kullanir (media.api-sports.io/football/teams/<id>.png).
// Yontem (az istek): /teams?league=<id>&season=2024 ile bir ligin TUM takimlari 1 istekte gelir (data/tm/api-teams.json'da birikir);
// eslesme YEREL yapilir (ad esitligi / ad parcalari). Istek yalnizca lig listesi icin; bulunan ligler tekrar cekilmez.
// Kullanim: node tools/fetch-club-ids.mjs [--max=20] [--reserve=60]   (kota /status ile kontrol edilir; --max=0 yalnizca yerel eslestirme)
import fs from 'node:fs';
import path from 'node:path';
import { pace } from './api-pace.mjs';
const root = path.resolve(import.meta.dirname, '..');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const MAX = +arg('max', 20), RESERVE = +arg('reserve', 60);
const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY && MAX > 0) { console.error('HATA: API_FOOTBALL_KEY yok.'); process.exit(1); }
const HOST = 'https://v3.football.api-sports.io';
const nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set(['fc', 'cf', 'sc', 'ac', 'as', 'ss', 'sk', 'fk', 'bk', 'afc', 'cd', 'ud', 'sd', 'rcd', 'rc', 'ssc', 'us', 'if', 'ik', 'sv', 'tsv', 'vfb', 'vfl', 'fsv', 'club', 'de', 'the', 'ca', 'cs', 'nk', 'gnk', 'kv', 'ks', 'og', 'ogc', 'sl', 'sp', 'ec', 'esporte', 'clube', 'real', 'sporting']);
const toks = s => nz(s).split(' ').filter(t => t && !STOP.has(t));
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
// lig kimlikleri (API-Football): buyuk ligler, 2. ligler, Avrupa ve Guney Amerika/Amerika ligleri
const LEAGUES = [39, 140, 135, 78, 61, 203, 88, 94, 144, 179, 307, 40, 41, 141, 136, 79, 62, 204, 71, 128, 253, 262, 218, 207, 119, 113, 103, 197, 235, 333, 345, 106, 210, 286, 283, 172, 271, 244, 357, 318, 373, 332, 169, 98, 292, 188, 72, 129, 239, 265, 281, 242, 274, 218, 145, 180, 80, 63, 142, 137, 89, 95, 85, 164, 244, 106, 107, 342, 203, 553];
const apiPath = path.join(root, 'data/tm/api-teams.json');
const AT = fs.existsSync(apiPath) ? rd(apiPath) : {}; // { "<ligId>": [[takimId, ad],...] }

if (MAX > 0) {
  const st = await fetch(HOST + '/status', { headers: { 'x-apisports-key': KEY } }).then(r => r.json()).catch(() => null);
  const rq = st?.response?.requests; let remaining = rq && Number.isFinite(rq.limit_day) ? rq.limit_day - rq.current : null;
  console.log(`Kota: ${remaining ?? '?'} kaldi; en cok ${MAX} istek, ${RESERVE} yedek.`);
  let used = 0, lastReq = 0, gapMs = 7000;
  // once 2024 sezonu (guncel kulupler), sonra eski sezonlardan dusenler/yukselenler: Turk ligi (Giresunspor, Altay, Istanbulspor...) ve buyuk ligler
  const EXTRA = [[203, 2022], [204, 2024], [204, 2022], [203, 2020], [39, 2020], [140, 2020], [135, 2020], [78, 2020], [61, 2020], [40, 2022], [141, 2022], [136, 2022], [79, 2022], [62, 2022]];
  const JOBS = [...new Set(LEAGUES)].map(l => [l, 2024, String(l)]).concat(EXTRA.map(([l, s]) => [l, s, `${l}-${s}`]));
  for (const [lg, season, key] of JOBS) {
    if (AT[key]) continue; if (used >= MAX || (remaining === null ? 0 : remaining) - used <= RESERVE) break;
    const wait = lastReq + gapMs - Date.now(); if (lastReq && wait > 0) await new Promise(r => setTimeout(r, wait)); lastReq = Date.now();
    await pace(); const r = await fetch(`${HOST}/teams?league=${lg}&season=${season}`, { headers: { 'x-apisports-key': KEY } }); const pm = Number(r.headers.get('x-ratelimit-limit')); if (pm > 0) gapMs = Math.ceil(60000 / pm) + 500;
    used++; const j = await r.json(); const er = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
    if (er && er.length) { console.log('lig', lg, 'hata:', JSON.stringify(j.errors).slice(0, 80)); if (/rate|limit|token|request/i.test(JSON.stringify(j.errors))) break; AT[key] = []; continue; }
    AT[key] = (j.response || []).filter(x => x.team && !x.team.national).map(x => [x.team.id, x.team.name]);
    console.log('lig', key, AT[key].length, 'takim');
  }
  fs.mkdirSync(path.dirname(apiPath), { recursive: true }); fs.writeFileSync(apiPath, JSON.stringify(AT));
  console.log('Harcanan istek:', used);
}

// ---- yerel eslestirme: TM kulup adi -> API takim kimligi ----
const api = []; for (const [lg, a] of Object.entries(AT)) for (const [id, name] of a) api.push({ id, name, n: nz(name), t: toks(name) });
try { const ids = rd(path.join(root, 'data/teams/ids.json')).t || {}; for (const [name, id] of Object.entries(ids)) api.push({ id, name, n: nz(name), t: toks(name) }); } catch (e) { }
const byN = new Map(); for (const a of api) (byN.get(a.n) || byN.set(a.n, new Set()).get(a.n)).add(a.id);
const names = new Set();
for (const f of fs.readdirSync(path.join(root, 'data/tm/p'))) { const o = rd(path.join(root, 'data/tm/p', f)); for (const p of Object.values(o)) for (const t of p.tr || []) { names.add(t[1]); names.add(t[2]); } }
try { for (const n of Object.values(rd(path.join(root, 'data/tm/club-names.json')))) names.add(n); } catch (e) { }
const out = {}; let hit = 0;
for (const name of names) {
  if (!name || /^(Unknown|Retired|Without Club|Career break)$/i.test(name)) continue;
  const n = nz(name); let id = null;
  const ex = byN.get(n); if (ex && ex.size === 1) id = [...ex][0];
  if (!id) { const nt = toks(name); if (nt.length) { const c = api.filter(a => a.t.length && a.t.length === nt.length && a.t.every(w => nt.includes(w))); const s = new Set(c.map(x => x.id)); if (s.size === 1) id = [...s][0]; } }
  if (!id) { // ad parcalari birbirinin altkumesi ("Bayern Munich" ~ "Bayern", "Man Utd" ~ "Manchester Utd" icin kisaltma tablosu)
    const AL = { man: 'manchester', utd: 'united', 'nott m': 'nottingham', wolves: 'wolverhampton', sheff: 'sheffield', 'm tel aviv': 'maccabi tel aviv' };
    let nn = ' ' + n + ' '; for (const [a, b] of Object.entries(AL)) nn = nn.replace(new RegExp(' ' + a + ' ', 'g'), ' ' + b + ' ');
    const nt = toks(nn); if (nt.length) { const c = api.filter(a => a.t.length && (a.t.every(w => nt.includes(w)) || nt.every(w => a.t.includes(w)))); const s = new Set(c.map(x => x.id)); if (s.size === 1) id = [...s][0]; }
  }
  if (id) { out[name] = +id; hit++; }
}
// elle girilen kimlikler (data/tm/clublogo-elle.json, kullanici karari 15 Kas 2026): ustune yazar. API lig listelerinde (api-teams.json)
// o kimlik varsa ve adiyla hic ortak parca yoksa YANLIS sayilip atilir (yanlis logo, eksik logodan kotudur).
try {
  const man = rd(path.join(root, 'data/tm/clublogo-elle.json')); const idName = new Map(api.map(a => [String(a.id), a])); let ok = 0, bad = 0, unv = 0;
  for (const [name, id] of Object.entries(man)) {
    const a = idName.get(String(id));
    if (a) { const nt = toks(name), at = a.t; const pre = (x, y) => { let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++; return i; }; // ortak on ek >=4 harf: Rennes~Rennais, M'gladbach~Mönchengladbach (iceren parca)
    const A = nz(a.name).split(' ').filter(w => w.length >= 4), B = nz(name).split(' ').filter(w => w.length >= 4);
    const share = nt.some(w => at.includes(w)) || A.some(x => B.some(y => pre(x, y) >= 4 || (x.length >= 5 && y.includes(x)) || (y.length >= 5 && x.includes(y)))); if (!share) { console.log('UYARI elle kimlik reddedildi:', name, id, '(API adi:', a.name + ')'); bad++; continue; } ok++; } else unv++;
    out[name] = +id;
  }
  console.log(`elle: ${Object.keys(man).length} kayit, dogrulanan ${ok}, henuz dogrulanamayan ${unv}, reddedilen ${bad}`);
} catch (e) { }
// genclik/B/yedek takimlari ana kulubun kimligine baglanir ("Sporting U19", "Man City U23", "Barça Youth", "Sporting B"): ek soyulur, ana kulup adi (birebir) out'ta aranir.
{
  const YS = /(\s+(U ?\d{2}|Sub-?\d{2}|Youth|Yth\.?|Juniors?|Jgd\.?|Jugend|Reserves?|Res\.?|Primavera|Academy|Akademi|II|III|B|C|Next))+$/i;
  const idx = new Map(); for (const [k, v] of Object.entries(out)) { const z = nz(k); if (!idx.has(z)) idx.set(z, v); } for (const a of api) { if (!idx.has(a.n)) idx.set(a.n, a.id); }
  const AL = { 'Barça': 'Barcelona', 'Bilbao': 'Athletic Club', 'W. Bremen': 'Werder Bremen', 'B. München': 'Bayern Munich', 'Din. Zagreb': 'Dinamo Zagreb', 'D. Zagreb': 'Dinamo Zagreb', 'Palace': 'Crystal Palace', 'Spurs': 'Tottenham', 'Stmk.-Sturm': 'Sturm Graz', 'Nordsjaell.': 'Nordsjælland', 'Sporting CP': 'Sporting', 'Vikt. Plzen': 'Viktoria Plzeň', 'Hajduk': 'Hajduk Split', 'FCK': 'FC Copenhagen', 'HSV': 'Hamburger SV', 'Boro': 'Middlesbrough', 'Sparta': 'Sparta Prague', 'AKA Salzb.': 'Red Bull Salzburg', 'BSC YB': 'Young Boys', 'AZ': 'AZ Alkmaar', 'Red Star': 'Crvena Zvezda', 'Legia': 'Legia Warszawa', 'Lech': 'Lech Poznań', 'RM Castilla': 'Real Madrid', 'RM Castilla': 'Real Madrid', 'Atl. Madrileño': 'Atletico Madrid' };
  let yh = 0;
  for (const name of names) {
    if (!name || out[name] || !(YS.test(name) || name === 'RM Castilla')) continue;
    const base = name.replace(YS, '').trim().replace(/^RM Castilla$/, 'Real Madrid'); const id = out[base] || idx.get(nz(base)) || idx.get(nz(AL[base] || ''));
    if (id) { out[name] = +id; yh++; }
  }
  console.log('genclik/B takimi ana kulube baglandi:', yh);
}
fs.writeFileSync(path.join(root, 'data/tm/clublogo.json'), JSON.stringify(out));
console.log(`TM kulup adi ${names.size}, API takim kaydi ${api.length}, eslesen ${hit}`);
