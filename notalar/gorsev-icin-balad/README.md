# Görsev İçin Balad: nota dosyaları

Kerem Görsev'e ithaf edilen özgün baladın (README'de 26. parça) nota kaynakları. Parça Görsev'in bir eseri değildir; bu proje için yazılmıştır.

| Dosya | Ne |
|---|---|
| `lead-sheet.pdf`, `lead-sheet.ly` | Caz lead sheet'i: tek dizek melodi ve akor sembolleri |
| `piyano.pdf`, `piyano.ly` | Piyano düzenlemesi: sol elde pedallı arpejler |
| `insanlastir.py` | Piyano MIDI'sine küçük zamanlama ve vurgu farkları ekler |
| `balad.py` | Parçanın notaları (melodi ve sol el) |
| `trio.py` | Piyano, kontrbas ve fırçalı davul için trio düzenlemesini MIDI olarak üretir |

`.ly` dosyaları [LilyPond](https://lilypond.org) ile derlenir:

```
lilypond lead-sheet.ly
lilypond piyano.ly
```

Trio MIDI'si (Python için `mido` paketi gerekir):

```
python3 trio.py balad.py trio.mid
```

MIDI dosyaları herhangi bir ses bankasıyla seslendirilebilir; örnek kayıtlar FluidSynth ve MuseScore General ses bankasıyla yapıldı.
