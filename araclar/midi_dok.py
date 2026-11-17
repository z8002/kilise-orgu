#!/usr/bin/env python3
"""Bir MIDI izini parça dosyası dizgilerine döker (ölçü ölçü).

Örnek:
    python3 araclar/midi_dok.py elise.midi --iz 1 --olcu 3/8 --birim 1/16 --on-vurus 0.5 --bit 30

Çıktıdaki satırlar parcalar/*.json dosyalarındaki "sag"/"sol" dizgilerine yapıştırılabilir.
İzleri görmek için:  python3 araclar/midi_dok.py dosya.mid --izler
"""
from __future__ import annotations

import argparse
import sys
from fractions import Fraction as F
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from midi_oku import alt_ses, iz_ozeti, notalari_oku, susleri_at, ust_ses  # noqa: E402

ADLAR = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
BEMOLLU = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']


def nota(midi: int, bemol: bool) -> str:
    return (BEMOLLU if bemol else ADLAR)[midi % 12] + str(midi // 12 - 1)


def sure_yaz(sure: F, birim: F) -> str:
    x = sure / birim
    if x == 1:
        return ''
    if x.denominator == 1:
        return f':{x.numerator}'
    if x.denominator in (2, 4, 8):
        return ':' + f'{float(x):g}'.lstrip('0')
    return f':{x.numerator}/{x.denominator}'


def dok(notalar: list, olcu: F, birim: F, on_vurus: F, bemol: bool, akor: bool) -> list:
    """Ölçü listesi döner: her ölçü bir dizgi."""
    # Aynı anda başlayıp aynı sürede biten notaları akor yap
    olaylar = []
    for bas, sure, midi in sorted(notalar):
        if akor and olaylar and olaylar[-1][0] == bas and olaylar[-1][1] == sure:
            olaylar[-1][2].append(midi)
        else:
            olaylar.append([bas, sure, [midi]])
    olculer, parcalar = [], []
    olcu_basi = F(0)
    olcu_sonu = on_vurus if on_vurus else olcu
    t = F(0)

    def ilerle(hedef: F, ad: str | None):
        """t'den hedefe kadar olan süreyi, ölçü çizgilerinde bölerek yazar."""
        nonlocal t, olcu_basi, olcu_sonu, parcalar
        ilk = True
        while t < hedef:
            parca_sonu = min(hedef, olcu_sonu)
            simge = (ad if ilk else '~') if ad else 'r'
            parcalar.append(simge + sure_yaz(parca_sonu - t, birim))
            t = parca_sonu
            ilk = False
            if t == olcu_sonu:
                olculer.append(' '.join(parcalar))
                parcalar = []
                olcu_basi, olcu_sonu = olcu_sonu, olcu_sonu + olcu

    for bas, sure, midiler in olaylar:
        if bas < t:
            print(f'uyarı: {float(bas):g}. dörtlükte üst üste binen nota atlandı ({midiler})', file=sys.stderr)
            continue
        ilerle(bas, None)
        ilerle(bas + sure, '+'.join(nota(m, bemol) for m in sorted(midiler)))
    if parcalar:
        olculer.append(' '.join(parcalar))
    return olculer


def main() -> int:
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument('dosya')
    a.add_argument('--izler', action='store_true', help='izleri listele ve çık')
    a.add_argument('--iz', type=int, default=1)
    a.add_argument('--olcu', default='4/4')
    a.add_argument('--birim', default='1/4', help='süre birimi (tam notanın kesri)')
    a.add_argument('--on-vurus', default='0', help='eksik ilk ölçünün süresi (dörtlük)')
    a.add_argument('--bas', default='0', help='okumaya başlanacak an (dörtlük)')
    a.add_argument('--bit', default=None, help='okumanın biteceği an (dörtlük)')
    a.add_argument('--ses', choices=['ust', 'alt', 'hepsi'], default='ust')
    a.add_argument('--en-kisa', default='1/12', help='bundan kısa notalar süs sayılıp atılır (dörtlük)')
    a.add_argument('--aktar', type=int, default=0, help='yarım ses olarak aktarım')
    a.add_argument('--bemol', action='store_true', help='siyah tuşları bemolle yaz')
    s = a.parse_args()
    if s.izler:
        for no, ad, adet in iz_ozeti(s.dosya):
            print(f'iz {no}: {ad!r} {adet} nota')
        return 0
    pay, payda = s.olcu.split('/')
    olcu, birim = F(int(pay) * 4, int(payda)), F(s.birim) * 4
    notalar = susleri_at(notalari_oku(s.dosya, s.iz), F(s.en_kisa))
    if s.ses == 'ust':
        notalar = ust_ses(notalar)
    elif s.ses == 'alt':
        notalar = alt_ses(notalar)
    bas, bit = F(s.bas), F(s.bit) if s.bit else None
    notalar = [(b - bas, su, m + s.aktar) for b, su, m in notalar if b >= bas and (bit is None or b < bit)]
    for i, olcu_metni in enumerate(dok(notalar, olcu, birim, F(s.on_vurus), s.bemol, s.ses == 'hepsi')):
        print(f'{i + (0 if F(s.on_vurus) else 1):3d}: {olcu_metni}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
