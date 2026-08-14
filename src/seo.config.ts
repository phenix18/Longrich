/**
 * Configuration SEO centrale de la boutique.
 *
 * ⚠️ À METTRE À JOUR APRÈS L'ACHAT DU NOM DE DOMAINE : renseignez SITE_URL avec
 * l'adresse définitive (avec https://, sans barre oblique finale). Cette valeur
 * alimente les liens canoniques, le sitemap, les aperçus de partage et les
 * données structurées : une adresse erronée fait perdre tout le bénéfice.
 */
export const SITE_URL = 'https://longrich-burkina.com';

/** Identité commerciale reprise partout dans les balises et données structurées. */
export const BUSINESS = {
  name: 'Longrich Burkina Faso',
  legalName: 'Longrich Burkina Faso — Distributeur agréé',
  tagline: 'Distributeur agréé Longrich à Bobo-Dioulasso et Gaoua',
  /** Format international sans le +, comme le champ WhatsApp des réglages. */
  whatsapp: '22676104143',
  phoneDisplay: '+226 76 10 41 43',
  email: '',
  /**
   * Boutiques physiques. Renseignez `street` dès que possible : une adresse
   * précise pèse lourd dans le référencement local et dans Google Maps.
   */
  locations: [
    { city: 'Bobo-Dioulasso', region: 'Hauts-Bassins', street: '' },
    { city: 'Gaoua', region: 'Sud-Ouest', street: '' },
  ],
  /** Zones de livraison, reprises telles quelles dans le texte indexable. */
  deliveryZones: {
    national: [
      'Bobo-Dioulasso', 'Gaoua', 'Ouagadougou', 'Banfora', 'Koudougou',
      'Ouahigouya', 'Kaya', 'Dédougou', 'Fada N\'Gourma', 'Tenkodogo',
      'Diébougou', 'Orodara', 'Houndé', 'Réo', 'Pouytenga',
    ],
    aes: ['Mali', 'Niger'],
    international: ["Côte d'Ivoire", 'Togo', 'Bénin', 'Ghana', 'Sénégal'],
  },
} as const;

/**
 * Titre et description de la page d'accueil.
 * Le titre reste sous 60 caractères et la description sous 160, au-delà Google
 * tronque et l'intention se perd.
 */
export const HOME_TITLE = 'Longrich Burkina Faso — Boutique Bobo-Dioulasso & Gaoua';
export const HOME_DESCRIPTION =
  'Produits Longrich authentiques au Burkina Faso : compléments alimentaires, '
  + 'soins du corps, hygiène féminine à l\'anion, thés détox. Boutiques à '
  + 'Bobo-Dioulasso et Gaoua, livraison dans tout le pays, l\'espace AES et à l\'étranger.';

/**
 * Mots-clés visés, regroupés par intention de recherche.
 *
 * Volontairement absents : « pharmacie », « médicament », « guérir », « traitement
 * du cancer » et formulations voisines. Les produits Longrich sont des
 * compléments alimentaires et des cosmétiques, pas des médicaments : ces termes
 * exposent juridiquement et Google déclasse les sites qui promettent des
 * traitements. Les intentions santé légitimes sont couvertes par les termes
 * « complément alimentaire », « bien-être » et « soins naturels », qui captent
 * l'essentiel de ce trafic sans le risque.
 */
export const KEYWORD_GROUPS = {
  marque: [
    'Longrich Burkina Faso', 'Longrich Bobo-Dioulasso', 'Longrich Gaoua',
    'Longrich Ouagadougou', 'distributeur Longrich Burkina', 'boutique Longrich',
    'produits Longrich authentiques', 'Longrich prix Burkina',
  ],
  produits: [
    'dentifrice Longrich', 'savon bambou Longrich', 'gel de douche Longrich',
    'serviettes hygiéniques anion', 'protège slip anion', 'gobelet alcalin',
    'Cordyceps militaris', 'Berry Oil', 'Snake Oil', 'Nutriv Rich',
    'café Cordyceps', 'thé détox', 'thé minceur', 'thé tension',
    'chaussures énergétiques', 'power bank Longrich', 'couches bébé Longrich',
    'fourneau Envirofit', 'foyer amélioré charbon',
  ],
  besoins: [
    'complément alimentaire naturel', 'produits bien-être', 'soins naturels',
    'hygiène féminine naturelle', 'produit minceur', 'vitamine C',
    'calcium zinc fer', 'fortifiant naturel', 'soin de la peau',
    'produit anti-moustique', 'hygiène corporelle',
  ],
  achat: [
    'où acheter Longrich au Burkina', 'commander Longrich en ligne',
    'livraison Bobo-Dioulasso', 'livraison Gaoua', 'paiement Orange Money',
    'paiement Moov Money', 'paiement Wave', 'boutique en ligne Burkina Faso',
  ],
  opportunite: [
    'devenir distributeur Longrich', 'kit adhésion Longrich',
    'opportunité affaires Burkina', 'business Longrich AES',
  ],
} as const;

/** Chaîne unique pour la balise meta keywords. */
export const ALL_KEYWORDS = Object.values(KEYWORD_GROUPS).flat().join(', ');
