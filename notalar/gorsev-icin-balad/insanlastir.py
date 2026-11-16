import sys, random, mido
random.seed(7)
src, dst = sys.argv[1], sys.argv[2]
m = mido.MidiFile(src)
tpb = m.ticks_per_beat
MS = tpb / 1000  # 60 bpm'de 1 ms kaç tick

def to_abs(track):
    t = 0; out = []
    for msg in track:
        t += msg.time; out.append([t, msg])
    return out

def to_rel(evs):
    evs.sort(key=lambda e: (e[0], 0 if e[1].type == 'note_off' or (e[1].type == 'note_on' and e[1].velocity == 0) else 1))
    tr = mido.MidiTrack(); prev = 0
    for t, msg in evs:
        tr.append(msg.copy(time=max(0, round(t - prev)))); prev = max(prev, round(t))
    return tr

def humanize(evs, role):
    ons = [e for e in evs if e[1].type == 'note_on' and e[1].velocity]
    by_time = {}
    for e in ons: by_time.setdefault(e[0], []).append(e)
    shift_on = {}
    for t, group in by_time.items():
        jitter = random.uniform(-6, 6) * MS
        lead = 0 if role == 'rh' else 14 * MS          # melodi eşlikten ~14 ms önde
        top = max(g[1].note for g in group)
        for e in group:
            v = e[1].velocity
            if role == 'rh':
                v = v * (1.0 if e[1].note == top else 0.78)   # ikililerde üst ses şarkı söylesin
            else:
                bar_pos = (e[0] % (2 * tpb))
                v = v * (0.92 if bar_pos == 0 else 0.68)      # arpejin bas notası vurgulu, iç notalar yumuşak
            v = max(20, min(110, round(v + random.uniform(-4, 4))))
            e[1] = e[1].copy(velocity=v)
            shift_on[(e[1].channel, e[1].note, e[0])] = jitter + lead
            e[0] = e[0] + jitter + lead
    # note_off'ları kendi note_on'larıyla aynı kaydır
    open_notes = {}
    for e in sorted(evs, key=lambda e: e[0]):
        pass
    return evs

out = mido.MidiFile(ticks_per_beat=tpb, type=m.type)
for i, track in enumerate(m.tracks):
    evs = to_abs(track)
    if i in (1, 2):
        role = 'rh' if i == 1 else 'lh'
        # note_on/off çiftlerini eşleştirip birlikte kaydır
        pairs = {}; order = []
        for e in evs:
            msg = e[1]
            if msg.type == 'note_on' and msg.velocity:
                pairs.setdefault((msg.channel, msg.note), []).append(e)
            elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                on = pairs[(msg.channel, msg.note)].pop(0)
                order.append((on, e))
        before = {id(on): on[0] for on, off in order}
        humanize(evs, role)
        for on, off in order:
            d = on[0] - before[id(on)]
            off[0] = max(on[0] + 1, off[0] + d)
        if i == 2:
            last = max(e[0] for e in evs)
            evs.append([last + 4 * tpb, mido.Message('control_change', control=7, value=100, channel=evs[-1][1].channel if hasattr(evs[-1][1], 'channel') else 0)])
    out.tracks.append(to_rel(evs))
out.save(dst)
print('tamam', round(mido.MidiFile(dst).length, 1), 'sn')
