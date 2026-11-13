// Tasarim v2: masaustu (>=1100px) mac ve takim sayfalari, FotMob duzeninde.
// Uygulamanin detail() ve teamView() fonksiyonlarini sarar; telefonda/tablette eski gorunum aynen kalir.
// Veri: uygulamanin kendi verisi (R, TM, SLG, LU, LVD, PS, NW, pick/pa) + istege bagli ek veri
// data/extra/latest.json (istatistik ajani doldurur; sozlesme CLAUDE.md "Ek veri sozlesmesi").
// Ek veri yoksa ilgili kart HIC gosterilmez; veri uydurulmaz.
(function () {
  if (typeof detail !== 'function' || typeof teamView !== 'function') return;
  const MQ = matchMedia('(min-width:1100px)');
  let X = { matches: {}, teams: {} };
  fetch('data/extra/latest.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
    if (j && typeof j === 'object') { X = { matches: j.matches || {}, teams: j.teams || {}, at: j.at }; try { render(); } catch (e) { } }
  }).catch(() => { });

  const E = s => (typeof stE === 'function' ? stE(s) : String(s == null ? '' : s));
  const key = m => [m.c, m.h, m.a].join('|');
  const xm = m => (X.matches && X.matches[key(m)]) || {};
  const xt = n => (X.teams && X.teams[n]) || {};
  const card = (cls, inner) => `<section class="kmc ${cls || ''}">${inner}</section>`;
  const today = () => dk(new Date());
  const gunEtiket = t => { const d = dk(t), n = new Date(); if (d === today()) return 'Bugün'; if (d === dk(new Date(n.getTime() + 864e5))) return 'Yarın'; if (d === dk(new Date(n.getTime() - 864e5))) return 'Dün'; return ''; };
  const uzunTarih = t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });
  const kisaTarih = t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
  const ligAd = c => (typeof N !== 'undefined' && N[c]) || (LN[c] ? LN[c].split(' – ').pop() : c);
  const ulke = c => (LN[c] ? LN[c].split(' – ')[0] : '');
  const ic = {
    tarih: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>',
    stad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9c0-2 4-4 9-4s9 2 9 4v6c0 2-4 4-9 4s-9-2-9-4z"/><path d="M3 9c0 2 4 4 9 4s9-2 9-4"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 21h8"/></svg>',
    geri: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 6l-6 6 6 6"/></svg>',
    konum: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  };
  const sonuc = r => r === 'G' ? 'g' : r === 'M' ? 'm' : 'b';
  const son5 = n => (typeof SLG !== 'undefined' && SLG[n] ? SLG[n].slice(-5) : []);
  const siradaki = n => R.filter(x => (x.h === n || x.a === n) && stt(x).k === 'wait').sort((a, b) => a.t - b.t)[0];

  // ================= MAC SAYFASI =================
  function macBaslik(m) {
    const s = stt(m), x = xm(m), gun = gunEtiket(m.t);
    const alt = n => { const r = x.rank && (n === m.h ? x.rank.h : x.rank.a); if (r) return E(r); const t = TM[n]; return t && t.r ? `${E(ligAd(t.l))} · ${t.r}.` : ''; };
    const orta = s.sc
      ? `<b class="kmskor">${s.sc[0]} - ${s.sc[1]}</b><span>${s.k === 'ft' ? 'Maç sonu' : (s.k === 'live' || s.k === 'on') ? 'Canlı' : 'Son skor'}</span>`
      : `<b class="kmskor">${hm(m.t)}</b><span>${gun || dd(m.t)}</span>`;
    const bilgi = [`<span>${ic.tarih}${E(uzunTarih(m.t))}, ${hm(m.t)}</span>`];
    if (x.venue && x.venue.name) bilgi.push(`<span>${ic.stad}${E(x.venue.name)}</span>`);
    if (x.tv) bilgi.push(`<span>${ic.tv}${E(x.tv)}</span>`);
    const sek = [['p', 'Bilgiler'], ['k', 'Kadro'], ['i', 'İstatistik'], ['z', 'Tablo'], ['m', 'Maçlar'], ['s', 'Seriler']];
    return `<div class="kmc kmh">
      <div class="kmh-ust"><button class="kmgeri" data-bk="1">${ic.geri}<span>Maçlar</span></button>
        <div class="kmh-lig">${ligLg(m.c, 'orta')}${E(ligAd(m.c))}${x.round || m.rd ? ' · ' + E(x.round || m.rd) : ''}</div><span></span></div>
      <div class="kmh-bilgi">${bilgi.join('')}</div>
      <div class="kmh-skor">
        <div class="kmtk ev"><div><b data-tm="${E(m.h)}">${E(m.h)}</b><small>${alt(m.h)}</small></div>${bd(m.h, 1)}</div>
        <div class="kmorta">${orta}</div>
        <div class="kmtk dep">${bd(m.a, 1)}<div><b data-tm="${E(m.a)}">${E(m.a)}</b><small>${alt(m.a)}</small></div></div>
      </div>
      ${typeof dgl === 'function' ? dgl(m) : ''}
      <div class="kmsek">${sek.map(([k, l]) => `<button data-dt="${k}" class="${dt === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    </div>`;
  }
  // ---- oyuncu fotografi (API-Football): kimlik ya da adres varsa; yuklenmezse bas harf dairesi kalir ----
  const fotoUrl = (takim, p) => {
    if (p && p.ph) return p.ph;
    if (p && Number.isFinite(+p.id) && +p.id > 0) return `https://media.api-sports.io/football/players/${+p.id}.png`;
    try { if (window.KMX && typeof KMX.photo === 'function') return KMX.photo(takim, p && (p.n || p)) || ''; } catch (e) { }
    return '';
  };
  const fotoImg = u => u ? `<img class="kmfoto" src="${E(u)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="this.parentNode.classList.add('hf')" onerror="this.remove()">` : '';
  const basH = n => String(n || '').replace(/[^A-Za-zÇĞİÖŞÜçğıöşü. ]/g, '').trim().split(' ').pop().replace('.', '').slice(0, 2).toUpperCase();
  const renk = n => { try { const c = TC[n]; if (c) return c; } catch (e) { } return ['#4a5a68', '#cbd5dc']; };
  const nedenTr = r => { const s = String(r || ''); if (/suspen|card|ceza/i.test(s)) return 'Cezalı'; if (/injur|muscle|knee|ankle|hamstring|sakat/i.test(s)) return 'Sakat'; if (/doubt|şüphe/i.test(s)) return 'Şüpheli'; return s || 'Eksik'; };
  // davet listesi: FotMob kadro sekmesi duzeni (iki takim yan yana, mevkiye gore gruplu, fotografli)
  function davetListesi(m) {
    const X = window.KMX; if (!X || !X.byKey || !X.sq) return '';
    const e = X.byKey[key(m)]; if (!e) return '';
    const yan = [[m.h, e.hid, 'h'], [m.a, e.aid, 'a']];
    if (!yan.some(s => X.sq[s[1]] && X.sq[s[1]].p && X.sq[s[1]].p.length)) return '';
    const GR = [['K', 'Kaleciler'], ['D', 'Defans'], ['O', 'Orta saha'], ['F', 'Forvet']];
    const kol = ([n, id]) => {
      const sq = X.sq[id]; const [a, b] = renk(n);
      if (!sq || !sq.p || !sq.p.length) return `<div class="kmdl"><div class="kmdl-b">${bd(n)}<b>${E(n)}</b></div><p class="kmbos">Kadro listesi yok.</p></div>`;
      const sat = p => `<div class="kmoyr"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(p.n))}</i>${fotoImg(fotoUrl(n, p))}</span><div><b class="kmpln" data-pn="${E(n + '|' + p.n)}">${E(p.n)}</b><small>${p.no ? '#' + E(p.no) : ''}${p.no && p.a ? ' · ' : ''}${p.a ? E(p.a) + ' yaş' : ''}</small></div></div>`;
      return `<div class="kmdl"><div class="kmdl-b">${bd(n)}<b>${E(n)}</b><span>${sq.p.length} oyuncu</span></div>${GR.map(([k, l]) => { const ps = sq.p.filter(p => (p.p || '') === k); return ps.length ? `<h5>${l}</h5>${ps.map(sat).join('')}` : ''; }).join('')}</div>`;
    };
    const inj = e.inj || [];
    const eks = s => { const o = inj.filter(x => x.s === s); return o.length ? o.map(x => `<div class="kmeks"><i class="${/Cezalı/.test(nedenTr(x.r)) ? 'kmkk' : 'kmsk'}"></i><div><b>${E(x.n)}</b><small>${E(nedenTr(x.r))}</small></div></div>`).join('') : '<p class="kmbos">Açıklanan eksik yok.</p>'; };
    return card('kmkadro kmdavet', `<div class="kmkb kmkb1"><h3>Davet edilen oyuncular</h3></div>
      <p class="kmnot">Resmi ilk 11 açıklanınca (genelde maçtan 1 saat önce) burada sahada dizilişiyle görünür.</p>
      <div class="kmiki kmdl2">${kol(yan[0])}${kol(yan[1])}</div>
      <h4 class="kmalt">Sakat ve cezalı oyuncular</h4><div class="kmiki"><div>${eks('h')}</div><div>${eks('a')}</div></div>
      <p class="kmkay">Davet listesidir, maç kadrosu değildir. Kaynak: API-Football.</p>`);
  }
  // resmi ilk 11 (API ham veri, grid "satir:sutun"): FotMob gibi yatay saha, fotografli
  // mac istatistigi: uygulamanin STX tablosu; yenileme arasinda bossa dogrudan mac verisinden (details.json live)
  function stxOf(m) {
    try { const s = STX[key(m)]; if (s && (s.t || s.p)) return s; } catch (e) { }
    const X = window.KMX, e = X && X.byKey && X.byKey[key(m)], l = e && e.live;
    return l && (l.t || l.p) ? { t: l.t, p: l.p, src: 'API-Football' } : null;
  }
  // ================= BILGILER SEKMESI (FotMob mac sayfasi sirasi) =================
  // Veri: STX[k] (istatistik t, oyuncu puanlari p), LVD[k] (olaylar), KMX luRaw/lu (resmi 11, antrenor). Yoksa kart gizlenir.
  const adN = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/İ/g, 'i').toLowerCase().replace(/\./g, '').trim().split(/\s+/).filter(Boolean);
  const ayniAd = (a, b) => { const x = adN(a), y = adN(b); if (!x.length || !y.length) return false; if (x.join(' ') === y.join(' ')) return true; return x[x.length - 1] === y[y.length - 1] && x[0][0] === y[0][0]; };
  // oyuncu satiri: [ad, ?, puan, dakika, gol, asist, ..., kart(9), degisiklik(10) "▲58"/"▼70"]
  function oyuncuStat(m, s, ad) {
    const st = stxOf(m); const l = st && st.p && st.p[s]; if (!Array.isArray(l)) return null;
    return l.find(r => r[0] === ad) || l.find(r => ayniAd(r[0], ad)) || null;
  }
  const puanSinif = (p, enIyi) => enIyi ? 'iy' : p >= 7 ? 'g' : p >= 5 ? 'o' : 'k';
  function enIyiPuan(m) { const st = stxOf(m); if (!st || !st.p) return null; let b = null; ['h', 'a'].forEach(s => (st.p[s] || []).forEach(r => { if (+r[2] > 0 && (!b || +r[2] > +b[2])) b = r; })); return b; }
  function takimPuani(m, s) { const st = stxOf(m); const l = st && st.p && st.p[s]; if (!Array.isArray(l)) return null; const v = l.map(r => +r[2]).filter(x => x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
  const puanHap = (p, iy) => p > 0 ? `<b class="kmpu ${puanSinif(+p, iy)}">${(+p).toFixed(1).replace('.', ',')}${iy ? ' ★' : ''}</b>` : '';
  const dakikaYaz = m => (+m > 90 ? '90+' + (+m - 90) : String(m)) + "'";
  const icon = {
    gol: '<svg class="kmic-g" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#111" stroke-width="1.6"/><path d="M12 7.2l3.3 2.4-1.3 3.9h-4l-1.3-3.9z" fill="#111"/></svg>',
    cik: '<svg class="kmic-c" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#e5534b"/><path d="M14 7l-5 5 5 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gir: '<svg class="kmic-c" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2f9e63"/><path d="M10 7l5 5-5 5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    krampon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 15.5c0-1.2.8-2 2-2.2l5.5-.8 2.2-4.8c.3-.7 1.2-.9 1.8-.4l2.3 1.9 3.2.6c1 .2 1.7 1 1.7 2v2.7c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2z"/><path d="M6 19h2v1.6H6zM10.5 19h2v1.6h-2zM15 19h2v1.6h-2z"/></svg>',
    deg: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h13l-3-3" stroke="#2f9e63"/><path d="M20 15H7l3 3" stroke="#e5534b"/></svg>',
  };
  // 1) Onemli istatistik (topa sahip olma cubugu + secili satirlar)
  function onemliIstatistik(m) {
    const st = stxOf(m); if (!st || !Array.isArray(st.t) || !st.t.length) return '';
    const bul = re => st.t.find(r => re.test(r[0]));
    const pos = bul(/Topla oynama/i);
    const sat = [[/Beklenen gol/i, 'Beklenen goller (xG)'], [/^Şut$/i, 'Toplam şut'], [/İsabetli şut/i, 'İsabetli şut'], [/Korner/i, 'Korner'], [/Faul/i, 'Faul']].map(([re, ad]) => [bul(re), ad]).filter(x => x[0]);
    if (!pos && !sat.length) return '';
    const ch = EVR, ca = DPR;
    const say = v => (typeof v === 'number' && v % 1 ? v.toFixed(2).replace('.', ',') : E(v));
    const satir = ([r, ad]) => { const a = +r[1], b = +r[2], ust = /Faul/i.test(ad) ? 0 : (a > b ? 1 : b > a ? 2 : 0);
      return `<div class="kmois"><span class="${ust === 1 ? 'on' : ''}" style="--tc:${E(ch)}">${say(r[1])}</span><em>${E(ad)}</em><span class="${ust === 2 ? 'on' : ''}" style="--tc:${E(ca)}">${say(r[2])}</span></div>`; };
    return card('kmoist', `<h3 class="kmb orta">Önemli istatistik</h3>
      ${pos ? `<div class="kmoip"><small>Topa sahip olma</small><div class="kmoibar"><b style="flex:${+pos[1]};--tc:${E(ch)}">%${E(pos[1])}</b><b style="flex:${+pos[2]};--tc:${E(ca)}">%${E(pos[2])}</b></div></div>` : ''}
      ${sat.map(satir).join('')}
      <button class="kmtumi" data-dt="i">Tüm istatistikler</button>`);
  }
  // 2) Etkinlikler (olaylar zaman cizelgesi; ev solda, deplasman sagda, ortada dakika)
  function etkinlikler(m) {
    const v = LVD[key(m)]; const ev = v && Array.isArray(v.ev) ? v.ev.slice() : [];
    if (!ev.some(e => e.k !== 'ex')) return '';
    ev.sort((a, b) => (+a.m || 0) - (+b.m || 0) || (a.k === 'ht' ? -1 : b.k === 'ht' ? 1 : 0));
    const skorYaz = (sc, s) => { const p = String(sc || '').split('-').map(x => x.trim()); if (p.length !== 2) return ''; return ` (<i class="${s === 'h' ? 'on' : ''}">${E(p[0])}</i> - <i class="${s === 'a' ? 'on' : ''}">${E(p[1])}</i>)`; };
    const ic2 = e => e.k === 'g' ? icon.gol : e.k === 'y' ? '<i class="kmkrt s"></i>' : e.k === 'r' ? '<i class="kmkrt k"></i>' : e.k === 's' ? icon.deg : '';
    const ic3 = e => e.k === 'g' ? `<b>${E(e.a || 'Golcü verisi yok')}${skorYaz(e.sc, e.s)}</b>${e.b ? `<small>asisti yapan: ${E(e.b)}</small>` : ''}`
      : (e.k === 'y' || e.k === 'r') ? `<b>${E(e.a || '')}</b><small>${e.k === 'r' ? 'Kırmızı kart' : 'Sarı kart'}</small>`
      : e.k === 's' ? `<b class="gir">${E(e.a || '')}</b><b class="cik">${E(e.b || '')}</b>` : '';
    const sat = e => {
      if (e.k === 'ht') return `<div class="kmetay"><span>İY ${E(String(e.sc || '').replace(/\s/g, ''))}</span></div>`;
      if (!['g', 'y', 'r', 's'].includes(e.k)) return '';
      const ic = `<span class="kmeti">${ic2(e)}</span>`, yazi = `<div class="kmety">${ic3(e)}</div>`;
      return `<div class="kmet ${e.s === 'a' ? 'a' : 'h'}"><div class="kmetl">${e.s === 'a' ? '' : yazi + ic}</div><span class="kmetm">${dakikaYaz(e.m)}</span><div class="kmetr">${e.s === 'a' ? ic + yazi : ''}</div></div>`;
    };
    const s = stt(m), son = s.k === 'ft' && s.sc ? `<div class="kmetay"><span>MS ${E(s.sc[0])} - ${E(s.sc[1])}</span></div>` : '';
    return card('kmetk', `<h3 class="kmb orta">Etkinlikler</h3><div class="kmetw">${ev.map(sat).join('')}${son}</div>${v.src ? `<p class="kmkay">Kaynak: ${E(v.src)}</p>` : ''}`);
  }
  // 5) Sonraki mac (iki takimin siradaki maci)
  function sonrakiMac(m) {
    const kol = n => { const x = siradaki(n); if (!x) return '';
      return `<div class="kmsnm" data-kmm="${E(key(x))}"><small>${E(ligAd(x.c))}</small><div><span>${bd(x.h, 1)}<b>${E(x.h)}</b></span><span class="kmsnm-o"><b>${hm(x.t)}</b><small>${E(gunEtiket(x.t) || kisaTarih(x.t))}</small></span><span>${bd(x.a, 1)}<b>${E(x.a)}</b></span></div></div>`; };
    const a = kol(m.h), b = kol(m.a);
    if (!a && !b) return '';
    return card('kmsnmk', `<h3 class="kmb orta">Sonraki maç</h3><div class="kmiki">${a || '<p class="kmbos">Sonraki maç verisi yok.</p>'}${b || '<p class="kmbos">Sonraki maç verisi yok.</p>'}</div>`);
  }
  function hamSaha(m, raw) {
    const ok = t => t && Array.isArray(t.xi) && t.xi.length >= 10 && t.xi.every(p => /^\d+:\d+$/.test(String(p.grid || '')));
    if (!ok(raw.h) || !ok(raw.a)) return '';
    const iy = enIyiPuan(m);
    const MEV = { G: 'Kaleci', D: 'Defans', M: 'Orta saha', F: 'Forvet' };
    const isaret = r => {
      if (!r) return { pu: '', ust: '', alt: '' };
      const dg = String(r[10] || ''), g = +r[4] || 0, kart = String(r[9] || '');
      const pu = puanHap(r[2], iy && iy === r);
      const ust = /▼/.test(dg) ? `<span class="kmpcik">${E(dg.replace('▼', ''))}'${icon.cik}</span>` : '';
      const alt = (g ? `<span class="kmpgol">${icon.gol.repeat(Math.min(g, 3))}</span>` : '') + (kart ? `<span class="kmpkrt"><i class="kmkrt ${/R/.test(kart) ? 'k' : 's'}"></i></span>` : '');
      return { pu, ust, alt };
    };
    const oyuncu = (n, p, s) => { const [a, b] = renk(n), r = oyuncuStat(m, s, p.n), i = isaret(r);
      return `<div class="pp kmpp" data-pn="${E(n)}|${E(p.n)}">${i.ust}<span class="kmav buyuk" style="--ka:${a};--kb:${b}"><i>${E(p.no || basH(p.n))}</i>${fotoImg(fotoUrl(n, p))}</span>${i.pu}${i.alt ? `<span class="kmpalt">${i.alt}</span>` : ''}<span>${p.no ? `<em>${E(p.no)}</em> ` : ''}${E(String(p.n).split(' ').pop())}</span></div>`; };
    const sutunlar = (n, t, ters, s) => {
      const g = {}; t.xi.forEach(p => { const [r, c] = String(p.grid).split(':').map(Number); (g[r] = g[r] || []).push([c, p]); });
      return Object.keys(g).map(Number).sort((x, y) => x - y).map(r => {
        const l = g[r].sort((x, y) => x[0] - y[0]).map(x => x[1]); if (ters) l.reverse();
        return `<div class="kmps">${l.map(p => oyuncu(n, p, s)).join('')}</div>`;
      }).join('');
    };
    const yedek = (n, t, s) => {
      const l = (t.bn || []).map(p => ({ p, r: oyuncuStat(m, s, p.n) }));
      if (!l.length) return '<p class="kmbos">Yedek listesi yok.</p>';
      const gir = x => { const d = String(x.r && x.r[10] || ''); return /▲/.test(d) ? +d.replace('▲', '') : 999; };
      l.sort((x, y) => gir(x) - gir(y));
      return l.map(({ p, r }) => { const [a, b] = renk(n), d = String(r && r[10] || '');
        return `<div class="kmoyr kmyd"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(p.no || basH(p.n))}</i>${fotoImg(fotoUrl(n, p))}</span>${r && +r[2] > 0 ? puanHap(r[2], iy && iy === r) : '<b class="kmpu bos"></b>'}<em class="kmno">${E(p.no || '')}</em><div><b class="kmpln" data-pn="${E(n + '|' + p.n)}">${E(p.n)}</b><small>${E(MEV[p.pos] || '')}</small></div>${/▲/.test(d) ? `<span class="kmgir">${E(d.replace('▲', ''))}'${icon.gir}</span>` : ''}</div>`; }).join('');
    };
    const X = window.KMX, e = X && X.byKey && X.byKey[key(m)], inj = (e && e.inj) || [], lu = e && e.lu;
    const eks = s => { const o = inj.filter(x => x.s === s); return o.length ? o.map(x => `<div class="kmeks"><i class="${/Cezalı/.test(nedenTr(x.r)) ? 'kmkk' : 'kmsk'}"></i><div><b>${E(x.n)}</b><small>${E(nedenTr(x.r))}</small></div></div>`).join('') : '<p class="kmbos">Açıklanan eksik yok.</p>'; };
    const tp = s => { const v = takimPuani(m, s); return v ? puanHap(v.toFixed(1)) : ''; };
    const hoca = lu && (lu.h && lu.h.co || lu.a && lu.a.co) ? `<div class="kmhoca"><span>${E(lu.h && lu.h.co || '–')}</span><b>Antrenör</b><span>${E(lu.a && lu.a.co || '–')}</span></div>` : '';
    return card('kmkadro', `<div class="kmkb"><div>${tp('h')}${bd(m.h)}<b>${E(m.h)}</b><span>${E(raw.h.f || '')}</span></div><h3>Resmi ilk 11</h3><div><span>${E(raw.a.f || '')}</span><b>${E(m.a)}</b>${bd(m.a)}${tp('a')}</div></div>
      <div class="kmsaha"><i class="kmorta-c"></i><i class="kmorta-n"></i><i class="kmceza s"></i><i class="kmceza g"></i>
        <div class="kmyari">${sutunlar(m.h, raw.h, true, 'h')}</div><div class="kmyari dep">${sutunlar(m.a, raw.a, false, 'a')}</div></div>
      ${hoca}
      <h4 class="kmalt orta">Yedekler</h4><div class="kmiki">${'<div>' + yedek(m.h, raw.h, 'h') + '</div><div>' + yedek(m.a, raw.a, 'a') + '</div>'}</div>
      <details class="kmeksd"><summary>Sakat ve cezalı oyuncular</summary><div class="kmiki"><div>${eks('h')}</div><div>${eks('a')}</div></div></details>
      <p class="kmkay">Kaynak: API-Football (resmi ilk 11${stxOf(m) && stxOf(m).p ? ', oyuncu puanları' : ''}).</p>`);
  }
  function kadroKarti(m) {
    try { const raw = window.KMX && typeof KMX.luRaw === 'function' && KMX.luRaw(m); if (raw) { const h = hamSaha(m, raw); if (h) return h; } } catch (e) { }
    const lu = LU[key(m)];
    if (!lu) return davetListesi(m) || (window.KMX && KMX.squadCard && KMX.squadCard(m)) || card('kmkadro', `<h3 class="kmb">Kadro</h3><p class="kmbos">Bu maç için muhtemel 11 ya da kadro verisi yok.</p>`);
    const iki = pitchOk(lu.h) && pitchOk(lu.a);
    let saha = '';
    if (iki) {
      const prev = typeof CURM !== 'undefined' ? CURM : null; try { CURM = m; } catch (e) { }
      const sutun = (n, t, ters) => { const rs = rowsOf(t).map(r => ters ? r.slice().reverse() : r); return rs.map(r => `<div class="kmps">${r.map(p => shirtP(n, p)).join('')}</div>`).join(''); };
      saha = `<div class="kmsaha"><i class="kmorta-c"></i><i class="kmorta-n"></i><i class="kmceza s"></i><i class="kmceza g"></i>
        <div class="kmyari">${sutun(m.h, lu.h, true)}</div><div class="kmyari dep">${sutun(m.a, lu.a, false)}</div></div>`;
      try { CURM = prev; } catch (e) { }
    } else saha = `<p class="kmbos">Diziliş bilgisi eksik; oyuncu listesi aşağıda.</p>`;
    const xh = xt(m.h), xa = xt(m.a);
    const hoca = (xh.coach || xa.coach) ? `<div class="kmhoca"><span>${E(xh.coach || '–')}</span><b>Antrenör</b><span>${E(xa.coach || '–')}</span></div>` : '';
    const eksik = t => (t && t.out && t.out.length) ? t.out.map(o => { const a = (typeof absIc === 'function') ? absIc(o[1]) : ['', '']; return `<div class="kmeks"><i class="${a[0]}">${a[1]}</i><div><b>${E(o[0])}</b><small>${E(o[1])}</small></div></div>`; }).join('') : '<p class="kmbos">Açıklanan eksik yok.</p>';
    const liste = (!iki) ? `<div class="kmiki">${[lu.h, lu.a].map(t => `<ol class="kmxi">${(t && t.xi || []).map(p => `<li>${E(String(p).split('|').pop())}</li>`).join('')}</ol>`).join('')}</div>` : '';
    return card('kmkadro', `<div class="kmkb"><div>${bd(m.h)}<b>${E(m.h)}</b><span>${E(lu.h && lu.h.f || '')}</span></div><h3>${E(lu.t || 'Kadro')}</h3><div><span>${E(lu.a && lu.a.f || '')}</span><b>${E(m.a)}</b>${bd(m.a)}</div></div>
      ${saha}${liste}${hoca}
      <h4 class="kmalt">Sakat ve cezalı oyuncular</h4><div class="kmiki">${'<div>' + eksik(lu.h) + '</div><div>' + eksik(lu.a) + '</div>'}</div>
      ${lu.src ? `<p class="kmkay">Kaynak: ${E(lu.src)}</p>` : ''}`);
  }
  // biriken biten maclar (veri oturumu: data/fixtures/finished.json = {at, m:[{id,c,t,h,a,x,y}]}); yoksa bos
  let BITEN = [];
  fetch('data/fixtures/finished.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { if (j && Array.isArray(j.m)) { BITEN = j.m; try { render(); } catch (e) { } } }).catch(() => { });
  // Takim formu: once lig kaydi (SLG); yoksa uygulamadaki biten maclar + karsilasma gecmisi (tum yarismalar), acilan mac haric
  function formListesi(n, m) {
    const slg = son5(n);
    if (slg.length) return slg.slice().reverse().map(r => ({ ev: r.H ? n : r.o, dep: r.H ? r.o : n, sk: r.H ? `${r.f} - ${r.c}` : `${r.c} - ${r.f}`, r: r.r }));
    const l = [], gor = new Set(), ren = (x, y) => x > y ? 'G' : x < y ? 'M' : 'B';
    const ekle = (h, a, x, y, t) => { const k = h + '|' + a + '|' + x + '-' + y + '|' + new Date(t).toISOString().slice(0, 10); if (gor.has(k)) return; gor.add(k); l.push({ ev: h, dep: a, sk: x + ' - ' + y, r: h === n ? ren(x, y) : ren(y, x), t }); };
    BITEN.forEach(x => { if (!x || (x.h !== n && x.a !== n) || (x.c === m.c && x.h === m.h && x.a === m.a)) return; const t = Date.parse(x.t); if (t && Number.isFinite(+x.x) && Number.isFinite(+x.y)) ekle(x.h, x.a, +x.x, +x.y, t); });
    R.forEach(x => { if (key(x) === key(m) || (x.h !== n && x.a !== n)) return; const s2 = stt(x); if (s2.k === 'ft' && s2.sc) ekle(x.h, x.a, +s2.sc[0], +s2.sc[1], x.t); });
    try { Object.values(HH).forEach(arr => (arr || []).forEach(r => { if (r.h !== n && r.a !== n) return; const p = String(r.d || '').split('.'); const t = p.length === 3 ? Date.UTC(+p[2], +p[1] - 1, +p[0]) : 0; if (t && t < m.t - 36e5) ekle(r.h, r.a, +r.x, +r.y, t); })); } catch (e) { }
    return l.sort((p, q) => q.t - p.t).slice(0, 5);
  }
  function formKarti(m) {
    const sat = n => formListesi(n, m).map(r => `<div class="kmfs"><span data-tm="${E(r.ev)}">${E(r.ev)}</span><i class="kmhap ${sonuc(r.r)}">${r.sk}</i><span data-tm="${E(r.dep)}">${E(r.dep)}</span></div>`).join('') || '<p class="kmbos">Form verisi yok.</p>';
    return card('kmform', `<h3 class="kmb orta">Takım formu</h3><div class="kmiki"><div>${sat(m.h)}</div><div>${sat(m.a)}</div></div>`);
  }
  // Karsilasmalar (FotMob H2H): galibiyet/beraberlik ozeti + son maclar
  function h2hKarti(m) {
    let l = null; try { l = HH[[m.h, m.a].sort().join('|')]; } catch (e) { }
    if (!Array.isArray(l) || !l.length) return '';
    const kaz = n => l.filter(r => (r.h === n && r.x > r.y) || (r.a === n && r.y > r.x)).length, ber = l.filter(r => r.x === r.y).length;
    const sat = r => `<div class="kmh2s"><small>${E(r.d || '')}</small><span class="${r.x > r.y ? 'b' : ''}">${E(r.h)}${bd(r.h)}</span><i class="kmh2sk">${r.x} - ${r.y}</i><span class="${r.y > r.x ? 'b' : ''}">${bd(r.a)}${E(r.a)}</span></div>`;
    return card('kmh2h', `<h3 class="kmb orta">Karşılaşmalar <small>son ${l.length} maç</small></h3>
      <div class="kmh2o"><div>${bd(m.h, 1)}<b>${kaz(m.h)}</b><small>Galibiyet</small></div><div><span class="kmx">B</span><b>${ber}</b><small>Beraberlik</small></div><div>${bd(m.a, 1)}<b>${kaz(m.a)}</b><small>Galibiyet</small></div></div>
      ${l.slice(0, 6).map(sat).join('')}`);
  }
  // Maclar sekmesi: iki takimin son lig maclari (FotMob form listesi gibi), ev/deplasman suzgeci
  let SMF = 'tum';
  function sonMaclarKarti(m) {
    const kol = (n, H) => {
      let l = son5(n).length ? (SLG[n] || []).slice().reverse() : [];
      if (SMF === 'yer') l = l.filter(r => r.H === H);
      l = l.slice(0, 10);
      const sat = r => { const ev = r.H ? n : r.o, dep = r.H ? r.o : n, sk = r.H ? `${r.f} - ${r.c}` : `${r.c} - ${r.f}`; return `<div class="kmsm2"><small>${r.w ? E(r.w) + '. hafta' : ''}</small><span class="${ev === n ? 'b' : ''}" data-tm="${E(ev)}">${E(ev)}${bd(ev)}</span><i class="kmhap ${sonuc(r.r)}">${sk}</i><span class="${dep === n ? 'b' : ''}" data-tm="${E(dep)}">${bd(dep)}${E(dep)}</span></div>`; };
      return `<div><div class="kmdl-b">${bd(n)}<b>${E(n)}</b><span>${SMF === 'yer' ? (H ? 'evinde' : 'deplasmanda') : 'son lig maçları'}</span></div>${l.length ? l.map(sat).join('') : '<p class="kmbos">Kayıtlı lig maçı yok.</p>'}</div>`;
    };
    return card('kmsonm', `<div class="kmb2"><h3 class="kmb">Son maçlar</h3><div class="kmsuz"><button data-kmsmf="tum" class="${SMF === 'tum' ? 'on' : ''}">Tümü</button><button data-kmsmf="yer" class="${SMF === 'yer' ? 'on' : ''}">${E(m.h)} evinde · ${E(m.a)} deplasmanda</button></div></div><div class="kmiki">${kol(m.h, 1)}${kol(m.a, 0)}</div>`);
  }
  function olaylarKarti(m) {
    const v = LVD[key(m)];
    if (!v || !(v.ev || []).length) return '';
    return card('kmolay', `<h3 class="kmb">Maç özeti <small>${E(v.m || '')} · ${E(v.at || '')}</small></h3>${evh(v.ev || [], m)}<p class="kmkay">Kaynak: ${E(v.src || '')}</p>`);
  }
  function kimKazanir(m) {
    if (m.np || !m.p) return '';
    let a, b, c; try { [a, b, c] = pa(m); } catch (e) { [a, b, c] = m.p; }
    const P = [a, b, c], f = P.indexOf(Math.max(a, b, c));
    return card('kmkim', `<h3 class="kmb orta">Kim kazanır? <small>model</small></h3>
      <div class="kmkim-r"><div>${bd(m.h, 1)}</div><div><span class="kmx">X</span></div><div>${bd(m.a, 1)}</div></div>
      <div class="kmkim-o">${P.map((p, i) => `<div class="${i === f ? 'f' : ''}"><small>${['1', 'X', '2'][i]}</small><b>%${Math.round(p * 100)}</b><em>adil ${p > 0 ? (1 / p).toFixed(2) : '–'}</em></div>`).join('')}</div>
      <p class="kmkay">Adil oran = 1 ÷ ihtimal; bahis sitesi oranı değildir.</p>`);
  }
  function stadKarti(v) {
    if (!v || !v.name) return '';
    const s = [];
    if (v.cap) s.push(`<div class="kmsr"><span>Kapasite</span><b>${E(Number(v.cap).toLocaleString('tr-TR'))}</b></div>`);
    if (v.surface) s.push(`<div class="kmsr"><span>Zemin</span><b>${E(v.surface)}</b></div>`);
    if (v.weather) s.push(`<div class="kmsr"><span>Hava</span><b>${E(v.weather)}</b></div>`);
    return card('kmstad', `<div class="kmstad-b">${ic.konum}<div><b>${E(v.name)}</b><small>${E(v.city || '')}</small></div></div>${s.join('')}`);
  }
  function hakemKarti(r) {
    if (!r || !r.name) return '';
    const k = (l, v) => v == null ? '' : `<div><small>${l}</small><b>${E(v)}</b><span>/ maç</span></div>`;
    return card('kmhakem', `<h3 class="kmb">Hakem</h3><div class="kmhk"><b>${E(r.name)}</b><small>${E(r.country || '')}</small></div>${(r.yc != null || r.fouls != null) ? `<div class="kmhk2">${k('Sarı kart', r.yc)}${k('Faul', r.fouls)}</div>` : ''}${r.src ? `<p class="kmkay">Kaynak: ${E(r.src)}</p>` : ''}`);
  }
  function bilgiKarti(m) {
    const x = xm(m), lu = LU[key(m)];
    if (x.insights && x.insights.length) return card('kmbilgi', `<h3 class="kmb orta">Bilgiler</h3>${x.insights.map(i => `<div class="kmbi">${i.tm ? bd(i.tm) : '<span></span>'}<p>${E(i.x)}</p></div>`).join('')}${x.src ? `<p class="kmkay">Kaynak: ${E(x.src)}</p>` : ''}`);
    if (lu && lu.why) return card('kmbilgi', `<h3 class="kmb orta">Maç notu</h3><div class="kmbi"><span></span><p>${E(lu.why)}</p></div>${lu.src ? `<p class="kmkay">Kaynak: ${E(lu.src)}</p>` : ''}`);
    return '';
  }
  // eski detail0 ciktisindan secilen parcalar (tahminler, haberler, sekme icerigi)
  function eskiParcalar(m, eski) {
    const t = document.createElement('div'); t.innerHTML = eski;
    const al = s => { const e = t.querySelector(s); if (!e) return ''; const h = e.outerHTML; e.remove(); return h; };
    const bas = t.querySelector('.dh2'); if (bas) bas.remove();
    return { tbx: al('.tbx'), nwb: al('.nwb'), kalan: t.innerHTML };
  }
  // ================= ISTATISTIK SEKMESI (FotMob duzeni) =================
  // Takim: STX[k].t (API takim istatistikleri) + oyuncu verisinden toplananlar (live.px varsa). Oyuncu: live.px, yoksa STX.p (sinirli).
  const EVR = '#D63630', DPR = '#4668D6';
  let OIS = 'onem', OSS = { k: 'r', y: -1 };
  let DV = 'tum';
  function devreVeri(m) { const X = window.KMX, e = X && X.byKey && X.byKey[key(m)], th = e && e.live && e.live.th; if (!th) return null; const ok = v => Array.isArray(v) && v.length; return ok(th['1']) || ok(th['2']) ? th : null; }
  function pxVeri(m) {
    const X = window.KMX, e = X && X.byKey && X.byKey[key(m)], px = e && e.live && e.live.px;
    if (px && (px.h || px.a)) return { tam: true, h: px.h || [], a: px.a || [] };
    const st = stxOf(m); if (!st || !st.p) return null;
    const cv = r => ({ n: r[0], r: +r[2] > 0 ? +r[2] : null, min: r[3] === '' ? null : +r[3], g: +r[4] || 0, a: +r[5] || 0, y: /Y/.test(r[9] || '') ? 1 : 0, rd: /R/.test(r[9] || '') ? 1 : 0 });
    return { tam: false, h: (st.p.h || []).map(cv), a: (st.p.a || []).map(cv) };
  }
  const topla = (l, f) => l.reduce((s, p) => s + (+p[f] || 0), 0);
  function istatSatir(ad, a, b, o) {
    o = o || {};
    if (a == null || b == null || (Number.isNaN(+a) && typeof a !== 'string')) return '';
    const na = o.na != null ? +o.na : +a, nb = o.nb != null ? +o.nb : +b;
    const ust = o.az ? (na < nb ? 1 : nb < na ? 2 : 0) : (na > nb ? 1 : nb > na ? 2 : 0);
    const f = v => (typeof v === 'number' && v % 1 ? v.toFixed(2).replace('.', ',') : E(v));
    return `<div class="kmois"><span class="${ust === 1 ? 'on' : ''}" style="--tc:${EVR}">${f(a)}</span><em>${E(ad)}</em><span class="${ust === 2 ? 'on' : ''}" style="--tc:${DPR}">${f(b)}</span></div>`;
  }
  function istatGrup(baslik, satirlar) { const h = satirlar.join(''); return h ? `<div class="kmisg"><h4>${E(baslik)}</h4>${h}</div>` : ''; }
  function istatistikSekmesi(m) {
    const st = stxOf(m), th = devreVeri(m);
    if (DV !== 'tum' && !(th && Array.isArray(th[DV]) && th[DV].length)) DV = 'tum';
    const t = DV !== 'tum' ? th[DV] : (st && Array.isArray(st.t) ? st.t : []);
    const px0 = pxVeri(m), px = DV === 'tum' ? px0 : (px0 ? { tam: false, h: [], a: [] } : null);
    const secici = th ? `<div class="kmdvs">${[['tum', 'Tümü'], ['1', '1.'], ['2', '2.']].filter(([k]) => k === 'tum' || (Array.isArray(th[k]) && th[k].length)).map(([k, l]) => `<button data-kmdv="${k}" class="${DV === k ? 'on' : ''}">${l}</button>`).join('')}</div>` : '';
    if (!t.length && !px) return card('kmistat', `<h3 class="kmb">İstatistikler</h3><p class="kmbos">Bu maç için istatistik verisi yok. Maç başladıktan sonra kaynak verdikçe görünür.</p>`);
    const T = re => { const r = t.find(x => re.test(x[0])); return r ? [r[1], r[2]] : null; };
    const S = (ad, re, o) => { const v = T(re); return v ? istatSatir(ad, v[0], v[1], o) : ''; };
    const yuzde = (x, y) => y > 0 ? Math.round(x / y * 100) : null;
    const P = px && px.tam ? px : null, ph = P ? P.h : [], pa = P ? P.a : [];
    const PT = (f) => P ? [topla(ph, f), topla(pa, f)] : null;
    const PS2 = (ad, f, o) => { const v = PT(f); return v ? istatSatir(ad, v[0], v[1], o) : ''; };
    const oran = (ad, fx, fy) => { if (!P) return ''; const a = topla(ph, fx), at = topla(ph, fy), b = topla(pa, fx), bt = topla(pa, fy); if (!at && !bt) return ''; return istatSatir(ad, `${a} (%${yuzde(a, at) ?? 0})`, `${b} (%${yuzde(b, bt) ?? 0})`, { na: a, nb: b }); };
    const pas = T(/^Toplam pas/i), isp = T(/İsabetli pas/i);
    const pos = T(/Topla oynama/i);
    const onem = [
      pos ? `<div class="kmoip"><small>Topa sahip olma</small><div class="kmoibar"><b style="flex:${+pos[0]};--tc:${EVR}">%${E(pos[0])}</b><b style="flex:${+pos[1]};--tc:${DPR}">%${E(pos[1])}</b></div></div>` : '',
      S('Beklenen goller (xG)', /Beklenen gol/i), S('Toplam şut', /^Şut$/i), S('İsabetli şut', /İsabetli şut/i),
      pas && isp ? istatSatir('Tutarlı pas', `${isp[0]} (%${yuzde(isp[0], pas[0])})`, `${isp[1]} (%${yuzde(isp[1], pas[1])})`, { na: isp[0], nb: isp[1] }) : '',
      S('Sarı kartlar', /Sarı kart/i, { az: 1 }), S('Korner', /Korner/i),
    ];
    const G = {
      xg: istatGrup('Beklenen goller (xG)', [S('Beklenen goller (xG)', /Beklenen gol/i), S('Kalecinin önlediği gol', /önlenen|önlediği/i)]),
      sut: istatGrup('Şut', [S('Toplam şut', /^Şut$/i), S('İsabetsiz şut', /İsabetsiz şut/i), S('İsabetli şut', /İsabetli şut/i), S('Engellenen şut', /Engellenen şut/i), S('Ceza sahasından şut', /Ceza sahası içi/i), S('Ceza sahası dışından şut', /Ceza sahası dışı/i)]),
      pas: istatGrup('Pas', [S('Pas', /^Toplam pas/i), pas && isp ? istatSatir('Tutarlı pas', `${isp[0]} (%${yuzde(isp[0], pas[0])})`, `${isp[1]} (%${yuzde(isp[1], pas[1])})`, { na: isp[0], nb: isp[1] }) : '', PS2('Kilit pas', 'kp'), S('Korner', /Korner/i), S('Ofsayt', /Ofsayt/i, { az: 1 })]),
      sav: istatGrup('Savunma', [PS2('Top çalma', 'tk'), PS2('Top kapma', 'int'), PS2('Blok', 'bl'), S('Kaleci kurtarışı', /Kaleci kurtarış/i)]),
      muc: istatGrup('Mücadele', [oran('Kazanılan ikili mücadele', 'dw', 'du'), oran('Başarılı çalım', 'drs', 'dra'), PS2('Kazanılan faul', 'fd')]),
      cez: istatGrup('Cezalar', [S('Sarı kartlar', /Sarı kart/i, { az: 1 }), S('Kırmızı kartlar', /Kırmızı kart/i, { az: 1 }), S('Faul', /^Faul$/i, { az: 1 }), S('Serbest vuruş', /Serbest vuruş/i)]),
    };
    const takim = t.length ? card('kmistat', `${secici}<div class="kmisw"><div class="kmisk"><div class="kmisg kmisg1"><h4>Önemli istatistik</h4>${onem.join('')}</div>${G.pas}${G.cez}</div><div class="kmisk">${G.xg}${G.sut}${G.sav}${G.muc}</div></div>
      <p class="kmkay">Kaynak: API-Football${DV !== 'tum' ? ' (' + DV + '. yarı; oyuncu verisinden toplanan satırlar devreye bölünmediği için gösterilmez)' : ''}${P ? '; kilit pas, top çalma, top kapma, blok, ikili mücadele, çalım ve kazanılan faul oyuncu verilerinin toplamıdır' : ''}.</p>`) : '';
    return takim + oyuncuIstatTablosu(m, px0, DV !== 'tum');
  }
  // oyuncu istatistikleri tablosu (sekmeli, siralanabilir)
  function oyuncuIstatTablosu(m, px, devreNot) {
    if (!px) return '';
    const sat = [...px.h.map(p => ({ ...p, s: 'h' })), ...px.a.map(p => ({ ...p, s: 'a' }))].filter(p => p.min > 0 || p.r);
    if (!sat.length) return '';
    const yz = (x, y) => (y > 0 ? `${x}/${y}` : '0');
    const def = p => (+p.tk || 0) + (+p.int || 0) + (+p.bl || 0);
    const SEK = px.tam ? {
      onem: ['Önemli istatistik', [['r', 'Puan'], ['min', 'Oyun süresi'], ['g', 'Goller'], ['a', 'Asistler'], ['sh', 'Şut'], ['kp', 'Kilit pas'], ['def', 'Defansif hamleler', def]]],
      hucum: ['Hücum', [['g', 'Goller'], ['sh', 'Şut'], ['sot', 'İsabetli şut'], ['drs', 'Başarılı çalım', p => p.drs, p => yz(p.drs || 0, p.dra || 0)], ['fd', 'Kazanılan faul'], ['off', 'Ofsayt'], ['pw', 'Kazanılan penaltı']]],
      pas: ['Pas', [['ps', 'Pas'], ['pa', 'İsabetli pas', p => p.pa, p => p.ps ? `${p.pa || 0} (%${Math.round((p.pa || 0) / p.ps * 100)})` : '0'], ['kp', 'Kilit pas'], ['a', 'Asistler']]],
      savunma: ['Savunma', [['tk', 'Top çalma'], ['int', 'Top kapma'], ['bl', 'Blok'], ['dp', 'Çalımlanma'], ['fc', 'Yapılan faul'], ['pc', 'Penaltıya sebep']]],
      mucadele: ['Mücadele', [['dw', 'Kazanılan ikili', p => p.dw, p => yz(p.dw || 0, p.du || 0)], ['du', 'İkili mücadele'], ['drs', 'Başarılı çalım'], ['fd', 'Kazanılan faul'], ['fc', 'Yapılan faul']]],
      kaleci: ['Kaleci', [['sv', 'Kurtarış'], ['gc', 'Yenen gol'], ['psv', 'Kurtarılan penaltı'], ['min', 'Oyun süresi']]],
    } : { onem: ['Önemli istatistik', [['r', 'Puan'], ['min', 'Oyun süresi'], ['g', 'Goller'], ['a', 'Asistler'], ['y', 'Sarı kart']]] };
    if (!SEK[OIS]) OIS = 'onem';
    let liste = sat; if (OIS === 'kaleci') liste = sat.filter(p => p.pos === 'G');
    const kol = SEK[OIS][1], k = kol.find(c => c[0] === OSS.k) || kol[0], kd = k[2] || (p => p[k[0]]);
    liste = liste.slice().sort((x, y) => ((+kd(y) || 0) - (+kd(x) || 0)) * (OSS.y === 1 ? -1 : 1));
    const enIyi = sat.reduce((b, p) => (p.r && (!b || p.r > b.r) ? p : b), null);
    const takim = s => s === 'h' ? m.h : m.a;
    const hucre = (p, c) => { if (c[0] === 'r') return p.r ? puanHap(p.r, p === enIyi) : '–'; const v = c[3] ? c[3](p) : (c[2] ? c[2](p) : p[c[0]]); return v == null || v === '' ? '–' : E(v); };
    const oyuncu = p => { const tm = takim(p.s), [a, b] = renk(tm); return `<td class="kmotn"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(p.n))}</i>${fotoImg(fotoUrl(tm, p))}</span><span class="kmotb">${bd(tm)}</span><b class="kmpln" data-pn="${E(tm + '|' + p.n)}">${E(p.n)}</b></td>`; };
    return card('kmoist2', `<h3 class="kmb">Oyuncu istatistikleri</h3>
      ${Object.keys(SEK).length > 1 ? `<div class="kmsuz kmoisk">${Object.entries(SEK).map(([id, [ad]]) => `<button data-kmois="${id}" class="${OIS === id ? 'on' : ''}">${E(ad)}</button>`).join('')}</div>` : ''}
      <div class="kmotw"><table class="kmot"><thead><tr><th class="kmotn">Oyuncu</th>${kol.map(c => `<th data-kmoss="${c[0]}" class="${c === k ? 'on' : ''}">${E(c[1])}${c === k ? (OSS.y === 1 ? ' ▴' : ' ▾') : ''}</th>`).join('')}</tr></thead>
      <tbody>${liste.map(p => `<tr>${oyuncu(p)}${kol.map(c => `<td>${hucre(p, c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      ${devreNot ? '<p class="kmkay">Oyuncu istatistikleri maçın tamamı içindir (kaynak devreye bölmüyor).</p>' : ''}      ${px.tam ? '' : '<p class="kmkay">Ayrıntılı oyuncu istatistikleri (şut, pas, mücadele) bu maç için henüz yok; puan, dakika, gol, asist ve kart gösteriliyor.</p>'}`);
  }
  const eskiDetail = detail;
  window.detail = function (m) {
    const eski = eskiDetail(m);
    if (!MQ.matches) return eski;
    const p = eskiParcalar(m, eski), x = xm(m);
    const yan = `<div class="mside">${kimKazanir(m)}${p.tbx}${stadKarti(x.venue)}${hakemKarti(x.ref)}${bilgiKarti(m)}${p.nwb}</div>`;
    let ana;
    if (dt === 'p') ana = onemliIstatistik(m) + (etkinlikler(m) || olaylarKarti(m)) + kadroKarti(m) + formKarti(m) + sonrakiMac(m) + h2hKarti(m) + (typeof kpBox === 'function' ? kpBox(m) : '');
    else if (dt === 'z' && tabloSatir(m.c).length) ana = tabloLig(m.c, [m.h, m.a]);
    else if (dt === 'k') ana = kadroKarti(m);
    else if (dt === 'i') ana = istatistikSekmesi(m);
    else if (dt === 'm') ana = sonMaclarKarti(m) + h2hKarti(m);
    else ana = `<div class="kmeski">${p.kalan}</div>`;
    return sahaFoto(macBaslik(m) + ana + yan);
  };
  // sahadaki oyunculara fotograf (adres varsa); yuklenince forma dairesinin yerini alir
  function sahaFoto(html) {
    if (!(window.KMX && typeof KMX.photo === 'function')) return html;
    const t = document.createElement('template'); t.innerHTML = html;
    t.content.querySelectorAll('.kmsaha .pp[data-pn]').forEach(pp => {
      const [tm, nm] = pp.dataset.pn.split('|'), u = fotoUrl(tm, { n: nm }), sh = pp.querySelector('.sh');
      if (u && sh) sh.insertAdjacentHTML('beforeend', fotoImg(u));
    });
    return t.innerHTML;
  }

  // ================= TAKIM SAYFASI =================
  let TT = 'o', TTn = '';
  function macSatiri(x, n) {
    const s = stt(x), orta = s.sc ? `<b>${s.sc[0]} - ${s.sc[1]}</b>` : `<b>${hm(x.t)}</b>`;
    return `<div class="kmms" data-kmm="${E(key(x))}"><div class="kmms-u"><span>${E(kisaTarih(x.t))}</span><span>${E(ligAd(x.c))}</span></div>
      <div class="kmms-s"><span class="${x.h === n ? 'b' : ''}">${E(x.h)}${bd(x.h)}</span>${orta}<span class="${x.a === n ? 'b' : ''}">${bd(x.a)}${E(x.a)}</span></div></div>`;
  }
  function takimBaslik(n) {
    const t = TM[n] || {}, x = xt(n);
    const ul = x.country || ulke(t.l || (R.find(m => m.h === n || m.a === n) || {}).c || '');
    return `<div class="kmc kmth">
      <div class="kmth-u">${bd(n, 1)}<div><h2>${E(n)}</h2><small>${E(ul)}</small></div>
        <button class="kmtakip${FAV.has(n) ? ' on' : ''}" data-kmfav="${E(n)}">${FAV.has(n) ? '★ Favoride' : '☆ Favorilere ekle'}</button></div>
      <div class="kmsek">${[['o', 'Genel bakış'], ['t', 'Tablo'], ['m', 'Maçlar'], ['k', 'Kadro'], ['i', 'Oyuncu istatistikleri']].map(([k, l]) => `<button data-kmtt="${k}" class="${TT === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    </div>`;
  }
  function formKutusu(n) {
    const f = son5(n);
    return card('kmtform', `<h3 class="kmb">Takım formu</h3>${f.length ? `<div class="kmtf">${f.map(r => `<div><i class="kmhap ${sonuc(r.r)}">${r.H ? `${r.f} - ${r.c}` : `${r.c} - ${r.f}`}</i>${bd(r.o, 1)}<small data-tm="${E(r.o)}">${E(r.o)}</small></div>`).join('')}</div>` : '<p class="kmbos">Kayıtlı lig maçı yok.</p>'}`);
  }
  function sonrakiKutusu(n) {
    const x = siradaki(n);
    if (!x) {
      // gelecek mac yoksa son oynanan mac (gercek skor)
      const son = R.filter(m => (m.h === n || m.a === n) && stt(m).k === 'ft').sort((p, q) => q.t - p.t)[0];
      if (!son) return card('kmsonraki', `<h3 class="kmb">Sonraki maç</h3><p class="kmbos">Takvimde sıradaki maç yok.</p>`);
      const sc = stt(son).sc || ['-', '-'];
      return card('kmsonraki', `<div class="kmb2"><h3 class="kmb">Son maç</h3><small>${E(ligAd(son.c))}</small></div>
        <div class="kmsm" data-kmm="${E(key(son))}"><div>${bd(son.h, 1)}<b>${E(son.h)}</b></div><div class="kmsm-o"><b>${sc[0]} - ${sc[1]}</b><small>${E(kisaTarih(son.t))}</small></div><div>${bd(son.a, 1)}<b>${E(son.a)}</b></div></div>
        <p class="kmkay">Takvimde sıradaki maç yok; son oynanan maç gösteriliyor.</p>`);
    }
    return card('kmsonraki', `<div class="kmb2"><h3 class="kmb">Sonraki maç</h3><small>${E(ligAd(x.c))}</small></div>
      <div class="kmsm" data-kmm="${E(key(x))}"><div>${bd(x.h, 1)}<b>${E(x.h)}</b></div><div class="kmsm-o"><b>${hm(x.t)}</b><small>${E(gunEtiket(x.t) || kisaTarih(x.t))}</small></div><div>${bd(x.a, 1)}<b>${E(x.a)}</b></div></div>`);
  }
  // yarismanin puan tablosu satirlari: lig (TM), Sampiyonlar Ligi (clT), Avrupa/Konferans Ligi (EUS)
  function tabloSatir(c) {
    try {
      const lig = Object.entries(TM).filter(([, v]) => v.l === c).sort((a, b) => a[1].r - b[1].r);
      if (lig.length) return lig.map(([n, v]) => ({ n, r: v.r, w: v.w, d: v.d, l: v.o, f: v.f, a: v.a, p: v.p }));
      if (c === 'CL' && typeof clT === 'function') return clT().map(([r, n, w, d, l, f, a, p]) => ({ n, r, w, d, l, f, a, p }));
      if (typeof EUS !== 'undefined' && EUS[c]) return Object.entries(EUS[c]).sort((x, y) => y[1].p - x[1].p || (y[1].f - y[1].c) - (x[1].f - x[1].c) || y[1].f - x[1].f || y[1].w - x[1].w).map(([n, q], k) => ({ n, r: k + 1, w: q.w, d: q.d, l: q.l, f: q.f, a: q.c, p: q.p }));
    } catch (e) { }
    return [];
  }
  // takimin o yarismadaki son 5 sonucu (G/B/M): lig SLG, CL CLR, EL/ECL EUR
  function formYar(c, n) {
    const ren = (gf, ga) => gf > ga ? 'G' : gf < ga ? 'M' : 'B';
    try {
      if (TM[n] && TM[n].l === c) return son5(n).map(r => ({ r: r.r, t: (r.H ? n + ' ' + r.f + '-' + r.c + ' ' + r.o : r.o + ' ' + r.c + '-' + r.f + ' ' + n) }));
      let l = [];
      if (c === 'CL' && typeof CLR !== 'undefined') l = CLR.filter(r => r.h === n || r.a === n).map(r => ({ h: r.h, a: r.a, x: +r.x, y: +r.y }));
      else if (typeof EUR !== 'undefined' && EUR[c]) l = String(EUR[c]).split('\n').map(z => { const [h, a, x, y] = z.split('|'); return { h, a, x: +x, y: +y }; }).filter(r => r.h === n || r.a === n);
      return l.slice(-5).map(r => ({ r: r.h === n ? ren(r.x, r.y) : ren(r.y, r.x), t: r.h + ' ' + r.x + '-' + r.y + ' ' + r.a }));
    } catch (e) { return []; }
  }
  function tabloLig(c, vurgu) {
    const rows = tabloSatir(c), hl = new Set(vurgu || []);
    if (!rows.length) return '';
    const satir = v => {
      const k = v.n, f = formYar(c, k), nx = R.filter(x => x.c === c && (x.h === k || x.a === k) && stt(x).k === 'wait').sort((p, q) => p.t - q.t)[0] || siradaki(k), op = nx ? (nx.h === k ? nx.a : nx.h) : '';
      const nxh = nx ? `<td class="nx" data-kmm="${E(key(nx))}" title="${E(nx.h + ' – ' + nx.a)} · ${E(uzunTarih(nx.t))}, ${hm(nx.t)} · ${E(ligAd(nx.c))}">${bd(op)}</td>` : '<td class="nx"></td>';
      return `<tr class="${hl.has(k) ? 'hl' : ''}"><td>${v.r}</td><td class="tk" data-tm="${E(k)}">${bd(k)}<span>${E(k)}</span></td><td>${v.w + v.d + v.l}</td><td>${v.w}</td><td>${v.d}</td><td>${v.l}</td><td>${v.f}-${v.a}</td><td>${v.f - v.a > 0 ? '+' : ''}${v.f - v.a}</td><td><b>${v.p}</b></td>
        <td class="fm">${f.map(r => `<i class="kmkare ${sonuc(r.r)}" title="${E(r.t)}">${r.r}</i>`).join('')}</td>${nxh}</tr>`;
    };
    return card('kmtablo', `<h3 class="kmb">${E(ligAd(c))}</h3><table><thead><tr><th>#</th><th class="tk"></th><th>O</th><th>G</th><th>B</th><th>M</th><th>+/-</th><th>AV</th><th>PUAN</th><th>Form</th><th>Sonraki</th></tr></thead><tbody>${rows.map(satir).join('')}</tbody></table>`);
  }
  function tabloKutusu(n, vurgu) {
    const t = TM[n];
    const h = t && t.l ? tabloLig(t.l, vurgu || [n]) : '';
    return h || card('kmtablo', `<h3 class="kmb">Puan durumu</h3><p class="kmbos">Bu takım için lig puan durumu verisi yok.</p>`);
  }
  function oyuncuKutusu(n) {
    const t = TM[n] || {}, ps = (typeof PS !== 'undefined') && (PS[(t.l || '') + '|' + n]);
    if (!ps || !Array.isArray(ps.p) || !ps.p.length) return '';
    const top = (i, ad) => { const l = ps.p.filter(p => +p[i] > 0).sort((a, b) => b[i] - a[i]).slice(0, 3); return `<div><h4>${ad}</h4>${l.length ? l.map(p => `<div class="kmoy"><span>${E(p[0])}</span><b>${p[i]}</b></div>`).join('') : '<p class="kmbos">Yok</p>'}</div>`; };
    return card('kmoyuncu', `<div class="kmuc">${top(3, 'En çok gol atan')}${top(4, 'En çok asist yapan')}${top(5, 'En çok sarı kart')}</div>${ps.src ? `<p class="kmkay">Kaynak: ${E(ps.src)}${ps.at ? ', ' + E(ps.at) : ''}</p>` : ''}`);
  }
  function hocaKutusu(n) {
    const h = xt(n).coachHist;
    if (!Array.isArray(h) || !h.length) return '';
    return card('kmhoca2', `<h3 class="kmb">Antrenör kazanma yüzdesi</h3><small class="kmmut">Maç başına puan</small><div class="kmhg">${h.map(c => `<div><div class="kmbar"><b>%${E(c.pct)}</b><small>${E(c.ppg)} Puan</small></div><span>${E(c.n)}</span><small>${E(c.s || '')}</small></div>`).join('')}</div>`);
  }
  function sezonKutusu(n) {
    const t = TM[n];
    if (!t) return '';
    const rec = (typeof SLG !== 'undefined' && SLG[n]) || [];
    const yer = H => { const l = rec.filter(r => r.H === H); if (!l.length) return ''; const w = l.filter(r => r.r === 'G').length, d = l.filter(r => r.r === 'B').length; return `<div class="kmsr"><span>${H ? 'Evinde' : 'Deplasmanda'}</span><b>${w}G ${d}B ${l.length - w - d}M</b></div>`; };
    return card('kmsezon', `<h3 class="kmb">Sezon istatistikleri</h3><div class="kmsr"><span>Lig sırası</span><b>${t.r}.</b></div><div class="kmsr"><span>Puan</span><b>${t.p}</b></div><div class="kmsr"><span>G / B / M</span><b>${t.w} / ${t.d} / ${t.o}</b></div><div class="kmsr"><span>Atılan / Yenilen</span><b>${t.f} / ${t.a}</b></div>${yer(1)}${yer(0)}`);
  }
  function maclarKutusu(n) {
    const tum = R.filter(x => x.h === n || x.a === n).sort((a, b) => a.t - b.t);
    const gel = tum.filter(x => stt(x).k !== 'ft').slice(0, 5), bit = tum.filter(x => stt(x).k === 'ft').slice(-5).reverse();
    if (MKSn !== n) { MKSn = n; MKS = gel.length ? 'gel' : 'bit'; }
    const l = MKS === 'gel' ? gel : bit;
    const ok = (yon, akt) => `<button class="kmok" data-kmms="${yon}" ${akt ? '' : 'disabled'} aria-label="${yon === 'bit' ? 'Oynanan maçlar' : 'Gelecek maçlar'}">${yon === 'bit' ? '‹' : '›'}</button>`;
    return card('kmmaclar', `<div class="kmmh">${ok('bit', MKS === 'gel' && bit.length)}<div><h3>Maçlar</h3><small>${MKS === 'gel' ? 'Gelecek' : 'Oynanan'}</small></div>${ok('gel', MKS === 'bit' && gel.length)}</div>
      ${l.length ? l.map(x => macSatiri(x, n)).join('') : `<p class="kmbos">${MKS === 'gel' ? 'Takvimde sıradaki maç yok.' : 'Oynanan maç yok.'}</p>`}`);
  }
  // ---- takim sayfasi ek kartlari (FotMob) ----
  function takimOyunculari(n) { return oyuncuIndeksi().L.filter(e => e.team === n); }
  // puan ortalamasi: yalniz secilen yarisma (c) ya da milli takim maclari haric tum kulup yarismalari
  const MILLI_YAR = new Set(['UNL', 'WCQ', 'EURO', 'WC', 'FRI', 'NAT']);
  function sezonPuani(e, c) { const s = sezonKaydi(e, e.team); if (!s || !s.c) return null; let rs = 0, rn = 0; Object.entries(s.c).forEach(([k, v]) => { if (c ? k !== c : MILLI_YAR.has(k)) return; rs += +v.rs || 0; rn += +v.rn || 0; }); return rn ? { o: rs / rn, n: rn } : null; }
  // Son ilk 11: once API resmi 11 (luRaw), yoksa takimin son kayitli macindaki ilk 11 (PS m.x) ve mevkileri
  function sonIlk11(n) {
    const X = window.KMX, L = takimOyunculari(n);
    const tekAd = (x, y) => { const p = adN(x), q = adN(y); return (p.length === 1 || q.length === 1) && p.length && q.length && p[p.length - 1] === q[q.length - 1]; };
    const bul = ad => L.find(e => ayniAd(e.n, ad) || ayniAd(e.ad, ad)) || L.find(e => adN(e.n).join(' ') === adN(ad).join(' ')) || (L.filter(e => tekAd(e.n, ad)).length === 1 ? L.find(e => tekAd(e.n, ad)) : null);
    let son = null;
    if (X && X.byKey) Object.values(X.byKey).forEach(m => { if (!m || !m.luRaw) return; const s = m.h === n ? 'h' : m.a === n ? 'a' : null; if (!s || !m.luRaw[s]) return; const t = Date.parse(m.t) || 0; if (!son || t > son.t) son = { t, raw: m.luRaw[s], m, s }; });
    if (son && (son.raw.xi || []).length >= 10) {
      const satir = {}; son.raw.xi.forEach(p => { const r = +String(p.grid || '0:0').split(':')[0] || 0; (satir[r] = satir[r] || []).push(p); });
      const px = son.m.live && son.m.live.px && son.m.live.px[son.s] || [];
      return { kay: 'API-Football (resmi ilk 11, ' + kisaTarih(son.t) + ')', satirlar: Object.keys(satir).map(Number).sort((a, b) => b - a).map(r => satir[r].sort((a, b) => (+String(b.grid).split(':')[1]) - (+String(a.grid).split(':')[1])).map(p => { const e = bul(p.n); const q = px.find(z => (p.id && z.id === p.id) || ayniAd(z.n, p.n)); return { n: e ? e.n : p.n, e: e || { team: n, n: p.n, ad: p.n, id: p.id }, no: p.no, r: q && q.r }; })) };
    }
    const ps = typeof PS !== 'undefined' ? Object.keys(PS).filter(k => k.endsWith('|' + n)).map(k => PS[k]) : [];
    let ms = null; ps.forEach(T => (T.m || []).forEach(m => { if ((m.x || []).length >= 11 && !ms) ms = { m, T }; }));
    if (!ms) return null;
    const grp = { F: [], O: [], D: [], K: [] };
    ms.m.x.slice(0, 11).forEach(ad => { const e = bul(ad); const pr = e && e.ps && e.ps.p; const pos = (pr && pr[6]) || (e && e.pos) || 'O'; (grp[pos] || grp.O).push({ n: e ? e.n : ad, e: e || { team: n, n: ad, ad } }); });
    return { kay: (ms.T.src || 'kayıtlı maç') + ' · ' + (ms.m.d || '') + ' ' + (ms.m.t || ''), satirlar: ['F', 'O', 'D', 'K'].map(k => grp[k]).filter(l => l.length) };
  }
  function ilk11Karti(n) {
    const s = sonIlk11(n); if (!s) return '';
    const [a, b] = renk(n);
    const kisi = o => { const e = o.e, pr = e.ps && e.ps.p, g = pr ? +pr[3] || 0 : 0, as = pr ? +pr[4] || 0 : 0, sp = !o.r ? sezonPuani(e) : null, pu = o.r || (sp && sp.o);
      return `<div class="kmi1p" ${e.ps ? `data-pl="${E(e.key)}"` : `data-pn="${E(n + '|' + (e.ad || e.n))}"`}>${pu ? puanHap((+pu).toFixed(1)) : ''}<span class="kmav buyuk" style="--ka:${a};--kb:${b}"><i>${E(o.no || basH(o.n))}</i>${fotoImg(fotoUrl(n, { id: e.id, ph: e.ph, n: e.ad || e.n }))}</span>${g || as ? `<span class="kmi1s">${as ? `<em title="Asist">${icon.krampon}${as}</em>` : ''}${g ? `<em title="Gol">${icon.gol}${g}</em>` : ''}</span>` : ''}<b>${o.no ? `<i>${E(o.no)}</i> ` : ''}${E(String(o.n).split(' ').pop())}</b></div>`; };
    return card('kmi1', `<div class="kmb2"><h3 class="kmb">Sezon istatistikleri</h3><small>Son ilk 11</small></div><div class="kmi1s-saha"><i class="kmi1-ceza"></i>${s.satirlar.map(r => `<div class="kmi1r">${r.map(kisi).join('')}</div>`).join('')}</div><p class="kmkay">Kaynak: ${E(s.kay)}. Gol/asist sezon toplamı.</p>`);
  }
  // en cok puan / gol / asist (FotMob uc sutun)
  function enCoklarKarti(n) {
    const L = takimOyunculari(n).filter(e => e.ps);
    if (!L.length) return '';
    const sat = (e, v) => `<div class="kmec" data-pl="${E(e.key)}"><span class="kmav" style="--ka:${renk(n)[0]};--kb:${renk(n)[1]}"><i>${E(basH(e.n))}</i>${fotoImg(fotoUrl(n, { id: e.id, ph: e.ph, n: e.ad }))}</span><div><b>${E(e.n)}</b><small>${bd(n)}${E(n)}</small></div><em>${v}</em></div>`;
    const kol = (ad, l) => `<div><h4>${ad}</h4>${l.length ? l.map(([e, v]) => sat(e, v)).join('') : '<p class="kmbos">Veri yok.</p>'}</div>`;
    const top = (f, k) => L.map(e => [e, f(e)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, k || 3);
    const pu = L.map(e => [e, sezonPuani(e)]).filter(x => x[1]).sort((a, b) => b[1].o - a[1].o).slice(0, 3).map(([e, p]) => [e, puanHap(p.o.toFixed(2))]);
    return card('kmec3', `<div class="kmuc">${pu.length ? kol('En çok puan alan', pu) : kol('En çok süre alan', top(e => +e.ps.p[2]))}${kol('En çok gol atan', top(e => +e.ps.p[3]))}${kol('En çok asist yapan', top(e => +e.ps.p[4]))}</div>
      <p class="kmkay">Gol/asist: ${E(((PS[L[0].ps.tk] || {}).src) || 'kayıtlı veri')}${pu.length ? '; puan: sitede biriken maçlar' : ''}.</p>`);
  }
  // Kadro sekmesi: mevkiye gore gruplu, fotografli
  function kadroSekmesi(n) {
    const L = takimOyunculari(n);
    if (!L.length) return card('kmkdr', `<h3 class="kmb">Kadro</h3><p class="kmbos">Bu takım için oyuncu verisi yok.</p>`);
    const pos = e => (e.ps && e.ps.p[6]) || e.pos || '';
    const GR = [['K', 'Kaleciler'], ['D', 'Defans'], ['O', 'Orta saha'], ['F', 'Forvet'], ['', 'Mevkisi bilinmeyen']];
    const [a, b] = renk(n);
    const kisi = e => { const p = e.ps && e.ps.p; return `<div class="kmkd" ${e.ps ? `data-pl="${E(e.key)}"` : `data-pn="${E(n + '|' + e.ad)}"`}><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(e.n))}</i>${fotoImg(fotoUrl(n, { id: e.id, ph: e.ph, n: e.ad }))}</span><div><b>${E(e.n)}</b><small>${[e.no ? '#' + e.no : '', e.a ? e.a + ' yaş' : '', e.milli && e.milli !== n ? e.milli : ''].filter(Boolean).map(E).join(' · ')}</small></div>${p ? `<span class="kmkd-s"><em title="Maç">${p[1]}</em><em title="Gol">${p[3]}</em><em title="Asist">${p[4]}</em></span>` : ''}</div>`; };
    return GR.map(([k, ad]) => { const l = L.filter(e => pos(e) === k); return l.length ? card('kmkdr', `<div class="kmb2"><h3 class="kmb">${ad}</h3><small>Maç · Gol · Asist</small></div><div class="kmkdg">${l.map(kisi).join('')}</div>`) : ''; }).join('');
  }
  // Oyuncu istatistikleri sekmesi
  function oyuncuIstatSekmesi(n) {
    const L = takimOyunculari(n).filter(e => e.ps);
    if (!L.length) return card('kmois3', `<h3 class="kmb">Oyuncu istatistikleri</h3><p class="kmbos">Bu takım için oyuncu istatistiği yok.</p>`);
    const sat = (e, v) => `<div class="kmec" data-pl="${E(e.key)}"><span class="kmav" style="--ka:${renk(n)[0]};--kb:${renk(n)[1]}"><i>${E(basH(e.n))}</i>${fotoImg(fotoUrl(n, { id: e.id, ph: e.ph, n: e.ad }))}</span><div><b>${E(e.n)}</b></div><em>${v}</em></div>`;
    const kol = (ad, f) => { const l = L.map(e => [e, f(e)]).filter(x => +x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 5); return card('kmois3', `<h3 class="kmb">${ad}</h3>${l.length ? l.map(([e, v]) => sat(e, v)).join('') : '<p class="kmbos">Veri yok.</p>'}`); };
    const pu = L.map(e => [e, sezonPuani(e)]).filter(x => x[1]).sort((a, b) => b[1].o - a[1].o).slice(0, 5);
    return `<div class="kmois3g">${kol('Goller', e => +e.ps.p[3])}${kol('Asistler', e => +e.ps.p[4])}${kol('Gol + asist', e => (+e.ps.p[3]) + (+e.ps.p[4]))}${kol('Oyun süresi', e => +e.ps.p[2])}${kol('Maçlar', e => +e.ps.p[1])}${kol('Sarı kartlar', e => +e.ps.p[5])}
      ${pu.length ? card('kmois3', `<h3 class="kmb">Ortalama puan <small>sitede biriken maçlar</small></h3>${pu.map(([e, p]) => sat(e, puanHap(p.o.toFixed(2)))).join('')}`) : ''}</div>
      <p class="kmkay">Kaynak: ${E(((PS[L[0].ps.tk] || {}).src) || 'kayıtlı veri')}.</p>`;
  }
  let MKS = 'gel', MKSn = '';
  const eskiTeamView = teamView;
  // arama sonucunda oyuncular: birlesik dizinden (tam ad, kisaltma, milli takim oyunculari dahil)
  function aramaOyuncu() {
    const q = String(Q || '').trim(); if (q.length < 3 || (QX && Q === QX) || String(QX || '').startsWith('@p:')) return;
    const l = oyuncuArama(q), app = document.getElementById('app'); if (!app) return;
    const eski = [...app.querySelectorAll('.box')].find(b => { const h = b.querySelector('h3'); return h && h.textContent.trim() === 'Oyuncular'; });
    if (!l.length) return;
    const h = '<div class="box kmoyara"><h3>Oyuncular</h3><div class="chips wrap">' + l.map(e => '<button ' + (e.ps ? 'data-pl="' + E(e.key) + '"' : 'data-pn="' + E(e.team + '|' + e.ad) + '"') + '>' + E(e.n) + ' · ' + E(e.team) + (e.milli && e.milli !== e.team ? ' · ' + E(e.milli) : '') + '</button>').join('') + '</div></div>';
    if (eski) eski.outerHTML = h; else app.insertAdjacentHTML('beforeend', h);
  }
  // oyuncu tiklamalari: hangi listeden gelirse gelsin ayni (birlesik) oyuncu sayfasi acilir
  window.addEventListener('click', ev => {
    const pn = ev.target.closest && ev.target.closest('[data-pn]'); if (!pn || typeof plOpen !== 'function') return;
    try { const e = oyuncuBul(pn.dataset.pn); if (!e || !e.key) return; ev.preventDefault(); ev.stopImmediatePropagation(); plOpen(e.key, e.n); } catch (x) { }
  }, true);
  window.teamView = function () {
    if (MQ.matches && QX && QX.startsWith('@p:')) { const a = document.getElementById('app'); a.classList.remove('kmeskitv'); a.innerHTML = oyuncuSayfasi(QX.slice(3)); return; }
    const tek = QX && Q === QX && !QX.startsWith('@p:') && (typeof lgm !== 'function' || lgm(Q).length !== 1 || R.some(m => m.h === QX || m.a === QX));
    if (!MQ.matches || !tek) { eskiTeamView(); try { aramaOyuncu(); } catch (e) { } return; }
    const n = QX;
    if (TTn !== n) { TTn = n; TT = 'o'; }
    if (TT === 'm') {
      eskiTeamView();
      document.getElementById('app').insertAdjacentHTML('afterbegin', takimBaslik(n));
      document.getElementById('app').classList.add('kmeskitv');
    } else {
      document.getElementById('app').classList.remove('kmeskitv');
      const x = xt(n);
      let ic;
      if (TT === 't') ic = tabloKutusu(n) + `<div class="mside">${sezonKutusu(n)}</div>`;
      else if (TT === 'k') ic = kadroSekmesi(n) + `<div class="mside">${ilk11Karti(n)}</div>`;
      else if (TT === 'i') ic = oyuncuIstatSekmesi(n);
      else ic = `<div class="kmiki2">${formKutusu(n)}${sonrakiKutusu(n)}</div>` + tabloKutusu(n) + hocaKutusu(n) + enCoklarKarti(n)
        + `<div class="mside">${takimNotlari(new Set([n]))}${ilk11Karti(n)}${maclarKutusu(n)}${stadKarti(x.venue)}${sezonKutusu(n)}</div>`;
      document.getElementById('app').innerHTML = takimBaslik(n) + ic;
    }
  };

  // ================= OYUNCU SAYFASI (FotMob duzeni, yalnizca temel bilgiler) =================
  // Veri: PS["lig|takim"].p (sezon toplamlari), PS[...].m (mac mac kayit), KMX.sq (davet listesi: yas, forma, foto).
  // Bilinmeyen alan gosterilmez; veri uydurulmaz.
  const MEVKI = { K: 'Kaleci', D: 'Defans', O: 'Orta saha', F: 'Forvet' };
  const nz = x => (typeof nzq === 'function' ? nzq(String(x || '')) : String(x || '').toLowerCase());
  // sitede biriken oyuncu toplamlari (veri oturumu): {at, done, p:{<id>|n:<takim>:<ad>: {n,tm,no,pos,ph,c:{<lig>:{m,min,rs,rn,g,a,...}}}}}
  let SEZ = null;
  fetch('data/players/season.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { if (j && j.p) { SEZ = j; try { render(); } catch (e) { } } }).catch(() => { });
  function sezonKaydi(e, team) {
    if (!SEZ || !SEZ.p) return null;
    if (e.id && SEZ.p[e.id]) return SEZ.p[e.id];
    for (const n of [e.ad, e.n, ...(e.adlar || [])]) { const k = SEZ.p['n:' + team + ':' + n] || (e.milli && SEZ.p['n:' + e.milli + ':' + n]); if (k) return k; }
    return null;
  }
  // ---- birlesik oyuncu dizini: kulup istatistigi (PS) + API oyunculari (kadro listesi, resmi 11, mac verisi) ----
  // Ayni oyuncu tek kayitta: once API kimligi, sonra takim + soyad/ilk harf (tek eslesme sart). Tam ad: PS adi ya da mac olaylarindaki ad.
  let OYI = null;
  const APIMEV = { G: 'K', D: 'D', M: 'O', F: 'F' };
  function oyuncuIndeksi() {
    const X = window.KMX || {}, sqs = X.sq || {}, bk = X.byKey || {};
    const sig = (X.at || '') + '|' + Object.keys(typeof PS !== 'undefined' ? PS : {}).length + '|' + Object.keys(sqs).length + '|' + Object.keys(bk).length + '|' + Object.keys(typeof LVD !== 'undefined' ? LVD : {}).length;
    if (OYI && OYI.sig === sig) return OYI;
    const L = [], grup = new Map(), kupa = c => ['CL', 'EL', 'ECL', 'UNL'].includes(c);
    (typeof plAll === 'function' ? plAll() : []).forEach(x => {
      const g = x.team + '|' + adN(x.p[0]).join(' '), o = grup.get(g);
      if (!o) { const e = { key: x.k, n: x.p[0], ad: x.p[0], team: x.team, c: x.c, ps: x }; grup.set(g, e); L.push(e); }
      else if (kupa(o.c) && !kupa(x.c)) { o.key = x.k; o.c = x.c; o.ps = x; }
    });
    // ayni tam ad (en az iki kelime) birden cok kulupte: sezon icinde transfer; en cok mac oynadigi kulup ana kayit
    { const ta = new Map(); L.forEach(e => { const k = adN(e.n).join(' '); if (k.split(' ').length >= 2) (ta.get(k) || ta.set(k, []).get(k)).push(e); });
      ta.forEach(l => { if (l.length < 2) return; l.sort((x, y) => (+y.ps.p[1] || 0) - (+x.ps.p[1] || 0)); const ana = l[0]; ana.diger = l.slice(1).map(x => x.ps); l.slice(1).forEach(x => { const i = L.indexOf(x); if (i >= 0) L.splice(i, 1); }); }); }
    const psTakim = new Set(L.map(e => e.team).concat(L.flatMap(e => (e.diger || []).map(x => x.team))));
    const soy = {}; L.forEach(e => { const t = adN(e.n); const s = t[t.length - 1]; (soy[s] = soy[s] || []).push(e); });
    // API oyunculari
    const api = [];
    const ekle = (team, p, pos, yas) => {
      if (!p || !p.n || !team) return;
      let o = api.find(q => (p.id && q.id === p.id) || (q.team === team && ayniAd(q.n, p.n)));
      if (!o) { o = { team, n: p.n }; api.push(o); }
      o.id = o.id || p.id || null; o.ph = o.ph || p.ph || null; o.no = o.no || p.no || null; o.a = o.a || (yas ? p.a : null) || null; o.pos = o.pos || pos || null;
    };
    Object.values(sqs).forEach(s => (s && s.p || []).forEach(p => ekle(s.n, p, p.p, 1)));
    Object.values(bk).forEach(e => { if (!e) return; ['h', 'a'].forEach(s => {
      const tm = e[s], r = e.luRaw && e.luRaw[s];
      if (r) [...(r.xi || []), ...(r.bn || [])].forEach(p => ekle(tm, p, APIMEV[p.pos]));
      ((e.live && e.live.px && e.live.px[s]) || []).forEach(p => ekle(tm, p, APIMEV[p.pos]));
    }); });
    // mac olaylarindaki tam adlar (takima gore)
    const evAd = {};
    try { Object.entries(LVD).forEach(([k, v]) => { const [, h, a] = k.split('|'); (v && v.ev || []).forEach(ev => { const tm = ev.s === 'a' ? a : ev.s === 'h' ? h : null; if (tm) [ev.a, ev.b].forEach(n => { if (n) (evAd[tm] = evAd[tm] || new Set()).add(n); }); }); }); } catch (e) { }
    const tamAd = (tm, n) => { const c = [...(evAd[tm] || [])].filter(x => !/\./.test(x) && adN(x).length > 1 && ayniAd(x, n)); return c.length === 1 ? c[0] : null; };
    api.forEach(o => {
      const t = adN(o.n), s = t[t.length - 1], tam = tamAd(o.team, o.n);
      const kulupBag = psTakim.has(o.team) || !!TM[o.team];
      let ad = (soy[s] || []).filter(e => ayniAd(e.n, o.n) && (!kulupBag || e.team === o.team));
      if (ad.length > 1 && tam) ad = ad.filter(e => adN(e.n).join(' ') === adN(tam).join(' '));
      if (ad.length === 1) {
        const e = ad[0];
        if (kulupBag) { e.id = e.id || o.id; e.ph = e.ph || o.ph; e.no = e.no || o.no; e.a = e.a || o.a; e.pos = e.pos || o.pos; }
        else { e.milli = o.team; e.milliNo = o.no; e.id = e.id || o.id; e.ph = e.ph || o.ph; e.a = e.a || o.a; e.pos = e.pos || o.pos; }
        (e.adlar = e.adlar || []).push(o.n);
      } else {
        L.push({ key: o.team + '|' + o.n, n: tam || o.n, ad: o.n, adlar: [o.n], team: o.team, milli: kulupBag ? null : o.team, milliNo: kulupBag ? null : o.no, id: o.id, ph: o.ph, no: kulupBag ? o.no : null, a: o.a, pos: o.pos });
      }
    });
    OYI = { sig, L };
    return OYI;
  }
  function oyuncuBul(v) {
    const L = oyuncuIndeksi().L;
    if (String(v).includes('#')) {
      const e = L.find(x => x.key === v || (x.diger || []).some(d => d.k === v)); if (e) return e;
      const x = (typeof plAll === 'function' ? plAll() : []).find(y => y.k === v);
      if (x) return L.find(y => y.ps && y.team === x.team && ayniAd(y.n, x.p[0])) || { key: v, n: x.p[0], ad: x.p[0], team: x.team, c: x.c, ps: x };
    }
    const a = String(v).split('|'), t = a[0], n = a.slice(1).join('|');
    const uy = x => x.team === t || x.milli === t;
    return L.find(x => uy(x) && (x.ad === n || x.n === n || (x.adlar || []).includes(n))) || L.find(x => uy(x) && ayniAd(x.n, n)) || { key: v, n, ad: n, team: t };
  }
  // API mac verisindeki (details.json live.px) maclari: milli takim + PS'te olmayan kulup maclari
  const AYK = { oca: 0, sub: 1, şub: 1, mar: 2, nis: 3, may: 4, haz: 5, tem: 6, agu: 7, ağu: 7, eyl: 8, eki: 9, kas: 10, ara: 11 };
  const psTarih = d => { const m = String(d || '').trim().split(/\s+/); if (m.length < 2) return 0; const ay = AYK[m[1].toLowerCase().slice(0, 3)]; if (ay == null) return 0; const n = new Date(); let y = n.getFullYear(); if (ay > n.getMonth() + 1) y--; return Date.UTC(y, ay, +m[0]); };
  function apiMaclari(e, ps) {
    const X = window.KMX, out = []; if (!X || !X.byKey) return out;
    Object.values(X.byKey).forEach(m => {
      if (!m || !m.live || !m.live.px) return;
      ['h', 'a'].forEach(s => {
        const tm = m[s]; if (tm !== e.milli && tm !== e.team) return;
        const p = (m.live.px[s] || []).find(q => (e.id && q.id === e.id) || ayniAd(q.n, e.ad) || ayniAd(q.n, e.n)); if (!p) return;
        const t = Date.parse(m.t) || 0, rakip = s === 'h' ? m.a : m.h, g = m.live.g || [];
        if (ps.some(r => r.t && Math.abs(r.t - t) < 2 * 864e5 && r.rakip === rakip)) return;
        const bas = m.luRaw && m.luRaw[s] && (m.luRaw[s].xi || []).some(q => (p.id && q.id === p.id) || ayniAd(q.n, p.n));
        const gf = s === 'h' ? g[0] : g[1], ga = s === 'h' ? g[1] : g[0];
        out.push({ t, d: new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }), c: ligAd(m.c), rakip, ev: s === 'h', skor: g.length ? g[0] + ' - ' + g[1] : '', r: g.length ? (gf > ga ? 'G' : gf < ga ? 'M' : 'B') : '', dk: p.min, dur: bas ? 'İlk 11' : 'Yedek', g: p.g || 0, a: p.a || 0, y: p.y || 0, pu: p.r, bilinmez: false });
      });
    });
    return out;
  }
  // mac mac: oyuncunun dakikasi, gol, asist, kart (yalnizca kaynakta olanlar)
  function oyuncuMaclari(o) {
    const is = x => (typeof plMt === 'function' ? plMt(o.nm, x) : nz(x) === nz(o.nm));
    const kay = [[o.t, o.team]].concat(((o.e && o.e.diger) || []).map(d => [PS[d.tk] || {}, d.team]));
    const ps = kay.flatMap(([T, takim], ki) => ((T && T.m) || []).map(m => {
      const sk = String(m.t || '').match(/^(.*) (\d+)-(\d+) (.*)$/);
      const ev = sk ? sk[1] === takim : true, rakip = sk ? (ev ? sk[4] : sk[1]) : (m.t || '');
      const skor = sk ? sk[2] + ' - ' + sk[3] : '';
      const ux = (m.x || []).some(is), ui = (m.u || []).find(u => is(u[0])), uo = (m.u || []).find(u => is(u[1]));
      let dk = null, dur = '';
      if ((m.x || []).length) {
        if (ux) { dur = 'İlk 11'; dk = uo ? Math.min(90, +uo[2]) : (m.uc ? 90 : null); }
        else if (ui) { dur = 'Yedek'; dk = Math.max(1, 90 - (+ui[2] || 0)); }
        else if (m.uc) dur = 'Oynamadı';
      } else if (ui) { dur = 'Yedek'; dk = Math.max(1, 90 - (+ui[2] || 0)); }
      const g = (m.g || []).filter(x => is(x[0])).length, a = (m.g || []).filter(x => x[2] && is(x[2])).length, y = (m.y || []).filter(x => is(x[0])).length;
      return { t: psTarih(m.d), d: m.d, c: m.c, rakip, ev, skor, r: m.r, dk, dur, g, a, y, bilinmez: !(m.x || []).length && !ui && !g && !a && !y, ki };
    }).filter(r => !r.ki || (!r.bilinmez && r.dur !== 'Oynamadı')));
    return ps.concat(apiMaclari(o.e, ps)).sort((x, y) => (y.t || 0) - (x.t || 0));
  }
  function oyuncuVeri(v) {
    const e = oyuncuBul(v), x = e.ps;
    const p = x ? x.p : null, c = x ? x.c : (e.c || ''), team = e.team;
    const t = (x && typeof PS !== 'undefined' && PS[x.tk]) || {};
    return { e, p, team, nm: e.n, c, t };
  }
  function oyuncuSayfasi(v) {
    const o = oyuncuVeri(v), e = o.e, p = o.p, [r1] = renk(o.team);
    const posK = (p && p[6]) || e.pos || '', mev = MEVKI[posK] || '';
    const foto = fotoUrl(o.team, { id: e.id, ph: e.ph, n: e.ad });
    const geri = (typeof NAVS !== 'undefined' && NAVS.length) ? `<button class="kmgeri" data-kmpgeri="1">${ic.geri}<span>Geri</span></button>` : '';
    const bas = `<div class="kmc kmph"><div class="kmph-u" style="--tr:${E(r1)}">${geri}
        <div class="kmph-f${foto ? '' : ' yok'}"><span>${E(basH(o.nm))}</span>${fotoImg(foto)}</div>
        <div><h2>${E(o.nm)}</h2>${o.team ? `<a class="kmph-t" data-tm="${E(o.team)}">${bd(o.team)}<span>${E(o.team)}</span></a>` : ''}</div></div>`;
    const bilgi = [];
    if (e.no && !e.milli) bilgi.push([e.no, 'Forma']);
    if (e.a) bilgi.push([e.a + ' yaş', 'Yaş']);
    if (e.milli && e.milli !== o.team) bilgi.push([`${bd(e.milli)}<span>${E(e.milli)}</span>`, 'Milli takım', 1]);
    if (e.milliNo) bilgi.push([e.milliNo, 'Milli takımda forma']);
    const tl = TM[o.team]; if (tl && tl.l) bilgi.push([`${tl.r}.`, E(ligAd(tl.l)) + ' sırası']);
    const nokta = { K: [50, 88], D: [50, 68], O: [50, 46], F: [50, 18] }[posK] || null;
    const saha = nokta ? `<div class="kmph-saha"><i class="ce"></i><i class="ku"></i><i class="ka"></i><b style="left:${nokta[0]}%;top:${nokta[1]}%">${({ Kaleci: 'KL', Defans: 'DF', 'Orta saha': 'OS', Forvet: 'FV' })[mev] || ''}</b></div>` : '';
    const ust = `<div class="kmph-g"><div class="kmph-b">${bilgi.length ? bilgi.map(([a, b, h]) => `<div><b${h ? ' class="kmph-n"' : ''}>${h ? a : E(a)}</b><small>${b}</small></div>`).join('') : '<p class="kmbos">Kişisel bilgi verisi yok.</p>'}</div>
        <div class="kmph-m"><h4>Mevki</h4>${mev ? `<b>${E(mev)}</b>` : '<p class="kmbos">veri yok</p>'}${saha}</div></div></div>`;
    const ml = oyuncuMaclari(o), api = ml.filter(m => m.pu !== undefined);
    const kut = (a, b) => `<div><b>${a}</b><small>${b}</small></div>`;
    const f2 = n => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
    let sezon;
    if (p) {
      const m90 = p[2] / 90, ek = [];
      if (p[6] === 'K') { if (p[8] != null) ek.push(kut(p[8], 'Gol yemeden')); if (p[9] != null) ek.push(kut(p[9], 'Yediği gol')); }
      if (p[2] >= 180) { ek.push(kut(f2(p[3] / m90), '90 dk\'da gol')); ek.push(kut(f2((p[3] + p[4]) / m90), '90 dk\'da gol+asist')); }
      sezon = card('kmpsz', `<h3 class="kmb">Sezon performansı <small>${E(o.team)}</small></h3><div class="kmph-s">${kut(p[3], 'Goller')}${kut(p[4], 'Asistler')}${kut(p[1], 'Maçlar')}${kut(p[2], 'Oyun süresi')}
        <div><b><i class="kmkrt s"></i>${p[5]}</b><small>Sarı kartlar</small></div>${ek.join('')}</div>
        <p class="kmkay">Kaynak: ${E(o.t.src || '–')}${o.t.at ? ', ' + E(o.t.at) : ''}. Hesaplanan değerler bu toplamlardan.</p>`);
    } else sezon = '';
    ((e.diger) || []).forEach(d => { const q = d.p, T = PS[d.tk] || {}; sezon += card('kmpsz', `<h3 class="kmb">Sezon performansı <small>${E(d.team)}</small></h3><div class="kmph-s">${kut(q[3], 'Goller')}${kut(q[4], 'Asistler')}${kut(q[1], 'Maçlar')}${kut(q[2], 'Oyun süresi')}<div><b><i class="kmkrt s"></i>${q[5]}</b><small>Sarı kartlar</small></div></div><p class="kmkay">Kaynak: ${E(T.src || '–')}${T.at ? ', ' + E(T.at) : ''}.</p>`); });
    // sitede biriken maclar (data/players/season.json): yarisma yarisma toplam; varsa maç verisinden hesaplananin yerine gecer
    const sz = sezonKaydi(e, o.team);
    if (sz && sz.c) Object.entries(sz.c).forEach(([c, v]) => {
      const t2 = (x, ad) => x == null ? '' : kut(x, ad);
      const ort = v.rn > 0 ? v.rs / v.rn : null, kl = (sz.pos || e.pos) === 'G' || (sz.pos || e.pos) === 'K';
      sezon += card('kmpsz', `<h3 class="kmb">${E(ligAd(c))} <small>sitede biriken maçlar (${v.m || 0} maç)</small></h3><div class="kmph-s">${t2(v.g, 'Goller')}${t2(v.a, 'Asistler')}${t2(v.m, 'Maçlar')}${t2(v.min, 'Oyun süresi')}
        ${ort ? `<div><b>${puanHap(ort.toFixed(1))}</b><small>Ortalama puan</small></div>` : ''}${kl ? t2(v.sv, 'Kurtarış') + t2(v.gc, 'Yenen gol') : t2(v.sh, 'Şut') + t2(v.kp, 'Kilit pas')}${t2(v.tk, 'Top çalma')}<div><b><i class="kmkrt s"></i>${v.y || 0}</b><small>Sarı kartlar</small></div></div>
        <p class="kmkay">Kaynak: API-Football maç verisi; yalnızca sitenin kaydetmeye başladığı tarihten sonraki maçlar (tam sezon değil), her maç sonunda otomatik güncellenir.</p>`);
    });
    const mil = sz ? [] : api.filter(m => true);
    if (mil.length) {
      const pu = mil.map(m => +m.pu).filter(x => x > 0), ort = pu.length ? pu.reduce((a, b) => a + b, 0) / pu.length : null;
      sezon += card('kmpsz', `<h3 class="kmb">${p ? 'Kayıtlı maçlar' : 'Sezon performansı'} <small>maç verisinden (${mil.length} maç)</small></h3><div class="kmph-s">${kut(mil.reduce((s, m) => s + m.g, 0), 'Goller')}${kut(mil.reduce((s, m) => s + m.a, 0), 'Asistler')}${kut(mil.length, 'Maçlar')}${kut(mil.reduce((s, m) => s + (+m.dk || 0), 0), 'Oyun süresi')}
        ${ort ? `<div><b>${puanHap(ort.toFixed(1))}</b><small>Ortalama puan</small></div>` : ''}<div><b><i class="kmkrt s"></i>${mil.reduce((s, m) => s + m.y, 0)}</b><small>Sarı kartlar</small></div></div>
        <p class="kmkay">Kaynak: API-Football maç verisi (yalnızca sitenin kaydettiği maçlar; maçlar oynandıkça güncellenir).</p>`);
    }
    if (!sezon) sezon = card('kmpsz', `<h3 class="kmb">Sezon performansı</h3><p class="kmbos">Bu oyuncu için istatistik verisi yok.</p>`);
    const tire = x => x == null || x === '' ? '–' : x;
    const maclar = ml.length ? card('kmpmc', `<h3 class="kmb">Maç istatistikleri</h3><table><thead><tr><th>Tarih</th><th class="tk">Rakip</th><th></th><th>Durum</th><th title="Oynadığı dakika">Dk</th><th title="Gol">Gol</th><th title="Asist">Ast</th><th title="Sarı kart"><i class="kmkrt s"></i></th><th>Puan</th></tr></thead><tbody>${ml.map(m => `<tr${m.bilinmez ? ' class="bz"' : ''}>
        <td><span>${E(m.d)}</span><small>${E(m.c || '')}</small></td><td class="tk"${m.rakip ? ` data-tm="${E(m.rakip)}"` : ''}>${m.rakip ? bd(m.rakip) : ''}<span>${E(m.rakip)}</span></td>
        <td class="sk">${m.r ? `<i class="kmkare ${sonuc(m.r)}">${E(m.r)}</i>` : ''}<span>${E(m.skor)}</span></td>
        <td>${E(m.dur || '–')}</td><td>${tire(m.dk)}</td><td>${m.bilinmez ? '–' : m.g}</td><td>${m.bilinmez ? '–' : m.a}</td><td>${m.bilinmez ? '–' : m.y}</td><td>${m.pu ? puanHap(m.pu) : '–'}</td></tr>`).join('')}</tbody></table>
        <p class="kmkay">Kulüp maçları takımın kayıtlı maçlarından, puanlı satırlar API-Football maç verisinden. "–": kaynakta yalnızca skor var.</p>`) : '';
    const nx = o.team ? siradaki(o.team) : null;
    const takim = o.team ? card('kmpyan', `<h3 class="kmb">Takım</h3><div class="kmpy" data-tm="${E(o.team)}">${bd(o.team, 1)}<div><b>${E(o.team)}</b><small>${tl && tl.l ? E(ligAd(tl.l)) + ' · ' + tl.r + '. sıra' : ''}</small></div></div>
        ${nx ? `<div class="kmpy-nx" data-kmm="${E(key(nx))}"><small>Sonraki maç</small><span>${E(nx.h)} – ${E(nx.a)}</span><small>${E(kisaTarih(nx.t))}, ${hm(nx.t)} · ${E(ligAd(nx.c))}</small></div>` : ''}`) : '';
    const mnx = e.milli && e.milli !== o.team ? siradaki(e.milli) : null;
    const milli = e.milli && e.milli !== o.team ? card('kmpyan', `<h3 class="kmb">Milli takım</h3><div class="kmpy" data-tm="${E(e.milli)}">${bd(e.milli, 1)}<div><b>${E(e.milli)}</b><small>Son kadroda${e.milliNo ? ' · ' + e.milliNo + ' numara' : ''}</small></div></div>
        ${mnx ? `<div class="kmpy-nx" data-kmm="${E(key(mnx))}"><small>Sonraki maç</small><span>${E(mnx.h)} – ${E(mnx.a)}</span><small>${E(kisaTarih(mnx.t))}, ${hm(mnx.t)} · ${E(ligAd(mnx.c))}</small></div>` : ''}`) : '';
    return bas + ust + sezon + maclar + `<div class="mside">${takim}${milli}</div>`;
  }
  // arama: birlesik dizinden oyuncular (tam ad ya da kisaltma)
  function oyuncuArama(q) {
    const qn = adN(q).join(' '); if (qn.length < 3) return [];
    const L = oyuncuIndeksi().L;
    return L.filter(e => adN(e.n).join(' ').includes(qn) || (e.adlar || [e.ad]).some(a => adN(a).join(' ').includes(qn))).slice(0, 16);
  }

  // lig sag sutunu: en cok gol / asist (uygulamanin oyuncu istatistiklerinden, PS["lig|takim"])
  function ligYan(c) {
    if (typeof PS === 'undefined') return '';
    const oy = []; let kay = '';
    Object.keys(PS).filter(k => k.startsWith(c + '|')).forEach(k => { const t = k.slice(c.length + 1), v = PS[k]; if (!v || !Array.isArray(v.p)) return; if (!kay && v.src) kay = v.src; v.p.forEach(p => oy.push({ n: p[0], t, g: +p[3] || 0, a: +p[4] || 0 })); });
    if (!oy.length) return '';
    const genel = /tüm yarışmalar|lig ve kupa/i.test(kay);
    if (genel && !Object.keys(TM).some(n => TM[n].l === c)) return '';
    const ek = genel ? ' <small>tüm yarışmalar</small>' : '';
    const liste = (alan, ad) => { const l = oy.filter(p => p[alan] > 0).sort((x, y) => y[alan] - x[alan]).slice(0, 5); return l.length ? card('kmlyan', `<h3 class="kmb">${ad}</h3>${l.map((p, i) => `<div class="kmly"><span>${i + 1}</span>${bd(p.t)}<div><b class="kmpln" data-pn="${E(p.t + '|' + p.n)}">${E(p.n)}</b><small data-tm="${E(p.t)}">${E(p.t)}</small></div><em>${p[alan]}</em></div>`).join('')}`) : ''; };
    const h = liste('g', 'En çok gol' + ek) + liste('a', 'En çok asist' + ek);
    return h ? `<div class="mside">${h}${kay ? `<p class="kmkay kmlkay">Kaynak: ${E(kay)}</p>` : ''}</div>` : '';
  }
  // ---- lig sayfasi: en coklar (uc sutun) ve gunluk fikstur ----
  function ligEnCoklar(c) {
    const L = oyuncuIndeksi().L.filter(e => e.ps && e.c === c);
    if (!L.length) return '';
    const kay = (PS[L[0].ps.tk] || {}).src || '';
    const genel = /tüm yarışmalar|lig ve kupa/i.test(kay);
    if (genel && !Object.keys(TM).some(n => TM[n].l === c)) return '';
    const sat = (e, v) => { const [a, b] = renk(e.team); return `<div class="kmec" data-pl="${E(e.key)}"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(e.n))}</i>${fotoImg(fotoUrl(e.team, { id: e.id, ph: e.ph, n: e.ad }))}</span><div><b>${E(e.n)}</b><small>${bd(e.team)}${E(e.team)}</small></div><em>${v}</em></div>`; };
    const kol = (ad, l) => `<div><h4>${ad}</h4>${l.length ? l.map(([e, v]) => sat(e, v)).join('') : '<p class="kmbos">Veri yok.</p>'}</div>`;
    const top = f => L.map(e => [e, f(e)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const pu = L.map(e => [e, sezonPuani(e, c)]).filter(x => x[1] && x[1].n >= 1).sort((a, b) => b[1].o - a[1].o).slice(0, 3).map(([e, p]) => [e, puanHap(p.o.toFixed(2))]);
    return card('kmec3', `<div class="kmuc">${pu.length ? kol('En çok puan alan', pu) : kol('En çok süre alan', top(e => +e.ps.p[2]))}${kol('En çok gol atan', top(e => +e.ps.p[3]))}${kol('En çok asist yapan', top(e => +e.ps.p[4]))}</div>
      <p class="kmkay">Kaynak: ${E(kay || 'kayıtlı veri')}${genel ? ' (tüm yarışmalar)' : ''}${pu.length ? '; puan: sitede biriken maçlar' : ''}.</p>`);
  }
  // lig tahmin karnesi: uygulamanin lgStats hesabiyla ayni (LGR kayitlari + pso sonucu), risk bandina gore
  function ligTahminKarti(c) {
    if (typeof LGR === 'undefined' || typeof pso !== 'function') return '';
    const B = [['Düşük riskli', p => p >= 0.7], ['Dengeli', p => p >= 0.45 && p < 0.7], ['Yüksek oran', p => p < 0.45]];
    const t = { tot: 0, h: 0, m: 0, w: 0 }, b = B.map(() => ({ tot: 0, h: 0, m: 0 }));
    R.filter(x => x.c === c).forEach(mm => { const k = [mm.c, mm.h, mm.a].join('|'); LGR.filter(r => r.mk === k).forEach(r => {
      t.tot++; const z = pso(mm, { k: r.k, p: r.p }); const i = B.findIndex(x => x[1](+r.p || 0));
      if (i >= 0) b[i].tot++;
      if (z === 'hit') { t.h++; if (i >= 0) b[i].h++; } else if (z === 'miss') { t.m++; if (i >= 0) b[i].m++; } else t.w++;
    }); });
    if (!t.tot) return card('kmkarne', `<div class="kmmh kmmh1"><div><h3>Tahmin karnesi</h3><small>${E(ligAd(c))}</small></div></div><p class="kmbos">Bu lig için kayıtlı tahmin yok.</p>`);
    const bit = t.h + t.m, yz = bit ? Math.round(t.h / bit * 100) : null;
    const sat = (ad, x) => { const s = x.h + x.m; return `<div class="kmkn"><span>${ad}</span><em>${x.tot}</em><em>${s ? `${x.h}/${s}` : '–'}</em><b class="${s ? (x.h / s >= 0.7 ? 'g' : x.h / s >= 0.5 ? 'o' : 'k') : ''}">${s ? '%' + Math.round(x.h / s * 100) : '–'}</b></div>`; };
    return card('kmkarne', `<div class="kmmh kmmh1"><div><h3>Tahmin karnesi</h3><small>${E(ligAd(c))}</small></div></div>
      <div class="kmkn-o"><b>${yz == null ? '–' : '%' + yz}</b><small>${bit ? `${t.h} / ${bit} tahmin tuttu` : 'Henüz sonuçlanan tahmin yok'}</small></div>
      ${bit ? `<div class="kmkn-bar"><i style="flex:${t.h}"></i><i style="flex:${t.m}"></i>${t.w ? `<i style="flex:${t.w}"></i>` : ''}</div><div class="kmkn-l"><span><i class="g"></i>Tuttu ${t.h}</span><span><i class="k"></i>Tutmadı ${t.m}</span>${t.w ? `<span><i></i>Bekliyor ${t.w}</span>` : ''}</div>` : ''}
      <div class="kmkn kmkn-b"><span></span><em>Tahmin</em><em>Tuttu</em><b>Oran</b></div>${B.map((x, i) => sat(x[0], b[i])).join('')}
      <p class="kmkay">Toplam ${t.tot} model tahmini; oran yalnızca sonuçlanan maçlardan. Bahis tavsiyesi değildir.</p>`);
  }
  // ---- takim notlari (NW): yalnizca takim ve lig sayfasinda; durumu bitmis notlar gizlenir ----
  // Kural: metindeki en gec tarih (6 Aralik, Ocak-Subat, "2026'da") gelecekteyse surer, gectiyse biter.
  // Tarih yoksa: uzun sakatlik/ameliyat 30 gun surer; diger notlar takim not tarihinden sonra mac oynayinca biter. En fazla 45 gun.
  const AYLAR = ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran', 'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'];
  const AYK3 = AYLAR.map(a => a.slice(0, 3));
  function notBitis(x) {
    const t0 = Date.parse(x.d) || 0, d0 = new Date(t0), metin = adN(x.x).join(' ');
    const yil = ay => d0.getFullYear() + (ay < d0.getMonth() - 2 ? 1 : 0);
    let son = 0;
    for (const m of metin.matchAll(/(\d{1,2}) ([a-z]+)/g)) { const k = m[2].slice(0, 3), ay = AYK3.indexOf(k); if (ay >= 0 && (m[2].length === 3 || AYLAR[ay].startsWith(m[2].slice(0, 4)))) son = Math.max(son, Date.UTC(yil(ay), ay, +m[1], 23)); }
    for (const m of metin.matchAll(/\b(ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik)\b/g)) { const ay = AYLAR.indexOf(m[1]); son = Math.max(son, Date.UTC(yil(ay), ay + 1, 0, 23)); }
    for (const m of metin.matchAll(/\b(20\d\d) ?(da|de|ta|te|yilinda)? oynamayacak/g)) son = Math.max(son, Date.UTC(+m[1], 11, 31, 23));
    return { t0, son, uzun: /ameliyat|kopma|lezyon|kirik|uzun sure|sezonu kapat|iyilesme suresi|haftalarca|aylarca/.test(metin) };
  }
  function notSuruyor(x) {
    const now = Date.now(), b = notBitis(x);
    if (!b.t0 || now - b.t0 > 45 * 864e5) return false;
    if (b.son && b.son >= now) return true;
    if (b.uzun) return now - b.t0 <= 30 * 864e5;
    if (b.son) return false;
    return !R.some(m => (m.h === x.tm || m.a === x.tm) && m.t > b.t0 + 6 * 3600e3 && stt(m).k === 'ft');
  }
  function takimNotlari(takimlar, baslik) {
    let l = []; try { l = (typeof NW !== 'undefined' && Array.isArray(NW)) ? NW.filter(x => x && takimlar.has(x.tm) && notSuruyor(x)) : []; } catch (e) { }
    if (!l.length) return '';
    l.sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
    const tarih = d => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(d || ''); return m ? `${m[3]}.${m[2]}` : E(d || ''); };
    return `<section class="kmc dzhaber kmnot"><h3>${E(baslik || 'Takım notları')}</h3>${l.slice(0, 6).map(x => `<div class="dzhb"><div class="dzhb-u"><b data-tm="${E(x.tm)}">${E(x.tm)}</b><small>${tarih(x.d)}</small></div><p>${E(x.x)}</p><small>Kaynak: ${E(x.src || '')}</small></div>`).join('')}</section>`;
  }
  function ligTakimlari(c) { const s = new Set(Object.keys(TM).filter(n => TM[n].l === c)); R.forEach(m => { if (m.c === c) { s.add(m.h); s.add(m.a); } }); return s; }
  let LFX = { c: '', i: -1 };
  function ligFikstur(c) {
    const ms = R.filter(m => m.c === c).sort((a, b) => a.t - b.t);
    if (!ms.length) return '';
    const gun = []; ms.forEach(m => { const d = dk(m.t); let g = gun[gun.length - 1]; if (!g || g.d !== d) { g = { d, t: m.t, l: [] }; gun.push(g); } g.l.push(m); });
    if (LFX.c !== c || LFX.i < 0 || LFX.i >= gun.length) { const bug = Date.now() - 3 * 3600e3; let i = gun.findIndex(g => g.l.some(m => m.t >= bug || stt(m).k === 'wait' || stt(m).k === 'live')); if (i < 0) i = gun.length - 1; LFX = { c, i }; }
    const g = gun[LFX.i];
    const sat = m => { const s = stt(m); return `<div class="kmlf" data-kmm="${E(key(m))}"><span class="b">${E(m.h)}${bd(m.h)}</span><em>${s.sc ? `${E(s.sc[0])} - ${E(s.sc[1])}` : hm(m.t)}</em><span>${bd(m.a)}${E(m.a)}</span></div>`; };
    return card('kmlfk', `<div class="kmmh"><button class="kmok" data-kmlfx="-1" ${LFX.i > 0 ? '' : 'disabled'} aria-label="Önceki gün">‹</button><div><h3>${E(uzunTarih(g.t))}</h3><small>${E(ligAd(c))}${m0rd(g.l)}</small></div><button class="kmok" data-kmlfx="1" ${LFX.i < gun.length - 1 ? '' : 'disabled'} aria-label="Sonraki gün">›</button></div>${g.l.map(sat).join('')}`);
  }
  const m0rd = l => { const r = l.find(m => m.rd); return r ? ' · ' + E(r.rd) : ''; };
  // ================= LIG SAYFASI =================
  // uygulamanin leagueView(c) ciktisini masaustunde FotMob duzenine cevirir; sekme dugmeleri (data-lt) uygulamaninkiler
  if (typeof leagueView === 'function') {
    const eskiLeagueView = leagueView;
    window.leagueView = function (c) {
      const eski = eskiLeagueView(c);
      if (!MQ.matches) return eski;
      try {
        const t = document.createElement('template'); t.innerHTML = eski;
        const kok = t.content;
        const sekmeler = [...kok.querySelectorAll('[data-lt]')];
        const bas = sekmeler.length ? sekmeler[0].closest('#app > *, template > *') || null : null;
        // ilk ust kutu: lig basligi ve sekmeler
        const ilk = [...kok.children].find(e => e.querySelector && e.querySelector('[data-lt]'));
        const bilgi = ilk ? (ilk.querySelector('.lg2 small') || {}).textContent || '' : '';
        const renk = (typeof C !== 'undefined' && C[c]) || 'var(--mut)';
        const kisa = (ligAd(c) || c).replace(/[^A-Za-zÇĞİÖŞÜçğıöşü ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase();
        const baslik = `<div class="kmc kmth kmlh"><div class="kmth-u">${typeof window.kmLigLogo === 'function' ? window.kmLigLogo(c, `<span class="kmlrz" style="background:${renk}">${E(kisa)}</span>`, 'buyuk') : `<span class="kmlrz" style="background:${renk}">${E(kisa)}</span>`}<div><h2>${E(ligAd(c))}</h2><small>${E(ulke(c) || bilgi)}</small></div></div>
          <div class="kmsek">${sekmeler.map(b => `<button data-lt="${E(b.dataset.lt)}" class="${b.classList.contains('on') ? 'on' : ''}">${E(b.textContent.trim())}</button>`).join('')}</div></div>`;
        if (ilk) ilk.remove();
        // puan durumu kutusu: FotMob tablosu (takim sayfasindaki ile ayni)
        const eskiTablo = [...kok.children].find(e => e.querySelector && e.querySelector('.tb.th'));
        const yeniTablo = tabloLig(c, []);
        if (eskiTablo && yeniTablo) eskiTablo.outerHTML = yeniTablo;
        const fx = ligFikstur(c), ec = (eskiTablo && yeniTablo) ? ligEnCoklar(c) : '';
        return baslik + `<div class="kmeski">${t.innerHTML}</div>` + ec + `<div class="mside">${fx}${ligTahminKarti(c)}${takimNotlari(ligTakimlari(c))}</div>`;
      } catch (e) { return eski; }
    };
  }

  // ================= ARAMA ACILIR LISTESI (FotMob: Tumu / Takimlar / Ligler / Oyuncular / Maclar) =================
  // Masaustunde yazarken sayfa degismez; liste acilir. Enter: eski tam sonuc sayfasi. Esc ya da disari tiklama: kapanir.
  const ligLg = (c, cls) => (typeof window.kmLigLogo === 'function' ? window.kmLigLogo(c, `<i class="kmlnok" style="background:${(typeof C !== 'undefined' && C[c]) || 'var(--mut)'}"></i>`, cls) : '');
  let ARS = 'tum';
  const gunAy = t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  function aramaVeri(q) {
    const qn = adN(q).join(' '); if (qn.length < 2) return null;
    const has = s => adN(s).join(' ').includes(qn);
    const takim = new Map();
    R.forEach(m => [m.h, m.a].forEach(n => { if (!takim.has(n)) takim.set(n, {}); const o = takim.get(n); o[m.c] = (o[m.c] || 0) + 1; }));
    Object.keys(TM).forEach(n => { if (!takim.has(n)) takim.set(n, {}); });
    const tl = [...takim.keys()].filter(has).map(n => { const t = TM[n]; const c = t && t.l ? t.l : Object.entries(takim.get(n)).sort((a, b) => b[1] - a[1]).map(x => x[0])[0]; return { n, c }; })
      .sort((a, b) => (adN(a.n).join(' ').startsWith(qn) ? 0 : 1) - (adN(b.n).join(' ').startsWith(qn) ? 0 : 1) || a.n.length - b.n.length).slice(0, 12);
    const ll = Object.keys(typeof LGNM !== 'undefined' ? LGNM : {}).filter(c => has(ligAd(c)) || has(LN[c] || '') || has(c) || ((typeof LGAN !== 'undefined' && LGAN[c]) || []).some(has)).slice(0, 8);
    const ol = oyuncuArama(q);
    const now = Date.now(), ad = new Set(tl.map(x => x.n));
    const ml = R.filter(m => ad.has(m.h) || ad.has(m.a)).sort((a, b) => Math.abs(a.t - now) - Math.abs(b.t - now)).slice(0, 10).sort((a, b) => a.t - b.t);
    return { tl, ll, ol, ml };
  }
  function aramaListe(q) {
    const v = aramaVeri(q);
    if (!v) return '';
    const tak = x => `<button class="kmar-s" data-tm="${E(x.n)}">${bd(x.n, 1)}<div><b>${E(x.n)}</b><small>${x.c ? E(ligAd(x.c)) : ''}</small></div></button>`;
    const lig = c => `<button class="kmar-s" data-kmlg="${E(c)}">${ligLg(c, 'orta')}<div><b>${E(ligAd(c))}</b><small>${E(ulke(c))}</small></div></button>`;
    const oyu = e => { const [a, b] = renk(e.team); return `<button class="kmar-s" ${e.ps ? `data-pl="${E(e.key)}"` : `data-pn="${E(e.team + '|' + e.ad)}"`}><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(e.n))}</i>${fotoImg(fotoUrl(e.team, { id: e.id, ph: e.ph, n: e.ad }))}</span><div><b>${E(e.n)}</b><small>${E(e.team)}${e.milli && e.milli !== e.team ? ' · ' + E(e.milli) : ''}</small></div></button>`; };
    const mac = m => { const s = stt(m), sc = s.sc; return `<button class="kmar-m" data-kmm="${E(key(m))}"><small class="kmar-l">${ligLg(m.c, 'kucuk')}${E(ligAd(m.c))}</small><div class="kmar-mt"><span>${bd(m.h)}<b>${E(m.h)}</b><em>${sc ? E(sc[0]) : ''}</em></span><span>${bd(m.a)}<b>${E(m.a)}</b><em>${sc ? E(sc[1]) : ''}</em></span></div><div class="kmar-mz">${sc ? `<span>${E(gunAy(m.t))}</span><small>${s.k === 'ft' ? 'MS' : 'Canlı'}</small>` : `<span>${E(gunEtiket(m.t) || gunAy(m.t))}</span><small>${hm(m.t)}</small>`}</div></button>`; };
    const bol = (ad, html) => html ? `<div class="kmar-b"><h5>${ad}</h5>${html}</div>` : '';
    let ic = '';
    if (ARS === 'tum') ic = bol('Takımlar', v.tl.slice(0, 3).map(tak).join('')) + bol('Ligler', v.ll.slice(0, 2).map(lig).join('')) + bol('Oyuncular', v.ol.slice(0, 4).map(oyu).join('')) + bol('Maçlar', v.ml.slice(0, 4).map(mac).join(''));
    else if (ARS === 'tak') ic = v.tl.map(tak).join('');
    else if (ARS === 'lig') ic = v.ll.map(lig).join('');
    else if (ARS === 'oyu') ic = v.ol.map(oyu).join('');
    else ic = v.ml.map(mac).join('');
    const sek = [['tum', 'Tümü'], ['tak', 'Takımlar'], ['lig', 'Ligler'], ['oyu', 'Oyuncular'], ['mac', 'Maçlar']];
    return `<div class="kmar-sek">${sek.map(([k, l]) => `<button data-kmars="${k}" class="${ARS === k ? 'on' : ''}">${l}</button>`).join('')}</div><div class="kmar-ic">${ic || '<p class="kmbos">Sonuç yok.</p>'}</div>`;
  }
  function aramaKutu() {
    let k = document.getElementById('kmar');
    if (!k) { k = document.createElement('div'); k.id = 'kmar'; k.hidden = true; document.body.appendChild(k); }
    const q = document.getElementById('q'); if (q) { const r = q.getBoundingClientRect(); k.style.left = r.left + 'px'; k.style.top = (r.bottom + 8) + 'px'; }
    return k;
  }
  function aramaGoster() {
    const q = document.getElementById('q'), k = aramaKutu(); if (!q) return;
    const h = aramaListe(q.value.trim());
    if (!h) { k.hidden = true; return; }
    k.innerHTML = h; k.hidden = false;
  }
  const aramaKapat = () => { const k = document.getElementById('kmar'); if (k) k.hidden = true; };
  window.addEventListener('input', e => {
    if (!MQ.matches || !e.target || e.target.id !== 'q') return;
    e.stopPropagation();
    if (!e.target.value.trim()) { aramaKapat(); try { Q = ''; QX = ''; render(); } catch (x) { } return; }
    aramaGoster();
  }, true);
  window.addEventListener('keydown', e => {
    if (!MQ.matches || !e.target || e.target.id !== 'q') return;
    if (e.key === 'Escape') { aramaKapat(); return; }
    if (e.key === 'Enter') { aramaKapat(); try { push(); det = null; PMV = null; tab = 'k'; Q = e.target.value; QX = ''; render(); } catch (x) { } }
  }, true);
  window.addEventListener('focusin', e => { if (MQ.matches && e.target && e.target.id === 'q' && e.target.value.trim()) aramaGoster(); });
  document.addEventListener('click', e => {
    const k = document.getElementById('kmar'); if (!k || k.hidden) return;
    const s = e.target.closest && e.target.closest('[data-kmars]');
    if (s) { e.preventDefault(); e.stopPropagation(); ARS = s.dataset.kmars; aramaGoster(); return; }
    const lg = e.target.closest && e.target.closest('[data-kmlg]');
    if (lg) { e.preventDefault(); e.stopPropagation(); aramaKapat(); const c = lg.dataset.kmlg; try { const nb = document.querySelector('nav button[data-t="l"]'); if (nb && tab !== 'l') nb.click(); Q = (window.kmLigQ ? window.kmLigQ(c) : LGNM[c]); QX = ''; const q = document.getElementById('q'); render(); if (q) q.value = LGNM[c] || Q; } catch (x) { } return; }
    if (e.target.closest && e.target.closest('#kmar')) { setTimeout(aramaKapat, 0); return; }
    if (!(e.target.closest && e.target.closest('#q'))) aramaKapat();
  }, true);
  addEventListener('resize', () => { const k = document.getElementById('kmar'); if (k && !k.hidden) aramaKutu(); });
  // ortak tiklamalar (yakalama asamasinda, uygulamanin belge dinleyicisinden once)
  document.addEventListener('click', e => {
    const mm = e.target.closest && e.target.closest('[data-kmm]');
    if (mm && !e.target.closest('[data-tm]')) { e.preventDefault(); try { push(); det = mm.dataset.kmm; dt = 'p'; PMV = null; render(); scrollTo(0, 0); } catch (x) { } return; }
    if (e.target.closest && e.target.closest('[data-kmpgeri]')) { e.preventDefault(); try { if (!back()) { Q = ''; QX = ''; render(); } } catch (x) { } return; }
    const lf = e.target.closest && e.target.closest('[data-kmlfx]');
    if (lf) { if (!lf.disabled) { LFX.i += +lf.dataset.kmlfx; render(); } return; }
    const dv = e.target.closest && e.target.closest('[data-kmdv]');
    if (dv) { DV = dv.dataset.kmdv; render(); return; }
    const oi = e.target.closest && e.target.closest('[data-kmois]');
    if (oi) { OIS = oi.dataset.kmois; OSS = { k: '', y: -1 }; render(); return; }
    const os = e.target.closest && e.target.closest('[data-kmoss]');
    if (os) { const kk = os.dataset.kmoss, cur = OSS.k || (os.classList.contains('on') ? kk : ''); OSS = cur === kk ? { k: kk, y: -OSS.y } : { k: kk, y: -1 }; render(); return; }
    const tt = e.target.closest && e.target.closest('[data-kmtt]');
    if (tt) { TT = tt.dataset.kmtt; render(); return; }
    const sf = e.target.closest && e.target.closest('[data-kmsmf]');
    if (sf) { SMF = sf.dataset.kmsmf; render(); return; }
    const ms = e.target.closest && e.target.closest('[data-kmms]');
    if (ms) { if (!ms.disabled) { MKS = ms.dataset.kmms; render(); } return; }
    const fv = e.target.closest && e.target.closest('[data-kmfav]');
    if (fv) { try { favTgl(fv.dataset.kmfav); } catch (x) { } render(); }
  }, true);
  MQ.addEventListener('change', () => { try { render(); } catch (e) { } });
})();
