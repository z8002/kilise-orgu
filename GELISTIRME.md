# Geliştirme

`kilise-orgu.html` ve `caz-orgu.html` elle düzenlenmez: `kaynak/` klasöründeki parçalardan, aynı şablondan üretilir. İkisi arasındaki fark `__ORG__`, `__BASLIK__`, `__ACIKLAMA__` yer tutucularıdır (`araclar/derle.py`); sayfa gerisini `<html data-org>` özniteliğine bakarak seçer (`yalniz-kilise`, `yalniz-caz` sınıfları, JavaScript'te `ORG`). Dağıtılan her sayfa yine tek bir HTML dosyasıdır. README'nin "Örnek parçalar" ve "Kaynaklar" bölümleri de elle düzenlenmez: `parcalar/` klasöründen üretilir.

## Klasörler

| Yer | İçerik |
|---|---|
| `kaynak/sablon.html` | Sayfanın iskeleti. `/*@ekle yol*/` yazan satırlar o dosyanın içeriğiyle değişir |
| `kaynak/stil/` | CSS (`telefon.css`: ekranın altına sabitlenen pencereli klavye, dokunmatik yardım) |
| `kaynak/js/` | JavaScript parçaları. Şablondaki sırayla tek bir `<script>` içine eklenir ve aynı kapsamı paylaşır |
| `parcalar/` | Parça dosyaları; biçimi [parcalar/README.md](parcalar/README.md) dosyasında |
| `kaynaklar/ref/` | Parçaların kaynak notalarından çıkarılmış başvuru notaları |
| `araclar/` | Derleme, parça ve ölçüm betikleri |
| `test/` | Otomatik testler (Playwright) |
| `notalar/` | Nota dosyaları (LilyPond, PDF) |
| `v1/` | Özgün sürüm. Değiştirilmez; bir test dosyanın özetini denetler |
| `sw.js` | Hizmet çalışanı: internetsiz açılış. Uygulama dosyaları önce ağdan, ağ yoksa saklanan kopyadan gelir |
| `manifest.webmanifest`, `simgeler/` | Ana ekrana ekleme ve paylaşım kartları. Simgeler ve kartlar `node araclar/simgeler.js` ile çizilir |

## Değişiklik yapmak

1. `kaynak/` ya da `parcalar/` altındaki dosyayı düzenle.
2. `python3 araclar/derle.py` ile `kilise-orgu.html`, `caz-orgu.html` ve README'yi yeniden üret.
3. `npm test` ile testleri çalıştır.
4. Kaynağı ve üretilen dosyayı birlikte gönder. GitHub'daki denetim, üretilen dosya güncel değilse hata verir.

Uygulamaya yeni bir dosya eklenirse (örneğin yeni bir simge), internetsiz de açılması için `sw.js`'deki `UYGULAMA` listesine yazılır ve `SURUM` bir artırılır. Listede olup sunucuda bulunmayan bir dosya kurulumu bütünüyle bozar; bunu bir test denetler.

## Kurulum

Derleme için yalnızca Python 3 gerekir. Testler için:

```
npm install
npx playwright install chromium
npm test
```

## Testler neyi denetler

- Sayfa hatasız açılıyor mu; diskten çift tıklayınca da çalışıyor mu.
- Her nota tuşu, beş oktav konumunun hepsinde doğru notayı çalıyor mu.
- Her piston tam olarak kendi registerlerini açıyor mu; ayarlar saklanıyor mu.
- Gerçek ses çıkışı: her register kendi ayak yüksekliğinde ötüyor mu (La4 için 8′ = 440 Hz, 16′ = 220 Hz, 4′ = 880 Hz…).
- Telefonda parmakla basma, kaydırma ve akor.
- Telefon görünümü: beyaz tuşlar en az 44 piksel, klavye açılışta ekranın altında, sayfa yana taşmıyor (320 piksellik ekranda da); `‹` `›` ve oktav geçişi; yan tutuş; Öğren'de klavyenin yanan tuşa kayması (Für Elise'nin ilk 40 adımı parmakla çalınır).
- Ana ekrana ekleme: manifest ve simgeler; sunucu kapatılınca sayfanın ve parça bağlantılarının saklanan kopyadan açılması.
- Hafif mod: nota başına boru ve gürültü kaynağı sayısı, en çok ses sayısı.
- İki manuel ve pedal: her bölümün hangi borularla öttüğü (sayfa, basılı notaların registerlerini bildirir); kuplörler, otomatik pedal, pistonların Sandık ve pedal registerleri, önceki sürümün kaydından geçiş; yeni registerlerin perdesi.
- Caz orgu: sayfa ve bağlantılar, çekme çubuklarının klavyeyle, fareyle ve hazır seslerle ayarlanması; her çubuğun eşit akortlu perdesi gerçek sesten; perküsyonun ilk notada vurup sönmesi, legatoda susması; dönen hoparlörde borunun çabuk, tamburun ağır hızlanması; şarkı çalar.
- MIDI klavye: tarayıcının MIDI arayüzü sahte bir klavyeyle değiştirilir; nota, sürdürme ve ifade pedalı, program değişimi, kanallar.
- Kendi parçan: Türkçe ve İngilizce yazımın çizelgeye çevrilmesi (kısa kalan elin susla tamamlanması), çalınması, Öğren, saklanıp silinmesi, yanlış yazımın reddi.
- Kayıt: indirilen MIDI dosyası çözülür; notaların sırası, süresi ve kanalı denetlenir; ses dosyası iner; kayıt geri çalınır.
- Kendi kombinasyonları: Ayarla ile kaydetme, geri çağırma, sayfa yenilenince durması, boş pistonun registrasyona dokunmaması.
- Akort: sayfanın hesapladığı sapmalar yayımlanmış tablolarla aynı mı; Werckmeister'de Do4 gerçekten 11,7 sent tiz mi; basılı notanın perdesi diyapazonla kayıyor mu; Do borusu solda, Do♯ borusu sağda mı.
- Otuz parçanın her notası: README'de yazan tuşa basılınca parça dosyasındaki nota çalıyor mu.

Ayrıca `araclar/kaynak_denetle.py`, parçaların notalarını ve sürelerini kaynak notalardan çıkarılmış başvurularla karşılaştırır.

Testlerdeki tuş ve piston tabloları sayfanın kodundan kopyalanmadı; README'deki tabloların bağımsız bir kopyasıdır.

## İki dil

Sayfa Türkçe yazılır; İngilizcesi `kaynak/js/dil.js`'dedir:

- kısa metinler (düğme, etiket, ipucu) `EN` sözlüğünde, anahtar Türkçe metnin kendisi; sayfa açılırken sözlükte olan her metin ve `title`, `aria-label`, `placeholder` çevrilir;
- uzun, biçimli metinler (yardım) şablonda öğenin `data-en` özniteliğinde İngilizce karşılığıyla durur;
- JavaScript'in yazdığı metinler `t('Türkçe metin', { yer: tutucu })` ile geçer.

Yeni bir arayüz metni eklenince sözlüğe İngilizcesi de yazılır. Unutulursa `test/dil.spec.js` yakalar: İngilizce sayfada görünen her metni ve ipucunu Türkçe harf ve sözcük için tarar. Testler Türkçe tarayıcı diliyle koşar (`playwright.config.js`, `locale`).

## Yazım kuralları

- JavaScript parçaları iki boşluk girintilidir (tek bir sarmalayıcı işlevin içinde dururlar).
- Arayüz metinleri ve açıklama satırları Türkçedir.
- `araclar/olc.js`, sayfayı telefon boyutunda açıp tuş genişliğini ve klavyenin konumunu ölçer.
- Playwright'ın tarayıcısı ortamda yoksa ya da sürümü uymuyorsa `KILISE_CHROMIUM=/yol/chrome npm test` ile başka bir Chrome kullanılır.
- Testlerde hizmet çalışanı kapalıdır (`playwright.config.js`); internetsiz çalışma testi onu kendi bağlamında açar.
