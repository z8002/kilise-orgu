#!/usr/bin/env python3
"""Üretilen dosyaları yazar: kaynak/ → kilise-orgu.html ve caz-orgu.html, parcalar/ → README'nin parça bölümü.

Kullanım:
    python3 araclar/derle.py            # çıktıyı yazar
    python3 araclar/derle.py --denetle  # yazmaz; çıktı güncel değilse 1 ile çıkar

kaynak/sablon.html içinde yalnızca `/*@ekle yol*/` yazan bir satır, o dosyanın
içeriğiyle değiştirilir (yol, kaynak/ klasörüne göredir). İki sayfa aynı şablondan
üretilir; aralarındaki fark __ORG__, __BASLIK__ ve __ACIKLAMA__ yer tutucularıdır,
gerisini sayfa kendisi data-org özniteliğine bakarak seçer.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from parca import ParcaHatasi, hepsini_yukle  # noqa: E402
from readme_uret import kaynaklar_bolumu, parcalar_bolumu  # noqa: E402

KOK = Path(__file__).resolve().parent.parent
KAYNAK = KOK / 'kaynak'
EKLE = re.compile(r'^[ \t]*/\*@ekle ([\w./-]+)\*/[ \t]*\n', re.M)


PARCA_ISARETI = '/*@parcalar*/'
SAYFALAR = {
    'kilise-orgu.html': {
        '__ORG__': 'kilise',
        '__BASLIK__': 'Kilise Orgu',
        '__ACIKLAMA__': 'Parmakla ya da bilgisayar klavyesiyle çalınan borulu kilise orgu: iki manuel ve pedal, '
                        'yirmi altı register, kilise yankısı ve otuz parçalık şarkı çalar.',
    },
    'caz-orgu.html': {
        '__ORG__': 'caz',
        '__BASLIK__': 'Caz Orgu',
        '__ACIKLAMA__': 'Parmakla ya da bilgisayar klavyesiyle çalınan elektromekanik caz orgu: dokuz çekme çubuğu, '
                        'perküsyon, vibrato, dönen hoparlör ve otuz parçalık şarkı çalar.',
    },
}
GOMULEN = ['id', 'no', 'ad', 'besteci', 'etiketler', 'zorluk', 'ton', 'olcu', 'tempo', 'swing', 'birim', 'oktav', 'piston', 'mekan',
           'sagAltSinir', 'bolumPiston', 'bolumTempo', 'bolumOktav', 'sira', 'dogrulama']


def gomulu_parcalar(parcalar: list) -> str:
    """Programın çalması için gereken alanlar, her parça bir satırda."""
    satirlar = []
    for p in parcalar:
        d = {a: p.veri[a] for a in GOMULEN if p.veri.get(a) is not None}
        d['bolumler'] = {k: {a: b[a] for a in ('ad', 'sag', 'sol') if a in b} for k, b in p.veri['bolumler'].items()}
        satirlar.append('    ' + json.dumps(d, ensure_ascii=False, separators=(',', ':')))
    return '  [\n' + ',\n'.join(satirlar) + '\n  ]'


def sayfayi_derle(parcalar: list, degerler: dict) -> str:
    sablon = (KAYNAK / 'sablon.html').read_text(encoding='utf-8')
    for ad, deger in degerler.items():
        if ad not in sablon:
            raise SystemExit(f'şablonda {ad} yer tutucusu yok')
        sablon = sablon.replace(ad, deger)

    def ekle(m: re.Match) -> str:
        yol = (KAYNAK / m.group(1)).resolve()
        if KAYNAK.resolve() not in yol.parents:
            raise SystemExit(f'kaynak/ dışında dosya istenemez: {m.group(1)}')
        icerik = yol.read_text(encoding='utf-8')
        return icerik if icerik.endswith('\n') else icerik + '\n'

    sayfa = EKLE.sub(ekle, sablon)
    if sayfa.count(PARCA_ISARETI) != 1:
        raise SystemExit(f'kaynakta {PARCA_ISARETI} işareti bir kez bulunmalı')
    return sayfa.replace(PARCA_ISARETI, gomulu_parcalar(parcalar))


def isaretler_arasi(metin: str, ad: str, icerik: str) -> str:
    """<!-- AD:BASLA --> ile <!-- AD:BITIR --> arasını icerik ile değiştirir."""
    bas, bit = f'<!-- {ad}:BASLA -->', f'<!-- {ad}:BITIR -->'
    if metin.count(bas) != 1 or metin.count(bit) != 1:
        raise SystemExit(f'README.md içinde {bas} ve {bit} işaretleri birer kez bulunmalı')
    a, b = metin.index(bas) + len(bas), metin.index(bit)
    return metin[:a] + '\n' + icerik.rstrip('\n') + '\n' + metin[b:]


def readme_uret(parcalar: list) -> str:
    metin = (KOK / 'README.md').read_text(encoding='utf-8')
    metin = isaretler_arasi(metin, 'PARCALAR', parcalar_bolumu(parcalar, calar=True))
    return isaretler_arasi(metin, 'KAYNAKLAR', kaynaklar_bolumu(parcalar))


def main() -> int:
    denetle = '--denetle' in sys.argv[1:]
    try:
        parcalar = hepsini_yukle()
    except ParcaHatasi as e:
        print('HATA:', e, file=sys.stderr)
        return 1
    ciktilar = {KOK / ad: sayfayi_derle(parcalar, degerler) for ad, degerler in SAYFALAR.items()}
    ciktilar[KOK / 'README.md'] = readme_uret(parcalar)
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
