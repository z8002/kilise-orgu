// Telefon: ekrandaki klavyeye parmakla basma (dokunma olayları CDP ile gönderilir).
const { test, expect } = require('@playwright/test');
const { sayfayiAc, calanlar } = require('./yardimci');

test.skip(({ isMobile }) => !isMobile, 'dokunmatik testler telefon projesinde koşar');

// Telefonda klavye ekranın altındadır ve açılışta Do4'ten başlayan bir oktavı gösterir.
async function tusMerkezi(page, sira) {
  const k = await page.locator('#manual .key').nth(sira).boundingBox();
  return { x: k.x + k.width / 2, y: k.y + k.height * 0.85 };
}

test('parmakla basınca nota çalar, kaldırınca susar', async ({ page }) => {
  await sayfayiAc(page);
  const cdp = await page.context().newCDPSession(page);
  const p = await tusMerkezi(page, 12); // Do4
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...p, id: 1 }] });
  expect(await calanlar(page)).toEqual(['Do4']);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await calanlar(page)).toEqual([]);
});

test('parmağı kaydırınca nota değişir, iki parmak akor basar', async ({ page }) => {
  await sayfayiAc(page);
  const cdp = await page.context().newCDPSession(page);
  const doTusu = await tusMerkezi(page, 12), reTusu = await tusMerkezi(page, 14), solTusu = await tusMerkezi(page, 19);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...doTusu, id: 1 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...reTusu, id: 1 }] });
  expect(await calanlar(page)).toEqual(['Re4']);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...reTusu, id: 1 }, { ...solTusu, id: 2 }] });
  expect(await calanlar(page)).toEqual(['Re4', 'Sol4']);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(await calanlar(page)).toEqual([]);
});
