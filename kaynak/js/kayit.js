  /* ================= Kayıt ================= */
  // "Kaydet": çalınan notalar (senin, otomatik pedalın, şarkı çaların) ve hoparlöre giden ses kaydedilir.
  // Bitince kayıt sayfada çalınabilir, MIDI dosyası (.mid) ya da ses dosyası olarak indirilebilir.
  const kayit = { acik: false, bas: 0, olaylar: [], sure: 0, kaydedici: null, sesHedef: null, sesParcalari: [], ses: null, sayac: 0, calan: [] };

  // noteOn/noteOff ve şarkı çalar çağırır. t: ses saati (ctx.currentTime)
  function kayitOlay(tur, midi, bolum, t) {
    if (!kayit.acik) return;
    kayit.olaylar.push({ t: Math.max(0, t - kayit.bas), tur, midi, bolum });
  }

  const sureYaz = sn => `${Math.floor(sn / 60)}:${String(Math.floor(sn % 60)).padStart(2, '0')}`;

  function kayitArayuzu() {
    const b = $('#kayitBtn');
    b.setAttribute('aria-pressed', String(kayit.acik));
    b.textContent = t(kayit.acik ? '■ Durdur' : '● Kaydet');
    $('#kayitPaneli').hidden = kayit.acik || (!kayit.olaylar.length && !kayit.ses);
    $('#kayitSure').textContent = sureYaz(kayit.sure);
    $('#kayitSesIndir').hidden = !kayit.ses;
    $('#kayitCal').textContent = t(kayit.calan.length ? '■ Durdur' : '▶ Kaydı çal');
  }

  function kayitBasla() {
    if (!ensureWind()) return;
    kayitCalmayiDurdur();
    kayit.olaylar = [];
    kayit.ses = null;
    kayit.sesParcalari = [];
    kayit.sure = 0;
    kayit.bas = ctx.currentTime;
    kayit.acik = true;
    // Kayıt başlarken basılı olan notalar da kayda girer
    for (const [m, h] of holders) for (const k of h) if (!String(k).startsWith('kayit:')) kayitOlay('on', m, kaynakBolumu.get(k) || 'I', kayit.bas);
    // Ses: hoparlöre giden sinyal aynı anda bir kaydediciye de gider
    const tur = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
      .find(x => window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(x));
    if (tur && ctx.createMediaStreamDestination) {
      try {
        const hedef = ctx.createMediaStreamDestination();
        A.master.connect(hedef);
        const kaydedici = new MediaRecorder(hedef.stream, { mimeType: tur });
        kaydedici.ondataavailable = e => { if (e.data && e.data.size) kayit.sesParcalari.push(e.data); };
        kaydedici.onstop = () => {
          kayit.ses = new Blob(kayit.sesParcalari, { type: tur });
          try { A.master.disconnect(hedef); } catch (_) {}
          kayitArayuzu();
        };
        kaydedici.start();
        kayit.kaydedici = kaydedici;
      } catch (_) { kayit.kaydedici = null; }
    }
    clearInterval(kayit.sayac);
    kayit.sayac = setInterval(() => { $('#kayitDurum').textContent = '● ' + sureYaz(ctx.currentTime - kayit.bas); }, 250);
    $('#kayitDurum').textContent = '● 0:00';
    kayitArayuzu();
  }

  function kayitBitir() {
    if (!kayit.acik) return;
    kayit.sure = ctx.currentTime - kayit.bas;
    kayit.acik = false;
    clearInterval(kayit.sayac);
    $('#kayitDurum').textContent = '';
    if (kayit.kaydedici && kayit.kaydedici.state !== 'inactive') kayit.kaydedici.stop();
    kayit.kaydedici = null;
    kayitArayuzu();
  }

  // Açma ve kapamaları dengeler: aynı bölümde aynı nota birden çok kaynaktan basılsa da bir kez açılır,
  // bir kez kapanır; kayıt bittiğinde hâlâ basılı olanlar kaydın sonunda kapanır.
  function kayitNotalari() {
    const sayac = new Map(), sonuc = [];
    for (const o of [...kayit.olaylar].sort((a, b) => a.t - b.t)) {
      if (o.t > kayit.sure + 1e-6) continue;
      const k = o.bolum + ':' + o.midi, n = sayac.get(k) || 0;
      if (o.tur === 'on') { sayac.set(k, n + 1); if (n === 0) sonuc.push(o); }
      else if (n > 0) { sayac.set(k, n - 1); if (n === 1) sonuc.push(o); }
    }
    for (const [k, n] of sayac) {
      if (n <= 0) continue;
      const [bolum, m] = k.split(':');
      sonuc.push({ t: kayit.sure, tur: 'off', midi: Number(m), bolum });
    }
    // Aynı anda kapama açmadan önce gelir; gerisi kayıttaki sırasını korur (sıralama kararlıdır)
    return sonuc.sort((a, b) => a.t - b.t || (a.tur === b.tur ? 0 : a.tur === 'off' ? -1 : 1));
  }

  // Standart MIDI dosyası, biçim 0. Dörtlük 480 tik, tempo 120: saniyede 960 tik.
  // Kanallar bölümlere göre: 1 → I. manuel, 2 → Sandık, 3 → pedal.
  function midiDosyasi() {
    const vlq = n => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
    const iz = [];
    let onceki = 0;
    const ekle = (tik, ...veri) => { iz.push(...vlq(tik - onceki), ...veri); onceki = tik; };
    const ad = [...new TextEncoder().encode(ORG === 'caz' ? 'Caz Orgu' : 'Kilise Orgu')];
    ekle(0, 0xff, 0x03, ad.length, ...ad);
    ekle(0, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20); // 500 000 µs/dörtlük
    const kanal = { I: 0, II: 1, P: 2 };
    for (const o of kayitNotalari()) ekle(Math.round(o.t * 960), (o.tur === 'on' ? 0x90 : 0x80) | (kanal[o.bolum] || 0), o.midi, o.tur === 'on' ? 96 : 0);
    ekle(Math.max(onceki, Math.round(kayit.sure * 960)), 0xff, 0x2f, 0x00);
    const u32 = n => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
    return new Uint8Array([
      0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0, // MThd: biçim 0, bir iz, 480 tik
      0x4d, 0x54, 0x72, 0x6b, ...u32(iz.length), ...iz,           // MTrk
    ]);
  }

  function indir(veri, ad, tur) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(veri instanceof Blob ? veri : new Blob([veri], { type: tur }));
    a.download = ad;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  function dosyaAdi(uzanti) {
    const d = new Date(), iki = n => String(n).padStart(2, '0');
    return `${ORG}-orgu-kayit-${d.getFullYear()}${iki(d.getMonth() + 1)}${iki(d.getDate())}-${iki(d.getHours())}${iki(d.getMinutes())}.${uzanti}`;
  }

  // Kaydı sayfada çalar (o anki registrasyonla)
  function kayitCal() {
    if (kayit.calan.length) { kayitCalmayiDurdur(); return; }
    if (!ensureWind()) return;
    for (const o of kayitNotalari()) {
      kayit.calan.push(setTimeout(() => {
        const kaynak = `kayit:${o.bolum}:${o.midi}`;
        if (o.tur === 'on') noteOn(o.midi, kaynak, o.bolum); else noteOff(o.midi, kaynak);
      }, o.t * 1000 + 30));
    }
    kayit.calan.push(setTimeout(kayitCalmayiDurdur, kayit.sure * 1000 + 300));
    kayitArayuzu();
  }

  function kayitCalmayiDurdur() {
    for (const id of kayit.calan) clearTimeout(id);
    kayit.calan = [];
    for (const [m, h] of [...holders]) for (const k of [...h]) if (String(k).startsWith('kayit:')) noteOff(m, k);
    kayitArayuzu();
  }

  function kayitKur() {
    $('#kayitBtn').addEventListener('click', () => (kayit.acik ? kayitBitir() : kayitBasla()));
    $('#kayitCal').addEventListener('click', kayitCal);
    $('#kayitMidiIndir').addEventListener('click', () => indir(midiDosyasi(), dosyaAdi('mid'), 'audio/midi'));
    $('#kayitSesIndir').addEventListener('click', () => {
      if (!kayit.ses) return;
      indir(kayit.ses, dosyaAdi(kayit.ses.type.includes('mp4') ? 'm4a' : kayit.ses.type.includes('ogg') ? 'ogg' : 'webm'));
    });
    kayitArayuzu();
  }
