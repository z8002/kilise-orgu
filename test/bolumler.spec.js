// İki manuel ve pedal: bölümlerin registerleri, kuplörler, otomatik pedal, sandık panjuru, yeni registerler.
const { test, expect } = require('@playwright/test');
const { sayfayiAc, calanlar, piston } = require('./yardimci');

// Pistonların II. manuel (Sandık) ve pedal registerleri: sayfanın kodundan bağımsız kopya
const SANDIK = {
  1: ['rohrflut8', 'undamaris8'],
  2: ['rohrflut8', 'salisyonal8', 'traversflut4'],
  3: ['rohrflut8', 'salisyonal8'],
  4: ['rohrflut8', 'traversflut4'],
  5: ['flajole2', 'obua8', 'rohrflut8', 'salisyonal8', 'traversflut4'],
  6: ['flajole2', 'obua8', 'rohrflut8', 'salisyonal8', 'seskialtera', 'traversflut4'],
  0: [],
};
const PEDAL = {
  1: ['subbas16'], 2: ['oktavbas8', 'subbas16'], 3: ['subbas16'], 4: ['oktavbas8', 'subbas16'],
  5: ['koralbas4', 'oktavbas8', 'subbas16', 'trombon16'], 6: ['koralbas4', 'oktavbas8', 'subbas16', 'trombon16'], 0: [],
};
const PLENUM_I = ['burdon16', 'mikstur', 'oktav4', 'prinsipal8', 'superoktav2'];

/** Basılı notaların hangi borularla öttüğü: { 'Do4': ['oktav4', ...] } */
const borular = page => page.evaluate(() => window.kiliseOrgu.borular());

async function konsolTam(page) {
  await page.locator('#konsolTam').click();
  await expect(page.locator('html')).toHaveClass(/konsol-tam/);
}

test.describe('bilgisayar klavyesiyle', () => {
  test.skip(({ isMobile }) => isMobile, 'bilgisayar klavyesi masaüstünde');

  test('tek manuelde iki sıra da I. manueli çalar; iki manuelde üst sıra Sandık\'ı çalar', async ({ page }) => {
    await sayfayiAc(page);
    await expect(page.locator('#manual2')).toBeHidden();
    await page.keyboard.down('KeyQ'); // Do4, üst sıra
    expect((await borular(page)).Do4).toEqual(PLENUM_I);
    await page.keyboard.up('KeyQ');

    await konsolTam(page);
    await expect(page.locator('#manual2')).toBeVisible();
    await expect(page.locator('#pedal')).toBeVisible();
    await page.keyboard.down('KeyQ');
    await page.keyboard.down('KeyZ'); // Do3, alt sıra
    expect(await borular(page)).toEqual({ Do4: SANDIK[5], Do3: PLENUM_I });
    await expect(page.locator('#manual2 .key[data-off="12"]')).toHaveClass(/down/);
    await expect(page.locator('#manual .key[data-off="12"]')).not.toHaveClass(/down/);
    await page.keyboard.up('KeyQ');
    await page.keyboard.up('KeyZ');
    expect(await borular(page)).toEqual({});
  });

  test('kuplörler: II→I, I. manuele Sandık\'ın borularını da ekler; kapatınca çalan nota da bırakır', async ({ page }) => {
    await sayfayiAc(page);
    await konsolTam(page);
    await page.keyboard.down('KeyZ');
    await page.getByRole('button', { name: 'II → I', exact: true }).click();
    expect((await borular(page)).Do3).toEqual([...PLENUM_I, ...SANDIK[5]].sort());
    await page.getByRole('button', { name: 'II → I', exact: true }).click();
    expect((await borular(page)).Do3).toEqual(PLENUM_I);
    await page.keyboard.up('KeyZ');
  });

  test('aynı nota iki manuelde birden basılınca her boru bir kez öter', async ({ page }) => {
    await sayfayiAc(page);
    await konsolTam(page);
    await page.getByRole('button', { name: 'II → I', exact: true }).click();
    await page.keyboard.down('KeyQ'); // Do4, II
    await page.keyboard.down('Comma'); // Do4, I (alt sıranın 13. tuşu)
    expect((await borular(page)).Do4).toEqual([...PLENUM_I, ...SANDIK[5]].sort());
    await page.keyboard.up('Comma'); // I bırakıldı: yalnızca Sandık kalır
    expect((await borular(page)).Do4).toEqual(SANDIK[5]);
    await page.keyboard.up('KeyQ');
  });

  test('otomatik pedal: I. manuelin en kalın notası pedalda da çalar', async ({ page }) => {
    await sayfayiAc(page);
    await page.locator('#otoPedal').click();
    await page.keyboard.down('KeyV'); // Fa3
    await page.keyboard.down('KeyB'); // Sol3
    expect(await calanlar(page)).toEqual(['Fa2', 'Fa3', 'Sol3']);
    expect((await borular(page)).Fa2).toEqual(PEDAL[5]);
    await page.keyboard.down('KeyZ'); // Do3 en kalın oldu: pedal Do'ya geçer
    expect(await calanlar(page)).toEqual(['Do2', 'Do3', 'Fa3', 'Sol3']);
    for (const t of ['KeyV', 'KeyB', 'KeyZ']) await page.keyboard.up(t);
    expect(await calanlar(page)).toEqual([]);
    await page.locator('#otoPedal').click();
    await page.keyboard.down('KeyZ');
    expect(await calanlar(page)).toEqual(['Do3']); // kapalıyken pedal yok
    await page.keyboard.up('KeyZ');
  });

  test('pistonlar Sandık ve pedal registerlerini de ayarlar; kuplörlere dokunmaz', async ({ page }) => {
    await sayfayiAc(page);
    await konsolTam(page);
    await page.getByRole('button', { name: 'I → P', exact: true }).click();
    for (const n of [1, 2, 3, 4, 5, 6, 0]) {
      await piston(page, n).click();
      await expect(piston(page, n)).toHaveAttribute('aria-current', 'true');
      const acik = await page.evaluate(() => [...document.querySelectorAll('#jamb-sandik .knob[aria-pressed="true"], #jamb-pedal .knob[aria-pressed="true"]')].map(k => k.dataset.id).sort());
      expect(acik, `piston ${n}`).toEqual([...SANDIK[n], ...PEDAL[n]].sort());
    }
    await expect(page.getByRole('button', { name: 'I → P', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('pedal klavyesine fareyle basılır; I→P kuplörüyle I. manuelin boruları da öter', async ({ page }) => {
    await sayfayiAc(page);
    await konsolTam(page);
    const tus = page.locator('#pedal .key[data-off="0"]'); // Do2
    await tus.hover();
    await page.mouse.down();
    expect(await borular(page)).toEqual({ Do2: PEDAL[5] });
    await page.mouse.up();
    await page.getByRole('button', { name: 'I → P', exact: true }).click();
    await tus.hover();
    await page.mouse.down();
    expect((await borular(page)).Do2).toEqual([...PEDAL[5], ...PLENUM_I].sort());
    await page.mouse.up();
  });

  test('II. manuele fareyle basılır', async ({ page }) => {
    await sayfayiAc(page);
    await konsolTam(page);
    await page.locator('#manual2 .key[data-off="0"]').hover();
    await page.mouse.down();
    expect(await borular(page)).toEqual({ Do3: SANDIK[5] });
    await page.mouse.up();
  });

  test('konsol, kuplörler, otomatik pedal ve panjur sayfa yenilenince korunur', async ({ page }) => {
    await sayfayiAc(page);
    await konsolTam(page);
    await page.getByRole('button', { name: 'II → P', exact: true }).click();
    await page.locator('#otoPedal').click();
    await page.locator('#sandik').fill('30');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/konsol-tam/);
    await expect(page.getByRole('button', { name: 'II → P', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#otoPedal')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#sandik')).toHaveValue('30');
  });

  test('önceki sürümün kaydı (yalnızca I. manuel) Sandık ve pedal için Plenum\'u alır', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('kilise-orgu-v2', JSON.stringify({ room: 'kilise', reverb: 45, volume: 70, octave: 3, stops: ['gedakt8', 'flut4'] })));
    await sayfayiAc(page);
    await konsolTam(page);
    await page.keyboard.down('KeyQ');
    await page.keyboard.down('KeyZ');
    expect(await borular(page)).toEqual({ Do4: SANDIK[5], Do3: ['flut4', 'gedakt8'] });
    await page.keyboard.up('KeyQ');
    await page.keyboard.up('KeyZ');
  });
});

test('otomatik pedal şarkı çalarda da bas çalar', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=sessiz-gece');
  await page.locator('#otoPedal').click();
  await page.evaluate(() => { window.kiliseOrgu.hiz(150); window.kiliseOrgu.calar.gunluk = []; window.kiliseOrgu.basla(); });
  await expect.poll(() => page.evaluate(() => window.kiliseOrgu.pedalSesleri()), { timeout: 10_000 }).toBeGreaterThan(0);
  await page.evaluate(() => window.kiliseOrgu.durdur());
});

test.describe('sandık panjuru', () => {
  test.skip(({ isMobile }) => isMobile, 'masaüstünde koşar');

  test('panjur kapanınca Sandık kısılır ve koyulaşır, I. manuel değişmez', async ({ page }) => {
    await sayfayiAc(page);
    await konsolTam(page);
    // Sandık'ta bir nota basılı kalır: içinden ses akmayan süzgecin değerini tarayıcı güncellemeyebilir
    await page.keyboard.down('KeyQ');
    await page.waitForTimeout(300);
    const acik = await page.evaluate(() => window.kiliseOrgu.sandik());
    await page.locator('#sandik').fill('0');
    await expect.poll(() => page.evaluate(() => window.kiliseOrgu.sandik().kesim)).toBeLessThan(800);
    const kapali = await page.evaluate(() => window.kiliseOrgu.sandik());
    await page.keyboard.up('KeyQ');
    expect(kapali.kazanc).toBeLessThan(acik.kazanc * 0.5);
    expect(acik.kesim).toBeGreaterThan(15000);
  });
});

test.describe('telefonda', () => {
  test.skip(({ isMobile }) => !isMobile, 'telefon projesinde koşar');

  test('iki manuelde ekrandaki klavye seçilen bölümü çalar', async ({ page }) => {
    await sayfayiAc(page);
    await expect(page.locator('.bolum-secim')).toBeHidden();
    await page.locator('#konsolTam').tap();
    await expect(page.locator('.bolum-secim')).toBeVisible();
    await expect(page.locator('#manual2')).toBeHidden(); // telefonda tek klavye, bölümü seçilir
    await page.locator('.bolum-secim [data-bolum="II"]').tap();
    const k = await page.locator('#manual .key[data-off="12"]').boundingBox();
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: k.x + k.width / 2, y: k.y + k.height * 0.85, id: 1 }] });
    expect(await borular(page)).toEqual({ Do4: SANDIK[5] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.locator('.bolum-secim [data-bolum="P"]').tap();
    await expect(page.locator('#pencereSol')).toBeVisible();
    const etiket = await page.evaluate(() => getComputedStyle(document.querySelector('#pencereOut')).display);
    expect(['none', 'block', 'inline', 'inline-block']).toContain(etiket);
  });
});
