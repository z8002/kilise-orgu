#!/usr/bin/env python3
"""Üretilen dosyaları yazar: kaynak/ → kilise-orgu.html, parcalar/ → README'nin parça bölümü.

Kullanım:
    python3 araclar/derle.py            # çıktıyı yazar
    python3 araclar/derle.py --denetle  # yazmaz; çıktı güncel değilse 1 ile çıkar

kaynak/sablon.html içinde yalnızca `/*@ekle yol*/` yazan bir satır, o dosyanın
içeriğiyle değiştirilir (yol, kaynak/ klasörüne göredir).
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from parca import ParcaHatasi, hepsini_yukle  # noqa: E402
from readme_uret import kaynaklar_bolumu, parcalar_bolumu  # noqa: E402

KOK = Path(__file__).resolve().parent.parent
KAYNAK = KOK / 'kaynak'
EKLE = re.compile(r'^[ \t]*/\*@ekle ([\w./-]+)\*/[ \t]*\n', re.M)


def sayfayi_derle() -> str:
    sablon = (KAYNAK / 'sablon.html').read_text(encoding='utf-8')

    def ekle(m: re.Match) -> str:
        yol = (KAYNAK / m.group(1)).resolve()
        if KAYNAK.resolve() not in yol.parents:
            raise SystemExit(f'kaynak/ dışında dosya istenemez: {m.group(1)}')
        icerik = yol.read_text(encoding='utf-8')
        return icerik if icerik.endswith('\n') else icerik + '\n'

    return EKLE.sub(ekle, sablon)


def isaretler_arasi(metin: str, ad: str, icerik: str) -> str:
    """<!-- AD:BASLA --> ile <!-- AD:BITIR --> arasını icerik ile değiştirir."""
    bas, bit = f'<!-- {ad}:BASLA -->', f'<!-- {ad}:BITIR -->'
    if metin.count(bas) != 1 or metin.count(bit) != 1:
        raise SystemExit(f'README.md içinde {bas} ve {bit} işaretleri birer kez bulunmalı')
    a, b = metin.index(bas) + len(bas), metin.index(bit)
    return metin[:a] + '\n' + icerik.rstrip('\n') + '\n' + metin[b:]


def readme_uret(parcalar: list) -> str:
    metin = (KOK / 'README.md').read_text(encoding='utf-8')
    metin = isaretler_arasi(metin, 'PARCALAR', parcalar_bolumu(parcalar))
    return isaretler_arasi(metin, 'KAYNAKLAR', kaynaklar_bolumu(parcalar))


def main() -> int:
    denetle = '--denetle' in sys.argv[1:]
    try:
        parcalar = hepsini_yukle()
    except ParcaHatasi as e:
        print('HATA:', e, file=sys.stderr)
        return 1
    ciktilar = {KOK / 'kilise-orgu.html': sayfayi_derle(), KOK / 'README.md': readme_uret(parcalar)}
    eski = 0
    for yol, icerik in ciktilar.items():
        mevcut = yol.read_text(encoding='utf-8') if yol.exists() else None
        if mevcut == icerik:
            continue
        eski += 1
        if denetle:
            print(f'GÜNCEL DEĞİL: {yol.relative_to(KOK)} (python3 araclar/derle.py çalıştır)')
        else:
            yol.write_text(icerik, encoding='utf-8')
            print(f'yazıldı: {yol.relative_to(KOK)}')
    if not eski:
        print('her şey güncel')
    return 1 if (denetle and eski) else 0


if __name__ == '__main__':
    sys.exit(main())
