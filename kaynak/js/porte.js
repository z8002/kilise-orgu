  /* ================= Porte (nota görünümü) ================= */
  // Açık parçanın notaları çift portede (sağ el sol anahtarı, sol el fa anahtarı). Yatay eksen zamandır
  // (orantılı yazım): her nota başlangıç anında durur, ardındaki ince çizgi süresini gösterir; nota başı,
  // sap, bayrak ve nokta süreyi alışılmış biçimde de yazar. Donanım (diyez/bemol) parçanın tonundan,
  // değiştirici işaretler ölçü içinde bir kez yazılır. Çalarken notalar sola akar, imleç yerinde kalır.
  const ARALIK = 8; // porte çizgileri arası, piksel
  const SOL_ANAHTARI = { ust: 38, adi: '𝄞' }; // en üst çizgi Fa5 (diyatonik basamak: oktav × 7 + harf)
  const FA_ANAHTARI = { ust: 26, adi: '𝄢' };  // en üst çizgi La3
  const HARF_PC = [0, 2, 4, 5, 7, 9, 11];
  const DIYEZ_SIRASI = [3, 0, 4, 1, 5, 2, 6], BEMOL_SIRASI = [6, 2, 5, 1, 4, 0, 3]; // Fa Do Sol Re La Mi Si
  const porte = { hazir: false, sol: 0, pxT: 0, olaylar: [], dugumler: [], vurgulu: new Map(), maxD: 0, gGenislik: 0 };

  // "Si♭ majör" → { donanim: −2 (iki bemol), tonik: 10, minor }
  function tonBilgisi(ton) {
    const m = /^(Do|Re|Mi|Fa|Sol|La|Si)([♯♭]?)\s+(majör|minör)/.exec(ton || '');
    if (!m) return { donanim: 0, tonik: 0, minor: false };
    const tonik = (HARF_PC[['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'].indexOf(m[1])] + (m[2] === '♯' ? 1 : m[2] === '♭' ? 11 : 0)) % 12;
    const minor = m[3] === 'minör';
    const majorTonik = minor ? (tonik + 3) % 12 : tonik;
    const DONANIM = { 0: 0, 7: 1, 2: 2, 9: 3, 4: 4, 11: 5, 6: 6, 5: -1, 10: -2, 3: -3, 8: -4, 1: -5 };
    return { donanim: DONANIM[majorTonik], tonik, minor };
  }

  // MIDI notasının yazımı: { harf (0 = Do … 6 = Si), oktav, deg (+1 diyez, −1 bemol, 0) }
  function yazim(m, ton) {
    const pc = ((m % 12) + 12) % 12, oktav = Math.floor(m / 12) - 1;
    const dogal = HARF_PC.indexOf(pc);
    if (dogal >= 0) return { harf: dogal, oktav, deg: 0 };
    // Siyah tuş: diyezli tonlarda diyez, bemollü tonlarda bemol; minör tonun yeden sesi hep diyez (Re minörde Do♯)
    const diyez = ton.donanim >= 0 || (ton.minor && pc === (ton.tonik + 11) % 12);
    if (diyez) return { harf: HARF_PC.indexOf(pc - 1), oktav, deg: 1 };
    const ust = (pc + 1) % 12;
    return { harf: HARF_PC.indexOf(ust), oktav: ust === 0 ? oktav + 1 : oktav, deg: -1 };
  }

  function donanimDegeri(ton, harf) {
    if (ton.donanim > 0 && DIYEZ_SIRASI.slice(0, ton.donanim).includes(harf)) return 1;
    if (ton.donanim < 0 && BEMOL_SIRASI.slice(0, -ton.donanim).includes(harf)) return -1;
    return 0;
  }

  // Ölçü çizgileri: her bölümün başında ve bölüm içinde ölçü uzunluğunda. İlk bölümün uzunluğu ölçünün katı
  // değilse artan kısım baştaki ön vuruş sayılır (ezgilerin çoğu böyle başlar); öbür bölümlerde artan kısım sonda kalır.
  function olcuCizgileri(parca, c) {
    const [pay, payda] = parca.olcu.split('/').map(Number);
    const olcu = TPQ * 4 * pay / payda, cizgiler = new Set();
    c.bolumler.forEach((b, i) => {
      if (b.bas > 0) cizgiler.add(b.bas);
      const onVurus = i === 0 ? (b.bit - b.bas) % olcu : 0;
      for (let t = b.bas + (onVurus || olcu); t < b.bit - 1; t += olcu) cizgiler.add(t);
    });
    return [...cizgiler].sort((a, b) => a - b);
  }

  const portedeY = (ust, basamak, anahtar) => ust + (anahtar.ust - basamak) * ARALIK / 2;

  function porteKur() {
    porte.hazir = false;
    const svg = $('#porte');
    svg.textContent = '';
    if (!calar.parca || !settings.porte) return;
    const p = calar.parca, c = calar.cizelge, ton = tonBilgisi(p.ton);
    const eller = c.eller; // ['sag'], ['sol'] ya da ikisi
    const anahtarlar = { sag: SOL_ANAHTARI, sol: FA_ANAHTARI };
    // Portelerin yeri: sağ el üstte
    const ustler = {};
    let y = 30;
    for (const el of ['sag', 'sol']) if (eller.includes(el)) { ustler[el] = y; y += 4 * ARALIK + 50; }
    const yukseklik = y - 20;
    // En kısa notaya göre ölçek: notalar birbirine binmesin
    const enKisa = Math.min(...c.olaylar.map(o => o.d).filter(d => d > 0), TPQ);
    porte.pxT = Math.max(44, 24 * TPQ / enKisa) / TPQ;
    const donanimSayi = Math.abs(ton.donanim);
    porte.sol = 64 + donanimSayi * 9 + 38; // ilk notanın değiştirici işaretine de yer kalsın
    porte.olaylar = c.olaylar;
    porte.maxD = Math.max(...c.olaylar.map(o => o.d), 1);
    const x = t => porte.sol + t * porte.pxT;
    const parcalar = [];

    // Akan katman: ölçü çizgileri ve notalar
    const cizgiler = olcuCizgileri(p, c);
    for (const t of cizgiler) for (const el of eller) parcalar.push(`<line class="porte-olcu" x1="${x(t) - 6}" x2="${x(t) - 6}" y1="${ustler[el]}" y2="${ustler[el] + 4 * ARALIK}"/>`);
    const durum = { sag: new Map(), sol: new Map() };
    let olcuNo = { sag: -1, sol: -1 };
    c.olaylar.forEach((o, i) => {
      const el = o.el, an = anahtarlar[el], ust = ustler[el];
      // Ölçü değişince değiştirici işaretler sıfırlanır
      let no = 0;
      while (no < cizgiler.length && cizgiler[no] <= o.t) no++;
      if (no !== olcuNo[el]) { olcuNo[el] = no; durum[el].clear(); }
      const nx = x(o.t), basliklar = [];
      const notalar = o.notalar.map(m => ({ m, ...yazim(m, ton) })).map(n => ({ ...n, basamak: n.oktav * 7 + n.harf }));
      const ortaBasamak = an.ust - 4;
      const ortalama = notalar.reduce((s, n) => s + n.basamak, 0) / notalar.length;
      const asagi = ortalama >= ortaBasamak; // sap aşağı
      const q = o.d / TPQ;
      const temel = q >= 4 ? 4 : q >= 2 ? 2 : q >= 1 ? 1 : q >= 0.5 ? 0.5 : q >= 0.25 ? 0.25 : 0.125;
      const noktali = q >= temel * 1.5 - 1e-6 && temel < 4;
      const acik = temel >= 2;
      let enUst = -Infinity, enAlt = Infinity;
      for (const n of notalar) {
        const ny = portedeY(ust, n.basamak, an);
        enUst = Math.max(enUst, n.basamak); enAlt = Math.min(enAlt, n.basamak);
        // Ek çizgiler
        for (let b = an.ust + 2; b <= n.basamak; b += 2) basliklar.push(`<line class="porte-ek" x1="${nx - 8}" x2="${nx + 8}" y1="${portedeY(ust, b, an)}" y2="${portedeY(ust, b, an)}"/>`);
        for (let b = an.ust - 10; b >= n.basamak; b -= 2) basliklar.push(`<line class="porte-ek" x1="${nx - 8}" x2="${nx + 8}" y1="${portedeY(ust, b, an)}" y2="${portedeY(ust, b, an)}"/>`);
        // Değiştirici işaret: ölçüde o anki değerden farklıysa
        const anahtar = n.harf + ':' + n.oktav;
        const simdiki = durum[el].has(anahtar) ? durum[el].get(anahtar) : donanimDegeri(ton, n.harf);
        if (simdiki !== n.deg) {
          basliklar.push(`<text class="porte-isaret" x="${nx - 15}" y="${ny + 4}">${n.deg > 0 ? '♯' : n.deg < 0 ? '♭' : '♮'}</text>`);
          durum[el].set(anahtar, n.deg);
        }
        // Süre çizgisi ve nota başı
        basliklar.push(`<rect class="porte-sure" x="${nx}" y="${ny - 1}" width="${Math.max(0, o.d * porte.pxT - 6)}" height="2"/>`);
        basliklar.push(`<ellipse class="porte-bas${acik ? ' acik' : ''}" cx="${nx}" cy="${ny}" rx="5" ry="3.7" transform="rotate(-20 ${nx} ${ny})"/>`);
        if (noktali) basliklar.push(`<circle class="porte-nokta" cx="${nx + 9}" cy="${ny - (n.basamak % 2 === 0 ? ARALIK / 2 : 0)}" r="1.6"/>`);
      }
      if (temel < 4) {
        const sx = asagi ? nx - 4.6 : nx + 4.6;
        const y1 = portedeY(ust, asagi ? enUst : enAlt, an), y2 = portedeY(ust, asagi ? enAlt : enUst, an) + (asagi ? 1 : -1) * 3.5 * ARALIK;
        basliklar.push(`<line class="porte-sap" x1="${sx}" x2="${sx}" y1="${y1}" y2="${y2}"/>`);
        const bayrak = temel === 0.5 ? 1 : temel === 0.25 ? 2 : temel === 0.125 ? 3 : 0;
        for (let k = 0; k < bayrak; k++) {
          const by = y2 + (asagi ? -1 : 1) * k * 5;
          basliklar.push(`<path class="porte-bayrak" d="M${sx} ${by} q 7 ${asagi ? -4 : 4} 6 ${asagi ? -10 : 10}"/>`);
        }
      }
      parcalar.push(`<g class="porte-n" data-i="${i}">${basliklar.join('')}</g>`);
    });
    porte.gGenislik = x(c.toplam) + 20;

    // Sabit katman: anahtar, donanım, ölçü işareti (akan notaların üstünde, solda)
    const sabit = [], zemin = [];
    for (const el of eller) {
      const ust = ustler[el], an = anahtarlar[el];
      zemin.push(`<rect class="porte-zemin" x="0" y="${ust - 26}" width="${porte.sol - 8}" height="${4 * ARALIK + 52}"/>`);
      sabit.push(`<text class="porte-anahtar" x="6" y="${ust + (el === 'sag' ? 30 : 22)}">${an.adi}</text>`);
      // Donanımın alışılmış yerleri (sol anahtarında Fa5 Do5 Sol5 … / Si4 Mi5 La4 …; fa anahtarında iki oktav aşağı)
      const yerler = ton.donanim >= 0 ? [38, 35, 39, 36, 33, 37, 34] : [34, 37, 33, 36, 32, 35, 31];
      for (let k = 0; k < donanimSayi; k++) {
        const basamak = yerler[k] - (el === 'sag' ? 0 : 14);
        sabit.push(`<text class="porte-isaret donanim" x="${44 + k * 9}" y="${portedeY(ust, basamak, an) + 4}">${ton.donanim > 0 ? '♯' : '♭'}</text>`);
      }
      const [pay, payda] = p.olcu.split('/');
      const ox = 48 + donanimSayi * 9;
      sabit.push(`<text class="porte-olcu-sayi" x="${ox}" y="${ust + 14}">${pay}</text><text class="porte-olcu-sayi" x="${ox}" y="${ust + 30}">${payda}</text>`);
    }
    const cizgiler5 = eller.map(el => [0, 1, 2, 3, 4].map(k => `<line class="porte-cizgi" x1="0" x2="100%" y1="${ustler[el] + k * ARALIK}" y2="${ustler[el] + k * ARALIK}"/>`).join('')).join('');
    svg.setAttribute('height', yukseklik);
    // Sıra: akan notalar, onları soldan örten zemin, porte çizgileri, anahtar ve donanım, imleç
    svg.innerHTML = `<g id="porteAkan">${parcalar.join('')}</g>${zemin.join('')}${cizgiler5}${sabit.join('')}<line id="porteImlec" class="porte-imlec" x1="0" x2="0" y1="4" y2="${yukseklik - 4}"/>`;
    porte.dugumler = [...svg.querySelectorAll('.porte-n')];
    porte.akan = $('#porteAkan');
    porte.imlec = $('#porteImlec');
    porte.vurgulu = new Map();
    porte.hazir = true;
    porteGuncelle();
  }

  // İmleç ve vurgular: Dinle'de o an çalan notalar, Öğren'de sıradaki adım
  function porteGuncelle() {
    if (!porte.hazir || !calar.parca) return;
    const W = $('#porte').clientWidth || 600;
    const konum = calar.konum;
    const ix = porte.sol + konum * porte.pxT;
    const hedefX = porte.sol + 0.3 * (W - porte.sol);
    const kayma = Math.min(0, hedefX - ix);
    porte.akan.setAttribute('transform', `translate(${kayma.toFixed(1)} 0)`);
    // İmleç notanın biraz solunda durur ki nota başını örtmesin
    porte.imlec.setAttribute('x1', (ix + kayma - 10).toFixed(1));
    porte.imlec.setAttribute('x2', (ix + kayma - 10).toFixed(1));
    // Vurgulanacak olaylar: başlangıcı konumdan maxD öncesine kadar olanlar arasından
    const yeni = new Map();
    const o = porte.olaylar;
    let a = 0, b = o.length;
    while (a < b) { const m = (a + b) >> 1; if (o[m].t < konum - porte.maxD) a = m + 1; else b = m; }
    const ogren = calar.mod === 'ogren';
    const adim = ogren && calar.durum === 'caliyor' ? calar.adimlar[calar.adim] : null;
    for (let i = a; i < o.length && o[i].t <= konum; i++) {
      const e = o[i];
      if (ogren) { if (adim && e.t === adim.t && calar.eller[e.el] === 'ben') yeni.set(i, 'hedef'); }
      else if (calar.durum === 'caliyor' && e.t + e.d > konum) yeni.set(i, calar.eller[e.el] === 'ben' ? 'hedef' : 'calan');
    }
    for (const [i, s] of porte.vurgulu) if (yeni.get(i) !== s) porte.dugumler[i].classList.remove(s);
    for (const [i, s] of yeni) if (porte.vurgulu.get(i) !== s) porte.dugumler[i].classList.add(s);
    porte.vurgulu = yeni;
  }

  function porteGorunurlugu() {
    $('#porteKutu').hidden = !settings.porte;
    $('#porteBtn').setAttribute('aria-pressed', String(settings.porte));
  }

  function porteOlaylariBagla() {
    $('#porteBtn').addEventListener('click', () => {
      settings.porte = !settings.porte;
      save();
      porteGorunurlugu();
      porteKur();
    });
    window.addEventListener('resize', () => porteGuncelle());
    porteGorunurlugu();
  }
