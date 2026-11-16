# Geliştirme

`kilise-orgu.html` elle düzenlenmez: `kaynak/` klasöründeki parçalardan üretilir. Dağıtılan şey yine tek bir HTML dosyasıdır.

## Klasörler

| Yer | İçerik |
|---|---|
| `kaynak/sablon.html` | Sayfanın iskeleti. `/*@ekle yol*/` yazan satırlar o dosyanın içeriğiyle değişir |
| `kaynak/stil/` | CSS |
| `kaynak/js/` | JavaScript parçaları. Şablondaki sırayla tek bir `<script>` içine eklenir ve aynı kapsamı paylaşır |
| `araclar/` | Derleme ve ölçüm betikleri |
| `test/` | Otomatik testler (Playwright) |
| `notalar/` | Nota dosyaları (LilyPond, PDF) |
| `v1/` | Özgün sürüm. Değiştirilmez; bir test dosyanın özetini denetler |

## Değişiklik yapmak

1. `kaynak/` altındaki dosyayı düzenle.
2. `python3 araclar/derle.py` ile `kilise-orgu.html` dosyasını yeniden üret.
3. `npm test` ile testleri çalıştır.
4. Kaynağı ve üretilen dosyayı birlikte gönder. GitHub'daki denetim, üretilen dosya güncel değilse hata verir.

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

Testlerdeki tuş ve piston tabloları sayfanın kodundan kopyalanmadı; README'deki tabloların bağımsız bir kopyasıdır.

## Yazım kuralları

- JavaScript parçaları iki boşluk girintilidir (tek bir sarmalayıcı işlevin içinde dururlar).
- Arayüz metinleri ve açıklama satırları Türkçedir.
- `araclar/olc.js`, sayfayı telefon boyutunda açıp tuş genişliğini ve klavyenin konumunu ölçer.
