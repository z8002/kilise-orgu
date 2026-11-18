  /* ================= Kendi parçan ================= */
  // Kullanıcının yazdığı parçalar tarayıcıda saklanır (iki org sayfası da görür) ve otuz parçayla aynı listede,
  // aynı biçimde çalınır: Dinle, Öğren, eşlik. Notalar Türkçe (Do4, Sol#3, Sib2) ya da İngilizce (C4, G#3, Bb2).
  const KENDI_ANAHTAR = 'kilise-orgu-parcalar';
  const TR_NOTA = { do: 'C', re: 'D', mi: 'E', fa: 'F', sol: 'G', la: 'A', si: 'B' };

  // Bir yazım parçasını iç biçime çevirir: "Sol#4:3/2" → "G#4:3/2", "Do4+Mi4" → "C4+E4". Yanlışsa hata atar.
  function kendiTokenCevir(ham) {
    const iki = ham.indexOf(':');
    const ad = iki < 0 ? ham : ham.slice(0, iki), sure = iki < 0 ? '' : ham.slice(iki + 1);
    if (iki >= 0 && !/^(\d+(\/[1-9]\d*)?|\d*\.\d+)$/.test(sure)) throw new Error(`"${ham}": süre anlaşılmadı`);
    if (iki >= 0 && !(sureCarpani(sure) > 0)) throw new Error(`"${ham}": süre sıfır olamaz`);
    const ek = iki < 0 ? '' : ':' + sure;
    if (/^(r|-|sus)$/i.test(ad)) return 'r' + ek;
    if (ad === '~') return '~' + ek;
    return ad.split('+').map(n => {
      const m = /^(do|re|mi|fa|sol|la|si|[a-g])([#♯b♭]?)(\d)$/i.exec(n);
      if (!m) throw new Error(`"${n}": nota adı anlaşılmadı`);
      const harf = TR_NOTA[m[1].toLowerCase()] || m[1].toUpperCase();
      const isaret = m[2] === '♯' ? '#' : m[2] === '♭' ? 'b' : m[2];
      const midi = notaMidi(harf + isaret + m[3]);
      if (midi < 24 || midi > 108) throw new Error(`"${n}": org bu kadar ${midi < 24 ? 'pes' : 'tiz'} çalmaz`);
      return harf + isaret + m[3];
    }).join('+') + ek;
  }

  // Bir elin yazısını iç biçime çevirir; süresini (dörtlük) ve notalarını döndürür
  function kendiEliCoz(metin, elAdi) {
    const tokenlar = metin.split(/\s+/).filter(t => t && t !== '|');
    if (tokenlar.length > 3000) throw new Error(`${elAdi}: en çok 3000 nota yazılabilir`);
    const cevrilmis = tokenlar.map(t => { try { return kendiTokenCevir(t); } catch (e) { throw new Error(`${elAdi}, ${e.message}`); } });
    const { olaylar, sure } = dizgileriCoz([cevrilmis.join(' ')], TPQ);
    return { satir: cevrilmis.join(' '), sure: sure / TPQ, notalar: olaylar.flatMap(o => o.notalar) };
  }

  // Formdaki bilgilerden parça nesnesi kurar (otuz parçayla aynı biçim)
  function kendiParcaKur(bilgi) {
    const ad = bilgi.ad.trim();
    if (!ad) throw new Error('Parçaya bir ad ver.');
    if (!bilgi.sag.trim()) throw new Error('Sağ elin notalarını yaz.');
    const sag = kendiEliCoz(bilgi.sag, 'Sağ el');
    const sol = bilgi.sol.trim() ? kendiEliCoz(bilgi.sol, 'Sol el') : null;
    if (!sag.notalar.length) throw new Error('Sağ elde hiç nota yok.');
    // İki elin uzunluğu eşitlenir: kısa kalanın sonuna sus eklenir
    const uzun = Math.max(sag.sure, sol ? sol.sure : 0);
    const doldur = (el) => (el.sure < uzun - 1e-9 ? el.satir + ' r:' + Number((uzun - el.sure).toFixed(6)) : el.satir);
    // Oktav: bütün notalar klavyenin 32 tuşuna sığsın; sığan konumlardan, sağ elin en çok notası bilgisayar
    // klavyesinin üst sırasına (Q W E …) düşeni seçilir (öbür parçalarda da sağ el üst sırada çalınır).
    const hepsi = [...sag.notalar, ...(sol ? sol.notalar : [])];
    const enPes = Math.min(...hepsi), enTiz = Math.max(...hepsi);
    let oktav = clamp(Math.floor(enPes / 12) - 1, 1, 5), enIyi = -1;
    for (let o = 5; o >= 1; o--) {
      const t = 12 * (o + 1);
      if (t > enPes || enTiz >= t + SPAN) continue;
      const ustte = sag.notalar.filter(m => m >= t + 12).length;
      if (ustte > enIyi) { enIyi = ustte; oktav = o; }
    }
    const tempo = clamp(Math.round(Number(bilgi.tempo) || 90), 30, 240);
    const bolum = { ad: 'Parça', sag: [doldur(sag)] };
    if (sol) bolum.sol = [doldur(sol)];
    return {
      id: bilgi.id || 'kendi-' + Date.now().toString(36), no: '★', ad: ad.slice(0, 60),
      besteci: (bilgi.besteci || '').trim().slice(0, 60) || 'Kendi parçan', etiketler: ['kendi'], zorluk: 1, ton: '',
      olcu: ['2/4', '3/4', '4/4', '6/8'].includes(bilgi.olcu) ? bilgi.olcu : '4/4', tempo, birim: '1/4', oktav,
      piston: '2', sira: ['A'], bolumler: { A: bolum }, dogrulama: 'kendi',
      yazi: { sag: bilgi.sag.trim(), sol: bilgi.sol.trim() },
    };
  }

  function kendiParcalari() {
    try { const v = JSON.parse(localStorage.getItem(KENDI_ANAHTAR) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; }
  }
  function kendiParcalariYaz(dizi) {
    try { localStorage.setItem(KENDI_ANAHTAR, JSON.stringify(dizi)); return true; } catch (_) { return false; }
  }

  function kendiParcayiEkle(p) {
    PARCALAR.push(p);
    PARCA_BY_ID[p.id] = p;
  }
  function kendiParcayiCikar(id) {
    const i = PARCALAR.findIndex(p => p.id === id);
    if (i >= 0) PARCALAR.splice(i, 1);
    delete PARCA_BY_ID[id];
    cizelgeOnbellegi.delete(id);
  }

  // Açılışta saklanan parçalar listeye katılır; bozuk olanlar atlanır
  function kendiParcalariYukle() {
    for (const k of kendiParcalari()) {
      try {
        if (!k || typeof k.id !== 'string' || !k.id.startsWith('kendi-') || !k.yazi || kendi(PARCA_BY_ID, k.id)) continue;
        const p = kendiParcaKur({ ...k.yazi, id: k.id, ad: String(k.ad || ''), besteci: String(k.besteci || ''), olcu: k.olcu, tempo: k.tempo });
        parcaCizelgesi(p);
        kendiParcayiEkle(p);
      } catch (_) { /* bozuk kayıt */ }
    }
  }

  function kendiParcaFormuKur() {
    const kutu = $('#parcaEkle'), hata = $('#kpHata');
    const ac = () => {
      hata.textContent = '';
      if (liste.kutu.open) liste.kutu.close();
      if (kutu.showModal) kutu.showModal(); else kutu.setAttribute('open', '');
      $('#kpAd').focus();
    };
    $('#kendiParcaBtn').addEventListener('click', ac);
    $('#parcaEkleKapat').addEventListener('click', () => kutu.close());
    $('#parcaEkleForm').addEventListener('submit', e => {
      e.preventDefault();
      let p;
      try {
        p = kendiParcaKur({ ad: $('#kpAd').value, besteci: $('#kpBesteci').value, olcu: $('#kpOlcu').value, tempo: $('#kpTempo').value, sag: $('#kpSag').value, sol: $('#kpSol').value });
        parcaCizelgesi(p);
      } catch (err) { hata.textContent = err.message; return; }
      const kayitli = kendiParcalari();
      kayitli.push({ id: p.id, ad: p.ad, besteci: $('#kpBesteci').value.trim(), olcu: p.olcu, tempo: p.tempo, yazi: p.yazi });
      if (!kendiParcalariYaz(kayitli)) { hata.textContent = 'Tarayıcı parçayı saklayamadı (gizli pencere ya da dolu depolama).'; return; }
      kendiParcayiEkle(p);
      etiketleriYaz();
      kutu.close();
      $('#parcaEkleForm').reset();
      calarYukle(p.id, 'dinle');
    });
  }

  function kendiParcaSil(id) {
    const p = PARCA_BY_ID[id];
    if (!p || !confirm(`"${p.ad}" silinsin mi?`)) return;
    kendiParcalariYaz(kendiParcalari().filter(k => k.id !== id));
    if (calar.parca && calar.parca.id === id) calarKapat();
    kendiParcayiCikar(id);
    etiketleriYaz();
    listeYaz();
  }
