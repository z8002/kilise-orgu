  /* ================= Şarkı çalar ================= */
  // Dinle: program parçayı tempoda çalar. "Ben" seçilen el çalınmaz, yalnızca basılacak tuşlar yanar (eşlik).
  // Öğren: program, "Ben" seçilen elin sıradaki tuşlarına basılmasını bekler; öbür eli o adıma kadar kendisi çalar.
  const calar = {
    parca: null, cizelge: null,
    mod: 'dinle',                              // 'dinle' | 'ogren'
    eller: { sag: 'program', sol: 'program' }, // 'program' | 'ben' | 'kapali'
    hiz: 100,                                  // yüzde
    dongu: false,                              // içinde bulunulan bölümü yinele
    durum: 'bos',                              // 'bos' | 'hazir' | 'caliyor' | 'durakladi' | 'bitti'
    konum: 0,                                  // tik
    t0: 0, sira: 0, bolumNo: -1, basTik: 0,    // Dinle: zamanlama durumu
    bekleyenKayit: null,                       // { t, stops }: bölüm geçişinde, henüz uygulanmamış registrasyon
    acik: [], sayaclar: new Set(), dongu_id: 0,
    adimlar: [], adim: 0, taze: new Set(), yanlis: 0, bitisSayaci: 0,
    gunluk: null,                              // testler için: zamanlanan program notaları
    basEli: 'sol', pedalSayisi: 0,             // otomatik pedal: bas çizgisini çalan el, zamanlanan pedal notası sayısı
  };
  const UFUK = 0.25;        // saniye: notalar bu kadar önceden zamanlanır
  const ARALIK_MS = 25;

  const calarSaniye = tik => parcaSaniyesi(calar.parca, calar.cizelge, tik) / (calar.hiz / 100);

  // Zamanın (ctx) karşılık geldiği tik: calarSaniye'nin tersi (ikili arama)
  function calarTik(zaman) {
    const hedef = zaman - calar.t0;
    let a = 0, b = calar.cizelge.toplam;
    if (hedef <= 0) return 0;
    if (hedef >= calarSaniye(b)) return b;
    for (let i = 0; i < 32; i++) {
      const m = (a + b) / 2;
      if (calarSaniye(m) < hedef) a = m; else b = m;
    }
    return Math.round(b);
  }

  function calarSayac(zaman, is) {
    const id = setTimeout(() => { calar.sayaclar.delete(id); is(); }, Math.max(0, (zaman - ctx.currentTime) * 1000));
    calar.sayaclar.add(id);
  }

  function calarIsik(harita, o, yak) {
    for (const m of o.notalar) {
      if (harita === targets) { if (yak) targets.set(m, o.el); else targets.delete(m); continue; }
      const e = playerDown.get(m) || { n: 0, el: o.el };
      e.n += yak ? 1 : -1;
      e.el = o.el;
      if (e.n > 0) playerDown.set(m, e); else playerDown.delete(m);
    }
    refreshView();
  }

  // Bir olayı tBas–tBit arasında çalınmak üzere zamanlar.
  function calarOlay(o, tBas, tBit, sonraki) {
    const rol = calar.eller[o.el];
    if (rol === 'kapali') return;
    if (rol === 'ben') {
      if (calar.mod === 'dinle') { calarSayac(tBas, () => calarIsik(targets, o, true)); calarSayac(tBit, () => calarIsik(targets, o, false)); }
      return;
    }
    // Aynı nota hemen yineleniyorsa araya kısa bir nefes koy
    const yinelenen = sonraki && sonraki.t === o.t + o.d && sonraki.notalar.some(m => o.notalar.includes(m));
    const bit = yinelenen ? Math.max(tBas + (tBit - tBas) * 0.6, tBit - 0.045) : tBit;
    const kayit = calar.bekleyenKayit && tBas >= calar.bekleyenKayit.t - 1e-4 ? calar.bekleyenKayit.stops : undefined;
    const acik = () => (kayit ? new Set(kayit) : stopsOn);
    for (const m of o.notalar) {
      const v = new Voice(m, tBas, new Set(['I']), acik());
      playerVoices.add(v);
      calar.acik.push({ v, bit });
    }
    // Otomatik pedal: bas çizgisini çalan elin en kalın notası pedalda da çalar
    if (settings.otoPedal && o.el === calar.basEli) {
      const v = new Voice(pedalNotasi(Math.min(...o.notalar), null), tBas, new Set(['P']), acik());
      playerVoices.add(v);
      calar.acik.push({ v, bit });
      calar.pedalSayisi++;
    }
    if (calar.gunluk) calar.gunluk.push({ tik: o.t, el: o.el, notalar: o.notalar, bas: tBas, bit });
    calarSayac(tBas, () => calarIsik(playerDown, o, true));
    calarSayac(bit, () => calarIsik(playerDown, o, false));
  }

  function calarAcikKapat(ufuk) {
    calar.acik = calar.acik.filter(a => {
      if (a.bit >= ufuk) return true;
      a.v.release(Math.max(a.bit, ctx.currentTime));
      playerVoices.delete(a.v);
      return false;
    });
  }

  // Bölümün registrasyonunu ve oktavını uygular (bir önceki bölümden farklıysa).
  function calarBolumeGir(no, zaman) {
    const b = calar.cizelge.bolumler[no], onceki = no > 0 ? calar.cizelge.bolumler[no - 1] : null;
    const pistonDegisti = !onceki || onceki.piston !== b.piston || calar.yeniBaslangic;
    calar.yeniBaslangic = false;
    if (pistonDegisti) calar.bekleyenKayit = { t: zaman, stops: PISTONS.find(p => p.n === b.piston).stops };
    calarSayac(zaman, () => {
      if (pistonDegisti) { applyPiston(b.piston); calar.bekleyenKayit = null; }
      if (settings.octave !== b.oktav) setOctave(b.oktav);
      calar.gorunenBolum = no;
      calarArayuzGuncelle();
    });
  }

  function calarZamanla() {
    if (calar.durum !== 'caliyor') return;
    const c = calar.cizelge, ufuk = ctx.currentTime + UFUK;
    calarAcikKapat(ufuk);
    if (calar.mod !== 'dinle') return;
    for (;;) {
      // Bölüm yinelemesi: bölümün sonuna gelince başına dön
      const b = c.bolumler[Math.max(0, calar.bolumNo)];
      if (calar.dongu && calar.bolumNo >= 0 && calar.t0 + calarSaniye(b.bit) < ufuk) {
        calar.t0 += calarSaniye(b.bit) - calarSaniye(b.bas);
        calar.sira = c.olaylar.findIndex(o => o.t >= b.bas);
        if (calar.sira < 0) calar.sira = c.olaylar.length;
        continue;
      }
      if (calar.bolumNo + 1 < c.bolumler.length) {
        const zaman = calar.t0 + calarSaniye(c.bolumler[calar.bolumNo + 1].bas);
        if (zaman < ufuk && (calar.sira >= c.olaylar.length || c.olaylar[calar.sira].t >= c.bolumler[calar.bolumNo + 1].bas)) {
          calar.bolumNo++;
          calarBolumeGir(calar.bolumNo, Math.max(zaman, ctx.currentTime));
          continue;
        }
      }
      if (calar.sira >= c.olaylar.length) break;
      const o = c.olaylar[calar.sira];
      const tBas = calar.t0 + calarSaniye(o.t);
      if (tBas >= ufuk) break;
      calar.sira++;
      if (o.t < calar.basTik) continue;
      const sonraki = c.olaylar.slice(calar.sira).find(x => x.el === o.el);
      calarOlay(o, tBas, calar.t0 + calarSaniye(o.t + o.d), sonraki);
    }
    calar.konum = calarTik(ctx.currentTime);
    calarIlerlemeGuncelle();
    if (calar.sira >= c.olaylar.length && !calar.dongu && ctx.currentTime > calar.t0 + calarSaniye(c.toplam) + 0.05) calarBitir();
  }

  function calarSesleriKes() {
    for (const id of calar.sayaclar) clearTimeout(id);
    calar.sayaclar.clear();
    const simdi = ctx ? ctx.currentTime : 0;
    for (const a of calar.acik) { if (a.v.t0 <= simdi) a.v.release(simdi); else a.v.cancel(); }
    calar.acik = [];
    playerVoices.clear();
    playerDown.clear();
    targets.clear();
    calar.bekleyenKayit = null;
    refreshView();
  }

  function calarBitir() {
    calarSesleriKes();
    calar.durum = 'bitti';
    calar.konum = calar.cizelge.toplam;
    calarArayuzGuncelle();
  }

  /* ---- Öğren: adım adım ---- */
  function calarAdimlariKur() {
    const adimlar = [];
    for (const o of calar.cizelge.olaylar) {
      if (calar.eller[o.el] !== 'ben') continue;
      let a = adimlar[adimlar.length - 1];
      if (!a || a.t !== o.t) { a = { t: o.t, notalar: [], eller: new Map(), sira: o.sira }; adimlar.push(a); }
      for (const m of o.notalar) if (!a.eller.has(m)) { a.notalar.push(m); a.eller.set(m, o.el); }
    }
    calar.adimlar = adimlar;
  }

  // [bas, bit) tik aralığındaki program notalarını şimdi başlayacak biçimde çalar.
  function calarAraligiCal(bas, bit) {
    const c = calar.cizelge;
    const t0 = ctx.currentTime + 0.03 - calarSaniye(bas);
    c.olaylar.forEach((o, i) => {
      if (o.t < bas || o.t >= bit || calar.eller[o.el] !== 'program') return;
      const sonraki = c.olaylar.slice(i + 1).find(x => x.el === o.el);
      calarOlay(o, t0 + calarSaniye(o.t), t0 + calarSaniye(o.t + o.d), sonraki);
    });
    return t0 + calarSaniye(bit);
  }

  function calarAdimaGec(no) {
    const c = calar.cizelge;
    calar.adim = no;
    calar.taze.clear();
    targets.clear();
    if (no >= calar.adimlar.length) { refreshView(); return; }
    const a = calar.adimlar[no];
    calar.konum = a.t;
    const b = c.bolumler[a.sira];
    if (calar.gorunenBolum !== a.sira) {
      const onceki = c.bolumler[calar.gorunenBolum];
      if (!onceki || onceki.piston !== b.piston) applyPiston(b.piston);
      if (settings.octave !== b.oktav) setOctave(b.oktav);
      calar.gorunenBolum = a.sira;
    }
    for (const m of a.notalar) targets.set(m, a.eller.get(m));
    refreshView();
    calarArayuzGuncelle();
  }

  // noteOn her tuş basışında çağırır.
  function calarKullaniciBasti(midi) {
    if (calar.mod !== 'ogren' || calar.durum !== 'caliyor' || calar.adim >= calar.adimlar.length) return;
    const a = calar.adimlar[calar.adim];
    if (!a.notalar.includes(midi)) {
      calar.yanlis++;
      calarYanlisGoster(midi);
      calarArayuzGuncelle();
      return;
    }
    calar.taze.add(midi);
    if (!a.notalar.every(m => holders.has(m))) return;
    // Adım tamam: öbür elin bu adımdan sonrakine kadar olan notalarını çal, sonraki adıma geç
    const c = calar.cizelge;
    const sonraki = calar.adimlar[calar.adim + 1];
    let bit = sonraki ? sonraki.t : c.toplam;
    let no = calar.adim + 1;
    if (calar.dongu) {
      const b = c.bolumler[a.sira];
      if (!sonraki || sonraki.t >= b.bit) { bit = b.bit; no = calar.adimlar.findIndex(x => x.t >= b.bas); }
    }
    const sonAn = calarAraligiCal(a.t, bit);
    if (no >= calar.adimlar.length) {
      calarAdimaGec(no);
      clearTimeout(calar.bitisSayaci);
      calar.bitisSayaci = setTimeout(() => { if (calar.durum === 'caliyor') calarBitir(); }, Math.max(300, (sonAn - ctx.currentTime) * 1000 + 200));
    } else calarAdimaGec(no);
  }

  // Telefonda pencerenin önceden görmesi için: kullanıcının sıradaki birkaç adımda basacağı notalar.
  function calarIleriNotalar() {
    if (!calar.parca || calar.durum !== 'caliyor') return [];
    if (calar.mod === 'ogren') return calar.adimlar.slice(calar.adim + 1, calar.adim + 9).map(a => a.notalar);
    const sonuc = [];
    for (const o of calar.cizelge.olaylar) {
      if (o.t <= calar.konum || calar.eller[o.el] !== 'ben') continue;
      sonuc.push(o.notalar);
      if (sonuc.length >= 8) break;
    }
    return sonuc;
  }

  // Parça açılınca telefondaki klavye penceresi ezginin başına gelir.
  function calarPencereyiYerlestir() {
    const c = calar.cizelge;
    const el = c.eller.find(e => calar.eller[e] === 'ben') || (c.eller.includes('sag') ? 'sag' : 'sol');
    pencereNotalaraGetir(c.olaylar.filter(o => o.el === el).slice(0, 8).map(o => o.notalar), true);
  }

  /* ---- Komutlar ---- */
  function calarYukle(id, mod) {
    const parca = kendi(PARCA_BY_ID, id) ? PARCA_BY_ID[id] : null; // ?parca=constructor gibi adresler de bilinmeyen sayılır
    if (!parca) return false;
    if (calar.parca) calarDurdur();
    calar.parca = parca;
    calar.cizelge = parcaCizelgesi(parca);
    calar.basEli = calar.cizelge.eller.includes('sol') ? 'sol' : 'sag';
    calar.hiz = 100;
    calar.dongu = false;
    calar.konum = 0;
    calar.yanlis = 0;
    calar.gorunenBolum = -1;
    calarModSec(mod === 'ogren' ? 'ogren' : 'dinle', true);
    calar.durum = 'hazir';
    // Parçanın önerdiği ayarlar
    const ilk = calar.cizelge.bolumler[0];
    applyPiston(ilk.piston);
    if (settings.octave !== ilk.oktav) setOctave(ilk.oktav);
    if (parca.mekan && ROOMS[parca.mekan] && settings.room !== parca.mekan) { settings.room = parca.mekan; $('#room').value = parca.mekan; applyRoom(); save(); }
    calarPencereyiYerlestir();
    calarArayuzKur();
    calarArayuzGuncelle();
    return true;
  }

  function calarModSec(mod, sessiz) {
    if (calar.durum === 'caliyor') calarDuraklat();
    calar.mod = mod;
    const eller = calar.cizelge.eller;
    if (mod === 'ogren') {
      // En az bir eli kullanıcı çalmalı
      if (!eller.some(el => calar.eller[el] === 'ben')) {
        calar.eller.sag = eller.includes('sag') ? 'ben' : 'kapali';
        calar.eller.sol = eller.includes('sol') ? (eller.includes('sag') ? 'program' : 'ben') : 'kapali';
      }
    } else if (sessiz) {
      calar.eller.sag = 'program'; calar.eller.sol = 'program';
    }
    calarAdimlariKur();
    calar.adim = Math.max(0, calar.adimlar.findIndex(a => a.t >= calar.konum));
    if (!sessiz) calarArayuzGuncelle();
  }

  function calarElSec(el, rol) {
    const caliyordu = calar.durum === 'caliyor';
    if (caliyordu) calarDuraklat();
    calar.eller[el] = rol;
    // Öğren'de bir eli kullanıcı çalmalı: kullanıcı elini bırakınca öbür el ona geçer (yoksa seçim geri alınır)
    if (calar.mod === 'ogren' && !calar.cizelge.eller.some(e => calar.eller[e] === 'ben')) {
      const obur = calar.cizelge.eller.find(e => e !== el);
      calar.eller[obur || el] = 'ben';
    }
    calarAdimlariKur();
    calar.adim = Math.max(0, calar.adimlar.findIndex(a => a.t >= calar.konum));
    if (caliyordu) calarBasla();
    calarArayuzGuncelle();
  }

  function calarBasla() {
    if (!calar.parca || calar.durum === 'caliyor') return;
    if (!ensureWind()) return;
    const c = calar.cizelge;
    if (calar.durum === 'bitti' || calar.konum >= c.toplam) { calar.konum = 0; calar.yanlis = 0; }
    calar.durum = 'caliyor';
    // Baştan başlarken ya da bir bölüme atlanınca o bölümün registrasyonu uygulanır; duraklatıp sürdürünce dokunulmaz.
    calar.yeniBaslangic = calar.kayitZorla || calar.konum === 0;
    calar.kayitZorla = false;
    clearInterval(calar.dongu_id);
    calar.dongu_id = setInterval(calarZamanla, ARALIK_MS);
    if (calar.mod === 'dinle') {
      calar.basTik = calar.konum;
      calar.t0 = ctx.currentTime + 0.12 - calarSaniye(calar.konum);
      calar.sira = 0;
      calar.bolumNo = c.bolumler.findIndex(b => calar.konum < b.bit) - 1;
      if (calar.bolumNo < -1) calar.bolumNo = c.bolumler.length - 2;
      calarZamanla();
    } else {
      if (calar.yeniBaslangic) calar.gorunenBolum = -1;
      let no = calar.adimlar.findIndex(a => a.t >= calar.konum);
      if (no < 0) no = calar.adimlar.length;
      // İlk adımdan önce öbür elin çaldığı bir giriş varsa onu çal
      const ilkTik = no < calar.adimlar.length ? calar.adimlar[no].t : c.toplam;
      if (ilkTik > calar.konum) calarAraligiCal(calar.konum, ilkTik);
      calarAdimaGec(no);
    }
    calarArayuzGuncelle();
  }

  function calarDuraklat() {
    if (calar.durum !== 'caliyor') return;
    if (calar.mod === 'dinle') calar.konum = calarTik(ctx.currentTime);
    clearInterval(calar.dongu_id);
    clearTimeout(calar.bitisSayaci);
    calarSesleriKes();
    calar.durum = 'durakladi';
    calarArayuzGuncelle();
  }

  function calarDurdur() {
    clearInterval(calar.dongu_id);
    clearTimeout(calar.bitisSayaci);
    calarSesleriKes();
    calar.durum = calar.parca ? 'hazir' : 'bos';
    calar.konum = 0;
    calar.yanlis = 0;
    calar.adim = 0;
    calarArayuzGuncelle();
  }

  function calarKonumaGit(tik) {
    const caliyordu = calar.durum === 'caliyor';
    if (caliyordu) calarDuraklat();
    calar.konum = clamp(tik, 0, calar.cizelge.toplam);
    calar.kayitZorla = true;
    calar.adim = Math.max(0, calar.adimlar.findIndex(a => a.t >= calar.konum));
    if (calar.durum === 'bitti') calar.durum = 'durakladi';
    if (caliyordu) calarBasla();
    calarArayuzGuncelle();
  }

  function calarHizAyarla(yuzde) {
    const caliyordu = calar.durum === 'caliyor' && calar.mod === 'dinle';
    if (caliyordu) calarDuraklat();
    calar.hiz = yuzde;
    if (caliyordu) calarBasla();
    calarArayuzGuncelle();
  }

  function calarKapat() {
    calarDurdur();
    calar.parca = null;
    calar.cizelge = null;
    calar.durum = 'bos';
    adresiTemizle();
    calarArayuzGuncelle();
  }

