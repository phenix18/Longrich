import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, ShopSettings, AdminNotification } from './types';
import { INITIAL_PRODUCTS, DEFAULT_SETTINGS } from './data/initialProducts';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { 
  ShoppingCart, Lock, Search, Heart, Sparkles, Activity, Check, 
  HelpCircle, ShieldCheck, AlertCircle, X, ChevronRight, Bookmark, ArrowRight, Star, Bell
} from 'lucide-react';

// Secure Firestore & Authentication Imports
import { 
  db, auth, signInAsAdmin, logOutAdmin, handleFirestoreError, OperationType 
} from './firebase';
import { 
  collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDoc, writeBatch, getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core visual data states (synced in real-time from Firestore)
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Toast and sound alert states
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string } | null>(null);
  const [lastNotificationCount, setLastNotificationCount] = useState<number | null>(null);
  
  // Shopping Cart remains local to customer browser
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('longrich_bk_cart_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
    }
    return [];
  });

  // Favorites local to customer browser
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('longrich_bk_favorites_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse favorites from localStorage', e);
    }
    return [];
  });

  // Client Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Shared product ID from URL query parameter
  const [sharedProductId, setSharedProductId] = useState<string | null>(null);

  // Smooth scroll and visual ring flash highlight for catalog selection
  const scrollToProduct = (prodId: string) => {
    setSelectedCategory('Tous');
    setSearchQuery('');
    setTimeout(() => {
      const el = document.getElementById(`product-card-${prodId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-amber-500', 'scale-[1.02]');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-amber-500', 'scale-[1.02]');
        }, 2000);
      }
    }, 150);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('product');
    if (prodId) {
      setSharedProductId(prodId);
    }
  }, []);

  // Interactive UI Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // 1. Connection Validation Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'settings', 'general'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration: Client is offline.");
        }
      }
    };
    testConnection();
  }, []);

  // 2. Real-time Shop settings listener (Auto-Seeds if settings collection empty)
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ShopSettings;
        if (data.adminPin === '1234') {
          // Auto-migrate PIN from 1234 to 000000 in database ONLY if authenticated admin
          const migrated = { ...data, adminPin: '000000' };
          if (auth.currentUser && auth.currentUser.email === 'alexkorogo@gmail.com') {
            setDoc(settingsRef, migrated).catch((err) => {
              console.error('Failed to auto-migrate PIN setting:', err);
            });
          }
          setSettings(migrated);
        } else {
          setSettings(data);
        }
      } else {
        // Seed default settings on initial load setup
        setDoc(settingsRef, DEFAULT_SETTINGS).catch((err) => {
          console.error('Failed to seed default settings:', err);
        });
      }
    }, (err) => {
      console.error('Settings stream subscription error:', err);
    });
    return unsubscribe;
  }, []);

  // 3. Real-time Products catalog listener (Auto-Seeds with standard catalog if empty)
  useEffect(() => {
    const productsColRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsColRef, (snapshot) => {
      if (snapshot.empty) {
        // Run seed sequence
        const batch = writeBatch(db);
        INITIAL_PRODUCTS.forEach((p) => {
          const docRef = doc(db, 'products', p.id);
          batch.set(docRef, p);
        });
        batch.commit()
          .then(() => console.log('Successfully seeded INITIAL_PRODUCTS to Firestore.'))
          .catch((err) => console.error('Products database hydration error:', err));
      } else {
        const list: Product[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Product);
        });
        setProducts(list);
      }
    }, (err) => {
      console.error('Products stream subscription error:', err);
    });
    return unsubscribe;
  }, []);

  // Play sound for new admin notifications
  const playAlertChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      oscillator.start();
      
      oscillator.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      oscillator.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio chime barred:', e);
    }
  };

  // 4. Auth listener & Dynamic authenticated Orders + Notifications pipelines (alexkorogo@gmail.com authorized)
  useEffect(() => {
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && user.email === 'alexkorogo@gmail.com') {
        // A. Orders Stream
        const ordersColRef = collection(db, 'orders');
        unsubscribeOrders = onSnapshot(ordersColRef, (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as Order);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        });

        // B. Notifications Stream
        const notifColRef = collection(db, 'notifications');
        unsubscribeNotifications = onSnapshot(notifColRef, (snapshot) => {
          const list: AdminNotification[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as AdminNotification);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNotifications(list);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, 'notifications');
        });
      } else {
        setOrders([]);
        setNotifications([]);
        if (unsubscribeOrders) {
          unsubscribeOrders();
          unsubscribeOrders = undefined;
        }
        if (unsubscribeNotifications) {
          unsubscribeNotifications();
          unsubscribeNotifications = undefined;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, []);

  // Track incoming unread notifications to trigger visual toasts & audio chimes
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    const unreadCount = unreadNotifications.length;
    
    if (lastNotificationCount !== null && unreadCount > lastNotificationCount) {
      const newest = unreadNotifications[0];
      if (newest) {
        setActiveToast({
          id: newest.id,
          title: newest.title,
          message: newest.message,
        });
        playAlertChime();
        // Auto dismiss toast in 8 seconds
        const timer = setTimeout(() => {
          setActiveToast((prev) => (prev && prev.id === newest.id ? null : prev));
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
    setLastNotificationCount(unreadCount);
  }, [notifications, lastNotificationCount]);

  // 5. Save shopping cart locally
  useEffect(() => {
    localStorage.setItem('longrich_bk_cart_v1', JSON.stringify(cart));
  }, [cart]);

  // Save favorites locally
  useEffect(() => {
    localStorage.setItem('longrich_bk_favorites_v1', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // 2. Cart manipulation handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.product.id === product.id);
      if (exists) {
        // Enforce stock bounds
        const targetQty = exists.quantity + 1;
        if (targetQty > product.stock) {
          alert(`Désolé, il n'y a que ${product.stock} articles disponibles en stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: targetQty } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (product: Product) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.product.id === product.id);
      if (!exists) return prevCart;
      if (exists.quantity === 1) {
        return prevCart.filter((item) => item.product.id !== product.id);
      }
      return prevCart.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const handleUpdateQuantityInCart = (productId: string, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart.find((c) => c.product.id === productId);
      if (!item) return prevCart;
      const nextQuantity = item.quantity + delta;
      
      if (nextQuantity <= 0) {
        return prevCart.filter((c) => c.product.id !== productId);
      }

      // Enforce current inventory checks
      const catalogProduct = products.find((p) => p.id === productId);
      if (catalogProduct && nextQuantity > catalogProduct.stock) {
        alert(`Désolé, le stock disponible est limité à ${catalogProduct.stock} articles.`);
        return prevCart;
      }

      return prevCart.map((c) =>
        c.product.id === productId ? { ...c, quantity: nextQuantity } : c
      );
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // 3. Checkout handler (Saves Order to Firestore + Reduces Inventory stocks in Firestore)
  const handleOrderPlaced = async (newOrder: Order) => {
    try {
      // 1. Write the Order document
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);

      // 2. Decrement physical stock for each ordered item in Firestore
      const updatePromises = newOrder.items.map(async (item) => {
        const catalogProduct = products.find((p) => p.id === item.productId);
        if (catalogProduct) {
          const nextStock = Math.max(0, catalogProduct.stock - item.quantity);
          await updateDoc(doc(db, 'products', item.productId), {
            stock: nextStock
          });
        }
      });
      await Promise.all(updatePromises);

      // 3. Create persistent administrator alert notification record
      const notificationId = 'notif-' + Math.random().toString(36).substr(2, 9).toLowerCase();
      const newNotification: AdminNotification = {
        id: notificationId,
        title: 'Nouvelle Commande Reçue ! 📦',
        message: `Commande de ${newOrder.totalPrice.toLocaleString('fr-FR')} F CFA enregistrée par ${newOrder.customerName} (${newOrder.customerPhone}) pour la ville de ${newOrder.city}.`,
        type: 'new_order',
        orderId: newOrder.id,
        orderAmount: newOrder.totalPrice,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        city: newOrder.city,
        createdAt: new Date().toISOString(),
        read: false,
        emailNotified: true // Simulated notification email dispatch copy
      };
      await setDoc(doc(db, 'notifications', notificationId), newNotification);
      
      // Clear client session cart local state
      setCart([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
      alert("Une erreur s'est produite lors de la soumission de votre commande. Veuillez réessayer.");
    }
  };

  // 4. Admin Access Controls PIN checker
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin) {
      setPinError('');
      setPinInput('');
      setIsPinModalOpen(false);
      setIsAdminOpen(true);
    } else {
      setPinError('Code PIN incorrect. Veuillez réessayer.');
      setPinInput('');
    }
  };

  // 5. Google Auth Admin Handlers
  const handleGoogleSignIn = async () => {
    try {
      const user = await signInAsAdmin();
      if (user) {
        if (user.email === 'alexkorogo@gmail.com') {
          setIsPinModalOpen(false);
          setIsAdminOpen(true);
        } else {
          alert("Accès refusé. Seul le compte administrateur alexkorogo@gmail.com est autorisé.");
          await logOutAdmin();
        }
      }
    } catch (err) {
      console.error('Admin Google sign-in failed:', err);
      alert('Échec de la connexion Google. Veuillez réessayer.');
    }
  };

  const handleGoogleLogOut = async () => {
    try {
      await logOutAdmin();
      setIsAdminOpen(false);
      alert('Session administrateur déconnectée.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 6. Admin mutations (Syncing with Firestore)
  const handleUpdateProduct = async (updated: Product) => {
    try {
      await setDoc(doc(db, 'products', updated.id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${updated.id}`);
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newProduct.id}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      // Clear from client-side carts
      setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const originalOrder = orders.find((o) => o.id === orderId);
    if (!originalOrder) return;

    const isNowCanceled = status === 'Annulé';
    const wasCanceled = originalOrder.status === 'Annulé';

    try {
      await updateDoc(doc(db, 'orders', orderId), { status });

      if (isNowCanceled && !wasCanceled) {
        // Restore stock levels in products
        const restorePromises = originalOrder.items.map(async (item) => {
          const catalogProduct = products.find((p) => p.id === item.productId);
          if (catalogProduct) {
            await updateDoc(doc(db, 'products', item.productId), {
              stock: catalogProduct.stock + item.quantity,
            });
          }
        });
        await Promise.all(restorePromises);
      } else if (!isNowCanceled && wasCanceled) {
        // Re-deduct stock levels
        const deductPromises = originalOrder.items.map(async (item) => {
          const catalogProduct = products.find((p) => p.id === item.productId);
          if (catalogProduct) {
            await updateDoc(doc(db, 'products', item.productId), {
              stock: Math.max(0, catalogProduct.stock - item.quantity),
            });
          }
        });
        await Promise.all(deductPromises);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleUpdateSettings = async (updatedSettings: ShopSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'general'), updatedSettings);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer toutes vos notifications de commande ?')) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((n) => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'notifications-clear-all');
    }
  };

  const handleImportDatabase = async (data: { products: Product[]; settings: ShopSettings; orders: Order[] }) => {
    try {
      const batch = writeBatch(db);
      
      data.products.forEach((p) => {
        batch.set(doc(db, 'products', p.id), p);
      });

      batch.set(doc(db, 'settings', 'general'), data.settings);

      if (data.orders && Array.isArray(data.orders)) {
        data.orders.forEach((o) => {
          batch.set(doc(db, 'orders', o.id), o);
        });
      }

      await batch.commit();
      alert('Importation de la base de données Firestore terminée avec succès !');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch-import');
      alert("Erreur lors de l'import : Vérifiez vos privilèges d'administration.");
    }
  };

  // 6. Client Side Filters
  const clientFilteredProducts = products.filter((p) => {
    if (sharedProductId && products.some((prod) => prod.id === sharedProductId)) {
      return p.id === sharedProductId;
    }
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous'
      ? true
      : selectedCategory === 'Favoris'
        ? favorites.includes(p.id)
        : p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalVal = cart.reduce((sum, item) => {
    const activePrice = (item.product.salePrice && item.product.salePrice > 0) ? item.product.salePrice : item.product.retailPrice;
    return sum + activePrice * item.quantity;
  }, 0);

  const formatXOFValue = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' F CFA';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 select-none pb-12 antialiased">
      
      {/* 1. Global Banner Notification */}
      <div className="w-full bg-[#0F172A] py-2 px-4 text-center text-white text-[10px] font-bold tracking-widest uppercase shrink-0 border-b border-slate-800 flex items-center justify-center gap-1.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 rotate-12 animate-pulse" />
        <span>Dépôt Orange Money : {settings.orangeMoneyNumber} ({settings.orangeMoneyName})</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">Livraison Express sur tout le Burkina Faso 🇧🇫</span>
      </div>

      {/* 2. Primary Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white text-slate-800 border-b border-emerald-100 shadow-xs px-2.5 sm:px-4 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Shop name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white font-display font-black text-base sm:text-xl flex items-center justify-center shadow-xs shrink-0">
              L
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-xs sm:text-base tracking-tight sm:tracking-wide text-emerald-800 uppercase leading-none truncate max-w-[130px] sm:max-w-none">
                {settings.shopName}
              </h1>
              <p className="text-[8px] sm:text-[9px] text-emerald-600 font-bold tracking-tight sm:tracking-widest uppercase mt-0.5 sm:mt-1 truncate max-w-[130px] sm:max-w-none">DISTRIBUTEUR AGRÉÉ - OUAGADOUGOU</p>
            </div>
          </div>

          {/* Controls: Admin Key & Shopping Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            <div className="hidden sm:flex flex-col items-end text-right mr-3">
              <span className="text-[9px] uppercase opacity-70 font-bold tracking-wider text-slate-400">Paiement Accepté</span>
              <span className="text-xs font-bold text-emerald-600">Orange Money / Moov Money</span>
            </div>

            {/* Quick Lock/Admin Button */}
            <button
              id="admin-panel-lock-btn"
              onClick={() => setIsPinModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold p-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs transition-colors border border-emerald-150 cursor-pointer"
              title="Accès Administrateur"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Espace Admin</span>
            </button>

            {/* Shopping Cart button */}
            <button
              id="floating-cart"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1 sm:gap-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold px-2.5 sm:px-4.5 py-1.5 sm:py-2 text-[10px] sm:text-xs shadow-md transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="hidden min-[380px]:inline">Panier</span>
              {cartCount > 0 && (
                <span className="bg-white text-green-700 rounded-full px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black tracking-tight shrink-0">
                  {cartCount}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* 2.5 Infinitely Looping Circular & Slow Promotional Banner */}
      <div className="w-full bg-[#0F172A] border-b border-amber-500/20 py-2.5 overflow-hidden relative select-none shadow-xs">
        {/* Glow Effects */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0F172A] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0F172A] to-transparent z-10 pointer-events-none" />
        
        <div className="animate-marquee-slow flex items-center gap-6 whitespace-nowrap">
          {/* We duplicate the items 3 times to make the horizontal scroll infinitely circular and continuous */}
          {[...Array(3)].map((_, loopIdx) => (
            <div key={loopIdx} className="flex items-center gap-6 shrink-0">
              {((products.filter(p => p.salePrice && p.salePrice > 0).length >= 2 
                ? products.filter(p => p.salePrice && p.salePrice > 0)
                : products.filter(p => p.category === 'Santé' || p.category === 'Produits Énergétiques').slice(0, 6)
              )).map((p) => {
                const onSale = p.salePrice && p.salePrice > 0;
                const pct = p.pourcentageSolde || p.discountPercent || (onSale && p.retailPrice > 0 ? Math.round((1 - p.salePrice! / p.retailPrice) * 100) : 0);
                
                return (
                  <button
                    key={`${p.id}-${loopIdx}`}
                    onClick={() => scrollToProduct(p.id)}
                    className="inline-flex items-center gap-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-full pl-1.5 pr-4.5 py-1 text-left transition-all duration-300 hover:scale-[1.03] group shrink-0 shadow-sm cursor-pointer"
                  >
                    {/* Circle Image Wrapper */}
                    <div className="w-10 h-10 rounded-full border border-amber-500/40 overflow-hidden bg-slate-800 shrink-0 relative flex items-center justify-center">
                      {p.imageUrl ? (
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[10px] text-amber-500 font-extrabold uppercase font-mono">
                          {p.name.substring(0, 2)}
                        </span>
                      )}
                      
                      {/* Percent badge overlay inside/around circle */}
                      {(pct > 0) && (
                        <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[8px] px-1 rounded-full border border-[#0F172A] animate-pulse">
                          -{pct}%
                        </span>
                      )}
                    </div>

                    {/* Content (Name & Dual price tags) */}
                    <div className="flex flex-col text-xs pr-1">
                      <span className="text-slate-200 font-bold group-hover:text-amber-400 transition-colors max-w-[140px] truncate text-[11px] uppercase tracking-wide">
                        {p.name}
                      </span>
                      
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        {onSale && p.salePrice ? (
                          <>
                            <span className="text-amber-400 font-black font-mono">
                              {p.salePrice.toLocaleString('fr-FR')} F
                            </span>
                            <span className="text-[10px] text-slate-500 line-through font-medium font-mono">
                              {p.retailPrice.toLocaleString('fr-FR')} F
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-[#34D399] font-black font-mono">
                              {p.retailPrice.toLocaleString('fr-FR')} F
                            </span>
                            <span className="text-[8px] text-amber-400 font-extrabold bg-amber-500/10 px-1 rounded uppercase tracking-wider scale-90">
                              Offre
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Stage Content / Hero Section */}
      <main className="max-w-7xl mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Left Sidebar: Filters & Admin Controls */}
        <aside className="hidden lg:flex w-64 flex-col gap-5 shrink-0 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Catégories</h2>
            <ul className="space-y-1">
              {['Tous', 'Santé', 'Soins & Hygiène', 'Hygiène Féminine', 'Produits Énergétiques', "Kits d'Adhésion", 'Favoris'].map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = cat === 'Tous'
                  ? products.length
                  : cat === 'Favoris'
                    ? favorites.length
                    : products.filter((p) => p.category === cat).length;
                return (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between text-xs font-bold p-2.5 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? cat === 'Favoris'
                            ? 'text-rose-600 bg-rose-50/80 border border-rose-100/30'
                            : 'text-emerald-700 bg-emerald-50/90 border border-emerald-100/30'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>
                        {cat === 'Tous'
                          ? '✨ Tout afficher'
                          : cat === 'Favoris'
                            ? '❤️ Favoris'
                            : cat}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        cat === 'Favoris'
                          ? 'bg-rose-50 text-rose-600 font-extrabold'
                          : 'bg-slate-100 text-slate-500'
                      }`}>{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Dedicated Favorites Section */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Mes Favoris</span>
              </h2>
              {favorites.length > 0 && (
                <span className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-1.5 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </div>

            {favorites.length === 0 ? (
              <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-150/50 text-center">
                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
                  Aucun coup de cœur. Cliquez sur l'icône de cœur d'un produit pour l'ajouter ici.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                {favorites.map((favId) => {
                  const favProd = products.find((p) => p.id === favId);
                  if (!favProd) return null;
                  const isOutOfStock = favProd.stock <= 0;

                  return (
                    <div
                      key={favId}
                      className="group/fav flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left"
                    >
                      {/* Thumbnail */}
                      <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                        {favProd.imageUrl ? (
                          <img
                            src={favProd.imageUrl}
                            alt={favProd.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-xs">🌿</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[10px] font-bold text-slate-800 truncate leading-none mb-1">
                          {favProd.name}
                        </h4>
                        <span className="text-[10px] text-emerald-700 font-black font-mono">
                          {favProd.retailPrice.toLocaleString('fr-FR')} F
                        </span>
                      </div>

                      {/* Side Actions */}
                      <div className="flex gap-0.5 shrink-0">
                        {!isOutOfStock && (
                          <button
                            onClick={() => handleAddToCart(favProd)}
                            className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Ajouter au Panier"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleFavorite(favId)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Retirer des favoris"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-300 font-sans">Espace Admin Link</h2>
            </div>
            <div className="space-y-3.5">
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Stocks Critiques</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-300">Moins de 5 unités :</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${products.filter((p) => p.stock > 0 && p.stock <= 5).length > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                    {products.filter((p) => p.stock > 0 && p.stock <= 5).length} restants
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Commandes enregistrées</p>
                <p className="text-base font-black text-blue-400 font-mono">{orders.length}</p>
              </div>
              <button
                onClick={() => setIsPinModalOpen(true)}
                className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-750 text-[10px] font-bold uppercase tracking-wider py-2 rounded transition-colors text-[#F8FAFC] cursor-pointer"
              >
                Gérer les Stocks
              </button>
            </div>
          </div>

          <div className="text-slate-400 text-[10px] border-t border-slate-100 pt-3 flex items-center gap-1.5 font-medium leading-none">
            <span>📍</span>
            <span>Ouagadougou, Zone 1</span>
          </div>
        </aside>

        {/* Right Section: Hero Banner, Search & Catalog Grid */}
        <section className="flex-1 min-w-0">
          
          {/* Immersive Welcome Showcase Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-650 to-emerald-900 border border-emerald-700 text-white shadow-md p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 to-transparent pointer-events-none" />
            
            <div className="z-10 text-center sm:text-left max-w-xl">
              <span className="inline-flex gap-1 items-center bg-white/10 rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-400 border border-orange-500/20 mb-3 shadow-xs">
                <Star className="w-3 h-3 fill-orange-400 text-orange-400" /> 100% Naturel & Certifié Longrich
              </span>
              <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white leading-tight tracking-tight">
                Prenez soin de votre Santé <br />
                <span className="text-orange-400">& Boostez vos Revenus</span>
              </h2>
              <p className="mt-3 text-xs text-slate-300 max-w-md font-medium leading-relaxed">
                Explorez notre catalogue à haute densité de compléments thérapeutiques de renommée mondiale, de savons purifiants et de soins du corps. Commandez directement en quelques clics via WhatsApp. 
              </p>
            </div>

            <div className="relative z-10 p-4.5 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10 max-w-xs hidden md:block text-left text-[11px] space-y-1.5 text-slate-200">
              <p className="font-bold text-orange-400">💡 Comment commander ?</p>
              <p className="font-medium">1. Ajoutez vos articles préférés dans le panier.</p>
              <p className="font-medium">2. Renseignez votre nom, portable et ville.</p>
              <p className="font-medium">3. Validez l'envoi WhatsApp pour bloquer et payer.</p>
            </div>
          </div>

          {/* Directory filters & Search */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            
            {/* Mobile-only horizontal scroll categories */}
            <div className="flex lg:hidden items-center gap-2 overflow-x-auto w-full scrollbar-none py-1">
              {['Tous', 'Santé', 'Soins & Hygiène', 'Hygiène Féminine', 'Produits Énergétiques', "Kits d'Adhésion", 'Favoris'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? cat === 'Favoris'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'Tous' ? '✨ Tout' : cat === 'Favoris' ? '❤️ Favoris' : cat}
                </button>
              ))}
            </div>

            {/* Search Bar text input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un article Longrich..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2.5 text-xs bg-white focus:border-emerald-600 focus:outline-hidden transition-all"
              />
            </div>

            <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
              Longrich Burkina Faso Store
            </div>

          </div>

          {/* Shared Product Highlight Notification Banner */}
          {sharedProductId && products.some((prod) => prod.id === sharedProductId) && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce-slow">🌿</span>
                <div className="text-left">
                  <h4 className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    Produit Recommandé & Partagé !
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5 leading-relaxed">
                    Un contact vous a partagé le lien direct vers : <strong className="text-emerald-900">"{products.find((p) => p.id === sharedProductId)?.name}"</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSharedProductId(null);
                  const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                  window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
                }}
                className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-4 py-2 text-[10px] transition-all shadow-xs cursor-pointer uppercase tracking-wider shrink-0"
              >
                Découvrir Tout le Catalogue ✨
              </button>
            </div>
          )}

          {/* Active Category Headline */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-extrabold text-base text-emerald-800 uppercase tracking-wider">
                {selectedCategory === 'Tous' ? 'Catalogue Complet' : selectedCategory}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Affichage de {clientFilteredProducts.length} produits authentiques
              </p>
            </div>
          </div>

          {/* Products Directory list Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {clientFilteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id);
              return (
                <div key={product.id}>
                  <ProductCard
                    product={product}
                    quantityInCart={cartItem ? cartItem.quantity : 0}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              );
            })}
          </div>

          {clientFilteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl p-8 mt-4 shadow-xs max-w-sm mx-auto">
              <span className="text-3xl">🔍</span>
              <h4 className="font-bold text-slate-800 text-sm mt-3">Aucun produit ne correspond</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Désolé, nous n'avons trouvé aucun sésame Longrich correspondant à "{searchQuery}". Essayez de modifier vos mots-clés ou de réinitialiser la catégorie.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Tous');
                }}
                className="mt-4 rounded-lg bg-emerald-700 text-white font-bold px-4 py-2 text-xs hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
              >
                Tout afficher
              </button>
            </div>
          )}

        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            Copyright Korogo © 2026
          </p>
        </footer>

      </main>

      {/* 7. Floating persistent indicator footer (for fast shopping) */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 right-6 z-30 animate-bounce-slow">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-800 text-white px-5 py-4 rounded-full shadow-2xl border border-emerald-550 border-opacity-40 cursor-pointer"
          >
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-amber-400 font-extrabold relative">
              🛒
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border-2 border-white">
                {cartCount}
              </span>
            </div>
            <div className="text-left leading-tight pr-2">
              <p className="text-[10px] uppercase font-bold text-blue-200">Voir mon Panier</p>
              <p className="text-sm font-extrabold text-white">{formatXOFValue(cartTotalVal)}</p>
            </div>
          </button>
        </div>
      )}

      {/* 8. Sliders & Modals */}
      
      {/* A. Shopping Cart Slider */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantityInCart}
        onClearCart={handleClearCart}
        settings={settings}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* B. Secure Administrator Panel portal */}
      {isAdminOpen && (
        <AdminPanel
          products={products}
          orders={orders}
          notifications={notifications}
          settings={settings}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateSettings={handleUpdateSettings}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearAllNotifications={handleClearAllNotifications}
          onImportDatabase={handleImportDatabase}
          onClose={() => setIsAdminOpen(false)}
          adminEmail={currentUser?.email}
          onLogOutAdmin={handleGoogleLogOut}
        />
      )}

      {/* C. Enter Admin PIN modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 text-left">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 w-full max-w-xs relative text-left">
            <button
              onClick={() => {
                setIsPinModalOpen(false);
                setPinError('');
                setPinInput('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-700 mb-4 text-lg">
                🔐
              </div>
              <h3 className="font-display font-extrabold text-slate-900 text-base">Portail Administration</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                Saisissez le code PIN d'administration pour débloquer le tableau de bord des stocks et profits.
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="mt-5 space-y-4">
              <div>
                <input
                  type="password"
                  required
                  maxLength={15}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="• • • •"
                  className="w-full text-center tracking-widest text-lg font-black font-mono rounded-xl border border-slate-200 bg-slate-50 p-3 bg-white focus:border-emerald-600 focus:outline-hidden"
                  autoFocus
                />
                {pinError && (
                  <p className="text-rose-600 font-semibold text-[10px] mt-2 text-center bg-rose-50 p-1.5 rounded">
                    ⚠️ {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 transition-all text-xs cursor-pointer uppercase tracking-wider"
              >
                Débloquer avec le Code PIN
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-150"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold">OU COMPTE GOOGLE</span>
                <div className="flex-grow border-t border-slate-150"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 text-xs transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Connexion Google Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Real-time floating Notification Toast (bottom-left) */}
      {activeToast && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-xl shadow-2xl border border-emerald-900/45 p-4 flex gap-3 animate-fade-in items-start">
          <div className="p-2.5 bg-emerald-100/10 rounded-lg text-emerald-400">
            <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-xs text-amber-300">{activeToast.title}</h4>
            <p className="text-[11px] text-slate-200 mt-1 leading-snug">{activeToast.message}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  setActiveToast(null);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded text-white tracking-wider cursor-pointer shadow-xs"
              >
                Ouvrir Panel
              </button>
              <button
                onClick={() => setActiveToast(null)}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
