// Veriyi KENDI bilgisayarindan ceker, yalnizca veri dosyalarini commit'leyip push eder (GitHub Actions API'ye istek atmaz).
// Kullanim: node tools/yerel-guncelle.mjs [live|full|due] [--no-push]
//   live: canli skor + ayrintilar | full: maclar + ayrintilar (gunde 1-3 kez) | due: yalnizca vakti gelmis ilk 11/ilk yari/mac sonu
// Guvenlik: yerelde push edilmemis baska commit varsa push ETMEZ (git push tum commit'leri yayinlar).
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const mode = process.argv.find(a => ['live', 'full', 'due', 'tetik'].includes(a)) || 'live';
const noPush = process.argv.includes('--no-push');
const run = (cmd, args, opt = {}) => spawnSync(cmd, args, { cwd: root, stdio: 'inherit', ...opt });
const out = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8' }).trim();
const node = process.execPath;

console.log(`[${new Date().toISOString()}] Mod: ${mode}`);
// Ayni anda iki calisma olmasin (API hiz siniri): kilit dosyasi, 30 dk'dan eskiyse gecersiz
import fs from 'node:fs';
const LOCK = path.join(root, 'tools', 'cache', '.yerel-lock');
// kilidi birakan surec olmusse (Ctrl+C, kapanma) kilit gecersiz: yoksa 30 dk boyunca hic veri yayinlanmiyordu
const canli = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
try { if (Date.now() - fs.statSync(LOCK).mtimeMs < 30 * 60e3 && canli(+fs.readFileSync(LOCK, 'utf8'))) { console.log('Baska bir guncelleme calisiyor, cikiliyor.'); process.exit(3); /* 3: hic calismadi, yerel-tetik tekrar dener */ } } catch {}
fs.mkdirSync(path.dirname(LOCK), { recursive: true }); fs.writeFileSync(LOCK, String(process.pid));
process.on('exit', () => { try { fs.unlinkSync(LOCK); } catch {} });
const steps = {
  // Pro plan (21 Kas 2026): gunde 7500 istek. Yedek (reserve) yuksek tutulur ki kota bir hata dongusunde erimesin.
  full: [['tools/fetch-fixtures.mjs', '--max-pred=4'], ['tools/fetch-details.mjs', '--max=300', '--hours=36', '--reserve=1500', '--squads=40'], ['tools/fetch-dis-form.mjs', '--max=60', '--reserve=1500'], ['tools/fetch-milli.mjs', '--max=400', '--reserve=1500']],
  live: [['tools/fetch-fixtures.mjs', '--live'], ['tools/fetch-details.mjs', '--max=150', '--hours=36', '--reserve=1500']],
  tetik: [['tools/fetch-fixtures.mjs', '--live'], ['tools/fetch-details.mjs', '--phases-only', '--max=80', '--hours=3', '--reserve=500']],
  due: [['tools/fetch-details.mjs', '--phases-only', '--max=80', '--hours=3', '--reserve=500']],
}[mode];
for (const [s, ...a] of steps) run(node, [s, ...a]);
// biten maclar -> sezon kaydi (puan tablosu, form, son maclar; istek yok). Kota bitse de daha once cekilmis sonuclar islenir.
run(node, ['tools/sonuc-ekle.mjs']);
// gol kralligi: API cift sayimini mac olaylarindan duzelt (istek yok)
run(node, ['tools/top-from-events.mjs']);
// guc modeli: tum sonuclardan takim gucu -> yaklasan maclarin gol beklentisi (data/model/guc.json; istek yok)
run(node, ['tools/model-guc.mjs']);
// takim basina tum maclar dizini (takim sayfasi gecmis sezonlar + karsilasmalar; istek yok)
if (mode === 'full') run(node, ['tools/team-index.mjs']);
// oyuncu mac mac kaydi (data/api/oyuncu/<takimId>.json; oyuncu sayfasi tablo + sezon kartlari; istek yok). Her calismada: son maclar details.json'dan girer
run(node, ['tools/player-matches.mjs']);
// oyuncu istatistik listesi yalnizca API-Football'dan (data/players/api.json; kadro tablolari + oyuncu sayfasi; istek yok)
run(node, ['tools/api-players.mjs']);
if (mode === 'full') run(node, ['tools/keepalive.mjs']); // Supabase 1 hafta islemsizlikte durur

const DATA = ['data/history/all.json', 'data/fixtures','data/teams', 'data/players/season.json', 'data/players/api.json', 'data/lineups', 'data/results', 'data/standings', 'data/model', 'data/api', 'data/tm/api-teams.json', 'data/tm/clublogo.json'];
run('git', ['add', '--', ...DATA]);
if (!out('git', ['diff', '--cached', '--name-only'])) { console.log('Degisiklik yok.'); process.exit(0); }
run('git', ['commit', '-q', '-m', `Veri guncelle (yerel, ${mode})`]);
if (noPush) { console.log('--no-push: push edilmedi.'); process.exit(0); }

run('git', ['fetch', '-q', 'origin', 'main']);
// Push oncesi: bizim veri commit'imiz disinda yerel commit olmamali
const ahead = out('git', ['log', 'origin/main..HEAD', '--format=%s']).split('\n').filter(Boolean);
if (ahead.some(s => !s.startsWith('Veri guncelle (yerel'))) { console.error('Push edilmemis baska commit var, push YAPILMADI:\n' + ahead.join('\n')); process.exit(2); } // 2: veri cekildi, push edilemedi
if (run('git', ['pull', '--rebase', '--autostash', '-q', 'origin', 'main']).status !== 0) { console.error('pull --rebase basarisiz, push yapilmadi.'); process.exit(2); }
process.exit(run('git', ['push', '-q', 'origin', 'main']).status === 0 ? 0 : 2);
