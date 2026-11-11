# Kupon Masası: bağımsız uygulama planı

Hedef: claude.ai'a bağımlı tek dosyayı, kendi adresinde çalışan gerçek bir web uygulamasına (PWA) çevirmek. Telefona "Ana ekrana ekle" ile uygulama gibi kurulur. Mağaza en sona.

## Bugünkü bağımlılıklar (v200 HTML'den)
- Veri: sayfa `claude.use('db')` ile claude.ai artifact veritabanını okuyor (koleksiyonlar: results, lineups, history, players, kupon). Yedek: `yedek/db/`.
- Giriş: Claude hesabıyla (`user` yeteneği). Kupon ve favoriler buna bağlı (`kupon_uid`, `fav`).
- Yazma: veriyi yalnızca ben ("güncelle" komutuyla) yazıyordum; kullanıcılar yazamıyordu.
- Kod: tek dosya, 12 bin satır, çok uzun satırlar. Çeviri katmanı çalışma zamanında DOM'u değiştiriyor.

## Aşamalar

### Aşama 1: Claude'dan bağımsız çalıştırma (en hızlı kazanım) — KOD TAMAM (10 Kas 2026), yayın bekliyor
Yapıldı: dosyalara bölündü, veri katmanı (`js/data-shim.js`) yazıldı, yerelde 7 dilde test edildi. Kalan: ücretsiz yayın (Vercel/Netlify/GitHub Pages). İnce modüllere bölme (`app.js`) Aşama 2 ile birlikte yapılabilir.
1. HTML'i `index.html` + `style.css` + `app.js` + `i18n.js` olarak böl; davranış değişmesin.
2. `claude.use('db')` yerine küçük bir veri katmanı (`data.js`) koy. İlk sürümde `yedek/db/*.json` dosyalarını okusun.
3. Giriş yokken kupon ve favoriler tarayıcıda (localStorage) tutulsun.
4. Yerelde çalıştır ve tarayıcıda test et (hata, NaN, undefined taraması).
5. Ücretsiz yayınla (Vercel, Netlify veya GitHub Pages). Sonuç: herkesin açabildiği bir bağlantı.
Model: Sonnet 5.5 (orta). Bölme işi mekanik, dikkatli test önemli.

### Aşama 2: Gerçek veritabanı ve giriş (Supabase, ücretsiz plan)
1. Tablolar: maçlar/sonuçlar, kadrolar, geçmiş, oyuncular, kuponlar, favoriler, kullanıcı profili.
2. Giriş: e-posta veya Google. Satır bazlı güvenlik: herkes maç verisini okur, kupon ve favoriyi yalnızca sahibi görür/değiştirir. Kupon paylaşım kodu (6 harf) korunur.
3. `data.js` artık Supabase'den okur. Yedek JSON'lar tabloya aktarılır.
Model: Opus 5.5 ile şema ve güvenlik kuralları tasarımı, uygulama Sonnet.

### Aşama 3: Otomatik veri güncelleme
Şu an "güncelle" deyince elle yapılıyor. Plan: zamanlanmış iş (GitHub Actions cron veya Supabase zamanlanmış fonksiyon) skor, puan durumu, kadro ve oyuncu verisini yazsın.
- ÖNEMLİ karar: Gerçek ürün için kazıma yerine lisanslı/ücretsiz API kullan (örn. football-data.org, API-Football ücretsiz katman). Mevcut kaynaklar (t-online, futboltotal vb.) kişisel kullanımda iş görüyordu; herkese açık üründe kullanım şartı sorunu çıkarabilir.
- Kullanıcı sayısı artarsa API kotası ve maliyet buradan gelecek.

### Aşama 4: PWA ve cilalama
Manifest, simgeler, çevrimdışı önbellek (service worker), ana ekran kurulumu, hız (1,3 MB'ı bölünce küçülür), 7 dilin kontrolü.

### Aşama 5: Yasal ve mağaza (isteğe bağlı)
- Bahis içerikli uygulamaları Apple ve Google sıkı denetler. Konumlandırma: "analiz ve simülasyon, bahis yaptırmaz". Mağaza metnini buna göre yaz.
- Türkiye'deki ve hedef ülkelerdeki bahis reklamı/tavsiye kurallarını kontrol et (7 dil = çok ülke). Uygulamadaki "risksiz değildir" uyarıları kalmalı.
- Gerekirse Capacitor ile paketlenir. Maliyet: Apple 99 $/yıl, Google 25 $ tek sefer.

## Açık kararlar (kullanıcıya sorulacak)
1. Alan adı: kendi adresi istiyor mu, yoksa ücretsiz alt adres yeter mi?
2. Giriş zorunlu mu olsun, yoksa girişsiz de kullanılabilsin mi (öneri: girişsiz kullanım + isteğe bağlı hesap)?
3. Veri kaynağı: ücretsiz API kotasıyla mı başlayalım, yoksa mevcut kaynaklarla kişisel kullanımda mı kalalım?
4. Uygulamayı kimlerle paylaşmayı düşünüyor? (arkadaşlar mı, herkese açık mı; yasal yük buna göre değişir)

## Çalışma düzeni
- Her aşama küçük adımlara bölünür; her çalışan adımdan sonra commit.
- Büyük işlerde önce plan modu, sonra kod.
- Her değişiklikten sonra tarayıcıda test.
