// Transfermarkt veri seti (Kaggle davidcariboo/player-scores, indirilmis CSV'ler) -> data/players/foot.json'a zenginlestirme. API istegi HARCAMAZ.
// Kullanim: node tools/foot-fc.mjs "<fc27.csv>"   (once; ayak/boy/uyruk tabani)
//           node tools/tm-players.mjs "<acilmis klasor: players.csv, game_lineups.csv>"   (sonra; ustune yazar)
// Eklenen alanlar (oyuncu kimligi -> {f,h,n,b,v,no}): f ayak, h boy cm, n uyruk (Turkce), b dogum tarihi YYYY-MM-DD,
//   v piyasa degeri EUR, no kulup forma numarasi (yalnizca son macin kulubu = oyuncunun guncel kulubuyse).
// Eslestirme: ad (bas harf+soyad ya da tam ad), yalnizca TEK aday; veri seti 6 Tem 2026'ya kadar (2025/26 sonu).
// Veri kaynagi notu: Transfermarkt verileri (sitede belirtilir).
import fs from 'node:fs';
const dir = process.argv[2]; if (!dir) { console.error('klasor gerekli'); process.exit(1); }
const fix = s => { try { const t = Buffer.from(s, 'latin1').toString('utf8'); return t.includes('�') ? s : t; } catch (e) { return s; } };
const nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
function csv(t) { const rows = []; let r = [], f = '', q = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === ',') { r.push(f); f = ''; } else if (c === '\n') { r.push(f.replace(/\r$/, '')); rows.push(r); r = []; f = ''; } else f += c; } if (f || r.length) { r.push(f); rows.push(r); } return rows; }
let NAT = {}; try { const src = fs.readFileSync('tools/fetch-fixtures.mjs', 'utf8'); const mm = src.match(/const NATIONS = (\{[\s\S]*?\n\});/); if (mm) NAT = (0, eval)('(' + mm[1] + ')'); } catch (e) { }
const NATN = Object.fromEntries(Object.entries(NAT).map(([k, v]) => [nz(k), v]));

const R = csv(fs.readFileSync(dir + '/players.csv', 'latin1')); const H = R[0]; const I = k => H.indexOf(k);
const P = R.slice(1).filter(r => r.length > 20).map(r => ({
  id: r[I('player_id')], n: nz(fix(r[I('name')])), fn: nz(fix(r[I('first_name')])), ln: nz(fix(r[I('last_name')])), ls: +r[I('last_season')],
  pos: r[I('position')], club: r[I('current_club_id')], clubName: fix(r[I('current_club_name')] || ''), foot: /^(left|right)$/.test(r[I('foot')]) ? r[I('foot')] : (r[I('foot')] === 'both' ? 'both' : null),
  h: +r[I('height_in_cm')] || 0, dob: (r[I('date_of_birth')] || '').slice(0, 10), mv: +r[I('market_value_in_eur')] || 0, cit: fix(r[I('country_of_citizenship')] || '')
})).filter(p => p.ls >= 2023);
const PC = P.filter(p => p.ls >= 2025); // guncel (2025/26'da oynamis) oyuncular; 2023-24 kayitlari yalnizca kulup baglamli kurtarma gecisinde

const out = JSON.parse(fs.readFileSync('data/players/foot.json', 'utf8').replace(/^﻿/, ''));
const names = {};
const add = (id, n) => { if (id && n && !names[id]) names[id] = n; };
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
try { for (const [id, v] of Object.entries(rd('data/players/season.json').p || {})) add(id, v.n); } catch (e) { }
try { const d = rd('data/fixtures/details.json');
  for (const s of Object.values(d.sq || {})) for (const p of s.p || []) add(p.id, p.n);
  for (const m of Object.values(d.m || {})) for (const t of ['h', 'a']) for (const p of [...((m.luRaw || {})[t]?.xi || []), ...((m.luRaw || {})[t]?.bn || [])]) add(p.id, p.n); } catch (e) { }
const man = (() => { try { return rd('data/players/foot-elle.json'); } catch (e) { return {}; } })();

const match = {}; let amb = 0;
for (const [id, name] of Object.entries(names)) {
  const n = nz(name); if (!n) continue; const ab = /^[A-Za-zÀ-ž]\.\s/.test(name), m = n.match(/^([a-z]) (.+)$/);
  const c = PC.filter(p => ab && m ? (p.fn[0] === m[1] && (p.ln === m[2] || p.n.endsWith(' ' + m[2]))) : p.n === n);
  if (c.length === 1) match[id] = c[0]; else if (c.length > 1) amb++;
}
// forma numarasi: son macin kulubu oyuncunun guncel kulubuyse (en yeni satir)
const want = new Map(Object.entries(match).map(([id, p]) => [p.id, p]));
const last = {};
{ const L = fs.readFileSync(dir + '/game_lineups.csv', 'latin1'); let pos = 0; const len = L.length; let first = true;
  while (pos < len) { let e = L.indexOf('\n', pos); if (e < 0) e = len; const line = L.slice(pos, e); pos = e + 1; if (first) { first = false; continue; }
    const a = line.split(','); if (a.length < 9) continue; const pid = a[3].replace(/"/g, ''); if (!want.has(pid)) continue;
    const d = a[1].replace(/"/g, ''), o = last[pid]; if (!o || d > o.d) last[pid] = { d, club: a[4].replace(/"/g, ''), no: a[8].replace(/"/g, '') }; } }

let nf = 0, nv = 0, nb = 0, nno = 0;
for (const [id, p] of Object.entries(match)) {
  if (man[id]) continue; // elle dogrulananlara dokunma
  const o = out[id] || {}; o.t = +p.id; // Transfermarkt oyuncu kimligi (data/tm/p/<t%100>.json)
  if (p.foot) { o.f = p.foot; nf++; }
  if (p.h > 0) o.h = p.h;
  if (p.dob) { o.b = p.dob; nb++; }
  if (p.mv > 0) { o.v = p.mv; nv++; }
  const t = NATN[nz(p.cit)]; if (t) o.n = t;
  const l = last[p.id]; if (l && l.club === p.club && +l.no > 0) { o.no = +l.no; nno++; }
  out[id] = o;
}
fs.writeFileSync('data/players/foot.json', JSON.stringify(out));

// ---- kimligi olmayan oyuncular (kulup kadrolari data/players/more*.json: "<LIG>|<Takim>" -> p:[[ad,...]]): "<Takim>|<Ad>" anahtariyla lig bazli dosyalar ----
// data/players/foot-ad/<LIG>.json  { "<Takim>|<Ad>": {f,h,n,b,v,no} }  (istemci takim sayfasini acarken o ligin dosyasini yukler)
const AD = {}; let rows = 0, hit = 0;
const clubTok = s => nz(s).split(' ').filter(t => t.length > 2);
// 1. gecis: ad esleştirmesi (tek aday). 2. gecis: takimin Transfermarkt kulubu (1. gecisteki esleşmelerden oy cokluguyla) bulunur;
// eslesmeyen satirlar yalnizca O KULUPTEKI oyuncular arasinda, ad parcalari (kisa/eksik/tek isim: "Ederson") TM adinin icinde
// geciyorsa ve tek aday kaliyorsa eslestirilir.
const ents = [];
for (const file of ['latest', 'more', 'more2']) {
  let m; try { m = rd(`data/players/${file}.json`); } catch (e) { continue; }
  const pl = typeof m.pl === 'string' ? JSON.parse(m.pl) : m.pl;
  for (const [key, v] of Object.entries(pl || {})) {
    const [lig, takim] = key.split('|'); const tt = clubTok(takim);
    for (const row of v.p || []) {
      const name = row[0]; rows++; const n = nz(name); if (!n) continue;
      const ab = /^[A-Za-zÀ-ž]\.\s/.test(name), mm = n.match(/^([a-z]) (.+)$/);
      let c = PC.filter(p => ab && mm ? (p.fn[0] === mm[1] && (p.ln === mm[2] || p.n.endsWith(' ' + mm[2]))) : (p.n === n || (p.ln && n === p.ln && p.ln.length > 4)));
      if (c.length > 1) { const k = c.filter(p => { const ct = clubTok(p.clubName || ''); return tt.some(t => ct.includes(t)); }); if (k.length === 1) c = k; }
      // ayni adli birden fazla aday: mevkiye gore ele (K kaleci, D defans, O orta saha, F forvet)
      if (c.length > 1) { const pm = { K: 'Goalkeeper', D: 'Defender', O: 'Midfield', F: 'Attack' }[row[6]]; if (pm) { const k = c.filter(p => p.pos === pm); if (k.length === 1) c = k; } }
      ents.push({ lig, takim, name, n, p: c.length === 1 ? c[0] : null, key });
    }
  }
}
const vote = {}; for (const e of ents) if (e.p && e.p.club) { const v = (vote[e.key] ||= {}); v[e.p.club] = (v[e.p.club] || 0) + 1; }
const teamClub = {}; for (const [k, v] of Object.entries(vote)) { const [cid, cnt] = Object.entries(v).sort((a, b) => b[1] - a[1])[0]; if (cnt >= 2) teamClub[k] = cid; }
fs.mkdirSync('data/tm', { recursive: true }); fs.writeFileSync('data/tm/teammap.json', JSON.stringify(teamClub)); // "LIG|Takim" -> Transfermarkt kulup kimligi
const byClub = {}; for (const p of P) (byClub[p.club] ||= []).push(p);
let rescued = 0;
for (const e of ents) {
  if (e.p) continue; const cid = teamClub[e.key]; if (!cid) continue;
  const tk = e.n.split(' ').filter(Boolean); if (!tk.length) continue;
  const ab = /^[a-z]$/.test(tk[0]) && tk.length > 1; // "m yandas" -> bas harf + soyad
  const pool = byClub[cid] || [];
  let c = pool.filter(p => { const pt = p.n.split(' '); return ab ? (p.fn[0] === tk[0] && tk.slice(1).every(t => pt.includes(t))) : tk.every(t => pt.includes(t)); });
  // TM kisa/tek isim tutuyorsa ("Gabriel"): TM adinin parcalari bizim adin icinde, ayni kulupte tek aday
  if (c.length !== 1) c = pool.filter(p => { const pt = p.n.split(' ').filter(Boolean); return pt.length >= 1 && pt.every(t => tk.includes(t)) && (pt.length > 1 || p.n.length > 3); });
  if (c.length > 1) { const cur = c.filter(p => p.ls >= 2025); if (cur.length === 1) c = cur; }
  if (c.length === 1) { e.p = c[0]; rescued++; }
}
console.log('2. gecisle kurtarilan (kulup baglamli, eksik/kisa ad):', rescued);
for (const e of ents) {
  const p = e.p; if (!p) continue; const o = { _p: { id: p.id, club: p.club }, t: +p.id };
  if (p.foot) o.f = p.foot; if (p.h > 0) o.h = p.h; if (p.dob) o.b = p.dob; if (p.mv > 0) o.v = p.mv;
  const t = NATN[nz(p.cit)]; if (t) o.n = t;
  if (Object.keys(o).length > 2) { (AD[e.lig] ||= {})[e.takim + '|' + e.name] = o; hit++; }
}
// forma numarasi (kimliksizler): ikinci geciste, son macin kulubu guncel kulupse
{ const ids = new Map(); for (const lig of Object.values(AD)) for (const o of Object.values(lig)) if (o._p) ids.set(o._p.id, o._p);
  const L = fs.readFileSync(dir + '/game_lineups.csv', 'latin1'); let pos = 0; const len = L.length, last2 = {}; let first = true;
  while (pos < len) { let e = L.indexOf('\n', pos); if (e < 0) e = len; const line = L.slice(pos, e); pos = e + 1; if (first) { first = false; continue; }
    const a = line.split(','); if (a.length < 9) continue; const pid = a[3].replace(/"/g, ''); if (!ids.has(pid)) continue;
    const d = a[1].replace(/"/g, ''), o = last2[pid]; if (!o || d > o.d) last2[pid] = { d, club: a[4].replace(/"/g, ''), no: a[8].replace(/"/g, '') }; }
  let nn = 0;
  for (const lig of Object.values(AD)) for (const o of Object.values(lig)) { if (o._p) { const l = last2[o._p.id]; if (l && l.club === o._p.club && +l.no > 0) { o.no = +l.no; nn++; } delete o._p; } }
  console.log('kimliksiz forma no', nn); }
fs.mkdirSync('data/players/foot-ad', { recursive: true });
for (const [lig, obj] of Object.entries(AD)) fs.writeFileSync(`data/players/foot-ad/${lig}.json`, JSON.stringify(obj));
console.log(`Kimliksiz kadro satiri ${rows}, eslesen ${hit}, lig dosyasi ${Object.keys(AD).length}`);
console.log(`Oyuncu ${Object.keys(names).length}, TM eslesen ${Object.keys(match).length} (belirsiz ${amb}); ayak ${nf}, dogum ${nb}, deger ${nv}, forma no ${nno}; foot.json toplam ${Object.keys(out).length}`);
