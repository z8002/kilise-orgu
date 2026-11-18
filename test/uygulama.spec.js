// Uygulama olarak kullanım: ana ekrana ekleme (manifest, simgeler), internetsiz açılış (sw.js),
// hafif mod ve cihaza göre yardım.
const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { sayfayiAc, calanlar } = require('./yardimci');

const KOK = path.resolve(__dirname, '..');

test('yardım, telefonda parmakla, bilgisayarda klavyeyle çalmayı anlatır', async ({ page, isMobile }) => {
  await sayfayiAc(page);
  const parmak = page.locator('.howto li.yalniz-dokunmatik').first();
  const klavyeSirasi = page.locator('#rowLower');
  if (isMobile) {
    await expect(parmak).toBeVisible();
    await expect(klavyeSirasi).toBeHidden();
    await expect(page.locator('.sub.yalniz-kilise')).toContainText('Parmakla çalınan', { useInnerText: true });
    await expect(page.locator('#focusHint')).toBeHidden(); // "önce sayfaya tıkla" telefonda anlamsız
  } else {
    await expect(parmak).toBeHidden();
    await expect(klavyeSirasi).toBeVisible();
    await expect(page.locator('.sub.yalniz-kilise')).toContainText('Bilgisayar klavyesiyle çalınan', { useInnerText: true });
  }
});

test('masaüstünde klavyenin hepsi görünür; pencere çubuğu yok', async ({ page, isMobile }) => {
  test.skip(isMobile, 'masaüstünde koşar');
  await sayfayiAc(page);
  await expect(page.locator('html')).not.toHaveClass(/pencereli/);
  await expect(page.locator('.pencere-cubugu')).toBeHidden();
  const { manuel, sonTus } = await page.evaluate(() => ({
    manuel: document.querySelector('#manual').getBoundingClientRect().right,
    sonTus: document.querySelector('#manual .key[data-off="31"]').getBoundingClientRect().right,
  }));
  expect(Math.abs(manuel - sonTus)).toBeLessThan(1);
});

test('ana ekrana ekleme: manifest, simgeler ve saklanacak dosyalar yerinde', async ({ page, request, isMobile }) => {
  test.skip(isMobile, 'bir kez koşması yeter');
  await sayfayiAc(page);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', 'manifest.webmanifest');
  const m = await (await request.get('manifest.webmanifest')).json();
  expect(m).toMatchObject({ name: 'Kilise Orgu', short_name: 'Kilise Orgu', lang: 'tr', start_url: './kilise-orgu.html', scope: './', display: 'standalone' });
  expect(m.icons.some(s => s.purpose === 'maskable')).toBe(true);
  expect(m.icons.some(s => s.sizes === '512x512' && s.purpose === 'any')).toBe(true);
  for (const s of m.icons) {
    const r = await request.get(s.src);
    expect(r.status(), s.src).toBe(200);
    if (s.type === 'image/png') {
      const b = await r.body();
      expect(`${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`, s.src).toBe(s.sizes);
    }
  }
  for (const rel of ['apple-touch-icon', 'icon']) {
    const href = await page.locator(`link[rel="${rel}"]`).getAttribute('href');
    expect((await request.get(href)).status(), href).toBe(200);
  }
  // sw.js'nin kurulurken sakladığı dosyaların hepsi var (biri eksikse kurulum bütünüyle başarısız olur)
  const sw = fs.readFileSync(path.join(KOK, 'sw.js'), 'utf8');
  const liste = /const UYGULAMA = \[([\s\S]*?)\];/.exec(sw)[1].match(/'[^']*'/g).map(s => s.slice(1, -1));
  expect(liste).toContain('kilise-orgu.html');
  for (const y of liste) expect((await request.get(y)).status(), y).toBe(200);
});

test('diskten (file://) açılan sayfa manifest istemez', async ({ page, isMobile }) => {
  test.skip(isMobile, 'bir kez koşması yeter');
  await sayfayiAc(page, 'file://' + path.join(KOK, 'kilise-orgu.html'));
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(0);
});

test('hafif mod daha az boru ve daha az ses kullanır; ayar saklanır', async ({ page, isMobile }) => {
  test.skip(isMobile, 'bilgisayar klavyesiyle sayar');
  await page.addInitScript(() => {
    window.__sayac = { osilator: 0, gurultu: 0 };
    const p = window.AudioContext.prototype, osilator = p.createOscillator, gurultu = p.createBufferSource;
    p.createOscillator = function () { window.__sayac.osilator++; return osilator.call(this); };
    p.createBufferSource = function () { window.__sayac.gurultu++; return gurultu.call(this); };
  });
  await sayfayiAc(page);
  const say = async kod => {
    await page.evaluate(() => { window.__sayac.osilator = 0; window.__sayac.gurultu = 0; });
    await page.keyboard.down(kod);
    await page.keyboard.up(kod);
    return page.evaluate(() => ({ ...window.__sayac }));
  };
  const ondortTus = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU'];
  const ayniAndaCalan = async () => {
    for (const t of ondortTus) await page.keyboard.down(t);
    const n = (await calanlar(page)).length;
    for (const t of ondortTus) await page.keyboard.up(t);
    return n;
  };
  await say('KeyZ'); // ses motoru kurulsun
  // Plenum: dört tek sıralı register + Mikstür'ün dört sırası; borunun ağzında "chiff" ve rüzgâr hışırtısı
  expect(await say('KeyX')).toEqual({ osilator: 8, gurultu: 2 });
  expect(await ayniAndaCalan()).toBe(14);

  await page.locator('#hafif').click();
  await expect(page.locator('#hafif')).toHaveAttribute('aria-pressed', 'true');
  expect(await say('KeyC')).toEqual({ osilator: 6, gurultu: 1 }); // Mikstür iki sıra, hışırtı yok
  expect(await ayniAndaCalan()).toBe(12); // en çok on iki ses

  await page.reload();
  await expect(page.locator('#hafif')).toHaveAttribute('aria-pressed', 'true');
});

/* ---- İnternetsiz çalışma ----
   Playwright'ın "çevrimdışı" ayarı hizmet çalışanının kendi isteklerini kesmiyor; bu yüzden test
   kendi sunucusunu açar, sayfa bir kez açılınca sunucuyu kapatır. */
const bosPort = () => new Promise(coz => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => coz(port)); });
});

async function sunucuAc(port) {
  const surec = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', KOK], { stdio: 'ignore' });
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`http://127.0.0.1:${port}/kilise-orgu.html`, { method: 'HEAD' })).ok) return surec; } catch (_) {}
    await new Promise(r => setTimeout(r, 100));
  }
  surec.kill();
  throw new Error('sunucu açılmadı');
}

test.describe('internetsiz', () => {
  test.use({ serviceWorkers: 'allow' });

  test('bir kez açılan org, sunucuya ulaşılamazken de açılır ve parça yükler', async ({ page, isMobile }) => {
    test.skip(isMobile, 'bir kez koşması yeter');
    const port = await bosPort();
    const sunucu = await sunucuAc(port);
    const kapandi = new Promise(r => sunucu.once('exit', r));
    try {
      const adres = `http://127.0.0.1:${port}/`;
      const hatalar = await sayfayiAc(page, adres + 'kilise-orgu.html');
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) await new Promise(r => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }));
      });
      sunucu.kill();
      await kapandi;
      expect(await page.evaluate(() => fetch('README.md').then(() => 'açık', () => 'kapalı'))).toBe('kapalı'); // sunucu gerçekten yok

      await page.reload();
      await expect(page.locator('#manual .key')).toHaveCount(32);
      await page.goto(adres + 'kilise-orgu.html?parca=fur-elise&mod=ogren');
      await expect(page.locator('#calarAd')).toHaveText('Für Elise');
      await expect(page.locator('#modOgren')).toHaveAttribute('aria-pressed', 'true');
      await page.goto(adres); // index.html, org sayfasına yönlendirir
      await expect(page).toHaveURL(/kilise-orgu\.html$/);
      await expect(page.locator('#manual .key')).toHaveCount(32);
      expect(hatalar.filter(h => h.startsWith('sayfa hatası'))).toEqual([]);
    } finally {
      sunucu.kill();
    }
  });
});
