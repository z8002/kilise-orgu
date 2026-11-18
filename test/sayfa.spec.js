const { test, expect } = require('@playwright/test');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sayfayiAc, calanlar } = require('./yardimci');

const KOK = path.resolve(__dirname, '..');

test('sayfa hatasız açılır ve org eksiksiz kurulur', async ({ page }) => {
  const hatalar = await sayfayiAc(page);
  await expect(page.locator('h1')).toHaveText('Kilise Orgu');
  await expect(page.locator('#manual .key.white')).toHaveCount(19);
  await expect(page.locator('#manual .key.black')).toHaveCount(13);
  await expect(page.locator('#jamb-temel .knob, #jamb-parlak .knob')).toHaveCount(13); // I. manuel
  await expect(page.locator('#jamb-sandik .knob')).toHaveCount(9);
  await expect(page.locator('#jamb-pedal .knob')).toHaveCount(4);
  await expect(page.locator('#pistons .piston')).toHaveCount(7);
  await expect(page.locator('#kendiPistonlar .piston')).toHaveCount(4); // K1–K4
  expect(hatalar).toEqual([]);
});

test('ana sayfa org sayfasına yönlendirir', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveURL(/kilise-orgu\.html$/);
});

test('diskten çift tıklayınca da (file://) çalışır', async ({ page, isMobile }) => {
  test.skip(isMobile, 'klavye testi masaüstünde koşar');
  const hatalar = await sayfayiAc(page, 'file://' + path.join(KOK, 'kilise-orgu.html'));
  await page.keyboard.down('KeyZ');
  expect(await calanlar(page)).toEqual(['Do3']);
  await page.keyboard.up('KeyZ');
  expect(hatalar).toEqual([]);
});

test('özgün sürüm (v1) değişmeden duruyor', async () => {
  const ozet = dosya => crypto.createHash('sha256').update(fs.readFileSync(path.join(KOK, dosya))).digest('hex');
  expect(ozet('v1/kilise-orgu.html')).toBe('c24a8da279c16ce6c19299f8ecdb57f836b4a6b895573218f13b44e38c8d63cd');
});
