// Gecmis ve sezon verisi (Pro plan, 21 Kas 2026). Devam ettirilebilir: yapilan is dosyalardan anlasilir, kota bitince kaldigi yerden surer.
// Kullanim: node tools/fetch-history.mjs [--budget=2500] [--reserve=1500] [--leagues=SL,PL] [--seasons=2021-2026] [--only=standings,top,fixtures,matches,teamstats,players,clubs]
// Cikti (data/api, istemci tembel yukler):
//   data/standings/<C>.json        guncel sezon puan durumu (seo-pages ve uygulama icin; BRA ile ayni bicim: rows[{n,r,p,pl,w,d,l,f,a,gd,form,...}])
//   data/api/<C>/<S>/standings.json  { at, rows:[{tid,n,r,p,pl,w,d,l,f,a,gd,form,ds,gr, h:[pl,w,d,l,f,a], aw:[...]}] }
//   data/api/<C>/<S>/top.json      { at, g:[], a:[], y:[], r:[] }  satir: [oyuncuId, ad, takimId, takim, deger, mac]
//   data/api/<C>/<S>/fixtures.json { at, m:[[id, tarihISO, evId, depId, evGol, depGol, durum, hafta, iyEv, iyDep]] }
//   data/api/<C>/<S>/matches.json  { at, m:{ id:{ ev, st, lu, pl } } }  (yalnizca bitmis maclar; bicim asagida mac())
//   data/api/<C>/<S>/teamstats.json { at, t:{ tid:{...} } }
//   data/api/<C>/<S>/players.json  { at, p:[...] }  (oyuncu() bicimi)
//   data/api/clubs.json            { at, t:{ tid:{ n, v:{n,c,cap,s,img}, co:{...}, tr:[...] , at:{v,co,tr} } } }
// Adlar API adlaridir; uygulama adi icin data/teams/ids.json (ad -> kimlik) tersine cevrilir (n alani uygulama adi, yoksa API adi).
// Bahisci/oran verisi CEKILMEZ.
import fs from 'node:fs';
import path from 'node:path';
import { pace } from './api-pace.mjs';

const root = path.resolve(import.meta.dirname, '..');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const BUDGET = +arg('budget', 2500), RESERVE = +arg('reserve', 1500);
const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY) { console.error('HATA: API_FOOTBALL_KEY yok.'); process.exit(1); }
const HOST = 'https://v3.football.api-sports.io';

// lig kodu -> API lig kimligi (yalnizca ligler; kupalar haric)
const LIG = { SL: 203, PL: 39, LL: 140, SA: 135, BL: 78, L1: 61, ERE: 88, POR: 94, BEL: 144, SCO: 179, KSA: 307, BRA: 71, ARG: 128, MLS: 253, MX: 262 };
const CODES = String(arg('leagues', Object.keys(LIG).join(','))).split(',').filter(c => LIG[c]);
const [S0, S1] = String(arg('seasons', '2021-2026')).split('-').map(Number);
const CUR = 2026; // guncel sezon (Avrupa 2026-27, takvim ligleri 2026)
const SEASONS = []; for (let s = S1 || S0; s >= S0; s--) SEASONS.push(s); // yeniden eskiye
const ONLY = String(arg('only', 'standings,top,fixtures,matches,teamstats,players,clubs,ekstra,hakem')).split(',');

let used = 0, remaining = null, gapMs = 700;
const left = () => (remaining === null ? 0 : remaining) - used;
const can = () => used < BUDGET && left() > RESERVE;
let lastReq = 0;
async function api(p) {
  const w = lastReq + gapMs - Date.now(); if (w > 0) await new Promise(r => setTimeout(r, w));
  lastReq = Date.now(); await pace();
  for (let deneme = 0; deneme < 3; deneme++) {
    const r = await fetch(HOST + p, { headers: { 'x-apisports-key': KEY } });
    const pm = Number(r.headers.get('x-ratelimit-limit')); if (pm > 0) gapMs = Math.ceil(60000 / pm) + 300;
    used++;
    const j = await r.json();
    const er = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
    if (er && er.length) {
      if (/rateLimit|Too many/i.test(JSON.stringify(j.errors))) { console.log('hiz siniri, 65 sn bekleniyor'); await new Promise(r => setTimeout(r, 65000)); continue; }
      throw new Error(p + ' -> ' + JSON.stringify(j.errors));
    }
    return j;
  }
  throw new Error(p + ' -> hiz siniri 3 kez');
}

// kota
{
  const st = await fetch(HOST + '/status', { headers: { 'x-apisports-key': KEY } }).then(r => r.json()).catch(() => null);
  const rq = st?.response?.requests;
  if (rq && Number.isFinite(rq.limit_day)) remaining = rq.limit_day - rq.current;
  console.log(`Kota: ${remaining ?? '?'} kaldi; butce ${BUDGET}, yedek ${RESERVE}. Ligler: ${CODES.join(',')}, sezonlar: ${SEASONS.join(',')}`);
  if (remaining === null || remaining <= RESERVE) { console.log('Kota yedekte, istek yok.'); process.exit(0); }
}

const now = Date.now(), HRS = h => h * 3600e3, age = at => (at ? now - Date.parse(at) : Infinity);
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
// atomik yazim: yerel-guncelle ayni anda git add yaparsa yarim dosya yakalamasin
const wr = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f + '.tmp', JSON.stringify(o)); fs.renameSync(f + '.tmp', f); };
const dir = (c, s) => path.join(root, 'data', 'api', c, String(s));
const ids = (rd(path.join(root, 'data', 'teams', 'ids.json')) || {}).t || {};
const APPN = {}; for (const [n, id] of Object.entries(ids)) if (!APPN[id]) APPN[id] = n;
const ad = (tid, apiAd) => APPN[tid] || apiAd;
// guncel sezon tazeleme sureleri; gecmis sezon bir kez cekilir (dosya varsa)
const taze = (f, s, saat) => { const o = rd(f); if (!o) return false; if (s !== CUR) return true; return age(o.at) < HRS(saat); };
const log = [];
let durdu = false;
const dur = () => { if (!can()) { if (!durdu) console.log(`Butce/kota siniri: ${used} istek harcandi, durdu (sonraki calistirma kaldigi yerden surer).`); durdu = true; } return durdu; };

// ---------- 1. puan durumu ----------
async function standings(c, s) {
  const f = path.join(dir(c, s), 'standings.json');
  if (taze(f, s, 6) || dur()) return;
  const j = await api(`/standings?league=${LIG[c]}&season=${s}`);
  const grs = j.response?.[0]?.league?.standings || [];
  const rows = grs.flatMap(g => g.map(x => ({
    tid: x.team.id, n: ad(x.team.id, x.team.name), r: x.rank, p: x.points, pl: x.all.played, w: x.all.win, d: x.all.draw, l: x.all.lose,
    f: x.all.goals.for, a: x.all.goals.against, gd: x.goalsDiff, form: (x.form || '').replace(/W/g, 'G').replace(/D/g, 'B').replace(/L/g, 'M'),
    ds: x.description || '', gr: grs.length > 1 ? x.group : undefined,
    h: [x.home.played, x.home.win, x.home.draw, x.home.lose, x.home.goals.for, x.home.goals.against],
    aw: [x.away.played, x.away.win, x.away.draw, x.away.lose, x.away.goals.for, x.away.goals.against],
  })));
  if (!rows.length) { wr(f, { at: new Date().toISOString(), rows: [], yok: true }); return; }
  wr(f, { at: new Date().toISOString(), rows });
  if (s === CUR) {
    // DIKKAT (21 Kas olayi): elle girilmis dosyalar (or. BRA: players, matches, scorers, zones; satirlarda co/st/cap) EZILMEZ.
    // Mevcut dosyada ek alan varsa yalnizca eslesen satirlarin puan sutunlari guncellenir, geri kalan her sey korunur.
    const sf = path.join(root, 'data', 'standings', c + '.json'), eski = rd(sf);
    const yeni = rows.map(({ h, aw, tid, ...r }) => ({ ...r, tid }));
    if (eski && Object.keys(eski).some(k => !['at', 'src', 'rows'].includes(k))) {
      const nk = x => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
      let es = 0;
      for (const r of eski.rows || []) { const y = yeni.find(q => q.tid === r.tid || nk(q.n) === nk(r.n)); if (y) { Object.assign(r, { r: y.r, p: y.p, pl: y.pl, w: y.w, d: y.d, l: y.l, f: y.f, a: y.a, gd: y.gd, form: y.form, tid: y.tid }); es++; } }
      if (es === (eski.rows || []).length) { (eski.rows || []).sort((a, b) => a.r - b.r); eski.at = new Date().toISOString().slice(0, 10); eski.apiAt = eski.at; wr(sf, eski); }
      else log.push(`${c}: elle girilmis tablo korundu (${es}/${(eski.rows || []).length} eslesti, guncellenmedi)`);
    } else wr(sf, { at: new Date().toISOString().slice(0, 10), src: 'API-Football resmi puan durumu', rows: yeni });
  }
  log.push(`${c} ${s}: puan durumu ${rows.length} takim`);
}
// ---------- 2. kralliklar ----------
async function top(c, s) {
  const f = path.join(dir(c, s), 'top.json');
  if (taze(f, s, 12) || dur()) return;
  const o = { at: new Date().toISOString() };
  for (const [k, ep, v] of [['g', 'topscorers', st => st.goals.total], ['a', 'topassists', st => st.goals.assists], ['y', 'topyellowcards', st => st.cards.yellow], ['r', 'topredcards', st => st.cards.red]]) {
    if (dur()) return; // yarim kalan dosya yazilmaz
    const j = await api(`/players/${ep}?league=${LIG[c]}&season=${s}`);
    o[k] = (j.response || []).map(x => { const st = x.statistics[0] || {}; return [x.player.id, x.player.name, st.team?.id || null, ad(st.team?.id, st.team?.name), v(st) || 0, st.games?.appearences || 0]; });
  }
  wr(f, o); log.push(`${c} ${s}: kralliklar`);
}
// ---------- 3. fikstur ----------
const FIN = new Set(['FT', 'AET', 'PEN']);
async function fixtures(c, s) {
  const f = path.join(dir(c, s), 'fixtures.json');
  if (taze(f, s, 6) || dur()) return;
  const j = await api(`/fixtures?league=${LIG[c]}&season=${s}`);
  const m = (j.response || []).map(x => [x.fixture.id, x.fixture.date, x.teams.home.id, x.teams.away.id, x.goals.home, x.goals.away, x.fixture.status.short,
    String(x.league.round || '').replace('Regular Season - ', ''), x.score?.halftime?.home ?? null, x.score?.halftime?.away ?? null]).sort((a, b) => a[1].localeCompare(b[1]));
  const tn = {}; (j.response || []).forEach(x => { tn[x.teams.home.id] = ad(x.teams.home.id, x.teams.home.name); tn[x.teams.away.id] = ad(x.teams.away.id, x.teams.away.name); });
  wr(f, { at: new Date().toISOString(), tn, m }); log.push(`${c} ${s}: fikstur ${m.length} mac`);
}
// ---------- 3b. mac ayrintilari (20'li paketler) ----------
// Kompakt mac bicimi (dosya boyutu icin; 5 yil ~30 bin mac):
//   ev: [dk, ek, takimId, tur(G gol|K kart|D degisiklik|V var), ayrinti, oyuncuId, oyuncuAdi(yalnizca gol/kart), asistId, asistAdi(yalnizca gol)]
//   st: { takimId: [ STK sirasiyla degerler ] }   (matches.json kokunde stk: anahtar listesi)
//   lu: { takimId: [dizilis, hoca, [[id, no, mevki, grid] x11]] }  (adlar pl'de)
//   pl: { takimId: [[id, ad, dk, puan, gol, asist, sari, kirmizi, sut, isabetli, pas, kilitPas, top kapma, kurtaris, yedektenMi]] }  yalnizca oynayanlar
const STK = ['Shots on Goal', 'Shots off Goal', 'Total Shots', 'Blocked Shots', 'Shots insidebox', 'Shots outsidebox', 'Fouls', 'Corner Kicks', 'Offsides', 'Ball Possession', 'Yellow Cards', 'Red Cards', 'Goalkeeper Saves', 'Total passes', 'Passes accurate', 'Passes %', 'expected_goals', 'goals_prevented'];
const TUR = { Goal: 'G', Card: 'K', subst: 'D', Var: 'V' };
function mac(x) {
  const ev = (x.events || []).map(e => { const t = TUR[e.type] || e.type, adli = t === 'G' || t === 'K'; return [e.time?.elapsed ?? null, e.time?.extra ?? null, e.team?.id ?? null, t, e.detail, e.player?.id ?? null, adli ? e.player?.name ?? null : null, e.assist?.id ?? null, t === 'G' ? e.assist?.name ?? null : null]; });
  const st = {}; (x.statistics || []).forEach(t => { const o = Object.fromEntries((t.statistics || []).map(s => [s.type, s.value])); st[t.team.id] = STK.map(k => { const v = o[k]; return typeof v === 'string' && /^[\d.]+%?$/.test(v) ? +v.replace('%', '') : v ?? null; }); });
  const lu = {}; (x.lineups || []).forEach(t => { lu[t.team.id] = [t.formation || '', t.coach?.name || '', (t.startXI || []).map(p => [p.player.id, p.player.number, p.player.pos, p.player.grid])]; });
  const pl = {}; (x.players || []).forEach(t => {
    pl[t.team.id] = (t.players || []).filter(p => (p.statistics?.[0]?.games?.minutes || 0) > 0).map(p => { const q = p.statistics[0]; return [p.player.id, p.player.name, q.games.minutes, q.games?.rating ? +(+q.games.rating).toFixed(1) : null, q.goals?.total || 0, q.goals?.assists || 0, q.cards?.yellow || 0, q.cards?.red || 0, q.shots?.total || 0, q.shots?.on || 0, q.passes?.total || 0, q.passes?.key || 0, q.tackles?.total || 0, q.goals?.saves || 0, q.games?.substitute ? 1 : 0]; });
  });
  return { ref: String(x.fixture?.referee || '').replace(/,.*$/, '').trim(), ev, st, lu, pl };
}
// Aylik dosyalar: data/api/<C>/<S>/m-YYYY-MM.json { at, stk, m:{id:mac()} }. Git deposu sismesin diye yalnizca yeni maci olan ay yeniden yazilir.
async function matches(c, s) {
  const fx = rd(path.join(dir(c, s), 'fixtures.json')); if (!fx) return;
  const ay = {}, dosya = k => path.join(dir(c, s), `m-${k}.json`);
  const oku = k => (ay[k] = ay[k] || rd(dosya(k)) || { stk: STK, m: {} });
  const eksik = fx.m.filter(r => FIN.has(r[6]) && !oku(r[1].slice(0, 7)).m[r[0]]);
  const degisen = new Set(); let n = 0;
  const yaz = () => { for (const k of degisen) { ay[k].at = new Date().toISOString(); wr(dosya(k), ay[k]); } degisen.clear(); };
  for (let i = 0; i < eksik.length; i += 20) {
    if (dur()) break;
    const paket = eksik.slice(i, i + 20), aykim = Object.fromEntries(paket.map(r => [r[0], r[1].slice(0, 7)]));
    try {
      const j = await api('/fixtures?ids=' + paket.map(r => r[0]).join('-'));
      for (const x of j.response || []) { const k = aykim[x.fixture.id]; if (!k) continue; oku(k).m[x.fixture.id] = mac(x); degisen.add(k); n++; }
    } catch (e) { log.push(`${c} ${s}: mac paketi hata ${String(e.message).slice(0, 80)}`); break; }
    if (n % 200 < 20) yaz(); // ara kayit
  }
  yaz();
  if (n) log.push(`${c} ${s}: ${n} mac ayrintisi`);
}
// ---------- 4. takim sezon istatistikleri ----------
function tstat(r) {
  const g = r.goals || {}, fx = r.fixtures || {};
  const dak = o => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, v?.total ?? null]));
  return {
    form: r.form || '', o: [fx.played?.home, fx.played?.away], w: [fx.wins?.home, fx.wins?.away], d: [fx.draws?.home, fx.draws?.away], l: [fx.loses?.home, fx.loses?.away],
    gf: [g.for?.total?.home, g.for?.total?.away], ga: [g.against?.total?.home, g.against?.total?.away],
    gfm: dak(g.for?.minute), gam: dak(g.against?.minute), ou: g.for?.under_over || null,
    cs: [r.clean_sheet?.home, r.clean_sheet?.away], fts: [r.failed_to_score?.home, r.failed_to_score?.away],
    seri: r.biggest?.streak || null, eb: r.biggest?.wins || null, ey: r.biggest?.loses || null,
    pen: r.penalty ? [r.penalty.scored?.total, r.penalty.missed?.total] : null,
    diz: (r.lineups || []).map(x => [x.formation, x.played]),
    kart: { y: dak(r.cards?.yellow), r: dak(r.cards?.red) },
  };
}
async function teamstats(c, s) {
  const stn = rd(path.join(dir(c, s), 'standings.json')); if (!stn || !stn.rows?.length) return;
  const f = path.join(dir(c, s), 'teamstats.json'), o = rd(f) || { t: {} };
  if (s === CUR && age(o.at) > HRS(72)) o.t = {}; // guncel sezon 3 gunde bir yenilenir
  let n = 0;
  for (const row of stn.rows) {
    if (o.t[row.tid]) continue;
    if (dur()) break;
    try { const j = await api(`/teams/statistics?league=${LIG[c]}&season=${s}&team=${row.tid}`); o.t[row.tid] = tstat(j.response || {}); n++; }
    catch (e) { log.push(`${c} ${s}: takim istatistigi hata ${String(e.message).slice(0, 80)}`); break; }
  }
  if (n) { o.at = new Date().toISOString(); wr(f, o); log.push(`${c} ${s}: ${n} takim istatistigi`); }
}
// ---------- 4b. oyuncu sezon verileri (sayfali, 20/sayfa) ----------
function oyuncu(x) {
  const p = x.player || {}, st = (x.statistics || [])[0] || {};
  const n = v => (v == null ? null : v);
  return {
    id: p.id, n: p.name, fn: p.firstname, ln: p.lastname, yas: p.age, dt: p.birth?.date || null, dy: p.birth?.place || null, du: p.birth?.country || null,
    uy: p.nationality || null, boy: p.height || null, kilo: p.weight || null, sak: p.injured ? 1 : 0,
    tid: st.team?.id || null, t: ad(st.team?.id, st.team?.name),
    s: (x.statistics || []).map(q => ({
      tid: q.team?.id, mac: n(q.games?.appearences), il: n(q.games?.lineups), dk: n(q.games?.minutes), no: n(q.games?.number), mv: q.games?.position || null, pu: q.games?.rating ? +(+q.games.rating).toFixed(2) : null, kap: q.games?.captain ? 1 : 0,
      g: n(q.goals?.total), a: n(q.goals?.assists), yg: n(q.goals?.conceded), kur: n(q.goals?.saves),
      sut: [n(q.shots?.total), n(q.shots?.on)], pas: [n(q.passes?.total), n(q.passes?.key), n(q.passes?.accuracy)],
      top: [n(q.tackles?.total), n(q.tackles?.blocks), n(q.tackles?.interceptions)], ik: [n(q.duels?.total), n(q.duels?.won)],
      drib: [n(q.dribbles?.attempts), n(q.dribbles?.success)], fa: [n(q.fouls?.drawn), n(q.fouls?.committed)],
      kart: [n(q.cards?.yellow), n(q.cards?.yellowred), n(q.cards?.red)], pen: [n(q.penalty?.won), n(q.penalty?.commited), n(q.penalty?.scored), n(q.penalty?.missed), n(q.penalty?.saved)],
    })),
  };
}
async function players(c, s) {
  const f = path.join(dir(c, s), 'players.json');
  let o = rd(f);
  if (o && o.tam && (s !== CUR || age(o.at) < HRS(72))) return;
  if (!o || o.tam) o = { p: [], sayfa: 0 }; // bastan (guncel sezon yenilemesi ya da ilk kez)
  let toplam = o.toplam || 1;
  while (o.sayfa < toplam) {
    if (dur()) break;
    try {
      const j = await api(`/players?league=${LIG[c]}&season=${s}&page=${o.sayfa + 1}`);
      toplam = j.paging?.total || 1; o.toplam = toplam;
      for (const x of j.response || []) o.p.push(oyuncu(x));
      o.sayfa++;
    } catch (e) { log.push(`${c} ${s}: oyuncu sayfasi hata ${String(e.message).slice(0, 80)}`); break; }
  }
  o.at = new Date().toISOString();
  if (o.sayfa >= toplam) { o.tam = true; delete o.sayfa; delete o.toplam; log.push(`${c} ${s}: ${o.p.length} oyuncu`); }
  wr(f, o);
}
// ---------- 5. kulup: stadyum, teknik direktor, transferler (guncel sezon takimlari) ----------
async function clubs() {
  const f = path.join(root, 'data', 'api', 'clubs.json'), o = rd(f) || { t: {} };
  let n = 0;
  const kaydet = () => { o.at = new Date().toISOString(); wr(f, o); };
  for (const c of CODES) {
    // stadyum: /teams?league&season 1 istekte tum lig (30 gunde bir)
    const lk = 'lig:' + c;
    if (age(o[lk]) > HRS(24 * 30) && !dur()) {
      try {
        const j = await api(`/teams?league=${LIG[c]}&season=${CUR}`);
        for (const x of j.response || []) {
          const t = o.t[x.team.id] = o.t[x.team.id] || {}; t.n = ad(x.team.id, x.team.name); t.c = c; t.kur = x.team.founded || null; t.ul = x.team.country || null;
          const v = x.venue || {}; t.v = { n: v.name || null, sh: v.city || null, adr: v.address || null, kap: v.capacity || null, zem: v.surface || null, img: v.image || null };
        }
        o[lk] = new Date().toISOString(); n++;
      } catch (e) { log.push(`${c}: takim listesi hata ${String(e.message).slice(0, 80)}`); }
    }
  }
  kaydet();
  for (const [tid, t] of Object.entries(o.t)) {
    t.at = t.at || {};
    if (age(t.at.co) > HRS(24 * 30)) {
      if (dur()) break;
      try {
        const j = await api('/coachs?team=' + tid);
        // guncel teknik direktor: kariyerinde bu takimda bitisi olmayan kayit
        const co = (j.response || []).find(k => (k.career || []).some(cr => cr.team?.id === +tid && !cr.end)) || null;
        t.co = co ? { id: co.id, n: co.name, yas: co.age, uy: co.nationality, dt: co.birth?.date || null, kar: (co.career || []).slice(0, 12).map(cr => [cr.team?.id, cr.team?.name, cr.start, cr.end]) } : null;
        t.at.co = new Date().toISOString(); n++;
      } catch (e) { log.push(`hoca hata ${tid}: ${String(e.message).slice(0, 60)}`); }
    }
    if (age(t.at.tr) > HRS(24 * 14)) {
      if (dur()) break;
      try {
        const j = await api('/transfers?team=' + tid);
        const sinir = Date.now() - 3 * 365 * 864e5; // son 3 yil
        t.tr = (j.response || []).flatMap(x => (x.transfers || []).map(tr => [x.player?.id, x.player?.name, tr.date, tr.type, tr.teams?.in?.id, tr.teams?.in?.name, tr.teams?.out?.id, tr.teams?.out?.name]))
          .filter(r => Date.parse(r[2]) > sinir && (r[4] === +tid || r[6] === +tid)).sort((a, b) => String(b[2]).localeCompare(String(a[2])));
        t.at.tr = new Date().toISOString(); n++;
      } catch (e) { log.push(`transfer hata ${tid}: ${String(e.message).slice(0, 60)}`); }
    }
    if (n % 25 === 0) kaydet();
  }
  kaydet(); log.push(`kulupler: ${Object.keys(o.t).length} takim, ${n} istek`);
}

// ---------- 6. hakem istatistikleri (istek YOK: aylik mac dosyalarindan hesaplanir) ----------
// data/api/hakemler.json { at, h:{ "<ad>": { n:mac, s:sari, k:kirmizi, p:penalti, e:ev galibiyet, b:beraberlik, d:dep galibiyet, l:{lig:mac}, son:"YYYY-MM-DD" } } }
function hakemler() {
  const H = {}, base = path.join(root, 'data', 'api');
  for (const c of fs.existsSync(base) ? fs.readdirSync(base) : []) {
    const cd = path.join(base, c); if (!fs.statSync(cd).isDirectory()) continue;
    for (const s of fs.readdirSync(cd)) {
      const sd = path.join(cd, s), fx = rd(path.join(sd, 'fixtures.json')); if (!fx) continue;
      const sk = Object.fromEntries(fx.m.map(r => [r[0], r]));
      for (const f of fs.readdirSync(sd).filter(x => /^m-\d{4}-\d{2}\.json$/.test(x))) {
        const o = rd(path.join(sd, f)); if (!o) continue;
        for (const [id, x] of Object.entries(o.m)) {
          if (!x.ref) continue; const r = sk[id]; if (!r) continue;
          const h = H[x.ref] = H[x.ref] || { n: 0, s: 0, k: 0, p: 0, e: 0, b: 0, d: 0, l: {}, son: '' };
          h.n++; h.l[c] = (h.l[c] || 0) + 1; const t = r[1].slice(0, 10); if (t > h.son) h.son = t;
          for (const e of x.ev) { if (e[3] === 'K') { if (/Red/.test(e[4])) h.k++; else h.s++; } if (e[3] === 'G' && /Penalty/.test(e[4])) h.p++; }
          if (r[4] != null) { if (r[4] > r[5]) h.e++; else if (r[4] < r[5]) h.d++; else h.b++; }
        }
      }
    }
  }
  wr(path.join(base, 'hakemler.json'), { at: new Date().toISOString(), h: H });
  log.push(`hakemler: ${Object.keys(H).length} hakem`);
}
// ---------- 7. sakatlik gecmisi + kupalar (20'li paketler; kadrolardaki oyuncular ve teknik direktorler; 30 gunde bir) ----------
// data/api/oyuncu-ek.json { at, p:{ oyuncuId:{ sk:[[tur, baslangic, bitis]], ku:[[kupa, ulke, sezon, yer]], at } }, h:{ hocaId:{ ku:[...], at } } }
async function ekstra() {
  const f = path.join(root, 'data', 'api', 'oyuncu-ek.json'), o = rd(f) || { p: {}, h: {} };
  const det = rd(path.join(root, 'data', 'fixtures', 'details.json')) || {};
  const pids = [...new Set(Object.values(det.sq || {}).flatMap(s => (s.p || []).map(p => p.id)).filter(Boolean))]
    .filter(id => age(o.p[id]?.at) > HRS(24 * 30));
  const kulup = rd(path.join(root, 'data', 'api', 'clubs.json')) || { t: {} };
  const hids = [...new Set(Object.values(kulup.t).map(t => t.co?.id).filter(Boolean))].filter(id => age(o.h[id]?.at) > HRS(24 * 30));
  const kupa = x => [x.league, x.country, x.season, x.place];
  let n = 0;
  const kaydet = () => { o.at = new Date().toISOString(); wr(f, o); };
  for (let i = 0; i < pids.length; i += 20) {
    if (dur()) break;
    const pk = pids.slice(i, i + 20), z = new Date().toISOString();
    try {
      const sj = await api('/sidelined?players=' + pk.join('-'));
      const tj = dur() ? null : await api('/trophies?players=' + pk.join('-'));
      for (const id of pk) o.p[id] = { sk: [], ku: [], at: z };
      for (const x of sj.response || []) { const id = x.id ?? x.player?.id; if (o.p[id]) o.p[id].sk = (x.sidelined || []).map(s => [s.type, s.start, s.end]).slice(0, 30); }
      for (const x of tj?.response || []) { const id = x.id ?? x.player?.id; if (o.p[id]) o.p[id].ku = (x.trophies || []).map(kupa); }
      if (!tj) for (const id of pk) o.p[id].at = null; // kupalar eksik kaldi: sonra yeniden
      n += 2;
    } catch (e) { log.push(`sakatlik/kupa hata: ${String(e.message).slice(0, 80)}`); break; }
    if (n % 50 === 0) kaydet();
  }
  for (let i = 0; i < hids.length; i += 20) {
    if (dur()) break;
    const pk = hids.slice(i, i + 20);
    try {
      const tj = await api('/trophies?coachs=' + pk.join('-')); n++;
      for (const id of pk) o.h[id] = { ku: [], at: new Date().toISOString() };
      for (const x of tj.response || []) { const id = x.id ?? x.coach?.id; if (o.h[id]) o.h[id].ku = (x.trophies || []).map(kupa); }
    } catch (e) { log.push(`hoca kupa hata: ${String(e.message).slice(0, 80)}`); break; }
  }
  kaydet(); log.push(`oyuncu ek: ${Object.keys(o.p).length} oyuncu, ${Object.keys(o.h).length} hoca, ${n} istek`);
}

// ---------- sira: kullanicinin istedigi oncelik ----------
const SIRA = [['standings', standings], ['top', top], ['fixtures', fixtures], ['matches', matches], ['teamstats', teamstats], ['players', players]];
for (const [ad_, fn] of SIRA) {
  if (!ONLY.includes(ad_)) continue;
  for (const s of SEASONS) for (const c of CODES) { if (dur()) break; try { await fn(c, s); } catch (e) { log.push(`${ad_} ${c} ${s} hata: ${String(e.message).slice(0, 100)}`); } }
  if (durdu) break;
}
if (!durdu && ONLY.includes('clubs')) await clubs();
if (!durdu && ONLY.includes('ekstra')) await ekstra();
if (ONLY.includes('hakem') || ONLY.includes('matches')) { try { hakemler(); } catch (e) { log.push('hakem hata: ' + e.message); } }
console.log(log.join('\n'));
console.log(`\nHarcanan istek: ${used}, kalan gunluk (yaklasik): ${remaining - used}.${durdu ? ' Yarim kaldi; sonraki calistirma surdurur.' : ' Tamam.'}`);
