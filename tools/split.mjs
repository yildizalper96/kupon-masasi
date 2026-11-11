// kupon-masasi-v200.html (claude.ai tek dosya) -> index.html + css/ + js/ + data/
// Kullanim: node tools/split.mjs
// Uygulama kodu degismez; yalnizca asagidaki PATCHES listesindeki yamalar uygulanir.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = fs.readFileSync(path.join(root, 'kupon-masasi-v200.html'), 'utf8').replace(/\r\n/g, '\n');
const L = src.split('\n'); // L[0] = satir 1
const line = n => L[n - 1];

const out = (rel, text) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  console.log(rel.padEnd(24), (Buffer.byteLength(text) / 1024).toFixed(1) + ' KB');
};

// ---- 1. CSS: artifact kabugu + uygulama stilleri + sondaki ek stil ----
const wrapperCss = /<style>([\s\S]*?)<\/style>/.exec(line(1))[1];
const appCss = L.slice(6, 170).join('\n'); // satir 7..170 (6 = <style>, 171 = </style>)
const tail = line(12361); // </script><style>..</style><script>G</script><div id='vpz'..></div><script>V
const tm = /^<\/script><style>([\s\S]*?)<\/style><script>([\s\S]*?)<\/script>(<div id='vpz'[^>]*><\/div>)<script>([\s\S]*)$/.exec(tail);
if (!tm) throw new Error('12361. satir beklenen bicimde degil');
const [, tailCss, gestureJs, vpzDiv, vpzJsStart] = tm;
out('css/app.css', `/* artifact kabugu */\n${wrapperCss}\n/* uygulama */\n${appCss}\n/* ek */\n${tailCss}\n`);

// ---- 2. JS ----
if (!line(177).startsWith('const I18N_KEYS=[')) throw new Error('177. satir I18N_KEYS degil');
out('js/i18n-keys.js', line(177) + '\n');

// ana betik: 175,176, 178..12360 (177 ayri dosyada, I18N_KEYS global const olarak kalir)
const mainLines = [...L.slice(174, 176), ...L.slice(177, 12360)];

const PATCHES = [
  {
    // Claude hesabi girisi yok: misafir karti sade olsun (Asama 2'de kendi girisimiz gelecek)
    startsWith: "if(!signed)return pbx('Giriş yap veya üye ol',",
    replace: `if(!signed)return pbx('',\`<b style="font:700 20px var(--n)">Misafir</b><div class='mut' style='padding:2px 0 8px'>Şu an misafirsin: kuponların ve favorilerin yalnızca bu cihazda durur.</div>\`);`,
  },
  {
    // paylasim baglantisi artik claude.ai artifact'ina degil kendi adresine gitsin
    startsWith: "const KLINK='https://claude.ai/artifact/",
    replace: "const KLINK=location.origin+location.pathname;",
  },
];
for (const p of PATCHES) {
  const hits = mainLines.map((l, i) => (l.startsWith(p.startsWith) ? i : -1)).filter(i => i >= 0);
  if (hits.length !== 1) throw new Error(`yama ${hits.length} yerde eslesti: ${p.startsWith}`);
  mainLines[hits[0]] = p.replace;
}
out('js/app.js', mainLines.join('\n') + '\n');

out('js/gestures.js', gestureJs + '\n');
out('js/extras.js', vpzJsStart + '\n' + line(12362) + '\n');

// ---- 3. index.html ----
const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<title>Kupon Masası</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;700&family=Barlow+Condensed:wght@600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/app.css">
</head><body>
${line(172)}
${line(173)}
<script src="js/data-shim.js"></script>
<script src="js/i18n-keys.js"></script>
<script src="js/app.js"></script>
<script src="js/gestures.js"></script>
${vpzDiv}
<script src="js/extras.js"></script>
</body></html>
`;
out('index.html', html);

// ---- 4. veri: yedek/db -> data ----
let n = 0;
const walk = (d, rel = '') => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue; // .xxx.json,by-others isaret dosyalari
    const abs = path.join(d, e.name);
    if (e.isDirectory()) walk(abs, path.join(rel, e.name));
    else {
      const dest = path.join(root, 'data', rel, e.name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      // kucult: bosluksuz JSON
      fs.writeFileSync(dest, JSON.stringify(JSON.parse(fs.readFileSync(abs, 'utf8'))));
      n++;
    }
  }
};
walk(path.join(root, 'yedek', 'db'));
console.log('data/ dosya sayisi:', n);
