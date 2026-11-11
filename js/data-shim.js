/* Claude artifact calisma zamaninin yerine gecen veri katmani (Asama 1).
 *
 * Uygulama kodu eskiden `claude.use('db')` ile claude.ai veritabanini kullaniyordu:
 *   db.doc(yol).get()  -> { exists, data() }
 *   db.doc(yol).set(veri)
 * Bu dosya ayni arayuzu saglar:
 *   - okuma:  once localStorage ('kmdb:'+yol), yoksa data/<yol>.json (statik yedek)
 *   - yazma:  yalnizca localStorage (kupon, favori vb. bu cihazda kalir)
 *   - 'user': yok (null). Giris Asama 2'de Supabase ile gelecek.
 * Asama 2'de bu dosyanin icindeki fetch/localStorage kisimlari Supabase cagrilariyla degisecek;
 * uygulama kodu degismeyecek.
 */
(function () {
  var PREFIX = 'kmdb:';
  var snap = function (exists, d) { return { exists: exists, data: function () { return d; } }; };

  function doc(path) {
    return {
      get: async function () {
        try {
          var v = localStorage.getItem(PREFIX + path);
          if (v !== null) return snap(true, JSON.parse(v));
        } catch (e) {}
        if (path.indexOf('data/users/') === 0) return snap(false, {});
        try {
          var r = await fetch('data/' + path + '.json', { cache: 'no-cache' });
          if (r.ok) return snap(true, await r.json());
        } catch (e) {}
        return snap(false, {});
      },
      set: async function (d) {
        try { localStorage.setItem(PREFIX + path, JSON.stringify(d)); } catch (e) {}
      }
    };
  }

  var db = { doc: doc };
  window.claude = {
    use: async function (name) { return name === 'db' ? db : null; }
  };
})();
