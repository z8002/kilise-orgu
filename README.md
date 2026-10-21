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

### 15. Adeste Fideles, *O Come, All Ye Faithful* (Wade, 1751)

Noel ilahisi, Sol majör. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1220)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **2 · İlahi**; nakarat için **5 · Plenum**. 4/4'lük: her grup bir ölçü.

```
1.  T   T — W T   Y — W —   U Y U I   U — Y T
2.      T — 5 E   5 T Y U   5 — E·W   W ———
3.      O — I U   I — U —   Y U T Y   5·E W  U
4.      U Y U I   U — Y U   U Y U I   U — Y U
5.      I U Y T   5 — T I   U — Y·T   T ———
```

- 1. satırın başındaki tek `T` ön vuruştur ("Gel-").
- 3. satırın sonundaki `U`, nakarata ("Ve-nite adoremus") girişin ön vuruşudur. 4. satır nakaratın kendisidir.
- Nakaratta ses giderek büyür: 4. satırda **5 · Plenum**'a, 5. satırda **6 · Tutti**'ye geçebilirsin.

### 16. Air, *G Teli Üzerine Arya*, BWV 1068 (Bach)

Orkestra Süiti No. 3'ün ünlü ağır bölümü, Re majör. Üst ses (flüt düzenlemesi), [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1534)'teki Bach-Gesellschaft kaynaklı telif dışı nota üzerinden nota nota çevrildi; küçük vurgu notaları atlandı. Registrasyon: **1 · Dua** ya da **3 · Flüt solo**. Çok yavaş ve bağlı çal.

Melodi yüksekte olduğu için **başlamadan bir kez `↑` bas** (Oktav kutusunda Do4 – Sol6 yazmalı). Bu konumda alt sıradaki `N` La4, `J` La♯4, `M` Si4'tür; geri kalan notalar üst sıradadır. Bitince `↓` ile geri dön.

1. bölüm (iki kez):

```
1.  5 ————
2.  U·T·E·W·2·W   2   N
3.  Y ——   5·Q·M·E·3·Y·T
4.  T ——   E·M·N·W·2·T·5
5.  5 —   6·Y   W   W·E·5   E·E·W
6.  2·M·M·2·W   2·M   N ——
```

2. bölüm (iki kez):

```
 7.  2 —   W·2·M·2·N   Y —   Q
 8.  M   U·Y·T·5   T —   5·E·W·2·M
 9.  J·M   2·W   E·5   T —   5
10.  E·W·2·M·2·W·E·W   M ——
11.  W —   5·E·W   U —   Y·6
12.  5·E·Y   N   M·2·W   2·M   N —
13.  W —   5·E   E —   T·5
14.  5 —   Y·T   T ——
15.  N —   2·E·T·T·E   5 —   T·Y
16.  W —   5·Y·I   U —   W
17.  2·E   T   M·N   E·5·T   5·E
18.  W·2·M   2·W·2·W   W ———
```

- Uzun notalar (`5 ————`, `Y ——`) sonraki hızlı grup başlayana kadar basılı kalır; Bach'ın bu parçası uzun tutulan notalarla ünlüdür.
- `·` ile bağlı gruplar tek bir akıcı süs gibi geçer.
- `Q` burada Do5 (natürel), `I` Do6'dır. 3. satırdaki `Q` ve 16. satırdaki `I` notada natürel işaretlidir.
- `2`, `3`, `6` tuşları notadır (Do♯5, Re♯5, Sol♯5), satır numarası değil.

### 17. Hallelujah, *Mesih* (Händel, 1741)

*Messiah* oratoryosunun ünlü korosu, Re majör. Soprano partisinin açılışı, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=459)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **6 · Tutti**.

```
1.  O·Y   U·Y   (sus)                                    Hal-le-lu-jah!
2.  O·Y   U·Y   (sus) O·O   O O   (sus) O·O   O O   (sus) O
3.  9 O —   9 O —   (sus)

4.  P·Y   -·P   (sus)
5.  P·Y   -·P   (sus) P·P   - P   (sus) P·P   - P   (sus) P
6.  -·P   O   9   (sus)

7.  Y —   U   9                                          For the Lord God
8.  O W   O·O   9                                        om-ni-po-tent
9.  U —   Y   (sus) P·P                                  reign-eth
10. O 9   (sus) P·P   O 9   (sus) P·P   - P   (sus) P·P   - P
```

- `O·Y`: ilk nota uzun (bir buçuk vuruş), ikincisi kısa. `U·Y` iki eşit kısa nota.
- `O·O` ve `P·P` ikilileri çok hızlı ön vuruşlardır ("Hal-le-").
- `-` tuşu notadır (Fa♯5), uzatma işareti değil. `9` Do♯5'tir.
- 8. satırdaki `W` bir oktav aşağıya (Re4) atlar.

### 18. Hark! The Herald Angels Sing (Mendelssohn, 1840)

Noel ilahisi, Fa majör. Ezgi Mendelssohn'un, söz Charles Wesley'nin. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1261)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **2 · İlahi**; 7. satırdan sonra **6 · Tutti**. 4/4'lük: her satır iki ölçü.

```
 1.  Q  R  R·E   R  Y  Y  T         Hark! the herald angels sing
 2.  I  I  I·7   Y  T  Y —          "Glory to the newborn King;
 3.  Q  R  R·E   R  Y  Y  T         Peace on earth, and mercy mild,
 4.  I  T  T·E   E  W  Q —          God and sinners reconciled!"
 5.  I  I  I  R   7  Y  Y  T        Joyful, all ye nations, rise,
 6.  I  I  I  R   7  Y  Y  T        Join the triumph of the skies;
 7.  O  O  O  I   7  Y  7 —         With th'angelic host proclaim,
 8.  T  Y·7  I·R   R  T  Y —        "Christ is born in Bethlehem!"
 9.  O·O  O  I   7  Y  7 —          Hark! the herald angels sing,
10.  T  Y·7  I·R   R  T  R —        "Glory to the newborn King!"
```

- `7` tuşu notadır (Si♭4), satır numarası değil.
- 8. ve 10. satırdaki `Y·7` iki eşit kısa nota, `I·R` ise uzun-kısa.

### 19. Holy, Holy, Holy, *Nicaea* (Dykes, 1861)

Kilisede en çok söylenen ilahilerden biri, Re majör. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1284)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **5 · Plenum**. 4/4'lük, ağır ve görkemli: her satır iki ölçü.

```
1.  W  W  5  5   Y —  Y —           Ho-ly, ho-ly, ho-ly!
2.  U —  U  U   Y —  5 —
3.  Y·Y  Y  Y   O —  9  Y
4.  E  Y  U·Y   Y ———

5.  W  W  5  5   Y —  Y —
6.  U·U  U  U   Y —  Y —
7.  O —  Y  Y   U —  5 —
8.  T  E  E·W   W ———
```

- `9` tuşu notadır (Do♯5).
- İlk satır parçanın adı gibi söylenir: üç kez "Holy".

### 20. Ein feste Burg ist unser Gott (Luther, 1529)

Reform kiliselerinin marşı sayılan Luther korali, Do majör. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1237)'teki telif dışı nota üzerinden nota nota çevrildi; bu, bugün ilahi kitaplarında yaygın olan düz ritimli sürümdür. Registrasyon: **5 · Plenum**; son iki satırda **6 · Tutti**. 4/4'lük.

```
1.  I   I  I  T·Y  U   I·U  Y  T  I   U  Y  T  Y   R·E  W  Q
2.  I   I  I  T·Y  U   I·U  Y  T  I   U  Y  T  Y   R·E  W  Q

3.  Q   T  Y  T  5   T ——  Q   T  T  Y  U   I ——  U
4.      I  U  Y  Y   T ——  Y   Y  T  Y  R   E ——  I
5.      U  Y  T  Y   R·E  W  Q
```

- Satır başlarındaki tek notalar (`I`, `Q`) ön vuruştur.
- `T·Y`, `I·U`, `R·E` iki eşit kısa nota.

### 21. Greensleeves, *What Child Is This* (16. yüzyıl)

İngiliz halk ezgisi; Noel'de *What Child Is This?* sözleriyle söylenir. Mi minör. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1247)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **3 · Flüt solo** ya da **1 · Dua**. 6/8'lik, sallanır gibi: her ölçüde "uzun-kısa" ritmi tekrar eder.

```
1.  E   T  Y  U·I  U   Y  5  W·E  5   T  E  E·3  E   5 —  M  E
2.      T  Y  U·I  U   Y  5  W·E  5   T·5  E  3·2  3   E —  E
3.      O —  O·9  U   Y  5  W·E  5   T  E  E·3  E   5  3  M
4.      O —  O·I  U   Y  5  W·E  5   T·5  E  3·2  3   E —  E
```

- 1. satırdaki ilk `E` ön vuruştur.
- `M` alt sıradadır (Si3).
- `3` (Re♯4) ve `2` (Do♯4) tuşları notadır. `9` Do♯5'tir; 3. satırda Do♯, 4. satırda Do natürel (`I`) çalınır.
- 3. ve 4. satırlar nakarattır ("This, this is Christ the King").

### 22. Joy to the World, *Antioch* (Händel / Mason, 1839)

Noel ilahisi, Re majör. Ezgi Lowell Mason'ın Händel'den uyarlamasıdır. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1223)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **6 · Tutti**. 2/4'lük, neşeli ve hızlı.

```
1.  O  9·U   Y·T   5  E   W·Y         Joy to the world! the Lord is come;
2.  U·U   9·9   O·O                   Let earth receive her King;
3.  O·9  U·Y   Y·T  Y·O
4.  O·9  U·Y   Y·T  5·5
5.  5·5  5·5·T   Y —  T·5
6.  E·E  E·E·5   T —  5·E
7.  W  O  U   Y·T  5·T   5  E   W ——
```

- Açılış (`O 9·U Y·T 5 E W`) yukarıdan aşağı inen bir gamdır; ilk dört notayı tören havasında, geniş çal.
- 7. satırın başındaki `W` kısa, ardından gelen `O` uzundur.
- `9` tuşu notadır (Do♯5).

### 23. O Come, O Come, Emmanuel, *Veni Emmanuel* (15. yüzyıl)

Advent ilahisi, Mi minör. Fransız ortaçağ ezgisi, Thomas Helmore'un 1856 düzenlemesi. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1300)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **1 · Dua**; nakarat (5. satır) için **5 · Plenum**. Ağır ve düzgün: her tuş eşit bir kısa vuruş, `—` olanlar uzun.

```
1.  E   T  U  U  U  Y  I  U  Y   T —  Y       O come, O come, Emmanuel,
2.      U  T  E  T  Y  5  E  W   E —  Y       And ransom captive Israel,
3.      Y  E  E  5  T —  5  E   W —  T        That mourns in lonely exile here
4.      Y  U  U  U  Y  I  U  Y   T —  O       Until the Son of God appear.
5.      O —  U   U —  U                       Rejoice! Rejoice!
6.      Y  I  U  Y  T  Y  U  T               Emmanuel shall come to thee,
7.      E  T  Y  5  E  W  E ———              O Israel.
```

- 1. satırın başındaki `E` ön vuruştur.

### 24. Abide with Me, *Eventide* (Monk, 1861)

Akşam ilahisi; cenaze ve anma törenlerinde de çalınır. Mutopia'daki nota Mi♭ majörden Re majöre aktarılmış; burada da Re majör. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1241)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **1 · Dua**. Çok yavaş: her satır iki ölçü.

```
1.  5 —  5  E   W —  Y —          Abide with me; fast falls the eventide;
2.  U  Y  Y  T   5 ———
3.  5 —  T  Y   U —  Y —
4.  T  E  5  6   Y ———

5.  5 —  5  E   W —  Y —
6.  Y  T  T  5   E ———
7.  E —  5  T   5  E  W  T
8.  5 —  E —   W ———
```

- `6` tuşu notadır (Sol♯4), 4. satırda bir kez geçer.

### 25. Lobe den Herren, *Praise to the Lord, the Almighty* (1665)

Alman korali, Fa majör. Stralsund ilahi kitabından (1665), William S. Bennett'in 1864 düzenlemesi; Mutopia'daki nota Sol majörden Fa majöre aktarılmış. Soprano partisi, [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1256)'teki telif dışı nota üzerinden nota nota çevrildi. Registrasyon: **2 · İlahi**; son iki satırda **5 · Plenum**. 3/4'lük.

```
1.  R  R  I   Y·T  R   E  W  Q   W  E  R   T ——   R ——       Praise to the Lord, the Almighty,
2.  R  R  I   Y·T  R   E  W  Q   W  E  R   T ——   R ——       the King of creation!
3.  I  I  I   O ——   Y  7  I   I·7  Y   T ——
4.  Q  W  E   R  T  Y   T ——   R ——
```

- `Y·T` ve `I·7`: ilk nota uzun (bir buçuk vuruş), ikincisi kısa.
- `7` tuşu notadır (Si♭4).
- 4. satır baştaki `Q`'dan (Do4) başlayıp adım adım yükselir.

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
- *Adeste Fideles* notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1220), kamu malı.
- *Air* (BWV 1068) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1534), kamu malı.
- *Hallelujah* (*Messiah*) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=459), kamu malı.
- *Hark! The Herald Angels Sing* (Mendelssohn ezgisi) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1261), kamu malı.
- *Holy, Holy, Holy* (*Nicaea*) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1284), kamu malı.
- *Ein feste Burg* notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1237), kamu malı.
- *Greensleeves* notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1247), kamu malı.
- *Joy to the World* (*Antioch*) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1223), kamu malı.
- *O Come, O Come, Emmanuel* (*Veni Emmanuel*) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1300), kamu malı.
- *Abide with Me* (*Eventide*) notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1241), kamu malı.
- *Lobe den Herren* notası: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1256), kamu malı.
