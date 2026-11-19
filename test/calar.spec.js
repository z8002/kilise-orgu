// Şarkı çalar: parça verisi, Dinle, Öğren, eşlik, bağlantılar.
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const path = require('path');
const { sayfayiAc, calanlar, piston } = require('./yardimci');

const KOK = path.resolve(__dirname, '..');
const python = secenek => JSON.parse(execFileSync('python3', [path.join(KOK, 'araclar', 'parca.py'), secenek], { maxBuffer: 64 * 1024 * 1024 }).toString());
const OLAYLAR = python('--olaylar');
const TUSLAR = python('--tuslar');
const olay = id => OLAYLAR.find(p => p.id === id);
const TPQ = 960;

const bekle = (page, durum, sure = 60_000) => page.waitForFunction(d => window.kiliseOrgu.calar.durum === d, durum, { timeout: sure });
const parcaAc = async (page, id) => {
  await page.locator('#parcalarBtn').click();
  await page.locator(`.parca-satiri[data-id="${id}"]`).click();
  await expect(page.locator('#calar')).toBeVisible();
};

test('sayfadaki parça çözücü, Python çözücüyle aynı zaman çizelgesini üretir', async ({ page }) => {
  await sayfayiAc(page);
  const sayfa = await page.evaluate(() => window.kiliseOrgu.parcalar.map(p => ({ id: p.id, c: window.kiliseOrgu.cizelge(p.id) })));
  expect(sayfa.map(p => p.id)).toEqual(OLAYLAR.map(p => p.id));
  for (const { id, c } of sayfa) {
    const beklenen = olay(id);
    expect(c.toplam, id).toBe(beklenen.toplam);
    for (const el of Object.keys(beklenen.eller)) {
      const bizim = c.olaylar.filter(o => o.el === el).map(o => [o.t, o.d, o.notalar, o.sira]);
      expect(bizim, `${id}/${el}`).toEqual(beklenen.eller[el]);
    }
  }
});

test('sayfanın tuş önerileri README ile aynı', async ({ page }) => {
  await sayfayiAc(page);
  const istek = TUSLAR.map(p => ({ id: p.id, adimlar: p.adimlar.map(a => ({ el: a.el, oktav: a.oktav, tuslar: a.tuslar, notalar: a.notalar })) }));
  const farklar = await page.evaluate(istek => {
    const SOLFEJ = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
    const midi = ad => { const m = /^(\D+)(\d)$/.exec(ad); return 12 * (Number(m[2]) + 1) + SOLFEJ.indexOf(m[1]); };
    const farklar = [];
    for (const p of istek) for (const a of p.adimlar) a.notalar.forEach((ad, i) => {
      const kod = window.kiliseOrgu.tus(p.id, midi(ad), a.el, a.oktav);
      if (kod !== a.tuslar[i]) farklar.push(`${p.id} ${ad} ${a.el}: sayfa ${kod}, README ${a.tuslar[i]}`);
    });
    return farklar;
  }, istek);
  expect(farklar).toEqual([]);
});

test.describe('Dinle', () => {
  test('program parçayı baştan sona doğru notalarla ve doğru zamanlamayla çalar', async ({ page }) => {
    await sayfayiAc(page);
    await parcaAc(page, 'neseye-ovgu');
    await expect(page.locator('#calarAd')).toHaveText('Neşeye Övgü');
    await expect(piston(page, 2)).toHaveAttribute('aria-current', 'true'); // parçanın önerdiği registrasyon
    await page.evaluate(() => { window.kiliseOrgu.hiz(400); window.kiliseOrgu.calar.gunluk = []; });
    await page.locator('#calarOynat').click();
    await expect.poll(() => calanlar(page)).not.toEqual([]); // çalarken "Çalan" satırı dolu
    await bekle(page, 'bitti');
    const gunluk = await page.evaluate(() => window.kiliseOrgu.calar.gunluk);
    const beklenen = olay('neseye-ovgu').eller.sag;
    expect(gunluk.map(g => [g.tik, g.notalar])).toEqual(beklenen.map(o => [o[0], o[2]]));
    // Zamanlama: tempo 120, hız %400 → dörtlük 0,125 sn
    const sn = tik => tik / TPQ * 60 / 120 / 4;
    for (const g of gunluk) expect(Math.abs((g.bas - gunluk[0].bas) - sn(g.tik)), `tik ${g.tik}`).toBeLessThan(0.002);
    await expect(page.locator('#calarDurum')).toHaveText('Bitti');
    await expect.poll(() => calanlar(page)).toEqual([]);
  });

  test('gerçekten ses çıkar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'ses ölçümü masaüstünde koşar');
    await page.addInitScript(() => {
      const asil = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function (hedef, ...kalan) {
        const sonuc = asil.call(this, hedef, ...kalan);
        if (hedef instanceof AudioDestinationNode && !window.__analizor) { const a = hedef.context.createAnalyser(); a.fftSize = 8192; asil.call(this, a); window.__analizor = a; }
        return sonuc;
      };
    });
    await sayfayiAc(page, 'kilise-orgu.html?parca=holy-holy-holy');
    await page.locator('#calarOynat').click();
    await page.waitForTimeout(1500);
    const rms = await page.evaluate(() => { const d = new Float32Array(8192); window.__analizor.getFloatTimeDomainData(d); return Math.sqrt(d.reduce((t, v) => t + v * v, 0) / d.length); });
    expect(rms).toBeGreaterThan(0.01);
  });

  test('swing: balad sekizlikleri sallanır, sol el akorları birlikte çalar', async ({ page }) => {
    await sayfayiAc(page, 'kilise-orgu.html?parca=gorsev-icin-balad');
    await page.evaluate(() => { window.kiliseOrgu.hiz(800); window.kiliseOrgu.calar.gunluk = []; });
    await page.locator('#calarOynat').click();
    await page.waitForFunction(() => window.kiliseOrgu.calar.gunluk.length > 12);
    await page.evaluate(() => window.kiliseOrgu.duraklat());
    const g = await page.evaluate(() => window.kiliseOrgu.calar.gunluk);
    const sag = g.filter(x => x.el === 'sag'), sol = g.filter(x => x.el === 'sol');
    expect(sol[0].notalar).toEqual([50, 62]); // Re3 + Re4
    expect(Math.abs(sol[0].bas - sag[0].bas)).toBeLessThan(0.001);
    // 1. ölçü: Re5 (1 vuruş), La4·Mi5 (sallanan ikili), Fa5. Tempo 60, hız %800 → vuruş 0,125 sn; swing 0,58
    const vurus = 0.125;
    expect(sag[1].bas - sag[0].bas).toBeCloseTo(vurus, 3);
    expect(sag[2].bas - sag[1].bas).toBeCloseTo(vurus * 0.58, 3);
    expect(sag[3].bas - sag[2].bas).toBeCloseTo(vurus * 0.42, 3);
  });

  test('bölüme atlanınca o bölümün registrasyonu gelir; duraklatınca konum korunur', async ({ page }) => {
    await sayfayiAc(page, 'kilise-orgu.html?parca=turk-marsi');
    await expect(piston(page, 4)).toHaveAttribute('aria-current', 'true');
    await page.locator('#calarBolumler .bolum', { hasText: /^B$/ }).click();
    await page.evaluate(() => { window.kiliseOrgu.calar.gunluk = []; });
    await page.locator('#calarOynat').click();
    await expect(piston(page, 6)).toHaveAttribute('aria-current', 'true');
    await page.waitForFunction(() => window.kiliseOrgu.calar.gunluk.length >= 4);
    await page.locator('#calarOynat').click(); // duraklat
    await expect(page.locator('#calarDurum')).toContainText('Durakladı');
    expect(await calanlar(page)).toEqual([]);
    const { konum, ilk, bolumler } = await page.evaluate(() => ({ konum: window.kiliseOrgu.calar.konum, ilk: window.kiliseOrgu.calar.gunluk[0].tik, bolumler: window.kiliseOrgu.calar.cizelge.bolumler }));
    const B = bolumler.find(b => b.kimlik === 'B');
    expect(ilk).toBe(B.bas);
    expect(konum).toBeGreaterThan(B.bas);
    expect(konum).toBeLessThan(B.bit);
  });

  test('eşlik: "Ben çalacağım" seçilen eli program çalmaz, tuşları yakar', async ({ page }) => {
    await sayfayiAc(page, 'kilise-orgu.html?parca=old-hundredth');
    await page.locator('#elSag').selectOption('ben');
    await page.evaluate(() => { window.kiliseOrgu.hiz(300); window.kiliseOrgu.calar.gunluk = []; });
    await page.locator('#calarOynat').click();
    await expect(page.locator('#manual .key.hedef').first()).toBeVisible();
    await page.waitForFunction(() => window.kiliseOrgu.calar.gunluk.length >= 6);
    const eller = await page.evaluate(() => [...new Set(window.kiliseOrgu.calar.gunluk.map(g => g.el))]);
    expect(eller).toEqual(['sol']);
  });
});

test.describe('Öğren', () => {
  test.skip(({ isMobile }) => isMobile, 'klavyeyle adım adım çalma masaüstünde koşar');

  test('doğru tuşa basınca ilerler, yanlış tuşu sayar, sonunda biter', async ({ page }) => {
    await sayfayiAc(page, 'kilise-orgu.html?parca=neseye-ovgu&mod=ogren');
    await expect(page.locator('#modOgren')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#elSag')).toHaveValue('ben');
    await page.locator('#calarOynat').click();
    const adimlar = TUSLAR.find(p => p.id === 'neseye-ovgu').adimlar;
    await expect(page.locator('#calarDurum')).toHaveText(`Adım 1/${adimlar.length} · Yanlış: 0`);
    await expect(page.locator('#calarSiradaki kbd.simdi')).toHaveText('E');
    await expect(page.locator('#manual .key.hedef')).toHaveCount(1);
    // Yanlış tuş: ilerlemez, sayılır
    await page.keyboard.press('KeyQ');
    await expect(page.locator('#calarDurum')).toHaveText(`Adım 1/${adimlar.length} · Yanlış: 1`);
    for (const [i, a] of adimlar.entries()) {
      for (const kod of a.tuslar) await page.keyboard.down(kod);
      for (const kod of a.tuslar) await page.keyboard.up(kod);
      if (i < adimlar.length - 1) await expect(page.locator('#calarDurum')).toHaveText(`Adım ${i + 2}/${adimlar.length} · Yanlış: 1`);
    }
    await bekle(page, 'bitti');
    await expect(page.locator('#calarDurum')).toHaveText(`Bitti: ${adimlar.length} adım, 1 yanlış tuş · İlk kez bitirdin!`);
  });

  test('öbür eli program çalar: baladda sağ el basılınca sol el akoru gelir', async ({ page }) => {
    await sayfayiAc(page, 'kilise-orgu.html?parca=gorsev-icin-balad&mod=ogren');
    await expect(page.locator('#elSol')).toHaveValue('program');
    await page.evaluate(() => { window.kiliseOrgu.calar.gunluk = []; });
    await page.locator('#calarOynat').click();
    expect(await page.evaluate(() => window.kiliseOrgu.calar.gunluk.length)).toBe(0); // program bekliyor
    await page.keyboard.down('KeyO'); // Re5
    await page.keyboard.up('KeyO');
    const g = await page.evaluate(() => window.kiliseOrgu.calar.gunluk);
    expect(g.map(x => [x.el, x.notalar])).toEqual([['sol', [50, 62]]]);
    await expect(page.locator('#calarDurum')).toContainText('Adım 2/');
  });

  test('akor adımı: bütün notalar basılınca ilerler', async ({ page }) => {
    await sayfayiAc(page, 'kilise-orgu.html?parca=gorsev-icin-balad&mod=ogren');
    await page.locator('#elSag').selectOption('program');
    await page.locator('#elSol').selectOption('ben');
    await page.locator('#calarOynat').click();
    await expect(page.locator('#manual .key.hedef')).toHaveCount(2);
    await page.keyboard.down('KeyX'); // Re3
    await expect(page.locator('#calarDurum')).toContainText('Adım 1/');
    await page.keyboard.down('Period'); // Re4
    await expect(page.locator('#calarDurum')).toContainText('Adım 2/');
    await page.keyboard.up('KeyX'); await page.keyboard.up('Period');
  });

  test('oktavı farklı parçada klavye kendiliğinden doğru konuma gelir', async ({ page }) => {
    await sayfayiAc(page, 'kilise-orgu.html?parca=air&mod=ogren');
    await expect(page.locator('#octOut')).toHaveText('Do4 – Sol6');
  });
});

test('adres çubuğu seçilen parçayı taşır; kapatınca temizlenir', async ({ page }) => {
  await sayfayiAc(page);
  await expect(page.locator('#calar')).toBeHidden();
  await parcaAc(page, 'fur-elise');
  await expect(page).toHaveURL(/\?parca=fur-elise$/);
  await page.locator('#modOgren').click();
  await expect(page).toHaveURL(/\?parca=fur-elise&mod=ogren$/);
  await page.locator('#calarKapat').click();
  await expect(page.locator('#calar')).toBeHidden();
  await expect(page).toHaveURL(/kilise-orgu\.html$/);
});

test('parça listesi aranır ve türe göre süzülür', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#parcalarBtn').click();
  await expect(page.locator('.parca-satiri')).toHaveCount(30);
  // Klavyeyle yazılır: nota tuşu olan harfler (b, c, h) ve boşluk org çalmaz, kutuya yazılır
  await page.locator('#parcaAra').pressSequentially('bach');
  await expect(page.locator('#parcaAra')).toHaveValue('bach');
  await expect(page.locator('.parca-satiri')).toHaveCount(4);
  expect(await calanlar(page)).toEqual([]);
  await page.locator('#parcaAra').fill('');
  await page.locator('#parcaAra').pressSequentially('sessiz gece');
  await expect(page.locator('.parca-satiri .p-ad')).toHaveText(['Sessiz Gece']);
  await page.locator('#parcaAra').fill('');
  await page.locator('.etiket', { hasText: 'Caz' }).click();
  await expect(page.locator('.parca-satiri .p-ad')).toHaveText(['Görsev İçin Balad', 'The Entertainer']);
});

test('tek elli parçada yalnızca o elin seçimi görünür', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=sessiz-gece');
  await expect(page.locator('#elSagKutu')).toBeVisible();
  await expect(page.locator('#elSolKutu')).toBeHidden();
  await page.locator('#calarKapat').click();
  await page.goto('kilise-orgu.html?parca=gorsev-icin-balad');
  await expect(page.locator('#elSolKutu')).toBeVisible();
});

for (const ad of ['yok-boyle-bir-parca', 'constructor', '__proto__']) {
  test(`bilinmeyen parça adresi sayfayı bozmaz (${ad})`, async ({ page }) => {
    const hatalar = await sayfayiAc(page, 'kilise-orgu.html?parca=' + ad);
    await expect(page.locator('#calar')).toBeHidden();
    expect(hatalar).toEqual([]);
  });
}

test('bozuk ya da yabancı ayar kaydı sayfayı bozmaz', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kilise-orgu-v2', JSON.stringify({
    room: 'toString', akort: 'constructor', diyapazon: 1e9, stereo: 'çok', octave: 99, stops: ['constructor', 'prinsipal8', '__proto__'],
  })));
  const hatalar = await sayfayiAc(page);
  await expect(page.locator('#room')).toHaveValue('kilise');
  await expect(page.locator('#octOut')).toContainText('–');
  await page.keyboard.down('KeyQ');
  await page.keyboard.up('KeyQ');
  expect(hatalar).toEqual([]);
});

// Otuz parçanın hepsi: program baştan sona çalar, çaldığı her nota parça dosyasındakiyle aynı olmalı.
test.describe('Dinle: bütün parçalar', () => {
  test.skip(({ isMobile }) => isMobile, 'masaüstünde koşar');
  for (const p of OLAYLAR) {
    test(`${p.id} baştan sona çalınır`, async ({ page }) => {
      test.setTimeout(120_000);
      await sayfayiAc(page, `kilise-orgu.html?parca=${p.id}`);
      await page.evaluate(() => { window.kiliseOrgu.hiz(2500); window.kiliseOrgu.calar.gunluk = []; });
      await page.locator('#calarOynat').click();
      await bekle(page, 'bitti', 110_000);
      const gunluk = await page.evaluate(() => window.kiliseOrgu.calar.gunluk);
      const beklenen = Object.entries(p.eller).flatMap(([el, liste]) => liste.map(o => [o[0], el, o[2]]));
      const sirala = a => a.sort((x, y) => x[0] - y[0] || (x[1] < y[1] ? -1 : 1));
      expect(sirala(gunluk.map(g => [g.tik, g.el, g.notalar]))).toEqual(sirala(beklenen));
      // Notalar zaman sırasıyla ve üst üste binmeden zamanlanmış olmalı
      for (let i = 1; i < gunluk.length; i++) if (gunluk[i].tik > gunluk[i - 1].tik) expect(gunluk[i].bas).toBeGreaterThan(gunluk[i - 1].bas);
      expect(await calanlar(page)).toEqual([]);
    });
  }
});
