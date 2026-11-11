/* Veri katmani. Uygulama kodu eskiden claude.ai'in `claude.use('db')` / `claude.use('user')` arayuzunu kullaniyordu;
 * bu dosya ayni arayuzu saglar:
 *   db.doc(yol).get()   -> { exists, data() }
 *   db.doc(yol).set(v), db.doc(yol).delete()
 *   claude.use('user')  -> { id(), me() }  (oturum yoksa null = misafir)
 *
 * Yol kurallari:
 *   data/users/<uid>/<ad>   kullaniciya ozel (kupon, favori, profil): oturum aciksa Supabase user_docs tablosu,
 *                           her zaman bu cihazda da yerel kopya (cevrimdisi / hizli acilis)
 *   kupon/<KOD>             paylasilan kupon: Supabase shared_coupons (herkes okur, yalnizca giris yapan yazar)
 *   digerleri               statik veri: once localStorage ('kmdb:'+yol), yoksa data/<yol>.json
 * Supabase ayari yoksa (js/config.js bos) her sey yalnizca yerelde calisir.
 */
(function () {
  var PREFIX = 'kmdb:';
  var snap = function (exists, d) { return { exists: exists, data: function () { return d; } }; };
  var cloud = function () { return window.KMCLOUD && window.KMCLOUD.on ? window.KMCLOUD : null; };
  var me = function () { var c = cloud(); return c ? c.user() : null; };
  var userPath = function (p) { var m = /^data\/users\/([^/]+)\/(.+)$/.exec(p); return m ? { uid: m[1], name: m[2] } : null; };
  var codeOf = function (p) { var m = /^kupon\/([A-Za-z0-9]{4,12})$/.exec(p); return m ? m[1].toUpperCase() : null; };
  var enc = encodeURIComponent;

  function lread(p) { try { var v = localStorage.getItem(PREFIX + p); return v === null ? null : JSON.parse(v); } catch (e) { return null; } }
  function lwrite(p, d) { try { localStorage.setItem(PREFIX + p, JSON.stringify(d)); } catch (e) {} }
  function ldel(p) { try { localStorage.removeItem(PREFIX + p); } catch (e) {} }

  function doc(path) {
    return {
      get: async function () {
        var c = cloud(), up = userPath(path), u = c && me(), code = codeOf(path), rows;
        if (up && c && u && u.id === up.uid) {
          try {
            rows = await c.rest('GET', 'user_docs', '?select=data&user_id=eq.' + enc(up.uid) + '&path=eq.' + enc(up.name));
            if (rows && rows.length) { lwrite(path, rows[0].data); return snap(true, rows[0].data); }
            return snap(false, {});
          } catch (e) {
            var l = lread(path); // cevrimdisi: yerel kopya
            return l !== null ? snap(true, l) : snap(false, {});
          }
        }
        if (code && c) {
          try {
            rows = await c.rest('GET', 'shared_coupons', '?select=data&code=eq.' + enc(code));
            if (rows && rows.length) return snap(true, rows[0].data);
            return snap(false, {});
          } catch (e) { /* ag yok: yerel kopyaya dus */ }
        }
        var l2 = lread(path);
        if (l2 !== null) return snap(true, l2);
        if (path.indexOf('data/users/') === 0) return snap(false, {});
        try {
          var r = await fetch('data/' + path + '.json', { cache: 'no-cache' });
          if (r.ok) return snap(true, await r.json());
        } catch (e) {}
        return snap(false, {});
      },

      set: async function (d) {
        lwrite(path, d); // her zaman yerel kopya
        var c = cloud(), up = userPath(path), u = c && me(), code = codeOf(path);
        try {
          if (up && c && u && u.id === up.uid) {
            await c.rest('POST', 'user_docs', '?on_conflict=user_id,path',
              { user_id: u.id, path: up.name, data: d, updated_at: new Date().toISOString() },
              { Prefer: 'resolution=merge-duplicates,return=minimal' });
          } else if (code && c && u) {
            await c.rest('POST', 'shared_coupons', '?on_conflict=code', { code: code, data: d },
              { Prefer: 'resolution=merge-duplicates,return=minimal' });
          }
        } catch (e) { if (window.console) console.warn('bulut yazma basarisiz:', path); }
      },

      delete: async function () {
        ldel(path);
        var c = cloud(), up = userPath(path), u = c && me(), code = codeOf(path);
        try {
          if (up && c && u && u.id === up.uid) await c.rest('DELETE', 'user_docs', '?user_id=eq.' + enc(u.id) + '&path=eq.' + enc(up.name));
          else if (code && c && u) await c.rest('DELETE', 'shared_coupons', '?code=eq.' + enc(code));
        } catch (e) {}
      }
    };
  }

  var db = { doc: doc };
  window.claude = {
    use: async function (name) {
      if (name === 'db') return db;
      if (name === 'user') {
        var c = cloud();
        if (!c) return null;
        try { await c.ready(); } catch (e) {}
        var u = c.user();
        if (!u) return null;
        return { id: async function () { return u.id; }, me: async function () { return c.user(); } };
      }
      return null;
    }
  };
})();
