  /* ================= Ses motoru ================= */
  let ctx = null;
  let A = null;
  let windOn = false;

  // Perde: diyapazon (La4) ve akort sistemi
  let akortSapmasi = akortSapmalari(AKORTLAR[settings.akort].besliler);
  function notaFrekansi(midi) {
    const pc = ((midi % 12) + 12) % 12;
    return settings.diyapazon * Math.pow(2, (midi - 69 + (akortSapmasi[pc] - akortSapmasi[9]) / 100) / 12);
  }
  // Akort ya da diyapazon değişince çalan sesler de yeni perdeye kayar
  function akortuUygula() {
    akortSapmasi = akortSapmalari(AKORTLAR[settings.akort].besliler);
    if (!ctx) return;
    for (const v of [...voices.values(), ...playerVoices]) v.akortla(ctx.currentTime);
  }

  // Stereo yerleşim: borular cephede iki yana dizilir. Do tarafı (Do Re Mi Fa♯ Sol♯ La♯) solda, Do♯ tarafı
  // (Do♯ Re♯ Fa Sol La Si) sağda; kalın borular kenarda, ince borular ortaya yakın.
  function notaYeri(midi) {
    const yan = midi % 2 === 0 ? -1 : 1;
    const u = clamp((midi - 36) / 60, 0, 1);
    return yan * (settings.stereo / 100) * 0.9 * (0.25 + 0.75 * (1 - u));
  }
  function yerlesimiUygula() {
    if (!ctx) return;
    for (const v of [...voices.values(), ...playerVoices]) if (v.pan) v.pan.pan.setTargetAtTime(notaYeri(v.midi), ctx.currentTime, 0.05);
  }

  function buildAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC({ latencyHint: 'interactive' });
    // iPhone: sessiz anahtarı açıkken de çalsın (iOS 17 ve sonrası; varsayılan oturum türü sessizde susar)
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {}

    const bus = ctx.createGain(); bus.gain.value = 0.2;
    const trem = ctx.createGain(); trem.gain.value = 1;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 9000; tone.Q.value = 0.4;
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const conv = ctx.createConvolver();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 14; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.3;
    const master = ctx.createGain();

    bus.connect(trem); trem.connect(tone);
    tone.connect(dry); tone.connect(conv); conv.connect(wet);
    dry.connect(comp); wet.connect(comp);
    comp.connect(master); master.connect(ctx.destination);

    // Tremolo: genlik ve perdeyi titreten tek bir LFO
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.4;
    const lfoAmp = ctx.createGain(); lfoAmp.gain.value = 0;
    const lfoPitch = ctx.createGain(); lfoPitch.gain.value = 0;
    lfo.connect(lfoAmp); lfoAmp.connect(trem.gain);
    lfo.connect(lfoPitch);
    lfo.start();

    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    const waves = {};
    for (const [k, amps] of Object.entries(WAVES)) {
      const real = new Float32Array(amps.length + 1);
      const imag = new Float32Array(amps.length + 1);
      amps.forEach((a, i) => { imag[i + 1] = a; });
      waves[k] = ctx.createPeriodicWave(real, imag);
    }

    A = { bus, dry, wet, conv, master, lfoAmp, lfoPitch, noise, waves };
    applyRoom();
    applyMix();
    applyTremolo();
    return true;
  }

  // Kilise akustiği: gecikmeli, zamanla kararan gürültü kuyruğu + erken yansımalar
  function buildImpulse(seconds) {
    const sr = ctx.sampleRate;
    const pre = Math.floor(sr * 0.022);
    const len = pre + Math.floor(sr * seconds);
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let lp = 0;
      for (let i = pre; i < len; i++) {
        const t = (i - pre) / sr;
        const env = Math.exp(-6.9 * t / seconds);
        const a = 0.85 - 0.72 * Math.min(1, t / seconds);
        lp += a * ((Math.random() * 2 - 1) - lp);
        d[i] = lp * env * (t < 0.015 ? t / 0.015 : 1);
      }
      for (let k = 0; k < 14; k++) {
        const ti = pre + Math.floor(sr * (0.006 + Math.random() * 0.09));
        if (ti < len) d[ti] += (Math.random() * 2 - 1) * 0.6 * Math.exp(-(ti / sr) * 8);
      }
    }
    return buf;
  }

  // Hafif modda yankı en çok 2,4 saniye sürer: uzun yankı telefonda en çok işlemciyi yoran kısımdır.
  function applyRoom() { if (ctx) A.conv.buffer = buildImpulse(settings.hafif ? Math.min(ROOMS[settings.room], 2.4) : ROOMS[settings.room]); }
  function applyMix() {
    if (!ctx) return;
    const t = ctx.currentTime;
    const rev = settings.reverb / 100, vol = settings.volume / 100;
    A.dry.gain.setTargetAtTime(1 - rev * 0.45, t, 0.05);
    A.wet.gain.setTargetAtTime(rev * 1.2, t, 0.05);
    A.master.gain.setTargetAtTime(vol * vol * 1.4, t, 0.05);
  }
  function applyTremolo() {
    if (!ctx) return;
    const on = stopsOn.has('tremolo'), t = ctx.currentTime;
    A.lfoAmp.gain.setTargetAtTime(on ? 0.13 : 0, t, 0.08);
    A.lfoPitch.gain.setTargetAtTime(on ? 6 : 0, t, 0.08);
  }

  function freeze(param, t) {
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(t);
    else { const v = param.value; param.cancelScheduledValues(t); param.setValueAtTime(v, t); }
  }
  function fadeOut(s, t, tau, stopAt) {
    freeze(s.g.gain, t);
    s.g.gain.setTargetAtTime(0, t, tau);
    s.oscs.forEach(o => { try { o.stop(stopAt); } catch (_) {} });
    s.oscs[0].addEventListener('ended', () => { try { s.g.disconnect(); } catch (_) {} });
  }
  // Borunun "konuşma" süresi: kalın borular geç, ince borular hızlı konuşur
  function speechTime(f, family) {
    let t = clamp(0.012 + 7 / f, 0.018, 0.12);
    if (family === 'reed') t *= 0.45;
    return t;
  }
  const keyScale = f => (f > 1800 ? Math.pow(1800 / f, 0.5) : 1);

  class Voice {
    // t0 ileri bir an olabilir (şarkı çalar notaları önceden zamanlar); stopIds verilmezse açık registerler kullanılır.
    constructor(midi, t0, stopIds) {
      this.midi = midi;
      this.t0 = t0;
      this.freq = notaFrekansi(midi);
      this.stops = new Map();
      this.released = false;
      this.breath = null;
      this.out = ctx.createGain();
      this.pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (this.pan) {
        this.pan.pan.value = notaYeri(midi);
        this.out.connect(this.pan);
        this.pan.connect(A.bus);
      } else this.out.connect(A.bus);
      for (const id of (stopIds || stopsOn)) this.addStop(STOP_BY_ID[id], t0);
      if (this.stops.size) this.articulate(t0);
    }

    // Henüz başlamamış (ya da hemen susması gereken) sesi iz bırakmadan keser.
    cancel() {
      if (this.released) return;
      this.released = true;
      try { this.out.disconnect(); } catch (_) {}
      if (this.pan) try { this.pan.disconnect(); } catch (_) {}
      const t = ctx.currentTime;
      for (const s of this.stops.values()) s.oscs.forEach(o => { try { o.stop(t); } catch (_) {} });
      if (this.breath) { try { this.breath.src.stop(t); } catch (_) {} }
    }

    addStop(stop, t0) {
      if (stop.effect || this.released || this.stops.has(stop.id)) return;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(this.out);
      const oscs = [];
      let speak = 0.018;
      // Hafif modda Mikstür'ün yalnızca ilk iki sırası öter
      for (const r of (settings.hafif ? stop.ranks.slice(0, 2) : stop.ranks)) {
        let mult = r.mult;
        if (r.breaks) while (this.freq * mult > 5200 && mult >= 4) mult /= 2; // mikstür "geri kırılır"
        const f = this.freq * mult;
        if (f < 15 || f > 11000) continue;
        const o = ctx.createOscillator();
        o.setPeriodicWave(A.waves[r.wave]);
        o.frequency.value = f;
        o.carpan = mult; // akort değişince yeni perde: freq * carpan
        const cents = (r.cents || 0) + (Math.random() * 2 - 1) * 2.2; // borular asla tam aynı akortta değildir
        if (stop.family === 'reed') o.detune.value = cents;
        else { o.detune.setValueAtTime(cents - 8, t0); o.detune.setTargetAtTime(cents, t0, 0.04); }
        A.lfoPitch.connect(o.detune);
        const rg = ctx.createGain();
        rg.gain.value = r.level * keyScale(f);
        o.connect(rg); rg.connect(g);
        o.start(t0);
        o.onended = () => {
          try { A.lfoPitch.disconnect(o.detune); } catch (_) {}
          o.disconnect(); rg.disconnect();
        };
        oscs.push(o);
        speak = Math.max(speak, speechTime(f, stop.family));
      }
      if (!oscs.length) { g.disconnect(); return; }
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(1, t0 + speak);
      this.stops.set(stop.id, { g, oscs });
    }

    akortla(t) {
      const f = notaFrekansi(this.midi);
      if (f === this.freq || this.released) return;
      this.freq = f;
      for (const s of this.stops.values()) for (const o of s.oscs) o.frequency.setTargetAtTime(f * o.carpan, Math.max(t, this.t0), 0.03);
    }

    removeStop(id, t) {
      const s = this.stops.get(id);
      if (!s) return;
      this.stops.delete(id);
      fadeOut(s, t, 0.035, t + 0.3);
    }

    // Borunun ağzındaki hava: kısa "chiff" ve çok hafif rüzgâr hışırtısı
    articulate(t0) {
      const flue = [...this.stops.keys()].some(id => STOP_BY_ID[id].family !== 'reed');
      if (flue) {
        const src = ctx.createBufferSource(); src.buffer = A.noise;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = Math.min(this.freq * 3, 7500); bp.Q.value = 6;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.9, t0 + 0.006);
        g.gain.setTargetAtTime(0, t0 + 0.012, 0.03);
        src.connect(bp); bp.connect(g); g.connect(this.out);
        src.start(t0, Math.random() * 1.5, 0.25);
        src.onended = () => { try { g.disconnect(); } catch (_) {} };
      }
      if (settings.hafif) return; // hafif modda sürekli rüzgâr hışırtısı yok
      const br = ctx.createBufferSource(); br.buffer = A.noise; br.loop = true;
      const bf = ctx.createBiquadFilter(); bf.type = 'bandpass';
      bf.frequency.value = Math.min(this.freq * 2, 6000); bf.Q.value = 1.2;
      const bg = ctx.createGain();
      bg.gain.setValueAtTime(0, t0);
      bg.gain.linearRampToValueAtTime(0.06, t0 + 0.05);
      br.connect(bf); bf.connect(bg); bg.connect(this.out);
      br.start(t0, Math.random() * 1.5);
      this.breath = { src: br, g: bg };
    }

    release(t) {
      if (this.released) return;
      this.released = true;
      const rel = clamp(0.05 + 4 / this.freq, 0.07, 0.2);
      const end = t + rel * 2.4 + 0.05;
      for (const s of this.stops.values()) fadeOut(s, t, rel / 3, end);
      if (this.breath) {
        freeze(this.breath.g.gain, t);
        this.breath.g.gain.setTargetAtTime(0, t, 0.03);
        try { this.breath.src.stop(t + 0.3); } catch (_) {}
      }
      const out = this.out, pan = this.pan;
      setTimeout(() => {
        try { out.disconnect(); } catch (_) {}
        if (pan) try { pan.disconnect(); } catch (_) {}
      }, Math.max(0, end - ctx.currentTime) * 1000 + 500);
    }
  }

  function whoosh() {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = A.noise; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(150, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + 0.8);
    lp.frequency.exponentialRampToValueAtTime(250, t + 2.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.6);
    g.gain.setTargetAtTime(0, t + 0.8, 0.5);
    src.connect(lp); lp.connect(g); g.connect(A.master);
    src.start(t); src.stop(t + 3.5);
    src.onended = () => { try { g.disconnect(); } catch (_) {} };
  }

