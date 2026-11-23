// Ilk acilis yasal notu (23 Kas 2026): 18+ ve "simulatordur, bahis yaptirmaz" uyarisi. Bir kez gosterilir,
// "Anladim" ile kapanir (localStorage km_18). Sayfayi kilitlemez: altta serit. Depolama yoksa her acilista yine cikar.
(function () {
  var K = 'km_18';
  function oku() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function yaz() { try { localStorage.setItem(K, String(Date.now())); } catch (e) { } }
  if (oku()) return;
  function goster() {
    if (document.getElementById('km18')) return;
    var d = document.createElement('div');
    d.id = 'km18'; d.className = 'km18'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-live', 'polite'); d.setAttribute('aria-label', 'Yaş ve kullanım uyarısı');
    d.innerHTML = '<div class="km18-i"><b class="km18-r">18+</b><p><b>Simuleto bir analiz ve kupon simülatörüdür, bahis yaptırmaz.</b> Olasılıklar tahmindir, hiçbir bahis risksiz değildir. 18 yaşından küçükler için değildir. ' +
      '<a href="/kosullar/" target="_blank" rel="noopener">Kullanım Koşulları</a> · <a href="/gizlilik/" target="_blank" rel="noopener">Gizlilik</a></p>' +
      '<button type="button" class="km18-b">Anladım, 18 yaşından büyüğüm</button></div>';
    d.querySelector('button').addEventListener('click', function () { yaz(); d.classList.add('kapan'); setTimeout(function () { d.remove(); }, 250); });
    document.body.appendChild(d);
  }
  if (document.body) goster(); else document.addEventListener('DOMContentLoaded', goster);
})();
