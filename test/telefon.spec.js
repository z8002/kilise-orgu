// Telefon görünümü: ekranın altındaki pencereli klavye, ‹ › ile kaydırma, yan tutuş,
// Öğren'de klavyenin yanan tuşa kayması, klavyenin üstündeki Tut ve çal düğmeleri.
const { test, expect } = require('@playwright/test');
const { sayfayiAc, calanlar } = require('./yardimci');

test.skip(({ isMobile }) => !isMobile, 'telefon görünümü testleri telefon projesinde koşar');

/** Pencerede tümüyle görünen beyaz tuşlar ve sayfanın ölçüleri. */
const olc = page => page.evaluate(() => {
  const kutu = document.querySelector('#manualKutu').getBoundingClientRect();
  const dok = document.querySelector('.manual-wrap').getBoundingClientRect();
  const beyazlar = [...document.querySelectorAll('#manual .key.white')]
    .map(k => ({ off: Number(k.dataset.off), r: k.getBoundingClientRect() }))
    .filter(({ r }) => r.left >= kutu.left - 0.5 && r.right <= kutu.right + 0.5);
  return {
    adet: beyazlar.length,
    ilk: beyazlar.length ? beyazlar[0].off : null,
    enDar: Math.min(...beyazlar.map(b => b.r.width)),
    dokUst: dok.top, dokAlt: dok.bottom, dokYuksekligi: dok.height,
    ekranYuksekligi: innerHeight,
    tasma: document.documentElement.scrollWidth - innerWidth,
  };
});

/** Bir tuşun parmakla basılacak noktası (beyazda kara tuşların altından). */
async function nokta(page, off) {
  return page.evaluate(off => {
    const k = document.querySelector(`#manual .key[data-off="${off}"]`), r = k.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * (k.classList.contains('black') ? 0.5 : 0.85) };
  }, off);
}

/** Noktalara parmakla basıp kaldırır; basılıyken "Çalan" satırını döndürür. */
async function dokun(page, noktalar) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: noktalar.map((n, i) => ({ ...n, id: i + 1 })) });
  const calan = await calanlar(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  return calan;
}

test('klavye açılışta ekranın altında; beyaz tuşlar en az 44 piksel; sayfa yana taşmaz', async ({ page }) => {
  const hatalar = await sayfayiAc(page);
  await expect(page.locator('html')).toHaveClass(/pencereli/);
  const o = await olc(page);
  expect(o.adet).toBeGreaterThanOrEqual(7);
  expect(o.enDar).toBeGreaterThanOrEqual(44);
  expect(o.dokAlt).toBeLessThanOrEqual(o.ekranYuksekligi + 0.5); // kaydırmadan görünür
  expect(o.dokUst).toBeGreaterThan(o.ekranYuksekligi * 0.5);     // ekranın alt yarısında
  expect(o.tasma).toBe(0);
  await expect(page.locator('#pencereOut')).toHaveText('Do4 – Do5'); // 412 piksel: sekiz beyaz tuş
  expect(hatalar).toEqual([]);
});

test('‹ › klavyeyi bir oktav kaydırır; manuelin kenarında oktav ayarı değişir', async ({ page }) => {
  await sayfayiAc(page);
  const sag = page.locator('#pencereSag'), sol = page.locator('#pencereSol'), etiket = page.locator('#pencereOut');
  await sag.tap();
  await expect(etiket).toHaveText('Do5 – Do6');
  await expect(page.locator('#octOut')).toHaveText('Do4 – Sol6'); // manuel bir oktav kaydı
  while (await sag.isEnabled()) await sag.tap();
  await expect(etiket).toHaveText('Sol6 – Sol7'); // en tiz yer
  expect(await dokun(page, [await nokta(page, (await olc(page)).ilk)])).toEqual(['Sol6']);
  while (await sol.isEnabled()) await sol.tap();
  await expect(etiket).toHaveText('Do1 – Do2'); // en pes yer
  expect(await dokun(page, [await nokta(page, (await olc(page)).ilk)])).toEqual(['Do1']);
});

test('yan çevirince daha çok tuş sığar; klavye ekranın yarısından biraz fazlasını geçmez', async ({ page }) => {
  await sayfayiAc(page);
  await page.setViewportSize({ width: 863, height: 360 }); // Pixel 7 yan
  await expect.poll(async () => (await olc(page)).adet).toBeGreaterThanOrEqual(16);
  const o = await olc(page);
  expect(o.enDar).toBeGreaterThanOrEqual(44);
  expect(o.dokAlt).toBeLessThanOrEqual(o.ekranYuksekligi + 0.5);
  expect(o.dokYuksekligi).toBeLessThanOrEqual(o.ekranYuksekligi * 0.55);
  expect(o.tasma).toBe(0);
  await page.setViewportSize({ width: 412, height: 839 }); // geri dik
  await expect.poll(async () => (await olc(page)).adet).toBe(8);
  await expect(page.locator('#pencereOut')).toHaveText('Do4 – Do5');
});

test('en dar telefonda (320 piksel) parça açıkken de sayfa yana taşmaz', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await sayfayiAc(page, 'kilise-orgu.html?parca=gorsev-icin-balad&mod=ogren');
  await expect(page.locator('#calar')).toBeVisible();
  const o = await olc(page);
  expect(o.tasma).toBe(0);
  expect(o.enDar).toBeGreaterThanOrEqual(44);
});

test('Öğren: klavye yanan tuşa kendiliğinden kayar, parmakla baştan çalınır', async ({ page }) => {
  await sayfayiAc(page, 'kilise-orgu.html?parca=fur-elise&mod=ogren');
  await page.locator('#dokOynat').tap();
  await expect(page.locator('#dokOynat')).toHaveAttribute('aria-label', 'Duraklat');
  const gorulen = new Set();
  for (let i = 0; i < 40; i++) {
    const hedefler = await page.evaluate(() => {
      const kutu = document.querySelector('#manualKutu').getBoundingClientRect();
      return [...document.querySelectorAll('#manual .key.hedef')].map(k => {
        const r = k.getBoundingClientRect();
        return { off: Number(k.dataset.off), gorunur: r.left >= kutu.left - 0.5 && r.right <= kutu.right + 0.5 };
      });
    });
    expect(hedefler.length, `${i}. adım`).toBeGreaterThan(0);
    expect(hedefler.every(h => h.gorunur), `${i}. adımın tuşu pencerede`).toBe(true);
    gorulen.add(await page.locator('#pencereOut').textContent());
    const once = await page.evaluate(() => window.kiliseOrgu.calar.adim);
    await dokun(page, await Promise.all(hedefler.map(h => nokta(page, h.off))));
    expect(await page.evaluate(() => window.kiliseOrgu.calar.adim)).toBe(once + 1);
  }
  expect(gorulen.size).toBeGreaterThan(1); // ezgi pencereden geniş: pencere kaydı
  expect(await page.evaluate(() => window.kiliseOrgu.calar.yanlis)).toBe(0);
});

test('klavyenin üstündeki Tut, bırakılan notayı çalmayı sürdürür', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#dokTut').tap();
  await expect(page.locator('#dokTut')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#hold')).toHaveAttribute('aria-pressed', 'true');
  expect(await dokun(page, [await nokta(page, 12)])).toEqual(['Do4']);
  expect(await calanlar(page)).toEqual(['Do4']); // parmak kalktı, nota sürüyor
  await page.locator('#dokTut').tap();
  expect(await calanlar(page)).toEqual([]);
});

test('klavyenin üstündeki çal düğmesi parça açıkken görünür ve çalar', async ({ page }) => {
  await sayfayiAc(page);
  await expect(page.locator('#dokOynat')).toBeHidden();
  await page.locator('#parcalarBtn').tap();
  await page.locator('.parca-satiri[data-id="amazing-grace"]').tap();
  await expect(page.locator('#dokOynat')).toBeVisible();
  await expect(page.locator('#calar')).toBeInViewport(); // seçince çalar paneli görünür
  await page.locator('#dokOynat').tap();
  await expect.poll(() => page.evaluate(() => window.kiliseOrgu.calar.durum)).toBe('caliyor');
  await page.locator('#dokOynat').tap();
  await expect.poll(() => page.evaluate(() => window.kiliseOrgu.calar.durum)).toBe('durakladi');
});

test('parça çalarken ekran kararmaz; durunca kilit bırakılır', async ({ page }) => {
  await page.addInitScript(() => {
    window.__kilit = { istek: 0, birakma: 0 };
    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      value: { request: async () => { window.__kilit.istek++; return { release: async () => { window.__kilit.birakma++; } }; } },
    });
  });
  await sayfayiAc(page, 'kilise-orgu.html?parca=amazing-grace');
  await page.locator('#dokOynat').tap();
  await expect.poll(() => page.evaluate(() => window.__kilit)).toEqual({ istek: 1, birakma: 0 });
  await page.locator('#dokOynat').tap();
  await expect.poll(() => page.evaluate(() => window.__kilit)).toEqual({ istek: 1, birakma: 1 });
});

test('yan tutuşta "Tam ekran" düğmesi çıkar, dik tutuşta çıkmaz', async ({ page }) => {
  await sayfayiAc(page);
  await expect(page.locator('#tamEkran')).toBeHidden();
  await page.setViewportSize({ width: 863, height: 360 });
  await expect(page.locator('#tamEkran')).toBeVisible();
  const { tamEkran, tut } = await page.evaluate(() => ({
    tamEkran: document.querySelector('#tamEkran').getBoundingClientRect().right,
    tut: document.querySelector('#dokTut').getBoundingClientRect().left,
  }));
  expect(tamEkran).toBeLessThanOrEqual(tut); // sağdaki düğme öbeğinde, Tut'un solunda
});

test('klavye penceresi, kayıtlı oktav ne olursa olsun açılışta orta Do\'dan başlar', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kilise-orgu-v2', JSON.stringify({ octave: 5 })));
  await sayfayiAc(page);
  await expect(page.locator('#pencereOut')).toHaveText('Do4 – Do5');
  expect(await dokun(page, [await nokta(page, (await olc(page)).ilk)])).toEqual(['Do4']);
});
