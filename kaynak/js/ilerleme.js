  /* ================= İlerleme ================= */
  // Öğren'de baştan sona bitirilen her parçanın en iyi sonucu tarayıcıda saklanır; iki org sayfası ortak kullanır.
  // Sonuç hangi elin çalındığına göre ayrı tutulur (sağ el, sol el, iki el); en iyisi en az yanlış tuştur.
  //   { [parçaId]: { sag|sol|iki: { adim, yanlis, kez, tarih } } }
  const ILERLEME_ANAHTAR = 'kilise-orgu-ilerleme';
  const EL_TURLERI = ['iki', 'sag', 'sol'];
  const EL_TURU_ADI = { iki: 'iki el', sag: 'sağ el', sol: 'sol el' };
  let ilerleme = Object.create(null); // önek nesnesiz: parça kimliği ne olursa olsun düz bir anahtar

  function ilerlemeYukle() {
    ilerleme = Object.create(null);
    let v;
    try { v = JSON.parse(localStorage.getItem(ILERLEME_ANAHTAR) || '{}'); } catch (_) { return; }
    if (!v || typeof v !== 'object' || Array.isArray(v)) return;
    // Bozuk ya da elle değiştirilmiş kayıtlar sessizce atlanır
    for (const [id, p] of Object.entries(v)) {
      if (!/^[a-z0-9-]{1,80}$/.test(id) || !p || typeof p !== 'object') continue; // parça kimliği biçiminde olmayan anahtar atlanır
      const temiz = Object.create(null);
      for (const tur of EL_TURLERI) {
        const s = kendi(p, tur) ? p[tur] : null;
        if (s && Number.isInteger(s.adim) && s.adim > 0 && Number.isInteger(s.yanlis) && s.yanlis >= 0) {
          temiz[tur] = { adim: s.adim, yanlis: s.yanlis, kez: Number.isInteger(s.kez) && s.kez > 0 ? s.kez : 1, tarih: typeof s.tarih === 'string' ? s.tarih.slice(0, 10) : '' };
        }
      }
      if (Object.keys(temiz).length) ilerleme[id] = temiz;
    }
  }

  function ilerlemeSakla() {
    try { localStorage.setItem(ILERLEME_ANAHTAR, JSON.stringify(ilerleme)); } catch (_) {}
  }

  // Kullanıcının hangi elle (ellerle) çaldığı
  function elTuru() {
    const sag = calar.eller.sag === 'ben', sol = calar.eller.sol === 'ben';
    return sag && sol ? 'iki' : sag ? 'sag' : sol ? 'sol' : null;
  }

  // Yıldız: hiç yanlış yoksa 3, yanlışlar adımların yüzde 5'ini geçmezse 2, yoksa 1
  const yildizSayisi = s => (s.yanlis === 0 ? 3 : s.yanlis <= s.adim * 0.05 ? 2 : 1);

  // Bir parçanın en iyi sonucu (en çok yıldız; eşitse iki el, sonra az yanlış)
  function enIyiSonuc(id) {
    const p = kendi(ilerleme, id) ? ilerleme[id] : null;
    if (!p) return null;
    let iyi = null;
    for (const tur of EL_TURLERI) {
      const s = p[tur];
      if (!s) continue;
      if (!iyi || yildizSayisi(s) > yildizSayisi(iyi.s) || (yildizSayisi(s) === yildizSayisi(iyi.s) && s.yanlis < iyi.s.yanlis)) iyi = { tur, s };
    }
    return iyi;
  }

  // Öğren bitince çağrılır: { yeni, onceki } (onceki: aynı elle daha önceki en iyi sonuç ya da null)
  function ilerlemeKaydet(id, tur, adim, yanlis) {
    const p = kendi(ilerleme, id) ? ilerleme[id] : (ilerleme[id] = Object.create(null));
    const onceki = p[tur] ? { ...p[tur] } : null;
    const yeni = !onceki || yanlis < onceki.yanlis;
    const kez = (onceki ? onceki.kez : 0) + 1;
    p[tur] = yeni ? { adim, yanlis, kez, tarih: new Date().toISOString().slice(0, 10) } : { ...onceki, kez };
    ilerlemeSakla();
    return { yeni, onceki };
  }

  function ilerlemeSil(id) {
    if (!kendi(ilerleme, id)) return;
    delete ilerleme[id];
    ilerlemeSakla();
  }

  // Listede parçanın yanında: ★★☆ ve ayrıntısı
  function ilerlemeRozeti(id) {
    const iyi = enIyiSonuc(id);
    if (!iyi) return null;
    const n = yildizSayisi(iyi.s);
    const r = document.createElement('span');
    r.className = 'p-yildiz';
    r.textContent = '★'.repeat(n) + '☆'.repeat(3 - n);
    r.setAttribute('role', 'img');
    r.setAttribute('aria-label', t('Öğrenildi, {n}/3 yıldız', { n }));
    r.title = EL_TURLERI.filter(tur => ilerleme[id][tur])
      .map(tur => t('{el}: {yanlis} yanlış, {kez} kez', { el: t(EL_TURU_ADI[tur]), yanlis: ilerleme[id][tur].yanlis, kez: ilerleme[id][tur].kez }))
      .join('\n');
    return r;
  }

  // Öğren durum satırına: bu elle önceki en iyi sonuç
  function ilerlemeOzeti() {
    const tur = elTuru();
    if (!calar.parca || !tur || !kendi(ilerleme, calar.parca.id) || !ilerleme[calar.parca.id][tur]) return '';
    return t(' · En iyi ({el}): {yanlis} yanlış', { el: t(EL_TURU_ADI[tur]), yanlis: ilerleme[calar.parca.id][tur].yanlis });
  }
