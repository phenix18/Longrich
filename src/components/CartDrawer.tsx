import React, { useState } from 'react';
import { CartItem, ShopSettings, Order } from '../types';
import { ShoppingCart, X, MessageSquare, CreditCard, ChevronRight, Check, Upload, Tag, Truck, Gift, Trash2, MapPin } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onClearCart: () => void;
  settings: ShopSettings;
  onOrderPlaced: (order: Order) => void;
}

const BURKINA_CITIES = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Ouahigouya',
  'Banfora',
  'Kaya',
  'Dédougou',
  'Fada N\'Gourma',
  'Tenkodogo',
  'Pouytenga',
  'Reo',
  'Garango',
  'Kongoussi'
];

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  settings,
  onOrderPlaced,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Delivery types: in-city-radius6, in-city-beyond6, other-city, international
  const [deliveryType, setDeliveryType] = useState<'within_6km' | 'outside_6km' | 'other_city' | 'other_country'>('within_6km');
  const [city, setCity] = useState(settings.shopCity || 'Ouagadougou');
  const [customCityName, setCustomCityName] = useState('');
  const [customCountryName, setCustomCountryName] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Orange Money');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isCompactingImage, setIsCompactingImage] = useState(false);

  // Position GPS partagée par le client (transmise ensuite au livreur)
  const [locationLink, setLocationLink] = useState<string>('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto synchronise the store city state with settings changes
  React.useEffect(() => {
    if (settings?.shopCity) {
      setCity(settings.shopCity);
    }
  }, [settings]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.product.salePrice && item.product.salePrice > 0 ? item.product.salePrice : item.product.retailPrice) * item.quantity,
    0
  );

  // Delivery fee calculation based on states and shop settings
  let deliveryFee = 0;
  let deliveryOptionLabel = '';

  if (deliveryType === 'within_6km') {
    deliveryFee = settings.deliveryWithinRadiusPrice !== undefined ? settings.deliveryWithinRadiusPrice : 1000;
    deliveryOptionLabel = `Livraison locale (Rayon < 6km dans ${city})`;
  } else if (deliveryType === 'outside_6km') {
    deliveryFee = settings.deliveryOutsideRadiusPrice !== undefined ? settings.deliveryOutsideRadiusPrice : 1500;
    deliveryOptionLabel = `Livraison standard (Rayon > 6km dans ${city})`;
  } else if (deliveryType === 'other_city') {
    deliveryFee = settings.deliveryOtherCityPrice !== undefined ? settings.deliveryOtherCityPrice : 2000;
    const specifiedCity = customCityName.trim() || 'Autre ville de l\'intérieur';
    deliveryOptionLabel = `Expédition vers la ville : ${specifiedCity}`;
  } else {
    deliveryFee = settings.deliveryOtherCountryPrice !== undefined ? settings.deliveryOtherCountryPrice : 5000;
    const specifiedCountry = customCountryName.trim() || 'Hors du Burkina Faso';
    deliveryOptionLabel = `Expédition Internationale vers le Pays : ${specifiedCountry}`;
  }

  const netPayable = totalAmount + deliveryFee;

  const formatXOF = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' F CFA';
  };

  // Compte de dépôt correspondant au moyen de paiement choisi.
  // Wave partage le compte Moov tant qu'aucun numéro dédié n'est configuré.
  const paymentAccount = paymentMethod === 'Orange Money'
    ? { number: settings.orangeMoneyNumber, name: settings.orangeMoneyName }
    : paymentMethod === 'Wave'
      ? { number: settings.waveNumber || settings.moovMoneyNumber, name: settings.waveName || settings.moovMoneyName }
      : { number: settings.moovMoneyNumber, name: settings.moovMoneyName };

  // WhatsApp ne transporte que du texte via un lien : les photos sont donc
  // envoyées sous forme d'URL cliquable. Les images en base64 (chargées depuis
  // l'admin) n'ont pas d'URL publique et sont ignorées.
  const toShareableImageUrl = (src?: string) => {
    if (!src || src.startsWith('data:')) return '';
    if (/^https?:\/\//i.test(src)) return src;
    return `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Ce téléphone ne permet pas le partage de position.");
      return;
    }
    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationLink(`https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`);
        setIsLocating(false);
      },
      () => {
        setLocationError("Position refusée ou indisponible. Décrivez votre repère dans les notes.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Helper to scale & compress screenshot to fit in Firestore (zero-dependency Canvas rescaling)
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScreenshotName(file.name);
    setIsCompactingImage(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 500; // Optimal scaling to compress size heavily
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to compact image/jpeg format
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setPaymentScreenshot(compressedBase64);
        setIsCompactingImage(false);
      };
    };
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Veuillez renseigner votre nom et votre numéro de téléphone.');
      return;
    }

    if (deliveryType === 'other_city' && !customCityName.trim()) {
      alert('Veuillez préciser le nom de la ville de livraison.');
      return;
    }

    if (deliveryType === 'other_country' && !customCountryName.trim()) {
      alert('Veuillez préciser le pays d\'expédition.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total potential profit for the admin report
      const totalProfit = cartItems.reduce((sum, item) => {
        const activeSellingPrice = item.product.salePrice && item.product.salePrice > 0 ? item.product.salePrice : item.product.retailPrice;
        const activeItemBenefit = item.product.benefit !== undefined ? item.product.benefit : (activeSellingPrice - item.product.buyPrice);
        return sum + activeItemBenefit * item.quantity;
      }, 0);

      const finalCity = (deliveryType === 'within_6km' || deliveryType === 'outside_6km') 
        ? city 
        : (deliveryType === 'other_city' ? customCityName.trim() : 'Hors Pays');

      const finalCountry = deliveryType === 'other_country' ? customCountryName.trim() : 'Burkina Faso';

      // Create Order object for the administrative state
      const newOrder: Order = {
        id: 'cmd-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        city: finalCity,
        country: finalCountry,
        deliveryDistance: deliveryType === 'within_6km' ? 'Moins de 6 km' : (deliveryType === 'outside_6km' ? 'Plus de 6 km' : (deliveryType === 'other_city' ? 'Autre Ville' : 'Autre Pays')),
        deliveryFee: deliveryFee,
        locationLink: locationLink || undefined,
        paymentMethod,
        paymentScreenshot: paymentScreenshot || undefined,
        items: cartItems.map((item) => {
          const activePrice = item.product.salePrice && item.product.salePrice > 0 ? item.product.salePrice : item.product.retailPrice;
          return {
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            retailPrice: activePrice,
            buyPrice: item.product.buyPrice,
          };
        }),
        totalPrice: netPayable,
        totalProfit,
        status: 'En attente',
        createdAt: new Date().toISOString(),
        orderNotes: orderNotes.trim() || undefined,
      };

      // Construct a highly polished WhatsApp text with green/emerald emojis
      let waMessage = `🟢 *NOUVELLE COMMANDE - ${settings.shopName.toUpperCase()}*\n\n`;
      waMessage += `Bonjour, je souhaite commander les articles suivants :\n`;
      waMessage += `----------------------------------------------\n`;
      
      cartItems.forEach((item) => {
        const activePrice = item.product.salePrice && item.product.salePrice > 0 ? item.product.salePrice : item.product.retailPrice;
        waMessage += `👉 *${item.quantity}x* ${item.product.name}\n`;
        waMessage += `   _Prix unitaire :_ ${formatXOF(activePrice)}${item.product.salePrice && item.product.salePrice > 0 ? ' (PROMO)' : ''}\n`;
        const photoUrl = toShareableImageUrl(item.product.imageUrl);
        if (photoUrl) {
          waMessage += `   🖼️ Photo : ${photoUrl}\n`;
        }
      });

      waMessage += `----------------------------------------------\n`;
      waMessage += `📦 *Sous-total Articles :* ${formatXOF(totalAmount)}\n`;
      waMessage += `🚚 *Frais de livraison :* ${formatXOF(deliveryFee)} (${deliveryOptionLabel})\n`;
      waMessage += `💰 *Montant Net à Payer : ${formatXOF(netPayable)}*\n\n`;
      
      waMessage += `👤 *Informations du Destinataire :*\n`;
      waMessage += `• *Nom :* ${customerName.trim()}\n`;
      waMessage += `• *Téléphone :* ${customerPhone.trim()}\n`;
      waMessage += `• *Ville de livraison :* ${finalCity}\n`;
      if (deliveryType === 'other_country') {
        waMessage += `• *Pays d'expédition :* ${finalCountry}\n`;
      }
      if (locationLink) {
        waMessage += `• *Position GPS :* ${locationLink}\n`;
      }
      if (orderNotes.trim()) {
        waMessage += `• *Instructions/Notes :* ${orderNotes.trim()}\n`;
      }
      waMessage += `• *Option de Paiement :* ${paymentMethod}\n`;
      waMessage += `\n----------------------------------------------\n`;
      waMessage += `💳 *Instructions pour le dépôt ${paymentMethod} :*\n`;
      waMessage += `Veuillez m'expédier le montant de *${formatXOF(netPayable)}* sur le numéro :\n`;
      waMessage += `📞 *${paymentAccount.number}* (Titulaire: ${paymentAccount.name})\n`;
      waMessage += `\n----------------------------------------------\n`;
      if (paymentScreenshot) {
        waMessage += `🧾 *Preuve de paiement :* déjà enregistrée dans la boutique.\n`;
        waMessage += `_👉 Je la joins également ici en pièce jointe juste après ce message._\n`;
      } else {
        waMessage += `🧾 *Preuve de paiement :* pas encore effectuée.\n`;
        waMessage += `_👉 Je fais le dépôt maintenant et je joins la capture d'écran ici._\n`;
      }
      waMessage += `\nMerci de valider et confirmer ma livraison ! 🌿`;

      // Code template for sending message
      const encodedMsg = encodeURIComponent(waMessage);
      const cleanedPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodedMsg}`;

      // Notify App level state to record this order and decrease stocks
      onOrderPlaced(newOrder);

      // Open WhatsApp tab
      window.open(whatsappUrl, '_blank');

      // Clear the cart & local inputs
      onClearCart();
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      setPaymentScreenshot('');
      setScreenshotName('');
      setLocationLink('');
      setLocationError('');
      onClose();
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      {/* Backdrop overlay trigger */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Actual Drawer Body */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800 px-6 py-4 bg-emerald-800 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-emerald-100" />
            <h2 className="font-display font-bold text-lg">Mon Panier ({cartItems.length})</h2>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10 text-emerald-100 hover:text-white"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Content Container */}
        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-gray-50/50">
            <span className="text-5xl mb-4">🌿</span>
            <h3 className="font-sans font-semibold text-emerald-800 text-lg">Votre panier est vide</h3>
            <p className="mt-2 text-sm text-gray-550 max-w-xs">
              Explorez nos produits bien-être et ajoutez des articles de qualité Longrich à votre commande.
            </p>
            <button
              id="start-shopping-btn"
              onClick={onClose}
              className="mt-6 rounded-xl bg-emerald-800 text-white font-bold px-6 py-2.5 hover:bg-emerald-950 shadow-sm transition-all text-sm cursor-pointer"
            >
              Parcourir les produits
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            
            {/* Scrollable list of items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" /> Articles sélectionnés
              </h3>
              
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 bg-white shadow-xs"
                  >
                    {/* Tiny representation badge or product image if available */}
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-100 shrink-0 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        item.product.category === 'Santé' ? '🩺' : item.product.category === 'Hygiène Féminine' ? '🌸' : item.product.category === 'Ménagère' ? '🔥' : '🌿'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm font-semibold text-slate-900 truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                      <div className="mt-1 flex items-baseline gap-2">
                        {item.product.salePrice && item.product.salePrice > 0 ? (
                          <>
                            <span className="text-xs font-extrabold text-rose-600">
                              {formatXOF(item.product.salePrice)}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatXOF(item.product.retailPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-extrabold text-emerald-700">
                            {formatXOF(item.product.retailPrice)}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-400">l'unité</span>
                      </div>
                    </div>

                    {/* Stock counter */}
                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 shrink-0">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-500 hover:text-emerald-700 hover:bg-white rounded-l-lg transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-7 h-7 flex items-center justify-center text-sm font-bold text-slate-500 hover:text-emerald-700 hover:bg-white rounded-r-lg transition-colors cursor-pointer disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    {/* Supprimer le produit du panier */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Voulez-vous retirer "${item.product.name}" de votre panier ?`)) {
                          onUpdateQuantity(item.product.id, -item.quantity);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 active:scale-90 transition-all cursor-pointer shrink-0"
                      title="Supprimer du panier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Checkout Form & Summary */}
            <form
              onSubmit={handleCheckout}
              className="border-t border-slate-100 bg-slate-50/80 px-6 py-5 overflow-y-auto max-h-[60%] shrink-0 space-y-4"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Détails de Livraison et Paiement
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Salif OUEDRAOGO"
                    className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: 70 12 34 56"
                    className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Delivery Category Option Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Type de Livraison et Destination *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType('within_6km');
                      setCity(settings.shopCity || 'Ouagadougou');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                      deliveryType === 'within_6km'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-black'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">En ville (&le; 6km)</span>
                    <span className="text-xs font-black mt-2 text-emerald-700">{formatXOF(settings.deliveryWithinRadiusPrice !== undefined ? settings.deliveryWithinRadiusPrice : 1000)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType('outside_6km');
                      setCity(settings.shopCity || 'Ouagadougou');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                      deliveryType === 'outside_6km'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-black'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">En ville (&gt; 6km)</span>
                    <span className="text-xs font-black mt-2 text-emerald-700">{formatXOF(settings.deliveryOutsideRadiusPrice !== undefined ? settings.deliveryOutsideRadiusPrice : 1500)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('other_city')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                      deliveryType === 'other_city'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-black'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Autre ville</span>
                    <span className="text-xs font-black mt-2 text-emerald-700">{formatXOF(settings.deliveryOtherCityPrice !== undefined ? settings.deliveryOtherCityPrice : 2000)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('other_country')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                      deliveryType === 'other_country'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-black'
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Autre Pays</span>
                    <span className="text-xs font-black mt-2 text-emerald-700">{formatXOF(settings.deliveryOtherCountryPrice !== undefined ? settings.deliveryOtherCountryPrice : 5000)}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic location form inputs based on selection */}
              {(deliveryType === 'within_6km' || deliveryType === 'outside_6km') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ville de Livraison (Boutique basée à {settings.shopCity})</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden cursor-pointer"
                  >
                    {BURKINA_CITIES.includes(settings.shopCity) ? null : (
                      <option value={settings.shopCity}>{settings.shopCity}</option>
                    )}
                    {BURKINA_CITIES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {deliveryType === 'other_city' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la ville de livraison *</label>
                  <input
                    type="text"
                    required
                    value={customCityName}
                    onChange={(e) => setCustomCityName(e.target.value)}
                    placeholder="Ex: Bobo-Dioulasso, Koudougou, Fada..."
                    className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}

              {deliveryType === 'other_country' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Pays dest. *</label>
                    <input
                      type="text"
                      required
                      value={customCountryName}
                      onChange={(e) => setCustomCountryName(e.target.value)}
                      placeholder="Ex: Côte d'Ivoire, Mali, Niger..."
                      className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ville de destination *</label>
                    <input
                      type="text"
                      required
                      value={customCityName}
                      onChange={(e) => setCustomCityName(e.target.value)}
                      placeholder="Ex: Abidjan, Bamako, Niamey..."
                      className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Payment Option Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Moyen de Paiement Préféré *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Orange Money')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      paymentMethod === 'Orange Money'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-extrabold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0" />
                    Orange
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Moov Money')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      paymentMethod === 'Moov Money'
                        ? 'bg-blue-50/50 border-blue-600 text-blue-950 font-extrabold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0" />
                    Moov
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Wave')}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      paymentMethod === 'Wave'
                        ? 'bg-sky-50 border-sky-500 text-sky-950 font-extrabold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block shrink-0" />
                    Wave
                  </button>
                </div>
              </div>

              {/* Secure Payment Instruction Information */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-slate-900 text-xs text-left">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Instruction de Transfert {paymentMethod}</span>
                </div>
                Pour valider, veuillez transférer un dépôt de {' '}
                <span className="font-extrabold text-emerald-800">{formatXOF(netPayable)}</span> sur le compte :
                <div className="mt-2 font-mono bg-white p-2.5 rounded-lg border border-emerald-100 flex flex-col justify-center gap-0.5">
                  <span className="font-black text-sm text-emerald-950">
                    📲 {paymentAccount.number}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">
                    Titulaire: {paymentAccount.name}
                  </span>
                </div>
              </div>

              {/* Partage de la position GPS, retransmise au livreur par le commercial */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Partager ma position exacte</span>
                  <span className="text-[9px] bg-emerald-100/70 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Aide le livreur</span>
                </label>

                {locationLink ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                    <MapPin className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-900">Position enregistrée ✅</p>
                      <a
                        href={locationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-700 font-semibold hover:underline break-all"
                      >
                        {locationLink}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocationLink('')}
                      className="rounded-lg bg-rose-550/10 hover:bg-rose-550/20 text-rose-600 font-extrabold text-[10px] uppercase py-1.5 px-2.5 transition-all cursor-pointer shrink-0"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleShareLocation}
                    disabled={isLocating}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-250 hover:border-emerald-600 bg-white p-3.5 text-xs font-semibold text-slate-800 transition-all cursor-pointer disabled:opacity-60"
                  >
                    <MapPin className="w-4.5 h-4.5 text-emerald-600" />
                    {isLocating ? 'Localisation en cours...' : 'Envoyer ma position au livreur'}
                  </button>
                )}

                {locationError && (
                  <p className="text-[10px] font-semibold text-rose-600">{locationError}</p>
                )}
              </div>

              {/* Upload Payment Screenshot (La capture d'écran du paiement) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Joindre la preuve de paiement (Capture d'écran)</span>
                  <span className="text-[9px] bg-emerald-100/70 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Fortement Recommandé</span>
                </label>
                
                <div className="relative border-2 border-dashed border-emerald-250 hover:border-emerald-600 bg-white rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  {paymentScreenshot ? (
                    <div className="flex items-center gap-3 w-full text-left">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-200 bg-emerald-50 shrink-0 shadow-xs">
                        <img src={paymentScreenshot} alt="Preuve" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-800 truncate">{screenshotName || "Preuve de paiement"}</p>
                        <p className="text-[9px] text-slate-400">Capture d'écran chargée et optimisée !</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPaymentScreenshot('');
                          setScreenshotName('');
                        }}
                        className="rounded-lg bg-rose-550/10 hover:bg-rose-550/20 text-rose-600 font-extrabold text-[10px] uppercase py-1.5 px-2.5 transition-all cursor-pointer z-20"
                      >
                        Retirer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5.5 h-5.5 text-emerald-600 mx-auto animate-bounce-slow" />
                      <p className="text-xs font-semibold text-slate-800">
                        {isCompactingImage ? "Optimisation de l'image..." : "Cliquez ou glissez la capture d'écran"}
                      </p>
                      <p className="text-[10px] text-slate-400">Preuve de transfert Orange Money / Moov Money / Wave</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  ℹ️ La capture est enregistrée dans la boutique pour le commercial. WhatsApp
                  n'autorisant pas l'envoi automatique d'images, pensez à la <strong>joindre aussi
                  dans la conversation</strong> qui va s'ouvrir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes ou instructions (Optionnel)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ex: Préciser une heure de livraison, un point de repère précis..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Financial Summary panel */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 divide-y divide-slate-100 space-y-2 text-left">
                <div className="flex justify-between text-xs font-semibold text-slate-500 pb-2">
                  <span>Sous-total articles</span>
                  <span>{formatXOF(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 py-2">
                  <span>Frais de livraison</span>
                  <span className="text-emerald-700 font-extrabold">{formatXOF(deliveryFee)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-slate-900 border-t items-baseline">
                  <span>Bilan Total à Payer</span>
                  <span className="text-lg font-black text-emerald-800">{formatXOF(netPayable)}</span>
                </div>
              </div>

              {/* Order Submit Trigger Button */}
              <button
                type="submit"
                disabled={isSubmitting || isCompactingImage}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-6 py-4 text-sm font-bold text-white transition-all shadow-md shadow-emerald-900/15 cursor-pointer uppercase tracking-wider"
              >
                <MessageSquare className="w-4.5 h-4.5 text-emerald-100" />
                <span>Soumettre sur WhatsApp</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
