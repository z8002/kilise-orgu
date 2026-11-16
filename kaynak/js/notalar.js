  /* ================= Nota yönetimi ================= */
  const holders = new Map();   // midi -> Set(kaynak)
  const voices = new Map();    // midi -> Voice
  const sustained = new Set(); // "Tut" ile bırakılmış ama çalan notalar
  const codeHeld = new Map();  // klavye kodu -> midi
  const ptr = new Map();       // pointerId -> midi
  let sustainKey = false, sustainLatch = false, sustainOn = false;

  function ensureWind() {
    if (!ctx && !buildAudio()) {
      focusHint.textContent = 'Bu tarayıcı Web Audio desteklemiyor; Chrome, Edge ya da Firefox ile açmayı dene.';
      focusHint.hidden = false;
      return false;
    }
    if (!windOn) { windOn = true; updateWindUI(); }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    return true;
  }

  function noteOn(midi, src) {
    if (midi < 12 || midi > 115) return;
    if (!ensureWind()) return;
    let h = holders.get(midi);
    if (!h) { h = new Set(); holders.set(midi, h); }
    const first = h.size === 0;
    h.add(src);
    if (!first) return;
    sustained.delete(midi);
    if (!voices.has(midi)) {
      if (voices.size >= MAX_VOICES) killVoice(voices.keys().next().value);
      voices.set(midi, new Voice(midi, ctx.currentTime));
    }
    refreshView();
  }

  function noteOff(midi, src) {
    const h = holders.get(midi);
    if (!h || !h.delete(src)) return;
    if (h.size) return;
    holders.delete(midi);
    if (sustainOn && voices.has(midi)) sustained.add(midi);
    else killVoice(midi);
    refreshView();
  }

  function killVoice(midi) {
    const v = voices.get(midi);
    if (!v) return;
    v.release(ctx.currentTime);
    voices.delete(midi);
    sustained.delete(midi);
  }

  function releaseAll() {
    codeHeld.clear(); ptr.clear(); holders.clear(); sustained.clear();
    if (ctx) for (const v of voices.values()) v.release(ctx.currentTime);
    voices.clear();
    refreshView();
  }

  function updateSustain() {
    const on = sustainKey || sustainLatch;
    holdBtn.setAttribute('aria-pressed', String(on));
    if (on === sustainOn) return;
    sustainOn = on;
    if (!on) {
      for (const m of [...sustained]) killVoice(m);
      sustained.clear();
      refreshView();
    }
  }

