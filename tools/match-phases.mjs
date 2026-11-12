// /fixtures?id=<mac> cevabini (events + statistics + players + lineups) uygulamanin okudugu bicime cevirir.
// Cikti (details.json m[id].live): { st:'FT', fin:bool, min:90, g:[h,a], ht:[h,a]|null, ev:[...], t:[[etiket,ev,dep]...], sx:{pos,sh,sot,co,fo,yc,rc}, p:{h:[[ad,'',puan,dk,gol,asist,'','','',kart,degisiklik]],a:[...]} }
//  ev  : uygulamadaki LVD.ev biciminde  gol {k:'g',m,s:'h'|'a',a,b,sc}  kart {k:'y'|'r',m,s,a}  degisiklik {k:'s',m,s,a(giren),b(cikan)}  devre {k:'ht',m:45,sc}
//  t   : uygulamadaki STX.t biciminde (Turkce etiketler)
//  p   : uygulamadaki STX.p biciminde (satir: [0]=ad [2]=puan [3]=dk [4]=gol [5]=asist [9]=kart Y|R|YR [10]=▼dk (cikti) | ▲dk (girdi))
// Veri uydurulmaz: API'de olmayan alan bos/atlanir.
const FIN = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO']);
export const isFinal = s => FIN.has(s);

const NUM = v => { if (v == null || v === '') return null; const n = Number(String(v).replace('%', '')); return Number.isFinite(n) ? n : null; };
const STAT = [ // API tur adi -> uygulamadaki etiket
  ['Ball Possession', 'Topla oynama %'], ['expected_goals', 'Beklenen gol (xG)'], ['Total passes', 'Toplam pas'], ['Passes accurate', 'İsabetli pas'],
  ['Corner Kicks', 'Korner'], ['Fouls', 'Faul'], ['Offsides', 'Ofsayt'], ['Goalkeeper Saves', 'Kaleci kurtarışı'],
  ['Total Shots', 'Şut'], ['Shots on Goal', 'İsabetli şut'], ['Shots off Goal', 'İsabetsiz şut'], ['Blocked Shots', 'Engellenen şut'],
  ['Shots insidebox', 'Ceza sahası içi şut'], ['Shots outsidebox', 'Ceza sahası dışı şut'], ['Free Kicks', 'Serbest vuruş'], ['Yellow Cards', 'Sarı kart'], ['Red Cards', 'Kırmızı kart'],
];
const SX = { 'Topla oynama %': 'pos', 'Şut': 'sh', 'İsabetli şut': 'sot', 'Korner': 'co', 'Faul': 'fo', 'Sarı kart': 'yc', 'Kırmızı kart': 'rc' };

export function normalize(f, hid, aid) {
  const st = f.fixture?.status?.short || '', el = f.fixture?.status?.elapsed ?? null;
  const gh = f.goals?.home ?? 0, ga = f.goals?.away ?? 0;
  const side = tid => (tid === hid ? 'h' : tid === aid ? 'a' : null);
  const mm = e => (e.time.elapsed || 0) + (e.time.extra || 0);
  const evs = (f.events || []).slice().sort((x, y) => mm(x) - mm(y));

  // gol akisi: kendi kalesine golde skoru lehine yazilan takima ver. Hangi yorumun dogru oldugunu nihai skorla sec.
  const build = flipOwn => {
    let h = 0, a = 0; const out = [];
    for (const e of evs) {
      const s = side(e.team?.id); if (!s) continue;
      const m = mm(e);
      if (e.type === 'Goal') {
        if (/missed/i.test(e.detail)) continue;
        const own = /own/i.test(e.detail);
        const cs = own && flipOwn ? (s === 'h' ? 'a' : 'h') : s;
        if (cs === 'h') h++; else a++;
        let nm = e.player?.name || ''; if (/penalty/i.test(e.detail)) nm += ' (penaltı)'; if (own) nm += ' (kendi kalesine)';
        const ev = { k: 'g', m, s: cs, a: nm, sc: `${h} - ${a}` }; if (e.assist?.name) ev.b = e.assist.name; out.push(ev);
      } else if (e.type === 'Card') {
        const red = /red/i.test(e.detail); out.push({ k: red ? 'r' : 'y', m, s, a: e.player?.name || '' });
      } else if (e.type === 'subst') { out.push({ k: 's', m, s, a: e.assist?.name || '', b: e.player?.name || '' }); }
    }
    return { out, h, a };
  };
  let b = build(true); if (b.h !== gh || b.a !== ga) { const b2 = build(false); if (b2.h === gh && b2.a === ga) b = b2; }
  const htg = f.score?.halftime && f.score.halftime.home != null ? [f.score.halftime.home, f.score.halftime.away] : null;
  let ev = b.out;
  if (htg || el > 45 || FIN.has(st) || st === 'HT') {
    const hs = htg ? `${htg[0]} - ${htg[1]}` : null;
    if (hs) { const i = ev.findIndex(e => e.m > 45); ev = i < 0 ? [...ev, { k: 'ht', m: 45, sc: hs }] : [...ev.slice(0, i), { k: 'ht', m: 45, sc: hs }, ...ev.slice(i)]; }
  }

  // istatistik tablosu
  const stats = f.statistics || [], sh = stats.find(x => x.team?.id === hid) || stats[0], sa = stats.find(x => x.team?.id === aid) || stats[1];
  const t = [];
  if (sh && sa) for (const [ty, lb] of STAT) {
    const vh = NUM((sh.statistics || []).find(x => x.type === ty)?.value), va = NUM((sa.statistics || []).find(x => x.type === ty)?.value);
    if (vh != null && va != null) t.push([lb, vh, va]);
  }
  const sx = {}; for (const [lb, vh, va] of t) if (SX[lb]) sx[SX[lb]] = [vh, va];

  // oyuncular
  const nz = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  const same = (a, b) => { const x = nz(a), y = nz(b); if (!x || !y) return false; if (x === y) return true; const xl = x.split(' ').pop(), yl = y.split(' ').pop(); return xl === yl && x[0] === y[0]; };
  const look = (map, n) => { for (const k in map) if (same(k, n)) return map[k]; return undefined; };
  const subIn = {}, subOut = {};
  for (const e of evs) if (e.type === 'subst') { if (e.assist?.name) subIn[e.assist.name] = mm(e); if (e.player?.name) subOut[e.player.name] = mm(e); }
  const lineSets = {}; for (const l of f.lineups || []) lineSets[side(l.team?.id)] = new Set((l.startXI || []).map(x => x.player.name));
  const p = { h: [], a: [] }, px = { h: [], a: [] };
  const nn = v => (v === undefined || v === '' ? null : v), nr = v => { if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
  for (const pl of f.players || []) {
    const s = side(pl.team?.id); if (!s) continue;
    for (const q of pl.players || []) {
      const n = q.player?.name, g = q.statistics?.[0]; if (!n || !g) continue;
      const mins = g.games?.minutes, started = lineSets[s] ? lineSets[s].has(n) : g.games?.substitute === false;
      if (!started && !(mins > 0) && look(subIn, n) === undefined) continue; // oynamayan yedek
      const rt = Number(g.games?.rating); const y = g.cards?.yellow || 0, r = g.cards?.red || 0;
      const card = r ? (y ? 'YR' : 'R') : y ? 'Y' : '';
      const so = look(subOut, n), si = look(subIn, n), sb = so !== undefined ? '▼' + so : si !== undefined ? '▲' + si : '';
      px[s].push({ id: q.player.id ?? null, n, no: nn(g.games?.number), pos: nn(g.games?.position), cap: !!g.games?.captain, min: nn(mins), r: rt > 0 ? rt : null, g: nn(g.goals?.total), a: nn(g.goals?.assists), gc: nn(g.goals?.conceded), sv: nn(g.goals?.saves), sh: nn(g.shots?.total), sot: nn(g.shots?.on), ps: nn(g.passes?.total), kp: nn(g.passes?.key), pa: nr(g.passes?.accuracy), tk: nn(g.tackles?.total), bl: nn(g.tackles?.blocks), int: nn(g.tackles?.interceptions), du: nn(g.duels?.total), dw: nn(g.duels?.won), dra: nn(g.dribbles?.attempts), drs: nn(g.dribbles?.success), dp: nn(g.dribbles?.past), fd: nn(g.fouls?.drawn), fc: nn(g.fouls?.committed), off: nn(g.offsides), y: nn(g.cards?.yellow), rd: nn(g.cards?.red), pw: nn(g.penalty?.won), pc: nn(g.penalty?.commited), psc: nn(g.penalty?.scored), pm: nn(g.penalty?.missed), psv: nn(g.penalty?.saved) });
      p[s].push([n, '', rt > 0 ? rt : '', mins ?? '', g.goals?.total || 0, g.goals?.assists || 0, '', '', '', card, sb]);
    }
  }
  return { st, fin: FIN.has(st), min: el, g: [gh, ga], ht: htg, ev, t, sx, p, px };
}
