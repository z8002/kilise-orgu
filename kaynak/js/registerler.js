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
    updatePistons();
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
      h.textContent = t(baslik);
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
        const label = `${registerAdi(s).replace('\n', ' ')} ${s.foot}`.trim() + (s.bolum === 'I' ? '' : ` · ${t(BOLUM_ADI[s.bolum])}`);
        b.title = `${label} — ${registerAciklamasi(s)}`;
        b.setAttribute('aria-label', label);
        b.setAttribute('aria-pressed', String(stopsOn.has(s.id)));
        b.innerHTML = '<span class="nm"></span><span class="ft"></span>';
        b.firstChild.textContent = registerAdi(s);
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
      b.title = t(k.desc);
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
      b.setAttribute('aria-label', t('Kombinasyon {n}: {ad}', { n: p.n, ad: t(p.name) }));
      b.innerHTML = '<span class="btn"></span><span class="pl"></span>';
      b.firstChild.textContent = p.n;
      b.lastChild.textContent = t(p.name);
      b.addEventListener('click', () => { ayarlaKapat(); applyPiston(p.n); });
      pistonEls.push({ el: b, set: new Set(p.stops) });
      host.appendChild(b);
    }
    // Kendi kombinasyonların: önce "Ayarla", sonra K1–K4'ten biri; o anki registrasyon oraya kaydedilir
    const kHost = $('#kendiPistonlar');
    kendiKombinasyonlar.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'piston kendi';
      b.dataset.no = i + 1;
      b.innerHTML = '<span class="btn"></span>';
      b.firstChild.textContent = 'K' + (i + 1);
      b.addEventListener('click', () => kendiBasildi(i));
      kendiEls.push(b);
      kHost.appendChild(b);
    });
    $('#ayarla').addEventListener('click', () => {
      ayarlaniyor = !ayarlaniyor;
      $('#ayarla').setAttribute('aria-pressed', String(ayarlaniyor));
      kombinasyonDurumu(ayarlaniyor ? t('Şimdi kaydedileceği yeri seç: K1, K2, K3 ya da K4.') : '');
    });
  }

  const kendiEls = [];
  let ayarlaniyor = false;
  function ayarlaKapat() {
    if (!ayarlaniyor) return;
    ayarlaniyor = false;
    $('#ayarla').setAttribute('aria-pressed', 'false');
    kombinasyonDurumu('');
  }
  function kombinasyonDurumu(metin) { $('#kombinasyonDurum').textContent = metin; }

  function kendiBasildi(i) {
    const ad = 'K' + (i + 1), adA = ad + "'" + ['e', 'ye', 'e', 'e'][i]; // K1'e, K2'ye, K3'e, K4'e
    if (ayarlaniyor) {
      kendiKombinasyonlar[i] = { stops: [...stopsOn], kuplorler: [...kuplorler] };
      ayarlaKapat();
      kombinasyonDurumu(t('O anki registrasyon {ad} kaydedildi.', { ad: DIL === 'en' ? ad : adA }));
      updatePistons();
      save();
      return;
    }
    const k = kendiKombinasyonlar[i];
    if (!k) { kombinasyonDurumu(t("{ad} boş. Kaydetmek için önce Ayarla'ya, sonra {adA} bas.", { ad, adA })); return; }
    kombinasyonDurumu('');
    const want = new Set(k.stops), kw = new Set(k.kuplorler);
    STOPS.forEach(s => setStop(s.id, want.has(s.id)));
    KUPLORLER.forEach(x => kuplorDegistir(x.id, kw.has(x.id)));
    afterRegistration();
  }

  const ayniKume = (a, b) => a.size === b.size && [...a].every(x => b.has(x));

  function updatePistons() {
    for (const { el, set } of pistonEls) el.setAttribute('aria-current', String(ayniKume(set, stopsOn)));
    kendiEls.forEach((el, i) => {
      const k = kendiKombinasyonlar[i];
      el.dataset.dolu = String(!!k);
      el.setAttribute('aria-label', t(k ? 'Kendi kombinasyonum {n}' : 'Kendi kombinasyonum {n} (boş)', { n: i + 1 }));
      el.setAttribute('aria-current', String(!!k && ayniKume(new Set(k.stops), stopsOn) && ayniKume(new Set(k.kuplorler), kuplorler)));
    });
  }
