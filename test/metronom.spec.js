// Metronom: serbest tempo, parçanın vuruşlarına uyması, ölçü ızgarası; bölüm yinelemesi.
const { test, expect } = require('@playwright/test');
const { sayfayiAc } = require('./yardimci');

const gunluk = page => page.evaluate(() => window.kiliseOrgu.metronom.gunluk.slice());
const sifirla = page => page.evaluate(() => { window.kiliseOrgu.metronom.gunluk = []; window.kiliseOrgu.calar.gunluk = []; });
const araliklar = g => g.slice(1).map((v, i) => v.zaman - g[i].zaman);

test('serbest metronom: seçilen tempoda vurur, ölçünün ilk vuruşu vurgulu; kapatınca susar', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#metronomTempo').fill('150');
  await page.locator('#metronomOlcu').selectOption('3');
  await page.locator('#metronomBtn').click();
  await expect(page.locator('#metronomBtn')).toHaveAttribute('aria-pressed', 'true');
  await sifirla(page);
  await expect.poll(async () => (await gunluk(page)).length, { timeout: 5000 }).toBeGreaterThanOrEqual(7);
  const g = await gunluk(page);
  expect(g.every(v => v.kaynak === 'serbest')).toBe(true);
  for (const a of araliklar(g)) expect(a).toBeCloseTo(0.4, 3); // 150 vuruş/dk
  const vurgular = g.map((v, i) => (v.vurgu ? i : -1)).filter(i => i >= 0);
  expect(vurgular.length).toBeGreaterThanOrEqual(2);
  for (let i = 1; i < vurgular.length; i++) expect(vurgular[i] - vurgular[i - 1]).toBe(3);
  // Işık vuruşta yanar
  await expect(page.locator('#metronomIsik.vur, #metronomIsik.vurgu')).toHaveCount(1, { timeout: 2000 });

  await page.locator('#metronomBtn').click();
  await expect(page.locator('#metronomBtn')).toHaveAttribute('aria-pressed', 'false');
  await sifirla(page);
  await page.waitForTimeout(600);
  expect(await gunluk(page)).toEqual([]);

  // Tempo ve ölçü saklanır
  await page.reload();
  await expect(page.locator('#metronomTempo')).toHaveValue('150');
  await expect(page.locator('#metronomOlcu')).toHaveValue('3');
});

test('tempo alanı sınırların dışına çıkmaz', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#metronomTempo').fill('999');
  await page.locator('#metronomTempo').blur();
  await expect(page.locator('#metronomTempo')).toHaveValue('240');
  await page.locator('#metronomTempo').fill('');
  await page.locator('#metronomTempo').blur();
  await expect(page.locator('#metronomTempo')).toHaveValue('240');
});

test('parça çalarken metronom parçanın vuruşuna geçer: vuruşlar notalarla aynı anda', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=neseye-ovgu');
  await page.locator('#metronomTempo').fill('70'); // serbest tempo parçanınkinden farklı
  await page.locator('#metronomBtn').click();
  await page.evaluate(() => window.kiliseOrgu.hiz(200));
  await sifirla(page);
  await page.locator('#calarOynat').click();
  await expect(page.locator('#metronomDurum')).toHaveText('parçanın vuruşunda');
  await expect(page.locator('#metronomTempo')).toBeDisabled();
  await expect.poll(async () => (await gunluk(page)).filter(v => v.kaynak === 'parca').length, { timeout: 5000 }).toBeGreaterThanOrEqual(9);
  const g = (await gunluk(page)).filter(v => v.kaynak === 'parca');
  // Neşeye Övgü: 4/4, dörtlük 120; hız %200 → 0,25 saniyede bir vuruş, dört vuruşta bir vurgu
  for (const a of araliklar(g)) expect(a).toBeCloseTo(0.25, 3);
  expect(g.slice(0, 9).map(v => v.vurgu)).toEqual([true, false, false, false, true, false, false, false, true]);
  // İlk vuruş parçanın ilk notasıyla aynı anda
  const notalar = await page.evaluate(() => window.kiliseOrgu.calar.gunluk);
  expect(g[0].zaman).toBeCloseTo(notalar[0].bas, 4);
  // Duraklatınca serbest tempoya döner
  await page.locator('#calarOynat').click();
  await expect(page.locator('#metronomDurum')).toHaveText('');
  await expect(page.locator('#metronomTempo')).toBeEnabled();
  await sifirla(page);
  await expect.poll(async () => (await gunluk(page)).length, { timeout: 5000 }).toBeGreaterThanOrEqual(3);
  const s = await gunluk(page);
  expect(s.every(v => v.kaynak === 'serbest')).toBe(true);
  for (const a of araliklar(s)) expect(a).toBeCloseTo(60 / 70, 3);
});

test('ölçü ızgarası: ön vuruş, birleşik ölçü, 4/2', async ({ page }) => {
  await sayfayiAc(page);
  const ilk = (id, n) => page.evaluate(([id, n]) => window.kiliseOrgu.vuruslar(id).slice(0, n).map(v => [v.t, v.vurgu]), [id, n]);
  // Für Elise, 3/8: bir sekizlik ön vuruş, sonra sekizlik vuruşlar; ölçü çizgileri ön vuruştan sonra
  expect(await ilk('fur-elise', 5)).toEqual([[0, false], [480, true], [960, false], [1440, false], [1920, true]]);
  expect((await page.evaluate(() => window.kiliseOrgu.olcuCizgileri('fur-elise'))).slice(0, 3)).toEqual([480, 1920, 3360]);
  // Sessiz Gece, 6/8 (noktalı dörtlük 42): ölçüde iki vuruş
  expect(await ilk('sessiz-gece', 4)).toEqual([[0, true], [1440, false], [2880, true], [4320, false]]);
  // Tristan, 6/8 çok ağır (noktalı dörtlük 29): sekizlik vuruş, ölçüde altı
  expect((await ilk('tristan', 7)).map(v => v[1])).toEqual([true, false, false, false, false, false, true]);
  // Old Hundredth, 4/2: ikilik vuruş
  expect(await ilk('old-hundredth', 5)).toEqual([[0, true], [1920, false], [3840, false], [5760, false], [7680, true]]);
  // Türk Marşı, 2/4: dört onaltılık ön vuruş, ilk vurgulu vuruş ölçü başında
  expect(await ilk('turk-marsi', 2)).toEqual([[0, false], [960, true]]);
});

test('bölüm yinelemesi ortadan başlanınca bölümün başını da çalar', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=neseye-ovgu');
  const b = await page.evaluate(() => window.kiliseOrgu.cizelge('neseye-ovgu').bolumler[0]);
  const orta = b.bas + 960 * 8;
  await page.locator('#calarDongu').click();
  await page.evaluate(([orta]) => { window.kiliseOrgu.hiz(400); window.kiliseOrgu.git(orta); }, [orta]);
  await sifirla(page);
  await page.locator('#calarOynat').click();
  // İkinci turda bölümün ilk notası da zamanlanır
  await expect.poll(() => page.evaluate(([bas]) => window.kiliseOrgu.calar.gunluk.some(g => g.tik === bas), [b.bas]), { timeout: 20_000 }).toBe(true);
  const g = await page.evaluate(() => window.kiliseOrgu.calar.gunluk);
  expect(g[0].tik).toBeGreaterThanOrEqual(orta);
});
