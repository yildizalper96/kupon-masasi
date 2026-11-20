// Tasarim v2: masaustu (>=1100px) mac ve takim sayfalari, FotMob duzeninde.
// Uygulamanin detail() ve teamView() fonksiyonlarini sarar; telefonda/tablette eski gorunum aynen kalir.
// Veri: uygulamanin kendi verisi (R, TM, SLG, LU, LVD, PS, NW, pick/pa) + istege bagli ek veri
// data/extra/latest.json (istatistik ajani doldurur; sozlesme CLAUDE.md "Ek veri sozlesmesi").
// Ek veri yoksa ilgili kart HIC gosterilmez; veri uydurulmaz.
(function () {
  if (typeof detail !== 'function' || typeof teamView !== 'function') return;
  const MQ = matchMedia('(min-width:0px)'); // masaustu tasarimi her genislikte (telefon: tek sutun, css/app.css 'Mobil' blogu)
  let X = { matches: {}, teams: {} };
  const ekYukle = () => fetch('data/extra/latest.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => {
    if (j && typeof j === 'object') { X = { matches: j.matches || {}, teams: j.teams || {}, at: j.at }; try { render(); } catch (e) { } }
  }).catch(() => { });
  (window.kmBoot||function(p){return p})(ekYukle()); (window.kmReloaders = window.kmReloaders || []).push(ekYukle);

  const E = s => (typeof stE === 'function' ? stE(s) : String(s == null ? '' : s));
  // kaynak: yalnizca marka adi (ayrinti yok)
  const KYM = /statz.ai|API-Football|Transfermarkt|FBref|Sofascore|FotMob|WhoScored|Opta|Understat|Flashscore|Soccerway|ESPN|BBC|UEFA|FIFA|Wikipedia/ig;
  const KY = s => { s = String(s == null ? '' : s); const m = [...new Set((s.match(KYM) || []).map(x => x.replace(/^api-football$/i, 'API-Football')))]; if (m.length) return m.join(', '); const t = s.split(/[;|(,]|.s|.$/)[0].trim(); return t || 'kayıtlı veri'; };
  window.KMKAY = KY;
  const key = m => [m.c, m.h, m.a].join('|');
  // dis kaynakli lig (window.KMLX, data/standings/<LIG>.json): ev sahibinin stadyumu (Wikipedia); ek veri dosyasinda varsa o gecerli
  function disMac(m) {
    const sd = window.KMLX && window.KMLX[m.c], r = sd && (sd.rows || []).find(x => x.n === m.h);
    return r && r.st ? { venue: { name: r.st, city: r.city || '', cap: r.cap || 0, surface: r.surface || '' } } : null;
  }
  const xm = m => { const e = (X.matches && X.matches[key(m)]) || {}; if (e.venue) return e; const d = disMac(m); return d ? Object.assign({}, d, e) : e; };
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
    const alt = n => { const r = x.rank && (n === m.h ? x.rank.h : x.rank.a); if (r) return E(r); const t = TM[n]; if (t && t.r) return `${E(ligAd(t.l))} · ${t.r}.`; const mn = !TM[n] && tmMilli(n); return mn && mn.rk ? `FIFA #${mn.rk}` : ''; };
    const orta = s.sc
      ? `<b class="kmskor">${s.sc[0]} - ${s.sc[1]}</b><span>${s.k === 'ft' ? 'Maç sonu' : (s.k === 'live' || s.k === 'on') ? 'Canlı' : 'Son skor'}</span>`
      : `<b class="kmskor">${hm(m.t)}</b><span>${gun || dd(m.t)}</span>`;
    const bilgi = [`<span>${ic.tarih}${E(uzunTarih(m.t))}, ${hm(m.t)}</span>`];
    if (x.venue && x.venue.name) bilgi.push(`<span>${ic.stad}${E(x.venue.name)}</span>`);
    if (x.tv) bilgi.push(`<span>${ic.tv}${E(x.tv)}</span>`);
    const sek = [['a', 'Analiz'], ['p', 'Bilgiler'], ['k', 'Kadro'], ['i', 'İstatistik'], ['z', 'Tablo'], ['m', 'Maçlar'], ['s', 'Seriler']];
    return `<div class="kmc kmh">
      <div class="kmh-ust"><button class="kmgeri" data-bk="1">${ic.geri}<span>Maçlar</span></button>
        <div class="kmh-lig" data-kmgolig="${E(m.c)}">${ligLg(m.c, 'orta')}${E(ligAd(m.c))}${x.round || m.rd ? ' · ' + E(x.round || m.rd) : ''}</div><span></span></div>
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
  // ---- TELEFON (<=1099px) mac basligi: geri dugmesi, buyuk logolar alt alta ad, skor, golculer; ayri yapiskan serit (kucuk skor + sekmeler) ----
  const DAR = matchMedia('(max-width:1099px)');
  function macBaslikMobil(m) {
    const s = stt(m), x = xm(m), gun = gunEtiket(m.t), canli = s.k === 'live' || s.k === 'on';
    const alt = n => { const r = x.rank && (n === m.h ? x.rank.h : x.rank.a); if (r) return E(r); const t = TM[n]; return t && t.r && t.l === m.c ? `${t.r}. sırada` : ''; };
    const durum = s.k === 'ft' ? 'Maç sonu' : canli ? 'Canlı' : 'Son skor';
    const orta = s.sc ? `<b class="kmskor">${s.sc[0]} - ${s.sc[1]}</b><span class="${canli ? 'cn' : ''}">${durum}</span>`
      : `<b class="kmskor saat">${hm(m.t)}</b><span>${E(gun || kisaTarih(m.t))}</span>`;
    const tk = (n, c) => { const a = alt(n); return `<div class="kmtk ${c}">${bd(n, 1)}<b data-tm="${E(n)}">${E(n)}</b>${a ? `<small>${a}</small>` : ''}</div>`; };
    const sek = [['a', 'Analiz'], ['p', 'Bilgiler'], ['k', 'Kadro'], ['z', 'Tablo'], ['i', 'İstatistik'], ['m', 'Karşılaşmalar'], ['s', 'Seriler']];
    const tur = x.round || m.rd;
    return `<div class="kmc kmh kmhm">
      <div class="kmhm-ust"><button class="kmgeri" data-bk="1" aria-label="Geri">${ic.geri}</button><div class="kmhm-lig">${ligLg(m.c, 'orta')}<span>${E(ligAd(m.c))}${tur ? ' · ' + E(tur) : ''}</span></div><span class="kmhm-bos"></span></div>
      <div class="kmh-skor">${tk(m.h, 'ev')}<div class="kmorta">${orta}</div>${tk(m.a, 'dep')}</div>
      ${typeof dgl === 'function' ? dgl(m) : ''}
    </div>
    <div class="kmyap"><div class="kmmini"><button class="kmgeri" data-bk="1" aria-label="Geri">${ic.geri}</button><div class="kmmini-s">${bd(m.h, 1)}<b>${s.sc ? s.sc[0] + ' - ' + s.sc[1] : hm(m.t)}</b>${bd(m.a, 1)}</div><span class="kmhm-bos"></span></div>
      <div class="kmsek">${sek.map(([k, l]) => `<button data-dt="${k}" class="${dt === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>`;
  }
  // telefon Bilgiler sekmesi: lig/tur ve tarih karti (veri yoksa satir yok)
  function macBilgiKarti(m) {
    const x = xm(m), tur = x.round || m.rd, gun = gunEtiket(m.t);
    return card('kmmbilgi', `<div class="kmmb-r">${ligLg(m.c, 'orta')}<b>${E(ligAd(m.c))}</b>${tur ? `<span>· ${E(tur)}</span>` : ''}</div>
      <div class="kmmb-r"><i class="kmmb-i">${ic.tarih}</i><b>${E(gun || uzunTarih(m.t))}</b><span>${hm(m.t)}</span></div>
      ${x.tv ? `<div class="kmmb-r"><i class="kmmb-i">${ic.tv}</i><b>${E(x.tv)}</b></div>` : ''}`);
  }
  // yapiskan seritte kucuk skor: buyuk baslik ekrandan cikinca gorunur
  addEventListener('scroll', () => {
    const y = document.querySelector('#app > .kmyap'), s = document.querySelector('#app > .kmhm .kmh-skor');
    if (y && s) y.classList.toggle('mini', s.getBoundingClientRect().bottom < 8);
    if (y) document.documentElement.style.setProperty('--yapH', y.offsetHeight + 'px');
  }, { passive: true });
  // puan tablosu gorunumu (telefon): Kisa / Tam / Form
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-kmtv]'); if (!b) return;
    const k = b.closest('.kmtablo'); if (!k) return;
    k.dataset.v = b.dataset.kmtv; k.querySelectorAll('[data-kmtv]').forEach(x => x.classList.toggle('on', x === b));
  });
  // ---- oyuncu fotografi (API-Football): kimlik ya da adres varsa; yuklenmezse bas harf dairesi kalir ----
  const fotoUrl = (takim, p) => {
    if (p && p.ph) return p.ph;
    if (p && Number.isFinite(+p.id) && +p.id > 0) return `https://media.api-sports.io/football/players/${+p.id}.png`;
    try { if (window.KMX && typeof KMX.photo === 'function') return KMX.photo(takim, p && (p.n || p)) || ''; } catch (e) { }
    return '';
  };
  const fotoImg = u => u ? `<img class="kmfoto" src="${E(u)}" alt="" decoding="async" referrerpolicy="no-referrer" onload="(this.parentNode||this).classList.add('hf')" onerror="this.remove()">` : '';
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
      <p class="kmkay">Davet listesidir, maç kadrosu değildir. Kaynak: API-Football</p>`);
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
    mac: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.6"/></svg>',
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
    return card('kmetk', `<h3 class="kmb orta">Etkinlikler</h3><div class="kmetw">${ev.map(sat).join('')}${son}</div>${v.src ? `<p class="kmkay">Kaynak: ${E(KY(v.src))}</p>` : ''}`);
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
      <p class="kmkay">Kaynak: API-Football</p>`);
  }
  // kulup maclari (PS: Transfermarkt sezon kadrosu): resmi ilk 11 yokken iki takimin kadrosu mevkiye gore
  function kulupKadroKarti(m) {
    const A = PS[m.c + '|' + m.h], B = PS[m.c + '|' + m.a];
    if (!(A && A.p && A.p.length) && !(B && B.p && B.p.length)) return '';
    const GR = [['K', 'Kaleciler'], ['D', 'Defans'], ['O', 'Orta saha'], ['F', 'Forvetler']];
    const col = (n, t) => {
      if (!t || !t.p || !t.p.length) return `<div><p class="kmbos">${E(n)} için kadro verisi yok.</p></div>`;
      const pl = t.p.filter(x => x[1] > 0).sort((a, b) => b[2] - a[2]);
      return `<div><p style="margin:0 0 6px"><b>${E(n)}</b> <span style="opacity:.65">· ${pl.length} oyuncu</span></p>` + GR.map(([g, ad]) => { const l = pl.filter(x => x[6] === g); return l.length ? `<p style="margin:6px 0;font-size:13px;line-height:1.55"><b>${ad}:</b> ${l.map(x => E(x[0]) + (x[7] ? ` (${x[7]})` : '')).join(', ')}</p>` : ''; }).join('') + '</div>';
    };
    return card('kmkadro', `<h3 class="kmb">Takım kadroları</h3><div class="kmiki">${col(m.h, A)}${col(m.a, B)}</div><p class="kmkay">Bu sezon lig maçında forma giyen oyuncular (parantez: forma numarası), en çok süre alandan başlayarak. Resmi ilk 11 açıklanınca (genelde maçtan 1 saat önce) sahada görünür. Kaynak: Transfermarkt.</p>`);
  }
  function kadroKarti(m) {
    try { const raw = window.KMX && typeof KMX.luRaw === 'function' && KMX.luRaw(m); if (raw) { const h = hamSaha(m, raw); if (h) return h; } } catch (e) { }
    const lu = LU[key(m)];
    if (!lu) return davetListesi(m) || (window.KMX && KMX.squadCard && KMX.squadCard(m)) || kulupKadroKarti(m) || card('kmkadro', `<h3 class="kmb">Kadro</h3><p class="kmbos">Bu maç için muhtemel 11 ya da kadro verisi yok.</p>`);
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
      ${lu.src ? `<p class="kmkay">Kaynak: ${E(KY(lu.src))}</p>` : ''}`);
  }
  // biriken biten maclar (veri oturumu: data/fixtures/finished.json = {at, m:[{id,c,t,h,a,x,y}]}); yoksa bos
  let BITEN = [];
  window.kmBiten = () => BITEN;
  const bitenYukle = () => fetch('data/fixtures/finished.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { if (j && Array.isArray(j.m)) { BITEN = j.m; try { render(); } catch (e) { } } }).catch(() => { });
  (window.kmBoot||function(p){return p})(bitenYukle()); (window.kmReloaders = window.kmReloaders || []).push(bitenYukle);
  // Takim formu: once lig kaydi (SLG); yoksa uygulamadaki biten maclar + karsilasma gecmisi (tum yarismalar), acilan mac haric
  function formListesi(n, m) {
    const slg = son5(n);
    if (slg.length) return slg.slice().reverse().map(r => ({ ev: r.H ? n : r.o, dep: r.H ? r.o : n, sk: r.H ? `${r.f} - ${r.c}` : `${r.c} - ${r.f}`, r: r.r }));
    const l = [], gor = new Set(), ren = (x, y) => x > y ? 'G' : x < y ? 'M' : 'B';
    const ekle = (h, a, x, y, t) => { const k = h + '|' + a + '|' + x + '-' + y + '|' + new Date(t).toISOString().slice(0, 10); if (gor.has(k)) return; gor.add(k); l.push({ ev: h, dep: a, sk: x + ' - ' + y, r: h === n ? ren(x, y) : ren(y, x), t }); };
    BITEN.forEach(x => { if (!x || (x.h !== n && x.a !== n) || (x.c === m.c && x.h === m.h && x.a === m.a)) return; const t = Date.parse(x.t); if (t && Number.isFinite(+x.x) && Number.isFinite(+x.y)) ekle(x.h, x.a, +x.x, +x.y, t); });
    R.forEach(x => { if (key(x) === key(m) || (x.h !== n && x.a !== n)) return; const s2 = stt(x); if (s2.k === 'ft' && s2.sc) ekle(x.h, x.a, +s2.sc[0], +s2.sc[1], x.t); });
    // karsilasma gecmisi (HH) form sayilmaz: yalniz o iki takimin maclari oldugundan form yaniltici ("takili") gorunuyordu; ayri kartta gosterilir
    return l.sort((p, q) => q.t - p.t).slice(0, 5);
  }
  // ================= ANALIZ SEKMESI (17 Kas 2026) =================
  // Bahisci icin ilk ve varsayilan sekme: modelin onerileri (kupona ekle), one cikanlar, form karsilastirmasi, gol pazarlari (son maclar vs model), aralarindaki maclar.
  // Yalniz mevcut veriden hesaplanir (formListesi, HH, tabloSatir, model olasiliklari); veri yoksa ilgili bolum gizlenir.
  function anzIst(n, m) {
    const l = formListesi(n, m); const o = { n, ok: 0, rs: [], ms: [], det: [], g: 0, b: 0, mg: 0, at: 0, ye: 0, cs: 0, fts: 0, u15: 0, u25: 0, u35: 0, kg: 0, yer: { g: 0, b: 0, m: 0, ok: 0 } };
    l.forEach(r => { const p = String(r.sk).split('-').map(s => +s.trim()); if (p.length !== 2 || p.some(isNaN)) return; const ev = r.ev === n, ben = ev ? p[0] : p[1], ka = ev ? p[1] : p[0], t = ben + ka;
      o.ok++; o.rs.push(r.r); o.ms.push([ben, ka]); o.det.push(r.ev + ' ' + String(r.sk).replace(/\s*-\s*/, ' - ') + ' ' + r.dep + (r.t ? ' · ' + new Date(r.t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '')); o.at += ben; o.ye += ka; if (ka === 0) o.cs++; if (ben === 0) o.fts++; if (t > 1.5) o.u15++; if (t > 2.5) o.u25++; if (t > 3.5) o.u35++; if (ben > 0 && ka > 0) o.kg++;
      if (r.r === 'G') o.g++; else if (r.r === 'B') o.b++; else o.mg++;
      if (ev === (n === m.h)) { o.yer.ok++; o.yer[r.r === 'G' ? 'g' : r.r === 'B' ? 'b' : 'm']++; } });
    return o.ok ? o : null;
  }
  // form rozeti baloncugu: telefonda dokununca acilir/kapanir (masaustunde CSS :hover)
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('.kman-tip'); document.querySelectorAll('.kman-tip.tipac').forEach(x => { if (x !== t) x.classList.remove('tipac'); }); if (t) t.classList.toggle('tipac'); }, true);
  function analizSekmesi(m, mod) {
    const f1 = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ','), yz = (a, b) => b ? Math.round(a / b * 100) : 0;
    const A = anzIst(m.h, m), B = anzIst(m.a, m), s = stt(m), bitti = s.k === 'ft', RK = ['düşük', 'orta', 'yüksek'], rk = p => p >= .7 ? 0 : p >= .55 ? 1 : 2;
    const out = [];
    // 1) modelin onerileri: once sistemin kayitli secimleri (pops, %55-87), 3'ten azsa son maclarda sik gerceklesen orta/yuksek riskli secimlerle tamamlanir (sonuc/KG turunden ikinci secim yok; gol baraji ise ihtimal farki >=%12 ise eklenir)
    if (mod !== 'oneriYok') try {
      const mk = [m.c, m.h, m.a].join('|');
      // gecmis: ev sahibinin maclari (o, rakip) ve deplasmanin maclari (rakip, o) bu macin yonune cevrilir
      const gm = [...(A ? A.ms.map(([b, k]) => [b, k]) : []), ...(B ? B.ms.map(([b, k]) => [k, b]) : [])];
      const gec = k => { let h = 0, n = 0; gm.forEach(([x, y]) => { try { const v = hit(k, x, y); if (v === true || v === false) { n++; if (v) h++; } } catch (e) { } }); return n >= 3 ? { h, n } : null; };
      const aile = k => /^(1|X|2|1X|X2|12)$/.test(k) ? 'mac' : /^[ÜA]\d/.test(k) ? 'gol' : /^KG/.test(k) ? 'kg' : /^E[GA]/.test(k) ? 'ev' : /^D[GA]/.test(k) ? 'dep' : k;
      const sec = (typeof pops === 'function' ? pops(m) : []).slice(0, 3).map(x => ({ k: x.k, p: x.p }));
      if (!m.np && sec.length < 3 && typeof kprob === 'function') {
        const ADAY = ['1', 'X', '2', '1X', 'X2', '12', 'Ü1.5', 'Ü2.5', 'Ü3.5', 'A2.5', 'A3.5', 'KG Var', 'KG Yok', 'EG1', 'EG2', 'DG1', 'DG2'];
        const ad = ADAY.filter(k => !sec.some(x => x.k === k)).map(k => { const p = kprob(m, k), g = gec(k); return { k, p, g, s: p ? p + (g ? (g.h / g.n - .5) * .3 : 0) : 0 }; }).filter(o => o.p && o.p >= .45 && o.p <= .87 && o.g && o.g.h / o.g.n >= .5).sort((a, b) => b.s - a.s);
        for (const o of ad) { if (sec.length >= 3) break; if (sec.some(x => aile(x.k) === aile(o.k) && (/^(mac|kg)$/.test(aile(o.k)) || Math.abs(x.p - o.p) < .12))) continue; sec.push({ k: o.k, p: o.p, ek: 1 }); }
      }
      if (!m.np && sec.length) out.push(card('kman kman-on', `<h3 class="kmb">Modelin önerileri <small>${sec.length === 1 ? 'en olası seçim' : 'en olası ' + sec.length + ' seçim'}${bitti ? ' · maç öncesi' : ''}</small></h3>${sec.map(x => {
        const r = rk(x.p), od = typeof kodd === 'function' ? kodd(m, x.k) : null, ad = typeof labx === 'function' ? labx(x.k, m) : x.k, z = bitti && typeof pso === 'function' ? pso(m, x) : '', ic = typeof KPD !== 'undefined' && KPD.some(l => l.mk === mk && l.k === x.k), g = gec(x.k), oran = g ? g.h / g.n : null;
        const not = oran == null ? '' : r > 0 && oran >= .6 ? `<p class="kman-on-n ok">${r === 2 ? 'Yüksek' : 'Orta'} risk, ama son maçlarda sık gerçekleşti (${g.h}/${g.n}).</p>` : r === 0 && oran <= .4 ? `<p class="kman-on-n warn">Model düşük risk görüyor, ama son maçlarda az gerçekleşti (${g.h}/${g.n}).</p>` : '';
        return `<div class="kman-oi r${r}"><div class="kman-ot"><b>${E(ad)}</b><span><i></i>%${Math.round(x.p * 100)} · ${RK[r]} risk${od ? ' · tahmini oran ' + (+od).toFixed(2) : ''}${g ? ` · son maçlarda <em>${g.h}/${g.n}</em>` : ''}</span>${not}</div>${z === 'hit' ? '<em class="kman-st ok">✓ Tuttu</em>' : z === 'miss' ? '<em class="kman-st miss">✗ Tutmadı</em>' : bitti ? '' : `<button class="kman-ek${ic ? ' on' : ''}" data-ka="${E(mk)}" data-kk="${E(x.k)}">${ic ? '✓ Kuponda' : '+ Kupona ekle'}</button>`}</div>`; }).join('')}${(() => { const g = window.kmMstat && kmMstat(30), l = window.kmMstat && kmMstat(30, m.c); return g ? `<div class="kman-gv">Modelin son 30 gündeki tutma oranı <b>%${Math.round(g.p * 100)}</b> <small>(${g.h}/${g.n})</small>${l && l.n >= 10 ? ` · bu ligde <b>%${Math.round(l.p * 100)}</b> <small>(${l.h}/${l.n})</small>` : ""}</div>` : ""; })()}<p class="kman-n">Son maçlarda: iki takımın son maçlarında bu seçimin kaç kez gerçekleştiği.</p>`));
    } catch (e) { }
    if (mod === 'oneri') return out.join('');
    // 2) one cikanlar: her takimin kendi tarafinda madde listesi (en dikkat cekici 5 madde, sagda deger); renk: 0 iyi, 1 notr, 2 kotu
    let hh = null; try { hh = HH[[m.h, m.a].sort().join('|')]; } catch (e) { }
    const tb = tabloSatir(m.c) || [], ra = tb.find(x => x.n === m.h), rb = tb.find(x => x.n === m.a);
    const ocT = (t, ev, rr) => {
      if (!t) return []; const l = [], ok = t.ok, p = (x, c, w, v) => l.push({ x, c, w, v });
      if (t.g >= ok - 1 && t.g >= 3) p(`Son ${ok} maçın ${t.g} tanesini kazandı`, 0, 3, `${t.g}/${ok}`);
      else if (t.g === 0 && ok >= 3) p(`Son ${ok} maçta galibiyet yok`, 2, 3, `0/${ok}`);
      else p(`Son ${ok} maç: ${t.g} galibiyet, ${t.b} beraberlik, ${t.mg} mağlubiyet`, t.g > t.mg ? 0 : t.g < t.mg ? 2 : 1, 1, `${t.g}G ${t.b}B ${t.mg}M`);
      const at = t.at / ok, ye = t.ye / ok;
      p(`Maç başı ${f1(at)} gol atıyor`, at >= 2 ? 0 : at <= .8 ? 2 : 1, at >= 2 || at <= .8 ? 2.5 : 1, f1(at));
      p(`Maç başı ${f1(ye)} gol yiyor`, ye <= .8 ? 0 : ye >= 2 ? 2 : 1, ye >= 2 || ye <= .8 ? 2.5 : 1, f1(ye));
      if (ok >= 3 && t.cs >= Math.ceil(ok / 2)) p(`${t.cs} maçta gol yemedi`, 0, 2, `${t.cs}/${ok}`);
      if (ok >= 3 && t.fts >= Math.ceil(ok / 2)) p(`${t.fts} maçta gol atamadı`, 2, 2, `${t.fts}/${ok}`);
      const u = t.u25 / ok; p(u >= .5 ? `Maçlarının ${t.u25} tanesi 2,5 üst bitti` : `Maçlarının yalnız ${t.u25} tanesi 2,5 üst bitti`, 1, u >= .7 || u <= .3 ? 2 : .5, `${t.u25}/${ok}`);
      const k = t.kg / ok; p(`${t.kg} maçında karşılıklı gol oldu`, 1, k >= .7 || k <= .3 ? 1.8 : .4, `${t.kg}/${ok}`);
      if (t.yer.ok) { const y = t.yer; p(`${ev ? 'Evinde' : 'Deplasmanda'}: ${y.g} galibiyet, ${y.b} beraberlik, ${y.m} mağlubiyet`, y.g > y.m ? 0 : y.g < y.m ? 2 : 1, 1.2, `${y.g}G ${y.b}B ${y.m}M`); }
      if (rr) p(`Ligde ${rr.r}. sırada, ${rr.p} puan`, rr.r <= 4 ? 0 : rr.r >= tb.length - 2 ? 2 : 1, rr.r <= 3 || rr.r >= tb.length - 2 ? 2 : 1.1, `${rr.r}.`);
      if (Array.isArray(hh) && hh.length >= 3) { const w = hh.filter(r => (r.h === t.n && r.x > r.y) || (r.a === t.n && r.y > r.x)).length; if (w / hh.length >= .6 || w === 0) p(`Rakibine karşı son ${hh.length} maçta ${w} galibiyet`, w ? 0 : 2, 2, `${w}/${hh.length}`); }
      return l.sort((a, b) => b.w - a.w).slice(0, 5);
    };
    const LA = ocT(A, true, ra), LB = ocT(B, false, rb);
    if (LA.length || LB.length) {
      const kol = (n, L, c) => `<div class="kman-occ ${c}"><div class="kman-och">${bd(n)}<b>${E(n)}</b></div>${L.length ? `<ul>${L.map(o => `<li class="c${o.c}"><span>${o.x}</span><b>${o.v}</b></li>`).join('')}</ul>` : '<p class="kmbos">Veri yok.</p>'}</div>`;
      out.push(card('kman kman-oc', `<h3 class="kmb">Öne çıkanlar <small>son maçlara göre</small></h3><div class="kman-ocg">${kol(m.h, LA, 'kman-occ-ev')}${kol(m.a, LB, 'kman-occ-dep')}</div>`));
    }
    // 3) form karsilastirmasi
    if (A || B) {
      const hp = t => t ? `<span class="kmoz-f">${t.rs.map((r, i) => [r, t.det[i]]).reverse().map(([r, d]) => `<i class="kmhap ${sonuc(r)} kman-tip" tabindex="0" data-tip="${E(d || '')}">${r}</i>`).join('')}</span>` : '<span class="mut">veri yok</span>';
      const sat = (ad, va, vb, na, nb, az) => { const iy = na == null || nb == null || na === nb ? 0 : (az ? na < nb : na > nb) ? 1 : 2; return `<div class="kman-cr"><b class="${iy === 1 ? 'iy' : ''}">${va}</b><span>${ad}</span><b class="${iy === 2 ? 'iy' : ''}">${vb}</b></div>`; };
      const v = (t, f) => t ? f(t) : null, rows = [
        ra || rb ? sat('Lig sırası · puan', ra ? `${ra.r}. · ${ra.p}` : '–', rb ? `${rb.r}. · ${rb.p}` : '–', ra ? ra.r : null, rb ? rb.r : null, 1) : '',
        sat('G · B · M', v(A, t => `${t.g} · ${t.b} · ${t.mg}`) || '–', v(B, t => `${t.g} · ${t.b} · ${t.mg}`) || '–', v(A, t => (t.g * 3 + t.b) / t.ok), v(B, t => (t.g * 3 + t.b) / t.ok)),
        sat('Attığı gol / maç', v(A, t => f1(t.at / t.ok)) || '–', v(B, t => f1(t.at / t.ok)) || '–', v(A, t => t.at / t.ok), v(B, t => t.at / t.ok)),
        sat('Yediği gol / maç', v(A, t => f1(t.ye / t.ok)) || '–', v(B, t => f1(t.ye / t.ok)) || '–', v(A, t => t.ye / t.ok), v(B, t => t.ye / t.ok), 1),
        sat('Gol attığı maç', v(A, t => `${t.ok - t.fts}/${t.ok}`) || '–', v(B, t => `${t.ok - t.fts}/${t.ok}`) || '–', v(A, t => (t.ok - t.fts) / t.ok), v(B, t => (t.ok - t.fts) / t.ok)),
        sat('Gol yediği maç', v(A, t => `${t.ok - t.cs}/${t.ok}`) || '–', v(B, t => `${t.ok - t.cs}/${t.ok}`) || '–', v(A, t => (t.ok - t.cs) / t.ok), v(B, t => (t.ok - t.cs) / t.ok), 1),
        (A && A.yer.ok) || (B && B.yer.ok) ? sat('Evinde · deplasmanda', A && A.yer.ok ? `${A.yer.g}G ${A.yer.b}B ${A.yer.m}M` : '–', B && B.yer.ok ? `${B.yer.g}G ${B.yer.b}B ${B.yer.m}M` : '–', A && A.yer.ok ? (A.yer.g * 3 + A.yer.b) / A.yer.ok : null, B && B.yer.ok ? (B.yer.g * 3 + B.yer.b) / B.yer.ok : null) : '',
      ];
      out.push(card('kman kman-fk', `<h3 class="kmb">Form karşılaştırması <small>son maçlar</small></h3><div class="kman-th"><div>${bd(m.h)}<b>${E(m.h)}</b>${hp(A)}</div><div>${bd(m.a)}<b>${E(m.a)}</b>${hp(B)}</div></div>${rows.join('')}<p class="kman-n">Rozetler soldan sağa eskiden yeniye; en sağdaki son maç. Yeşil: o satırda daha iyi olan taraf.</p>`));
    }
    // 4) gol pazarlari
    if (A || B || !m.np) {
      const pz = [['Ü1.5', '1,5 üst (2+ gol)', 'u15'], ['Ü2.5', '2,5 üst (3+ gol)', 'u25'], ['Ü3.5', '3,5 üst (4+ gol)', 'u35'], ['KG Var', 'Karşılıklı gol', 'kg']];
      const hc = (v, ok) => v == null ? '<div class="kman-gc"><b>–</b></div>' : `<div class="kman-gc"><b>%${v}</b><i><u style="width:${v}%"></u></i>${ok ? `<small>${ok}</small>` : ''}</div>`;
      const rw = pz.map(([k, ad, f]) => { const mp = !m.np && typeof kprob === 'function' ? kprob(m, k) : null; return `<div class="kman-gr"><span>${ad}</span>${hc(A ? yz(A[f], A.ok) : null, A ? A[f] + '/' + A.ok : '')}${hc(B ? yz(B[f], B.ok) : null, B ? B[f] + '/' + B.ok : '')}${hc(mp ? Math.round(mp * 100) : null, '')}</div>`; }).join('');
      out.push(card('kman kman-gp', `<h3 class="kmb">Gol pazarları</h3><div class="kman-gr kman-gh"><span></span><div>${bd(m.h)}</div><div>${bd(m.a)}</div><div>Tahmin</div></div>${rw}<p class="kman-n">Takım sütunları: son maçlarında o pazarın kaç kez tuttuğu. Tahmin: bu maç için modelin verdiği ihtimal.</p>`));
    }
    // 5) aralarindaki maclar
    if (Array.isArray(hh) && hh.length) {
      const kz = n => hh.filter(r => (r.h === n && r.x > r.y) || (r.a === n && r.y > r.x)).length, br = hh.filter(r => r.x === r.y).length, gl = hh.reduce((a, r) => a + (+r.x || 0) + (+r.y || 0), 0), u = hh.filter(r => (+r.x) + (+r.y) > 2.5).length, kg = hh.filter(r => +r.x > 0 && +r.y > 0).length;
      out.push(card('kman kman-hh', `<h3 class="kmb">Aralarındaki maçlar <small>son ${hh.length}</small></h3><div class="kman-hs"><div><span class="kman-hsi">${bd(m.h)}</span><b>${kz(m.h)}</b><small>Galibiyet</small></div><div><span class="kman-hsi kman-hsb" title="Beraberlik"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></svg></span><b>${br}</b><small>Beraberlik</small></div><div><span class="kman-hsi">${bd(m.a)}</span><b>${kz(m.a)}</b><small>Galibiyet</small></div></div><div class="kman-hk"><span>Maç başı <b>${f1(gl / hh.length)}</b> gol</span><span>2,5 üst <b>${u}/${hh.length}</b></span><span>Karşılıklı gol <b>${kg}/${hh.length}</b></span></div>${hh.slice(0, 5).map(r => `<div class="kmh2s"><small>${E(r.d || '')}</small><span class="${r.x > r.y ? 'b' : ''}">${E(r.h)}${bd(r.h)}</span><i class="kmh2sk">${r.x} - ${r.y}</i><span class="${r.y > r.x ? 'b' : ''}">${bd(r.a)}${E(r.a)}</span></div>`).join('')}`));
    }
    if (!out.length) return card('kman', '<h3 class="kmb">Analiz</h3><p class="kmbos">Bu maç için analiz verisi yok.</p>');
    return out.join('') + '<p class="kman-uy">İstatistiksel analiz; bahis tavsiyesi değildir. Hiçbir bahis risksiz değildir.</p>';
  }
  function formKarti(m) {
    const sat = n => formListesi(n, m).map(r => `<div class="kmfs"><span data-tm="${E(r.ev)}" title="${E(r.ev)}">${bd(r.ev)}<em>${E(r.ev)}</em></span><i class="kmhap ${sonuc(r.r)}">${r.sk}</i><span data-tm="${E(r.dep)}" title="${E(r.dep)}">${bd(r.dep)}<em>${E(r.dep)}</em></span></div>`).join('') || '<p class="kmbos">Form verisi yok.</p>';
    return card('kmform', `<h3 class="kmb orta">Takım formu</h3><div class="kmiki"><div>${sat(m.h)}</div><div>${sat(m.a)}</div></div>`);
  }
  // Karsilasmalar (FotMob H2H): galibiyet/beraberlik ozeti + son maclar
  function h2hKarti(m) {
    let l = null, tmK = false; try { l = HH[[m.h, m.a].sort().join('|')]; } catch (e) { }
    if (!Array.isArray(l) || !l.length) { l = tmH2h(m); tmK = true; if (!l) return ''; }
    const kaz = n => l.filter(r => (r.h === n && r.x > r.y) || (r.a === n && r.y > r.x)).length, ber = l.filter(r => r.x === r.y).length;
    const sat = r => `<div class="kmh2s"><small>${E(r.d || '')}</small><span class="${r.x > r.y ? 'b' : ''}">${E(r.h)}${bd(r.h)}</span><i class="kmh2sk">${r.x} - ${r.y}</i><span class="${r.y > r.x ? 'b' : ''}">${bd(r.a)}${E(r.a)}</span></div>`;
    return card('kmh2h', `<h3 class="kmb orta">Karşılaşmalar <small>son ${l.length} maç</small></h3>
      <div class="kmh2o"><div>${bd(m.h, 1)}<b>${kaz(m.h)}</b><small>Galibiyet</small></div><div><span class="kmx">B</span><b>${ber}</b><small>Beraberlik</small></div><div>${bd(m.a, 1)}<b>${kaz(m.a)}</b><small>Galibiyet</small></div></div>
      <div class="kmh2bar"><i class="h" style="flex:${kaz(m.h)}"></i><i class="b" style="flex:${ber}"></i><i class="a" style="flex:${kaz(m.a)}"></i></div>
      ${l.slice(0, 6).map(sat).join('')}${tmK ? TMKAY : ''}`);
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
    return card('kmolay', `<h3 class="kmb">Maç özeti <small>${E(v.m || '')} · ${E(v.at || '')}</small></h3>${evh(v.ev || [], m)}<p class="kmkay">Kaynak: ${E(KY(v.src))}</p>`);
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
  // hakem: mac kaydindaki ad (details m[id].ref ya da latest.json rf) + Transfermarkt hakem istatistigi (KMTM.ref)
  let RFM = null;
  function hakemAdi(m) {
    try { const e = window.KMX && KMX.byKey && KMX.byKey[key(m)]; if (e && e.ref) return e.ref; } catch (x) { }
    if (RFM === null) { RFM = {}; fetch('data/fixtures/latest.json', { cache: 'default' }).then(r => r.ok ? r.json() : null).then(j => { (j && j.m || []).forEach(x => { if (x.rf) RFM[[x.c, x.h, x.a].join('|')] = x.rf; }); if (Object.keys(RFM).length) { try { render(); } catch (e) { } } }).catch(() => { }); }
    return RFM[key(m)] || '';
  }
  function hakemTm(m) {
    const ad = hakemAdi(m); if (!ad) return null;
    const r = window.KMTM ? tmV('r' + ad, () => KMTM.ref(ad)) : null;
    const f = v => v == null ? null : String((+v).toFixed(2)).replace('.', ',');
    return r ? { name: r.n || ad, g: r.g, yc: f(r.y), rc: f(r.r), src: 'Transfermarkt verileri (2023 sonrası, en az 15 maç)' } : { name: ad };
  }
  function hakemKarti(r) {
    if (!r || !r.name) return '';
    const k = (l, v) => v == null ? '' : `<div><small>${l}</small><b>${E(v)}</b><span>/ maç</span></div>`;
    return card('kmhakem', `<h3 class="kmb">Hakem</h3><div class="kmhk"><b>${E(r.name)}</b><small>${E(r.country || (r.g ? r.g + ' maç (2023 sonrası)' : ''))}</small></div>${(r.yc != null || r.fouls != null || r.rc != null) ? `<div class="kmhk2">${k('Sarı kart', r.yc)}${k('Kırmızı kart', r.rc)}${k('Faul', r.fouls)}</div>` : ''}${r.src ? `<p class="kmkay">Kaynak: ${E(KY(r.src))}</p>` : ''}`);
  }
  function bilgiKarti(m) {
    const x = xm(m), lu = LU[key(m)];
    if (x.insights && x.insights.length) return card('kmbilgi', `<h3 class="kmb orta">Bilgiler</h3>${x.insights.map(i => `<div class="kmbi">${i.tm ? bd(i.tm) : '<span></span>'}<p>${E(i.x)}</p></div>`).join('')}${x.src ? `<p class="kmkay">Kaynak: ${E(KY(x.src))}</p>` : ''}`);
    if (lu && lu.why) return card('kmbilgi', `<h3 class="kmb orta">Maç notu</h3><div class="kmbi"><span></span><p>${E(lu.why)}</p></div>${lu.src ? `<p class="kmkay">Kaynak: ${E(KY(lu.src))}</p>` : ''}`);
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
  // kulup maclari: maca ait istatistik yokken iki takimin sezon ozeti (TM tablo satiri + PS oyuncu istatistikleri)
  function kulupIstatKarti(m) {
    const f1 = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
    const kol = n => {
      const t = TM[n], s = PS[m.c + '|' + n]; if (!t || !s || !s.p) return null;
      const ok = t.w + t.d + t.o, top = (i, k) => s.p.filter(x => x[i] > 0).sort((a, b) => b[i] - a[i]).slice(0, k);
      const sr = (a, b) => `<div class="kmsr"><span>${a}</span><b>${b}</b></div>`;
      const ls = (ad, l, i) => l.length ? sr(ad, l.map(x => `${E(x[0])} ${x[i]}`).join(', ')) : '';
      const sari = s.p.reduce((u, x) => u + (x[5] || 0), 0);
      return `<div><p style="margin:0 0 6px"><b>${E(n)}</b></p>${sr('Lig sırası · puan', `${t.r}. · ${t.p}`)}${sr('G · B · M', `${t.w} · ${t.d} · ${t.o}`)}${sr('Attığı gol / maç', f1(t.f / ok))}${sr('Yediği gol / maç', f1(t.a / ok))}${ls('En golcüler', top(3, 3), 3)}${ls('En çok asist', top(4, 3), 4)}${sr('Sarı kart', sari)}</div>`;
    };
    const a = kol(m.h), b = kol(m.a); if (!a && !b) return '';
    return card('kmistat', `<h3 class="kmb">Sezon istatistikleri</h3><div class="kmiki">${a || ''}${b || ''}</div><p class="kmkay">Bu maça ait istatistikler maç başladıktan sonra kaynak verdikçe görünür. Kaynak: Transfermarkt, ge.globo.</p>`);
  }
  function istatistikSekmesi(m) {
    const st = stxOf(m), th = devreVeri(m);
    if (DV !== 'tum' && !(th && Array.isArray(th[DV]) && th[DV].length)) DV = 'tum';
    const t = DV !== 'tum' ? th[DV] : (st && Array.isArray(st.t) ? st.t : []);
    const px0 = pxVeri(m), px = DV === 'tum' ? px0 : (px0 ? { tam: false, h: [], a: [] } : null);
    const secici = th ? `<div class="kmdvs">${[['tum', 'Tümü'], ['1', '1.'], ['2', '2.']].filter(([k]) => k === 'tum' || (Array.isArray(th[k]) && th[k].length)).map(([k, l]) => `<button data-kmdv="${k}" class="${DV === k ? 'on' : ''}">${l}</button>`).join('')}</div>` : '';
    if (!t.length && !px && kulupIstatKarti(m)) return kulupIstatKarti(m);
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
    if (DAR.matches) {
      // telefon: her grup ayri kart; Sut grubunda isabetsiz/isabetli sut ic ice kale kutusu
      const off = T(/İsabetsiz şut/i), on = T(/İsabetli şut/i);
      const kale = off && on ? `<div class="kmkale">${istatSatir('İsabetsiz şut', off[0], off[1])}<div class="kmkale-i">${istatSatir('İsabetli şut', on[0], on[1])}</div></div>` : '';
      const sut = istatGrup('Şut', [S('Toplam şut', /^Şut$/i), kale, S('Engellenen şut', /Engellenen şut/i), S('Ceza sahasından şut', /Ceza sahası içi/i), S('Ceza sahası dışından şut', /Ceza sahası dışı/i)]);
      const tek = t.length ? `${secici}<div class="kmisw tek"><div class="kmisg kmisg1"><h4>Önemli istatistik</h4>${onem.join('')}</div>${G.xg}${sut}${G.pas}${G.sav}${G.muc}${G.cez}</div>
        <p class="kmkay">Kaynak: API-Football</p>` : '';
      return (tek ? `<section class="kmistat kmistm">${tek}</section>` : '') + oyuncuIstatTablosu(m, px0, DV !== 'tum');
    }
    const takim = t.length ? card('kmistat', `${secici}<div class="kmisw"><div class="kmisk"><div class="kmisg kmisg1"><h4>Önemli istatistik</h4>${onem.join('')}</div>${G.pas}${G.cez}</div><div class="kmisk">${G.xg}${G.sut}${G.sav}${G.muc}</div></div>
      <p class="kmkay">Kaynak: API-Football</p>`) : '';
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
    // telefon: FotMob gibi kategori basina ilk 3 oyuncu kartlari; tam tablo "Tümünü gör" altinda
    let ust3 = '';
    if (DAR.matches) {
      const KAT = [['Puan', p => p.r, v => (+v).toFixed(1).replace('.', ',')], ['Gol', p => p.g], ['Asist', p => p.a], ['Toplam şut', p => p.sh], ['İsabetli pas', p => p.pa], ['Kilit pas', p => p.kp], ['Başarılı çalım', p => p.drs], ['Top çalma', p => p.tk], ['Kaleci kurtarışı', p => p.sv]];
      ust3 = KAT.map(([ad, f, fmt]) => {
        const l = sat.filter(p => +f(p) > 0).sort((x, y) => +f(y) - +f(x)).slice(0, 3);
        if (!l.length) return '';
        return card('kmust3', `<h3 class="kmb">${E(ad)}</h3>${l.map((p, i) => { const tm = takim(p.s), [a, b] = renk(tm), v = f(p);
          return `<div class="kmu3"><em>${l.findIndex(q => +f(q) === +v) + 1}</em><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(p.n))}</i>${fotoImg(fotoUrl(tm, p))}<span class="kmu3t">${bd(tm)}</span></span><b class="kmpln" data-pn="${E(tm + '|' + p.n)}">${E(p.n)}</b><strong class="${i === 0 ? 'on ' + p.s : ''}" style="--tc:${p.s === 'h' ? EVR : DPR}">${E(fmt ? fmt(v) : v)}</strong></div>`; }).join('')}`);
      }).join('');
      if (ust3) ust3 = `<h2 class="kmu3b">Oyuncu istatistikleri</h2>${ust3}`;
    }
    const oyuncu = p => { const tm = takim(p.s), [a, b] = renk(tm); return `<td class="kmotn"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(p.n))}</i>${fotoImg(fotoUrl(tm, p))}</span><span class="kmotb">${bd(tm)}</span><b class="kmpln" data-pn="${E(tm + '|' + p.n)}">${E(p.n)}</b></td>`; };
    return ust3 + card('kmoist2' + (ust3 ? ' kmoistm' : ''), `<h3 class="kmb">${ust3 ? 'Tüm oyuncular' : 'Oyuncu istatistikleri'}</h3>
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
    if (DAR.matches) {
      // telefon: tek akis (FotMob mobil sirasi); sag sutun kartlari Bilgiler sekmesinin icinde
      let ana;
      if (dt === 'a') ana = kimKazanir(m) + analizSekmesi(m);
      else if (dt === 'p') ana = onemliIstatistik(m) + (etkinlikler(m) || olaylarKarti(m)) + macBilgiKarti(m) + stadKarti(x.venue) + hakemKarti(x.ref || hakemTm(m)) + tabloLig(m.c, [m.h, m.a]) + sonrakiMac(m) + formKarti(m) + kimKazanir(m) + h2hKarti(m) + analizSekmesi(m, 'oneri') + (typeof kpBox === 'function' ? kpBox(m) : '') + bilgiKarti(m) + p.nwb;
      else if (dt === 'z' && tabloSatir(m.c).length) ana = tabloLig(m.c, [m.h, m.a]);
      else if (dt === 'k') ana = kadroKarti(m);
      else if (dt === 'i') ana = istatistikSekmesi(m);
      else if (dt === 'm') ana = (h2hKarti(m) || card('kmh2h', '<h3 class="kmb">Karşılaşmalar</h3><p class="kmbos">Bu iki takımın kayıtlı karşılaşması yok.</p>')) + sonMaclarKarti(m);
      else ana = `<div class="kmeski">${p.kalan}</div>`;
      return sahaFoto(macBaslikMobil(m) + ana);
    }
    const yan =`<div class="mside">${kimKazanir(m)}${dt === 'a' || dt === 'p' ? analizSekmesi(m, 'oneri') : ''}${stadKarti(x.venue)}${hakemKarti(x.ref || hakemTm(m))}${bilgiKarti(m)}${takimNotlari(new Set([m.h, m.a]), 'Haberler ve takım notları') || p.nwb}</div>`;
    let ana;
    if (dt === 'a') ana = analizSekmesi(m, 'oneriYok');
    else if (dt === 'p') ana = onemliIstatistik(m) + (etkinlikler(m) || olaylarKarti(m)) + kadroKarti(m) + formKarti(m) + sonrakiMac(m) + h2hKarti(m) + (typeof kpBox === 'function' ? kpBox(m) : '');
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
      if (TM[n] && TM[n].l === c && !son5(n).length && TM[n].fm) return TM[n].fm.split('').map(x => ({ r: x, t: 'Son 5 maç (dış kaynak: ge.globo)' }));
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
    const tv = DAR.matches ? `<div class="kmtv"><button data-kmtv="k" class="on">Kısa</button><button data-kmtv="t">Tam</button><button data-kmtv="f">Form</button></div>` : '';
    return card('kmtablo', `${tv}<h3 class="kmb">${DAR.matches ? ligLg(c, 'orta') : ''}${E(ligAd(c))}</h3><table><thead><tr><th>#</th><th class="tk">Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>+/-</th><th>AV</th><th>PUAN</th><th>Form</th><th>Sonraki</th></tr></thead><tbody>${rows.map(satir).join('')}</tbody></table>`);
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
    return card('kmoyuncu', `<div class="kmuc">${top(3, 'En çok gol atan')}${top(4, 'En çok asist yapan')}${top(5, 'En çok sarı kart')}</div>${ps.src ? `<p class="kmkay">Kaynak: ${E(KY(ps.src))}</p>` : ''}`);
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
    return card('kmsezkart', `<h3 class="kmb">Sezon istatistikleri</h3><div class="kmsr"><span>Lig sırası</span><b>${t.r}.</b></div><div class="kmsr"><span>Puan</span><b>${t.p}</b></div><div class="kmsr"><span>G / B / M</span><b>${t.w} / ${t.d} / ${t.o}</b></div><div class="kmsr"><span>Atılan / Yenilen</span><b>${t.f} / ${t.a}</b></div>${yer(1)}${yer(0)}`);
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
    return card('kmi1', `<div class="kmb2"><h3 class="kmb">Sezon istatistikleri</h3><small>Son ilk 11</small></div><div class="kmi1s-saha"><i class="kmi1-ceza"></i>${s.satirlar.map(r => `<div class="kmi1r">${r.map(kisi).join('')}</div>`).join('')}</div><p class="kmkay">Kaynak: ${E(KY(s.kay))}</p>`);
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
      <p class="kmkay">Kaynak: ${E(KY((PS[L[0].ps.tk] || {}).src))}</p>`);
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
      <p class="kmkay">Kaynak: ${E(KY((PS[L[0].ps.tk] || {}).src))}</p>`;
  }
  // ---- takim Maclar sekmesi (FotMob): 10'luk sayfali tum maclar + sonraki mac karsilastirmasi + takim tahmin karnesi ----
  let TMS = { n: '', i: -1 };
  function takimTumMaclari(n) {
    const l = R.filter(m => m.h === n || m.a === n).map(m => ({ m, t: m.t }));
    const var_ = new Set(l.map(x => x.m.h + '|' + x.m.a + '|' + new Date(x.t).toISOString().slice(0, 10)));
    BITEN.forEach(x => { if (x.h !== n && x.a !== n) return; const t = Date.parse(x.t); if (!t || var_.has(x.h + '|' + x.a + '|' + new Date(t).toISOString().slice(0, 10))) return; l.push({ b: x, t }); });
    l.sort((a, b) => a.t - b.t);
    // tarihi bilinmeyen eski lig maclari (SLG, hafta numarali): R'de ayni rakip/yer/skor yoksa listenin basina
    const T = TM[n], ilk = l.length ? l[0].t : Date.now();
    const esk = ((typeof SLG !== 'undefined' && SLG[n]) || []).filter(r => !l.some(x => x.m && x.m.c === (T && T.l) && (r.H ? x.m.a === r.o : x.m.h === r.o) && stt(x.m).k === 'ft'))
      .map((r, i) => ({ s: r, t: ilk - (1000 - i) * 60e3 }));
    return esk.concat(l);
  }
  function takimMaclarKarti(n) {
    const l = takimTumMaclari(n), SAY = 10;
    if (!l.length) return card('kmtm', `<h3 class="kmb">Maçlar</h3><p class="kmbos">Bu takım için maç verisi yok.</p>`);
    if (TMS.n !== n || TMS.i < 0) { let g = l.findIndex(x => x.m ? stt(x.m).k !== 'ft' : false); if (g < 0) g = l.length; TMS = { n, i: Math.max(0, Math.min(g - 3, l.length - SAY)) }; }
    const sayfa = l.slice(TMS.i, TMS.i + SAY);
    const sat = x => {
      const m = x.m, b = x.b, r0 = x.s, T0 = TM[n] || {};
      const c = m ? m.c : b ? b.c : T0.l, h = m ? m.h : b ? b.h : (r0.H ? n : r0.o), a = m ? m.a : b ? b.a : (r0.H ? r0.o : n);
      let sc = null, k = 'wait'; if (m) { const s = stt(m); sc = s.sc; k = s.k; } else if (b) { sc = [b.x, b.y]; k = 'ft'; } else { sc = r0.H ? [r0.f, r0.c] : [r0.c, r0.f]; k = 'ft'; }
      let rz = ''; if (sc && k === 'ft') { const gf = +(h === n ? sc[0] : sc[1]), ga = +(h === n ? sc[1] : sc[0]); rz = gf > ga ? 'g' : gf < ga ? 'm' : 'b'; }
      const orta = sc ? `<i class="kmhap ${rz || 'canli'}">${E(sc[0])} - ${E(sc[1])}</i>` : `<b class="kmtm-s">${hm(x.t)}</b>`;
      return `<div class="kmtm-r"${m ? ` data-kmm="${E(key(m))}"` : ''}><div class="kmtm-u"><small>${r0 ? (r0.w ? E(r0.w) + '. hafta' : 'Lig maçı') : E(kisaTarih(x.t))}</small><small class="kmtm-l">${E(ligAd(c))}${ligLg(c, 'kucuk')}</small></div>
        <div class="kmtm-m"><span data-tm="${E(h)}">${E(h)}${bd(h)}</span>${orta}<span data-tm="${E(a)}">${bd(a)}${E(a)}</span></div></div>`;
    };
    const ok = (yon, akt) => `<button class="kmok" data-kmtms="${yon}" ${akt ? '' : 'disabled'} aria-label="${yon < 0 ? 'Önceki maçlar' : 'Sonraki maçlar'}">${yon < 0 ? '‹' : '›'}</button>`;
    return card('kmtm', `<div class="kmmh">${ok(-1, TMS.i > 0)}<div><h3>Maçlar</h3><small>${TMS.i + 1}–${Math.min(TMS.i + SAY, l.length)} / ${l.length}</small></div>${ok(1, TMS.i + SAY < l.length)}</div>${sayfa.map(sat).join('')}`);
  }
  function sonrakiKarsilastir(n) {
    const x = siradaki(n); if (!x) return sonrakiKutusu(n);
    const ist = t => { const T = TM[t]; if (!T) return null; const o = T.w + T.d + T.o; return o ? { r: T.r, g: T.f / o, y: T.a / o } : null; };
    const h = ist(x.h), a = ist(x.a);
    const f2 = v => v.toFixed(2).replace('.', ',');
    const sat = (ad, vh, va, az, fmt) => vh == null || va == null ? '' : istatSatir(ad, fmt(vh), fmt(va), { na: vh, nb: va, az });
    const tablo = h && a ? sat('Tablodaki sıra', h.r, a.r, 1, v => v) + sat('Maç başına gol', h.g, a.g, 0, f2) + sat('Maç başına yenilen gol', h.y, a.y, 1, f2) : '';
    return card('kmsonraki kmsk2', `<div class="kmb2"><h3 class="kmb">Sonraki maç</h3><small>${ligLg(x.c, 'kucuk')} ${E(ligAd(x.c))}</small></div>
      <div class="kmsm" data-kmm="${E(key(x))}"><div>${bd(x.h, 1)}<b>${E(x.h)}</b></div><div class="kmsm-o"><b>${hm(x.t)}</b><small>${E(gunEtiket(x.t) || kisaTarih(x.t))}</small></div><div>${bd(x.a, 1)}<b>${E(x.a)}</b></div></div>
      ${tablo ? `<div class="kmsk2-t">${tablo}</div>` : ''}`);
  }
  // oyuncu bilgisi: once kimlikle foot.json, yoksa ad ile lig dosyasi data/players/foot-ad/<LIG>.json ("Takim|Ad"; tembel yuklenir)
  const FAD = {}, FADyuk = {};
  function fadYukle(lig) {
    if (!lig || FAD[lig] || FADyuk[lig]) return; FADyuk[lig] = 1;
    fetch('data/players/foot-ad/' + encodeURIComponent(lig) + '.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { FAD[lig] = j || {}; if (j) { try { render(); } catch (e) { } } }).catch(() => { FAD[lig] = {}; });
  }
  const kfOf = e => {
    if (!e) return {};
    const k = e.id && window.KMFOOT && window.KMFOOT[e.id]; if (k) return k;
    const kay = [e.ps].concat(e.diger || []).filter(Boolean);
    for (const x of kay) { const lig = String(x.tk || '').split('|')[0]; if (!lig) continue; if (!FAD[lig]) { fadYukle(lig); continue; } const v = FAD[lig][x.team + '|' + x.p[0]]; if (v) return v; }
    return {};
  };
  const yasHesap = b => { const d = b ? new Date(b + 'T12:00:00Z') : null; return d && !isNaN(d) ? Math.floor((Date.now() - d) / 315576e5) : null; };
  const degerYaz = v => { v = +v; if (!(v > 0)) return ''; if (v >= 1e6) { const m = v / 1e6; return '€' + (m >= 10 ? Math.round(m) : (Math.round(m * 10) / 10).toString().replace('.', ',')) + ' Mn'; } return '€' + Math.round(v / 1e3) + ' B'; };
  // ================= TRANSFERMARKT EK VERILERI (window.KMTM, data/tm; Kaggle CC0, 2025/26 sezonu sonuna kadar) =================
  // KMTM Promise doner; burada sonuc onbellege alinir ve gelince sayfa yeniden cizilir (ilk cizimde kart yoksa bos gecilir).
  const TMC = {};
  function tmV(anahtar, yap) {
    if (anahtar in TMC) return TMC[anahtar];
    TMC[anahtar] = undefined;
    try { Promise.resolve(yap()).then(v => { TMC[anahtar] = v || null; try { render(); } catch (e) { } }, () => { TMC[anahtar] = null; }); } catch (e) { TMC[anahtar] = null; }
    return undefined;
  }
  const TMKAY = '<p class="kmkay">Kaynak: Transfermarkt</p>';
  const binEur = v => degerYaz((+v || 0) * 1000);
  const ayYil = s => { const [y, m] = String(s || '').split('-'); return y ? new Date(Date.UTC(+y, (+m || 1) - 1, 1)).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''; };
  const tarihTr = s => { const d = s ? new Date(s + 'T12:00:00Z') : null; return d && !isNaN(d) ? d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
  const SPTR = { 'Goalkeeper': 'Kaleci', 'Centre-Back': 'Stoper', 'Left-Back': 'Sol bek', 'Right-Back': 'Sağ bek', 'Defensive Midfield': 'Ön libero', 'Central Midfield': 'Merkez orta saha', 'Attacking Midfield': 'Ofansif orta saha', 'Left Midfield': 'Sol orta saha', 'Right Midfield': 'Sağ orta saha', 'Left Winger': 'Sol kanat', 'Right Winger': 'Sağ kanat', 'Centre-Forward': 'Santrfor', 'Second Striker': 'İkinci forvet' };
  function tmOyuncu(e) { const t = +kfOf(e).t; return t && window.KMTM ? tmV('p' + t, () => KMTM.player(t)) : null; }
  // ---- Transfermarkt kulup adi -> uygulama takim adi (logo, renk, baglanti icin) ----
  const TMSTOP = new Set(['fc', 'cf', 'rcd', 'ac', 'sc', 'sk', 'fk', 'as', 'ss', 'us', 'calcio', 'club', 'de', 'cfc', 'afc', 'ssc', 'sv', 'vfl', 'vfb', 'tsg', 'rc', 'cd', 'ud', 'sd', 'ca', 'ogc', 'losc', 'aj', 'bv', 'psv', 'kf', 'ks', 'nk', 'gnk', 'hnk', 'bk', 'if', 'aik', 'sl', 'jk', 'pae', 'gfc', 'krc', 'kv', 'kaa', 'rsc', 'royal', 'spor', 'kulubu', 'c', 'd', 'f', '1', '04', '05', '07', '09', '1846', '1899', '1900', '1907', '1909', '1910', '1913']);
  const tmTok = s => adN(s).filter(w => !TMSTOP.has(w) && !/^\d+$/.test(w));
  const TMADC = {};
  const tmLogoMap = () => tmV('clublogo', () => fetch('data/tm/clublogo.json').then(r => r.ok ? r.json() : null));
  const tmKulupAd = () => tmV('clubnames', () => fetch('data/tm/club-names.json').then(r => r.ok ? r.json() : null));
  function kulupLogo(ad, app) {
    if (app) return bd(app);
    const m = tmLogoMap(), id = m && m[ad];
    return id ? `<span class="bd kmkr-yb">${E(basH(ad || '?'))}<img class="tlg" src="https://media.api-sports.io/football/teams/${+id}.png" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onload="(this.parentNode||this).classList.add('hl')" onerror="this.remove()"></span>` : `<span class="bd kmkr-yb">${E(basH(ad || '?'))}</span>`;
  }
  // Transfermarkt'in farkli yazdigi kulup adlari -> uygulamadaki ad (otomatik eslesmenin bulamadiklari)
  const TMALIAS = { 'Nottm Forest': 'N. Forest', 'Spurs': 'Tottenham', 'Sparta Prague': 'Sparta Praha', 'AC Sparta Prague': 'Sparta Praha', 'Fortuna Sittardia Combinatie': 'Fortuna Sittard', 'Oud-Heverlee Leuven': 'OH Leuven', 'H. Beer Sheva': 'Hapoel Beer-Sheva', 'Hapoel Beer Sheva': 'Hapoel Beer-Sheva', 'Union Saint-Gilloise': 'Union SG', 'Royale Union Saint-Gilloise': 'Union SG', 'Sint-Truiden': 'STVV', 'Sint-Truidense VV': 'STVV' };
  function tmAdApp(ad) {
    if (!ad) return null; if (ad in TMADC) return TMADC[ad];
    // resmi tam ad -> uygulamadaki kisa ad (Manchester City -> Man City): ayni kulup iki ayri takim gibi gorunmesin
    if (TMALIAS[ad]) return (TMADC[ad] = TMALIAS[ad]);
    if (TAM_KULUP[ad]) return (TMADC[ad] = ad);
    { const ters = Object.keys(TAM_KULUP).find(k => adN(TAM_KULUP[k]).join(' ') === adN(ad).join(' ')); if (ters) return (TMADC[ad] = ters); }
    { const m = tmLogoMap(), ids = tmV('idsjson', () => fetch('data/teams/ids.json').then(r => r.ok ? r.json() : null));
      if (m === undefined || ids === undefined) return null;
      const id = m && m[ad]; if (id && ids && ids.t) { const n = Object.keys(ids.t).find(k => +ids.t[k] === +id); if (n) return (TMADC[ad] = n); } }
    const tk = tmTok(ad); let bul = null;
    if (tk.length) {
      const adaylar = new Set(Object.keys(TM)); R.forEach(m => { adaylar.add(m.h); adaylar.add(m.a); });
      const ids = tmV('idsjson', () => fetch('data/teams/ids.json').then(r => r.ok ? r.json() : null)); if (ids && ids.t) Object.keys(ids.t).forEach(n => adaylar.add(n)); else if (ids === undefined) return null;
      const L = [...adaylar].filter(n => { const u = tmTok(n); return u.length && (u.every(w => tk.includes(w)) || tk.every(w => u.includes(w))); });
      // kisaltma: kelime kelime on ek (Man City ~ Manchester City, Nott'm ~ Nottingham)
      if (!L.length) [...adaylar].forEach(n => { const u = tmTok(n); if (u.length && u.length === tk.length && u.every((w, i) => w.length >= 3 && (tk[i].startsWith(w) || w.startsWith(tk[i])))) L.push(n); });
      bul = L.sort((a, b) => (TM[b] ? 1 : 0) - (TM[a] ? 1 : 0) || a.length - b.length)[0] || null;
    }
    return (TMADC[ad] = bul);
  }
  const PALET = ['#4668D6', '#D63630', '#2f9e63', '#e3a21c', '#8e5bd6', '#1fa3b8', '#d6589a', '#7a8b99'];
  function kulupRenk(app, i) { try { const c = app && TC[app]; if (c) { const a = c[0], b = c[1]; const lum = h => { const x = String(h).replace('#', ''); const f = x.length === 3 ? x.split('').map(y => y + y).join('') : x; const [r, g, bb] = [0, 2, 4].map(j => parseInt(f.substr(j, 2), 16) || 0); return r * 0.3 + g * 0.59 + bb * 0.11; }; const l = lum(a); return (l < 45 || l > 225) && b && lum(b) >= 45 && lum(b) <= 225 ? b : (l > 225 ? '#9aa5b1' : a); } } catch (e) { } return PALET[i % PALET.length]; }
  // kulup zaman cizelgesi: transferlerden (eski -> yeni) donemler; kiralik: bedelsiz ve 18 ay icinde ayni kulube donus
  function kulupDonemleri(p, e) {
    const tr = (p.tr || []).slice().sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const D = [];
    if (tr.length) D.push({ ad: tr[0][1], bas: null, bit: tr[0][0] });
    tr.forEach((r, i) => {
      const donus = +r[3] === 0 && tr.slice(0, i).some(x => x[1] === r[2] && x[2] === r[1] && +x[3] === 0 && (Date.parse(r[0]) - Date.parse(x[0])) < 548 * 864e5);
      const geri = tr.slice(i + 1).find(x => x[1] === r[2] && x[2] === r[1]);
      const kiralik = +r[3] === 0 && geri && (Date.parse(geri[0]) - Date.parse(r[0])) < 548 * 864e5;
      const gencten = GENC.test(String(r[1]).replace(/\./g, ' '));
      D.push({ ad: r[2], bas: r[0], bit: tr[i + 1] ? tr[i + 1][0] : null, donus, not: donus ? 'Kiralıktan dönüş' : gencten ? '' : kiralik ? 'Kiralandı' : (+r[3] === 0 ? 'Bedelsiz Transfer' : '') });
    });
    // profesyonel kariyer: genclik/yedek takimlari cikar, art arda ayni kulup donemlerini birlestir
    // kulupsuz donem (Without Club vb.) gosterilmez
    for (let i = D.length - 1; i >= 0; i--) if (GENC.test(String(D[i].ad).replace(/\./g, ' ')) || KULUPSUZ.test(String(D[i].ad))) { if (KULUPSUZ.test(String(D[i].ad)) && D[i - 1] && !D[i - 1].bit) D[i - 1].bit = D[i].bit; D.splice(i, 1); }
    D.forEach(d => { d.app = tmAdApp(d.ad); });
    for (let i = D.length - 1; i > 0; i--) { const a = D[i - 1], b = D[i]; if ((a.app || a.ad) === (b.app || b.ad) && !b.not) { a.bit = b.bit; D.splice(i, 1); } }
    // guncel kulup (uygulama verisi): son donem degilse eklenir
    const son = D[D.length - 1];
    if (e && e.team && TM[e.team] && (!son || son.app !== e.team)) { if (son && !son.bit) son.bit = (new Date().getFullYear()) + '-06-30'; D.push({ ad: e.team, app: e.team, bas: son && son.bit && Date.parse(son.bit) > Date.parse(son.bas || 0) ? son.bit : null, bit: null, guncel: 1 }); }
    return D;
  }
  const GENC = /\b(u\s?\d{2}|yth|youth|jugend|primavera|juvenil|juv|reserves?|juniors?|academy|ii|b)\b/i;
  const KULUPSUZ = /without club|vereinslos|sin equipo|sans club|career break|retired|unknown|kul[uü]ps[uü]z/i;
  const kulupAn = (D, t) => { let k = D[0]; for (const d of D) { if (d.bas && Date.parse(d.bas) <= t) k = d; } return k; };
  // deger grafigi: kulup donemine gore renkli alan + cizgi, transfer noktalarinda kulup logosu, uzerine gelince deger
  function degerGrafik(p, e) {
    const v = p.v || [];
    const l = v.filter(x => x && x[0] && +x[1] > 0); if (l.length < 2) return '';
    const D = kulupDonemleri(p, e);
    const W = 1000, H = 220, P = 6, t = l.map(x => Date.UTC(+x[0].slice(0, 4), +x[0].slice(5, 7) - 1, 15)), mx = Math.max(...l.map(x => +x[1])) * 1.08;
    let T1 = t[t.length - 1];
    const X = tt => P + (tt - t[0]) / ((T1 - t[0]) || 1) * (W - 2 * P), Y = val => H - P - (val / mx) * (H - 2 * P);
    const nk = l.map((x, i) => { const d = kulupAn(D, t[i]); return { x: X(t[i]), y: Y(+x[1]), v: +x[1], t: t[i], d }; });
    // transfer verisi eskiyse (oyuncu sonra guncel kulube gitti): guncel kulup donemi transfer tarihinden bugune son bilinen degerle, kendi renginde
    { const gk = D[D.length - 1], sn = nk[nk.length - 1]; if (gk && sn && e && e.team && (gk.guncel || gk.app === e.team) && sn.d !== gk) { const t1 = Math.max(Date.now(), sn.t + 60 * 864e5), tb = gk.bas && Date.parse(gk.bas) > sn.t && Date.parse(gk.bas) < t1 ? Date.parse(gk.bas) : sn.t + (t1 - sn.t) / 2; T1 = t1; nk.forEach(n => { n.x = X(n.t); }); nk.push({ x: X(tb), y: sn.y, v: sn.v, t: tb, d: gk, ek: 1 }, { x: X(t1), y: sn.y, v: sn.v, t: t1, d: gk, ek: 1 }); } }
    // donemlere bol
    const parca = []; const kkk = d => d && (d.app || ((tmLogoMap() || {})[d.ad] ? 'L' + tmLogoMap()[d.ad] : d.ad)); nk.forEach(n => { const s = parca[parca.length - 1]; if (!s || kkk(s.d) !== kkk(n.d)) { if (s) s.n.push(n); parca.push({ d: n.d, n: [n] }); } else s.n.push(n); });
    const renkler = new Map(); let ri = 0; parca.forEach(s => { const k = s.d && (s.d.app || s.d.ad); if (!renkler.has(k)) renkler.set(k, kulupRenk(s.d && s.d.app, ri++)); s.r = renkler.get(k); });
    const yol = s => s.n.map((n, i) => `${i ? 'L' : 'M'}${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(' ');
    const svg = parca.map(s => `<path d="${yol(s)} L${s.n[s.n.length - 1].x.toFixed(1)},${H - P} L${s.n[0].x.toFixed(1)},${H - P} Z" fill="${s.r}" fill-opacity=".22"/><path d="${yol(s)}" fill="none" stroke="${s.r}" stroke-width="2.4" vector-effect="non-scaling-stroke"/>`).join('');
    const y0 = new Date(t[0]).getUTCFullYear() + 1, y1 = new Date(T1).getUTCFullYear(), adim = Math.max(1, Math.ceil((y1 - y0 + 1) / 11));
    const xe = []; for (let y = y0; y <= y1; y += adim) xe.push(`<span style="left:${(X(Date.UTC(y, 0)) / W * 100).toFixed(2)}%">${y}</span>`);
    const ye = [0, 0.25, 0.5, 0.75, 1].map(f => `<span style="top:${(Y(mx / 1.08 * f) / H * 100).toFixed(2)}%">${E(f ? binEur(mx / 1.08 * f) : '€0')}</span>`);
    const logo = parca.map(s => { const own = s.n.filter(x => kkk(x.d) === kkk(s.d)), n = (own.length ? own : s.n).reduce((b, x) => x.y < b.y ? x : b, (own.length ? own : s.n)[0]); const a = s.d && (s.d.app || s.d.ad); return `<span class="kmdeg-lg" style="left:${(n.x / W * 100).toFixed(2)}%;top:${(n.y / H * 100).toFixed(2)}%">${kulupLogo(s.d && s.d.ad, s.d && s.d.app)}</span>`; }).join('');
    // ek noktalar (guncel kulup donemi) uzerine gelinince de secilir: tarih transfer ayi, deger son bilinen deger
    const tbAy = (nk.find(n => n.ek) || {}).t;
    const veri = nk.map(n => [+(n.x / W * 100).toFixed(2), +(n.y / H * 100).toFixed(2), n.v, new Date(n.ek ? tbAy : n.t).toISOString().slice(0, 7), (n.d && (n.d.app || n.d.ad)) || '', renkler.get(n.d && (n.d.app || n.d.ad)) || '#888']);
    const enY = l.reduce((b, x) => +x[1] > +b[1] ? x : b, l[0]), sonV = l[l.length - 1];
    return card('kmdeg', `<div class="kmdeg-u"><h3 class="kmb">Transfer değeri: ${E(binEur(sonV[1]))}</h3><small>En yüksek: ${E(binEur(enY[1]))} (${E(ayYil(enY[0]))})</small></div>
      <div class="kmdeg-w"><div class="kmdeg-y">${ye.join('')}</div><div class="kmdeg-a" data-kmdeg='${E(JSON.stringify(veri))}'><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${[0.25, 0.5, 0.75, 1].map(f => `<line x1="0" x2="${W}" y1="${Y(mx / 1.08 * f).toFixed(1)}" y2="${Y(mx / 1.08 * f).toFixed(1)}" class="kz"/>`).join('')}${svg}</svg>${logo}<i class="kmdeg-cz" hidden></i><div class="kmdeg-ip" hidden></div></div></div>
      <div class="kmdeg-x">${xe.join('')}</div>${TMKAY}`);
  }
  // Kariyer karti (FotMob): Kulup sekmesi (donemler, mac/gol) ve Sezon sekmesi (sezon sezon kulup, mac, gol, asist, puan)
  let KRS = 'k';
  function kariyerKarti(p, e) {
    const D = kulupDonemleri(p, e), st = (p.st || []).slice();
    const sezonKulup = y => kulupAn(D, Date.UTC(+y, 9, 1));
    const ps = e.ps && e.ps.p, sp = sezonPuani(e);
    const simdiY = (() => { const n = new Date(); return n.getUTCMonth() >= 6 ? n.getUTCFullYear() : n.getUTCFullYear() - 1; })();
    const cn = tmKulupAd() || {};
    const anahtar = d => d ? (d.app || adN(d.ad).join(' ')) : '';
    const donemBul = (ad, y) => { const app = tmAdApp(ad), k = app || adN(ad).join(' '); const t0 = Date.UTC(+y, 6, 1), t1 = Date.UTC(+y + 1, 5, 30);
      const L = D.filter(d => anahtar(d) === k); return L.find(d => (!d.bas || Date.parse(d.bas) <= t1) && (!d.bit || Date.parse(d.bit) >= t0)) || L[L.length - 1] || { ad, app }; };
    const sezonlar = st.filter(r => !(r[7] != null && cn[r[7]] && GENC.test(String(cn[r[7]]).replace(/\./g, ' ')))).map(r => ({ y: +r[0], d: r[7] != null && cn[r[7]] ? donemBul(cn[r[7]], r[0]) : sezonKulup(r[0]), m: r[1], g: r[2], a: r[3] }));
    if (ps && !sezonlar.some(s => s.y === simdiY)) sezonlar.push({ y: simdiY, d: D.slice().reverse().find(d => d.app === e.team) || { ad: e.team, app: e.team }, m: +ps[1] || 0, g: +ps[3] || 0, a: +ps[4] || 0, pu: sp && sp.o, simdi: 1 });
    // ayni sezon + ayni kulup satirlari (kaynakta bolunmus) toplanir
    for (let i = sezonlar.length - 1; i >= 0; i--) { const x = sezonlar[i], j = sezonlar.findIndex(y => y !== x && y.y === x.y && y.d === x.d); if (j >= 0 && j < i) { const y = sezonlar[j]; y.m = (+y.m || 0) + (+x.m || 0); y.g = (+y.g || 0) + (+x.g || 0); y.a = (+y.a || 0) + (+x.a || 0); sezonlar.splice(i, 1); } }
    sezonlar.sort((a, b) => b.y - a.y);
    // donem istatistigi: sezonun kulubu bu donemse toplanir
    D.forEach(d => { d.m = 0; d.g = 0; d.var = false; });
    sezonlar.forEach(s => { const d = s.d; if (d && D.includes(d)) { d.m += +s.m || 0; d.g += +s.g || 0; d.var = true; } else { const dd = D.find(x => x.app === (s.d && s.d.app)); if (dd) { dd.m += +s.m || 0; dd.g += +s.g || 0; dd.var = true; } } });
    const ar = s => s ? new Date(s + 'T12:00:00Z').toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }) : '';
    const lg = d => kulupLogo(d && d.ad, d && d.app);
    const adH = d => d && d.app ? `<b data-tm="${E(d.app)}">${E(kulupAd(d.app))}</b>` : `<b>${E((d && d.ad) || '?')}</b>`;
    const kul = D.slice().reverse().filter(d => (d.bas || d.bit || d.guncel) && !(d.donus && !d.var && d.bit && (Date.parse(d.bit) - Date.parse(d.bas)) < 120 * 864e5)).map(d => `<div class="kmkr-s"><span class="kmkr-l">${lg(d)}</span><div>${adH(d)}${d.not ? ` <em>(${E(d.not)})</em>` : ''}<small>${d.bas ? ar(d.bas) : (d.guncel ? `${simdiY}/${String(simdiY + 1).slice(2)}` : '')}${d.bas || d.guncel ? ' - ' : ''}${d.bit ? ar(d.bit) : 'şimdi'}</small></div><em class="kmkr-n">${d.var ? d.m : '–'}</em><em class="kmkr-n">${d.var ? d.g : '–'}</em></div>`).join('');
    const sez = sezonlar.map(s => `<div class="kmkr-s"><span class="kmkr-l">${lg(s.d)}</span><div>${adH(s.d)}<small>${s.y}/${s.y + 1}</small></div><em class="kmkr-n">${s.m ?? '–'}</em><em class="kmkr-n">${s.g ?? '–'}</em><em class="kmkr-n">${s.a ?? '–'}</em></div>`).join('');
    const ust = KRS === 'k' ? `<div class="kmkr-b"><span>Profesyonel kariyer</span><i title="Maç">${icon.mac}</i><i title="Gol">${icon.gol}</i></div>` : `<div class="kmkr-b s"><span>Profesyonel kariyer</span><i title="Maç">${icon.mac}</i><i title="Gol">${icon.gol}</i><i title="Asist">${icon.krampon}</i></div>`;
    return card('kmkr', `<h3 class="kmb">Kariyer</h3><div class="kmsek kmkr-t"><button data-kmkrs="k" class="${KRS === 'k' ? 'on' : ''}">Kulüp</button><button data-kmkrs="s" class="${KRS === 's' ? 'on' : ''}">Sezon</button></div>${ust}<div class="kmkr-ic ${KRS}">${KRS === 'k' ? kul : sez}</div>
      <p class="kmkay">Kaynak: Transfermarkt</p>`);
  }
  function tmOyuncuKartlari(e) {
    const p = tmOyuncu(e); if (!p) return { deg: '', sez: '', yan: '', bilgi: [] };
    const bilgi = [];
    if (p.cx) bilgi.push([tarihTr(p.cx), 'Sözleşme bitişi']);
    if (p.ic && +p.ic[0] > 0) bilgi.push([`${p.ic[0]} maç · ${p.ic[1] || 0} gol`, 'Milli takımda']);
    return { deg: degerGrafik(p, e), sez: '', yan: kariyerKarti(p, e), bilgi, sp: SPTR[p.sp] || p.sp || '' };
  }
  // deger grafigi: fare ya da parmakla (surukleyerek) kulup, tarih, deger; imlec parmagi kesintisiz izler
  const degGizle = haric => document.querySelectorAll('.kmdeg-a').forEach(x => { if (x !== haric) { const c = x.querySelector('.kmdeg-cz'), ip = x.querySelector('.kmdeg-ip'); if (c) c.hidden = true; if (ip) ip.hidden = true; } });
  function degGoster(a, clientX) {
    let L = a._kmL; if (!L) { try { L = a._kmL = JSON.parse(a.dataset.kmdeg); } catch (x) { return; } }
    const r = a.getBoundingClientRect(); if (!r.width) return;
    const px = Math.min(Math.max((clientX - r.left) / r.width * 100, L[0][0]), L[L.length - 1][0]);
    const n = L.reduce((b, x) => Math.abs(x[0] - px) < Math.abs(b[0] - px) ? x : b, L[0]);
    const cz = a.querySelector('.kmdeg-cz'), ip = a.querySelector('.kmdeg-ip');
    cz.hidden = false; cz.style.left = px + '%';
    ip.hidden = false;
    if (a._kmN !== n || !ip.innerHTML) { a._kmN = n; ip.innerHTML = `<span>${n[4] ? kulupLogo(n[4], (TM[n[4]] || R.some(m => m.h === n[4] || m.a === n[4])) ? n[4] : null) : ''}<b style="color:${n[5]}">${E(kulupAd(n[4]))}</b><small>${E(ayYil(n[3]))}</small></span><em style="background:${n[5]}">${E(binEur(n[2]))}</em>`; }
    // kutu grafigin (ve ekranin) disina tasmasin: genisligine gore piksel olarak sinirla
    { const w = r.width, iw = ip.offsetWidth, sol = Math.max(-r.left + 8, -40), sag = Math.min(window.innerWidth - r.left - 8, w + 40); let x = px / 100 * w; x = iw >= sag - sol ? (sol + sag) / 2 : Math.min(Math.max(x, sol + iw / 2), sag - iw / 2); ip.style.left = x + 'px'; }
  }
  // tarayici pointermove'u zaten kare basina birlestirir; dogrudan cizilir
  const degPlan = (a, x) => degGoster(a, x);
  document.addEventListener('mousemove', ev => {
    const a = ev.target.closest && ev.target.closest('[data-kmdeg]'); degGizle(a); if (a) degPlan(a, ev.clientX);
  });
  // dokunmatik: dokununca ve parmak surukledikce akar (dikey kaydirma serbest: touch-action pan-y)
  document.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'mouse') return;
    const a = ev.target.closest && ev.target.closest('[data-kmdeg]'); degGizle(a); if (!a) return;
    a._kmP = ev.pointerId; try { a.setPointerCapture(ev.pointerId); } catch (x) { } degPlan(a, ev.clientX);
  }, { passive: true });
  document.addEventListener('pointermove', ev => {
    if (ev.pointerType === 'mouse') return;
    const a = ev.target.closest && ev.target.closest('[data-kmdeg]'); if (a && a._kmP === ev.pointerId) degPlan(a, ev.clientX);
  }, { passive: true });
  const degBirak = ev => { const a = ev.target.closest && ev.target.closest('[data-kmdeg]'); if (a && a._kmP === ev.pointerId) a._kmP = null; };
  document.addEventListener('pointerup', degBirak, { passive: true });
  document.addEventListener('pointercancel', degBirak, { passive: true });
  // takim / milli takim bilgisi
  function tmTakimHarita() { return tmV('teammap', () => fetch('data/tm/teammap.json').then(r => r.ok ? r.json() : null)); }
  function tmKulup(n) {
    if (!window.KMTM) return null; const m = tmTakimHarita(); if (!m) return null;
    const k = Object.keys(m).find(x => x.endsWith('|' + n) && (!TM[n] || x.startsWith(TM[n].l + '|'))) || Object.keys(m).find(x => x.endsWith('|' + n)); if (!k) return null;
    const [lig] = k.split('|'); return tmV('c' + k, () => KMTM.club(lig, n));
  }
  function tmMilli(n) { return window.KMTM ? tmV('n' + n, () => KMTM.nation(n)) : null; }
  function tmTakimId(n) { const c = tmKulup(n); if (c && c.id) return c.id; const t = tmMilli(n); return t && t.id ? String(t.id) : null; }
  // dis kaynakli lig (window.KMLX, data/standings/<LIG>.json): Transfermarkt verisi yoksa stadyum ve teknik direktor
  function disKulup(n) {
    const l = TM[n] && TM[n].l, sd = l && window.KMLX && window.KMLX[l], r = sd && (sd.rows || []).find(x => x.n === n);
    return r && (r.st || r.co) ? { st: r.st, se: r.cap, co: r.co, dis: 1 } : null;
  }
  function takimBilgiKarti(n) {
    const c = tmKulup(n) || disKulup(n), t = c ? null : tmMilli(n); const s = [];
    const sr = (a, b) => b == null || b === '' ? '' : `<div class="kmsr"><span>${a}</span><b>${b}</b></div>`;
    if (c) s.push(sr('Stadyum', c.st ? E(c.st) + (c.se ? ` <small>${Number(c.se).toLocaleString('tr-TR')} kişi</small>` : '') : ''), sr('Yaş ortalaması', c.ag ? String(c.ag).replace('.', ',') : ''), sr('Yabancı oyuncu', c.fo != null ? '%' + String(c.fo).replace('.', ',') : ''), sr('Teknik direktör', (c.dis || c.cw) && c.co ? E(c.co) : ''), sr('Milli oyuncu', c.nt), sr('En sık diziliş', c.dz ? E(String(c.dz).replace(/\s*flat|\s*diamond/i, '')) : ''));
    else if (t) s.push(sr('FIFA sırası', t.rk ? t.rk + '.' : ''), sr('Yaş ortalaması', t.ag ? String(t.ag).replace('.', ',') : ''), sr('Kadro', t.sz ? t.sz + ' oyuncu' : ''));
    const h = s.join(''); return h ? card('kmtbil', `<h3 class="kmb">${c ? 'Kulüp bilgileri' : 'Milli takım bilgileri'}</h3>${h}${c && c.dis ? '' : TMKAY}`) : '';
  }
  // karsilikli maclar (Transfermarkt): API'nin HH verisi yoksa
  const TMYAR = { GB1: 'Premier League', ES1: 'LaLiga', IT1: 'Serie A', L1: 'Bundesliga', FR1: 'Ligue 1', TR1: 'Süper Lig', NL1: 'Eredivisie', PO1: 'Liga Portugal', BE1: 'Jupiler Pro League', SC1: 'Scottish Premiership', SA1: 'Saudi Pro League', CL: 'Şampiyonlar Ligi', EL: 'Avrupa Ligi', UCOL: 'Konferans Ligi', ECLQ: 'Konferans Ligi eleme', CLQ: 'Şampiyonlar Ligi eleme', ELQ: 'Avrupa Ligi eleme', USC: 'Süper Kupa', TRP: 'Türkiye Kupası', FAC: 'FA Cup', CDR: 'Copa del Rey', CIT: 'Coppa Italia', DFB: 'DFB-Pokal', FRCH: 'Coupe de France' };
  function tmH2h(m) {
    if (!window.KMTM) return null; const a = tmTakimId(m.h), b = tmTakimId(m.a); if (!a || !b) return null;
    const l = tmV('h' + a + '-' + b, () => KMTM.h2h(a, b)); if (!Array.isArray(l) || !l.length) return null;
    return l.map(r => { const ev = +r[2] === 1; return { d: tarihTr(r[0]), c: TMYAR[r[1]] || r[1], h: ev ? m.h : m.a, a: ev ? m.a : m.h, x: ev ? +r[3] : +r[4], y: ev ? +r[4] : +r[3] }; });
  }
  // Kadro sekmesi (FotMob tablo): oyuncu, pozisyon, milli takim, forma, yas, mac/gol/asist; antrenor ustte
  const POSAD = { K: 'Kaleci', D: 'Defans', O: 'Orta saha', F: 'Forvet' };
  // kadro tablosu siralamasi (20 Kas 2026): varsayilan kaleci -> defans -> orta saha -> forvet; basliga dokununca o sutuna gore
  // (sayi: en coktan en aza, yazi: A-Z), ikinci dokunus tersine cevirir. Degeri olmayan oyuncular hep en altta.
  let KSRT = { k: '', d: 1 };
  document.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('[data-ksrt]'); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    const k = b.dataset.ksrt;
    if (k === 'p') KSRT = KSRT.k === '' ? { k: 'p', d: -1 } : { k: '', d: 1 };
    else KSRT = KSRT.k === k ? { k, d: -KSRT.d } : { k, d: (k === 'o' || k === 'u') ? 1 : -1 };
    const y = window.scrollY; try { render(); window.scrollTo(0, y); } catch (e) { }
  }, true);
  function kadroTablosu(n) {
    const L = takimOyunculari(n);
    if (!L.length) return card('kmkdt', `<h3 class="kmb">Kadro</h3><p class="kmbos">Bu takım için oyuncu verisi yok.</p>`);
    const pos = e => (e.ps && e.ps.p[6]) || e.pos || '';
    const sira = { K: 0, D: 1, O: 2, F: 3, '': 4 };
    const ulke = e => kfOf(e).n || (e.milli && e.milli !== n ? e.milli : '') || (e.ps && e.ps.p[11]) || '';
    const forma = e => kfOf(e).no || (!e.milli || e.milli === n ? e.no : null) || (e.ps && +e.ps.p[7] > 0 ? e.ps.p[7] : null);
    const yas = e => yasHesap(kfOf(e).b) || e.a || (e.ps && +e.ps.p[10] > 0 ? e.ps.p[10] : null);
    const sayi = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : null; };
    const DEG = { o: e => e.n || null, u: e => ulke(e) || null, f: e => sayi(forma(e)), y: e => sayi(yas(e)), m: e => e.ps ? sayi(e.ps.p[1]) : null, g: e => e.ps ? sayi(e.ps.p[3]) : null, a: e => e.ps ? sayi(e.ps.p[4]) : null };
    const varsay = (a, b) => sira[pos(a)] - sira[pos(b)] || (+a.no || 99) - (+b.no || 99) || a.n.localeCompare(b.n, 'tr');
    const l = L.slice().sort((a, b) => {
      if (KSRT.k === 'p') return -varsay(a, b);
      const f = DEG[KSRT.k]; if (!f) return varsay(a, b);
      const x = f(a), y = f(b);
      if (x == null || y == null) return x == null && y == null ? varsay(a, b) : x == null ? 1 : -1;
      const c = typeof x === 'string' ? x.localeCompare(y, 'tr') : x - y;
      return (c * KSRT.d) || varsay(a, b);
    });
    const th = (k, t, cls) => { const on = KSRT.k === k || (k === 'p' && KSRT.k === ''), ok = !on ? '↕' : (k === 'p' ? (KSRT.k === '' ? '↓' : '↑') : KSRT.d < 0 ? '↓' : '↑'); return `<th${cls ? ` class="${cls}"` : ''}><button type="button" class="kmsrt${on ? ' on' : ''}" data-ksrt="${k}" title="Sırala">${t}<i>${ok}</i></button></th>`; };
    let hoca = ''; try { const X = window.KMX; let son = null; Object.values(X.byKey || {}).forEach(m => { const s = m.h === n ? 'h' : m.a === n ? 'a' : null; if (s && m.lu && m.lu[s] && m.lu[s].co && (!son || Date.parse(m.t) > son.t)) son = { t: Date.parse(m.t), co: m.lu[s].co }; }); hoca = (son && son.co) || xt(n).coach || (disKulup(n) || {}).co || (() => { const k = tmKulup(n); return k && (k.dis || k.cw) && k.co || ''; })(); } catch (e) { }
    const [ka, kb] = renk(n);
    const ulkeH = e => { const u = kfOf(e).n || (e.milli && e.milli !== n ? e.milli : '') || (e.ps && e.ps.p[11]) || ''; return u ? `<span class="kmuy" data-tm="${E(u)}">${bd(u)}<span>${E(u)}</span></span>` : '<span class="kmmut">–</span>'; };
    const sat = e => `<tr ${e.ps ? `data-pl="${E(e.key)}"` : `data-pn="${E(n + '|' + e.ad)}"`}><td class="kmkdt-o"><div class="kmkdt-w"><span class="kmav" style="--ka:${ka};--kb:${kb}"><i>${E(basH(e.n))}</i>${fotoImg(fotoUrl(n, { id: e.id, ph: e.ph, n: e.ad }))}</span><b>${E(e.n)}</b></div></td><td>${E(POSAD[pos(e)] || '–')}</td><td class="kmkdt-u">${ulkeH(e)}</td><td>${(() => { const k = kfOf(e).no || (!e.milli || e.milli === n ? e.no : null) || (e.ps && +e.ps.p[7] > 0 ? e.ps.p[7] : null); return k ? E(k) : '–'; })()}</td><td>${(() => { const y = yasHesap(kfOf(e).b) || e.a || (e.ps && +e.ps.p[10] > 0 ? e.ps.p[10] : null); return y ? E(y) : '–'; })()}</td><td>${e.ps ? E(e.ps.p[1]) : '–'}</td><td>${e.ps ? E(e.ps.p[3]) : '–'}</td><td>${e.ps ? E(e.ps.p[4]) : '–'}</td></tr>`;
    return card('kmkdt', `<table class="kmkdt-t"><thead><tr>${th('o', 'Oyuncu', 'kmkdt-o')}${th('p', 'Pozisyon')}${th('u', 'Uyruk')}${th('f', 'Forma')}${th('y', 'Yaş')}${th('m', 'Maç')}${th('g', 'Gol')}${th('a', 'Asist')}</tr></thead><tbody>
      ${hoca && KSRT.k === '' ? `<tr class="kmkdt-h"><td class="kmkdt-o"><div class="kmkdt-w"><span class="kmav" style="--ka:${ka};--kb:${kb}"><i>${E(basH(hoca))}</i></span><b>${E(hoca)}</b></div></td><td>Antrenör</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>` : ''}${l.map(sat).join('')}</tbody></table>
      <p class="kmkay">Kaynak: Transfermarkt</p>`);
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
    {
      document.getElementById('app').classList.remove('kmeskitv');
      const x = xt(n);
      let ic;
      if (TT === 't') ic = tabloKutusu(n) + `<div class="mside">${sezonKutusu(n)}</div>`;
      else if (TT === 'k') ic = kadroTablosu(n);
      else if (TT === 'm') ic = takimMaclarKarti(n) + `<div class="mside">${sonrakiKarsilastir(n)}${tahminKarnesi(R.filter(m => m.h === n || m.a === n), n, 'Bu takım için kayıtlı tahmin yok.')}</div>`;
      else if (TT === 'i') ic = oyuncuIstatSekmesi(n);
      else ic = `<div class="kmiki2">${formKutusu(n)}${sonrakiKutusu(n)}</div>` + tabloKutusu(n) + hocaKutusu(n) + enCoklarKarti(n)
        + `<div class="mside">${takimNotlari(new Set([n]))}${ilk11Karti(n)}${maclarKutusu(n)}${takimBilgiKarti(n)}${stadKarti(x.venue)}${sezonKutusu(n)}</div>`;
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
  fetch('data/players/foot.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { if (j) window.KMFOOT = j; }).catch(() => { });
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
    const gecis = tmV('gecis', () => fetch('data/players/gecis.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null));
    const gz = new Set((gecis && gecis.gizle) || []);
    const gzL = [...gz].map(k => { const p = k.split('|'); return { t: p[1], n: p.slice(2).join('|') }; });
    const sig = (gecis === undefined ? 'g0' : 'g1') + (X.at || '') + '|' + Object.keys(typeof PS !== 'undefined' ? PS : {}).length + '|' + Object.keys(sqs).length + '|' + Object.keys(bk).length + '|' + Object.keys(typeof LVD !== 'undefined' ? LVD : {}).length + '|' + (SEZ && SEZ.p ? Object.keys(SEZ.p).length : 0);
    if (OYI && OYI.sig === sig) return OYI;
    const L = [], grup = new Map(), kupa = c => ['CL', 'EL', 'ECL', 'UNL'].includes(c);
    (typeof plAll === 'function' ? plAll() : []).forEach(x => {
      const g = x.team + '|' + adN(x.p[0]).join(' '), o = grup.get(g);
      if (!o) { const e = { key: x.k, n: x.p[0], ad: x.p[0], team: x.team, c: x.c, ps: x }; grup.set(g, e); L.push(e); }
      else if (kupa(o.c) && !kupa(x.c)) { o.key = x.k; o.c = x.c; o.ps = x; }
    });
    // ayni tam ad (en az iki kelime) birden cok kulupte: sezon icinde transfer; en cok mac oynadigi kulup ana kayit
    // takim degistiren oyuncu (data/players/gecis.json "LIG|Takim|Ad"): eski takim kaydi gizli; yeni takim ana kayit, eski istatistik diger olarak kalir
    L.forEach(e => { e.gizli = gz.has(e.ps.c + '|' + e.ps.team + '|' + e.ps.p[0]); });
    { const ta = new Map(); L.forEach(e => { const k = adN(e.n).join(' '); if (k.split(' ').length >= 2 || gz.size) (ta.get(k) || ta.set(k, []).get(k)).push(e); });
      ta.forEach(l => { if (l.length < 2) return; if (adN(l[0].n).length < 2) { const vis = l.filter(x => !x.gizli); l.filter(x => x.gizli).forEach(h => { const c = vis.filter(v => v.ps.p[6] === h.ps.p[6]); const t = c.length === 1 ? c[0] : (vis.length === 1 ? vis[0] : null); if (t) (t.diger = t.diger || []).push(h.ps); }); return; } l.sort((x, y) => (x.gizli ? 1 : 0) - (y.gizli ? 1 : 0) || (+y.ps.p[1] || 0) - (+x.ps.p[1] || 0)); const ana = l[0]; ana.diger = l.slice(1).map(x => x.ps); l.slice(1).forEach(x => { const i = L.indexOf(x); if (i >= 0) L.splice(i, 1); }); }); }
    for (let i = L.length - 1; i >= 0; i--) if (L[i].gizli) L.splice(i, 1);
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
    // kalici kimlikler: eski maclar veriden dusunce foto kaybolmasin (season.json + bu cihazda daha once gorulenler)
    if (SEZ && SEZ.p) Object.entries(SEZ.p).forEach(([k, v]) => { if (v && v.tm && /^\d+$/.test(k)) ekle(v.tm, { id: +k, n: v.n, ph: v.ph, no: v.no }, APIMEV[v.pos] || v.pos); });
    try {
      const PK = 'kmPlIds', bel = JSON.parse(localStorage.getItem(PK) || '{}'); let deg = false;
      api.forEach(o => { const k = o.team + '|' + o.n; if (o.id) { if (bel[k] !== o.id) { bel[k] = o.id; deg = true; } } else if (bel[k]) o.id = bel[k]; });
      Object.entries(bel).forEach(([k, id]) => { const i = k.indexOf('|'), tm = k.slice(0, i), n = k.slice(i + 1); if (!api.some(o => o.id === id)) ekle(tm, { id, n }); });
      if (deg) localStorage.setItem(PK, JSON.stringify(bel));
    } catch (x) { }
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
        if (gzL.some(g => g.t === o.team && ayniAd(g.n, o.n))) return; // eski takimdaki (gecis.json) oyuncu
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
  // mac tablosu: yarisma sekmeleri (yan yana kutular)
  document.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('[data-kmmt]'); if (!b) return; const c = b.closest('.kmpmc'); if (!c) return;
    c.querySelectorAll('[data-kmmt]').forEach(x => x.classList.toggle('on', x === b));
    c.querySelectorAll('.kmmg').forEach((g, i) => { g.hidden = i !== +b.dataset.kmmt; });
  });
  // mac tablosu sayfalama (her yarisma tablosu 10 mac)
  document.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('[data-kmpg]'); if (!b) return; const w = b.closest('.kmmg'); if (!w) return;
    const pg = +w.dataset.pg || 1, p = Math.max(0, Math.min(pg - 1, (+w.dataset.p || 0) + (+b.dataset.kmpg)));
    w.dataset.p = p; w.querySelectorAll('tbody tr').forEach((r, i) => { r.hidden = !(i >= p * 10 && i < p * 10 + 10); });
    const n = w.querySelector('.kmmn b'); if (n) n.textContent = (p + 1) + '/' + pg;
    const bs = w.querySelectorAll('[data-kmpg]'); bs[0].disabled = p === 0; bs[1].disabled = p >= pg - 1;
  });
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
  const tkSoz = x => nz(x).replace(/[^a-z0-9çğıöşüäéñ ]/g, ' ').split(' ').filter(w => w && !['fc', 'sc', 'cf', 'ac', 'afc', 'sk', 'fk', 'cd', 'sv'].includes(w));
  function ayniTk(a, b) { if (a === b) return true; const x = tkSoz(a), y = tkSoz(b); return x.length > 0 && x.length === y.length && x.every((w, i) => w.startsWith(y[i]) || y[i].startsWith(w)); }
  function oyuncuMaclari(o) {
    const is = x => (typeof plMt === 'function' ? plMt(o.nm, x) : nz(x) === nz(o.nm));
    const kay = [[o.t, o.team]].concat(((o.e && o.e.diger) || []).map(d => [PS[d.tk] || {}, d.team]));
    const ps = kay.flatMap(([T, takim], ki) => ((T && T.m) || []).map(m => {
      const sk = String(m.t || '').match(/^(.*) (\d+)-(\d+) (.*)$/);
      // takim adi kayitta farkli yazilabilir (Man City / Manchester City): ayni takim sayilir, rakip diger taraf olur
      const ev = sk ? (sk[1] === takim || (!ayniTk(sk[4], takim) && ayniTk(sk[1], takim))) : true, rakip = sk ? (ev ? sk[4] : sk[1]) : (m.t || '');
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
    // maci mac ayrinti dosyasi (data/players/mlog.json, Sofascore; API ucretsiz planda gecmis maclari vermiyor): yalniz verisi bilinmeyen satirlar, rakip + skor ayniysa ve oyuncu o maci kadrosunda bulunuyorsa doldurulur
    { const ML = tmV('mlog', () => fetch('data/players/mlog.json').then(r => r.ok ? r.json() : null));
      if (ML && ML.t) ps.forEach(r => {
        const L = ML.t[kay[r.ki || 0][1]]; if (!L) return;
        const e = L.find(x => x.s === r.skor && ayniTk(x.r, r.rakip)); if (!e) return;
        if (!r.t) r.t = e.t; // tarih: maci kaydindaki baslama saati (siralama icin)
        if (!(r.bilinmez || r.dk == null)) return;
        const q = e.p.find(x => is(x[0]));
        const xk = !q && e.x && Object.keys(e.x).find(k => is(k)); // kaynaktaki eksik oyuncu listesi: sakat / cezali
        if (xk) { r.dur = e.x[xk]; r.dk = null; r.g = 0; r.a = 0; r.y = 0; r.pu = undefined; r.bilinmez = false; r.ml = 1; return; }
        if (!q) { // kadro listesi tam (21) ve oyuncu baska bir maci listesinde bulunuyorsa (ad eslesmesi calisiyor) bu macta kadroda degil
          if (e.p.length >= 21 && L.some(x => x.p.some(y => is(y[0])))) { r.dur = 'Kadroda yok'; r.dk = null; r.g = 0; r.a = 0; r.y = 0; r.pu = undefined; r.bilinmez = false; r.ml = 1; }
          return; }
        const oynadi = q[2] != null;
        r.dur = q[1] === 'E' ? 'İlk 11' : oynadi ? 'Yedek' : 'Oynamadı'; r.dk = oynadi ? q[2] : null;
        r.g = q[3] || 0; r.a = q[4] || 0; r.y = q[5] || 0; r.pu = q[7] != null ? q[7] : undefined; r.bilinmez = false; r.ml = 1;
      });
      // sezon basindan beri: uygulamada satiri olmayan maclar, oyuncu oynadiysa eklenir (hafta sirasiyla, tarih yazilmaz)
      if (ML && ML.t) { const L = ML.t[o.team]; if (L) [...L].reverse().forEach(e => {
        if (ps.some(r => !r.ki && r.skor === e.s && ayniTk(r.rakip, e.r))) return;
        const q = e.p.find(x => is(x[0])); if (!q || q[2] == null) return;
        const [x, y] = e.s.split(' - ').map(Number), gf = e.ev ? x : y, ga = e.ev ? y : x;
        ps.push({ t: e.t || 0, d: e.c === 'CL' ? e.d : e.w + '. hafta', c: e.c === 'CL' ? 'Şampiyonlar Ligi' : 'Süper Lig', rakip: e.r, ev: !!e.ev, skor: e.s, r: gf > ga ? 'G' : gf < ga ? 'M' : 'B', dk: q[2], dur: q[1] === 'E' ? 'İlk 11' : 'Yedek', g: q[3] || 0, a: q[4] || 0, y: q[5] || 0, pu: q[7] != null ? q[7] : undefined, bilinmez: false, ki: 0, ml: 1 });
      }); }
    }
    return ps.concat(apiMaclari(o.e, ps)).sort((x, y) => (y.t || 0) - (x.t || 0));
  }
  function oyuncuVeri(v) {
    const e = oyuncuBul(v), x = e.ps;
    const p = x ? x.p : null, c = x ? x.c : (e.c || ''), team = e.team;
    const t = (x && typeof PS !== 'undefined' && PS[x.tk]) || {};
    return { e, p, team, nm: e.n, c, t };
  }
  // kulubun resmi tam adi (uygulamadaki kisa adlar icin); listede olmayan ad aynen kalir
  const TAM_KULUP = { 'Man City': 'Manchester City', 'Man United': 'Manchester United', 'N. Forest': 'Nottingham Forest', 'C. Palace': 'Crystal Palace', 'Leeds': 'Leeds United', 'Newcastle': 'Newcastle United', 'Brighton': 'Brighton & Hove Albion', 'West Ham': 'West Ham United', 'Wolves': 'Wolverhampton', 'Tottenham': 'Tottenham Hotspur', 'Leicester': 'Leicester City', 'Ipswich': 'Ipswich Town', 'PSG': 'Paris Saint-Germain', 'Milan': 'AC Milan', 'Leverkusen': 'Bayer Leverkusen', 'M’gladbach': 'Borussia Mönchengladbach', 'Dortmund': 'Borussia Dortmund', 'Bayern': 'Bayern Münih', 'Leipzig': 'RB Leipzig', 'Frankfurt': 'Eintracht Frankfurt', 'Celta': 'Celta Vigo', 'Betis': 'Real Betis', 'Athletic': 'Athletic Bilbao', 'Sporting': 'Sporting CP', 'PSV': 'PSV Eindhoven', 'Dundee Utd': 'Dundee United', 'Hull': 'Hull City', 'Coventry': 'Coventry City', 'Mainz': 'Mainz 05', 'Schalke': 'Schalke 04', 'Köln': '1. FC Köln', 'Hamburg': 'Hamburger SV', 'Union SG': 'Union Saint-Gilloise', 'STVV': 'Sint-Truiden', 'Rayo': 'Rayo Vallecano', 'Atletico Madrid': 'Atlético Madrid', 'Alaves': 'Alavés', 'Malaga': 'Málaga', 'Shakhtar': 'Shakhtar Donetsk', 'Guimarães': 'Vitória Guimarães', 'Atletico MG': 'Atlético Mineiro', 'Vasco DA Gama': 'Vasco da Gama' };
  // gosterim: tam ad; dar yerde yaygin kisaltma (desktop.js tamAdUygula). Veri anahtarlari kisa adla kalir.
  const DAR_KULUP = { 'Man United': 'Man Utd', 'Atletico Madrid': 'Atlético', 'Brighton': 'Brighton', 'Union SG': 'Union SG', 'Vasco DA Gama': 'Vasco' };
  window.KMTAM = TAM_KULUP; window.KMDAR = DAR_KULUP;
  const kulupAd = n => TAM_KULUP[n] || n;
  function oyuncuSayfasi(v) {
    const o = oyuncuVeri(v), e = o.e, p = o.p, [r1] = renk(o.team);
    const posK = (p && p[6]) || e.pos || '', mev = MEVKI[posK] || '';
    const foto = fotoUrl(o.team, { id: e.id, ph: e.ph, n: e.ad });
    const geri = (typeof NAVS !== 'undefined' && NAVS.length) ? `<button class="kmgeri" data-kmpgeri="1">${ic.geri}<span>Geri</span></button>` : '';
    const bas = `<div class="kmc kmph"><div class="kmph-u" style="--tr:${E(r1)}">${geri}
        <div class="kmph-f${foto ? '' : ' yok'}"><span>${E(basH(o.nm))}</span>${fotoImg(foto)}</div>
        <div><h2>${E(o.nm)}</h2>${o.team ? `<a class="kmph-t" data-tm="${E(o.team)}">${bd(o.team)}<span>${E(kulupAd(o.team))}</span></a>` : ''}</div></div>`;
    const bilgi = [];
    // kisisel bilgi: yalnizca kaynakta olan alanlar (boy/dogum/ayak data/players/bio.json -> window.KMBIO, oyuncu kimligine gore)
    const bio = (e.id && window.KMBIO && (window.KMBIO.p || window.KMBIO)[e.id]) || {};
    // kulup forma numarasi (PS p[7]; 0 = kaynakta yok), yoksa kulup kadrosundan
    // bio.json 2024 sezonundan gelebilir (eski numara olabilir): en son kaynak o
    const kf0 = kfOf(e);
    const forma = (+kf0.no > 0 ? kf0.no : null) ?? (p && +p[7] > 0 ? p[7] : null) ?? (+e.no > 0 ? e.no : null) ?? (+bio.no > 0 ? bio.no : null);
    const kfh = kf0.h || 0;
    if (bio.h || kfh) bilgi.push([String(bio.h || kfh).replace(/\s*cm$/i, '') + ' cm', 'Boy']);
    if (forma != null && forma !== '') bilgi.push([forma, 'Forma']);
    const dgS = bio.b || kf0.b, dg = dgS ? new Date(dgS + 'T12:00:00Z') : null, dgOk = dg && !isNaN(dg);
    const yas = dgOk ? Math.floor((Date.now() - dg) / 315576e5) : e.a;
    if (yas) bilgi.push([yas + ' yaş', dgOk ? dg.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Yaş']);
    // data/players/foot.json (Wikidata, tools/foot-wikidata.mjs; ada gore eslesme, yalnizca kesin tek aday)
    const kf = kf0;
    const ayak = { right: 'Sağ', left: 'Sol', both: 'Her ikisi', sag: 'Sağ', sol: 'Sol' }[String(bio.foot || kf.f || '').toLowerCase()];
    // tercih ettigi ayak her zaman gosterilir; kaynakta yoksa "veri yok" (uydurulmaz)
    bilgi.push([ayak ? E(ayak) : '<span class="kmph-yok">veri yok</span>', 'Tercih ettiği ayak', 1]);
    const tl = TM[o.team]; // sag sutundaki Takim kutusu kullanir (bilgi satirina lig sirasi eklenmez)
    // ulke: bayrak + ad, tiklayinca milli takim sayfasi (yalnizca milli takim kadrosundan biliniyorsa)
    const ulk = kf.n || (e.milli && e.milli !== o.team ? e.milli : '');
    if (ulk) bilgi.push([`${bd(ulk)}<span>${E(ulk)}</span>`, 'Ülke', 1, ulk]);
    const dg$ = degerYaz(kf.v);
    bilgi.push([dg$ ? E(dg$) : '<span class="kmph-yok">veri yok</span>', 'Transfer değeri', 1]);
    const tmk = tmOyuncuKartlari(e); tmk.bilgi.forEach(b => bilgi.push(b));
    const nokta = { K: [50, 88], D: [50, 68], O: [50, 46], F: [50, 18] }[posK] || null;
    const saha = nokta ? `<div class="kmph-saha"><i class="ce"></i><i class="ku"></i><i class="ka"></i><b style="left:${nokta[0]}%;top:${nokta[1]}%">${({ Kaleci: 'KL', Defans: 'DF', 'Orta saha': 'OS', Forvet: 'FV' })[mev] || ''}</b></div>` : '';
    const ust = `<div class="kmph-g"><div class="kmph-b">${bilgi.length ? bilgi.map(([a, b, h, tk]) => `<div${tk ? ` class="kmph-lk" data-tm="${E(tk)}" title="${E(tk)} milli takımı"` : ''}><b${h ? ' class="kmph-n"' : ''}>${h ? a : E(a)}</b><small>${b}</small></div>`).join('') : '<p class="kmbos">Kişisel bilgi verisi yok.</p>'}</div>
        <div class="kmph-m"><h4>Mevki</h4>${mev || tmk.sp ? `<b>${E(tmk.sp || mev)}</b>` : '<p class="kmbos">veri yok</p>'}${saha}</div></div>${(kf.b || kf.v || kf.n || kf.no) ? '<p class="kmkay kmph-kay">Kaynak: Transfermarkt</p>' : ''}</div>`;
    const ml = oyuncuMaclari(o), api = ml.filter(m => m.pu !== undefined && !m.ml); // mlog satirlari (Sofascore) toplam karti uretmez: sezon karti zaten var
    const kut = (a, b) => `<div><b>${a}</b><small>${b}</small></div>`;
    const f2 = n => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
    let sezon;
    if (p) {
      const m90 = p[2] / 90, ek = [];
      if (p[6] === 'K') { if (p[8] != null) ek.push(kut(p[8], 'Gol yemeden')); if (p[9] != null) ek.push(kut(p[9], 'Yediği gol')); }
      if (p[2] >= 180) { ek.push(kut(f2(p[3] / m90), '90 dk\'da gol')); ek.push(kut(f2((p[3] + p[4]) / m90), '90 dk\'da gol+asist')); }
      sezon = card('kmpsz', `<h3 class="kmb">Sezon performansı <small>${E(kulupAd(o.team))}</small></h3><div class="kmph-s">${kut(p[3], 'Goller')}${kut(p[4], 'Asistler')}${kut(p[1], 'Maçlar')}${kut(p[2], 'Oyun süresi')}
        <div><b><i class="kmkrt s"></i>${p[5]}</b><small>Sarı kartlar</small></div>${ek.join('')}</div>
        <p class="kmkay">Kaynak: ${E(KY(o.t.src))}</p>`);
    } else sezon = '';
    // eski takim karti: oyuncu bu sezon baslamadan (1 Tem 2026) yeni takima gectiyse eski takimda bu sezon macı olamaz, kart gosterilmez
    const tmP = tmOyuncu(e), sonGecis = tmP && (tmP.tr || []).map(r => String(r[0])).sort().pop(), sezonOnce = sonGecis && sonGecis < '2026-07-01';
    ((e.diger) || []).forEach(d => { if (sezonOnce) return; const q = d.p, T = PS[d.tk] || {}; sezon += card('kmpsz', `<h3 class="kmb">Sezon performansı <small>${E(d.team)}</small></h3><div class="kmph-s">${kut(q[3], 'Goller')}${kut(q[4], 'Asistler')}${kut(q[1], 'Maçlar')}${kut(q[2], 'Oyun süresi')}<div><b><i class="kmkrt s"></i>${q[5]}</b><small>Sarı kartlar</small></div></div><p class="kmkay">Kaynak: ${E(KY(T.src))}</p>`); });
    // sitede biriken maclar (data/players/season.json): yarisma yarisma toplam; varsa maç verisinden hesaplananin yerine gecer
    const sz = sezonKaydi(e, o.team);
    if (sz && sz.c) Object.entries(sz.c).forEach(([c, v]) => {
      const t2 = (x, ad) => x == null ? '' : kut(x, ad);
      const ort = v.rn > 0 ? v.rs / v.rn : null, kl = (sz.pos || e.pos) === 'G' || (sz.pos || e.pos) === 'K';
      sezon += card('kmpsz', `<h3 class="kmb">${E(ligAd(c))} <small>sitede biriken maçlar (${v.m || 0} maç)</small></h3><div class="kmph-s">${t2(v.g, 'Goller')}${t2(v.a, 'Asistler')}${t2(v.m, 'Maçlar')}${t2(v.min, 'Oyun süresi')}
        ${ort ? `<div><b>${puanHap(ort.toFixed(1))}</b><small>Ortalama puan</small></div>` : ''}${kl ? t2(v.sv, 'Kurtarış') + t2(v.gc, 'Yenen gol') : t2(v.sh, 'Şut') + t2(v.kp, 'Kilit pas')}${t2(v.tk, 'Top çalma')}<div><b><i class="kmkrt s"></i>${v.y || 0}</b><small>Sarı kartlar</small></div></div>
        <p class="kmkay">Kaynak: API-Football</p>`);
    });
    const mil = sz ? [] : api.filter(m => true);
    if (mil.length) {
      const pu = mil.map(m => +m.pu).filter(x => x > 0), ort = pu.length ? pu.reduce((a, b) => a + b, 0) / pu.length : null;
      sezon += card('kmpsz', `<h3 class="kmb">${p ? 'Kayıtlı maçlar' : 'Sezon performansı'} <small>maç verisinden (${mil.length} maç)</small></h3><div class="kmph-s">${kut(mil.reduce((s, m) => s + m.g, 0), 'Goller')}${kut(mil.reduce((s, m) => s + m.a, 0), 'Asistler')}${kut(mil.length, 'Maçlar')}${kut(mil.reduce((s, m) => s + (+m.dk || 0), 0), 'Oyun süresi')}
        ${ort ? `<div><b>${puanHap(ort.toFixed(1))}</b><small>Ortalama puan</small></div>` : ''}<div><b><i class="kmkrt s"></i>${mil.reduce((s, m) => s + m.y, 0)}</b><small>Sarı kartlar</small></div></div>
        <p class="kmkay">Kaynak: API-Football</p>`);
    }
    if (!sezon) sezon = card('kmpsz', `<h3 class="kmb">Sezon performansı</h3><p class="kmbos">Bu oyuncu için istatistik verisi yok.</p>`);
    const tire = x => x == null || x === '' ? '–' : x;
    // maclar yarisma bazinda ayri tablolar; her tablo en fazla 10 mac, ileri/geri dugmesiyle sayfalanir
    const mSatir = (m, i) => `<tr data-i="${i}"${i >= 10 ? ' hidden' : ''}${m.bilinmez ? ' class="bz"' : ''}>
        <td><span>${E(m.d)}</span><small>${E(m.c || '')}</small></td><td class="tk"${m.rakip ? ` data-tm="${E(m.rakip)}"` : ''}>${m.rakip ? bd(m.rakip) : ''}<span>${E(m.rakip)}</span></td>
        <td class="sk">${m.r ? `<i class="kmkare ${sonuc(m.r)}">${E(m.r)}</i>` : ''}<span>${E(m.skor)}</span></td>
        <td>${E(m.dur || '–')}</td><td>${tire(m.dk)}</td><td>${m.bilinmez ? '–' : m.g}</td><td>${m.bilinmez ? '–' : m.a}</td><td>${m.bilinmez ? '–' : m.y}</td><td>${m.pu ? puanHap(m.pu) : '–'}</td></tr>`;
    const mGrup = []; ml.forEach(m => { const k = m.c || 'Diğer'; let g = mGrup.find(x => x.k === k); if (!g) mGrup.push(g = { k, a: [] }); g.a.push(m); });
    const mTablo = (g, gi) => { const pg = Math.ceil(g.a.length / 10); return `<div class="kmmg" data-pg="${pg}" data-p="0"${gi ? ' hidden' : ''}>${pg > 1 ? '<div class="kmmh">' : ''}${pg > 1 ? `<span class="kmmn"><button type="button" data-kmpg="-1" disabled aria-label="Önceki">‹</button><b>1/${pg}</b><button type="button" data-kmpg="1" aria-label="Sonraki">›</button></span></div>` : ''}<table><thead><tr><th>Tarih</th><th class="tk">Rakip</th><th></th><th>Durum</th><th title="Oynadığı dakika">Dk</th><th title="Gol">Gol</th><th title="Asist">Ast</th><th title="Sarı kart"><i class="kmkrt s"></i></th><th>Puan</th></tr></thead><tbody>${g.a.map(mSatir).join('')}</tbody></table></div>`; };
    const maclar = ml.length ? card('kmpmc', `<h3 class="kmb">Maç istatistikleri</h3><div class="kmmt">${mGrup.map((g, gi) => `<button type="button" data-kmmt="${gi}" class="${gi ? '' : 'on'}">${E(g.k)}<small>${g.a.length}</small></button>`).join('')}</div>${mGrup.map(mTablo).join('')}
        <p class="kmkay">Kaynak: API-Football${ml.some(m => m.ml) ? ", Sofascore" : ""}</p>`) : '';
    const nx = o.team ? siradaki(o.team) : null;
    const takim = o.team ? card('kmpyan', `<h3 class="kmb">Takım</h3><div class="kmpy" data-tm="${E(o.team)}">${bd(o.team, 1)}<div><b>${E(kulupAd(o.team))}</b><small>${tl && tl.l ? E(ligAd(tl.l)) + ' · ' + tl.r + '. sıra' : ''}</small></div></div>
        ${nx ? `<div class="kmpy-nx" data-kmm="${E(key(nx))}"><small>Sonraki maç</small><span>${E(nx.h)} – ${E(nx.a)}</span><small>${E(kisaTarih(nx.t))}, ${hm(nx.t)} · ${E(ligAd(nx.c))}</small></div>` : ''}`) : '';
    // milli takim: son kadro (API) ya da Transfermarkt milli mac sayisi (cagrilmayan milli oyuncu da gorunur, 'Son kadroda yok')
    const tmI = (typeof tmOyuncu === 'function' && tmOyuncu(e)) || {}, mic = tmI.ic && +tmI.ic[0] > 0 ? tmI.ic : null;
    const sonK = !!(e.milli && e.milli !== o.team), mT = sonK ? e.milli : (mic && kf.n && kf.n !== o.team ? kf.n : null);
    const mnx = sonK ? siradaki(mT) : null;
    const milli = mT ? card('kmpyan', `<h3 class="kmb">Milli takım</h3><div class="kmpy" data-tm="${E(mT)}">${bd(mT, 1)}<div><b>${E(mT)}</b><small>${[sonK ? 'Son kadroda' + (e.milliNo ? ' · ' + e.milliNo + ' numara' : '') : 'Son kadroda yok', mic ? mic[0] + ' maç · ' + (mic[1] || 0) + ' gol' : ''].filter(Boolean).map(E).join(' · ')}</small></div></div>
        ${mnx ? `<div class="kmpy-nx" data-kmm="${E(key(mnx))}"><small>Sonraki maç</small><span>${E(mnx.h)} – ${E(mnx.a)}</span><small>${E(kisaTarih(mnx.t))}, ${hm(mnx.t)} · ${E(ligAd(mnx.c))}</small></div>` : ''}`) : '';
    return bas + ust + tmk.deg + sezon + maclar + tmk.sez + `<div class="mside">${takim}${milli}${tmk.yan}</div>`;
  }
  // arama: birlesik dizinden oyuncular (tam ad ya da kisaltma)
  // telefon arama ekrani icin: oyuncu sonuclari (anahtar, ad, takim, foto adresi)
  window.kmOyuncuAra = q => { try { return oyuncuArama(q).map(e => ({ k: e.key, n: e.ad || e.n, tm: e.team, f: fotoUrl(e.team, { id: e.id, ph: e.ph, n: e.ad }) })); } catch (x) { return []; } };
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
    return h ? `<div class="mside">${h}${kay ? `<p class="kmkay kmlkay">Kaynak: ${E(KY(kay))}</p>` : ''}</div>` : '';
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
      <p class="kmkay">Kaynak: ${E(KY(kay))}</p>`);
  }
  // dis kaynakli lig (data/standings/<LIG>.json -> window.KMLX): oyuncu verisi yokken en coklar kutusu; ligEnCoklar ile ayni gorunum (foto yok, bas harf)
  function ligEnCoklarDis(c) {
    const sd = window.KMLX && window.KMLX[c]; if (!sd || !sd.scorers) return '';
    const sat = x => { const [a, b] = renk(x[1]); return `<div class="kmec"><span class="kmav" style="--ka:${a};--kb:${b}"><i>${E(basH(x[0]))}</i></span><div><b>${E(x[0])}</b><small>${bd(x[1])}${E(x[1])}</small></div><em>${x[2]}</em></div>`; };
    const kol = (ad, l) => `<div><h4>${ad}</h4>${l && l.length ? l.slice(0, 3).map(sat).join('') : '<p class="kmbos">Veri yok.</p>'}</div>`;
    return card('kmec3', `<div class="kmuc">${kol('En çok gol atan', sd.scorers)}${kol('En çok asist yapan', sd.assists)}${kol('En çok gol yemeyen kaleci', sd.cs)}</div><p class="kmkay">Kaynak: ${E(sd.src || '')}</p>`);
  }
  // lig tahmin karnesi: uygulamanin lgStats hesabiyla ayni (LGR kayitlari + pso sonucu), risk bandina gore
  function ligTahminKarti(c) { return tahminKarnesi(R.filter(x => x.c === c), ligAd(c), 'Bu lig için kayıtlı tahmin yok.'); }
  function tahminKarnesi(ML, alt, bos) {
    if (typeof LGR === 'undefined' || typeof pso !== 'function') return '';
    const B = [['Düşük riskli', p => p >= 0.7], ['Dengeli', p => p >= 0.45 && p < 0.7], ['Yüksek oran', p => p < 0.45]];
    const t = { tot: 0, h: 0, m: 0, w: 0 }, b = B.map(() => ({ tot: 0, h: 0, m: 0 }));
    const RA = window.kmRecAll ? kmRecAll() : LGR; ML.forEach(mm => { const k = [mm.c, mm.h, mm.a].join('|'); RA.filter(r => r.mk === k).forEach(r => {
      t.tot++; const z = pso(mm, { k: r.k, p: r.p }); const i = B.findIndex(x => x[1](+r.p || 0));
      if (i >= 0) b[i].tot++;
      if (z === 'hit') { t.h++; if (i >= 0) b[i].h++; } else if (z === 'miss') { t.m++; if (i >= 0) b[i].m++; } else t.w++;
    }); });
    if (!t.tot) return card('kmkarne', `<div class="kmmh kmmh1"><div><h3>Tahmin karnesi</h3><small>${E(alt)}</small></div></div><p class="kmbos">${E(bos)}</p>`);
    const bit = t.h + t.m, yz = bit ? Math.round(t.h / bit * 100) : null;
    const sat = (ad, x) => { const s = x.h + x.m; return `<div class="kmkn"><span>${ad}</span><em>${x.tot}</em><em>${s ? `${x.h}/${s}` : '–'}</em><b class="${s ? (x.h / s >= 0.7 ? 'g' : x.h / s >= 0.5 ? 'o' : 'k') : ''}">${s ? '%' + Math.round(x.h / s * 100) : '–'}</b></div>`; };
    return card('kmkarne', `<div class="kmmh kmmh1"><div><h3>Tahmin karnesi</h3><small>${E(alt)}</small></div></div>
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
    return `<section class="kmc dzhaber kmnot"><h3>${E(baslik || 'Takım notları')}</h3>${l.slice(0, 6).map(x => `<div class="dzhb"><div class="dzhb-u"><b data-tm="${E(x.tm)}">${E(x.tm)}</b><small>${tarih(x.d)}</small></div><p>${E(x.x)}</p><small>Kaynak: ${E(KY(x.src))}</small></div>`).join('')}</section>`;
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
  // ================= LIG SAYFASI (masaustu, FotMob duzeni) =================
  // Baslik karti (logo, ad, ulke, sezon, Takip et) + sekmeler: Genel bakis / Tablo / Maclar. Sag sutun (.mside): haftalik fikstur + tahmin karnesi.
  // Bolge renkleri yalniz yerlesik dagilimi bilinen buyuk 5 lig icin; digerlerinde renk/aciklama yok (uydurma yok).
  const ZON = {
    PL: [[1, 4, 'cl'], [5, 5, 'el'], [6, 6, 'ecl'], [18, 20, 'dus']], LL: [[1, 4, 'cl'], [5, 5, 'el'], [6, 6, 'ecl'], [18, 20, 'dus']],
    SA: [[1, 4, 'cl'], [5, 5, 'el'], [6, 6, 'ecl'], [18, 20, 'dus']], BL: [[1, 4, 'cl'], [5, 5, 'el'], [6, 6, 'ecl'], [16, 16, 'po'], [17, 18, 'dus']],
    L1: [[1, 3, 'cl'], [4, 4, 'clq'], [5, 5, 'el'], [6, 6, 'ecl'], [16, 16, 'po'], [17, 18, 'dus']]
  };
  const ZAD = { cl: 'Şampiyonlar Ligi', clq: 'Şampiyonlar Ligi Eleme', el: 'Avrupa Ligi', ecl: 'Konferans Ligi Eleme', po: 'Düşme play-off', dus: 'Küme düşme' };
  function ligTabloZ(c) {
    const h = tabloLig(c, []); if (!h) return '';
    const z = ZON[c]; if (!z) return h;
    const t = document.createElement('template'); t.innerHTML = h;
    t.content.querySelectorAll('tbody tr').forEach(tr => { const r = +((tr.firstElementChild || {}).textContent || 0); const b = z.find(x => r >= x[0] && r <= x[1]); if (b) tr.classList.add('kmz-' + b[2]); });
    const kul = [...new Set(z.map(x => x[2]))];
    const sec = t.content.firstElementChild;
    if (sec) sec.insertAdjacentHTML('beforeend', `<div class="kmzl">${kul.map(k => `<span><i class="kmz-${k}"></i>${E(ZAD[k])}</span>`).join('')}</div>`);
    return t.innerHTML;
  }
  // ---- Tablo filtreleri (FotMob: Tumu / Ic saha / Deplasman / Son 5 mac). Yalniz eksiksiz mac kaydi olan liglerde; xG ve fikstur zorlugu verisi yok.
  function ligKayitlari(c) {
    const m = new Map(), ekle = (n, H, f, a) => { if (!m.has(n)) m.set(n, []); m.get(n).push({ H, f, a, r: f > a ? 'G' : f < a ? 'M' : 'B' }); };
    try {
      const tk = Object.entries(TM).filter(([, v]) => v.l === c);
      if (tk.length) {
        if (typeof SLG === 'undefined' || !tk.every(([n, v]) => (SLG[n] || []).length === v.w + v.d + v.o)) return null;
        tk.forEach(([n]) => SLG[n].forEach(r => ekle(n, !!r.H, +r.f, +r.c)));
        return m;
      }
      let l = [];
      if (c === 'CL' && typeof CLR !== 'undefined') l = CLR.map(r => ({ h: r.h, a: r.a, x: +r.x, y: +r.y }));
      else if (typeof EUR !== 'undefined' && EUR[c]) l = String(EUR[c]).split('\n').map(z => { const [h, a, x, y] = z.split('|'); return { h, a, x: +x, y: +y }; });
      l = l.filter(r => r.h && r.a && Number.isFinite(r.x) && Number.isFinite(r.y));
      if (!l.length) return null;
      l.forEach(r => { ekle(r.h, true, r.x, r.y); ekle(r.a, false, r.y, r.x); });
      return m;
    } catch (e) { return null; }
  }
  const TFILT = [['all', 'Tümü'], ['ev', 'İç Saha'], ['dep', 'Deplasman'], ['son5', 'Son 5 maç']];
  let LTF = { c: '', f: 'all' };
  function ligTabloFiltre(c, f) {
    const K = ligKayitlari(c); if (!K) return '';
    const sat = [];
    K.forEach((l0, n) => {
      const l = f === 'ev' ? l0.filter(x => x.H) : f === 'dep' ? l0.filter(x => !x.H) : f === 'son5' ? l0.slice(-5) : l0;
      const v = { n, w: 0, d: 0, l: 0, f: 0, a: 0, p: 0, fm: l.slice(-5) };
      l.forEach(x => { v.f += x.f; v.a += x.a; if (x.r === 'G') { v.w++; v.p += 3; } else if (x.r === 'B') { v.d++; v.p++; } else v.l++; });
      sat.push(v);
    });
    sat.sort((x, y) => y.p - x.p || (y.f - y.a) - (x.f - x.a) || y.f - x.f || x.n.localeCompare(y.n, 'tr'));
    const satir = (v, i) => {
      const k = v.n, nx = R.filter(x => x.c === c && (x.h === k || x.a === k) && stt(x).k === 'wait').sort((p, q) => p.t - q.t)[0], op = nx ? (nx.h === k ? nx.a : nx.h) : '';
      const nxh = nx ? `<td class="nx" data-kmm="${E(key(nx))}" title="${E(nx.h + ' – ' + nx.a)} · ${E(uzunTarih(nx.t))}, ${hm(nx.t)}">${bd(op)}</td>` : '<td class="nx"></td>';
      return `<tr><td>${i + 1}</td><td class="tk" data-tm="${E(k)}">${bd(k)}<span>${E(k)}</span></td><td>${v.w + v.d + v.l}</td><td>${v.w}</td><td>${v.d}</td><td>${v.l}</td><td>${v.f}-${v.a}</td><td>${v.f - v.a > 0 ? '+' : ''}${v.f - v.a}</td><td><b>${v.p}</b></td>
        <td class="fm">${v.fm.map(r => `<i class="kmkare ${sonuc(r.r)}">${r.r}</i>`).join('')}</td>${nxh}</tr>`;
    };
    return card('kmtablo', `<h3 class="kmb">${E(ligAd(c))}</h3><table><thead><tr><th>#</th><th class="tk">Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>+/-</th><th>AV</th><th>PUAN</th><th>Form</th><th>Sonraki</th></tr></thead><tbody>${sat.map(satir).join('')}</tbody></table>`);
  }
  function ligTabloSekme(c) {
    if (LTF.c !== c) LTF = { c, f: 'all' };
    const var_ = !!ligKayitlari(c);
    const cips = var_ ? `<div class="kmtf-c">${TFILT.map(([k, ad]) => `<button type="button" data-kmtf="${k}" class="${LTF.f === k ? 'on' : ''}">${ad}</button>`).join('')}</div>` : '';
    const govde = LTF.f === 'all' || !var_ ? ligTabloZ(c) : ligTabloFiltre(c, LTF.f);
    if (!govde) return '';
    return cips ? govde.replace(/(<section[^>]*class="[^"]*kmtablo[^"]*"[^>]*>)/, '$1' + cips) : govde;
  }
  const haftaAd = rd => { const s = String(rd || ''); const m = /(\d+)\s*$/.exec(s); return /regular season|hafta/i.test(s) && m ? m[1] + '. Hafta' : (s || 'Maçlar'); };
  function ligTurlar(c) {
    const ms = R.filter(m => m.c === c).sort((a, b) => a.t - b.t); const l = [];
    // tur bilgisi (rd) varsa hafta; yoksa birbirine 3,5 gunden yakin maclar ayni maç haftasi sayilir (etiket: tarih araligi)
    ms.forEach(m => {
      let g = m.rd ? l.find(x => x.k === m.rd) : null;
      if (!m.rd) { const s0 = l[l.length - 1]; if (s0 && !s0.rd && m.t - s0.l[s0.l.length - 1].t <= 3.5 * 864e5) g = s0; }
      if (!g) { g = { k: m.rd || ('t' + m.t), rd: !!m.rd, ad: m.rd ? haftaAd(m.rd) : '', l: [] }; l.push(g); }
      g.l.push(m);
    });
    const ay = t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
    l.forEach(g => { if (g.ad) return; const t0 = g.l[0].t, t1 = g.l[g.l.length - 1].t; g.ad = dk(t0) === dk(t1) ? ay(t0) : (new Date(t0).getMonth() === new Date(t1).getMonth() ? new Date(t0).getDate() + '–' + ay(t1) : ay(t0) + ' – ' + ay(t1)); });
    return l;
  }
  const lfSatir = m => { const s = stt(m); return `<div class="kmlf" data-kmm="${E(key(m))}"><span class="b">${E(m.h)}${bd(m.h)}</span><em>${s.sc ? `${E(s.sc[0])} - ${E(s.sc[1])}` : hm(m.t)}</em><span>${bd(m.a)}${E(m.a)}</span></div>`; };
  const gunlere = ms => { const g = []; ms.forEach(m => { const d = dk(m.t); let x = g[g.length - 1]; if (!x || x.d !== d) { x = { d, t: m.t, l: [] }; g.push(x); } x.l.push(m); }); return g; };
  const gunBaslik = t => new Date(t).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  const gunHtml = l => gunlere(l).map(d => `<div class="kmhf-g">${E(gunBaslik(d.t))}</div>${d.l.map(lfSatir).join('')}`).join('');
  let LHF = { c: '', i: -1 };
  function ligHafta(c) {
    const tr = ligTurlar(c); if (!tr.length) return '';
    if (LHF.c !== c || LHF.i < 0 || LHF.i >= tr.length) { const bug = Date.now() - 3 * 3600e3; let i = tr.findIndex(g => g.l.some(m => m.t >= bug || stt(m).k === 'wait' || stt(m).k === 'live')); if (i < 0) i = tr.length - 1; LHF = { c, i }; }
    const g = tr[LHF.i];
    return card('kmlfk kmhf', `<div class="kmmh"><button class="kmok" data-kmhf="-1" ${LHF.i > 0 ? '' : 'disabled'} aria-label="Önceki hafta">‹</button><div><h3>${E(g.ad)}</h3><small>${E(ligAd(c))}</small></div><button class="kmok" data-kmhf="1" ${LHF.i < tr.length - 1 ? '' : 'disabled'} aria-label="Sonraki hafta">›</button></div>${gunHtml(g.l)}`);
  }
  function ligMaclar(c) {
    const tr = ligTurlar(c); if (!tr.length) return card('kmlfk', '<p class="kmbos">Bu lig için kayıtlı maç yok.</p>');
    return tr.slice().reverse().map(g => card('kmlfk kmhf', `<div class="kmmh kmmh1"><div><h3>${E(g.ad)}</h3></div></div>${gunHtml(g.l)}`)).join('');
  }
  let LGS = { c: '', s: 'o' };
  const sezonAd = () => { const d = new Date(), y = d.getUTCFullYear(); return d.getUTCMonth() >= 6 ? `${y}/${y + 1}` : `${y - 1}/${y}`; };
  function ligBaslik(c) {
    const renk = (typeof C !== 'undefined' && C[c]) || 'var(--mut)';
    const kisa = (ligAd(c) || c).replace(/[^A-Za-zÇĞİÖŞÜçğıöşü ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 3).toUpperCase();
    const rz = `<span class="kmlrz" style="background:${renk}">${E(kisa)}</span>`;
    const tk = !!(window.KMLig && window.KMLig.liste().includes(c));
    const sek = [['o', 'Genel bakış'], ['p', 'Tablo'], ['m', 'Maçlar']];
    return `<div class="kmc kmth kmlh kmlh2"><div class="kmth-u"><button class="kmgeri" data-kmpgeri="1" aria-label="Geri">${ic.geri}<span>Geri</span></button>${typeof window.kmLigLogo === 'function' ? window.kmLigLogo(c, rz, 'buyuk') : rz}<div><h2>${E(ligAd(c))}</h2><small>${E(ulke(c) || '')}</small></div>
        <div class="kmlh2-b"><span class="kmsezon">${E(sezonAd())}</span><button type="button" class="kmltk${tk ? ' on' : ''}" data-kmltakip="${E(c)}">${tk ? 'Takip ediliyor' : 'Takip et'}</button></div></div>
      <div class="kmsek">${sek.map(([k, ad]) => `<button type="button" data-klt="${k}" class="${LGS.s === k ? 'on' : ''}">${ad}</button>`).join('')}</div></div>`;
  }
  if (typeof leagueView === 'function') {
    const eskiLeagueView = leagueView;
    window.leagueView = function (c) {
      if (!MQ.matches) return eskiLeagueView(c);
      try {
        if (LGS.c !== c) LGS = { c, s: 'o' };
        const bas = ligBaslik(c), karne = ligTahminKarti(c), tablo = ligTabloZ(c);
        const tabloYok = card('kmtablo', `<h3 class="kmb">${E(ligAd(c))}</h3><p class="kmbos">Bu lig için puan durumu verisi yok.</p>`);
        if (LGS.s === 'p') return bas + (ligTabloSekme(c) || tabloYok) + `<div class="mside">${ligHafta(c)}${karne}</div>`;
        if (LGS.s === 'm') return bas + ligMaclar(c) + `<div class="mside">${karne}</div>`;
        return bas + (tablo || '') + (ligEnCoklar(c) || ligEnCoklarDis(c)) + (tablo ? '' : ligMaclar(c)) + takimNotlari(ligTakimlari(c), 'Haberler ve takım notları') + `<div class="mside">${ligHafta(c)}${karne}</div>`;
      } catch (e) { return eskiLeagueView(c); }
    };
    document.addEventListener('click', e => {
      const t = e.target.closest && e.target.closest('[data-klt],[data-kmhf],[data-kmltakip],[data-kmtf]'); if (!t) return;
      e.preventDefault(); e.stopPropagation();
      if (t.dataset.klt) { LGS.s = t.dataset.klt; try { render(); window.scrollTo(0, 0); } catch (x) { } return; }
      if (t.dataset.kmtf) { LTF.f = t.dataset.kmtf; try { render(); } catch (x) { } return; }
      if (t.dataset.kmhf) { LHF.i += +t.dataset.kmhf; try { render(); } catch (x) { } return; }
      if (t.dataset.kmltakip && window.KMLig) { if (window.KMLig.degistir(t.dataset.kmltakip)) { try { KMHap(); } catch (x) { } try { render(); } catch (x) { } } }
    }, true);
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
  // lig adina dokunma: lig sayfasina git (Maclar listesi lig basligi, mac sayfasi ust satiri)
  document.addEventListener('click', e => {
    const t = e.target.closest && e.target.closest('[data-kmgolig]'); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    const c = t.dataset.kmgolig;
    try { push(); det = null; PMV = null; Q = (window.kmLigQ ? window.kmLigQ(c) : LGNM[c]) || LGNM[c] || ''; QX = ''; LGT = 'p'; tab = 'k'; const q = document.getElementById('q'); if (q) q.value = LGNM[c] || Q; render(); window.scrollTo(0, 0); } catch (x) { }
  }, true);
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
  window.KM_DURUM_AL = () => ({ TT, TTn, TMS: Object.assign({}, TMS), OIS, OSS: Object.assign({}, OSS), DV, LFX: Object.assign({}, LFX), SMF, MKS, MKSn });
  window.KM_DURUM_VER = d => { if (!d) return; ({ TT, TTn, OIS, DV, SMF, MKS, MKSn } = d); TMS = Object.assign({}, d.TMS); OSS = Object.assign({}, d.OSS); LFX = Object.assign({}, d.LFX); };
  // ic ice tiklanabilirde (satir oyuncuya, hucredeki uyruk takima) en icteki data-tm kazanir
  window.addEventListener('click', ev => {
    const tm = ev.target.closest && ev.target.closest('[data-tm]'); if (!tm) return;
    const dis = tm.parentElement && tm.parentElement.closest('[data-pl],[data-pn],[data-kmm]'); if (!dis) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    try { push(); det = null; PMV = null; tab = 'k'; Q = tm.dataset.tm; QX = Q; const q = document.getElementById('q'); if (q) q.value = Q; render(); } catch (x) { }
  }, true);
  // ortak tiklamalar (yakalama asamasinda, uygulamanin belge dinleyicisinden once)
  document.addEventListener('click', e => {
    const mm = e.target.closest && e.target.closest('[data-kmm]');
    if (mm && !e.target.closest('[data-tm]')) { e.preventDefault(); try { push(); det = mm.dataset.kmm; dt = dtFor(det); PMV = null; render(); scrollTo(0, 0); } catch (x) { } return; }
    if (e.target.closest && e.target.closest('[data-kmpgeri]')) { e.preventDefault(); try { if (!back()) { Q = ''; QX = ''; render(); } } catch (x) { } return; }
    const tms = e.target.closest && e.target.closest('[data-kmtms]');
    if (tms) { if (!tms.disabled) { TMS.i = Math.max(0, TMS.i + 10 * (+tms.dataset.kmtms)); render(); } return; }
    const krs = e.target.closest && e.target.closest('[data-kmkrs]');
    if (krs) { KRS = krs.dataset.kmkrs; render(); return; }
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
  DAR.addEventListener('change', () => { try { render(); } catch (e) { } });
})();
