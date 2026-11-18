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

  // Yazı yazılan alanlarda (parça arama kutusu gibi) tuşlar org çalmaz, alana gider
  const YAZI_DISI = new Set(['range', 'checkbox', 'radio', 'button', 'submit', 'reset', 'color', 'file']);
  const yaziAlani = h => !!h && (h.isContentEditable || h.tagName === 'TEXTAREA' || (h.tagName === 'INPUT' && !YAZI_DISI.has(h.type)));

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || yaziAlani(e.target)) return;
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
    // İki manuelli konsolda üst sıra Sandık'ı (II), alt sıra I. manueli çalar
    noteOn(midi, 'k:' + e.code, settings.konsol === 'tam' && UST_SIRA.has(e.code) ? 'II' : 'I');
  });

  document.addEventListener('keyup', e => {
    if (e.code === 'Space') {
      if (!yaziAlani(e.target)) e.preventDefault();
      sustainKey = false;
      updateSustain();
      return;
    }
    const midi = codeHeld.get(e.code);
    if (midi === undefined) return;
    codeHeld.delete(e.code);
    noteOff(midi, 'k:' + e.code);
  });

  // Ekrandaki klavyeler: fare ve parmak. Parmak kaydırılınca nota değişir (aynı klavyenin içinde).
  // Telefonda tek klavye var; iki manuelli konsolda çubuktaki seçim hangi bölümü çaldığını belirler.
  const KLAVYELER = [
    { el: manual, ilk: baseMidi, bolum: () => (pencere.acik ? pencere.bolum : 'I') },
    { el: manual2, ilk: baseMidi, bolum: () => 'II' },
    { el: pedalEl, ilk: () => PEDAL_ILK, bolum: () => 'P' },
  ];
  for (const kl of KLAVYELER) {
    const keyAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      const k = el && el.closest ? el.closest('.key') : null;
      return k && kl.el.contains(k) ? kl.ilk() + Number(k.dataset.off) : null;
    };
    kl.el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      window.focus();
      try { kl.el.setPointerCapture(e.pointerId); } catch (_) {}
      const m = keyAt(e.clientX, e.clientY);
      ptr.set(e.pointerId, m);
      if (m != null) noteOn(m, 'p:' + e.pointerId, kl.bolum());
    });
    kl.el.addEventListener('pointermove', e => {
      if (!ptr.has(e.pointerId)) return;
      const m = keyAt(e.clientX, e.clientY);
      const prev = ptr.get(e.pointerId);
      if (m === prev) return;
      if (prev != null) noteOff(prev, 'p:' + e.pointerId);
      ptr.set(e.pointerId, m);
      if (m != null) noteOn(m, 'p:' + e.pointerId, kl.bolum());
    });
    const endPointer = e => {
      if (!ptr.has(e.pointerId)) return;
      const prev = ptr.get(e.pointerId);
      ptr.delete(e.pointerId);
      if (prev != null) noteOff(prev, 'p:' + e.pointerId);
    };
    kl.el.addEventListener('pointerup', endPointer);
    kl.el.addEventListener('pointercancel', endPointer);
    kl.el.addEventListener('lostpointercapture', endPointer);
  }

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

  // Konsol: tek manuel ya da iki manuel ve pedal
  function konsolKur(tur) {
    settings.konsol = tur;
    document.documentElement.classList.toggle('konsol-tam', tur === 'tam');
    $('#konsolTek').setAttribute('aria-pressed', String(tur === 'tek'));
    $('#konsolTam').setAttribute('aria-pressed', String(tur === 'tam'));
    if (tur === 'tek') bolumSec('I');
    refreshView();
  }
  $('#konsolTek').addEventListener('click', () => { releaseAll(); konsolKur('tek'); save(); dokYuksekligi(); });
  $('#konsolTam').addEventListener('click', () => { releaseAll(); konsolKur('tam'); save(); dokYuksekligi(); });

  // Telefon: ekrandaki klavyenin çaldığı bölüm (iki manuelli konsolda)
  function bolumSec(b) {
    pencere.bolum = b;
    document.querySelectorAll('.bolum-secim [data-bolum]').forEach(d => d.setAttribute('aria-pressed', String(d.dataset.bolum === b)));
    if (b === 'P') pencereNotalaraGetir([[PEDAL_ILK, PEDAL_ILK + 7]], true); // pencere pedalın aralığına gelir
  }
  document.querySelectorAll('.bolum-secim [data-bolum]').forEach(d => d.addEventListener('click', () => { releaseAll(); bolumSec(d.dataset.bolum); refreshView(); }));

  const otoPedalBtn = $('#otoPedal');
  otoPedalBtn.setAttribute('aria-pressed', String(settings.otoPedal));
  otoPedalBtn.addEventListener('click', () => {
    settings.otoPedal = !settings.otoPedal;
    otoPedalBtn.setAttribute('aria-pressed', String(settings.otoPedal));
    otoPedalGuncelle();
    refreshView();
    save();
  });

  const sandikIn = $('#sandik');
  sandikIn.value = settings.sandik; $('#sandikOut').textContent = settings.sandik;
  sandikIn.addEventListener('input', () => { settings.sandik = Number(sandikIn.value); $('#sandikOut').textContent = sandikIn.value; sandigiUygula(); save(); });

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
  // Akort sistemi, diyapazon, stereo genişlik
  const akortSel = $('#akort'), diyapazonSel = $('#diyapazon'), stereoIn = $('#stereo');
  for (const [id, a] of Object.entries(AKORTLAR)) akortSel.add(new Option(a.ad, id));
  for (const [hz, ad] of DIYAPAZONLAR) diyapazonSel.add(new Option(ad, String(hz)));
  const akortBilgisi = () => { $('#akortBilgi').textContent = AKORTLAR[settings.akort].bilgi; };
  akortSel.value = settings.akort;
  diyapazonSel.value = String(settings.diyapazon);
  stereoIn.value = settings.stereo; $('#stereoOut').textContent = settings.stereo;
  akortBilgisi();
  akortSel.addEventListener('change', () => { settings.akort = akortSel.value; akortuUygula(); akortBilgisi(); save(); akortSel.blur(); });
  diyapazonSel.addEventListener('change', () => { settings.diyapazon = Number(diyapazonSel.value); akortuUygula(); save(); diyapazonSel.blur(); });
  stereoIn.addEventListener('input', () => { settings.stereo = Number(stereoIn.value); $('#stereoOut').textContent = stereoIn.value; yerlesimiUygula(); save(); });

  function updateFocusHint() { focusHint.hidden = !sesDesteklenmiyor && (dokunmatik || document.hasFocus()); }
  window.addEventListener('focus', updateFocusHint);
  window.addEventListener('blur', () => {
    releaseAll();
    sustainKey = false;
    updateSustain();
    updateFocusHint();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

