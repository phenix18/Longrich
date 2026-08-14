import { Product, ShopSettings } from '../types';

// Catégories officielles du catalogue (ordre d'affichage côté boutique et côté admin)
export const PRODUCT_CATEGORIES = [
  'Santé',
  'Soins & Hygiène',
  'Hygiène Féminine',
  'Produits Énergétiques',
  'Ménagère',
  "Kits d'Adhésion",
];

export const INITIAL_PRODUCTS: Product[] = [
  // PRODUITS DE SANTE
  {
    id: 'lr-01',
    name: 'GLUCOSAMINE 60 COMPRIMÉS',
    category: 'Santé',
    stock: 100,
    buyPrice: 20000,
    retailPrice: 24000,
    discountPercent: 10,
    salePrice: 21600,
    benefit: 1600,
    imageUrl: '/products/lr-01-glucosamine-arthro.jpg',
    description: 'Complément alimentaire pour le confort articulaire et osseux. Idéal pour soulager l\'arthrose et les douleurs musculaires.'
  },
  {
    id: 'lr-02',
    name: 'BERRY OIL 120 CAPSULES',
    category: 'Santé',
    stock: 100,
    buyPrice: 31000,
    retailPrice: 36000,
    benefit: 5000,
    imageUrl: '/products/lr-02-berry-oil.jpg',
    description: 'Huile d\'argousier riche en antioxydants, vitamines, et omégas 3, 6, 7, 9. Protège les organes vitaux et lutte contre les méfaits du vieillissement.'
  },
  {
    id: 'lr-03',
    name: 'BOISSON ÉNERGISANTE 250ML',
    category: 'Santé',
    stock: 100,
    buyPrice: 3000,
    retailPrice: 4000,
    benefit: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    description: 'Boisson rafrâichissante et stimulante, booste l\'énergie physique et la concentration intellectuelle.'
  },
  {
    id: 'lr-04',
    name: 'CALCIUM, ZINC, FER 100 COMPRIMÉS',
    category: 'Santé',
    stock: 100,
    buyPrice: 11500,
    retailPrice: 14000,
    benefit: 2500,
    imageUrl: '/products/lr-04-calcium.jpg',
    description: 'Mélange équilibré de minéraux essentiels pour renforcer l\'ossature, l\'immunité et lutter contre la fatigue.'
  },
  {
    id: 'lr-05',
    name: 'CAFÉ CORDYCEPS 10 STICKS',
    category: 'Santé',
    stock: 100,
    buyPrice: 6000,
    retailPrice: 8000,
    discountPercent: 15,
    salePrice: 6800,
    benefit: 800,
    imageUrl: '/products/lr-05-cafe-cordyceps.jpg',
    description: 'Délicieux café enrichi en extraits de Cordyceps, fortifie les poumons, les reins et augmente la vitalité sexuelle.'
  },
  {
    id: 'lr-06',
    name: 'LOE POWER (LIBAO) 160 CAPSULES',
    category: 'Santé',
    stock: 100,
    buyPrice: 25000,
    retailPrice: 30000,
    benefit: 5000,
    imageUrl: '/products/lr-06-libao.jpg',
    description: 'Puissant fortifiant pour homme. Améliore la fertilité masculine, la qualité du sperme, et combat la fatigue.'
  },
  {
    id: 'lr-07',
    name: 'MENGQUIAN 160 CAPSULES',
    category: 'Santé',
    stock: 100,
    buyPrice: 25000,
    retailPrice: 30000,
    benefit: 5000,
    imageUrl: '/products/lr-07-mengqian.jpg',
    description: 'Régulateur hormonal pour femme. Combat la fatigue, traite les troubles de la ménopause, et illumine la peau.'
  },
  {
    id: 'lr-08',
    name: 'CORDYCEPS MILITARIS 60 CAPSULES',
    category: 'Santé',
    stock: 100,
    buyPrice: 75000,
    retailPrice: 87000,
    benefit: 12000,
    imageUrl: '/products/lr-08-cordyceps-militaris.jpg',
    description: 'L\'or de Longrich. Puissant antibiotique naturel, stimule l\'immunité, protège le foie et combat la fatigue.'
  },
  {
    id: 'lr-09',
    name: 'LIQUEUR THÉRAPEUTIQUE 500ML',
    category: 'Santé',
    stock: 100,
    buyPrice: 14000,
    retailPrice: 17000,
    benefit: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&auto=format&fit=crop&q=80',
    description: 'Boisson de santé qui améliore la circulation sanguine, soulage les rhumatismes et booste la vitalité.'
  },
  {
    id: 'lr-10',
    name: 'VIN ROUGE ONDES RAGEUSES',
    category: 'Santé',
    stock: 100,
    buyPrice: 25500,
    retailPrice: 30000,
    benefit: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80',
    description: 'Vin rouge thérapeutique d\'ondes de vitalité, riche en antioxydants protecteurs cardiovasculaires.'
  },
  {
    id: 'lr-11',
    name: 'VITAMINE C 60 COMPRIMÉS',
    category: 'Santé',
    stock: 100,
    buyPrice: 11000,
    retailPrice: 13500,
    benefit: 2500,
    imageUrl: '/products/lr-11-vitamine-c.jpg',
    description: 'Vitamine C hautement assimilable pour recharger le corps en énergie et fortifier l\'immunité.'
  },
  {
    id: 'lr-12',
    name: 'THÉ VERT DETOX 15 SACHETS',
    category: 'Santé',
    stock: 100,
    buyPrice: 6500,
    retailPrice: 8000,
    benefit: 1500,
    imageUrl: '/products/lr-12-the-vert.jpg',
    description: 'Élimine les toxines, facilite la digestion, et aide à nettoyer naturellement le corps.'
  },
  {
    id: 'lr-13',
    name: 'THÉ MARRON TENSION 15 SACHETS',
    category: 'Santé',
    stock: 100,
    buyPrice: 6500,
    retailPrice: 8000,
    benefit: 1500,
    imageUrl: '/products/lr-13-the-tension.jpg',
    description: 'Formulé pour aider à réguler naturellement et harmonieusement la tension artérielle.'
  },
  {
    id: 'lr-14',
    name: 'THÉ ROSE MINCEUR 15 SACHETS',
    category: 'Santé',
    stock: 100,
    buyPrice: 6500,
    retailPrice: 8000,
    benefit: 1500,
    imageUrl: '/products/lr-14-the-minceur.jpg',
    description: 'Aide à brûler les graisses abdominales superflues et favorise un transit agréable.'
  },
  {
    id: 'lr-15',
    name: "GENTLEMAN'S SUPERIOR (performance masculine)",
    category: 'Santé',
    stock: 100,
    buyPrice: 21000,
    retailPrice: 25000,
    benefit: 4000,
    imageUrl: '/products/lr-15-gentlemen.jpg',
    description: 'Complément de performance premium, conçu pour la force physique et la vitalité masculine au quotidien.'
  },
  {
    id: 'lr-16',
    name: "LADY'S SUPERIOR (performance féminine)",
    category: 'Santé',
    stock: 100,
    buyPrice: 21000,
    retailPrice: 25000,
    benefit: 4000,
    imageUrl: '/products/lr-16-lady-superior.jpg',
    description: 'Soutient la vitalité générale, régule le stress et prend soin de l\'énergie de la femme active.'
  },
  {
    id: 'lr-17',
    name: 'SLEEP & NUTRIENTS (sommeil et nutriments)',
    category: 'Santé',
    stock: 100,
    buyPrice: 21000,
    retailPrice: 25000,
    benefit: 4000,
    imageUrl: '/products/lr-17-sleep-nutrients.jpg',
    description: 'Facilite l\'endormissement rapide et procure un sommeil profond hautement réparateur et enrichi en nutriments.'
  },
  {
    id: 'lr-18',
    name: 'NUTRIV RICH BLEU 10 SACHETS',
    category: 'Santé',
    stock: 100,
    buyPrice: 31000,
    retailPrice: 35000,
    benefit: 4000,
    imageUrl: '/products/lr-18-nutriv-rich-bleu.jpg',
    description: 'Alimentation crue de substitution complète, riche en antioxydants et nutriments bio.'
  },
  {
    id: 'lr-19',
    name: 'NUTRIV RICH ROSE 10 SACHETS',
    category: 'Santé',
    stock: 100,
    buyPrice: 31000,
    retailPrice: 35000,
    benefit: 4000,
    imageUrl: '/products/lr-19-nutriv-rich-rose.jpg',
    description: 'Cocktail de nutriments détoxifiants pour purifier les cellules et revigorer l\'éclat sain interne.'
  },
  {
    id: 'lr-20',
    name: 'GOBELET ALCALIN 400ML',
    category: 'Santé',
    stock: 100,
    buyPrice: 50000,
    retailPrice: 60000,
    benefit: 10000,
    imageUrl: '/products/lr-20-gobelet-alcalin.jpg',
    description: 'Transforme l\'eau acide en eau alcaline saine avec des ions négatifs riches en antioxydants vitaux.'
  },

  // PRODUITS A USAGE QUOTIDIEN
  {
    id: 'lr-21',
    name: 'PARFUM ANTI MOUSTIQUES 195ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 4000,
    retailPrice: 5000,
    benefit: 1000,
    imageUrl: '/products/lr-21-anti-moustique.jpg',
    description: 'Formule saine et odorante protégeant efficacement contre les attaques et piqûres de moustiques.'
  },
  {
    id: 'lr-22',
    name: 'DÉODORANT ANTI TRANSPIRANT 50ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 3500,
    retailPrice: 4500,
    benefit: 1000,
    imageUrl: '/products/lr-22-deodorant.jpg',
    description: 'Régule la sudation corporelle sans occlure les pores. Protège 48 heures de toute odeur désagréable.'
  },
  {
    id: 'lr-23',
    name: 'PÂTE DENTIFRICE MULTIFONCTIONS 100G',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 2200,
    retailPrice: 3000,
    benefit: 800,
    imageUrl: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=500&auto=format&fit=crop&q=80',
    description: 'Au thé blanc et à l\'aloe vera protecteur. Nettoie en profondeur et élimine la sensibilité gingivale.'
  },
  {
    id: 'lr-24',
    name: 'PÂTE DENTIFRICE MULTIFONCTIONS 200G',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 4000,
    retailPrice: 5000,
    benefit: 1000,
    imageUrl: '/products/lr-24-dentifrice-200g.jpg',
    description: 'Le format familial économique de la célèbre pâte dentifrice blanche réparatrice Longrich.'
  },
  {
    id: 'lr-25',
    name: 'PÂTE DENTIFRICE POUR ENFANT 60G',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 2000,
    retailPrice: 2500,
    benefit: 500,
    imageUrl: '/products/lr-25-dentifrice-enfant.jpg',
    description: 'Spécialement adaptée pour les gencives sensibles des enfants. Totalement exempte de fluor chimique.'
  },
  {
    id: 'lr-26',
    name: 'BROSSE A DENTS ADULTE',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 1100,
    retailPrice: 1500,
    benefit: 400,
    imageUrl: 'https://images.unsplash.com/photo-1471218674243-e8a68a00415e?w=500&auto=format&fit=crop&q=80',
    description: 'Brosse à dents ergonomique aux micro-poils souples pour désincruster les gencives sensibles.'
  },
  {
    id: 'lr-27',
    name: 'BROSSE A DENTS POUR ENFANT',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 1100,
    retailPrice: 1500,
    benefit: 400,
    imageUrl: '/products/lr-27-brosse-dents-enfant.jpg',
    description: 'Tête miniature douce aux coloris amusants pour encourager le brossage quotidien sain chez l\'enfant.'
  },
  {
    id: 'lr-28',
    name: 'COUCHE DE BEBE (S, M, L, XL)',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 8000,
    retailPrice: 9500,
    benefit: 1500,
    imageUrl: '/products/lr-28-couches-bebe.jpg',
    description: 'Couches respirantes et hypoallergéniques d\'absorption totale pour préserver les fesses de bébé.'
  },
  {
    id: 'lr-29',
    name: 'CRÈME DE MAIN REPARATRICE 100G',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 3800,
    retailPrice: 4700,
    benefit: 900,
    imageUrl: '/products/lr-29-creme-mains.jpg',
    description: 'Nourrit, répare et assouplit instantanément les mains rêches ou desséchées par les tâches ménagères.'
  },
  {
    id: 'lr-30',
    name: 'GEL DE DOUCHE AU THE BLANC 300ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 7000,
    retailPrice: 8000,
    benefit: 1000,
    imageUrl: '/products/lr-30-gel-douche-300ml.jpg',
    description: 'Nettoie en douceur avec une délicate note relaxante aromatique de thé blanc d\'exception.'
  },
  {
    id: 'lr-31',
    name: 'CHAMPOING AU THE BLANC 300ML (2 en 1)',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 6600,
    retailPrice: 7500,
    benefit: 900,
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80',
    description: 'Nettoie la fibre capillaire, combat les pellicules et hydrate le cuir chevelu en douceur.'
  },
  {
    id: 'lr-32',
    name: 'GEL DE DOUCHE OLIVE OIL',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 9500,
    retailPrice: 12000,
    benefit: 2500,
    imageUrl: '/products/lr-32-gel-douche-olive.jpg',
    description: 'Élaboré à base d\'huile d\'olive nourrissante et hydratante pour les peaux les plus desséchées.'
  },
  {
    id: 'lr-33',
    name: 'HUILE ESSENTIELLE/SNAKE OIL 80ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 4000,
    retailPrice: 5000,
    benefit: 1000,
    imageUrl: '/products/lr-33-snake-oil-80ml.jpg',
    description: 'Huile de serpent traditionnelle pour revigorer les cheveux et soigner les imperfections cutanées.'
  },
  {
    id: 'lr-34',
    name: 'HUILE ESSENTIELLE/SNAKE OIL 120ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 5000,
    retailPrice: 6000,
    benefit: 1000,
    imageUrl: '/products/lr-34-snake-oil-120ml.jpg',
    description: 'Format XL de l\'incroyable huile de serpent réparatrice corporelle et capillaire multifonctions.'
  },
  {
    id: 'lr-35',
    name: 'KIT DE VOYAGE (5 produits)',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 1000,
    retailPrice: 1500,
    benefit: 500,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80',
    description: 'Un kit compact très pratique contenant vos miniatures indispensables pour tous vos déplacements.'
  },
  {
    id: 'lr-36',
    name: 'LAIT DE CORPS SOD 200ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 4500,
    retailPrice: 6000,
    benefit: 1500,
    imageUrl: '/products/lr-36-lait-sod.jpg',
    description: 'Lait hydratant corporel intense aux enzymes SOD. Atténue visiblement les vergetures et imperfections.'
  },
  {
    id: 'lr-37',
    name: 'LOTION RAJEUNISSANTE 165ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 4000,
    retailPrice: 5000,
    benefit: 1000,
    imageUrl: '/products/lr-37-lotion-rajeunissante.jpg',
    description: 'Lotion hydratante anti-âge raffermissant le visage pour une mine lumineuse éclatante.'
  },
  {
    id: 'lr-38',
    name: 'LOTION ANTI DOULEURS 60ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 1500,
    retailPrice: 2000,
    benefit: 500,
    imageUrl: '/products/lr-38-lotion-anti-douleurs.jpg',
    description: 'Effet antalgique et chauffant rapide pour soulager courbatures et tensions musculaires.'
  },
  {
    id: 'lr-39',
    name: 'PARFUM POUR HOMME',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 10000,
    retailPrice: 12000,
    benefit: 2000,
    imageUrl: '/products/lr-39-parfum-homme.jpg',
    description: 'Senteur masculine élégante et majestueuse, pour une assurance et un sillage remarquable.'
  },
  {
    id: 'lr-40',
    name: 'PARFUM POUR FEMME',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 10000,
    retailPrice: 12000,
    benefit: 2000,
    imageUrl: '/products/lr-40-parfum-femme.jpg',
    description: 'Fragrance fleurie exquise, capturant le charme naturel de la femme moderne raffinée.'
  },
  {
    id: 'lr-41',
    name: 'CHAMPOING ET GEL DE DOUCHE BEBE',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 7000,
    retailPrice: 8000,
    benefit: 1000,
    imageUrl: '/products/lr-41-shampoing-bebe.jpg',
    description: 'Nettoyant 2-en-1 ultra-doux au pH neutre protecteur pour le cuir chevelu de votre bébé.'
  },
  {
    id: 'lr-42',
    name: 'POUDRE DE BEBE',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 7000,
    retailPrice: 8000,
    benefit: 1000,
    imageUrl: '/products/lr-42-poudre-bebe.jpg',
    description: 'Finition talc soyeuse aux extraits de maïs bio pour empêcher les frottements d\'humidité irritants.'
  },
  {
    id: 'lr-43',
    name: 'SAVON NOIR AU BAMBOU (3x100g)',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 6300,
    retailPrice: 7500,
    benefit: 1200,
    imageUrl: '/products/lr-43-savon-bambou.jpg',
    description: 'Soin purifiant intense au charbon actif de bambou. Lutte radicalement contre l\'acné rebelle.'
  },
  {
    id: 'lr-44',
    name: 'PARFUM DE BOUCHE 15G',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 3200,
    retailPrice: 4000,
    benefit: 800,
    imageUrl: '/products/lr-44-senteur-bouche.jpg',
    description: 'Spray désinfectant buccal rapide pour rafraîchir l\'haleine et assainir la bouche des germes.'
  },
  {
    id: 'lr-45',
    name: 'GEL DE DOUCHE AU BILE DE SERPENT 380ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 7000,
    retailPrice: 8500,
    benefit: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&auto=format&fit=crop&q=80',
    description: 'Traitement protecteur cutané en gel moussant hydratant contre les agressions démangeantes.'
  },
  {
    id: 'lr-46',
    name: 'GEL AU BILE DE SERPENT 20G',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 4000,
    retailPrice: 4500,
    benefit: 500,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80',
    description: 'Soin local concentré apaisant, idéal pour soigner rapidement eczéma, dartre et brûlures légères.'
  },
  {
    id: 'lr-47',
    name: 'SACHETS LONGRICHE (paquets de 100)',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 7500,
    retailPrice: 8500,
    benefit: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80',
    description: 'Emballages officiels certifiés pour la mise en valeur élégante de vos produits Longrich.'
  },
  {
    id: 'lr-48',
    name: 'TESTEUR PH/REACTIF PH',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 1000,
    retailPrice: 1500,
    benefit: 500,
    imageUrl: '/products/lr-48-reactif-ph.jpg',
    description: 'Réactif pratique pour tester instantanément le potentiel d\'hydrogénation (acidité/alcalinité).'
  },
  {
    id: 'lr-49',
    name: 'KIT DEMO',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 23000,
    retailPrice: 25000,
    benefit: 2000,
    imageUrl: '/products/lr-49-kit-demonstration.jpg',
    description: 'Mallette complète de démonstration pratique contenant divers réactifs officiels.'
  },
  {
    id: 'lr-50',
    name: 'PRÉSERVATIF MASCULIN',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 5000,
    retailPrice: 6000,
    benefit: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80',
    description: 'Préserve les rapports intimes avec la plus fine sensation en toute sécurité testée.'
  },
  {
    id: 'lr-51',
    name: 'CHAMPOING AU THE BLANC 200ML',
    category: 'Soins & Hygiène',
    stock: 100,
    buyPrice: 3500,
    retailPrice: 5000,
    benefit: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80',
    description: 'Nettoyant purifiant doux pour révéler éclat et souplesse de tous types de cheveux.'
  },

  // PRODUITS DE FEMME
  {
    id: 'lr-52',
    name: 'SERVIETTES HYGIENIQUES EN CARTON',
    category: 'Hygiène Féminine',
    stock: 100,
    buyPrice: 57000,
    retailPrice: 67000,
    benefit: 10000,
    imageUrl: '/products/lr-52-serviettes-hygieniques.jpg',
    description: 'Carton complet de serviettes thérapeutiques ultra absorbantes à bande d\'anions magnétisante.'
  },
  {
    id: 'lr-53',
    name: 'PROTEGE SLIP EN CARTON',
    category: 'Hygiène Féminine',
    stock: 100,
    buyPrice: 57000,
    retailPrice: 67000,
    benefit: 10000,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    description: 'Carton complet de protége-slips Longrich à l\'anion pour une hygiène intime protectrice quotidienne.'
  },
  {
    id: 'lr-54',
    name: 'SERVIETTES HYGIENIQUE EN DETAIL',
    category: 'Hygiène Féminine',
    stock: 100,
    buyPrice: 3500,
    retailPrice: 4500,
    benefit: 1000,
    imageUrl: '/products/lr-54-serviettes-detail.jpg',
    description: 'Paquet individuel de serviettes. Protège contre irritations, mauvaises odeurs et candidoses.'
  },
  {
    id: 'lr-55',
    name: 'PROTEGE SLIP EN DETAIL',
    category: 'Hygiène Féminine',
    stock: 100,
    buyPrice: 4000,
    retailPrice: 5000,
    benefit: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    description: 'Paquet quotidien protégeant des pertes blanches gênantes et préservant le confort gynécologique.'
  },

  // PRODUITS ENERGETIQUES
  {
    id: 'lr-56',
    name: 'POWER BANK',
    category: 'Produits Énergétiques',
    stock: 100,
    buyPrice: 23000,
    retailPrice: 27000,
    benefit: 4000,
    imageUrl: '/products/lr-56-power-bank.jpg',
    description: 'Batterie externe brevetée à haut rendement énergétique d\'une longévité accrue.'
  },
  {
    id: 'lr-57',
    name: 'CHAUSSURES ENERGETIQUES A+',
    category: 'Produits Énergétiques',
    stock: 100,
    buyPrice: 105000,
    retailPrice: 120000,
    benefit: 15000,
    imageUrl: '/products/lr-57-chaussures-energetiques.jpg',
    description: 'Chaussures magnétiques thérapeutiques stimulant les points d\'acuponcture de la voûte plantaire.'
  },

  // PRODUITS MENAGERS
  {
    id: 'lr-67',
    name: 'FOURNEAU DE CUISINE ENVIROFIT (FOYER AMÉLIORÉ)',
    category: 'Ménagère',
    stock: 100,
    buyPrice: 25000,
    retailPrice: 30000,
    benefit: 5000,
    imageUrl: '/products/fourneau-envirofit-01.jpg',
    images: [
      '/products/fourneau-envirofit-02.jpg',
      '/products/fourneau-envirofit-03.jpg'
    ],
    description: 'Foyer amélioré à charbon Envirofit : corps métallique robuste, chambre de combustion céramique et grille amovible. Porte de tirage réglable pour maîtriser le feu, poignées latérales isolantes pour déplacer le fourneau en sécurité. Cuisson plus rapide avec beaucoup moins de charbon et de fumée qu\'un foyer traditionnel.'
  },

  // KITS D'ADHESION
  {
    id: 'lr-58',
    name: 'KR1',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 85000,
    retailPrice: 85000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
    description: 'Kit d\'inscription officiel Longrich KR1 contenant divers produits essentiels d\'activation.'
  },
  {
    id: 'lr-59',
    name: 'KR2',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 85000,
    retailPrice: 85000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
    description: 'Kit d\'inscription officiel Longrich KR2 permettant d\'activer votre compte distributeur partenaire.'
  },
  {
    id: 'lr-60',
    name: 'SILVER COMBO A',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 160000,
    retailPrice: 160000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&auto=format&fit=crop&q=80',
    description: 'Pack Silver Combo A complet offrant un excellent assortiment de soins personnels et santé.'
  },
  {
    id: 'lr-61',
    name: 'SILVER COMBO B',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 160000,
    retailPrice: 160000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&auto=format&fit=crop&q=80',
    description: 'Pack Silver Combo B axé spécifiquement sur de performants produits cosmétiques et quotidiens.'
  },
  {
    id: 'lr-62',
    name: 'SILVER COMBO C',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 160000,
    retailPrice: 160000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&auto=format&fit=crop&q=80',
    description: 'Pack Combo Silver C, idéal pour démarrer confortablement votre propre affaire de distribution.'
  },
  {
    id: 'lr-63',
    name: 'SILVER (COMBO M)',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 160000,
    retailPrice: 160000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&auto=format&fit=crop&q=80',
    description: 'Pack Starter Combo M, idéal pour obtenir d\'excellents points de volume (PV) d\'affiliation d\'un coup.'
  },
  {
    id: 'lr-64',
    name: 'COMBO GOLD',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 340000,
    retailPrice: 340000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&auto=format&fit=crop&q=80',
    description: 'Option Gold d\'affaires très complète contenant des compléments hautement prisés et produits récurrents.'
  },
  {
    id: 'lr-65',
    name: 'PLATINIUM',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 850000,
    retailPrice: 850000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=500&auto=format&fit=crop&q=80',
    description: 'Statut Platinum direct, idéal pour les professionnels visant de confortables bonus hebdomadaires.'
  },
  {
    id: 'lr-66',
    name: 'PLATINIUM VIP',
    category: "Kits d'Adhésion",
    stock: 100,
    buyPrice: 1900000,
    retailPrice: 1900000,
    benefit: 0,
    imageUrl: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=500&auto=format&fit=crop&q=80',
    description: 'Le statut VIP d\'exception du réseau d\'affaires Longrich. Donne droit au partage global des bénéfices mondiaux.'
  }
];

export const DEFAULT_SETTINGS: ShopSettings = {
  whatsappNumber: '22676104143', // Commercial destinataire des commandes (Orange + WhatsApp)
  orangeMoneyNumber: '0022676104143',
  orangeMoneyName: 'ZALLE SAFIF',
  moovMoneyNumber: '0022670829293',
  moovMoneyName: 'ADAMA TAO',
  waveNumber: '0022670829293', // Même compte que Moov
  waveName: 'ADAMA TAO',
  deliveryManagerNumber: '', // À renseigner dans l'admin : numéro WhatsApp du responsable livreur
  deliveryManagerName: 'Responsable Livraison',
  adminPin: '000000',
  shopName: 'Longrich Burkina Faso',
  shopCity: 'Ouagadougou',
  deliveryWithinRadiusPrice: 1000,
  deliveryOutsideRadiusPrice: 1500,
  deliveryOtherCityPrice: 2000,
  deliveryOtherCountryPrice: 5000,
  logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80' // A beautiful nature green placeholder logo
};
