// API-Football deneme araci. Kullanim: node tools/api-test.mjs
// Anahtar proje klasorundeki .env dosyasindan okunur (API_FOOTBALL_KEY=...). Anahtar asla yazdirilmaz.
// Toplam 3 istek harcar (ucretsiz plan: gunde 100): /status (sayilmaz), /leagues, /fixtures?date=bugun
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const env = Object.fromEntries(
  (fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '')
    .split(/\r?\n/).map(l => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^["']|["']$/g, '')])
);
const KEY = env.API_FOOTBALL_KEY;
if (!KEY) { console.error('HATA: .env dosyasinda API_FOOTBALL_KEY= satiri bos. Anahtari yapistirip kaydet.'); process.exit(1); }

const HOST = 'https://v3.football.api-sports.io';
let lastRemaining = '?';
async function api(p) {
  const r = await fetch(HOST + p, { headers: { 'x-apisports-key': KEY } });
  lastRemaining = r.headers.get('x-ratelimit-requests-remaining') ?? lastRemaining;
  const j = await r.json();
  if (j.errors && (Array.isArray(j.errors) ? j.errors.length : Object.keys(j.errors).length)) {
    throw new Error(p + ' -> ' + JSON.stringify(j.errors));
  }
  return j;
}

// Hedef: sistemdeki ligler + buyuk ligler + yerel kupalar + Avrupa kupalari. 2. ve 3. ligler yok.
const TARGETS = [
  ['England', /^(Premier League|FA Cup|League Cup|EFL Cup)$/i],
  ['Spain', /^(La Liga|Copa del Rey)$/i],
  ['Italy', /^(Serie A|Coppa Italia)$/i],
  ['Germany', /^(Bundesliga|DFB Pokal)$/i],
  ['France', /^(Ligue 1|Coupe de France)$/i],
  ['Turkey', /^(S[uü]per Lig|Turkish Cup|T[uü]rkiye Kupas[iı])$/i],
  ['Netherlands', /^(Eredivisie|KNVB Beker)$/i],
  ['Portugal', /^(Primeira Liga|Liga Portugal|Ta[cç]a de Portugal)$/i],
  ['Belgium', /^(Jupiler Pro League|Pro League|Belgian Cup|Cup)$/i],
  ['Scotland', /^(Premiership|Scottish Premiership|FA Cup|Scottish Cup)$/i],
  ['Saudi-Arabia', /^(Pro League|Saudi Pro League|King'?s Cup)$/i],
  ['World', /^(UEFA Champions League|UEFA Europa League|UEFA Europa Conference League|UEFA Conference League|UEFA Nations League|UEFA Super Cup)$/i],
  // buyuk ligler (istege bagli, kullanici sonra eler)
  ['Brazil', /^(Serie A|Copa do Brasil)$/i],
  ['Argentina', /^(Liga Profesional Argentina|Primera Division|Copa Argentina)$/i],
  ['USA', /^(Major League Soccer)$/i],
  ['Mexico', /^(Liga MX)$/i],
];

console.log('1/3 /status ...');
const st = await api('/status');
const acc = st.response?.account, sub = st.response?.subscription, rq = st.response?.requests;
console.log(`  plan: ${sub?.plan}, aktif: ${sub?.active}, bugun kullanilan istek: ${rq?.current}/${rq?.limit_day}`);

console.log('2/3 /leagues (tum ligler, 1 istek) ...');
const lg = await api('/leagues');
console.log('  toplam lig/kupa:', lg.response.length);
const found = [];
for (const [country, re] of TARGETS) {
  for (const x of lg.response) {
    if (x.country?.name !== country || !re.test(x.league.name)) continue;
    const cur = x.seasons.find(s => s.current) || x.seasons[x.seasons.length - 1];
    const c = cur?.coverage || {};
    found.push({
      id: x.league.id, country, name: x.league.name, type: x.league.type, season: cur?.year,
      cov: ['fixtures.events', 'fixtures.lineups', 'fixtures.statistics_fixtures', 'standings', 'players', 'predictions', 'odds']
        .map(k => k.split('.').reduce((o, p) => o?.[p], c) ? '+' : '-').join(''),
    });
  }
}
fs.mkdirSync(path.join(root, 'tools', 'out'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools', 'out', 'leagues-found.json'), JSON.stringify(found, null, 1));
console.log('  hedeflerden bulunan:', found.length);
console.log('  (kapsam sirasi: olay,kadro,takim-ist,puan,oyuncu,tahmin,oran)');
for (const f of found) console.log(`  ${String(f.id).padStart(4)}  ${(f.country + ' / ' + f.name).padEnd(46)} ${f.type.padEnd(6)} ${f.season}  ${f.cov}`);

const today = new Date().toISOString().slice(0, 10);
console.log(`3/3 /fixtures?date=${today} (dunyadaki tum maclar, 1 istek) ...`);
const fx = await api('/fixtures?date=' + today);
const ids = new Set(found.map(f => f.id));
const mine = fx.response.filter(m => ids.has(m.league.id));
console.log(`  dunya toplami: ${fx.response.length} mac, hedef liglerde: ${mine.length} mac`);
for (const m of mine.slice(0, 25)) {
  console.log(`  ${m.fixture.date.slice(11, 16)}Z  ${m.league.name.padEnd(24)} ${m.teams.home.name} - ${m.teams.away.name}  [${m.fixture.status.short}]`);
}
console.log('\nKalan gunluk istek (yaklasik):', lastRemaining);
