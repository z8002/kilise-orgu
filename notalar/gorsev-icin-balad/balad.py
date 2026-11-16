# Görsev İçin Balad: tek kaynak -> LilyPond + README tuş dizisi
import sys
NAMES = {'c':0,'cis':1,'des':1,'d':2,'dis':3,'ees':3,'e':4,'f':5,'fis':6,'g':7,'gis':8,'aes':8,'a':9,'ais':10,'bes':10,'b':11}
def midi(n):  # 'd5' -> 74
    return 12*(int(n[-1])+1) + NAMES[n[:-1]]
LOWER = ['Z','S','X','D','C','V','G','B','H','N','J','M','Ö','L','Ç','Ş','.']   # C3..E4
UPPER = ['Q','2','W','3','E','R','5','T','6','Y','7','U','I','9','O','0','P','Ğ','-','Ü']  # C4..G5
def up(m):
    assert 60 <= m <= 79, m; return UPPER[m-60]
def low(m):
    assert 48 <= m <= 64, m; return LOWER[m-48]

# (akor, sol el [(notalar, vuruş)], melodi [(nota, vuruş)])
A = [
 ('Dm',        [(['d3','d4'],4)],                     [('d5',1),('a4',.5),('e5',.5),('f5',2)]),
 ('Dm(maj7)',  [(['d3','cis4'],4)],                   [('e5',1),('d5',1),('cis5',2)]),
 ('Dm7',       [(['d3','c4'],4)],                     [('c5',1),('g4',.5),('d5',.5),('e5',2)]),
 ('Dm7 | Dm6', [(['d3','c4'],2),(['d3','b3'],2)],   [('d5',1),('c5',1),('b4',2)]),
 ('Gm7 | C7',  [(['g3','bes3'],2),(['c3','bes3'],2)], [('bes4',.5),('d5',.5),('f5',1),('e5',2)]),
 ('Fmaj7 | B♭maj7', [(['f3','a3'],2),(['bes3','d4'],2)], [('a4',.5),('c5',.5),('e5',1),('d5',2)]),
 ('Em7♭5 | A7', [(['e3','d4'],2),(['a3','cis4'],2)],  [('g4',.5),('bes4',.5),('d5',1),('cis5',2)]),
 ('Dm',        [(['d3','d4'],4)],                     [('d5',4)]),
]
B = [
 ('Cm7',       [(['c3','bes3'],4)],                   [('ees5',1),('d5',.5),('ees5',.5),('g5',2)]),
 ('F7',        [(['f3','a3'],4)],                     [('f5',1),('ees5',.5),('c5',.5),('a4',2)]),
 ('B♭maj7',    [(['bes3','d4'],4)],                   [('d5',1),('c5',.5),('d5',.5),('f5',2)]),
 ('B♭/F',      [(['f3','bes3'],4)],                   [('ees5',1),('d5',.5),('bes4',.5),('g4',2)]),
 ('Em7♭5',     [(['e3','d4'],4)],                     [('bes4',1),('d5',1),('g5',2)]),
 ('A7',        [(['a3','cis4'],4)],                   [('f5',1),('e5',1),('cis5',2)]),
 ('Dm',        [(['d3','d4'],4)],                     [('d5',3),('a4',1)]),
 ('A7',        [(['a3','cis4'],4)],                   [('e5',.5),('d5',.5),('cis5',.5),('bes4',.5),('a4',2)]),
]
END = [  # bitiş akorları: sol el + üstte melodi notası
 ('Dm6', ['d3','b3'], 'f5'),
 ('D',   ['d3','a3'], 'fis5'),
]

def dur_token(k, beats):
    return k + {1:'', 2:' —', 3:' ——', 4:' ———'}[beats]

def mel_str(mel, split_at=None):
    out = []; pos = 0; i = 0
    while i < len(mel):
        n, b = mel[i]
        if split_at is not None and pos == split_at: out.append('|')
        if b == .5:
            n2, b2 = mel[i+1]; assert b2 == .5 and pos == int(pos)
            # dörtlü sekizlik grubu: iki çift
            out.append(up(midi(n)) + '·' + up(midi(n2))); pos += 1; i += 2; continue
        out.append(dur_token(up(midi(n)), int(b))); pos += b; i += 1
    return '  '.join(out)

def bar_check(sec):
    for chord, lh, mel in sec:
        assert sum(b for _, b in lh) == 4, (chord, lh)
        assert sum(b for _, b in mel) == 4, (chord, mel)

bar_check(A); bar_check(B)

def lh_str(lh):
    return ' | '.join(' + '.join(low(midi(n)) for n in notes) for notes, _ in lh)

def block(sec, start):
    lines = []
    for i, (chord, lh, mel) in enumerate(sec):
        split = 2 if len(lh) == 2 else None
        lines.append(f"{start+i:>3}.  {chord:<16}{lh_str(lh):<17}{mel_str(mel, split)}")
    return lines

if sys.argv[1] == 'readme':
    print('\n'.join(block(A, 1))); print()
    print('\n'.join(block(B, 9))); print()
    for chord, lh, top in END:
        print(f"      {chord:<16}{' + '.join([low(midi(n)) for n in lh] + [up(midi(top))])}  ———")

if sys.argv[1] == 'ly':
    def ly(n):
        name, octv = n[:-1], int(n[-1])
        return name + ("'" * (octv-3) if octv >= 3 else "," * (3-octv))
    def lydur(b):
        return {.5:'8', 1:'4', 2:'2', 3:'2.', 4:'1'}[b]
    def mel_ly(sec): return ' '.join(' '.join(ly(n)+lydur(b) for n, b in mel) + ' |' for _, _, mel in sec)
    def lh_ly(sec): return ' '.join(' '.join('<' + ' '.join(ly(n) for n in notes) + '>' + lydur(b) for notes, b in lh) + ' |' for _, lh, _ in sec)
    melody = mel_ly(A) + ' ' + mel_ly(A) + ' ' + mel_ly(B) + ' ' + mel_ly(A[:7]) + ' ' + mel_ly(A[7:]) + ' ' + ' '.join(ly(t)+'1 |' for _, _, t in END)
    left   = lh_ly(A) + ' ' + lh_ly(A) + ' ' + lh_ly(B) + ' ' + lh_ly(A[:7]) + ' ' + lh_ly(A[7:]) + ' ' + ' '.join('<' + ' '.join(ly(n) for n in lh) + '>1 |' for _, lh, _ in END)
    print(r'''\version "2.24.0"
\header { title = "Görsev İçin Balad" tagline = ##f }
\score {
  \new PianoStaff <<
    \new Staff { \clef treble \key d \minor \time 4/4 \tempo 4 = 60 \set Staff.midiInstrument = "church organ" ''' + melody + r''' \bar "|." }
    \new Staff { \clef bass \key d \minor \time 4/4 \set Staff.midiInstrument = "church organ" ''' + left + r''' \bar "|." }
  >>
  \layout { } \midi { }
}''')

if sys.argv[1] == 'events':
    import json
    BEAT = 1000; SWING = (0.58, 0.42); GAP = 40
    form = [('A', A), ('A', A), ('B', B), ('A', A)]
    steps = []   # her nota başlangıcı: zaman, süre, sol el etiketleri, melodi etiketi, beklenen midi kümesi
    regs = []    # (zaman, piston)
    t = 0
    for si, (name, sec) in enumerate(form):
        if name == 'B': regs.append((t, 4))
        if si == 3: regs.append((t, 3))
        for chord, lh, mel in sec:
            # sol el segmentleri: (başlangıç vuruşu, notalar)
            segs = []; p = 0
            for notes, b in lh: segs.append((p, notes)); p += b
            pos = 0; i = 0
            while i < len(mel):
                n, b = mel[i]
                if b == .5:
                    durs = [SWING[0], SWING[1]]; pair = [mel[i][0], mel[i+1][0]]; i += 2
                else:
                    durs = [b]; pair = [n]; i += 1
                for nn, d in zip(pair, durs):
                    seg = [s for s in segs if s[0] <= pos][-1][1]
                    steps.append({'t': round(t + pos*BEAT), 'dur': round(d*BEAT) - GAP,
                                  'lh': [low(midi(x)) for x in seg], 'mel': up(midi(nn)),
                                  'expect': sorted([midi(x) for x in seg] + [midi(nn)])})
                    pos += d
            t += 4*BEAT
    for k, (chord, lh, top) in enumerate(END):
        d = 4 if k == 0 else 6
        steps.append({'t': t, 'dur': d*BEAT - (GAP if k == 0 else 0), 'lh': [low(midi(x)) for x in lh], 'mel': up(midi(top)),
                      'expect': sorted([midi(x) for x in lh] + [midi(top)])})
        t += d*BEAT
    print(json.dumps({'steps': steps, 'regs': regs, 'end': t}, ensure_ascii=False))
