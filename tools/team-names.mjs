// Takim adi tekilligi (23 Kas 2026): uygulamada takimin kimligi ADIdir (logo, renk, takim sayfasi, favori).
// Ayni adli iki farkli kulup (Inter / Inter Miami, Lille / Belcika'daki Lille) ayni ada dusunce yanlis logo gorunur
// ve data/teams/ids.json'daki kimlik iki kulup arasinda gidip gelir. Kurallar:
//  1) API adi -> uygulama adi eslesmesi yalnizca AYNI ULKENIN ligleri (Avrupa kupalarinda Avrupa ligleri) arasinda yapilir.
//  2) Bir ad ids.json'da baska kimlikle kayitliysa yeni kulup "<ad> (<ulke>)" adini alir.
export const GRUP = {
  PL: 'ENG', FAC: 'ENG', EFL: 'ENG', ENCS: 'ENG', LL: 'ESP', CDR: 'ESP', ESSK: 'ESP', SA: 'ITA', CIT: 'ITA', ITSK: 'ITA',
  BL: 'GER', DFB: 'GER', DESK: 'GER', L1: 'FRA', CDF: 'FRA', FRTC: 'FRA', SL: 'TUR', TUK: 'TUR', TRSK: 'TUR',
  ERE: 'NED', KNV: 'NED', NLSK: 'NED', POR: 'POR', TDP: 'POR', PTSK: 'POR', BEL: 'BEL', BCP: 'BEL', BESK: 'BEL',
  SCO: 'SCO', SFA: 'SCO', KSA: 'KSA', SASK: 'KSA', BRA: 'BRA', CBR: 'BRA', BRSC: 'BRA', ARG: 'ARG', CAR: 'ARG', ARTC: 'ARG', ARSC: 'ARG',
  MLS: 'USA', MX: 'MEX', MXCC: 'MEX', CL: 'EUR', EL: 'EUR', ECL: 'EUR', USC: 'EUR',
};
const ULKE = { ENG: 'İngiltere', ESP: 'İspanya', ITA: 'İtalya', GER: 'Almanya', FRA: 'Fransa', TUR: 'Türkiye', NED: 'Hollanda', POR: 'Portekiz', BEL: 'Belçika', SCO: 'İskoçya', KSA: 'Suudi Arabistan', BRA: 'Brezilya', ARG: 'Arjantin', USA: 'ABD', MEX: 'Meksika' };
const AVRUPA = new Set(['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'TUR', 'NED', 'POR', 'BEL', 'SCO', 'EUR']);

// c yarismasindaki bir API takimi hangi uygulama liglerinin adlarina eslesebilir (app-teams.json anahtarlari)
export function kapsam(c, appKeys) {
  const g = GRUP[c];
  if (!g) return [];
  if (g === 'EUR') return appKeys.filter(k => AVRUPA.has(GRUP[k]));
  return appKeys.filter(k => GRUP[k] === g);
}

// ad ids.json'da baska kimlige aitse tekil ad uret. ulke: API'nin verdigi ulke (varsa), yoksa yarismanin ulkesi.
export function tekilAd(ad, id, ids, c, ulke) {
  if (!ad || !id || !ids) return ad;
  const v = ids[ad];
  if (!v || +v === +id) return ad;
  const u = ULKE[GRUP[c]] || ulke || String(id);
  const yeni = `${ad} (${u})`;
  return ids[yeni] && +ids[yeni] !== +id ? `${ad} (${id})` : yeni;
}
