const { test, expect } = require('@playwright/test');
const { ALT_SIRA, UST_SIRA, notaAdi, tabanMidi, tusMidi, sayfayiAc, calanlar } = require('./yardimci');

test.skip(({ isMobile }) => isMobile, 'bilgisayar klavyesi testleri masaüstünde koşar');

test.beforeEach(async ({ page }) => { await sayfayiAc(page); });

test('açılışta oktav kutusu Do3 – Sol5 gösterir', async ({ page }) => {
  await expect(page.locator('#octOut')).toHaveText('Do3 – Sol5');
});

test('her tuş, beş oktav konumunun hepsinde doğru notayı çalar', async ({ page }) => {
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowDown'); // en alta in (oktav 1)
  for (let oktav = 1; oktav <= 5; oktav++) {
    await expect(page.locator('#octOut')).toHaveText(`${notaAdi(tabanMidi(oktav))} – ${notaAdi(tabanMidi(oktav) + 31)}`);
    for (const kod of [...ALT_SIRA, ...UST_SIRA]) {
      await page.keyboard.down(kod);
      expect(await calanlar(page), `oktav ${oktav}, tuş ${kod}`).toEqual([notaAdi(tusMidi(kod, oktav))]);
      await page.keyboard.up(kod);
      expect(await calanlar(page), `oktav ${oktav}, tuş ${kod} bırakıldı`).toEqual([]);
    }
    await page.keyboard.press('ArrowUp');
  }
});

test('iki sıranın ortak notaları aynı sesi paylaşır', async ({ page }) => {
  // Alt sıradaki Ö (Comma) ile üst sıradaki Q aynı Do4'tür.
  await page.keyboard.down('Comma');
  await page.keyboard.down('KeyQ');
  expect(await calanlar(page)).toEqual(['Do4']);
  await page.keyboard.up('Comma');
  expect(await calanlar(page)).toEqual(['Do4']);
  await page.keyboard.up('KeyQ');
  expect(await calanlar(page)).toEqual([]);
});

test('akor: basılan bütün notalar birlikte çalar', async ({ page }) => {
  for (const kod of ['KeyZ', 'KeyC', 'KeyB']) await page.keyboard.down(kod);
  expect(await calanlar(page)).toEqual(['Do3', 'Mi3', 'Sol3']);
  for (const kod of ['KeyZ', 'KeyC', 'KeyB']) await page.keyboard.up(kod);
  expect(await calanlar(page)).toEqual([]);
});

test('Boşluk basılıyken bırakılan nota çalmaya devam eder', async ({ page }) => {
  await page.keyboard.down('Space');
  await page.keyboard.down('KeyQ');
  await page.keyboard.up('KeyQ');
  expect(await calanlar(page)).toEqual(['Do4']);
  await page.keyboard.up('Space');
  expect(await calanlar(page)).toEqual([]);
});

test('Esc bütün sesleri susturur', async ({ page }) => {
  await page.keyboard.down('KeyQ');
  await page.keyboard.down('KeyE');
  expect(await calanlar(page)).toEqual(['Do4', 'Mi4']);
  await page.keyboard.press('Escape');
  expect(await calanlar(page)).toEqual([]);
});

test('ekrandaki klavyeye fareyle basılabilir', async ({ page }) => {
  const tus = page.locator('#manual .key').nth(0);
  await tus.scrollIntoViewIfNeeded();
  const kutu = await tus.boundingBox();
  await page.mouse.move(kutu.x + kutu.width / 2, kutu.y + kutu.height * 0.8);
  await page.mouse.down();
  expect(await calanlar(page)).toEqual(['Do3']);
  await page.mouse.up();
  expect(await calanlar(page)).toEqual([]);
});
