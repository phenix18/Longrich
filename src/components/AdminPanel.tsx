import React, { useState } from 'react';
import { Product, Order, ShopSettings, AdminNotification } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { 
  X, Search, Database, Settings, ShieldAlert, TrendingUp, DollarSign, 
  ShoppingCart, RefreshCw, FileCode, CheckCircle, Trash2, Edit2, 
  Plus, ChevronDown, Check, Info, ShieldCheck, Download, Upload,
  Bell, Mail, Eye, EyeOff, Trash, CheckSquare, Share2, Send, Facebook, Link, Globe
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  notifications: AdminNotification[];
  settings: ShopSettings;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateSettings: (settings: ShopSettings) => void;
  onMarkNotificationRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  onImportDatabase: (data: { products: Product[]; settings: ShopSettings; orders: Order[] }) => void;
  onClose: () => void;
  adminEmail?: string | null;
  onLogOutAdmin?: () => void;
}

export function AdminPanel({
  products,
  orders,
  notifications = [],
  settings,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onUpdateSettings,
  onMarkNotificationRead,
  onClearAllNotifications,
  onImportDatabase,
  onClose,
  adminEmail,
  onLogOutAdmin,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'kpi' | 'products' | 'orders' | 'settings' | 'notifications'>('kpi');
  
  // Search and filter states for notifications
  const [notificationSearch, setNotificationSearch] = useState('');
  const [notificationFilter, setNotificationFilter] = useState<'Tous' | 'Non lues' | 'Lues'>('Tous');

  // Search and filter states for product management
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');

  // Search and filter states for orders management
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Tous');

  // States for Editing/Adding products modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Dynamic fields for Product Form
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Santé');
  const [formStock, setFormStock] = useState(0);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState<number | ''>('');
  const [formBuyPrice, setFormBuyPrice] = useState(0);
  const [formRetailPrice, setFormRetailPrice] = useState(0);
  const [formSalePrice, setFormSalePrice] = useState<number | ''>('');
  const [formDiscountPercent, setFormDiscountPercent] = useState<number | ''>('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);

  // Settings form states
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(settings.whatsappNumber);
  const [settingsOrangeNum, setSettingsOrangeNum] = useState(settings.orangeMoneyNumber);
  const [settingsOrangeName, setSettingsOrangeName] = useState(settings.orangeMoneyName);
  const [settingsMoovNum, setSettingsMoovNum] = useState(settings.moovMoneyNumber);
  const [settingsMoovName, setSettingsMoovName] = useState(settings.moovMoneyName);
  const [settingsPin, setSettingsPin] = useState(settings.adminPin);
  const [showSettingsPin, setShowSettingsPin] = useState(false);
  const [settingsShopName, setSettingsShopName] = useState(settings.shopName);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Delivery prices & Branding states
  const [settingsShopCity, setSettingsShopCity] = useState(settings.shopCity || 'Ouagadougou');
  const [settingsDeliveryWithinRadiusPrice, setSettingsDeliveryWithinRadiusPrice] = useState(settings.deliveryWithinRadiusPrice !== undefined ? settings.deliveryWithinRadiusPrice : 1000);
  const [settingsDeliveryOutsideRadiusPrice, setSettingsDeliveryOutsideRadiusPrice] = useState(settings.deliveryOutsideRadiusPrice !== undefined ? settings.deliveryOutsideRadiusPrice : 1500);
  const [settingsDeliveryOtherCityPrice, setSettingsDeliveryOtherCityPrice] = useState(settings.deliveryOtherCityPrice !== undefined ? settings.deliveryOtherCityPrice : 2000);
  const [settingsDeliveryOtherCountryPrice, setSettingsDeliveryOtherCountryPrice] = useState(settings.deliveryOtherCountryPrice !== undefined ? settings.deliveryOtherCountryPrice : 5000);
  const [settingsLogoUrl, setSettingsLogoUrl] = useState(settings.logoUrl || '');

  // Screenshot viewer popup state
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);

  // Import / Export states
  const [jsonPaste, setJsonPaste] = useState('');
  const [importStatus, setImportStatus] = useState({ success: false, message: '' });

  // Format money nicely (XOF)
  const formatXOF = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' F CFA';
  };

  // 1. KPI Panel Computations
  const totalCapitalInvested = products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0);
  const totalEstimatedRevenue = products.reduce((sum, p) => sum + (p.stock * p.retailPrice), 0);
  const totalPotentialProfit = products.reduce((sum, p) => sum + (p.stock * p.benefit), 0);

  // Delivered and Paid stats
  const paidOrders = orders.filter(o => o.status === 'Livré et Payé');
  const pendingOrders = orders.filter(o => o.status === 'En attente');
  const canceledOrders = orders.filter(o => o.status === 'Annulé');

  const actualRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const actualProfit = paidOrders.reduce((sum, o) => sum + o.totalProfit, 0);

  // 1.5. Calculate Daily Profits and Chiffre d'Affaires for the last 7 days
  const localDateString = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const trend7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // From 6 days ago up to today
    const dateStr = localDateString(d);
    // Format label like "14 Juin"
    const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    
    const dailyPaidOrders = paidOrders.filter(o => {
      const orderDate = o.createdAt.split('T')[0];
      return orderDate === dateStr;
    });

    const totalProfit = dailyPaidOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const totalRev = dailyPaidOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const count = dailyPaidOrders.length;

    return {
      date: dateStr,
      labelString: label,
      "Bénéfice": totalProfit,
      "Chiffre d'affaires": totalRev,
      commandesCount: count,
    };
  });

  const total7DaysTrendProfit = trend7DaysData.reduce((sum, item) => sum + item["Bénéfice"], 0);
  const maxWeeklyProfitItem = trend7DaysData.reduce((max, item) => item["Bénéfice"] > max["Bénéfice"] ? item : max, trend7DaysData[0]);

  // Stock Alerts list count
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => {
    const threshold = p.lowStockThreshold !== undefined && p.lowStockThreshold !== null ? p.lowStockThreshold : 5;
    return p.stock > 0 && p.stock <= threshold;
  }).length;

  // Handle saving product edits
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormStock(p.stock);
    setFormLowStockThreshold(p.lowStockThreshold !== undefined && p.lowStockThreshold !== null ? p.lowStockThreshold : '');
    setFormBuyPrice(p.buyPrice);
    setFormRetailPrice(p.retailPrice);
    setFormSalePrice(p.salePrice !== undefined && p.salePrice !== null ? p.salePrice : '');
    
    // Auto-calculate or load discount percentage
    if (p.pourcentageSolde !== undefined && p.pourcentageSolde !== null) {
      setFormDiscountPercent(p.pourcentageSolde);
    } else if (p.discountPercent !== undefined && p.discountPercent !== null) {
      setFormDiscountPercent(p.discountPercent);
    } else if (p.salePrice !== undefined && p.salePrice !== null && p.salePrice > 0 && p.retailPrice > 0) {
      setFormDiscountPercent(Math.round((1 - p.salePrice / p.retailPrice) * 100));
    } else {
      setFormDiscountPercent('');
    }

    setFormDescription(p.description || '');
    setFormImageUrl(p.imageUrl || '');
    setFormImages(p.images || []);
  };

  const handleOpenAdd = () => {
    setIsAddingNew(true);
    setFormName('');
    setFormCategory('Santé');
    setFormStock(20);
    setFormLowStockThreshold('');
    setFormBuyPrice(0);
    setFormRetailPrice(0);
    setFormSalePrice('');
    setFormDiscountPercent('');
    setFormDescription('');
    setFormImageUrl('');
    setFormImages([]);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formBuyPrice < 0 || formRetailPrice < 0) {
      alert('Veuillez remplir correctement les champs.');
      return;
    }

    const discountPercentVal = (formDiscountPercent === '' || Number(formDiscountPercent) <= 0) ? undefined : Number(formDiscountPercent);
    const salePriceVal = (discountPercentVal !== undefined)
      ? Math.round(formRetailPrice * (1 - discountPercentVal / 100))
      : (formSalePrice === '' ? undefined : Number(formSalePrice));
    const activeSellingPrice = (salePriceVal !== undefined && salePriceVal > 0) ? salePriceVal : formRetailPrice;
    const calculatedBenefit = activeSellingPrice - formBuyPrice;
    const lowStockThresholdVal = formLowStockThreshold === '' ? undefined : Number(formLowStockThreshold);

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName.trim(),
        category: formCategory,
        stock: Number(formStock),
        lowStockThreshold: lowStockThresholdVal,
        buyPrice: Number(formBuyPrice),
        retailPrice: Number(formRetailPrice),
        salePrice: salePriceVal,
        discountPercent: discountPercentVal,
        pourcentageSolde: discountPercentVal,
        benefit: calculatedBenefit,
        imageUrl: formImageUrl.trim() || undefined,
        images: formImages.length > 0 ? formImages : undefined,
        description: formDescription.trim() || undefined,
      };
      onUpdateProduct(updated);
      setEditingProduct(null);
    } else if (isAddingNew) {
      const newlyCreated: Product = {
        id: 'lr-' + Math.random().toString(36).substr(2, 5).toLowerCase(),
        name: formName.trim(),
        category: formCategory,
        stock: Number(formStock),
        lowStockThreshold: lowStockThresholdVal,
        buyPrice: Number(formBuyPrice),
        retailPrice: Number(formRetailPrice),
        salePrice: salePriceVal,
        discountPercent: discountPercentVal,
        pourcentageSolde: discountPercentVal,
        benefit: calculatedBenefit,
        imageUrl: formImageUrl.trim() || undefined,
        images: formImages.length > 0 ? formImages : undefined,
        description: formDescription.trim() || undefined,
      };
      onAddProduct(newlyCreated);
      setIsAddingNew(false);
    }
  };

  const handleQuickStock = (p: Product, change: number) => {
    const nextStock = Math.max(0, p.stock + change);
    onUpdateProduct({
      ...p,
      stock: nextStock,
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsWhatsapp.trim() || !settingsOrangeNum.trim() || !settingsMoovNum.trim() || !settingsPin.trim()) {
      alert('Tous les champs obligatoires doivent être renseignés.');
      return;
    }
    const updatedSettings: ShopSettings = {
      whatsappNumber: settingsWhatsapp.replace(/\s+/g, ''),
      orangeMoneyNumber: settingsOrangeNum.trim(),
      orangeMoneyName: settingsOrangeName.trim(),
      moovMoneyNumber: settingsMoovNum.trim(),
      moovMoneyName: settingsMoovName.trim(),
      adminPin: settingsPin.trim(),
      shopName: settingsShopName.trim() || 'Longrich Burkina Faso',
      shopCity: settingsShopCity.trim(),
      deliveryWithinRadiusPrice: Number(settingsDeliveryWithinRadiusPrice),
      deliveryOutsideRadiusPrice: Number(settingsDeliveryOutsideRadiusPrice),
      deliveryOtherCityPrice: Number(settingsDeliveryOtherCityPrice),
      deliveryOtherCountryPrice: Number(settingsDeliveryOtherCountryPrice),
      logoUrl: settingsLogoUrl.trim() || undefined,
    };
    onUpdateSettings(updatedSettings);
    setSettingsSuccessMsg('Configuration mise à jour avec succès !');
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  const handleBackupExport = () => {
    const rawDB = {
      products,
      settings,
      orders,
    };
    const str = JSON.stringify(rawDB, null, 2);
    setJsonPaste(str);
    navigator.clipboard.writeText(str);
    alert('Code de sauvegarde copié dans le presse-papiers avec succès ! Conservez ce texte en lieu sûr.');
  };

  const handleDownloadBackupFile = () => {
    const rawDB = {
      products,
      settings,
      orders,
    };
    const str = JSON.stringify(rawDB, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const exportFileDefaultName = `Longrich_Burkina_BackUp_${new Date().toISOString().split('T')[0]}_${Math.floor(Math.random() * 1000)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.products && Array.isArray(parsed.products) && parsed.settings) {
          onImportDatabase(parsed);
          setImportStatus({ success: true, message: `Félicitations! Base de données restaurée avec succès depuis le fichier ${file.name} !` });
          setTimeout(() => setImportStatus({ success: false, message: '' }), 5000);
        } else {
          setImportStatus({ success: false, message: "Le format de fichier de sauvegarde n'est pas correct (products ou settings manquants)." });
        }
      } catch (err: any) {
        setImportStatus({ success: false, message: `Fichier JSON non valide: ${err.message || 'Erreur inconnue'}` });
      }
    };
    reader.readAsText(file);
  };

  const handleBackupImport = () => {
    if (!jsonPaste.trim()) {
      setImportStatus({ success: false, message: 'Veuillez coller le code JSON de sauvegarde avant de valider.' });
      return;
    }
    try {
      const parsed = JSON.parse(jsonPaste.trim());
      if (parsed.products && Array.isArray(parsed.products) && parsed.settings) {
        onImportDatabase(parsed);
        setImportStatus({ success: true, message: 'Félicitations! Base de données restaurée avec succès!' });
        setTimeout(() => setImportStatus({ success: false, message: '' }), 5000);
      } else {
        setImportStatus({ success: false, message: 'Le format JSON semble incomplet (champs products ou settings introuvables).' });
      }
    } catch (err) {
      setImportStatus({ success: false, message: 'Erreur d\'analyse JSON. Vérifiez que le texte est identique à l\'export original.' });
    }
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Tous' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter orders by search and status
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.customerName.toLowerCase().includes(orderQuery.toLowerCase()) || 
      o.customerPhone.includes(orderQuery) ||
      o.id.toLowerCase().includes(orderQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'Tous' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/85 backdrop-blur-xs p-3 md:p-6 text-left">
      <div className="relative flex flex-col w-full max-w-6xl h-[95vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Admin Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white shrink-0 border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 rounded-lg text-emerald-300">
              <ShieldCheck className="w-5 h-5 text-emerald-300 animate-pulse-slow" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg tracking-tight">Espace Administration</h2>
              <p className="text-[10px] text-emerald-200 font-mono tracking-wider">LONGRICH BURKINA - PORTAIL GESTION OFFICIEL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {adminEmail && (
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-[9px] text-emerald-200 opacity-85 font-bold uppercase tracking-wide animate-pulse">Connecté en Admin</span>
                <span className="text-xs font-semibold text-white font-mono">{adminEmail}</span>
              </div>
            )}
            {onLogOutAdmin && adminEmail && (
              <button
                onClick={onLogOutAdmin}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Déconnexion
              </button>
            )}
            <button
              id="close-admin-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-emerald-900 transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher Area */}
        <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('kpi')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'kpi'
                ? 'border-emerald-700 text-emerald-850 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block mr-2 text-emerald-600" />
            Tableau de Bord KPI
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`relative px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'products'
                ? 'border-emerald-700 text-emerald-850 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Database className="w-4 h-4 inline-block mr-2 text-emerald-600" />
            Stocks & Articles ({products.length})
            {(outOfStockCount + lowStockCount) > 0 && (
              <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                {outOfStockCount + lowStockCount} Alerte{(outOfStockCount + lowStockCount) > 1 ? 's' : ''}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`relative px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'border-emerald-700 text-emerald-850 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline-block mr-2 text-amber-600" />
            Commandes Commanditées ({orders.length})
            {pendingOrders.length > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`relative px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'notifications'
                ? 'border-emerald-700 text-emerald-850 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Bell className="w-4 h-4 inline-block mr-2 text-rose-500" />
            Notifications ({notifications.length})
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center bg-rose-600 text-white rounded-full text-[9px] font-black border border-white">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'border-emerald-700 text-emerald-850 bg-white font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            <Settings className="w-4 h-4 inline-block mr-2 text-slate-600" />
            Configurations & Sauvegarde
          </button>
        </div>

        {/* Scrollable active content container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

          {/* 1. KPI Panel Tab */}
          {activeTab === 'kpi' && (
            <div className="space-y-6">
              
              {/* Top alert rows */}
              {(outOfStockCount > 0 || lowStockCount > 0) && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-900 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Alertes Stock Recommandées</h4>
                    <p className="text-xs text-orange-850 mt-0.5">
                      Vous avez <span className="font-extrabold text-orange-950">{outOfStockCount}</span> produit(s) en rupture totale et {' '}
                      <span className="font-extrabold text-orange-950">{lowStockCount}</span> produit(s) avec des stocks limités (5 articles ou moins). 
                      Veuillez réapprovisionner pour ne pas rater des opportunités de vente.
                    </p>
                  </div>
                </div>
              )}

              {/* Inventory stats Row */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Valorisation Financière de l\'inventaire</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Capital Investi (Dépenses)</p>
                      <p className="text-2xl font-black text-gray-900 tracking-tight mt-1">{formatXOF(totalCapitalInvested)}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Calculé sur (Stock * Prix Achat)</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-gray-600">
                      💰
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">Valeur de Revente Potentielle</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{formatXOF(totalEstimatedRevenue)}</p>
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">Calculé sur (Stock * Prix Revente)</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                      📈
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-emerald-150 shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">Bénéfices Bruts Latents</p>
                      <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{formatXOF(totalPotentialProfit)}</p>
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">Marge projetée sur stock total</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                      ⭐
                    </div>
                  </div>
                </div>
              </div>

              {/* Actual Sales performance stats */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Performance des Ventes Réelles (Livré & Payé)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  
                  <div className="bg-emerald-700 text-white p-5 rounded-xl shadow-xs">
                    <p className="text-xs uppercase font-bold text-emerald-200">Revenus Reçus</p>
                    <p className="text-2xl font-black tracking-tight mt-1">{formatXOF(actualRevenue)}</p>
                    <p className="text-[10px] text-emerald-100 mt-1">Somme de toutes les ventes validées</p>
                  </div>

                  <div className="bg-white border border-emerald-100 p-5 rounded-xl shadow-xs">
                    <p className="text-xs uppercase font-bold text-emerald-700">Bénéfices Réels Encaissés</p>
                    <p className="text-2xl font-black tracking-tight text-slate-900 mt-1">{formatXOF(actualProfit)}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Missions réelles de profit à l'achat</p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <p className="text-xs uppercase font-bold text-slate-500">Commandes Traitées</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-2xl font-black text-slate-900">{orders.length}</span>
                      <span className="text-xs text-slate-400 font-medium">au total</span>
                    </div>
                    <div className="mt-2 flex gap-1.5 text-[9px] uppercase font-bold">
                      <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{pendingOrders.length} En attente</span>
                      <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{paidOrders.length} Payés</span>
                      <span className="text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{canceledOrders.length} Annulés</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold text-gray-500">Panier Moyen Client </p>
                      <p className="text-xl font-bold text-gray-800 mt-1">
                        {orders.length > 0 
                          ? formatXOF(Math.round(orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length))
                          : '0 F CFA'
                        }
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* 7-Day profit trends with Recharts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Évolution des Bénéfices Réels (7 Derniers Jours)</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Données de Performance
                  </span>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                  {/* Micro stats banner inside the chart block */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Bénéfice Hebdomadaire (7j)</p>
                      <p className="text-lg font-black text-emerald-700 font-sans mt-0.5">{formatXOF(total7DaysTrendProfit)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Record de Profit Journalier</p>
                      <p className="text-lg font-black text-amber-600 font-sans mt-0.5">
                        {formatXOF(maxWeeklyProfitItem ? maxWeeklyProfitItem["Bénéfice"] : 0)}
                        {maxWeeklyProfitItem && (
                          <span className="text-[10px] text-slate-450 font-medium ml-1">({maxWeeklyProfitItem.labelString})</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Ventes Totales (7j)</p>
                      <p className="text-lg font-black text-slate-800 font-sans mt-0.5">
                        {formatXOF(trend7DaysData.reduce((sum, item) => sum + item["Chiffre d'affaires"], 0))}
                      </p>
                    </div>
                  </div>

                  {/* The Recharts graph container */}
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trend7DaysData}
                        margin={{ top: 10, right: 15, left: -5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis 
                          dataKey="labelString" 
                          tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                          axisLine={{ stroke: '#E2E8F0' }}
                          tickLine={{ stroke: '#E2E8F0' }}
                        />
                        <YAxis 
                          tick={{ fill: '#64748B', fontSize: 10, fontWeight: 650 }}
                          axisLine={{ stroke: '#E2E8F0' }}
                          tickLine={{ stroke: '#E2E8F0' }}
                          tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl shadow-xl text-white font-sans text-[11px] flex flex-col gap-1.5 min-w-[155px]">
                                  <p className="font-extrabold text-slate-400 border-b border-slate-800 pb-1 mb-1">{label}</p>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-emerald-400 font-bold">Bénéfice:</span>
                                    <span className="font-mono font-black text-[#10B981]">
                                      {data["Bénéfice"].toLocaleString('fr-FR')} F
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Chiffre d'aff.:</span>
                                    <span className="font-mono font-bold text-slate-300">
                                      {data["Chiffre d'affaires"].toLocaleString('fr-FR')} F
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Commandes:</span>
                                    <span className="font-mono font-semibold text-amber-400">
                                      {data.commandesCount} livrée(s)
                                    </span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Bénéfice" 
                          stroke="#10B981" 
                          strokeWidth={3} 
                          activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }}
                          dot={{ r: 4, stroke: '#10B981', strokeWidth: 2, fill: '#FFFFFF' }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Informative advice */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs flex gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Note importante de calcul :</strong> Les bénéfices réels sont calculés pro-rata en enregistrant le prix de revient d\'achat à l\'instant exact de la commande. Ainsi, si vous modifiez ultérieurement le prix d\'achat d\'un bien dans votre base de données, l\'historique financier de vos anciennes commandes approuvées restera parfaitement exact !
                </p>
              </div>

            </div>
          )}

          {/* 2. Products Directory Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              
              {/* Search and control row */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                
                {/* Search Bar Input */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Chercher par nom ou code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                {/* Category filters inside products directory */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline whitespace-nowrap">Catégorie:</span>
                  {['Tous', 'Santé', 'Soins & Hygiène', 'Hygiène Féminine'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Add Product Button */}
                <button
                  id="add-product-btn"
                  onClick={handleOpenAdd}
                  className="w-full md:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Produit
                </button>
              </div>

              {/* Actual Products list table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                        <th className="px-5 py-3">Code / ID</th>
                        <th className="px-5 py-3">Nom de l'article</th>
                        <th className="px-5 py-3">Catégorie</th>
                        <th className="px-5 py-3 text-center">Quantité Stock</th>
                        <th className="px-5 py-3 text-right">Prix d'Achat</th>
                        <th className="px-5 py-3 text-right">Prix de Revente</th>
                        <th className="px-5 py-3 text-right text-amber-800 font-bold">Prix Solde</th>
                        <th className="px-5 py-3 text-right text-blue-800 animate-pulse">Marge Bénéfice</th>
                        <th className="px-5 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {filteredProducts.map((p) => {
                        const customThreshold = p.lowStockThreshold !== undefined && p.lowStockThreshold !== null ? p.lowStockThreshold : 5;
                        const isStockLow = p.stock > 0 && p.stock <= customThreshold;
                        const isStockOut = p.stock === 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4 font-mono font-medium text-[10px] text-gray-400">
                              {p.id}
                            </td>
                            <td className="px-5 py-4 font-semibold text-gray-800 max-w-[200px] truncate" title={p.name}>
                              {p.name}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                p.category === 'Santé' 
                                  ? 'bg-emerald-50 text-emerald-800' 
                                  : p.category === 'Hygiène Féminine' 
                                    ? 'bg-rose-50 text-rose-700' 
                                    : 'bg-teal-50 text-teal-800'
                              }`}>
                                {p.category}
                              </span>
                            </td>
                            
                            {/* Stock incrementor widget with custom alerts */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleQuickStock(p, -1)}
                                    className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center font-extrabold hover:bg-gray-200 active:scale-95 text-xs transition-colors cursor-pointer"
                                    title="Retirer 1"
                                  >
                                    -
                                  </button>
                                  <span className={`w-12 text-center font-extrabold py-0.5 rounded-md ${
                                    isStockOut
                                      ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                                      : isStockLow
                                        ? 'bg-amber-150 text-amber-900 border border-amber-300'
                                        : 'text-gray-900 bg-gray-50'
                                  }`}>
                                    {p.stock}
                                  </span>
                                  <button
                                    onClick={() => handleQuickStock(p, 1)}
                                    className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center font-extrabold hover:bg-gray-200 active:scale-95 text-xs transition-colors cursor-pointer"
                                    title="Ajouter 1"
                                  >
                                    +
                                  </button>
                                </div>

                                {isStockOut ? (
                                  <span className="text-[8px] text-rose-600 font-extrabold tracking-wider uppercase bg-rose-50 px-1 border border-rose-100 rounded">
                                    Épuisé 🚨
                                  </span>
                                ) : isStockLow ? (
                                  <span className="text-[8px] text-amber-700 font-extrabold tracking-wider bg-amber-50 px-1 border border-amber-200 rounded animate-pulse">
                                    Alerte ({p.stock} ≤ {customThreshold}) ⚠️
                                  </span>
                                ) : p.lowStockThreshold !== undefined ? (
                                  <span className="text-[8px] text-slate-400 font-medium bg-slate-50 px-1 rounded">
                                    Seuil alerte: {p.lowStockThreshold}
                                  </span>
                                ) : null}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right font-mono text-gray-500 font-medium">
                              {formatXOF(p.buyPrice)}
                            </td>
                            
                            <td className="px-5 py-4 text-right font-mono text-gray-900 font-extrabold">
                              {formatXOF(p.retailPrice)}
                            </td>

                            <td className="px-5 py-4 text-right font-mono bg-amber-50/10">
                              {p.salePrice && p.salePrice > 0 ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-amber-800 font-black">{formatXOF(p.salePrice)}</span>
                                  <span className="text-[9px] text-amber-600 font-extrabold bg-amber-100/80 rounded px-1.5 py-0.5 mt-0.5">
                                    -{p.pourcentageSolde || p.discountPercent || Math.round((1 - p.salePrice / p.retailPrice) * 100)}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 font-light">-</span>
                              )}
                            </td>

                            <td className="px-5 py-4 text-right font-mono text-emerald-700 font-extrabold bg-emerald-50/20">
                              {formatXOF(p.benefit)}
                            </td>

                            {/* Direct Actions Cell */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  id={`edit-prod-btn-${p.id}`}
                                  onClick={() => handleOpenEdit(p)}
                                  className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                                  title="Éditer le produit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`delete-prod-btn-${p.id}`}
                                  onClick={() => {
                                    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${p.name}" ?`)) {
                                      onDeleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-800 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center p-8 text-gray-405">
                            Aucun produit ne correspond à vos critères de recherche.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* 3. Orders Historical Pipeline Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Order pipeline search filter toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                
                <div className="relative w-full sm:w-72 shrink-0">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer par Client ou Mobile..."
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 w-full overflow-x-auto scrollbar-none">
                  <span className="text-xs font-bold text-slate-400 hidden lg:inline">Statut:</span>
                  {['Tous', 'En attente', 'Livré et Payé', 'Annulé'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        orderStatusFilter === st
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-250'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order list accordion container */}
              <div className="space-y-3.5">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-all ${
                      order.status === 'Livré et Payé' 
                        ? 'border-blue-200 bg-blue-50/5' 
                        : order.status === 'Annulé' 
                          ? 'border-gray-200 opacity-70 bg-gray-50/40' 
                          : 'border-amber-150 bg-amber-50/5'
                    }`}
                  >
                    
                    {/* Top Row Overview Header */}
                    <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-gray-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-gray-400">
                            {order.id}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            order.status === 'Livré et Payé' 
                              ? 'bg-blue-100 text-blue-900' 
                              : order.status === 'Annulé' 
                                ? 'bg-gray-100 text-gray-500' 
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="mt-2 text-sm font-semibold text-gray-900">
                          👤 {order.customerName} - <span className="font-mono text-gray-600">{order.customerPhone}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 font-medium">
                          📍 Ville: {order.city} | Paiement: {order.paymentMethod}
                        </div>
                      </div>

                      {/* Financial outputs of this specific order */}
                      <div className="flex flex-wrap gap-4 items-baseline">
                        <div className="text-right">
                          <p className="text-[9px] uppercase font-bold text-gray-400">Montant Revente</p>
                          <p className="text-base font-extrabold text-gray-900">{formatXOF(order.totalPrice)}</p>
                        </div>
                        <div className="text-right border-l border-gray-200 pl-4">
                          <p className="text-[9px] uppercase font-bold text-emerald-700">Marge Bénéfice</p>
                          <p className="text-base font-extrabold text-emerald-700">{formatXOF(order.totalProfit)}</p>
                        </div>

                        {/* Status updating selectors */}
                        <div className="border-l border-gray-200 pl-4 flex flex-col gap-1">
                          <label className="text-[9px] font-bold uppercase text-gray-400">Changer le statut</label>
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold p-1 focus:outline-hidden"
                          >
                            <option value="En attente">En attente ⏳</option>
                            <option value="Livré et Payé">Livré et Payé ✅</option>
                            <option value="Annulé">Annulé ❌</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Ordered products item list inside order layout */}
                    <div className="px-5 py-3.5 bg-slate-50/50 text-xs">
                      <div className="font-bold text-gray-400 uppercase text-[9px] tracking-wide mb-2">Articles de la Commande</div>
                      <div className="space-y-1.5 md:max-w-2xl">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-gray-700 bg-white p-2 rounded border border-gray-100">
                            <div>
                              <span className="font-extrabold text-emerald-950 mr-2">x{item.quantity}</span>
                              <span className="font-semibold">{item.productName}</span>
                            </div>
                            <div className="font-mono text-gray-500 text-right">
                              {formatXOF(item.retailPrice * item.quantity)}
                              <span className="text-[10px] text-gray-400 block font-normal">
                                (marge: {formatXOF((item.retailPrice - item.buyPrice) * item.quantity)})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {order.orderNotes && (
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-[11px] mt-3 font-medium text-amber-950">
                          💬 <strong>Notes :</strong> {order.orderNotes}
                        </div>
                      )}
                      
                      {order.paymentScreenshot && (
                        <div className="mt-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center gap-3">
                          <Eye className="w-4 h-4 text-emerald-800 shrink-0" />
                          <div>
                            <span className="font-bold text-[11px] text-emerald-900 block">Capture d'Écran Paiement Jointe</span>
                            <button
                              type="button"
                              onClick={() => setSelectedScreenshotUrl(order.paymentScreenshot!)}
                              className="text-xs text-emerald-700 font-extrabold hover:underline"
                            >
                              Cliquez ici pour afficher la preuve en grand
                            </button>
                          </div>
                          <img
                            src={order.paymentScreenshot}
                            alt="Preuve"
                            onClick={() => setSelectedScreenshotUrl(order.paymentScreenshot!)}
                            className="w-12 h-12 object-cover rounded-lg border border-emerald-200 cursor-pointer ml-auto hover:opacity-80 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="text-center p-12 bg-white rounded-xl border border-gray-100 text-gray-400">
                    Aucune commande trouvée pour le filtre sélectionné.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 4. Settings Panel Options Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Core Store Tweaks Form */}
              <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5">
                  ⚙️ Coordonnées de Réception & Paiement
                </h3>

                {settingsSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-100">
                    {settingsSuccessMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom de la Boutique (Burkina Faso)</label>
                  <input
                    type="text"
                    required
                    value={settingsShopName}
                    onChange={(e) => setSettingsShopName(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone Destinataire des Commandes WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={settingsWhatsapp}
                    onChange={(e) => setSettingsWhatsapp(e.target.value)}
                    placeholder="Ex: 22670000000"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Format international sans le plus (+). Ex: 22670000000 pour le Burkina.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">🎯 Compte Orange Money</h4>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Numéro OM</label>
                      <input
                        type="text"
                        required
                        value={settingsOrangeNum}
                        onChange={(e) => setSettingsOrangeNum(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Titulaire OM</label>
                      <input
                        type="text"
                        required
                        value={settingsOrangeName}
                        onChange={(e) => setSettingsOrangeName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">💎 Compte Moov Money</h4>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Numéro Moov</label>
                      <input
                        type="text"
                        required
                        value={settingsMoovNum}
                        onChange={(e) => setSettingsMoovNum(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-1">Titulaire Moov</label>
                      <input
                        type="text"
                        required
                        value={settingsMoovName}
                        onChange={(e) => setSettingsMoovName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Delivery cost structures */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <h4 className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded uppercase">🚚 Configuration des Tarifs de Livraison & Ville</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-705 mb-1">Ville du Magasin (Boutique) *</label>
                      <input
                        type="text"
                        required
                        value={settingsShopCity}
                        onChange={(e) => setSettingsShopCity(e.target.value)}
                        placeholder="Ex: Bobo-Dioulasso"
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-705 mb-1">Livraison locale &le; 6km (XOF) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={settingsDeliveryWithinRadiusPrice}
                        onChange={(e) => setSettingsDeliveryWithinRadiusPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-205 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-705 mb-1">Livraison locale &gt; 6km (XOF) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={settingsDeliveryOutsideRadiusPrice}
                        onChange={(e) => setSettingsDeliveryOutsideRadiusPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-205 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-705 mb-1">Expédition autre ville (XOF) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={settingsDeliveryOtherCityPrice}
                        onChange={(e) => setSettingsDeliveryOtherCityPrice(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-205 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-705 mb-1">Expédition autre Pays (XOF) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={settingsDeliveryOtherCountryPrice}
                      onChange={(e) => setSettingsDeliveryOtherCountryPrice(Number(e.target.value))}
                      className="w-full max-w-[200px] rounded-lg border border-slate-205 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Brand Logo URL setup */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded uppercase">🌿 Identité de Marque & Logo Longrich</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-705 mb-1">URL de l'image du logo (Optionnel)</label>
                    <input
                      type="url"
                      value={settingsLogoUrl}
                      onChange={(e) => setSettingsLogoUrl(e.target.value)}
                      placeholder="https://example.com/longrich_logo.png"
                      className="w-full rounded-lg border border-slate-205 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-hidden font-mono text-[10px]"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Collez l'URL de l'image de votre logo pour l'afficher sur l'en-tête principal.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-rose-800 mb-1">🔑 Code PIN Administrateur</label>
                  <div className="relative flex items-center max-w-48">
                    <input
                      type={showSettingsPin ? "text" : "password"}
                      required
                      value={settingsPin}
                      onChange={(e) => setSettingsPin(e.target.value)}
                      className="w-full rounded-lg border border-rose-200 pl-3 pr-10 py-1.5 text-xs focus:border-rose-500 focus:outline-hidden font-mono tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSettingsPin(!showSettingsPin)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-650 focus:outline-hidden cursor-pointer"
                      title={showSettingsPin ? "Masquer le code PIN" : "Afficher le code PIN"}
                    >
                      {showSettingsPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Code PIN requis pour ouvrir cet espace d'administration.</p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 transition-all text-xs cursor-pointer shadow-xs uppercase tracking-wider"
                >
                  Enregistrer les Configurations Boutique
                </button>
              </form>

              {/* Advanced JSON Database Backup / Safety settings */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5">
                  💾 Sauvegarde & Restauration de Base de Données
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cette application utilise le stockage cloud Firestore. Pour éviter de perdre vos modifications d'inventaire, d'alertes, de prix ou de commandes en cas d'incident, exportez et téléchargez régulièrement vos données sous forme de fichier JSON sur votre appareil.
                </p>

                {importStatus.message && (
                  <div className={`p-3 text-xs font-semibold rounded-lg border ${
                    importStatus.success 
                      ? 'bg-blue-50 text-blue-900 border-blue-100' 
                      : 'bg-rose-50 text-rose-800 border-rose-100'
                  }`}>
                    {importStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadBackupFile}
                    className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 transition-colors cursor-pointer shadow-xs"
                    title="Télécharger le fichier .json physique de sauvegarde"
                  >
                    <Download className="w-4 h-4 text-white" />
                    Télécharger (.json)
                  </button>

                  <button
                    onClick={handleBackupExport}
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 border border-slate-200 transition-colors cursor-pointer"
                    title="Copier le JSON dans le presse-papiers"
                  >
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    Copier le texte
                  </button>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="block text-xs font-bold text-slate-700">Restauration : choisir une option</span>
                  
                  {/* File selector restoration */}
                  <div className="p-3 bg-indigo-50/30 border border-indigo-100 rounded-lg space-y-2">
                    <label className="block text-[11px] font-bold text-indigo-900">⚡ Option A : Charger depuis un fichier de sauvegarde (.json)</label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleBackupFileSelect}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-600">📝 Option B : Coller manuellement le texte JSON de sauvegarde</label>
                    <textarea
                      rows={3}
                      value={jsonPaste}
                      onChange={(e) => setJsonPaste(e.target.value)}
                      placeholder='Coller le texte de sauvegarde copié précédemment et cliquez sur "Importer"...'
                      className="w-full rounded-lg border border-slate-200 p-2 font-mono text-[9px] focus:outline-hidden"
                    />
                    
                    <button
                      onClick={handleBackupImport}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold py-2 px-3 transition-colors shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      Importer le code texte collé
                    </button>
                  </div>
                </div>
              </div>

              {/* Partage de la Boutique et Réseaux Sociaux */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-bold text-gray-800 text-sm border-b border-gray-50 pb-2 flex items-center gap-1.5">
                  📢 Partage de la Boutique & Réseaux Sociaux
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  Augmentez vos ventes en partageant le lien officiel de votre boutique Longrich Burkina Faso sur vos réseaux sociaux. Vos clients pourront ainsi consulter l'intégralité de vos {products.length} articles disponibles et commander facilement par WhatsApp !
                </p>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lien Public de votre Boutique</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                      Actif
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={window.location.origin + window.location.pathname}
                      className="flex-1 bg-white border border-slate-201 rounded px-2.5 py-1.5 font-mono text-[10px] text-slate-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const link = window.location.origin + window.location.pathname;
                        navigator.clipboard.writeText(link);
                        alert('Lien de la boutique copié dans votre presse-papiers !');
                      }}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                      title="Copier le lien"
                    >
                      <Link className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Share Buttons block */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-slate-600 uppercase">Partager directement sur :</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* WhatsApp share */}
                    <button
                      type="button"
                      onClick={() => {
                        const storeLink = window.location.origin + window.location.pathname;
                        const message = `🌿 Retrouvez tous nos produits *Longrich Burkina Faso* de qualité supérieure sur notre boutique en ligne officielle !\n\n🛍️ Consultez notre catalogue complet et passez vos commandes en ligne :\n👉 ${storeLink}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.284 1.488 4.674 1.488 5.25 0 9.516-4.269 9.52-9.522.002-2.546-.988-4.941-2.79-6.743C16.23 2.574 13.834 1.58 11.29 1.58c-5.25 0-9.518 4.268-9.522 9.521-.001 1.543.435 2.923 1.455 4.3l-.986 3.6 3.731-.977zm11.085-7.14c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-1.025-.512-1.7-1.002-2.388-2.18-.175-.3-.175-.54-.05-.69.115-.13.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.588-.492-.51-.675-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275 1.2 1.1 2.325 1.2 2.475.1.15 2.15 3.325 5.25 4.65.725.325 1.288.513 1.725.65.738.238 1.413.2 1.95.125.6-.087 1.782-.73 2.032-1.4.25-.675.25-1.25.175-1.4-.075-.15-.275-.25-.575-.4z" />
                      </svg>
                      {/* Text label with custom font */}
                      <span className="font-sans text-[11px] font-bold">WhatsApp</span>
                    </button>

                    {/* Facebook share */}
                    <button
                      type="button"
                      onClick={() => {
                        const storeLink = window.location.origin + window.location.pathname;
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeLink)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-105/80 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Facebook className="w-3.5 h-3.5 text-blue-600" />
                      Facebook
                    </button>

                    {/* Telegram share */}
                    <button
                      type="button"
                      onClick={() => {
                        const storeLink = window.location.origin + window.location.pathname;
                        const text = `🌿 Visitez Longrich Burkina Faso - Notre catalogue complet en ligne`;
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(storeLink)}&text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100/80 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-500" />
                      Telegram
                    </button>

                    {/* Web Share Api (or standard Copy) */}
                    <button
                      type="button"
                      onClick={async () => {
                        const storeLink = window.location.origin + window.location.pathname;
                        if (navigator.share) {
                          try {
                            await navigator.share({
                              title: 'Boutique Longrich Burkina Faso',
                              text: 'Découvrez notre catalogue de produits Longrich Burkina Faso officiels et commandez en ligne de manière sécurisée !',
                              url: storeLink
                            });
                          } catch (err) {
                            console.log('Mobile share failed/cancelled', err);
                          }
                        } else {
                          navigator.clipboard.writeText(storeLink);
                          alert('Lien de la boutique copié avec succès !');
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                      Autre
                    </button>
                  </div>
                </div>
              </div>

              {/* Synchronisation du Catalogue */}
              <div className="bg-amber-55 p-5 rounded-xl border border-amber-200/50 space-y-3">
                <h3 className="font-bold text-amber-800 text-sm border-b border-amber-200 pb-2 flex items-center gap-1.5">
                  🌿 Synchronisation & Restauration du Catalogue Longrich (66 Articles)
                </h3>
                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Cette action réinitialisera l'intégralité de votre catalogue actuel sur Firestore pour le remplacer par le catalogue de <strong>66 produits Longrich Burkina</strong> officiel. Le stock de chaque produit sera automatiquement configuré à <strong>100 unités</strong>, conformément à vos instructions. Les commandes et les réglages ne sont pas alterés.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm("IMPORTANT: Êtes-vous sûr de vouloir écraser votre catalogue de produits Firestore actuel par le nouveau catalogue officiel de 66 produits de Burkina avec stock réglé à 100 ? Les données précédentes de vos produits seront perdues.")) {
                      onImportDatabase({
                        products: INITIAL_PRODUCTS,
                        settings: settings,
                        orders: orders
                      });
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-3 transition-colors shadow-xs hover:shadow-md cursor-pointer"
                >
                  🌿 Forcer la Synchronisation (66 produits, stock = 100)
                </button>
              </div>

            </div>
          )}

          {/* E. Notifications Management Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Header and Controls Row */}
              <div className="bg-white p-4.5 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Bell className="w-4.5 h-4.5 text-rose-500" />
                    Notifications de Commande en Temps Réel
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                    {notifications.filter(n => !n.read).length} non lues sur un total de {notifications.length} reçues.
                  </p>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  {onClearAllNotifications && notifications.length > 0 && (
                    <button
                      onClick={onClearAllNotifications}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider py-2 px-3.5 transition-colors cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Tout Effacer
                    </button>
                  )}
                  {notifications.some(n => !n.read) && onMarkNotificationRead && (
                    <button
                      onClick={() => {
                        notifications.forEach(n => {
                          if(!n.read) onMarkNotificationRead(n.id);
                        });
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider py-2 px-3.5 transition-colors cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Tout Marquer Lu
                    </button>
                  )}
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Chercher client, téléphone, ville..."
                    value={notificationSearch}
                    onChange={(e) => setNotificationSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 pl-8.5 pr-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                  {notificationSearch && (
                    <button
                      onClick={() => setNotificationSearch('')}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 p-1 rounded-lg w-full sm:w-auto">
                  {(['Tous', 'Non lues', 'Lues'] as const).map((filterOpt) => (
                    <button
                      key={filterOpt}
                      onClick={() => setNotificationFilter(filterOpt)}
                      className={`flex-1 sm:flex-none px-3.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        notificationFilter === filterOpt
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-white/60'
                      }`}
                    >
                      {filterOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications Collection List */}
              {(() => {
                const searchClean = notificationSearch.toLowerCase().trim();
                const filtered = notifications.filter((notif) => {
                  // Text and attribute searching
                  const textMatch = 
                    notif.customerName.toLowerCase().includes(searchClean) ||
                    notif.customerPhone.toLowerCase().includes(searchClean) ||
                    notif.city.toLowerCase().includes(searchClean) ||
                    notif.message.toLowerCase().includes(searchClean);
                  
                  if (!textMatch) return false;

                  // Tab state filter
                  if (notificationFilter === 'Non lues') return !notif.read;
                  if (notificationFilter === 'Lues') return notif.read;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-10 text-center text-slate-400">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100/50 rounded-full flex items-center justify-center text-lg mx-auto mb-3">
                        📭
                      </div>
                      <p className="text-xs font-bold">Aucune notification trouvée</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Les alertes de nouvelles commandes soumises s'afficheront ici en temps réel.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {filtered.map((notif) => {
                      const ageSec = Math.max(0, (new Date().getTime() - new Date(notif.createdAt).getTime()) / 1000);
                      const ageText = ageSec < 60 
                        ? "À l'instant" 
                        : ageSec < 3600 
                          ? `${Math.floor(ageSec / 60)} min` 
                          : `${Math.floor(ageSec / 3600)} h`;

                      const matchingOrder = orders.find(o => o.id === notif.orderId);

                      return (
                        <div
                          key={notif.id}
                          className={`group relative p-4 rounded-xl border transition-all text-left flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            notif.read 
                              ? 'bg-white hover:bg-slate-50/50 border-gray-150' 
                              : 'bg-emerald-50/30 hover:bg-emerald-50/55 border-emerald-200/50 shadow-xs'
                          }`}
                        >
                          <div className="flex gap-3 items-start flex-1 min-w-0">
                            {/* Blue beacon unread pin indicator */}
                            <div className="relative shrink-0 mt-0.5">
                              <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center text-xs ${
                                notif.read ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-850 font-extrabold animate-pulse'
                              }`}>
                                📦
                              </div>
                              {!notif.read && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] uppercase tracking-wider font-extrabold ${
                                  notif.read ? 'text-slate-400' : 'text-emerald-750 font-black'
                                }`}>
                                  Commande {notif.orderId ? notif.orderId.substring(0, 8) : 'Directe'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  • {ageText}
                                </span>
                                {notif.emailNotified && (
                                  <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-green-200/50">
                                    <Mail className="w-2.5 h-2.5" /> Email Alerte Envoyée
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-xs text-gray-900 mt-1">
                                {notif.title}
                              </h4>
                              <p className="text-[11px] text-gray-655 mt-1 font-medium leading-relaxed">
                                {notif.message}
                              </p>

                              {matchingOrder && (
                                <div className="mt-2 bg-white/80 p-2.5 rounded-lg border border-slate-150 text-[10px] space-y-1.5 max-w-md">
                                  <p className="font-bold text-emerald-800 uppercase text-[8px] tracking-wide mb-1">Détails articles commandés :</p>
                                  {matchingOrder.items.map((item, id) => (
                                    <div key={id} className="flex justify-between items-center text-slate-700">
                                      <span><strong className="text-emerald-800">x{item.quantity}</strong> {item.productName}</span>
                                      <span className="font-mono text-slate-500">{(item.retailPrice * item.quantity).toLocaleString('fr-FR')} CC</span>
                                    </div>
                                  ))}
                                  {matchingOrder.orderNotes && (
                                    <p className="text-amber-850 italic mt-1 bg-amber-50/50 p-1 rounded-sm">Notes : {matchingOrder.orderNotes}</p>
                                  )}
                                </div>
                              )}
                              
                              <div className="mt-2.5 flex gap-3 text-[10px] font-bold text-gray-500 flex-wrap">
                                <span>📱 Tél : <span className="text-gray-900 font-mono font-medium">{notif.customerPhone}</span></span>
                                <span>📍 Ville : <span className="text-gray-900 font-medium">{notif.city}</span></span>
                                <span>💰 Montant : <span className="text-emerald-700 font-extrabold">{notif.orderAmount?.toLocaleString('fr-FR')} F CFA</span></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            {onMarkNotificationRead && !notif.read && (
                              <button
                                onClick={() => onMarkNotificationRead(notif.id)}
                                className="inline-flex items-center gap-1 hover:bg-slate-200/20 text-gray-600 hover:text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer bg-white"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-750" />
                                Marquer Lu
                              </button>
                            )}
                            <button
                              onClick={() => {
                                // Jump back to orders tab and filter for this order details
                                setOrderQuery(notif.orderId);
                                setOrderStatusFilter('Tous');
                                setActiveTab('orders');
                              }}
                              className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-900 to-indigo-950 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg hover:shadow-xs transition-all cursor-pointer border border-blue-950"
                            >
                              Détails Commande
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

        </div>

      </div>

      {/* Product Edit / Add Modal */}
      {(editingProduct || isAddingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 text-left">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-2xl relative">
            <h3 className="font-bold text-gray-900 text-base mb-4 border-b pb-2 flex items-center gap-1.5">
              {editingProduct ? '🎛️ Modifier l\'article' : '🆕 Ajouter un nouveau produit'}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de l'article *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-gray-250 p-2 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Catégorie</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-250 p-2 text-xs bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="Santé">Santé</option>
                  <option value="Soins & Hygiène">Soins & Hygiène</option>
                  <option value="Hygiène Féminine">Hygiène Féminine</option>
                  <option value="Produits Énergétiques">Produits Énergétiques</option>
                  <option value="Kits d'Adhésion">Kits d'Adhésion</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-250 p-2 text-xs focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-800 mb-1">🚨 Seuil Alerte Stock</label>
                  <input
                    type="number"
                    placeholder="Seuil (défaut: 5)"
                    min={0}
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-lg border border-rose-250 bg-rose-50/10 p-2 text-xs focus:border-rose-600 focus:outline-hidden font-mono font-bold text-rose-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1">Prix d'Achat (XOF) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formBuyPrice}
                    onChange={(e) => setFormBuyPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-250 p-2 text-xs focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                  <p className="text-[9px] text-gray-400 mt-1">Prix d'achat admin.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1 font-sans">Prix de Revente (XOF) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formRetailPrice}
                    onChange={(e) => {
                      const newRetail = Number(e.target.value);
                      setFormRetailPrice(newRetail);
                      if (formDiscountPercent !== '' && Number(formDiscountPercent) > 0) {
                        setFormSalePrice(Math.round(newRetail * (1 - Number(formDiscountPercent) / 100)));
                      }
                    }}
                    className="w-full rounded-lg border border-gray-250 p-2 text-xs focus:border-emerald-600 focus:outline-hidden font-mono text-emerald-800"
                  />
                  <p className="text-[9px] text-emerald-700 font-bold mt-1 font-sans">Prix normal client.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-amber-800 mb-1 font-sans">🔥 Solde / Remise (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Ex: 15 pour -15%"
                    value={formDiscountPercent}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormDiscountPercent('');
                        setFormSalePrice('');
                      } else {
                        const pct = Number(val);
                        setFormDiscountPercent(pct);
                        if (pct > 0 && formRetailPrice > 0) {
                          setFormSalePrice(Math.round(formRetailPrice * (1 - pct / 100)));
                        } else {
                          setFormSalePrice('');
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-amber-250 p-2 text-xs focus:border-amber-600 focus:outline-hidden font-mono text-amber-900 bg-amber-50/25"
                  />
                  <p className="text-[9px] text-amber-700 font-bold mt-1 font-sans">Pourcentage de remise (%)</p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 mb-1 font-sans">Prix Soldé (Calculé)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Aucun"
                    value={formSalePrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setFormSalePrice('');
                        setFormDiscountPercent('');
                      } else {
                        const price = Number(val);
                        setFormSalePrice(price);
                        if (formRetailPrice > 0 && price < formRetailPrice) {
                          setFormDiscountPercent(Math.round((1 - price / formRetailPrice) * 100));
                        } else {
                          setFormDiscountPercent('');
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-gray-250 p-2 text-xs focus:border-emerald-600 focus:outline-hidden font-mono text-emerald-950 font-bold"
                  />
                  <p className="text-[9px] text-slate-500 font-bold mt-1 font-sans">Entrer le prix ou calculer par %.</p>
                </div>
              </div>

              {/* Auto calculated margin summary inside form */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Marge Bénéfice Calculée :</span>
                <span className="font-mono text-emerald-700">
                  {formatXOF((formSalePrice !== '' && Number(formSalePrice) > 0 ? Number(formSalePrice) : formRetailPrice) - formBuyPrice)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description courte du produit</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Bénéfices principaux, posologie, et contenance..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-250 p-2 text-xs focus:border-[#1E3A8A] focus:outline-hidden"
                />
              </div>

              {/* Product Images Importer Section */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <label className="block text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🌿 Images du Produit ({formImages.length + (formImageUrl ? 1 : 0)})</span>
                </label>
                
                {/* Main image URL input field */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide">Image principale (URL)</label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full rounded-lg border border-gray-250 p-2 text-[11px] focus:border-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Multiple Images Local Upload drag-and-drop container area */}
                <div className="border border-dashed border-emerald-250 bg-emerald-50/30 rounded-xl p-3 text-center">
                  <div className="text-lg">📥</div>
                  <p className="text-[10px] font-extrabold text-slate-700 mt-0.5">Importer une ou plusieurs images ({formImages.length}/10)</p>
                  <p className="text-[8px] text-slate-400">Glissez-déposez ou sélectionnez des fichiers (Maximum 10 images)</p>
                  
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files) {
                        const filesArray = Array.from(e.target.files);
                        const currentCount = formImages.length;
                        const availableSlots = 10 - currentCount;
                        
                        if (availableSlots <= 0) {
                          alert("Vous avez déjà atteint la limite maximale de 10 images.");
                          return;
                        }
                        
                        // Slice extra files to respect 10 images limit
                        const filesToProcess = filesArray.slice(0, availableSlots);
                        if (filesArray.length > availableSlots) {
                          alert(`Seules les ${availableSlots} premières images ont été sélectionnées (maximum 10 images par article).`);
                        }

                        const readAsDataURL = (file: File): Promise<string> => {
                          return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                          });
                        };

                        try {
                          const base64Images = await Promise.all(filesToProcess.map(readAsDataURL));
                          setFormImages((prev) => {
                            const combined = [...prev];
                            base64Images.forEach((img) => {
                              if (!combined.includes(img) && combined.length < 10) {
                                combined.push(img);
                              }
                            });
                            return combined;
                          });
                        } catch (err) {
                          console.error("Erreur d'importation d'images :", err);
                        }
                      }
                    }}
                    className="hidden"
                    id="product-images-file-input"
                  />
                  <label
                    htmlFor="product-images-file-input"
                    className="mt-1.5 inline-block rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1 px-3 text-[9px] uppercase cursor-pointer transition-colors shadow-xs"
                  >
                    Parcourir les photos
                  </label>
                </div>

                {/* Custom Gallery Thumbnail Previews */}
                {(formImageUrl || formImages.length > 0) && (
                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Gestion de la Galerie</label>
                    <div className="grid grid-cols-4 gap-2">
                      {/* Main Image Thumbnail */}
                      {formImageUrl && (
                        <div className="relative group border border-amber-300 rounded-lg overflow-hidden bg-slate-100 h-12 w-full flex items-center justify-center">
                          <img src={formImageUrl} alt="Principale" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button
                              type="button"
                              onClick={() => setFormImageUrl('')}
                              className="text-[8px] bg-red-650 hover:bg-red-750 text-white px-1 py-0.5 rounded font-bold cursor-pointer"
                            >
                              Retirer
                            </button>
                          </div>
                          <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-white text-[7px] font-black uppercase text-center py-0.2 tracking-wider">
                            Principale
                          </span>
                        </div>
                      )}

                      {/* Additional Sub-Images Thumbnails */}
                      {formImages.map((img, idx) => (
                        <div key={idx} className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-100 h-12 w-full flex items-center justify-center">
                          <img src={img} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 top-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                // Swap with main image
                                const prevMain = formImageUrl;
                                setFormImageUrl(img);
                                setFormImages((prev) => {
                                  const copy = [...prev];
                                  if (prevMain) {
                                    copy[idx] = prevMain;
                                  } else {
                                    copy.splice(idx, 1);
                                  }
                                  return copy;
                                });
                              }}
                              className="text-[6px] bg-emerald-600 hover:bg-emerald-700 text-white px-1 py-0.2 rounded font-black uppercase cursor-pointer"
                            >
                              ⭐ Principal
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormImages((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="text-[6px] bg-rose-600 hover:bg-rose-700 text-white px-1 py-0.2 rounded font-black uppercase cursor-pointer"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddingNew(false);
                  }}
                  className="flex-1 rounded-lg bg-gray-155 hover:bg-gray-250 text-gray-750 font-bold py-2 text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 text-xs shadow-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshotUrl && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/85 p-4 text-center">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h4 className="font-bold text-sm text-slate-800">Preuve de Paiement Capturée</h4>
              <button
                onClick={() => setSelectedScreenshotUrl(null)}
                className="p-1 px-2 hover:bg-slate-150 rounded text-slate-400 hover:text-slate-900 font-extrabold text-base cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-2 flex items-center justify-center max-h-[70vh]">
              <img src={selectedScreenshotUrl} alt="Capture d'écran du paiement" className="max-w-full max-h-[60vh] object-contain rounded shadow-xs" referrerPolicy="no-referrer" />
            </div>
            <button
              onClick={() => setSelectedScreenshotUrl(null)}
              className="mt-4 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-4 text-xs cursor-pointer self-end"
            >
              Fermer la vue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
