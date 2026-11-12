// Biten maclarin oyuncu istatistiklerinden (live.px) kalici sezon toplami biriktirir: data/players/season.json
// { at, done:[fixtureId], p:{ "<oyuncuId>": { n, tm, no, pos, ph, c:{ "<lig>": { m, min, rs, rn, g, a, ... } } } } }
//  m: mac, min: dakika, rs/rn: puan toplami ve puanli mac sayisi (ortalama = rs/rn), diger alanlar px alanlarinin toplami.
// Yalniz MAC SONU (fin) verisi eklenir; ayni mac iki kez sayilmaz (done). Veri uydurulmaz: API'de null olan alan toplama girmez.
import fs from 'node:fs';
import path from 'node:path';

const SUM = ['g', 'a', 'gc', 'sv', 'sh', 'sot', 'ps', 'kp', 'pa', 'tk', 'bl', 'int', 'du', 'dw', 'dra', 'drs', 'dp', 'fd', 'fc', 'off', 'y', 'rd', 'pw', 'pc', 'psc', 'pm', 'psv'];

export function seasonFile(root) { return path.join(root, 'data', 'players', 'season.json'); }

export function addMatch(root, { id, c, h, a, live, photoOf }) {
  if (!live || !live.fin || !live.px) return 0;
  const file = seasonFile(root);
  let S = { at: '', done: [], p: {} };
  try { S = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { }
  S.done = S.done || []; S.p = S.p || {};
  if (S.done.includes(id)) return 0;
  let n = 0;
  for (const side of ['h', 'a']) {
    const tm = side === 'h' ? h : a;
    for (const q of live.px[side] || []) {
      const key = q.id ? String(q.id) : 'n:' + tm + ':' + q.n;
      const o = S.p[key] || (S.p[key] = { n: q.n, tm, no: q.no ?? null, pos: q.pos ?? null, ph: q.id ? 'https://media.api-sports.io/football/players/' + q.id + '.png' : null, c: {} });
      o.n = q.n; o.tm = tm; if (q.no != null) o.no = q.no; if (q.pos) o.pos = q.pos;
      const r = o.c[c] || (o.c[c] = { m: 0, min: 0, rs: 0, rn: 0 });
      r.m++; r.min += q.min || 0;
      if (q.r != null) { r.rs = +(r.rs + q.r).toFixed(2); r.rn++; }
      for (const k of SUM) if (q[k] != null) r[k] = (r[k] || 0) + q[k];
      n++;
    }
  }
  S.done.push(id); S.at = new Date().toISOString();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(S));
  return n;
}
