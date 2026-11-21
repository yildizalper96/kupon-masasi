// Mac saatine gore otomatik veri cekimi (Gorev Zamanlayicisi 5 dakikada bir calistirir; cogu calismada hic istek yapmaz).
// Her calismada once data/fixtures/latest.json'daki maclarin saatlerine bakar. Her mac icin 3 tetik:
//   baslangic -58 dk (ilk 11), baslangic +50 dk (ilk yari), baslangic +120 dk (mac sonu).
// Vakti gelmis (ve en fazla 6 saat gecmemis) tetik varsa tek bir 'tetik' guncellemesi yapar, hepsini 'yapildi' isaretler.
// Gunun ilk calismasinda veri 14 saatten eskiyse once tam cekim yapar (yeni maclar ogrenilsin).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const LATEST = path.join(root, 'data/fixtures/latest.json'), STATE = path.join(root, 'tools/cache/tetik-durum.json');
const run = mode => spawnSync(process.execPath, ['tools/yerel-guncelle.mjs', mode], { cwd: root, stdio: 'inherit' }).status;
// 0 = tamam, 2 = veri cekildi ama push edilemedi (tamam sayilir, kota bosa gitmesin). 3 = kilit, 1/null = cokme: tekrar denenir.
const calisti = rc => rc === 0 || rc === 2;
const log = s => console.log(`[${new Date().toISOString()}] ${s}`);

let lat = null;
try { lat = JSON.parse(fs.readFileSync(LATEST, 'utf8')); } catch {}
let done = {};
try { done = JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch {}
// tam cekim (fikstur penceresi + tahmin + kadrolar) 6 saatte bir. lat.at'e bakilmaz: canli mod da onu guncelliyor, tam cekim hic gelmezdi.
const fullKey = 'full|' + Math.floor(Date.now() / (6 * 3600e3));
if (!lat || !done[fullKey]) {
  log('Tam cekim (6 saatte bir)');
  if (calisti(run('full'))) { done[fullKey] = Date.now(); fs.mkdirSync(path.dirname(STATE), { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(done)); }
  try { lat = JSON.parse(fs.readFileSync(LATEST, 'utf8')); } catch { process.exit(0); }
}
// 'son' 130 dk: fetch-details mac sonunu ancak baslamadan 125 dk sonra ceker (120'de tetiklenirse bos gecip bir daha denenmiyordu)
// 'ilk11b' -25 dk: resmi 11 -58'de henuz aciklanmadiysa ikinci deneme (fetch-details luOk olani tekrar cekmez)
const now = Date.now(), MAXLATE = 6 * 3600e3, PH = [['ilk11', -58], ['ilk11b', -25], ['yari', 50], ['son', 130]];
let det = {}; try { det = JSON.parse(fs.readFileSync(path.join(root, 'data/fixtures/details.json'), 'utf8')).m || {}; } catch {}
const due = [];
let eksik = 0;
for (const m of lat.m) {
  if (m.st === 'PST' || m.st === 'CANC') continue;
  const t0 = Date.parse(m.t.length === 17 ? m.t.replace('Z', ':00Z') : m.t);
  if (!Number.isFinite(t0)) continue;
  for (const [ph, off] of PH) {
    const at = t0 + off * 60e3, key = `${m.id}|${ph}`;
    if (!done[key] && at <= now && now - at <= MAXLATE) due.push(key);
  }
  // telafi: son 30 saatte bitmis ama mac sonu / ilk 11 verisi gelmemis mac (kota bitti, bilgisayar kapaliydi vb.)
  const e = det[m.id];
  if (e && e.hid && now - t0 > 130 * 60e3 && now - t0 < 30 * 3600e3 && ((!e.ftOk && (e.ftTry || 0) < 4) || (e.ftOk && !e.luRaw && (e.luTry || 0) < 2))) eksik++;
}
// telafi tetigi saatte en cok bir kez (fetch-details --back=30 ile bu maclari ceker; kota yoksa istek yapmaz)
if (eksik) { const k = 'telafi|' + Math.floor(now / 3600e3); if (!done[k]) { due.push(k); log(`Telafi: ${eksik} macin verisi eksik`); } }
// Pro plan (21 Kas 2026): oynanan ya da 90 dk icinde baslayacak mac varken her calismada (5 dk) canli tur
const aktif = lat.m.filter(m => { if (m.st === 'PST' || m.st === 'CANC') return false; const t0 = Date.parse(m.t.length === 17 ? m.t.replace('Z', ':00Z') : m.t); return now >= t0 - 90 * 60e3 && now <= t0 + 150 * 60e3; }).length;
if (aktif) due.push('aktif|' + Math.floor(now / 300e3));
// saatte bir genel tur (oran, eksik, karsilikli, yaklasan maclar): 'live' modu, 'tetik' modunun ustkumesi
const saat = 'saat|' + Math.floor(now / 3600e3), genel = !done[saat];
if (genel) due.push(saat);
if (!due.length) process.exit(0);
log(`${due.length} tetik (${aktif} aktif mac): ${genel ? 'genel tur' : 'canli tur'}`);
const rc = run(genel ? 'live' : 'tetik');
if (calisti(rc)) {
  due.forEach(k => { done[k] = now; });
  for (const k of Object.keys(done)) if (now - done[k] > 3 * 864e5) delete done[k]; // eski kayitlari temizle
  fs.mkdirSync(path.dirname(STATE), { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(done));
} else log('Guncelleme basarisiz, tetikler bir sonraki calismada tekrar denenecek');
