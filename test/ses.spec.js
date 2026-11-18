// Gerçek ses çıkışını ölçer: sayfanın hoparlöre giden sinyaline bir analizör bağlanır.
const { test, expect } = require('@playwright/test');
const { sayfayiAc, register, piston } = require('./yardimci');

test.skip(({ isMobile }) => isMobile, 'ses ölçümü masaüstünde koşar');

// Hoparlöre bağlanan her düğümü bir AnalyserNode'a da bağlar.
const analizorKancasi = () => {
  const asil = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (hedef, ...kalan) {
    const sonuc = asil.call(this, hedef, ...kalan);
    if (hedef instanceof AudioDestinationNode && !window.__analizor) {
      const a = hedef.context.createAnalyser();
      a.fftSize = 32768;
      a.smoothingTimeConstant = 0;
      asil.call(this, a);
      window.__analizor = a;
    }
    return sonuc;
  };
};

const rms = page => page.evaluate(() => {
  const a = window.__analizor;
  const d = new Float32Array(a.fftSize);
  a.getFloatTimeDomainData(d);
  let t = 0;
  for (const v of d) t += v * v;
  return Math.sqrt(t / d.length);
});

// lo–hi Hz aralığındaki en güçlü tepe frekansı
const tepe = (page, lo, hi) => page.evaluate(([lo, hi]) => {
  const a = window.__analizor;
  const d = new Float32Array(a.frequencyBinCount);
  a.getFloatFrequencyData(d);
  const hz = a.context.sampleRate / a.fftSize;
  let en = -Infinity, k = 0;
  for (let i = Math.floor(lo / hz); i <= Math.ceil(hi / hz); i++) if (d[i] > en) { en = d[i]; k = i; }
  return { frekans: k * hz, db: en };
}, [lo, hi]);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(analizorKancasi);
  await sayfayiAc(page);
});

test('tuşa basınca ses çıkar, bırakınca yankıyla söner', async ({ page }) => {
  await page.locator('#room').selectOption('sapel');
  await page.keyboard.down('KeyY'); // La4
  await page.waitForTimeout(1200);
  expect(await rms(page)).toBeGreaterThan(0.01);
  await page.keyboard.up('KeyY');
  await page.waitForTimeout(4500); // şapelin 1,8 sn yankısı bitsin
  expect(await rms(page)).toBeLessThan(0.001);
});

test('register yokken tuş ses vermez', async ({ page }) => {
  await piston(page, 0).click();
  await page.keyboard.down('KeyY');
  await page.waitForTimeout(800);
  expect(await rms(page)).toBeLessThan(0.0005);
  await page.keyboard.up('KeyY');
});

// La4 = 440 Hz. Her register kendi ayak yüksekliğinde ötmeli: 16′ bir oktav aşağı, 4′ bir oktav yukarı…
const AYAKLAR = [
  ['burdon16', 220], ['prinsipal8', 440], ['gedakt8', 440], ['gamba8', 440], ['celeste8', 441.8], ['oktav4', 880],
  ['flut4', 880], ['nazard', 1320], ['superoktav2', 1760], ['terz', 2200], ['mikstur', 2640], ['trompet8', 440],
];
for (const [id, beklenen] of AYAKLAR) {
  test(`${id} doğru perdede öter (La4 → ${beklenen} Hz)`, async ({ page }) => {
    await piston(page, 0).click();
    await register(page, id).click();
    await page.keyboard.down('KeyY');
    await page.waitForTimeout(1500);
    // En kalın güçlü ses: beklenen temel frekansın altında belirgin bir ses olmamalı
    const temel = await tepe(page, beklenen * 0.94, beklenen * 1.06);
    const alt = await tepe(page, 60, beklenen * 0.9);
    await page.keyboard.up('KeyY');
    expect(Math.abs(temel.frekans - beklenen) / beklenen, `tepe ${temel.frekans.toFixed(1)} Hz`).toBeLessThan(0.01);
    expect(temel.db, 'ses var').toBeGreaterThan(-78);
    expect(temel.db - alt.db, 'temel ses, altındaki her şeyden en az 20 dB güçlü olmalı').toBeGreaterThan(20);
  });
}

// Sandık ve pedalın registerleri: La4 her bölümde kendi registerinin ayağında öter
const YENI_AYAKLAR = [
  ['rohrflut8', 'II', 440], ['salisyonal8', 'II', 440], ['undamaris8', 'II', 438.5], ['traversflut4', 'II', 880], ['flajole2', 'II', 1760],
  ['seskialtera', 'II', 1320], ['obua8', 'II', 440], ['voxhumana8', 'II', 440],
  ['subbas16', 'P', 220], ['oktavbas8', 'P', 440], ['koralbas4', 'P', 880], ['trombon16', 'P', 220],
];
for (const [id, bolum, beklenen] of YENI_AYAKLAR) {
  test(`${id} (${bolum}) doğru perdede öter (La4 → ${beklenen} Hz)`, async ({ page }) => {
    await piston(page, 0).click();
    await page.locator(`.knob[data-id="${id}"]`).evaluate(k => k.click()); // tek manuelde görünmez; doğrudan
    await page.evaluate(b => window.kiliseOrgu.cal(69, b), bolum);
    await page.waitForTimeout(1500);
    const temel = await tepe(page, beklenen * 0.94, beklenen * 1.06);
    const alt = await tepe(page, 60, beklenen * 0.9);
    await page.evaluate(b => window.kiliseOrgu.birak(69, b), bolum);
    expect(Math.abs(temel.frekans - beklenen) / beklenen, `tepe ${temel.frekans.toFixed(1)} Hz`).toBeLessThan(0.01);
    expect(temel.db, 'ses var').toBeGreaterThan(-78);
    expect(temel.db - alt.db, 'temel ses, altındaki her şeyden en az 20 dB güçlü olmalı').toBeGreaterThan(20);
  });
}

test('I. manuelde basılan nota, Sandık\'ın registerini kuplör olmadan çalmaz', async ({ page }) => {
  await piston(page, 0).click();
  await page.locator('.knob[data-id="rohrflut8"]').evaluate(k => k.click());
  await page.keyboard.down('KeyY');
  await page.waitForTimeout(800);
  expect(await rms(page)).toBeLessThan(0.0005);
  await page.keyboard.up('KeyY');
});
