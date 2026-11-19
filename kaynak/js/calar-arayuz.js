  /* ================= Şarkı çalar: arayüz ================= */
  const ETIKET_ADI = { ilahi: 'İlahi', noel: 'Noel', klasik: 'Klasik', opera: 'Opera', caz: 'Caz', dugun: 'Düğün', ozgun: 'Özgün', kendi: 'Kendi parçaların' };
  const ZORLUK_ADI = { 1: 'Kolay', 2: 'Orta', 3: 'Zor' };
  const DOGRULAMA_ADI = { kaynak: 'Kaynakla karşılaştırıldı', 'kaynak-elle': 'Kaynağa bakılarak denetlendi', ezber: 'Ezberden; doğrulanmadı', ozgun: 'Özgün parça', kendi: 'Senin yazdığın parça' };
  const DURUM_ADI = { hazir: 'Hazır', caliyor: 'Çalıyor', durakladi: 'Durakladı', bitti: 'Bitti' };
  const calarEl = $('#calar');
  const liste = { kutu: $('#parcaListesi'), ara: $('#parcaAra'), ul: $('#parcaSatirlari'), etiketler: $('#parcaEtiketleri'), secili: null };

  // Adresi yalnızca değiştiğinde yaz (Safari, replaceState'i 30 saniyede 100 kezle sınırlar)
  function adresiYaz(u) {
    try { if (u.href !== location.href) history.replaceState(null, '', u); } catch (_) {}
  }

  function parcaAdresi(id, mod) {
    const u = new URL(location.href);
    u.search = '';
    u.hash = '';
    if (id) u.searchParams.set('parca', id);
    if (id && mod === 'ogren') u.searchParams.set('mod', 'ogren');
    return u;
  }

  // Bölüm düğmelerini ve el seçimlerini parçaya göre kurar (parça yüklenince bir kez).
  function calarArayuzKur() {
    const p = calar.parca, c = calar.cizelge;
    $('#calarNo').textContent = typeof p.no === 'number' ? p.no + '.' : p.no;
    $('#calarAd').textContent = parcaAdi(p);
    $('#calarBesteci').textContent = besteciAdi(p);
    $('#calarBilgi').textContent = [tonAdi(p.ton), p.olcu, t(ZORLUK_ADI[p.zorluk]), t(DOGRULAMA_ADI[p.dogrulama])].filter(Boolean).join(' · ');
    const host = $('#calarBolumler');
    host.textContent = '';
    c.bolumler.forEach((b, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'bolum';
      d.textContent = bolumAdi(b.ad);
      d.dataset.no = i;
      d.title = t('Bu bölüme git');
      d.addEventListener('click', () => calarKonumaGit(b.bas));
      host.appendChild(d);
    });
    $('#elSolKutu').hidden = !c.eller.includes('sol');
    $('#elSagKutu').hidden = !c.eller.includes('sag');
    adresiYaz(parcaAdresi(p.id, calar.mod));
    porteKur();
  }

  function calarIlerlemeGuncelle() {
    if (!calar.cizelge) return;
    $('#calarCubuk').style.width = (100 * calar.konum / calar.cizelge.toplam).toFixed(2) + '%';
    const no = calar.cizelge.bolumler.findIndex(b => calar.konum < b.bit);
    const simdiki = calar.durum === 'bitti' ? -1 : (no < 0 ? calar.cizelge.bolumler.length - 1 : no);
    $('#calarBolumler').querySelectorAll('.bolum').forEach((d, i) => d.setAttribute('aria-current', String(i === simdiki)));
    porteGuncelle();
  }

  // Öğren modunda sıradaki adımların tuşlarını yazar.
  function calarSiradakiYaz() {
    const el = $('#calarSiradaki');
    el.textContent = '';
    if (calar.mod !== 'ogren' || !calar.parca || calar.durum === 'bitti') { el.hidden = true; return; }
    el.hidden = false;
    const bas = document.createElement('span');
    bas.className = 'siradaki-bas';
    bas.textContent = t('Sıradaki:');
    el.appendChild(bas);
    calar.adimlar.slice(calar.adim, calar.adim + 10).forEach((a, i) => {
      const k = document.createElement('kbd');
      if (i === 0) k.className = 'simdi';
      const oktav = calar.cizelge.bolumler[a.sira].oktav;
      k.textContent = a.notalar.map(m => {
        const kod = notaTusu(calar.parca, m, a.eller.get(m), oktav);
        return dokunmatik || !kod ? noteName(m) : labels[kod];
      }).join('+');
      el.appendChild(k);
    });
    if (calar.adim >= calar.adimlar.length) { const s = document.createElement('span'); s.textContent = ' —'; el.appendChild(s); }
  }

  // Parça çalarken telefonun ekranı kararmasın (Screen Wake Lock; sayfa gizlenince tarayıcı kendisi bırakır)
  let ekranKilidi = null;
  function ekraniAcikTut(ac) {
    if (!('wakeLock' in navigator)) return;
    if (ac && !ekranKilidi) ekranKilidi = navigator.wakeLock.request('screen').catch(() => null);
    else if (!ac && ekranKilidi) {
      const k = ekranKilidi;
      ekranKilidi = null;
      k.then(kilit => kilit && kilit.release()).catch(() => {});
    }
  }

  function calarArayuzGuncelle() {
    const var_ = !!calar.parca;
    ekraniAcikTut(calar.durum === 'caliyor');
    calarEl.hidden = !var_;
    $('#parcaSec').hidden = var_;
    $('#dokOynat').hidden = !var_;
    if (!var_) return;
    const caliyor = calar.durum === 'caliyor';
    // Telefonda klavyenin üstündeki düğme, çalar panelindekinin eşi
    for (const oynat of [$('#calarOynat'), $('#dokOynat')]) {
      oynat.textContent = caliyor ? '❚❚' : '▶';
      oynat.setAttribute('aria-label', t(caliyor ? 'Duraklat' : (calar.mod === 'ogren' ? 'Başla' : 'Çal')));
      oynat.setAttribute('aria-pressed', String(caliyor));
    }
    $('#modDinle').setAttribute('aria-pressed', String(calar.mod === 'dinle'));
    $('#modOgren').setAttribute('aria-pressed', String(calar.mod === 'ogren'));
    $('#calarHiz').value = calar.hiz;
    $('#calarHizOut').textContent = calar.hiz + '%';
    $('#elSag').value = calar.eller.sag;
    $('#elSol').value = calar.eller.sol;
    $('#calarDongu').setAttribute('aria-pressed', String(calar.dongu));
    let durum = t(DURUM_ADI[calar.durum] || '');
    if (calar.mod === 'ogren') {
      const toplam = calar.adimlar.length;
      if (calar.durum === 'bitti') durum = t('Bitti: {toplam} adım, {yanlis} yanlış tuş', { toplam, yanlis: calar.yanlis });
      else if (calar.durum === 'caliyor') durum = t('Adım {adim}/{toplam} · Yanlış: {yanlis}', { adim: Math.min(calar.adim + 1, toplam), toplam, yanlis: calar.yanlis });
      else durum += t(' · Yanan tuşa bas, program seni bekler');
    } else if (calar.cizelge.eller.some(el => calar.eller[el] === 'ben') && calar.durum !== 'bitti') {
      durum += t(' · Yanan tuşlar senin elin');
    }
    $('#calarDurum').textContent = durum;
    calarEl.dataset.durum = calar.durum;
    calarEl.dataset.mod = calar.mod;
    calarIlerlemeGuncelle();
    calarSiradakiYaz();
    adresiYaz(parcaAdresi(calar.parca.id, calar.mod));
  }

  function calarYanlisGoster(midi) {
    const k = keyEls[midi - baseMidi()];
    if (!k) return;
    k.classList.add('yanlis');
    setTimeout(() => k.classList.remove('yanlis'), 350);
  }

  /* ---- Parça listesi ---- */
  function listeYaz() {
    const ara = liste.ara.value.trim().toLocaleLowerCase('tr');
    liste.ul.textContent = '';
    let adet = 0;
    for (const p of PARCALAR) {
      if (liste.secili && !p.etiketler.includes(liste.secili)) continue;
      if (ara && ![p.ad, p.besteci, parcaAdi(p), besteciAdi(p)].join(' ').toLocaleLowerCase('tr').includes(ara)) continue;
      adet++;
      const li = document.createElement('li');
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'parca-satiri';
      d.dataset.id = p.id;
      d.innerHTML = '<span class="p-no"></span><span class="p-ad"></span><span class="p-besteci"></span><span class="p-ek"></span>';
      d.children[0].textContent = p.no;
      d.children[1].textContent = parcaAdi(p);
      d.children[2].textContent = besteciAdi(p);
      d.children[3].textContent = t(ZORLUK_ADI[p.zorluk]) + (p.dogrulama === 'ezber' ? t(' · doğrulanmadı') : '');
      d.addEventListener('click', () => {
        liste.kutu.close();
        calarYukle(p.id, 'dinle');
        // Klavye ile çalar paneli birlikte görünsün (telefonda klavye zaten ekranın altında)
        (pencere.acik ? calarEl : $('.manual-wrap')).scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      });
      li.appendChild(d);
      if (p.dogrulama === 'kendi') {
        const sil = document.createElement('button');
        sil.type = 'button';
        sil.className = 'parca-sil';
        sil.textContent = t('Sil');
        sil.setAttribute('aria-label', t('{ad} parçasını sil', { ad: p.ad }));
        sil.addEventListener('click', () => kendiParcaSil(p.id));
        li.appendChild(sil);
        li.className = 'kendi-satir';
      }
      liste.ul.appendChild(li);
    }
    $('#parcaYok').hidden = adet > 0;
  }

  // Tür süzgeçleri; kendi parçan eklenince ya da silinince yeniden kurulur
  function etiketleriYaz() {
    const etiketler = [...new Set(PARCALAR.flatMap(p => p.etiketler))];
    if (liste.secili && !etiketler.includes(liste.secili)) liste.secili = null;
    liste.etiketler.textContent = '';
    const ekle = (deger, ad) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'etiket';
      d.textContent = ad;
      d.setAttribute('aria-pressed', String(liste.secili === deger));
      d.addEventListener('click', () => {
        liste.secili = deger;
        liste.etiketler.querySelectorAll('.etiket').forEach(x => x.setAttribute('aria-pressed', String(x === d)));
        listeYaz();
      });
      liste.etiketler.appendChild(d);
    };
    ekle(null, t('Hepsi'));
    for (const e of Object.keys(ETIKET_ADI)) if (etiketler.includes(e)) ekle(e, t(ETIKET_ADI[e]));
  }

  function listeKur() {
    etiketleriYaz();
    liste.ara.addEventListener('input', listeYaz);
    const ac = () => { listeYaz(); if (liste.kutu.showModal) liste.kutu.showModal(); else liste.kutu.setAttribute('open', ''); };
    $('#parcalarBtn').addEventListener('click', ac);
    $('#parcaSec').addEventListener('click', ac);
    $('#parcaListesiKapat').addEventListener('click', () => liste.kutu.close());
    liste.kutu.addEventListener('click', e => { if (e.target === liste.kutu) liste.kutu.close(); });
  }

  function calarOlaylariBagla() {
    const oynatDuraklat = () => (calar.durum === 'caliyor' ? calarDuraklat() : calarBasla());
    $('#calarOynat').addEventListener('click', oynatDuraklat);
    $('#dokOynat').addEventListener('click', oynatDuraklat);
    $('#calarBas').addEventListener('click', calarDurdur);
    $('#calarKapat').addEventListener('click', calarKapat);
    $('#modDinle').addEventListener('click', () => calarModSec('dinle'));
    $('#modOgren').addEventListener('click', () => calarModSec('ogren'));
    $('#calarHiz').addEventListener('input', e => calarHizAyarla(Number(e.target.value)));
    $('#elSag').addEventListener('change', e => { calarElSec('sag', e.target.value); e.target.blur(); });
    $('#elSol').addEventListener('change', e => { calarElSec('sol', e.target.value); e.target.blur(); });
    $('#calarDongu').addEventListener('click', () => { calar.dongu = !calar.dongu; calarArayuzGuncelle(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) calarDuraklat(); });
  }

  // Adresteki ?parca=… ile gelen parçayı yükler.
  function calarAdrestenYukle() {
    let q;
    try { q = new URL(location.href).searchParams; } catch (_) { return; }
    if (!q.get('parca')) return;
    // Bilinmeyen parça: adresi temizle, sayfa olduğu gibi açılsın
    if (!calarYukle(q.get('parca'), q.get('mod'))) adresiTemizle();
  }

  function adresiTemizle() { adresiYaz(parcaAdresi(null)); }

  // Testler ve meraklılar için: sayfanın dışından okunabilen küçük bir arayüz.
  window.kiliseOrgu = {
    surum: 2,
    parcalar: PARCALAR,
    cizelge: id => parcaCizelgesi(PARCA_BY_ID[id]),
    saniye: (id, tik) => parcaSaniyesi(PARCA_BY_ID[id], parcaCizelgesi(PARCA_BY_ID[id]), tik),
    tus: (id, midi, el, oktav) => notaTusu(PARCA_BY_ID[id], midi, el, oktav),
    calar,
    yukle: calarYukle, basla: calarBasla, duraklat: calarDuraklat, durdur: calarDurdur, hiz: calarHizAyarla, git: calarKonumaGit,
    sesZamani: () => (ctx ? ctx.currentTime : 0),
    frekans: notaFrekansi,
    // Basılı notaların hangi registerlerle öttüğü: { 'Do4': ['oktav4', …] }
    borular: () => Object.fromEntries([...voices].filter(([, v]) => !v.released).map(([m, v]) => [noteName(m), [...v.stops.keys()].sort()])),
    sandik: () => (A ? { kazanc: A.sandik.kazanc.gain.value, kesim: A.sandik.suzgec.frequency.value } : null),
    pedalSesleri: () => calar.pedalSayisi,
    donenHoparlor: () => (A && A.caz ? { boru: A.caz.boru.sin.frequency.value, tambur: A.caz.tambur.sin.frequency.value } : null),
    // Bir bölümde nota basıp bırakmak (testler ve ileride MIDI için)
    cal: (midi, bolum = 'I') => noteOn(midi, `api:${bolum}:${midi}`, bolum),
    birak: (midi, bolum = 'I') => noteOff(midi, `api:${bolum}:${midi}`),
    akortSapmasi: ad => akortSapmalari(AKORTLAR[ad].besliler),
  };

