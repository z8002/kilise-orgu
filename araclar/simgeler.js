#!/usr/bin/env node
// Uygulama simgelerini çizer: simgeler/simge.svg ve ondan PNG'ler (ana ekran, Apple, maskeli).
// Kullanım: node araclar/simgeler.js
// Çizim burada tanımlıdır; simgeler/ klasöründeki dosyalar bu betiğin çıktısıdır.
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const HEDEF = path.join(KOK, 'simgeler');

// 512 × 512'lik çizim. yuvarlak: köşeleri yuvarlatılmış zemin (saydam köşeler); olcek: boruların büyüklüğü.
function svg({ yuvarlak, olcek }) {
  const TEPE = [214, 170, 126, 86, 126, 170, 214]; // boruların üst ucu: ortadaki en uzun
  const ARALIK = 56, EN = 42, AGIZ = 352, AYAK = 408;
  const borular = TEPE.map((tepe, i) => {
    const x = 256 + (i - 3) * ARALIK, sol = x - EN / 2, mw = EN * 0.62, ayakEn = EN * 0.26;
    return [
      `<rect x="${sol}" y="${tepe}" width="${EN}" height="${AGIZ - tepe}" fill="url(#metal)"/>`,
      `<path d="M${sol} ${AGIZ}H${sol + EN}L${x + ayakEn / 2} ${AYAK}H${x - ayakEn / 2}Z" fill="url(#metal)"/>`,
      `<ellipse cx="${x}" cy="${tepe}" rx="${EN / 2}" ry="5" fill="#17110c"/>`,
      `<path d="M${x - mw / 2} ${AGIZ - 10}Q${x - mw / 2} ${AGIZ - 30} ${x} ${AGIZ - 36}Q${x + mw / 2} ${AGIZ - 30} ${x + mw / 2} ${AGIZ - 10}Z" fill="url(#yaldiz)"/>`,
      `<rect x="${x - mw / 2}" y="${AGIZ - 10}" width="${mw}" height="10" fill="#120c08"/>`,
    ].join('');
  }).join('\n    ');
  const zemin = yuvarlak
    ? '<rect width="512" height="512" rx="104" fill="url(#zemin)"/>'
    : '<rect width="512" height="512" fill="url(#zemin)"/>';
  const donustur = olcek === 1 ? '' : ` transform="translate(256 256) scale(${olcek}) translate(-256 -256)"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="zemin" cx="50%" cy="8%" r="95%">
      <stop offset="0" stop-color="#4a3322"/><stop offset=".55" stop-color="#241810"/><stop offset="1" stop-color="#140d08"/>
    </radialGradient>
    <linearGradient id="metal">
      <stop offset="0" stop-color="#4d4840"/><stop offset=".18" stop-color="#a39c8c"/><stop offset=".36" stop-color="#eee8da"/>
      <stop offset=".5" stop-color="#c4bdad"/><stop offset=".82" stop-color="#6f695e"/><stop offset="1" stop-color="#3e3a33"/>
    </linearGradient>
    <linearGradient id="yaldiz" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6dc9a"/><stop offset=".55" stop-color="#cfa34b"/><stop offset="1" stop-color="#8a6a2e"/>
    </linearGradient>
  </defs>
  ${zemin}
  <g${donustur}>
    ${borular}
    <rect x="62" y="${AYAK}" width="388" height="26" rx="3" fill="url(#yaldiz)"/>
    <rect x="62" y="${AYAK + 26}" width="388" height="6" fill="#2b1d13"/>
  </g>
</svg>
`;
}

const CIKTILAR = [
  // [dosya, boyut, çizim]
  ['simge-192.png', 192, { yuvarlak: true, olcek: 1 }],
  ['simge-512.png', 512, { yuvarlak: true, olcek: 1 }],
  ['simge-maskeli-512.png', 512, { yuvarlak: false, olcek: 0.74 }], // Android kırpar: çizim ortadaki güvenli dairede
  ['simge-180.png', 180, { yuvarlak: false, olcek: 0.9 }],          // Apple köşeleri kendisi yuvarlatır
];

(async () => {
  fs.mkdirSync(HEDEF, { recursive: true });
  fs.writeFileSync(path.join(HEDEF, 'simge.svg'), svg({ yuvarlak: true, olcek: 1 }));
  const tarayici = await chromium.launch();
  for (const [ad, boyut, cizim] of CIKTILAR) {
    const sayfa = await tarayici.newPage({ viewport: { width: boyut, height: boyut }, deviceScaleFactor: 1 });
    await sayfa.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${boyut}px;height:${boyut}px}</style>${svg(cizim)}`);
    await sayfa.screenshot({ path: path.join(HEDEF, ad), omitBackground: true });
    await sayfa.close();
    console.log('yazıldı: simgeler/' + ad);
  }
  await tarayici.close();
})().catch(e => { console.error(e); process.exit(1); });
