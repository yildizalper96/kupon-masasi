// Transfermarkt kulup adlarini (oyuncu transfer/sezon gecmisi) API-Football takim kimligine esler -> data/tm/clublogo.json { "<TM kulup adi>": apiTeamId }
// Istemci bunu kulup logosu icin kullanir (media.api-sports.io/football/teams/<id>.png).
// Yontem (az istek): /teams?league=<id>&season=2024 ile bir ligin TUM takimlari 1 istekte gelir (data/tm/api-teams.json'da birikir);
// eslesme YEREL yapilir (ad esitligi / ad parcalari). Istek yalnizca lig listesi icin; bulunan ligler tekrar cekilmez.
// Kullanim: node tools/fetch-club-ids.mjs [--max=20] [--reserve=60]   (kota /status ile kontrol edilir; --max=0 yalnizca yerel eslestirme)
import fs from 'node:fs';
import path from 'node:path';
import { pace } from './api-pace.mjs';
const root = path.resolve(import.meta.dirname, '..');
const arg = (k, d) => (process.argv.find(a => a.startsWith('--' + k + '='))?.split('=')[1]) ?? d;
const MAX = +arg('max', 20), RESERVE = +arg('reserve', 60);
const envText = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
const KEY = process.env.API_FOOTBALL_KEY || envText.match(/^\s*API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/m)?.[1];
if (!KEY && MAX > 0) { console.error('HATA: API_FOOTBALL_KEY yok.'); process.exit(1); }
const HOST = 'https://v3.football.api-sports.io';
const nz = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set(['fc', 'cf', 'sc', 'ac', 'as', 'ss', 'sk', 'fk', 'bk', 'afc', 'cd', 'ud', 'sd', 'rcd', 'rc', 'ssc', 'us', 'if', 'ik', 'sv', 'tsv', 'vfb', 'vfl', 'fsv', 'club', 'de', 'the', 'ca', 'cs', 'nk', 'gnk', 'kv', 'ks', 'og', 'ogc', 'sl', 'sp', 'ec', 'esporte', 'clube', 'real', 'sporting']);
const toks = s => nz(s).split(' ').filter(t => t && !STOP.has(t));
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, ''));
// lig kimlikleri (API-Football): buyuk ligler, 2. ligler, Avrupa ve Guney Amerika/Amerika ligleri
const LEAGUES = [39, 140, 135, 78, 61, 203, 88, 94, 144, 179, 307, 40, 41, 141, 136, 79, 62, 204, 71, 128, 253, 262, 218, 207, 119, 113, 103, 197, 235, 333, 345, 106, 210, 286, 283, 172, 271, 244, 357, 318, 373, 332, 169, 98, 292, 188, 72, 129, 239, 265, 281, 242, 274, 218, 145, 180, 80, 63, 142, 137, 89, 95, 85, 164, 244, 106, 107, 342, 203, 553];
const apiPath = path.join(root, 'data/tm/api-teams.json');
const AT = fs.existsSync(apiPath) ? rd(apiPath) : {}; // { "<ligId>": [[takimId, ad],...] }

if (MAX > 0) {
  const st = await fetch(HOST + '/status', { headers: { 'x-apisports-key': KEY } }).then(r => r.json()).catch(() => null);
  const rq = st?.response?.requests; let remaining = rq && Number.isFinite(rq.limit_day) ? rq.limit_day - rq.current : null;
  console.log(`Kota: ${remaining ?? '?'} kaldi; en cok ${MAX} istek, ${RESERVE} yedek.`);
  let used = 0, lastReq = 0, gapMs = 7000;
  // once 2024 sezonu (guncel kulupler), sonra eski sezonlardan dusenler/yukselenler: Turk ligi (Giresunspor, Altay, Istanbulspor...) ve buyuk ligler
  const EXTRA = [[203, 2022], [204, 2024], [204, 2022], [203, 2020], [39, 2020], [140, 2020], [135, 2020], [78, 2020], [61, 2020], [40, 2022], [141, 2022], [136, 2022], [79, 2022], [62, 2022]];
  // ek ligler (23 Kas 2026): data/tm/api-leagues.json (/leagues listesinden kadin/genc/amator haric, 2024 sezonu olan tum ligler)
  let EXTRA_L = []; try { EXTRA_L = rd(path.join(root, 'data/tm/api-leagues.json')).l.map(x => x[0]); } catch (e) { }
  const JOBS = [...new Set(LEAGUES)].map(l => [l, 2024, String(l)]).concat(EXTRA.map(([l, s]) => [l, s, `${l}-${s}`])).concat(EXTRA_L.filter(l => !LEAGUES.includes(l)).map(l => [l, 2024, String(l)]));
  for (const [lg, season, key] of JOBS) {
    if (AT[key]) continue; if (used >= MAX || (remaining === null ? 0 : remaining) - used <= RESERVE) break;
    const wait = lastReq + gapMs - Date.now(); if (lastReq && wait > 0) await new Promise(r => setTimeout(r, wait)); lastReq = Date.now();
    await pace(); const r = await fetch(`${HOST}/teams?league=${lg}&season=${season}`, { headers: { 'x-apisports-key': KEY } }); const pm = Number(r.headers.get('x-ratelimit-limit')); if (pm > 0) gapMs = Math.ceil(60000 / pm) + 500;
    used++; const j = await r.json(); const er = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors));
    if (er && er.length) { console.log('lig', lg, 'hata:', JSON.stringify(j.errors).slice(0, 80)); if (/rate|limit|token|request/i.test(JSON.stringify(j.errors))) break; AT[key] = []; continue; }
    AT[key] = (j.response || []).filter(x => x.team && !x.team.national).map(x => [x.team.id, x.team.name]);
    console.log('lig', key, AT[key].length, 'takim');
  }
  fs.mkdirSync(path.dirname(apiPath), { recursive: true }); fs.writeFileSync(apiPath, JSON.stringify(AT));
  console.log('Harcanan istek:', used);
}

// ---- yerel eslestirme: TM kulup adi -> API takim kimligi ----
// fazla sozcuk izinleri (kucuk harf, nz sonrasi)
const EK = new Set(['u15','u16','u17','u18','u19','u20','u21','u23','yth','youth','you','yout','yo','yt','y','jugend','jgd','jeugd','jong','ii','iii','b','c','reserves','reserve','res','academy','akademi','aca','acad','primavera','sub','juniors','junior','losc','kaa','krc','kas','aj','sm','stade','royal','calcio','gf','ff','il','sco','mfk','msk','ea','olympique','fco','lb','af','usl','ns','kf','pas','rkc','jc','r','g','e','d']);
const EK_OK = w => EK.has(w) || /^(u|sub|s|y)?\d{2}$/.test(w) || /^\d+$/.test(w);
// API'nin yedek/kadin/altyapi takimlari ("Rosenborg II", "Urawa Reds W", "Rubin Kazan 2", "Fulham U21") ana takim adlarina baglanmaz;
// altyapi TM adlari asagida ana kulubun logosunu alir. Adi yalnizca ek sozcuklerden olusan kayitlar ("II") da atilir.
const SEC = /\b(ii|iii|b|w|women|res|reserves|u ?\d\d|2)$/;
const api = []; const HAM = []; const apiAdd = (id, name) => HAM.push({ id, name, n: nz(name), t: toks(name) });
for (const [lg, a] of Object.entries(AT)) for (const [id, name] of a) apiAdd(id, name);
try { const ids = rd(path.join(root, 'data/teams/ids.json')).t || {}; for (const [name, id] of Object.entries(ids)) apiAdd(id, name); } catch (e) { }
{ const anaAd = new Set(HAM.map(a => a.n)); for (const a of HAM) { if (!a.t.length || a.t.every(w => /^(ii|iii|b|c|w|u?\d+)$/.test(w))) continue; if (SEC.test(a.n) && anaAd.has(a.n.replace(SEC, '').trim())) continue; if (/\b(w|women|u ?\d\d)$/.test(a.n)) continue; a.tn = a.t.filter(w => !/^\d+$/.test(w)); api.push(a); } }
const byN = new Map(); for (const a of api) (byN.get(a.n) || byN.set(a.n, new Set()).get(a.n)).add(a.id);
const names = new Set();
for (const f of fs.readdirSync(path.join(root, 'data/tm/p'))) { const o = rd(path.join(root, 'data/tm/p', f)); for (const p of Object.values(o)) for (const t of p.tr || []) { names.add(t[1]); names.add(t[2]); } }
try { for (const n of Object.values(rd(path.join(root, 'data/tm/club-names.json')))) names.add(n); } catch (e) { }
// onceki eslesmeler (23 Kas 2026): birden cok aday kalirsa eski kimlik secilir; hic aday yoksa eski kimlik ancak ad uyumu (uyum) gecerse korunur.
let OLD = {}; try { OLD = rd(path.join(root, 'data/tm/clublogo.json')); } catch (e) { }
const AL = { man: 'manchester', utd: 'united', 'nott m': 'nottingham', wolves: 'wolverhampton', sheff: 'sheffield', 'm tel aviv': 'maccabi tel aviv' };
const alTok = n => { let nn = ' ' + n + ' '; for (const [a, b] of Object.entries(AL)) nn = nn.replace(new RegExp(' ' + a + ' ', 'g'), ' ' + b + ' '); return toks(nn); };
for (const a of api) a.tn = alTok(a.n).filter(w => !/^\d+$/.test(w)); // API tarafinda da kisaltma acilir ("Sheffield Utd" ~ "Sheffield United")
// ad parcalari altkumesi: API adi TM adinin icindeyse TM'deki FAZLA sozcuk, API adi TEK sozcukse yalnizca EK_OK olabilir ('Inter Bratislava' -> Inter,
// 'Paris SG' -> Paris FC, 'Dundee United' -> Dundee, 'Arsenal Tula' -> Arsenal yanlis); cok sozcuklu API adlarinda serbest (Bayern Munich, Rubin Kazan).
// Tek sozcuklu API adinda fazla sozcuge yalnizca TM adi o sozcukle basliyorsa ("Leeds United", "Rubin Kazan", "Urawa Reds") ya da resmi uzun adsa
// (3+ parca: "ACF Fiorentina", "Willem II Tilburg") izin verilir; baska kulupte de gecen genel adlarda hic izin yok.
const GENEL = new Set(['cp', 'bayern', 'inter', 'internacional', 'arsenal', 'aris', 'paris', 'dundee', 'juventus', 'racing', 'akron', 'sydney', 'dynamo', 'dinamo', 'lincoln', 'union', 'rangers', 'athletic', 'america', 'galaxy', 'wanderers', 'town', 'madrid', 'roma', 'zurich', 'salzburg', 'celtic', 'olympic', 'olympique', 'nacional', 'independiente', 'universidad', 'deportivo', 'atletico', 'ael', 'olimpia', 'liverpool', 'everton', 'santos', 'corinthians', 'lyon', 'porto', 'riga', 'aalborg', 'kharkiv', 'moscow', 'kyiv', 'ararat', 'levante', 'torino', 'milan', 'city', 'united', 'vitoria', 'botafogo', 'nautico', 'america', 'guarani', 'cerro', 'alianza', 'rapid', 'admira', 'kf', 'kosova', 'sporting', 'national', 'victoria', 'unirea', 'dacia', 'metalist', 'spartak', 'torpedo', 'slavia', 'sparta', 'vardar', 'apollon', 'omonia', 'anorthosis', 'hapoel', 'maccabi', 'beitar', 'bnei', 'ironi']);
// fazla sozcuk: ilk parca API adiysa en cok 1 fazla sozcuk ("Leeds United"; "Oslo FA Dakar" olmaz); 2-3 harfli kisaltmalar yalnizca ONDE ve noktasiz ("ACF Fiorentina"; "Din. Minsk" olmaz)
const tekOk = (u, nt, name) => { if (GENEL.has(u)) return false; if (nt.every(w => w === u || EK_OK(w))) return true;
  const dot = new Set((String(name).match(/[^\s.]+\./g) || []).map(x => nz(x))); const ui = nt.indexOf(u), fz = nt.filter(w => w !== u && !EK_OK(w));
  if (fz.some(w => w.length < 2)) return false;
  if (fz.every(w => w.length <= 3 && nt.indexOf(w) < ui && !dot.has(w))) return true;
  return (ui === 0 && fz.length === 1) || nt.length >= 3 && fz.length >= 2 && !fz.some(w => dot.has(w)); };
const altKume = (a, nt) => a.tn.length > 0 && nt.some(w => !EK_OK(w)) && ((a.tn.every(w => nt.includes(w)) && (a.tn.length > 1 || tekOk(a.tn[0], nt, NAME))) || nt.every(w => a.tn.includes(w)));
// kisaltmali TM adlari: "Arm. Bielefeld", "1.FC K'lautern", "Dep. La Coruña", "Sheff Wed". Genc/B/2 ve yil iceren adlar (Hajduk 1912, 1461 Trabzon) atlanir;
// en az 2 parca; on ek yalnizca noktali kisaltmada ya da 3-5 harfte; son ek yalnizca tek harften sonra ("K'lautern").
const kisaTok = name => { const raw = nz(name.replace(/\b(\d+)\.(?=\S)/g, '$1 ').replace(/\./g, ' DOT ')).split(' '); const tm = []; for (let i = 0; i < raw.length; i++) { const t = raw[i]; if (!t || t === 'dot' || STOP.has(t) || /^\d+$/.test(t)) continue; tm.push({ t, dot: raw[i + 1] === 'dot', after1: tm.length > 0 && tm[tm.length - 1].t.length === 1 }); } return tm; };
const kisaEq = (o, u) => u === o.t || ((o.dot || o.t.length <= 5) && o.t.length >= 3 && u.startsWith(o.t)) || (o.after1 && o.t.length >= 5 && u.endsWith(o.t)) || (o.t.length === 1 && u[0] === o.t);
const kisaUy = (name, tm) => !/\b(ii|iii|b|2|u ?\d\d|youth|yth|jgd|reserves?)\.?$/i.test(name) && !/\b\d{4}\b/.test(name) && tm.length >= 2 && tm.some(o => o.t.length >= 4);
const kisaAday = (a, tm) => tm.every(o => a.t.some(u => kisaEq(o, u)));
const sec = (s, name) => { if (s.size === 1) return [...s][0]; if (s.size > 1 && OLD[name] && s.has(+OLD[name])) return +OLD[name]; return null; };
const uyum = (name, id) => { NAME = name; const n = nz(name), nt = alTok(n), tm = kisaTok(name); return api.some(a => +a.id === +id && (a.n === n || altKume(a, nt) || (a.tn.length > 0 && a.tn.every(w => nt.includes(w)) && !a.tn.some(w => GENEL.has(w))) || (kisaUy(name, tm) && kisaAday(a, tm)))); };
let NAME = '';
const out = {}; let hit = 0, eskiKoru = 0, eskiAt = 0;
for (const name of names) { NAME = name;
  if (!name || /^(Unknown|Retired|Without Club|Career break)$/i.test(name)) continue;
  const n = nz(name); let id = null;
  const ex = byN.get(n); if (ex) id = sec(ex, name);
  if (!id) { const nt = toks(name); if (nt.length) { const c = api.filter(a => a.t.length === nt.length && a.t.every(w => nt.includes(w))); id = sec(new Set(c.map(x => x.id)), name); } }
  if (!id) { const nt = alTok(n); if (nt.length) id = sec(new Set(api.filter(a => altKume(a, nt)).map(x => x.id)), name); }
  if (!id) { const tm = kisaTok(name); if (kisaUy(name, tm)) { const c = api.filter(a => kisaAday(a, tm)); let s = new Set(c.map(x => x.id)); if (s.size > 1) { const s2 = new Set(c.filter(a => a.t.every(u => tm.some(o => kisaEq(o, u)))).map(x => x.id)); if (s2.size === 1) s = s2; } id = sec(s, name); } }
  if (!id && OLD[name]) { if (uyum(name, OLD[name])) { id = +OLD[name]; eskiKoru++; } else eskiAt++; }
  if (id) { out[name] = +id; hit++; }
}
console.log(`onceki eslesme: ${eskiKoru} korundu, ${eskiAt} ad uyumsuz diye atildi (altyapi adlari asagida ana kulube yeniden baglanabilir)`);
// elle girilen kimlikler (data/tm/clublogo-elle.json, kullanici karari 15 Kas 2026): ustune yazar. API lig listelerinde (api-teams.json)
// o kimlik varsa ve adiyla hic ortak parca yoksa YANLIS sayilip atilir (yanlis logo, eksik logodan kotudur).
try {
  const man = rd(path.join(root, 'data/tm/clublogo-elle.json')); const idName = new Map(api.map(a => [String(a.id), a])); let ok = 0, bad = 0, unv = 0;
  for (const [name, id] of Object.entries(man)) {
    const a = idName.get(String(id));
    if (a) { const nt = toks(name), at = a.t; const pre = (x, y) => { let i = 0; while (i < x.length && i < y.length && x[i] === y[i]) i++; return i; }; // ortak on ek >=4 harf: Rennes~Rennais, M'gladbach~Mönchengladbach (iceren parca)
    const A = nz(a.name).split(' ').filter(w => w.length >= 4), B = nz(name).split(' ').filter(w => w.length >= 4);
    const share = /^[A-Z]{2,5}$/.test(a.name) || nt.some(w => at.includes(w)) || A.some(x => B.some(y => pre(x, y) >= 4 || (x.length >= 5 && y.includes(x)) || (y.length >= 5 && x.includes(y)))); if (!share) { console.log('UYARI elle kimlik reddedildi:', name, id, '(API adi:', a.name + ')'); bad++; continue; } ok++; } else unv++;
    out[name] = +id;
  }
  console.log(`elle: ${Object.keys(man).length} kayit, dogrulanan ${ok}, henuz dogrulanamayan ${unv}, reddedilen ${bad}`);
} catch (e) { }
// genclik/B/yedek takimlari ana kulubun kimligine baglanir ("Sporting U19", "Man City U23", "Barça Youth", "Sporting B"): ek soyulur, ana kulup adi (birebir) out'ta aranir.
{
  const YS = /(\s+(U\.? ?\d{2}|Sub-?\d{2}|[SY]\d{2}|Youth|Yth\.?|Yout|You|Yo|Yt|Y\.?|Juniors?|Jun\.?|Jgd\.?|Jugend|Jeugd|Reserves?|Res\.?|Reser\.?|Primavera|Giovanili|Giov\.?|Gio\.?|Academy|Akademi|Acad\.?|Aca\.?|Form\.?|For\.?|Prom|CJ|II|III|B|C|Next))+$/i;
  const idx = new Map(); for (const [k, v] of Object.entries(out)) { const z = nz(k); if (!idx.has(z)) idx.set(z, v); } { const apiN = new Map(); for (const a of api) (apiN.get(a.n) || apiN.set(a.n, new Set()).get(a.n)).add(+a.id); for (const [z, s] of apiN) if (!idx.has(z) && s.size === 1) idx.set(z, [...s][0]); } // API'de ayni adli birden cok kulup (Progresso x3) varsa ad kullanilmaz
  const AL = { 'Barça': 'Barcelona', 'Bilbao': 'Athletic Club', 'W. Bremen': 'Werder Bremen', 'B. München': 'Bayern Munich', 'Din. Zagreb': 'Dinamo Zagreb', 'D. Zagreb': 'Dinamo Zagreb', 'Palace': 'Crystal Palace', 'Spurs': 'Tottenham', 'Stmk.-Sturm': 'Sturm Graz', 'Nordsjaell.': 'Nordsjælland', 'Sporting CP': 'Sporting', 'Vikt. Plzen': 'Viktoria Plzeň', 'Hajduk': 'Hajduk Split', 'FCK': 'FC Copenhagen', 'HSV': 'Hamburger SV', 'Boro': 'Middlesbrough', 'Sparta': 'Sparta Prague', 'AKA Salzb.': 'Red Bull Salzburg', 'BSC YB': 'Young Boys', 'AZ': 'AZ Alkmaar', 'Red Star': 'Crvena Zvezda', 'Legia': 'Legia Warszawa', 'Lech': 'Lech Poznań', 'RM Castilla': 'Real Madrid', 'RM Castilla': 'Real Madrid', 'Atl. Madrileño': 'Atletico Madrid',
    // 23 Kas 2026: TM kisaltmalari (ana adi GENEL olan kuluplerde yanlis takima gitmesin diye acik yazildi)
    'Bayern': 'Bayern Munich', 'B. Munich': 'Bayern Munich', 'Atl. Madrid': 'Atletico Madrid', 'Atl.Madleño': 'Atletico Madrid', 'Atl. Madleño': 'Atletico Madrid', 'Barca': 'Barcelona', 'Olymp. Lyon': 'Lyon', 'Ol. Lyon': 'Lyon', 'Oly. Lyon': 'Lyon',
    'Athletico': 'Atletico Paranaense', 'Athletico-PR': 'Atletico Paranaense', 'Atlético-PR': 'Atletico Paranaense', "K'lautern": 'Kaiserslautern', 'Huddersf.': 'Huddersfield', 'Nottingham': 'Nottingham Forest',
    'Braunschw.': 'Eintracht Braunschweig', 'Gr. Fürth': 'Greuther Fürth', 'D. Dresden': 'Dynamo Dresden', 'E. Cottbus': 'Energie Cottbus', 'U. Berlin': 'Union Berlin', "U'haching": 'Unterhaching',
    'Pr. Münster': 'Preussen Münster', 'St. Kickers': 'Stuttgarter Kickers', 'RW Erfurt': 'Rot-Weiss Erfurt', 'Hamilton A.': 'Hamilton', "Queen's P.": "Queen's Park", 'Hradec Kr.': 'Hradec Kralove',
    'P. Ferreira': 'Pacos Ferreira', 'G.Birligi': 'Genclerbirligi', 'Zbroj. Brno': 'Zbrojovka Brno', 'St-Étienne': 'Saint Etienne', 'Go Ahead': 'Go Ahead Eagles', 'TSV 1860': '1860 München', 'Whitecaps': 'Vancouver Whitecaps' };
  // eski kaydi ezen kisaltmalar (yalnizca kesin olanlar; 'Red Star' Paris/Belgrad belirsiz oldugu icin yok)
  const AL_EZ = new Set(['B. München', 'B. Munich', 'Bayern']);
  // B takimi olarak ayri adla gecenler
  const BT = { 'Barça Atlètic': 'Barcelona', 'Barça Atletic': 'Barcelona', 'Bilbao Athletic': 'Athletic Club', 'Atl. Madrileño': 'Atletico Madrid', 'Sevilla Atl.': 'Sevilla', 'Las Palmas Atl.': 'Las Palmas', 'Celta Fortuna': 'Celta Vigo', 'Oviedo Vetusta': 'Oviedo', 'Elche Ilicitano': 'Elche', 'Milan Futuro': 'AC Milan', 'Lugo Polvorín': 'Lugo', 'Atl. Levante': 'Levante', 'Atl. Albacete': 'Albacete' };
  for (const [k, v] of Object.entries(BT)) if (names.has(k) && !out[k]) { const id = idx.get(nz(v)); if (id) out[k] = +id; }
  // kisaltma: ayni sayida sozcuk, her sozcuk ana addakiyle ayni ya da onun >=3 harflik on eki ('Atl. Madrid' ~ 'Atletico Madrid'); tek kimlik cikmali
  const ana = Object.entries(out).filter(([k]) => !YS.test(k)).map(([k, v]) => [toks(k), v]);
  // yalnizca gercek kisaltmada (adda nokta var: 'Huddersf.', 'Gr. Fürth'); 'Levadia' ~ 'Levadiakos', 'CA Unión' ~ 'Unionistas' gibi tam sozcukler eslenmez
  const kisa = b => { const bt = toks(b); if (!bt.length || !/\./.test(b) || (bt.length === 1 && bt[0].length < 5)) return null; const ids = new Set(); for (const [t, v] of ana) if (t.length === bt.length && bt.every((w, i) => w === t[i] || (w.length >= 3 && t[i].startsWith(w))) && bt.some((w, i) => w !== t[i])) ids.add(+v); return ids.size === 1 ? [...ids][0] : null; };
  let yh = 0;
  for (const name of names) {
    if (!name || !(YS.test(name) || name === 'RM Castilla')) continue;
    const base = name.replace(YS, '').trim().replace(/^RM Castilla$/, 'Real Madrid');
    // kisaltma tablosundaki ana ad eski (OLD) kaydi gecersiz kilar: 'B. München Yth.' 1860'a degil Bayern'e
    const alId = AL[base] && idx.get(nz(AL[base]));
    if (out[name] && !(alId && AL_EZ.has(base))) continue;
    const id = alId || out[base] || idx.get(nz(base)) || kisa(base);
    if (id && out[name] === +id) continue;
    if (id) { out[name] = +id; yh++; }
  }
  console.log('genclik/B takimi ana kulube baglandi:', yh);
  // bilinen yanlislar (ayni sehrin baska kulubu; yanlis logo eksik logodan kotudur) - altyapilariyla birlikte silinir
  const YANLIS = ['RW Frankfurt', 'RW Frankf.', 'FSV Frankfurt', 'FSV Frankf.', 'Freib. FC', 'Freiburger FC', 'Progresso Gio.'];
  for (const k of Object.keys(out)) { const b = k.replace(YS, '').trim(); if (YANLIS.includes(k) || YANLIS.includes(b)) delete out[k]; }
}
fs.writeFileSync(path.join(root, 'data/tm/clublogo.json'), JSON.stringify(out));
console.log(`TM kulup adi ${names.size}, API takim kaydi ${api.length}, eslesen ${hit}`);
