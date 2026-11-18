  /* ================= Manuel (ekran klavyesi) ================= */
  const manual = $('#manual');
  const keyEls = [];
  const US_LABELS = { Comma: ',', Period: '.', Semicolon: ';', Slash: '/', BracketLeft: '[', BracketRight: ']', Equal: '=' };
  const TRQ_LABELS = { Comma: 'Ö', Period: 'Ç', Semicolon: 'Ş', Slash: '.', BracketLeft: 'Ğ', BracketRight: 'Ü', Equal: '-' };
  const isTurkish = (navigator.languages || [navigator.language || '']).some(l => /^tr\b/i.test(l));
  const labels = {};
  for (const code of CODE_TO_OFFSET.keys()) {
    labels[code] = code.startsWith('Key') ? code.slice(3)
      : code.startsWith('Digit') ? code.slice(5)
      : (isTurkish ? TRQ_LABELS : US_LABELS)[code];
  }
  const BEYAZ_TUS = [...Array(SPAN).keys()].filter(o => !BLACK_PCS.has(o % 12)); // beyaz tuşların ofsetleri
  const WN = BEYAZ_TUS.length;

  function buildManual() {
    let wi = 0;
    for (let off = 0; off < SPAN; off++) {
      const black = BLACK_PCS.has(off % 12);
      const k = document.createElement('div');
      k.className = 'key ' + (black ? 'black' : 'white');
      k.dataset.off = off;
      k.style.left = (wi / WN * 100) + '%';
      k.style.width = (100 / WN * (black ? 0.62 : 1)) + '%';
      if (!black) wi++;
      if (!black) {
        // Do tuşlarında nota adı hep yazar; öbür beyaz tuşlarda yalnızca telefon görünümünde
        const n = document.createElement('span');
        n.className = off % 12 === 0 ? 'note' : 'note ad';
        if (off % 12) n.textContent = SOLFEJ[off % 12];
        k.appendChild(n);
      }
      const lab = document.createElement('span');
      lab.className = 'labels';
      for (const code of OFFSET_CODES[off]) {
        const c = document.createElement('span');
        c.className = 'cap';
        c.dataset.code = code;
        lab.appendChild(c);
      }
      k.appendChild(lab);
      manual.appendChild(k);
      keyEls[off] = k;
    }
  }

  function renderCaps() {
    manual.querySelectorAll('.cap').forEach(c => { c.textContent = labels[c.dataset.code]; });
    const fill = (host, row) => {
      host.textContent = '';
      row.forEach(code => {
        const k = document.createElement('kbd');
        k.textContent = labels[code];
        host.appendChild(k);
      });
    };
    fill($('#rowLower'), LOWER_ROW);
    fill($('#rowUpper'), UPPER_ROW);
  }

  function renderOctave() {
    const base = baseMidi();
    keyEls.forEach((k, off) => {
      if (off % 12 === 0) k.querySelector('.note').textContent = noteName(base + off);
    });
    $('#octOut').textContent = `${noteName(base)} – ${noteName(base + SPAN - 1)}`;
    $('#octDown').disabled = settings.octave <= 1;
    $('#octUp').disabled = settings.octave >= 5;
    pencereCiz();
  }

  async function readLayout() {
    try {
      if (!navigator.keyboard || !navigator.keyboard.getLayoutMap) return;
      const map = await navigator.keyboard.getLayoutMap();
      for (const code of CODE_TO_OFFSET.keys()) {
        const ch = map.get(code);
        if (ch) labels[code] = ch.toLocaleUpperCase(isTurkish ? 'tr' : undefined);
      }
      renderCaps();
    } catch (_) {}
  }

  function setOctave(n) { shiftOctave(n - settings.octave); }

  function shiftOctave(d) {
    const n = clamp(settings.octave + d, 1, 5);
    if (n === settings.octave) return;
    settings.octave = n;
    renderOctave();
    refreshView();
    save();
  }

  /* ---- Telefon: pencereli klavye ----
     Dar bir dokunmatik ekranda 32 tuş sığmaz, tuşlar parmaktan ince kalır. Bu durumda klavye ekranın
     altına sabitlenir ve bir pencere gösterir: beyaz tuşlar en az TUS_EN_AZ piksel. ‹ › pencereyi bir
     oktav kaydırır; manuelin kenarına gelince oktav ayarı değişir, böylece bütün oktavlar gezilebilir.
     Konumlar "beyaz tuş" biriminde ve mutlaktır: Do(-1) = 0, Do4 = 35. */
  const TUS_EN_AZ = 46;
  const BEYAZ_PC = [0, null, 1, null, 2, 3, null, 4, null, 5, null, 6];
  const KARA_MERKEZ = [null, 1, null, 2, null, null, 4, null, 5, null, 6, null];
  const KARA_YARIM = 0.31; // kara tuş, beyaz tuş genişliğinin 0,62'si
  const pencere = { acik: false, gorunen: WN, bas: 0, hedef: '' }; // bas: penceredeki ilk beyaz tuşun manueldeki sırası

  function beyazAraligi(m) {
    const o = Math.floor(m / 12) * 7, pc = ((m % 12) + 12) % 12;
    if (BEYAZ_PC[pc] !== null) return [o + BEYAZ_PC[pc], o + BEYAZ_PC[pc] + 1];
    return [o + KARA_MERKEZ[pc] - KARA_YARIM, o + KARA_MERKEZ[pc] + KARA_YARIM];
  }
  const pencereSolu = () => 7 * (settings.octave + 1) + pencere.bas;

  function pencereCiz() {
    if (!pencere.acik) { manual.style.width = ''; manual.style.transform = ''; return; }
    const v = pencere.gorunen, b = pencere.bas, base = baseMidi();
    manual.style.width = (WN / v * 100) + '%';
    manual.style.transform = b ? `translateX(${(-b / WN * 100).toFixed(4)}%)` : '';
    $('#pencereOut').textContent = `${noteName(base + BEYAZ_TUS[b])} – ${noteName(base + BEYAZ_TUS[b + v - 1])}`;
    $('#pencereSol').disabled = settings.octave <= 1 && b === 0;
    $('#pencereSag').disabled = settings.octave >= 5 && b === WN - v;
  }

  // Penceredeki ilk beyaz tuşu mutlak `sol` konumuna en yakın getirir; gerekirse oktav ayarını değiştirir.
  function pencereyeYerles(sol) {
    const v = pencere.gorunen;
    let enIyi = null;
    for (let o = 1; o <= 5; o++) {
      const b = clamp(Math.round(sol) - 7 * (o + 1), 0, WN - v);
      const bedel = Math.abs(7 * (o + 1) + b - sol) * 100 + Math.abs(o - settings.octave);
      if (!enIyi || bedel < enIyi.bedel) enIyi = { o, b, bedel };
    }
    pencere.bas = enIyi.b;
    if (enIyi.o !== settings.octave) setOctave(enIyi.o); // renderOctave pencereyi de çizer
    else pencereCiz();
  }

  function pencereKaydir(yon) { if (pencere.acik) pencereyeYerles(pencereSolu() + 7 * yon); }

  // Nota gruplarını (sırayla çalınacak akorlar) gösterir. İlk grup zaten görünüyorsa pencere kıpırdamaz
  // (zorla değilse); görünmüyorsa pencere, ilk gruptan başlayarak sığabildiği kadar grubu ortalar.
  function pencereNotalaraGetir(gruplar, zorla) {
    if (!pencere.acik || !gruplar.length || !gruplar[0].length) return;
    const v = pencere.gorunen;
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < gruplar.length; i++) {
      let a = lo, b = hi;
      for (const m of gruplar[i]) { const [x, y] = beyazAraligi(m); a = Math.min(a, x); b = Math.max(b, y); }
      if (i === 0) {
        const sol = pencereSolu();
        if (!zorla && a >= sol - 1e-6 && b <= sol + v + 1e-6) return;
      } else if (b - a > v) break;
      lo = a; hi = b;
    }
    pencereyeYerles((lo + hi) / 2 - v / 2);
  }

  // Öğren ve eşlikte yanan (çalınması beklenen) tuşlar pencerenin dışındaysa pencere onlara kayar.
  function pencereHedefeGetir() {
    if (!pencere.acik || !targets.size) { pencere.hedef = ''; return; }
    const notalar = [...targets.keys()].sort((a, b) => a - b);
    const anahtar = notalar.join(',');
    if (anahtar === pencere.hedef) return;
    pencere.hedef = anahtar;
    pencereNotalaraGetir([notalar, ...calarIleriNotalar()]);
  }

  function dokYuksekligi() {
    const h = pencere.acik ? Math.ceil($('.manual-wrap').getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--dok-h', h + 'px');
  }

  // Ekran boyutu ya da işaretçi değişince pencereli görünümü açar, kapatır ve yeniden ölçer.
  function pencereKur() {
    const ac = kalinIsaretci.matches && window.innerWidth < 1000;
    // Pencere açılırken Do4'ten başlar (orta Do); açıkken ölçü değişirse kullanıcının yeri korunur
    const sol = pencere.acik ? pencereSolu() : 35;
    if (ac !== pencere.acik) {
      pencere.acik = ac;
      document.documentElement.classList.toggle('pencereli', ac);
    }
    if (ac) {
      pencere.gorunen = clamp(Math.floor($('#manualKutu').clientWidth / TUS_EN_AZ), 7, WN);
      pencereyeYerles(sol);
    } else pencereCiz();
    dokYuksekligi();
  }
