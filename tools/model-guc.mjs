// Guc modeli: tum yarismalardaki (lig, kupa, Avrupa, milli) bitmis maclardan takim hucum/savunma gucu. Istek YOK.
// Kaynak: data/api/<C>/<S>/fixtures.json  m: [id, tarihISO, evId, depId, evGol, depGol, durum, tur, ...]
// Model (dinamik Poisson): log lambda_ev = mu_c + h_c + hucum_ev - savunma_dep ; log lambda_dep = mu_c - h_c + hucum_dep - savunma_ev
//   her mactan sonra (gol - lambda) kadar guncellenir; uzun aradan (sezon arasi) sonra gucler ortalamaya dogru buzulur.
//   Skor matrisi Dixon-Coles duzeltmesiyle (0-0, 1-0, 0-1, 1-1) hesaplanir.
// Kullanim:
//   node tools/model-guc.mjs           -> data/model/guc.json yazar (uygulama yedek modeli)
//   node tools/model-guc.mjs --test    -> geriye donuk test: eski yedek model (sezon gol ortalamasi) ile karsilastirma
//   node tools/model-guc.mjs --ayar    -> parametre aramasi (2022-2023 uzerinde), sonra 2024+ uzerinde test
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const API = path.join(root, 'data', 'api');
const BITTI = new Set(['FT', 'AET', 'PEN']);
const LIG = new Set(['SL', 'PL', 'LL', 'SA', 'BL', 'L1', 'ERE', 'POR', 'BEL', 'SCO', 'KSA', 'BRA', 'ARG', 'MLS', 'MX']);
const rd = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8').replace(/^﻿/, '')); } catch { return null; } };

// ---------- veri ----------
function maclar() {
  const out = [], gor = new Set();
  for (const c of fs.readdirSync(API)) {
    const d = path.join(API, c); if (!fs.statSync(d).isDirectory() || c === 'takim') continue;
    for (const s of fs.readdirSync(d)) {
      if (!/^\d{4}$/.test(s)) continue;
      const j = rd(path.join(d, s, 'fixtures.json')); if (!j || !j.m) continue;
      for (const x of j.m) {
        if (!BITTI.has(x[6]) || x[4] == null || x[5] == null || gor.has(x[0])) continue;
        gor.add(x[0]);
        // uzatma/penalti: 90 dk skoru bilinmiyor; beraberlik sayilir (kupa maclari 90 dk'da berabere bitmisti)
        const uz = x[6] !== 'FT';
        out.push({ id: x[0], t: Date.parse(x[1]), c, s: +s, h: x[2], a: x[3], x: uz ? Math.min(x[4], x[5]) : +x[4], y: uz ? Math.min(x[4], x[5]) : +x[5], lig: LIG.has(c) });
      }
    }
  }
  return out.sort((a, b) => a.t - b.t || a.id - b.id);
}

// ---------- olasilik ----------
const pois = (l, k) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
function matris(lh, la, rho) {
  const N = 10, P = [], ph = [], pa = [];
  for (let i = 0; i <= N; i++) { ph[i] = pois(lh, i); pa[i] = pois(la, i); }
  let s = 0;
  for (let i = 0; i <= N; i++) { P[i] = []; for (let j = 0; j <= N; j++) {
    let t = 1;
    if (rho) { if (i === 0 && j === 0) t = 1 - lh * la * rho; else if (i === 0 && j === 1) t = 1 + lh * rho; else if (i === 1 && j === 0) t = 1 + la * rho; else if (i === 1 && j === 1) t = 1 - rho; }
    P[i][j] = Math.max(0, ph[i] * pa[j] * t); s += P[i][j];
  } }
  let p1 = 0, px = 0, p2 = 0, u25 = 0, kg = 0;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { const q = P[i][j] / s; if (i > j) p1 += q; else if (i === j) px += q; else p2 += q; if (i + j > 2) u25 += q; if (i && j) kg += q; }
  return { p: [p1, px, p2], u25, kg };
}

// ---------- guc modeli ----------
const VARS = { eta: 0.016, etaMu: 0.001, etaH: 0.0006, buz: 0.9, ara: 45, yeni: -0.18, rho: -0.09, ilk: 0.18 };
function gucModeli(L, o = {}, cb) {
  const P = { ...VARS, ...o };
  const T = new Map(), mu = {}, h = {};
  const tk = id => { let t = T.get(id); if (!t) T.set(id, t = { at: P.yeni, df: P.yeni, n: 0, son: 0 }); return t; };
  for (const m of L) {
    const A = tk(m.h), B = tk(m.a);
    for (const t of [A, B]) if (t.son && m.t - t.son > P.ara * 864e5) { t.at *= P.buz; t.df *= P.buz; }
    if (mu[m.c] == null) { mu[m.c] = Math.log(1.35); h[m.c] = P.ilk; }
    const lh = Math.exp(mu[m.c] + h[m.c] + A.at - B.df), la = Math.exp(mu[m.c] - h[m.c] + B.at - A.df);
    if (cb) cb(m, lh, la, A, B, P);
    // guncelleme (az maci olan takim daha hizli ogrenir)
    const eA = m.x - lh, eB = m.y - la, kA = P.eta * (1 + 2 / (1 + A.n / 5)), kB = P.eta * (1 + 2 / (1 + B.n / 5));
    A.at += kA * eA; B.df -= kB * eA; B.at += kB * eB; A.df -= kA * eB;
    mu[m.c] += P.etaMu * (eA + eB); h[m.c] += P.etaH * (eA - eB);
    A.n++; B.n++; A.son = B.son = m.t;
  }
  return { T, mu, h, P };
}

// ---------- eski yedek model (js/fixtures-api.js modelDoldur ile ayni) ----------
function eskiModel(L, cb) {
  const S = {}; // c|s -> { tk: {id:{f,a,g}}, F, G }
  for (const m of L) {
    if (!m.lig) continue;
    const k = m.c + '|' + m.s, s = S[k] || (S[k] = { tk: {}, F: 0, G: 0 });
    const A = s.tk[m.h] || (s.tk[m.h] = { f: 0, a: 0, g: 0 }), B = s.tk[m.a] || (s.tk[m.a] = { f: 0, a: 0, g: 0 });
    if (A.g >= 3 && B.g >= 3 && s.G) {
      const mu0 = s.F / s.G, k0 = 4;
      const at = t => (t.f + mu0 * k0) / (t.g + k0) / mu0, df = t => (t.a + mu0 * k0) / (t.g + k0) / mu0;
      cb(m, mu0 * at(A) * df(B) * 1.12, mu0 * at(B) * df(A) * 0.88);
    }
    A.f += m.x; A.a += m.y; A.g++; B.f += m.y; B.a += m.x; B.g++; s.F += m.x + m.y; s.G += 2;
  }
}

// ---------- olcum ----------
const sonuc = m => (m.x > m.y ? 0 : m.x === m.y ? 1 : 2);
function olc() { return { n: 0, ll: 0, br: 0, ou: 0, kgl: 0, isabet: 0, kal: Array.from({ length: 10 }, () => [0, 0, 0]) }; }
function ekle(o, m, r) {
  const k = sonuc(m), e = 1e-9;
  o.n++; o.ll -= Math.log(Math.max(e, r.p[k]));
  o.br += r.p.reduce((s, q, i) => s + (q - (i === k ? 1 : 0)) ** 2, 0);
  const u = m.x + m.y > 2, b = m.x > 0 && m.y > 0;
  o.ou -= Math.log(Math.max(e, u ? r.u25 : 1 - r.u25)); o.kgl -= Math.log(Math.max(e, b ? r.kg : 1 - r.kg));
  if (r.p.indexOf(Math.max(...r.p)) === k) o.isabet++;
  r.p.forEach((q, i) => { const b2 = Math.min(9, Math.floor(q * 10)); o.kal[b2][0]++; o.kal[b2][1] += q; o.kal[b2][2] += i === k ? 1 : 0; });
}
const yaz = (ad, o) => `${ad.padEnd(28)} n=${String(o.n).padStart(6)}  1X2 logloss ${(o.ll / o.n).toFixed(4)}  Brier ${(o.br / o.n).toFixed(4)}  2,5Ü logloss ${(o.ou / o.n).toFixed(4)}  KG logloss ${(o.kgl / o.n).toFixed(4)}  favori isabet %${(100 * o.isabet / o.n).toFixed(1)}`;

function test(L, par, bas, bit, sadeceOrtak = true) {
  const eski = new Map();
  eskiModel(L, (m, lh, la) => { if (m.s >= bas && m.s <= bit) eski.set(m.id, matris(lh, la, 0)); });
  const E = olc(), Y = olc(), Ytum = olc();
  gucModeli(L, par, (m, lh, la, A, B, P) => {
    if (m.s < bas || m.s > bit) return;
    const r = matris(lh, la, P.rho);
    if (m.lig && A.n >= 10 && B.n >= 10) ekle(Ytum, m, r);
    const e = eski.get(m.id); if (!e) return;
    ekle(E, m, e); ekle(Y, m, r);
  });
  return { E, Y, Ytum };
}

const L = maclar();
console.log('Mac:', L.length, '| ilk', new Date(L[0].t).toISOString().slice(0, 10), '| son', new Date(L[L.length - 1].t).toISOString().slice(0, 10));

if (process.argv.includes('--piyasa')) {
  // piyasa beklentisi olan ve sonuclanan maclar (tools/cache/piyasa-gecmis.json + data/fixtures/details.json): piyasa / model / karisim
  const PG = rd(path.join(root, 'tools', 'cache', 'piyasa-gecmis.json')) || {}, D = (rd(path.join(root, 'data', 'fixtures', 'details.json')) || {}).m || {};
  const pz = {}; for (const [id, v] of Object.entries(PG)) if (v.ps === 'piyasa') pz[id] = v.p; for (const [id, v] of Object.entries(D)) if (v.odds && v.odds.p) pz[id] = v.odds.p;
  const W = [0, 0.1, 0.2, 0.3, 0.5, 1], O = W.map(() => olc());
  gucModeli(L, {}, (m, lh, la, A, B, P) => {
    const q = pz[m.id]; if (!q) return; const r = matris(lh, la, P.rho);
    W.forEach((w, i) => { const p = q.map((v, k) => (1 - w) * v + w * r.p[k]); ekle(O[i], m, { p, u25: r.u25, kg: r.kg }); });
  });
  W.forEach((w, i) => console.log(yaz(w === 0 ? 'Yalniz piyasa' : w === 1 ? 'Yalniz guc modeli' : 'Karisim (model %' + w * 100 + ')', O[i]).replace(/  2,5.*isabet/, '  favori isabet')));
} else if (process.argv.includes('--gol')) {
  // uygulamadaki gol hesabi (js/app.js gmk: toplam gol = 2.682 + 0.85*|p1-p2|, dagilim 1X2'den) ile guc modelinin takim bazli gol beklentisi
  const gmk = p => { const d = p[0] - p[2], T = 2.682 + 0.85 * Math.abs(d); let lo = 0.02, hi = 0.98, s2 = 0.5;
    for (let it = 0; it < 40; it++) { s2 = (lo + hi) / 2; const r = matris(T * s2, T * (1 - s2), 0); if (r.p[0] - r.p[2] < d) lo = s2; else hi = s2; }
    return matris(T * s2, T * (1 - s2), 0); };
  const A = olc(), B = olc(), C = olc();
  gucModeli(L, {}, (m, lh, la, X, Y, P) => { if (m.s < 2024 || !m.lig || X.n < 10 || Y.n < 10) return; const r = matris(lh, la, P.rho), g = gmk(r.p);
    ekle(A, m, { p: r.p, u25: g.u25, kg: g.kg }); ekle(B, m, r); ekle(C, m, { p: r.p, u25: (g.u25 + r.u25) / 2, kg: (g.kg + r.kg) / 2 }); });
  console.log(yaz('Uygulama formulu (gmk)', A)); console.log(yaz('Guc modeli gol beklentisi', B)); console.log(yaz('Ikisinin ortalamasi', C));
} else if (process.argv.includes('--ayar')) {
  // koordinat aramasi: 2022-2023 lig maclarinda 1X2 + 2,5Ü logloss toplami
  let en = { ...VARS };
  const skor = p => { const r = test(L, p, 2022, 2023).Y; return (r.ll + r.ou) / r.n; };
  let best = skor(en);
  const IZ = { eta: [0.012, 0.016, 0.02, 0.025, 0.03, 0.035], buz: [0.6, 0.7, 0.75, 0.8, 0.9], yeni: [-0.4, -0.32, -0.25, -0.18], rho: [-0.12, -0.09, -0.06], etaMu: [0.0005, 0.001, 0.002, 0.003, 0.005], etaH: [0, 0.0003, 0.0006, 0.001, 0.002], ilk: [0.14, 0.18, 0.22, 0.26] };
  for (let tur = 0; tur < 2; tur++) for (const [k, vs] of Object.entries(IZ)) for (const v of vs) {
    const p = { ...en, [k]: v }, s = skor(p); if (s < best - 1e-6) { best = s; en = p; console.log('  daha iyi', k, v, best.toFixed(5)); }
  }
  console.log('En iyi parametreler:', JSON.stringify(en));
  const r = test(L, en, 2024, 2026);
  console.log('\nTest 2024-2026 (ayar verisi disi):');
  console.log(yaz('Eski yedek model', r.E)); console.log(yaz('Guc modeli', r.Y)); console.log(yaz('Guc modeli (tum lig maclari)', r.Ytum));
} else if (process.argv.includes('--test')) {
  const r = test(L, {}, 2024, 2026);
  console.log(yaz('Eski yedek model', r.E)); console.log(yaz('Guc modeli', r.Y)); console.log(yaz('Guc modeli (tum lig maclari)', r.Ytum));
  console.log('\nKalibrasyon (guc modeli): tahmin araligi -> ortalama tahmin / gerceklesen');
  r.Y.kal.forEach((b, i) => { if (b[0]) console.log(`  %${i * 10}-${i * 10 + 9}: n=${b[0]}  tahmin %${(100 * b[1] / b[0]).toFixed(1)}  gercek %${(100 * b[2] / b[0]).toFixed(1)}`); });
} else {
  // uygulama icin: mac kimligine gore beklenen goller [ev, dep]. Son 4 gunde bitenler mac ONCESI degerle, yaklasanlar (21 gun) guncel guclerle.
  const simdi = Date.now(), fx = {}, r3 = v => +v.toFixed(3);
  const { T, mu, h, P } = gucModeli(L, {}, (m, lh, la) => { if (m.t > simdi - 4 * 864e5) fx[m.id] = [r3(lh), r3(la)]; });
  let yak = 0;
  for (const c of fs.readdirSync(API)) {
    const d = path.join(API, c); if (!fs.statSync(d).isDirectory() || c === 'takim') continue;
    for (const s of fs.readdirSync(d)) {
      if (!/^\d{4}$/.test(s) || +s < new Date().getFullYear() - 1) continue;
      const j = rd(path.join(d, s, 'fixtures.json')); if (!j || !j.m) continue;
      for (const x of j.m) {
        if (BITTI.has(x[6]) || fx[x[0]]) continue;
        const t = Date.parse(x[1]); if (!(t > simdi - 864e5 && t < simdi + 21 * 864e5)) continue;
        const A = T.get(x[2]), B = T.get(x[3]); if (!A || !B || A.n < 5 || B.n < 5) continue; // az macli takim: tahmin yok
        const g = v => (v.son && t - v.son > P.ara * 864e5 ? P.buz : 1);
        const m0 = mu[c] ?? Math.log(1.35), h0 = h[c] ?? P.ilk;
        fx[x[0]] = [r3(Math.exp(m0 + h0 + A.at * g(A) - B.df * g(B))), r3(Math.exp(m0 - h0 + B.at * g(B) - A.df * g(A)))]; yak++;
      }
    }
  }
  // tahmin kilidi (27 Kas 2026): maca 3 saatten az kalan/baslamis/biten maclarda onceki deger korunur (mac oncesi son tahmin degismesin)
  { const eski = (rd(path.join(root, 'data', 'model', 'guc.json')) || {}).fx || {}, bas = {};
    for (const c of fs.readdirSync(API)) { const d = path.join(API, c); if (!fs.statSync(d).isDirectory() || c === 'takim') continue;
      for (const s of fs.readdirSync(d)) { if (!/^\d{4}$/.test(s) || +s < new Date().getFullYear() - 1) continue; const j = rd(path.join(d, s, 'fixtures.json')); if (j && j.m) for (const x of j.m) bas[x[0]] = Date.parse(x[1]); } }
    for (const [id, v] of Object.entries(eski)) if (bas[id] && bas[id] <= simdi + 3 * 3600e3 && bas[id] > simdi - 4 * 864e5) fx[id] = v; }
  const out = { at: new Date().toISOString(), son: new Date(L[L.length - 1].t).toISOString(), rho: P.rho, fx };
  fs.mkdirSync(path.join(root, 'data', 'model'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data', 'model', 'guc.json'), JSON.stringify(out));
  console.log('data/model/guc.json yazildi:', Object.keys(fx).length, 'mac (yaklasan', yak + ')');
}
