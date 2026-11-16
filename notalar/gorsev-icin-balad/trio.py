# Görsev İçin Balad — piyano trio düzenlemesi (piyano, kontrbas, fırçalı davul) -> MIDI
import sys, random, importlib.util
import mido
random.seed(11)
spec = importlib.util.spec_from_file_location('balad', sys.argv[1]); sys.argv_backup = sys.argv
b = importlib.util.module_from_spec(spec); sys.argv = ['x', 'none']; spec.loader.exec_module(b); sys.argv = sys.argv_backup
OUT = sys.argv[2]
TPB = 480
SW = 0.62                       # swing: ikinci sekizliğin vuruş içindeki yeri

# ---- akorlar: (ad, kök perde sınıfı, tür, vuruş)
def seg(n, r, q, d): return (n, r, q, d)
A = [[seg('Dm', 2, 'm', 4)], [seg('DmΔ', 2, 'mM7', 4)], [seg('Dm7c', 2, 'm7', 4)],
     [seg('Dm7c', 2, 'm7', 2), seg('Dm6', 2, 'm6', 2)], [seg('Gm7', 7, 'm7', 2), seg('C7', 0, '7', 2)],
     [seg('FΔ', 5, 'maj7', 2), seg('BbΔ', 10, 'maj7', 2)], [seg('Eø', 4, 'm7b5', 2), seg('A7', 9, '7', 2)]]
TO_A = [seg('Dm7', 2, 'm7', 2), seg('A7sus', 9, '7sus', 2)]      # A'dan yine A'ya
TO_B = [seg('Dm7', 2, 'm7', 2), seg('G7b9', 7, '7', 2)]          # A'dan köprüye (Cm7'ye ii-V)
B = [[seg('Cm7', 0, 'm7', 4)], [seg('F7', 5, '7', 4)], [seg('BbΔ', 10, 'maj7', 4)], [seg('Bb/F', 10, '6', 4)],
     [seg('Eø', 4, 'm7b5', 4)], [seg('A7', 9, '7', 4)], [seg('Dm9', 2, 'm7', 4)], [seg('A7', 9, '7', 4)]]
INTRO = [[seg('Dm', 2, 'm', 4)], [seg('DmΔ', 2, 'mM7', 4)], [seg('Dm7c', 2, 'm7', 4)], [seg('Eø', 4, 'm7b5', 2), seg('A7', 9, '7', 2)]]

# kök sesi olmayan sol el akorları (MIDI)
VOI = {'Dm': [53, 57, 62], 'DmΔ': [53, 57, 61], 'Dm7c': [53, 57, 60], 'Dm6': [53, 57, 59], 'Dm7': [53, 57, 60, 64],
       'Dm9': [53, 57, 60, 64], 'Gm7': [53, 57, 58, 62], 'C7': [52, 57, 58, 62], 'FΔ': [52, 55, 57, 60],
       'BbΔ': [50, 53, 57, 60], 'Eø': [50, 55, 58], 'A7': [55, 58, 61, 65], 'A7sus': [55, 59, 62, 64],
       'G7b9': [53, 56, 59, 62], 'Cm7': [51, 55, 58, 62], 'F7': [51, 55, 57, 62], 'Bb/F': [50, 53, 55, 60]}
TONES = {'m': [3, 7], 'm7': [3, 7, 10], 'mM7': [3, 7, 11], 'm6': [3, 7, 9], '7': [4, 7, 10], '7sus': [5, 7, 10],
         'maj7': [4, 7, 11], 'm7b5': [3, 6, 10], '6': [4, 7, 9]}

# ---- melodi (tema) ve solo
def mel_bars(sec):
    return [[(b.midi(n), d) for n, d in mel] for _, _, mel in sec]
MA, MB = mel_bars(b.A), mel_bars(b.B)
N = {'G4': 67, 'Ab4': 68, 'A4': 69, 'Bb4': 70, 'B4': 71, 'C5': 72, 'C#5': 73, 'Db5': 73, 'D5': 74, 'Eb5': 75, 'E5': 76,
     'F5': 77, 'G5': 79, 'Ab5': 80, 'A5': 81, 'Bb5': 82, 'B5': 83, 'C6': 84, 'C#6': 85, 'D6': 86}
SOLO_TXT = [  # sekizlik birimleriyle (nota süre), 'r' = es
 'r2 A4 D5 E5 F5 A5:2', 'F5 E5 D5 C#5 D5 E5 G5 A5', 'C6:2 A5 F5 E5 D5 C5 A4', 'D5 E5 F5 D5 B4:2 r A4',
 'Bb4 D5 F5 A5 G5 E5 Db5 Bb4', 'A4 C5 E5 G5 F5:2 E5 D5', 'D5 C5 Bb4 G4 C#5 E5 G5 Bb5', 'A5:3 F5 E5:2 r2',
 'r D5 F5 A5 C6 A5 F5 E5', 'C#5 D5 E5 F5 G5 A5 B5 C#6', 'D6:2 C6 A5 F5 E5 D5 C5', 'A4 C5 E5 D5 B4 D5 F5 A5',
 'Bb5:2 A5 G5 E5 Db5 Bb4 G4', 'A4 C5 E5 A5 G5 F5 D5 Bb4', 'Bb4 D5 G5 F5 E5 C#5 Bb4 G4', 'A4:2 D5 F5 Ab5 G5 F5 D5']
def parse_solo(txt):
    out = []
    for tok in txt.split():
        n, _, d = tok.partition(':'); d = int(d or 1)
        if n.startswith('r') and n != 'r' and n[1:].isdigit(): out.append((None, int(n[1:]))); continue
        out.append((None if n == 'r' else N[n], d))
    assert sum(d for _, d in out) == 8, txt
    return out
SOLO = [parse_solo(t) for t in SOLO_TXT]
BN = {'G1': 31, 'Ab1': 32, 'A1': 33, 'Bb1': 34, 'B1': 35, 'C2': 36, 'C#2': 37, 'Db2': 37, 'D2': 38, 'Eb2': 39, 'E2': 40,
      'F2': 41, 'G2': 43, 'Ab2': 44, 'A2': 45, 'Bb2': 46, 'B2': 47, 'C3': 48, 'C#3': 49, 'D3': 50}
WALK_TXT = ['D2 F2 A2 C#3', 'D3 C#3 A2 F2', 'D2 F2 A2 C3', 'D3 C3 B2 Ab2', 'G2 F2 C2 E2', 'F2 A2 Bb2 F2', 'E2 G2 A2 Eb2', 'D2 F2 A2 C#3',
            'D3 C3 A2 F2', 'D2 F2 A2 C#3', 'D3 A2 F2 E2', 'D2 C2 B1 Ab1', 'G1 Bb1 C2 E2', 'F2 C2 Bb1 D2', 'E2 Bb1 A1 C#2', 'D2 F2 G2 Db2']
WALK = [[BN[x] for x in t.split()] for t in WALK_TXT]

# ---- olay listesi: (vuruş, kanal, nota, velocity, süre)
ev = []          # nota olayları
tempo = [(0, 66)]
PIANO, BASS, DR = 0, 1, 9
def note(t, ch, n, v, d):
    ev.append([t, ch, n, max(1, min(120, int(v))), d])
def sw(p):       # p: vuruş cinsinden konum (0, .5, 1 ...) -> swing'li konum
    f = p - int(p)
    return int(p) + (SW if abs(f - .5) < 1e-6 else f)
def hum(v, s=5): return v + random.uniform(-s, s)

def bass_root(pc, near=None, lo=28, hi=40):
    cands = [n for n in range(lo, hi + 1) if n % 12 == pc]
    if near is None: return cands[0]
    return min(cands, key=lambda n: abs(n - near))

def comp_sustain(t0, bar, vel):
    t = t0
    for name, r, q, d in bar:
        for n in VOI[name]: note(t + random.uniform(0, .03), PIANO, n, hum(vel, 3), d - .08)
        t += d
def comp_charleston(t0, bar, vel):
    if len(bar) == 1:
        v = VOI[bar[0][0]]
        for n in v: note(t0, PIANO, n, hum(vel, 3), 1.35)
        for n in v: note(t0 + 1 + SW, PIANO, n, hum(vel - 6, 3), 2.2)
    else:
        for n in VOI[bar[0][0]]: note(t0, PIANO, n, hum(vel, 3), 1.35)
        for n in VOI[bar[1][0]]: note(t0 + 1 + SW, PIANO, n, hum(vel - 3, 3), 2.25)

prev_bass = [38]
def bass_two(t0, bar, nxt, pickup, vel=86):
    if len(bar) == 1:
        name, r, q, d = bar[0]
        root = bass_root(r, prev_bass[0]); fifth = root + 7 if root + 7 <= 45 else root - 5
        note(t0, BASS, root, hum(vel), 1.9)
        if pickup and nxt:
            note(t0 + 2, BASS, fifth, hum(vel - 6), .95)
            nr = bass_root(nxt[0][1], fifth); ap = nr - 1 if nr > fifth else nr + 1
            note(t0 + 3, BASS, ap, hum(vel - 8), .95); prev_bass[0] = ap
        else:
            note(t0 + 2, BASS, fifth, hum(vel - 6), 1.9); prev_bass[0] = fifth
    else:
        for i, (name, r, q, d) in enumerate(bar):
            root = bass_root(r, prev_bass[0]); note(t0 + 2 * i, BASS, root, hum(vel - 3 * i), 1.9); prev_bass[0] = root

def bass_walk(t0, bar, nxt, vel=82):
    t = t0
    for i, (name, r, q, d) in enumerate(bar):
        nseg = bar[i + 1] if i + 1 < len(bar) else (nxt[0] if nxt else bar[0])
        root = bass_root(r, prev_bass[0], 28, 43)
        notes = [root]
        if d == 4:
            tones = TONES[q]
            up = root + 7 <= 47
            notes += [root + tones[0], root + tones[1]] if up else [root - 12 + tones[-1], root - 5]
        nr = bass_root(nseg[1], notes[-1], 28, 45)
        notes.append(nr - 1 if nr > notes[-1] else nr + 1)
        for k, n in enumerate(notes):
            note(t + k, BASS, n, hum(vel + (6 if k % 2 == 0 else 0)), .92)
        prev_bass[0] = notes[-1]; t += d

def drums(t0, style, fill=False, vel=0):
    if style in ('intro', 'two'):
        fill_taps = fill
        sv = 42 if style == 'intro' else 52
        note(t0, DR, 40, hum(sv + vel, 4), .5); note(t0 + 2, DR, 40, hum(sv - 4 + vel, 4), .5)
        note(t0 + 1, DR, 44, hum(40 + vel, 4), .2); note(t0 + 3, DR, 44, hum(42 + vel, 4), .2)
        if style == 'two': note(t0, DR, 36, hum(26, 3), .2)
        if fill:
            note(t0 + 3, DR, 38, hum(48 + vel, 4), .2); note(t0 + 3 + SW, DR, 38, hum(58 + vel, 4), .2)
    elif style == 'four':
        note(t0, DR, 40, hum(38, 4), .5); note(t0 + 2, DR, 40, hum(36, 4), .5)
        for p, v in [(0, 48), (1, 60), (1 + SW, 40), (2, 48), (3, 62), (3 + SW, 40)]:
            if not (fill and p >= 3): note(t0 + p, DR, 38, hum(v, 4), .2)
        note(t0 + 1, DR, 44, hum(48, 4), .2); note(t0 + 3, DR, 44, hum(50, 4), .2); note(t0, DR, 36, hum(24, 3), .2)
        if fill:
            for p, v in [(3, 52), (3 + 1/3, 58), (3 + 2/3, 68)]: note(t0 + p, DR, 38, hum(v, 3), .2)

def melody(t0, bar, vel, nxt_onset=4.0):
    pos = 0; onsets = []
    for n, d in bar: onsets.append((sw(pos), n, d)); pos += d
    for k, (o, n, d) in enumerate(onsets):
        end = onsets[k + 1][0] if k + 1 < len(onsets) else nxt_onset
        accent = 6 if d >= 2 else 0
        note(t0 + o, PIANO, n, hum(vel + accent, 4), max(.2, end - o - .05))

def solo(t0, bar, vel):
    pos = 0
    items = []
    for n, d in bar:
        items.append((pos, n, d)); pos += d
    for k, (p8, n, d8) in enumerate(items):
        if n is None: continue
        o = sw(p8 / 2); e = sw((p8 + d8) / 2) if p8 + d8 < 8 else 4.0
        beat_strong = p8 % 2 == 0
        note(t0 + o, PIANO, n, hum(vel + (5 if beat_strong else -4) + (n - 74) * 0.4, 4), max(.15, e - o - .04))

# ---- düzen
t = 0.0
def bars_of(sec, last):
    return sec + [last]

# Giriş: piyano kliş akorları + üstte inen çizgi, kontrbas, fırça
line = [[(74, 4)], [(73, 4)], [(72, 4)], [(70, 2), (73, 2)]]
for i, bar in enumerate(INTRO):
    comp_charleston(t, bar, 44)
    tt = t
    for n, d in line[i]: note(tt, PIANO, n, hum(54, 3), d - .1); tt += d
    bass_two(t, bar, INTRO[i + 1] if i + 1 < 4 else A[0], pickup=(i == 3))
    drums(t, 'intro', fill=(i == 3)); t += 4

def head_A(last, vel, nxt_first, drum_vel=0):
    global t
    bars = A + [last]
    for i, bar in enumerate(bars):
        mel = MA[i] if i < 7 else [(74, 4)]
        melody(t, mel, vel)
        comp_sustain(t, bar, vel - 26)
        nxt = bars[i + 1] if i + 1 < 8 else nxt_first
        bass_two(t, bar, nxt, pickup=(i == 7))
        drums(t, 'two', fill=(i == 7), vel=drum_vel)
        t += 4
def head_B(vel, drum_vel=4):
    global t
    for i, bar in enumerate(B):
        melody(t, MB[i], vel + (4 if 3 < i < 6 else 0))
        comp_sustain(t, bar, vel - 24)
        nxt = B[i + 1] if i + 1 < 8 else A[0]
        bass_two(t, bar, nxt, pickup=(i == 7))
        drums(t, 'two', fill=(i == 7), vel=drum_vel)
        t += 4

head_A(TO_A, 70, A[0]); head_A(TO_B, 74, B[0]); head_B(78); head_A(TO_A, 70, A[0])
# Solo: A A (walking bass, dörtlü fırça)
solo_bars = A + [TO_A] + A + [TO_B]
for i, bar in enumerate(solo_bars):
    solo(t, SOLO[i], 70 + (4 if i >= 8 else 0))
    comp_charleston(t, bar, 50)
    for k, n in enumerate(WALK[i]): note(t + k, BASS, n, hum(82 + (6 if k % 2 == 0 else 0)), .92)
    prev_bass[0] = WALK[i][-1]
    drums(t, 'four', fill=(i in (7, 15)))
    t += 4
# Köprüden tema
head_B(78)
# Son A + bitiş (yavaşlayarak)
for i, bar in enumerate(A + [[seg('Dm7', 2, 'm7', 4)]]):
    if i == 6: tempo.append((t, 62))
    if i == 7: tempo.append((t, 56))
    mel = MA[i] if i < 7 else [(74, 4)]
    melody(t, mel, 64)
    comp_sustain(t, bar, 42)
    bass_two(t, bar, None, pickup=False)
    drums(t, 'two', vel=-8)
    t += 4
tempo.append((t, 48))
for n in [53, 57, 59, 62]: note(t + random.uniform(0, .02), PIANO, n, 44, 3.9)
for k, n in enumerate([71, 74, 77]): note(t + .04 * k, PIANO, n, 56 + 4 * k, 3.9)
note(t, BASS, 38, 80, 3.9)
note(t, DR, 40, 34, .5)
for k in range(12): note(t + 1.5 + k * 0.2, DR, 51, 18 + k * 3.5, .1)          # zilde yumuşak kabarma
t += 4
tempo.append((t, 40))
for k, n in enumerate([54, 57, 62, 64]): note(t + .05 * k, PIANO, n, 46, 7.8)
for k, n in enumerate([69, 74, 78]): note(t + .2 + .06 * k, PIANO, n, 58 + 3 * k, 7.6)
note(t, BASS, 38, 84, 7.5)
note(t, DR, 49, 44, 1); note(t, DR, 36, 34, .3)
END = t + 10

# ---- MIDI'ye yaz
mid = mido.MidiFile(ticks_per_beat=TPB)
meta = mido.MidiTrack(); mid.tracks.append(meta)
abs_meta = [(round(bt * TPB), mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(bpm))) for bt, bpm in tempo]
abs_meta.append((round(END * TPB), mido.MetaMessage('end_of_track')))
last = 0
for tk, m in sorted(abs_meta, key=lambda x: x[0]):
    if m.type == 'end_of_track': continue
    meta.append(m.copy(time=tk - last)); last = tk
setup = {PIANO: (0, 100, 64, 45), BASS: (32, 70, 58, 25), DR: (40, 103, 70, 38)}
for ch, (prog, vol, pan, rev) in setup.items():
    tr = mido.MidiTrack(); mid.tracks.append(tr)
    tr.append(mido.Message('program_change', channel=ch, program=prog, time=0))
    for cc, val in ((7, vol), (10, pan), (91, rev), (93, 0)): tr.append(mido.Message('control_change', channel=ch, control=cc, value=val, time=0))
    items = []
    for t0, c, n, v, d in ev:
        if c != ch: continue
        on = max(0, round((t0 + random.uniform(-.006, .006)) * TPB)); off = max(on + 10, round((t0 + d) * TPB))
        items.append((on, 1, mido.Message('note_on', channel=ch, note=n, velocity=v)))
        items.append((off, 0, mido.Message('note_off', channel=ch, note=n, velocity=0)))
    items.append((round(END * TPB), 2, mido.Message('control_change', channel=ch, control=7, value=vol)))
    items.sort(key=lambda x: (x[0], x[1]))
    last = 0
    for tk, _, m in items: tr.append(m.copy(time=tk - last)); last = tk
mid.save(OUT)
counts = {ch: sum(1 for e in ev if e[1] == ch) for ch in (PIANO, BASS, DR)}
print('bitti:', OUT, 'süre', round(mido.MidiFile(OUT).length, 1), 'sn', 'nota sayıları', counts,
      'bas aralığı', min(e[2] for e in ev if e[1] == BASS), max(e[2] for e in ev if e[1] == BASS))
