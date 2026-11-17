"""MIDI dosyasından nota okuma: kaynak notaları parça dosyalarıyla karşılaştırmak için.

Gereken paket: mido  (pip install mido)
"""
from __future__ import annotations

from fractions import Fraction as F


def notalari_oku(yol: str, iz: int) -> list:
    """[(bas, sure, midi)] döner; süreler dörtlük cinsinden kesirdir."""
    import mido
    dosya = mido.MidiFile(yol)
    tpb = dosya.ticks_per_beat
    t, acik, notalar = 0, {}, []
    for ileti in dosya.tracks[iz]:
        t += ileti.time
        if ileti.type == 'note_on' and ileti.velocity:
            acik.setdefault(ileti.note, []).append(t)
        elif ileti.type in ('note_off', 'note_on') and acik.get(ileti.note):
            bas = acik[ileti.note].pop(0)
            notalar.append((F(bas, tpb), F(t - bas, tpb), ileti.note))
    return sorted(notalar)


def iz_ozeti(yol: str) -> list:
    import mido
    dosya = mido.MidiFile(yol)
    return [(i, iz.name, sum(1 for m in iz if m.type == 'note_on' and m.velocity)) for i, iz in enumerate(dosya.tracks)]


# LilyPond, süs notalarının ve aynı perdede yinelenen notaların arasına 1/384 dörtlük kadar boşluk bırakır.
KUCUK_BOSLUK = F(1, 96)


def susleri_at(notalar: list, en_kisa: F) -> list:
    """en_kisa'dan kısa notaları (çarpma, süs) atar; önceki notadan çaldıkları süreyi ona geri verir."""
    kalan = sorted(n for n in notalar if n[1] >= en_kisa)
    atilan = sorted(n for n in notalar if n[1] < en_kisa)
    if not atilan:
        return kalan
    sonuc = []
    for bas, sure, midi in kalan:
        bitis = bas + sure
        degisti = True
        while degisti:
            degisti = False
            for a_bas, a_sure, _ in atilan:
                if 0 <= a_bas - bitis <= KUCUK_BOSLUK:
                    bitis = a_bas + a_sure
                    degisti = True
        sonuc.append((bas, bitis - bas, midi))
    return sonuc


def ust_ses(notalar: list) -> list:
    """Her anda en üstteki sesi tek sesli bir çizgi olarak verir."""
    secilen = []
    for bas, sure, midi in notalar:
        ayni_anda = [n for n in notalar if n[0] == bas]
        if midi != max(n[2] for n in ayni_anda):
            continue
        if any(n[0] < bas < n[0] + n[1] and n[2] > midi for n in notalar):
            continue  # üstte daha tiz bir ses sürüyor: bu bir iç ses
        secilen.append([bas, sure, midi])
    for i in range(len(secilen) - 1):
        bosluk = secilen[i + 1][0] - (secilen[i][0] + secilen[i][1])
        if bosluk < 0 or bosluk <= KUCUK_BOSLUK:  # üst üste binmeyi kes, kıl payı boşluğu kapat
            secilen[i][1] = secilen[i + 1][0] - secilen[i][0]
    return [tuple(n) for n in secilen]


def alt_ses(notalar: list) -> list:
    ters = ust_ses([(b, s, -m) for b, s, m in notalar])
    return [(b, s, -m) for b, s, m in ters]


def pencere(notalar: list, bas: F, bit: F) -> list:
    """[bas, bit) aralığında başlayan notalar; zamanlar pencere başına göre, taşan süre kesilir."""
    return [(b - bas, min(s, bit - b), m) for b, s, m in notalar if bas <= b < bit]
