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
const log = s => console.log(`[${new Date().toISOString()}] ${s}`);

let lat = null;
try { lat = JSON.parse(fs.readFileSync(LATEST, 'utf8')); } catch {}
if (!lat || Date.now() - Date.parse(lat.at) > 14 * 3600e3) { log('Veri eski/yok: tam cekim'); run('full'); try { lat = JSON.parse(fs.readFileSync(LATEST, 'utf8')); } catch { process.exit(0); } }

let done = {};
try { done = JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch {}
const now = Date.now(), MAXLATE = 6 * 3600e3, PH = [['ilk11', -58], ['yari', 50], ['son', 120]];
const due = [];
for (const m of lat.m) {
  if (m.st === 'PST' || m.st === 'CANC') continue;
  const t0 = Date.parse(m.t.length === 17 ? m.t.replace('Z', ':00Z') : m.t);
  if (!Number.isFinite(t0)) continue;
  for (const [ph, off] of PH) {
    const at = t0 + off * 60e3, key = `${m.id}|${ph}`;
    if (!done[key] && at <= now && now - at <= MAXLATE) due.push(key);
  }
}
if (!due.length) process.exit(0);
log(`${due.length} tetik vakti geldi, guncelleniyor`);
const rc = run('tetik');
if (rc === 0) {
  due.forEach(k => { done[k] = now; });
  for (const k of Object.keys(done)) if (now - done[k] > 3 * 864e5) delete done[k]; // eski kayitlari temizle
  fs.mkdirSync(path.dirname(STATE), { recursive: true }); fs.writeFileSync(STATE, JSON.stringify(done));
} else log('Guncelleme basarisiz, tetikler bir sonraki calismada tekrar denenecek');
