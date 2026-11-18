// Testler sayfayı yerel bir sunucudan açar: python3 -m http.server (depo kökü).
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'test',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/',
    // Hizmet çalışanı (sw.js) testlerde kapalı: yazı tipi isteklerini Playwright'ın yerine o karşılamasın.
    // İnternetsiz çalışma testi (test/uygulama.spec.js) onu kendi bağlamında açar.
    serviceWorkers: 'block',
    // KILISE_CHROMIUM: Playwright'ın kendi tarayıcısı yerine kullanılacak Chrome (sürümü uymayan ortamlar için)
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'], executablePath: process.env.KILISE_CHROMIUM || undefined },
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173/kilise-orgu.html',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'masaustu', use: { ...devices['Desktop Chrome'] } },
    { name: 'telefon', use: { ...devices['Pixel 7'] } },
  ],
});
