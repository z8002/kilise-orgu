  /* ================= Durum ================= */
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const kendi = (nesne, anahtar) => typeof anahtar === 'string' && Object.prototype.hasOwnProperty.call(nesne, anahtar);
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kalinIsaretci = window.matchMedia ? window.matchMedia('(pointer: coarse)') : { matches: false };
  const dokunmatik = kalinIsaretci.matches; // telefon, tablet: ana işaretçi parmak

  // hafif: zayıf telefonlar için daha az boru ve kısa yankı
  const settings = { room: 'kilise', reverb: 45, volume: 70, octave: 3, hafif: false, akort: 'esit', diyapazon: 440, stereo: 50 };
  const stopsOn = new Set(PISTONS[4].stops);
  // Özgün sürüm (v1/) aynı adreste kendi ayarlarını 'kilise-orgu-v1' altında tutar; ilk açılışta oradan devralınır.
  const STORE_KEY = 'kilise-orgu-v2';
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || localStorage.getItem('kilise-orgu-v1') || 'null');
    if (saved) {
      if (kendi(ROOMS, saved.room)) settings.room = saved.room;
      if (Number.isFinite(saved.reverb)) settings.reverb = clamp(saved.reverb, 0, 100);
      if (Number.isFinite(saved.volume)) settings.volume = clamp(saved.volume, 0, 100);
      if (Number.isFinite(saved.octave)) settings.octave = clamp(saved.octave, 1, 5);
      if (typeof saved.hafif === 'boolean') settings.hafif = saved.hafif;
      if (kendi(AKORTLAR, saved.akort)) settings.akort = saved.akort;
      if (DIYAPAZONLAR.some(([hz]) => hz === saved.diyapazon)) settings.diyapazon = saved.diyapazon;
      if (Number.isFinite(saved.stereo)) settings.stereo = clamp(saved.stereo, 0, 100);
      if (Array.isArray(saved.stops)) { stopsOn.clear(); saved.stops.forEach(id => kendi(STOP_BY_ID, id) && stopsOn.add(id)); }
    }
  } catch (_) {}
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...settings, stops: [...stopsOn] })); } catch (_) {}
  }

  const baseMidi = () => 12 * (settings.octave + 1);
  const noteName = m => SOLFEJ[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

