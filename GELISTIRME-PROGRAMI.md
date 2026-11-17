# Geliştirme programı

Kilise Orgu'nun özgün sürümü [`v1/`](v1/) klasöründe saklıdır. Bu dosya, üzerine yapılan geliştirmenin programını ve durumunu tutar.

| Aşama | Kazanım | Durum |
|---|---|---|
| 0. Temel | Araçlar depoda, her değişiklik kendiliğinden denetleniyor | Bitti |
| 1. Parça verisi | 30 parça programın okuyabildiği biçimde; 25'i kaynağıyla doğrulandı | Bitti |
| 2. Şarkı çalar | Dinle, öğren, eşlikli çal | Bekliyor |
| 3. Telefon | Parmakla çalınabilen klavye, internetsiz kullanım | Bekliyor |
| 4. Daha gerçek org | İki klavye, pedal, yeni sesler | Bekliyor |
| 5. Dış dünya | MIDI klavye, kayıt, kendi parçanı ekleme | Bekliyor |

## Aşama 0: Temeli sağlamlaştır

- [x] Özgün sürüm `v1/` klasöründe saklandı.
- [x] Kaynak parçalara ayrıldı; derleme çıktısı özgün dosyayla bayt bayt aynı.
- [x] Otomatik testler: tuşlar, pistonlar, ayarlar, gerçek ses çıkışı, dokunmatik.
- [x] Baladın nota dosyaları `notalar/` klasöründe.
- [x] Lisans dosyası.
- [x] GitHub'da her gönderimde çalışan denetim.

## Aşama 1: Parçaları veriye çevir

- [x] Parça dosyasının biçimi ([parcalar/README.md](parcalar/README.md)).
- [x] 30 parçanın aktarımı. 24 parça kaynak notasıyla nota nota ve süre süre otomatik karşılaştırıldı; Toccata kaynağa bakılarak elle denetlendi.
- [x] README'nin parça bölümü dosyalardan üretiliyor; yazım kuralı tek.
- [x] Her parçanın her tuşu sayfada basılıp denetleniyor.
- [ ] Dört parça hâlâ ezberden: Gelin Korosu, Tristan Prelüdü, Valkürlerin Uçuşu, Jesu Joy. Mutopia'da notaları yok; başka bir kaynağa ulaşılınca karşılaştırılacak.

Aktarım sırasında bulunan hatalar: Amazing Grace'in üçüncü satırı yanlıştı; Tristan'ın ikinci cümlesi Do4 yerine Si3'ten başlamalıydı; Old Hundredth ve Gelin Korosu'nun ritmi düzeltildi.

## Aşama 2: Şarkı çalar

- [ ] Parça listesi.
- [ ] Dinle.
- [ ] Öğren.
- [ ] Eşlik.
- [ ] Parça bağlantıları.

## Aşama 3: Telefon

- [ ] Çalma görünümü (tuşlar en az 44 piksel).
- [ ] Yatay tutuş.
- [ ] Telefona göre yardım.
- [ ] Ana ekrana ekleme ve internetsiz çalışma.
- [ ] Performans ve hafif mod.

## Aşama 4: Daha gerçek bir org

- [ ] İki klavye.
- [ ] Pedal ve otomatik pedal.
- [ ] Kuplör ve swell.
- [ ] Kendi kombinasyonunu kaydetme.
- [ ] Stereo yerleşim, akort sistemleri, diyapazon, yeni registerler.
- [ ] Caz orgu.

## Aşama 5: Dış dünya

- [ ] MIDI klavye.
- [ ] Kayıt.
- [ ] Kendi parçanı ekleme.
- [ ] İngilizce arayüz.
