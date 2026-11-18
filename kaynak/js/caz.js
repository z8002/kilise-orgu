  /* ================= Caz orgu ================= */
  // Ton tekerlekli (elektromekanik) org. Her tuş dokuz tekerleğin sinüs sesini, dokuz çekme çubuğunun
  // ayarladığı oranda karıştırır. Tekerlekler eşit akortlu olduğundan 5⅓′, 2⅔′, 1⅗′, 1⅓′ çubukları pür beşli
  // ve üçlü değil, eşit akortlu aralıklarda öter: caz orgunun hafifçe dalgalanan sesi buradan gelir.
  const CEKMELER = [
    { ayak: '16′', yarim: -12, renk: 'kahve' },
    { ayak: '5⅓′', yarim: 7, renk: 'kahve' },
    { ayak: '8′', yarim: 0, renk: 'beyaz' },
    { ayak: '4′', yarim: 12, renk: 'beyaz' },
    { ayak: '2⅔′', yarim: 19, renk: 'siyah' },
    { ayak: '2′', yarim: 24, renk: 'beyaz' },
    { ayak: '1⅗′', yarim: 28, renk: 'siyah' },
    { ayak: '1⅓′', yarim: 31, renk: 'siyah' },
    { ayak: '1′', yarim: 36, renk: 'beyaz' },
  ];
  const CAZ_HAZIR = [
    { ad: 'Klasik caz', cekme: '888000000', perkusyon: true, harmonik: 3, vibrato: 'C3', hoparlor: 'yavas' },
    { ad: 'Balad', cekme: '838000000', perkusyon: false, harmonik: 3, vibrato: 'C3', hoparlor: 'yavas' },
    { ad: 'Gospel', cekme: '888800000', perkusyon: false, harmonik: 3, vibrato: 'C3', hoparlor: 'hizli' },
    { ad: 'Flüt', cekme: '008000000', perkusyon: false, harmonik: 3, vibrato: 'V2', hoparlor: 'yavas' },
    { ad: 'Blues', cekme: '888000008', perkusyon: true, harmonik: 2, vibrato: 'kapali', hoparlor: 'hizli' },
    { ad: 'Tam', cekme: '888888888', perkusyon: false, harmonik: 3, vibrato: 'kapali', hoparlor: 'hizli' },
  ];
  // Vibrato (V) perdeyi titretir; koro (C) titreyen sesi titremeyenle karıştırır. Değer: gecikme salınımı (sn)
  const VIBRATO = { kapali: 0, V1: 0.00015, V2: 0.00025, V3: 0.00035, C1: 0.00015, C2: 0.00025, C3: 0.00035 };
  // Dönen hoparlör: tiz boru ve pes tambur ayrı hızlarda döner; tambur ağır olduğundan geç hızlanır
  const HOPARLOR = { yavas: { boru: 0.83, tambur: 0.67 }, hizli: { boru: 6.75, tambur: 5.9 } };
  const cazAyar = settings.caz;

  const cekmeSeviyesi = n => (n ? Math.pow(10, (n - 8) * 3 / 20) : 0); // her kademe 3 dB
  // Ton tekerlekleri Do1 (32,7 Hz) ile Fa♯8 (5,9 kHz) arasında: dışına düşen ses bir oktav katlanır
  function tekerlek(m) {
    while (m > 114) m -= 12;
    while (m < 24) m += 12;
    return notaFrekansi(m);
  }

  class CazSesi {
    // Kilise orgunun sesiyle aynı arayüz: release, cancel, uygula, akortla (bölüm ve register kavramı yok)
    constructor(midi, t0, perkusyon) {
      this.midi = midi;
      this.t0 = t0;
      this.bolumler = new Set(['I']);
      this.acik = stopsOn;
      this.stops = new Map();
      this.cikislar = new Map();
      this.released = false;
      this.out = ctx.createGain();
      this.out.gain.setValueAtTime(0, t0);
      this.out.gain.linearRampToValueAtTime(1, t0 + 0.004);
      this.out.connect(A.caz.giris);
      this.oscs = [];
      this.kazanclar = [];
      CEKMELER.forEach((c, i) => {
        const o = ctx.createOscillator();
        o.frequency.value = tekerlek(midi + c.yarim);
        const g = ctx.createGain();
        g.gain.value = cekmeSeviyesi(cazAyar.cekme[i]) * 0.2;
        o.connect(g); g.connect(this.out);
        o.start(t0);
        this.oscs.push(o);
        this.kazanclar.push(g);
      });
      if (perkusyon && cazAyar.perkusyon) {
        // Perküsyon: 2. ya da 3. harmonikte kısa, sönen bir vuruş
        const o = ctx.createOscillator();
        o.frequency.value = tekerlek(midi + (cazAyar.harmonik === 2 ? 12 : 19));
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime((cazAyar.yumusak ? 0.18 : 0.36), t0 + 0.002);
        g.gain.setTargetAtTime(0, t0 + 0.002, cazAyar.hizli ? 0.12 : 0.42);
        o.connect(g); g.connect(this.out);
        o.start(t0);
        o.stop(t0 + (cazAyar.hizli ? 1.2 : 3.5));
        this.perkusyon = o;
      }
      if (cazAyar.tikirti) this.tikirti(t0, 0.22);
    }

    // Tuş kontaklarının kısa tıkırtısı
    tikirti(t, guc) {
      const src = ctx.createBufferSource(); src.buffer = A.noise;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 0.7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(guc, t);
      g.gain.setTargetAtTime(0, t, 0.003);
      src.connect(f); f.connect(g); g.connect(this.out);
      src.start(t, Math.random(), 0.03);
      src.onended = () => { try { g.disconnect(); } catch (_) {} };
    }

    uygula(t) {
      if (this.released) return;
      this.kazanclar.forEach((g, i) => g.gain.setTargetAtTime(cekmeSeviyesi(cazAyar.cekme[i]) * 0.2, Math.max(t, this.t0), 0.012));
    }

    akortla(t) {
      if (this.released) return;
      this.oscs.forEach((o, i) => o.frequency.setTargetAtTime(tekerlek(this.midi + CEKMELER[i].yarim), Math.max(t, this.t0), 0.02));
    }

    durdur(t) {
      for (const o of this.oscs) { try { o.stop(t); } catch (_) {} }
      if (this.perkusyon) try { this.perkusyon.stop(t); } catch (_) {}
      const out = this.out;
      setTimeout(() => { try { out.disconnect(); } catch (_) {} }, Math.max(0, t - ctx.currentTime) * 1000 + 300);
    }

    release(t) {
      if (this.released) return;
      this.released = true;
      freeze(this.out.gain, t);
      this.out.gain.setTargetAtTime(0, t, 0.005);
      if (cazAyar.tikirti) this.tikirti(t, 0.08);
      this.durdur(t + 0.06);
    }

    cancel() {
      if (this.released) return;
      this.released = true;
      try { this.out.disconnect(); } catch (_) {}
      this.durdur(ctx.currentTime);
    }
  }

  // Caz orgunun ses yolu: vibrato/koro → sürüş (overdrive) → dönen hoparlör → ana yol (yankı, ses düzeyi)
  function cazYoluKur(cikis) {
    const giris = ctx.createGain();
    // Vibrato: modüle edilen gecikme hattı; koroda titremeyen ses de eklenir
    const gecikme = ctx.createDelay(0.02); gecikme.delayTime.value = 0.004;
    const vibLfo = ctx.createOscillator(); vibLfo.frequency.value = 6.9;
    const vibDerinlik = ctx.createGain(); vibDerinlik.gain.value = 0;
    vibLfo.connect(vibDerinlik); vibDerinlik.connect(gecikme.delayTime); vibLfo.start();
    const kuru = ctx.createGain(), islak = ctx.createGain(), karisim = ctx.createGain();
    giris.connect(kuru); giris.connect(gecikme); gecikme.connect(islak);
    kuru.connect(karisim); islak.connect(karisim);
    // Sürüş: lamba amfisinin yumuşak kırpması
    const onKazanc = ctx.createGain(), sekil = ctx.createWaveShaper(), sonKazanc = ctx.createGain();
    sekil.oversample = '2x';
    karisim.connect(onKazanc); onKazanc.connect(sekil); sekil.connect(sonKazanc);
    // Dönen hoparlör: 800 Hz'te ikiye ayrılır. Dönen kaynak: önündeyken yüksek ve ortada (kosinüs),
    // yandayken bir kanalda ve yaklaşıp uzaklaşırken perdesi kayar (sinüs).
    const dogrudan = ctx.createGain(), donen = ctx.createGain();
    sonKazanc.connect(dogrudan); dogrudan.connect(cikis);
    donen.connect(cikis);
    const kosinus = ctx.createPeriodicWave(new Float32Array([0, 1]), new Float32Array([0, 0]));
    const rotor = (suzgec, genlik, yan, doppler) => {
      sonKazanc.connect(suzgec);
      const sin = ctx.createOscillator(), cos = ctx.createOscillator();
      cos.setPeriodicWave(kosinus);
      const gec = ctx.createDelay(0.01); gec.delayTime.value = 0.002;
      const gecD = ctx.createGain(); gecD.gain.value = doppler;
      const am = ctx.createGain(); am.gain.value = 1 - genlik;
      const amD = ctx.createGain(); amD.gain.value = genlik;
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
      if (pan.pan) { const panD = ctx.createGain(); panD.gain.value = yan; sin.connect(panD); panD.connect(pan.pan); }
      sin.connect(gecD); gecD.connect(gec.delayTime);
      cos.connect(amD); amD.connect(am.gain);
      suzgec.connect(gec); gec.connect(am); am.connect(pan); pan.connect(donen);
      const t = ctx.currentTime;
      sin.start(t); cos.start(t);
      return { sin, cos };
    };
    const altSuzgec = ctx.createBiquadFilter(); altSuzgec.type = 'lowpass'; altSuzgec.frequency.value = 800;
    const ustSuzgec = ctx.createBiquadFilter(); ustSuzgec.type = 'highpass'; ustSuzgec.frequency.value = 800;
    const tambur = rotor(altSuzgec, 0.12, 0.35, 0.0002);
    const boru = rotor(ustSuzgec, 0.2, 0.75, 0.0004);
    return { giris, gecikme, vibDerinlik, kuru, islak, onKazanc, sekil, sonKazanc, dogrudan, donen, tambur, boru };
  }

  function cazYoluAyarla(ilk) {
    if (!ctx || !A.caz) return;
    const t = ctx.currentTime, C = A.caz;
    // Vibrato ve koro
    const d = VIBRATO[cazAyar.vibrato] || 0, koro = cazAyar.vibrato[0] === 'C';
    C.vibDerinlik.gain.setTargetAtTime(d, t, 0.02);
    C.kuru.gain.setTargetAtTime(d === 0 ? 1 : (koro ? 0.6 : 0), t, 0.02);
    C.islak.gain.setTargetAtTime(d === 0 ? 0 : (koro ? 0.6 : 1), t, 0.02);
    // Sürüş: kırpma eğrisi ve kazanç dengesi
    const k = 0.05 + cazAyar.surus / 100 * 7; // sıfırda neredeyse doğrusal
    const egri = new Float32Array(1025);
    for (let i = 0; i < egri.length; i++) { const x = i / 512 - 1; egri[i] = Math.tanh(k * x) / Math.tanh(k); }
    C.sekil.curve = egri;
    C.onKazanc.gain.setTargetAtTime(0.6 + cazAyar.surus / 60, t, 0.02);
    C.sonKazanc.gain.setTargetAtTime(1 / (1 + cazAyar.surus / 80), t, 0.02);
    // Dönen hoparlör: kapalıyken ses doğrudan; hız değişince boru çabuk, tambur ağır hızlanır
    const kapali = cazAyar.hoparlor === 'kapali';
    C.dogrudan.gain.setTargetAtTime(kapali ? 1 : 0, t, 0.03);
    C.donen.gain.setTargetAtTime(kapali ? 0 : 1, t, 0.03);
    const hiz = HOPARLOR[kapali ? 'yavas' : cazAyar.hoparlor];
    for (const [rotor, hz, tau] of [[C.boru, hiz.boru, 0.35], [C.tambur, hiz.tambur, 1.4]]) {
      for (const o of [rotor.sin, rotor.cos]) {
        if (ilk) o.frequency.setValueAtTime(hz, t);
        else o.frequency.setTargetAtTime(hz, t, tau);
      }
    }
    const gosterge = $('#donenGosterge');
    if (gosterge) gosterge.dataset.hiz = cazAyar.hoparlor;
  }

  // Çekme çubukları değişince çalan sesler de değişir
  function cazSesleriUygula() {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const v of [...voices.values(), ...playerVoices]) v.uygula(Math.max(t, v.t0));
  }

  /* ---- Arayüz ---- */
  // Çekme çubuğu: aşağı çekildikçe (0–8) o tekerleğin sesi güçlenir. Sürüklenir ya da ok tuşlarıyla ayarlanır.
  const cekmeEls = [];
  function cekmeYap(c, i) {
    const kutu = document.createElement('div');
    kutu.className = 'cekme ' + c.renk;
    const yuva = document.createElement('div');
    yuva.className = 'cekme-yuva';
    yuva.tabIndex = 0;
    yuva.setAttribute('role', 'slider');
    yuva.setAttribute('aria-label', t('Çekme çubuğu {ayak}', { ayak: c.ayak }));
    yuva.setAttribute('aria-orientation', 'vertical');
    yuva.setAttribute('aria-valuemin', '0');
    yuva.setAttribute('aria-valuemax', '8');
    yuva.innerHTML = '<span class="cekme-sap"></span><span class="cekme-kulp"></span>';
    yuva.lastChild.textContent = c.ayak;
    const deger = document.createElement('output');
    kutu.append(yuva, deger);
    const ayarla = n => {
      n = clamp(Math.round(n), 0, 8);
      if (n === cazAyar.cekme[i]) return;
      cazAyar.cekme[i] = n;
      cazDegisti(true);
    };
    const noktadan = e => {
      const r = yuva.getBoundingClientRect(), kulp = yuva.lastChild.offsetHeight;
      ayarla((e.clientY - r.top - kulp / 2) / Math.max(1, r.height - kulp) * 8);
    };
    yuva.addEventListener('pointerdown', e => {
      e.preventDefault();
      yuva.focus();
      try { yuva.setPointerCapture(e.pointerId); } catch (_) {}
      noktadan(e);
    });
    yuva.addEventListener('pointermove', e => { if (yuva.hasPointerCapture && yuva.hasPointerCapture(e.pointerId)) noktadan(e); });
    yuva.addEventListener('keydown', e => {
      const fark = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, PageDown: 2, PageUp: -2 }[e.code];
      if (fark === undefined && e.code !== 'Home' && e.code !== 'End') return;
      e.preventDefault();
      e.stopPropagation(); // oklar burada oktav değiştirmesin
      ayarla(e.code === 'Home' ? 0 : e.code === 'End' ? 8 : cazAyar.cekme[i] + fark);
    });
    cekmeEls.push(kutu);
    return kutu;
  }

  function cazArayuzGuncelle() {
    cekmeEls.forEach((kutu, i) => {
      const n = cazAyar.cekme[i];
      kutu.style.setProperty('--deger', n);
      kutu.firstChild.setAttribute('aria-valuenow', String(n));
      kutu.lastChild.textContent = n;
    });
    $('#cekmeKodu').textContent = cazAyar.cekme.join('');
    $('#perkusyon').setAttribute('aria-pressed', String(cazAyar.perkusyon));
    $('#perkIkinci').setAttribute('aria-pressed', String(cazAyar.harmonik === 2));
    $('#perkUcuncu').setAttribute('aria-pressed', String(cazAyar.harmonik === 3));
    $('#perkHizli').setAttribute('aria-pressed', String(cazAyar.hizli));
    $('#perkYumusak').setAttribute('aria-pressed', String(cazAyar.yumusak));
    $('#vibrato').value = cazAyar.vibrato;
    document.querySelectorAll('[data-hoparlor]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hoparlor === cazAyar.hoparlor)));
    $('#dokHoparlor').setAttribute('aria-pressed', String(cazAyar.hoparlor === 'hizli'));
    $('#surus').value = cazAyar.surus;
    $('#surusOut').textContent = cazAyar.surus;
    $('#tikirti').setAttribute('aria-pressed', String(cazAyar.tikirti));
    const kod = cazAyar.cekme.join('');
    document.querySelectorAll('.caz-hazir').forEach((b, i) => {
      const h = CAZ_HAZIR[i];
      b.setAttribute('aria-current', String(h.cekme === kod && h.perkusyon === cazAyar.perkusyon && h.vibrato === cazAyar.vibrato));
    });
  }

  function cazDegisti(sesler) {
    if (sesler) cazSesleriUygula();
    cazYoluAyarla();
    cazArayuzGuncelle();
    save();
  }

  function hoparlorSec(h) { cazAyar.hoparlor = h; cazDegisti(false); }

  function cazKur() {
    if (ORG !== 'caz') return;
    const host = $('#cekmeceler');
    CEKMELER.forEach((c, i) => host.appendChild(cekmeYap(c, i)));
    const hHost = $('#cazHazirlar');
    for (const h of CAZ_HAZIR) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'caz-hazir';
      b.textContent = t(h.ad);
      b.title = h.cekme;
      b.addEventListener('click', () => {
        cazAyar.cekme = [...h.cekme].map(Number);
        cazAyar.perkusyon = h.perkusyon;
        cazAyar.harmonik = h.harmonik;
        cazAyar.vibrato = h.vibrato;
        cazAyar.hoparlor = h.hoparlor;
        cazDegisti(true);
      });
      hHost.appendChild(b);
    }
    const dugme = (id, is) => $(id).addEventListener('click', () => { is(); cazDegisti(false); });
    dugme('#perkusyon', () => { cazAyar.perkusyon = !cazAyar.perkusyon; });
    dugme('#perkIkinci', () => { cazAyar.harmonik = 2; });
    dugme('#perkUcuncu', () => { cazAyar.harmonik = 3; });
    dugme('#perkHizli', () => { cazAyar.hizli = !cazAyar.hizli; });
    dugme('#perkYumusak', () => { cazAyar.yumusak = !cazAyar.yumusak; });
    dugme('#tikirti', () => { cazAyar.tikirti = !cazAyar.tikirti; });
    $('#vibrato').addEventListener('change', e => { cazAyar.vibrato = e.target.value; cazDegisti(false); e.target.blur(); });
    document.querySelectorAll('[data-hoparlor]').forEach(b => b.addEventListener('click', () => hoparlorSec(b.dataset.hoparlor)));
    $('#dokHoparlor').addEventListener('click', () => hoparlorSec(cazAyar.hoparlor === 'hizli' ? 'yavas' : 'hizli'));
    $('#surus').addEventListener('input', e => { cazAyar.surus = Number(e.target.value); cazDegisti(false); });
    cazArayuzGuncelle();
  }

  // ` tuşu (1'in solundaki): dönen hoparlör Yavaş ile Hızlı arasında
  function cazTusu(e) {
    if (ORG !== 'caz' || e.code !== 'Backquote') return false;
    if (!e.repeat) hoparlorSec(cazAyar.hoparlor === 'hizli' ? 'yavas' : 'hizli');
    return true;
  }
