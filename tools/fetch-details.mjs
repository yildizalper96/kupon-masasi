// Mac ayrintilari: kadro listesi (milli takimlar), ilk 11 + yedekler, sakatlar, piyasa beklentisi (oranlardan), karsilikli maclar.
// Kullanim: node tools/fetch-details.mjs [--max=30] [--reserve=10] [--hours=40]
// Girdi : data/fixtures/latest.json (fetch-fixtures.mjs cikti: id, lig kodu, uygulamadaki takim adlari, saat)
// Cikti : data/fixtures/details.json  { at, m:{ "<fixtureId>": {...} }, sq:{ "<takimId>": {...} } }
// Kota  : her cagri 1 istek; --max ust sinir, kalan kota --reserve altina inerse durur. /status istek sayilmaz.
// Not   : bahisci adi ve ham oran SAKLANMAZ; yalnizca bahiscilerin ortalama, marji cikarilmis olasiliklari.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const MAX = +arg('max', 30), RESERVE = +arg('reserve', 10), HOURS = +arg('hours', 40);

const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY) { console.error('HATA: API_FOOTBALL_KEY yok.'); process.exit(1); }

const HOST = 'https://v3.football.api-sports.io';
let used = 0, remaining = null, gapMs = 7000, lastReq = 0;
async function api(p) {
  const wait = lastReq + gapMs - Date.now();
  if (lastReq && wait > 0) await new Promise(r => setTimeout(r, wait));
  lastReq = Date.now();
  const r = await fetch(HOST + p, { headers: { 'x-apisports-key': KEY } });
  const pm = Number(r.headers.get('x-ratelimit-limit')); if (pm > 0) gapMs = Math.ceil(60000 / pm) + 500;
  used++;
  const j = await r.json();
  const er = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
  if (er && er.length) throw new Error(p + ' -> ' + JSON.stringify(j.errors));
  return j;
}
const left = () => (remaining === null ? 99 : remaining) - used;
const canSpend = () => used < MAX && left() > RESERVE;
// ilk 11 en degerli veri: yedek kotanin icine girebilir (en az 3 istek kalsin)
const canSpendLineup = () => used < MAX && left() > 3;

// ---- kota korumasi ----
{
  const st = await fetch(HOST + '/status', { headers: { 'x-apisports-key': KEY } }).then(r => r.json()).catch(() => null);
  const rq = st?.response?.requests;
  if (rq && Number.isFinite(rq.limit_day)) remaining = rq.limit_day - rq.current;
  console.log(`Kota: ${remaining === null ? '?' : remaining} kaldi, bu calistirmada en cok ${MAX} istek, ${RESERVE} yedek.`);
  // yedek kotaya girildiyse yalnizca ilk 11 cekilebilir (canSpendLineup); kota neredeyse bittiyse hic istek yapma
  if (remaining !== null && remaining <= 3) { console.log('Kota dolmak uzere, istek yapilmadi.'); process.exit(0); }
}

const latestPath = path.join(root, 'data', 'fixtures', 'latest.json');
const detPath = path.join(root, 'data', 'fixtures', 'details.json');
if (!fs.existsSync(latestPath)) { console.log('latest.json yok: once fetch-fixtures.mjs calistir.'); process.exit(0); }
const latest = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
const D = fs.existsSync(detPath) ? JSON.parse(fs.readFileSync(detPath, 'utf8')) : { at: '', m: {}, sq: {} };
D.m = D.m || {}; D.sq = D.sq || {};

const now = Date.now();
const NATIONAL = new Set(['UNL']); // kadro listesi yalnizca milli takim maclari icin (kulupte ilk 11 yeterli)
const HRS = h => h * 3600e3;
const age = at => (at ? now - Date.parse(at) : Infinity);

// aday maclar: baslamasina HOURS saat kala ile baslamasindan 3 saat sonrasi arasi
const cand = latest.m
  .filter(m => { const t = Date.parse(m.t); return t > now - HRS(3) && t < now + HRS(HOURS); })
  .sort((a, b) => a.t.localeCompare(b.t));
console.log(`Aday mac: ${cand.length}`);

// ---- takim kimlikleri: ucretsiz plan "ids" parametresine izin vermez; gun basina tek istek (/fixtures?date=) ----
const needIds = cand.filter(m => !(D.m[m.id] && D.m[m.id].hid));
for (const day of [...new Set(needIds.map(m => m.t.slice(0, 10)))]) {
  if (!canSpend()) break;
  const j = await api('/fixtures?date=' + day + '&timezone=UTC');
  for (const x of j.response) {
    const m = needIds.find(c => c.id === x.fixture.id); if (!m) continue;
    D.m[m.id] = Object.assign(D.m[m.id] || {}, { k: `${m.c}|${m.h}|${m.a}`, c: m.c, h: m.h, a: m.a, t: m.t, hid: x.teams.home.id, aid: x.teams.away.id });
  }
}

const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
const r4 = x => Math.round(x * 10000) / 10000;
// bahisci oranlarindan marji cikarilmis ortalama olasilik
function marketFrom(resp) {
  const bms = resp?.[0]?.bookmakers || [];
  const pick = (name, vals) => {
    const rows = [];
    for (const b of bms) {
      const bet = b.bets.find(x => x.name === name); if (!bet) continue;
      const o = vals.map(v => Number(bet.values.find(z => String(z.value) === v)?.odd));
      if (o.some(x => !(x > 1))) continue;
      const q = o.map(x => 1 / x), s = q.reduce((a, c) => a + c, 0);
      rows.push(q.map(x => x / s));
    }
    return rows.length ? { p: vals.map((_, i) => r4(avg(rows.map(r => r[i])))), n: rows.length } : null;
  };
  const w = pick('Match Winner', ['Home', 'Draw', 'Away']);
  const ou = pick('Goals Over/Under', ['Over 2.5', 'Under 2.5']);
  const bt = pick('Both Teams Score', ['Yes', 'No']);
  return (w || ou || bt) ? { p: w && w.p, ou: ou && ou.p, bt: bt && bt.p, n: Math.max(w?.n || 0, ou?.n || 0, bt?.n || 0) } : null;
}
const ddmmyyyy = iso => { const d = new Date(iso); return String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.' + d.getUTCFullYear(); };
const POS = { Goalkeeper: 'K', Defender: 'D', Midfielder: 'O', Attacker: 'F' };
const log = [];

for (const m of cand) {
  const e = D.m[m.id]; if (!e || !e.hid) continue;
  const ko = Date.parse(m.t);
  const soon = ko < now + HRS(HOURS);

  // karsilikli maclar (haftada bir)
  if (canSpend() && age(e.h2hAt) > HRS(24 * 7)) {
    try {
      const j = await api(`/fixtures/headtohead?h2h=${e.hid}-${e.aid}`);
      const nm = { [e.hid]: e.h, [e.aid]: e.a };
      e.h2h = j.response.filter(x => ['FT', 'AET', 'PEN'].includes(x.fixture.status.short) && x.goals.home != null && nm[x.teams.home.id] && nm[x.teams.away.id])
        .sort((a, b) => b.fixture.date.localeCompare(a.fixture.date)).slice(0, 6)
        .map(x => ({ d: ddmmyyyy(x.fixture.date), h: nm[x.teams.home.id], a: nm[x.teams.away.id], x: x.goals.home, y: x.goals.away }));
      e.h2hAt = new Date().toISOString(); log.push(`${m.h}-${m.a}: karsilikli ${e.h2h.length} mac`);
    } catch (er) { log.push('h2h hata: ' + String(er.message).slice(0, 80)); }
  }

  // piyasa beklentisi (12 saatte bir; ucretsiz planin gunluk 100 istegini asmamak icin)
  if (soon && canSpend() && age(e.oddsAt) > HRS(12)) {
    try {
      const j = await api('/odds?fixture=' + m.id);
      const mk = marketFrom(j.response);
      e.odds = mk; e.oddsAt = new Date().toISOString();
      log.push(`${m.h}-${m.a}: oran ${mk ? mk.n + ' bahisci' : 'yok'}`);
    } catch (er) { log.push('oran hata: ' + String(er.message).slice(0, 80)); }
  }

  // sakatlar / cezalilar (gunde bir)
  if (soon && canSpend() && age(e.injAt) > HRS(24)) {
    try {
      const j = await api('/injuries?fixture=' + m.id);
      e.inj = j.response.map(x => ({ s: x.team.id === e.hid ? 'h' : 'a', n: x.player.name, r: x.player.reason || x.player.type || '' }));
      e.injAt = new Date().toISOString(); log.push(`${m.h}-${m.a}: eksik ${e.inj.length}`);
    } catch (er) { log.push('eksik hata: ' + String(er.message).slice(0, 80)); }
  }

  // ilk 11 + yedekler: baslamasina 75 dk kala ile baslamasindan 15 dk sonrasi (API genelde ~60 dk once yayinlar)
  if (!e.luOk && canSpendLineup() && ko < now + HRS(75 / 60) && ko > now - 15 * 60e3) {
    try {
      const j = await api('/fixtures/lineups?fixture=' + m.id);
      if (j.response.length === 2) {
        const side = t => {
          const xi = t.startXI.slice().sort((p, q) => { const [a1, a2] = String(p.player.grid || '9:9').split(':').map(Number), [b1, b2] = String(q.player.grid || '9:9').split(':').map(Number); return a1 - b1 || a2 - b2; });
          return { f: t.formation || '', xi: xi.map(p => p.player.name), bn: t.substitutes.map(p => p.player.name), co: t.coach && t.coach.name || '' };
        };
        // paralel ham yapi (tasarim oturumu icin): oyuncu kimligi, numara, mevki, grid ("satir:sutun")
        const raw = t => {
          const o = p => ({ id: p.player.id || null, n: p.player.name, no: p.player.number || null, pos: p.player.pos || '', grid: p.player.grid || '' });
          return { f: t.formation || '', xi: t.startXI.map(o), bn: t.substitutes.map(o) };
        };
        const hs = j.response.find(t => t.team.id === e.hid) || j.response[0], as = j.response.find(t => t.team.id === e.aid) || j.response[1];
        e.luRaw = { h: raw(hs), a: raw(as) };
        e.lu = { h: side(hs), a: side(as) }; e.luOk = true; e.luAt = new Date().toISOString();
        log.push(`${m.h}-${m.a}: ilk 11 alindi (${e.lu.h.f} / ${e.lu.a.f})`);
      } else log.push(`${m.h}-${m.a}: ilk 11 henuz yok`);
    } catch (er) { log.push('ilk11 hata: ' + String(er.message).slice(0, 80)); }
  }

  // milli takim kadro listesi (3 gunde bir)
  if (NATIONAL.has(m.c) && soon) {
    for (const [tid, nm] of [[e.hid, e.h], [e.aid, e.a]]) {
      if (!canSpend()) break;
      const s = D.sq[tid];
      if (s && age(s.at) < HRS(72) && (!s.p.length || s.p[0].id)) continue; // eski kayitlarda oyuncu kimligi yoksa yeniden cek
      try {
        const j = await api('/players/squads?team=' + tid);
        const pl = j.response?.[0]?.players || [];
        D.sq[tid] = { n: nm, at: new Date().toISOString(), p: pl.map(p => ({ id: p.id || null, n: p.name, p: POS[p.position] || '', no: p.number || null, a: p.age || null, ph: p.photo || null })) };
        log.push(`${nm}: kadro listesi ${pl.length} oyuncu`);
      } catch (er) { log.push('kadro hata: ' + String(er.message).slice(0, 80)); }
    }
  }
}

D.at = new Date().toISOString();
// eski maclari temizle (baslamasindan 2 gun gecmis)
for (const [id, e] of Object.entries(D.m)) if (e.t && Date.parse(e.t) < now - HRS(48)) delete D.m[id];
fs.writeFileSync(detPath, JSON.stringify(D));
console.log(log.join('\n'));
console.log(`\nHarcanan istek: ${used}, kalan gunluk (yaklasik): ${remaining === null ? '?' : remaining - used}. Mac: ${Object.keys(D.m).length}, takim kadrosu: ${Object.keys(D.sq).length}.`);
