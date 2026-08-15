import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
const js = [];
p.on('response', r => { if (r.url().endsWith('.js')) js.push(r.url().split('/').pop()); });
await p.goto('http://127.0.0.1:4173/', { waitUntil: 'load' }); await p.waitForTimeout(2500);
console.log('JS chargé par un CLIENT :');
js.forEach(f => console.log('   -', f));
console.log('charts (350 Ko) chargé ?', js.some(f => f.startsWith('charts')) ? 'OUI ✗' : 'NON ✓');
console.log('AdminPanel chargé ?     ', js.some(f => f.startsWith('AdminPanel')) ? 'OUI ✗' : 'NON ✓');

const faq = await p.locator('#seo-faq-jsonld').count();
console.log('\nFAQPage JSON-LD :', faq ? 'injecté ✓' : 'ABSENT ✗');
if (faq) {
  const d = JSON.parse(await p.locator('#seo-faq-jsonld').textContent());
  console.log('  questions :', d.mainEntity.length);
}
await p.goto('http://127.0.0.1:4173/?categorie=Ménagère', { waitUntil: 'load' });
await p.waitForTimeout(1500);
console.log('\nURL catégorie -> titre :', await p.title());
await b.close();
