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
for (const rel of ['fixtures/latest.json', 'fixtures/details.json']) {
  const cur = rd(path.join(root, 'data', rel)), rep = rd(path.join(repoDir, rel));
  if (rep && (!cur || ts(rep) > ts(cur))) { wr(path.join(root, 'data', rel), rep); console.log(rel + ': depodaki daha yeni, o kullanildi'); }
  else console.log(rel + ': ' + (cur ? 'onbellek yeni/esit, korundu' : 'dosya yok'));
}
