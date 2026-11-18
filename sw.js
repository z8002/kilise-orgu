// Kilise Orgu'nun hizmet çalışanı (service worker): ana ekrana eklenen org internet olmadan da açılsın.
//  - Uygulama dosyaları önce ağdan istenir (açılışta güncel sürüm gelsin) ve saklanır. Ağ yoksa ya da
//    AG_SURESI içinde yanıt gelmezse saklanan kopya verilir.
//  - Google yazı tipleri saklanan kopyadan verilir; yoksa ağdan alınıp saklanır. İnternet yoksa ve
//    kopya da yoksa sayfa yedek yazı tipleriyle açılır.
//  - Başka her şey (v1/, notalar/ ...) dokunulmadan ağa gider.
const SURUM = 'kilise-orgu-uygulama-2';
const YAZI = 'kilise-orgu-yazi-1';
const UYGULAMA = [
  './', 'index.html', 'kilise-orgu.html', 'caz-orgu.html', 'manifest.webmanifest',
  'simgeler/simge.svg', 'simgeler/simge-180.png', 'simgeler/simge-192.png', 'simgeler/simge-512.png', 'simgeler/simge-maskeli-512.png',
];
const KAPSAM = new URL('./', self.location).href;
const UYGULAMA_ADRESLERI = new Set(UYGULAMA.map(y => new URL(y, KAPSAM).href));
const YAZI_TIPI = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
const AG_SURESI = 4000;
const YAZI_SURESI = 3000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SURUM)
    .then(c => c.addAll(UYGULAMA.map(y => new Request(new URL(y, KAPSAM).href, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(adlar => Promise.all(adlar.filter(a => a.startsWith('kilise-orgu-') && a !== SURUM && a !== YAZI).map(a => caches.delete(a))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const istek = e.request;
  if (istek.method !== 'GET') return;
  if (YAZI_TIPI.test(istek.url)) { e.respondWith(yaziTipi(e, istek)); return; }
  const u = new URL(istek.url);
  u.search = '';
  u.hash = '';
  if (!UYGULAMA_ADRESLERI.has(u.href)) return;
  e.respondWith(agOnce(e, istek, u.href));
});

// Önce ağ. Ağ yoksa, hata verirse ya da geç kalırsa saklanan kopya; kopya yoksa ağın yanıtı beklenir.
// Saklarken adresin sorgu kısmı atılır: kilise-orgu.html?parca=… de aynı kopyadan açılır.
async function agOnce(olay, istek, anahtar) {
  const onbellek = await caches.open(SURUM);
  const ag = fetch(istek).then(yanit => {
    if (yanit.ok && yanit.type === 'basic' && !yanit.redirected) return onbellek.put(anahtar, yanit.clone()).then(() => yanit, () => yanit);
    return yanit;
  });
  olay.waitUntil(ag.catch(() => {}));
  let yanit = null;
  try {
    yanit = await Promise.race([ag, new Promise(coz => setTimeout(coz, AG_SURESI))]);
  } catch (_) { /* ağ yok */ }
  if (yanit && (yanit.ok || yanit.type === 'opaqueredirect')) return yanit;
  return (await onbellek.match(anahtar)) || yanit || ag;
}

async function yaziTipi(olay, istek) {
  const onbellek = await caches.open(YAZI);
  const kopya = await onbellek.match(istek, { ignoreVary: true });
  if (kopya) return kopya;
  const ag = fetch(istek).then(async yanit => {
    if (yanit.ok || yanit.type === 'opaque') await onbellek.put(istek, yanit.clone());
    return yanit;
  });
  olay.waitUntil(ag.catch(() => {}));
  const bos = () => new Response('', { headers: { 'Content-Type': 'text/css' } });
  try {
    if (istek.destination !== 'style') return await ag;
    // Yazı tiplerinin stili gecikirse sayfa onu beklemesin, yedek yazı tipleriyle açılsın
    return (await Promise.race([ag, new Promise(coz => setTimeout(coz, YAZI_SURESI))])) || bos();
  } catch (_) {
    return istek.destination === 'style' ? bos() : Response.error();
  }
}

// İlk açılışta yazı tipleri bu çalışan devreye girmeden iner; sayfa adreslerini gönderir, burada saklanırlar.
self.addEventListener('message', e => {
  const v = e.data;
  if (!v || v.tur !== 'yazi-tipleri' || !Array.isArray(v.adresler)) return;
  const adresler = v.adresler.filter(a => typeof a === 'string' && YAZI_TIPI.test(a)).slice(0, 40);
  e.waitUntil(caches.open(YAZI).then(onbellek => Promise.all(adresler.map(async a => {
    try {
      if (await onbellek.match(a, { ignoreVary: true })) return;
      // Sayfa, stil dosyasını CORS'suz, yazı tipi dosyalarını CORS ile ister; aynısı yapılır
      const yanit = await fetch(a, /fonts\.googleapis\.com/.test(a) ? { mode: 'no-cors' } : { mode: 'cors', credentials: 'omit' });
      if (yanit.ok || yanit.type === 'opaque') await onbellek.put(a, yanit);
    } catch (_) { /* olmadıysa bir dahaki açılışta */ }
  }))));
});
