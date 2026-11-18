// Caz orgu (caz-orgu.html): çekme çubukları, hazır sesler, perküsyon, dönen hoparlör, şarkı çalar.
const { test, expect } = require('@playwright/test');
const path = require('path');
const { sayfayiAc, calanlar } = require('./yardimci');

const KOK = path.resolve(__dirname, '..');
const cekme = (page, ayak) => page.getByRole('slider', { name: `Çekme çubuğu ${ayak}`, exact: true });

test('caz orgu sayfası hatasız açılır; kilise orgusunun registerleri yok, dokuz çekme çubuğu var', async ({ page }) => {
  const hatalar = await sayfayiAc(page, 'caz-orgu.html');
  await expect(page.locator('h1')).toHaveText('Caz Orgu');
  await expect(page).toHaveTitle('Caz Orgu');
  await expect(page.getByRole('slider', { name: /^Çekme çubuğu/ })).toHaveCount(9);
  await expect(page.locator('.knob').first()).toBeHidden();
  await expect(page.locator('#facade')).toBeHidden();
  await expect(page.locator('.caz-hazir', { hasText: 'Klasik caz' })).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('#cekmeKodu')).toHaveText('888000000');
  await expect(page.getByRole('link', { name: '← Kilise orguna dön' })).toHaveAttribute('href', 'kilise-orgu.html');
  expect(hatalar).toEqual([]);
});

test('kilise orgusundan caz orguna bağlantı var; iki sayfanın ayarları ayrı saklanır', async ({ page }) => {
  await sayfayiAc(page);
  await expect(page.getByRole('link', { name: 'Caz orguna geç →' })).toHaveAttribute('href', 'caz-orgu.html');
  await page.locator('#room').selectOption('katedral');
  await page.goto('caz-orgu.html');
  await expect(page.locator('#room')).toHaveValue('kulup'); // caz orgunun kendi mekânı
  await page.goto('kilise-orgu.html');
  await expect(page.locator('#room')).toHaveValue('katedral');
});

test('çekme çubukları klavyeyle ve hazır seslerle ayarlanır, sayfa yenilenince korunur', async ({ page, isMobile }) => {
  await sayfayiAc(page, 'caz-orgu.html');
  await page.locator('.caz-hazir', { hasText: 'Tam' }).click();
  await expect(page.locator('#cekmeKodu')).toHaveText('888888888');
  const dort = cekme(page, '4′');
  await dort.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(dort).toHaveAttribute('aria-valuenow', '2');
  await expect(page.locator('#cekmeKodu')).toHaveText('888288888');
  await expect(page.locator('#octOut')).toHaveText(isMobile ? /–/ : 'Do3 – Sol5'); // oklar oktavı değiştirmedi
  await page.reload();
  await expect(page.locator('#cekmeKodu')).toHaveText('888288888');
});

test('çekme çubuğu fareyle ya da parmakla aşağı çekilir', async ({ page }) => {
  await sayfayiAc(page, 'caz-orgu.html');
  const bir = cekme(page, '1′');
  await bir.evaluate(e => e.scrollIntoView({ block: 'center' })); // telefonda klavyenin altında kalmasın
  const k = await bir.boundingBox();
  await page.mouse.move(k.x + k.width / 2, k.y + 5);
  await page.mouse.down();
  await page.mouse.move(k.x + k.width / 2, k.y + k.height - 2, { steps: 5 });
  await page.mouse.up();
  await expect(bir).toHaveAttribute('aria-valuenow', '8');
});

test('caz orgunda şarkı çalar çalışır; parçanın registrasyonu çekme çubuklarına dokunmaz', async ({ page }) => {
  await sayfayiAc(page, 'caz-orgu.html?parca=gorsev-icin-balad');
  await expect(page.locator('#calarAd')).toHaveText('Görsev İçin Balad');
  await page.evaluate(() => { window.kiliseOrgu.hiz(150); window.kiliseOrgu.calar.gunluk = []; window.kiliseOrgu.basla(); });
  await expect.poll(() => page.evaluate(() => window.kiliseOrgu.calar.gunluk.length), { timeout: 10_000 }).toBeGreaterThan(4);
  await expect.poll(() => calanlar(page)).not.toEqual([]);
  await page.evaluate(() => window.kiliseOrgu.durdur());
  await expect(page.locator('#cekmeKodu')).toHaveText('888000000');
});

test('diskten (file://) açılan caz orgu da çalışır', async ({ page, isMobile }) => {
  test.skip(isMobile, 'masaüstünde koşar');
  const hatalar = await sayfayiAc(page, 'file://' + path.join(KOK, 'caz-orgu.html'));
  await page.keyboard.down('KeyY');
  expect(await calanlar(page)).toEqual(['La4']);
  await page.keyboard.up('KeyY');
  expect(hatalar).toEqual([]);
});

/* ---- Gerçek ses ---- */
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
// lo–hi aralığındaki en güçlü tepe (parabolik ara değerle) ve gücü
const tepe = (page, lo, hi) => page.evaluate(([lo, hi]) => {
  const a = window.__analizor, d = new Float32Array(a.frequencyBinCount);
  a.getFloatFrequencyData(d);
  const hz = a.context.sampleRate / a.fftSize;
  let en = -Infinity, k = 0;
  for (let i = Math.floor(lo / hz); i <= Math.ceil(hi / hz); i++) if (d[i] > en) { en = d[i]; k = i; }
  const [y0, y1, y2] = [d[k - 1], d[k], d[k + 1]];
  return { frekans: (k + ((y0 - y2) / (2 * (y0 - 2 * y1 + y2)) || 0)) * hz, db: en };
}, [lo, hi]);

// Son n örnekteki (≈85 ms) hz frekansının düzeyi, dB (Hann pencereli Goertzel): kısa vuruşları ölçmek için
const anlik = (page, hz, n = 4096) => page.evaluate(([hz, n]) => {
  const a = window.__analizor, d = new Float32Array(a.fftSize);
  a.getFloatTimeDomainData(d);
  const x = d.subarray(d.length - n), w = 2 * Math.PI * hz / a.context.sampleRate;
  let re = 0, im = 0;
  for (let i = 0; i < n; i++) {
    const h = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1));
    re += x[i] * h * Math.cos(w * i);
    im -= x[i] * h * Math.sin(w * i);
  }
  return 20 * Math.log10(Math.hypot(re, im) / n + 1e-12);
}, [hz, n]);

test.describe('ses', () => {
  test.skip(({ isMobile }) => isMobile, 'ses ölçümü masaüstünde koşar');
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(analizorKancasi);
    // Ölçüm için yalın ses: hoparlör, vibrato, sürüş, tıkırtı, perküsyon ve yankı kapalı
    await page.addInitScript(() => localStorage.setItem('caz-orgu-v1', JSON.stringify({
      reverb: 0, caz: { cekme: [0, 0, 0, 0, 0, 0, 0, 0, 0], perkusyon: false, harmonik: 3, hizli: true, yumusak: false, vibrato: 'kapali', hoparlor: 'kapali', surus: 0, tikirti: false },
    })));
    await sayfayiAc(page, 'caz-orgu.html');
  });

  // Ton tekerlekleri eşit akortlu: 5⅓′ pür beşli (660 Hz) değil, eşit akortlu beşli (659,26 Hz) öter
  for (const [ayak, beklenen] of [['16′', 220], ['5⅓′', 659.26], ['8′', 440], ['4′', 880], ['2⅔′', 1318.51], ['1⅗′', 2217.46]]) {
    test(`yalnızca ${ayak} çubuğu: La4 → ${beklenen} Hz`, async ({ page }) => {
      await cekme(page, ayak).focus();
      await page.keyboard.press('End');
      await page.keyboard.down('KeyY'); // La4
      await page.waitForTimeout(800);
      const t = await tepe(page, beklenen * 0.97, beklenen * 1.03);
      const alt = await tepe(page, 60, beklenen * 0.93);
      await page.keyboard.up('KeyY');
      expect(Math.abs(t.frekans - beklenen), `${t.frekans.toFixed(2)} Hz`).toBeLessThan(0.6);
      expect(t.db - alt.db).toBeGreaterThan(25);
    });
  }

  test('perküsyon: ilk notada vurur ve söner, legato çalınan notada vurmaz', async ({ page }) => {
    await cekme(page, '8′').focus();
    await page.keyboard.press('End');
    await page.locator('#perkusyon').click(); // 3. harmonik, hızlı
    await page.keyboard.down('KeyY'); // La4: perküsyon 1318,5 Hz'te
    await page.waitForTimeout(100);
    const ilk = await anlik(page, 1318.51);
    await page.waitForTimeout(900);
    const sonra = await anlik(page, 1318.51);
    expect(ilk - sonra, `vuruş sönmeli (${ilk.toFixed(1)} → ${sonra.toFixed(1)} dB)`).toBeGreaterThan(15);
    await page.keyboard.down('KeyI'); // La4 basılıyken Do5: perküsyon yeniden vurmamalı (1567,98 Hz)
    await page.waitForTimeout(100);
    const legato = await anlik(page, 1567.98);
    await page.keyboard.up('KeyI');
    await page.keyboard.up('KeyY');
    expect(ilk - legato, `legato notada vuruş yok (${legato.toFixed(1)} dB)`).toBeGreaterThan(15);
    await page.waitForTimeout(300);
    await page.keyboard.down('KeyI'); // bütün tuşlar bırakıldıktan sonra: yeniden vurur
    await page.waitForTimeout(100);
    const yeniden = await anlik(page, 1567.98);
    await page.keyboard.up('KeyI');
    expect(yeniden - legato).toBeGreaterThan(15);
  });

  test('dönen hoparlör Hızlı\'ya geçince boru çabuk, tambur ağır hızlanır', async ({ page }) => {
    await cekme(page, '8′').focus();
    await page.keyboard.press('End');
    await page.keyboard.down('KeyY');
    await page.keyboard.up('KeyY'); // ses motoru kurulsun
    await page.locator('[data-hoparlor="yavas"]').click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.kiliseOrgu.donenHoparlor())).toEqual({ boru: expect.closeTo(0.83, 1), tambur: expect.closeTo(0.67, 1) });
    await page.keyboard.press('Backquote'); // ` tuşu: Hızlı
    await expect(page.locator('[data-hoparlor="hizli"]')).toHaveAttribute('aria-pressed', 'true');
    await page.waitForTimeout(700);
    const h = await page.evaluate(() => window.kiliseOrgu.donenHoparlor());
    expect(h.boru).toBeGreaterThan(5);      // boru neredeyse tam hızda
    expect(h.tambur).toBeLessThan(4);       // tambur hâlâ hızlanıyor
    await page.waitForTimeout(4500);
    expect((await page.evaluate(() => window.kiliseOrgu.donenHoparlor())).tambur).toBeGreaterThan(5.5);
  });
});
