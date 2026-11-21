// Gol kralligi duzeltmesi (API istegi YOK). API-Football /players/topscorers bazen oyuncunun
// istatistik kayitlarini cift sayiyor (or. SL 2022 U. Nayir 34 gol / 63 mac). Bu betik, sezonun
// tum bitmis maclari aylik dosyalarda (m-YYYY-MM.json) varsa, top.json'daki gol listesini (g)
// mac olaylarindan yeniden hesaplar: kendi kalesine gol ve kacan penalti sayilmaz.
// Kullanim: node tools/top-from-events.mjs   (fetch-history.mjs sonunda da cagrilir)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = path.join(root, 'data', 'api');
const FIN = new Set(['FT', 'AET', 'PEN']);
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

export function topFromEvents(log = []) {
  let n = 0;
  for (const c of fs.existsSync(base) ? fs.readdirSync(base) : []) {
    const cd = path.join(base, c); if (!fs.statSync(cd).isDirectory()) continue;
    for (const s of fs.readdirSync(cd)) {
      const sd = path.join(cd, s), tf = path.join(sd, 'top.json');
      const top = rd(tf), fx = rd(path.join(sd, 'fixtures.json'));
      if (!top || !fx || !Array.isArray(fx.m)) continue;
      const b0 = fx.m.filter(r => FIN.has(r[6])); if (!b0.length) continue;
      const M = {};
      for (const f of fs.readdirSync(sd).filter(f => /^m-\d{4}-\d{2}\.json$/.test(f))) Object.assign(M, (rd(path.join(sd, f)) || {}).m || {});
      const bitti = b0.filter(r => M[r[0]]);
      if (bitti.length < b0.length * 0.99) continue; // kayitli mac %1'den fazla eksikse API listesine dokunma
      const ad = {}; (top.g || []).concat(top.a || []).forEach(r => { if (r[2] != null) ad[r[2]] = r[3]; });
      const st = rd(path.join(sd, 'standings.json')); (st && st.rows || []).forEach(r => { if (r.tid != null) ad[r.tid] = r.n; });
      const G = {}; let olay = 0, skor = 0;
      for (const r of bitti) {
        if (!(M[r[0]].ev || []).length) continue; // hukmen maclar (olay yok, or. SL 2022 deprem sonrasi 3-0): golcuye yazilmaz
        skor += (+r[4] || 0) + (+r[5] || 0);
        olay += (M[r[0]].ev || []).filter(e => e[3] === 'G' && !/missed/i.test(e[4] || '')).length;
      }
      if (!skor || olay < skor * 0.98 || olay > skor * 1.02) continue; // olay kaydi eksik/fazla: API listesine dokunma
      for (const r of bitti) {
        const m = M[r[0]];
        for (const e of m.ev || []) {
          if (e[3] !== 'G' || /own|missed/i.test(e[4] || '') || !(e[5] || e[6])) continue;
          const k = e[5] || e[6], o = G[k] = G[k] || { id: e[5] || null, n: e[6], t: e[2], g: 0, mac: 0 };
          o.g++; o.t = e[2]; if (!o.n && e[6]) o.n = e[6];
        }
        for (const l of Object.values(m.pl || {})) for (const p of l) if (G[p[0]]) G[p[0]].mac++;
      }
      // mac sayisi pl kaydi olmayan sezonlarda 0 kalabilir: API listesindeki deger makulse onu kullan
      const api = Object.fromEntries((top.a || []).concat(top.g || []).map(r => [r[0], r]));
      const g = Object.values(G).filter(o => o.n).sort((a, b) => b.g - a.g || a.n.localeCompare(b.n)).slice(0, 20)
        .map(o => [o.id, (api[o.id] && api[o.id][1]) || o.n, o.t, ad[o.t] || (api[o.id] && api[o.id][3]) || null, o.g, o.mac || (api[o.id] && api[o.id][5] <= 50 ? api[o.id][5] : 0)]);
      if (!g.length) continue;
      if (JSON.stringify(g) === JSON.stringify(top.g)) continue;
      top.g = g; top.gk = 'olay'; fs.writeFileSync(tf, JSON.stringify(top)); n++;
      log.push(`${c} ${s}: gol kralligi olaylardan (${g[0][1]} ${g[0][4]})`);
    }
  }
  log.push(`gol kralligi duzeltme: ${n} dosya`);
  return log;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(topFromEvents().join('\n'));
