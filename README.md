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

### 9. Sessiz Gece, *Stille Nacht* (Gruber, 1818)

Noel ilahisi, Do majör. Registrasyon: **1 · Dua**. Sakin, sallanır gibi bir ritimle çal.

```
 1.  T·Y T   E ———        Sessiz gece
 2.  T·Y T   E ———        kutsal gece
 3.  O — O   U ———
 4.  I — I   T ———

 5.  Y — Y   I·U Y
 6.  T·Y T   E ———
 7.  Y — Y   I·U Y
 8.  T·Y T   E ———

 9.  O — O   Ğ·O U
10.  I ———   P ———
11.  I·T E   T·R W
12.  Q —————
```

Son satırdaki `Q`'yu yankı sönene kadar tut. Son iki satırda **2 · İlahi**'ye geçersen kapanış daha dolgun duyulur.

### 10. Amazing Grace (ilahi, 1835)

*New Britain* ezgisi, Sol majör. Registrasyon: **4 · Kornet** ya da **2 · İlahi**. 3/4'lük: her satır bir cümle.

```
1.  W   T — U·T   U — Y   T — E   W — W
2.      T — U·T   U — Y   O —————
3.  U   O — U·T   U — Y   T — E   W — W
4.      T — U·T   U — Y   T —————
```

Satır başındaki tek notalar (`W`, `U`) bir sonraki cümleye girişin ön vuruşudur. İkinci kıtada **5 · Plenum**'a geçersen ilahi daha görkemli duyulur.

### 11. Carol of the Bells, *Şçedrık* (Leontoviç, 1916)

Ukrayna halk ezgisinden doğan Noel şarkısı, Sol minör. Leontoviç'in 1916 koro düzenlemesinin soprano partisi, [Vikipedi'deki nota](https://en.wikipedia.org/wiki/Shchedryk_(song)#Melody) üzerinden nota nota çevrildi. Registrasyon: **4 · Kornet**, zile benzer bir ses verir. 3/4'lük: her satır bir ölçü.

```
A.  7   Y·7   T                   ana motif: 16 kez

B.  O   I·O   7                   4 kez
    (iki sesli: 7+O   Y+I · 7+O   T+7)

C.  Ü   Ü·Ü   Ğ·0
    O   O·O   I·7
    I   I·I   O·I
    T   T·T   T

D.  W·E·5·T·Y·7
    I·O   I   7                   D kısmını 2 kez çal

E.  7   Y·7   T                   4 kez
```

- `7 Y·7 T`: ilk nota bir vuruş, ortadaki ikisi yarım vuruş, son nota bir vuruş ("Şçed-rık şçed-rık").
- B kısmında alto ana motifi çalmaya devam eder. İki sesli satırda iki notaya birlikte bas (`7+O`).
- C kısmındaki `0` tuşu notadır (Re♯5 / Mi♭5).
- D kısmındaki ilk satır altı hızlı notalık yükselen bir koşudur.
- Notada A–E iki kez çalınır. İkinci seferin sonunda `T`'yi üç ölçü boyunca tut, ardından **O I·O T** notalarını giderek yavaşlatarak bitir.

### 12. Jesu, Joy of Man's Desiring, BWV 147 (Bach)

*Jesus bleibet meine Freude* korali, Sol majör. Burada yalnızca en tanınan açılış teması var; bu tema henüz bir nota kaynağıyla karşılaştırılmadı. Registrasyon: **3 · Flüt solo** ya da **2 · İlahi**.

Melodi kesintisiz üçlüler hâlinde akar. Her üç notalık grubu eşit ve bağlı çal; gruplar arasında durma.

```
1.  T Y U    O I I    P O O
2.  Ü - Ü    O U T    Y U I
3.  O ———
```

2. satırdaki `-` tuşu notadır (Fa♯5), uzatma işareti değil. Kapanış için son `O`'dan sonra **T + U + O** ile Sol majör akoruna bas.

### 13. Ave Maria, D 839 (Schubert)

*Ellens dritter Gesang*. Ses partisi, orijinal tonunda (Si♭ majör), [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1054)'teki telif dışı nota üzerinden nota nota çevrildi; küçük süs notaları atlandı. Registrasyon: **1 · Dua** ya da **3 · Flüt solo**. Çok yavaş çal (4/4, her satır bir ölçü).

```
 1.  7 —     Y·7       O ——   I
 2.  7       (sus)     I      7·Y·T·Y
 3.  7       (sus) O   O·I·7  Y·T·O·P
 4.  O —     9·Y       I·7    Y·I·O   0·I·Y

 5.  7 —     O·I       I·Y    T·U·O   Ğ·O·U
 6.  I ——    T·Y·7·Y·T        R       (sus) R
 7.  I·I     I·U·I·O·I·O      7       (sus) 7
 8.  I·I     I·U·I     0·O·I  7 —     (sus) 7

 9.  I·I     O·O       O·I·O  0   0   (sus) T
10.  I·I     7·Y·7     9·I·7  I ——
11.  7 —     Y·7       O ——   I
12.  7 ———
```

- `·` ile bağlı uzun gruplar tek nefeste, akıcı çalınır.
- `9` (Do♯5 / Re♭5) ve `0` (Re♯5 / Mi♭5) tuşları notadır, satır numarası değil.
- Şarkının üç kıtası da aynı ezgiyle söylenir; isteğe göre baştan tekrarla.

### 14. Düğün Marşı, *Bir Yaz Gecesi Rüyası* (Mendelssohn)

Kiliseden çıkışta çalınan düğün marşı, Do majör. Théodore Dubois'nın org düzenlemesinin üst sesi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2198)'teki nota (Durand, Paris) üzerinden nota nota çevrildi. Registrasyon: **6 · Tutti**.

Melodi yüksekte olduğu için **başlamadan bir kez `↑` bas** (Oktav kutusunda Do4 – Sol6 yazmalı). Bu konumda alt sıra Do4'ten, üst sıra Do5'ten başlar. Bitince `↓` ile geri dön.

Trompet çağrısı (alt sıra):

```
Z·Z·Z   Z —         Z·Z·Z   Z —         Z·Z·Z
C   C·C·C   C   C·C·C
B   B·B·B   B
```

Ana tema (her satır bir ölçü):

```
1.  I —    U·5
2.  Y   T   R   W
3.  Q —    W   B·W
4.  E   (sus)   Q·E·T

5.  I —    U·5
6.  Y   T   R   W
7.  Q —    E   W·E
8.  W —    Q
```

Orta bölüm:

```
 9.  Q —    Q·Q
10.  E   W   M   B
11.  B·Q    Q·E
12.  E   W   M   B
13.  B·E    E·T
14.  T —    R   E
15.  W   2·E   W   N·Q
16.  M   T   Y   U
```

Ardından ana temayı (1–8) bir kez daha çal ve **Q + E + T** ile Do majör akorunda bitir.

- Çağrıdaki `Z·Z·Z` üç hızlı nota (üçleme), ardından gelen nota bir vuruş.
- `·` ile bağlı ikililerde ilk nota uzun, ikincisi kısa (`U·5`: Si yarım vuruştan uzun, Fa♯ kısa).
- 3. ve 7. satırların başındaki uzun `Q` notada titremeli (trill) yazılıdır; istersen `Q` ile `W`'yi hızla değiştirerek çal.
- Bu konumda `B` Sol4, `M` Si4, `N` La4'tür.

## Nasıl çalışıyor

Sesler kayıt değil, tarayıcıda Web Audio API ile üretiliyor:

- Her boru tipi (prinsipal, kapalı flüt, açık flüt, yaylı, dilli) kendi harmonik yapısıyla bir `PeriodicWave` olarak tanımlı.
- Her register kendi ayak yüksekliğinde (16′ = bir oktav aşağı, 2⅔′ = oktav + beşli yukarı…) ayrı osilatörlerle çalar. Mikstür yüksek notalarda gerçek orglardaki gibi geri kırılır.
- Borular birbirinden birkaç sent farklı akortlanır. Kalın borular geç, ince borular hızlı "konuşur". Her notanın başında kısa bir hava sesi ("chiff") duyulur.
- Kilise akustiği, zamanla kararan yapay bir darbe tepkisiyle `ConvolverNode` üzerinden üretilir.

## Kaynaklar

- *Schafe können sicher weiden* notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1794), kamu malı.
- *Ave Maria* (D 839) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1054), kamu malı.
- *Düğün Marşı* (Dubois org düzenlemesi) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2198), CC BY-SA 4.0.
- *Şçedrık* (Leontoviç) notası: [Vikipedi](https://en.wikipedia.org/wiki/Shchedryk_(song)#Melody), CC BY-SA 4.0.
