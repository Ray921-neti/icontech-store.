import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Wrench, 
  Users, 
  Database, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Banknote, 
  Truck, 
  Store, 
  Phone, 
  MessageCircle, 
  X,
  ExternalLink,
  RefreshCw,
  Lock,
  Upload,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  fetchAllOrders, 
  updateOrderStatus,
  fetchAllRepairs, 
  updateRepairJob, 
  deleteRepairJob,
  seedDemoData 
} from '../services/storeService';
import { Product, Order, RepairJob, OrderStatus, PaymentStatus, RepairStatus, ProductCategory } from '../types';
import { formatNaira, formatDate, createWhatsAppUrl, STORE_LOCATION } from '../utils/formatters';
import { CATEGORIES } from '../data/categories';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { user, isAdmin, isLoading: authLoading, signInWithGoogle, loginWithAdminCode, signOutUser, adminEmail } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'repairs' | 'customers' | 'database'>('overview');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Search & filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [repairSearch, setRepairSearch] = useState('');
  const [repairStatusFilter, setRepairStatusFilter] = useState<string>('all');

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'smartphones' as ProductCategory,
    brand: '',
    price: 0,
    originalPrice: 0,
    stock: 10,
    images: '',
    description: '',
    inStock: true,
    isFeatured: false,
    isFlashDeal: false,
    badge: '',
    specs: '',
  });

  // Repair edit modal
  const [selectedRepair, setSelectedRepair] = useState<RepairJob | null>(null);
  const [repairNotes, setRepairNotes] = useState('');
  const [repairQuote, setRepairQuote] = useState(0);
  const [newRepairStatus, setNewRepairStatus] = useState<RepairStatus>('Received');
  const [repairPaymentStatus, setRepairPaymentStatus] = useState<'unpaid' | 'deposit_paid' | 'paid'>('unpaid');

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [prods, ords, reps] = await Promise.all([
        fetchProducts(),
        fetchAllOrders(),
        fetchAllRepairs(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setRepairs(reps);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const success = loginWithAdminCode(passcodeInput);
    if (!success) {
      setLoginError('Invalid Administrator Passcode. (Hint for development: icontech2026)');
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Image file is larger than 3MB. Please select an optimized image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProdForm((prev) => ({
          ...prev,
          images: prev.images.trim() ? `${prev.images}\n${base64}` : base64,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category: 'smartphones',
      brand: '',
      price: 0,
      originalPrice: 0,
      stock: 10,
      images: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&auto=format&fit=crop&q=80',
      description: '',
      inStock: true,
      isFeatured: false,
      isFlashDeal: false,
      badge: '',
      specs: 'Storage: 128GB\nWarranty: 1 Year',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const specsString = prod.specifications
      ? Object.entries(prod.specifications)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      : '';
    setProdForm({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      stock: prod.stock,
      images: prod.images.join('\n'),
      description: prod.description,
      inStock: prod.inStock,
      isFeatured: !!prod.isFeatured,
      isFlashDeal: !!prod.isFlashDeal,
      badge: prod.badge || '',
      specs: specsString,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArray = prodForm.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const specsObj: Record<string, string> = {};
    prodForm.specs.split('\n').forEach((line) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        specsObj[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: prodForm.name,
          category: prodForm.category,
          brand: prodForm.brand,
          price: Number(prodForm.price),
          originalPrice: Number(prodForm.originalPrice) || undefined,
          stock: Number(prodForm.stock),
          images: imagesArray.length > 0 ? imagesArray : editingProduct.images,
          description: prodForm.description,
          inStock: prodForm.inStock,
          isFeatured: prodForm.isFeatured,
          isFlashDeal: prodForm.isFlashDeal,
          badge: prodForm.badge || undefined,
          specifications: specsObj,
        });
        showNotification(`Product "${prodForm.name}" updated successfully.`);
      } else {
        await addProduct({
          name: prodForm.name,
          category: prodForm.category,
          brand: prodForm.brand,
          price: Number(prodForm.price),
          originalPrice: Number(prodForm.originalPrice) || undefined,
          stock: Number(prodForm.stock),
          images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&auto=format&fit=crop&q=80'],
          description: prodForm.description,
          inStock: prodForm.inStock,
          isFeatured: prodForm.isFeatured,
          isFlashDeal: prodForm.isFlashDeal,
          badge: prodForm.badge || undefined,
          specifications: specsObj,
          rating: 5.0,
          reviewsCount: 1,
        });
        showNotification(`New product "${prodForm.name}" added to catalog.`);
      }
      setIsProductModalOpen(false);
      loadAllData();
    } catch (e) {
      console.error('Save product error:', e);
      alert('Failed to save product. Check permissions.');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the store catalog?`)) {
      try {
        await deleteProduct(id);
        showNotification(`Deleted product "${name}".`);
        loadAllData();
      } catch (e) {
        console.error('Delete product error:', e);
      }
    }
  };

  // Order Actions
  const handleUpdateOrder = async (orderId: string, newStatus: OrderStatus, payStatus?: PaymentStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, payStatus);
      showNotification(`Order ${orderId} updated to ${newStatus}.`);
      loadAllData();
    } catch (e) {
      console.error('Update order error:', e);
    }
  };

  // Repair Actions
  const handleOpenEditRepair = (repair: RepairJob) => {
    setSelectedRepair(repair);
    setRepairNotes(repair.diagnosticNotes || '');
    setRepairQuote(repair.quotedPrice || 0);
    setNewRepairStatus(repair.repairStatus);
    setRepairPaymentStatus(repair.paymentStatus || 'unpaid');
  };

  const handleSaveRepairModal = async () => {
    if (!selectedRepair) return;
    try {
      await updateRepairJob(selectedRepair.id, {
        repairStatus: newRepairStatus,
        diagnosticNotes: repairNotes.trim(),
        quotedPrice: Number(repairQuote),
        paymentStatus: repairPaymentStatus,
      });
      showNotification(`Repair ${selectedRepair.id} updated.`);
      setSelectedRepair(null);
      loadAllData();
    } catch (e) {
      console.error('Repair update error:', e);
    }
  };

  const handleDeleteRepair = async (id: string) => {
    if (confirm(`Delete repair record ${id}?`)) {
      try {
        await deleteRepairJob(id);
        showNotification(`Repair ticket ${id} deleted.`);
        loadAllData();
      } catch (e) {
        console.error('Delete repair error:', e);
      }
    }
  };

  const handleSeedDatabase = async () => {
    if (confirm('Populate/Reset Firestore with default sample Nigerian gadget catalog and demo repair tickets?')) {
      setLoadingData(true);
      const res = await seedDemoData();
      showNotification(`Successfully seeded ${res.productsCount} products and ${res.repairsCount} repairs!`);
      await loadAllData();
    }
  };

  // Metrics
  const totalSalesRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const activeRepairsCount = repairs.filter(
    (r) => r.repairStatus !== 'Completed' && r.repairStatus !== 'Cancelled'
  ).length;
  const completedRepairsCount = repairs.filter((r) => r.repairStatus === 'Completed').length;

  // Filtered lists
  const filteredProducts = products.filter((p) =>
    productSearch === ''
      ? true
      : p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      orderSearch === '' ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);

    const matchesStatus =
      orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredRepairs = repairs.filter((r) => {
    const matchesSearch =
      repairSearch === '' ||
      r.id.toLowerCase().includes(repairSearch.toLowerCase()) ||
      r.customerName.toLowerCase().includes(repairSearch.toLowerCase()) ||
      r.brandModel.toLowerCase().includes(repairSearch.toLowerCase()) ||
      r.customerPhone.includes(repairSearch);

    const matchesStatus =
      repairStatusFilter === 'all' || r.repairStatus === repairStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Consolidated Customers
  const customerMap = new Map<string, { name: string; phone: string; orders: Order[]; repairs: RepairJob[]; totalSpent: number }>();
  orders.forEach((o) => {
    const key = o.customerPhone.trim();
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: o.customerName, phone: o.customerPhone, orders: [], repairs: [], totalSpent: 0 });
    }
    const cust = customerMap.get(key)!;
    cust.orders.push(o);
    cust.totalSpent += o.totalAmount;
  });
  repairs.forEach((r) => {
    const key = r.customerPhone.trim();
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: r.customerName, phone: r.customerPhone, orders: [], repairs: [], totalSpent: 0 });
    }
    const cust = customerMap.get(key)!;
    cust.repairs.push(r);
  });
  const customersList = Array.from(customerMap.values());

  // Render Login Screen if not Admin
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center mx-auto shadow-lg font-black text-xl">
              IC
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              ICONTECH Admin Management
            </h2>
            <p className="text-xs text-gray-500">
              Authorized personnel login for orders, inventory, and gadget repairs.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Option 1: Google Sign In */}
          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Admin</span>
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Primary admin email: <strong>{adminEmail}</strong>
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-gray-200" />
            <span className="shrink mx-3 text-gray-400 text-[11px] uppercase font-bold">Or Enter Passcode</span>
            <div className="grow border-t border-gray-200" />
          </div>

          {/* Option 2: Admin Passcode Login */}
          <form onSubmit={handlePasscodeLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Security Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter admin passcode"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-md"
            >
              Unlock Admin Dashboard
            </button>
          </form>

          <p className="text-[11px] text-gray-400 text-center">
            ICONTECH Electronics &bull; Opposite Adeyemi, Ondo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden">
      {/* Admin Top Bar */}
      <header className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-sm text-white">
            IC
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5">
              ICONTECH Backoffice
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                Live Admin
              </span>
            </h1>
            <span className="text-[10px] text-gray-400 block">
              Opposite Adeyemi, Ondo &bull; Database Connected
            </span>
          </div>
        </div>

        {/* Global notification pill */}
        {actionMessage && (
          <div className="hidden md:flex items-center bg-orange-500/20 border border-orange-500 text-orange-200 text-xs px-3 py-1 rounded-full animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
            {actionMessage}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition text-xs flex items-center gap-1"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={signOutUser}
            className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition text-xs font-bold flex items-center"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition"
            title="Return to store frontend"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-52 bg-white border-r border-gray-200 p-3 space-y-1 shrink-0 hidden md:flex flex-col justify-between">
          <nav className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'overview'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'products'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Package className="w-4 h-4" />
                <span>Products Catalog</span>
              </div>
              <span className="text-[10px] opacity-80">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'orders'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Customer Orders</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-400 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('repairs')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition ${
                activeTab === 'repairs'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Wrench className="w-4 h-4" />
                <span>Repair Tickets</span>
              </div>
              {activeRepairsCount > 0 && (
                <span className="bg-orange-400 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {activeRepairsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'customers'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customer History</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl transition ${
                activeTab === 'database'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database &amp; Demo</span>
            </button>
          </nav>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
            <span className="font-bold text-gray-800 block">ICONTECH Hub</span>
            <p>Ondo Town branch</p>
            <p className="text-[10px] font-mono text-gray-400">v1.2.0-prod</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* Mobile Tab Bar */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-3 mb-3 border-b border-gray-200 text-xs font-bold no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'bg-white'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'products' ? 'bg-orange-600 text-white' : 'bg-white'}`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'orders' ? 'bg-orange-600 text-white' : 'bg-white'}`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('repairs')}
              className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'repairs' ? 'bg-orange-600 text-white' : 'bg-white'}`}
            >
              Repairs ({repairs.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'customers' ? 'bg-orange-600 text-white' : 'bg-white'}`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-lg shrink-0 ${activeTab === 'database' ? 'bg-orange-600 text-white' : 'bg-white'}`}
            >
              Database
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Recorded Sales</span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {formatNaira(totalSalesRevenue)}
                  </div>
                  <span className="text-[11px] text-gray-400 block">
                    From confirmed &amp; delivered orders
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {orders.length}
                  </div>
                  <span className="text-[11px] text-amber-600 font-semibold block">
                    {pendingOrdersCount} pending processing
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Repairs</span>
                    <Wrench className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {activeRepairsCount}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold block">
                    {completedRepairsCount} jobs completed
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Catalog Gadgets</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {products.length}
                  </div>
                  <span className="text-[11px] text-red-600 font-semibold block">
                    {lowStockCount} items low in stock
                  </span>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleOpenAddProduct}
                  className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-md transition"
                >
                  <div className="text-left">
                    <span className="block text-sm font-black">+ Add New Product</span>
                    <span className="text-orange-100 text-[11px] font-normal">
                      List phone, laptop, or accessory to catalog
                    </span>
                  </div>
                  <Plus className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setActiveTab('repairs')}
                  className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-md transition"
                >
                  <div className="text-left">
                    <span className="block text-sm font-black">Manage Gadget Repairs</span>
                    <span className="text-gray-300 text-[11px] font-normal">
                      Update diagnoses, quotes, and customer progress
                    </span>
                  </div>
                  <Wrench className="w-6 h-6 text-orange-400" />
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 bg-white hover:bg-gray-50 border border-gray-200 text-slate-900 rounded-2xl font-bold text-xs flex items-center justify-between shadow-xs transition"
                >
                  <div className="text-left">
                    <span className="block text-sm font-black">Verify Orders &amp; Payments</span>
                    <span className="text-gray-500 text-[11px] font-normal">
                      Inspect transfers and dispatch status
                    </span>
                  </div>
                  <ShoppingBag className="w-6 h-6 text-emerald-600" />
                </button>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900 text-sm">Recent Customer Purchases</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-orange-600 font-bold text-xs hover:underline"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider text-[10px]">
                        <th className="pb-2">Order Ref</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Phone</th>
                        <th className="pb-2">Total Amount</th>
                        <th className="pb-2">Payment Status</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-mono font-bold text-slate-900">{ord.id}</td>
                          <td className="py-2.5">{ord.customerName}</td>
                          <td className="py-2.5">{ord.customerPhone}</td>
                          <td className="py-2.5 font-bold text-slate-900">{formatNaira(ord.totalAmount)}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold capitalize bg-gray-100">
                              {ord.paymentStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-50 text-orange-700">
                              {ord.orderStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-400">
                            No orders placed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search products by title, brand, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price (₦)</th>
                        <th className="py-3 px-3">Stock</th>
                        <th className="py-3 px-3">Availability</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={prod.images[0]}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase text-orange-600 block">
                                  {prod.brand}
                                </span>
                                <h4 className="font-bold text-gray-900 truncate max-w-xs">
                                  {prod.name}
                                </h4>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 capitalize text-gray-600 font-medium">
                            {prod.category}
                          </td>
                          <td className="py-3 px-3 font-black text-slate-900">
                            {formatNaira(prod.price)}
                            {prod.originalPrice && (
                              <span className="block text-[10px] text-gray-400 line-through">
                                {formatNaira(prod.originalPrice)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                prod.stock <= 5
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {prod.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prod.inStock
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {prod.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 transition"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-400">
                            No products match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search orders by Ref ID, customer name, phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-500">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders List Cards */}
              <div className="space-y-3">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <span className="font-mono font-black text-slate-900 text-sm block">
                          {ord.id}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Placed: {formatDate(ord.createdAt)} &bull; Customer: <strong>{ord.customerName}</strong> ({ord.customerPhone})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Payment Status Dropdown */}
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Payment:</span>
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) => handleUpdateOrder(ord.id, ord.orderStatus, e.target.value as PaymentStatus)}
                            className={`px-2 py-1 rounded text-xs font-bold border ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ord.paymentStatus === 'pending_verification'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="pending_verification">Pending Verification</option>
                            <option value="paid">Paid (Confirmed)</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </div>

                        {/* Order Fulfillment Status Dropdown */}
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Fulfillment:</span>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleUpdateOrder(ord.id, e.target.value as OrderStatus, ord.paymentStatus)}
                            className="px-2 py-1 rounded text-xs font-bold bg-orange-50 text-orange-800 border border-orange-300"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="ready_for_pickup">Ready for Pickup</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Order Details & Items */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                      <div className="md:col-span-7 space-y-2">
                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block">
                          Ordered Items ({ord.items.length})
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                              <span className="text-gray-800 font-medium truncate max-w-xs">
                                {item.quantity}x {item.productName}
                              </span>
                              <span className="font-black text-slate-900 shrink-0 ml-2">
                                {formatNaira(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-5 bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Method:</span>
                            <span className="font-bold capitalize">{ord.deliveryMethod}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Address:</span>
                            <span className="font-medium text-right max-w-[180px] truncate" title={ord.deliveryAddress}>
                              {ord.deliveryAddress}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Payment Type:</span>
                            <span className="font-bold uppercase text-[10px]">{ord.paymentMethod.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-gray-200 font-black text-slate-900 text-sm">
                            <span>Total Amount:</span>
                            <span className="text-orange-600">{formatNaira(ord.totalAmount)}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <a
                            href={createWhatsAppUrl(
                              `Hello ${ord.customerName}, this is ICONTECH Ondo. Regarding your order ${ord.id} (${formatNaira(ord.totalAmount)}): Status is currently ${ord.orderStatus}.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center rounded-lg text-xs flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
                    No orders found matching the filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REPAIR JOBS MANAGEMENT */}
          {activeTab === 'repairs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search repairs by ticket ID, customer, model..."
                    value={repairSearch}
                    onChange={(e) => setRepairSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-500">Status:</span>
                  <select
                    value={repairStatusFilter}
                    onChange={(e) => setRepairStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="all">All 8 Stages</option>
                    <option value="Received">Received</option>
                    <option value="Diagnosing">Diagnosing</option>
                    <option value="Awaiting Customer Approval">Awaiting Approval</option>
                    <option value="Awaiting Parts">Awaiting Parts</option>
                    <option value="Repairing">Repairing</option>
                    <option value="Ready for Collection">Ready for Collection</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Repairs List */}
              <div className="space-y-3">
                {filteredRepairs.map((repair) => (
                  <div
                    key={repair.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {repair.id}
                        </span>
                        <span className="text-[11px] text-gray-500 ml-2">
                          Customer: <strong>{repair.customerName}</strong> ({repair.customerPhone})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            repair.repairStatus === 'Ready for Collection' || repair.repairStatus === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : repair.repairStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {repair.repairStatus}
                        </span>

                        <button
                          onClick={() => handleOpenEditRepair(repair)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Update Job
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Device &amp; Issue</span>
                        <p className="font-bold text-gray-900">{repair.gadgetType} - {repair.brandModel}</p>
                        <p className="text-gray-600 mt-0.5">{repair.faultCategory}</p>
                        <p className="text-gray-500 italic mt-0.5 text-[11px]">"{repair.faultDescription}"</p>
                      </div>

                      <div>
                        <span className="text-gray-400 font-bold block text-[10px] uppercase">Diagnosis &amp; Quote</span>
                        <p className="font-black text-slate-900 text-sm">
                          {repair.quotedPrice ? formatNaira(repair.quotedPrice) : 'No quote given yet'}
                        </p>
                        <p className="text-gray-600 mt-0.5">
                          {repair.diagnosticNotes || 'Pending bench testing & disassembly'}
                        </p>
                      </div>

                      <div className="flex flex-col justify-between space-y-2">
                        <div>
                          <span className="text-gray-400 font-bold block text-[10px] uppercase">Timeline</span>
                          <p className="font-medium text-gray-800">
                            {repair.estimatedCompletion || 'In progress at Ondo lab'}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={createWhatsAppUrl(
                              `Hello ${repair.customerName}, this is ICONTECH Repair Lab opposite Adeyemi Ondo. Your ticket ${repair.id} for ${repair.brandModel} is now "${repair.repairStatus}". Quote: ${repair.quotedPrice ? formatNaira(repair.quotedPrice) : 'pending'}. Notes: ${repair.diagnosticNotes || ''}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center rounded-lg text-xs flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Status Update</span>
                          </a>

                          <button
                            onClick={() => handleDeleteRepair(repair.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition"
                            title="Delete ticket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredRepairs.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
                    No repair tickets match this search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER DIRECTORY & HISTORY */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200">
                <h3 className="font-black text-gray-900 text-sm">
                  Customer Directory ({customersList.length} Unique Customers)
                </h3>
                <p className="text-xs text-gray-500">
                  Consolidated purchasing and gadget repair service history by phone number.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customersList.map((cust, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{cust.name}</h4>
                        <span className="text-xs text-orange-600 font-semibold">{cust.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase">Total Spent</span>
                        <span className="font-black text-slate-900 text-sm">
                          {formatNaira(cust.totalSpent)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-2">
                      <div>
                        <span className="font-bold text-gray-700 block">Orders ({cust.orders.length}):</span>
                        {cust.orders.length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {cust.orders.map((o) => (
                              <div key={o.id} className="flex justify-between text-[11px] text-gray-600 bg-gray-50 p-1.5 rounded">
                                <span className="font-mono">{o.id}</span>
                                <span>{formatNaira(o.totalAmount)} ({o.orderStatus})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No purchases yet</span>
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-gray-700 block">Repairs ({cust.repairs.length}):</span>
                        {cust.repairs.length > 0 ? (
                          <div className="space-y-1 mt-1">
                            {cust.repairs.map((r) => (
                              <div key={r.id} className="flex justify-between text-[11px] text-gray-600 bg-orange-50/50 p-1.5 rounded">
                                <span className="font-mono">{r.id} ({r.brandModel})</span>
                                <span className="font-bold text-orange-700">{r.repairStatus}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No repair records</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {customersList.length === 0 && (
                  <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
                    No customers registered yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DATABASE & SEED */}
          {activeTab === 'database' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6 max-w-2xl">
              <div>
                <h3 className="font-black text-gray-900 text-base">
                  Cloud Firestore &amp; Catalog Management
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage persistent records in Cloud Firestore. Use the seed action to populate realistic gadget catalog demo data for testing.
                </p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3 text-xs text-orange-950">
                <span className="font-bold block text-sm">Demo Data Seeder</span>
                <p>
                  Populates 12 authentic Nigerian gadget store items (iPhones, Samsungs, MacBooks, HP Envy, Romoss 40k power banks, Anker GaN chargers, Oraimo ANC FreePods, MagSafe cases, 9D ceramic screen protectors) and 4 active repair tickets with realistic diagnostics.
                </p>
                <button
                  onClick={handleSeedDatabase}
                  disabled={loadingData}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition shadow-md disabled:bg-gray-400"
                >
                  {loadingData ? 'Seeding...' : 'Seed / Restore Demo Products & Repairs'}
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                <span className="font-bold text-gray-800 block">System Connection Status</span>
                <div className="flex justify-between">
                  <span className="text-gray-500">Firestore Project:</span>
                  <span className="font-mono font-bold text-gray-900">gen-lang-client-0571688528</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Authorized Admin Email:</span>
                  <span className="font-bold text-emerald-700">{adminEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Physical Store Location:</span>
                  <span className="font-bold text-gray-800">{STORE_LOCATION}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-black text-slate-900">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product to Catalog'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 15 Pro Max 256GB"
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="Apple, Samsung, HP, Oraimo..."
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Selling Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 1650000"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-black text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Original Price (₦) <span className="text-gray-400">(For discount percentage)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1800000"
                    value={prodForm.originalPrice}
                    onChange={(e) => setProdForm({ ...prodForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-gray-700">
                    Product Images (URLs or Local Assets)
                  </label>
                  <label className="cursor-pointer inline-flex items-center px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg text-[11px] border border-orange-200 transition">
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Upload from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows={2}
                  value={prodForm.images}
                  onChange={(e) => setProdForm({ ...prodForm, images: e.target.value })}
                  placeholder="https://... or /images/categories/smartphones.svg (One per line)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-[11px]"
                />

                {/* Quick Presets from Git Repository */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-gray-400 font-semibold">Repository Presets:</span>
                  {[
                    { label: 'Phone', path: '/images/categories/smartphones.svg' },
                    { label: 'Laptop', path: '/images/categories/laptops.svg' },
                    { label: 'Tablet', path: '/images/categories/tablets.svg' },
                    { label: 'Charger', path: '/images/categories/chargers.svg' },
                    { label: 'Audio', path: '/images/categories/earpieces.svg' },
                    { label: 'PowerBank', path: '/images/categories/powerbanks.svg' },
                    { label: 'Watch', path: '/images/categories/smartwatches.svg' },
                    { label: 'Case', path: '/images/categories/phonecases.svg' },
                    { label: 'Glass', path: '/images/categories/screenprotectors.svg' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setProdForm((prev) => ({
                          ...prev,
                          images: prev.images.trim() ? `${prev.images}\n${preset.path}` : preset.path,
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-gray-100 hover:bg-orange-100 hover:text-orange-700 text-gray-600 text-[10px] font-bold transition"
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>

                {/* Previews */}
                {prodForm.images.trim() && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {prodForm.images
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .map((url, i) => (
                        <div key={i} className="relative w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="Describe gadget features, warranty, condition..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Specifications (Key: Value per line)
                </label>
                <textarea
                  rows={2}
                  value={prodForm.specs}
                  onChange={(e) => setProdForm({ ...prodForm, specs: e.target.value })}
                  placeholder="RAM: 8GB&#10;Battery: 5000mAh"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.inStock}
                    onChange={(e) => setProdForm({ ...prodForm, inStock: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold">In Stock</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold">Featured on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFlashDeal}
                    onChange={(e) => setProdForm({ ...prodForm, isFlashDeal: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-bold text-red-600">Flash Sale Deal</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPAIR UPDATE MODAL */}
      {selectedRepair && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  {selectedRepair.id}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Update Repair Job ({selectedRepair.brandModel})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRepair(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Advance Repair Status (Current: {selectedRepair.repairStatus})
                </label>
                <select
                  value={newRepairStatus}
                  onChange={(e) => setNewRepairStatus(e.target.value as RepairStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-bold"
                >
                  <option value="Received">1. Received</option>
                  <option value="Diagnosing">2. Diagnosing</option>
                  <option value="Awaiting Customer Approval">3. Awaiting Customer Approval</option>
                  <option value="Awaiting Parts">4. Awaiting Parts</option>
                  <option value="Repairing">5. Repairing</option>
                  <option value="Ready for Collection">6. Ready for Collection</option>
                  <option value="Completed">7. Completed</option>
                  <option value="Cancelled">8. Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Quoted Repair Price (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairQuote}
                  onChange={(e) => setRepairQuote(Number(e.target.value))}
                  placeholder="e.g. 45000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Repair Payment Status
                </label>
                <select
                  value={repairPaymentStatus}
                  onChange={(e) => setRepairPaymentStatus(e.target.value as 'unpaid' | 'deposit_paid' | 'paid')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-bold"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="paid">Paid in Full</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Technician Diagnostic Notes &amp; Parts Replaced
                </label>
                <textarea
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Notes visible to customer on live tracker..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedRepair(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRepairModal}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save &amp; Update Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
