// SEO maç sayfaları (20 Kas 2026): her maç için statik, Google'ın okuyabileceği bir sayfa üretir.
//   /mac/<ev>-<dep>-<yyyy-aa-gg>/index.html   (başlık: "Ev - Dep maç analizi ve tahmini")
//   /mac/index.html (maç listesi), /sitemap.xml, /robots.txt
// Kaynak: data/fixtures/latest.json + finished.json (maçlar, olasılık), details.json (karşılıklı maçlar, eksikler, Ü/KG),
// data/standings/<lig>.json (sıra, puan, form, stadyum). Veri yoksa "veri yok" yazılır, uydurulmaz.
// Oranlar adil orandır (1/olasılık); bahisçi adı ve ham bahis oranı gösterilmez.
// Kullanım: build-site.mjs çağırır; tek başına: node tools/seo-pages.mjs [cikis-klasoru]
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://simuleto.com';
const root = path.resolve(import.meta.dirname, '..');
const oku = rel => { try { return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); } catch { return null; } };
const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TR = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', é: 'e', á: 'a', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ã: 'a', ê: 'e', ø: 'o', å: 'a', ä: 'a', ë: 'e' };
const slug = s => String(s).toLowerCase().replace(/./g, c => TR[c] ?? c).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const IST = 'Europe/Istanbul';
const gun = t => new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(t);
const tarihTR = t => new Intl.DateTimeFormat('tr-TR', { timeZone: IST, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(t);
const saatTR = t => new Intl.DateTimeFormat('tr-TR', { timeZone: IST, hour: '2-digit', minute: '2-digit' }).format(t);
const yuzde = p => Math.round(p * 100);
const adil = p => p > 0 ? (1 / p).toFixed(2) : '–';

const CSS = `:root{--bg:#f6f7f9;--kart:#fff;--yazi:#16202a;--sol:#5b6773;--cizgi:#e2e6ea;--vurgu:#1b7a4b;--uyari:#b86e00}
@media (prefers-color-scheme:dark){:root{--bg:#0e151b;--kart:#16212a;--yazi:#e8edf1;--sol:#93a1ad;--cizgi:#26343f;--vurgu:#3fbf7f;--uyari:#e0a040}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--yazi);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:760px;margin:0 auto;padding:16px}a{color:var(--vurgu)}header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:4px 0 12px}
header a.l{font-weight:800;font-size:20px;color:var(--yazi);text-decoration:none}h1{font-size:24px;line-height:1.25;margin:4px 0 6px}h2{font-size:17px;margin:0 0 10px}
.alt{color:var(--sol);font-size:14px}.kart{background:var(--kart);border:1px solid var(--cizgi);border-radius:14px;padding:14px 16px;margin:12px 0}
.btn{display:inline-block;background:var(--vurgu);color:#fff;font-weight:700;padding:11px 18px;border-radius:99px;text-decoration:none;margin:6px 0}
.uc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}.uc div{border:1px solid var(--cizgi);border-radius:10px;padding:8px 4px}.uc b{display:block;font-size:22px}.uc small{color:var(--sol)}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:7px 6px;border-bottom:1px solid var(--cizgi);text-align:center}th:first-child,td:first-child{text-align:left}th{color:var(--sol);font-weight:600}
ul{padding-left:18px;margin:6px 0}.not{font-size:12.5px;color:var(--sol)}.lst a{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid var(--cizgi);text-decoration:none;color:var(--yazi)}.lst small{color:var(--sol);white-space:nowrap}
footer{font-size:12.5px;color:var(--sol);padding:16px 0 30px}`;

const sayfa = ({ title, desc, url, body, ld }) => `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${E(title)}</title><meta name="description" content="${E(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:site_name" content="Simuleto"><meta property="og:title" content="${E(title)}">
<meta property="og:description" content="${E(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${SITE}/icons/og-image.png">
<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/icons/icon-192.png">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}
<style>${CSS}</style></head><body><main>
<header><a class="l" href="/">Simuleto</a><a href="/mac/">Tüm maç analizleri</a></header>
${body}
<footer>Simuleto bir analiz ve kupon simülatörüdür, bahis yaptırmaz. Olasılıklar istatistiksel tahmindir; bahis tavsiyesi değildir, hiçbir bahis risksiz değildir. 18 yaş altı için değildir.</footer>
</main></body></html>`;

export function build(out) {
  const fx = oku('data/fixtures/latest.json'), fin = oku('data/fixtures/finished.json'), det = oku('data/fixtures/details.json');
  if (!fx || !Array.isArray(fx.m)) { console.warn('seo: latest.json yok, atlandi'); return 0; }
  const LG = fx.lg || {}, D = (det && det.m) || {}, ST = {};
  const tablo = c => (c in ST) ? ST[c] : (ST[c] = oku(`data/standings/${c}.json`));

  // maclar: latest + finished (ayni id tek)
  const ms = new Map();
  for (const x of fx.m) if (x && x.id && x.h && x.a && x.t) ms.set(x.id, { ...x });
  for (const x of (fin && fin.m) || []) if (x && x.id && x.h && x.a && x.t) {
    const o = ms.get(x.id) || { ...x, st: 'FT', sc: [x.x, x.y] };
    if (!o.p && x.p) o.p = x.p;
    ms.set(x.id, o);
  }

  const dir = path.join(out, 'mac');
  fs.rmSync(dir, { recursive: true, force: true });
  const liste = [];
  for (const m of ms.values()) {
    if (!LG[m.c]) continue;
    const t = new Date(m.t); if (isNaN(t)) continue;
    const lig = LG[m.c].ln || LG[m.c].n || m.c, d = D[m.id] || {};
    const s = `${slug(m.h)}-${slug(m.a)}-${gun(t)}`, url = `${SITE}/mac/${s}/`;
    const bitti = ['FT', 'AET', 'PEN'].includes(m.st) && Array.isArray(m.sc) && m.sc[0] != null;
    const app = `/#/mac/${[m.c, m.h, m.a].map(encodeURIComponent).join('/')}`;
    const tb = tablo(m.c), sat = n => tb && Array.isArray(tb.rows) ? tb.rows.find(r => r.n === n) : null;
    const rh = sat(m.h), ra = sat(m.a);
    const p = Array.isArray(m.p) && m.p.length === 3 && m.p.every(Number.isFinite) ? m.p : (d.odds && d.odds.p) || null;
    const ou = d.odds && d.odds.ou, bt = d.odds && d.odds.bt;

    const kisim = [];
    kisim.push(`<p class="alt">${E(lig)}${m.rd ? ' · ' + E(m.rd) : ''}</p>
<h1>${E(m.h)} – ${E(m.a)} maç analizi ve tahmini</h1>
<p class="alt">${E(tarihTR(t))}, ${E(saatTR(t))} (TSİ)${rh && rh.st ? ' · ' + E(rh.st) + (rh.city ? ', ' + E(rh.city) : '') : ''}${m.rf ? ' · Hakem: ' + E(m.rf) : ''}</p>
${bitti ? `<div class="kart"><h2>Maç sonucu</h2><p style="font-size:22px;font-weight:800;margin:0">${E(m.h)} ${m.sc[0]} – ${m.sc[1]} ${E(m.a)}</p></div>` : ''}
<a class="btn" href="${app}">Ayrıntılı analizi ve kupon simülatörünü aç</a>`);

    if (p) kisim.push(`<div class="kart"><h2>Kim kazanır? ${bitti ? '(maç öncesi)' : ''}</h2><div class="uc">
<div><small>${E(m.h)}</small><b>%${yuzde(p[0])}</b><small>adil oran ${adil(p[0])}</small></div>
<div><small>Beraberlik</small><b>%${yuzde(p[1])}</b><small>adil oran ${adil(p[1])}</small></div>
<div><small>${E(m.a)}</small><b>%${yuzde(p[2])}</b><small>adil oran ${adil(p[2])}</small></div></div>
${ou || bt ? `<ul>${ou ? `<li>2,5 üst (en az 3 gol): %${yuzde(ou[0])} · 2,5 alt: %${yuzde(ou[1])}</li>` : ''}${bt ? `<li>Karşılıklı gol var: %${yuzde(bt[0])} · yok: %${yuzde(bt[1])}</li>` : ''}</ul>` : ''}
<p class="not">Olasılıklar piyasa beklentisinden, pay çıkarılarak hesaplanır. Adil oran = 1 / olasılık; bahis sitesi oranı değildir.</p></div>`);
    else kisim.push(`<div class="kart"><h2>Kim kazanır?</h2><p>Bu maç için olasılık verisi henüz yok; maça yaklaştıkça eklenir. Modelin tahmini uygulamada görülebilir.</p></div>`);

    if (rh || ra) {
      const r = x => x ? `<td>${x.r}.</td><td>${x.p}</td><td>${x.pl}</td><td>${x.w}-${x.d}-${x.l}</td><td>${x.f}:${x.a}</td><td>${E(x.form || '–')}</td>` : '<td colspan="6">veri yok</td>';
      kisim.push(`<div class="kart"><h2>Puan durumu ve form</h2><table><tr><th>Takım</th><th>Sıra</th><th>Puan</th><th>Maç</th><th>G-B-M</th><th>Gol</th><th>Son 5</th></tr>
<tr><td>${E(m.h)}</td>${r(rh)}</tr><tr><td>${E(m.a)}</td>${r(ra)}</tr></table><p class="not">Form: G galibiyet, B beraberlik, M mağlubiyet (son maç sağda).</p></div>`);
    }
    if (Array.isArray(d.h2h) && d.h2h.length) {
      const l = d.h2h.slice(0, 6);
      kisim.push(`<div class="kart"><h2>Karşılıklı son maçlar</h2><table><tr><th>Maç</th><th>Skor</th><th>Tarih</th></tr>${l.map(x => `<tr><td>${E(x.h)} – ${E(x.a)}</td><td>${x.x}-${x.y}</td><td>${E(x.d || '')}</td></tr>`).join('')}</table></div>`);
    }
    if (Array.isArray(d.inj) && d.inj.length) {
      const NED = r => /suspend|card/i.test(r) ? 'cezalı' : /rest/i.test(r) ? 'dinlendirme' : /doubt|question/i.test(r) ? 'şüpheli' : /ill/i.test(r) ? 'hastalık' : /injur|knock|knee|ankle|muscle|hamstring|groin|calf|thigh|back|foot|shoulder/i.test(r) ? 'sakat' : '';
      const g = s => d.inj.filter(x => x.s === s && x.n).map(x => E(x.n) + (NED(x.r || '') ? ` (${NED(x.r || '')})` : ''));
      const gh = g('h'), ga = g('a');
      if (gh.length || ga.length) kisim.push(`<div class="kart"><h2>Eksikler</h2>${gh.length ? `<p><b>${E(m.h)}:</b> ${gh.join(', ')}</p>` : ''}${ga.length ? `<p><b>${E(m.a)}:</b> ${ga.join(', ')}</p>` : ''}</div>`);
    }
    kisim.push(`<div class="kart"><h2>Simuleto'da bu maç</h2><ul><li>Risk seviyesine göre tahminler (düşük riskli, dengeli, yüksek oran) ve her birinin nedeni</li><li>Muhtemel ve resmi 11'ler, canlı skor ve maç istatistikleri</li><li>Kupon simülatörü: kuponunun birlikte tutma ihtimali ve en zayıf halkası</li></ul><a class="btn" href="${app}">Simuleto'da aç</a></div>`);

    const ozet = p ? `${m.h} %${yuzde(p[0])}, beraberlik %${yuzde(p[1])}, ${m.a} %${yuzde(p[2])}. ` : '';
    const desc = `${m.h} – ${m.a} (${lig}, ${tarihTR(t)} ${saatTR(t)}) maç analizi: ${ozet}Puan durumu, form, karşılıklı maçlar ve kupon simülatörü.`;
    const ld = { '@context': 'https://schema.org', '@type': 'SportsEvent', name: `${m.h} – ${m.a}`, startDate: t.toISOString(), sport: 'Futbol',
      eventStatus: 'https://schema.org/EventScheduled', url, description: desc,
      homeTeam: { '@type': 'SportsTeam', name: m.h }, awayTeam: { '@type': 'SportsTeam', name: m.a },
      competitor: [{ '@type': 'SportsTeam', name: m.h }, { '@type': 'SportsTeam', name: m.a }],
      ...(rh && rh.st ? { location: { '@type': 'Place', name: rh.st, address: rh.city || undefined } } : {}) };
    fs.mkdirSync(path.join(dir, s), { recursive: true });
    fs.writeFileSync(path.join(dir, s, 'index.html'), sayfa({ title: `${m.h} – ${m.a} maç analizi ve tahmini (${gun(t).split('-').reverse().join('.')}) | Simuleto`, desc, url, body: kisim.join('\n'), ld }));
    liste.push({ s, t, m, lig, bitti });
  }

  liste.sort((a, b) => a.t - b.t);
  const gel = liste.filter(x => !x.bitti && x.t > Date.now() - 3 * 3600e3), gec = liste.filter(x => !gel.includes(x)).reverse();
  const sat = x => `<a href="/mac/${x.s}/"><span>${E(x.m.h)} – ${E(x.m.a)}${x.bitti ? ` <b>${x.m.sc[0]}-${x.m.sc[1]}</b>` : ''}<br><small>${E(x.lig)}</small></span><small>${E(saatTR(x.t))}<br>${E(new Intl.DateTimeFormat('tr-TR', { timeZone: IST, day: 'numeric', month: 'short' }).format(x.t))}</small></a>`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), sayfa({
    title: 'Günün maç analizleri ve tahminleri | Simuleto', url: `${SITE}/mac/`,
    desc: 'Bugünkü ve yaklaşan futbol maçlarının analizi: kazanma olasılıkları, adil oranlar, puan durumu, form ve karşılıklı maçlar.',
    body: `<h1>Maç analizleri ve tahminleri</h1><p class="alt">Süper Lig, Premier League, LaLiga, Serie A, Bundesliga ve diğer ligler. Saatler Türkiye saatidir.</p>
<div class="kart lst"><h2>Yaklaşan maçlar</h2>${gel.length ? gel.map(sat).join('') : '<p>Şu an yaklaşan maç yok.</p>'}</div>
${gec.length ? `<div class="kart lst"><h2>Biten maçlar</h2>${gec.map(sat).join('')}</div>` : ''}<a class="btn" href="/">Simuleto'yu aç</a>`,
  }));

  const bugun = new Date().toISOString().slice(0, 10);
  const urls = [`${SITE}/`, `${SITE}/mac/`, ...liste.map(x => `${SITE}/mac/${x.s}/`)];
  fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${u}</loc><lastmod>${bugun}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`seo: ${liste.length} maç sayfası, sitemap ${urls.length} adres`);
  return liste.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) build(path.resolve(root, process.argv[2] || 'yayin'));
