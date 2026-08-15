/**
 * Configuration SEO centrale de la boutique.
 *
 * SITE_URL alimente les liens canoniques, le sitemap, les aperçus de partage et
 * les données structurées. Le domaine apparaît aussi en dur dans index.html et
 * public/robots.txt : en cas de changement, modifier les trois ensemble, sans
 * quoi Google reçoit des adresses contradictoires.
 */
export const SITE_URL = 'https://longrich-burkina.homes';

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
    { city: 'Bobo-Dioulasso', region: 'Hauts-Bassins', street: 'Secteur 21, près du marché de Sarfalao' },
    { city: 'Gaoua', region: 'Sud-Ouest', street: 'Non loin de la mairie, à proximité du marché' },
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
    // Intentions de recherche liées à la santé, formulées comme ce que les
    // produits sont réellement : un soutien nutritionnel ou un soin, jamais un
    // traitement. Ces tournures captent le même public sans promesse trompeuse.
    'complément alimentaire contre la fatigue', 'confort articulaire',
    'soutien des défenses immunitaires', 'bien-être digestif',
    'transit intestinal', 'complément énergie et vitalité',
    'soin apaisant peau sensible', 'hygiène intime féminine',
    'complément alimentaire pour femme', 'complément alimentaire pour homme',
    'nutrition et micronutriments', 'antioxydants naturels',
    'eau alcaline', 'produit détoxifiant naturel',
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

/**
 * Questions fréquentes, affichées sur la page et déclarées à Google en
 * données structurées FAQPage.
 *
 * C'est le meilleur levier pour les recherches formulées en question, très
 * courantes depuis un téléphone. La question sur le statut des produits est
 * volontairement présente : elle capte les recherches à intention santé tout
 * en donnant la réponse exacte, ce qui protège la boutique et inspire
 * confiance au lieu de promettre un traitement.
 */
export const FAQ: { question: string; answer: string }[] = [
  {
    question: 'Où acheter des produits Longrich au Burkina Faso ?',
    answer:
      "Longrich Burkina Faso dispose de deux boutiques physiques, à Bobo-Dioulasso "
      + "(région des Hauts-Bassins) et à Gaoua (région du Sud-Ouest). Le catalogue "
      + "complet est également commandable en ligne sur ce site, avec livraison dans "
      + "tout le pays.",
  },
  {
    question: 'Comment commander et payer ma commande ?',
    answer:
      "Ajoutez les articles au panier, renseignez votre nom, votre téléphone et votre "
      + "ville, puis validez : la commande part sur WhatsApp au +226 76 10 41 43. Le "
      + "paiement se fait par Orange Money, Moov Money ou Wave, et vous joignez la "
      + "capture du dépôt à la conversation.",
  },
  {
    question: 'Livrez-vous partout au Burkina Faso et à l\'étranger ?',
    answer:
      "Oui. La livraison couvre Bobo-Dioulasso, Gaoua, Ouagadougou, Banfora, Koudougou, "
      + "Ouahigouya, Diébougou, Orodara et l'ensemble du territoire burkinabè. Nous "
      + "expédions aussi dans l'espace AES (Mali, Niger) ainsi qu'en Côte d'Ivoire, au "
      + "Togo, au Bénin, au Ghana et au Sénégal. Les frais dépendent de la distance et "
      + "s'affichent avant validation.",
  },
  {
    question: 'Les produits Longrich sont-ils des médicaments ?',
    answer:
      "Non. Les produits Longrich sont des compléments alimentaires, des produits "
      + "d'hygiène et des cosmétiques. Ils apportent un soutien nutritionnel ou un soin "
      + "du quotidien, mais ne soignent aucune maladie et ne remplacent ni un avis "
      + "médical, ni un traitement prescrit. Si vous suivez un traitement, êtes enceinte "
      + "ou avez un problème de santé, parlez-en à un professionnel de santé avant "
      + "d'utiliser un complément alimentaire.",
  },
  {
    question: 'Les produits vendus sont-ils authentiques ?',
    answer:
      "Oui. Longrich Burkina Faso est distributeur agréé : les articles proviennent du "
      + "circuit officiel Longrich et les prix suivent la grille tarifaire officielle "
      + "en vigueur au Burkina Faso.",
  },
  {
    question: 'Quels sont les prix des produits Longrich au Burkina Faso ?',
    answer:
      "Les prix vont de 1 500 F CFA pour une brosse à dents à 1 900 000 F CFA pour le "
      + "kit d'adhésion VIP. Chaque fiche produit affiche son prix à jour, et la grille "
      + "tarifaire complète est téléchargeable depuis la page d'accueil.",
  },
  {
    question: 'Comment devenir distributeur Longrich au Burkina Faso ?',
    answer:
      "L'adhésion passe par un kit : Q-Silver (KR1 ou KR2) à 85 000 F CFA, Silver à "
      + "160 000 F CFA, Gold à 340 000 F CFA, Platinium à 850 000 F CFA ou VIP à "
      + "1 900 000 F CFA. Contactez-nous sur WhatsApp au +226 76 10 41 43 pour être "
      + "accompagné dans le choix et l'inscription.",
  },
];
