// Sitede ligi olmayan takimlarin son 5 maci (24 Kas 2026). Ornek: CL'de Shakhtar (Ukrayna ligi sitede yok) Fenerbahce ile oynarken
// istemcinin formu yalniz 1 maca dayaniyordu. Yaklasan KUPA maclarindaki (CL/EL/ECL, ulusal kupalar) takimlar icin
// /fixtures?team=ID&last=5 (takim basina 1 istek, 20 saat onbellek). Istemci bunu yalniz takimin lig kaydi (son5) yoksa kullanir.
// Kullanim: node tools/fetch-dis-form.mjs [--hours=72] [--max=60] [--reserve=1500]
// Cikti   : data/fixtures/dis-form.json { at, t:{ "<uygulama adi>": { id, at, m:[{t,c,h,a,x,y}] } } }  (yeniden eskiye)
import fs from 'node:fs';
import path from 'node:path';
import { pace } from './api-pace.mjs';

const root = path.resolve(import.meta.dirname, '..');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const HOURS = +arg('hours', 72), MAX = +arg('max', 60), RESERVE = +arg('reserve', 1500);
const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY) { console.error('HATA: API_FOOTBALL_KEY yok.'); process.exit(1); }
const HOST = 'https://v3.football.api-sports.io';
const rd = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')); } catch { return d; } };

const KUPA = new Set(['CL', 'EL', 'ECL', 'UNL', 'FAC', 'EFL', 'CDR', 'CIT', 'DFB', 'CDF', 'TUK', 'KNV', 'TDP', 'BCP', 'SFA', 'USC', 'CBR', 'CAR']);
const latest = rd('data/fixtures/latest.json', { m: [], lg: {} });
const ids = (rd('data/teams/ids.json', { t: {} }).t) || {};
const adOf = {}; for (const [n, id] of Object.entries(ids)) if (!adOf[id]) adOf[id] = n;
const kodOf = {}; for (const [k, v] of Object.entries(latest.lg || {})) if (v && v.id) kodOf[v.id] = k;
const OUT = 'data/fixtures/dis-form.json';
const db = rd(OUT, { t: {} }); db.t = db.t || {};

const now = Date.now(), son = now + HOURS * 36e5;
const takim = new Set();
for (const x of latest.m || []) { const t = Date.parse(x.t); if (KUPA.has(x.c) && x.st === 'NS' && t > now - 3 * 36e5 && t < son) { takim.add(x.h); takim.add(x.a); } }

let remaining = null, used = 0;
{ const st = await fetch(HOST + '/status', { headers: { 'x-apisports-key': KEY } }).then(r => r.json()).catch(() => null);
  const rq = st?.response?.requests; if (rq && Number.isFinite(rq.limit_day)) remaining = rq.limit_day - rq.current; }
if (remaining !== null && remaining <= RESERVE) { console.log(`dis-form: kota az (${remaining}), atlandi.`); process.exit(0); }

let yeni = 0;
for (const n of takim) {
  const id = ids[n]; if (!id) { console.log('dis-form: kimlik yok:', n); continue; }
  const e = db.t[n]; if (e && now - Date.parse(e.at) < 20 * 36e5) continue;
  if (used >= MAX || (remaining !== null && remaining - used <= RESERVE)) break;
  await pace(); used++;
  let j; try { j = await fetch(`${HOST}/fixtures?team=${id}&last=7`, { headers: { 'x-apisports-key': KEY } }).then(r => r.json()); } catch (er) { console.log('dis-form hata:', n, er.message); continue; }
  const er = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors)); if (er && er.length) { console.log('dis-form API hatasi:', JSON.stringify(j.errors)); break; }
  const m = (j.response || []).filter(f => f.goals && Number.isFinite(f.goals.home) && Number.isFinite(f.goals.away)).map(f => ({
    t: f.fixture.date.slice(0, 16) + 'Z', c: kodOf[f.league.id] || (f.league.country && f.league.country !== "World" ? f.league.country + " – " : "") + f.league.name,
    h: adOf[f.teams.home.id] || f.teams.home.name, a: adOf[f.teams.away.id] || f.teams.away.name, x: f.goals.home, y: f.goals.away,
  })).sort((p, q) => Date.parse(q.t) - Date.parse(p.t)).slice(0, 5);
  db.t[n] = { id, at: new Date().toISOString(), m }; yeni++;
}
// 30 gunden eski kayitlari at
for (const n in db.t) if (now - Date.parse(db.t[n].at) > 30 * 864e5) delete db.t[n];
db.at = new Date().toISOString();
fs.writeFileSync(path.join(root, OUT), JSON.stringify(db));
console.log(`dis-form: ${takim.size} kupa takimi, ${yeni} guncellendi, ${used} istek.`);
