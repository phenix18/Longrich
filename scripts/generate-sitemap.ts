/**
 * Génère public/sitemap.xml à partir du catalogue.
 *
 * L'application partage un produit via ?product=<id> : chaque article a donc
 * une adresse propre que Google peut indexer, ce qui multiplie les portes
 * d'entrée vers la boutique (une par produit, en plus de la page d'accueil).
 *
 * Lancé automatiquement avant `vite build`. Le script ne fait jamais échouer la
 * compilation : en cas de problème il prévient et laisse le sitemap existant.
 */
import { writeFileSync } from 'node:fs';
import { INITIAL_PRODUCTS } from '../src/data/initialProducts';
import { SITE_URL } from '../src/seo.config';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

try {
  const base = SITE_URL.replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);

  const urls: string[] = [
    `  <url>
    <loc>${base}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
  ];

  for (const product of INITIAL_PRODUCTS) {
    // Une image déclarée dans le sitemap peut apparaître dans Google Images,
    // source de trafic notable pour des produits recherchés visuellement.
    const image = product.imageUrl?.startsWith('/')
      ? `
    <image:image>
      <image:loc>${base}${escapeXml(product.imageUrl)}</image:loc>
      <image:title>${escapeXml(product.name)}</image:title>
    </image:image>`
      : '';

    urls.push(`  <url>
    <loc>${base}/?product=${escapeXml(product.id)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${image}
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;

  writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf-8');
  console.log(`sitemap.xml généré : ${urls.length} adresses (${base})`);
} catch (error) {
  console.warn('Sitemap non régénéré, le fichier existant est conservé :', error);
}
