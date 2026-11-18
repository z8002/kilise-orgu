  /* ================= Görünüm ================= */
  const readout = $('#readout');

  // Nota bu bölümde basılı mı (kuplörle çalan bölümler sayılmaz; tuş, basıldığı klavyede iner)
  function bolumdeBasili(m, bolum) {
    const h = holders.get(m);
    if (h) for (const k of h) if ((kaynakBolumu.get(k) || 'I') === bolum) return true;
    return false;
  }

  function refreshView() {
    pencereHedefeGetir(); // telefonda yanan tuşlar görünsün (oktavı değiştirebilir, önce gelmeli)
    const base = baseMidi();
    // Telefonda tek klavye var; iki manuelli konsolda seçilen bölümü çalar
    const anaBolum = pencere.acik ? pencere.bolum : 'I';
    keyEls.forEach((k, off) => {
      const m = base + off;
      const down = bolumdeBasili(m, anaBolum);
      k.classList.toggle('down', down);
      k.classList.toggle('held', !down && sustained.has(m));
      const prog = playerDown.get(m);
      k.classList.toggle('prog-sag', !!prog && prog.el === 'sag');
      k.classList.toggle('prog-sol', !!prog && prog.el === 'sol');
      const hedef = targets.get(m);
      k.classList.toggle('hedef', !!hedef && !down);
      k.classList.toggle('hedef-sol', hedef === 'sol' && !down);
    });
    if (settings.konsol === 'tam') {
      keyEls2.forEach((k, off) => k.classList.toggle('down', bolumdeBasili(base + off, 'II')));
      pedalEls.forEach((k, off) => k.classList.toggle('down', bolumdeBasili(PEDAL_ILK + off, 'P')));
    }
    const playing = [...new Set([...voices.keys(), ...playerDown.keys()])].sort((a, b) => a - b);
    readout.textContent = t('Çalan:');
    readout.appendChild(document.createElement('b'));
    readout.lastChild.textContent = playing.length ? playing.map(noteName).join(' · ') : '—';
    updateFacadeTargets();
  }
