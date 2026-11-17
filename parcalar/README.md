# Parça dosyaları

Her parça bir JSON dosyasıdır: `NN-kimlik.json`. Ana README'deki tuş dizileri bu dosyalardan üretilir (`python3 araclar/derle.py`), program da aynı dosyaları çalar.

## Alanlar

| Alan | Anlamı |
|---|---|
| `no`, `id` | Sıra numarası ve kısa kimlik (dosya adıyla aynı olmalı) |
| `ad`, `baslik`, `besteci`, `yil` | Kısa ad, README başlığı, besteci, yıl |
| `etiketler` | `ilahi`, `noel`, `klasik`, `opera`, `caz`, `dugun`, `ozgun` |
| `zorluk` | 1 kolay, 2 orta, 3 zor |
| `ton`, `olcu` | Ton adı ve ölçü (`4/4`, `6/8`…) |
| `tempo` | Dakikadaki dörtlük nota sayısı |
| `swing` | İsteğe bağlı. Vuruşun içindeki ikinci sekizliğin yeri (0.5 düz, 0.58–0.66 sallanan) |
| `birim` | Nota dizgilerindeki süre birimi, tam notanın kesri olarak (`1/4` dörtlük, `1/8` sekizlik) |
| `oktav` | Programdaki oktav ayarı (3 = Do3 – Sol5). Bütün notalar bu 32 tuşa sığmalı |
| `piston`, `mekan` | Önerilen kombinasyon ve (isteğe bağlı) mekân |
| `bolumler` | Bölümler: her biri `sag` ve/ya da `sol` satırları, isteğe bağlı `ad` ve satır başına `not` |
| `sira` | Bölümlerin çalınma sırası |
| `bolumPiston`, `bolumTempo`, `bolumOktav` | Bölüme özel kombinasyon, tempo çarpanı ya da oktav |
| `serbestOlcu` | Ölçü denetimi yapılmayacak bölümler (serbest ritim) |
| `sagAltSinir` | Sağ elde bu notaya kadar olan notalar alt harf sırasına yazılır |
| `aciklama`, `ipuclari` | README metni |
| `kaynak` | Nota kaynağı: `ad`, `url`, `lisans` |
| `dogrulama` | `kaynak` (kaynakla otomatik karşılaştırıldı), `kaynak-elle`, `ezber`, `ozgun` |
| `sapmalar` | Kaynaktan bilerek ayrılınan yerler: `tik`, `parca`, `kaynak`, `neden` |

## Nota dizgisi

```
E5 D#5:2 r C4+E4:1/2 | ~:3
```

| Yazım | Anlamı |
|---|---|
| `E5`, `F#4`, `Bb3` | Nota (Do4 = `C4`), bir birim sürer |
| `:2`, `:.5`, `:1/3` | Süre, birimin katı olarak |
| `C4+E4` | Akor |
| `r` | Es |
| `~` | Önceki notanın uzaması (ölçü çizgisini aşan notalar için) |
| `\|` | Ölçü çizgisi |

Her dizgi README'de bir satır olur. Bölümün yalnızca ilk ve son ölçüsü eksik olabilir; satır ölçünün ortasında bitebilir.

## Araçlar

```
python3 araclar/parca.py --denetle        # bütün parçaları doğrula
python3 araclar/parca.py --izgara KİMLİK  # bir parçanın README ızgarasını göster
python3 araclar/kaynak_denetle.py         # parçaları başvuru notalarıyla karşılaştır
python3 araclar/derle.py                  # README'yi ve sayfayı yeniden üret
```

Yeni bir parçayı kaynağından aktarmak için: kaynak notayı (LilyPond) MIDI'ye çevir, `araclar/midi_dok.py` ile dizgileri çıkar, parça dosyasını yaz, `araclar/kaynak_ref.py … --yaz` ile karşılaştırıp başvuru dosyasını üret. Bu iki araç için Python'un `mido` paketi gerekir.
