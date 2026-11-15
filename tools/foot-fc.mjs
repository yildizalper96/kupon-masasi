// Oyuncu boyu ve tercih edilen ayak: indirilen oyuncu CSV'sinden (EA FC verisi) data/players/foot.json uretir. API istegi HARCAMAZ.
// Kullanim: node tools/foot-fc.mjs "C:\yol\fc27-players.csv"   (CSV depoya KONMAZ; yalnizca kucuk foot.json yayinlanir)
// Cikti: data/players/foot.json { "<API-Football oyuncu kimligi>": { f:"right"|"left", h:<cm> } }  + data/players/foot-belirsiz.txt (yerel, git'e girmez)
// Eslestirme: "M. Akanji" -> ad bas harfi + soyad; tam ad -> birebir. Tek aday (ayni ayak/boy) ise yazilir, farkli adaylar varsa YAZILMAZ ve listelenir.
import fs from 'node:fs';
const nz = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
function csv(t) { const rows = []; let r = [], f = '', q = false; for (let i = 0; i < t.length; i++) { const c = t[i]; if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === ',') { r.push(f); f = ''; } else if (c === '\n') { r.push(f.replace(/\r$/, '')); rows.push(r); r = []; f = ''; } else f += c; } if (f || r.length) { r.push(f); rows.push(r); } return rows; }
const file = process.argv[2]; if (!file) { console.error('CSV yolu gerekli'); process.exit(1); }
const rows = csv(fs.readFileSync(file, 'utf8')); const H = rows[0]; const ix = k => H.indexOf(k);
const D = rows.slice(1).filter(r => r.length > 20).map(r => ({ nm: r[ix('full_name')].split(',').reverse().join(' ').trim(), n: nz(r[ix('full_name')].split(',').reverse().join(' ')), cn: nz(r[ix('common_name')]), ln: nz(r[ix('last_name')]), fn: nz(r[ix('first_name')]), club: r[ix('club_name')], h: +r[ix('height')], foot: /^left/i.test(r[ix('foot')]) ? 'left' : /^right/i.test(r[ix('foot')]) ? 'right' : null })).filter(d => d.foot || d.h);

const P = {}; const add = (id, n) => { if (id && n && !P[id]) P[id] = n; };
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
try { for (const [id, v] of Object.entries(rd('data/players/season.json').p || {})) add(id, v.n); } catch (e) { }
try {
  const d = rd('data/fixtures/details.json');
  for (const s of Object.values(d.sq || {})) for (const p of s.p || []) add(p.id, p.n);
  for (const m of Object.values(d.m || {})) for (const t of ['h', 'a']) for (const p of [...((m.luRaw || {})[t]?.xi || []), ...((m.luRaw || {})[t]?.bn || [])]) add(p.id, p.n);
} catch (e) { }

const out = {}; const bel = []; let yok = 0;
for (const [id, name] of Object.entries(P)) {
  const n = nz(name); if (!n) continue;
  const ab = /^[A-Za-zÀ-ž]\.\s/.test(name), m = n.match(/^([a-z]) (.+)$/);
  const c = D.filter(x => ab && m ? (x.fn[0] === m[1] && (x.ln === m[2] || x.n.endsWith(' ' + m[2]) || x.cn === n || x.cn.endsWith(' ' + m[2]))) : (x.n === n || x.cn === n));
  if (!c.length) { yok++; continue; }
  const set = new Set(c.map(x => x.foot + '|' + x.h));
  if (set.size === 1) { const x = c[0]; const o = {}; if (x.foot) o.f = x.foot; if (x.h > 0) o.h = x.h; out[id] = o; }
  else bel.push(`${name} (id ${id}): ` + c.map(x => `${x.nm} [${x.club}] ${x.foot || '?'} ${x.h || '?'} cm`).join('  |  '));
}
try { Object.assign(out, JSON.parse(fs.readFileSync('data/players/foot-elle.json', 'utf8'))); } catch (e) { } // elle dogrulanan belirsizler (kullanici karari)
fs.writeFileSync('data/players/foot.json', JSON.stringify(out));
fs.writeFileSync('data/players/foot-belirsiz.txt', bel.join('\n'));
console.log(`Oyuncu: ${Object.keys(P).length}, yazilan: ${Object.keys(out).length}, belirsiz: ${bel.length}, bulunamayan: ${yok}`);
