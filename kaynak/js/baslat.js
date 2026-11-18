  /* ================= Başlat ================= */
  buildStops();
  buildPistons();
  buildManual();
  renderCaps();
  renderOctave();
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
