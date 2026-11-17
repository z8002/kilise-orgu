"""README'nin parça bölümünü ve kaynak listesini parça dosyalarından üretir (derle.py çağırır)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from parca import BIRIM_ADI, ELLER, PISTONLAR, izgara, kesir, nota_adi  # noqa: E402

SITE = 'https://z8002.github.io/kilise-orgu/kilise-orgu.html'
ZORLUK = {1: 'kolay', 2: 'orta', 3: 'zor'}
DOGRULAMA = {
    'kaynak': 'kaynakla karşılaştırıldı',
    'kaynak-elle': 'kaynağa bakılarak elle denetlendi',
    'ezber': 'ezberden, doğrulanmadı',
    'ozgun': 'özgün parça',
}
EL_ADI = {'sag': 'sağ', 'sol': 'sol'}

GIRIS = '''## Örnek parçalar

Her parçanın notaları [`parcalar/`](parcalar/) klasöründeki bir dosyada durur; aşağıdaki tuş dizileri o dosyalardan üretilir. Tuş harfleri Türkçe Q klavyeye göredir.

Okuma kuralları:

- Boşlukla ayrılan her öğe bir **birim** sürer. Birimin hangi nota değeri olduğu parçanın başında yazar.
- Tuş adı = o tuşa bas. `—` = önceki notayı tutmaya devam et. `_` = sus.
- `·` ile bağlı öğeler bir birimi eşit paylaşır: `Y·P` iki yarım, `Z·Z·Z` üçleme, `T·—·—·Y` uzun–kısa.
- `A+B` = tuşlara aynı anda bas.
- `|` ölçü çizgisidir.
- İki elli parçalarda üst satır sağ el, alt satır sol eldir; alt alta gelen öğeler aynı anda çalınır.
- "Oktav" satırı, Oktav kutusunda ne yazması gerektiğini söyler. Do3 – Sol5 açılıştaki konumdur; başka bir konum yazıyorsa başlamadan `↑` ya da `↓` ile oraya git.
'''


def _piston(n: str) -> str:
    return f'**{n} · {PISTONLAR[n]}**'


def _oktav_araligi(parca, bolum=None) -> str:
    taban = parca.taban(bolum)
    return f'{nota_adi(taban)} – {nota_adi(taban + 31)}'


def _bilgi(parca) -> str:
    birim = kesir(parca.veri['birim'])
    ogeler = [f'**Ton:** {parca.ton}', f'**Ölçü:** {parca.olcu}', f'**Birim:** {BIRIM_ADI.get(birim, parca.veri["birim"])} nota',
              f'**Tempo:** ♩ = {parca.tempo:g}']
    reg = _piston(parca.piston)
    for kimlik, n in parca.veri.get('bolumPiston', {}).items():
        reg += f'; {parca.bolumler[kimlik].ad} bölümünde {_piston(n)}'
    ogeler.append(f'**Registrasyon:** {reg}')
    oktav = _oktav_araligi(parca)
    for kimlik in parca.veri.get('bolumOktav', {}):
        oktav += f'; {parca.bolumler[kimlik].ad} bölümünde {_oktav_araligi(parca, kimlik)}'
    ogeler.append(f'**Oktav:** {oktav}')
    ogeler.append(f'**Zorluk:** {ZORLUK[parca.zorluk]}')
    return ' · '.join(ogeler)


def _izgara_blogu(parca) -> str:
    iki_el = len(parca.eller()) > 1
    etiketler = [b.ad for b in parca.bolumler.values()]
    tek_bolum = len(parca.bolumler) == 1 and etiketler[0] in parca.bolumler  # adsız tek bölüm: etiket yazma
    en = 0 if tek_bolum else max(len(e) for e in etiketler) + 2
    satirlar = []  # (metin, açıklama) ya da None (boş satır)
    for bolum in parca.bolumler.values():
        ilk, onceki = True, None
        ust_el = next(el for el in ELLER if el in bolum.satirlar)
        for el, i, metin in izgara(parca, bolum):
            if iki_el and onceki is not None and i != onceki:
                satirlar.append(None)
            onceki = i
            bas = ('' if tek_bolum else (bolum.ad if ilk else '')).ljust(en)
            if iki_el:
                bas += EL_ADI[el] + '  '
            notu = bolum.notlar[i] if bolum.notlar and el == ust_el else ''
            satirlar.append((bas + metin, notu))
            ilk = False
        if iki_el:
            satirlar.append(None)
    while satirlar and satirlar[-1] is None:
        satirlar.pop()
    not_sutunu = max((len(s[0]) for s in satirlar if s and s[1]), default=0) + 4
    cikti = ['' if s is None else (s[0].ljust(not_sutunu) + s[1] if s[1] else s[0]).rstrip() for s in satirlar]
    return '```\n' + '\n'.join(cikti) + '\n```'


def _kaynak_cumlesi(parca) -> str:
    k = parca.kaynak
    if parca.dogrulama == 'ozgun':
        return 'Bu proje için yazıldı.'
    if parca.dogrulama == 'ezber':
        return 'Ezberden yazıldı; henüz bir nota kaynağıyla karşılaştırılmadı.'
    bag = f'[{k["ad"]}]({k["url"]})' if k.get('url') else k['ad']
    son = 'Notalar ve süreler kaynakla otomatik karşılaştırıldı.' if parca.dogrulama == 'kaynak' else \
        'Notalar kaynağa bakılarak elle denetlendi; ritim serbest olduğu için otomatik karşılaştırma yok.'
    return f'Kaynak: {bag}, {k["lisans"]}. {son}'


def parca_blogu(parca, calar: bool) -> str:
    p = [f'### {parca.no}. {parca.baslik}', '', parca.aciklama, '']
    if calar:
        p += [f'[▶ Programda aç]({SITE}?parca={parca.id})', '']
    p += [_bilgi(parca), '', _izgara_blogu(parca), '']
    sira = [parca.bolumler[k].ad for k in parca.sira]
    if len(parca.sira) != len(parca.bolumler):
        p += ['Çalma sırası: ' + ' → '.join(sira), '']
    for ipucu in parca.ipuclari:
        p.append(f'- {ipucu}')
    if parca.ipuclari:
        p.append('')
    p += [_kaynak_cumlesi(parca), '']
    return '\n'.join(p)


def parcalar_bolumu(parcalar: list, calar: bool = False) -> str:
    tablo = ['| # | Parça | Zorluk | Nota |', '|---|---|---|---|']
    for q in parcalar:
        tablo.append(f'| {q.no} | {q.ad} ({q.besteci}) | {ZORLUK[q.zorluk]} | {DOGRULAMA[q.dogrulama]} |')
    return GIRIS + '\n' + '\n'.join(tablo) + '\n\n' + '\n'.join(parca_blogu(q, calar) for q in parcalar)


def kaynaklar_bolumu(parcalar: list) -> str:
    satirlar = []
    for q in parcalar:
        if q.dogrulama in ('kaynak', 'kaynak-elle'):
            satirlar.append(f'- {q.no}. *{q.ad}*: [{q.kaynak["ad"]}]({q.kaynak["url"]}), {q.kaynak["lisans"]}.')
    return '\n'.join(satirlar) + '\n'
