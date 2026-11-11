# Kupon Masası

Futbol maç analizi ve iddaa kuponu simülatörü. Kullanıcı Türkçe konuşur: cevaplar Türkçe ve kısa olsun.
Uygulama bahis yaptırmaz; analiz ve **simülasyon** aracıdır. "Hiçbir bahis risksiz değildir."

## Durum (10 Kas 2026)
- Eskiden claude.ai Projesi + yayınlanmış artifact olarak çalışıyordu (artifact: https://claude.ai/artifact/AvkaM59ozVZVELWQF5mX5U, v200).
- Güncel kaynak: `kupon-masasi-v200.html` (tek dosya HTML, 1,3 MB, 7 dil: tr en es pt de it fr).
- Veri claude.ai artifact veritabanındaydı. Yedeği: `yedek/db/` (results, lineups, history, players).
- HEDEF: claude.ai'dan bağımsız gerçek uygulama. Önce web/PWA (en hızlı ve ucuz), sonra gerekirse mağaza (Capacitor).
  Gerekenler: kendi veritabanı (Supabase vb.), kendi giriş sistemi, otomatik veri güncelleme, kodu modüllere bölme.

## Git ve gizlilik (herkese açık repo için, 11 Kas 2026)
- Yerel `main` dalı temiz, tek commit'li yayın geçmişidir. Eski geçmiş yalnızca yerelde `local-history` dalında durur (içinde yedek ve kişisel kuponlar var): ASLA push etme.
- Git'e GİRMEYEN, ama diskte duran gizli/iç dosyalar: `yedek/` (claude.ai veritabanı yedeği), `kupon-masasi-v200.html` (eski tek dosya kaynak), `data/kupon/` (kişisel kupon adları), `data/history/rules.json` ve `applied.json` (iç güncelleme kuralları), `.env` (API anahtarı), `.claude/`. Bunları asla `git add -f` ile ekleme. `tools/split.mjs` v200.html'e ihtiyaç duyar (yerel dosya); artık kaynak `index.html` ve `js/` dosyalarıdır.

## Dosya yapısı (Aşama 1 tamam, 10 Kas 2026)
- `index.html` + `css/app.css` + `js/` + `data/`. Eski tek dosya `kupon-masasi-v200.html` yalnızca kaynak/arşiv; `node tools/split.mjs` onu yeniden bölebilir (üzerine yazar, elle yapılan değişiklikleri siler: bir kez çalıştırıldı, artık kaynak `index.html`/`js/` dosyalarıdır).
- `js/data-shim.js`: `claude.use('db')` yerine geçer. Okuma: localStorage `kmdb:<yol>` > `data/<yol>.json`; yazma: yalnızca localStorage. `claude.use('user')` null döner (giriş yok). Aşama 2'de Supabase ile değişecek, uygulama kodu aynı kalacak.
- `js/i18n-keys.js` (544 KB, 7 dil anahtarları), `js/app.js` (uygulama, 761 KB, tek parça; ince bölme sonraya), `js/gestures.js`, `js/extras.js`.
- Uygulamada yapılan tek yama (tools/split.mjs içinde): misafir profil kartı sadeleştirildi, paylaşım bağlantısı (`KLINK`) kendi adresine bakıyor.
- Yerel çalıştırma: `node tools/serve.mjs 5173` (Node: `C:\Program Files\nodejs`, PATH'e eklenmemiş olabilir). Tarayıcıda http://localhost:5173
- `data/` yedeğin bir kopyasıdır ve donuktur (son güncelleme 8 Kas 2026). `favs/latest` yedekte yok (uygulama yokluğu tolere ediyor).
- Test (Aşama 1): 7 dilde 5 sekme tarandı, NaN/undefined/hata yok; kupon localStorage'a yazılıyor.

## Yayın
- ASIL SİTE (11 Kas 2026'dan beri): https://yildizalper96.github.io/kupon-masasi/ — GitHub Pages, repo herkese açık (github.com/yildizalper96/kupon-masasi). GitHub Actions veriyi otomatik çeker ve yayınlar (secret `API_FOOTBALL_KEY` tanımlı, Pages kaynağı "GitHub Actions"). İlk çalıştırma doğrulandı: akış başarılı, veri taze, gizli yollar 404, uygulama tarayıcıda hatasız. Kod değişikliği: commit + `git push` (GitHub girişi için kullanıcının terminali gerekebilir; git yolu `C:\Program Files\Git\cmd\git.exe`).
- Eski Netlify sitesi (elle yükleme, otomatik güncellenmez, kota ayda ~20 yayın): https://serene-cassata-8c864a.netlify.app — emekliye ayrılabilir.
- Not: arayüzdeki "Son güncelleme" yazısı elle yazılan `results/latest.json` saatini gösterir (8 Kas 20:18), API çekimini göstermez.
- Yayın paketi `yayin/` klasörü (git'e girmez). İçeriği: index.html, css/, js/, data/{results,lineups,players} ve data/history/all.json. Girmeyenler: yedek/, tools/, data/kupon (kişisel kupon adları), data/history/rules ve applied (iç kurallar).
- Güncelleme: yayin/ yeniden hazırlanır, kullanıcı Netlify'da siteye (Deploys sekmesi) sürükleyip bırakır. CLI/otomatik dağıtım henüz yok.

## Veri kaynağı: API-Football (karar 10 Kas 2026)
- Ücretsiz plan (günde 100 istek) ile deneniyor; anahtar `.env` içinde `API_FOOTBALL_KEY` (git'e girmez, ekrana/sohbete yazılmaz). Host: https://v3.football.api-sports.io, başlık `x-apisports-key`.
- Hedef kapsam: sistemdeki ligler + büyük ligler + yerel kupalar + Avrupa kupaları. 2./3. ligler ve küçük ülke ligleri YOK. Lig kimlikleri: `tools/leagues-found.json` (34 lig/kupa, kapsam bayrakları dahil). Deneme: `node tools/api-test.mjs` (3 istek).
- Bir günün tüm dünya maçları tek istek (`/fixtures?date=`), canlı `/fixtures?live=all` tek istek: kota için bunları kullan, lig lig çağırma.
- Kupalarda (Türkiye Kupası, Coupe de France, İskoçya kupası) kadro/istatistik/oyuncu verisi yok, yalnızca olay ve tahmin.
- API anahtarı tarayıcıya konmaz; veri sunucu tarafında (zamanlanmış görev) çekilip uygulamanın okuduğu JSON biçimine çevrilir.

## API maç verisi (Aşama 3a, 10 Kas 2026)
- Maçlar eskiden `js/app.js` içinde lig lig metin bloğu olarak elle yazılıydı (`PL|10-31T12:30|Chelsea|Man United|53|23.9|23.1`; 10-31 ile 11-26 arası, 328 maç). Bunlar duruyor ve ÖNCELİKLİ: aynı `lig|ev|deplasman` varsa API kaydı onların üzerine yazmaz.
- `node tools/fetch-fixtures.mjs [--days=3] [--max-pred=40]` → `data/fixtures/latest.json` (`{at, lg:{kod:{n,ln,col}}, m:[{id,c,t,h,a,st,sc,p?,hand}]}`). Lig kod tablosu: dosyanın başındaki `LEAGUES` (yeni kodlar: FAC EFL CDR CIT DFB CDF TUK KNV TDP BCP SFA USC BRA CBR ARG CAR MLS MX). Tahminler `tools/cache/predictions.json` önbelleğinde (git'e girmez).
- `js/fixtures-api.js` bu dosyayı okur, yeni maçları `R`'ye, biten skorları `RES`'e ekler. Tahmin yoksa `np:true` ("olasılık yok", uygulama bu durumu zaten destekliyordu). Tahmin varsa `p:[1,X,2]` ile tüm kupon önerileri ve beklenen gol hesabı çalışıyor (sentetik kayıtla doğrulandı).
- Takım adı eşleştirme: `fetch-fixtures.mjs` içindeki `ALIAS`, `NATIONS` (Uluslar Ligi: İngilizce → Türkçe) ve bulanık eşleştirme; uygulamanın bildiği adlar `tools/app-teams.json`. Eşleşmeyen adlar API adıyla kalır (rapor: `tools/out/unmatched-teams.txt`).
- Yerel kupaların ilk turlarında iki takım da bilinen üst lig takımı değilse maç alınmaz (alt lig istenmiyor).
- ÜCRETSİZ PLAN SINIRI: `/fixtures?date=` yalnızca dün, bugün, yarın (UTC) için çalışıyor; 1 hafta ilerisi ücretli plan ister. API bilinmeyen maçlar için 33/33/33 tahmin döndürür, bu "tahmin yok" sayılır.
- Yeni ligler "Ligler" sekmesinde de görünür: `js/fixtures-api.js` meta'dan `LORD` (sıra), `LGNM` (kısa ad) ve `LGAN` (arama takma adları; kaynak `fetch-fixtures.mjs` içindeki `LG_ALIASES`) tablolarını doldurur. Lig sayfası açılır, puan durumu yoksa "veri yok" der, maçlar ve biten skorlar listelenir (yerelde doğrulandı).
- Henüz YOK: canlı skor/olaylar, kadro, puan durumu, oyuncu verisi, API'den tahminle Poisson/özel model ligleri (SL, ERE, POR, SCO, BEL, KSA elle modelle hesaplanıyordu), otomatik zamanlanmış çekim, Netlify'a anahtar.

## Otomatik güncelleme mimarisi (hazır, henüz KURULMADI: 11 Kas 2026)
- NETLIFY KISITI (araştırıldı): ücretsiz plan ayda 300 kredi, her production yayın 15 kredi = ~20 yayın/ay. Her veri güncellemesinde Netlify'a yayın yapmak mümkün değil. Bu yüzden otomatik güncellemeli site GitHub Pages'te (yayın başına kredi yok) planlandı. Netlify'daki site şimdilik elle yüklemeyle duruyor.
- `.github/workflows/update-and-deploy.yml`: canlı mod her 20 dk (10:00-22:59 UTC), tam mod günde 4 kez, push'ta yeniden yayın, elle çalıştırma. Veri/tahmin önbelleği `actions/cache` ile (data/fixtures, tools/cache) çalıştırmalar arasında korunur. Secret: `API_FOOTBALL_KEY` (GitHub repo Settings > Secrets). Pages kaynağı: GitHub Actions. ÖNEMLİ: GitHub Pages ücretsiz planda repo PUBLIC olmak zorunda (kod ve veri herkese açık olur; anahtar kodda yok, git geçmişi temiz doğrulandı).
- `node tools/fetch-fixtures.mjs --live`: tek istek `/fixtures?live=all` (+ canlı listeden düşenler için `/fixtures?ids=`), mevcut latest.json'a durum/skor işler. Her çalıştırmada `/status` (istek sayılmaz) ile kalan kota < 10 ise hiç istek yapmaz.
- `node tools/build-site.mjs [klasör]`: yayın paketi (varsayılan `yayin/`); kişisel/iç dosyalar girmez.
- `js/fixtures-api.js`: canlı skor/durum hem yeni hem elle yazılı maçlara işlenir (RES 'L a-b' canlı, 'a-b' kesin; elle girilmiş kesin skorun üstüne yazmaz). Sentetik kayıtla doğrulandı.
- Kota hesabı (ücretsiz 100/gün): canlı en çok 39 çalıştırma + tam 4x(3+8) = ~83. Canlı skor ve olaylar (gol/kart dakikaları) YOK, yalnızca skor ve durum.
- API-Sports/API-Football KULLANIM ŞARTLARI okundu (api-sports.io/terms, "Last updated: May 21, 2025", kullanıcı yapıştırdı). Özet: uygulama/web sitesi/fantezi oyunu yapmak için veri verildiğini söylüyor (yasaklanan: verinin doğrudan SATIŞI/yeniden satışı, hesap paylaşımı, ücretsiz limiti artırmak için çoklu hesap). AMA yayın LİSANSI VERMİYOR: verinin yayın hakkı için lig/federasyon gibi yetkili kurumlardan izin almak kullanıcının sorumluluğu. Bahis platformu, TV, fantezi, medya kullanımı ek lisans gerektirebilir (sorumluluk kullanıcıda). Lig/federasyon resmi şikâyet ederse API erişimi anında, iadesiz kapatılabilir. Dakikalık limit aşımı "ciddi ihlal" (araç artık istekler arasında bekler). Ücretsiz planda günlük kota dolunca hesap o gün askıya alınır (araç buna kalmadan durur). Logo/görseller kullanılmıyor (uygulama baş harf rozeti kullanır). Şüphede destek e-postasıyla sorulabilir, öneri: yazılı teyit iste.
- Durum: bu uygulama bahis YAPTIRMAZ, analiz/simülasyon aracıdır; şartlarla çelişen açık bir madde yok ama yayın hakkı garantisi de yok. Elle toplanmış veri (futboltotal, t-online vb.) için ayrı bir şart kontrolü YAPILMADI.

## PWA (11 Kas 2026)
- `manifest.webmanifest` (standalone, tr, tema #000000), `icons/` (192, 512, maskable 512, apple-touch 180; logo uygulamadaki kupon+onay işareti, koyu zemin), `sw.js` (ağ öncelikli: çevrimiçiyken hep güncel, çevrimdışıyken son başarılı cevap; yalnızca aynı kaynak GET; sürüm için `CACHE` adını artır), `index.html`'de manifest/theme-color/apple-touch-icon meta'ları ve SW kaydı.
- Test: dosyalar ve simgeler yerelde 200; SW mantığı sahte ortamda 10 senaryoyla geçti (çevrimdışı, önbellek, POST/başka kaynak dokunulmaz). Uygulama içi tarayıcı paneli SW kaydını engelliyor (403), bu yüzden gerçek SW yaşam döngüsü ve "ana ekrana ekle" kurulumu TELEFONDA doğrulanmadı. iOS'ta `black-translucent` durum çubuğu kullanıldı, güvenli alan CSS'i var ama iPhone'da görülmedi.
- Simgeleri yeniden üretmek gerekirse: tarayıcıda canvas ile çizilip PNG kaydedildi (araç dosyası tutulmadı); logo yolu `index.html` içindeki SVG.

## Supabase ve giriş (11 Kas 2026, KOD HAZIR, proje henüz bağlanmadı)
- `js/config.js`: `window.KM_SUPABASE={url,anonKey}`. BOŞ = misafir modu (yayındaki hal, hiçbir şey değişmez). Anon/publishable anahtar herkese açık olacak şekilde tasarlandı, repoya yazılabilir; `service_role`/`secret` anahtarı ASLA yazılmaz.
- `js/cloud.js` (kütüphanesiz istemci): e-posta+şifre (`/auth/v1/signup`, `/token`), Google (`/authorize` yönlendirmesi, dönüşte `#access_token` hash'i okunup temizlenir), jeton yenileme, PostgREST (`/rest/v1`). Profil sekmesi giriş formu `KMAUTH` (7 dilli kendi sözlüğü, `T` nesnesi).
- `js/data-shim.js`: `db.doc()` yolları: `data/users/<uid>/<ad>` → `user_docs` tablosu (+ her zaman yerel kopya), `kupon/<KOD>` → `shared_coupons` (herkes okur, giriş yapan yazar), diğerleri statik. Oturum yoksa her şey yerel.
- `js/app.js` yamaları (`tools/patch-auth.mjs`, tekrar çalıştırılabilir): misafir kartı→giriş formu, giriş sonrası metinler, memBind, sOut (bulutta gerçek çıkış, cihaz verisini temizler; hesap verisi kalır).
- `supabase/schema.sql`: tablolar + RLS + açık GRANT'ler (yeni projelerde Data API için şart). Kullanıcı SQL Editor'de çalıştırır.
- Supabase kısıtları (araştırıldı): yerleşik e-posta saatte 2 doğrulama maili (özel SMTP ile 30) → bu yüzden e-posta ONAYI KAPALI tutulur (şifre sıfırlama e-postası da yok, bilinen eksik); ücretsiz proje 1 hafta işlem olmazsa duraklar (`tools/keepalive.mjs` zamanlı çalıştırmada okuma yapar); 500 MB veritabanı.
- Test: `node tools/mock-supabase.mjs` (sahte Supabase + site, http://localhost:5174). Geçen senaryolar: geçersiz e-posta/kısa şifre/yanlış giriş mesajları, kayıt, misafir kupon+favorinin buluta taşınması, çıkış (cihaz verisi temizlenir), başka cihaz taklidiyle girişte kupon+favori geri gelir, süresi dolmuş jeton tam bir kez yenilenir, sayfa yenilemede oturum kalır, paylaşım kodu (sahip yazar, misafir okur, bilinmeyen kod yok, misafir bulut çağrısı yapmaz), Google yönlendirmesi (hash temizlenir, isim gelir), yapılandırma boşken eski davranış. GERÇEK Supabase ile denenmedi.

## Ürün kuralları (eski proje talimatından)
- Veri uydurma. Her tahminin nedeni gerçek veriye (puan durumu, sonuçlar, olasılıklar) dayansın. Veri yoksa "veri yok" yaz.
- Hiçbir bahis risksiz değildir. "Düşük riskli" denir, "risksiz" denmez.
- Oranlar bahis sitesi oranı değil, olasılıktan hesaplanan "adil oran"dır; açıkça belirt.
- Seçim kuralları: Düşük risk: olasılık >= %70 ve adil oran >= 1.15 olanlar arasında en yüksek oranlı. Dengeli: tek sonuç, Ü/KG, olasılık %45-69. Yüksek oran: olasılık %22-44. Uygun seçenek yoksa zorlama, "yok" yaz.
- Seçimler açık Türkçe etiketle ("Frankfurt kazanır"), oran ve ihtimal ayrı ve etiketli, her seçimin altında nedeni.
- Değişiklikten sonra kendin test et (hata, NaN, undefined), sonra bildir.
- Telif ve kullanım şartlarını ihlal eden kazıma yapma. Bet365 verisi çekilemez. SofaScore/FotMob çekilmez.
- Model: Poisson (Süper Lig için ayrıntılı), diğer liglerde veri sağlayıcının maç öncesi olasılığı.

## Veri modeli (artifact DB koleksiyonları)
- `results/latest` (res, lv canlı olaylar), `results/stats` (maç istatistiği ve oyuncu puanları, alan `st` JSON metin)
- `lineups`, `history/all` (satır: `lig|ev|dep|ev gol|dep gol|gg.aa.yyyy`; puan tabloları buradan hesaplanır), `history/rules`
- `players/latest`, `players/more`, `players/more2` (satır: [ad, maç, dk, gol, asist, sarı, poz, ...])
- `kupon` (kullanıcı kuponları), kullanıcıya özel veriler
- Maç olayı biçimi (lv.ev): gol {k:'g',m,s:'h'|'a',a,b,sc}; kart {k:'y'|'r',m,s,a}; değişiklik {k:'s',m,s,a,b}; devre {k:'ht',m,sc}; not {k:'ex',n}

## Eski "güncelle" akışı (otomasyon yapılırken referans)
Skorlar, canlı gidişat, kadrolar (maça ~1 saat kala resmi 11), takım haberleri (son 24 saat, söylenti "iddia" diye), kupa maçları,
geçmiş/kayıt defteri, oyuncu verisi (gol/asist/sarı; aynı maç iki kez işlenmesin: `ap` işareti), kupon maçları öncelikli,
maç istatistiği ve oyuncu puanları, tüm liglerin puan tabloları. Maç bitince res kesin skora çevrilir. Kaynaklar `src` alanına yazılır;
eksik/tutarsız kısım src içinde belirtilir. Veri uydurulmaz.
- Veri kaynakları: fetch_sports_data (PL, La Liga, Serie A, Bundesliga, Ligue 1, ŞL; skor ve puan durumu), TFF (Süper Lig), t-online.de maç sayfası
  (gol/asist/kart/ilk 11, dakikalı; önbellek canlı kalabilir, durum "Beendet" ve skor kesinle aynı değilse kullanma), futboltotal.futbol, Sporza, gidstats, Sporx.
  Sorunlu: Eurosport, sofascore, fcupdate, Cope, ESPN (maç öncesi önbellek).
- Otomatik saatlik güncelleme token maliyeti yüzünden kapatılmıştı. Yeni mimaride zamanlanmış iş olarak yeniden kurulacak.

## Çok dilli arayüz
- Kod Türkçe; ekran metinleri çalışma zamanında çeviri katmanıyla (I18N) değişir, DOM'u MutationObserver izler.
- Anahtarlar Türkçe şablon: § serbest parça, № sayı, {1},{2} yer tutucu, çoğul {n?tekil:çoğul}; "@@" ile başlayan anahtarlar sözlük.
- Her yeni not veya arayüz metni 6 dilde (en es pt de it fr) eklenmeli; hiçbir dilde başka dil karışmamalı.
- Dil seçimi: localStorage km_lang > saat diliminden ülke > tarayıcı dili > İngilizce.
- Eski çeviri araçları (conv3.py, i18n/gen.py, trchk.py, units3.js) claude.ai sandbox'ındaydı ve yedeklenmedi; gerekirse yeniden yazılacak.

## Eski yapılacaklar listesi
Avrupa Ligi, Konferans Ligi, Türkiye Kupası fikstürleri; diğer ligler için son 5 maç, ev/deplasman, aralarındaki maçlar; kadro ve sakatlık verisi; Ligue 1 (artık eklenmiş olabilir, kodda kontrol et).
