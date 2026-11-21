// Biten maclari sezon kaydina ekler (API istegi YOK). yerel-guncelle ve GitHub akisi her calismada cagirir.
// Neden: lig puan tablosu, form ve son maclar istemcide js/app.js'teki sabit sezon verisi + data/history/all.json'dan
// hesaplaniyor; bu dosyayi guncelleyen otomatik adim yoktu (10 Kas 2026'dan beri elle). Bu betik
//   - lig maclari (app.js'te tablosu olan ligler) -> data/history/all.json  h satiri "LIG|ev|dep|x|y|gg.aa.yyyy"
//   - Sampiyonlar Ligi -> data/results/latest.json cl satiri "gg.aa|ev|dep|x|y" (istemci addCL)
//   - Avrupa Ligi / Konferans Ligi -> data/results/latest.json eu {EL:"ev|dep|x|y\n..."} (istemci addEU)
// Kaynak: data/fixtures/finished.json + latest.json (FT/AET/PEN). Takim adlari uygulamadaki adlara cevrilir
// (data/teams/ids.json'da ayni kimlik: "Amed" -> "Amedspor"). Ayni mac iki kez eklenmez (app.js ve kayitlarda varsa atlanir).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => { try { return JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')); } catch { return null; } };
const wr = (f, o) => { const p = path.join(root, f); fs.writeFileSync(p + '.tmp', JSON.stringify(o)); fs.renameSync(p + '.tmp', p); };
const FIN = new Set(['FT', 'AET', 'PEN']);

export function sonucEkle(log = []) {
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const ids = (rd('data/teams/ids.json') || {}).t || {};
  const idAd = {}; for (const [n, id] of Object.entries(ids)) (idAd[id] = idAd[id] || []).push(n);
  const hist = rd('data/history/all.json') || { h: '' }, res = rd('data/results/latest.json');
  const hSat = String(hist.h || '').split('\n').filter(Boolean);

  // uygulamadaki adlar: lig tablosu satiri "LIG|Ad:sira:..." + sonuc satirlari "LIG|ev|dep|x|y"
  const LIGLER = new Set(), AD = {};
  const ekleAd = (c, n) => { (AD[c] = AD[c] || new Set()).add(n); };
  for (const m of app.matchAll(/^`?([A-Z]{2,4})\|([^\n`|]*:\d+:\d+[^\n`|]*)`?$/gm)) { LIGLER.add(m[1]); m[2].split(',').forEach(x => ekleAd(m[1], x.split(':')[0])); }
  for (const m of app.matchAll(/(?:^|[\n`])([A-Z]{2,4})\|([^|\n`]+)\|([^|\n`]+)\|\d+\|\d+/g)) { ekleAd(m[1], m[2]); ekleAd(m[1], m[3]); }
  const TABLOLU = new Set(LIGLER); // app.js'te sabit tablosu olan ligler
  // app.js'te sezonun ilk kismi kodlu mac listesi olarak YOK, yalniz sabit tablo var: sezonun tamami kayda eklenir ve istemci tabloyu buradan hesaplar
  const TAM_SEZON = new Set(['KSA']);
  hSat.forEach(l => { const [c, h, a] = l.split('|'); LIGLER.add(c); ekleAd(c, h); ekleAd(c, a); });
  // sabit tablosu olmayan lig (KSA): resmi puan durumundaki uygulama adlari
  for (const c of TAM_SEZON) if (LIGLER.has(c)) for (const r of (rd(`data/standings/${c}.json`) || {}).rows || []) if (r.n) ekleAd(c, r.n);
  // resmi puan durumundaki uygulama adlari: ayni kimlikle kayitta baska ad yoksa (takma ad cift sayim yaratmasin)
  for (const c of LIGLER) for (const r of (rd(`data/standings/${c}.json`) || {}).rows || []) {
    if (!r.n || (AD[c] && AD[c].has(r.n))) continue;
    const id = r.tid || ids[r.n]; if (id && (idAd[id] || []).some(x => AD[c] && AD[c].has(x))) continue;
    ekleAd(c, r.n);
  }
  // CL: CLR satirlari "gg.aa|ev|dep|x|y"; EL/ECL: EUR={EL:`ev|dep|x|y ...`}
  const clm = app.match(/CLR=`([^`]*)`/); if (clm) clm[1].split('\n').forEach(l => { const p = l.split('|'); if (p[2]) { ekleAd('CL', p[1]); ekleAd('CL', p[2]); } });
  const eurm = app.match(/EUR=\{([\s\S]*?)\}\s*[,;]/); const EUR0 = {};
  if (eurm) for (const m of eurm[1].matchAll(/([A-Z]+):`([^`]*)`/g)) { EUR0[m[1]] = m[2]; m[2].split('\n').forEach(l => { const p = l.split('|'); if (p[1]) { ekleAd(m[1], p[0]); ekleAd(m[1], p[1]); } }); }

  const kanon = (c, n) => {
    const S = AD[c]; if (!S || S.has(n)) return n;
    const id = ids[n]; if (id) { const k = (idAd[id] || []).find(x => S.has(x)); if (k) return k; }
    return n;
  };
  // biten maclar
  const M = new Map();
  for (const x of (rd('data/fixtures/finished.json') || {}).m || []) if (x && x.id != null && Number.isFinite(+x.x) && Number.isFinite(+x.y)) M.set(x.id, { c: x.c, t: x.t, h: x.h, a: x.a, x: +x.x, y: +x.y });
  for (const x of (rd('data/fixtures/latest.json') || {}).m || []) if (x && FIN.has(x.st) && Array.isArray(x.sc)) M.set(x.id, { c: x.c, t: x.t, h: x.h, a: x.a, x: +x.sc[0], y: +x.sc[1] });
  // API sezon fiksturu (data/api/<LIG>/<S>/fixtures.json, fetch-history yazar): ertelenmis / pencere disinda kalmis maclar da gelsin.
  // Guvenlik: ligin TUM takimlari uygulamadaki adlara eslesmiyorsa o lig atlanir (ad farki cift sayim yaratmasin).
  const S = new Date().getUTCMonth() >= 6 ? new Date().getUTCFullYear() : new Date().getUTCFullYear() - 1;
  for (const c of LIGLER) {
    const fx = rd(`data/api/${c}/${S}/fixtures.json`); if (!fx || !Array.isArray(fx.m) || !AD[c]) continue;
    const ad = id => { const n = (fx.tn || {})[id]; const k = n ? kanon(c, n) : null; return k && AD[c].has(k) ? k : (idAd[id] || []).find(x => AD[c].has(x)) || null; };
    const tids = new Set(); fx.m.forEach(r => { tids.add(r[2]); tids.add(r[3]); });
    const bilinmeyen = [...tids].filter(id => !ad(id));
    if (bilinmeyen.length) { log.push(`sonuc-ekle: ${c} API fiksturu atlandi (eslesmeyen takim: ${bilinmeyen.map(id => (fx.tn || {})[id] || id).join(', ')})`); continue; }
    // sabit tablolu liglerde sezonun ilk kismi app.js'te kodlu duruyor (or. "9|BJK|BAS|2-0"): yalniz sezon kaydinin
    // basladigi gunden (history'deki en eski tarih) sonra oynanan maclar eklenir; tablosu olmayan lig (KSA) tum sezon.
    let kesim = 0;
    if (!TAM_SEZON.has(c)) { const t = hSat.filter(l => l.startsWith(c + '|')).map(l => { const d = l.split('|')[5] || ''; const [g, a, y] = d.split('.'); return Date.UTC(+y, +a - 1, +g); }).filter(Number.isFinite); if (!t.length) continue; kesim = Math.min(...t); }
    for (const r of fx.m) if (FIN.has(r[6]) && r[4] != null && r[5] != null && !M.has(r[0]) && Date.parse(r[1]) >= kesim) M.set(r[0], { c, t: r[1], h: ad(r[2]), a: ad(r[3]), x: +r[4], y: +r[5] });
  }

  const var_ = (c, h, a) => hSat.some(l => l.startsWith(`${c}|${h}|${a}|`)) || app.includes(`${c}|${h}|${a}|`);
  const tarih = t => { const d = new Date(String(t).length === 17 ? String(t).replace('Z', ':00Z') : t); return isNaN(d) ? '' : d; };
  let nL = 0, nC = 0, nE = 0;
  const clSat = res ? String(res.cl || '').split('\n').filter(Boolean) : [];
  let eu = {}; try { eu = res && res.eu ? JSON.parse(res.eu) : {}; } catch { eu = {}; }
  for (const m of [...M.values()].sort((p, q) => String(p.t).localeCompare(String(q.t)))) {
    const d = tarih(m.t); if (!d) continue;
    const h = kanon(m.c, m.h), a = kanon(m.c, m.a);
    const gg = String(d.getUTCDate()).padStart(2, '0'), aa = String(d.getUTCMonth() + 1).padStart(2, '0');
    if (m.c === 'CL') {
      if (!res || clm && clm[1].split('\n').some(l => { const p = l.split('|'); return p[1] === h && p[2] === a; }) || clSat.some(l => { const p = l.split('|'); return p[1] === h && p[2] === a; })) continue;
      clSat.push(`${gg}.${aa}|${h}|${a}|${m.x}|${m.y}`); nC++;
    } else if (m.c === 'EL' || m.c === 'ECL') {
      const ess = l => l.startsWith(`${h}|${a}|`);
      if (!res || String(EUR0[m.c] || '').split('\n').some(ess) || String(eu[m.c] || '').split('\n').some(ess)) continue;
      eu[m.c] = (eu[m.c] ? eu[m.c] + '\n' : '') + `${h}|${a}|${m.x}|${m.y}`; nE++;
    } else if (LIGLER.has(m.c)) {
      if (var_(m.c, h, a)) continue;
      hSat.push(`${m.c}|${h}|${a}|${m.x}|${m.y}|${gg}.${aa}.${d.getUTCFullYear()}`); nL++;
    }
  }
  if (nL) { hist.h = hSat.join('\n'); hist.at = new Date().toISOString(); wr('data/history/all.json', hist); }
  if (res && (nC || nE)) { res.cl = clSat.join('\n'); if (Object.keys(eu).length) res.eu = JSON.stringify(eu); wr('data/results/latest.json', res); }
  log.push(`sonuc-ekle: lig ${nL}, CL ${nC}, EL/ECL ${nE} yeni mac`);
  return log;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(sonucEkle().join('\n'));
