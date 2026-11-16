// Testlerin ortak yardımcıları. Buradaki tablolar bilerek sayfanın kodundan
// kopyalanmadı: README'deki "Tuşlar" ve "Kombinasyonlar" tablolarının bağımsız
// bir kopyasıdır, sayfa bunlara uymazsa test kırılır.
const { expect } = require('@playwright/test');

const SOLFEJ = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
const notaAdi = m => SOLFEJ[m % 12] + (Math.floor(m / 12) - 1);

// Alt sıra Do'dan başlar (17 tuş), üst sıra bir oktav yukarıdan (20 tuş).
const ALT_SIRA = ['KeyZ', 'KeyS', 'KeyX', 'KeyD', 'KeyC', 'KeyV', 'KeyG', 'KeyB', 'KeyH', 'KeyN', 'KeyJ', 'KeyM', 'Comma', 'KeyL', 'Period', 'Semicolon', 'Slash'];
const UST_SIRA = ['KeyQ', 'Digit2', 'KeyW', 'Digit3', 'KeyE', 'KeyR', 'Digit5', 'KeyT', 'Digit6', 'KeyY', 'Digit7', 'KeyU', 'KeyI', 'Digit9', 'KeyO', 'Digit0', 'KeyP', 'BracketLeft', 'Equal', 'BracketRight'];
const TUS_SAYISI = 32;

// oktav ayarı n iken en soldaki tuş Do(n) çalar: MIDI 12 * (n + 1)
const tabanMidi = oktav => 12 * (oktav + 1);
const tusMidi = (kod, oktav) => {
  const alt = ALT_SIRA.indexOf(kod);
  if (alt >= 0) return tabanMidi(oktav) + alt;
  const ust = UST_SIRA.indexOf(kod);
  if (ust >= 0) return tabanMidi(oktav) + 12 + ust;
  throw new Error('nota tuşu değil: ' + kod);
};

const REGISTERLER = ['burdon16', 'prinsipal8', 'gedakt8', 'gamba8', 'oktav4', 'flut4', 'celeste8', 'nazard', 'superoktav2', 'terz', 'mikstur', 'trompet8', 'tremolo'];
const REGISTER_ETIKETI = {
  burdon16: 'Burdon 16′', prinsipal8: 'Prinsipal 8′', gedakt8: 'Gedakt 8′', gamba8: 'Gamba 8′', oktav4: 'Oktav 4′', flut4: 'Flüt 4′',
  celeste8: 'Voix Céleste 8′', nazard: 'Nazard 2⅔′', superoktav2: 'Süperoktav 2′', terz: 'Terz 1⅗′', mikstur: 'Mikstür IV', trompet8: 'Trompet 8′', tremolo: 'Tremolo',
};
const PISTONLAR = {
  1: { ad: 'Dua', registerler: ['gedakt8', 'gamba8', 'celeste8'] },
  2: { ad: 'İlahi', registerler: ['prinsipal8', 'gedakt8', 'oktav4', 'flut4'] },
  3: { ad: 'Flüt solo', registerler: ['gedakt8', 'flut4', 'tremolo'] },
  4: { ad: 'Kornet', registerler: ['gedakt8', 'flut4', 'nazard', 'superoktav2', 'terz'] },
  5: { ad: 'Plenum', registerler: ['burdon16', 'prinsipal8', 'oktav4', 'superoktav2', 'mikstur'] },
  6: { ad: 'Tutti', registerler: ['burdon16', 'prinsipal8', 'gedakt8', 'gamba8', 'oktav4', 'flut4', 'nazard', 'superoktav2', 'terz', 'mikstur', 'trompet8'] },
  0: { ad: 'İptal', registerler: [] },
};

/** Sayfayı açar; yazı tipi isteklerini boş yanıtlar (testler internete bağlı olmasın) ve hataları toplar. */
async function sayfayiAc(page, yol = 'kilise-orgu.html') {
  const hatalar = [];
  page.on('pageerror', e => hatalar.push('sayfa hatası: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') hatalar.push('konsol: ' + m.text()); });
  await page.context().route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await page.goto(yol);
  await expect(page.locator('#manual .key')).toHaveCount(TUS_SAYISI);
  return hatalar;
}

/** "Çalan:" satırındaki nota adları (çalan yoksa boş dizi). */
async function calanlar(page) {
  const metin = (await page.locator('#readout').textContent()).replace('Çalan:', '').trim();
  return metin === '—' || metin === '' ? [] : metin.split('·').map(s => s.trim());
}

const register = (page, id) => page.getByRole('button', { name: REGISTER_ETIKETI[id], exact: true });
const piston = (page, n) => page.locator(`.piston[aria-label^="Kombinasyon ${n}:"]`);

async function acikRegisterler(page) {
  const acik = [];
  for (const id of REGISTERLER) if ((await register(page, id).getAttribute('aria-pressed')) === 'true') acik.push(id);
  return acik;
}

module.exports = { SOLFEJ, notaAdi, ALT_SIRA, UST_SIRA, TUS_SAYISI, tabanMidi, tusMidi, REGISTERLER, REGISTER_ETIKETI, PISTONLAR, sayfayiAc, calanlar, register, piston, acikRegisterler };
