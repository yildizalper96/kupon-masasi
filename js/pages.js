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
    const sek = [['p', 'Önizleme'], ['k', 'Kadro'], ['i', 'İstatistik'], ['z', 'Tablo'], ['m', 'Maçlar'], ['s', 'Seriler']];
    return `<div class="kmc kmh">
      <div class="kmh-ust"><button class="kmgeri" data-bk="1">${ic.geri}<span>Maçlar</span></button>
        <div class="kmh-lig"><span class="kmlnok" style="background:${(typeof C !== 'undefined' && C[m.c]) || 'var(--mut)'}"></span>${E(ligAd(m.c))}${x.round || m.rd ? ' · ' + E(x.round || m.rd) : ''}</div><span></span></div>
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
      const sat = p => `<div class="kmoyr"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(p.n))}</i>${fotoImg(fotoUrl(n, p))}</span><div><b>${E(p.n)}</b><small>${p.no ? '#' + E(p.no) : ''}${p.no && p.a ? ' · ' : ''}${p.a ? E(p.a) + ' yaş' : ''}</small></div></div>`;
      return `<div class="kmdl"><div class="kmdl-b">${bd(n)}<b>${E(n)}</b><span>${sq.p.length} oyuncu</span></div>${GR.map(([k, l]) => { const ps = sq.p.filter(p => (p.p || '') === k); return ps.length ? `<h5>${l}</h5>${ps.map(sat).join('')}` : ''; }).join('')}</div>`;
    };
    const inj = e.inj || [];
    const eks = s => { const o = inj.filter(x => x.s === s); return o.length ? o.map(x => `<div class="kmeks"><i class="${/Cezalı/.test(nedenTr(x.r)) ? 'kmkk' : 'kmsk'}"></i><div><b>${E(x.n)}</b><small>${E(nedenTr(x.r))}</small></div></div>`).join('') : '<p class="kmbos">Açıklanan eksik yok.</p>'; };
    return card('kmkadro kmdavet', `<div class="kmkb"><div>${bd(m.h)}<b>${E(m.h)}</b></div><h3>Davet edilen oyuncular</h3><div><b>${E(m.a)}</b>${bd(m.a)}</div></div>
      <p class="kmnot">Resmi ilk 11 açıklanınca (genelde maçtan 1 saat önce) burada sahada dizilişiyle görünür.</p>
      <div class="kmiki kmdl2">${kol(yan[0])}${kol(yan[1])}</div>
      <h4 class="kmalt">Sakat ve cezalı oyuncular</h4><div class="kmiki"><div>${eks('h')}</div><div>${eks('a')}</div></div>
      <p class="kmkay">Davet listesidir, maç kadrosu değildir. Kaynak: API-Football.</p>`);
  }
  // resmi ilk 11 (API ham veri, grid "satir:sutun"): FotMob gibi yatay saha, fotografli
  function hamSaha(m, raw) {
    const ok = t => t && Array.isArray(t.xi) && t.xi.length >= 10 && t.xi.every(p => /^\d+:\d+$/.test(String(p.grid || '')));
    if (!ok(raw.h) || !ok(raw.a)) return '';
    const oyuncu = (n, p) => { const [a, b] = renk(n); return `<div class="pp kmpp" data-pn="${E(n)}|${E(p.n)}"><span class="kmav buyuk" style="--ka:${a};--kb:${b}"><i>${E(p.no || basH(p.n))}</i>${fotoImg(fotoUrl(n, p))}</span><span>${p.no ? `<em>${E(p.no)}</em> ` : ''}${E(String(p.n).split(' ').pop())}</span></div>`; };
    const sutunlar = (n, t, ters) => {
      const g = {}; t.xi.forEach(p => { const [r, c] = String(p.grid).split(':').map(Number); (g[r] = g[r] || []).push([c, p]); });
      return Object.keys(g).map(Number).sort((x, y) => x - y).map(r => {
        const l = g[r].sort((x, y) => x[0] - y[0]).map(x => x[1]); if (ters) l.reverse();
        return `<div class="kmps">${l.map(p => oyuncu(n, p)).join('')}</div>`;
      }).join('');
    };
    const yedek = (n, t) => (t.bn || []).length ? t.bn.map(p => { const [a, b] = renk(n); return `<div class="kmoyr"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(p.no || basH(p.n))}</i>${fotoImg(fotoUrl(n, p))}</span><div><b>${E(p.n)}</b><small>${p.no ? '#' + E(p.no) : ''}</small></div></div>`; }).join('') : '<p class="kmbos">Yedek listesi yok.</p>';
    const X = window.KMX, e = X && X.byKey && X.byKey[key(m)], inj = (e && e.inj) || [];
    const eks = s => { const o = inj.filter(x => x.s === s); return o.length ? o.map(x => `<div class="kmeks"><i class="${/Cezalı/.test(nedenTr(x.r)) ? 'kmkk' : 'kmsk'}"></i><div><b>${E(x.n)}</b><small>${E(nedenTr(x.r))}</small></div></div>`).join('') : '<p class="kmbos">Açıklanan eksik yok.</p>'; };
    return card('kmkadro', `<div class="kmkb"><div>${bd(m.h)}<b>${E(m.h)}</b><span>${E(raw.h.f || '')}</span></div><h3>Resmi ilk 11</h3><div><span>${E(raw.a.f || '')}</span><b>${E(m.a)}</b>${bd(m.a)}</div></div>
      <div class="kmsaha"><i class="kmorta-c"></i><i class="kmorta-n"></i><i class="kmceza s"></i><i class="kmceza g"></i>
        <div class="kmyari">${sutunlar(m.h, raw.h, true)}</div><div class="kmyari dep">${sutunlar(m.a, raw.a, false)}</div></div>
      <h4 class="kmalt">Yedekler</h4><div class="kmiki"><div>${yedek(m.h, raw.h)}</div><div>${yedek(m.a, raw.a)}</div></div>
      <h4 class="kmalt">Sakat ve cezalı oyuncular</h4><div class="kmiki"><div>${eks('h')}</div><div>${eks('a')}</div></div>
      <p class="kmkay">Kaynak: API-Football (resmi ilk 11).</p>`);
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
  function formKarti(m) {
    const sat = n => son5(n).slice().reverse().map(r => {
      const ev = r.H ? n : r.o, dep = r.H ? r.o : n, sk = r.H ? `${r.f} - ${r.c}` : `${r.c} - ${r.f}`;
      return `<div class="kmfs"><span data-tm="${E(ev)}">${E(ev)}</span><i class="kmhap ${sonuc(r.r)}">${sk}</i><span data-tm="${E(dep)}">${E(dep)}</span></div>`;
    }).join('') || '<p class="kmbos">Kayıtlı lig maçı yok.</p>';
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
  const eskiDetail = detail;
  window.detail = function (m) {
    const eski = eskiDetail(m);
    if (!MQ.matches) return eski;
    const p = eskiParcalar(m, eski), x = xm(m);
    const yan = `<div class="mside">${kimKazanir(m)}${p.tbx}${stadKarti(x.venue)}${hakemKarti(x.ref)}${bilgiKarti(m)}${p.nwb}</div>`;
    let ana;
    if (dt === 'p') ana = kadroKarti(m) + olaylarKarti(m) + formKarti(m) + h2hKarti(m) + (typeof kpBox === 'function' ? kpBox(m) : '');
    else if (dt === 'z' && TM[m.h] && TM[m.h].l === m.c) ana = tabloKutusu(m.h, [m.h, m.a]);
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
      <div class="kmsek"><button data-kmtt="o" class="${TT === 'o' ? 'on' : ''}">Genel bakış</button><button data-kmtt="m" class="${TT === 'm' ? 'on' : ''}">Maçlar ve tahminler</button></div>
    </div>`;
  }
  function formKutusu(n) {
    const f = son5(n);
    return card('kmtform', `<h3 class="kmb">Takım formu</h3>${f.length ? `<div class="kmtf">${f.map(r => `<div><i class="kmhap ${sonuc(r.r)}">${r.H ? `${r.f} - ${r.c}` : `${r.c} - ${r.f}`}</i>${bd(r.o, 1)}<small data-tm="${E(r.o)}">${E(r.o)}</small></div>`).join('')}</div>` : '<p class="kmbos">Kayıtlı lig maçı yok.</p>'}`);
  }
  function sonrakiKutusu(n) {
    const x = siradaki(n);
    if (!x) return card('kmsonraki', `<h3 class="kmb">Sonraki maç</h3><p class="kmbos">Takvimde sıradaki maç yok.</p>`);
    return card('kmsonraki', `<div class="kmb2"><h3 class="kmb">Sonraki maç</h3><small>${E(ligAd(x.c))}</small></div>
      <div class="kmsm" data-kmm="${E(key(x))}"><div>${bd(x.h, 1)}<b>${E(x.h)}</b></div><div class="kmsm-o"><b>${hm(x.t)}</b><small>${E(gunEtiket(x.t) || kisaTarih(x.t))}</small></div><div>${bd(x.a, 1)}<b>${E(x.a)}</b></div></div>`);
  }
  function tabloKutusu(n, vurgu) {
    const t = TM[n], hl = new Set(vurgu || [n]);
    if (!t || !t.l) return card('kmtablo', `<h3 class="kmb">Puan durumu</h3><p class="kmbos">Bu takım için lig puan durumu verisi yok.</p>`);
    const ts = Object.entries(TM).filter(([, v]) => v.l === t.l).sort((a, b) => a[1].r - b[1].r);
    const satir = ([k, v]) => {
      const f = son5(k), nx = siradaki(k), op = nx ? (nx.h === k ? nx.a : nx.h) : '';
      return `<tr class="${hl.has(k) ? 'hl' : ''}"><td>${v.r}</td><td class="tk" data-tm="${E(k)}">${bd(k)}<span>${E(k)}</span></td><td>${v.w + v.d + v.o}</td><td>${v.w}</td><td>${v.d}</td><td>${v.o}</td><td>${v.f}-${v.a}</td><td>${v.f - v.a > 0 ? '+' : ''}${v.f - v.a}</td><td><b>${v.p}</b></td>
        <td class="fm">${f.map(r => `<i class="kmkare ${sonuc(r.r)}">${r.r}</i>`).join('')}</td><td class="nx">${op ? bd(op) : ''}</td></tr>`;
    };
    return card('kmtablo', `<h3 class="kmb">${E(ligAd(t.l))}</h3><table><thead><tr><th>#</th><th class="tk"></th><th>O</th><th>G</th><th>B</th><th>M</th><th>+/-</th><th>AV</th><th>PUAN</th><th>Form</th><th>Sonraki</th></tr></thead><tbody>${ts.map(satir).join('')}</tbody></table>`);
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
  let MKS = 'gel', MKSn = '';
  const eskiTeamView = teamView;
  window.teamView = function () {
    const tek = QX && Q === QX && !QX.startsWith('@p:') && (typeof lgm !== 'function' || lgm(Q).length !== 1 || R.some(m => m.h === QX || m.a === QX));
    if (!MQ.matches || !tek) { eskiTeamView(); return; }
    const n = QX;
    if (TTn !== n) { TTn = n; TT = 'o'; }
    if (TT === 'm') {
      eskiTeamView();
      document.getElementById('app').insertAdjacentHTML('afterbegin', takimBaslik(n));
      document.getElementById('app').classList.add('kmeskitv');
    } else {
      document.getElementById('app').classList.remove('kmeskitv');
      const x = xt(n);
      document.getElementById('app').innerHTML = takimBaslik(n)
        + `<div class="kmiki2">${formKutusu(n)}${sonrakiKutusu(n)}</div>`
        + tabloKutusu(n) + hocaKutusu(n) + oyuncuKutusu(n)
        + `<div class="mside">${sezonKutusu(n)}${maclarKutusu(n)}${stadKarti(x.venue)}</div>`;
    }
  };

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
        const baslik = `<div class="kmc kmth kmlh"><div class="kmth-u"><span class="kmlrz" style="background:${renk}">${E(kisa)}</span><div><h2>${E(ligAd(c))}</h2><small>${E(ulke(c) || bilgi)}</small></div></div>
          <div class="kmsek">${sekmeler.map(b => `<button data-lt="${E(b.dataset.lt)}" class="${b.classList.contains('on') ? 'on' : ''}">${E(b.textContent.trim())}</button>`).join('')}</div></div>`;
        if (ilk) ilk.remove();
        // puan durumu kutusu: FotMob tablosu (takim sayfasindaki ile ayni)
        const ilkTakim = Object.keys(TM).find(n => TM[n].l === c);
        const eskiTablo = [...kok.children].find(e => e.querySelector && e.querySelector('.tb.th'));
        if (eskiTablo && ilkTakim) eskiTablo.outerHTML = tabloKutusu(ilkTakim, []);
        return baslik + `<div class="kmeski">${t.innerHTML}</div>`;
      } catch (e) { return eski; }
    };
  }

  // ortak tiklamalar (yakalama asamasinda, uygulamanin belge dinleyicisinden once)
  document.addEventListener('click', e => {
    const mm = e.target.closest && e.target.closest('[data-kmm]');
    if (mm && !e.target.closest('[data-tm]')) { e.preventDefault(); try { push(); det = mm.dataset.kmm; dt = 'p'; PMV = null; render(); scrollTo(0, 0); } catch (x) { } return; }
    const tt = e.target.closest && e.target.closest('[data-kmtt]');
    if (tt) { TT = tt.dataset.kmtt; render(); return; }
    const ms = e.target.closest && e.target.closest('[data-kmms]');
    if (ms) { if (!ms.disabled) { MKS = ms.dataset.kmms; render(); } return; }
    const fv = e.target.closest && e.target.closest('[data-kmfav]');
    if (fv) { try { favTgl(fv.dataset.kmfav); } catch (x) { } render(); }
  }, true);
  MQ.addEventListener('change', () => { try { render(); } catch (e) { } });
})();
