  /* ================= Registerler ================= */
  const knobEls = {};
  const pistonEls = [];
  const kuplorEls = {};

  function setStop(id, on) {
    const stop = STOP_BY_ID[id];
    if (!stop || on === stopsOn.has(id)) return;
    if (on) stopsOn.add(id); else stopsOn.delete(id);
    // Şarkı çaların, gelecek bir bölümün registrasyonuyla zamanladığı sesler de değişikliği alır
    for (const v of playerVoices) if (v.acik !== stopsOn) { if (on) v.acik.add(id); else v.acik.delete(id); }
    if (ctx) { if (stop.effect) applyTremolo(); else tumSesleriUygula(); }
    knobEls[id].setAttribute('aria-pressed', String(on));
  }

  function kuplorDegistir(id, acik) {
    if (acik === kuplorler.has(id)) return;
    if (acik) kuplorler.add(id); else kuplorler.delete(id);
    kuplorEls[id].setAttribute('aria-pressed', String(acik));
    tumSesleriUygula();
    save();
  }

  function afterRegistration() { updatePistons(); refreshView(); save(); }

  const JAMBLAR = [
    ['temel', 'Temel sesler', 4], ['parlak', 'Parlak sesler', 3], ['sandik', 'Sandık · II. manuel', 3], ['pedal', 'Pedal', 2],
  ];

  function buildStops() {
    for (const [jamb, baslik, sutun] of JAMBLAR) {
      const host = document.getElementById('jamb-' + jamb);
      const list = STOPS.filter(s => s.jamb === jamb);
      const h = document.createElement('h3');
      h.textContent = baslik;
      const grid = document.createElement('div');
      grid.className = 'knobs';
      grid.style.setProperty('--cols', sutun);
      for (const s of list) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'knob';
        b.dataset.family = s.family;
        b.dataset.id = s.id;
        // Sandık ve pedal registerlerinin adına bölüm eklenir (iki manuelde de Tremolo var)
        const label = `${s.name.replace('\n', ' ')} ${s.foot}`.trim() + (s.bolum === 'I' ? '' : ` · ${BOLUM_ADI[s.bolum]}`);
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
    const kHost = $('#kuplorler');
    for (const k of KUPLORLER) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kuplor';
      b.textContent = k.ad;
      b.title = k.desc;
      b.setAttribute('aria-pressed', String(kuplorler.has(k.id)));
      b.addEventListener('click', () => kuplorDegistir(k.id, !kuplorler.has(k.id)));
      kuplorEls[k.id] = b;
      kHost.appendChild(b);
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

