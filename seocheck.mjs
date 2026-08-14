import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();

await p.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
await p.waitForTimeout(2500);
console.log('lang           :', await p.locator('html').getAttribute('lang'));
console.log('title          :', await p.title());
console.log('description    :', (await p.locator('meta[name=description]').getAttribute('content')).slice(0,90), '...');
console.log('canonical      :', await p.locator('link[rel=canonical]').getAttribute('href'));
console.log('og:image       :', await p.locator('meta[property="og:image"]').getAttribute('content'));

const lds = await p.locator('script[type="application/ld+json"]').allTextContents();
console.log('blocs JSON-LD  :', lds.length);
for (const raw of lds) {
  const d = JSON.parse(raw);
  const types = d['@graph'] ? d['@graph'].map(x => x['@type']) : [d['@type']];
  console.log('   types       :', types.join(', '));
}
const txt = await p.locator('body').innerText();
for (const kw of ['Bobo-Dioulasso','Gaoua','AES','Orange Money','ne sont ni des médicaments'])
  console.log(`texte "${kw}"`.padEnd(30), ':', txt.includes(kw) ? 'présent' : 'ABSENT');

console.log('\n--- lien produit partagé ?product=lr-08 ---');
await p.goto('http://127.0.0.1:4173/?product=lr-08', { waitUntil: 'load' });
await p.waitForTimeout(2500);
console.log('title          :', await p.title());
console.log('canonical      :', await p.locator('link[rel=canonical]').getAttribute('href'));
const prodLd = await p.locator('#seo-product-jsonld').count();
console.log('JSON-LD produit:', prodLd ? 'injecté' : 'absent (catalogue non chargé hors ligne)');
await b.close();
