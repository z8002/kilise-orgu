// Kayıt: çalınan notalar MIDI dosyası olarak, hoparlöre giden ses ses dosyası olarak indirilir; kayıt geri çalınır.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { sayfayiAc, calanlar } = require('./yardimci');

test.skip(({ isMobile }) => isMobile, 'bilgisayar klavyesiyle kaydedilir');

// Biçim 0 MIDI dosyasını çözer: [{ sn, tur: 'on' | 'off', kanal, nota }]
function midiCoz(b) {
  expect(b.subarray(0, 4).toString('latin1')).toBe('MThd');
  expect(b.readUInt16BE(8)).toBe(0);    // biçim 0
  expect(b.readUInt16BE(10)).toBe(1);   // bir iz
  const tpq = b.readUInt16BE(12);
  expect(b.subarray(14, 18).toString('latin1')).toBe('MTrk');
  const son = 22 + b.readUInt32BE(18);
  expect(son).toBe(b.length);
  let i = 22, tik = 0, bitti = false;
  const olaylar = [];
  while (i < son) {
    let d = 0, c;
    do { c = b[i++]; d = (d << 7) | (c & 0x7f); } while (c & 0x80);
    tik += d;
    const s = b[i++];
    if (s === 0xff) { const tur = b[i++], uz = b[i++]; if (tur === 0x2f) bitti = true; i += uz; continue; }
    const nota = b[i++], hiz = b[i++];
    olaylar.push({ sn: tik / (tpq * 2), tur: (s & 0xf0) === 0x90 && hiz > 0 ? 'on' : 'off', kanal: s & 0x0f, nota });
  }
  expect(bitti).toBe(true);
  return olaylar;
}

async function indirilen(page, dugme) {
  const [indirme] = await Promise.all([page.waitForEvent('download'), page.locator(dugme).click()]);
  return { ad: indirme.suggestedFilename(), veri: fs.readFileSync(await indirme.path()) };
}

test('çalınan notalar MIDI dosyasına doğru sıra ve sürelerle yazılır', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#kayitBtn').click();
  await expect(page.locator('#kayitBtn')).toHaveAttribute('aria-pressed', 'true');
  // Tuşlar sayfanın içinden, kesin zamanlarla basılır (Playwright'ın tuş olayları yük altında gecikebilir)
  await page.evaluate(() => new Promise(bitti => {
    const tus = (tur, code) => document.dispatchEvent(new KeyboardEvent(tur, { code, bubbles: true }));
    setTimeout(() => tus('keydown', 'KeyQ'), 200);                            // Do4
    setTimeout(() => tus('keyup', 'KeyQ'), 600);
    setTimeout(() => { tus('keydown', 'KeyE'); tus('keydown', 'KeyT'); }, 600); // Mi4 + Sol4: akor
    setTimeout(() => { tus('keyup', 'KeyE'); tus('keyup', 'KeyT'); }, 1000);
    setTimeout(bitti, 1150);
  }));
  await page.locator('#kayitBtn').click();
  await expect(page.locator('#kayitPaneli')).toBeVisible();

  const { ad, veri } = await indirilen(page, '#kayitMidiIndir');
  expect(ad).toMatch(/^kilise-orgu-kayit-\d{8}-\d{4}\.mid$/);
  const o = midiCoz(veri);
  expect(o.map(x => `${x.tur}${x.nota}`)).toEqual(['on60', 'off60', 'on64', 'on67', 'off64', 'off67']);
  expect(o.every(x => x.kanal === 0)).toBe(true);
  const sure = nota => o.find(x => x.tur === 'off' && x.nota === nota).sn - o.find(x => x.tur === 'on' && x.nota === nota).sn;
  for (const n of [60, 64, 67]) expect(Math.abs(sure(n) - 0.4), `nota ${n}`).toBeLessThan(0.15);
  expect(Math.abs(sure(64) - sure(67))).toBeLessThan(0.01); // birlikte basılıp bırakıldı
  expect(o[0].sn).toBeGreaterThan(0.1); // kaydın başındaki sessizlik korunur
});

test('ses dosyası indirilir; kayıt sayfada geri çalınır', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#kayitBtn').click();
  await page.keyboard.down('KeyY'); // La4
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyY');
  await page.waitForTimeout(200);
  await page.locator('#kayitBtn').click();
  await expect(page.locator('#kayitSesIndir')).toBeVisible();
  const { ad, veri } = await indirilen(page, '#kayitSesIndir');
  expect(ad).toMatch(/\.(webm|ogg|m4a)$/);
  expect(veri.length).toBeGreaterThan(1000);

  await page.locator('#kayitCal').click();
  await expect.poll(() => calanlar(page)).toEqual(['La4']);
  await expect.poll(() => calanlar(page), { timeout: 3000 }).toEqual([]);
  await expect(page.locator('#kayitCal')).toHaveText('▶ Kaydı çal');
});

test('iki manuel ve otomatik pedal ayrı kanallara, şarkı çalar da kayda girer', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#konsolTam').click();
  await page.locator('#otoPedal').click();
  await page.locator('#kayitBtn').click();
  await page.keyboard.down('KeyQ'); // Do4, Sandık
  await page.keyboard.down('KeyZ'); // Do3, I. manuel; otomatik pedal Do2
  await page.waitForTimeout(300);
  await page.keyboard.up('KeyQ');
  await page.keyboard.up('KeyZ');
  await page.locator('#kayitBtn').click();
  let o = midiCoz((await indirilen(page, '#kayitMidiIndir')).veri).filter(x => x.tur === 'on');
  expect(o.map(x => `${x.kanal}:${x.nota}`).sort()).toEqual(['0:48', '1:60', '2:36']);

  await page.locator('#otoPedal').click();
  await page.evaluate(() => { window.kiliseOrgu.yukle('neseye-ovgu'); window.kiliseOrgu.hiz(150); });
  await page.locator('#kayitBtn').click();
  await page.evaluate(() => window.kiliseOrgu.basla());
  await page.waitForTimeout(1500);
  await page.locator('#kayitBtn').click();
  await page.evaluate(() => window.kiliseOrgu.durdur());
  o = midiCoz((await indirilen(page, '#kayitMidiIndir')).veri);
  expect(o.filter(x => x.tur === 'on').length).toBeGreaterThan(2);
  // Her açılan nota kapanır
  expect(o.filter(x => x.tur === 'on').length).toBe(o.filter(x => x.tur === 'off').length);
});
