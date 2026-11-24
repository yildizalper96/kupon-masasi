// Yayin paketini hazirlar: node tools/build-site.mjs [cikis-klasoru]   (varsayilan: yayin)
// Yalnizca uygulamanin ihtiyac duydugu dosyalari kopyalar. Girmeyenler: yedek/, tools/, .env, data/kupon (kisisel
// kupon adlari), data/history/rules ve applied (ic guncelleme kurallari), onbellekler.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.resolve(root, process.argv[2] || 'yayin');

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

// data/api: yalniz uygulamanin okudugu ozetler yayinlanir. Aylik mac dokumleri (m-YYYY-MM.json) ve gecmis sezonlarin
// oyuncu/takim istatistikleri (players.json, teamstats.json) istemcide kullanilmaz; ham veri yeniden dagitimi olmasin diye yayina girmez.
const API_SEZON = '2026';
const apiYayin = p => {
  const r = path.relative(path.join(root, 'data', 'api'), p).split(path.sep);
  if (r[0] === '..' || r[0] === '') return true;
  const ad = r[r.length - 1];
  if (/^m-\d{4}-\d{2}\.json$/.test(ad) || ad.endsWith('.tmp')) return false;
  if ((ad === 'players.json' || ad === 'teamstats.json') && r.length === 3 && r[1] !== API_SEZON) return false;
  return true;
};
const copy = rel => {
  const from = path.join(root, rel);
  if (!fs.existsSync(from)) { console.warn('uyari: yok, atlandi:', rel); return; }
  fs.mkdirSync(path.dirname(path.join(out, rel)), { recursive: true });
  fs.cpSync(from, path.join(out, rel), { recursive: true, filter: apiYayin });
};

for (const rel of [
  'index.html', 'manifest.webmanifest', 'sw.js', 'icons', 'css', 'js',
  'data/results', 'data/lineups', 'data/players', 'data/tm',
  'data/history/all.json', 'data/fixtures/latest.json', 'data/fixtures/details.json', 'data/fixtures/finished.json', 'data/fixtures/dis-form.json','data/teams/ids.json','data/standings', 'data/api', 'data/model', 'data/extra',
]) copy(rel);

fs.writeFileSync(path.join(out, '.nojekyll'), '');

// details.json: mac basi oyuncu istatistigi (m[id].live.px, dosyanin yarisi) ayri dosyaya: data/fixtures/details-px.json
// { at, p:{ macAnahtari(k): px } }. Istemci (pages.js pxHazir) yalniz mac/takim/oyuncu sayfasinda tembel yukler.
{
  const df = path.join(out, 'data', 'fixtures', 'details.json');
  try {
    const d = JSON.parse(fs.readFileSync(df, 'utf8')), p = {};
    for (const e of Object.values(d.m || {})) if (e && e.k && e.live && e.live.px) { p[e.k] = e.live.px; delete e.live.px; }
    fs.writeFileSync(path.join(out, 'data', 'fixtures', 'details-px.json'), JSON.stringify({ at: d.at, p }));
    fs.writeFileSync(df, JSON.stringify(d));
    console.log('details: px ayrildi,', Object.keys(p).length, 'mac');
  } catch (e) { console.warn('details px ayrilamadi:', e.message); }
}

// SEO mac sayfalari + sitemap.xml + robots.txt (tools/seo-pages.mjs)
{ const { build } = await import('./seo-pages.mjs'); try { build(out); } catch (e) { console.warn('seo sayfalari uretilemedi:', e.message); } }

// service worker surumu: kabuk dosyalarinin (index.html, css, js, ikonlar, manifest) ozeti. Kod degisince sw.js degisir,
// tarayicilar yeni surumu kurar ve kabugu agdan bastan indirir; degismezse onbellek korunur (anlik acilis).
{
  const crypto = await import('node:crypto');
  const h = crypto.createHash('sha1');
  const kab = [];
  (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : kab.push(p); } })(path.join(out, 'js'));
  for (const r of ['index.html', 'manifest.webmanifest']) kab.push(path.join(out, r));
  for (const d of ['css', 'icons']) (function walk(x) { for (const e of fs.readdirSync(x, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const p = path.join(x, e.name); e.isDirectory() ? walk(p) : kab.push(p); } })(path.join(out, d));
  for (const f of kab) if (fs.existsSync(f)) { h.update(path.relative(out, f)); h.update(fs.readFileSync(f)); }
  const swp = path.join(out, 'sw.js'), sv = 'km-' + h.digest('hex').slice(0, 10);
  fs.writeFileSync(swp, fs.readFileSync(swp, 'utf8').replace(/const CACHE = '[^']*'/, `const CACHE = '${sv}'`));
  console.log('sw surumu:', sv);
}

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(out);
const bytes = files.reduce((a, f) => a + fs.statSync(f).size, 0);
console.log(`${path.relative(root, out) || out}: ${files.length} dosya, ${(bytes / 1024).toFixed(0)} KB`);
