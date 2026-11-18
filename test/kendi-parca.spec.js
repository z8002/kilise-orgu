// Kendi parçan: formdan yazılan parça saklanır, listede çıkar, otuz parça gibi çalınır ve silinir.
const { test, expect } = require('@playwright/test');
const { sayfayiAc } = require('./yardimci');

async function parcaYaz(page, { ad, sag, sol = '', tempo = '120', olcu = '4/4' }) {
  await page.locator('#parcalarBtn').click();
  await page.locator('#kendiParcaBtn').click();
  await expect(page.locator('#parcaEkle')).toBeVisible();
  await page.locator('#kpAd').fill(ad);
  await page.locator('#kpOlcu').selectOption(olcu);
  await page.locator('#kpTempo').fill(tempo);
  await page.locator('#kpSag').fill(sag);
  await page.locator('#kpSol').fill(sol);
  await page.locator('#kpKaydet').click();
}

test('Türkçe nota adlarıyla yazılan parça kaydedilir, açılır ve doğru notalarla çalınır', async ({ page }) => {
  const hatalar = await sayfayiAc(page);
  await parcaYaz(page, { ad: 'Deneme Ezgisi', sag: 'Do4 Re4 Mi4 Fa#4 | Sol4:2 Sol4+Si4:2', sol: 'Do3:4 | Sol2:2' });
  await expect(page.locator('#parcaEkle')).toBeHidden();
  await expect(page.locator('#calarAd')).toHaveText('Deneme Ezgisi');
  await expect(page.locator('#calarBilgi')).toContainText('Senin yazdığın parça');
  const id = await page.evaluate(() => window.kiliseOrgu.calar.parca.id);
  expect(id).toMatch(/^kendi-/);
  const c = await page.evaluate(id => window.kiliseOrgu.cizelge(id), id);
  const el = e => c.olaylar.filter(o => o.el === e).map(o => [o.t / 960, o.d / 960, o.notalar]);
  expect(el('sag')).toEqual([[0, 1, [60]], [1, 1, [62]], [2, 1, [64]], [3, 1, [66]], [4, 2, [67]], [6, 2, [67, 71]]]);
  expect(el('sol')).toEqual([[0, 4, [48]], [4, 2, [43]]]); // kısa kalan sol el susla tamamlanır
  expect(c.toplam).toBe(8 * 960);

  await page.evaluate(() => { window.kiliseOrgu.hiz(150); window.kiliseOrgu.calar.gunluk = []; window.kiliseOrgu.basla(); });
  await expect.poll(() => page.evaluate(() => window.kiliseOrgu.calar.durum), { timeout: 10_000 }).toBe('bitti');
  const gunluk = await page.evaluate(() => window.kiliseOrgu.calar.gunluk.map(g => `${g.el}:${g.notalar.join('+')}`));
  expect(gunluk.sort()).toEqual(['sag:60', 'sag:62', 'sag:64', 'sag:66', 'sag:67', 'sag:67+71', 'sol:43', 'sol:48']);
  expect(hatalar).toEqual([]);
});

test('İngilizce adlar da olur; parça sayfa yenilenince ve caz orgunda da listede; silinir', async ({ page }) => {
  await sayfayiAc(page);
  await parcaYaz(page, { ad: 'Kısa Ezgi', sag: 'C4 E4 G4 Bb4:2 r ~', olcu: '3/4' });
  await expect(page.locator('#calarAd')).toHaveText('Kısa Ezgi');
  await page.reload();
  await page.locator('#parcalarBtn').click();
  await page.locator('.etiket', { hasText: 'Kendi parçaların' }).click();
  await expect(page.locator('.parca-satiri .p-ad')).toHaveText(['Kısa Ezgi']);
  await page.goto('caz-orgu.html');
  await page.locator('#parcalarBtn').click();
  await expect(page.locator('.parca-satiri', { hasText: 'Kısa Ezgi' })).toHaveCount(1);
  page.once('dialog', d => d.accept());
  await page.getByRole('button', { name: 'Kısa Ezgi parçasını sil' }).click();
  await expect(page.locator('.parca-satiri', { hasText: 'Kısa Ezgi' })).toHaveCount(0);
  await expect(page.locator('.etiket', { hasText: 'Kendi parçaların' })).toHaveCount(0);
  await page.reload();
  expect(await page.evaluate(() => window.kiliseOrgu.parcalar.length)).toBe(30);
});

test('yanlış yazım kaydedilmez, nerede olduğu söylenir', async ({ page }) => {
  await sayfayiAc(page);
  await parcaYaz(page, { ad: 'Hatalı', sag: 'Do4 Xa4 Mi4' });
  await expect(page.locator('#kpHata')).toContainText('Xa4');
  await page.locator('#kpSag').fill('Do4:0 Re4');
  await page.locator('#kpKaydet').click();
  await expect(page.locator('#kpHata')).toContainText('Do4:0');
  await page.locator('#kpAd').fill('');
  await page.locator('#kpSag').fill('Do4');
  await page.locator('#kpKaydet').click();
  await expect(page.locator('#kpHata')).toContainText('ad');
  expect(await page.evaluate(() => window.kiliseOrgu.parcalar.length)).toBe(30);
});

test('Öğren kendi parçanda da adım adım ilerler', async ({ page, isMobile }) => {
  test.skip(isMobile, 'bilgisayar klavyesiyle çalınır');
  await sayfayiAc(page);
  await parcaYaz(page, { ad: 'Üç Nota', sag: 'Do4 Re4 Mi4' });
  await page.locator('#modOgren').click();
  await page.locator('#calarOynat').click();
  for (const tus of ['KeyQ', 'KeyW', 'KeyE']) { await page.keyboard.down(tus); await page.keyboard.up(tus); }
  await expect.poll(() => page.evaluate(() => window.kiliseOrgu.calar.durum)).toBe('bitti');
  expect(await page.evaluate(() => window.kiliseOrgu.calar.yanlis)).toBe(0);
});
