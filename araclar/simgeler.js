#!/usr/bin/env node
// Uygulama simgelerini ve paylaşım görsellerini çizer: simgeler/simge.svg, ondan PNG'ler (ana ekran, Apple,
// maskeli) ve bağlantı paylaşılınca görünen 1200 × 630 kartlar (paylasim-kilise.png, paylasim-caz.png).
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

// Caz orgunun çekme çubukları (paylaşım kartı için): 888000000 düzeninde, renkleriyle
function cekmeSvg() {
  const renk = ['#7a4a28', '#7a4a28', '#f2e9d3', '#f2e9d3', '#171210', '#f2e9d3', '#171210', '#171210', '#f2e9d3'];
  const deger = [8, 8, 8, 6, 0, 4, 0, 0, 2];
  const cubuk = renk.map((r, i) => {
    const x = 40 + i * 48, boy = 40 + deger[i] * 34;
    return `<rect x="${x + 12}" y="40" width="12" height="${boy - 30}" fill="#cfc6b4"/>` +
      `<rect x="${x}" y="${boy}" width="36" height="46" rx="6" fill="${r}" stroke="#000" stroke-opacity=".5"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 420" width="512" height="420"><rect x="28" y="24" width="456" height="14" rx="4" fill="#cfa34b"/>${cubuk}</svg>`;
}

function kartHtml(cizim, baslik, alt) {
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;width:1200px;height:630px;overflow:hidden}
    body{display:grid;grid-template-columns:520px 1fr;align-items:center;gap:40px;padding:0 70px;box-sizing:border-box;
      background:radial-gradient(ellipse 80% 70% at 30% 20%,#4a3322,#1a120c 70%);color:#eee4cc;font-family:'DejaVu Serif',Georgia,serif}
    svg{width:480px;height:auto;filter:drop-shadow(0 20px 30px rgba(0,0,0,.6))}
    h1{margin:0;font-size:96px;font-weight:400;line-height:1;letter-spacing:.01em}
    p{margin:28px 0 0;font:32px/1.35 'DejaVu Sans',sans-serif;color:#b8a98b}
    .cizgi{width:120px;height:4px;background:#cfa34b;margin-top:34px}
  </style><div>${cizim}</div><div><h1>${baslik}</h1><p>${alt}</p><div class="cizgi"></div></div>`;
}

(async () => {
  fs.mkdirSync(HEDEF, { recursive: true });
  fs.writeFileSync(path.join(HEDEF, 'simge.svg'), svg({ yuvarlak: true, olcek: 1 }));
  const tarayici = await chromium.launch({ executablePath: process.env.KILISE_CHROMIUM || undefined });
  const kartlar = [
    ['paylasim-kilise.png', kartHtml(svg({ yuvarlak: true, olcek: 1 }), 'Kilise Orgu', 'Tarayıcıda çalınan borulu org: iki manuel, pedal, yirmi altı register ve otuz parçalık şarkı çalar.')],
    ['paylasim-caz.png', kartHtml(cekmeSvg(), 'Caz Orgu', 'Dokuz çekme çubuğu, perküsyon, dönen hoparlör. Bilgisayar klavyesiyle ya da parmakla çal.')],
  ];
  for (const [ad, html] of kartlar) {
    const sayfa = await tarayici.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await sayfa.setContent(html);
    await sayfa.screenshot({ path: path.join(HEDEF, ad) });
    await sayfa.close();
    console.log('yazıldı: simgeler/' + ad);
  }
  for (const [ad, boyut, cizim] of CIKTILAR) {
    const sayfa = await tarayici.newPage({ viewport: { width: boyut, height: boyut }, deviceScaleFactor: 1 });
    await sayfa.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${boyut}px;height:${boyut}px}</style>${svg(cizim)}`);
    await sayfa.screenshot({ path: path.join(HEDEF, ad), omitBackground: true });
    await sayfa.close();
    console.log('yazıldı: simgeler/' + ad);
  }
  await tarayici.close();
})().catch(e => { console.error(e); process.exit(1); });
