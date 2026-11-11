/* Kupon Masasi bulut katmani: Supabase ile giris (e-posta+sifre, Google) ve satir bazli veri erisimi.
 * Kutuphane kullanmaz; dogrudan Supabase'in /auth/v1 ve /rest/v1 adreslerine fetch atar.
 * config.js bos ise KMCLOUD.on === false ve uygulama eskisi gibi misafir modunda calisir.
 *
 * Disa acilanlar:
 *   window.KMCLOUD = { on, user(), ready(), signIn(e,p), signUp(e,p), google(), signOut(), rest(...), lastError }
 *   window.KMAUTH  = { t(key), card(pbx), bind(), afterLogin() }   // profil sekmesindeki giris arayuzu
 */
(function () {
  var CFG = window.KM_SUPABASE || {};
  var BASE = String(CFG.url || '').replace(/\/+$/, '');
  var KEY = String(CFG.anonKey || '');
  var on = !!(BASE && KEY);
  var SKEY = 'km_sb_session';
  var S = null;
  var refreshing = null;
  var C = { on: on, lastError: '' };

  function loadS() { try { S = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { S = null; } }
  function saveS(s) { S = s; try { if (s) localStorage.setItem(SKEY, JSON.stringify(s)); else localStorage.removeItem(SKEY); } catch (e) {} }

  function b64json(p) {
    p = p.replace(/-/g, '+').replace(/_/g, '/'); while (p.length % 4) p += '=';
    return JSON.parse(decodeURIComponent(escape(atob(p))));
  }
  function jwtUser(jwt) {
    try {
      var c = b64json(String(jwt).split('.')[1]);
      return { id: c.sub, email: c.email || '', user_metadata: c.user_metadata || {} };
    } catch (e) { return null; }
  }
  function toSession(j) {
    return { access_token: j.access_token, refresh_token: j.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (+j.expires_in || 3600), user: j.user || jwtUser(j.access_token) };
  }

  // Google (OAuth) donusu: adres cubugunda #access_token=... gelir
  function takeHash() {
    var h = location.hash || '';
    if (h.indexOf('access_token=') < 0 && h.indexOf('error_description=') < 0) return;
    var q = {}; h.replace(/^#/, '').split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); });
    if (q.access_token) {
      saveS(toSession({ access_token: q.access_token, refresh_token: q.refresh_token, expires_in: q.expires_in }));
    } else if (q.error_description || q.error) {
      C.lastError = /not enabled|disabled/i.test(q.error_description || '') ? 'nogoogle' : 'net';
    }
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  async function authFetch(path, method, body, token) {
    var h = { apikey: KEY, 'Content-Type': 'application/json' };
    if (token) h.Authorization = 'Bearer ' + token;
    var r = await fetch(BASE + '/auth/v1' + path, { method: method || 'POST', headers: h, body: body ? JSON.stringify(body) : undefined });
    var j = {}; try { j = await r.json(); } catch (e) {}
    return { ok: r.ok, status: r.status, j: j || {} };
  }

  function errKey(r) {
    var code = String(r.j.error_code || r.j.code || ''), msg = String(r.j.msg || r.j.message || r.j.error_description || '');
    if (/invalid_credentials/.test(code) || /invalid login/i.test(msg)) return 'bad';
    if (/weak_password/.test(code) || /password should be|at least/i.test(msg)) return 'weak';
    if (/user_already|already registered|already been registered/i.test(code + ' ' + msg)) return 'exists';
    if (/validation_failed|invalid.*email|email.*invalid/i.test(code + ' ' + msg)) return 'invalidmail';
    if (/provider_disabled|not enabled/i.test(code + ' ' + msg)) return 'nogoogle';
    if (/rate_limit|over_email/i.test(code + ' ' + msg) || r.status === 429) return 'limit';
    if (/email_not_confirmed/.test(code)) return 'confirm';
    return 'net';
  }

  // suresi dolmak uzere olan oturumu yenile; cevrimdisiyken oturumu koru
  async function fresh() {
    if (!S) return null;
    if (S.expires_at - 60 > Date.now() / 1000) return S;
    if (refreshing) return refreshing;
    refreshing = (async function () {
      try {
        var r = await authFetch('/token?grant_type=refresh_token', 'POST', { refresh_token: S.refresh_token });
        if (r.ok && r.j.access_token) { saveS(toSession(r.j)); }
        else if (r.status >= 400 && r.status < 500) { saveS(null); }
      } catch (e) { /* cevrimdisi: eski oturum kalsin */ }
      refreshing = null;
      return S;
    })();
    return refreshing;
  }

  C.ready = fresh;
  C.user = function () {
    if (!S || !S.user) return null;
    var u = S.user, m = u.user_metadata || {};
    return { id: u.id, email: u.email || '', name: m.full_name || m.name || (u.email ? u.email.split('@')[0] : ''), avatarUrl: m.avatar_url || m.picture || '' };
  };

  C.signIn = async function (email, pw) {
    var r = await authFetch('/token?grant_type=password', 'POST', { email: email, password: pw });
    if (r.ok && r.j.access_token) { saveS(toSession(r.j)); return { ok: true }; }
    return { error: errKey(r) };
  };
  C.signUp = async function (email, pw) {
    var r = await authFetch('/signup', 'POST', { email: email, password: pw });
    if (r.ok && r.j.access_token) { saveS(toSession(r.j)); return { ok: true }; }
    if (r.ok) return { needsConfirm: true }; // e-posta onayi acik projede oturum donmez
    return { error: errKey(r) };
  };
  C.google = function () {
    location.href = BASE + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(location.origin + location.pathname);
  };
  C.signOut = function () {
    var tok = S && S.access_token;
    saveS(null);
    // ortak cihaz gizliligi: bu cihazdaki hesap kopyalarini (kupon, favori, profil) da sil; hesaptaki veri kalir
    try { Object.keys(localStorage).filter(function (k) { return k.indexOf('kmdb:data/users/') === 0; }).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
    if (tok) { try { authFetch('/logout', 'POST', null, tok).catch(function () {}); } catch (e) {} }
  };

  // PostgREST: oturum varsa kullanici JWT'si, yoksa yalnizca apikey
  C.rest = async function (method, table, query, body, extra) {
    var s = await fresh();
    var h = { apikey: KEY, 'Content-Type': 'application/json' };
    if (s) h.Authorization = 'Bearer ' + s.access_token;
    if (extra) for (var k in extra) h[k] = extra[k];
    var r = await fetch(BASE + '/rest/v1/' + table + (query || ''), { method: method, headers: h, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error('rest ' + r.status);
    var t = await r.text();
    return t ? JSON.parse(t) : null;
  };

  loadS();
  if (on) takeHash();
  window.KMCLOUD = C;

  /* ---------------- giris arayuzu (profil sekmesi) ---------------- */
  var T = {
    tr: { title: 'Giriş yap veya hesap oluştur', hint: 'Giriş yaparsan kuponların ve favorilerin hesabında saklanır, telefon değiştirsen de kaybolmaz.', guest: 'Şu an misafirsin: kuponların ve favorilerin yalnızca bu cihazda durur.', email: 'E-posta', pass: 'Şifre (en az 6 karakter)', signin: 'Giriş yap', signup: 'Hesap oluştur', google: 'Google ile giriş', or: 'veya', wait: 'Bekle…', signedin: 'Giriş yapıldı', signedin2: 'Giriş yapıldı. İki küçük ayar yeter.', own: 'Kuponların, favorilerin ve ayarların yalnızca sana aittir.', bad: 'E-posta veya şifre hatalı.', weak: 'Şifre en az 6 karakter olmalı.', exists: 'Bu e-posta zaten kayıtlı, giriş yapmayı dene.', invalidmail: 'Geçerli bir e-posta yaz.', net: 'Bağlantı kurulamadı, birazdan tekrar dene.', confirm: 'Onay e-postası gönderildi. E-postandaki bağlantıya tıkla, sonra giriş yap.', nogoogle: 'Google ile giriş henüz açık değil.', limit: 'Çok fazla deneme, biraz bekleyip tekrar dene.' },
    en: { title: 'Sign in or create an account', hint: 'When you sign in, your slips and favourites are saved to your account and stay with you if you change phones.', guest: "You're a guest right now: your slips and favourites stay on this device only.", email: 'Email', pass: 'Password (at least 6 characters)', signin: 'Sign in', signup: 'Create account', google: 'Continue with Google', or: 'or', wait: 'Please wait…', signedin: 'Signed in', signedin2: 'Signed in. Two small settings and you are done.', own: 'Your slips, favourites and settings belong only to you.', bad: 'Wrong email or password.', weak: 'Password must be at least 6 characters.', exists: 'This email is already registered, try signing in.', invalidmail: 'Enter a valid email.', net: 'Could not connect, try again shortly.', confirm: 'A confirmation email was sent. Click the link in it, then sign in.', nogoogle: 'Google sign-in is not enabled yet.', limit: 'Too many attempts, wait a bit and try again.' },
    es: { title: 'Inicia sesión o crea una cuenta', hint: 'Al iniciar sesión, tus boletos y favoritos se guardan en tu cuenta y no se pierden si cambias de teléfono.', guest: 'Ahora eres invitado: tus boletos y favoritos solo se guardan en este dispositivo.', email: 'Correo electrónico', pass: 'Contraseña (mínimo 6 caracteres)', signin: 'Iniciar sesión', signup: 'Crear cuenta', google: 'Continuar con Google', or: 'o', wait: 'Espera…', signedin: 'Sesión iniciada', signedin2: 'Sesión iniciada. Solo dos ajustes pequeños.', own: 'Tus boletos, favoritos y ajustes son solo tuyos.', bad: 'Correo o contraseña incorrectos.', weak: 'La contraseña debe tener al menos 6 caracteres.', exists: 'Este correo ya está registrado, prueba a iniciar sesión.', invalidmail: 'Escribe un correo válido.', net: 'No se pudo conectar, inténtalo de nuevo en un momento.', confirm: 'Se envió un correo de confirmación. Pulsa el enlace y luego inicia sesión.', nogoogle: 'El acceso con Google aún no está activado.', limit: 'Demasiados intentos, espera un poco e inténtalo de nuevo.' },
    pt: { title: 'Entre ou crie uma conta', hint: 'Ao entrar, seus bilhetes e favoritos ficam salvos na sua conta e não se perdem se você trocar de celular.', guest: 'Você é convidado agora: seus bilhetes e favoritos ficam salvos apenas neste dispositivo.', email: 'E-mail', pass: 'Senha (mínimo de 6 caracteres)', signin: 'Entrar', signup: 'Criar conta', google: 'Continuar com o Google', or: 'ou', wait: 'Aguarde…', signedin: 'Login feito', signedin2: 'Login feito. Faltam só dois ajustes pequenos.', own: 'Seus bilhetes, favoritos e ajustes são só seus.', bad: 'E-mail ou senha incorretos.', weak: 'A senha deve ter pelo menos 6 caracteres.', exists: 'Este e-mail já está cadastrado, tente entrar.', invalidmail: 'Digite um e-mail válido.', net: 'Não foi possível conectar, tente novamente em instantes.', confirm: 'Enviamos um e-mail de confirmação. Clique no link e depois entre.', nogoogle: 'O login com o Google ainda não está ativado.', limit: 'Muitas tentativas, aguarde um pouco e tente de novo.' },
    de: { title: 'Anmelden oder Konto erstellen', hint: 'Nach der Anmeldung werden deine Wettscheine und Favoriten in deinem Konto gespeichert und bleiben bei einem Handywechsel erhalten.', guest: 'Du bist gerade Gast: Deine Wettscheine und Favoriten bleiben nur auf diesem Gerät.', email: 'E-Mail', pass: 'Passwort (mindestens 6 Zeichen)', signin: 'Anmelden', signup: 'Konto erstellen', google: 'Weiter mit Google', or: 'oder', wait: 'Bitte warten…', signedin: 'Angemeldet', signedin2: 'Angemeldet. Nur noch zwei kleine Einstellungen.', own: 'Deine Wettscheine, Favoriten und Einstellungen gehören nur dir.', bad: 'E-Mail oder Passwort falsch.', weak: 'Das Passwort muss mindestens 6 Zeichen haben.', exists: 'Diese E-Mail ist bereits registriert, versuche dich anzumelden.', invalidmail: 'Gib eine gültige E-Mail ein.', net: 'Verbindung fehlgeschlagen, versuche es gleich noch einmal.', confirm: 'Eine Bestätigungs-E-Mail wurde gesendet. Klicke auf den Link und melde dich dann an.', nogoogle: 'Die Anmeldung mit Google ist noch nicht aktiviert.', limit: 'Zu viele Versuche, warte kurz und versuche es erneut.' },
    it: { title: 'Accedi o crea un account', hint: "Quando accedi, le tue schedine e i preferiti vengono salvati nel tuo account e non si perdono se cambi telefono.", guest: 'Ora sei ospite: le tue schedine e i preferiti restano solo su questo dispositivo.', email: 'E-mail', pass: 'Password (almeno 6 caratteri)', signin: 'Accedi', signup: 'Crea account', google: 'Continua con Google', or: 'oppure', wait: 'Attendi…', signedin: 'Accesso effettuato', signedin2: 'Accesso effettuato. Bastano due piccole impostazioni.', own: 'Le tue schedine, i preferiti e le impostazioni sono solo tuoi.', bad: 'E-mail o password errate.', weak: 'La password deve avere almeno 6 caratteri.', exists: "Questa e-mail è già registrata, prova ad accedere.", invalidmail: "Inserisci un'e-mail valida.", net: 'Impossibile connettersi, riprova tra poco.', confirm: 'È stata inviata un\'e-mail di conferma. Clicca sul link e poi accedi.', nogoogle: "L'accesso con Google non è ancora attivo.", limit: 'Troppi tentativi, attendi un po\' e riprova.' },
    fr: { title: 'Connecte-toi ou crée un compte', hint: 'Une fois connecté, tes coupons et favoris sont enregistrés sur ton compte et ne se perdent pas si tu changes de téléphone.', guest: 'Tu es invité pour le moment : tes coupons et favoris restent uniquement sur cet appareil.', email: 'E-mail', pass: 'Mot de passe (6 caractères minimum)', signin: 'Se connecter', signup: 'Créer un compte', google: 'Continuer avec Google', or: 'ou', wait: 'Patiente…', signedin: 'Connecté', signedin2: 'Connecté. Il ne reste que deux petits réglages.', own: 'Tes coupons, favoris et réglages ne sont qu\'à toi.', bad: 'E-mail ou mot de passe incorrect.', weak: 'Le mot de passe doit contenir au moins 6 caractères.', exists: 'Cet e-mail est déjà enregistré, essaie de te connecter.', invalidmail: 'Saisis un e-mail valide.', net: 'Connexion impossible, réessaie dans un instant.', confirm: 'Un e-mail de confirmation a été envoyé. Clique sur le lien puis connecte-toi.', nogoogle: "La connexion avec Google n'est pas encore activée.", limit: 'Trop de tentatives, attends un peu et réessaie.' }
  };
  var A = { msg: C.lastError || '', email: '', busy: false };
  function t(k) { var d = T[window.LANG] || T.tr; return d[k] || T.tr[k] || k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  A.t = t;
  A.card = function (pbx) {
    var st = 'width:100%;box-sizing:border-box;padding:10px 12px;border-radius:10px;border:1px solid var(--ln);background:var(--bg);color:var(--ink);font:16px var(--f);margin:0 0 8px';
    var m = A.msg ? '<div class="mut" style="color:var(--hot);padding:2px 0 8px">' + esc(t(A.msg)) + '</div>' : '';
    var dis = A.busy ? ' disabled' : '';
    return pbx('', '<b style="font:700 20px var(--n)">' + esc(t('title')) + '</b>' +
      '<div class="mut" style="padding:4px 0 10px">' + esc(t('hint')) + '</div>' +
      '<input id="kae" type="email" autocomplete="email" inputmode="email" placeholder="' + esc(t('email')) + '" value="' + esc(A.email) + '" style="' + st + '">' +
      '<input id="kap" type="password" autocomplete="current-password" placeholder="' + esc(t('pass')) + '" style="' + st + '">' + m +
      '<div class="kpf"><button class="kpb2" id="kab_in"' + dis + '>' + esc(A.busy ? t('wait') : t('signin')) + '</button>' +
      '<button class="kpb2" id="kab_up"' + dis + '>' + esc(t('signup')) + '</button></div>' +
      '<div class="mut" style="text-align:center;padding:8px 0">' + esc(t('or')) + '</div>' +
      '<div class="kpf"><button class="kpb2" id="kab_g"' + dis + '>' + esc(t('google')) + '</button></div>' +
      '<div class="mut" style="padding-top:8px">' + esc(t('guest')) + '</div>');
  };

  function redraw() { try { profDraw(); } catch (e) {} }
  A.afterLogin = async function () {
    try {
      PRF = null; PROFL = false; PMSG = ''; KPUID = null; KPDBR = false; FUID = null; SOUT = false;
      try { localStorage.removeItem('km_out'); } catch (e) {}
      await kpRem();
      var db = await claude.use('db');
      if (db) await favLoad(db);
    } catch (e) {}
    try { kpBadge(); } catch (e) {}
    try { profView(); } catch (e) {}
  };

  async function act(kind) {
    var e = document.getElementById('kae'), p = document.getElementById('kap');
    A.email = ((e && e.value) || '').trim();
    var pw = (p && p.value) || '';
    if (!/^\S+@\S+\.\S+$/.test(A.email)) { A.msg = 'invalidmail'; redraw(); return; }
    if (pw.length < 6) { A.msg = 'weak'; redraw(); return; }
    A.busy = true; A.msg = ''; redraw();
    var r;
    try { r = kind === 'up' ? await C.signUp(A.email, pw) : await C.signIn(A.email, pw); }
    catch (err) { r = { error: 'net' }; }
    A.busy = false;
    if (r.error) { A.msg = r.error; redraw(); return; }
    if (r.needsConfirm) { A.msg = 'confirm'; redraw(); return; }
    A.msg = ''; A.email = '';
    await A.afterLogin();
  }
  A.bind = function () {
    var g = function (id) { return document.getElementById(id); };
    if (g('kab_in')) g('kab_in').onclick = function () { act('in'); };
    if (g('kab_up')) g('kab_up').onclick = function () { act('up'); };
    if (g('kab_g')) g('kab_g').onclick = function () { C.google(); };
    ['kae', 'kap'].forEach(function (id) { var el = g(id); if (el) el.onkeydown = function (ev) { if (ev.key === 'Enter') act('in'); }; });
  };
  window.KMAUTH = A;
})();
