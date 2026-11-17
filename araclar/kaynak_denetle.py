#!/usr/bin/env python3
"""kaynaklar/ref/ altındaki başvuru notalarını parça dosyalarıyla karşılaştırır.

Başvuru dosyaları, kaynak notaların (Mutopia, Vikipedi…) MIDI'ye çevrilmiş hâlinden
araclar/kaynak_ref.py ile bir kez üretilir; bu betik internete ve MIDI'ye gerek duymaz.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kaynak_ref import ref_denetle  # noqa: E402
from parca import ParcaHatasi  # noqa: E402

if __name__ == '__main__':
    try:
        sys.exit(ref_denetle())
    except ParcaHatasi as e:
        print('HATA:', e, file=sys.stderr)
        sys.exit(1)
