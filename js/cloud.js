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
    tr: { welcome: "Hoş geldin", f1t: "Kupon simülasyonların", f1d: "Kurduğun her kupon hesabında saklanır, sonucu otomatik işlenir.", f2t: "Favori takımların", f2d: "Takip ettiğin takımlar her açılışta hazır bekler.", f3t: "Her cihazda aynı", f3d: "Telefonda kur, bilgisayarda devam et.", f4t: "Kendi istatistiğin", f4d: "Tuttu / tutmadı oranını ve netini gör.", foot: "Simuleto bir simülatördür, bahis yaptırmaz. Hiçbir bahis risksiz değildir.", noacc: "Hesabın yok mu?", haveacc: "Zaten hesabın var mı?", title: 'Giriş yap veya hesap oluştur', hint: 'Giriş yaparsan kuponların ve favorilerin hesabında saklanır, cihaz değiştirsen de kaybolmaz.', guest: 'Şu an misafirsin: kuponların ve favorilerin yalnızca bu cihazda durur.', email: 'E-posta', pass: 'Şifre (en az 6 karakter)', signin: 'Giriş yap', signup: 'Hesap oluştur', google: 'Google ile giriş', or: 'veya', wait: 'Bekle…', signedin: 'Giriş yapıldı', signedin2: 'Giriş yapıldı. İki küçük ayar yeter.', own: 'Kuponların, favorilerin ve ayarların yalnızca sana aittir.', bad: 'E-posta veya şifre hatalı.', weak: 'Şifre en az 6 karakter olmalı.', exists: 'Bu e-posta zaten kayıtlı, giriş yapmayı dene.', invalidmail: 'Geçerli bir e-posta yaz.', net: 'Bağlantı kurulamadı, birazdan tekrar dene.', confirm: 'Onay e-postası gönderildi. E-postandaki bağlantıya tıkla, sonra giriş yap.', nogoogle: 'Google ile giriş henüz açık değil.', limit: 'Çok fazla deneme, biraz bekleyip tekrar dene.' },
    en: { welcome: "Welcome", f1t: "Your slip simulations", f1d: "Every slip you build is saved to your account and settled automatically.", f2t: "Your favourite teams", f2d: "The teams you follow are ready every time you open the app.", f3t: "Same on every device", f3d: "Build on your phone, continue on your computer.", f4t: "Your own stats", f4d: "See your won / lost ratio and your net.", foot: "Simuleto is a simulator and takes no bets. No bet is ever risk-free.", noacc: "No account?", haveacc: "Already have an account?", title: 'Sign in or create an account', hint: 'When you sign in, your slips and favourites are saved to your account and stay with you if you change phones.', guest: "You're a guest right now: your slips and favourites stay on this device only.", email: 'Email', pass: 'Password (at least 6 characters)', signin: 'Sign in', signup: 'Create account', google: 'Continue with Google', or: 'or', wait: 'Please wait…', signedin: 'Signed in', signedin2: 'Signed in. Two small settings and you are done.', own: 'Your slips, favourites and settings belong only to you.', bad: 'Wrong email or password.', weak: 'Password must be at least 6 characters.', exists: 'This email is already registered, try signing in.', invalidmail: 'Enter a valid email.', net: 'Could not connect, try again shortly.', confirm: 'A confirmation email was sent. Click the link in it, then sign in.', nogoogle: 'Google sign-in is not enabled yet.', limit: 'Too many attempts, wait a bit and try again.' },
    es: { welcome: "Bienvenido", f1t: "Tus simulaciones de boletos", f1d: "Cada boleto que creas se guarda en tu cuenta y se resuelve automáticamente.", f2t: "Tus equipos favoritos", f2d: "Los equipos que sigues te esperan cada vez que entras.", f3t: "Igual en todos tus dispositivos", f3d: "Créalo en el móvil y sigue en el ordenador.", f4t: "Tus propias estadísticas", f4d: "Consulta tu ratio de acertados / fallados y tu neto.", foot: "Simuleto es un simulador y no acepta apuestas. Ninguna apuesta está libre de riesgo.", noacc: "¿No tienes cuenta?", haveacc: "¿Ya tienes cuenta?", title: 'Inicia sesión o crea una cuenta', hint: 'Al iniciar sesión, tus boletos y favoritos se guardan en tu cuenta y no se pierden si cambias de teléfono.', guest: 'Ahora eres invitado: tus boletos y favoritos solo se guardan en este dispositivo.', email: 'Correo electrónico', pass: 'Contraseña (mínimo 6 caracteres)', signin: 'Iniciar sesión', signup: 'Crear cuenta', google: 'Continuar con Google', or: 'o', wait: 'Espera…', signedin: 'Sesión iniciada', signedin2: 'Sesión iniciada. Solo dos ajustes pequeños.', own: 'Tus boletos, favoritos y ajustes son solo tuyos.', bad: 'Correo o contraseña incorrectos.', weak: 'La contraseña debe tener al menos 6 caracteres.', exists: 'Este correo ya está registrado, prueba a iniciar sesión.', invalidmail: 'Escribe un correo válido.', net: 'No se pudo conectar, inténtalo de nuevo en un momento.', confirm: 'Se envió un correo de confirmación. Pulsa el enlace y luego inicia sesión.', nogoogle: 'El acceso con Google aún no está activado.', limit: 'Demasiados intentos, espera un poco e inténtalo de nuevo.' },
    pt: { welcome: "Bem-vindo", f1t: "Suas simulações de bilhetes", f1d: "Cada bilhete que você monta fica salvo na sua conta e é resolvido automaticamente.", f2t: "Seus times favoritos", f2d: "Os times que você segue ficam prontos sempre que você abre o app.", f3t: "Igual em todos os dispositivos", f3d: "Monte no celular, continue no computador.", f4t: "Suas próprias estatísticas", f4d: "Veja sua taxa de acertos / erros e seu saldo.", foot: "O Simuleto é um simulador e não aceita apostas. Nenhuma aposta é livre de risco.", noacc: "Não tem conta?", haveacc: "Já tem conta?", title: 'Entre ou crie uma conta', hint: 'Ao entrar, seus bilhetes e favoritos ficam salvos na sua conta e não se perdem se você trocar de celular.', guest: 'Você é convidado agora: seus bilhetes e favoritos ficam salvos apenas neste dispositivo.', email: 'E-mail', pass: 'Senha (mínimo de 6 caracteres)', signin: 'Entrar', signup: 'Criar conta', google: 'Continuar com o Google', or: 'ou', wait: 'Aguarde…', signedin: 'Login feito', signedin2: 'Login feito. Faltam só dois ajustes pequenos.', own: 'Seus bilhetes, favoritos e ajustes são só seus.', bad: 'E-mail ou senha incorretos.', weak: 'A senha deve ter pelo menos 6 caracteres.', exists: 'Este e-mail já está cadastrado, tente entrar.', invalidmail: 'Digite um e-mail válido.', net: 'Não foi possível conectar, tente novamente em instantes.', confirm: 'Enviamos um e-mail de confirmação. Clique no link e depois entre.', nogoogle: 'O login com o Google ainda não está ativado.', limit: 'Muitas tentativas, aguarde um pouco e tente de novo.' },
    de: { welcome: "Willkommen", f1t: "Deine Wettschein-Simulationen", f1d: "Jeder Wettschein wird in deinem Konto gespeichert und automatisch ausgewertet.", f2t: "Deine Lieblingsteams", f2d: "Die Teams, denen du folgst, sind bei jedem Öffnen bereit.", f3t: "Auf jedem Gerät gleich", f3d: "Am Handy erstellen, am Computer weitermachen.", f4t: "Deine eigene Statistik", f4d: "Sieh deine Treffer- / Fehlquote und dein Netto.", foot: "Simuleto ist ein Simulator und nimmt keine Wetten an. Keine Wette ist risikofrei.", noacc: "Kein Konto?", haveacc: "Schon ein Konto?", title: 'Anmelden oder Konto erstellen', hint: 'Nach der Anmeldung werden deine Wettscheine und Favoriten in deinem Konto gespeichert und bleiben bei einem Handywechsel erhalten.', guest: 'Du bist gerade Gast: Deine Wettscheine und Favoriten bleiben nur auf diesem Gerät.', email: 'E-Mail', pass: 'Passwort (mindestens 6 Zeichen)', signin: 'Anmelden', signup: 'Konto erstellen', google: 'Weiter mit Google', or: 'oder', wait: 'Bitte warten…', signedin: 'Angemeldet', signedin2: 'Angemeldet. Nur noch zwei kleine Einstellungen.', own: 'Deine Wettscheine, Favoriten und Einstellungen gehören nur dir.', bad: 'E-Mail oder Passwort falsch.', weak: 'Das Passwort muss mindestens 6 Zeichen haben.', exists: 'Diese E-Mail ist bereits registriert, versuche dich anzumelden.', invalidmail: 'Gib eine gültige E-Mail ein.', net: 'Verbindung fehlgeschlagen, versuche es gleich noch einmal.', confirm: 'Eine Bestätigungs-E-Mail wurde gesendet. Klicke auf den Link und melde dich dann an.', nogoogle: 'Die Anmeldung mit Google ist noch nicht aktiviert.', limit: 'Zu viele Versuche, warte kurz und versuche es erneut.' },
    it: { welcome: "Benvenuto", f1t: "Le tue simulazioni di schedine", f1d: "Ogni schedina che crei viene salvata nel tuo account e risolta automaticamente.", f2t: "Le tue squadre preferite", f2d: "Le squadre che segui sono pronte ogni volta che apri l'app.", f3t: "Uguale su ogni dispositivo", f3d: "Creala sul telefono, continua sul computer.", f4t: "Le tue statistiche", f4d: "Vedi il rapporto vinte / perse e il tuo saldo netto.", foot: "Simuleto è un simulatore e non accetta scommesse. Nessuna scommessa è priva di rischi.", noacc: "Non hai un account?", haveacc: "Hai già un account?", title: 'Accedi o crea un account', hint: "Quando accedi, le tue schedine e i preferiti vengono salvati nel tuo account e non si perdono se cambi telefono.", guest: 'Ora sei ospite: le tue schedine e i preferiti restano solo su questo dispositivo.', email: 'E-mail', pass: 'Password (almeno 6 caratteri)', signin: 'Accedi', signup: 'Crea account', google: 'Continua con Google', or: 'oppure', wait: 'Attendi…', signedin: 'Accesso effettuato', signedin2: 'Accesso effettuato. Bastano due piccole impostazioni.', own: 'Le tue schedine, i preferiti e le impostazioni sono solo tuoi.', bad: 'E-mail o password errate.', weak: 'La password deve avere almeno 6 caratteri.', exists: "Questa e-mail è già registrata, prova ad accedere.", invalidmail: "Inserisci un'e-mail valida.", net: 'Impossibile connettersi, riprova tra poco.', confirm: 'È stata inviata un\'e-mail di conferma. Clicca sul link e poi accedi.', nogoogle: "L'accesso con Google non è ancora attivo.", limit: 'Troppi tentativi, attendi un po\' e riprova.' },
    fr: { welcome: "Bienvenue", f1t: "Tes simulations de coupons", f1d: "Chaque coupon que tu crées est enregistré sur ton compte et réglé automatiquement.", f2t: "Tes équipes favorites", f2d: "Les équipes que tu suis t'attendent à chaque ouverture.", f3t: "Identique sur tous tes appareils", f3d: "Crée sur ton téléphone, continue sur ton ordinateur.", f4t: "Tes propres statistiques", f4d: "Vois ton taux de gagnés / perdus et ton bilan net.", foot: "Simuleto est un simulateur et ne prend aucun pari. Aucun pari n'est sans risque.", noacc: "Pas de compte ?", haveacc: "Déjà un compte ?", title: 'Connecte-toi ou crée un compte', hint: 'Une fois connecté, tes coupons et favoris sont enregistrés sur ton compte et ne se perdent pas si tu changes de téléphone.', guest: 'Tu es invité pour le moment : tes coupons et favoris restent uniquement sur cet appareil.', email: 'E-mail', pass: 'Mot de passe (6 caractères minimum)', signin: 'Se connecter', signup: 'Créer un compte', google: 'Continuer avec Google', or: 'ou', wait: 'Patiente…', signedin: 'Connecté', signedin2: 'Connecté. Il ne reste que deux petits réglages.', own: 'Tes coupons, favoris et réglages ne sont qu\'à toi.', bad: 'E-mail ou mot de passe incorrect.', weak: 'Le mot de passe doit contenir au moins 6 caractères.', exists: 'Cet e-mail est déjà enregistré, essaie de te connecter.', invalidmail: 'Saisis un e-mail valide.', net: 'Connexion impossible, réessaie dans un instant.', confirm: 'Un e-mail de confirmation a été envoyé. Clique sur le lien puis connecte-toi.', nogoogle: "La connexion avec Google n'est pas encore activée.", limit: 'Trop de tentatives, attends un peu et réessaie.' }
  };
  var A = { msg: C.lastError || '', email: '', busy: false };
  function t(k) { var d = T[window.LANG] || T.tr; return d[k] || T.tr[k] || k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  A.t = t;
  A.mode = "in";
  var GL = "<svg width='18' height='18' viewBox='0 0 48 48' aria-hidden='true'><path fill='#FFC107' d='M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z'/><path fill='#FF3D00' d='m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z'/><path fill='#4CAF50' d='M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z'/><path fill='#1976D2' d='M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z'/></svg>";
  var IC = {
    k: "<svg viewBox=\"0 0 24 24\"><path d=\"M6 3h12v18l-3-2-3 2-3-2-3 2z\"/><path d=\"M9 8h6M9 12h6\"/></svg>",
    s: "<svg viewBox=\"0 0 24 24\"><path d=\"m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z\"/></svg>",
    d: "<svg viewBox=\"0 0 24 24\"><rect x=\"3\" y=\"4\" width=\"13\" height=\"10\" rx=\"2\"/><rect x=\"15\" y=\"9\" width=\"6\" height=\"11\" rx=\"1.5\"/><path d=\"M7 18h6\"/></svg>",
    c: "<svg viewBox=\"0 0 24 24\"><path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/></svg>"
  };
  var FT = [["k", "f1"], ["s", "f2"], ["d", "f3"], ["c", "f4"]];
  function feats(cls) { return "<ul class=\"" + cls + "\">" + FT.map(function (f) { return "<li><i>" + IC[f[0]] + "</i><div><b>" + esc(t(f[1] + "t")) + "</b><span>" + esc(t(f[1] + "d")) + "</span></div></li>"; }).join("") + "</ul>"; }
  function form() {
    var up = A.mode === "up", dis = A.busy ? " disabled" : "";
    var m = A.msg ? "<div class=\"kau-msg\">" + esc(t(A.msg)) + "</div>" : "";
    return "<div class=\"kau-tabs\"><button id=\"kab_tin\" class=\"" + (up ? "" : "on") + "\" type=\"button\">" + esc(t("signin")) + "</button><button id=\"kab_tup\" class=\"" + (up ? "on" : "") + "\" type=\"button\">" + esc(t("signup")) + "</button></div>" +
      "<button class=\"kau-g\" id=\"kab_g\"" + dis + ">" + GL + "<span>" + esc(t("google")) + "</span></button>" +
      "<div class=\"kau-or\"><span>" + esc(t("or")) + "</span></div>" +
      "<input id=\"kae\" type=\"email\" autocomplete=\"email\" inputmode=\"email\" placeholder=\"" + esc(t("email")) + "\" value=\"" + esc(A.email) + "\">" +
      "<input id=\"kap\" type=\"password\" autocomplete=\"" + (up ? "new-password" : "current-password") + "\" placeholder=\"" + esc(t("pass")) + "\">" + m +
      "<button class=\"kau-p\" id=\"kab_go\"" + dis + ">" + esc(A.busy ? t("wait") : t(up ? "signup" : "signin")) + "</button>" +
      "<div class=\"kau-ft\">" + esc(t("foot")) + "</div>";
  }
  var WM = "<b class=\"wm kau-wm\">simulet<svg class=\"o\" viewBox=\"44 44 424 424\" aria-hidden=\"true\"><use href=\"#kmball\"/></svg></b>";
  A.card = function (pbx) {
    return "<div class=\"kau kau-a box\"><div class=\"kau-side\">" + WM + "<h2>" + esc(t("welcome")) + "</h2><p>" + esc(t("hint")) + "</p>" + feats("kau-list") + "</div><div class=\"kau-main\">" + form() + "</div></div>";
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
    if (g('kab_go')) g('kab_go').onclick = function () { act(A.mode); };
    [['kab_tin', 'in'], ['kab_tup', 'up']].forEach(function (x) { var el = g(x[0]); if (el) el.onclick = function () { if (A.mode === x[1]) return; var e = g('kae'); if (e) A.email = e.value.trim(); A.mode = x[1]; A.msg = ''; redraw(); }; });
    if (g('kab_sw')) g('kab_sw').onclick = function () { var e = g('kae'); if (e) A.email = e.value.trim(); A.mode = A.mode === 'up' ? 'in' : 'up'; A.msg = ''; redraw(); };
    if (g('kab_g')) g('kab_g').onclick = function () { C.google(); };
    ['kae', 'kap'].forEach(function (id) { var el = g(id); if (el) el.onkeydown = function (ev) { if (ev.key === 'Enter') act(A.mode); }; });
  };
  window.KMAUTH = A;
})();
