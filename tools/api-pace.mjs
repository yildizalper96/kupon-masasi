// Ortak istek hizi siniri: tum betikler (ayri surecler dahil) API'ye en az GAP ms arayla istek atar.
// Son istek zamani tools/cache/.last-api-req dosyasinda tutulur; boylece betik gecislerinde de bekleme sifirlanmaz.
import fs from 'node:fs';
import path from 'node:path';
const F = path.resolve(import.meta.dirname, 'cache', '.last-api-req');
export const GAP = 10000; // dakikada en cok 6 istek (limit 10/dk; guvenli pay)
export async function pace() {
  let last = 0;
  try { last = +fs.readFileSync(F, 'utf8') || 0; } catch {}
  const wait = last + GAP - Date.now();
  if (wait > 0) await new Promise(r => setTimeout(r, Math.min(wait, GAP)));
  try { fs.mkdirSync(path.dirname(F), { recursive: true }); fs.writeFileSync(F, String(Date.now())); } catch {}
}
