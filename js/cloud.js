/* Simuleto bulut katmani: Supabase ile giris (e-posta+sifre, Google) ve satir bazli veri erisimi.
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
      if (q.type === 'recovery') C.recovery = true; else if (q.type === 'signup') C.justConfirmed = true;
    } else if (q.error_description || q.error) {
      C.lastError = /not enabled|disabled/i.test(q.error_description || '') ? 'nogoogle' : 'net';
    }
    try { history.replaceState(null, '', location.pathname + location.search + (C.recovery ? '#/profil' : '')); } catch (e) {}
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
  var RTO = function () { return '?redirect_to=' + encodeURIComponent(location.origin + location.pathname); };
  C.signUp = async function (email, pw, name) {
    var r = await authFetch('/signup' + RTO(), 'POST', { email: email, password: pw, data: name ? { full_name: name } : {} });
    if (r.ok && r.j.access_token) { saveS(toSession(r.j)); return { ok: true }; }
    // Supabase kayitli adreste hata vermez; identities bos doner ve mail gonderilmez
    if (r.ok && Array.isArray(r.j.identities) && r.j.identities.length === 0) return { error: 'exists' };
    if (r.ok) return { needsConfirm: true }; // e-posta onayi acik projede oturum donmez
    return { error: errKey(r) };
  };
  // dogrulama e-postasini yeniden gonder / sifre sifirlama / yeni sifre
  C.resend = async function (email) {
    var r = await authFetch('/resend' + RTO(), 'POST', { type: 'signup', email: email });
    return r.ok ? { ok: true } : { error: errKey(r) };
  };
  C.recover = async function (email) {
    var r = await authFetch('/recover' + RTO(), 'POST', { email: email });
    return r.ok ? { ok: true } : { error: errKey(r) };
  };
  C.updatePw = async function (pw) {
    var s = await fresh(); if (!s) return { error: 'net' };
    var r = await authFetch('/user', 'PUT', { password: pw }, s.access_token);
    return r.ok ? { ok: true } : { error: errKey(r) };
  };
  C.google = function () {
    location.href = BASE + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(location.origin + location.pathname);
  };
  // Google (Identity Services, 20 Kas 2026): acilir pencere "simuleto.com" adiyla; supabase.co ekrani gosterilmez.
  // Yalniz config.js'de googleClientId varsa ve betik yuklenirse; aksi halde eski yonlendirme calisir.
  var GISP = null;
  function gisLoad() {
    if (GISP) return GISP;
    GISP = new Promise(function (ok, no) {
      if (window.google && google.accounts && google.accounts.id) return ok();
      var sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true;
      sc.onload = function () { ok(); }; sc.onerror = function () { GISP = null; no(); };
      document.head.appendChild(sc);
      setTimeout(function () { no(); }, 6000);
    });
    return GISP;
  }
  async function sha256hex(t) {
    var d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return Array.prototype.map.call(new Uint8Array(d), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  C.googleBtn = async function (slot, onDone) {
    var cid = CFG.googleClientId;
    if (!cid || !slot || !window.crypto || !crypto.subtle) return false;
    try {
      await gisLoad();
      var raw = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(16)), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      var hashed = await sha256hex(raw);
      google.accounts.id.initialize({ client_id: cid, nonce: hashed, ux_mode: 'popup', use_fedcm_for_prompt: true, callback: async function (resp) {
        try {
          var r = await authFetch('/token?grant_type=id_token', 'POST', { provider: 'google', id_token: resp.credential, nonce: raw });
          if (r.ok && r.j.access_token) { saveS(toSession(r.j)); onDone(true); } else onDone(false, errKey(r));
        } catch (e) { onDone(false, 'net'); }
      } });
      google.accounts.id.renderButton(slot, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: Math.min(400, Math.max(200, slot.offsetWidth || 300)) });
      return true;
    } catch (e) { return false; }
  };
  // hesabi kalici sil: sunucudaki delete_my_account() fonksiyonu auth.users satirini siler (kuponlar/favoriler cascade ile gider)
  C.deleteAccount = async function () {
    var s = await fresh(); if (!s) return { error: 'auth' };
    var r = await fetch(BASE + '/rest/v1/rpc/delete_my_account', { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json', Authorization: 'Bearer ' + s.access_token }, body: '{}' });
    if (r.ok) return { ok: true };
    return { error: r.status === 401 || r.status === 403 ? 'auth' : 'net' };
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
    tr: { welcome: "Hoş geldin", f1t: "Kupon simülasyonların", f1d: "Kurduğun her kupon hesabında saklanır, sonucu otomatik işlenir.", f2t: "Favori takımların", f2d: "Takip ettiğin takımlar her açılışta hazır bekler.", f3t: "Her cihazda aynı", f3d: "Telefonda kur, bilgisayarda devam et.", f4t: "Kendi istatistiğin", f4d: "Tuttu / tutmadı oranını ve netini gör.", foot: "Simuleto bir simülatördür, bahis yaptırmaz. Hiçbir bahis risksiz değildir.", noacc: "Hesabın yok mu?", haveacc: "Zaten hesabın var mı?", title: 'Giriş yap veya hesap oluştur', hint: 'Giriş yaparsan kuponların ve favorilerin hesabında saklanır, cihaz değiştirsen de kaybolmaz.', guest: 'Şu an misafirsin: kuponların ve favorilerin yalnızca bu cihazda durur.', email: 'E-posta', pass: 'Şifre (en az 6 karakter)', signin: 'Giriş yap', signup: 'Hesap oluştur', google: 'Google ile giriş', or: 'veya', wait: 'Bekle…', signedin: 'Giriş yapıldı', signedin2: 'Giriş yapıldı. İki küçük ayar yeter.', own: 'Kuponların, favorilerin ve ayarların yalnızca sana aittir.', bad: 'E-posta veya şifre hatalı.', weak: 'Şifre en az 6 karakter olmalı.', exists: 'Bu e-posta adresiyle zaten bir hesap var, tekrar kayıt olamazsın. Giriş yap; şifreni unuttuysan "Şifremi unuttum" de.', invalidmail: 'Geçerli bir e-posta yaz.', net: 'Bağlantı kurulamadı, birazdan tekrar dene.', confirm: 'Onay e-postası gönderildi. E-postandaki bağlantıya tıkla, sonra giriş yap.', nogoogle: 'Google ile giriş henüz açık değil.', limit: 'Çok fazla deneme, biraz bekleyip tekrar dene.', name: 'Adın veya kullanıcı adın', pass2: 'Şifre', passup: 'Şifre (en az 8 karakter)', passre: 'Şifreyi tekrar yaz', show: 'Göster', hide: 'Gizle', r8: 'En az 8 karakter', rl: 'Harf içeriyor', rd: 'Rakam içeriyor', rm: 'Şifreler aynı', noname: 'Adını yaz (en az 2 karakter).', weakup: 'Şifre en az 8 karakter olmalı, harf ve rakam içermeli.', nomatch: 'Şifreler aynı değil.', noterms: 'Devam etmek için onay kutusunu işaretle.', terms: '18 yaşından büyüğüm; Simuleto’nun bahis yaptırmayan bir simülatör olduğunu biliyorum.', googleup: 'Google ile kayıt ol', forgot: 'Şifremi unuttum', vt: 'E-postanı doğrula', vd: 'Hesabını etkinleştirmek için şu adrese bir doğrulama bağlantısı gönderdik:', vs: 'E-postandaki bağlantıya tıkla; hesabın açılır ve otomatik giriş yaparsın. Gelmediyse spam/gereksiz klasörüne bak. Bu adresle daha önce kayıt olduysan mail gönderilmez: giriş yap ya da Şifremi unuttum de.', resend: 'E-postayı tekrar gönder', resendin: 'Tekrar gönder ({n} sn)', sent: 'Doğrulama e-postası tekrar gönderildi.', other: 'Farklı e-posta kullan', back: 'Giriş ekranına dön', ft: 'Şifreni sıfırla', fd: 'Hesabının e-posta adresini yaz, şifre sıfırlama bağlantısı gönderelim.', fsend: 'Sıfırlama bağlantısı gönder', fsent: 'Bağlantı gönderildi. E-postandaki bağlantıya tıklayıp yeni şifreni belirle.', nt: 'Yeni şifre belirle', nd: 'Hesabın için yeni bir şifre yaz.', nsave: 'Şifreyi kaydet', pwdone: 'Şifren değişti. Şimdi yeni şifrenle giriş yapabilirsin.', nok: 'Şifren güncellendi.', confirmin: 'E-posta adresin henüz doğrulanmadı. E-postandaki bağlantıya tıkla.' },
    en: { noacc: "No account?", haveacc: "Already have an account?", title: 'Sign in or create an account', hint: 'When you sign in, your slips and favourites are saved to your account and stay with you if you change phones.', guest: "You're a guest right now: your slips and favourites stay on this device only.", email: 'Email', pass: 'Password (at least 6 characters)', signin: 'Sign in', signup: 'Create account', google: 'Continue with Google', or: 'or', wait: 'Please wait…', signedin: 'Signed in', signedin2: 'Signed in. Two small settings and you are done.', own: 'Your slips, favourites and settings belong only to you.', bad: 'Wrong email or password.', weak: 'Password must be at least 6 characters.', exists: 'This email is already registered, try signing in.', invalidmail: 'Enter a valid email.', net: 'Could not connect, try again shortly.', confirm: 'A confirmation email was sent. Click the link in it, then sign in.', nogoogle: 'Google sign-in is not enabled yet.', limit: 'Too many attempts, wait a bit and try again.' },
    es: { noacc: "¿No tienes cuenta?", haveacc: "¿Ya tienes cuenta?", title: 'Inicia sesión o crea una cuenta', hint: 'Al iniciar sesión, tus boletos y favoritos se guardan en tu cuenta y no se pierden si cambias de teléfono.', guest: 'Ahora eres invitado: tus boletos y favoritos solo se guardan en este dispositivo.', email: 'Correo electrónico', pass: 'Contraseña (mínimo 6 caracteres)', signin: 'Iniciar sesión', signup: 'Crear cuenta', google: 'Continuar con Google', or: 'o', wait: 'Espera…', signedin: 'Sesión iniciada', signedin2: 'Sesión iniciada. Solo dos ajustes pequeños.', own: 'Tus boletos, favoritos y ajustes son solo tuyos.', bad: 'Correo o contraseña incorrectos.', weak: 'La contraseña debe tener al menos 6 caracteres.', exists: 'Este correo ya está registrado, prueba a iniciar sesión.', invalidmail: 'Escribe un correo válido.', net: 'No se pudo conectar, inténtalo de nuevo en un momento.', confirm: 'Se envió un correo de confirmación. Pulsa el enlace y luego inicia sesión.', nogoogle: 'El acceso con Google aún no está activado.', limit: 'Demasiados intentos, espera un poco e inténtalo de nuevo.' },
    pt: { noacc: "Não tem conta?", haveacc: "Já tem conta?", title: 'Entre ou crie uma conta', hint: 'Ao entrar, seus bilhetes e favoritos ficam salvos na sua conta e não se perdem se você trocar de celular.', guest: 'Você é convidado agora: seus bilhetes e favoritos ficam salvos apenas neste dispositivo.', email: 'E-mail', pass: 'Senha (mínimo de 6 caracteres)', signin: 'Entrar', signup: 'Criar conta', google: 'Continuar com o Google', or: 'ou', wait: 'Aguarde…', signedin: 'Login feito', signedin2: 'Login feito. Faltam só dois ajustes pequenos.', own: 'Seus bilhetes, favoritos e ajustes são só seus.', bad: 'E-mail ou senha incorretos.', weak: 'A senha deve ter pelo menos 6 caracteres.', exists: 'Este e-mail já está cadastrado, tente entrar.', invalidmail: 'Digite um e-mail válido.', net: 'Não foi possível conectar, tente novamente em instantes.', confirm: 'Enviamos um e-mail de confirmação. Clique no link e depois entre.', nogoogle: 'O login com o Google ainda não está ativado.', limit: 'Muitas tentativas, aguarde um pouco e tente de novo.' },
    de: { noacc: "Kein Konto?", haveacc: "Schon ein Konto?", title: 'Anmelden oder Konto erstellen', hint: 'Nach der Anmeldung werden deine Wettscheine und Favoriten in deinem Konto gespeichert und bleiben bei einem Handywechsel erhalten.', guest: 'Du bist gerade Gast: Deine Wettscheine und Favoriten bleiben nur auf diesem Gerät.', email: 'E-Mail', pass: 'Passwort (mindestens 6 Zeichen)', signin: 'Anmelden', signup: 'Konto erstellen', google: 'Weiter mit Google', or: 'oder', wait: 'Bitte warten…', signedin: 'Angemeldet', signedin2: 'Angemeldet. Nur noch zwei kleine Einstellungen.', own: 'Deine Wettscheine, Favoriten und Einstellungen gehören nur dir.', bad: 'E-Mail oder Passwort falsch.', weak: 'Das Passwort muss mindestens 6 Zeichen haben.', exists: 'Diese E-Mail ist bereits registriert, versuche dich anzumelden.', invalidmail: 'Gib eine gültige E-Mail ein.', net: 'Verbindung fehlgeschlagen, versuche es gleich noch einmal.', confirm: 'Eine Bestätigungs-E-Mail wurde gesendet. Klicke auf den Link und melde dich dann an.', nogoogle: 'Die Anmeldung mit Google ist noch nicht aktiviert.', limit: 'Zu viele Versuche, warte kurz und versuche es erneut.' },
    it: { noacc: "Non hai un account?", haveacc: "Hai già un account?", title: 'Accedi o crea un account', hint: "Quando accedi, le tue schedine e i preferiti vengono salvati nel tuo account e non si perdono se cambi telefono.", guest: 'Ora sei ospite: le tue schedine e i preferiti restano solo su questo dispositivo.', email: 'E-mail', pass: 'Password (almeno 6 caratteri)', signin: 'Accedi', signup: 'Crea account', google: 'Continua con Google', or: 'oppure', wait: 'Attendi…', signedin: 'Accesso effettuato', signedin2: 'Accesso effettuato. Bastano due piccole impostazioni.', own: 'Le tue schedine, i preferiti e le impostazioni sono solo tuoi.', bad: 'E-mail o password errate.', weak: 'La password deve avere almeno 6 caratteri.', exists: "Questa e-mail è già registrata, prova ad accedere.", invalidmail: "Inserisci un'e-mail valida.", net: 'Impossibile connettersi, riprova tra poco.', confirm: 'È stata inviata un\'e-mail di conferma. Clicca sul link e poi accedi.', nogoogle: "L'accesso con Google non è ancora attivo.", limit: 'Troppi tentativi, attendi un po\' e riprova.' },
    fr: { noacc: "Pas de compte ?", haveacc: "Déjà un compte ?", title: 'Connecte-toi ou crée un compte', hint: 'Une fois connecté, tes coupons et favoris sont enregistrés sur ton compte et ne se perdent pas si tu changes de téléphone.', guest: 'Tu es invité pour le moment : tes coupons et favoris restent uniquement sur cet appareil.', email: 'E-mail', pass: 'Mot de passe (6 caractères minimum)', signin: 'Se connecter', signup: 'Créer un compte', google: 'Continuer avec Google', or: 'ou', wait: 'Patiente…', signedin: 'Connecté', signedin2: 'Connecté. Il ne reste que deux petits réglages.', own: 'Tes coupons, favoris et réglages ne sont qu\'à toi.', bad: 'E-mail ou mot de passe incorrect.', weak: 'Le mot de passe doit contenir au moins 6 caractères.', exists: 'Cet e-mail est déjà enregistré, essaie de te connecter.', invalidmail: 'Saisis un e-mail valide.', net: 'Connexion impossible, réessaie dans un instant.', confirm: 'Un e-mail de confirmation a été envoyé. Clique sur le lien puis connecte-toi.', nogoogle: "La connexion avec Google n'est pas encore activée.", limit: 'Trop de tentatives, attends un peu et réessaie.' }
  };
  var A = { msg: C.lastError || '', email: '', busy: false };
  function t(k) { var d = T[window.LANG] || T.tr; return d[k] || T.tr[k] || k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  A.t = t;
  A.mode = C.recovery ? "newpw" : "in";
  var GL = "<svg width='18' height='18' viewBox='0 0 48 48' aria-hidden='true'><path fill='#FFC107' d='M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z'/><path fill='#FF3D00' d='m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z'/><path fill='#4CAF50' d='M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z'/><path fill='#1976D2' d='M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z'/></svg>";
  var IC = {
    k: "<svg viewBox=\"0 0 24 24\"><path d=\"M6 3h12v18l-3-2-3 2-3-2-3 2z\"/><path d=\"M9 8h6M9 12h6\"/></svg>",
    s: "<svg viewBox=\"0 0 24 24\"><path d=\"m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z\"/></svg>",
    d: "<svg viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"4\" width=\"13\" height=\"10\" rx=\"2\"/><rect x=\"15\" y=\"9\" width=\"6\" height=\"11\" rx=\"1.5\"/><path d=\"M7 18h6\"/></svg>",
    c: "<svg viewBox=\"0 0 24 24\"><path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/></svg>"
  };
  var FT = [["k", "f1"], ["s", "f2"], ["d", "f3"], ["c", "f4"]];
  function feats(cls) { return "<ul class=\"" + cls + "\">" + FT.map(function (f) { return "<li><i>" + IC[f[0]] + "</i><div><b>" + esc(t(f[1] + "t")) + "</b><span>" + esc(t(f[1] + "d")) + "</span></div></li>"; }).join("") + "</ul>"; }
  function msg() { return A.msg ? "<div class=\"kau-msg" + (A.ok ? " ok" : "") + "\">" + esc(t(A.msg)) + "</div>" : ""; }
  function inp(id, type, ac, ph, v) { return "<input id=\"" + id + "\" type=\"" + type + "\" autocomplete=\"" + ac + "\"" + (type === 'email' ? " inputmode=\"email\"" : "") + " placeholder=\"" + esc(ph) + "\"" + (v ? " value=\"" + esc(v) + "\"" : "") + ">"; }
  function pwf(id, ac, ph) { return "<div class=\"kau-pw\">" + inp(id, A.show ? 'text' : 'password', ac, ph) + "<button type=\"button\" class=\"kau-eye\" data-kaeye=\"1\">" + esc(t(A.show ? 'hide' : 'show')) + "</button></div>"; }
  function btn(id, k) { return "<button class=\"kau-p\" id=\"" + id + "\"" + (A.busy ? " disabled" : "") + ">" + esc(A.busy ? t("wait") : t(k)) + "</button>"; }
  function lnk(m, k) { return "<button type=\"button\" class=\"kau-l\" data-kamode=\"" + m + "\">" + esc(t(k)) + "</button>"; }
  function foot() { return "<div class=\"kau-ft\">" + esc(t("foot")) + "</div>"; }
  function rules() {
    return "<ul class=\"kau-rl\" id=\"karl\">" + [['r8', 'a'], ['rl', 'b'], ['rd', 'c'], ['rm', 'd']].map(function (r) { return "<li data-r=\"" + r[1] + "\">" + esc(t(r[0])) + "</li>"; }).join('') + "</ul>";
  }
  function pwOk(p) { return { a: p.length >= 8, b: /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(p), c: /\d/.test(p) }; }
  function rulesLive() {
    var p = val('kap'), p2 = val('kap2'), o = pwOk(p); o.d = !!p && p === p2;
    var ul = document.getElementById('karl'); if (!ul) return;
    [].forEach.call(ul.children, function (li) { li.className = o[li.getAttribute('data-r')] ? 'ok' : ''; });
  }
  function form() {
    var up = A.mode === "up", dis = A.busy ? " disabled" : "";
    if (A.mode === 'verify') {
      var cd = Math.max(0, Math.ceil(((A.cool || 0) - Date.now()) / 1000));
      return "<div class=\"kau-v\"><div class=\"kau-vi\">✉</div><h3>" + esc(t('vt')) + "</h3><p>" + esc(t('vd')) + "</p><b class=\"kau-ve\">" + esc(A.email) + "</b><p>" + esc(t('vs')) + "</p>" + msg() +
        "<button class=\"kau-p\" id=\"kab_rs\"" + (A.busy || cd ? " disabled" : "") + ">" + esc(cd ? t('resendin').replace('{n}', cd) : t('resend')) + "</button>" +
        "<div class=\"kau-links\">" + lnk('up', 'other') + lnk('in', 'back') + lnk('forgot', 'forgot') + "</div></div>" + foot();
    }
    if (A.mode === 'forgot') {
      return "<h3 class=\"kau-h\">" + esc(t('ft')) + "</h3><p class=\"kau-d\">" + esc(t('fd')) + "</p>" + inp('kae', 'email', 'email', t('email'), A.email) + msg() + btn('kab_fp', 'fsend') +
        "<div class=\"kau-links\">" + lnk('in', 'back') + "</div>" + foot();
    }
    if (A.mode === 'newpw') {
      return "<h3 class=\"kau-h\">" + esc(t('nt')) + "</h3><p class=\"kau-d\">" + esc(t('nd')) + "</p>" + pwf('kap', 'new-password', t('passup')) + inp('kap2', A.show ? 'text' : 'password', 'new-password', t('passre')) + rules() + msg() + btn('kab_np', 'nsave') + foot();
    }
    var h = "<div class=\"kau-tabs\"><button id=\"kab_tin\" class=\"" + (up ? "" : "on") + "\" type=\"button\">" + esc(t("signin")) + "</button><button id=\"kab_tup\" class=\"" + (up ? "on" : "") + "\" type=\"button\">" + esc(t("signup")) + "</button></div>" +
      "<button class=\"kau-g\" id=\"kab_g\"" + dis + ">" + GL + "<span>" + esc(t(up ? "googleup" : "google")) + "</span></button>" +
      "<div class=\"kau-or\"><span>" + esc(t("or")) + "</span></div>";
    if (up) {
      h += inp('kan', 'text', 'nickname', t('name'), A.name) + inp('kae', 'email', 'email', t('email'), A.email) + pwf('kap', 'new-password', t('passup')) + inp('kap2', A.show ? 'text' : 'password', 'new-password', t('passre')) + rules() +
        "<label class=\"kau-cb\"><input type=\"checkbox\" id=\"kat\"" + (A.terms ? " checked" : "") + "><span>" + esc(t('terms')) + "</span></label>" + msg() + (A.msg === 'exists' ? "<div class=\"kau-links\">" + lnk('in', 'signin') + lnk('forgot', 'forgot') + "</div>" : "") + btn('kab_go', 'signup');
    } else {
      h += inp('kae', 'email', 'email', t('email'), A.email) + pwf('kap', 'current-password', t('pass2')) +
        "<div class=\"kau-links r\">" + lnk('forgot', 'forgot') + "</div>" + msg() +
        (A.msg === 'confirmin' ? "<button type=\"button\" class=\"kau-l kau-rs2\" id=\"kab_rs\">" + esc(t('resend')) + "</button>" : "") + btn('kab_go', 'signin');
    }
    return h + foot();
  }
  var WM = "<b class=\"wm kau-wm\">simulet<svg class=\"o\" viewBox=\"44 44 424 424\" aria-hidden=\"true\"><use href=\"#kmball\"/></svg></b>";
  A.card = function (pbx) {
    return "<div class=\"kau kau-a box\"><div class=\"kau-side\">" + WM + "<h2>" + esc(t("welcome")) + "</h2><p>" + esc(t("hint")) + "</p>" + feats("kau-list") + "</div><div class=\"kau-main\">" + form() + "</div></div>";
  };

  // yeniden cizimde yazilan sifreler silinmesin
  function redraw() { var p = val('kap'), p2 = val('kap2'); try { profDraw(); } catch (e) {} var a = document.getElementById('kap'), b = document.getElementById('kap2'); if (a && p) a.value = p; if (b && p2) b.value = p2; rulesLive(); }
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

  function val(id) { var e = document.getElementById(id); return (e && e.value) || ''; }
  function keep() { if (document.getElementById('kae')) A.email = val('kae').trim(); if (document.getElementById('kan')) A.name = val('kan').trim().slice(0, 30); var c = document.getElementById('kat'); if (c) A.terms = c.checked; }
  function fail(k) { A.msg = k; A.ok = false; redraw(); }
  var MAILRE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  async function act(kind) {
    keep();
    var pw = val('kap'), up = kind === 'up';
    if (up && (A.name || '').length < 2) return fail('noname');
    if (!MAILRE.test(A.email)) return fail('invalidmail');
    if (up) { var o = pwOk(pw); if (!(o.a && o.b && o.c)) return fail('weakup'); if (pw !== val('kap2')) return fail('nomatch'); if (!A.terms) return fail('noterms'); }
    else if (pw.length < 6) return fail('weak');
    A.busy = true; A.msg = ''; redraw();
    var r;
    try { r = up ? await C.signUp(A.email, pw, A.name) : await C.signIn(A.email, pw); }
    catch (err) { r = { error: 'net' }; }
    A.busy = false;
    if (r.error) return fail(r.error === 'confirm' ? 'confirmin' : r.error);
    if (r.needsConfirm) { A.mode = 'verify'; A.msg = ''; A.cool = Date.now() + 60000; tick(); redraw(); return; }
    A.msg = ''; A.email = ''; A.name = ''; A.terms = false; A.mode = 'in';
    await A.afterLogin();
  }
  function tick() { clearInterval(A.ti); A.ti = setInterval(function () { if (A.mode !== 'verify') { clearInterval(A.ti); return; } if (Date.now() > A.cool + 1000) clearInterval(A.ti); var b = document.getElementById('kab_rs'); if (b) redraw(); }, 1000); }
  async function resend() {
    keep(); if (!MAILRE.test(A.email)) return fail('invalidmail');
    A.busy = true; redraw(); var r; try { r = await C.resend(A.email); } catch (e) { r = { error: 'net' }; } A.busy = false;
    if (r.error) return fail(r.error);
    A.mode = 'verify'; A.msg = 'sent'; A.ok = true; A.cool = Date.now() + 60000; tick(); redraw();
  }
  async function forgot() {
    keep(); if (!MAILRE.test(A.email)) return fail('invalidmail');
    A.busy = true; redraw(); var r; try { r = await C.recover(A.email); } catch (e) { r = { error: 'net' }; } A.busy = false;
    if (r.error) return fail(r.error);
    A.msg = 'fsent'; A.ok = true; redraw();
  }
  async function newpw() {
    var pw = val('kap'), o = pwOk(pw);
    if (!(o.a && o.b && o.c)) return fail('weakup'); if (pw !== val('kap2')) return fail('nomatch');
    A.busy = true; redraw(); var r; try { r = await C.updatePw(pw); } catch (e) { r = { error: 'net' }; } A.busy = false;
    if (r.error) return fail(r.error);
    // yeni sifre kaydedildi: oturumu kapat, ayni e-postayla giris ekranina don
    var em = (C.user() || {}).email || '';
    C.recovery = false; C.signOut(); A.mode = 'in'; A.email = em; A.show = false; A.msg = 'pwdone'; A.ok = true;
    await A.afterLogin();
  }
  A.bind = function () {
    var g = function (id) { return document.getElementById(id); };
    if (g('kab_go')) g('kab_go').onclick = function () { act(A.mode); };
    if (g('kab_rs')) g('kab_rs').onclick = resend;
    if (g('kab_fp')) g('kab_fp').onclick = forgot;
    if (g('kab_np')) g('kab_np').onclick = newpw;
    ['kap', 'kap2'].forEach(function (id) { var el = g(id); if (el) el.addEventListener('input', rulesLive); });
    rulesLive();
    [].forEach.call(document.querySelectorAll('[data-kamode]'), function (el) { el.onclick = function () { keep(); A.mode = el.getAttribute('data-kamode'); A.msg = ''; redraw(); }; });
    [].forEach.call(document.querySelectorAll('[data-kaeye]'), function (el) { el.onclick = function () { keep(); var p = val('kap'), p2 = val('kap2'); A.show = !A.show; redraw(); var a = g('kap'), b = g('kap2'); if (a) a.value = p; if (b) b.value = p2; rulesLive(); }; });
    [['kab_tin', 'in'], ['kab_tup', 'up']].forEach(function (x) { var el = g(x[0]); if (el) el.onclick = function () { if (A.mode === x[1]) return; keep(); A.mode = x[1]; A.msg = ''; redraw(); }; });
    if (g('kab_sw')) g('kab_sw').onclick = function () { var e = g('kae'); if (e) A.email = e.value.trim(); A.mode = A.mode === 'up' ? 'in' : 'up'; A.msg = ''; redraw(); };
    if (g('kab_g')) {
      var gb = g('kab_g'), gis = false;
      gb.onclick = function () { if (!gis) C.google(); };
      var wrap = gb.parentNode, ov = document.createElement('div');
      ov.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;opacity:.011;overflow:hidden;z-index:2';
      var hold = document.createElement('div'); hold.style.position = 'relative'; wrap.insertBefore(hold, gb); hold.appendChild(gb); hold.appendChild(ov);
      C.googleBtn(ov, async function (ok, er) {
        if (ok) { await A.afterLogin(); } else { A.msg = er || 'net'; redraw(); }
      }).then(function (r) { if (r) gis = true; else ov.remove(); });
    }
    ['kan', 'kae', 'kap', 'kap2'].forEach(function (id) { var el = g(id); if (el) el.onkeydown = function (ev) { if (ev.key !== 'Enter') return; if (A.mode === 'in' || A.mode === 'up') act(A.mode); else if (A.mode === 'forgot') forgot(); else if (A.mode === 'newpw') newpw(); }; });
  };
  window.KMAUTH = A;
})();
