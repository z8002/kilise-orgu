#!/usr/bin/env python3
"""Parça dosyaları (parcalar/*.json): okuma, doğrulama, zaman çizelgesi ve README ızgarası.

Biçim (özet; ayrıntısı parcalar/README.md):

    "birim": "1/8"                    nota dizgilerindeki süre birimi (tam notanın kesri)
    "bolumler": {"A": {"sag": [...], "sol": [...]}}   her dizgi bir satır, satırlar ölçülerden oluşur
    "sira": ["A", "A", "B", "A"]      çalma sırası

Nota dizgisi:   E5 D#5:2 r C4+E4:1/2 | ~:3
    E5        Mi5, bir birim            D#5:2    iki birim           C4+E4    akor
    r         es                        ~        önceki notanın uzaması (bağ)
    :1/2      yarım birim (kesir ya da ondalık)                       |       ölçü çizgisi

Komut satırı:
    python3 araclar/parca.py --denetle      bütün parçaları doğrular
    python3 araclar/parca.py --tuslar       testler için: her parçanın basılacak tuşları (JSON)
    python3 araclar/parca.py --olaylar      testler için: her parçanın zaman çizelgesi (JSON)
    python3 araclar/parca.py --izgara ID    bir parçanın README ızgarasını yazar
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from fractions import Fraction as F
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
PARCALAR = KOK / 'parcalar'

TPQ = 960  # dörtlük başına tik
TUS_SAYISI = 32
ALT_SIRA = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ', 'KeyM', 'Comma', 'KeyL', 'Period', 'Semicolon', 'Slash']
UST_SIRA = ['KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7', 'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight']
TRQ_ETIKET = {'Comma': 'Ö', 'Period': 'Ç', 'Semicolon': 'Ş', 'Slash': '.', 'BracketLeft': 'Ğ', 'BracketRight': 'Ü', 'Equal': '-'}
SOLFEJ = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si']
PISTONLAR = {'1': 'Dua', '2': 'İlahi', '3': 'Flüt solo', '4': 'Kornet', '5': 'Plenum', '6': 'Tutti', '0': 'İptal'}
MEKANLAR = {'sapel': 'Şapel', 'kilise': 'Kilise', 'katedral': 'Katedral'}
ETIKETLER = {'ilahi', 'noel', 'klasik', 'opera', 'caz', 'dugun', 'ozgun'}
DOGRULAMA = {'kaynak', 'kaynak-elle', 'ezber', 'ozgun'}
ELLER = ('sag', 'sol')
BIRIM_ADI = {F(1, 2): 'ikilik', F(1, 4): 'dörtlük', F(1, 8): 'sekizlik', F(1, 16): 'on altılık', F(3, 8): 'noktalı dörtlük'}

_NOTA = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
_NOTA_RE = re.compile(r'([A-G])([#b]?)(\d)$')


class ParcaHatasi(Exception):
    pass


def midi_no(ad: str) -> int:
    m = _NOTA_RE.match(ad)
    if not m:
        raise ParcaHatasi(f'nota adı anlaşılmadı: {ad!r} (örnek: C4, F#5, Bb3)')
    return 12 * (int(m.group(3)) + 1) + _NOTA[m.group(1)] + {'#': 1, 'b': -1, '': 0}[m.group(2)]


def nota_adi(midi: int) -> str:
    return SOLFEJ[midi % 12] + str(midi // 12 - 1)


def kesir(metin: str) -> F:
    try:
        return F(metin)
    except (ValueError, ZeroDivisionError):
        raise ParcaHatasi(f'süre anlaşılmadı: {metin!r}') from None


@dataclass
class Olay:
    bas: F                 # bölümün (ya da parçanın) başından, dörtlük cinsinden
    sure: F
    notalar: tuple         # MIDI numaraları (akor için birden çok)


@dataclass
class Satir:
    bas: F
    olculer: list          # her ölçünün süresi (dörtlük)
    olaylar: list          # Olay listesi (bas: bölüm başından)

    @property
    def sure(self) -> F:
        return sum(self.olculer, F(0))


def dizgiyi_coz(dizgi: str, birim: F, bas: F, onceki: Olay | None):
    """Bir satırı çözer. Dönen: (Satir, son olay). birim: dörtlük cinsinden bir birimin süresi."""
    olaylar, olculer = [], []
    t, olcu_basi = bas, bas
    son = onceki
    parcalar = dizgi.split()
    if not parcalar:
        raise ParcaHatasi('boş satır')
    for p in parcalar:
        if p == '|':
            if t == olcu_basi:
                raise ParcaHatasi(f'boş ölçü: {dizgi!r}')
            olculer.append(t - olcu_basi)
            olcu_basi = t
            continue
        ad, _, sure_metni = p.partition(':')
        sure = kesir(sure_metni) * birim if sure_metni else birim
        if sure <= 0:
            raise ParcaHatasi(f'süre sıfırdan büyük olmalı: {p!r}')
        if ad == 'r':
            son = None
        elif ad == '~':
            if son is None:
                raise ParcaHatasi(f'"~" bir notadan sonra gelmeli: {dizgi!r}')
            son.sure += sure
        else:
            son = Olay(t, sure, tuple(sorted(midi_no(n) for n in ad.split('+'))))
            if len(set(son.notalar)) != len(son.notalar):
                raise ParcaHatasi(f'akorda aynı nota iki kez: {p!r}')
            olaylar.append(son)
        t += sure
    if t == olcu_basi:
        raise ParcaHatasi(f'satır ölçü çizgisiyle bitemez: {dizgi!r}')
    olculer.append(t - olcu_basi)
    return Satir(bas, olculer, olaylar), son


@dataclass
class Bolum:
    kimlik: str
    ad: str
    satirlar: dict          # el -> [Satir]
    notlar: list            # satır başına açıklama (boş olabilir)
    sure: F = F(0)

    def olaylar(self, el: str) -> list:
        return [o for s in self.satirlar.get(el, []) for o in s.olaylar]


@dataclass
class Parca:
    veri: dict
    yol: Path | None
    bolumler: dict = field(default_factory=dict)

    def __getattr__(self, ad):
        try:
            return self.veri[ad]
        except KeyError:
            raise AttributeError(ad) from None

    @property
    def birim(self) -> F:
        return kesir(self.veri['birim']) * 4

    @property
    def olcu_suresi(self) -> F:
        pay, payda = self.veri['olcu'].split('/')
        return F(int(pay) * 4, int(payda))

    def oktav_of(self, bolum: str | None = None) -> int:
        return self.veri.get('bolumOktav', {}).get(bolum, self.veri['oktav'])

    def taban(self, bolum: str | None = None) -> int:
        return 12 * (self.oktav_of(bolum) + 1)

    def eller(self) -> list:
        return [el for el in ELLER if any(el in b.satirlar for b in self.bolumler.values())]

    # ---- zaman çizelgesi -------------------------------------------------
    def cizelge(self) -> dict:
        """Çalma sırasına göre açılmış olaylar: {el: [(bas_tik, sure_tik, (midi…), sira_no)]}, toplam tik."""
        sonuc = {el: [] for el in self.eller()}
        t = F(0)
        for i, kimlik in enumerate(self.veri['sira']):
            b = self.bolumler[kimlik]
            for el in sonuc:
                for o in b.olaylar(el):
                    sonuc[el].append((tik(t + o.bas), tik(o.sure), o.notalar, i))
            t += b.sure
        return {'eller': sonuc, 'toplam': tik(t)}

    # ---- tuşlar ----------------------------------------------------------
    def tus(self, midi: int, el: str, bolum: str | None = None) -> str:
        """Bu notanın basılacağı klavye tuşunun kodu (KeyQ, Comma…)."""
        fark = midi - self.taban(bolum)
        altta, ustte = 0 <= fark < len(ALT_SIRA), 12 <= fark < 12 + len(UST_SIRA)
        if not (altta or ustte):
            raise ParcaHatasi(f'{self.id}: {nota_adi(midi)} oktav {self.oktav_of(bolum)} konumunda klavyede yok')
        if altta and ustte:
            sinir = self.veri.get('sagAltSinir')
            alt_tercih = el == 'sol' or (sinir is not None and midi <= midi_no(sinir))
            return ALT_SIRA[fark] if alt_tercih else UST_SIRA[fark - 12]
        return ALT_SIRA[fark] if altta else UST_SIRA[fark - 12]

    def etiket(self, midi: int, el: str, bolum: str | None = None) -> str:
        return tus_etiketi(self.tus(midi, el, bolum))


def tus_etiketi(kod: str) -> str:
    if kod.startswith('Key'):
        return kod[3:]
    if kod.startswith('Digit'):
        return kod[5:]
    return TRQ_ETIKET[kod]


def tik(dortluk: F) -> int:
    deger = dortluk * TPQ
    if deger.denominator != 1:
        raise ParcaHatasi(f'süre {TPQ} tiklik ızgaraya oturmuyor: {dortluk}')
    return int(deger)


# ---------------------------------------------------------------------------
# Yükleme ve doğrulama
# ---------------------------------------------------------------------------
ZORUNLU = ['no', 'id', 'ad', 'baslik', 'besteci', 'etiketler', 'zorluk', 'ton', 'olcu', 'tempo', 'birim', 'oktav', 'piston',
           'aciklama', 'bolumler', 'sira', 'ipuclari', 'kaynak', 'dogrulama']
SERBEST = ['swing', 'mekan', 'sagAltSinir', 'bolumPiston', 'bolumTempo', 'bolumOktav', 'serbestOlcu', 'yil', 'sapmalar']


def parcayi_kur(veri: dict, yol: Path | None = None) -> Parca:
    ad = veri.get('id', yol.name if yol else '?')

    def hata(mesaj):
        raise ParcaHatasi(f'{ad}: {mesaj}')

    for alan in ZORUNLU:
        if alan not in veri:
            hata(f'"{alan}" alanı eksik')
    for alan in veri:
        if alan not in ZORUNLU and alan not in SERBEST:
            hata(f'bilinmeyen alan: "{alan}"')
    if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', veri['id']):
        hata('id yalnızca küçük harf, rakam ve tire içerebilir')
    if not re.fullmatch(r'\d+/(2|4|8|16)', veri['olcu']):
        hata(f'ölçü anlaşılmadı: {veri["olcu"]!r}')
    if not (isinstance(veri['oktav'], int) and 1 <= veri['oktav'] <= 5):
        hata('oktav 1–5 arasında olmalı')
    if veri['piston'] not in PISTONLAR:
        hata(f'bilinmeyen piston: {veri["piston"]!r}')
    if veri.get('mekan') is not None and veri['mekan'] not in MEKANLAR:
        hata(f'bilinmeyen mekân: {veri["mekan"]!r}')
    if not set(veri['etiketler']) <= ETIKETLER or not veri['etiketler']:
        hata(f'etiketler şunlardan seçilmeli: {sorted(ETIKETLER)}')
    if veri['zorluk'] not in (1, 2, 3):
        hata('zorluk 1, 2 ya da 3 olmalı')
    if veri['dogrulama'] not in DOGRULAMA:
        hata(f'dogrulama şunlardan biri olmalı: {sorted(DOGRULAMA)}')
    if not (isinstance(veri['tempo'], (int, float)) and 20 <= veri['tempo'] <= 300):
        hata('tempo dakikada 20–300 dörtlük olmalı')
    swing = veri.get('swing')
    if swing is not None and not (0.5 <= swing <= 0.75):
        hata('swing 0.5–0.75 arasında olmalı')
    for alan in ('ad', 'url', 'lisans'):
        if alan not in veri['kaynak']:
            hata(f'kaynak.{alan} eksik')

    parca = Parca(veri, yol)
    birim, olcu = parca.birim, parca.olcu_suresi
    serbest = set(veri.get('serbestOlcu', []))
    for kimlik, b in veri['bolumler'].items():
        if not re.fullmatch(r'[A-Za-z][A-Za-z0-9]*', kimlik):
            hata(f'bölüm kimliği harfle başlamalı, harf ve rakamdan oluşmalı: {kimlik!r}')
        if 'sag' not in b and 'sol' not in b:
            hata(f'{kimlik} bölümünde nota yok')
        satirlar = {}
        for el in ELLER:
            if el not in b:
                continue
            t, son, liste = F(0), None, []
            for dizgi in b[el]:
                try:
                    satir, son = dizgiyi_coz(dizgi, birim, t, son)
                except ParcaHatasi as e:
                    hata(f'{kimlik}/{el}: {e}')
                liste.append(satir)
                t += satir.sure
            satirlar[el] = liste
        sureler = {el: sum((s.sure for s in liste), F(0)) for el, liste in satirlar.items()}
        if len(set(sureler.values())) > 1:
            hata(f'{kimlik}: ellerin süresi farklı: ' + ', '.join(f'{el} {float(s):g}' for el, s in sureler.items()))
        if len(satirlar) == 2 and [s.sure for s in satirlar['sag']] != [s.sure for s in satirlar['sol']]:
            hata(f'{kimlik}: sağ ve sol el satırları aynı uzunlukta olmalı')
        notlar = b.get('not', [])
        satir_sayisi = len(next(iter(satirlar.values())))
        if notlar and len(notlar) != satir_sayisi:
            hata(f'{kimlik}: "not" satır sayısı ({len(notlar)}) nota satırı sayısına ({satir_sayisi}) eşit olmalı')
        if kimlik not in serbest:
            for el, liste in satirlar.items():
                olculer = []
                for s in liste:
                    yeni = list(s.olculer)
                    # Satır ölçünün ortasında bitebilir (cümleler ön vuruşla başlıyorsa): iki yarıyı birleştir
                    if olculer and olculer[-1] < olcu and olculer[-1] + yeni[0] <= olcu:
                        olculer[-1] += yeni.pop(0)
                    olculer.extend(yeni)
                for i, o in enumerate(olculer):
                    kenar = i in (0, len(olculer) - 1)
                    if o > olcu or (o < olcu and not kenar):
                        hata(f'{kimlik}/{el}: {i + 1}. ölçü {float(o):g} dörtlük sürüyor, {float(olcu):g} olmalı '
                             f'(yalnızca bölümün ilk ve son ölçüsü eksik olabilir)')
        bolum = Bolum(kimlik, b.get('ad', kimlik), satirlar, notlar, next(iter(sureler.values())))
        for alan in b:
            if alan not in ('ad', 'sag', 'sol', 'not'):
                hata(f'{kimlik}: bilinmeyen alan "{alan}"')
        parca.bolumler[kimlik] = bolum
    if not veri['sira']:
        hata('sira boş olamaz')
    for kimlik in veri['sira']:
        if kimlik not in parca.bolumler:
            hata(f'sira içinde tanımsız bölüm: {kimlik!r}')
    for kimlik in parca.bolumler:
        if kimlik not in veri['sira']:
            hata(f'{kimlik} bölümü çalma sırasında yok')
    for alan in ('bolumPiston', 'bolumTempo', 'bolumOktav'):
        for kimlik, deger in veri.get(alan, {}).items():
            if kimlik not in parca.bolumler:
                hata(f'{alan} içinde tanımsız bölüm: {kimlik!r}')
            if alan == 'bolumPiston' and deger not in PISTONLAR:
                hata(f'{alan}: bilinmeyen piston {deger!r}')
            if alan == 'bolumTempo' and not (0.25 <= deger <= 2):
                hata(f'{alan}: çarpan 0.25–2 arasında olmalı')
            if alan == 'bolumOktav' and deger not in (1, 2, 3, 4, 5):
                hata(f'{alan}: oktav 1–5 arasında olmalı')
    # Bütün notalar seçilen oktav konumunda klavyede olmalı
    for b in parca.bolumler.values():
        for el in b.satirlar:
            for o in b.olaylar(el):
                for m in o.notalar:
                    try:
                        parca.tus(m, el, b.kimlik)
                    except ParcaHatasi as e:
                        hata(f'{b.kimlik}/{el}: {e}')
                tik(o.bas), tik(o.sure)
    return parca


def parcayi_yukle(yol: Path) -> Parca:
    try:
        veri = json.loads(yol.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        raise ParcaHatasi(f'{yol.name}: JSON hatası: {e}') from None
    parca = parcayi_kur(veri, yol)
    beklenen = f'{parca.no:02d}-{parca.id}.json'
    if yol.name != beklenen:
        raise ParcaHatasi(f'{yol.name}: dosya adı {beklenen} olmalı')
    return parca


def hepsini_yukle() -> list:
    parcalar = [parcayi_yukle(y) for y in sorted(PARCALAR.glob('*.json'))]
    for alan in ('no', 'id'):
        degerler = [getattr(p, alan) for p in parcalar]
        if len(set(degerler)) != len(degerler):
            raise ParcaHatasi(f'aynı "{alan}" iki parçada kullanılmış')
    return sorted(parcalar, key=lambda p: p.no)


# ---------------------------------------------------------------------------
# README ızgarası
# ---------------------------------------------------------------------------
TUT, SUS = '—', '_'
BOLMELER = (2, 3, 4, 6, 8, 12, 16, 24, 32, 48)


def _hucre(olaylar: list, a: F, b: F, etiketle) -> str:
    """[a, b) aralığının ızgara öğesi: tuş, '—' (tut), '_' (sus)."""
    for o in olaylar:
        if o.bas == a:
            return '+'.join(etiketle(m) for m in o.notalar)
    for o in olaylar:
        if o.bas < a < o.bas + o.sure:
            return TUT
    return SUS


def _birim_hucresi(olaylar: list, a: F, birim: F, etiketle) -> str:
    b = a + birim
    sinirlar = {s for o in olaylar for s in (o.bas, o.bas + o.sure) if a < s < b}
    if not sinirlar:
        return _hucre(olaylar, a, b, etiketle)
    for n in BOLMELER:
        adim = birim / n
        if all(((s - a) / adim).denominator == 1 for s in sinirlar):
            return '·'.join(_hucre(olaylar, a + k * adim, a + (k + 1) * adim, etiketle) for k in range(n))
    raise ParcaHatasi(f'ritim ızgaraya sığmıyor (birimi küçült): {float(a):g}. dörtlük')


def izgara(parca: Parca, bolum: Bolum) -> list:
    """Bölümün README satırları. İki el varsa her nota satırı için iki satır (sağ üstte) üretir."""
    birim = parca.birim
    eller = [el for el in ELLER if el in bolum.satirlar]
    satir_sayisi = len(bolum.satirlar[eller[0]])
    cikti = []
    for i in range(satir_sayisi):
        hucreler = {}
        sinirlar = []
        for el in eller:
            satir = bolum.satirlar[el][i]
            if (satir.sure / birim).denominator != 1 or (satir.bas / birim).denominator != 1:
                raise ParcaHatasi(f'{parca.id}/{bolum.kimlik}: satır süresi birimin tam katı olmalı')
            olaylar = bolum.olaylar(el)
            adet = int(satir.sure / birim)
            hucreler[el] = [_birim_hucresi(olaylar, satir.bas + k * birim, birim, lambda m, el=el: parca.etiket(m, el, bolum.kimlik)) for k in range(adet)]
            if not sinirlar:
                t = F(0)
                for o in satir.olculer[:-1]:
                    t += o
                    if (t / birim).denominator != 1:
                        raise ParcaHatasi(f'{parca.id}/{bolum.kimlik}: ölçü çizgisi birim sınırına denk gelmeli')
                    sinirlar.append(int(t / birim))
        adet = len(hucreler[eller[0]])
        genislik = [max(len(hucreler[el][k]) for el in eller) for k in range(adet)]
        for el in eller:
            parcalar = []
            for k in range(adet):
                if k in sinirlar:
                    parcalar.append('|')
                parcalar.append(hucreler[el][k].ljust(genislik[k]) if len(eller) > 1 else hucreler[el][k])
            cikti.append((el, i, ' '.join(parcalar).rstrip()))
    return cikti


# ---------------------------------------------------------------------------
# Komut satırı
# ---------------------------------------------------------------------------
def tus_listesi(parca: Parca) -> dict:
    """Testler için: çalma sırasıyla her adımda basılacak tuş kodları ve beklenen notalar."""
    adimlar = []
    cizelge = parca.cizelge()['eller']
    for el, olaylar in cizelge.items():
        for bas, sure, notalar, sira in olaylar:
            bolum = parca.sira[sira]
            adimlar.append({'el': el, 'tik': bas, 'oktav': parca.oktav_of(bolum),
                            'tuslar': [parca.tus(m, el, bolum) for m in notalar], 'notalar': [nota_adi(m) for m in notalar]})
    adimlar.sort(key=lambda a: (a['tik'], a['el']))
    return {'id': parca.id, 'no': parca.no, 'oktav': parca.oktav, 'adimlar': adimlar}


def olay_listesi(parca: Parca) -> dict:
    c = parca.cizelge()
    return {'id': parca.id, 'toplam': c['toplam'],
            'eller': {el: [[bas, sure, list(notalar), sira] for bas, sure, notalar, sira in olaylar] for el, olaylar in c['eller'].items()}}


def main() -> int:
    secenek = sys.argv[1:] or ['--denetle']
    try:
        parcalar = hepsini_yukle()
        if secenek[0] == '--denetle':
            for p in parcalar:
                c = p.cizelge()
                for b in p.bolumler.values():
                    izgara(p, b)
                nota = sum(len(o) for o in c['eller'].values())
                print(f'{p.no:2d}. {p.id:28s} {nota:4d} nota  {c["toplam"] / TPQ:6.1f} dörtlük  {p.dogrulama}')
            print(f'{len(parcalar)} parça geçerli')
        elif secenek[0] == '--tuslar':
            json.dump([tus_listesi(p) for p in parcalar], sys.stdout, ensure_ascii=False)
        elif secenek[0] == '--olaylar':
            json.dump([olay_listesi(p) for p in parcalar], sys.stdout, ensure_ascii=False)
        elif secenek[0] == '--izgara':
            p = next(p for p in parcalar if p.id == secenek[1])
            for b in p.bolumler.values():
                print(f'[{b.kimlik}]')
                for el, i, metin in izgara(p, b):
                    print(f'  {el}: {metin}')
        else:
            print(__doc__)
            return 2
    except ParcaHatasi as e:
        print('HATA:', e, file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
