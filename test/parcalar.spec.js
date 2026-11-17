// Her parçanın her notası: README'de yazan tuşa sayfada basılır, çalan nota parça dosyasındakiyle karşılaştırılır.
const { test, expect } = require('@playwright/test');
const { execFileSync } = require('child_process');
const path = require('path');
const { sayfayiAc, calanlar } = require('./yardimci');

const KOK = path.resolve(__dirname, '..');
const parcalar = JSON.parse(execFileSync('python3', [path.join(KOK, 'araclar', 'parca.py'), '--tuslar'], { maxBuffer: 64 * 1024 * 1024 }).toString());

test.skip(({ isMobile }) => isMobile, 'klavye testi masaüstünde koşar');

test('otuz parça var', () => {
  expect(parcalar.length).toBe(30);
  expect(parcalar.map(p => p.no)).toEqual([...Array(30).keys()].map(i => i + 1));
});

for (const parca of parcalar) {
  test(`${String(parca.no).padStart(2, '0')} ${parca.id}: her tuş doğru notayı çalar`, async ({ page }) => {
    test.setTimeout(180_000);
    await sayfayiAc(page);
    let oktav = 3;
    // Aynı tuş takımı çok kez yinelenir; her farklı (oktav, tuşlar) bileşimini bir kez basmak yeter
    const gorulen = new Set();
    for (const adim of parca.adimlar) {
      const anahtar = adim.oktav + ':' + adim.tuslar.join('+');
      if (gorulen.has(anahtar)) continue;
      gorulen.add(anahtar);
      while (oktav < adim.oktav) { await page.keyboard.press('ArrowUp'); oktav++; }
      while (oktav > adim.oktav) { await page.keyboard.press('ArrowDown'); oktav--; }
      for (const kod of adim.tuslar) await page.keyboard.down(kod);
      expect(await calanlar(page), `${parca.id} tik ${adim.tik} (${adim.el}) tuşlar ${adim.tuslar.join('+')}`).toEqual(adim.notalar);
      for (const kod of adim.tuslar) await page.keyboard.up(kod);
    }
    expect(gorulen.size).toBeGreaterThan(0);
  });
}
