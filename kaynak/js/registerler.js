  /* ================= Registerler ================= */
  const knobEls = {};
  const pistonEls = [];

  function setStop(id, on) {
    const stop = STOP_BY_ID[id];
    if (!stop || on === stopsOn.has(id)) return;
    if (on) stopsOn.add(id); else stopsOn.delete(id);
    if (ctx) {
      const t = ctx.currentTime;
      if (stop.effect) applyTremolo();
      else for (const v of [...voices.values(), ...playerVoices]) (on ? v.addStop(stop, Math.max(t, v.t0)) : v.removeStop(id, Math.max(t, v.t0)));
    }
    knobEls[id].setAttribute('aria-pressed', String(on));
  }

  function afterRegistration() { updatePistons(); refreshView(); save(); }

  function buildStops() {
    for (const jamb of ['temel', 'parlak']) {
      const host = document.getElementById('jamb-' + jamb);
      const list = STOPS.filter(s => s.jamb === jamb);
      const h = document.createElement('h3');
      h.textContent = jamb === 'temel' ? 'Temel sesler' : 'Parlak sesler';
      const grid = document.createElement('div');
      grid.className = 'knobs';
      grid.style.setProperty('--cols', jamb === 'temel' ? 4 : 3);
      for (const s of list) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'knob';
        b.dataset.family = s.family;
        const label = `${s.name.replace('\n', ' ')} ${s.foot}`.trim();
        b.title = `${label} — ${s.desc}`;
        b.setAttribute('aria-label', label);
        b.setAttribute('aria-pressed', String(stopsOn.has(s.id)));
        b.innerHTML = '<span class="nm"></span><span class="ft"></span>';
        b.firstChild.textContent = s.name;
        b.lastChild.textContent = s.foot;
        b.addEventListener('click', () => { setStop(s.id, !stopsOn.has(s.id)); afterRegistration(); });
        knobEls[s.id] = b;
        grid.appendChild(b);
      }
      host.append(h, grid);
    }
  }

  function applyPiston(n) {
    const p = PISTONS.find(x => x.n === String(n));
    if (!p) return;
    const want = new Set(p.stops);
    STOPS.forEach(s => setStop(s.id, want.has(s.id)));
    afterRegistration();
  }

  function buildPistons() {
    const host = $('#pistons');
    for (const p of PISTONS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'piston';
      b.setAttribute('aria-label', `Kombinasyon ${p.n}: ${p.name}`);
      b.innerHTML = '<span class="btn"></span><span class="pl"></span>';
      b.firstChild.textContent = p.n;
      b.lastChild.textContent = p.name;
      b.addEventListener('click', () => applyPiston(p.n));
      pistonEls.push({ el: b, set: new Set(p.stops) });
      host.appendChild(b);
    }
  }

  function updatePistons() {
    for (const { el, set } of pistonEls) {
      const same = set.size === stopsOn.size && [...set].every(id => stopsOn.has(id));
      el.setAttribute('aria-current', String(same));
    }
  }

