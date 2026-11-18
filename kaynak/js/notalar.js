  /* ================= Nota yönetimi ================= */
  const holders = new Map();   // midi -> Set(kaynak)
  const voices = new Map();    // midi -> Voice
  const sustained = new Set(); // "Tut" ile bırakılmış ama çalan notalar
  const codeHeld = new Map();  // klavye kodu -> midi
  const ptr = new Map();       // pointerId -> midi
  const playerVoices = new Set();   // şarkı çaların zamanladığı, henüz bırakılmamış sesler
  const playerDown = new Map();     // midi -> { n, el }: şarkı çaların o an çaldığı notalar (görünüm için)
  const targets = new Map();        // midi -> el: çalınması beklenen notalar (Öğren ve Eşlik)
  const kaynakBolumu = new Map();   // kaynak -> basıldığı bölüm (I, II, P)
  let sustainKey = false, sustainLatch = false, sustainOn = false;
  let otoPedalNotasi = null;        // otomatik pedalın o an çaldığı nota

  let sesDesteklenmiyor = false;

  function ensureWind() {
    if (!ctx && !buildAudio()) {
      sesDesteklenmiyor = true;
      focusHint.textContent = 'Bu tarayıcı Web Audio desteklemiyor; Chrome, Edge ya da Firefox ile açmayı dene.';
      focusHint.hidden = false;
      return false;
    }
    if (!windOn) { windOn = true; updateWindUI(); }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return true;
  }

  // bolum: notanın basıldığı bölüm. Aynı nota birden çok bölümde basılıysa tek ses, bölümlerin
  // registerlerinin birleşimiyle öter (gerçek orgda da her boru bir kez öter).
  function noteOn(midi, src, bolum = 'I') {
    if (midi < 12 || midi > 115) return;
    if (!ensureWind()) return;
    const ilkTus = holders.size === 0; // caz orgunun perküsyonu yalnızca bütün tuşlar bırakılmışken basılan notada
    let h = holders.get(midi);
    if (!h) { h = new Set(); holders.set(midi, h); }
    const first = h.size === 0;
    h.add(src);
    kaynakBolumu.set(src, bolum);
    if (src !== 'oto' && typeof calarKullaniciBasti === 'function') calarKullaniciBasti(midi);
    if (first) {
      sustained.delete(midi);
      const v = voices.get(midi);
      if (v) { v.bolumler.add(bolum); v.uygula(ctx.currentTime); } // "Tut" ile süren nota yeniden basıldı
      else {
        if (voices.size >= (settings.hafif ? HAFIF_MAX_VOICES : MAX_VOICES)) killVoice(voices.keys().next().value);
        voices.set(midi, sesYarat(midi, ctx.currentTime, new Set([bolum]), stopsOn, ilkTus));
      }
    } else sesBolumleriniGuncelle(midi);
    otoPedalGuncelle();
    refreshView();
  }

  function noteOff(midi, src) {
    const h = holders.get(midi);
    if (!h || !h.delete(src)) return;
    kaynakBolumu.delete(src);
    if (h.size) sesBolumleriniGuncelle(midi); // başka bir bölümde hâlâ basılı
    else {
      holders.delete(midi);
      if (sustainOn && voices.has(midi)) sustained.add(midi);
      else killVoice(midi);
    }
    otoPedalGuncelle();
    refreshView();
  }

  function sesBolumleriniGuncelle(midi) {
    const v = voices.get(midi), h = holders.get(midi);
    if (!v || !h || !h.size) return;
    v.bolumler = new Set([...h].map(k => kaynakBolumu.get(k) || 'I'));
    v.uygula(ctx.currentTime);
  }

  // Register, kuplör ya da panjur değişince çalan ve zamanlanmış bütün seslere uygular.
  function tumSesleriUygula() {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const v of [...voices.values(), ...playerVoices]) v.uygula(Math.max(t, v.t0));
  }

  // Otomatik pedal: I. manuelde basılı en kalın nota pedalda da çalar (Do2–Sol3 arasına, bir öncekine
  // en yakın oktava katlanarak; ilk nota Do2–Si2 arasına düşer).
  function pedalNotasi(m, onceki) {
    const pc = ((m % 12) + 12) % 12, hedef = onceki == null ? 40 : onceki;
    const adaylar = [PEDAL_ILK + pc, PEDAL_ILK + 12 + pc].filter(x => x < PEDAL_ILK + PEDAL_SAYI);
    return adaylar.reduce((a, b) => (Math.abs(b - hedef) < Math.abs(a - hedef) ? b : a));
  }
  function otoPedalGuncelle() {
    let enKalin = null;
    if (settings.otoPedal) {
      for (const [m, h] of holders) {
        if (enKalin !== null && m >= enKalin) continue;
        for (const k of h) if (k !== 'oto' && kaynakBolumu.get(k) === 'I') { enKalin = m; break; }
      }
    }
    const yeni = enKalin === null ? null : (otoPedalNotasi !== null && ((otoPedalNotasi - enKalin) % 12 + 12) % 12 === 0 ? otoPedalNotasi : pedalNotasi(enKalin, otoPedalNotasi));
    if (yeni === otoPedalNotasi) return;
    const eski = otoPedalNotasi;
    otoPedalNotasi = yeni; // önce yaz: noteOff/noteOn buraya yeniden girer
    if (eski !== null) noteOff(eski, 'oto');
    if (yeni !== null) noteOn(yeni, 'oto', 'P');
  }

  function killVoice(midi) {
    const v = voices.get(midi);
    if (!v) return;
    v.release(ctx.currentTime);
    voices.delete(midi);
    sustained.delete(midi);
  }

  function releaseAll() {
    codeHeld.clear(); ptr.clear(); holders.clear(); sustained.clear(); kaynakBolumu.clear();
    otoPedalNotasi = null;
    if (ctx) for (const v of voices.values()) v.release(ctx.currentTime);
    voices.clear();
    refreshView();
  }

  function updateSustain() {
    const on = sustainKey || sustainLatch;
    holdBtn.setAttribute('aria-pressed', String(on));
    $('#dokTut').setAttribute('aria-pressed', String(on));
    if (on === sustainOn) return;
    sustainOn = on;
    if (!on) {
      for (const m of [...sustained]) killVoice(m);
      sustained.clear();
      refreshView();
    }
  }

