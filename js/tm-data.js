/* Transfermarkt veri seti (Kaggle CC0, 2025/26 sezon sonuna kadar) icin tembel yukleyici. Veri: data/tm/ (tools/tm-players.mjs + tools/tm-extra.mjs uretir).
 * window.KMTM (hepsi Promise doner, veri yoksa null; sayfa acilinca yalnizca gereken kucuk dosya indirilir):
 *   KMTM.player(tid)        -> { v:[["2025-12",90000 (bin EUR)],...] deger gecmisi, tr:[[tarih,kimden,kime,ucret(bin EUR|null)],...], st:[[sezon,mac,gol,asist,dk,sari,kirmizi],...], cx:sozlesme bitis, ic:[milli mac,milli gol], sp:ayrintili mevki }
 *                              tid = KMFOOT[oyuncuId].t ya da foot-ad kaydindaki t
 *   KMTM.club(lig, takim)   -> { n, st:stadyum, se:kapasite, co:teknik direktor, mv:toplam deger, ag:yas ort., fo:yabanci %, nt:milli oyuncu, dz:en sik dizilis, id }  (lig/takim: PS anahtari "SL|Fenerbahçe")
 *   KMTM.nation(trAd)       -> { id, rk:FIFA sirasi, co, mv, ag, sz }
 *   KMTM.h2h(idA, idB)      -> [[tarih, yarisma, ev(1/0), A golu, B golu],...] A bakisiyla, en yeni once, en cok 8 (kulup/milli takim Transfermarkt kimligi)
 *   KMTM.ref(ad)            -> { n, g:mac, y:ort. sari, r:ort. kirmizi }  (2023'ten beri, >=15 mac)
 * Kaynak notu: "Transfermarkt verileri (2025/26 sezonu sonu)". Veri yoksa arayuz 'veri yok' yazar, uydurulmaz. */
(function () {
  var C = {}; // onbellek: url -> Promise
  function get(u) {
    if (!C[u]) C[u] = fetch(u, { cache: 'default' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return C[u];
  }
  function nz(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  window.KMTM = {
    player: function (tid) { tid = +tid; if (!tid) return Promise.resolve(null); return get('data/tm/p/' + (tid % 100) + '.json').then(function (o) { return (o && o[tid]) || null; }); },
    club: function (lig, takim) {
      return Promise.all([get('data/tm/teammap.json'), get('data/tm/clubs.json')]).then(function (a) {
        var id = a[0] && a[0][lig + '|' + takim]; if (!id) return null;
        var c = a[1] && a[1][id]; if (!c) return null; var o = {}; for (var k in c) o[k] = c[k]; o.id = String(id); return o;
      });
    },
    nation: function (ad) { return get('data/tm/nations.json').then(function (n) { return (n && n[ad]) || null; }); },
    h2h: function (a, b) { if (!a || !b) return Promise.resolve(null); return get('data/tm/h2h/' + a + '.json').then(function (o) { return (o && o[b]) || null; }); },
    ref: function (ad) { return get('data/tm/ref.json').then(function (r) { return (r && r[nz(ad)]) || null; }); }
  };
})();
