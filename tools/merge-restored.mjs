// GitHub Actions: onbellek geri yuklenince depodaki (checkout) YENI veri eskisiyle ezilmesin.
// Kullanim: node tools/merge-restored.mjs <depo-kopya-klasoru>   (workflow, onbellekten ONCE depodaki data/ kopyasini bu klasore alir)
//  - data/teams/ids.json : iki sozlugun birlesimi (cakismada onbellek kazanir), tarih = yeni olan
//  - data/fixtures/latest.json, details.json : "at" tarihi yeni olan kazanir
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const repoDir = path.resolve(root, process.argv[2] || '.repo-data');
const rd = p => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const ts = o => Date.parse(o && o.at) || 0;
const wr = (p, o) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(o)); };

{ // takim kimlikleri
  const rel = 'teams/ids.json', cur = rd(path.join(root, 'data', rel)), rep = rd(path.join(repoDir, rel));
  if (rep && rep.t) {
    if (!cur || !cur.t) { wr(path.join(root, 'data', rel), rep); console.log('ids.json: onbellek yok, depodaki kullanildi (' + Object.keys(rep.t).length + ' takim)'); }
    else {
      const t = Object.assign({}, rep.t, cur.t);
      const out = Object.assign({}, cur, { t, at: ts(cur) >= ts(rep) ? cur.at : rep.at });
      wr(path.join(root, 'data', rel), out);
      console.log(`ids.json: birlesti (depo ${Object.keys(rep.t).length} + onbellek ${Object.keys(cur.t).length} -> ${Object.keys(t).length} takim)`);
    }
  }
}
{ // details.json: mac mac birlestir. Yeni dosya taban; eski kopyadaki alanlar (or. onbellekteki resmi 11 luRaw/lu)
  // yeni kopyada YOKSA korunur. Boylece depoya commit'lenen kismi veri, onbellekteki veriyi silmez (12 Kas 2026 hatasi).
  const rel = 'fixtures/details.json', cur = rd(path.join(root, 'data', rel)), rep = rd(path.join(repoDir, rel));
  if (rep && cur && rep.m && cur.m) {
    const [yeni, eski] = ts(rep) > ts(cur) ? [rep, cur] : [cur, rep];
    const m = {}; let dolan = 0;
    for (const id of new Set([...Object.keys(eski.m), ...Object.keys(yeni.m)])) {
      const o = eski.m[id] || {}, n = yeni.m[id] || {};
      m[id] = Object.assign({}, o, n);
      for (const k of Object.keys(o)) if (!(k in n) && yeni.m[id]) dolan++;
    }
    const sq = Object.assign({}, eski.sq || {}, yeni.sq || {});
    wr(path.join(root, 'data', rel), Object.assign({}, eski, yeni, { m, sq }));
    console.log(rel + ': mac mac birlesti (' + Object.keys(m).length + ' mac, eski kopyadan ' + dolan + ' alan korundu)');
  } else if (rep && !cur) { wr(path.join(root, 'data', rel), rep); console.log(rel + ': onbellek yok, depodaki kullanildi'); }
  else console.log(rel + ': ' + (cur ? 'onbellek korundu' : 'dosya yok'));
}
{ // finished.json: bitmis maclar kalici birikir; iki kopyanin birlesimi (id'ye gore)
  const rel = 'fixtures/finished.json', cur = rd(path.join(root, 'data', rel)), rep = rd(path.join(repoDir, rel));
  if (rep && rep.m) {
    const byId = new Map([...(rep.m || []), ...((cur && cur.m) || [])].map(r => [r.id, r]));
    const m = [...byId.values()].sort((a, b) => b.t.localeCompare(a.t)).slice(0, 600);
    wr(path.join(root, 'data', rel), { at: new Date().toISOString(), m });
    console.log(rel + ': birlesti (' + m.length + ' bitmis mac)');
  } else console.log(rel + ': ' + (cur ? 'onbellek korundu' : 'dosya yok'));
}
{ // players/season.json: oyuncu sezon toplami (done listesi uzun olan = daha cok mac islenmis kopya kazanir; toplamlar toplanmaz, cift sayim olmasin)
  const rel = 'players/season.json', cur = rd(path.join(root, 'data', rel)), rep = rd(path.join(repoDir, rel));
  const nd = o => ((o && o.done) || []).length;
  if (rep && nd(rep) > nd(cur)) { wr(path.join(root, 'data', rel), rep); console.log(rel + ': depodaki daha kapsamli (' + nd(rep) + ' mac), o kullanildi'); }
  else console.log(rel + ': ' + (cur ? 'onbellek korundu (' + nd(cur) + ' mac)' : 'dosya yok'));
}
for (const rel of ['fixtures/latest.json']) {
  const cur = rd(path.join(root, 'data', rel)), rep = rd(path.join(repoDir, rel));
  if (rep && (!cur || ts(rep) > ts(cur))) { wr(path.join(root, 'data', rel), rep); console.log(rel + ': depodaki daha yeni, o kullanildi'); }
  else console.log(rel + ': ' + (cur ? 'onbellek yeni/esit, korundu' : 'dosya yok'));
}
