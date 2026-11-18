  /* ================= Veri ================= */
  const SOLFEJ = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
  const BLACK_PCS = new Set([1, 3, 6, 8, 10]);
  const LOWER_ROW = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ', 'KeyM', 'Comma', 'KeyL', 'Period', 'Semicolon', 'Slash'];
  const UPPER_ROW = ['KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7', 'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight'];
  const SPAN = 32;
  const CODE_TO_OFFSET = new Map();
  LOWER_ROW.forEach((c, i) => CODE_TO_OFFSET.set(c, i));
  UPPER_ROW.forEach((c, i) => CODE_TO_OFFSET.set(c, i + 12));
  const OFFSET_CODES = Array.from({ length: SPAN }, () => []);
  UPPER_ROW.forEach((c, i) => OFFSET_CODES[i + 12].push(c));
  LOWER_ROW.forEach((c, i) => OFFSET_CODES[i].push(c));

  // Boru tipleri: harmonik genlikleri (1. harmonikten başlayarak)
  const WAVES = {
    principal: [1, 0.52, 0.34, 0.22, 0.15, 0.1, 0.07, 0.05, 0.035, 0.025, 0.018, 0.012, 0.008],
    stopped: [1, 0.035, 0.24, 0.02, 0.075, 0.01, 0.03, 0.005, 0.012],
    flute: [1, 0.16, 0.06, 0.03, 0.014, 0.007],
    string: Array.from({ length: 28 }, (_, i) => (i === 0 ? 0.55 : 0.75 / Math.pow(i + 1, 0.55))),
    reed: Array.from({ length: 36 }, (_, i) => {
      const n = i + 1;
      return n === 1 ? 0.6 : Math.min(1, 1.25 / Math.pow(n, 0.45)) * (n % 2 ? 1 : 0.88);
    }),
    // Bacalı flüt: kapalı borunun tek harmoniklerine bacadan gelen biraz çift harmonik
    rohr: [1, 0.12, 0.3, 0.06, 0.12, 0.02, 0.05, 0.01],
    // Obua: temel görece zayıf, 3.–6. harmonikler güçlü; ince, genizden
    oboe: Array.from({ length: 30 }, (_, i) => {
      const n = i + 1;
      return n === 1 ? 0.7 : Math.min(1, 0.75 * Math.exp(-Math.pow((n - 4) / 4, 2)) + 0.25 / n);
    }),
    // Vox humana: kısa rezonatör; tek harmonikler baskın, 3.–5. harmonikte "ünlü" tınısı
    vox: Array.from({ length: 24 }, (_, i) => {
      const n = i + 1;
      return (n === 1 ? 0.5 : 0.7 / Math.pow(n, 0.6)) * (n % 2 ? 1 : 0.35) * (n >= 3 && n <= 5 ? 1.6 : 1);
    }),
  };

  // mult: 8′ ayağa göre frekans çarpanı (16′ = 0.5, 4′ = 2, 2⅔′ = 3 …)
  const STOPS = [
    { id: 'burdon16', name: 'Burdon', foot: '16′', family: 'flue', jamb: 'temel', desc: 'Kapalı ahşap borular; bir oktav aşağıdan yumuşak, derin bir bas.', ranks: [{ mult: 0.5, wave: 'stopped', level: 0.62 }] },
    { id: 'prinsipal8', name: 'Prinsipal', foot: '8′', family: 'flue', jamb: 'temel', desc: 'Orgun omurgası: açık metal boruların dolgun ana sesi.', ranks: [{ mult: 1, wave: 'principal', level: 0.5 }] },
    { id: 'gedakt8', name: 'Gedakt', foot: '8′', family: 'flue', jamb: 'temel', desc: 'Kapalı flüt borusu; yuvarlak, sıcak ve hafif boğuk.', ranks: [{ mult: 1, wave: 'stopped', level: 0.5 }] },
    { id: 'gamba8', name: 'Gamba', foot: '8′', family: 'flue', jamb: 'temel', desc: 'Dar borulu yaylı ses; keman gibi tınılı.', ranks: [{ mult: 1, wave: 'string', level: 0.3 }] },
    { id: 'oktav4', name: 'Oktav', foot: '4′', family: 'flue', jamb: 'temel', desc: 'Prinsipalin bir oktav üstü; sese parlaklık katar.', ranks: [{ mult: 2, wave: 'principal', level: 0.34 }] },
    { id: 'flut4', name: 'Flüt', foot: '4′', family: 'flue', jamb: 'temel', desc: 'Açık flüt, bir oktav yukarıda; berrak ve tatlı.', ranks: [{ mult: 2, wave: 'flute', level: 0.34 }] },
    { id: 'celeste8', name: 'Voix\nCéleste', foot: '8′', family: 'flue', jamb: 'temel', desc: 'Hafif tiz akortlanmış yaylı; Gamba ile birlikte dalgalanır.', ranks: [{ mult: 1, wave: 'string', level: 0.27, cents: 7 }] },
    { id: 'nazard', name: 'Nazard', foot: '2⅔′', family: 'mutation', jamb: 'parlak', desc: 'Bir oktav ve beşli yukarıda flüt; genizden, renkli bir ton.', ranks: [{ mult: 3, wave: 'flute', level: 0.2 }] },
    { id: 'superoktav2', name: 'Süperoktav', foot: '2′', family: 'flue', jamb: 'parlak', desc: 'İki oktav yukarıda prinsipal; plenumun ışıltısı.', ranks: [{ mult: 4, wave: 'principal', level: 0.22 }] },
    { id: 'terz', name: 'Terz', foot: '1⅗′', family: 'mutation', jamb: 'parlak', desc: 'İki oktav ve üçlü yukarıda; kornet sesinin tuzu.', ranks: [{ mult: 5, wave: 'flute', level: 0.14 }] },
    { id: 'mikstur', name: 'Mikstür', foot: 'IV', family: 'mutation', jamb: 'parlak', desc: 'Dört sıra yüksek boru; kilise orgunun görkemli taç sesi.', ranks: [
      { mult: 6, wave: 'principal', level: 0.11, breaks: true },
      { mult: 8, wave: 'principal', level: 0.11, breaks: true },
      { mult: 12, wave: 'principal', level: 0.08, breaks: true },
      { mult: 16, wave: 'principal', level: 0.07, breaks: true },
    ] },
    { id: 'trompet8', name: 'Trompet', foot: '8′', family: 'reed', jamb: 'parlak', desc: 'Dilli boru; parlak, buyurgan bir tören sesi.', ranks: [{ mult: 1, wave: 'reed', level: 0.24 }] },
    { id: 'tremolo', name: 'Tremolo', foot: '', family: 'trem', jamb: 'parlak', effect: true, desc: 'Rüzgâr basıncını titreştirir; ses dalgalanır.', ranks: [] },

    // II. manuel: Sandık. Boruları panjurlu bir sandığın içinde; panjur kapanınca ses kısılır ve koyulaşır.
    { id: 'rohrflut8', name: 'Rohrflüt', foot: '8′', family: 'flue', jamb: 'sandik', bolum: 'II', desc: 'Bacalı kapalı flüt; Gedakt\'tan biraz parlak, şarkı söyler gibi.', ranks: [{ mult: 1, wave: 'rohr', level: 0.45 }] },
    { id: 'salisyonal8', name: 'Salisyonal', foot: '8′', family: 'flue', jamb: 'sandik', bolum: 'II', desc: 'İnce yaylı ses; Gamba\'dan yumuşak.', ranks: [{ mult: 1, wave: 'string', level: 0.22 }] },
    { id: 'undamaris8', name: 'Unda maris', foot: '8′', family: 'flue', jamb: 'sandik', bolum: 'II', desc: 'Hafif pes akortlanmış flüt; Rohrflüt\'le birlikte deniz dalgası gibi dalgalanır.', ranks: [{ mult: 1, wave: 'flute', level: 0.3, cents: -6 }] },
    { id: 'traversflut4', name: 'Travers flüt', foot: '4′', family: 'flue', jamb: 'sandik', bolum: 'II', desc: 'Yan flüt gibi açık, berrak ses; bir oktav yukarıda.', ranks: [{ mult: 2, wave: 'flute', level: 0.3 }] },
    { id: 'flajole2', name: 'Flajole', foot: '2′', family: 'flue', jamb: 'sandik', bolum: 'II', desc: 'İki oktav yukarıda ince, ıslıklı flüt.', ranks: [{ mult: 4, wave: 'flute', level: 0.18 }] },
    { id: 'seskialtera', name: 'Seskialtera', foot: 'II', family: 'mutation', jamb: 'sandik', bolum: 'II', desc: 'Nazard ile Terz bir arada: kornet renginde solo sesi.', ranks: [{ mult: 3, wave: 'flute', level: 0.17 }, { mult: 5, wave: 'flute', level: 0.12 }] },
    { id: 'obua8', name: 'Obua', foot: '8′', family: 'reed', jamb: 'sandik', bolum: 'II', desc: 'İnce, genizden dilli boru; tatlı bir solo sesi.', ranks: [{ mult: 1, wave: 'oboe', level: 0.22 }] },
    { id: 'voxhumana8', name: 'Vox humana', foot: '8′', family: 'reed', jamb: 'sandik', bolum: 'II', desc: '"İnsan sesi": kısa rezonatörlü dilli boru; tremoloyla şarkı söyler.', ranks: [{ mult: 1, wave: 'vox', level: 0.18 }] },
    { id: 'tremolo2', name: 'Tremolo', foot: '', family: 'trem', jamb: 'sandik', bolum: 'II', effect: true, desc: 'Sandığın rüzgârını titreştirir; I. manuelin tremolosundan biraz hızlı.', ranks: [] },

    // Pedal: ayakla çalınan bas bölümü
    { id: 'subbas16', name: 'Subbas', foot: '16′', family: 'flue', jamb: 'pedal', bolum: 'P', desc: 'Kapalı ahşap pedal borusu; yumuşak, derin temel.', ranks: [{ mult: 0.5, wave: 'stopped', level: 0.7 }] },
    { id: 'oktavbas8', name: 'Oktavbas', foot: '8′', family: 'flue', jamb: 'pedal', bolum: 'P', desc: 'Pedalın prinsipali; bas çizgisini belirginleştirir.', ranks: [{ mult: 1, wave: 'principal', level: 0.45 }] },
    { id: 'koralbas4', name: 'Koralbas', foot: '4′', family: 'flue', jamb: 'pedal', bolum: 'P', desc: 'Pedalda koral ezgisi çalmak için 4′ prinsipal.', ranks: [{ mult: 2, wave: 'principal', level: 0.3 }] },
    { id: 'trombon16', name: 'Trombon', foot: '16′', family: 'reed', jamb: 'pedal', bolum: 'P', desc: 'Pedalın güçlü dilli borusu; plenumun temeli.', ranks: [{ mult: 0.5, wave: 'reed', level: 0.3 }] },
  ];
  for (const s of STOPS) if (!s.bolum) s.bolum = 'I';
  const STOP_BY_ID = Object.fromEntries(STOPS.map(s => [s.id, s]));
  const BOLUM_ADI = { I: 'I. manuel', II: 'Sandık', P: 'Pedal' };
  const UST_SIRA = new Set(UPPER_ROW);

  // Kuplörler: bir bölümün registerlerini başka bir bölümün tuşlarından da çaldırır
  const KUPLORLER = [
    { id: 'II/I', ad: 'II → I', desc: 'Sandık, I. manuelden de çalar.' },
    { id: 'I/P', ad: 'I → P', desc: 'I. manuel, pedaldan da çalar.' },
    { id: 'II/P', ad: 'II → P', desc: 'Sandık, pedaldan da çalar.' },
  ];
  const PEDAL_ILK = 36;  // pedal klavyesi Do2'den başlar
  const PEDAL_SAYI = 20; // Do2 – Sol3

  // Kombinasyon pistonları bütün bölümleri ayarlar (I. manuel, Sandık, pedal); kuplörlere dokunmaz.
  const PISTONS = [
    { n: '1', name: 'Dua', stops: ['gedakt8', 'gamba8', 'celeste8', 'rohrflut8', 'undamaris8', 'subbas16'] },
    { n: '2', name: 'İlahi', stops: ['prinsipal8', 'gedakt8', 'oktav4', 'flut4', 'rohrflut8', 'salisyonal8', 'traversflut4', 'subbas16', 'oktavbas8'] },
    { n: '3', name: 'Flüt solo', stops: ['gedakt8', 'flut4', 'tremolo', 'rohrflut8', 'salisyonal8', 'subbas16'] },
    { n: '4', name: 'Kornet', stops: ['gedakt8', 'flut4', 'nazard', 'superoktav2', 'terz', 'rohrflut8', 'traversflut4', 'subbas16', 'oktavbas8'] },
    { n: '5', name: 'Plenum', stops: ['burdon16', 'prinsipal8', 'oktav4', 'superoktav2', 'mikstur', 'rohrflut8', 'salisyonal8', 'traversflut4', 'flajole2', 'obua8', 'subbas16', 'oktavbas8', 'koralbas4', 'trombon16'] },
    { n: '6', name: 'Tutti', stops: ['burdon16', 'prinsipal8', 'gedakt8', 'gamba8', 'oktav4', 'flut4', 'nazard', 'superoktav2', 'terz', 'mikstur', 'trompet8', 'rohrflut8', 'salisyonal8', 'traversflut4', 'flajole2', 'seskialtera', 'obua8', 'subbas16', 'oktavbas8', 'koralbas4', 'trombon16'] },
    { n: '0', name: 'İptal', stops: [] },
  ];

  const ROOMS = { sapel: 1.8, kilise: 3.6, katedral: 6.5 };

  // Akort sistemleri. Do'dan başlayan beşliler zinciri: Do Sol Re La Mi Si Fa♯ Do♯ Sol♯ Re♯ La♯ Fa (Do).
  // Her sayı, zincirdeki o beşlinin pür beşliden (3/2, 701,955 sent) ne kadar dar akortlandığıdır (sent).
  // On iki beşlinin daralmaları toplamı Pisagor koması eder; böylece zincir yedi oktav sonra Do'ya kapanır.
  const PUR_BESLI = 1200 * Math.log2(3 / 2);
  const PISAGOR_KOMASI = 12 * PUR_BESLI - 7 * 1200;  // 23,46 sent
  const SINTONIK_KOMA = 1200 * Math.log2(81 / 80);   // 21,51 sent
  const SKISMA = PISAGOR_KOMASI - SINTONIK_KOMA;     // 1,95 sent
  const BESLI_ZINCIRI = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
  const AKORTLAR = {
    esit: {
      ad: 'Eşit', besliler: Array(12).fill(PISAGOR_KOMASI / 12),
      bilgi: 'Bugünün akordu: on iki yarım ses eşit, her tonda aynı renk. Hiçbir aralık tam pür değil.',
    },
    werckmeister: {
      ad: 'Werckmeister III (1691)', besliler: [1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0].map(x => x * PISAGOR_KOMASI / 4),
      bilgi: 'Bach çağının "iyi akordu": her tonda çalınır; az diyezli tonlar temiz, çok diyezliler gergin ve renkli.',
    },
    kirnberger: {
      ad: 'Kirnberger III (1779)', besliler: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0].map(x => x * SINTONIK_KOMA / 4).map((x, i) => (i === 6 ? SKISMA : x)),
      bilgi: 'Do–Mi büyük üçlüsü pür; tondan tona renk farkı belirgin.',
    },
    ortalama: {
      ad: 'Ortalama ton (¼ koma)', besliler: BESLI_ZINCIRI.map((_, i) => (i === 8 ? PISAGOR_KOMASI - 11 * SINTONIK_KOMA / 4 : SINTONIK_KOMA / 4)),
      bilgi: 'Rönesans ve erken barok: büyük üçlüler pür ve tatlı. Sol♯–Mi♭ "kurt" beşlisi uluyarak çalar; az diyezli tonlarda kalın.',
    },
    pisagor: {
      ad: 'Pisagor', besliler: BESLI_ZINCIRI.map((_, i) => (i === 8 ? PISAGOR_KOMASI : 0)),
      bilgi: 'Beşliler pür, üçlüler sert; Orta Çağ ezgileri ve boş beşliler için.',
    },
  };
  const DIYAPAZONLAR = [
    [415, 'Barok · 415'], [430, 'Klasik · 430'], [440, 'Bugün · 440'], [442, 'Orkestra · 442'], [466, 'Barok kilise orgu · 466'],
  ];

  // Her perde sınıfının (Do = 0) eşit akorttan sapması, sent
  function akortSapmalari(besliler) {
    const sapma = new Array(12);
    let konum = 0;
    BESLI_ZINCIRI.forEach((pc, i) => {
      sapma[pc] = (((konum - pc * 100) % 1200) + 1800) % 1200 - 600;
      konum += PUR_BESLI - besliler[i];
    });
    return sapma;
  }
  const MAX_VOICES = 24;
  const HAFIF_MAX_VOICES = 12;

