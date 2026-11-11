// Test icin sahte Supabase + statik site sunucusu (gercek proje olmadan giris ve veri akisini denemek icin).
// Kullanim: node tools/mock-supabase.mjs [port]   -> http://localhost:5174  (js/config.js bu sunucuda sahte degerlerle sunulur)
// Gercek Supabase'in davranisini (GoTrue hata kodlari, PostgREST on_conflict, RLS benzeri sahiplik) taklit eder.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const port = Number(process.argv[2]) || 5174;
const BASE = 'http://localhost:' + port;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

const users = new Map();      // email -> {id,email,password,meta}
const userDocs = new Map();   // uid|path -> data
const shared = new Map();     // code -> {owner,data}
const log = [];
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (u, ttl) => `${b64u({ alg: 'none' })}.${b64u({ sub: u.id, email: u.email, user_metadata: u.meta || {}, exp: Math.floor(Date.now() / 1000) + ttl })}.sig`;
const sessionFor = (u, ttl = 3600) => ({ access_token: jwt(u, ttl), refresh_token: 'r-' + u.id + '-' + crypto.randomUUID(), expires_in: ttl, token_type: 'bearer', user: { id: u.id, email: u.email, user_metadata: u.meta || {} } });
const refreshTokens = new Map();
const issue = (u, ttl) => { const s = sessionFor(u, ttl); refreshTokens.set(s.refresh_token, u.email); return s; };
const uidFrom = req => { const m = /^Bearer (.+)$/.exec(req.headers.authorization || ''); if (!m) return null; try { return JSON.parse(Buffer.from(m[1].split('.')[1], 'base64url').toString()).sub; } catch { return null; } };

const send = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' }); res.end(body === undefined ? '' : JSON.stringify(body)); };
const readBody = req => new Promise(r => { let b = ''; req.on('data', d => b += d); req.on('end', () => { try { r(b ? JSON.parse(b) : {}); } catch { r({}); } }); });

http.createServer(async (req, res) => {
  const u = new URL(req.url, BASE);
  const p = u.pathname;
  if (req.method === 'OPTIONS') return send(res, 204);
  if (p === '/__log') return send(res, 200, log);
  if (p === '/__set_ttl') { globalThis.__ttl = Number(u.searchParams.get('s')); return send(res, 200, { ok: true }); }

  // ---------- GoTrue ----------
  if (p === '/auth/v1/signup' && req.method === 'POST') {
    const b = await readBody(req); log.push('signup ' + b.email);
    if (!b.password || b.password.length < 6) return send(res, 422, { code: 422, error_code: 'weak_password', msg: 'Password should be at least 6 characters.' });
    if (!/^\S+@\S+\.\S+$/.test(b.email || '')) return send(res, 400, { code: 400, error_code: 'validation_failed', msg: 'Unable to validate email address: invalid format' });
    if (users.has(b.email)) return send(res, 422, { code: 422, error_code: 'user_already_exists', msg: 'User already registered' });
    const nu = { id: crypto.randomUUID(), email: b.email, password: b.password, meta: {} }; users.set(b.email, nu);
    return send(res, 200, issue(nu, globalThis.__ttl || 3600));
  }
  if (p === '/auth/v1/token' && req.method === 'POST') {
    const b = await readBody(req); const gt = u.searchParams.get('grant_type'); log.push('token ' + gt);
    if (gt === 'password') {
      const x = users.get(b.email);
      if (!x || x.password !== b.password) return send(res, 400, { code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      return send(res, 200, issue(x, globalThis.__ttl || 3600));
    }
    if (gt === 'refresh_token') {
      const em = refreshTokens.get(b.refresh_token); const x = em && users.get(em);
      if (!x) return send(res, 400, { code: 400, error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' });
      refreshTokens.delete(b.refresh_token);
      return send(res, 200, issue(x, 3600));
    }
  }
  if (p === '/auth/v1/logout') { log.push('logout'); return send(res, 204); }
  if (p === '/auth/v1/authorize') { // Google taklidi: kullaniciyi olusturup #access_token ile geri yonlendir
    log.push('authorize ' + u.searchParams.get('provider'));
    if (u.searchParams.get('provider') !== 'google') return send(res, 400, { error_code: 'provider_disabled', msg: 'provider is not enabled' });
    let gu = users.get('google.user@example.com');
    if (!gu) { gu = { id: crypto.randomUUID(), email: 'google.user@example.com', password: 'x', meta: { full_name: 'Gül Yıldız', avatar_url: '' } }; users.set(gu.email, gu); }
    const s = issue(gu, 3600);
    res.writeHead(302, { Location: u.searchParams.get('redirect_to') + `#access_token=${s.access_token}&expires_in=3600&refresh_token=${s.refresh_token}&token_type=bearer` });
    return res.end();
  }

  // ---------- PostgREST ----------
  if (p === '/rest/v1/user_docs') {
    const uid = uidFrom(req); log.push(`${req.method} user_docs uid=${uid ? 'var' : 'yok'}`);
    if (!uid) return send(res, 401, { message: 'JWT required' });
    if (req.method === 'GET') {
      const want = (u.searchParams.get('path') || '').replace('eq.', ''), owner = (u.searchParams.get('user_id') || '').replace('eq.', '');
      if (owner !== uid) return send(res, 200, []); // RLS: baskasinin satiri gorunmez
      const d = userDocs.get(uid + '|' + want);
      return send(res, 200, d === undefined ? [] : [{ data: d }]);
    }
    if (req.method === 'POST') {
      const b = await readBody(req);
      if (b.user_id !== uid) return send(res, 403, { message: 'new row violates row-level security policy' });
      userDocs.set(uid + '|' + b.path, b.data); return send(res, 201);
    }
    if (req.method === 'DELETE') { const want = (u.searchParams.get('path') || '').replace('eq.', ''); userDocs.delete(uid + '|' + want); return send(res, 204); }
  }
  if (p === '/rest/v1/shared_coupons') {
    const uid = uidFrom(req); log.push(`${req.method} shared_coupons uid=${uid ? 'var' : 'yok'}`);
    if (req.method === 'GET') {
      const code = (u.searchParams.get('code') || '').replace('eq.', '');
      const d = shared.get(code); return send(res, 200, d ? [{ data: d.data }] : []);
    }
    if (!uid) return send(res, 401, { message: 'JWT required' });
    if (req.method === 'POST') {
      const b = await readBody(req); const old = shared.get(b.code);
      if (old && old.owner !== uid) return send(res, 403, { message: 'new row violates row-level security policy' });
      shared.set(b.code, { owner: uid, data: b.data }); return send(res, 201);
    }
    if (req.method === 'DELETE') { const code = (u.searchParams.get('code') || '').replace('eq.', ''); const o = shared.get(code); if (o && o.owner === uid) shared.delete(code); return send(res, 204); }
  }

  // ---------- statik site ----------
  if (p === '/js/config.js') { res.writeHead(200, { 'Content-Type': types['.js'], 'Cache-Control': 'no-store' }); return res.end(`window.KM_SUPABASE={url:'${BASE}',anonKey:'sb_publishable_test'};`); }
  let rel = decodeURIComponent(p); if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(root, rel);
  if (!file.startsWith(root) || /[\\/](\.git|yedek|tools|yerel-notlar)[\\/]/.test(file)) return send(res, 403, 'x');
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('404'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(buf);
  });
}).listen(port, () => console.log('mock supabase + site: ' + BASE));
