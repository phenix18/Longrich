export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  buyPrice: number;    // Prix d'achat (admin only)
  retailPrice: number; // Prix de revente (visible to client and admin)
  salePrice?: number;  // Prix soldé / promotionnel (visible to client and admin, if set)
  discountPercent?: number; // Pourcentage de réduction (%) réglé par l'admin
  pourcentageSolde?: number; // Pourcentage de réduction (%) - French alias as requested
  lowStockThreshold?: number; // Seuil d'alerte de stock bas personnalisé par produit
  benefit: number;     // Bénéfice (calculated automatically, admin only)
  imageUrl?: string;
  images?: string[];   // Multiple product images (base64 or URL)
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  city: string;
  country?: string; // Saisie si hors du pays de la boutique
  deliveryDistance?: string; // Ex: 'Moins de 6 km', 'Plus de 6 km', 'Autre Ville', 'Autre Pays'
  deliveryFee?: number; // Montant de la livraison calculé
  paymentMethod: 'Orange Money' | 'Moov Money';
  paymentScreenshot?: string; // Optionnelle - Capture d'écran (preuve de paiement en Base64)
  items: {
    productId: string;
    productName: string;
    quantity: number;
    retailPrice: number;
    buyPrice: number; // Stored at purchase time to keep accurate profit history
  }[];
  totalPrice: number;
  totalProfit: number;
  status: 'En attente' | 'Livré et Payé' | 'Annulé';
  createdAt: string;
  orderNotes?: string;
}

export interface ShopSettings {
  whatsappNumber: string; // En format international sans +, ex: 22670000000
  orangeMoneyNumber: string; // Ex: 70 00 00 00
  orangeMoneyName: string; // Nom du titulaire du compte
  moovMoneyNumber: string;
  moovMoneyName: string;
  adminPin: string; // Protection d'accès
  shopName: string;
  shopCity: string; // Ville d'ancrage de la boutique. Ex: 'Ouagadougou'
  deliveryWithinRadiusPrice: number; // Ex: 1000 XOF (rayon <= 6km)
  deliveryOutsideRadiusPrice: number; // Ex: 1500 XOF (rayon > 6km même ville)
  deliveryOtherCityPrice: number; // Ex: 2500 XOF (expédition autre ville)
  deliveryOtherCountryPrice: number; // Ex: 5000 XOF (expédition autre pays)
  logoUrl?: string; // Image URL personnalisée pour le logo de la boutique
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_order' | 'info';
  orderId?: string;
  orderAmount?: number;
  customerName?: string;
  customerPhone?: string;
  city?: string;
  createdAt: string;
  read: boolean;
  emailNotified?: boolean;
}
