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
    if (ORG === 'caz') return 0; // caz orgunda yerleşimi dönen hoparlör yapar
    const yan = midi % 2 === 0 ? -1 : 1;
    const u = clamp((midi - 36) / 60, 0, 1);
    return yan * (settings.stereo / 100) * 0.9 * (0.25 + 0.75 * (1 - u));
  }
  function yerlesimiUygula() {
    if (!ctx) return;
    for (const v of [...voices.values(), ...playerVoices]) {
      for (const c of v.cikislar.values()) if (c.pan) c.pan.pan.setTargetAtTime(notaYeri(v.midi), ctx.currentTime, 0.05);
    }
  }

  // Bir notayı çalan bölümler (I, II, P) için ötecek registerler; kuplörler başka bölümleri de katar.
  // Kuplörler zincirlenmez: II→I ile I→P birlikteyken pedal, Sandık'ı çalmaz (bunun için II→P gerekir).
  function bolumSesleri(bolumler, acik = stopsOn) {
    const dahil = new Set(bolumler);
    if (bolumler.has('I') && kuplorler.has('II/I')) dahil.add('II');
    if (bolumler.has('P')) {
      if (kuplorler.has('I/P')) dahil.add('I');
      if (kuplorler.has('II/P')) dahil.add('II');
    }
    const sonuc = [];
    for (const id of acik) {
      const s = STOP_BY_ID[id];
      if (s && !s.effect && dahil.has(s.bolum)) sonuc.push(id);
    }
    return sonuc;
  }

  // Sandık panjuru: kapandıkça ses kısılır ve tizleri kesilir (600 Hz – 18 kHz)
  function sandigiUygula() {
    if (!ctx) return;
    const x = settings.sandik / 100, t = ctx.currentTime;
    A.sandik.kazanc.gain.setTargetAtTime(0.28 + 0.72 * x, t, 0.06);
    A.sandik.suzgec.frequency.setTargetAtTime(600 * Math.pow(30, x), t, 0.06);
  }

  function buildAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC({ latencyHint: 'interactive' });
    // iPhone: sessiz anahtarı açıkken de çalsın (iOS 17 ve sonrası; varsayılan oturum türü sessizde susar)
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {}

    const bus = ctx.createGain(); bus.gain.value = 0.2;
    // Bölümler: her birinin girişi ve (manuellerde) tremolosu. Sandık, panjurdan geçerek ana yola katılır.
    const giris = { I: ctx.createGain(), II: ctx.createGain(), P: ctx.createGain() };
    const trem = { I: ctx.createGain(), II: ctx.createGain() };
    const sandik = { kazanc: ctx.createGain(), suzgec: ctx.createBiquadFilter() };
    sandik.suzgec.type = 'lowpass'; sandik.suzgec.Q.value = 0.5; sandik.suzgec.frequency.value = 18000;
    giris.I.connect(trem.I); trem.I.connect(bus);
    giris.II.connect(trem.II); trem.II.connect(sandik.kazanc); sandik.kazanc.connect(sandik.suzgec); sandik.suzgec.connect(bus);
    giris.P.connect(bus);
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 9000; tone.Q.value = 0.4;
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const conv = ctx.createConvolver();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 14; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.3;
    const master = ctx.createGain();

    bus.connect(tone);
    tone.connect(dry); tone.connect(conv); conv.connect(wet);
    dry.connect(comp); wet.connect(comp);
    comp.connect(master); master.connect(ctx.destination);

    // Tremolo: her manuelde genliği ve perdeyi titreten bir LFO (Sandık'ınki biraz hızlı)
    const lfoAmp = {}, lfoPitch = {};
    for (const [b, hz] of [['I', 5.4], ['II', 6.1]]) {
      const lfo = ctx.createOscillator(); lfo.frequency.value = hz;
      lfoAmp[b] = ctx.createGain(); lfoAmp[b].gain.value = 0;
      lfoPitch[b] = ctx.createGain(); lfoPitch[b].gain.value = 0;
      lfo.connect(lfoAmp[b]); lfoAmp[b].connect(trem[b].gain);
      lfo.connect(lfoPitch[b]);
      lfo.start();
    }

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

    A = { bus, giris, sandik, dry, wet, conv, master, lfoAmp, lfoPitch, noise, waves };
    if (ORG === 'caz') {
      // Caz orgu: bölüm yok; bütün sesler vibrato, sürüş ve dönen hoparlörden geçer
      A.caz = cazYoluKur(bus);
      A.giris = { I: A.caz.giris, II: A.caz.giris, P: A.caz.giris };
      cazYoluAyarla(true);
    }
    applyRoom();
    applyMix();
    applyTremolo();
    sandigiUygula();
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
    const t = ctx.currentTime;
    for (const [b, id, genlik, perde] of [['I', 'tremolo', 0.13, 6], ['II', 'tremolo2', 0.16, 8]]) {
      const on = stopsOn.has(id);
      A.lfoAmp[b].gain.setTargetAtTime(on ? genlik : 0, t, 0.08);
      A.lfoPitch[b].gain.setTargetAtTime(on ? perde : 0, t, 0.08);
    }
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
    // t0 ileri bir an olabilir (şarkı çalar notaları önceden zamanlar).
    // bolumler: notayı çalan bölümler (I, II, P). acik: açık registerler; çoğunlukla stopsOn'un kendisi,
    // şarkı çalarda henüz gelmemiş bir bölümün registrasyonu için onun kopyası.
    constructor(midi, t0, bolumler = new Set(['I']), acik = stopsOn) {
      this.midi = midi;
      this.t0 = t0;
      this.freq = notaFrekansi(midi);
      this.bolumler = bolumler;
      this.acik = acik;
      this.stops = new Map();
      this.cikislar = new Map(); // bölüm → { g, pan }: her bölüm kendi yolundan (Sandık panjurdan) geçer
      this.released = false;
      this.breath = null;
      for (const id of bolumSesleri(bolumler, acik)) this.addStop(STOP_BY_ID[id], t0);
      if (this.stops.size) this.articulate(t0);
    }

    cikis(bolum) {
      let c = this.cikislar.get(bolum);
      if (!c) {
        const g = ctx.createGain();
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pan) {
          pan.pan.value = notaYeri(this.midi);
          g.connect(pan);
          pan.connect(A.giris[bolum]);
        } else g.connect(A.giris[bolum]);
        c = { g, pan };
        this.cikislar.set(bolum, c);
      }
      return c.g;
    }

    cikislariKes() {
      for (const c of this.cikislar.values()) {
        try { c.g.disconnect(); } catch (_) {}
        if (c.pan) try { c.pan.disconnect(); } catch (_) {}
      }
    }

    // Henüz başlamamış (ya da hemen susması gereken) sesi iz bırakmadan keser.
    cancel() {
      if (this.released) return;
      this.released = true;
      this.cikislariKes();
      const t = ctx.currentTime;
      for (const s of this.stops.values()) s.oscs.forEach(o => { try { o.stop(t); } catch (_) {} });
      if (this.breath) { try { this.breath.src.stop(t); } catch (_) {} }
    }

    // Ötmesi gereken registerleri (bölümler, kuplörler, açık registerler) çalan sese uygular.
    uygula(t) {
      if (this.released) return;
      const istenen = new Set(bolumSesleri(this.bolumler, this.acik));
      for (const id of [...this.stops.keys()]) if (!istenen.has(id)) this.removeStop(id, t);
      for (const id of istenen) if (!this.stops.has(id)) this.addStop(STOP_BY_ID[id], t);
    }

    addStop(stop, t0) {
      if (stop.effect || this.released || this.stops.has(stop.id)) return;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(this.cikis(stop.bolum));
      const lfoPitch = A.lfoPitch[stop.bolum]; // pedalda tremolo yok
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
        if (lfoPitch) lfoPitch.connect(o.detune);
        const rg = ctx.createGain();
        rg.gain.value = r.level * keyScale(f);
        o.connect(rg); rg.connect(g);
        o.start(t0);
        o.onended = () => {
          if (lfoPitch) try { lfoPitch.disconnect(o.detune); } catch (_) {}
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

    // Borunun ağzındaki hava: kısa "chiff" ve çok hafif rüzgâr hışırtısı (ilk registerin bölümünden)
    articulate(t0) {
      const ilk = STOP_BY_ID[this.stops.keys().next().value];
      const cikis = this.cikis(ilk.bolum);
      const flue = [...this.stops.keys()].some(id => STOP_BY_ID[id].family !== 'reed');
      if (flue) {
        const src = ctx.createBufferSource(); src.buffer = A.noise;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
        bp.frequency.value = Math.min(this.freq * 3, 7500); bp.Q.value = 6;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.9, t0 + 0.006);
        g.gain.setTargetAtTime(0, t0 + 0.012, 0.03);
        src.connect(bp); bp.connect(g); g.connect(cikis);
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
      br.connect(bf); bf.connect(bg); bg.connect(cikis);
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
      setTimeout(() => this.cikislariKes(), Math.max(0, end - ctx.currentTime) * 1000 + 500);
    }
  }

  // Sayfanın orguna göre ses: kilise orgunda borular (Voice), caz orgunda ton tekerlekleri (CazSesi).
  // perkusyon: caz orgunda bu notada perküsyon vuruşu olsun mu (bütün tuşlar bırakılmışken basılan ilk nota)
  function sesYarat(midi, t0, bolumler, acik, perkusyon) {
    return ORG === 'caz' ? new CazSesi(midi, t0, perkusyon) : new Voice(midi, t0, bolumler, acik);
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

