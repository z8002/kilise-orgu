#!/usr/bin/env python3
"""kaynak/ klasöründeki parçalardan tek dosyalık kilise-orgu.html'i üretir.

Kullanım:
    python3 araclar/derle.py            # çıktıyı yazar
    python3 araclar/derle.py --denetle  # yazmaz; çıktı güncel değilse 1 ile çıkar

kaynak/sablon.html içinde yalnızca `/*@ekle yol*/` yazan bir satır, o dosyanın
içeriğiyle değiştirilir (yol, kaynak/ klasörüne göredir).
"""
import re
import sys
from pathlib import Path

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


def main() -> int:
    denetle = '--denetle' in sys.argv[1:]
    ciktilar = {KOK / 'kilise-orgu.html': sayfayi_derle()}
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
