# Kilise Orgu

Bilgisayar klavyesiyle çalınan borulu org. Tuşa basılı tuttuğun sürece borular öter; bırakınca ses kilisenin yankısında söner.

Tek bir HTML dosyası: kurulum yok, internet bağlantısı gerekmez (yalnızca yazı tipleri internetten gelir).

## Çalıştırma

**Online çal:** https://z8002.github.io/kilise-orgu/

Ya da bilgisayarına indir:

1. `kilise-orgu.html` dosyasını indir.
2. Çift tıkla; Chrome, Edge ya da Firefox'ta açılır.
3. Bir tuşa bas. Org "rüzgârı" ilk tuşta kendiliğinden açılır.

## Özellikler

- **Sürekli ses:** Tuş basılı kaldıkça nota çalar, bırakınca yankıyla söner. `Boşluk` basılıyken bıraktığın notalar da çalmaya devam eder.
- **13 register:** Gerçek org registerleri, çalarken de açılıp kapatılabilir.
- **7 kombinasyon pistonu:** Hazır registrasyonlar.
- **Mekân:** Şapel (1,8 sn), Kilise (3,6 sn), Katedral (6,5 sn) yankı süresi.
- **Boru cephesi:** Çalınan notaya göre ilgili borular parlar; kalın notalar uzun boruları yakar.
- **Türkçe Q klavye:** Ö, Ç, Ş, Ğ, Ü tuşları da nota çalar; ekrandaki tuş etiketleri klavye düzenine göre gösterilir.
- Ekrandaki klavyeye fareyle ya da dokunarak da basılabilir.

### Registerler

| Register | Ayak | Ses |
|---|---|---|
| Burdon | 16′ | Kapalı ahşap borular, bir oktav aşağıdan derin bas |
| Prinsipal | 8′ | Orgun omurgası, açık metal boruların ana sesi |
| Gedakt | 8′ | Kapalı flüt; yuvarlak ve sıcak |
| Gamba | 8′ | Dar borulu yaylı ses |
| Voix Céleste | 8′ | Hafif tiz akortlu yaylı; Gamba ile dalgalanır |
| Oktav | 4′ | Prinsipalin bir oktav üstü |
| Flüt | 4′ | Açık flüt, bir oktav yukarıda |
| Nazard | 2⅔′ | Oktav + beşli yukarıda, renkli mutasyon |
| Süperoktav | 2′ | İki oktav yukarıda prinsipal |
| Terz | 1⅗′ | İki oktav + üçlü yukarıda, kornet sesinin tuzu |
| Mikstür | IV | Dört sıra yüksek boru; plenumun taç sesi |
| Trompet | 8′ | Dilli boru; parlak tören sesi |
| Tremolo | – | Rüzgâr basıncını titreştirir |

### Kombinasyonlar

| Piston | Ad | Registerler |
|---|---|---|
| 1 | Dua | Gedakt 8′, Gamba 8′, Voix Céleste 8′ |
| 2 | İlahi | Prinsipal 8′, Gedakt 8′, Oktav 4′, Flüt 4′ |
| 3 | Flüt solo | Gedakt 8′, Flüt 4′, Tremolo |
| 4 | Kornet | Gedakt 8′, Flüt 4′, Nazard 2⅔′, Süperoktav 2′, Terz 1⅗′ |
| 5 | Plenum | Burdon 16′, Prinsipal 8′, Oktav 4′, Süperoktav 2′, Mikstür IV |
| 6 | Tutti | Tremolo ve Voix Céleste dışında hepsi |
| 0 | İptal | Bütün registerleri kapatır |

## Tuşlar

Sayfa açıldığında Oktav kutusunda **Do3 – Sol5** yazar. Aşağıdaki eşleşmeler bu konuma göredir.

**Alt sıra** (Do3 – Mi4):

| Z | S | X | D | C | V | G | B | H | N | J | M | Ö | L | Ç | Ş | . |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Do3 | Do♯3 | Re3 | Re♯3 | Mi3 | Fa3 | Fa♯3 | Sol3 | Sol♯3 | La3 | La♯3 | Si3 | Do4 | Do♯4 | Re4 | Re♯4 | Mi4 |

**Üst sıra** (Do4 – Sol5):

| Q | 2 | W | 3 | E | R | 5 | T | 6 | Y | 7 | U | I | 9 | O | 0 | P | Ğ | - | Ü |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Do4 | Do♯4 | Re4 | Re♯4 | Mi4 | Fa4 | Fa♯4 | Sol4 | Sol♯4 | La4 | La♯4 | Si4 | Do5 | Do♯5 | Re5 | Re♯5 | Mi5 | Fa5 | Fa♯5 | Sol5 |

| Tuş | İşlev |
|---|---|
| `↑` `↓` | Oktav değiştir |
| `Boşluk` | Basılıyken bırakılan notalar çalmaya devam eder |
| `Esc` | Bütün sesleri sustur |

İngilizce (US) klavyede Ö, Ç, Ş, Ğ, Ü, `-` yerine sırasıyla `,` `.` `;` `[` `]` `=` tuşları kullanılır.

## Örnek parçalar

Okuma kuralları:

- Tek başına duran tuş = bir vuruş.
- `·` ile bağlı iki tuş = iki hızlı nota (ilki biraz uzun, ikincisi kısa).
- `—` = uzun, `———` = çok uzun.
- `A + B` = iki tuşa aynı anda bas.

### 1. Neşeye Övgü (Beethoven)

En kolayı. Registrasyon: **2 · İlahi**.

```
E E R T   T R E W   Q Q W E   E . W W
E E R T   T R E W   Q Q W E   W . Q Q

W W E Q   W E R E Q   W E R E W   Q W B
E E R T   T R E W   Q Q W E   W . Q Q
```

Noktalı notayı (`E .`, `W .`) biraz uzun tut. 3. satırın sonundaki **B** alt sırada, alçak bir Sol çalar.

### 2. Toccata ve Füg Re minör, BWV 565 (Bach)

Kilise orgunun en ünlü açılışı. Registrasyon: **6 · Tutti**.

```
1. cümle (üst sıra):   Y T Y  ...  T R E W 2 W
2. cümle (alt sıra):   N B N  ...  C V S X
   ↓ bas (oktav iner)
3. cümle (alt sıra):   N B N  ...  B V C X S X
   ↑ bas (geri dön)
```

Baştaki `Y T Y` ve `N B N` üçlüleri çok hızlı bir süstür. Her cümlenin son notasını 2–3 saniye tut. Bitiş için **X V N** ile Re minör akor.

### 3. Gelin Korosu, *Lohengrin* (Wagner)

Düğünlerde çalınan gelin marşı. Registrasyon: **6 · Tutti**.

```
T    I · I   I ———
T    O · U   I ———
T    I · Ğ   Ğ · P   O · I   U · I   O ———
T    I · I   I ———
T    O · U   I ———
```

İlk iki satır melodinin en tanınan kısmıdır; son iki satır, parçayı Do'da bitirmek için eklenmiş tekrardır. Başlamadan `↓` basarsan daha dolgun duyulur.

### 4. *Tristan und Isolde*, Prelüd (Wagner)

Ünlü Tristan akoru. Registrasyon: **1 · Dua**. Çok yavaş çal, cümle aralarında sessizlik bırak.

Yalnızca melodi:

```
N   R   E   3 ———      (sus)      6   Y   7   U ———
Q   6   T   5 ———      (sus)      U   I   9   O ———
```

Akorlarla:

```
1.  N  R  E  3        3'ü bırakma, V M 6'yı da ekle    → Tristan akoru
    6  Y  7  U        U'ya basarken C H W'ye de bas    → çözülme

2.  Q  6  T  5        5'i bırakma, H W U'yu da ekle    → Tristan akoru
    U  I  9  O        O'ya basarken B M R'ye de bas    → çözülme
```

Klavye dört tuşu birden algılamazsa `Boşluk`'u basılı tutup akoru tuş tuş kur.

### 5. Valkürlerin Uçuşu (Wagner)

Registrasyon: **6 · Tutti**. Sol el alt sırada (G, M, N), sağ el üst sırada (W, 5, Y).

```
G   M · G   M   W ———   M ———
M   W · M   W   5 ———   W ———
W   5 · W   5   Y ———   N ———
N   W · N   W   5 —————————
```

Ritim: "ta-TAAM-ta-TAAM, TAAAM, TAAAM". Başlamadan `↓` basarsan daha karanlık ve heybetli duyulur.

### 6. Kanon Re majör (Pachelbel)

İki elle. Registrasyon: **2 · İlahi**.

Önce sol elle bası bir kez tek başına çal:

```
Ç   N   M   G   B   X   B   N
```

Sonra bası sürdür ve her bas notasıyla birlikte sağ elin notasına bas:

```
   1. tur        2. tur
   Ç + -         Ç + O
   N + P         N + 9
   M + O         M + U
   G + 9         G + Y
   B + U         B + T
   X + Y         X + 5
   B + U         B + T
   N + 9         N + E
```

Çiftleri birbirine yapıştırarak çal; yeni çifte bastıktan sonra eskisini bırak.

### 7. Old Hundredth, "Yüzüncü Mezmur" ilahisi (1551)

Plenumla çalınan klasik kapanış ilahisi. Registrasyon: **5 · Plenum**. Sağ ve sol el aynı melodiyi bir oktav arayla, aynı anda çalar.

```
         sağ el (üst sıra)        sol el (alt sıra)
1.   T — T 5 E W T Y U —      B — B G C X B N M —
2.   U — U U Y T I U Y —      M — M M N B Ö M N —
3.   T — Y U Y T E 5 T —      B — N M N B C G B —
4.   O — U T Y I U Y T —      Ç — M B N Ö M N B —
```

Her satırın ilk ve son notası uzun. 4. satıra geçmeden **6 · Tutti**'ye basarsan ilahi zirvede biter.

### 8. Sheep May Safely Graze, BWV 208 (Bach)

*Schafe können sicher weiden*. Soprano melodisi, orijinal tonunda (Si♭ majör), [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1794)'teki telif dışı nota (Breitkopf & Härtel, 1881) üzerinden nota nota çevrildi. Registrasyon: **3 · Flüt solo**.

```
 1.  7    O·I   I —   O
 2.  0    Ü·Ğ   O     I·7
 3.  O·7  Y·T   I —   O
 4.  Y    T·R   R ———

 5.  R    6·T   T —   Y
 6.  7    O·I   Y     T·R
 7.  Ğ    Ü·Ğ   Ğ·O   I·7
 8.  Ğ    Ü·Ğ   Ğ·O   I·7

 9.  0 —  Ğ     O·I   7·I
10.  Y —  7     7 ———
11.  (sus)      Ü·0   O·I
12.  Ğ —  Ü     O —   I·7
13.  7 ———
```

İlk 4 satır en tanınan bölümdür. 12. satırın sonundaki `I·7` çok hızlı bir süs gibi geçer.

## Nasıl çalışıyor

Sesler kayıt değil, tarayıcıda Web Audio API ile üretiliyor:

- Her boru tipi (prinsipal, kapalı flüt, açık flüt, yaylı, dilli) kendi harmonik yapısıyla bir `PeriodicWave` olarak tanımlı.
- Her register kendi ayak yüksekliğinde (16′ = bir oktav aşağı, 2⅔′ = oktav + beşli yukarı…) ayrı osilatörlerle çalar. Mikstür yüksek notalarda gerçek orglardaki gibi geri kırılır.
- Borular birbirinden birkaç sent farklı akortlanır. Kalın borular geç, ince borular hızlı "konuşur". Her notanın başında kısa bir hava sesi ("chiff") duyulur.
- Kilise akustiği, zamanla kararan yapay bir darbe tepkisiyle `ConvolverNode` üzerinden üretilir.

## Kaynaklar

- *Schafe können sicher weiden* notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1794), kamu malı.
