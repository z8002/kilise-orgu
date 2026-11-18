  /* ================= Olaylar ================= */
  const windBtn = $('#wind');
  const holdBtn = $('#hold');
  const focusHint = $('#focusHint');

  function updateWindUI() {
    windBtn.setAttribute('aria-pressed', String(windOn));
    $('#windLabel').textContent = windOn ? 'Rüzgâr açık' : 'Rüzgârı aç';
  }
  windBtn.addEventListener('click', () => {
    if (windOn) {
      windOn = false;
      if (calar.parca) calarDurdur();
      releaseAll();
      updateWindUI();
      setTimeout(() => { if (!windOn && ctx) ctx.suspend().catch(() => {}); }, 3000);
    } else if (ensureWind()) {
      whoosh();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = e.target && e.target.tagName;
    const inField = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) { sustainKey = true; updateSustain(); }
      return;
    }
    if (e.code === 'Escape') { calarDuraklat(); releaseAll(); sustainLatch = false; updateSustain(); return; }
    if (e.code === 'Enter' && !inField && calar.parca && tag !== 'BUTTON') {
      e.preventDefault();
      if (!e.repeat) (calar.durum === 'caliyor' ? calarDuraklat() : calarBasla());
      return;
    }
    if (!inField && (e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
      e.preventDefault();
      if (!e.repeat) shiftOctave(e.code === 'ArrowUp' ? 1 : -1);
      return;
    }
    const off = CODE_TO_OFFSET.get(e.code);
    if (off === undefined) return;
    e.preventDefault();
    if (e.repeat || codeHeld.has(e.code)) return;
    const midi = baseMidi() + off;
    codeHeld.set(e.code, midi);
    noteOn(midi, 'k:' + e.code);
  });

  document.addEventListener('keyup', e => {
    if (e.code === 'Space') { e.preventDefault(); sustainKey = false; updateSustain(); return; }
    const midi = codeHeld.get(e.code);
    if (midi === undefined) return;
    codeHeld.delete(e.code);
    noteOff(midi, 'k:' + e.code);
  });

  function keyAt(x, y) {
    const el = document.elementFromPoint(x, y);
    const k = el && el.closest ? el.closest('.key') : null;
    return k && manual.contains(k) ? baseMidi() + Number(k.dataset.off) : null;
  }
  manual.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    window.focus();
    try { manual.setPointerCapture(e.pointerId); } catch (_) {}
    const m = keyAt(e.clientX, e.clientY);
    ptr.set(e.pointerId, m);
    if (m != null) noteOn(m, 'p:' + e.pointerId);
  });
  manual.addEventListener('pointermove', e => {
    if (!ptr.has(e.pointerId)) return;
    const m = keyAt(e.clientX, e.clientY);
    const prev = ptr.get(e.pointerId);
    if (m === prev) return;
    if (prev != null) noteOff(prev, 'p:' + e.pointerId);
    ptr.set(e.pointerId, m);
    if (m != null) noteOn(m, 'p:' + e.pointerId);
  });
  const endPointer = e => {
    if (!ptr.has(e.pointerId)) return;
    const prev = ptr.get(e.pointerId);
    ptr.delete(e.pointerId);
    if (prev != null) noteOff(prev, 'p:' + e.pointerId);
  };
  manual.addEventListener('pointerup', endPointer);
  manual.addEventListener('pointercancel', endPointer);
  manual.addEventListener('lostpointercapture', endPointer);

  // Dokunmatik ekranlarda ses bağlamı ancak parmak kalkınca açılabiliyor
  const resumeIfNeeded = () => { if (ctx && windOn && ctx.state === 'suspended') ctx.resume().catch(() => {}); };
  document.addEventListener('pointerup', resumeIfNeeded);
  document.addEventListener('touchend', resumeIfNeeded);

  const tutDegistir = () => { sustainLatch = !sustainLatch; updateSustain(); };
  holdBtn.addEventListener('click', tutDegistir);
  $('#dokTut').addEventListener('click', tutDegistir);
  $('#octDown').addEventListener('click', () => shiftOctave(-1));
  $('#octUp').addEventListener('click', () => shiftOctave(1));
  $('#pencereSol').addEventListener('click', () => pencereKaydir(-1));
  $('#pencereSag').addEventListener('click', () => pencereKaydir(1));

  // Hafif mod: daha az boru, daha az ses, kısa yankı (zayıf telefonlar için)
  const hafifBtn = $('#hafif');
  hafifBtn.setAttribute('aria-pressed', String(settings.hafif));
  hafifBtn.addEventListener('click', () => {
    settings.hafif = !settings.hafif;
    hafifBtn.setAttribute('aria-pressed', String(settings.hafif));
    applyRoom();
    save();
  });

  const roomSel = $('#room'), revIn = $('#reverb'), volIn = $('#volume');
  roomSel.value = settings.room;
  revIn.value = settings.reverb; $('#revOut').textContent = settings.reverb;
  volIn.value = settings.volume; $('#volOut').textContent = settings.volume;
  roomSel.addEventListener('change', () => { settings.room = roomSel.value; applyRoom(); save(); roomSel.blur(); });
  revIn.addEventListener('input', () => { settings.reverb = Number(revIn.value); $('#revOut').textContent = revIn.value; applyMix(); save(); });
  volIn.addEventListener('input', () => { settings.volume = Number(volIn.value); $('#volOut').textContent = volIn.value; applyMix(); save(); });

  // Dokunmatik ekranda "önce sayfaya tıkla" uyarısı anlamsız; ses desteği yoksa yine de görünür
  function updateFocusHint() { focusHint.hidden = !sesDesteklenmiyor && (dokunmatik || document.hasFocus()); }
  window.addEventListener('focus', updateFocusHint);
  window.addEventListener('blur', () => {
    releaseAll();
    sustainKey = false;
    updateSustain();
    updateFocusHint();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

