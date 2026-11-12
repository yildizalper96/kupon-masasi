// Yayin paketini hazirlar: node tools/build-site.mjs [cikis-klasoru]   (varsayilan: yayin)
// Yalnizca uygulamanin ihtiyac duydugu dosyalari kopyalar. Girmeyenler: yedek/, tools/, .env, data/kupon (kisisel
// kupon adlari), data/history/rules ve applied (ic guncelleme kurallari), onbellekler.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.resolve(root, process.argv[2] || 'yayin');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const copy = rel => {
  const from = path.join(root, rel);
  if (!fs.existsSync(from)) { console.warn('uyari: yok, atlandi:', rel); return; }
  fs.mkdirSync(path.dirname(path.join(out, rel)), { recursive: true });
  fs.cpSync(from, path.join(out, rel), { recursive: true });
};

for (const rel of [
  'index.html', 'manifest.webmanifest', 'sw.js', 'icons', 'css', 'js',
  'data/results', 'data/lineups', 'data/players',
  'data/history/all.json', 'data/fixtures/latest.json', 'data/fixtures/details.json', 'data/fixtures/finished.json','data/teams/ids.json',
]) copy(rel);

fs.writeFileSync(path.join(out, '.nojekyll'), '');

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(out);
const bytes = files.reduce((a, f) => a + fs.statSync(f).size, 0);
console.log(`${path.relative(root, out) || out}: ${files.length} dosya, ${(bytes / 1024).toFixed(0)} KB`);
