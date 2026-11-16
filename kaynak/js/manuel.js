  /* ================= Manuel (ekran klavyesi) ================= */
  const manual = $('#manual');
  const keyEls = [];
  const US_LABELS = { Comma: ',', Period: '.', Semicolon: ';', Slash: '/', BracketLeft: '[', BracketRight: ']', Equal: '=' };
  const TRQ_LABELS = { Comma: 'Ö', Period: 'Ç', Semicolon: 'Ş', Slash: '.', BracketLeft: 'Ğ', BracketRight: 'Ü', Equal: '-' };
  const isTurkish = (navigator.languages || [navigator.language || '']).some(l => /^tr\b/i.test(l));
  const labels = {};
  for (const code of CODE_TO_OFFSET.keys()) {
    labels[code] = code.startsWith('Key') ? code.slice(3)
      : code.startsWith('Digit') ? code.slice(5)
      : (isTurkish ? TRQ_LABELS : US_LABELS)[code];
  }

  function buildManual() {
    const WN = [...Array(SPAN).keys()].filter(o => !BLACK_PCS.has(o % 12)).length;
    let wi = 0;
    for (let off = 0; off < SPAN; off++) {
      const black = BLACK_PCS.has(off % 12);
      const k = document.createElement('div');
      k.className = 'key ' + (black ? 'black' : 'white');
      k.dataset.off = off;
      k.style.left = (wi / WN * 100) + '%';
      k.style.width = (100 / WN * (black ? 0.62 : 1)) + '%';
      if (!black) wi++;
      if (off % 12 === 0) {
        const n = document.createElement('span');
        n.className = 'note';
        k.appendChild(n);
      }
      const lab = document.createElement('span');
      lab.className = 'labels';
      for (const code of OFFSET_CODES[off]) {
        const c = document.createElement('span');
        c.className = 'cap';
        c.dataset.code = code;
        lab.appendChild(c);
      }
      k.appendChild(lab);
      manual.appendChild(k);
      keyEls[off] = k;
    }
  }

  function renderCaps() {
    manual.querySelectorAll('.cap').forEach(c => { c.textContent = labels[c.dataset.code]; });
    const fill = (host, row) => {
      host.textContent = '';
      row.forEach(code => {
        const k = document.createElement('kbd');
        k.textContent = labels[code];
        host.appendChild(k);
      });
    };
    fill($('#rowLower'), LOWER_ROW);
    fill($('#rowUpper'), UPPER_ROW);
  }

  function renderOctave() {
    const base = baseMidi();
    keyEls.forEach((k, off) => {
      const n = k.querySelector('.note');
      if (n) n.textContent = noteName(base + off);
    });
    $('#octOut').textContent = `${noteName(base)} – ${noteName(base + SPAN - 1)}`;
    $('#octDown').disabled = settings.octave <= 1;
    $('#octUp').disabled = settings.octave >= 5;
  }

  async function readLayout() {
    try {
      if (!navigator.keyboard || !navigator.keyboard.getLayoutMap) return;
      const map = await navigator.keyboard.getLayoutMap();
      for (const code of CODE_TO_OFFSET.keys()) {
        const ch = map.get(code);
        if (ch) labels[code] = ch.toLocaleUpperCase(isTurkish ? 'tr' : undefined);
      }
      renderCaps();
    } catch (_) {}
  }

  function shiftOctave(d) {
    const n = clamp(settings.octave + d, 1, 5);
    if (n === settings.octave) return;
    settings.octave = n;
    renderOctave();
    refreshView();
    save();
  }

