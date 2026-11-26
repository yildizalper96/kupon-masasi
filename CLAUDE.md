# Simuleto (eski ad: Kupon Masası)

Futbol maç analizi ve iddaa kuponu SİMÜLATÖRÜ (bahis yaptırmaz; "hiçbir bahis risksiz değildir", "risksiz" denmez). Kullanıcı Türkçe konuşur: cevaplar Türkçe, KISA ve sonuç odaklı olsun; gereksiz açıklama, tekrar, büyük çıktı yok (token tasarrufu önemli).

## Kısa özet
- Site: https://simuleto.com/ (19 Kas 2026'dan beri; Cloudflare alan adı, DNS only → GitHub Pages; eski adres yildizalper96.github.io/kupon-masasi/ buraya yönlenir; repo adı hâlâ kupon-masasi). Marka e-postaları hello@/support@/alper@simuleto.com Gmail'e yönlendirilir (Cloudflare Email Routing, yalnız alır). GitHub Pages ( Actions veriyi çeker ve yayınlar). Statik: `index.html` + `css/` + `js/` + `data/`; yerelde `node tools/serve.mjs 5188` (Node: `C:\Program Files\nodejs`).
- Veri: API-Football PRO plan (21 Kas 2026, bitiş 21 Ara 2026), günlük 7500 istek, 300/dk; asıl çekim yerel Görev Zamanlayıcısı (KuponMasasi-Veri), GitHub cron yedek (00:00 UTC = 19:00 Toronto'da sıfırlanır; kullanıcı Toronto'da). Anahtar `.env` (asla yazma/gösterme). Araçlar: `tools/fetch-fixtures.mjs`, `tools/fetch-details.mjs`, `tools/match-phases.mjs`, `tools/season-agg.mjs`, `tools/merge-restored.mjs`, `tools/build-site.mjs`.
- İki sohbet çalışır: tasarım (css/desktop.js/pages.js) ve veri/backend (tools, workflow, fixtures-api.js). Birbirine her şeyi SendMessage ile iletir. Push: kod/tasarım için kullanıcı onayı; yalnızca VERİ dosyaları (data/fixtures, season.json, ids.json) kota varsa sormadan çekilip push edilebilir (kullanıcı izni, 14 Kas 2026).
- Git'e GİRMEYEN gizli dosyalar: `yedek/`, `kupon-masasi-v200.html`, `data/kupon/`, `data/history/rules.json`, `applied.json`, `.env`, `.claude/`. Eski geçmiş `local-history` dalını ASLA push etme.
- Kurallar: veri uydurma ("veri yok" yaz); oranlar: varsa Bet365 oranı (details.json odds.b, 25 Kas 2026 kullanıcı kararı), yoksa adil oran 1/ihtimal (katsayısız, min 1.01); kaynak/bahisçi adı ASLA yazılmaz, başka bahisçi kullanılmaz; oyuncu istatistikleri YALNIZCA API-Football (26 Kas 2026 kullanıcı kararı; statz.ai/Sofascore/Transfermarkt istatistiği yok, `tools/api-players.mjs` → `data/players/api.json`); değişiklikten sonra kendin test et (NaN/undefined/konsol hatası); `git push` TÜM yerel commit'leri yayınlar, push öncesi `git log origin/main..HEAD` bak.

## Ayrıntı
Tüm teknik notlar (veri biçimleri, kota olayları, tasarım kararları, Supabase/Google girişi, kupon analizi, hata geçmişi) `docs/ayrinti.md` içinde. YALNIZCA ilgili konu gerektiğinde oku (ör. `Grep` ile bölüm bul); tamamını okuma.
