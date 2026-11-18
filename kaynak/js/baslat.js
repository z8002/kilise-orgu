  /* ================= Başlat ================= */
  buildStops();
  buildPistons();
  buildManual();
  renderCaps();
  renderOctave();
  pencereKur();
  updatePistons();
  refreshView();
  updateFocusHint();
  readLayout();
  listeKur();
  calarOlaylariBagla();
  calarArayuzGuncelle();
  calarAdrestenYukle();

  let resizeRaf = 0;
  const relayout = () => { cancelAnimationFrame(resizeRaf); resizeRaf = requestAnimationFrame(layoutFacade); };
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(fac.el);
  else window.addEventListener('resize', relayout);
  layoutFacade();

  // Telefon döndürülünce ya da pencere daralınca klavye penceresi yeniden ölçülür
  let pencereRaf = 0;
  const pencereyiYenile = () => { cancelAnimationFrame(pencereRaf); pencereRaf = requestAnimationFrame(pencereKur); };
  window.addEventListener('resize', pencereyiYenile);
  if (kalinIsaretci.addEventListener) kalinIsaretci.addEventListener('change', pencereyiYenile);
  if (window.ResizeObserver) new ResizeObserver(dokYuksekligi).observe($('.manual-wrap'));

  // Yan tutuşta tam ekran: tarayıcının çubukları klavyeden yer çalmasın (iPhone Safari desteklemez, düğme çıkmaz)
  const tamEkranBtn = $('#tamEkran');
  if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
    tamEkranBtn.hidden = false;
    tamEkranBtn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    });
    document.addEventListener('fullscreenchange', () => {
      const acik = !!document.fullscreenElement;
      tamEkranBtn.setAttribute('aria-pressed', String(acik));
      tamEkranBtn.textContent = acik ? 'Küçült' : 'Tam ekran';
    });
  }

  /* ---- Ana ekrana ekleme ve internetsiz çalışma ----
     Yalnızca sayfa bir sunucudan açılınca: diskten (file://) açılan sayfada ikisi de olmaz. */
  if (/^https?:$/.test(location.protocol)) {
    const bag = document.createElement('link');
    bag.rel = 'manifest';
    bag.href = 'manifest.webmanifest';
    document.head.appendChild(bag);
    const guvenli = location.protocol === 'https:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (guvenli && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(() => navigator.serviceWorker.ready).then(kayit => {
        // İlk açılışta yazı tipleri hizmet çalışanından önce indi: internetsiz de görünsünler diye saklatılır
        const yazilar = performance.getEntriesByType('resource').map(e => e.name).filter(u => /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(u));
        if (kayit.active && yazilar.length) kayit.active.postMessage({ tur: 'yazi-tipleri', adresler: yazilar });
      }).catch(() => {});
    }
  }

  // Tarayıcı uygulama olarak yüklemeyi önerirse "Ana ekrana ekle" düğmesi görünür (Android'de Chrome, masaüstünde Chrome ve Edge)
  let yuklemeIstemi = null;
  const yukleBtn = $('#yukleBtn');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    yuklemeIstemi = e;
    yukleBtn.hidden = false;
  });
  yukleBtn.addEventListener('click', async () => {
    if (!yuklemeIstemi) return;
    const istem = yuklemeIstemi;
    yuklemeIstemi = null;
    yukleBtn.hidden = true;
    try { await istem.prompt(); } catch (_) {}
  });
  window.addEventListener('appinstalled', () => { yuklemeIstemi = null; yukleBtn.hidden = true; });
