// Oyuncu istatistikleri YALNIZCA API-Football'dan (26 Kas 2026 kullanici karari: statz.ai/Transfermarkt istatistigi kullanilmaz). Istek YOK.
// Girdi : data/api/oyuncu/<takimId>.json (player-matches.mjs, mac mac kayit), data/api/<C>/2026/fixtures.json (biten maclar),
//         data/fixtures/details.json sq (API kadro: kimlik, mevki, forma no), data/teams/ids.json (uygulama takim adlari).
// Cikti : data/players/api.json { at, pl: JSON metin { "LIG|Takim": { src, at, kr, p:[[ad, mac, dk, gol, asist, sari, mevki, no, null, null, id]], m:[], e:{C:n} } } }
//   PS (app.js) ile ayni bicim. e: takimin bu yarismada biten ama oyuncu verisi olmayan mac sayisi (bu maclar sayilmadi; veri uydurulmaz).
//   Kaleci "gol yemeden"/"yedigi gol" API'de oyuncu bazinda yok: null (arayuzde "–").
//   Bu takimin kadrosunda (sq) olmayip BASKA takimin kadrosunda olan oyuncu ayrilmistir: p'ye alinmaz; bu sezon oynadiysa ay:[[ad, mac, dk, gol, asist, sari, id]] (oyuncu sayfasinda eski takim karti).
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const API = path.join(root, 'data', 'api');
const SEZON = 2026;
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const BITTI = new Set(['FT', 'AET', 'PEN']);
const LIGLER = ['SL', 'PL', 'LL', 'SA', 'BL', 'L1', 'ERE', 'POR', 'BEL', 'SCO', 'KSA', 'BRA', 'ARG', 'MLS', 'MX'];
const MILLI = new Set(['UNL', 'WC', 'EURO', 'WCQE', 'EUROQ', 'COPA', 'WCQSA', 'FRI']), MILLI_BAS = SEZON + '-07-01';

const ids = (rd(path.join(root, 'data', 'teams', 'ids.json')) || {}).t || {};
const UAD = {}; Object.entries(ids).forEach(([n, id]) => { if (!UAD[id]) UAD[id] = n; });
const sq = (rd(path.join(root, 'data', 'fixtures', 'details.json')) || {}).sq || {};
const sqTk = new Map(); Object.entries(sq).forEach(([t, v]) => (v.p || []).forEach(x => (sqTk.get(x.id) || sqTk.set(x.id, new Set()).get(x.id)).add(+t)));

// takim -> yarisma -> biten mac kimlikleri
const fin = {}, lig = {};
for (const c of fs.readdirSync(API).filter(d => /^[A-Z][A-Z0-9]*$/.test(d))) {
  const fx = rd(path.join(API, c, String(SEZON), 'fixtures.json')); if (!fx) continue;
  for (const x of fx.m || []) {
    if (LIGLER.includes(c)) { lig[x[2]] = lig[x[2]] || c; lig[x[3]] = lig[x[3]] || c; }
    if (!BITTI.has(x[6]) || (MILLI.has(c) && String(x[1]) < MILLI_BAS)) continue;
    for (const t of [x[2], x[3]]) ((fin[t] = fin[t] || {})[c] = fin[t][c] || []).push(String(x[0]));
  }
}

// iki takimin kadrosunda birden gorunen oyuncu (API kadro listesi gecikmeli): son maci hangi takimdaysa orada; digerinde ayrilan sayilir
const sonMac = new Map(); // id -> [tid, tarih]
for (const f of fs.readdirSync(path.join(API, 'oyuncu')).filter(x => /^\d+\.json$/.test(x))) {
  const tid = +f.replace('.json', ''), j = rd(path.join(API, 'oyuncu', f)); if (!j || !j.p) continue;
  for (const [id, [, rows]] of Object.entries(j.p)) for (const r of rows) { const b = (j.m || {})[r[0]]; if (!b || MILLI.has(b[0])) continue; const s = sonMac.get(+id); if (!s || String(b[1]) > s[1]) sonMac.set(+id, [tid, String(b[1])]); }
}
const asil = id => { const s = sonMac.get(id), l = [...(sqTk.get(id) || [])];
  if (s && (!l.length || l.includes(s[0]))) return s[0];
  return l.length > 1 ? l.sort((a, b) => String(sq[b].at || '').localeCompare(String(sq[a].at || '')))[0] : (s ? s[0] : null); }; // son maci yoksa en yeni cekilmis kadro
const out = {}; let n = 0, oy = 0;
const gun = t => t ? new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
for (const f of fs.readdirSync(path.join(API, 'oyuncu')).filter(x => /^\d+\.json$/.test(x))) {
  const tid = +f.replace('.json', ''), j = rd(path.join(API, 'oyuncu', f)); if (!j || !j.p) continue;
  const ad = UAD[tid]; if (!ad) continue; // sitede olmayan takim
  const F = fin[tid] || {}, cs = Object.keys(F);
  if (cs.length && cs.every(c => MILLI.has(c))) continue; // milli takim: oyuncu sayfasinda ayri kart
  const enCok = cs.filter(c => !MILLI.has(c)).sort((a, b) => F[b].length - F[a].length)[0];
  const L = lig[tid] || enCok; if (!L) continue;
  const S = sq[tid] && Array.isArray(sq[tid].p) && sq[tid].p.length ? sq[tid].p : null;
  const sqId = new Map((S || []).map(x => [x.id, x]));
  const kulupMac = new Set(Object.keys(j.m || {}).filter(fid => !MILLI.has(j.m[fid][0])));
  const p = [], ay = [], gor = new Set();
  for (const [id, [isim, rows]] of Object.entries(j.p)) {
    const r = rows.filter(x => kulupMac.has(String(x[0])));
    if ((S && !sqId.has(+id) && [...(sqTk.get(+id) || [])].some(t => t !== tid)) || (asil(+id) && asil(+id) !== tid && (!sqTk.has(+id) || sqTk.get(+id).has(asil(+id))))) { if (r.length) ay.push([isim, r.length, r.reduce((s, x) => s + (+x[1] || 0), 0), r.reduce((s, x) => s + (+x[3] || 0), 0), r.reduce((s, x) => s + (+x[4] || 0), 0), r.reduce((s, x) => s + (+x[5] || 0), 0), +id]); continue; } // takimdan ayrilmis: ay listesi (oyuncu sayfasinda eski takim karti)
    const k = sqId.get(+id) || {};
    p.push([isim, r.length, r.reduce((s, x) => s + (+x[1] || 0), 0), r.reduce((s, x) => s + (+x[3] || 0), 0), r.reduce((s, x) => s + (+x[4] || 0), 0), r.reduce((s, x) => s + (+x[5] || 0), 0), k.p || '', k.no || 0, null, null, +id]);
    gor.add(+id);
  }
  for (const x of S || []) if (!gor.has(x.id) && !(asil(x.id) && asil(x.id) !== tid && sqTk.get(x.id).has(asil(x.id)))) p.push([x.n, 0, 0, 0, 0, 0, x.p || '', x.no || 0, null, null, x.id]); // kadroda, bu sezon oynamamis
  p.sort((a, b) => b[2] - a[2]);
  const e = {}; for (const c of cs) { if (MILLI.has(c)) continue; const k = F[c].filter(fid => !(j.m || {})[fid]).length; if (k) e[c] = k; }
  const top = cs.filter(c => !MILLI.has(c)).reduce((s, c) => s + F[c].length, 0), eks = Object.values(e).reduce((s, v) => s + v, 0);
  out[L + '|' + ad] = { src: `API-Football (${SEZON}/${String(SEZON + 1).slice(2)}, tüm yarışmalar, ${top - eks} maç${eks ? `; ${eks} maçın oyuncu verisi yok` : ''})`, at: gun(j.at), kr: 'yok', p, m: [], e, ...(ay.length ? { ay } : {}) };
  n++; oy += p.length;
}
const dosya = path.join(root, 'data', 'players', 'api.json');
const eski = rd(dosya), pl = JSON.stringify(out);
if (eski && eski.pl === pl) console.log(`API oyuncu listesi degismedi (${n} takim)`);
else { fs.writeFileSync(dosya + '.tmp', JSON.stringify({ at: new Date().toISOString(), pl })); fs.renameSync(dosya + '.tmp', dosya); console.log(`API oyuncu listesi: ${n} takim, ${oy} oyuncu`); }
