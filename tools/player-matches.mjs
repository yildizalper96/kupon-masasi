// Oyuncu mac mac kaydi (guncel sezon), takim basina: data/api/oyuncu/<takimId>.json. Istek YOK.
// Kaynak: data/api/<C>/<S>/m-YYYY-MM.json (fetch-history, API-Football /fixtures?id=) + fixtures.json, ayrica
// details.json'daki biten maclarin live.px'i (aylik dosyaya henuz girmemis son maclar).
// Cikti: { at, t:{id:ad}, m:{fid:[C, tarihISO, evId, depId, evGol, depGol, tur]},
//          p:{oyuncuId:[ad, [[fid, dk, puan, gol, asist, sari, kirmizi, sut, isabetli, kilitPas, topKapma, kurtaris, yedekten]]]}}
// Yalnizca oynayan oyuncular (dk > 0) kaydedilir; takimin macinda satiri olmayan oyuncu o macta oynamamistir. Veri uydurulmaz.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const API = path.join(root, 'data', 'api');
const SEZON = 2026;
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const wr = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f + '.tmp', JSON.stringify(o)); fs.renameSync(f + '.tmp', f); };
const BITTI = new Set(['FT', 'AET', 'PEN']);

const ad = {}; Object.assign(ad, (rd(path.join(API, 'teams.json')) || {}).t || {});
const uyg = (rd(path.join(root, 'data', 'teams', 'ids.json')) || {}).t || {};
const UAD = {}; Object.entries(uyg).forEach(([n, id]) => { UAD[id] = n; }); // uygulama adi oncelikli (Belgium -> Belçika)
// milli takim yarismalari takvim yili sezonu: kulup sezonu (1 Temmuz) oncesi maclar (ör. Haziran 2026 Dunya Kupasi) bu sezona sayilmaz
const MILLI = new Set(['UNL', 'WC', 'EURO', 'WCQE', 'EUROQ', 'COPA', 'WCQSA', 'FRI']), MILLI_BAS = SEZON + '-07-01';
const T = new Map(); // tid -> { m:{}, p:{} }
const tk = id => { if (!T.has(id)) T.set(id, { m: {}, p: {} }); return T.get(id); };
const fxBil = {}; // fid -> [C, t, h, a, gh, ga, tur]

for (const c of fs.readdirSync(API).filter(d => /^[A-Z][A-Z0-9]*$/.test(d))) {
  const d = path.join(API, c, String(SEZON)); if (!fs.existsSync(d)) continue;
  const fx = rd(path.join(d, 'fixtures.json')) || {};
  Object.entries(fx.tn || {}).forEach(([id, n]) => { if (!ad[id]) ad[id] = n; });
  for (const x of fx.m || []) if (BITTI.has(x[6]) && !(MILLI.has(c) && String(x[1]) < MILLI_BAS)) fxBil[x[0]] = [c, x[1], x[2], x[3], x[4], x[5], x[7] || ''];
  for (const f of fs.readdirSync(d).filter(x => /^m-\d{4}-\d{2}\.json$/.test(x))) {
    const M = (rd(path.join(d, f)) || {}).m || {};
    for (const [fid, m] of Object.entries(M)) {
      const b = fxBil[fid]; if (!b || !m.pl) continue;
      for (const [tid, rows] of Object.entries(m.pl)) {
        const o = tk(+tid); o.m[fid] = b;
        for (const r of rows) {
          if (!r[0] || !(r[2] > 0)) continue;
          const q = o.p[r[0]] || (o.p[r[0]] = [r[1], []]);
          if (String(r[1]).length > String(q[0]).length) q[0] = r[1]; // tam ad (A. Guler yerine Arda Guler)
          q[1].push([+fid, r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[11], r[12], r[13], r[14]]);
        }
      }
    }
  }
}
// onceki kayit: aylik dosyasi bu makinede olmayan maclar korunur (m-*.json git'e girmez; bulutta dosya yoktur, kayit eksilmesin)
{
  const DIR0 = path.join(API, 'oyuncu');
  for (const f of fs.existsSync(DIR0) ? fs.readdirSync(DIR0).filter(x => /^\d+\.json$/.test(x)) : []) {
    const j = rd(path.join(DIR0, f)); if (!j || !j.m || !j.p) continue;
    const tid = +f.slice(0, -5), kalan = Object.keys(j.m).filter(fid => fxBil[fid] && !T.get(tid)?.m[fid]); // yalnizca guncel sezon
    if (!kalan.length) continue;
    const o = tk(tid), al = new Set(kalan.map(Number));
    for (const fid of kalan) o.m[fid] = fxBil[fid];
    for (const [pid, [n, rows]] of Object.entries(j.p)) {
      const r = rows.filter(x => al.has(x[0])); if (!r.length) continue;
      const q = o.p[pid] || (o.p[pid] = [n, []]);
      if (String(n).length > String(q[0]).length) q[0] = n;
      q[1].push(...r);
    }
  }
}
// son maclar: details.json live.px (aylik dosyada olmayanlar)
{
  const D = rd(path.join(root, 'data', 'fixtures', 'details.json')) || {};
  for (const [fid, e] of Object.entries(D.m || {})) {
    const lv = e && e.live; if (!lv || !lv.fin || !lv.px) continue;
    const b = fxBil[fid]; if (!b) continue;
    for (const [s, tid0] of [['h', b[2]], ['a', b[3]]]) {
      const o = tk(+tid0); if (o.m[fid]) continue;
      o.m[fid] = b;
      for (const q0 of lv.px[s] || []) {
        if (!q0.id || !(q0.min > 0)) continue;
        const q = o.p[q0.id] || (o.p[q0.id] = [q0.n, []]);
        q[1].push([+fid, q0.min, q0.r ?? null, q0.g || 0, q0.a || 0, q0.y || 0, q0.rd || 0, q0.sh ?? 0, q0.sot ?? 0, q0.kp ?? 0, q0.tk ?? 0, q0.sv ?? 0, null]);
      }
    }
  }
}

const DIR = path.join(API, 'oyuncu');
let yaz = 0, ayni = 0;
for (const [tid, o] of T) {
  if (!Object.keys(o.p).length) continue;
  Object.values(o.p).forEach(q => q[1].sort((x, y) => String(fxBil[y[0]][1]).localeCompare(String(fxBil[x[0]][1]))));
  const t = {}; Object.values(o.m).forEach(b => { for (const k of [b[2], b[3]]) if (UAD[k] || ad[k]) t[k] = UAD[k] || ad[k]; });
  const f = path.join(DIR, tid + '.json'), eski = rd(f), yeni = { t, m: o.m, p: o.p };
  if (eski && JSON.stringify({ t: eski.t, m: eski.m, p: eski.p }) === JSON.stringify(yeni)) { ayni++; continue; }
  wr(f, { at: new Date().toISOString(), ...yeni }); yaz++;
}
console.log(`Oyuncu mac kaydi: ${T.size} takim (yazilan ${yaz}, degismeyen ${ayni})`);

// milli kadro haritasi: oyuncu kimligi -> guncel milli kadrosu (data/api/milli/<id>.json sq, fetch-milli.mjs). Oyuncu sayfasi "Son kadroda" bilgisi.
{
  const MD = path.join(API, 'milli'), ix = (rd(path.join(MD, 'index.json')) || {}).t || {};
  const t = {}, p = {};
  for (const [id, n] of Object.entries(ix)) {
    const j = rd(path.join(MD, id + '.json')); if (!j || !Array.isArray(j.sq) || !j.sq.length) continue;
    t[id] = n; for (const r of j.sq) if (r[0] && !p[r[0]]) p[r[0]] = [+id, +r[3] > 0 ? +r[3] : null];
  }
  const f = path.join(DIR, 'milli-kadro.json'), eski = rd(f);
  if (!eski || JSON.stringify({ t: eski.t, p: eski.p }) !== JSON.stringify({ t, p })) wr(f, { at: new Date().toISOString(), t, p });
  console.log(`Milli kadro haritasi: ${Object.keys(t).length} takim, ${Object.keys(p).length} oyuncu`);
}
