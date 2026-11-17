#!/usr/bin/env python3
"""Bir parça dosyasını kaynak notanın MIDI'siyle karşılaştırır ve başvuru dosyasını yazar.

Kaynak MIDI'nin bir izinden (çoğunlukla üst ses) notalar okunur, parçanın çalma sırasındaki
her bölüme kaynakta denk gelen an verilir ve iki nota dizisi karşılaştırılır. Eşleşirse
kaynaklar/ref/<id>.<el>.json yazılır; bu dosya sonradan `parca.py --kaynaklar` ile (MIDI'ye ve
internete gerek kalmadan) yeniden denetlenir.

Örnek:
    python3 araclar/kaynak_ref.py fur-elise elise.midi --iz 1 --esleme 0:0 7:43.5:0.5 --yaz

--esleme ögeleri "sıraNo:kaynakBaşı[:uzunluk]" biçimindedir (dörtlük cinsinden). Verilmeyen
bölümler bir öncekinin bittiği yerden sürer.
"""
from __future__ import annotations

import argparse
import json
import sys
from fractions import Fraction as F
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from midi_oku import alt_ses, notalari_oku, susleri_at, ust_ses  # noqa: E402
from parca import KOK, TPQ, hepsini_yukle, nota_adi, tik  # noqa: E402

REF = KOK / 'kaynaklar' / 'ref'


def parca_cizgisi(parca, el: str, ses: str) -> list:
    """Parçanın bu eldeki çizgisi: [(bas_tik, sure_tik, midi)] (akorda üst ya da alt nota)."""
    sec = max if ses != 'alt' else min
    return [(bas, sure, sec(notalar)) for bas, sure, notalar, _ in parca.cizelge()['eller'][el]]


def karsilastir(parca, el: str, ses: str, ref: list, sure_payi: int = TPQ // 8) -> list:
    """Farkların listesi (boşsa eşleşiyor). ref: [(bas_tik, sure_tik, midi)]."""
    sapmalar = {s['tik']: s for s in parca.veri.get('sapmalar', []) if s.get('el', 'sag') == el}
    bizim = {b: (s, m) for b, s, m in parca_cizgisi(parca, el, ses)}
    onlarin = {b: (s, m) for b, s, m in ref}
    farklar = []
    for an in sorted(set(bizim) | set(onlarin)):
        yer = f'{an / TPQ:g}. dörtlük'
        if an in sapmalar:
            s = sapmalar[an]
            beklenen = (nota_adi(bizim[an][1]) if an in bizim else None, nota_adi(onlarin[an][1]) if an in onlarin else None)
            if (s.get('parca'), s.get('kaynak')) != beklenen:
                farklar.append(f'{yer}: sapma kaydı tutmuyor (kayıt: {s.get("parca")}/{s.get("kaynak")}, gerçek: {beklenen[0]}/{beklenen[1]})')
            continue
        if an not in onlarin:
            farklar.append(f'{yer}: parçada {nota_adi(bizim[an][1])} var, kaynakta nota yok')
        elif an not in bizim:
            farklar.append(f'{yer}: kaynakta {nota_adi(onlarin[an][1])} var, parçada nota yok')
        elif bizim[an][1] != onlarin[an][1]:
            farklar.append(f'{yer}: parçada {nota_adi(bizim[an][1])}, kaynakta {nota_adi(onlarin[an][1])}')
        elif abs(bizim[an][0] - onlarin[an][0]) > sure_payi:
            farklar.append(f'{yer}: {nota_adi(bizim[an][1])} süresi parçada {bizim[an][0] / TPQ:g}, kaynakta {onlarin[an][0] / TPQ:g} dörtlük')
    for an in sapmalar:
        if an not in bizim and an not in onlarin:
            farklar.append(f'{an / TPQ:g}. dörtlük: sapma kaydı var ama orada nota yok')
    return farklar


def ref_denetle() -> int:
    """Depodaki bütün başvuru dosyalarını parçalarla karşılaştırır (CI için)."""
    parcalar = {p.id: p for p in hepsini_yukle()}
    hata = 0
    for yol in sorted(REF.glob('*.json')):
        ref = json.loads(yol.read_text(encoding='utf-8'))
        p = parcalar.get(ref['parca'])
        if p is None:
            print(f'{yol.name}: böyle bir parça yok')
            hata += 1
            continue
        farklar = karsilastir(p, ref['el'], ref['ses'], [tuple(n) for n in ref['notalar']])
        if farklar:
            hata += 1
            print(f'{p.id}: kaynakla {len(farklar)} fark')
            for f in farklar[:12]:
                print('   ', f)
        else:
            print(f'{p.no:2d}. {p.id:28s} {ref["el"]}: kaynakla aynı ({len(ref["notalar"])} nota)')
    for p in parcalar.values():
        var = any(REF.glob(f'{p.id}.*.json'))
        if p.dogrulama == 'kaynak' and not var:
            print(f'{p.id}: dogrulama "kaynak" ama başvuru dosyası yok')
            hata += 1
        if p.dogrulama != 'kaynak' and var:
            print(f'{p.id}: başvuru dosyası var ama dogrulama "{p.dogrulama}"')
            hata += 1
    return 1 if hata else 0


def main() -> int:
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument('parca')
    a.add_argument('midi')
    a.add_argument('--iz', type=int, default=1)
    a.add_argument('--el', choices=['sag', 'sol'], default='sag')
    a.add_argument('--ses', choices=['ust', 'alt'], default='ust')
    a.add_argument('--en-kisa', default='1/12')
    a.add_argument('--aktar', type=int, default=0, help='kaynağa uygulanacak aktarım (yarım ses)')
    a.add_argument('--esleme', nargs='*', default=['0:0'])
    a.add_argument('--kaynak', default=None, help='başvuru dosyasına yazılacak kaynak adresi')
    a.add_argument('--yontem', default=None, help='başvuru dosyasına yazılacak yöntem açıklaması')
    a.add_argument('--yaz', action='store_true', help='eşleşirse kaynaklar/ref/<id>.<el>.json dosyasını yaz')
    s = a.parse_args()

    p = next((x for x in hepsini_yukle() if x.id == s.parca), None)
    if p is None:
        print('parça bulunamadı:', s.parca)
        return 1
    notalar = susleri_at(notalari_oku(s.midi, s.iz), F(s.en_kisa))
    notalar = ust_ses(notalar) if s.ses == 'ust' else alt_ses(notalar)

    verilen = {}
    for oge in s.esleme:
        parcalar = oge.split(':')
        verilen[int(parcalar[0])] = (F(parcalar[1]), F(parcalar[2]) if len(parcalar) > 2 else None)
    ref, t, kaynak_an = [], F(0), F(0)
    esleme_kaydi = []
    for i, kimlik in enumerate(p.sira):
        bolum = p.bolumler[kimlik]
        uz = bolum.sure
        if i in verilen:
            kaynak_an = verilen[i][0]
            if verilen[i][1] is not None:
                uz = verilen[i][1]
        esleme_kaydi.append([i, kimlik, float(kaynak_an), float(uz)])
        for b, su, m in notalar:
            if kaynak_an <= b < kaynak_an + uz:
                ref.append((tik(t + b - kaynak_an), tik(min(su, kaynak_an + uz - b)), m + s.aktar))
        t += bolum.sure
        kaynak_an += bolum.sure
    farklar = karsilastir(p, s.el, s.ses, ref)
    print(f'{p.id}: parçada {len(parca_cizgisi(p, s.el, s.ses))} nota, kaynak penceresinde {len(ref)} nota, {len(farklar)} fark')
    for f in farklar[:40]:
        print('   ', f)
    if farklar:
        return 1
    if s.yaz:
        REF.mkdir(parents=True, exist_ok=True)
        cikti = {
            'parca': p.id, 'el': s.el, 'ses': s.ses,
            'kaynak': s.kaynak or p.kaynak['url'],
            'yontem': s.yontem or f'Kaynak MIDI\'ye çevrildi; iz {s.iz}, {"üst" if s.ses == "ust" else "alt"} ses; {s.en_kisa} dörtlükten kısa süs notaları atlandı',
            'esleme': esleme_kaydi,
            'notalar': [list(n) for n in ref],
        }
        yol = REF / f'{p.id}.{s.el}.json'
        yol.write_text(json.dumps(cikti, ensure_ascii=False, separators=(',', ':')).replace('"notalar":', '\n"notalar":') + '\n', encoding='utf-8')
        print('yazıldı:', yol.relative_to(KOK))
    return 0


if __name__ == '__main__':
    sys.exit(main())
