// MIDI klavye: tarayıcının Web MIDI arayüzü sahte bir klavyeyle değiştirilir, mesajlar testten gönderilir.
const { test, expect } = require('@playwright/test');
const { sayfayiAc, calanlar, piston, acikRegisterler, PISTONLAR } = require('./yardimci');

const sahteMidi = () => {
  const giris = { id: 'deneme-1', name: 'Deneme Klavyesi', state: 'connected', onmidimessage: null };
  const erisim = { inputs: new Map([[giris.id, giris]]), outputs: new Map(), onstatechange: null };
  navigator.requestMIDIAccess = async () => erisim;
  window.__midi = (...baytlar) => giris.onmidimessage && giris.onmidimessage({ data: new Uint8Array(baytlar) });
};
const gonder = (page, ...baytlar) => page.evaluate(b => window.__midi(...b), baytlar);
const borular = page => page.evaluate(() => window.kiliseOrgu.borular());

test.beforeEach(async ({ page }) => { await page.addInitScript(sahteMidi); });

test('MIDI klavye bağlanır; nota açıp kapatır, sürdürme pedalı tutar', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#midiBagla').click();
  await expect(page.locator('#midiDurum')).toHaveText('MIDI: Deneme Klavyesi');
  await expect(page.locator('#midiBagla')).toHaveAttribute('aria-pressed', 'true');
  await gonder(page, 0x90, 60, 100);
  await gonder(page, 0x90, 64, 80);
  expect(await calanlar(page)).toEqual(['Do4', 'Mi4']);
  await gonder(page, 0x80, 60, 0);
  await gonder(page, 0x90, 64, 0); // hız sıfırlı nota açma = kapama
  expect(await calanlar(page)).toEqual([]);
  await gonder(page, 0xb0, 64, 127); // sürdürme pedalı basılı
  await gonder(page, 0x90, 67, 90);
  await gonder(page, 0x80, 67, 0);
  expect(await calanlar(page)).toEqual(['Sol4']);
  await expect(page.locator('#hold')).toHaveAttribute('aria-pressed', 'true');
  await gonder(page, 0xb0, 64, 0);
  expect(await calanlar(page)).toEqual([]);
});

test('program değişimi pistonları çağırır; kanallar iki manuelde bölümlere gider; ifade pedalı panjuru açıp kapar', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#midiBagla').click();
  await gonder(page, 0xc0, 2); // program 3 → piston 3
  await expect(piston(page, 3)).toHaveAttribute('aria-current', 'true');
  expect((await acikRegisterler(page)).sort()).toEqual([...PISTONLAR[3].registerler].sort());
  await gonder(page, 0xc0, 4); // piston 5: Plenum
  await page.locator('#konsolTam').click();
  await gonder(page, 0x91, 60, 100); // 2. kanal: Sandık
  await gonder(page, 0x92, 36, 100); // 3. kanal: pedal
  const b = await borular(page);
  expect(b.Do4).toEqual(['flajole2', 'obua8', 'rohrflut8', 'salisyonal8', 'traversflut4']);
  expect(b.Do2).toEqual(['koralbas4', 'oktavbas8', 'subbas16', 'trombon16']);
  await gonder(page, 0xb0, 123, 0); // bütün sesleri sustur
  expect(await calanlar(page)).toEqual([]);
  await gonder(page, 0xb0, 11, 0);
  await expect(page.locator('#sandik')).toHaveValue('0');
});

test('daha önce bağlanan MIDI klavye sayfa yenilenince kendiliğinden bağlanır', async ({ page }) => {
  await sayfayiAc(page);
  await page.locator('#midiBagla').click();
  await expect(page.locator('#midiDurum')).toHaveText('MIDI: Deneme Klavyesi');
  await page.reload();
  await expect(page.locator('#midiDurum')).toHaveText('MIDI: Deneme Klavyesi');
});

test('caz orgunda modülasyon tekerleği dönen hoparlörü hızlandırır, program değişimi hazır ses seçer', async ({ page }) => {
  await sayfayiAc(page, 'caz-orgu.html');
  await page.locator('#midiBagla').click();
  await gonder(page, 0xc0, 5); // 6. hazır ses: Tam
  await expect(page.locator('#cekmeKodu')).toHaveText('888888888');
  await page.locator('[data-hoparlor="yavas"]').click();
  await gonder(page, 0xb0, 1, 127);
  await expect(page.locator('[data-hoparlor="hizli"]')).toHaveAttribute('aria-pressed', 'true');
  await gonder(page, 0xb0, 1, 0);
  await expect(page.locator('[data-hoparlor="yavas"]')).toHaveAttribute('aria-pressed', 'true');
});

test('MIDI desteklemeyen tarayıcıda açıklama çıkar', async ({ page }) => {
  await page.addInitScript(() => { delete Navigator.prototype.requestMIDIAccess; navigator.requestMIDIAccess = undefined; });
  await sayfayiAc(page);
  await page.locator('#midiBagla').click();
  await expect(page.locator('#midiDurum')).toContainText('desteklemiyor');
});
