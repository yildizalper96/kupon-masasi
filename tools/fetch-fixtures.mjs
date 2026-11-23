// API-Football -> data/fixtures/latest.json
// Kullanim: node tools/fetch-fixtures.mjs [--from=YYYY-MM-DD] [--days=8] [--max-pred=40] [--dry]
// Istek butcesi (ucretsiz plan, gunde 100): her tarih 1 istek + her yeni mac icin en fazla --max-pred tahmin istegi.
// Anahtar .env'den okunur (API_FOOTBALL_KEY), asla yazdirilmaz.
import fs from 'node:fs';
import path from 'node:path';
import { pace } from './api-pace.mjs';
import { kapsam, tekilAd } from './team-names.mjs';

const root = path.resolve(import.meta.dirname, '..');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const DRY = process.argv.includes('--dry');

// ---------- .env ----------
const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY) { console.error('HATA: API_FOOTBALL_KEY yok (.env).'); process.exit(1); }

// ---------- lig tablosu: uygulama kodu -> API-Football lig kimligi ----------
export const LEAGUES = {
  // sistemde zaten olanlar
  PL: [39, 'Premier League', 'İngiltere – Premier League', '#7c3aed'], LL: [140, 'LaLiga', 'İspanya – LaLiga', '#ea580c'],
  SA: [135, 'Serie A', 'İtalya – Serie A', '#0ea5e9'], BL: [78, 'Bundesliga', 'Almanya – Bundesliga', '#dc2626'],
  L1: [61, 'Ligue 1', 'Fransa – Ligue 1', '#2563eb'], SL: [203, 'Süper Lig', 'Türkiye – Süper Lig', '#e11d48'],
  ERE: [88, 'Eredivisie', 'Hollanda – Eredivisie', '#f97316'], POR: [94, 'Liga Portugal', 'Portekiz – Liga Portugal', '#16a34a'],
  BEL: [144, 'Jupiler Pro League', 'Belçika – Jupiler Pro League', '#eab308'], SCO: [179, 'Scottish Premiership', 'İskoçya – Scottish Premiership', '#0369a1'],
  KSA: [307, 'Saudi Pro League', 'Suudi Arabistan – Saudi Pro League', '#059669'],
  CL: [2, 'Şampiyonlar Ligi', 'Avrupa – Şampiyonlar Ligi', '#1d4ed8'], EL: [3, 'Avrupa Ligi', 'Avrupa – UEFA Avrupa Ligi', '#f59e0b'],
  ECL: [848, 'Konferans Ligi', 'Avrupa – Konferans Ligi', '#22c55e'], UNL: [5, 'Milli Takımlar Ligi', 'Avrupa – UEFA Uluslar Ligi', '#1d4ed8'],
  // yeni: yerel kupalar ve Avrupa
  FAC: [45, 'FA Cup', 'İngiltere – FA Cup', '#be123c'], EFL: [48, 'EFL Cup', 'İngiltere – EFL Cup', '#15803d'],
  CDR: [143, 'Copa del Rey', 'İspanya – Copa del Rey', '#c2410c'], CIT: [137, 'Coppa Italia', 'İtalya – Coppa Italia', '#0284c7'],
  DFB: [81, 'DFB-Pokal', 'Almanya – DFB-Pokal', '#b91c1c'], CDF: [66, 'Coupe de France', 'Fransa – Coupe de France', '#1e40af'],
  TUK: [206, 'Türkiye Kupası', 'Türkiye – Türkiye Kupası', '#be123c'], KNV: [90, 'KNVB Beker', 'Hollanda – KNVB Beker', '#ea580c'],
  TDP: [96, 'Taça de Portugal', 'Portekiz – Taça de Portugal', '#15803d'], BCP: [147, 'Belçika Kupası', 'Belçika – Belçika Kupası', '#ca8a04'],
  SFA: [181, 'İskoçya Kupası', 'İskoçya – İskoçya Kupası', '#075985'], USC: [531, 'UEFA Süper Kupa', 'Avrupa – UEFA Süper Kupa', '#4338ca'],
  // yeni: ekstra büyük ligler
  BRA: [71, 'Brezilya Serie A', 'Brezilya – Serie A', '#16a34a'], CBR: [73, 'Brezilya Kupası', 'Brezilya – Copa do Brasil', '#15803d'],
  ARG: [128, 'Arjantin Ligi', 'Arjantin – Liga Profesional', '#0ea5e9'], CAR: [130, 'Arjantin Kupası', 'Arjantin – Copa Argentina', '#0284c7'],
  MLS: [253, 'MLS', 'ABD – MLS', '#2563eb'], MX: [262, 'Liga MX', 'Meksika – Liga MX', '#16a34a'],
};
const ID2C = Object.fromEntries(Object.entries(LEAGUES).map(([c, v]) => [v[0], c]));

// ---------- takim adi eslestirme (API adi -> uygulamadaki ad) ----------
const appTeams = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'app-teams.json'), 'utf8'));
const APP_ALL = [...new Set(Object.entries(appTeams).filter(([c]) => c !== 'UNL').flatMap(([, v]) => v))];
const NATIONS = {
  Turkey: 'Türkiye', Belgium: 'Belçika', Armenia: 'Ermenistan', Cyprus: 'Kıbrıs', Italy: 'İtalya', France: 'Fransa',
  'Czech Republic': 'Çekya', Czechia: 'Çekya', Spain: 'İspanya', England: 'İngiltere', Croatia: 'Hırvatistan', Albania: 'Arnavutluk',
  Finland: 'Finlandiya', 'San Marino': 'San Marino', Belarus: 'Belarus', Montenegro: 'Karadağ', Latvia: 'Letonya', Germany: 'Almanya',
  Andorra: 'Andorra', Austria: 'Avusturya', Azerbaijan: 'Azerbaycan', 'Bosnia and Herzegovina': 'Bosna-Hersek', Bulgaria: 'Bulgaristan',
  Denmark: 'Danimarka', Estonia: 'Estonya', 'Faroe Islands': 'Faroe Adaları', Wales: 'Galler', Gibraltar: 'Gibraltar', Georgia: 'Gürcistan',
  Netherlands: 'Hollanda', Kazakhstan: 'Kazakistan', Kosovo: 'Kosova', 'North Macedonia': 'Kuzey Makedonya', 'Northern Ireland': 'Kuzey İrlanda',
  Liechtenstein: 'Liechtenstein', Lithuania: 'Litvanya', Luxembourg: 'Lüksemburg', Hungary: 'Macaristan', Malta: 'Malta', Moldova: 'Moldova',
  Norway: 'Norveç', Poland: 'Polonya', Portugal: 'Portekiz', Romania: 'Romanya', Slovakia: 'Slovakya', Slovenia: 'Slovenya', Serbia: 'Sırbistan',
  Ukraine: 'Ukrayna', Greece: 'Yunanistan', Ireland: 'İrlanda Cumhuriyeti', 'Republic of Ireland': 'İrlanda Cumhuriyeti', Scotland: 'İskoçya',
  Israel: 'İsrail', Sweden: 'İsveç', Switzerland: 'İsviçre', Iceland: 'İzlanda',
  // API'nin kullandigi diger yazimlar (14 Kas 2026 hatasi: ayni mac hem Turkce hem Ingilizce adla iki kez gorunuyordu)
  'FYR Macedonia': 'Kuzey Makedonya', Macedonia: 'Kuzey Makedonya', 'Bosnia & Herzegovina': 'Bosna-Hersek', 'Bosnia-Herzegovina': 'Bosna-Hersek', 'Bosnia Herzegovina': 'Bosna-Hersek',
  'Rep. Of Ireland': 'İrlanda Cumhuriyeti', 'Republic Of Ireland': 'İrlanda Cumhuriyeti', 'Eire': 'İrlanda Cumhuriyeti', 'Czech-Republic': 'Çekya', Turkiye: 'Türkiye', 'Faroe-Islands': 'Faroe Adaları', 'Northern-Ireland': 'Kuzey İrlanda', 'North-Macedonia': 'Kuzey Makedonya',
};
// elle eslesme (kisaltma kullanan uygulama adlari)
const ALIAS = {
  'manchester united': 'Man United', 'manchester city': 'Man City', 'nottingham forest': 'N. Forest', 'crystal palace': 'C. Palace',
  'borussia monchengladbach': 'M’gladbach', 'borussia m gladbach': 'M’gladbach', 'paris saint germain': 'PSG', 'paris saint-germain': 'PSG',
  'ac milan': 'Milan', 'athletic club': 'Athletic', 'atletico madrid': 'Atletico Madrid', 'real betis': 'Betis', 'celta vigo': 'Celta',
  'rayo vallecano': 'Rayo', 'deportivo alaves': 'Alaves', 'bayern munich': 'Bayern', 'bayern munchen': 'Bayern', 'rb leipzig': 'Leipzig',
  'eintracht frankfurt': 'Frankfurt', 'bayer leverkusen': 'Leverkusen', '1 fc koln': 'Köln', 'fc koln': 'Köln', 'olympique lyonnais': 'Lyon',
  'olympique marseille': 'Marseille', 'stade brestois 29': 'Brest', 'caykur rizespor': 'Rizespor', 'rizespor': 'Rizespor',
  'istanbul basaksehir': 'Başakşehir', 'gaziantep fk': 'Gaziantep', 'corum fk': 'Çorum', 'erzurum bb': 'Erzurumspor', 'fk crvena zvezda': 'Crvena Zvezda',
  'red star belgrade': 'Crvena Zvezda', 'slavia praha': 'Slavia Prague', 'sparta prague': 'Sparta Praha', 'union saint gilloise': 'Union SG',
  'royale union saint gilloise': 'Union SG', 'sint truidense': 'STVV', 'sint truidense vv': 'STVV', 'amed': 'Amedspor', 'amed sk': 'Amedspor', 'amedspor': 'Amedspor', 'hamburger sv': 'Hamburg', 'hamburg sv': 'Hamburg', 'bodo glimt': 'Bodø/Glimt', 'fk bodo glimt': 'Bodø/Glimt',
  'olympiakos piraeus': 'Olympiacos', 'olympiacos piraeus': 'Olympiacos', 'dundee united': 'Dundee Utd', 'heart of midlothian': 'Hearts',
  'sporting cp': 'Sporting', 'sporting braga': 'Braga', 'sc braga': 'Braga', 'vitoria guimaraes': 'Guimarães', 'vitoria sc': 'Guimarães',
  'fc copenhagen': 'Copenhagen', 'aek athens fc': 'AEK Atina', 'aek athens': 'AEK Atina', 'club brugge kv': 'Club Brugge', 'fc salzburg': 'Salzburg',
  'red bull salzburg': 'Salzburg', 'shakhtar donetsk': 'Shakhtar', 'psv eindhoven': 'PSV', 'az alkmaar': 'AZ Alkmaar', 'fc twente': 'Twente',
  'fc utrecht': 'Utrecht', 'sc heerenveen': 'Heerenveen', 'sc cambuur': 'Cambuur',
  'st truiden': 'STVV', 'union st gilloise': 'Union SG', 'al qadisiyah fc': 'Al Qadsiah', 'al qadisiyah': 'Al Qadsiah', 'al taawon': 'Al Taawoun',
};
const STOP = new Set(['fc', 'cf', 'afc', 'sc', 'fk', 'sk', 'bk', 'ac', 'as', 'ssc', 'sv', 'fsv', 'vfb', 'vfl', 'rb', 'the', 'de', 'club', 'cd', 'ud', 'kv', 'sd', 'rc', 'if', 'ik', 'sl', '1']);
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/[’'`.]/g, ' ').replace(/[^a-zA-Z0-9]+/g, ' ').trim().toLowerCase();
const NATIONS_N = Object.fromEntries(Object.entries(NATIONS).map(([k, v]) => [norm(k), v]));
const toks = s => norm(s).split(' ').filter(t => t && !STOP.has(t));
const unmatched = new Map();
// yarisma -> eslesebilecegi uygulama adlari (ayni ulke; Avrupa kupalarinda Avrupa ligleri). Inter Miami -> Inter hatasi (23 Kas 2026)
const SCOPE_C = {};
const scopeOf = code => SCOPE_C[code] || (SCOPE_C[code] = (() => { const l = [...new Set(kapsam(code, Object.keys(appTeams)).flatMap(k => appTeams[k]))]; return { all: l, toks: l.map(n => [n, toks(n)]) }; })());
// id verilirse: ad ids.json'da baska kulube aitse tekil ad ("Lille (Belçika)")
function teamName(code, api, id) {
  const n0 = teamName0(code, api);
  return id ? tekilAd(n0, id, TID, code) : n0;
}
function teamName0(code, api) {
  const clean = api.replace(/-/g, ' ');
  if (code === 'UNL' || code === 'USC' && NATIONS[clean]) {
    const tr = NATIONS[clean] || NATIONS[api] || NATIONS_N[norm(api)];
    if (tr) return tr;
    // bilinmeyen milli takim adi: Ingilizce adla sizdirma, raporla (workflow uyari verir)
    unmatched.set(code + ': ' + api, (unmatched.get(code + ': ' + api) || 0) + 1);
    return clean;
  }
  const n = norm(clean);
  const SC = scopeOf(code);
  // elle eslesme: hedef baska ulkenin uygulama takimiysa uygulanmaz
  if (ALIAS[n] && (SC.all.includes(ALIAS[n]) || !APP_ALL.includes(ALIAS[n]))) return ALIAS[n];
  // tam esit
  const exact = SC.all.find(a => norm(a) === n);
  if (exact) return exact;
  // uygulama adinin tum sozcukleri API adinda geciyor (ve tersi)
  const at = new Set(toks(clean));
  const cand = SC.toks.filter(([, t]) => t.length && t.every(x => at.has(x)));
  if (cand.length === 1) return cand[0][0];
  if (cand.length > 1) return cand.sort((a, b) => b[1].length - a[1].length)[0][0];
  const rev = SC.toks.filter(([, t]) => t.length && at.size && [...at].every(x => t.includes(x)));
  if (rev.length === 1) return rev[0][0];
  unmatched.set(code + ': ' + api, (unmatched.get(code + ': ' + api) || 0) + 1);
  return clean;
}

// ---------- API ----------
const HOST = 'https://v3.football.api-sports.io';
let remaining = null, used = 0;
// Sartlar dakikalik istek sinirini asmayi ciddi ihlal sayar: istekler arasinda bekle.
// Aralik, API'nin bildirdigi dakikalik limitten (x-ratelimit-limit) hesaplanir; bilinmiyorsa 7 sn (10/dk varsayimi).
let gapMs = 7000, lastReq = 0;
async function api(p) {
  const wait = lastReq + gapMs - Date.now();
  if (lastReq && wait > 0) await new Promise(r => setTimeout(r, wait));
  lastReq = Date.now();
  await pace(); const r = await fetch(HOST + p, { headers: { 'x-apisports-key': KEY } });
  const perMin = Number(r.headers.get('x-ratelimit-limit'));
  if (Number.isFinite(perMin) && perMin > 0) gapMs = Math.ceil(60000 / perMin) + 500;
  used++;
  remaining = Number(r.headers.get('x-ratelimit-requests-remaining') ?? remaining);
  const j = await r.json();
  const er = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
  if (er && er.length) {
    // 429 / rateLimit: yavasla (ilerlemeli bekleme); 2. kez olursa calismayi durdur (askiya almayi onle)
    if (/rateLimit|Too many/i.test(JSON.stringify(j.errors))) { globalThis.__rl = (globalThis.__rl || 0) + 1; if (globalThis.__rl >= 2) { console.error('Hiz siniri 2 kez asildi, calisma durduruldu.'); process.exit(0); } await new Promise(r => setTimeout(r, 65000)); }
    throw new Error(p + ' -> ' + JSON.stringify(j.errors));
  }
  return j;
}

// ---------- kota korumasi: /status istek sayilmaz; kalan < 10 ise hic istek yapma ----------
{
  const st = await fetch(HOST + '/status', { headers: { 'x-apisports-key': KEY } }).then(r => r.json()).catch(() => null);
  const rq = st?.response?.requests;
  if (st?.errors && (st.errors.requests || (Array.isArray(st.errors) && st.errors.length))) {
    console.log('Gunluk istek siniri dolmus, istek yapilmadi.'); process.exit(0);
  }
  if (rq && Number.isFinite(rq.limit_day) && rq.limit_day - rq.current < 10) {
    console.log(`Kota dolmak uzere (${rq.current}/${rq.limit_day}), istek yapilmadi.`);
    process.exit(0);
  }
  if (rq) remaining = rq.limit_day - rq.current;
}

// ---------- uygulamada elle yazili maclar (tahmin butcesi harcamamak icin) ----------
const appSrc = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const handPairs = new Set();
for (const m of appSrc.matchAll(/^[A-Z0-9]{2,4}\|\d\d-\d\dT\d\d:\d\d\|([^|\n]+)\|([^|\n]+)/gm)) handPairs.add(m[1] + '|' + m[2]);
for (const m of appSrc.matchAll(/^\d{4}-\d\d-\d\dT\d\d:\d\d\|([^|\n]+)\|([^|\n]+)$/gm)) handPairs.add(m[1] + '|' + m[2]);

// ---------- ana akis ----------
const today = new Date().toISOString().slice(0, 10);
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
// Ucretsiz plan yalnizca dun-bugun-yarin tarihlerine izin veriyor (UTC). Ucretli planda --days arttirilir.
const from = arg('from', addDays(today, -1)), days = +arg('days', 3), maxPred = +arg('max-pred', 40);
const dates = Array.from({ length: days }, (_, i) => addDays(from, i));

const outDir = path.join(root, 'data', 'fixtures');
fs.mkdirSync(outDir, { recursive: true });
const cachePath = path.join(root, 'tools', 'cache', 'predictions.json');
fs.mkdirSync(path.dirname(cachePath), { recursive: true });
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

// ---------- takim kimlikleri (logo icin): data/teams/ids.json, calistirmalar arasinda birikir ----------
// Uygulamadaki takim adi -> API-Football takim kimligi. Logo adresi: https://media.api-sports.io/football/teams/<id>.png
const tidPath = path.join(root, 'data', 'teams', 'ids.json');
const TID = fs.existsSync(tidPath) ? (JSON.parse(fs.readFileSync(tidPath, 'utf8')).t || {}) : {};
let tidNew = 0;
// var olan kimlik ASLA ezilmez (eskiden Inter <-> Inter Miami arasinda gidip geliyordu); cakisma raporlanir
const tidConflict = new Set();
const tidAdd = (name, id) => { if (!name || !Number.isFinite(id)) return; if (TID[name] == null) { TID[name] = id; tidNew++; } else if (+TID[name] !== +id) tidConflict.add(name + ': ' + TID[name] + ' / ' + id); };
const TID_SYN = { 'STVV': 'Sint-Truidense', 'Sint-Truidense': 'STVV' };
// Biten maclari kalici biriktir (takim formu ve tahmin gecmisi icin: ucretsiz planda gecmis mac sorgusu yok). data/fixtures/finished.json = {at, m:[{id,c,t,h,a,x,y,p}]}
// p: mac oncesi 1-X-2 olasiligi (tahmin gecmisi bununla, sonuc belli olduktan sonra degismeden hesaplanir)
const FIN_OK = new Set(['FT', 'AET', 'PEN']);
const finAdd = list => {
  if (DRY) return;
  try {
    const p = path.join(root, 'data', 'fixtures', 'finished.json');
    const cur = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { m: [] };
    const byId = new Map((cur.m || []).map(r => [r.id, r]));
    let n = 0;
    for (const m of list) {
      if (!FIN_OK.has(m.st) || !m.sc || m.sc[0] == null) continue;
      const v = byId.get(m.id);
      if (!v) { byId.set(m.id, { id: m.id, c: m.c, t: m.t, h: m.h, a: m.a, x: m.sc[0], y: m.sc[1], ...(m.p ? { p: m.p } : {}) }); n++; }
      else if (!v.p && m.p) { v.p = m.p; n++; }
    }
    if (!n) return;
    const m = [...byId.values()].sort((a, b) => b.t.localeCompare(a.t)).slice(0, 600);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify({ at: new Date().toISOString(), m }));
    console.log('finished.json: +' + n + ' bitmis mac (toplam ' + m.length + ')');
  } catch (e) { console.log('finished.json yazilamadi: ' + e.message); }
};
const tidSave = () => { if (tidConflict.size) console.log('UYARI ayni ad farkli kimlik (ezilmedi): ' + [...tidConflict].join(' | ')); for (const [a, b] of Object.entries(TID_SYN)) if (TID[a] && !TID[b]) TID[b] = TID[a]; if (DRY) return; fs.mkdirSync(path.dirname(tidPath), { recursive: true }); fs.writeFileSync(tidPath, JSON.stringify({ at: new Date().toISOString(), t: TID })); };

// amator kulup ayni adli gercek kulup sanilan maclar (kullanici 16 Kas 2026: Marseille-Toulon, Rochefort-Juventus)
const YASAK_MAC = new Set([1647967, 1647983]);
const DOMESTIC_CUPS = new Set(['FAC', 'EFL', 'CDR', 'CIT', 'DFB', 'CDF', 'TUK', 'KNV', 'TDP', 'BCP', 'SFA']);
let skippedCup = 0;
// API kaydi -> uygulama maci (hedef lig degilse veya alt lig kupa maciysa null)
function toMatch(x) {
  const c = ID2C[x.league.id];
  if (!c) return null;
  const hn = teamName(c, x.teams.home.name, x.teams.home.id), an = teamName(c, x.teams.away.name, x.teams.away.id);
  // yerel kupalarin ilk turlari: iki takim da uygulamanin bildigi ust lig takimlarindan degilse alma (2./3. lig istemiyoruz)
  // kullanici karari (15 Kas 2026): yerel kupada takimlardan EN AZ BIRI gercekten ust lig takimiysa goster; yalnizca ad benzerligi
  // (ornegin Rochefort-Juventus: Fransa'daki kucuk Juventus) yetmez -> bilinen takim kimligi API'dekiyle ayni olmali.
  if (DOMESTIC_CUPS.has(c)) {
    const gercek = (n, id) => APP_ALL.includes(n) && !(TID[n] && TID[n] !== id);
    if (!gercek(hn, x.teams.home.id) && !gercek(an, x.teams.away.id)) { skippedCup++; return null; }
  }
  // takim kimligi yalnizca lig/Avrupa maclarindan ogrenilir: yerel kupadaki ayni adli kucuk kulupler (Juventus, Lyon...) kimligi ezmesin
  if (!DOMESTIC_CUPS.has(c)) { tidAdd(hn, x.teams.home.id); tidAdd(an, x.teams.away.id); }
  return {
    id: x.fixture.id, c, t: x.fixture.date.slice(0, 16) + 'Z', h: hn, a: an,
    st: x.fixture.status.short, el: x.fixture.status.elapsed ?? null,
    sc: x.goals.home == null ? null : [x.goals.home, x.goals.away],
    rd: x.league.round || '',
    ...(x.fixture.referee ? { rf: String(x.fixture.referee).replace(/,.*$/, '').trim() } : {}), // hakem (atanmissa; ek istek yok)
    hand: handPairs.has(hn + '|' + an),
  };
}

// ---------- TAKIM MODU (bir kerelik): node tools/fetch-fixtures.mjs --teams [--season=2026] [--leagues=SL,PL]
// Her lig icin 1 istek (/teams?league=&season=). Yalnizca uygulamanin bildigi adlara eslesenler kaydedilir.
if (process.argv.includes('--teams')) {
  const now = new Date();
  const season = +arg('season', now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1);
  const list = String(arg('leagues', 'SL,PL,LL,SA,BL,L1,POR,ERE,BEL,SCO,KSA')).split(',').filter(c => LEAGUES[c]);
  let ok = 0; const miss = [];
  for (const c of list) {
    if (remaining !== null && remaining < 12) { console.log('Kota azaldi, durdu.'); break; }
    try {
      const j = await api('/teams?league=' + LEAGUES[c][0] + '&season=' + season);
      let n = 0;
      for (const r of j.response) { const nm = teamName(c, r.team.name, r.team.id); if (APP_ALL.includes(nm)) { tidAdd(nm, r.team.id); n++; } else miss.push(c + ': ' + r.team.name); }
      ok += n; console.log('  ' + c + ' (' + season + '): ' + j.response.length + ' takim, eslesen ' + n);
    } catch (e) { console.log('  ' + c + ' hata: ' + String(e.message).slice(0, 200)); }
  }
  tidSave();
  console.log('Eslesen toplam ' + ok + ', yeni/degisen ' + tidNew + ', sozlukte ' + Object.keys(TID).length + '. Harcanan istek: ' + used + ', kalan gunluk: ' + remaining);
  if (miss.length) console.log('Eslesmeyen (kaydedilmedi): ' + miss.slice(0, 60).join(' | '));
  process.exit(0);
}

// ---------- CANLI MOD: node tools/fetch-fixtures.mjs --live ----------
// Tek istek (/fixtures?live=all) ile canli maclarin durum/skorunu mevcut latest.json'a isler.
// Canli listeden dusen (bitmis olabilecek) maclar icin ek tek istek (/fixtures?ids=...) ile son durum alinir.
if (process.argv.includes('--live')) {
  const latestPath = path.join(outDir, 'latest.json');
  if (!fs.existsSync(latestPath)) { console.log('latest.json yok: once tam calistir (--live olmadan).'); process.exit(0); }
  const prev = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  // yerel kupada iki takim da ust lig takimi degilse listeden cikar (eski calistirmalardan kalanlar; ayrintilar silinmez)
  { const n0 = prev.m.length; const detM = (() => { try { return JSON.parse(fs.readFileSync(path.join(outDir, 'details.json'), 'utf8').replace(/^﻿/, '')).m || {}; } catch (e) { return {}; } })();
    // yalniz ad degil kimlik de: ayrintida takim kimligi biliniyorsa ids.json'daki gercek kimlikle ayni olmali (ayni adli amator kulupler elenir)
    const gercekK = (n, id) => APP_ALL.includes(n) && !(id && TID[n] && String(TID[n]) !== String(id));
    prev.m = prev.m.filter(m => { if (!DOMESTIC_CUPS.has(m.c)) return true; if (YASAK_MAC.has(m.id)) return false; const d = detM[m.id] || {}; return gercekK(m.h, d.hid) || gercekK(m.a, d.aid); }); if (prev.m.length !== n0 && !DRY) { fs.writeFileSync(latestPath, JSON.stringify(prev)); console.log('Yerel kupa: ust lig olmayan', n0 - prev.m.length, 'mac listeden cikarildi.'); } }
  const LIVE_ST = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT', 'SUSP']);
  const byId = new Map(prev.m.map(m => [m.id, m]));
  const seen = new Set();
  let upd = 0, add = 0;
  // bilinen hicbir mac oynanmiyor ya da 10 dk icinde baslamiyorsa canli istek yapma (kota tasarrufu)
  { const nowMs = Date.now(); const inPlay = prev.m.some(m => { const t = Date.parse(m.t); return nowMs >= t - 10 * 60e3 && nowMs <= t + 170 * 60e3; }); if (!inPlay) { if (!DRY) { prev.at = new Date().toISOString(); fs.writeFileSync(latestPath, JSON.stringify(prev)); } console.log('Canli: simdi oynanan ya da yaklasan bilinen mac yok, istek yapilmadi (veri kontrol edildi, at yenilendi).'); process.exit(0); } }
  const j = await api('/fixtures?live=all&timezone=UTC');
  for (const x of j.response) {
    const m = toMatch(x);
    if (!m) continue;
    seen.add(m.id);
    const old = byId.get(m.id);
    if (old) { Object.assign(old, { st: m.st, el: m.el, sc: m.sc }); upd++; }
    else { prev.m.push(m); byId.set(m.id, m); add++; }
  }
  const stale = prev.m.filter(m => LIVE_ST.has(m.st) && !seen.has(m.id)).slice(0, 20);
  if (stale.length && (remaining === null || remaining > 8)) {
    // ucretsiz plan "ids" parametresine izin vermez: bayat maclarin gunleri icin /fixtures?date= (gun basina 1 istek)
    for (const day of [...new Set(stale.map(m => m.t.slice(0, 10)))]) {
      const k = await api('/fixtures?date=' + day + '&timezone=UTC');
      for (const x of k.response) {
        const old = byId.get(x.fixture.id);
        if (old && stale.includes(old)) { Object.assign(old, { st: x.fixture.status.short, el: x.fixture.status.elapsed ?? null, sc: x.goals.home == null ? null : [x.goals.home, x.goals.away] }); upd++; }
      }
    }
  }
  prev.m.sort((a, b) => a.t.localeCompare(b.t) || a.c.localeCompare(b.c));
  prev.at = new Date().toISOString();
  fs.writeFileSync(latestPath, JSON.stringify(prev));
  finAdd(prev.m);
  tidSave();
  console.log(`Canli: dunya ${j.response.length} canli mac, hedef liglerde guncellenen ${upd}, eklenen ${add}, bayat kontrol ${stale.length}. Harcanan istek: ${used}, kalan gunluk: ${remaining}`);
  process.exit(0);
}

// ---------- ID MODU: node tools/fetch-fixtures.mjs --ids=1528971-1528991 | --ids=1,2,3 ----------
// Tarih penceresi disinda kalan (ucretsiz plan) gecmis maclari tek tek /fixtures?id= ile alip latest.json'a ekler (mac basina 1 istek).
if (process.argv.some(a => a.startsWith('--ids='))) {
  const spec = arg('ids', ''), ids = spec.split(',').flatMap(p => { const [x, y] = p.split('-').map(Number); return y ? Array.from({ length: y - x + 1 }, (_, i) => x + i) : [x]; }).filter(Number.isFinite);
  const latestPath = path.join(outDir, 'latest.json'), prev = JSON.parse(fs.readFileSync(latestPath, 'utf8')), byId = new Map(prev.m.map(m => [m.id, m]));
  let add = 0, upd = 0, other = 0;
  for (const id of ids) {
    if (remaining !== null && remaining <= 12) { console.log('Kota yedege indi, durdu.'); break; }
    const j = await api('/fixtures?id=' + id + '&timezone=UTC'), x = j.response && j.response[0];
    if (!x) continue;
    const m = toMatch(x);
    if (!m) { other++; continue; }
    const old = byId.get(m.id);
    if (old) { Object.assign(old, { st: m.st, el: m.el, sc: m.sc }); upd++; } else { prev.m.push(m); byId.set(m.id, m); add++; }
    console.log(id, m.t, m.h, m.sc ? m.sc.join('-') : '-', m.a, m.st);
  }
  prev.m.sort((a, b) => a.t.localeCompare(b.t) || a.c.localeCompare(b.c)); prev.at = new Date().toISOString();
  fs.writeFileSync(latestPath, JSON.stringify(prev)); finAdd(prev.m); tidSave();
  console.log('Eklenen ' + add + ', guncellenen ' + upd + ', hedef disi ' + other + '. Harcanan istek: ' + used + ', kalan: ' + remaining);
  process.exit(0);
}

const matches = [];
console.log(`Tarih araligi: ${dates[0]} .. ${dates[dates.length - 1]} (${dates.length} istek)`);
for (const d of dates) {
  let j;
  try { j = await api('/fixtures?date=' + d + '&timezone=UTC'); }
  catch (e) {
    if (/do not have access to this date/.test(e.message)) { console.log(`  ${d}: plan bu tarihe izin vermiyor, atlandi (${e.message.slice(e.message.indexOf('{'), e.message.indexOf('{') + 110)}...)`); continue; }
    throw e;
  }
  let n = 0;
  for (const x of j.response) {
    const m = toMatch(x);
    if (!m) continue;
    matches.push(m);
    n++;
  }
  console.log(`  ${d}: dunya ${j.response.length} mac, hedef liglerde ${n}`);
}

// tahminler: yalnizca baslamamis, elle yazili olmayan, onbellekte olmayan maclar; en yakin tarih once
const NOT_STARTED = new Set(['NS', 'TBD']);
const need = matches.filter(m => NOT_STARTED.has(m.st) && !m.hand && !cache[m.id]).sort((a, b) => a.t.localeCompare(b.t));
console.log(`Tahmin gereken mac: ${need.length}, butce: ${maxPred}`);
if (!DRY) {
  for (const m of need.slice(0, maxPred)) {
    if (remaining !== null && remaining < 8) { console.log('Kota azaldi, tahmin cekimi durdu.'); break; }
    try {
      const j = await api('/predictions?fixture=' + m.id);
      const pc = j.response?.[0]?.predictions?.percent;
      if (pc) {
        const v = [pc.home, pc.draw, pc.away].map(s => parseFloat(String(s).replace('%', '')));
        cache[m.id] = v.every(Number.isFinite) && v.reduce((a, b) => a + b, 0) > 0 ? v : null;
      } else cache[m.id] = null;
    } catch (e) { console.log('  tahmin hatasi', m.id, String(e.message).slice(0, 80)); }
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache));
}
// Kaynak sirasi: 1) piyasa beklentisi (details.json: ~10 kaynagin marji cikarilmis ortalamasi), 2) API /predictions.
// API'nin kaba kaliplari (33/33/33, 10/45/45, 0/50/50 vb.) gercek olasilik degil: yok say.
const detOdds = (() => { try { return JSON.parse(fs.readFileSync(path.join(outDir, 'details.json'), 'utf8').replace(/^﻿/, '')).m || {}; } catch (e) { return {}; } })();
const KABA = new Set(['33,33,33', '10,45,45', '0,50,50', '5,45,50', '10,40,50']);
let pPiyasa = 0, pApi = 0;
for (const m of matches) {
  const o = detOdds[m.id]?.odds?.p;
  if (Array.isArray(o) && o.length === 3 && o.every(Number.isFinite) && o.reduce((a, b) => a + b, 0) > 0.9) { m.p = o.map(x => +x.toFixed(4)); m.ps = 'piyasa'; pPiyasa++; continue; }
  let v = cache[m.id];
  if (v && (Math.max(...v) - Math.min(...v) < 1 || KABA.has(v.map(Math.round).sort((a, b) => a - b).join(',')))) v = null;
  if (v) { m.p = v.map(x => +(x / v.reduce((a, b) => a + b, 0)).toFixed(4)); m.ps = 'api'; pApi++; }
}
console.log(`Olasilik kaynagi: piyasa ${pPiyasa}, API ${pApi}`);

matches.sort((a, b) => a.t.localeCompare(b.t) || a.c.localeCompare(b.c));
// "Ligler" sekmesinde arama/acilis icin takma adlar (uygulamadaki LGA gibi)
const LG_ALIASES = {
  FAC: ['FA Cup', 'Ingiltere Kupasi', 'FA Kupasi'], EFL: ['Lig Kupasi', 'EFL Cup', 'League Cup', 'Carabao Cup', 'Ingiltere Lig Kupasi'],
  CDR: ['Copa del Rey', 'Ispanya Kupasi', 'Kral Kupasi'], CIT: ['Coppa Italia', 'Italya Kupasi'],
  DFB: ['DFB-Pokal', 'DFB Pokal', 'Almanya Kupasi', 'Pokal'], CDF: ['Coupe de France', 'Fransa Kupasi'],
  TUK: ['Turkiye Kupasi', 'Turkish Cup', 'Ziraat Turkiye Kupasi'], KNV: ['KNVB Beker', 'Hollanda Kupasi', 'Beker'],
  TDP: ['Taca de Portugal', 'Portekiz Kupasi'], BCP: ['Belcika Kupasi', 'Belgian Cup'], SFA: ['Iskocya Kupasi', 'Scottish Cup'],
  USC: ['UEFA Super Kupa', 'Super Kupa', 'UEFA Super Cup', 'Super Cup'],
  BRA: ['Brezilya Serie A', 'Brezilya Ligi', 'Brasileirao', 'Brezilya'], CBR: ['Brezilya Kupasi', 'Copa do Brasil'],
  ARG: ['Arjantin Ligi', 'Liga Profesional', 'Arjantin'], CAR: ['Arjantin Kupasi', 'Copa Argentina'],
  MLS: ['MLS', 'Major League Soccer', 'ABD Ligi', 'Amerika Ligi'], MX: ['Liga MX', 'Meksika Ligi', 'Meksika'],
};
const meta = Object.fromEntries(Object.entries(LEAGUES).map(([c, v]) => [c, { id: v[0], n: v[1], ln: v[2], col: v[3], al: LG_ALIASES[c] || [] }]));
const out = { at: new Date().toISOString(), from: dates[0], to: dates[dates.length - 1], lg: meta, m: matches };
if (!DRY) fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(out));
finAdd(matches);
tidSave();

// ---------- rapor ----------
const byC = {};
for (const m of matches) { byC[m.c] = byC[m.c] || { n: 0, hand: 0, p: 0 }; byC[m.c].n++; if (m.hand) byC[m.c].hand++; if (m.p) byC[m.c].p++; }
console.log('\nLig        mac  elle-yazili  tahminli');
for (const [c, v] of Object.entries(byC)) console.log(c.padEnd(8), String(v.n).padStart(5), String(v.hand).padStart(10), String(v.p).padStart(9));
console.log('\nToplam mac:', matches.length, '| yeni (elle yazili olmayan):', matches.filter(m => !m.hand).length, '| elenen kupa maci (alt lig):', skippedCup);
for (const k of unmatched.keys()) if (/^(UNL|USC):/.test(k)) console.log('::warning::Milli takim adi Turkceye cevrilemedi: ' + k + ' (tools/fetch-fixtures.mjs NATIONS tablosuna ekle)');
if (unmatched.size) { console.log('\nEslesmeyen takim adlari (API adiyla birakildi):'); for (const [k, v] of unmatched) console.log('  ' + k + (v > 1 ? ' x' + v : '')); }
console.log(`\nHarcanan istek: ${used}, kalan gunluk: ${remaining}`);
fs.mkdirSync(path.join(root, 'tools', 'out'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools', 'out', 'unmatched-teams.txt'), [...unmatched.keys()].join('\n'));
