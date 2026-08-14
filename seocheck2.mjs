import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
for (const [label, url] of [['PRODUIT lr-08','/?product=lr-08'], ['PRODUIT lr-67','/?product=lr-67']]) {
  await p.goto('http://127.0.0.1:4173' + url, { waitUntil: 'load' });
  await p.waitForTimeout(2000);
  console.log('---', label, '---');
  console.log('  title     :', await p.title());
  console.log('  canonical :', await p.locator('link[rel=canonical]').getAttribute('href'));
  console.log('  og:image  :', await p.locator('meta[property="og:image"]').getAttribute('content'));
  const c = await p.locator('#seo-product-jsonld').count();
  if (c) {
    const d = JSON.parse(await p.locator('#seo-product-jsonld').textContent());
    console.log('  JSON-LD   :', d['@type'], '|', d.offers.price, d.offers.priceCurrency, '|', d.offers.availability.split('/').pop());
  } else console.log('  JSON-LD   : ABSENT');
}
await b.close();
