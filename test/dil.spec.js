// İngilizce arayüz: ?dil=en ya da İngilizce tarayıcı; Türkçe kalan metin olmamalı.
const { test, expect } = require('@playwright/test');
const { sayfayiAc } = require('./yardimci');

// Görünen metinlerde ve ipuçlarında Türkçeye özgü harf ya da sık Türkçe sözcük arar.
// Klavye tuş etiketleri (Ö, Ç, Ş…), parça adları ve "Türkçe" düğmesi bilerek dışarıda.
const turkceKalanlar = page => page.evaluate(() => {
  const DISARI = '[lang="tr"], .cap, .rowkeys, .p-ad, .p-besteci, #calarAd, #calarBesteci, script, style';
  const TURKCE = /[çğıöşüÇĞİÖŞÜ]|\b(ve|ya da|bir|için|ile|tuş|nota|ses)\b/;
  const gorunur = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  const sonuc = [];
  const gez = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let d = gez.nextNode(); d; d = gez.nextNode()) {
    const el = d.parentElement, metin = d.nodeValue.trim();
    if (!metin || !el || el.closest(DISARI) || !gorunur(el)) continue;
    if (TURKCE.test(metin)) sonuc.push(metin);
  }
  for (const el of document.querySelectorAll('[title], [aria-label], [placeholder]')) {
    if (el.closest(DISARI) || !gorunur(el)) continue;
    for (const a of ['title', 'aria-label', 'placeholder']) { const v = el.getAttribute(a); if (v && TURKCE.test(v)) sonuc.push(`${a}: ${v}`); }
  }
  return [...new Set(sonuc)];
});

test('İngilizce kilise orgu: bütün görünen metinler ve ipuçları İngilizce', async ({ page }) => {
  const hatalar = await sayfayiAc(page, 'kilise-orgu.html?dil=en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Church Organ');
  await expect(page.locator('h1')).toHaveText('Church Organ');
  await expect(page.locator('#dilBtn')).toHaveText('Türkçe');
  await page.locator('#konsolTam').click();
  await page.locator('#sesAyarlari summary').click();
  expect(await turkceKalanlar(page)).toEqual([]);
  await expect(page.getByRole('button', { name: 'Principal 8′', exact: true })).toBeVisible();
  await expect(page.locator('#octOut')).toContainText('C');

  // Parça listesi ve bir parça
  await page.locator('#parcalarBtn').click();
  expect(await turkceKalanlar(page)).toEqual([]);
  await expect(page.locator('.parca-satiri', { hasText: 'Ode to Joy' })).toHaveCount(1);
  await page.locator('#parcaAra').fill('silent');
  await expect(page.locator('.parca-satiri .p-ad')).toHaveText(['Silent Night']);
  await page.locator('.parca-satiri').click();
  await expect(page.locator('#calarBilgi')).toContainText('C major');
  await page.locator('#modOgren').click();
  expect(await turkceKalanlar(page)).toEqual([]);

  // Kendi parçan formu ve hata iletisi
  await page.locator('#parcalarBtn').click();
  await page.locator('#kendiParcaBtn').click();
  await page.locator('#kpAd').fill('Test');
  await page.locator('#kpSag').fill('C4 X9');
  await page.locator('#kpKaydet').click();
  await expect(page.locator('#kpHata')).toHaveText('Right hand, "X9": note name not understood');
  await page.locator('.yazim summary').click();
  expect(await turkceKalanlar(page)).toEqual([]);
  expect(hatalar).toEqual([]);
});

test('İngilizce caz orgu', async ({ page }) => {
  await sayfayiAc(page, 'caz-orgu.html?dil=en');
  await expect(page).toHaveTitle('Jazz Organ');
  await expect(page.getByRole('slider', { name: 'Drawbar 8′', exact: true })).toBeVisible();
  await expect(page.locator('.caz-hazir', { hasText: 'Classic jazz' })).toBeVisible();
  expect(await turkceKalanlar(page)).toEqual([]);
});

test('İngilizce tarayıcıda sayfa kendiliğinden İngilizce açılır; seçim saklanır', async ({ browser }) => {
  const baglam = await browser.newContext({ locale: 'en-US', baseURL: 'http://127.0.0.1:4173/' });
  const page = await baglam.newPage();
  await sayfayiAc(page);
  await expect(page.locator('h1')).toHaveText('Church Organ');
  await page.locator('#dilBtn').click();
  await expect(page.locator('h1')).toHaveText('Kilise Orgu');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Kilise Orgu');
  await expect(page.locator('#dilBtn')).toHaveText('English');
  await baglam.close();
});

test('Türkçe tarayıcıda sayfa Türkçe açılır; nota adları Do Re Mi', async ({ page }) => {
  await sayfayiAc(page);
  await expect(page.locator('h1')).toHaveText('Kilise Orgu');
  await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  await expect(page.locator('#octOut')).toHaveText(/^Do\d/);
});
