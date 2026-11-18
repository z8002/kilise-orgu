// Akort sistemleri, diyapazon ve stereo yerleşim.
const { test, expect } = require('@playwright/test');
const { sayfayiAc, register, piston } = require('./yardimci');

// Tarihsel akortların eşit akorttan sapmaları (sent, Do = 0). Sayfanın kodundan bağımsız olarak,
// yayımlanmış tablolardan yazıldı: sayfa bunları beşliler zincirinden kendisi hesaplıyor.
const TABLOLAR = {
  esit: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  werckmeister: [0, -9.78, -7.82, -5.87, -9.78, -1.96, -11.73, -3.91, -7.82, -11.73, -3.91, -7.82],
  kirnberger: [0, -9.78, -6.84, -5.87, -13.69, -1.96, -9.78, -3.42, -7.82, -10.26, -3.91, -11.73],
  ortalama: [0, -23.95, -6.84, 10.26, -13.69, 3.42, -20.53, -3.42, -27.37, -10.26, 6.84, -17.11],
  pisagor: [0, 13.69, 3.91, -5.87, 7.82, -1.96, 11.73, 1.96, 15.64, 5.87, -3.91, 9.78],
};

test('akort sistemleri yayımlanmış tablolarla aynı', async ({ page }) => {
  await sayfayiAc(page);
  for (const [ad, tablo] of Object.entries(TABLOLAR)) {
    const sayfa = await page.evaluate(ad => window.kiliseOrgu.akortSapmasi(ad), ad);
    sayfa.forEach((s, pc) => expect(Math.abs(s - tablo[pc]), `${ad}, perde ${pc}: ${s.toFixed(2)}`).toBeLessThan(0.01));
  }
  await expect(page.locator('#akort option')).toHaveCount(Object.keys(TABLOLAR).length);
});

test('La4 diyapazonda kalır; öbür notalar akorda göre kayar', async ({ page }) => {
  await sayfayiAc(page);
  const frekans = midi => page.evaluate(m => window.kiliseOrgu.frekans(m), midi);
  expect(await frekans(69)).toBeCloseTo(440, 6);
  expect(await frekans(60)).toBeCloseTo(261.6256, 3);
  await page.locator('#sesAyarlari summary').click();
  await page.locator('#akort').selectOption('werckmeister');
  expect(await frekans(69)).toBeCloseTo(440, 6);
  expect(await frekans(60)).toBeCloseTo(261.6256 * Math.pow(2, 11.73 / 1200), 1); // Do, La'ya göre 11,73 sent tiz
  await page.locator('#diyapazon').selectOption('415');
  expect(await frekans(69)).toBeCloseTo(415, 6);
  await expect(page.locator('#akortBilgi')).toContainText('Bach');
  await page.reload();
  await expect(page.locator('#akort')).toHaveValue('werckmeister');
  await expect(page.locator('#diyapazon')).toHaveValue('415');
});

/* ---- Gerçek ses ölçümü ---- */
// Hoparlöre giden sinyal sol ve sağ kanal olarak iki analizöre de bağlanır.
const analizorKancasi = () => {
  const asil = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (hedef, ...kalan) {
    const sonuc = asil.call(this, hedef, ...kalan);
    if (hedef instanceof AudioDestinationNode && !window.__analizor) {
      const c = hedef.context, ayirici = c.createChannelSplitter(2);
      const yap = () => { const a = c.createAnalyser(); a.fftSize = 32768; a.smoothingTimeConstant = 0; return a; };
      const tum = yap(), sol = yap(), sag = yap();
      asil.call(this, tum);
      asil.call(this, ayirici);
      asil.call(ayirici, sol, 0);
      asil.call(ayirici, sag, 1);
      window.__analizor = { tum, sol, sag };
    }
    return sonuc;
  };
};

// lo–hi Hz aralığındaki en güçlü tepe (komşu kutularla parabolik ara değer)
const tepe = (page, lo, hi) => page.evaluate(([lo, hi]) => {
  const a = window.__analizor.tum, d = new Float32Array(a.frequencyBinCount);
  a.getFloatFrequencyData(d);
  const hz = a.context.sampleRate / a.fftSize;
  let en = -Infinity, k = 0;
  for (let i = Math.floor(lo / hz); i <= Math.ceil(hi / hz); i++) if (d[i] > en) { en = d[i]; k = i; }
  const [y0, y1, y2] = [d[k - 1], d[k], d[k + 1]];
  const kayma = (y0 - y2) / (2 * (y0 - 2 * y1 + y2)) || 0;
  return (k + kayma) * hz;
}, [lo, hi]);

const kanallar = page => page.evaluate(() => {
  const g = a => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let t = 0; for (const v of d) t += v * v; return Math.sqrt(t / d.length); };
  return { sol: g(window.__analizor.sol), sag: g(window.__analizor.sag) };
});

test.describe('ses', () => {
  test.skip(({ isMobile }) => isMobile, 'ses ölçümü masaüstünde koşar');
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(analizorKancasi);
    await sayfayiAc(page);
    await page.locator('#sesAyarlari summary').click();
  });

  test('Werckmeister III: Do4 eşit akorttan 11,7 sent tiz öter', async ({ page }) => {
    await piston(page, 0).click();
    await register(page, 'superoktav2').click(); // 2′: dört kat frekans, ölçüm daha hassas
    await page.locator('#akort').selectOption('werckmeister');
    await page.keyboard.down('KeyQ'); // Do4
    await page.waitForTimeout(1500);
    const f = await tepe(page, 1000, 1100);
    await page.keyboard.up('KeyQ');
    const beklenen = 4 * 261.6256 * Math.pow(2, 11.73 / 1200); // 1053,6 Hz (eşit akortta 1046,5)
    expect(Math.abs(f - beklenen), `${f.toFixed(1)} Hz`).toBeLessThan(1.5);
  });

  test('basılı notanın perdesi diyapazon değişince kayar', async ({ page }) => {
    await piston(page, 0).click();
    await register(page, 'prinsipal8').click();
    await page.keyboard.down('KeyY'); // La4
    await page.waitForTimeout(1200);
    expect(Math.abs(await tepe(page, 400, 460) - 440)).toBeLessThan(1);
    await page.locator('#diyapazon').selectOption('415');
    await page.waitForTimeout(1200);
    expect(Math.abs(await tepe(page, 400, 460) - 415)).toBeLessThan(1);
    await page.keyboard.up('KeyY');
  });

  test('stereo: Do borusu solda, Do♯ borusu sağda; genişlik sıfırken ortada', async ({ page }) => {
    await page.locator('#reverb').fill('0'); // yankı iki kanala da dağıtır, ölçümü bulandırmasın
    await page.locator('#stereo').fill('100');
    const olc = async kod => {
      await page.keyboard.down(kod);
      await page.waitForTimeout(700);
      const k = await kanallar(page);
      await page.keyboard.up(kod);
      await page.waitForTimeout(900);
      return k.sol / k.sag;
    };
    expect(await olc('KeyZ')).toBeGreaterThan(2);     // Do3: sol
    expect(await olc('KeyS')).toBeLessThan(0.5);      // Do♯3: sağ
    await page.locator('#stereo').fill('0');
    const orta = await olc('KeyZ');
    expect(orta).toBeGreaterThan(0.9);
    expect(orta).toBeLessThan(1.1);
  });
});
