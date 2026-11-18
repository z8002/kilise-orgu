# Geliştirme programı

Kilise Orgu'nun özgün sürümü [`v1/`](v1/) klasöründe saklıdır. Bu dosya, üzerine yapılan geliştirmenin programını ve durumunu tutar.

| Aşama | Kazanım | Durum |
|---|---|---|
| 0. Temel | Araçlar depoda, her değişiklik kendiliğinden denetleniyor | Bitti |
| 1. Parça verisi | 30 parça programın okuyabildiği biçimde; 25'i kaynağıyla doğrulandı | Bitti |
| 2. Şarkı çalar | Dinle, öğren, eşlikli çal | Bitti |
| 3. Telefon | Parmakla çalınabilen klavye, internetsiz kullanım | Bitti |
| 4. Daha gerçek org | İki klavye, pedal, yeni sesler | Bitti |
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

- [x] Parça listesi: ada ve besteciye göre arama, türe göre süzme.
- [x] Dinle: program parçayı tempoda çalar; registrasyon, oktav ve sallanan ritim parçaya göre ayarlanır, tuşlar ve borular yanar.
- [x] Öğren: sıradaki tuş yanar, doğru tuşa basınca ilerler; yanlış tuşlar sayılır.
- [x] Eşlik: her el için "Program çalsın", "Ben çalacağım" ya da "Sessiz".
- [x] Hız (%40–150), bölüme atlama, bölüm yineleme.
- [x] Parça bağlantıları (`kilise-orgu.html?parca=…`); README'de her parçada "▶ Programda aç".
- [x] Testler: sayfadaki çözücü Python çözücüsüyle aynı çizelgeyi üretiyor; otuz parçanın her biri baştan sona doğru notalarla çalınıyor; Öğren adım adım ilerliyor.

## Aşama 3: Telefon

- [x] Çalma görünümü: dar dokunmatik ekranda klavye ekranın altına sabitlenir ve bir pencere gösterir; beyaz tuşlar en az 44 piksel (320 piksellik telefonda da). `‹` `›` pencereyi bir oktav kaydırır, kenarda oktav ayarı kendiliğinden değişir. Klavyenin üstünde Tut ve çal düğmeleri.
- [x] Öğren ve eşlikte pencere, yanan tuşa ve sıradaki birkaç adıma kendiliğinden kayar. Parça açılınca pencere ezginin başına gelir.
- [x] Yatay tutuş: daha çok tuş (863 pikselde 18 beyaz tuş), daha ince klavye; "Tam ekran" düğmesi.
- [x] Telefona göre yardım: dokunmatik ekranda parmakla çalma, kaydırma, ana ekrana ekleme ve hafif mod anlatılır; klavye tuşu tabloları gizlenir.
- [x] Ana ekrana ekleme (manifest, simgeler) ve internetsiz çalışma (`sw.js`). İlk açılışta inen yazı tipleri de saklanır.
- [x] Hafif mod: Mikstür iki sıra, rüzgâr hışırtısı yok, en çok 12 ses, yankı en çok 2,4 saniye. Çalarken ekran kararmaz; iPhone'da sessiz anahtarı sesi kesmez.

Bulunan hata: parça açıkken çalar düğmeleri 360 piksellik ekrana sığmıyor, bütün sayfa yana taşıyordu (Aşama 2'den). Izgara sütunları içeriğe göre büyümeyecek biçimde düzeltildi; bunu bir test denetliyor.

## Aşama 4: Daha gerçek bir org

- [x] İki klavye: I. manuel ve panjurlu Sandık (II. manuel). Bilgisayar klavyesinin üst sırası Sandık'ı çalar; ekranda iki manuel. Telefonda tek klavye, çaldığı bölüm seçilir.
- [x] Pedal: ahşap pedal klavyesi (Do2 – Sol3), dört register. Otomatik pedal: I. manuelin en kalın notası pedalda da çalar; şarkı çalarda bas eli.
- [x] Kuplörler (II → I, I → P, II → P) ve Sandık panjuru. Aynı nota iki bölümde birden basılınca her boru bir kez öter.
- [x] Kendi kombinasyonunu kaydetme: "Ayarla" ve K1–K4; üç bölümün registerleri ve kuplörler saklanır.
- [x] Akort sistemleri (eşit, Werckmeister III, Kirnberger III, ¼ koma ortalama ton, Pisagor), beşliler zincirinden hesaplanır; diyapazon (415–466 Hz); stereo yerleşim (Do ve Do♯ tarafları).
- [x] Yeni registerler: Sandık'ta Rohrflüt, Salisyonal, Unda maris, Travers flüt, Flajole, Seskialtera, Obua, Vox humana, Tremolo; pedalda Subbas, Oktavbas, Koralbas, Trombon. Obua ve Vox humana için yeni dalga biçimleri.
- [x] Caz orgu (`caz-orgu.html`): dokuz çekme çubuğu, hazır sesler, perküsyon, vibrato ve koro, dönen hoparlör, sürüş, tuş tıkırtısı. Kilise orgusuyla aynı şablondan üretilir; klavye, telefon görünümü, şarkı çalar ve internetsiz çalışma ortak.

## Aşama 5: Dış dünya

- [x] MIDI klavye: nota, sürdürme pedalı, ifade pedalı (panjur), program değişimi (pistonlar, K1–K4, caz hazır sesleri), kanala göre bölüm; caz orgunda modülasyon tekerleği dönen hoparlörü hızlandırır. Bir kez bağlanınca sonraki açılışlarda kendiliğinden bağlanır.
- [x] Kayıt: notalar ve ses. MIDI dosyası (biçim 0, bölüme göre kanal), ses dosyası (webm/ogg/m4a), sayfada geri çalma.
- [x] Kendi parçanı ekleme: Türkçe ya da İngilizce nota adlarıyla yazılır, yanlış yazım yeri gösterilerek reddedilir; tarayıcıda saklanır, iki sayfada da listede; Dinle, Öğren ve eşlik çalışır. Oktav, sağ el bilgisayar klavyesinin üst sırasına düşecek biçimde kendiliğinden seçilir.
- [ ] İngilizce arayüz.
- [x] Paylaşım önizlemesi: bağlantı paylaşılınca her sayfa kendi başlığını, açıklamasını ve 1200 × 630 görselini gösterir (Open Graph, Twitter kartı). Görseller `node araclar/simgeler.js` ile çizilir.
