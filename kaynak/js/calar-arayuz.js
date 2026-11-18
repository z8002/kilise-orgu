  /* ================= Şarkı çalar: arayüz ================= */
  const ETIKET_ADI = { ilahi: 'İlahi', noel: 'Noel', klasik: 'Klasik', opera: 'Opera', caz: 'Caz', dugun: 'Düğün', ozgun: 'Özgün' };
  const ZORLUK_ADI = { 1: 'Kolay', 2: 'Orta', 3: 'Zor' };
  const DOGRULAMA_ADI = { kaynak: 'Kaynakla karşılaştırıldı', 'kaynak-elle': 'Kaynağa bakılarak denetlendi', ezber: 'Ezberden; doğrulanmadı', ozgun: 'Özgün parça' };
  const DURUM_ADI = { hazir: 'Hazır', caliyor: 'Çalıyor', durakladi: 'Durakladı', bitti: 'Bitti' };
  const calarEl = $('#calar');
  const liste = { kutu: $('#parcaListesi'), ara: $('#parcaAra'), ul: $('#parcaSatirlari'), etiketler: $('#parcaEtiketleri'), secili: null };
  const dokunmatik = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

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
    $('#calarNo').textContent = p.no + '.';
    $('#calarAd').textContent = p.ad;
    $('#calarBesteci').textContent = p.besteci;
    $('#calarBilgi').textContent = `${p.ton} · ${p.olcu} · ${ZORLUK_ADI[p.zorluk]} · ${DOGRULAMA_ADI[p.dogrulama]}`;
    const host = $('#calarBolumler');
    host.textContent = '';
    c.bolumler.forEach((b, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'bolum';
      d.textContent = b.ad;
      d.dataset.no = i;
      d.title = 'Bu bölüme git';
      d.addEventListener('click', () => calarKonumaGit(b.bas));
      host.appendChild(d);
    });
    $('#elSolKutu').hidden = !c.eller.includes('sol');
    $('#elSagKutu').hidden = !c.eller.includes('sag');
    adresiYaz(parcaAdresi(p.id, calar.mod));
  }

  function calarIlerlemeGuncelle() {
    if (!calar.cizelge) return;
    $('#calarCubuk').style.width = (100 * calar.konum / calar.cizelge.toplam).toFixed(2) + '%';
    const no = calar.cizelge.bolumler.findIndex(b => calar.konum < b.bit);
    const simdiki = calar.durum === 'bitti' ? -1 : (no < 0 ? calar.cizelge.bolumler.length - 1 : no);
    $('#calarBolumler').querySelectorAll('.bolum').forEach((d, i) => d.setAttribute('aria-current', String(i === simdiki)));
  }

  // Öğren modunda sıradaki adımların tuşlarını yazar.
  function calarSiradakiYaz() {
    const el = $('#calarSiradaki');
    el.textContent = '';
    if (calar.mod !== 'ogren' || !calar.parca || calar.durum === 'bitti') { el.hidden = true; return; }
    el.hidden = false;
    const bas = document.createElement('span');
    bas.className = 'siradaki-bas';
    bas.textContent = 'Sıradaki:';
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

  function calarArayuzGuncelle() {
    const var_ = !!calar.parca;
    calarEl.hidden = !var_;
    $('#parcaSec').hidden = var_;
    if (!var_) return;
    const caliyor = calar.durum === 'caliyor';
    const oynat = $('#calarOynat');
    oynat.textContent = caliyor ? '❚❚' : '▶';
    oynat.setAttribute('aria-label', caliyor ? 'Duraklat' : (calar.mod === 'ogren' ? 'Başla' : 'Çal'));
    oynat.setAttribute('aria-pressed', String(caliyor));
    $('#modDinle').setAttribute('aria-pressed', String(calar.mod === 'dinle'));
    $('#modOgren').setAttribute('aria-pressed', String(calar.mod === 'ogren'));
    $('#calarHiz').value = calar.hiz;
    $('#calarHizOut').textContent = calar.hiz + '%';
    $('#elSag').value = calar.eller.sag;
    $('#elSol').value = calar.eller.sol;
    $('#calarDongu').setAttribute('aria-pressed', String(calar.dongu));
    let durum = DURUM_ADI[calar.durum] || '';
    if (calar.mod === 'ogren') {
      const toplam = calar.adimlar.length;
      if (calar.durum === 'bitti') durum = `Bitti: ${toplam} adım, ${calar.yanlis} yanlış tuş`;
      else if (calar.durum === 'caliyor') durum = `Adım ${Math.min(calar.adim + 1, toplam)}/${toplam} · Yanlış: ${calar.yanlis}`;
      else durum += ' · Yanan tuşa bas, program seni bekler';
    } else if (calar.cizelge.eller.some(el => calar.eller[el] === 'ben') && calar.durum !== 'bitti') {
      durum += ' · Yanan tuşlar senin elin';
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
      if (ara && !(p.ad + ' ' + p.besteci).toLocaleLowerCase('tr').includes(ara)) continue;
      adet++;
      const li = document.createElement('li');
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'parca-satiri';
      d.dataset.id = p.id;
      d.innerHTML = '<span class="p-no"></span><span class="p-ad"></span><span class="p-besteci"></span><span class="p-ek"></span>';
      d.children[0].textContent = p.no;
      d.children[1].textContent = p.ad;
      d.children[2].textContent = p.besteci;
      d.children[3].textContent = `${ZORLUK_ADI[p.zorluk]}${p.dogrulama === 'ezber' ? ' · doğrulanmadı' : ''}`;
      d.addEventListener('click', () => {
        liste.kutu.close();
        calarYukle(p.id, 'dinle');
        // Klavye ile çalar paneli birlikte görünsün
        $('.manual-wrap').scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      });
      li.appendChild(d);
      liste.ul.appendChild(li);
    }
    $('#parcaYok').hidden = adet > 0;
  }

  function listeKur() {
    const etiketler = [...new Set(PARCALAR.flatMap(p => p.etiketler))];
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
    ekle(null, 'Hepsi');
    for (const e of Object.keys(ETIKET_ADI)) if (etiketler.includes(e)) ekle(e, ETIKET_ADI[e]);
    liste.ara.addEventListener('input', listeYaz);
    const ac = () => { listeYaz(); if (liste.kutu.showModal) liste.kutu.showModal(); else liste.kutu.setAttribute('open', ''); };
    $('#parcalarBtn').addEventListener('click', ac);
    $('#parcaSec').addEventListener('click', ac);
    $('#parcaListesiKapat').addEventListener('click', () => liste.kutu.close());
    liste.kutu.addEventListener('click', e => { if (e.target === liste.kutu) liste.kutu.close(); });
  }

  function calarOlaylariBagla() {
    $('#calarOynat').addEventListener('click', () => (calar.durum === 'caliyor' ? calarDuraklat() : calarBasla()));
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
  };

