  /* ================= Metronom ================= */
  // Serbest çalarken kendi temposunda ve ölçüsünde vurur. Şarkı çalar Dinle'de çalarken parçanın vuruşlarına geçer:
  // vuruşlar notalarla aynı döngüde zamanlanır (calarZamanla), hız, bölüm temposu ve yineleme kendiliğinden uyar.
  // Ölçünün ilk vuruşu vurguludur. Tık sesi orgun yankısından ve kaydından geçmez, doğrudan hoparlöre gider.
  const metronom = {
    acik: false,
    sonraki: 0, vurus: 0, zamanlayici: 0,  // serbest vuruşun zamanlaması
    cikis: null, isiklar: new Set(),
    gunluk: null,                           // testler için: zamanlanan vuruşlar [{ zaman, vurgu, kaynak }]
  };
  const METRONOM_UFUK = 0.12;

  const metronomParcadaMi = () => calar.durum === 'caliyor' && calar.mod === 'dinle';

  function metronomTik(zaman, vurgu, kaynak) {
    if (metronom.gunluk) metronom.gunluk.push({ zaman, vurgu, kaynak });
    if (!metronom.cikis) { metronom.cikis = ctx.createGain(); metronom.cikis.connect(ctx.destination); }
    const vol = settings.volume / 100;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = vurgu ? 1760 : 1175;
    g.gain.setValueAtTime(0, zaman);
    g.gain.linearRampToValueAtTime((vurgu ? 0.9 : 0.6) * vol * vol, zaman + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0005, zaman + 0.06);
    o.connect(g); g.connect(metronom.cikis);
    o.start(zaman); o.stop(zaman + 0.07);
    // Göz için: vuruşta yanan ışık
    const isik = $('#metronomIsik');
    const yak = setTimeout(() => {
      metronom.isiklar.delete(yak);
      isik.className = 'metronom-isik ' + (vurgu ? 'vurgu' : 'vur');
      const son = setTimeout(() => { metronom.isiklar.delete(son); isik.className = 'metronom-isik'; }, 90);
      metronom.isiklar.add(son);
    }, Math.max(0, (zaman - ctx.currentTime) * 1000));
    metronom.isiklar.add(yak);
  }

  // Serbest vuruş: parça çalmıyorken
  function metronomZamanla() {
    if (!metronom.acik || !ctx) return;
    if (metronomParcadaMi()) { metronom.sonraki = 0; return; }
    const simdi = ctx.currentTime;
    if (!metronom.sonraki || metronom.sonraki < simdi - 0.05) { metronom.sonraki = simdi + 0.05; metronom.vurus = 0; }
    const { tempo, olcu } = settings.metronom;
    while (metronom.sonraki < simdi + METRONOM_UFUK) {
      metronomTik(metronom.sonraki, olcu > 0 && metronom.vurus % olcu === 0, 'serbest');
      metronom.vurus++;
      metronom.sonraki += 60 / tempo;
    }
  }

  function metronomAc(acik) {
    if (acik && !ensureWind()) return;
    metronom.acik = acik;
    clearInterval(metronom.zamanlayici);
    metronom.sonraki = 0;
    if (acik) {
      metronom.zamanlayici = setInterval(metronomZamanla, 25);
      metronomZamanla();
    } else {
      // Önceden zamanlanmış tıkları da sustur
      if (metronom.cikis) { try { metronom.cikis.disconnect(); } catch (_) {} metronom.cikis = null; }
      for (const id of metronom.isiklar) clearTimeout(id);
      metronom.isiklar.clear();
      $('#metronomIsik').className = 'metronom-isik';
    }
    metronomArayuzGuncelle();
  }

  function metronomArayuzGuncelle() {
    $('#metronomBtn').setAttribute('aria-pressed', String(metronom.acik));
    const parcada = metronom.acik && metronomParcadaMi();
    $('#metronomTempo').disabled = parcada;
    $('#metronomOlcu').disabled = parcada;
    $('#metronomDurum').textContent = parcada ? t('parçanın vuruşunda') : '';
  }

  function metronomKur() {
    const tempo = $('#metronomTempo'), olcu = $('#metronomOlcu');
    tempo.value = settings.metronom.tempo;
    olcu.value = String(settings.metronom.olcu);
    $('#metronomBtn').addEventListener('click', () => metronomAc(!metronom.acik));
    // Yazarken geçerli her değer hemen uygulanır; alandan çıkınca sınırlara oturtulur
    tempo.addEventListener('input', () => {
      const v = Number(tempo.value);
      if (Number.isFinite(v) && v >= 30 && v <= 240) { settings.metronom.tempo = Math.round(v); save(); }
    });
    tempo.addEventListener('change', () => {
      const v = Math.round(Number(tempo.value));
      if (tempo.value !== '' && Number.isFinite(v)) settings.metronom.tempo = clamp(v, 30, 240);
      tempo.value = settings.metronom.tempo;
      save();
    });
    olcu.addEventListener('change', () => {
      settings.metronom.olcu = Number(olcu.value);
      metronom.vurus = 0; // yeni ölçü vurguyla başlasın
      save();
    });
    metronomArayuzGuncelle();
  }
