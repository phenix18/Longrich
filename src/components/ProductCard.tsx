import React, { useState } from 'react';
import { Product } from '../types';
import { 
  ShoppingCart, AlertCircle, Sparkles, Activity, HeartHandshake, 
  Heart, Share2, ChevronLeft, ChevronRight, Link, Check, Send, Facebook 
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: string) => void;
}

export function ProductCard({
  product,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  isFavorite = false,
  onToggleFavorite,
}: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Collect all valid images (Main imageUrl + any extra images)
  const allImages: string[] = [];
  if (product.imageUrl) {
    allImages.push(product.imageUrl);
  }
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img && !allImages.includes(img)) {
        allImages.push(img);
      }
    });
  }

  // Handle slide index wrapping
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  // Render a beautiful, premium visual representation based on category or details
  const renderThematicGraphic = () => {
    if (allImages.length > 0) {
      const activeImage = allImages[activeImgIndex] || allImages[0];
      return (
        <img 
          src={activeImage} 
          alt={product.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500"
        />
      );
    }

    if (product.category === 'Santé') {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 via-emerald-800/10 to-teal-900/30 flex items-center justify-center w-full h-full">
          <div className="relative p-6 bg-white/95 rounded-full shadow-lg border border-emerald-100 animate-pulse-slow">
            <Activity className="w-10 h-10 text-emerald-700" />
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
          </div>
        </div>
      );
    } else if (product.category === 'Hygiène Féminine') {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/40 via-pink-100/15 to-rose-900/30 flex items-center justify-center w-full h-full">
          <div className="relative p-6 bg-white/95 rounded-full shadow-lg border border-pink-100">
            <Sparkles className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
      );
    } else {
      // Soins & Hygiène
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/30 via-slate-100 to-teal-950/40 flex items-center justify-center w-full h-full">
          <div className="relative p-6 bg-white/95 rounded-full shadow-lg border border-emerald-100">
            <HeartHandshake className="w-10 h-10 text-emerald-600" />
          </div>
        </div>
      );
    }
  };

  // Format currency nicely (e.g. 23 000 F CFA)
  const formatXOF = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' F CFA';
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-600/50"
    >
      {/* Category Tag */}
      <span className="absolute top-3 left-3 z-10 rounded-md bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700 border border-emerald-100 shadow-xs uppercase">
        {product.category}
      </span>

      {/* Favorite Button */}
      <button
        id={`btn-fav-${product.id}`}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite?.(product.id);
        }}
        className={`absolute top-3 right-3 z-20 rounded-full p-2 transition-all shadow-xs backdrop-blur-md border duration-200 cursor-pointer ${
          isFavorite
            ? 'bg-rose-50 border-rose-200 text-rose-500 hover:scale-110'
            : 'bg-white/95 border-slate-200 text-slate-400 hover:text-rose-500 hover:scale-110'
        }`}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
      </button>

      {/* Advanced Social Media Sharing Button & Dropdown */}
      <div className="absolute top-3 right-12 z-20">
        <button
          id={`btn-share-${product.id}`}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsShareOpen(!isShareOpen);
          }}
          className={`rounded-full p-2 border transition-all shadow-xs backdrop-blur-md duration-200 cursor-pointer hover:scale-110 flex items-center justify-center ${
            isShareOpen 
              ? 'bg-emerald-600 border-emerald-600 text-white' 
              : 'bg-white/95 border-slate-200 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
          }`}
          title="Partager cet article"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {isShareOpen && (
          <div 
            className="absolute right-0 mt-1.5 p-2 bg-white rounded-xl shadow-xl border border-slate-250 w-44 flex flex-col gap-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 border-b border-slate-100 mb-1">
              Partager l'article
            </div>
            
            {/* WhatsApp */}
            <button
              onClick={() => {
                const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?product=${encodeURIComponent(product.id)}`;
                const shareText = `🌿 *${product.name}* - Longrich Burkina Faso\n\n` +
                  `🔬 *Description :* ${product.description || "Qualité supérieure Longrich"}\n` +
                  `💰 *Prix :* ${product.retailPrice.toLocaleString('fr-FR')} F CFA\n\n` +
                  `👉 Voir le produit et commander ici : ${shareUrl}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                setIsShareOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-emerald-50 text-slate-700 text-left text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.488 4.674 1.488 5.25 0 9.516-4.269 9.52-9.522.002-2.546-.988-4.941-2.79-6.743C16.23 2.574 13.834 1.58 11.29 1.58c-5.25 0-9.518 4.268-9.522 9.521-.001 1.543.435 2.923 1.455 4.3l-.986 3.6 3.731-.977zm11.085-7.14c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-1.025-.512-1.7-1.002-2.388-2.18-.175-.3-.175-.54-.05-.69.115-.13.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275 1.2 1.1 2.325 1.2 2.475.1.15 2.15 3.325 5.25 4.65.725.325 1.288.513 1.725.65.738.238 1.413.2 1.95.125.6-.087 1.782-.73 2.032-1.4.25-.675.25-1.25.175-1.4-.075-.15-.275-.25-.575-.4z" />
                </svg>
              </span>
              WhatsApp
            </button>

            {/* Telegram */}
            <button
              onClick={() => {
                const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?product=${encodeURIComponent(product.id)}`;
                const shareText = `🌿 *${product.name}* - Longrich Burkina Faso\n\n🔬 *Description :* ${product.description || "Qualité supérieure"}\n💰 *Prix :* ${product.retailPrice.toLocaleString('fr-FR')} F CFA`;
                window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
                setIsShareOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-sky-50 text-slate-700 text-left text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                <Send className="w-3 h-3" />
              </span>
              Telegram
            </button>

            {/* Facebook */}
            <button
              onClick={() => {
                const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?product=${encodeURIComponent(product.id)}`;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                setIsShareOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-blue-50 text-slate-700 text-left text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Facebook className="w-3 h-3" />
              </span>
              Facebook
            </button>

            {/* Copy Link */}
            <button
              onClick={() => {
                const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?product=${encodeURIComponent(product.id)}`;
                navigator.clipboard.writeText(shareUrl);
                setShareCopied(true);
                setTimeout(() => {
                  setShareCopied(false);
                  setIsShareOpen(false);
                }, 1000);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                {shareCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Link className="w-3 h-3" />}
              </span>
              {shareCopied ? 'Copié !' : 'Copier le lien'}
            </button>
          </div>
        )}
      </div>

      {/* Product Visual Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-50 flex items-center justify-center group/img">
        {renderThematicGraphic()}
        
        {/* Navigation arrows for multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-xs backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-opacity duration-250 cursor-pointer"
              title="Image précédente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-xs backdrop-blur-xs opacity-0 group-hover/img:opacity-100 transition-opacity duration-250 cursor-pointer"
              title="Image suivante"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Indicator dots for multiple images */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-black/25 px-1.5 py-1 rounded-full backdrop-blur-xs">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImgIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === activeImgIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
                }`}
                title={`Aller à l'image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Subtle decorative gold leaf */}
        <div className="absolute bottom-2 right-2 text-emerald-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500 font-serif text-6xl">
          🌿
        </div>

        {/* Stock Alert Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1.5px] flex items-center justify-center z-10">
            <div className="text-center p-3">
              <AlertCircle className="w-7 h-7 text-rose-400 mx-auto mb-1 animate-bounce" />
              <p className="text-white font-black text-xs uppercase tracking-wider">Rupture de Stock</p>
              <p className="text-slate-300 text-[10px] mt-0.5 font-medium">Réapprovisionnement en cours</p>
            </div>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute bottom-3 left-3 z-10 rounded bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-sm">
            Stock critique : {product.stock} restants
          </span>
        ) : null}
      </div>

      {/* Details Area */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="font-display font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors text-sm" title={product.name}>
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {product.description || "Produit certifié Longrich de qualité supérieure, idéal pour votre bien-être et hygiène corporelle."}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            {product.salePrice && product.salePrice > 0 ? (
              <>
                <span className="text-[9px] uppercase font-bold tracking-widest text-amber-600 flex items-center gap-1">
                  🔥 Solde -{product.pourcentageSolde || product.discountPercent || Math.round((1 - product.salePrice / product.retailPrice) * 100)}%
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-base font-black text-rose-600 tracking-tight">
                    {formatXOF(product.salePrice)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 line-through">
                    {formatXOF(product.retailPrice)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Prix de revente</span>
                <span className="text-base font-black text-emerald-700 tracking-tight mt-0.5">
                  {formatXOF(product.retailPrice)}
                </span>
              </>
            )}
          </div>

          {!isOutOfStock && (
            <div className="flex items-center gap-1.5">
              {quantityInCart > 0 ? (
                <div className="flex items-center gap-1.5 bg-emerald-50 rounded-lg p-1 border border-emerald-100">
                  <button
                    id={`btn-remove-${product.id}`}
                    onClick={() => onRemoveFromCart(product)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-white text-emerald-700 font-bold hover:bg-emerald-100 active:scale-95 transition-all text-xs border border-emerald-100 cursor-pointer"
                    title="Diminuer"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold text-emerald-700 text-xs">{quantityInCart}</span>
                  <button
                    id={`btn-add-more-${product.id}`}
                    onClick={() => onAddToCart(product)}
                    disabled={quantityInCart >= product.stock}
                    className="w-7 h-7 flex items-center justify-center rounded bg-white text-emerald-700 font-bold hover:bg-emerald-100 active:scale-95 transition-all text-xs disabled:opacity-40 border border-emerald-100 cursor-pointer"
                    title="Ajouter"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  id={`btn-add-initial-${product.id}`}
                  onClick={() => onAddToCart(product)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-800 active:scale-95 shadow-xs shadow-emerald-900/10 cursor-pointer uppercase tracking-wider"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Ajouter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
