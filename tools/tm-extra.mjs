// Transfermarkt veri setinden (indirilmis CSV'ler) ek veriler uretir; API istegi HARCAMAZ. Cikti kucuk, tembel yuklenen dosyalar: data/tm/
//   p/<tm%100>.json   oyuncu: deger gecmisi (v), transferler (tr), sezon istatistigi (st), sozlesme (cx), milli (ic), ayrintili mevki (sp)
//   clubs.json        kulup: stadyum, kapasite, teknik direktor, toplam deger, yas ort., yabanci %, en sik dizilis
//   nations.json      milli takim (Turkce ad): FIFA sirasi, teknik direktor, toplam deger, kadro
//   h2h/<kulupId>.json karsilikli maclar (2012'den beri, son 8): { "<rakipId>": [[tarih, yarisma, ev(1/0), kendi, rakip], ...] }
//   ref.json          hakem: mac, ortalama sari/kirmizi (2023'ten beri)
// Kullanim: node tools/tm-players.mjs <klasor> (once: t alani + teammap.json); node tools/tm-extra.mjs <klasor>
import fs from 'node:fs';
const dir = process.argv[2]; if (!dir) { console.error('klasor gerekli'); process.exit(1); }
const fix = s => { try { const t = Buffer.from(s, 'latin1').toString('utf8'); return t.includes('�') ? s : t; } catch (e) { return s; } };
const nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
function split(line) { const a = []; let f = '', q = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (q) { if (c === '"') { if (line[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === ',') { a.push(f); f = ''; } else f += c; } a.push(f.replace(/\r$/, '')); return a; }
function* rows(file) { const L = fs.readFileSync(`${dir}/${file}`, 'latin1'); let pos = 0; const len = L.length; let H = null; while (pos < len) { let e = L.indexOf('\n', pos); if (e < 0) e = len; const line = L.slice(pos, e); pos = e + 1; if (!line.trim()) continue; if (!H) { H = split(line); continue; } const a = split(line); const o = {}; for (let i = 0; i < H.length; i++) o[H[i]] = a[i]; yield o; } }
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
const w = (f, o) => { fs.mkdirSync(f.slice(0, f.lastIndexOf('/')), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o)); };
let NAT = {}; try { const mm = fs.readFileSync('tools/fetch-fixtures.mjs', 'utf8').match(/const NATIONS = (\{[\s\S]*?\n\});/); if (mm) NAT = (0, eval)('(' + mm[1] + ')'); } catch (e) { }
const NATN = Object.fromEntries(Object.entries(NAT).map(([k, v]) => [nz(k), v]));

// ---- istenen oyuncular (foot.json + foot-ad: t alani) ----
const want = new Set();
{ const f = rd('data/players/foot.json'); for (const v of Object.values(f)) if (v.t) want.add(String(v.t));
  for (const fn of fs.readdirSync('data/players/foot-ad')) { const o = rd('data/players/foot-ad/' + fn); for (const v of Object.values(o)) if (v.t) want.add(String(v.t)); } }
console.log('istenen oyuncu', want.size);
const PL = {}; const pl = id => (PL[id] ||= {});
const yr = d => { const y = +d.slice(0, 4), m = +d.slice(5, 7); return m >= 7 ? y : y - 1; };

for (const r of rows('players.csv')) { const id = r.player_id; if (!want.has(id)) continue; const p = pl(id);
  if (r.sub_position) p.sp = r.sub_position; if (r.contract_expiration_date) p.cx = r.contract_expiration_date.slice(0, 10);
  if (+r.international_caps > 0) p.ic = [+r.international_caps, +r.international_goals || 0]; }
// deger gecmisi (ay basina son deger, bin euro)
{ const tmp = {}; for (const r of rows('player_valuations.csv')) { if (!want.has(r.player_id)) continue; const v = Math.round(+r.market_value_in_eur / 1000); if (!(v >= 0)) continue; ((tmp[r.player_id] ||= {})[r.date.slice(0, 7)] = [r.date.slice(0, 7), v]); }
  for (const [id, m] of Object.entries(tmp)) pl(id).v = Object.values(m).sort((a, b) => a[0] < b[0] ? -1 : 1); }
// transferler
for (const r of rows('transfers.csv')) { if (!want.has(r.player_id)) continue; const p = pl(r.player_id); (p.tr ||= []).push([r.transfer_date.slice(0, 10), fix(r.from_club_name), fix(r.to_club_name), r.transfer_fee === '' ? null : Math.round(+r.transfer_fee / 1000)]); }
for (const p of Object.values(PL)) if (p.tr) p.tr.sort((a, b) => a[0] < b[0] ? 1 : -1);
// sezon istatistigi (tum yarismalar toplami)
{ const agg = {}; for (const r of rows('appearances.csv')) { if (!want.has(r.player_id) || !r.date) continue; const s = yr(r.date), k = r.player_id + '|' + s; const a = (agg[k] ||= [s, 0, 0, 0, 0, 0, 0]); a[1]++; a[2] += +r.goals || 0; a[3] += +r.assists || 0; a[4] += +r.minutes_played || 0; a[5] += +r.yellow_cards || 0; a[6] += +r.red_cards || 0; }
  for (const [k, a] of Object.entries(agg)) (pl(k.split('|')[0]).st ||= []).push(a);
  for (const p of Object.values(PL)) if (p.st) p.st.sort((a, b) => b[0] - a[0]); }
// parcalara bol
{ const sh = {}; for (const [id, p] of Object.entries(PL)) if (Object.keys(p).length) (sh[id % 100] ||= {})[id] = p;
  let n = 0; for (const [k, o] of Object.entries(sh)) { w(`data/tm/p/${k}.json`, o); n++; } console.log('oyuncu parcasi', n, 'oyuncu', Object.values(sh).reduce((s, o) => s + Object.keys(o).length, 0)); }

// ---- kulupler + milli takimlar ----
const tmap = rd('data/tm/teammap.json'); const clubIds = new Set(Object.values(tmap).map(String));
const clubs = {};
for (const r of rows('clubs.csv')) { if (!clubIds.has(r.club_id)) continue; clubs[r.club_id] = { n: fix(r.name), st: fix(r.stadium_name || ''), se: +r.stadium_seats || null, co: fix(r.coach_name || '') || null, mv: +r.total_market_value || null, ag: +r.average_age || null, fo: +r.foreigners_percentage || null, nt: +r.national_team_players || null }; }
const nations = {}; const natIds = new Set();
for (const r of rows('national_teams.csv')) { const tr = NATN[nz(fix(r.name))] || NATN[nz(fix(r.country_name))]; if (!tr) continue; nations[tr] = { id: r.national_team_id, rk: +r.fifa_ranking || null, co: fix(r.coach_name || '') || null, mv: +r.total_market_value || null, ag: +r.average_age || null, sz: +r.squad_size || null }; natIds.add(r.national_team_id); }
const S = new Set([...clubIds, ...natIds]);

// ---- maclar: karsilikli (h2h), dizilis, hakem ----
const h2h = {}; const form = {}; const refG = {}; const gameRef = new Map();
for (const r of rows('games.csv')) {
  const h = r.home_club_id, a = r.away_club_id, d = (r.date || '').slice(0, 10); if (!d) continue;
  if (S.has(h) && S.has(a) && +r.season >= 2008) {
    ((h2h[h] ||= {})[a] ||= []).push([d, r.competition_id, 1, +r.home_club_goals, +r.away_club_goals]);
    ((h2h[a] ||= {})[h] ||= []).push([d, r.competition_id, 0, +r.away_club_goals, +r.home_club_goals]);
  }
  if (clubIds.has(h) && r.home_club_formation) ((form[h] ||= []).push([d, r.home_club_formation]));
  if (clubIds.has(a) && r.away_club_formation) ((form[a] ||= []).push([d, r.away_club_formation]));
  if (+r.season >= 2023 && r.referee) { const k = fix(r.referee).trim(); gameRef.set(r.game_id, k); (refG[k] ||= { n: k, g: 0, y: 0, r: 0 }).g++; }
}
for (const [id, c] of Object.entries(clubs)) { const f = (form[id] || []).sort((x, y) => x[0] < y[0] ? 1 : -1).slice(0, 30); const cnt = {}; f.forEach(x => cnt[x[1]] = (cnt[x[1]] || 0) + 1); const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; if (top) c.dz = top[0]; }
w('data/tm/clubs.json', clubs); w('data/tm/nations.json', nations);
{ let nf = 0; for (const [id, opp] of Object.entries(h2h)) { for (const k of Object.keys(opp)) opp[k] = opp[k].sort((a, b) => a[0] < b[0] ? 1 : -1).slice(0, 8); w(`data/tm/h2h/${id}.json`, opp); nf++; } console.log('h2h dosyasi', nf); }
// hakem kartlari
{ const per = new Map(); for (const r of rows('game_events.csv')) { if (r.type !== 'Cards' || !gameRef.has(r.game_id)) continue; const o = per.get(r.game_id) || { y: 0, r: 0 }; if (/red/i.test(r.description || '') && !/yellow/i.test(r.description || '')) o.r++; else o.y++; per.set(r.game_id, o); }
  for (const [gid, o] of per) { const ref = refG[gameRef.get(gid)]; if (ref) { ref.y += o.y; ref.r += o.r; } }
  const out = {}; for (const r of Object.values(refG)) { if (r.g < 15) continue; out[nz(r.n)] = { n: r.n, g: r.g, y: +(r.y / r.g).toFixed(2), r: +(r.r / r.g).toFixed(2) }; }
  w('data/tm/ref.json', out); console.log('hakem', Object.keys(out).length); }
console.log('kulup', Object.keys(clubs).length, 'milli', Object.keys(nations).length);
