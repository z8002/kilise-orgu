  /* ================= Dil: Türkçe ve İngilizce ================= */
  // Sayfa Türkçe yazılır. İngilizcede:
  //  - kısa metinler (düğmeler, etiketler, ipuçları) bu sözlükten çevrilir: anahtar Türkçe metnin kendisi;
  //  - uzun, biçimli metinler (yardım) sayfada data-en özniteliğinde İngilizce karşılığıyla durur;
  //  - JavaScript'in yazdığı metinler t() ile geçer; {ad} yer tutucuları doldurulur.
  // Seçim: adresteki ?dil=en|tr, sonra kaydedilen seçim, sonra tarayıcının dili (Türkçe değilse İngilizce).
  const DIL_ANAHTAR = 'kilise-orgu-dil';
  const DIL = (() => {
    try {
      const q = new URL(location.href).searchParams.get('dil');
      if (q === 'en' || q === 'tr') return q;
    } catch (_) {}
    try { const k = localStorage.getItem(DIL_ANAHTAR); if (k === 'en' || k === 'tr') return k; } catch (_) {}
    return (navigator.languages || [navigator.language || '']).some(l => /^tr\b/i.test(l)) ? 'tr' : 'en';
  })();
  const HARFLER = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

  const EN = {
    // Başlık ve genel
    'Kilise Orgu': 'Church Organ', 'Caz Orgu': 'Jazz Organ',
    'Caz orguna geç →': 'Try the jazz organ →', '← Kilise orguna dön': '← Back to the church organ',
    'Orgu uygulama gibi ana ekrandan aç; internet olmadan da çalışır': 'Open the organ from your home screen like an app; it also works offline',
    'Ana ekrana ekle': 'Add to home screen', 'Parçalar': 'Pieces',
    'Org motorunu (körüğü) çalıştırır. İlk tuşa bastığında da kendiliğinden açılır.': 'Starts the organ\'s blower. It also starts by itself when you press the first key.',
    'Rüzgârı aç': 'Wind on', 'Rüzgâr açık': 'Wind is on',
    'Klavyeden çalmak için önce sayfaya bir kez tıkla.': 'Click the page once before playing with the keyboard.',
    'Bu tarayıcı Web Audio desteklemiyor; Chrome, Edge ya da Firefox ile açmayı dene.': 'This browser does not support Web Audio; try Chrome, Edge or Firefox.',
    'Org konsolu': 'Organ console', 'Nasıl çalınır': 'How to play', 'Türkçe': 'Türkçe', 'English': 'English',
    // Caz orgu
    'Ton tekerlekli org': 'Tonewheel organ', 'Çekme çubukları': 'Drawbars',
    'Çekme çubukları: aşağı çektikçe o tekerleğin sesi güçlenir': 'Drawbars: pull a bar down to make its tonewheel louder',
    'Çekme çubuğu {ayak}': 'Drawbar {ayak}',
    'Hazır sesler': 'Presets', 'Perküsyon': 'Percussion', 'Perküsyon harmoniği': 'Percussion harmonic',
    'İkinci harmonik (4′)': 'Second harmonic (4′)', 'Üçüncü harmonik (2⅔′)': 'Third harmonic (2⅔′)',
    'Açıkken vuruş çabuk söner': 'When on, the hit decays quickly', 'Hızlı': 'Fast',
    'Açıkken vuruş daha kısık': 'When on, the hit is softer', 'Yumuşak': 'Soft',
    'Vibrato ve koro': 'Vibrato and chorus', 'Kapalı': 'Off',
    'V1 · hafif vibrato': 'V1 · light vibrato', 'V2 · vibrato': 'V2 · vibrato', 'V3 · derin vibrato': 'V3 · deep vibrato',
    'C1 · hafif koro': 'C1 · light chorus', 'C2 · koro': 'C2 · chorus', 'C3 · derin koro': 'C3 · deep chorus',
    'Dönen hoparlör': 'Rotary speaker', 'Yavaş': 'Slow', 'Sürüş': 'Drive',
    'Tuşa basınca ve bırakınca kontakların kısa tıkırtısı': 'The short click of the key contacts when you press and release',
    'Tuş tıkırtısı': 'Key click', 'Dönen hoparlör: Yavaş ya da Hızlı': 'Rotary speaker: slow or fast',
    'Klasik caz': 'Classic jazz', 'Balad': 'Ballad', 'Gospel': 'Gospel', 'Flüt': 'Flute', 'Blues': 'Blues', 'Tam': 'Full',
    // Kombinasyonlar ve konsol
    'Kombinasyonlar': 'Combinations', 'Kombinasyon pistonları': 'Combination pistons',
    'Kombinasyon {n}: {ad}': 'Combination {n}: {ad}',
    'Kendi kombinasyonların': 'Your own combinations',
    'Önce buna, sonra K1–K4\'ten birine bas: o anki registrasyon oraya kaydedilir': 'Press this, then one of K1–K4: the current registration is saved there',
    'Ayarla': 'Set', 'Register yazı renkleri': 'Stop label colours',
    'Ağızlı boru': 'Flue pipe', 'Mutasyon': 'Mutation', 'Dilli boru': 'Reed pipe', 'Tremolo': 'Tremulant',
    'Konsol': 'Console', 'Tek klavye: bilgisayar klavyesinin iki sırası da I. manueli çalar': 'One keyboard: both rows of the computer keyboard play manual I',
    'Tek manuel': 'One manual',
    'Sandık (II. manuel) ve pedal da açılır; bilgisayar klavyesinin üst sırası Sandık\'ı çalar': 'Adds the Swell (manual II) and the pedals; the top row of the computer keyboard plays the Swell',
    'İki manuel ve pedal': 'Two manuals and pedals',
    'I. manuelde basılı en kalın nota pedalda da çalar': 'The lowest note held on manual I also sounds on the pedals',
    'Otomatik pedal': 'Auto pedal', 'Kuplörler': 'Couplers', 'Sandık panjuru': 'Swell shutters',
    'Temel sesler': 'Foundation stops', 'Parlak sesler': 'Bright stops', 'Sandık · II. manuel': 'Swell · manual II', 'Pedal': 'Pedal',
    'I. manuel': 'Manual I', 'Sandık': 'Swell', 'Sandık (II. manuel)': 'Swell (manual II)',
    'Şimdi kaydedileceği yeri seç: K1, K2, K3 ya da K4.': 'Now choose where to save it: K1, K2, K3 or K4.',
    'O anki registrasyon {ad} kaydedildi.': 'Current registration saved to {ad}.',
    '{ad} boş. Kaydetmek için önce Ayarla\'ya, sonra {adA} bas.': '{ad} is empty. To save, press Set, then {ad}.',
    'Kendi kombinasyonum {n}': 'My combination {n}', 'Kendi kombinasyonum {n} (boş)': 'My combination {n} (empty)',
    'Sandık, I. manuelden de çalar.': 'The Swell also plays from manual I.', 'I. manuel, pedaldan da çalar.': 'Manual I also plays from the pedals.',
    'Sandık, pedaldan da çalar.': 'The Swell also plays from the pedals.',
    'Dua': 'Prayer', 'İlahi': 'Hymn', 'Flüt solo': 'Flute solo', 'Kornet': 'Cornet', 'Plenum': 'Plenum', 'Tutti': 'Tutti', 'İptal': 'Cancel',
    // Klavye ve telefon çubuğu
    'Klavye penceresi': 'Keyboard window', 'Klavyeyi bir oktav aşağı kaydır': 'Move the keyboard down an octave',
    'Klavyeyi bir oktav yukarı kaydır': 'Move the keyboard up an octave', 'Ekrandaki klavyenin çaldığı bölüm': 'Division played by the on-screen keyboard',
    'Tam ekran': 'Full screen', 'Küçült': 'Exit full screen',
    'Açıkken parmağını kaldırdığın notalar çalmaya devam eder': 'While on, notes keep sounding after you lift your finger',
    'Tut': 'Hold', 'Çal': 'Play', 'Duraklat': 'Pause', 'Başla': 'Start',
    'II. manuel (Sandık): fareyle veya dokunarak da çalınabilir': 'Manual II (Swell): you can also play it with the mouse or by touch',
    'Manuel: fareyle veya dokunarak da çalınabilir': 'Manual: you can also play it with the mouse or by touch',
    'Pedal: fareyle veya dokunarak da çalınabilir': 'Pedals: you can also play them with the mouse or by touch',
    // Şarkı çalar
    'Bir parça seç: program çalsın ya da sana öğretsin': 'Pick a piece: let the program play it or teach it to you',
    'Şarkı çalar': 'Song player', 'Parçayı kapat': 'Close the piece', 'Çalma biçimi': 'Playing mode',
    'Program parçayı çalar': 'The program plays the piece', 'Dinle': 'Listen',
    'Sıradaki tuş yanar, sen basınca ilerler': 'The next key lights up; it moves on when you press it', 'Öğren': 'Learn',
    'Başa dön': 'Back to start', 'Bölümü yinele': 'Repeat section', 'İçinde bulunulan bölümü yinele': 'Repeat the current section',
    'Hız': 'Speed', 'Sağ el': 'Right hand', 'Sol el': 'Left hand', 'Program çalsın': 'Program plays', 'Ben çalacağım': 'I will play', 'Sessiz': 'Silent',
    'Bölümler': 'Sections', 'Bu bölüme git': 'Go to this section', 'Sıradaki:': 'Next:',
    'Hazır': 'Ready', 'Çalıyor': 'Playing', 'Durakladı': 'Paused', 'Bitti': 'Finished',
    'Bitti: {toplam} adım, {yanlis} yanlış tuş': 'Finished: {toplam} steps, {yanlis} wrong keys',
    'Adım {adim}/{toplam} · Yanlış: {yanlis}': 'Step {adim}/{toplam} · Wrong: {yanlis}',
    ' · Yanan tuşa bas, program seni bekler': ' · Press the lit key; the program waits for you',
    ' · Yanan tuşlar senin elin': ' · The lit keys are your hand',
    'Kolay': 'Easy', 'Orta': 'Medium', 'Zor': 'Hard',
    'Kaynakla karşılaştırıldı': 'Checked against the source', 'Kaynağa bakılarak denetlendi': 'Checked by hand against the source',
    'Ezberden; doğrulanmadı': 'From memory; not verified', 'Özgün parça': 'Original piece', 'Senin yazdığın parça': 'A piece you wrote',
    ' · doğrulanmadı': ' · not verified',
    'Noel': 'Christmas', 'Klasik': 'Classical', 'Opera': 'Opera', 'Caz': 'Jazz', 'Düğün': 'Wedding', 'Özgün': 'Original', 'Kendi parçaların': 'Your pieces',
    'Hepsi': 'All',
    // Kontroller
    'Oktav': 'Octave', 'Bir oktav aşağı': 'One octave down', 'Bir oktav yukarı': 'One octave up',
    'Mekân': 'Room', 'Kulüp · 0,9 sn': 'Club · 0.9 s', 'Şapel · 1,8 sn': 'Chapel · 1.8 s', 'Kilise · 3,6 sn': 'Church · 3.6 s', 'Katedral · 6,5 sn': 'Cathedral · 6.5 s',
    'Yankı': 'Reverb', 'Ses': 'Volume', 'Açıkken bıraktığın notalar çalmaya devam eder': 'While on, notes keep sounding after you release them',
    'Boşluk': 'Space',
    'Daha az boru, daha az ses ve kısa yankı: zayıf telefonda ses cızırdamasın diye': 'Fewer pipes, fewer voices and a shorter reverb, so audio does not crackle on a weak phone',
    'Hafif mod': 'Light mode',
    'Çaldıklarını kaydet: MIDI ve ses dosyası olarak indirebilirsin': 'Record what you play; you can download it as a MIDI or audio file',
    '● Kaydet': '● Record', '■ Durdur': '■ Stop', 'Kayıt': 'Recording', '▶ Kaydı çal': '▶ Play recording',
    'Standart MIDI dosyası; bölüme göre kanal 1–3': 'Standard MIDI file; channels 1–3 by division', 'MIDI indir': 'Download MIDI',
    'Hoparlöre giden ses': 'The sound going to the speakers', 'Ses indir': 'Download audio',
    'USB ya da Bluetooth MIDI klavyeyi bağla': 'Connect a USB or Bluetooth MIDI keyboard', 'MIDI klavye': 'MIDI keyboard',
    'Bu tarayıcı MIDI klavyeyi desteklemiyor; Chrome ya da Edge ile aç.': 'This browser does not support MIDI keyboards; open the page in Chrome or Edge.',
    'MIDI izni verilmedi. Adres çubuğundaki site ayarlarından izin verebilirsin.': 'MIDI permission was not given. You can allow it in the site settings next to the address bar.',
    'MIDI klavye bulunamadı; takıp yeniden dene.': 'No MIDI keyboard found; plug one in and try again.',
    'Çalan:': 'Playing:',
    'Akort ve yerleşim': 'Tuning and placement', 'Akort sistemi': 'Temperament', 'Diyapazon (La4, Hz)': 'Pitch (A4, Hz)', 'Stereo genişlik': 'Stereo width',
    'Barok · 415': 'Baroque · 415', 'Klasik · 430': 'Classical · 430', 'Bugün · 440': 'Modern · 440', 'Orkestra · 442': 'Orchestra · 442', 'Barok kilise orgu · 466': 'Baroque church organ · 466',
    'Eşit': 'Equal', 'Ortalama ton (¼ koma)': 'Meantone (¼ comma)', 'Pisagor': 'Pythagorean',
    'Bugünün akordu: on iki yarım ses eşit, her tonda aynı renk. Hiçbir aralık tam pür değil.': 'Today\'s tuning: twelve equal semitones, the same colour in every key. No interval is quite pure.',
    'Bach çağının "iyi akordu": her tonda çalınır; az diyezli tonlar temiz, çok diyezliler gergin ve renkli.': 'A "well temperament" of Bach\'s time: every key is usable; keys with few sharps are clean, those with many are tense and colourful.',
    'Do–Mi büyük üçlüsü pür; tondan tona renk farkı belirgin.': 'The C–E major third is pure; the character of each key differs clearly.',
    'Rönesans ve erken barok: büyük üçlüler pür ve tatlı. Sol♯–Mi♭ "kurt" beşlisi uluyarak çalar; az diyezli tonlarda kalın.': 'Renaissance and early Baroque: major thirds are pure and sweet. The G♯–E♭ "wolf" fifth howls; stay in keys with few sharps.',
    'Beşliler pür, üçlüler sert; Orta Çağ ezgileri ve boş beşliler için.': 'Pure fifths, harsh thirds; for medieval melodies and open fifths.',
    // Parça listesi ve kendi parçan
    'Listeyi kapat': 'Close the list', 'Parça ya da besteci ara': 'Search pieces or composers', 'Türe göre süz': 'Filter by type',
    'Aramaya uyan parça yok.': 'No piece matches your search.', '+ Kendi parçanı ekle': '+ Add your own piece',
    'Kendi parçan': 'Your piece', 'Kapat': 'Close', 'Ad': 'Title', 'Besteci': 'Composer', 'İstersen boş bırak': 'Optional',
    'Ölçü': 'Time signature', 'Tempo (dörtlük/dk)': 'Tempo (quarter notes/min)', 'Nasıl yazılır?': 'How to write notes',
    'Do3:4 | Sol2:4   (istersen boş bırak)': 'C3:4 | G2:4   (optional)', 'Mi4 Mi4 Fa4 Sol4 | Sol4 Fa4 Mi4 Re4 | Do4:2 r:2': 'E4 E4 F4 G4 | G4 F4 E4 D4 | C4:2 r:2',
    'Kaydet ve aç': 'Save and open', 'Sil': 'Delete', '{ad} parçasını sil': 'Delete {ad}', '"{ad}" silinsin mi?': 'Delete "{ad}"?',
    'Parçaya bir ad ver.': 'Give the piece a title.', 'Sağ elin notalarını yaz.': 'Write the right-hand notes.', 'Sağ elde hiç nota yok.': 'The right hand has no notes.',
    '"{ham}": süre anlaşılmadı': '"{ham}": duration not understood', '"{ham}": süre sıfır olamaz': '"{ham}": duration cannot be zero',
    '"{n}": nota adı anlaşılmadı': '"{n}": note name not understood', '"{n}": org bu kadar pes çalmaz': '"{n}": the organ does not go this low',
    '"{n}": org bu kadar tiz çalmaz': '"{n}": the organ does not go this high', '{el}: en çok 3000 nota yazılabilir': '{el}: at most 3000 notes',
    'Tarayıcı parçayı saklayamadı (gizli pencere ya da dolu depolama).': 'The browser could not store the piece (private window or full storage).',
    'Kendi parçan (besteci)': 'Your piece', 'Parça': 'Piece',
  };

  // Org registerlerinin İngilizce adları ve açıklamaları (çoğu uluslararası ad, birkaçı çevrilir)
  const EN_REGISTER = {
    burdon16: ['Bourdon', 'Stopped wooden pipes; a soft, deep bass an octave below.'],
    prinsipal8: ['Principal', 'The backbone of the organ: the full main tone of open metal pipes.'],
    gedakt8: ['Gedackt', 'Stopped flute; round, warm and slightly muffled.'],
    gamba8: ['Gamba', 'Narrow-scaled string tone, like a violin.'],
    oktav4: ['Octave', 'The principal an octave higher; adds brightness.'],
    flut4: ['Flute', 'Open flute an octave higher; clear and sweet.'],
    celeste8: ['Voix\nCéleste', 'String tuned slightly sharp; undulates with the Gamba.'],
    nazard: ['Nazard', 'A flute an octave and a fifth up; a nasal, colourful tone.'],
    superoktav2: ['Super-\noctave', 'Principal two octaves up; the sparkle of the plenum.'],
    terz: ['Tierce', 'Two octaves and a third up; the salt of the cornet.'],
    mikstur: ['Mixture', 'Four ranks of high pipes; the crown of the church organ.'],
    trompet8: ['Trumpet', 'Reed pipe; a bright, commanding festive tone.'],
    tremolo: ['Tremulant', 'Shakes the wind pressure; the sound undulates.'],
    rohrflut8: ['Rohr flute', 'Chimney flute; slightly brighter than the Gedackt, singing.'],
    salisyonal8: ['Salicional', 'Slender string tone; softer than the Gamba.'],
    undamaris8: ['Unda maris', 'Flute tuned slightly flat; undulates with the Rohr flute like a sea wave.'],
    traversflut4: ['Traverse\nflute', 'Open, clear tone like a transverse flute; an octave up.'],
    flajole2: ['Flageolet', 'A thin, whistling flute two octaves up.'],
    seskialtera: ['Sesqui-\naltera', 'Nazard and Tierce together: a cornet-coloured solo stop.'],
    obua8: ['Oboe', 'A thin, nasal reed; a sweet solo voice.'],
    voxhumana8: ['Vox humana', '"Human voice": a short-resonator reed; sings with the tremulant.'],
    tremolo2: ['Tremulant', 'Shakes the Swell\'s wind; a little faster than manual I\'s.'],
    subbas16: ['Subbass', 'Stopped wooden pedal pipe; a soft, deep foundation.'],
    oktavbas8: ['Octave bass', 'The principal of the pedals; makes the bass line clear.'],
    koralbas4: ['Choral bass', 'A 4′ principal for playing a chorale melody in the pedals.'],
    trombon16: ['Trombone', 'The strong reed of the pedals; the foundation of the plenum.'],
  };

  const EN_PARCA = {
    'neseye-ovgu': 'Ode to Joy', toccata: 'Toccata and Fugue', 'gelin-korosu': 'Bridal Chorus', tristan: 'Tristan Prelude',
    'valkurlerin-ucusu': 'Ride of the Valkyries', kanon: 'Canon', 'sessiz-gece': 'Silent Night', 'dugun-marsi': 'Wedding March',
    'gorsev-icin-balad': 'Ballad for Görsev', 'turk-marsi': 'Turkish March',
  };
  const EN_BESTECI = {
    'Cenevre Mezmurlar Kitabı (Loys Bourgeois)': 'Genevan Psalter (Loys Bourgeois)', 'Amerikan halk ezgisi (*New Britain*)': 'American folk tune (New Britain)',
    'Mikola Leontoviç': 'Mykola Leontovych', 'İngiliz halk ezgisi': 'English folk tune', 'Lowell Mason (Händel\'den)': 'Lowell Mason (after Handel)',
    'Fransız ortaçağ ezgisi': 'French medieval chant', 'Stralsund ilahi kitabı': 'Stralsund hymnal', 'Kendi parçan': 'Your piece',
  };
  const EN_BOLUM = {
    '1. bitiş': '1st ending', '2. bitiş': '2nd ending', 'son bitiş': 'final ending', 'bitiş': 'ending', '1. bölüm': 'part 1', '2. bölüm': 'part 2',
    '1. bölümün bitişi': 'end of part 1', '1. cümle': 'phrase 1', '1. cümle (oktav ↑)': 'phrase 1 (octave ↑)', '2. cümle': 'phrase 2', '3. cümle': 'phrase 3',
    'son cümle': 'final phrase', '1. tur': 'round 1', '2. tur': 'round 2', 'B (köprü)': 'B (bridge)', 'akor ve çözülüş': 'chord and resolution',
    'ana tema': 'main theme', 'ana tema (kapanış)': 'main theme (closing)', 'giriş': 'introduction', 'kapanış': 'closing', 'kıta': 'verse',
    'melodi': 'melody', 'nakarat': 'refrain', 'orta bölüm': 'middle section', 'tema': 'theme', 'trompet çağrısı': 'trumpet call',
    'yalnız bas': 'bass alone', 'ön vuruş': 'pickup', 'Parça': 'piece',
  };

  function t(metin, degerler) {
    let s = DIL === 'en' && kendi(EN, metin) ? EN[metin] : metin;
    if (degerler) s = s.replace(/\{(\w+)\}/g, (_, k) => (k in degerler ? degerler[k] : '{' + k + '}'));
    return s;
  }
  const registerAdi = s => (DIL === 'en' && EN_REGISTER[s.id] ? EN_REGISTER[s.id][0] : s.name);
  const registerAciklamasi = s => (DIL === 'en' && EN_REGISTER[s.id] ? EN_REGISTER[s.id][1] : s.desc);
  const parcaAdi = p => (DIL === 'en' && EN_PARCA[p.id]) || p.ad;
  const besteciAdi = p => ((DIL === 'en' && EN_BESTECI[p.besteci]) || p.besteci).replace(/\*/g, '');
  const bolumAdi = ad => (DIL === 'en' && EN_BOLUM[ad]) || ad;
  // "Si♭ majör" → "B♭ major"
  function tonAdi(ton) {
    if (DIL !== 'en' || !ton) return ton;
    const harf = { Do: 'C', Re: 'D', Mi: 'E', Fa: 'F', Sol: 'G', La: 'A', Si: 'B' };
    return ton.replace(/^(Do|Re|Mi|Fa|Sol|La|Si)/, m => harf[m]).replace('majör', 'major').replace('minör', 'minor');
  }

  // Sayfadaki sabit metinleri çevirir (yalnızca İngilizcede): data-en taşıyan öğeler ve sözlükte olan metinler
  function sayfayiCevir(kok) {
    if (DIL !== 'en') return;
    document.documentElement.lang = 'en';
    kok.querySelectorAll('[data-en]').forEach(el => { el.innerHTML = el.dataset.en; });
    const gez = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT);
    for (let d = gez.nextNode(); d; d = gez.nextNode()) {
      const ham = d.nodeValue, kirp = ham.trim();
      if (kirp && kendi(EN, kirp)) d.nodeValue = ham.replace(kirp, EN[kirp]);
    }
    kok.querySelectorAll('[title], [aria-label], [placeholder]').forEach(el => {
      for (const a of ['title', 'aria-label', 'placeholder']) {
        const v = el.getAttribute(a);
        if (v && kendi(EN, v)) el.setAttribute(a, EN[v]);
      }
    });
  }

  function dilKur() {
    sayfayiCevir(document.body);
    if (DIL === 'en') document.title = t(document.title);
    const b = $('#dilBtn');
    b.textContent = DIL === 'en' ? 'Türkçe' : 'English';
    b.lang = DIL === 'en' ? 'tr' : 'en';
    b.addEventListener('click', () => {
      try { localStorage.setItem(DIL_ANAHTAR, DIL === 'en' ? 'tr' : 'en'); } catch (_) {}
      const u = new URL(location.href);
      u.searchParams.delete('dil');
      if (u.href === location.href) location.reload(); else location.replace(u.href);
    });
  }
