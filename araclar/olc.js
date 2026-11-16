#!/usr/bin/env node
// Sayfayı telefon ve masaüstü boyutlarında açıp klavye ölçülerini yazar, ekran görüntüsü alır.
// Kullanım: node araclar/olc.js [çıktı klasörü]   (varsayılan: test-results/olcum)
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const cikti = path.resolve(process.argv[2] || path.join(KOK, 'test-results', 'olcum'));
const EKRANLAR = [
  ['telefon-360', 360, 780, true],
  ['telefon-412', 412, 915, true],
  ['telefon-yatay', 780, 360, true],
  ['masaustu', 1280, 800, false],
];

(async () => {
  fs.mkdirSync(cikti, { recursive: true });
  const tarayici = await chromium.launch();
  for (const [ad, en, boy, dokunmatik] of EKRANLAR) {
    const baglam = await tarayici.newContext({ viewport: { width: en, height: boy }, deviceScaleFactor: 2, hasTouch: dokunmatik, isMobile: dokunmatik, locale: 'tr-TR' });
    const sayfa = await baglam.newPage();
    await sayfa.goto('file://' + path.join(KOK, 'kilise-orgu.html'));
    await sayfa.waitForTimeout(600);
    const olcum = await sayfa.evaluate(() => {
      const kutu = s => document.querySelector(s).getBoundingClientRect();
      const beyaz = [...document.querySelectorAll('#manual .key.white')].filter(k => k.offsetParent !== null);
      const klavye = kutu('#manual');
      return {
        beyazTusGenisligi: +beyaz[0].getBoundingClientRect().width.toFixed(1),
        klavyeYuksekligi: Math.round(klavye.height),
        klavyeninUstKenari: Math.round(klavye.top + scrollY),
        ekranYuksekligi: innerHeight,
        klavyeKaydirmadanGorunur: klavye.bottom <= innerHeight,
        sayfaYuksekligi: document.documentElement.scrollHeight,
        yatayTasma: document.documentElement.scrollWidth > innerWidth,
      };
    });
    console.log(ad.padEnd(14), JSON.stringify(olcum));
    await sayfa.screenshot({ path: path.join(cikti, ad + '.png'), fullPage: true });
    await baglam.close();
  }
  await tarayici.close();
  console.log('ekran görüntüleri:', cikti);
})().catch(e => { console.error(e); process.exit(1); });
