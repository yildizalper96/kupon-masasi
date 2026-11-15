// Tek seferlik: logosuz takimlarin kimligini API-Football'dan alip data/teams/ids.json'a ekler.
// Kullanim: node tools/add-team-ids.mjs   (yaklasik 7 istek; kalan kota < 30 ise calismaz)
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const env = fs.readFileSync(path.join(root, '.env'), 'utf8');
const KEY = env.match(/API_FOOTBALL_KEY\s*=\s*["']?([^"'\r\n]+)/)[1];
const HOST = 'https://v3.football.api-sports.io';
const api = async p => { const j = await (await fetch(HOST + p, { headers: { 'x-apisports-key': KEY } })).json(); const e = j.errors && (Array.isArray(j.errors) ? j.errors : Object.values(j.errors)); if (e && e.length) throw new Error(p + ' ' + JSON.stringify(j.errors)); return j.response; };
const st = await api('/status'); if (st.requests.limit_day - st.requests.current < 30) { console.log('Kota yetersiz'); process.exit(0); }
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ø/gi, 'o').replace(/æ/gi, 'ae').replace(/ł/gi, 'l').replace(/[^a-z0-9]/gi, '').toLowerCase();
// uygulama adi -> aranacak API adlari (normalize)
const WANT = { 'Diriyah': ['diriyah'], 'Le Mans': ['lemans'], 'Viking': ['viking', 'vikingfk'], 'Ferencváros': ['ferencvaros', 'ferencvarosi'], 'Lech Poznań': ['lechpoznan'], 'Levski Sofia': ['levskisofia', 'pfclevski'], 'Lillestrøm': ['lillestrom'], 'OFI Crete': ['oficrete', 'ofi'], 'Olympiacos': ['olympiacos', 'olympiakos', 'olympiacospiraeus'], 'Aarhus': ['aarhus', 'agf', 'aarhusagf'], 'CSKA Sofia': ['cskasofia'], 'Jablonec': ['jablonec', 'fkjablonec'], 'Kairat Almaty': ['kairatalmaty', 'kairat'], 'Kauno Žalgiris': ['kaunozalgiris'], 'Mjällby': ['mjallby', 'mjallbyaif'], 'Nordsjælland': ['nordsjaelland', 'fcnordsjaelland'], 'Riga': ['rigafc', 'riga'], 'Thun': ['thun', 'fcthun'], 'Excelsior': ['excelsior'], 'Falkirk': ['falkirk'] };
const calls = ['/teams?league=2&season=2024', '/teams?league=3&season=2024', '/teams?league=848&season=2024', '/teams?league=62&season=2024', '/teams?league=89&season=2024', '/teams?league=180&season=2024', '/teams?league=308&season=2025'];
const pool = [];
for (const c of calls) { try { pool.push(...(await api(c))); } catch (e) { console.log('HATA', e.message.slice(0, 100)); } await new Promise(r => setTimeout(r, 7000)); }
const f = path.join(root, 'data/teams/ids.json'); const J = JSON.parse(fs.readFileSync(f, 'utf8'));
const added = [], still = [];
for (const [nm, keys] of Object.entries(WANT)) {
  if (J.t[nm]) continue;
  const hit = pool.find(x => keys.includes(norm(x.team.name)));
  if (hit) { J.t[nm] = hit.team.id; added.push(`${nm}=${hit.team.name}(${hit.team.id})`); } else still.push(nm);
}
J.at = new Date().toISOString();
fs.writeFileSync(f, JSON.stringify(J));
console.log('Eklendi:', added.join('; ') || '-'); console.log('Bulunamadi:', still.join(', ') || '-');
