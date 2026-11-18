const { test, expect } = require('@playwright/test');
const { PISTONLAR, REGISTERLER, sayfayiAc, register, piston, acikRegisterler } = require('./yardimci');

test.beforeEach(async ({ page }) => { await sayfayiAc(page); });

test('ilk açılışta Plenum seçilidir', async ({ page }) => {
  expect((await acikRegisterler(page)).sort()).toEqual([...PISTONLAR[5].registerler].sort());
  await expect(piston(page, 5)).toHaveAttribute('aria-current', 'true');
});

test('her piston tam olarak kendi registerlerini açar', async ({ page }) => {
  for (const [n, { ad, registerler }] of Object.entries(PISTONLAR)) {
    await piston(page, n).click();
    expect((await acikRegisterler(page)).sort(), `piston ${n} (${ad})`).toEqual([...registerler].sort());
    await expect(piston(page, n)).toHaveAttribute('aria-current', 'true');
    await expect(piston(page, n)).toContainText(ad);
  }
});

test('register düğmeleri tek tek açılıp kapanır', async ({ page }) => {
  await piston(page, 0).click();
  for (const id of REGISTERLER) {
    await register(page, id).click();
    expect(await acikRegisterler(page)).toEqual([id]);
    await register(page, id).click();
    expect(await acikRegisterler(page)).toEqual([]);
  }
});

test('ayarlar sayfa yenilenince korunur', async ({ page, isMobile }) => {
  await piston(page, 3).click();
  // Telefonda oktavı klavyenin üstündeki › değiştirir (Do4 – Do5 penceresi bir oktav yukarı kayınca manuel de kayar)
  await page.locator(isMobile ? '#pencereSag' : '#octUp').click();
  await page.locator('#room').selectOption('katedral');
  await page.reload();
  await expect(page.locator('#octOut')).toHaveText('Do4 – Sol6');
  await expect(page.locator('#room')).toHaveValue('katedral');
  expect((await acikRegisterler(page)).sort()).toEqual([...PISTONLAR[3].registerler].sort());
});
