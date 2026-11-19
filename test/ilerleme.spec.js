// İlerleme: Öğren'de bitirilen parçanın en iyi sonucu saklanır, listede yıldızla görünür.
const { test, expect } = require('@playwright/test');
const { sayfayiAc } = require('./yardimci');

// Öğren'i baştan sona çalar: önce `yanlis` kez yanlış nota, sonra her adımın notaları
async function ogrenBitir(page, yanlis = 0) {
  await page.locator('#calarOynat').click();
  await page.evaluate(yanlis => {
    const k = window.kiliseOrgu;
    for (let i = 0; i < yanlis; i++) { k.cal(20); k.birak(20); }
    while (k.calar.adim < k.calar.adimlar.length) {
      const a = k.calar.adimlar[k.calar.adim];
      a.notalar.forEach(m => k.cal(m));
      a.notalar.forEach(m => k.birak(m));
    }
  }, yanlis);
  await expect.poll(() => page.evaluate(() => window.kiliseOrgu.calar.durum), { timeout: 30_000 }).toBe('bitti');
}

const kayit = page => page.evaluate(() => window.kiliseOrgu.ilerleme());
const satir = (page, id) => page.locator(`.parca-satiri[data-id="${id}"]`);
const listeyiAc = async page => { await page.locator('#parcalarBtn').click(); await expect(page.locator('#parcaListesi')).toBeVisible(); };

test('Öğren bitince sonuç saklanır; daha iyisi gelince yenilenir, kötüsü sayılır ama en iyiyi bozmaz', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=neseye-ovgu&mod=ogren');
  const adim = await page.evaluate(() => window.kiliseOrgu.calar.adimlar.length);

  await ogrenBitir(page, 4);
  await expect(page.locator('#calarDurum')).toHaveText(`Bitti: ${adim} adım, 4 yanlış tuş · İlk kez bitirdin!`);
  expect((await kayit(page))['neseye-ovgu'].sag).toMatchObject({ adim, yanlis: 4, kez: 1 });

  await ogrenBitir(page, 0);
  await expect(page.locator('#calarDurum')).toHaveText(`Bitti: ${adim} adım, 0 yanlış tuş · Yeni en iyi sonuç! (önceki: 4 yanlış)`);

  await ogrenBitir(page, 2);
  await expect(page.locator('#calarDurum')).toHaveText(`Bitti: ${adim} adım, 2 yanlış tuş · En iyi: 0 yanlış`);
  expect((await kayit(page))['neseye-ovgu'].sag).toMatchObject({ adim, yanlis: 0, kez: 3 });

  // Hazırken durum satırı en iyi sonucu hatırlatır
  await page.locator('#calarBas').click();
  await expect(page.locator('#calarDurum')).toContainText('En iyi (sağ el): 0 yanlış');

  // Listede üç yıldız; sayfa yenilenince ve caz orgunda da
  await listeyiAc(page);
  await expect(satir(page, 'neseye-ovgu').locator('.p-yildiz')).toHaveText('★★★');
  await expect(satir(page, 'neseye-ovgu').locator('.p-yildiz')).toHaveAttribute('aria-label', 'Öğrenildi, 3/3 yıldız');
  await expect(satir(page, 'fur-elise').locator('.p-yildiz')).toHaveCount(0);
  await page.goto('caz-orgu.html');
  await listeyiAc(page);
  await expect(satir(page, 'neseye-ovgu').locator('.p-yildiz')).toHaveText('★★★');
});

test('elle göre ayrı sonuç; yıldız yanlışların oranına göre', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=gorsev-icin-balad&mod=ogren');
  await page.locator('#elSol').selectOption('ben'); // iki el
  const adim = await page.evaluate(() => window.kiliseOrgu.calar.adimlar.length);
  const cok = Math.floor(adim * 0.05) + 1; // yüzde 5'i aşan yanlış: bir yıldız
  await ogrenBitir(page, cok);
  const k = await kayit(page);
  expect(k['gorsev-icin-balad'].iki).toMatchObject({ adim, yanlis: cok });
  expect(k['gorsev-icin-balad'].sag).toBeUndefined();
  await listeyiAc(page);
  await expect(satir(page, 'gorsev-icin-balad').locator('.p-yildiz')).toHaveText('★☆☆');
});

test('ortadan başlanan ya da atlanan Öğren sonuç sayılmaz', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=neseye-ovgu&mod=ogren');
  await page.evaluate(() => window.kiliseOrgu.git(960 * 8));
  await ogrenBitir(page);
  await expect(page.locator('#calarDurum')).not.toContainText('bitirdin');
  expect(await kayit(page)).toEqual({});
  // Bitince yeniden başlatmak baştan sayılır
  await ogrenBitir(page);
  expect(Object.keys(await kayit(page))).toEqual(['neseye-ovgu']);
});

test('bozuk ilerleme kaydı sayfayı bozmaz', async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('kuruldu')) {
      sessionStorage.setItem('kuruldu', '1');
      localStorage.setItem('kilise-orgu-ilerleme',
        '{"neseye-ovgu":{"sag":{"adim":"çok","yanlis":-1}},"__proto__":{"iki":{"adim":3,"yanlis":0}},"constructor":5,"air":{"iki":{"adim":10,"yanlis":1,"kez":2}}}');
    }
  });
  const hatalar = await sayfayiAc(page);
  await listeyiAc(page);
  await expect(satir(page, 'neseye-ovgu').locator('.p-yildiz')).toHaveCount(0);
  await expect(satir(page, 'air').locator('.p-yildiz')).toHaveText('★☆☆');
  expect(await kayit(page)).toEqual({ air: { iki: { adim: 10, yanlis: 1, kez: 2, tarih: '' } } });
  expect(hatalar).toEqual([]);
});
