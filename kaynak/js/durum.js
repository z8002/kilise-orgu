  /* ================= Durum ================= */
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const kendi = (nesne, anahtar) => typeof anahtar === 'string' && Object.prototype.hasOwnProperty.call(nesne, anahtar);
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kalinIsaretci = window.matchMedia ? window.matchMedia('(pointer: coarse)') : { matches: false };
  const dokunmatik = kalinIsaretci.matches; // telefon, tablet: ana işaretçi parmak
  // İki sayfa aynı koddan üretilir: kilise-orgu.html (borulu org) ve caz-orgu.html (ton tekerlekli caz orgu)
  const ORG = document.documentElement.dataset.org === 'caz' ? 'caz' : 'kilise';

  // hafif: zayıf telefonlar için daha az boru ve kısa yankı
  // konsol: 'tek' (bir manuel) ya da 'tam' (iki manuel ve pedal); sandik: Sandık panjurunun açıklığı (0–100)
  const settings = {
    room: 'kilise', reverb: 45, volume: 70, octave: 3, hafif: false, akort: 'esit', diyapazon: 440, stereo: 50,
    konsol: 'tek', otoPedal: false, sandik: 100, midi: false, porte: true,
    metronom: { tempo: 90, olcu: 4 }, // metronomun serbest temposu (dakikada vuruş) ve ölçüdeki vuruş sayısı (0: vurgusuz)
    // Caz orgu: dokuz çekme çubuğu (0–8), perküsyon, vibrato/koro, dönen hoparlör, sürüş, tuş tıkırtısı
    caz: {
      cekme: [8, 8, 8, 0, 0, 0, 0, 0, 0], perkusyon: true, harmonik: 3, hizli: true, yumusak: false,
      vibrato: 'C3', hoparlor: 'yavas', surus: 15, tikirti: true,
    },
  };
  if (ORG === 'caz') { settings.room = 'kulup'; settings.reverb = 25; }
  const stopsOn = new Set(PISTONS[4].stops);
  const kuplorler = new Set();
  const kendiKombinasyonlar = [null, null, null, null]; // K1–K4: { stops, kuplorler } ya da null
  // Özgün sürüm (v1/) aynı adreste kendi ayarlarını 'kilise-orgu-v1' altında tutar; ilk açılışta oradan devralınır.
  const STORE_KEY = ORG === 'caz' ? 'caz-orgu-v1' : 'kilise-orgu-v2';
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || (ORG === 'kilise' && localStorage.getItem('kilise-orgu-v1')) || 'null');
    if (saved) {
      if (kendi(ROOMS, saved.room)) settings.room = saved.room;
      if (Number.isFinite(saved.reverb)) settings.reverb = clamp(saved.reverb, 0, 100);
      if (Number.isFinite(saved.volume)) settings.volume = clamp(saved.volume, 0, 100);
      if (Number.isFinite(saved.octave)) settings.octave = clamp(saved.octave, 1, 5);
      if (typeof saved.hafif === 'boolean') settings.hafif = saved.hafif;
      if (kendi(AKORTLAR, saved.akort)) settings.akort = saved.akort;
      if (DIYAPAZONLAR.some(([hz]) => hz === saved.diyapazon)) settings.diyapazon = saved.diyapazon;
      if (Number.isFinite(saved.stereo)) settings.stereo = clamp(saved.stereo, 0, 100);
      if (saved.konsol === 'tek' || saved.konsol === 'tam') settings.konsol = saved.konsol;
      if (typeof saved.otoPedal === 'boolean') settings.otoPedal = saved.otoPedal;
      if (typeof saved.midi === 'boolean') settings.midi = saved.midi;
      if (typeof saved.porte === 'boolean') settings.porte = saved.porte;
      if (saved.metronom && Number.isFinite(saved.metronom.tempo)) settings.metronom.tempo = clamp(Math.round(saved.metronom.tempo), 30, 240);
      if (saved.metronom && [0, 2, 3, 4, 6].includes(saved.metronom.olcu)) settings.metronom.olcu = saved.metronom.olcu;
      if (Number.isFinite(saved.sandik)) settings.sandik = clamp(saved.sandik, 0, 100);
      if (Array.isArray(saved.stops)) {
        stopsOn.clear();
        saved.stops.forEach(id => kendi(STOP_BY_ID, id) && stopsOn.add(id));
        // Önceki sürümlerin kaydında yalnızca I. manuel vardı: Sandık ve pedal Plenum'la başlar
        if (!Array.isArray(saved.kuplorler)) for (const id of PISTONS[4].stops) if (STOP_BY_ID[id].bolum !== 'I') stopsOn.add(id);
      }
      if (Array.isArray(saved.kuplorler)) saved.kuplorler.forEach(id => KUPLORLER.some(k => k.id === id) && kuplorler.add(id));
      const c = saved.caz, cv = settings.caz;
      if (c && typeof c === 'object') {
        if (Array.isArray(c.cekme) && c.cekme.length === 9 && c.cekme.every(x => Number.isInteger(x) && x >= 0 && x <= 8)) cv.cekme = c.cekme;
        for (const k of ['perkusyon', 'hizli', 'yumusak', 'tikirti']) if (typeof c[k] === 'boolean') cv[k] = c[k];
        if (c.harmonik === 2 || c.harmonik === 3) cv.harmonik = c.harmonik;
        if (['kapali', 'V1', 'V2', 'V3', 'C1', 'C2', 'C3'].includes(c.vibrato)) cv.vibrato = c.vibrato;
        if (['kapali', 'yavas', 'hizli'].includes(c.hoparlor)) cv.hoparlor = c.hoparlor;
        if (Number.isFinite(c.surus)) cv.surus = clamp(c.surus, 0, 100);
      }
      if (Array.isArray(saved.kendi)) saved.kendi.slice(0, 4).forEach((k, i) => {
        if (!k || !Array.isArray(k.stops) || !Array.isArray(k.kuplorler)) return;
        kendiKombinasyonlar[i] = {
          stops: k.stops.filter(id => kendi(STOP_BY_ID, id)),
          kuplorler: k.kuplorler.filter(id => KUPLORLER.some(x => x.id === id)),
        };
      });
    }
  } catch (_) {}
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...settings, stops: [...stopsOn], kuplorler: [...kuplorler], kendi: kendiKombinasyonlar })); } catch (_) {}
  }

  const baseMidi = () => 12 * (settings.octave + 1);
  const notaAdlari = () => (DIL === 'en' ? HARFLER : SOLFEJ); // Do Re Mi ya da C D E
  const noteName = m => notaAdlari()[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

