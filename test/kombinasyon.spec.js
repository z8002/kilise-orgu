// Kendi kombinasyonların: "Ayarla" ile o anki registrasyon (üç bölüm ve kuplörler) K1–K4'e kaydedilir.
const { test, expect } = require('@playwright/test');
const { sayfayiAc, piston, register, acikRegisterler, PISTONLAR } = require('./yardimci');

const tumAciklar = page => page.evaluate(() => [...document.querySelectorAll('.knob[aria-pressed="true"]')].map(k => k.dataset.id).sort());
const kuplorAcik = (page, ad) => page.getByRole('button', { name: ad, exact: true }).getAttribute('aria-pressed');
const kendi = (page, n) => page.locator(`.kendi[data-no="${n}"]`);

test('Ayarla ile kaydedilen kombinasyon geri çağrılır; sayfa yenilenince de durur', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#konsolTam').click();
  // Kendi registrasyonu: Kornet + Trompet + Sandık'ta Vox humana, II→I kuplörü
  await piston(page, 4).click();
  await register(page, 'trompet8').click();
  await page.locator('.knob[data-id="voxhumana8"]').click();
  await page.getByRole('button', { name: 'II → I', exact: true }).click();
  const kayit = await tumAciklar(page);

  await page.locator('#ayarla').click();
  await expect(page.locator('#ayarla')).toHaveAttribute('aria-pressed', 'true');
  await kendi(page, 2).click();
  await expect(page.locator('#ayarla')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#kombinasyonDurum')).toContainText('K2');
  await expect(kendi(page, 2)).toHaveAttribute('aria-current', 'true');

  await piston(page, 0).click(); // her şey kapalı
  await page.getByRole('button', { name: 'II → I', exact: true }).click();
  expect(await tumAciklar(page)).toEqual([]);
  await kendi(page, 2).click();
  expect(await tumAciklar(page)).toEqual(kayit);
  expect(await kuplorAcik(page, 'II → I')).toBe('true');
  await expect(kendi(page, 2)).toHaveAttribute('aria-current', 'true');
  await expect(piston(page, 4)).toHaveAttribute('aria-current', 'false');

  await piston(page, 1).click();
  await page.reload();
  await kendi(page, 2).click();
  expect(await tumAciklar(page)).toEqual(kayit);
});

test('boş kendi kombinasyonu registrasyonu değiştirmez, ne yapılacağını söyler', async ({ page }) => {
  await sayfayiAc(page);
  await kendi(page, 3).click();
  expect((await acikRegisterler(page)).sort()).toEqual([...PISTONLAR[5].registerler].sort());
  await expect(page.locator('#kombinasyonDurum')).toContainText('Ayarla');
  await expect(kendi(page, 3)).toHaveAttribute('data-dolu', 'false');
});

test('Ayarla açıkken bir hazır pistona basmak onu değiştirmez, Ayarla kapanır', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#ayarla').click();
  await piston(page, 2).click();
  await expect(page.locator('#ayarla')).toHaveAttribute('aria-pressed', 'false');
  expect((await acikRegisterler(page)).sort()).toEqual([...PISTONLAR[2].registerler].sort());
});
