  /* ================= Parçalar ================= */
  // Parça verisi parcalar/*.json dosyalarından derleme sırasında gömülür (araclar/derle.py).
  const PARCALAR =
/*@parcalar*/
  ;
  const PARCA_BY_ID = Object.fromEntries(PARCALAR.map(p => [p.id, p]));
  const TPQ = 960; // dörtlük başına tik
  const NOTA_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  function notaMidi(ad) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(ad);
    if (!m) throw new Error('nota adı anlaşılmadı: ' + ad);
    return 12 * (Number(m[3]) + 1) + NOTA_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }

  // "3/2", ".5", "2" → sayı
  function sureCarpani(metin) {
    if (!metin) return 1;
    const kesir = metin.split('/');
    return kesir.length === 2 ? Number(kesir[0]) / Number(kesir[1]) : Number(metin);
  }

  // Bir elin satırlarını olaylara çevirir: [{ t, d, notalar }] (tik; t bölüm başından)
  function dizgileriCoz(satirlar, birimTik) {
    const olaylar = [];
    let t = 0, son = null;
    for (const satir of satirlar) {
      for (const p of satir.split(/\s+/)) {
        if (!p || p === '|') continue;
        const iki = p.indexOf(':');
        const ad = iki < 0 ? p : p.slice(0, iki);
        const d = Math.round(sureCarpani(iki < 0 ? '' : p.slice(iki + 1)) * birimTik);
        if (ad === 'r') son = null;
        else if (ad === '~') { if (son) son.d += d; }
        else { son = { t, d, notalar: ad.split('+').map(notaMidi).sort((a, b) => a - b) }; olaylar.push(son); }
        t += d;
      }
    }
    return { olaylar, sure: t };
  }

  const cizelgeOnbellegi = new Map();

  // Çalma sırasına göre açılmış zaman çizelgesi.
  //   olaylar: [{ t, d, notalar, el, sira }] (t: parça başından tik), bolumler: [{ kimlik, ad, bas, bit, piston, oktav, tempo }]
  function parcaCizelgesi(parca) {
    if (cizelgeOnbellegi.has(parca.id)) return cizelgeOnbellegi.get(parca.id);
    const [pay, payda] = parca.birim.split('/').map(Number);
    const birimTik = TPQ * 4 * pay / payda;
    const cozulmus = {};
    for (const [kimlik, b] of Object.entries(parca.bolumler)) {
      const eller = {};
      let sure = 0;
      for (const el of ['sag', 'sol']) if (b[el]) { eller[el] = dizgileriCoz(b[el], birimTik); sure = eller[el].sure; }
      cozulmus[kimlik] = { eller, sure };
    }
    const olaylar = [], bolumler = [];
    let t = 0;
    parca.sira.forEach((kimlik, sira) => {
      const b = cozulmus[kimlik];
      for (const [el, { olaylar: liste }] of Object.entries(b.eller)) {
        for (const o of liste) olaylar.push({ t: t + o.t, d: o.d, notalar: o.notalar, el, sira });
      }
      bolumler.push({
        kimlik, ad: parca.bolumler[kimlik].ad || kimlik, bas: t, bit: t + b.sure,
        piston: (parca.bolumPiston && parca.bolumPiston[kimlik]) || parca.piston,
        oktav: (parca.bolumOktav && parca.bolumOktav[kimlik]) || parca.oktav,
        tempo: parca.tempo * ((parca.bolumTempo && parca.bolumTempo[kimlik]) || 1),
      });
      t += b.sure;
    });
    olaylar.sort((a, b) => a.t - b.t || (a.el < b.el ? -1 : a.el > b.el ? 1 : 0));
    const eller = ['sag', 'sol'].filter(el => olaylar.some(o => o.el === el));
    const c = { olaylar, bolumler, toplam: t, eller };
    cizelgeOnbellegi.set(parca.id, c);
    return c;
  }

  // Sallanan sekizlikler: vuruşun ortası, vuruşun `swing` kesrine kayar (0.5 = düz).
  function swingTik(tik, swing) {
    if (!swing || swing === 0.5) return tik;
    const vurus = Math.floor(tik / TPQ), k = (tik - vurus * TPQ) / TPQ;
    const kaymis = k < 0.5 ? k * 2 * swing : swing + (k - 0.5) * 2 * (1 - swing);
    return (vurus + kaymis) * TPQ;
  }

  // Parçanın başından `tik` anına kadar geçen süre (saniye), hız çarpanı 1 iken.
  function parcaSaniyesi(parca, cizelge, tik) {
    let sn = 0;
    for (const b of cizelge.bolumler) {
      if (tik <= b.bas) break;
      const son = Math.min(tik, b.bit);
      sn += (swingTik(son, parca.swing) - swingTik(b.bas, parca.swing)) / TPQ * 60 / b.tempo;
    }
    return sn;
  }

  // Notanın basılacağı klavye tuşu (kod). Sol el alt sırayı, sağ el üst sırayı yeğler.
  function notaTusu(parca, midi, el, oktav) {
    const fark = midi - 12 * (oktav + 1);
    const altta = fark >= 0 && fark < LOWER_ROW.length, ustte = fark >= 12 && fark < 12 + UPPER_ROW.length;
    if (!altta && !ustte) return null;
    if (altta && ustte) {
      const altTercih = el === 'sol' || (parca.sagAltSinir && midi <= notaMidi(parca.sagAltSinir));
      return altTercih ? LOWER_ROW[fark] : UPPER_ROW[fark - 12];
    }
    return altta ? LOWER_ROW[fark] : UPPER_ROW[fark - 12];
  }

