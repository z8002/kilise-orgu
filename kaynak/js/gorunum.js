  /* ================= Görünüm ================= */
  const readout = $('#readout');
  function refreshView() {
    const base = baseMidi();
    keyEls.forEach((k, off) => {
      const m = base + off;
      const down = holders.has(m);
      k.classList.toggle('down', down);
      k.classList.toggle('held', !down && sustained.has(m));
      const prog = playerDown.get(m);
      k.classList.toggle('prog-sag', !!prog && prog.el === 'sag');
      k.classList.toggle('prog-sol', !!prog && prog.el === 'sol');
      const hedef = targets.get(m);
      k.classList.toggle('hedef', !!hedef && !down);
      k.classList.toggle('hedef-sol', hedef === 'sol' && !down);
    });
    const playing = [...new Set([...voices.keys(), ...playerDown.keys()])].sort((a, b) => a - b);
    readout.innerHTML = 'Çalan:<b></b>';
    readout.lastChild.textContent = playing.length ? playing.map(noteName).join(' · ') : '—';
    updateFacadeTargets();
  }

