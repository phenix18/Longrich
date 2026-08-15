import { Product } from '../types';
import { SITE_URL, HOME_TITLE, HOME_DESCRIPTION, BUSINESS, FAQ } from '../seo.config';

/**
 * Mise à jour des balises de référencement pendant la navigation.
 *
 * L'application n'a qu'une seule page : sans ces mises à jour, un produit
 * partagé via ?product=<id> renverrait le titre générique de l'accueil.
 * Googlebot exécute le JavaScript et voit donc bien ces valeurs.
 *
 * Limite connue : les robots des réseaux sociaux (WhatsApp, Facebook) n'exécutent
 * pas le JavaScript et ne verront que les balises écrites dans index.html. Un
 * aperçu propre par produit sur WhatsApp demanderait un rendu côté serveur.
 */

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

const applyTags = (title: string, description: string, url: string, image?: string) => {
  document.title = title;
  setMeta('meta[name="description"]', 'name', 'description', description);
  setCanonical(url);
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  if (image) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  }
};

const absoluteUrl = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
};

/** Identifiant du bloc de données structurées propre au produit affiché. */
const PRODUCT_LD_ID = 'seo-product-jsonld';

const removeProductJsonLd = () => {
  document.getElementById(PRODUCT_LD_ID)?.remove();
};

/**
 * Déclare le produit à Google : nom, image, prix, devise et disponibilité.
 * C'est ce qui permet l'affichage du prix et de la mention « En stock »
 * directement dans les résultats de recherche.
 */
const setProductJsonLd = (product: Product) => {
  removeProductJsonLd();
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.retailPrice;
  const image = absoluteUrl(product.imageUrl);

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — produit Longrich authentique disponible au Burkina Faso.`,
    category: product.category,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Longrich' },
    ...(image ? { image: [image] } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL.replace(/\/$/, '')}/?product=${product.id}`,
      priceCurrency: 'XOF',
      price: String(price),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: BUSINESS.name },
      areaServed: 'Burkina Faso',
    },
  };

  const script = document.createElement('script');
  script.id = PRODUCT_LD_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

const FAQ_LD_ID = 'seo-faq-jsonld';

/**
 * Déclare les questions fréquentes à Google. C'est ce qui permet à une réponse
 * de la boutique d'apparaître directement dans les résultats, et de capter les
 * recherches formulées en question.
 *
 * La source unique est FAQ dans seo.config.ts : modifier les questions là-bas
 * met à jour l'affichage et les données structurées d'un seul coup.
 */
export const applyFaqJsonLd = () => {
  if (document.getElementById(FAQ_LD_ID)) return;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  const script = document.createElement('script');
  script.id = FAQ_LD_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/** Balises de la page d'accueil (catalogue complet). */
export const applyHomeSeo = () => {
  removeProductJsonLd();
  applyTags(HOME_TITLE, HOME_DESCRIPTION, `${SITE_URL.replace(/\/$/, '')}/`);
};

/** Balises d'une fiche produit ouverte via un lien partagé. */
export const applyProductSeo = (product: Product) => {
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : product.retailPrice;
  const title = `${product.name} — ${price.toLocaleString('fr-FR')} F CFA | Longrich Burkina`;
  const description = product.description
    ? `${product.description} Disponible à Bobo-Dioulasso et Gaoua, livraison dans tout le Burkina Faso.`
    : `${product.name} au prix de ${price.toLocaleString('fr-FR')} F CFA. Produit Longrich authentique, livré partout au Burkina Faso.`;

  applyTags(
    title.slice(0, 70),
    description.slice(0, 300),
    `${SITE_URL.replace(/\/$/, '')}/?product=${product.id}`,
    absoluteUrl(product.imageUrl),
  );
  setProductJsonLd(product);
};

/** Balises d'une catégorie sélectionnée dans le catalogue. */
export const applyCategorySeo = (category: string, count: number) => {
  removeProductJsonLd();
  const title = `${category} Longrich au Burkina Faso — Bobo & Gaoua`;
  const description = `${count} produits Longrich de la gamme ${category} disponibles à Bobo-Dioulasso et Gaoua. `
    + `Livraison dans tout le Burkina Faso, l'espace AES et à l'étranger. Paiement Orange Money, Moov Money ou Wave.`;
  applyTags(title.slice(0, 70), description, `${SITE_URL.replace(/\/$/, '')}/`);
};
