// Milli takim sayfasi verisi (25 Kas 2026, kullanici istegi): kulup takimlari gibi form, puan durumu, kadro, antrenor ve
// oyuncu istatistikleri. Tumu API-Football'dan. Milli takim listesi her calismada yeniden kurulur (sisteme eklenen yeni milli
// takimlar otomatik girer): data/api/<milli turnuva>/<2024..>/fixtures.json + latest.json'daki milli turnuva maclari.
// Istekler (takim basina): son/sonraki maclar 2 (6 sa), kadro 1 (3 gun), oyuncu istatistigi 1-3 sayfa (12 sa ya da yeni mac bitince),
// son macin ilk 11/antrenoru 1 (son mac degisince), antrenor yedegi /coachs 1 (ilk 11'de antrenor yoksa, 7 gun).
// Ortak: turnuva puan durumu /standings?league&season (yarisma basina 1, 6 sa).
// Kullanim: node tools/fetch-milli.mjs [--max=400] [--reserve=1500] [--only=777,2]
// Cikti   : data/api/milli/index.json { at, t:{ id: ad } }
//           data/api/milli/<id>.json  { at, id, n, s, co:{n,id}, diz, sq:[[pid,ad,yas,no,mv]], st:{pid:[ad,mac,ilk11,dk,gol,asist,sari,kirmizi,puan,mv]},
//                                       m:[[fid,tISO,c,ev,dep,evG,depG,durum,tur]], tb:[{c,ad,gr,rows:[[sira,ad,tid,o,g,b,m,a,y,p,form]]}], _:{...zamanlar} }
import fs from 'node:fs';
import path from 'node:path';
import { pace } from './api-pace.mjs';

const root = path.resolve(import.meta.dirname, '..');
const API = path.join(root, 'data', 'api');
const OUT = path.join(API, 'milli');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const MAX = +arg('max', 400), RESERVE = +arg('reserve', 1500), ONLY = arg('only', '') ? new Set(arg('only', '').split(',').map(Number)) : null;
const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY) { console.error('HATA: API_FOOTBALL_KEY yok.'); process.exit(1); }
const HOST = 'https://v3.football.api-sports.io';
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const wr = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f + '.tmp', JSON.stringify(o)); fs.renameSync(f + '.tmp', f); };

// API lig kimligi -> uygulama kodu (istemci adlari: UNL "Uluslar Ligi", WC "Dunya Kupasi", FRI "Hazirlik maci" ...)
const KOD = { 5: 'UNL', 1: 'WC', 4: 'EURO', 32: 'WCQE', 960: 'EUROQ', 9: 'COPA', 34: 'WCQSA', 10: 'FRI' };
const MILLI_KOD = ['UNL', 'WC', 'EURO', 'WCQE', 'EUROQ', 'COPA', 'WCQSA'];
// API adi -> Turkce (uygulamada kimligi kayitli degilse)
const TR = {
  Turkey: 'Türkiye', Turkiye: 'Türkiye', Belgium: 'Belçika', Armenia: 'Ermenistan', Cyprus: 'Kıbrıs', Italy: 'İtalya', France: 'Fransa',
  'Czech Republic': 'Çekya', Czechia: 'Çekya', Spain: 'İspanya', England: 'İngiltere', Croatia: 'Hırvatistan', Albania: 'Arnavutluk',
  Finland: 'Finlandiya', Belarus: 'Belarus', Montenegro: 'Karadağ', Latvia: 'Letonya', Germany: 'Almanya', Austria: 'Avusturya',
  Azerbaijan: 'Azerbaycan', 'Bosnia & Herzegovina': 'Bosna-Hersek', 'Bosnia and Herzegovina': 'Bosna-Hersek', Bulgaria: 'Bulgaristan',
  Denmark: 'Danimarka', Estonia: 'Estonya', 'Faroe Islands': 'Faroe Adaları', Wales: 'Galler', Georgia: 'Gürcistan', Netherlands: 'Hollanda',
  Kazakhstan: 'Kazakistan', Kosovo: 'Kosova', 'FYR Macedonia': 'Kuzey Makedonya', 'North Macedonia': 'Kuzey Makedonya', 'Northern Ireland': 'Kuzey İrlanda',
  Lithuania: 'Litvanya', Luxembourg: 'Lüksemburg', Hungary: 'Macaristan', Norway: 'Norveç', Poland: 'Polonya', Portugal: 'Portekiz',
  Romania: 'Romanya', Slovakia: 'Slovakya', Slovenia: 'Slovenya', Serbia: 'Sırbistan', Ukraine: 'Ukrayna', Greece: 'Yunanistan',
  'Rep. Of Ireland': 'İrlanda Cumhuriyeti', Ireland: 'İrlanda Cumhuriyeti', 'Republic of Ireland': 'İrlanda Cumhuriyeti', Scotland: 'İskoçya',
  Israel: 'İsrail', Sweden: 'İsveç', Switzerland: 'İsviçre', Iceland: 'İzlanda', Russia: 'Rusya',
  Brazil: 'Brezilya', Argentina: 'Arjantin', Uruguay: 'Uruguay', Colombia: 'Kolombiya', Chile: 'Şili', Peru: 'Peru', Ecuador: 'Ekvador',
  Paraguay: 'Paraguay', Bolivia: 'Bolivya', Venezuela: 'Venezuela', Mexico: 'Meksika', USA: 'ABD', Canada: 'Kanada', 'Costa Rica': 'Kosta Rika',
  Panama: 'Panama', Jamaica: 'Jamaika', Haiti: 'Haiti', Honduras: 'Honduras', Curacao: 'Curaçao', 'Curaçao': 'Curaçao', Japan: 'Japonya',
  'South Korea': 'Güney Kore', 'Korea Republic': 'Güney Kore', Australia: 'Avustralya', Iran: 'İran', 'Saudi Arabia': 'Suudi Arabistan',
  Qatar: 'Katar', Jordan: 'Ürdün', Uzbekistan: 'Özbekistan', Iraq: 'Irak', 'New Zealand': 'Yeni Zelanda', Morocco: 'Fas', Senegal: 'Senegal',
  Tunisia: 'Tunus', Egypt: 'Mısır', Algeria: 'Cezayir', Ghana: 'Gana', 'Ivory Coast': 'Fildişi Sahili', "Cote D'Ivoire": 'Fildişi Sahili',
  Nigeria: 'Nijerya', Cameroon: 'Kamerun', 'South Africa': 'Güney Afrika', 'Cape Verde Islands': 'Yeşil Burun Adaları', 'Cape Verde': 'Yeşil Burun Adaları',
  'Congo DR': 'Kongo DC', Mali: 'Mali',
};
const MV = { Goalkeeper: 'K', Defender: 'D', Midfielder: 'O', Attacker: 'F', G: 'K', D: 'D', M: 'O', F: 'F' };

const ids = (rd(path.join(root, 'data', 'teams', 'ids.json')) || {}).t || {};
const appAd = {}; for (const [n, id] of Object.entries(ids)) if (!appAd[id]) appAd[id] = n;
const apiAd = (rd(path.join(API, 'teams.json')) || {}).t || {};
const adOf = (id, n) => appAd[id] || TR[n] || TR[apiAd[id]] || n || apiAd[id] || String(id);

// ---- milli takim listesi ----
const takim = new Map(); // id -> oncelik (uygulamada maci olan once)
for (const c of MILLI_KOD) {
  let ss = []; try { ss = fs.readdirSync(path.join(API, c)).filter(s => /^\d{4}$/.test(s) && +s >= 2024); } catch { }
  for (const s of ss) { const f = rd(path.join(API, c, s, 'fixtures.json')); (f?.m || []).forEach(r => { [r[2], r[3]].forEach(id => { if (id && !takim.has(id)) takim.set(id, 1); }); }); }
}
const latest = rd(path.join(root, 'data', 'fixtures', 'latest.json')) || { m: [] };
for (const x of latest.m || []) if (MILLI_KOD.includes(x.c)) [x.h, x.a].forEach(n => { const id = ids[n]; if (id) takim.set(id, 0); });
let liste = [...takim.entries()].sort((a, b) => a[1] - b[1]).map(x => +x[0]);
if (ONLY) liste = liste.filter(id => ONLY.has(id));

// ---- kota ----
let remaining = null, used = 0;
{ const st = await fetch(HOST + '/status', { headers: { 'x-apisports-key': KEY } }).then(r => r.json()).catch(() => null);
  const rq = st?.response?.requests; if (rq && Number.isFinite(rq.limit_day)) remaining = rq.limit_day - rq.current; }
if (remaining !== null && remaining <= RESERVE) { console.log(`milli: kota az (${remaining}), atlandi.`); process.exit(0); }
const kotaVar = () => used < MAX && (remaining === null || remaining - used > RESERVE);
let dur = false;
async function api(q) {
  if (dur || !kotaVar()) return null;
  await pace(); used++;
  let j; try { j = await fetch(HOST + q, { headers: { 'x-apisports-key': KEY } }).then(r => r.json()); } catch (e) { console.log('milli istek hatasi:', q, e.message); return null; }
  const er = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
  if (er && er.length) { console.log('milli API hatasi:', q, JSON.stringify(j.errors)); if (/limit|suspend|token/i.test(JSON.stringify(j.errors))) dur = true; return null; }
  return j;
}

const now = Date.now(), H = 36e5, eski = (t, h) => !t || now - Date.parse(t) > h * H;
const TABLO = {}; // "lig|sezon" -> standings response (bu calismada bir kez)
async function tablo(lig, sezon) {
  const k = lig + '|' + sezon; if (k in TABLO) return TABLO[k];
  const f = path.join(OUT, '_tablo', k.replace('|', '-') + '.json'), c = rd(f);
  if (c && !eski(c.at, 6)) return (TABLO[k] = c.g);
  const j = await api(`/standings?league=${lig}&season=${sezon}`);
  if (!j) return (TABLO[k] = c ? c.g : null);
  const g = ((j.response || [])[0]?.league?.standings || []).map(gr => gr.map(t => ({ r: t.rank, id: t.team.id, n: t.team.name, gr: t.group, o: t.all.played, g: t.all.win, b: t.all.draw, m: t.all.lose, a: t.all.goals.for, y: t.all.goals.against, p: t.points, f: t.form || '' })));
  wr(f, { at: new Date().toISOString(), g });
  return (TABLO[k] = g);
}

const idx = rd(path.join(OUT, 'index.json')) || { t: {} };
let yeni = 0, atla = 0;
for (const id of liste) {
  if (dur || !kotaVar()) break;
  const f = path.join(OUT, id + '.json'), o = rd(f) || { id, _: {} };
  o._ = o._ || {};
  let deg = false;
  // 1) maclar: son 10 + sonraki 5
  const macGecti = (o.m || []).some(r => (r[7] === 'NS' || r[7] === 'TBD') && Date.parse(r[1]) < now - 2.5 * H);
  if (eski(o._.m, 6) || macGecti) {
    const a = await api(`/fixtures?team=${id}&last=10`), b = a && await api(`/fixtures?team=${id}&next=5`);
    if (a && b) {
      const l = [...a.response, ...b.response];
      const ti = l.flatMap(x => [x.teams.home, x.teams.away]).find(t => t.id === id);
      if (ti) o.n = adOf(id, ti.name);
      o.m = l.map(x => [x.fixture.id, x.fixture.date, KOD[x.league.id] || x.league.name, adOf(x.teams.home.id, x.teams.home.name), adOf(x.teams.away.id, x.teams.away.name), x.goals.home, x.goals.away, x.fixture.status.short, x.league.round || '', x.league.id, x.league.season])
        .sort((p, q) => Date.parse(q[1]) - Date.parse(p[1]));
      o._.m = new Date().toISOString(); deg = true;
    }
  }
  if (!o.m) { atla++; continue; }
  const bitti = o.m.filter(r => ['FT', 'AET', 'PEN'].includes(r[7]));
  const son = bitti[0];
  // oyuncu istatistigi sezonu: son resmi macin sezonu (milli takimda sezon = turnuva yili)
  const sezon = son ? son[10] : new Date().getUTCFullYear();
  // 2) kadro (son davet listesi)
  if (eski(o._.sq, 72)) {
    const j = await api(`/players/squads?team=${id}`);
    if (j) { const p = (j.response || [])[0]?.players || []; o.sq = p.map(x => [x.id, x.name, x.age || null, x.number || null, MV[x.position] || '']); o._.sq = new Date().toISOString(); deg = true; }
  }
  // 3) oyuncu istatistikleri (bu sezon, tum milli turnuvalar toplam)
  const yeniMac = son && o._.stF !== son[0];
  if (eski(o._.st, 12) || yeniMac || o.s !== sezon) {
    const st = {}; let ok = true, sayfa = 1, top = 1;
    while (sayfa <= top && sayfa <= 6) {
      const j = await api(`/players?team=${id}&season=${sezon}&page=${sayfa}`);
      if (!j) { ok = false; break; }
      top = j.paging?.total || 1;
      for (const r of j.response || []) {
        const pl = r.player; let e = st[pl.id];
        for (const s of r.statistics || []) {
          if (s.team?.id !== id) continue;
          const g = s.games || {}, ap = +g.appearences || 0; if (!ap && !(+g.minutes)) continue;
          if (!e) e = st[pl.id] = [pl.name, 0, 0, 0, 0, 0, 0, 0, 0, '', 0];
          e[1] += ap; e[2] += +g.lineups || 0; e[3] += +g.minutes || 0; e[4] += +(s.goals?.total) || 0; e[5] += +(s.goals?.assists) || 0;
          e[6] += +(s.cards?.yellow) || 0; e[7] += (+(s.cards?.red) || 0) + (+(s.cards?.yellowred) || 0);
          if (+g.rating > 0 && ap) { e[8] += +g.rating * ap; e[10] += ap; }
          e[9] = e[9] || MV[g.position] || '';
        }
      }
      sayfa++;
    }
    if (ok) {
      for (const k in st) { const e = st[k]; e[8] = e[10] ? Math.round(e[8] / e[10] * 100) / 100 : null; e.length = 10; }
      o.st = st; o.s = sezon; o._.st = new Date().toISOString(); o._.stF = son ? son[0] : null; deg = true;
    }
  }
  // 4) antrenor + dizilis: son biten macin ilk 11'i
  if (son && o._.lu !== son[0]) {
    const j = await api(`/fixtures/lineups?fixture=${son[0]}&team=${id}`);
    if (j) { const l = (j.response || [])[0]; if (l) { if (l.coach?.name) o.co = { n: l.coach.name, id: l.coach.id || null }; o.diz = l.formation || o.diz || null; } o._.lu = son[0]; deg = true; }
  }
  if (!o.co && eski(o._.co, 168)) {
    const j = await api(`/coachs?team=${id}`);
    if (j) { const c = (j.response || []).find(x => (x.career || []).some(k => k.team?.id === id && !k.end)); if (c) o.co = { n: c.name, id: c.id }; o._.co = new Date().toISOString(); deg = true; }
  }
  // 5) puan durumu: bu sezon oynadigi resmi turnuvalarin grubu (hazirlik maci haric), en yeni turnuva once
  const tur = []; o.m.forEach(r => { if (r[9] && r[9] !== 10 && !tur.some(t => t[0] === r[9] && t[1] === r[10])) tur.push([r[9], r[10], r[2]]); });
  const tb = [];
  for (const [lig, sz, c] of tur.slice(0, 3)) {
    const g = await tablo(lig, sz); if (!g) continue;
    const gr = g.find(x => x.some(t => t.id === id)); if (!gr || gr.length < 2) continue;
    tb.push({ c, s: sz, gr: gr[0].gr || '', rows: gr.map(t => [t.r, adOf(t.id, t.n), t.id, t.o, t.g, t.b, t.m, t.a, t.y, t.p, t.f]) });
  }
  if (tb.length || !o.tb) { if (JSON.stringify(tb) !== JSON.stringify(o.tb || [])) deg = true; o.tb = tb; }
  if (deg) { o.id = id; o.n = o.n || adOf(id, apiAd[id]); o.at = new Date().toISOString(); wr(f, o); yeni++; }
  idx.t[id] = o.n;
}
idx.at = new Date().toISOString();
wr(path.join(OUT, 'index.json'), idx);
console.log(`milli: ${liste.length} milli takim, ${yeni} guncellendi, ${atla} atlandi, ${used} istek${dur ? ' (API durdurdu)' : ''}.`);
