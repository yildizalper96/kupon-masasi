// Yasal sayfalar (23 Kas 2026): /gizlilik/ ve /kosullar/ statik sayfalari. seo-pages.mjs ayni kabukla (sayfa()) uretir.
// TASLAKTIR: avukat kontrolunden gecmedi. Metni degistirince yalnizca bu dosyayi duzenle.
// ISLETEN bos ise metinde yalnizca "Simuleto" gecer; KVKK/GDPR icin veri sorumlusunun adi (kisi veya sirket) yazilmali.
export const ISLETEN = '';
export const ILETISIM = 'support@simuleto.com';
export const GUNCELLEME = '23 Kasım 2026';

const kim = () => ISLETEN ? `Simuleto (işleten: ${ISLETEN})` : 'Simuleto';
const mail = `<a href="mailto:${ILETISIM}">${ILETISIM}</a>`;

export const GIZLILIK = {
  yol: 'gizlilik',
  title: 'Gizlilik Politikası | Simuleto',
  desc: 'Simuleto hangi verileri toplar, nerede saklar, kimlerle paylaşır ve hesabınızı nasıl silersiniz.',
  body: () => `<h1>Gizlilik Politikası</h1><p class="alt">Son güncelleme: ${GUNCELLEME}</p>
<div class="kart"><p>Bu politika, ${kim()} web uygulamasını (simuleto.com) kullanırken hangi kişisel verilerin işlendiğini anlatır. Simuleto bir futbol analizi ve kupon simülatörüdür; bahis yaptırmaz, para kabul etmez ve ödeme bilgisi toplamaz.</p>
<p>Sorularınız ve talepleriniz için: ${mail}</p></div>

<div class="kart"><h2>1. Topladığımız veriler</h2><ul>
<li><b>Hesap açarsanız:</b> e-posta adresiniz, belirlediğiniz kullanıcı adı ve şifreniz (şifre yalnızca şifrelenmiş biçimde saklanır, biz göremeyiz). Google ile girerseniz Google'ın bize ilettiği ad, e-posta ve profil fotoğrafı bağlantısı.</li>
<li><b>Uygulama içi verileriniz:</b> kurduğunuz kupon simülasyonları, favori takımlarınız, takip ettiğiniz ligler ve tema tercihiniz.</li>
<li><b>Paylaştığınız kuponlar:</b> bir kuponu kodla paylaşırsanız, kuponun içeriği o kodu bilen herkes tarafından görülebilir.</li>
<li><b>Hesap açmazsanız:</b> kuponlarınız ve favorileriniz yalnızca kendi cihazınızda (tarayıcının yerel depolamasında) durur; bize gönderilmez.</li>
</ul><p>Reklam, izleme ya da analitik çerezi kullanmıyoruz. Konum, rehber veya cihaz kimliği toplamıyoruz.</p></div>

<div class="kart"><h2>2. Verileri neden kullanıyoruz</h2><ul>
<li>Hesabınızı oluşturmak, giriş yapmanızı sağlamak ve şifre sıfırlama gibi hesap e-postalarını göndermek.</li>
<li>Kuponlarınızı ve tercihlerinizi cihazlar arasında saklamak, kupon sonuçlarını işlemek.</li>
<li>Güvenliği sağlamak ve kötüye kullanımı önlemek.</li>
</ul><p>Verilerinizi satmıyoruz ve pazarlama amacıyla kimseyle paylaşmıyoruz.</p></div>

<div class="kart"><h2>3. Hizmet sağlayıcılar</h2><p>Uygulamanın çalışması için aşağıdaki hizmetler kullanılır. Bu hizmetler, isteğin doğası gereği IP adresinizi görebilir:</p><ul>
<li><b>Supabase</b>: hesap ve uygulama verilerinin saklandığı veritabanı ve giriş sistemi.</li>
<li><b>GitHub Pages</b>: sitenin barındırılması.</li>
<li><b>Cloudflare</b>: alan adı (DNS) ve gelen e-postaların yönlendirilmesi.</li>
<li><b>Google</b>: "Google ile giriş" (yalnızca seçerseniz) ve yazı tipleri (Google Fonts).</li>
<li><b>API-Sports</b>: takım logoları ve oyuncu fotoğrafları bu sağlayıcının sunucularından yüklenir.</li>
</ul><p>Bu sağlayıcıların sunucuları Türkiye dışında (ör. AB veya ABD) bulunabilir; verileriniz bu ülkelere aktarılabilir.</p></div>

<div class="kart"><h2>4. Cihazınızda sakladıklarımız</h2><p>Tarayıcının yerel depolamasında (localStorage) giriş oturumunuz, misafir kuponlarınız, favorileriniz, tema seçiminiz ve hızlı açılış için maç verisi önbelleği tutulur. Ayrıca uygulamanın çevrimdışı açılabilmesi için bir service worker önbelleği kullanılır. Bunlar takip amaçlı değildir; tarayıcı ayarlarından silebilirsiniz.</p></div>

<div class="kart"><h2>5. Saklama süresi ve hesabın silinmesi</h2><p>Hesap verileriniz hesabınızı silene kadar saklanır. Hesabınızı istediğiniz an <b>Profil &gt; Hesap &gt; Hesabı sil</b> yolundan silebilirsiniz; hesabınız, kuponlarınız, favorileriniz ve paylaştığınız kuponlar kalıcı olarak silinir. Silme işini yapamıyorsanız ${mail} adresine yazın.</p></div>

<div class="kart"><h2>6. Haklarınız</h2><p>Bulunduğunuz ülkenin mevzuatına göre (ör. Türkiye'de KVKK, AB'de GDPR) verilerinize erişme, düzeltilmesini, silinmesini ya da işlenmesinin sınırlandırılmasını isteme ve şikâyette bulunma haklarınız vardır. Taleplerinizi ${mail} adresine iletebilirsiniz; en geç 30 gün içinde yanıtlarız.</p></div>

<div class="kart"><h2>7. Yaş sınırı</h2><p>Simuleto 18 yaşından küçükler için değildir. 18 yaşından küçük birine ait bir hesap fark edersek sileriz.</p></div>

<div class="kart"><h2>8. Değişiklikler</h2><p>Bu politikayı güncelleyebiliriz. Önemli bir değişiklikte bu sayfadaki tarihi yenileriz ve gerekirse uygulama içinde duyururuz.</p></div>
<p><a href="/kosullar/">Kullanım Koşulları</a> · <a href="/">Simuleto'ya dön</a></p>`,
};

export const KOSULLAR = {
  yol: 'kosullar',
  title: 'Kullanım Koşulları | Simuleto',
  desc: 'Simuleto kullanım koşulları: simülatörün ne olduğu, ne olmadığı, yaş sınırı ve sorumluluk.',
  body: () => `<h1>Kullanım Koşulları</h1><p class="alt">Son güncelleme: ${GUNCELLEME}</p>
<div class="kart"><p>Simuleto'yu (simuleto.com) kullanarak bu koşulları kabul etmiş olursunuz. Kabul etmiyorsanız lütfen uygulamayı kullanmayın. İletişim: ${mail}</p></div>

<div class="kart"><h2>1. Simuleto nedir, ne değildir</h2><ul>
<li>Simuleto bir <b>futbol maç analizi ve kupon simülatörüdür</b>. Bahis yaptırmaz, para veya ödeme kabul etmez, kazanç ödemez.</li>
<li>Uygulamadaki "kupon", "miktar" ve "olası kazanç" ifadeleri tamamen sanaldır; gerçek bir bahis veya ödeme yoktur.</li>
<li>Herhangi bir bahis şirketinin tanıtımını yapmaz ve bahis şirketlerinin oranlarını göstermez.</li>
</ul></div>

<div class="kart"><h2>2. Tahminler ve oranlar</h2><ul>
<li>Olasılıklar geçmiş verilerden ve istatistiksel modellerden hesaplanan <b>tahminlerdir</b>; bir maçın sonucunu garanti etmez.</li>
<li>Gösterilen oranlar bir bahis sitesinin oranı değil, olasılıktan hesaplanan <b>adil oranlardır</b> (1 / olasılık).</li>
<li>Uygulamadaki hiçbir içerik bahis, yatırım veya finansal tavsiye değildir. <b>Hiçbir bahis risksiz değildir.</b> İçeriğe dayanarak verdiğiniz kararların sorumluluğu size aittir.</li>
</ul></div>

<div class="kart"><h2>3. Yaş sınırı ve sorumlu oyun</h2><p>Simuleto'yu yalnızca 18 yaşından büyükler kullanabilir. Kumar veya bahis alışkanlığınız sizi ya da çevrenizi olumsuz etkiliyorsa yardım alın: Türkiye'de Yeşilay Danışmanlık Merkezi (YEDAM) <b>115</b> numaralı hattı ücretsizdir.</p></div>

<div class="kart"><h2>4. Veri doğruluğu</h2><p>Maç, kadro, sonuç ve istatistik verileri üçüncü taraf kaynaklardan otomatik olarak alınır. Verilerin doğru ve güncel olması için çaba gösteririz, ancak gecikme, eksiklik veya hata olabilir. Bir veri yoksa uydurmayız, "veri yok" olarak gösteririz.</p></div>

<div class="kart"><h2>5. Hesabınız</h2><ul>
<li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz; şifrenizi kimseyle paylaşmayın.</li>
<li>Uygulamayı kötüye kullanmak (otomatik toplu istek, güvenlik açığı arama, başkasının hesabına erişmeye çalışmak, paylaşılan kuponlarda yasa dışı veya hakaret içeren içerik) yasaktır; bu durumda hesabı kapatabiliriz.</li>
<li>Hesabınızı istediğiniz an Profil &gt; Hesap &gt; Hesabı sil yolundan silebilirsiniz.</li>
</ul></div>

<div class="kart"><h2>6. Fikri mülkiyet</h2><p>Simuleto adı, tasarımı ve yazılımı ${kim()}'ya aittir. Takım adları, logolar ve oyuncu görselleri ilgili hak sahiplerine aittir ve yalnızca tanımlama amacıyla gösterilir.</p></div>

<div class="kart"><h2>7. Sorumluluğun sınırı</h2><p>Simuleto "olduğu gibi" sunulur; kesintisiz veya hatasız çalışacağı garanti edilmez. Yasaların izin verdiği ölçüde, uygulamanın kullanımından veya içeriğine dayanarak verilen kararlardan doğan zararlardan sorumlu değiliz.</p></div>

<div class="kart"><h2>8. Değişiklikler</h2><p>Bu koşulları güncelleyebiliriz. Güncel metin her zaman bu sayfadadır; değişiklikten sonra uygulamayı kullanmaya devam etmeniz yeni koşulları kabul ettiğiniz anlamına gelir.</p></div>
<p><a href="/gizlilik/">Gizlilik Politikası</a> · <a href="/">Simuleto'ya dön</a></p>`,
};
