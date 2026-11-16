  /* ================= Görünüm ================= */
  const readout = $('#readout');
  function refreshView() {
    const base = baseMidi();
    keyEls.forEach((k, off) => {
      const m = base + off;
      const down = holders.has(m);
      k.classList.toggle('down', down);
      k.classList.toggle('held', !down && sustained.has(m));
    });
    const playing = [...voices.keys()].sort((a, b) => a - b);
    readout.innerHTML = 'Çalan:<b></b>';
    readout.lastChild.textContent = playing.length ? playing.map(noteName).join(' · ') : '—';
    updateFacadeTargets();
  }

