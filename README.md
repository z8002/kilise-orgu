# Kilise Orgu

Bilgisayar klavyesiyle ya da telefonda parmakla çalınan borulu org. Tuşa basılı tuttuğun sürece borular öter; bırakınca ses kilisenin yankısında söner.

Tek bir HTML dosyası: kurulum yok, internet bağlantısı gerekmez (yalnızca yazı tipleri internetten gelir). Telefonda ana ekrana eklenebilir; bir kez açıldıktan sonra internetsiz de çalışır.

## Çalıştırma

**Online çal:** https://z8002.github.io/kilise-orgu/

Ya da bilgisayarına indir:

1. `kilise-orgu.html` dosyasını indir.
2. Çift tıkla; Chrome, Edge ya da Firefox'ta açılır.
3. Bir tuşa bas. Org "rüzgârı" ilk tuşta kendiliğinden açılır.

**Telefonda ya da tablette:** Adresi aç. Klavye ekranın altına yerleşir ve bir oktav gösterir. `‹` `›` düğmeleri klavyeyi bir oktav kaydırır. Telefonu yan çevirirsen iki oktavdan fazlası sığar.

- **Ana ekrana ekle:** Android'de Chrome menüsünden "Ana ekrana ekle" ya da "Uygulamayı yükle"; iPhone'da Safari'nin Paylaş düğmesinden "Ana Ekrana Ekle". Org bir uygulama gibi açılır ve internet olmadan da çalışır.
- **Ses cızırdıyorsa** "Hafif mod"u aç: daha az boru ve daha kısa yankıyla telefonu daha az yorar.
- iPhone'da sessiz anahtarı açıkken de ses gelir (iOS 17 ve sonrası).

**Özgün sürüm (v1):** Programın ilk hâli [`v1/`](v1/) klasöründe değiştirilmeden duruyor ve https://z8002.github.io/kilise-orgu/v1/ adresinden çalınabiliyor.

## Özellikler

- **Şarkı çalar:** 30 parçayı program kendisi çalar (Dinle) ya da sana adım adım öğretir (Öğren): sıradaki tuş yanar, doğru tuşa basınca ilerler. Bir eli programa bırakıp öbürünü kendin çalabilir, hızı düşürebilir, bir bölümü yineletebilirsin. Registrasyon ve oktav parçaya göre kendiliğinden ayarlanır.
- **Sürekli ses:** Tuş basılı kaldıkça nota çalar, bırakınca yankıyla söner. `Boşluk` basılıyken bıraktığın notalar da çalmaya devam eder.
- **13 register:** Gerçek org registerleri, çalarken de açılıp kapatılabilir.
- **7 kombinasyon pistonu:** Hazır registrasyonlar.
- **Mekân:** Şapel (1,8 sn), Kilise (3,6 sn), Katedral (6,5 sn) yankı süresi.
- **Boru cephesi:** Çalınan notaya göre ilgili borular parlar; kalın notalar uzun boruları yakar.
- **Türkçe Q klavye:** Ö, Ç, Ş, Ğ, Ü tuşları da nota çalar; ekrandaki tuş etiketleri klavye düzenine göre gösterilir.
- **Telefon ve tablet:** Ekrandaki klavyeye parmakla basılır; parmağı kaydırınca nota değişir, iki parmakla akor basılır. Dar ekranda klavye ekranın altına sabitlenir, tuşlar en az 44 piksel genişlikte kalır. Öğren'de klavye yanan tuşa kendiliğinden kayar. Çalarken ekran kararmaz.
- **Ana ekrana ekleme ve internetsiz çalışma:** Telefonda uygulama gibi kurulur; bir kez açıldıktan sonra internet olmadan da açılır.
- **Hafif mod:** Zayıf telefonlar için daha az boru, en çok 12 ses ve daha kısa yankı.
- Ekrandaki klavyeye fareyle de basılabilir.

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

<!-- PARCALAR:BASLA -->
## Örnek parçalar

Programdaki **Parçalar** düğmesi bu otuz parçayı açar: **Dinle** ile program parçayı kendisi çalar, **Öğren** ile sıradaki tuş yanar ve sen basınca ilerler. Bir eli programa bırakıp öbürünü kendin de çalabilirsin. Her parçanın altındaki "▶ Programda aç" bağlantısı parçayı doğrudan açar.

Her parçanın notaları [`parcalar/`](parcalar/) klasöründeki bir dosyada durur; aşağıdaki tuş dizileri o dosyalardan üretilir. Tuş harfleri Türkçe Q klavyeye göredir.

Okuma kuralları:

- Boşlukla ayrılan her öğe bir **birim** sürer. Birimin hangi nota değeri olduğu parçanın başında yazar.
- Tuş adı = o tuşa bas. `—` = önceki notayı tutmaya devam et. `_` = sus.
- `·` ile bağlı öğeler bir birimi eşit paylaşır: `Y·P` iki yarım, `Z·Z·Z` üçleme, `T·—·—·Y` uzun–kısa.
- `A+B` = tuşlara aynı anda bas.
- `|` ölçü çizgisidir.
- İki elli parçalarda üst satır sağ el, alt satır sol eldir; alt alta gelen öğeler aynı anda çalınır.
- "Oktav" satırı, Oktav kutusunda ne yazması gerektiğini söyler. Do3 – Sol5 açılıştaki konumdur; başka bir konum yazıyorsa başlamadan `↑` ya da `↓` ile oraya git.

| # | Parça | Zorluk | Nota |
|---|---|---|---|
| 1 | Neşeye Övgü (Ludwig van Beethoven) | kolay | kaynakla karşılaştırıldı |
| 2 | Toccata ve Füg (Johann Sebastian Bach) | orta | kaynağa bakılarak elle denetlendi |
| 3 | Gelin Korosu (Richard Wagner) | kolay | ezberden, doğrulanmadı |
| 4 | Tristan Prelüdü (Richard Wagner) | zor | ezberden, doğrulanmadı |
| 5 | Valkürlerin Uçuşu (Richard Wagner) | orta | ezberden, doğrulanmadı |
| 6 | Kanon (Johann Pachelbel) | orta | kaynakla karşılaştırıldı |
| 7 | Old Hundredth (Cenevre Mezmurlar Kitabı (Loys Bourgeois)) | orta | kaynakla karşılaştırıldı |
| 8 | Sheep May Safely Graze (Johann Sebastian Bach) | orta | kaynakla karşılaştırıldı |
| 9 | Sessiz Gece (Franz Xaver Gruber) | kolay | kaynakla karşılaştırıldı |
| 10 | Amazing Grace (Amerikan halk ezgisi (*New Britain*)) | kolay | kaynakla karşılaştırıldı |
| 11 | Carol of the Bells (Mikola Leontoviç) | orta | kaynakla karşılaştırıldı |
| 12 | Jesu, Joy of Man's Desiring (Johann Sebastian Bach) | orta | ezberden, doğrulanmadı |
| 13 | Ave Maria (Franz Schubert) | zor | kaynakla karşılaştırıldı |
| 14 | Düğün Marşı (Felix Mendelssohn) | orta | kaynakla karşılaştırıldı |
| 15 | Adeste Fideles (John Francis Wade) | kolay | kaynakla karşılaştırıldı |
| 16 | Air (Johann Sebastian Bach) | zor | kaynakla karşılaştırıldı |
| 17 | Hallelujah (Georg Friedrich Händel) | orta | kaynakla karşılaştırıldı |
| 18 | Hark! The Herald Angels Sing (Felix Mendelssohn) | kolay | kaynakla karşılaştırıldı |
| 19 | Holy, Holy, Holy (John Bacchus Dykes) | kolay | kaynakla karşılaştırıldı |
| 20 | Ein feste Burg (Martin Luther) | kolay | kaynakla karşılaştırıldı |
| 21 | Greensleeves (İngiliz halk ezgisi) | orta | kaynakla karşılaştırıldı |
| 22 | Joy to the World (Lowell Mason (Händel'den)) | orta | kaynakla karşılaştırıldı |
| 23 | O Come, O Come, Emmanuel (Fransız ortaçağ ezgisi) | kolay | kaynakla karşılaştırıldı |
| 24 | Abide with Me (William Henry Monk) | kolay | kaynakla karşılaştırıldı |
| 25 | Lobe den Herren (Stralsund ilahi kitabı) | kolay | kaynakla karşılaştırıldı |
| 26 | Görsev İçin Balad (Claude) | orta | özgün parça |
| 27 | Für Elise (Ludwig van Beethoven) | orta | kaynakla karşılaştırıldı |
| 28 | Gymnopédie No. 1 (Erik Satie) | kolay | kaynakla karşılaştırıldı |
| 29 | Türk Marşı (Wolfgang Amadeus Mozart) | zor | kaynakla karşılaştırıldı |
| 30 | The Entertainer (Scott Joplin) | zor | kaynakla karşılaştırıldı |

### 1. Neşeye Övgü (Beethoven)

Beethoven'ın 9. Senfonisi'nin koro teması; listenin en kolay parçası. Burada ilahi kitaplarındaki düz ritimli hâli var (kaynakta Sol majör, burada Do majöre aktarıldı).

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=neseye-ovgu)

**Ton:** Do majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 120 · **Registrasyon:** **2 · İlahi** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
E E R T | T R E W | Q Q W E | E —·W W —
E E R T | T R E W | Q Q W E | W —·Q Q —
W W E Q | W E·R E Q | W E·R E W | Q W B —
E E R T | T R E W | Q Q W E | W —·Q Q —
```

- Üçüncü satırın sonundaki `B` alt sıradadır ve alçak bir Sol (Sol3) çalar.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=528), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 2. Toccata ve Füg Re minör, BWV 565 (Bach)

Kilise orgunun en ünlü açılışı: her biri bir oktav aşağıdan yinelenen üç cümle, ardından gerilimli bir akor ve Re majöre çözülüş. Ritim serbesttir; her cümlenin son notası uzun tutulur. Birinci cümle bir oktav yukarıda çalındığı için programda o cümlede oktav kendiliğinden değişir.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=toccata)

**Ton:** Re minör · **Ölçü:** 4/4 · **Birim:** on altılık nota · **Tempo:** ♩ = 50 · **Registrasyon:** **6 · Tutti** · **Oktav:** Do3 – Sol5; 1. cümle (oktav ↑) bölümünde Do4 – Sol6 · **Zorluk:** orta

```
1. cümle (oktav ↑)  sağ  Y·T Y — — — — — _ T·R E·W 2 W — — — — — — — _ _ _ _

2. cümle            sağ  Y·T Y — — — — — _ E R 2 W — — — — — — — _ _ _ _

3. cümle            sağ  N·B N — — — — — _ B·V C·X S X — — — — — — — _ _ _ _

akor ve çözülüş     sağ  _ _ _ _ 2+E+T+7 — — — — — — — — — — — | W+5+Y — — — — — — — — — — — — — — —
                    sol  X — — — —       — — — — — — — — — — — | X     — — — — — — — — — — — — — — —
```

- Her cümlenin başındaki üç nota (`Y·T` ve uzun `Y` gibi) çok hızlı bir süstür (mordan).
- Elle çalarken birinci cümleden önce `↑`, sonra `↓` bas; ya da üç cümleyi de birer oktav aşağıdan çal.
- Akor dört notalıdır ve sol el Re'yi tutar. Klavyen bu kadar tuşu birden algılamazsa `Boşluk`'u basılı tutup akoru tuş tuş kur.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1780), kamu malı. Notalar kaynağa bakılarak elle denetlendi; ritim serbest olduğu için otomatik karşılaştırma yok.

### 3. Gelin Korosu, *Lohengrin* (Wagner)

Düğünlerde gelin girerken çalınan marş ("Treulich geführt"). İlk iki satır ezginin en tanınan kısmıdır; son satır, parçayı Do'da bitirmek için eklenmiş bir tekrardır.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=gelin-korosu)

**Ton:** Do majör · **Ölçü:** 2/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 66 · **Registrasyon:** **6 · Tutti** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A      T — I —·I | I — — — | T — O —·U | I — — —
       T — I —·Ğ | Ğ — P —·O | I — U —·I | O — — —
bitiş  T — I —·I | I — — — | T — O —·U | I — — —
```

- Her ölçünün ritmi aynıdır: uzun, noktalı, kısa.
- Programda oktavı bir basamak indirirsen (`↓`) daha dolgun duyulur; tuşlar aynı kalır.

Ezberden yazıldı; henüz bir nota kaynağıyla karşılaştırılmadı.

### 4. *Tristan und Isolde*, Prelüd (Wagner)

Operanın açılışındaki iki cümle ve ünlü "Tristan akoru". Çok yavaş çalınır; cümleler arasında sessizlik bırakılır. Sağ el ezgiyi (önce çello, sonra obua çizgisini), sol el akorları çalar.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=tristan)

**Ton:** La minör · **Ölçü:** 6/8 · **Birim:** sekizlik nota · **Tempo:** ♩ = 44 · **Registrasyon:** **1 · Dua** · **Oktav:** Do3 – Sol5 · **Zorluk:** zor

```
1. cümle  sağ  N | R — — — — E | 6     — — — — Y | 7     U — — _ _ | _ _ _ _ _
          sol  _ | _ _ _ _ _ _ | V+M+Ş — — — — — | C+H+Ç — — — _ _ | _ _ _ _ _

2. cümle  sağ  M | 6 — — — — T | U     — — — — I | 9     O — — _ _
          sol  _ | _ _ _ _ _ _ | H+Ç+5 — — — — — | B+M+R — — — _ _
```

- Her cümlenin üçüncü ölçüsündeki sol el akoru Tristan akorudur; sonraki ölçüde çözülür.
- Yalnızca ezgiyi çalmak istersen sağ el satırı yeterli.
- Klavyen dört tuşu birden algılamazsa `Boşluk`'u basılı tutup akoru tuş tuş kur.
- Özgün sürümde ikinci cümle Do4'ten başlıyordu; doğrusu Si3'tür ve burada düzeltildi.

Ezberden yazıldı; henüz bir nota kaynağıyla karşılaştırılmadı.

### 5. Valkürlerin Uçuşu (Wagner)

*Die Walküre* operasının ünlü teması. Pes notalar alt sırada (sol el), tiz notalar üst sırada (sağ el) çalınır.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=valkurlerin-ucusu)

**Ton:** Si minör · **Ölçü:** 9/8 · **Birim:** on altılık nota · **Tempo:** ♩ = 132 · **Registrasyon:** **6 · Tutti** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
G | M — — G M — W — — — — — M — — — — M
W — — M W — 5 — — — — — W — — — — W
5 — — W 5 — Y — — — — — N — — — — N
W — — N W — 5 — — — — — — — — — — —
```

- Ritim: "ta | TAAM-ta-tam, TAAAM, TAAAM". Her satır aynı kalıbı bir basamak yukarıdan yineler.
- Programda oktavı bir basamak indirirsen (`↓`) daha karanlık ve heybetli duyulur.

Ezberden yazıldı; henüz bir nota kaynağıyla karşılaştırılmadı.

### 6. Kanon Re majör (Pachelbel)

İki elle çalınır. Sol el sekiz notalık bası hiç değiştirmeden yineler; sağ el birinci kemanın ilk iki cümlesini çalar. Bas, kaynaktakinden bir oktav yukarı yazıldı.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=kanon)

**Ton:** Re majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 56 · **Registrasyon:** **2 · İlahi** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
yalnız bas  sağ  _ _ _ _ | _ _ _ _
            sol  Ç N M G | B X B N

1. tur      sağ  - P O 9 | U Y U 9
            sol  Ç N M G | B X B N

2. tur      sağ  O 9 U Y | T 5 T E
            sol  Ç N M G | B X B N

bitiş       sağ  O — — —
            sol  Ç — — —
```

- Notaları birbirine yapıştırarak çal; yeni tuşa bastıktan sonra eskisini bırak.
- `-` tuşu notadır (Fa♯5), uzatma işareti değil; `9` Do♯5'tir.
- Bitişteki Re'ler kaynakta yoktur; parça burada bitsin diye eklendi. Notada kanon sekizlik notalarla sürer.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047), CC BY 4.0. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 7. Old Hundredth, "Yüzüncü Mezmur" ilahisi (1551)

Plenumla çalınan klasik kapanış ilahisi. Sağ ve sol el aynı ezgiyi bir oktav arayla çalar. Ritim, John Dowland'ın düzenlemesindeki özgün ritimdir: her cümle uzun bir notayla başlar ve biter.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=old-hundredth)

**Ton:** Sol majör · **Ölçü:** 4/2 · **Birim:** ikilik nota · **Tempo:** ♩ = 132 · **Registrasyon:** **5 · Plenum**; son cümle bölümünde **6 · Tutti** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
A          sağ  T — | T 5 E W | T — Y — | U —
           sol  B — | B G C X | B — N — | M —

           sağ  U — | U U Y T | I — U — | Y —
           sol  M — | M M N B | Ö — M — | N —

           sağ  T — | Y U Y T | E — 5 — | T —
           sol  B — | N M N B | C — G — | B —

son cümle  sağ  O — | U T Y I | U — Y — | T —
           sol  Ç — | M B N Ö | M — N — | B —
```

- Birim ikilik notadır: uzun notalar (`—` ile) bir birlik sürer.
- Son cümlede programda **6 · Tutti**'ye geçilir; ilahi zirvede biter.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=90), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 8. Sheep May Safely Graze, BWV 208 (Bach)

*Schafe können sicher weiden*; Av Kantatı'ndaki soprano aryasının ilk bölümü, orijinal tonunda. Kaynak: Breitkopf & Härtel baskısı (1881).

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=sheep-may-safely-graze)

**Ton:** Si♭ majör · **Ölçü:** 4/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 66 · **Registrasyon:** **3 · Flüt solo** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
7 — O I I — — O | 0 — Ü Ğ O — I 7    Schafe können sicher weiden,
O 7 Y T I — — O | Y — T R R — — —    wo ein guter Hirte wacht,
R — 6 T T — — Y | 7 — O I Y — T R
Ğ — Ü Ğ Ğ O I 7 | Ğ — Ü Ğ Ğ O I 7
0 — — Ğ O I 7 I | Y — — 7 7 — — —
_ _ _ _ Ü 0 O I | Ğ — — Ü O — — I·7
7 —
```

- İlk iki satır en tanınan bölümdür.
- `7` (Si♭4), `0` (Mi♭5) ve `6` (La♭4) tuşları notadır.
- Sondan bir önceki ölçünün sonundaki `I·7` çok hızlı bir süs gibi geçer.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1794), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 9. Sessiz Gece, *Stille Nacht* (Gruber, 1818)

En bilinen Noel ilahisi. Sakin, sallanır gibi bir ritimle çalınır (kaynakta Si♭ majör, burada Do majöre aktarıldı).

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=sessiz-gece)

**Ton:** Do majör · **Ölçü:** 6/8 · **Birim:** sekizlik nota · **Tempo:** ♩ = 63 · **Registrasyon:** **1 · Dua**; B bölümünde **2 · İlahi** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A  T —·Y T E — — | T —·Y T E — —    Stille Nacht, heilige Nacht,
   O — O U — — | I — I T — —        alles schläft, einsam wacht
   Y — Y I —·U Y | T —·Y T E — —    nur das traute, hochheilige Paar.
   Y — Y I —·U Y | T —·Y T E — —    Holder Knabe im lockigen Haar,
B  O — O Ğ —·O U | I — — P — —      schlaf in himmlischer Ruh,
   I —·T E T —·R W | Q — — — — —    schlaf in himmlischer Ruh.
```

- Son `Q`'yu yankı sönene kadar tut.
- Son iki satırda programda **2 · İlahi**'ye geçilir; kapanış daha dolgun duyulur.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1295), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 10. Amazing Grace (ilahi, 1835)

*New Britain* ezgisi. **4 · Kornet** ya da **2 · İlahi** ile çalınır.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=amazing-grace)

**Ton:** Sol majör · **Ölçü:** 3/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 84 · **Registrasyon:** **4 · Kornet** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A  W | T — U·T | U — Y | T — E | W —          Amazing grace! how sweet the sound,
   W | T — U·T | U — Y | O —                  that saved a wretch like me!
B  U | O —·U O·U | T — W | E —·T T·E | W —    I once was lost, but now am found,
   W | T — U·T | U — Y | T — —                was blind, but now I see.
```

- Satır başlarındaki tek notalar ön vuruştur.
- İkinci kıtada **5 · Plenum**'a geçersen ilahi daha görkemli duyulur.
- Kaynakta ikinci satırın son notası (`O`) üç vuruş tutulur ve ölçü bir vuruş uzar; burada düzenli ölçüye uyması için iki vuruş yazıldı.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1283), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 11. Carol of the Bells, *Şçedrık* (Leontoviç, 1916)

Ukrayna halk ezgisinden doğan Noel şarkısı; Leontoviç'in 1916 tarihli koro düzenlemesi. Bütün parça dört notalı tek bir motif üzerine kuruludur. Sağ el soprano partisidir; sol el, korodaki alto partisinin bir oktav aşağısıdır. **4 · Kornet** zile benzer bir ses verir.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=carol-of-the-bells)

**Ton:** Sol minör · **Ölçü:** 3/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 168 · **Registrasyon:** **4 · Kornet** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
giriş     sağ  7 — Y 7 T —
          sol  _ _ _ _ _ _

A1        sağ  7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T —
          sol  _ _ _ _ _ _ | _ _ _ _ _ _ | _ _ _ _ _ _

A2        sağ  7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T —
          sol  B — — — — — | V — — — — — | D — — — — — | X — — — — —

          sağ  7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T —
          sol  B — — — — — | V — — — — — | D — — — — — | X — — — — —

A3        sağ  7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T —
          sol  B — B B B — | B — B B B — | B — B B B — | B — B B B —

B         sağ  O — I O 7 — | O — I O 7 — | O — I O 7 — | O — I O 7 —
          sol  J — N J B — | J — N J B — | J — N J B — | J — N J B —

C         sağ  Ü — Ü Ü Ğ 0 | O — O O I 7 | I — I I O I | T — T T T —
          sol  B — B B B — | B — B B B — | B — B B B — | B — B B B —

D         sağ  W E 5 T Y 7 | I O I — 7 — | W E 5 T Y 7 | I O I — 7 —
          sol  X — — — — — | C — G — B — | X — — — — — | C — G — B —

E         sağ  7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T — | 7 — Y 7 T —
          sol  X — — — — — | Z — — — — — | V — — — — — | D — — — — —

1. bitiş  sağ  7 — Y 7 T —
          sol  X — — — _ _

2. bitiş  sağ  T — — — — — | — — — — — — | — — — — — — | O — I O T —
          sol  X — — — — — | — — — — — — | — — — — — — | J — N J B —
```

Çalma sırası: giriş → A1 → A2 → A3 → B → C → D → E → 1. bitiş → A1 → A2 → A3 → B → C → D → E → 2. bitiş

- Motifin ritmi: ilk nota bir vuruş, ortadaki ikisi yarım vuruş, son nota bir vuruş ("Şçed-rık şçed-rık").
- B bölümünde sol el ana motifi çalar, sağ el aynı motifi üçlü yukarıdan söyler.
- D bölümünün ilk ölçüsü altı notalık yükselen bir koşudur.
- `0` tuşu notadır (Mi♭5); C bölümünde bir kez geçer.
- Yalnızca sağ eli çalmak istersen üst satır yeterli; parça yine tanınır.

Kaynak: [Vikipedi (İngilizce), "Shchedryk (song)" maddesindeki nota](https://en.wikipedia.org/wiki/Shchedryk_(song)#Melody), CC BY-SA 4.0. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 12. Jesu, Joy of Man's Desiring, BWV 147 (Bach)

*Jesus bleibet meine Freude* koralinin ünlü eşlik ezgisi; burada ilk sekiz ölçüsü var. Ezgi kesintisiz üçlüler hâlinde akar: her üç notalık grubu eşit ve bağlı çal, gruplar arasında durma.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=jesu-joy)

**Ton:** Sol majör · **Ölçü:** 9/8 · **Birim:** sekizlik nota · **Tempo:** ♩ = 92 · **Registrasyon:** **3 · Flüt solo** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
_ T Y U O I I P O | O Ü - Ü O U T Y U
I O P O I U Y U T | 5 T Y W 5 Y I U Y
U T Y U O I I P O | O Ü - Ü O U T Y U
P O I U Y T W T 5 | T U O Ü O U T — —
```

- `-` tuşu notadır (Fa♯5), uzatma işareti değil; `5` Fa♯4'tür.
- Bu parça ezberden yazıldı. Kulağına yanlış gelen bir nota olursa bir nota kitabıyla karşılaştır.

Ezberden yazıldı; henüz bir nota kaynağıyla karşılaştırılmadı.

### 13. Ave Maria, D 839 (Schubert)

*Ellens dritter Gesang*; ses partisinin ilk kıtası, orijinal tonunda. Çok yavaş çalınır (notada *Sehr langsam*). Küçük süs notaları atlandı.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=ave-maria)

**Ton:** Si♭ majör · **Ölçü:** 4/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 44 · **Registrasyon:** **1 · Dua** · **Oktav:** Do3 – Sol5 · **Zorluk:** zor

```
7 — — Y·7 O — — —·I                    Ave Maria!
7 — _ _ I — 7·Y T·Y                    Jungfrau mild,
7 — _ O O —·—·I·7 Y·T O·P              erhöre einer Jungfrau Flehen,
O — 9 —·Y I —·7 Y·I·O 0·I·Y            aus diesem Felsen starr und wild
7 — — O·I I —·Y T·U·O Ğ·O·U            soll mein Gebet zu dir hinwehen.
I — —·T·Y 7·Y·T R — _ R
I —·I I·—·—·U I·—·—·O I·—·—·O 7 _ 7    Wir schlafen sicher bis zum Morgen,
I —·I I·U·I 0·O·I 7 — _ 7              ob Menschen noch so grausam sind.
I —·I O·—·—·O O·I·O 0 0 _ _·T          O Jungfrau, sieh der Jungfrau Sorgen,
I —·I 7·Y·7 9·I·7 I — — _              o Mutter, hör ein bittend Kind!
7 — — Y·7 O — — —·I                    Ave Maria!
7 —
```

- Her satır bir ölçüdür. `·` ile bağlı uzun gruplar tek nefeste, akıcı çalınır.
- `9` (Re♭5) ve `0` (Mi♭5) tuşları notadır.
- Şarkının üç kıtası da aynı ezgiyle söylenir; istersen baştan tekrarla.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1054), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 14. Düğün Marşı, *Bir Yaz Gecesi Rüyası* (Mendelssohn)

Kiliseden çıkışta çalınan düğün marşı. Burada Théodore Dubois'nın org düzenlemesinin üst sesi var (Durand, Paris): trompet çağrısı, ana tema, orta bölüm ve yine ana tema.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=dugun-marsi)

**Ton:** Do majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 130 · **Registrasyon:** **6 · Tutti** · **Oktav:** Do4 – Sol6 · **Zorluk:** orta

```
trompet çağrısı     Z·Z·Z | Z — _ Z·Z·Z | Z — _ Z·Z·Z
                    C C·C·C C C·C·C | B B·B·B B _
ana tema            I — U —·5 | Y T R·_ W·_
                    Q — W B·—·—·W | E _ _·_·Q·_ E·_·T·_
                    I — U —·5 | Y T R·_ W·_
                    Q — E W·—·—·E | W — Q _
orta bölüm          Q — Q —·Q | E W M·_ B·_
                    B —·Q Q —·E | E W M·_ B·_
                    B —·E E —·T | T — R E
                    W 2·—·—·E W N·—·—·Q | M T Y U
ana tema (kapanış)  I — U —·5 | Y T R·_ W·_
                    Q — W B·—·—·W | E _ _·_·Q·_ E·_·T·_
                    I — U —·5 | Y T R·_ Y·_
                    Q — E W·—·—·E | W — Q
```

- Çağrıdaki `Z·Z·Z` üç hızlı notadır (üçleme).
- Ana temanın üçüncü ölçüsünün başındaki uzun `Q` notada titremelidir; istersen `Q` ile `W`'yi hızla değiştirerek çal.
- Bu konumda `B` Sol4, `N` La4, `M` Si4'tür; `2` (Do♯5) tuşu notadır.
- Notada ana tema ilk seferinde iki kez çalınır.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2198), CC BY-SA 4.0. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 15. Adeste Fideles, *O Come, All Ye Faithful* (Wade, 1751)

En çok söylenen Noel ilahilerinden biri. Burada soprano partisinin tamamı var.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=adeste-fideles)

**Ton:** Sol majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 100 · **Registrasyon:** **2 · İlahi**; nakarat bölümünde **5 · Plenum** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
kıta     T | T — W T | Y — W — | U Y U I | U — Y T
         T — 5 E | 5 T Y U | 5 — E —·W | W — — —
         O — I U | I — U — | Y U T Y | 5 —·E W U
nakarat  U Y U I | U — Y U | U Y U I | U — Y U    Venite adoremus, venite adoremus,
         I U Y T | 5 — T I | U — Y —·T | T — —    venite adoremus Dominum.
```

- İlk satırın başındaki tek `T` ön vuruştur.
- Kıtanın son notası (`U`), nakarata girişin ön vuruşudur.
- Nakaratta ses giderek büyür: programda **5 · Plenum**'a geçilir; son satırda **6 · Tutti**'ye de geçebilirsin.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1220), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 16. Air, *G Teli Üzerine Arya*, BWV 1068 (Bach)

Orkestra Süiti No. 3'ün ünlü ağır bölümü. Burada üst ses var; küçük vurgu notaları atlandı. Uzun tutulan notalarıyla ünlüdür: bir nota, sonraki hızlı grup başlayana kadar basılı kalır.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=air)

**Ton:** Re majör · **Ölçü:** 4/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 36 · **Registrasyon:** **1 · Dua** · **Oktav:** Do4 – Sol6 · **Zorluk:** zor

```
1. bölüm           5 — — — — — — —
                   — U·T E·W 2·W 2 — N —
                   Y — — — —·5 Q·M E·3 Y·T
                   T — — — —·E M·N W·2 T·5
                   5 — — 6·Y W W·E·5·— —·E E·W
1. bölümün bitişi  2·M M·2·W·— — 2·M N — — —
2. bölüm           2 — —·—·W·2 M·2·N·— Y — — Q
                   M U —·Y T·5 T — —·5·E·W 2·M
                   J·M 2 —·W E —·5 T — 5
                   E·W 2·M 2·—·W·E W M — — —
                   W — —·5 E·W U — — Y·6
                   5·E·Y·— N M —·—·2·W 2 —·M N —
                   W — — 5·E E — — T·5
                   5 — — Y·T T — — —
                   N — —·2 E·T T·E 5 — —·—·T·Y
                   W — —·5 Y·I U — — W
                   2·E T — M N E·—·5·T —·5 —·E
                   W·2·M·— —·2 W 2·W W — — —
```

Çalma sırası: 1. bölüm → 1. bölümün bitişi → 1. bölüm → 1. bölümün bitişi → 2. bölüm → 2. bölüm

- Her satır bir ölçüdür. `·` ile bağlı gruplar tek bir akıcı süs gibi geçer.
- Bu konumda alt sıradaki `N` La4, `J` La♯4, `M` Si4'tür; geri kalan notalar üst sıradadır.
- `Q` burada Do5 (natürel), `I` Do6'dır; ikisi de notada natürel işaretlidir.
- `2` (Do♯5), `3` (Re♯5) ve `6` (Sol♯5) tuşları notadır.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1534), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 17. Hallelujah, *Mesih* (Händel, 1741)

*Messiah* oratoryosunun ünlü korosu. Burada soprano partisinin açılışı var: "Hallelujah" çağrıları ve iki kez "For the Lord God omnipotent reigneth". Sopranoların sustuğu iki buçuk ölçü atlandı.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=hallelujah)

**Ton:** Re majör · **Ölçü:** 4/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 112 · **Registrasyon:** **6 · Tutti** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
A  O — — Y U Y _ _                                    Hallelujah!
   O — — Y U Y _ O·O | O O _ O·O O O _ O              Hallelujah! Hallelujah! Hallelujah! Hal-
   9 O — 9 O — _ _                                    -lelujah!
B  P — — Y - P _ _                                    Hallelujah!
   P — — Y - P _ P·P | - P _ P·P - P _ P              Hallelujah! Hallelujah! Hallelujah! Hal-
   - P O — 9 — _ _                                    -lelujah!
C  Y — — — U — 9 — | O W O — — O 9 —                  For the Lord God omnipotent
   U — — — Y — _ P·P                                  reigneth.
   O 9 _ P·P O 9 _ P·P | - P _ P·P - P _              Hallelujah! Hallelujah! Hallelujah! Hallelujah!
D  O·O | O O _ O·O O O _ O·O | O O _ O·O O O _ _      Hallelujah! Hallelujah! Hallelujah! Hallelujah!
   O — — — P — - — | Ü T Ü — — Ü - — | P — — — O —    For the Lord God omnipotent reigneth.
```

- `·` ile bağlı `O·O` ve `P·P` ikilileri çok hızlı ön vuruşlardır ("Hal-le-").
- `-` tuşu notadır (Fa♯5), uzatma işareti değil. `9` Do♯5'tir.
- C ve D bölümlerinde ezgi bir oktav aşağı atlar (`W`, sonra `T`).

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=459), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 18. Hark! The Herald Angels Sing (Mendelssohn, 1840)

Noel ilahisi. Ezgi Mendelssohn'un, söz Charles Wesley'nin. Burada soprano partisinin tamamı var.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=hark-the-herald-angels-sing)

**Ton:** Fa majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 108 · **Registrasyon:** **2 · İlahi**; nakarat bölümünde **6 · Tutti** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A        Q R R —·E | R Y Y T      Hark! the herald angels sing,
         I I I —·7 | Y T Y —      "Glory to the newborn King;
         Q R R —·E | R Y Y T      Peace on earth, and mercy mild,
         I T T —·E | E W Q —      God and sinners reconciled!"
B        I I I R | 7 Y Y T        Joyful, all ye nations, rise,
         I I I R | 7 Y Y T        Join the triumph of the skies;
         O O O I | 7 Y 7 —        With th'angelic host proclaim,
         T Y·7 I —·R | R T Y —    "Christ is born in Bethlehem!"
nakarat  O —·O O I | 7 Y 7 —      Hark! the herald angels sing,
         T Y·7 I —·R | R T R —    "Glory to the newborn King!"
```

- `7` tuşu notadır (Si♭4).

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1261), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 19. Holy, Holy, Holy, *Nicaea* (Dykes, 1861)

Kilisede en çok söylenen ilahilerden biri; ağır ve görkemli çalınır. Burada soprano partisinin tamamı var.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=holy-holy-holy)

**Ton:** Re majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 92 · **Registrasyon:** **5 · Plenum** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A  W W 5 5 | Y — Y —      Holy, holy, holy!
   U — U U | Y — 5 —      Lord God Almighty!
   Y —·Y Y Y | O — 9 Y    Early in the morning
   E Y U —·Y | Y — — —    our song shall rise to Thee;
B  W W 5 5 | Y — Y —      Holy, holy, holy!
   U —·U U U | Y — Y —    merciful and mighty!
   O — Y Y | U — 5 —      God in three Persons,
   T E E —·W | W — — —    blessed Trinity!
```

- `9` tuşu notadır (Do♯5).

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1284), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 20. Ein feste Burg ist unser Gott (Luther, 1529)

Reform kiliselerinin marşı sayılan Luther korali. Burada, bugün ilahi kitaplarında yaygın olan düz ritimli sürümün soprano partisi var.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=ein-feste-burg)

**Ton:** Do majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 84 · **Registrasyon:** **5 · Plenum**; C bölümünde **6 · Tutti** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A  I | I I T·Y U | I·U Y T I
   U Y T Y | R·E W Q
B  Q | T Y T 5 | T — — Q | T T Y U | I — — U
C  I U Y Y | T — — Y | Y T Y R | E — — I
   U Y T Y | R·E W Q
```

Çalma sırası: A → A → B → C

- A ve B bölümlerinin başındaki tek nota ön vuruştur.
- Koralin ilk cümlesi (A) iki kez çalınır.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1237), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 21. Greensleeves, *What Child Is This* (16. yüzyıl)

İngiliz halk ezgisi; Noel'de *What Child Is This?* sözleriyle söylenir. Sallanır gibi bir ritmi vardır: her ölçüde "uzun–kısa" iki kez tekrar eder.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=greensleeves)

**Ton:** Mi minör · **Ölçü:** 6/8 · **Birim:** sekizlik nota · **Tempo:** ♩ = 80 · **Registrasyon:** **3 · Flüt solo** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
kıta     E | T — Y U —·I U | Y — 5 W —·E 5
         T — E E —·3 E | 5 — — M — E
         T — Y U —·I U | Y — 5 W —·E 5
         T —·5 E 3 —·2 3 | E — — E — _
nakarat  O — — O —·9 U | Y — 5 W —·E 5    This, this is Christ the King,
         T — E E —·3 E | 5 — 3 M — _      whom shepherds guard and angels sing;
         O — — O —·I U | Y — 5 W —·E 5    haste, haste to bring Him laud,
         T —·5 E 3 —·2 3 | E — — E —      the Babe, the Son of Mary.
```

- İlk `E` ön vuruştur.
- `M` alt sıradadır (Si3). `2` (Do♯4), `3` (Re♯4) ve `9` (Do♯5) tuşları notadır.
- Nakaratın ilk satırında Do♯5 (`9`), üçüncü satırında Do natürel (`I`) çalınır.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1247), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 22. Joy to the World, *Antioch* (Händel / Mason, 1839)

Neşeli bir Noel ilahisi. Ezgi, Lowell Mason'ın Händel'den uyarlamasıdır. Açılışı yukarıdan aşağı inen bir gamdır; tören havasında, geniş çalınır.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=joy-to-the-world)

**Ton:** Re majör · **Ölçü:** 2/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 100 · **Registrasyon:** **6 · Tutti** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
O — 9 —·U | Y — — T | 5 — E — | W — — Y    Joy to the world! the Lord is come;
U — — U | 9 — — 9 | O — — O                Let earth receive her King;
O 9 U Y | Y —·T Y O                        Let every heart
O 9 U Y | Y —·T 5 5                        prepare Him room,
5 5 5 5·T | Y — — T·5                      And heaven and nature sing,
E E E E·5 | T — — 5·E                      And heaven and nature sing,
W O — U | Y —·T 5 T | 5 — E — | W — — —    And heaven, and heaven, and nature sing.
```

- `9` tuşu notadır (Do♯5).

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1223), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 23. O Come, O Come, Emmanuel, *Veni Emmanuel* (15. yüzyıl)

Advent ilahisi. Ezgi 15. yüzyıldan kalma bir Fransız ezgisidir; Thomas Helmore 1856'da düzenlemiştir. Ağır ve düzgün çalınır; cümleler ölçü çizgilerine uymaz.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=veni-emmanuel)

**Ton:** Mi minör · **Ölçü:** 4/4 · **Birim:** sekizlik nota · **Tempo:** ♩ = 72 · **Registrasyon:** **1 · Dua**; nakarat bölümünde **5 · Plenum** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
kıta     E | T U U U Y I U Y | T — —    O come, O come, Emmanuel,
         Y U T E T | Y 5 E W E — —      And ransom captive Israel,
         Y | Y E E 5 T — 5 E | W — —    That mourns in lonely exile here
         T Y U U U | Y I U Y T — —      Until the Son of God appear.
nakarat  O | O — — U U — —              Rejoice! Rejoice!
         U | Y I U Y T Y U T            Emmanuel shall come to thee,
         E T Y 5 E W E                  O Israel.
```

- İlk `E` ön vuruştur.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1300), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 24. Abide with Me, *Eventide* (Monk, 1861)

Akşam ilahisi; cenaze ve anma törenlerinde de çalınır. Kaynaktaki nota Mi♭ majörden Re majöre aktarılmıştır; burada da Re majör.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=abide-with-me)

**Ton:** Re majör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 72 · **Registrasyon:** **1 · Dua** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A  5 — 5 E | W — Y —    Abide with me; fast falls the eventide;
   U Y Y T | 5 — — —    the darkness deepens; Lord, with me abide.
   5 — T Y | U — Y —
   T E 5 6 | Y — — —
B  5 — 5 E | W — Y —    When other helpers fail and comforts flee,
   Y T T 5 | E — — —
   E — 5 T | 5 E W T    Help of the helpless, O abide with me.
   5 — E — | W — — —
```

- `6` tuşu notadır (Sol♯4); A'nın son satırında bir kez geçer.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1241), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 25. Lobe den Herren, *Praise to the Lord, the Almighty* (1665)

Alman korali. Ezgi Stralsund ilahi kitabındandır (1665), düzenleme William S. Bennett'in (1864). Kaynaktaki nota Sol majörden Fa majöre aktarılmıştır.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=lobe-den-herren)

**Ton:** Fa majör · **Ölçü:** 3/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 108 · **Registrasyon:** **2 · İlahi**; B bölümünde **5 · Plenum** · **Oktav:** Do3 – Sol5 · **Zorluk:** kolay

```
A  R R I | Y —·T R | E W Q    Praise to the Lord, the Almighty,
   W E R | T — — | R — —      the King of creation!
B  I I I | O — — | Y 7 I | I —·7 Y | T — —
   Q W E | R T Y | T — — | R — —
```

Çalma sırası: A → A → B

- `7` tuşu notadır (Si♭4).
- Son satır `Q`'dan (Do4) başlayıp adım adım yükselir.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1256), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 26. Görsev İçin Balad (özgün parça, Kerem Görsev'e ithaf)

Bu parça Kerem Görsev'in bir eseri **değildir**: onun klasik müzikle cazı harmanlayan piyano üslubundan esinlenerek bu proje için yazılmış özgün bir caz baladıdır ve ona ithaf edilmiştir. Çalma sırası caz standartlarındaki gibi A – A – B – A'dır. Lead sheet'i ve piyano düzenlemesi [`notalar/gorsev-icin-balad/`](notalar/gorsev-icin-balad/) klasöründe.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=gorsev-icin-balad)

**Ton:** Re minör · **Ölçü:** 4/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 60 · **Registrasyon:** **3 · Flüt solo**; B (köprü) bölümünde **4 · Kornet** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
A          sağ  O   Y·P Ğ — | P   O 9 —      Dm · Dm(maj7)
           sol  X+Ç —   — — | X+L — — —

           sağ  I   T·O P — | O   I U   —    Dm7 · Dm7 Dm6
           sol  X+Ö —   — — | X+Ö — X+M —

           sağ  7·O Ğ P   — | Y·I P O   —    Gm7 C7 · Fmaj7 B♭maj7
           sol  B+J — Z+J — | V+N — J+Ç —

           sağ  T·7 O 9   — | O   — — —      Em7♭5 A7 · Dm
           sol  C+Ç — N+L — | X+Ç — — —

B (köprü)  sağ  0   O·0 Ü — | Ğ   0·I Y —    Cm7 · F7
           sol  Z+J —   — — | V+N —   — —

           sağ  O   I·O Ğ — | 0   O·7 T —    B♭maj7 · B♭/F
           sol  J+Ç —   — — | V+J —   — —

           sağ  7   O Ü — | Ğ   P 9 —        Em7♭5 · A7
           sol  C+Ç — — — | N+L — — —

           sağ  O   — — Y | P·O 9·7 Y —      Dm · A7
           sol  X+Ç — — — | N+L —   — —

bitiş      sağ  Ğ   — — — | -   — — —        Dm6 · D
           sol  X+M — — — | X+N — — —
```

Çalma sırası: A → A → B (köprü) → A → bitiş

- Yalnızca melodiyi çalmak istersen sağ el satırı yeterli.
- `·` ile bağlı ikilileri cazdaki gibi "sallanarak" çal: ilki biraz uzun, ikincisi kısa.
- Satır sonlarındaki akor adları yalnızca bilgi içindir; `·` ölçü çizgisini gösterir.
- Köprüde (B) **4 · Kornet**'e geçip son A'da **3 · Flüt solo**'ya dönebilirsin. Kornet'teki ayak uzunlukları (8′, 4′, 2⅔′, 2′, 1⅗′), caz orgcularının kullandığı Hammond orgunun çekme ayarlarında da bulunur.
- İlk dört ölçüde sol elin üst notası Re–Do♯–Do–Si diye yarım ses yarım ses iner. Caz baladlarının sevdiği bu inen iç ses, aynı minör akoru dört ayrı renge boyar.
- A'nın ikinci yarısında akor kökleri Sol–Do–Fa–Si♭–Mi–La–Re diye beşli aralıklarla iner. Bu dizi barok müziğin de cazın da temel taşlarından biridir; melodi aynı küçük motifi her ölçüde bir basamak aşağıdan tekrarlar.
- Bitişte önce cazın sevdiği minör altılı akor gelir; ardından, Bach'ın minör parçalarını bitirirken sık yaptığı gibi majör akora dönülür. Son akoru yankı sönene kadar tut.

Bu proje için yazıldı.

### 27. Für Elise, WoO 59 (Beethoven)

Beethoven'ın en ünlü piyano parçası; burada bilinen ilk bölümü var. Sol eldeki bas notaları (La2, Mi2) klavyenin altında kaldığı için yalnızca sağ el yazıldı; melodi kendi başına tanınır.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=fur-elise)

**Ton:** La minör · **Ölçü:** 3/8 · **Birim:** on altılık nota · **Tempo:** ♩ = 66 · **Registrasyon:** **3 · Flüt solo** · **Oktav:** Do3 – Sol5 · **Zorluk:** orta

```
ön vuruş   P 0
A          P 0 P U O I | Y — _ Q E Y
           U — _ E 6 U | I — _ E P 0
           P 0 P U O I | Y — _ Q E Y
           U — _ E I U
1. bitiş   Y — — — P 0
2. bitiş   Y — _ U I O
B          P — — T Ğ P | O — — R P O
           I — — E O I | U — _ E P _
           _ P P _ _ 0 | P — _ 0 P 0
son bitiş  Y — — — — —
```

Çalma sırası: ön vuruş → A → 1. bitiş → A → 2. bitiş → B → A → son bitiş

- `0` (Re♯5) ve `6` (Sol♯4) tuşları notadır.
- B'nin 5. ölçüsündeki ikinci `P`, notada bir oktav yukarıdadır (Mi6). Org klavyesine sığmadığı için Mi5 yazıldı.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 28. Gymnopédie No. 1 (Satie, 1888)

Erik Satie'nin ağır, rüya gibi piyano parçası; caz baladlarını andıran yedili akorlarıyla bilinir. Notada *Lent et douloureux* (ağır ve acılı) yazar. Burada melodisi var; sol eldeki bas ve akorlar klavyeye sığmadığı için yazılmadı.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=gymnopedie-no-1)

**Ton:** Re majör · **Ölçü:** 3/4 · **Birim:** dörtlük nota · **Tempo:** ♩ = 70 · **Registrasyon:** **1 · Dua** · **Oktav:** Do4 – Sol6 · **Zorluk:** kolay

```
melodi    _ 5 Y | T 5 2 | M 2 W | N — —
          G — — | — — — | — — — | — — —
          _ 5 Y | T 5 2 | M 2 W | N — —
          2 — — | 5 — — | C — — | — — —
          — — — | N M Q | E W M | W Q M
          W — — | — — W | E R T | Y Q W
          E W M | W — — | — — W
1. bitiş  T — — | 5 — — | M N M | 2 W E
          2 W E | G — — | Z+C+N+Q — — | X+G+N+W — —
2. bitiş  T — — | R — — | M Q R | E W Q
          E W Q | V — — | Z+C+N+Q — — | X+V+N+W — —
```

Çalma sırası: melodi → 1. bitiş → melodi → 2. bitiş

- Notada parça dört ölçülük eşlikle başlar ve melodi ikinci vuruşta girer; tekrardan önce de dört ölçülük bir eşlik arası vardır. Burada ikisi de atlandı.
- Ortadaki bölümde `Q` (Do5) ve `R` (Fa5) natüreldir; parçanın renk değiştirdiği yer orası.
- Bitişlerin son iki ölçüsü dörder notalı akordur. Klavyen dört tuşu birden algılamazsa yalnızca en üstteki notayı (`Q`, sonra `W`) çal. İkinci bitiş Re minör akorla biter.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=37), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 29. Türk Marşı, *Rondo alla Turca*, K. 331 (Mozart, 1783)

Mozart'ın La majör piyano sonatının son bölümü; Osmanlı mehter müziğinden esinlenir. Burada sağ el partisinin ilk bölümü var; akorlarda üst ses alındı. Re5'e kadar olan notalar alt sıraya yazıldı, böylece baştaki "Do–Re–Do–Si–Do" süsü yan yana tuşlara düşer.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=turk-marsi)

**Ton:** La minör · **Ölçü:** 2/4 · **Birim:** on altılık nota · **Tempo:** ♩ = 120 · **Registrasyon:** **4 · Kornet**; B bölümünde **6 · Tutti** · **Oktav:** Do4 – Sol6 · **Zorluk:** zor

```
ön vuruş  M N H N
A         Ö _ _ _ Ç Ö M Ö | E _ _ _ R E 3 E
          U Y 6 Y U Y 6 Y | I — — — Y _ I _
          U _ Y _ T _ Y _ | U _ Y _ T _ Y _
          U _ Y _ T _ 5 _
1. bitiş  E — — — M N H N
2. bitiş  E — — — E _ R _
B         T _ T _ Y T R E | Ç — — — E _ R _
          T _ T _ Y T R E | Ç — — — Ö _ Ç _
          E _ E _ R E Ç Ö | M — — — Ö _ Ç _
          E _ E _ R E Ç Ö | M — — — M N H N
kapanış   Ö _ _ _ Ç Ö M Ö | E _ _ _ R E 3 E
          U Y 6 Y U Y 6 Y | I — _ _ Y _ U _
          I _ U _ Y _ 6 _ | Y _ E _ R _ Ç _
          Ö — — — M — — N·M | N — — —
```

Çalma sırası: ön vuruş → A → 1. bitiş → A → 2. bitiş → B → kapanış

- Sekizlik notaların çoğu notada kesik (staccato) yazılıdır; bu yüzden burada kısa bir nota ve ardından sus olarak görünürler.
- `3` (Re♯5) ve `6` (Sol♯5) tuşları notadır.
- A'nın 5–7. ölçülerinde her `U`'nun önünde notada iki küçük süs notası vardır (Sol5–La5); istersen ekleyebilirsin.
- Kapanışın sondan bir önceki ölçüsündeki `M` (Si4) notada titremelidir.
- Notada B ile kapanış iki kez çalınır.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=108), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.

### 30. The Entertainer (Scott Joplin, 1902)

Ragtime'ın en ünlü parçası; caz bu müzikten doğdu. Notada *Not fast* (aceleye getirmeden) yazar. Burada sağ el partisinin girişi ve ilk teması var; akorlarda üst ses alındı. Melodi iki oktavdan geniş olduğu için Mi5'e kadar olan notalar alt sıraya yazıldı.

[▶ Programda aç](https://z8002.github.io/kilise-orgu/kilise-orgu.html?parca=the-entertainer)

**Ton:** Do majör · **Ölçü:** 2/4 · **Birim:** on altılık nota · **Tempo:** ♩ = 84 · **Registrasyon:** **4 · Kornet** · **Oktav:** Do4 – Sol6 · **Zorluk:** zor

```
giriş     O P I Y — U T — | Ç . Ö N — M B —
ön vuruş  X D
tema      C Ö — C Ö — C Ö | — — — — — I O 0
          P I O P — U O — | I — — — — — X D
          C Ö — C Ö — C Ö | — — — — — — Y T
          5 Y I P — O I Y | O — — — — — X D
          C Ö — C Ö — C Ö | — — — — — I O 0
          P I O P — U O — | I — — — — — I O
          P I O P — I O I | P I O P — I O I
          P I O P — U O —
1. bitiş  I — — — — — X D
2. bitiş  I — — — — — — —
```

Çalma sırası: giriş → ön vuruş → tema → 1. bitiş → tema → 2. bitiş

- Temanın başındaki aksak (senkoplu) ritim parçanın ruhudur: kısa–uzun, kısa–uzun.
- `.` (Mi5) ve `0` (Re♯6) tuşları notadır.
- Girişin notadaki 3. ve 4. ölçüsü (La3–Sol3'e inen pes notalar) bu konumda klavyeye sığmadığı için atlandı.
- Ragtime'da sol el "um-pa" diye bas ve akor çalar; burada yalnızca sağ el var.

Kaynak: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=263), kamu malı. Notalar ve süreler kaynakla otomatik karşılaştırıldı.
<!-- PARCALAR:BITIR -->

## Nasıl çalışıyor

Sesler kayıt değil, tarayıcıda Web Audio API ile üretiliyor:

- Her boru tipi (prinsipal, kapalı flüt, açık flüt, yaylı, dilli) kendi harmonik yapısıyla bir `PeriodicWave` olarak tanımlı.
- Her register kendi ayak yüksekliğinde (16′ = bir oktav aşağı, 2⅔′ = oktav + beşli yukarı…) ayrı osilatörlerle çalar. Mikstür yüksek notalarda gerçek orglardaki gibi geri kırılır.
- Borular birbirinden birkaç sent farklı akortlanır. Kalın borular geç, ince borular hızlı "konuşur". Her notanın başında kısa bir hava sesi ("chiff") duyulur.
- Kilise akustiği, zamanla kararan yapay bir darbe tepkisiyle `ConvolverNode` üzerinden üretilir.

## Kaynaklar

Parçaların nota kaynakları. Karşılaştırmada kullanılan başvuru notaları [`kaynaklar/ref/`](kaynaklar/ref/) klasöründedir.

<!-- KAYNAKLAR:BASLA -->
- 1. *Neşeye Övgü*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=528), kamu malı.
- 2. *Toccata ve Füg*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1780), kamu malı.
- 6. *Kanon*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047), CC BY 4.0.
- 7. *Old Hundredth*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=90), kamu malı.
- 8. *Sheep May Safely Graze*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1794), kamu malı.
- 9. *Sessiz Gece*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1295), kamu malı.
- 10. *Amazing Grace*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1283), kamu malı.
- 11. *Carol of the Bells*: [Vikipedi (İngilizce), "Shchedryk (song)" maddesindeki nota](https://en.wikipedia.org/wiki/Shchedryk_(song)#Melody), CC BY-SA 4.0.
- 13. *Ave Maria*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1054), kamu malı.
- 14. *Düğün Marşı*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2198), CC BY-SA 4.0.
- 15. *Adeste Fideles*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1220), kamu malı.
- 16. *Air*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1534), kamu malı.
- 17. *Hallelujah*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=459), kamu malı.
- 18. *Hark! The Herald Angels Sing*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1261), kamu malı.
- 19. *Holy, Holy, Holy*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1284), kamu malı.
- 20. *Ein feste Burg*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1237), kamu malı.
- 21. *Greensleeves*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1247), kamu malı.
- 22. *Joy to the World*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1223), kamu malı.
- 23. *O Come, O Come, Emmanuel*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1300), kamu malı.
- 24. *Abide with Me*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1241), kamu malı.
- 25. *Lobe den Herren*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1256), kamu malı.
- 27. *Für Elise*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931), kamu malı.
- 28. *Gymnopédie No. 1*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=37), kamu malı.
- 29. *Türk Marşı*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=108), kamu malı.
- 30. *The Entertainer*: [Mutopia Project](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=263), kamu malı.
<!-- KAYNAKLAR:BITIR -->

## Geliştirme

`kilise-orgu.html`, `kaynak/` klasöründeki parçalardan üretilir ve her değişiklik otomatik testlerden geçer. Ayrıntılar [GELISTIRME.md](GELISTIRME.md) dosyasında, yapılacakların sırası [GELISTIRME-PROGRAMI.md](GELISTIRME-PROGRAMI.md) dosyasında.

## Lisans

- **Program ve bu depodaki diğer her şey:** [MIT](LICENSE). İsteyen kullanıp değiştirebilir; lisans notunu koruması yeter.
- **İstisna:** *Düğün Marşı* ve *Carol of the Bells* parça dosyalarının kaynağı CC BY-SA 4.0 lisanslıdır; bu iki parça dosyası ve başvuru notaları da [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.tr) ile paylaşılır. *Kanon*'un kaynağı CC BY 4.0 lisanslıdır (Mutopia Project).
- Çalınan bestelerin hepsi kamu malıdır. *Görsev İçin Balad* bu proje için yazılmıştır.
