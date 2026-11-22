// Takim basina tum maclar dizini (lig + kupa + Avrupa + milli), data/api/<C>/<S>/fixtures.json dosyalarindan. Istek YOK
// (yalnizca --names verilirse eksik takim adlari icin yarisma/sezon basina 1 istek: /fixtures?league=&season=).
// Kullanim: node tools/team-index.mjs [--names] [--reserve=2500]
// Cikti:
//   data/api/teams.json        { at, t:{ id: ad } }  (API adlari; --names ile dolar)
//   data/api/takim/<id>.json   { at, n, m:[[tarihISO, C, S, evId, depId, evGol, depGol, durum, tur]], t:{ id: ad } }  yeniden eskiye
// Uygulama adi varsa (data/teams/ids.json) o kullanilir; logo/baglanti icin.
// Dizin yalnizca 15 ligin takimlari ve milli turnuva takimlari icin uretilir (dosya sayisi sinirli kalsin).
import fs from 'node:fs';
import path from 'node:path';
import { pace } from './api-pace.mjs';

const root = path.resolve(import.meta.dirname, '..');
const API = path.join(root, 'data', 'api');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const NAMES = process.argv.includes('--names'), RESERVE = Math.max(+arg('reserve', 2500), 2000);
const LIGLER = { SL: 203, PL: 39, LL: 140, SA: 135, BL: 78, L1: 61, ERE: 88, POR: 94, BEL: 144, SCO: 179, KSA: 307, BRA: 71, ARG: 128, MLS: 253, MX: 262 };
const KUPA = { CL: 2, EL: 3, ECL: 848, USC: 531, FAC: 45, EFL: 48, CDR: 143, CIT: 137, DFB: 81, CDF: 66, TUK: 206, KNV: 90, TDP: 96, BCP: 147, SFA: 181, CBR: 73, CAR: 130, TRSK: 551, ENCS: 528, ESSK: 556, ITSK: 547, DESK: 529, FRTC: 526, NLSK: 543, PTSK: 550, BESK: 519, SASK: 826, BRSC: 632, ARTC: 517, ARSC: 810, MXCC: 857, UNL: 5, WC: 1, EURO: 4, WCQE: 32, EUROQ: 960, COPA: 9, WCQSA: 34, FRI: 10 };
const MILLI = new Set(['UNL', 'WC', 'EURO', 'WCQE', 'EUROQ', 'COPA', 'WCQSA']);
const LIG = { ...LIGLER, ...KUPA };
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const wr = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f + '.tmp', JSON.stringify(o)); fs.renameSync(f + '.tmp', f); };
const sezonlar = c => { try { return fs.readdirSync(path.join(API, c)).filter(s => /^\d{4}$/.test(s)).map(Number); } catch { return []; } };

// ---- adlar ----
const TF = path.join(API, 'teams.json');
const apiAd = (rd(TF) || {}).t || {};
const ad = {};
const ekle = (id, n) => { if (id && n && !ad[id]) ad[id] = n; };
Object.entries(apiAd).forEach(([id, n]) => ekle(id, n));
Object.values(rd(path.join(root, 'data', 'tm', 'api-teams.json')) || {}).forEach(l => (l || []).forEach(([id, n]) => ekle(id, n)));
for (const c of Object.keys(LIG)) for (const s of sezonlar(c)) ((rd(path.join(API, c, String(s), 'standings.json')) || {}).rows || []).forEach(r => ekle(r.tid, r.n));
const uyg = (rd(path.join(root, 'data', 'teams', 'ids.json')) || {}).t || {};
Object.entries(uyg).forEach(([n, id]) => { ad[id] = n; }); // uygulama adi oncelikli

// ---- tum maclar ----
const tum = []; // [tarih, C, S, ev, dep, eg, dg, durum, tur, id]
const eksik = new Map(); // "C|S" -> sayi
for (const c of Object.keys(LIG)) for (const s of sezonlar(c)) {
  for (const x of ((rd(path.join(API, c, String(s), 'fixtures.json')) || {}).m || [])) {
    tum.push([x[1], c, s, x[2], x[3], x[4], x[5], x[6], x[7] || '', x[0]]);
    for (const t of [x[2], x[3]]) if (!ad[t]) eksik.set(c + '|' + s, (eksik.get(c + '|' + s) || 0) + 1);
  }
}

// ---- eksik adlar (istege bagli, yarisma/sezon basina 1 istek) ----
if (NAMES && eksik.size) {
  const env = Object.fromEntries((fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '').split(/\r?\n/).map(l => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^["']|["']$/g, '')]));
  const KEY = env.API_FOOTBALL_KEY;
  if (!KEY) console.log('API anahtari yok, adlar cekilmedi.');
  else {
    let kalan = Infinity, n = 0;
    for (const k of eksik.keys()) {
      if (kalan <= RESERVE) { console.log(`Kalan kota ${kalan} <= yedek ${RESERVE}, durdu.`); break; }
      const [c, s] = k.split('|');
      await pace();
      try {
        const r = await fetch(`https://v3.football.api-sports.io/fixtures?league=${LIG[c]}&season=${s}`, { headers: { 'x-apisports-key': KEY } });
        const kh = r.headers.get('x-ratelimit-requests-remaining'); if (kh !== null && Number.isFinite(+kh)) kalan = +kh;
        const j = await r.json(); n++;
        (j.response || []).forEach(f => { for (const t of [f.teams?.home, f.teams?.away]) if (t && t.id && t.name) { apiAd[t.id] = t.name; ekle(t.id, t.name); } });
      } catch (e) { console.log(k, 'hata', e.message); }
    }
    wr(TF, { at: new Date().toISOString(), t: apiAd });
    console.log(`Ad istekleri: ${n}, kalan kota: ${kalan}`);
  }
}

// ---- dizin ----
const hedef = new Set();
for (const c of Object.keys(LIGLER)) for (const s of sezonlar(c)) ((rd(path.join(API, c, String(s), 'standings.json')) || {}).rows || []).forEach(r => hedef.add(+r.tid));
Object.values(uyg).forEach(id => hedef.add(+id));
tum.forEach(x => { if (MILLI.has(x[1])) { hedef.add(+x[3]); hedef.add(+x[4]); } });
const takim = new Map();
const gor = new Set();
tum.sort((a, b) => String(b[0]).localeCompare(String(a[0])));
for (const x of tum) {
  const anahtar = x[9] + '|' + x[1]; if (gor.has(anahtar)) continue; gor.add(anahtar);
  for (const t of [+x[3], +x[4]]) { if (!hedef.has(t)) continue; if (!takim.has(t)) takim.set(t, []); takim.get(t).push(x.slice(0, 9)); }
}
const DIR = path.join(API, 'takim');
let yaz = 0, ayni = 0;
for (const [id, m] of takim) {
  const t = {}; m.forEach(x => { for (const k of [x[3], x[4]]) if (ad[k]) t[k] = ad[k]; });
  const f = path.join(DIR, id + '.json'), eski = rd(f);
  const yeni = { n: ad[id] || '', m, t };
  if (eski && JSON.stringify({ n: eski.n, m: eski.m, t: eski.t }) === JSON.stringify(yeni)) { ayni++; continue; }
  wr(f, { at: new Date().toISOString(), ...yeni }); yaz++;
}
const kalanEksik = new Set(); tum.forEach(x => { for (const t of [x[3], x[4]]) if (!ad[t]) kalanEksik.add(t); });
console.log(`Mac: ${tum.length}, takim dosyasi: ${takim.size} (yazilan ${yaz}, degismeyen ${ayni}), adi bilinmeyen takim: ${kalanEksik.size}`);
