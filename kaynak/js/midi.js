  /* ================= MIDI klavye ================= */
  // Web MIDI ile bağlanan klavye (Chrome, Edge, Android'de Chrome; Safari desteklemez).
  //  - Nota aç/kapa: hız (velocity) yok sayılır; org tuşu ya basılıdır ya değil.
  //  - Kanal → bölüm (iki manuelli konsolda): 1 → I. manuel, 2 → Sandık, 3 → pedal.
  //  - CC 64 sürdürme pedalı ("Tut" gibi), CC 11 ifade pedalı (kilise: Sandık panjuru, caz: ses düzeyi),
  //    CC 1 modülasyon tekerleği (caz: dönen hoparlör Yavaş/Hızlı), CC 120/123 bütün sesleri sustur.
  //  - Program değişimi: kilise orgunda 0–5 → piston 1–6, 6 → İptal, 7–10 → K1–K4; caz orgunda hazır sesler.
  const midi = { erisim: null };

  function midiDurumu(metin) { $('#midiDurum').textContent = metin; }

  async function midiBagla(sessiz) {
    if (!navigator.requestMIDIAccess) {
      if (!sessiz) midiDurumu('Bu tarayıcı MIDI klavyeyi desteklemiyor; Chrome ya da Edge ile aç.');
      return;
    }
    try {
      midi.erisim = await navigator.requestMIDIAccess();
    } catch (_) {
      settings.midi = false;
      save();
      if (!sessiz) midiDurumu('MIDI izni verilmedi. Adres çubuğundaki site ayarlarından izin verebilirsin.');
      return;
    }
    settings.midi = true;
    save();
    midi.erisim.onstatechange = midiGirisleri;
    midiGirisleri();
  }

  function midiGirisleri() {
    const adlar = [];
    for (const g of midi.erisim.inputs.values()) {
      if (g.state && g.state !== 'connected') continue;
      g.onmidimessage = e => midiMesaji(g.id, e.data); // yeniden takılan klavye için her seferinde
      adlar.push(g.name || 'MIDI klavye');
    }
    $('#midiBagla').setAttribute('aria-pressed', String(adlar.length > 0));
    midiDurumu(adlar.length ? `MIDI: ${adlar.join(', ')}` : 'MIDI klavye bulunamadı; takıp yeniden dene.');
  }

  function midiMesaji(id, d) {
    if (!d || d.length < 2) return;
    const tur = d[0] & 0xf0, kanal = d[0] & 0x0f;
    const bolum = ORG === 'kilise' && settings.konsol === 'tam' ? (['I', 'II', 'P'][kanal] || 'I') : 'I';
    const kaynak = `m:${id}:${kanal}:${d[1]}`;
    if (tur === 0x90 && d[2] > 0) noteOn(d[1], kaynak, bolum);
    else if (tur === 0x80 || tur === 0x90) noteOff(d[1], kaynak);
    else if (tur === 0xb0) midiKontrol(d[1], d[2]);
    else if (tur === 0xc0) midiProgram(d[1]);
  }

  function midiKontrol(no, deger) {
    if (no === 64) { midiSurdur = deger >= 64; updateSustain(); }
    else if (no === 11) {
      if (ORG === 'kilise') {
        settings.sandik = Math.round(deger / 127 * 100);
        $('#sandik').value = settings.sandik;
        $('#sandikOut').textContent = settings.sandik;
        sandigiUygula();
      } else if (ctx && A.caz) A.caz.giris.gain.setTargetAtTime(0.12 + 0.88 * deger / 127, ctx.currentTime, 0.02);
    } else if (no === 1 && ORG === 'caz') {
      const h = deger >= 64 ? 'hizli' : 'yavas';
      if (cazAyar.hoparlor !== h && cazAyar.hoparlor !== 'kapali') hoparlorSec(h);
    } else if (no === 120 || no === 123) releaseAll();
  }

  function midiProgram(p) {
    if (ORG === 'caz') { const b = document.querySelectorAll('.caz-hazir')[p]; if (b) b.click(); return; }
    if (p <= 5) applyPiston(String(p + 1));
    else if (p === 6) applyPiston('0');
    else if (p <= 10) kendiBasildi(p - 7);
  }

  function midiKur() {
    $('#midiBagla').addEventListener('click', () => midiBagla(false));
    // Daha önce bağlanmışsa (izin verilmişse) kendiliğinden yeniden bağlan
    if (settings.midi) midiBagla(true);
  }
