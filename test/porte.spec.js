// Porte: parçanın notası çift portede yazılır, çalarken akar, Öğren'de sıradaki notayı yakar.
const { test, expect } = require('@playwright/test');
const { sayfayiAc } = require('./yardimci');

const svgMetni = page => page.locator('#porte').evaluate(s => s.innerHTML);

test('her parçanın notası yazılır: her olay bir nota grubu, her nota bir nota başı', async ({ page }) => {
  const hatalar = await sayfayiAc(page);
  const farklar = await page.evaluate(() => {
    const farklar = [];
    for (const p of window.kiliseOrgu.parcalar) {
      window.kiliseOrgu.yukle(p.id);
      const c = window.kiliseOrgu.cizelge(p.id);
      const svg = document.querySelector('#porte');
      const gruplar = svg.querySelectorAll('#porteAkan .porte-n');
      const baslar = svg.querySelectorAll('#porteAkan .porte-bas');
      const notaSayisi = c.olaylar.reduce((s, o) => s + o.notalar.length, 0);
      if (gruplar.length !== c.olaylar.length) farklar.push(`${p.id}: ${gruplar.length} grup, ${c.olaylar.length} olay`);
      if (baslar.length !== notaSayisi) farklar.push(`${p.id}: ${baslar.length} nota başı, ${notaSayisi} nota`);
      if (/NaN|undefined|Infinity/.test(svg.innerHTML)) farklar.push(`${p.id}: geçersiz değer`);
      // El başına bir porte: beş çizgi, bir anahtar
      if (svg.querySelectorAll('.porte-cizgi').length !== 5 * c.eller.length) farklar.push(`${p.id}: porte çizgisi sayısı`);
      if (svg.querySelectorAll('.porte-anahtar').length !== c.eller.length) farklar.push(`${p.id}: anahtar sayısı`);
      if (!(Number(svg.getAttribute('height')) > 0)) farklar.push(`${p.id}: yükseklik`);
    }
    return farklar;
  });
  expect(farklar).toEqual([]);
  expect(hatalar).toEqual([]);
});

test('ton donanımı, ölçü işareti ve değiştirici işaretler doğru yazılır', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=sheep-may-safely-graze');
  // Si♭ majör: her portede iki bemol
  const portesayisi = await page.locator('#porte .porte-anahtar').count();
  await expect(page.locator('#porte .porte-isaret.donanim')).toHaveCount(2 * portesayisi);
  await expect(page.locator('#porte .porte-isaret.donanim').first()).toHaveText('♭');
  await expect(page.locator('#porte .porte-olcu-sayi').first()).toHaveText('4');

  // La minör, 3/8: donanım yok; Re♯ diyezle yazılır
  await page.evaluate(() => window.kiliseOrgu.yukle('fur-elise'));
  await expect(page.locator('#porte .porte-isaret.donanim')).toHaveCount(0);
  await expect(page.locator('#porte .porte-olcu-sayi').nth(1)).toHaveText('8');
  const ilk = await page.evaluate(() => {
    const c = window.kiliseOrgu.cizelge('fur-elise');
    const gruplar = document.querySelectorAll('#porteAkan .porte-n');
    return c.olaylar.slice(0, 4).map((o, i) => [o.notalar.join(','), gruplar[i].querySelector('.porte-isaret')?.textContent || '']);
  });
  // Mi5 Re♯5 Mi5 Re♯5: ilk Re♯ ön vuruşta işaretli, ölçü çizgisinden sonraki ilk Re♯ yeniden işaretli
  expect(ilk).toEqual([['76', ''], ['75', '♯'], ['76', ''], ['75', '♯']]);

  // Re minör baladda sol elin ikinci akorundaki Do♯ işaretli; yeni ölçüde Do (natürel) işaretsiz
  await page.evaluate(() => window.kiliseOrgu.yukle('gorsev-icin-balad'));
  const sol = await page.evaluate(() => {
    const c = window.kiliseOrgu.cizelge('gorsev-icin-balad');
    const gruplar = document.querySelectorAll('#porteAkan .porte-n');
    return c.olaylar.map((o, i) => [o.el, o.notalar.join(','), [...gruplar[i].querySelectorAll('.porte-isaret')].map(e => e.textContent).join('')])
      .filter(x => x[0] === 'sol').slice(0, 3);
  });
  expect(sol).toEqual([['sol', '50,62', ''], ['sol', '50,61', '♯'], ['sol', '50,60', '']]);
});

test('Dinle: çalarken notalar akar, çalan notalar yanar', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=neseye-ovgu');
  const kayma = () => page.locator('#porteAkan').evaluate(g => Number(/translate\((-?[\d.]+)/.exec(g.getAttribute('transform'))[1]));
  expect(await kayma()).toBe(0);
  await expect(page.locator('#porte .porte-n.calan')).toHaveCount(0);
  await page.evaluate(() => window.kiliseOrgu.hiz(200));
  await page.locator('#calarOynat').click();
  await expect(page.locator('#porte .porte-n.calan').first()).toBeVisible();
  await expect.poll(kayma).toBeLessThan(-50);
  // İmleç notanın hemen solunda, yerinde durur
  const imlec = await page.locator('#porteImlec').getAttribute('x1');
  await page.waitForTimeout(400);
  expect(Math.abs(Number(await page.locator('#porteImlec').getAttribute('x1')) - Number(imlec))).toBeLessThan(2);
  await page.locator('#calarOynat').click(); // duraklat: vurgu söner
  await expect(page.locator('#porte .porte-n.calan')).toHaveCount(0);
});

test('Öğren: sıradaki adımın notaları yeşil yanar', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=neseye-ovgu&mod=ogren');
  await expect(page.locator('#porte .porte-n.hedef')).toHaveCount(0);
  await page.locator('#calarOynat').click();
  await expect(page.locator('#porte .porte-n.hedef')).toHaveCount(1);
  const ilk = await page.locator('#porte .porte-n.hedef').getAttribute('data-i');
  // İlk adımı çal: vurgu sonraki notaya geçer
  const adim = await page.evaluate(() => window.kiliseOrgu.calar.adimlar[0].notalar);
  await page.evaluate(m => { m.forEach(n => window.kiliseOrgu.cal(n)); m.forEach(n => window.kiliseOrgu.birak(n)); }, adim);
  await expect(page.locator('#porte .porte-n.hedef')).toHaveCount(1);
  expect(await page.locator('#porte .porte-n.hedef').getAttribute('data-i')).not.toBe(ilk);
});

test('Nota düğmesi porteyi gizler; seçim sayfa yenilenince de kalır', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=air');
  await expect(page.locator('#porteKutu')).toBeVisible();
  await expect(page.locator('#porteBtn')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#porteBtn').click();
  await expect(page.locator('#porteKutu')).toBeHidden();
  await expect(page.locator('#porteBtn')).toHaveAttribute('aria-pressed', 'false');
  expect(await svgMetni(page)).toBe('');
  await page.reload();
  await expect(page.locator('#calar')).toBeVisible();
  await expect(page.locator('#porteKutu')).toBeHidden();
  await page.locator('#porteBtn').click();
  await expect(page.locator('#porteKutu')).toBeVisible();
  await expect(page.locator('#porte .porte-n').first()).toBeAttached();
});

test('caz orgunda da porte var', async ({ page }) => {
  await sayfayiAc(page, 'caz-orgu.html?parca=gorsev-icin-balad');
  await expect(page.locator('#porte .porte-anahtar')).toHaveCount(2);
});
