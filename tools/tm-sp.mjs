// Transfermarkt ayrintili mevki dizini: data/tm/p/*.json (sp alani) -> data/tm/sp.json {tmKimligi: kod}
// Kodlar: GK CB LB RB DM CM AM LM RM LW RW CF SS. Muhtemel 11 dizilimi bunu kullanir (js/pages.js muhtemelKadro).
// Kullanim: node tools/tm-sp.mjs  (data/tm/p yenilenince yeniden calistir)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const KOD = {
  'Goalkeeper': 'GK', 'Centre-Back': 'CB', 'Left-Back': 'LB', 'Right-Back': 'RB',
  'Defensive Midfield': 'DM', 'Central Midfield': 'CM', 'Attacking Midfield': 'AM',
  'Left Midfield': 'LM', 'Right Midfield': 'RM', 'Left Winger': 'LW', 'Right Winger': 'RW',
  'Centre-Forward': 'CF', 'Second Striker': 'SS',
};
const out = {};
for (let i = 0; i < 100; i++) {
  const f = path.join(root, 'data', 'tm', 'p', i + '.json');
  if (!fs.existsSync(f)) continue;
  const o = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const [id, v] of Object.entries(o)) { const k = KOD[v && v.sp]; if (k) out[id] = k; }
}
fs.writeFileSync(path.join(root, 'data', 'tm', 'sp.json'), JSON.stringify(out));
console.log('mevki:', Object.keys(out).length);
