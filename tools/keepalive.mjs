// Supabase ucretsiz projeleri 1 hafta islem olmazsa duraklatilir. Bu arac 1 hafif okuma yapar (GitHub Actions'tan cagrilir).
// js/config.js bossa hicbir sey yapmaz.
import fs from 'node:fs';
import path from 'node:path';

const cfg = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'js', 'config.js'), 'utf8');
const url = /url:\s*'([^']*)'/.exec(cfg)?.[1]?.replace(/\/+$/, '');
const key = /anonKey:\s*'([^']*)'/.exec(cfg)?.[1];
if (!url || !key) { console.log('Supabase ayari yok, atlandi.'); process.exit(0); }
try {
  const r = await fetch(`${url}/rest/v1/shared_coupons?select=code&limit=1`, { headers: { apikey: key } });
  console.log('Supabase canlilik denemesi:', r.status);
} catch (e) { console.log('Supabase canlilik denemesi basarisiz:', e.message); }
