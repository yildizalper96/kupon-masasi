// Super Lig (ve genel) eksik TM verisi doldurma; API istegi HARCAMAZ. Kullanim: node tools/sl-doldur.mjs "<tm csv klasoru>"
//  1) teammap: yanlis eslesme (Corum -> Eyupspor kimligi) silinir  2) clubs.json: kadro degeri (oyuncu piyasa degerleri toplami)
//  3) foot-ad/SL.json: eksik uyruk (Turkce ad tablosu)
import fs from 'node:fs';
const dir = process.argv[2]; if (!dir) { console.error('klasor gerekli'); process.exit(1); }
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
const csv = l => { const a = []; let f = '', q = false; for (const c of l) { if (q) { if (c === '"') q = false; else f += c; } else if (c === '"') q = true; else if (c === ',') { a.push(f); f = ''; } else f += c; } a.push(f); return a; };
const TR = { Brazil: 'Brezilya', Egypt: 'Mısır', Senegal: 'Senegal', Mali: 'Mali', Gabon: 'Gabon', 'DR Congo': 'Kongo DC', 'The Gambia': 'Gambiya', Tunisia: 'Tunus', Cameroon: 'Kamerun', Morocco: 'Fas', Suriname: 'Surinam', 'Korea, South': 'Güney Kore', Nigeria: 'Nijerya', Uruguay: 'Uruguay', Colombia: 'Kolombiya', Congo: 'Kongo', Madagascar: 'Madagaskar', Curacao: 'Curaçao', Panama: 'Panama', "Cote d'Ivoire": 'Fildişi Sahili', Uzbekistan: 'Özbekistan', Ghana: 'Gana', Venezuela: 'Venezuela', Honduras: 'Honduras', Angola: 'Angola', Guinea: 'Gine', Chad: 'Çad', Russia: 'Rusya', Tanzania: 'Tanzanya', Benin: 'Benin', 'Guinea-Bissau': 'Gine-Bissau', Comoros: 'Komorlar', 'Cape Verde': 'Yeşil Burun Adaları', 'United Arab Emirates': 'BAE', Liberia: 'Liberya' };
// teammap
const tmf = 'data/tm/teammap.json', tmap = rd(tmf);
if (tmap['SL|Çorum'] === '7160' && tmap['SL|Eyüpspor'] === '7160') { delete tmap['SL|Çorum']; fs.writeFileSync(tmf, JSON.stringify(tmap)); console.log('Corum eslesmesi silindi'); }
// oyuncular
const L = fs.readFileSync(`${dir}/players.csv`, 'utf8').split('\n'); const H = csv(L[0]); const I = k => H.indexOf(k);
const sum = {}, cit = {};
for (let i = 1; i < L.length; i++) { if (!L[i]) continue; const a = csv(L[i]); cit[a[I('player_id')]] = a[I('country_of_citizenship')];
  if (+a[I('last_season')] >= 2025 && a[I('current_club_id')]) sum[a[I('current_club_id')]] = (sum[a[I('current_club_id')]] || 0) + (+a[I('market_value_in_eur')] || 0); }
const cf = 'data/tm/clubs.json', clubs = rd(cf); let nm = 0;
for (const [id, c] of Object.entries(clubs)) if (!c.mv && sum[id] > 0) { c.mv = sum[id]; nm++; }
fs.writeFileSync(cf, JSON.stringify(clubs)); console.log('kadro degeri yazilan kulup', nm);
const sf = 'data/players/foot-ad/SL.json', SL = rd(sf); let nn = 0, yok = new Set();
for (const o of Object.values(SL)) if (!o.n && o.t) { const c = cit[String(o.t)]; if (TR[c]) { o.n = TR[c]; nn++; } else if (c) yok.add(c); }
fs.writeFileSync(sf, JSON.stringify(SL)); console.log('uyruk eklenen', nn, 'tabloda olmayan', [...yok]);
