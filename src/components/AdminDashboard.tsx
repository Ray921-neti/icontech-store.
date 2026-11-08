import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Wrench, 
  Users, 
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
  CreditCard,
  Layers,
  Sparkles,
  Settings,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Eye
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
  fetchAllCustomers,
  fetchBusinessSettings,
  updateBusinessSettings,
  fetchApprovalRequests,
  createApprovalRequest,
  resolveApprovalRequest,
  fetchActivityLogs,
  logActivity,
  seedDemoData,
  DEFAULT_BUSINESS_SETTINGS
} from '../services/storeService';
import { 
  Product, 
  Order, 
  RepairJob, 
  OrderStatus, 
  PaymentStatus, 
  RepairStatus, 
  ProductCategory,
  CustomerProfile,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalType,
  ActivityLog,
  BusinessSettings
} from '../types';
import { formatNaira, formatDate, createWhatsAppUrl, STORE_LOCATION } from '../utils/formatters';
import { CATEGORIES } from '../data/categories';
import { processAndCompressImage } from '../utils/imageUtils';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { user, isAdmin, isLoading: authLoading, signInWithGoogle, signOutUser } = useAuth();

  // 11 Core Dashboard Sections
  type DashboardTab = 
    | 'overview'
    | 'products'
    | 'inventory'
    | 'orders'
    | 'payments'
    | 'repairs'
    | 'customers'
    | 'promotions'
    | 'approvals'
    | 'settings'
    | 'logs';

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);

  const [loadingData, setLoadingData] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Search & filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [repairSearch, setRepairSearch] = useState('');
  const [repairStatusFilter, setRepairStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('pending');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals & Action Forms
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

  const [selectedRepair, setSelectedRepair] = useState<RepairJob | null>(null);
  const [repairNotes, setRepairNotes] = useState('');
  const [repairQuote, setRepairQuote] = useState(0);
  const [newRepairStatus, setNewRepairStatus] = useState<RepairStatus>('Received');
  const [repairPaymentStatus, setRepairPaymentStatus] = useState<'unpaid' | 'deposit_paid' | 'paid'>('unpaid');

  // Approval review modal
  const [reviewingApproval, setReviewingApproval] = useState<ApprovalRequest | null>(null);
  const [adminReviewNote, setAdminReviewNote] = useState('');

  // Settings form
  const [settingsForm, setSettingsForm] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load all operational data
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [prods, ords, reps, custs, apps, logs, setts] = await Promise.all([
        fetchProducts(),
        fetchAllOrders(),
        fetchAllRepairs(),
        fetchAllCustomers(),
        fetchApprovalRequests(),
        fetchActivityLogs(100),
        fetchBusinessSettings(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setRepairs(reps);
      setCustomers(custs);
      setApprovals(apps);
      setActivityLogs(logs);
      setSettings(setts);
      setSettingsForm(setts);
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

  // Image Upload helper
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await processAndCompressImage(file, {
          maxWidth: 900,
          maxHeight: 900,
          quality: 0.8,
          maxSizeBytes: 10 * 1024 * 1024
        });
        setProdForm((prev) => ({
          ...prev,
          images: prev.images.trim() ? `${prev.images}\n${compressedBase64}` : compressedBase64,
        }));
        showNotification('Product photo optimized and added.');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Image upload failed. Please choose a valid image.');
      }
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
        await logActivity(
          'PRODUCT_UPDATE',
          'product',
          `Updated gadget: ${prodForm.name} (₦${Number(prodForm.price).toLocaleString()})`,
          editingProduct.id
        );
        showNotification(`Product "${prodForm.name}" updated successfully.`);
      } else {
        const newP = await addProduct({
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
        await logActivity(
          'PRODUCT_CREATE',
          'product',
          `Published new gadget: ${prodForm.name} (₦${Number(prodForm.price).toLocaleString()})`,
          newP.id
        );
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
        await logActivity('PRODUCT_DELETE', 'product', `Deleted product from catalog: ${name}`, id);
        showNotification(`Deleted product "${name}".`);
        loadAllData();
      } catch (e) {
        console.error('Delete product error:', e);
      }
    }
  };

  // Stock Adjustment
  const handleStockAdjust = async (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    try {
      await updateProduct(product.id, {
        stock: nextStock,
        inStock: nextStock > 0
      });
      await logActivity(
        'STOCK_ADJUSTMENT',
        'product',
        `Adjusted stock for ${product.name} from ${product.stock} to ${nextStock} (${delta > 0 ? `+${delta}` : delta})`,
        product.id
      );
      showNotification(`Stock for ${product.name} updated to ${nextStock}.`);
      loadAllData();
    } catch (e) {
      console.error('Stock adjust error:', e);
    }
  };

  // Order Actions
  const handleUpdateOrder = async (orderId: string, newStatus: OrderStatus, payStatus?: PaymentStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, payStatus);
      await logActivity(
        'ORDER_STATUS_UPDATE',
        'order',
        `Changed order ${orderId} status to ${newStatus}${payStatus ? ` (Payment: ${payStatus})` : ''}`,
        orderId
      );
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
      await logActivity(
        'REPAIR_UPDATE',
        'repair',
        `Updated repair ${selectedRepair.id} (${selectedRepair.brandModel}) to status: ${newRepairStatus}, Quote: ₦${Number(repairQuote).toLocaleString()}`,
        selectedRepair.id
      );
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
        await logActivity('REPAIR_DELETE', 'repair', `Deleted repair record ${id}`, id);
        showNotification(`Repair ticket ${id} deleted.`);
        loadAllData();
      } catch (e) {
        console.error('Delete repair error:', e);
      }
    }
  };

  // Approval System Resolution
  const handleResolveApproval = async (
    approval: ApprovalRequest, 
    decision: 'approved' | 'rejected'
  ) => {
    const adminEmail = user?.email || 'Super Administrator';
    try {
      await resolveApprovalRequest(
        approval.id,
        decision,
        adminEmail,
        adminReviewNote.trim() || undefined
      );
      showNotification(`Approval request ${approval.id} has been ${decision.toUpperCase()}.`);
      setReviewingApproval(null);
      setAdminReviewNote('');
      loadAllData();
    } catch (e) {
      console.error('Approval resolution error:', e);
    }
  };

  // Business Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await updateBusinessSettings(settingsForm, user?.email || 'Super Administrator');
      setSettings(updated);
      showNotification('Business settings and banking details updated successfully.');
    } catch (e) {
      console.error('Settings save error:', e);
      alert('Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (confirm('Populate/Reset Firestore with default sample Nigerian gadget catalog and demo repair tickets?')) {
      setLoadingData(true);
      const res = await seedDemoData();
      await logActivity('DATABASE_SEED', 'system', `Seeded ${res.productsCount} products and ${res.repairsCount} repairs to Firestore.`);
      showNotification(`Successfully seeded ${res.productsCount} products and ${res.repairsCount} repairs!`);
      await loadAllData();
    }
  };

  // Metrics
  const totalSalesRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
  const pendingPaymentsCount = orders.filter((o) => o.paymentStatus === 'pending_verification').length;
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

  const filteredApprovals = approvals.filter((a) => {
    if (approvalFilter === 'all') return true;
    return a.status === approvalFilter;
  });

  const filteredLogs = activityLogs.filter((l) => {
    if (logFilter === 'all') return true;
    return l.entityType === logFilter || l.action.toLowerCase().includes(logFilter.toLowerCase());
  });

  // Consolidated Customers
  const customerMap = new Map<string, { name: string; phone: string; email?: string; orders: Order[]; repairs: RepairJob[]; totalSpent: number }>();
  orders.forEach((o) => {
    const key = o.customerPhone.trim();
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: o.customerName, phone: o.customerPhone, email: o.customerEmail, orders: [], repairs: [], totalSpent: 0 });
    }
    const cust = customerMap.get(key)!;
    cust.orders.push(o);
    cust.totalSpent += o.totalAmount;
  });
  repairs.forEach((r) => {
    const key = r.customerPhone.trim();
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: r.customerName, phone: r.customerPhone, email: r.customerEmail, orders: [], repairs: [], totalSpent: 0 });
    }
    const cust = customerMap.get(key)!;
    cust.repairs.push(r);
  });
  // Also incorporate registered customer profiles
  customers.forEach((c) => {
    const key = c.phone.trim();
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: c.name, phone: c.phone, email: c.email, orders: [], repairs: [], totalSpent: 0 });
    }
  });
  const customersList = Array.from(customerMap.values()).filter((c) => {
    if (!customerSearch) return true;
    return (
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase()))
    );
  });

  // Render Login Gate if not Admin
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-[#082B62]/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-[#E5ECF5]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#718096] hover:text-[#082B62] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-[#082B62] text-white flex items-center justify-center mx-auto shadow-lg">
              <span className="text-[#FF7900] font-black text-2xl italic">ICON</span>
            </div>
            <h2 className="text-xl font-black text-[#10264D] tracking-tight">
              Authorized Administrator Access Only
            </h2>
            <p className="text-xs text-[#718096]">
              Secure Firebase Authentication with verified Super Administrator credentials.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Firebase Authorized Admin Sign In */}
          <div className="space-y-4">
            {user && !isAdmin ? (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs space-y-2 text-left">
                <div className="flex items-center space-x-2 font-bold text-red-900">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Access Denied: Not the Super Administrator</span>
                </div>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  Your Google identity does not hold Super Administrator authorization for ICONTECH. Regular customers and visitors are prohibited from administrative systems.
                </p>
                <button
                  type="button"
                  onClick={signOutUser}
                  className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition text-xs shadow-xs cursor-pointer"
                >
                  Sign Out &amp; Use Authorized Account
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#F3F7FC] border border-[#DCEBFF] rounded-2xl p-4 text-left space-y-1">
                  <div className="flex items-center space-x-2 text-[#082B62] font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#075CE5]" />
                    <span>Single Owner Protection</span>
                  </div>
                  <p className="text-[11px] text-[#718096] leading-relaxed">
                    This management suite is restricted to the verified store owner. All actions, orders, and financial transactions are cryptographically audited.
                  </p>
                </div>

                <button
                  onClick={signInWithGoogle}
                  disabled={authLoading}
                  className="w-full py-3.5 px-4 rounded-xl border border-[#E5ECF5] hover:bg-[#F3F7FC] text-[#10264D] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 transition shadow-xs bg-white cursor-pointer"
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
              </>
            )}
          </div>

          <p className="text-[11px] text-[#718096] text-center pt-2">
            ICONTECH Electronics &bull; Opposite Adeyemi, Ondo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F7FC] flex flex-col overflow-hidden font-sans text-[#10264D]">
      {/* Super Admin Top Bar */}
      <header className="bg-[#082B62] text-white px-4 py-3 border-b border-[#0b3b85] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF7900] flex items-center justify-center font-black text-sm text-white italic">
            IC
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight flex items-center gap-2">
              <span>ICONTECH Super Administrator Hub</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                Sole Super Admin
              </span>
            </h1>
            <span className="text-[10px] text-[#DCEBFF]/70 block">
              Opposite Adeyemi, Ondo &bull; Complete Business Command
            </span>
          </div>
        </div>

        {/* Global notification pill */}
        {actionMessage && (
          <div className="hidden md:flex items-center bg-[#FF7900]/20 border border-[#FF7900] text-amber-200 text-xs px-3.5 py-1 rounded-full animate-in fade-in">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-[#FF7900]" />
            {actionMessage}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => setActiveTab('approvals')}
              className="px-2.5 py-1 rounded-lg bg-[#FF7900] text-white text-xs font-bold flex items-center gap-1.5 animate-pulse cursor-pointer shadow-xs"
              title="Pending business approvals"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{pendingApprovalsCount} Approvals</span>
            </button>
          )}

          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="p-1.5 rounded-lg bg-[#0b3b85] hover:bg-[#075CE5] text-[#DCEBFF] transition text-xs flex items-center gap-1 cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={signOutUser}
            className="px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white transition text-xs font-bold flex items-center cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0b3b85] hover:bg-[#075CE5] text-white transition cursor-pointer"
            title="Return to storefront"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace with 11 Sections Navigation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav (Desktop) */}
        <aside className="w-56 bg-white border-r border-[#E5ECF5] p-3 space-y-1 shrink-0 hidden lg:flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-1 text-xs font-bold">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#718096] px-3 py-1">
              Store Operations
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#FF7900]" />
              <span>1. Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Package className="w-4 h-4 text-[#075CE5]" />
                <span>2. Products</span>
              </div>
              <span className="text-[10px] opacity-80">{products.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>3. Inventory &amp; Stock</span>
              </div>
              {lowStockCount > 0 && (
                <span className="bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingBag className="w-4 h-4 text-[#FF7900]" />
                <span>4. Orders</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-400 text-[#082B62] font-black text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>5. Payments</span>
              </div>
              {pendingPaymentsCount > 0 && (
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingPaymentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('repairs')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'repairs'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Wrench className="w-4 h-4 text-[#075CE5]" />
                <span>6. Repairs</span>
              </div>
              {activeRepairsCount > 0 && (
                <span className="bg-[#FF7900] text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  {activeRepairsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>7. Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'promotions'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#FF7900]" />
              <span>8. Promotions</span>
            </button>

            <div className="text-[10px] font-black uppercase tracking-wider text-[#718096] px-3 pt-3 pb-1">
              Governance &amp; Controls
            </div>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'approvals'
                  ? 'bg-[#FF7900] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>9. Approvals</span>
              </div>
              {pendingApprovalsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'approvals' ? 'bg-white text-[#FF7900]' : 'bg-[#FF7900] text-white'}`}>
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#075CE5]" />
              <span>10. Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-[#082B62] text-white shadow-xs'
                  : 'text-[#10264D] hover:bg-[#F3F7FC]'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>11. Activity Logs</span>
            </button>
          </nav>

          <div className="p-3 bg-[#F3F7FC] rounded-2xl border border-[#E5ECF5] text-[11px] text-[#718096] space-y-1">
            <span className="font-bold text-[#082B62] block">Sole Super Administrator</span>
            <p className="text-[10px]">Opposite Adeyemi College, Ondo</p>
            <div className="pt-1 flex items-center text-[10px] text-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Security Rules Active</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F3F7FC]">
          {/* Mobile Tab Pills Scroll */}
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-3 mb-3 border-b border-[#E5ECF5] text-xs font-bold no-scrollbar">
            {[
              { id: 'overview', label: '1. Overview' },
              { id: 'products', label: `2. Products (${products.length})` },
              { id: 'inventory', label: '3. Inventory' },
              { id: 'orders', label: `4. Orders (${orders.length})` },
              { id: 'payments', label: '5. Payments' },
              { id: 'repairs', label: `6. Repairs (${repairs.length})` },
              { id: 'customers', label: '7. Customers' },
              { id: 'promotions', label: '8. Promotions' },
              { id: 'approvals', label: `9. Approvals (${pendingApprovalsCount})` },
              { id: 'settings', label: '10. Settings' },
              { id: 'logs', label: '11. Logs' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as DashboardTab)}
                className={`px-3 py-1.5 rounded-xl shrink-0 transition cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-[#082B62] text-white shadow-xs'
                    : 'bg-white border border-[#E5ECF5] text-[#10264D]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ================= SECTION 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Pending Approvals Alert Banner */}
              {pendingApprovalsCount > 0 && (
                <div className="bg-[#FF7900] text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm tracking-tight">
                        {pendingApprovalsCount} Action{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Your Personal Super Admin Approval
                      </h3>
                      <p className="text-xs text-white/90">
                        Orders, bank transfers, or repair quotes are pending your personal sign-off.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="px-4 py-2 bg-white text-[#FF7900] hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                  >
                    Review Queue &rarr;
                  </button>
                </div>
              )}

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E5ECF5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#718096]">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#10264D]">
                    {formatNaira(totalSalesRevenue)}
                  </div>
                  <span className="text-[11px] text-[#718096] block">
                    From confirmed &amp; delivered orders
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E5ECF5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#718096]">
                    <span className="text-xs font-bold uppercase tracking-wider">Customer Orders</span>
                    <ShoppingBag className="w-4 h-4 text-[#FF7900]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#10264D]">
                    {orders.length}
                  </div>
                  <span className="text-[11px] text-[#FF7900] font-semibold block">
                    {pendingOrdersCount} awaiting confirmation
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E5ECF5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#718096]">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Repairs</span>
                    <Wrench className="w-4 h-4 text-[#075CE5]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#10264D]">
                    {activeRepairsCount}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold block">
                    {completedRepairsCount} tickets completed
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E5ECF5] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#718096]">
                    <span className="text-xs font-bold uppercase tracking-wider">Catalog Inventory</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#10264D]">
                    {products.length} Gadgets
                  </div>
                  <span className="text-[11px] text-red-600 font-semibold block">
                    {lowStockCount} items need restock
                  </span>
                </div>
              </div>

              {/* Fast Super Admin Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={handleOpenAddProduct}
                  className="p-4 bg-[#082B62] hover:bg-[#0b387e] text-white rounded-2xl font-bold text-xs flex items-center justify-between shadow-xs transition cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block text-sm font-black">+ Publish New Gadget</span>
                    <span className="text-[#DCEBFF] text-[11px] font-normal">
                      List phone, laptop, or original accessory
                    </span>
                  </div>
                  <Plus className="w-5 h-5 text-[#FF7900]" />
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className="p-4 bg-white hover:bg-emerald-50 border border-[#E5ECF5] text-[#10264D] rounded-2xl font-bold text-xs flex items-center justify-between shadow-xs transition cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block text-sm font-black">Verify Bank Transfers</span>
                    <span className="text-[#718096] text-[11px] font-normal">
                      {pendingPaymentsCount} transfers awaiting verification
                    </span>
                  </div>
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-4 bg-white hover:bg-[#F3F7FC] border border-[#E5ECF5] text-[#10264D] rounded-2xl font-bold text-xs flex items-center justify-between shadow-xs transition cursor-pointer"
                >
                  <div className="text-left">
                    <span className="block text-sm font-black">Store Configuration</span>
                    <span className="text-[#718096] text-[11px] font-normal">
                      Banking details, WhatsApp &amp; warranty terms
                    </span>
                  </div>
                  <Settings className="w-5 h-5 text-[#075CE5]" />
                </button>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-2xl border border-[#E5ECF5] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-[#10264D] text-sm">Recent Customer Purchases</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-[#075CE5] font-bold text-xs hover:underline cursor-pointer"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5ECF5] text-[#718096] uppercase font-bold tracking-wider text-[10px]">
                        <th className="pb-2">Order Ref</th>
                        <th className="pb-2">Customer</th>
                        <th className="pb-2">Phone</th>
                        <th className="pb-2">Total Amount</th>
                        <th className="pb-2">Payment</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5ECF5] font-medium">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#F3F7FC]">
                          <td className="py-2.5 font-mono font-bold text-[#10264D]">{ord.id}</td>
                          <td className="py-2.5">{ord.customerName}</td>
                          <td className="py-2.5">{ord.customerPhone}</td>
                          <td className="py-2.5 font-bold text-[#10264D]">{formatNaira(ord.totalAmount)}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                              ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ord.paymentStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#DCEBFF] text-[#075CE5]">
                              {ord.orderStatus.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-[#718096]">
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

          {/* ================= SECTION 2: PRODUCT MANAGEMENT ================= */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5ECF5]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#718096] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search products by title, brand, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
                  />
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-[#075CE5] hover:bg-[#064ec4] text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-[#E5ECF5] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F3F7FC] border-b border-[#E5ECF5] text-[#718096] font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price (₦)</th>
                        <th className="py-3 px-3">Stock</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5ECF5]">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-[#F3F7FC] transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={prod.images[0]}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-[#E5ECF5] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase text-[#FF7900] block">
                                  {prod.brand}
                                </span>
                                <h4 className="font-bold text-[#10264D] truncate max-w-xs">
                                  {prod.name}
                                </h4>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 capitalize text-[#718096] font-medium">
                            {prod.category}
                          </td>
                          <td className="py-3 px-3 font-black text-[#10264D]">
                            {formatNaira(prod.price)}
                            {prod.originalPrice && (
                              <span className="block text-[10px] text-[#718096] line-through">
                                {formatNaira(prod.originalPrice)}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                prod.stock <= 5
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-50 text-emerald-800'
                              }`}
                            >
                              {prod.stock} in stock
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
                              {prod.inStock ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-[#F3F7FC] hover:bg-[#DCEBFF] text-[#075CE5] transition cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 rounded-lg bg-[#F3F7FC] hover:bg-red-100 text-red-600 transition cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#718096]">
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

          {/* ================= SECTION 3: INVENTORY & STOCK ================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-[#10264D]">Real-Time Stock Management</h3>
                  <p className="text-xs text-[#718096]">
                    Track quantities and adjust warehouse counts. Any changes are recorded in the security audit log.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700">
                    {lowStockCount} Low Stock
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {products.length - lowStockCount} Healthy
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-[#E5ECF5] p-4 space-y-3 shadow-xs">
                    <div className="flex items-center space-x-3">
                      <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E5ECF5]" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-[#FF7900]">{p.category}</span>
                        <h4 className="font-bold text-xs text-[#10264D] truncate">{p.name}</h4>
                        <span className="text-xs font-black text-[#082B62]">{formatNaira(p.price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E5ECF5]">
                      <div className="text-xs">
                        <span className="text-[#718096] block text-[10px]">Current Stock</span>
                        <span className={`font-black text-sm ${p.stock <= 5 ? 'text-red-600' : 'text-[#10264D]'}`}>
                          {p.stock} units
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleStockAdjust(p, -1)}
                          disabled={p.stock <= 0}
                          className="w-8 h-8 rounded-lg bg-[#F3F7FC] hover:bg-gray-200 text-[#10264D] font-bold text-sm flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          title="Decrease stock by 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleStockAdjust(p, 5)}
                          className="px-2.5 h-8 rounded-lg bg-[#DCEBFF] hover:bg-[#c2dcff] text-[#075CE5] font-bold text-xs flex items-center justify-center cursor-pointer"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockAdjust(p, 10)}
                          className="px-2.5 h-8 rounded-lg bg-[#075CE5] hover:bg-[#064ec4] text-white font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
                          title="Add 10 units"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION 4: ORDER MANAGEMENT ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5ECF5]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#718096] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search orders by Ref ID, customer name, phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#718096]">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-[#E5ECF5] rounded-xl bg-white focus:outline-hidden"
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
                    className="bg-white rounded-2xl border border-[#E5ECF5] p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5ECF5]">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-[#10264D]">{ord.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#DCEBFF] text-[#075CE5]'
                          }`}>
                            {ord.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#718096]">
                          Placed on {formatDate(ord.createdAt)} &bull; {ord.deliveryMethod.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-[#10264D] block">
                          {formatNaira(ord.totalAmount)}
                        </span>
                        <span className="text-[10px] font-bold text-[#718096]">
                          {ord.paymentMethod.replace(/_/g, ' ')} ({ord.paymentStatus})
                        </span>
                      </div>
                    </div>

                    {/* Customer & Delivery details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F3F7FC] p-3 rounded-xl">
                      <div>
                        <span className="text-[#718096] block text-[10px] font-bold uppercase">Customer</span>
                        <p className="font-bold text-[#10264D]">{ord.customerName}</p>
                        <p className="text-[#718096]">{ord.customerPhone}</p>
                        {ord.customerEmail && <p className="text-[#718096]">{ord.customerEmail}</p>}
                      </div>
                      <div>
                        <span className="text-[#718096] block text-[10px] font-bold uppercase">Delivery Destination</span>
                        <p className="font-medium text-[#10264D]">{ord.deliveryAddress || 'In-store collection opposite Adeyemi College'}</p>
                        {ord.paymentReference && (
                          <p className="text-[11px] text-emerald-700 font-bold mt-1">
                            Ref: {ord.paymentReference}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold uppercase text-[#718096]">Purchased Items</span>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1">
                          <span className="text-[#10264D] font-medium">
                            {it.quantity}x {it.productName}
                          </span>
                          <span className="font-bold text-[#10264D]">{formatNaira(it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5ECF5]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-[#718096]">Update Status:</span>
                        {['confirmed', 'processing', 'shipped', 'ready_for_pickup', 'delivered', 'cancelled'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrder(ord.id, st as OrderStatus)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                              ord.orderStatus === st
                                ? 'bg-[#082B62] text-white shadow-xs'
                                : 'bg-[#F3F7FC] hover:bg-[#DCEBFF] text-[#10264D]'
                            }`}
                          >
                            {st.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>

                      <a
                        href={createWhatsAppUrl(`Hello ${ord.customerName}, this is the Super Administrator from ICONTECH regarding your Order ${ord.id}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Customer</span>
                      </a>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 text-center text-[#718096] border border-[#E5ECF5]">
                    No orders match your filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 5: PAYMENT VERIFICATION ================= */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-[#10264D]">Financial &amp; Bank Transfer Verification</h3>
                  <p className="text-xs text-[#718096]">
                    Verify direct customer bank transfers to {settings.bankName} ({settings.accountNumber}). Customers cannot self-approve payments.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    {orders.filter(o => o.paymentStatus === 'pending_verification').length} Awaiting Verification
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {orders.filter(o => o.paymentMethod === 'bank_transfer' || o.paymentStatus !== 'paid').map((ord) => (
                  <div key={ord.id} className="bg-white rounded-2xl border border-[#E5ECF5] p-5 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-[#10264D]">{ord.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-[#718096] mt-0.5">
                          Customer: <strong className="text-[#10264D]">{ord.customerName}</strong> ({ord.customerPhone})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-[#082B62] block">
                          {formatNaira(ord.totalAmount)}
                        </span>
                        <span className="text-[10px] text-[#718096]">
                          Method: {ord.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#F3F7FC] p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#718096]">Payment Reference Provided:</span>
                        <span className="font-mono font-bold text-[#10264D]">
                          {ord.paymentReference || 'No reference stated'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#718096]">Store Bank Account:</span>
                        <span className="font-semibold text-[#10264D]">{settings.bankName} - {settings.accountNumber}</span>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-[#E5ECF5]">
                      {ord.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => handleUpdateOrder(ord.id, ord.orderStatus, 'paid')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Approve Payment &amp; Mark Paid</span>
                        </button>
                      )}

                      {ord.paymentStatus === 'paid' && (
                        <button
                          onClick={() => handleUpdateOrder(ord.id, ord.orderStatus, 'refunded')}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Mark Refunded
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION 6: REPAIR MANAGEMENT ================= */}
          {activeTab === 'repairs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5ECF5]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#718096] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search repairs by ticket ID, device, customer..."
                    value={repairSearch}
                    onChange={(e) => setRepairSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#718096]">Stage:</span>
                  <select
                    value={repairStatusFilter}
                    onChange={(e) => setRepairStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-[#E5ECF5] rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="all">All Stages</option>
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
                {filteredRepairs.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-2xl border border-[#E5ECF5] p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5ECF5]">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm text-[#10264D]">{rep.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FF7900]/10 text-[#FF7900]">
                            {rep.repairStatus}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-[#10264D] mt-0.5">
                          {rep.brandModel} &bull; Issue: {rep.faultCategory}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-[#082B62] block">
                          {rep.quotedPrice ? formatNaira(rep.quotedPrice) : 'Quote Pending'}
                        </span>
                        <span className="text-[10px] text-[#718096]">
                          Payment: {rep.paymentStatus || 'unpaid'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F3F7FC] p-3 rounded-xl">
                      <div>
                        <span className="text-[#718096] block text-[10px] font-bold uppercase">Customer</span>
                        <p className="font-bold text-[#10264D]">{rep.customerName}</p>
                        <p className="text-[#718096]">{rep.customerPhone}</p>
                      </div>
                      <div>
                        <span className="text-[#718096] block text-[10px] font-bold uppercase">Fault Details</span>
                        <p className="text-[#10264D]">{rep.faultDescription}</p>
                        {rep.diagnosticNotes && (
                          <p className="text-[#075CE5] font-semibold mt-1">
                            Technician Notes: {rep.diagnosticNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEditRepair(rep)}
                          className="px-3 py-1.5 rounded-xl bg-[#082B62] hover:bg-[#0b387e] text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Update Diagnosis &amp; Quote</span>
                        </button>

                        <button
                          onClick={() => handleDeleteRepair(rep.id)}
                          className="p-1.5 rounded-xl text-[#718096] hover:text-red-600 transition cursor-pointer"
                          title="Delete ticket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <a
                        href={createWhatsAppUrl(`Hello ${rep.customerName}, this is the Super Administrator from ICONTECH regarding your repair ticket ${rep.id} (${rep.brandModel}).`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message Customer</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION 7: CUSTOMER MANAGEMENT ================= */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5ECF5]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#718096] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search customers by name, phone, email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
                  />
                </div>

                <div className="text-xs font-bold text-[#718096]">
                  Total Customers: <strong className="text-[#10264D]">{customersList.length}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customersList.map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E5ECF5] p-5 shadow-xs space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#DCEBFF] text-[#075CE5] flex items-center justify-center font-black text-sm">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-sm text-[#10264D] truncate">{c.name}</h4>
                        <p className="text-xs text-[#718096]">{c.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-[#F3F7FC] p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[#718096] block text-[10px]">Orders</span>
                        <strong className="text-[#10264D]">{c.orders.length}</strong>
                      </div>
                      <div>
                        <span className="text-[#718096] block text-[10px]">Repairs</span>
                        <strong className="text-[#10264D]">{c.repairs.length}</strong>
                      </div>
                      <div>
                        <span className="text-[#718096] block text-[10px]">Spent</span>
                        <strong className="text-[#082B62]">{formatNaira(c.totalSpent)}</strong>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs">
                      <a
                        href={createWhatsAppUrl(`Hello ${c.name}, ICONTECH Super Administrator contacting you regarding your electronics orders.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] font-bold flex items-center hover:underline cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        Chat WhatsApp
                      </a>

                      <a
                        href={`tel:${c.phone}`}
                        className="text-[#075CE5] font-bold flex items-center hover:underline cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 mr-1" />
                        Direct Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION 8: PROMOTIONS & DISCOUNTS ================= */}
          {activeTab === 'promotions' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs space-y-2">
                <h3 className="text-base font-black text-[#10264D]">Promotions, Flash Sales &amp; Homepage Highlights</h3>
                <p className="text-xs text-[#718096]">
                  Toggle gadgets on flash deals, highlight hero arrivals, or assign promotional badges.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-[#E5ECF5] p-4 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center space-x-3 min-w-0">
                      <img src={p.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-[#E5ECF5]" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-[#FF7900]">{p.brand}</span>
                        <h4 className="font-bold text-xs text-[#10264D] truncate">{p.name}</h4>
                        <span className="text-xs font-black text-[#082B62]">{formatNaira(p.price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={async () => {
                          await updateProduct(p.id, { isFlashDeal: !p.isFlashDeal });
                          await logActivity(
                            'PROMO_TOGGLE',
                            'product',
                            `Toggled Flash Deal on ${p.name} to ${!p.isFlashDeal}`,
                            p.id
                          );
                          loadAllData();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          p.isFlashDeal ? 'bg-red-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ⚡ Flash Sale
                      </button>

                      <button
                        onClick={async () => {
                          await updateProduct(p.id, { isFeatured: !p.isFeatured });
                          await logActivity(
                            'FEATURED_TOGGLE',
                            'product',
                            `Toggled Featured status on ${p.name} to ${!p.isFeatured}`,
                            p.id
                          );
                          loadAllData();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          p.isFeatured ? 'bg-[#075CE5] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ★ Featured
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION 9: PENDING APPROVALS ================= */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-[#10264D]">Personal Super Administrator Approvals Queue</h3>
                  <p className="text-xs text-[#718096]">
                    Sensitive business changes, customer orders, and quotes require your explicit verification before executing.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {['pending', 'approved', 'rejected', 'all'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setApprovalFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                        approvalFilter === st ? 'bg-[#FF7900] text-white shadow-xs' : 'bg-[#F3F7FC] text-[#10264D] hover:bg-[#DCEBFF]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredApprovals.map((appr) => (
                  <div
                    key={appr.id}
                    className="bg-white rounded-2xl border border-[#E5ECF5] p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5ECF5]">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-[#718096]">{appr.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            appr.status === 'pending'
                              ? 'bg-[#FF7900] text-white'
                              : appr.status === 'approved'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}>
                            {appr.status}
                          </span>
                          <span className="text-[11px] font-bold text-[#075CE5] uppercase tracking-wide">
                            {appr.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[#10264D] mt-1">{appr.title}</h4>
                      </div>

                      <div className="text-xs text-[#718096]">
                        Requested on {formatDate(appr.requestedAt)}
                      </div>
                    </div>

                    <p className="text-xs text-[#10264D] leading-relaxed">
                      {appr.description}
                    </p>

                    {/* Proposed Changes Diff View */}
                    <div className="bg-[#F3F7FC] p-3.5 rounded-xl text-xs space-y-2">
                      <span className="font-bold text-[10px] uppercase text-[#718096]">Proposed Mutation Parameters:</span>
                      <pre className="font-mono text-[11px] text-[#10264D] overflow-x-auto p-2 bg-white rounded-lg border border-[#E5ECF5]">
                        {JSON.stringify(appr.proposedChanges, null, 2)}
                      </pre>
                    </div>

                    {appr.notes && (
                      <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs">
                        <strong>Review Note:</strong> {appr.notes} ({appr.reviewedBy})
                      </div>
                    )}

                    {appr.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#E5ECF5]">
                        <input
                          type="text"
                          placeholder="Admin review note / instructions..."
                          value={reviewingApproval?.id === appr.id ? adminReviewNote : ''}
                          onFocus={() => {
                            setReviewingApproval(appr);
                            setAdminReviewNote('');
                          }}
                          onChange={(e) => {
                            setReviewingApproval(appr);
                            setAdminReviewNote(e.target.value);
                          }}
                          className="flex-1 px-3 py-2 text-xs border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
                        />

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleResolveApproval(appr, 'rejected')}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleResolveApproval(appr, 'approved')}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center space-x-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Approve &amp; Execute</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredApprovals.length === 0 && (
                  <div className="bg-white rounded-2xl p-10 text-center text-[#718096] border border-[#E5ECF5]">
                    No approvals currently in this queue.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= SECTION 10: BUSINESS SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-[#E5ECF5] p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E5ECF5]">
                  <div>
                    <h3 className="text-base font-black text-[#10264D]">Store Branding &amp; Operational Settings</h3>
                    <p className="text-xs text-[#718096]">
                      Super Administrator configured store details, customer service lines, and verified Nigerian bank credentials.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-[#075CE5] hover:bg-[#064ec4] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#10264D] mb-1">Store Name</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#10264D] mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.contactPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#10264D] mb-1">Official WhatsApp Number</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#10264D] mb-1">Store Email</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.storeEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#10264D] mb-1">Physical Store Address</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.businessAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, businessAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#10264D] mb-1">Business Opening Hours</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.businessHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, businessHours: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                    />
                  </div>
                </div>

                {/* Bank Account Section */}
                <div className="pt-4 border-t border-[#E5ECF5] space-y-3">
                  <h4 className="font-black text-sm text-[#10264D]">Store Bank Transfer Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#10264D] mb-1">Bank Name</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.bankName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#10264D] mb-1">Account Name</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.accountName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accountName: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#10264D] mb-1">NUBAN Account Number</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.accountNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl font-mono text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Operational Parameters */}
                <div className="pt-4 border-t border-[#E5ECF5] space-y-3">
                  <h4 className="font-black text-sm text-[#10264D]">Delivery &amp; Repair Warranty Terms</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#10264D] mb-1">Standard Delivery Fee (₦)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={settingsForm.deliveryFeeStandard}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeStandard: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#10264D] mb-1">Free Delivery Threshold (₦)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={settingsForm.freeDeliveryThreshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#10264D] mb-1">Repair Warranty (Days)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={settingsForm.repairWarrantyDays}
                        onChange={(e) => setSettingsForm({ ...settingsForm, repairWarrantyDays: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5ECF5] flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleSeedDatabase}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Seed Sample Catalog Data
                  </button>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-[#082B62] hover:bg-[#0b387e] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {savingSettings ? 'Saving...' : 'Save All Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= SECTION 11: ACTIVITY & SECURITY AUDIT LOGS ================= */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E5ECF5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-[#10264D]">Cryptographic Activity &amp; Security Logs</h3>
                  <p className="text-xs text-[#718096]">
                    Immutable audit stream recording all administrative actions, stock changes, and business approvals.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-[#E5ECF5] rounded-xl bg-white focus:outline-hidden"
                  >
                    <option value="all">All Actions</option>
                    <option value="approval">Approvals</option>
                    <option value="product">Products</option>
                    <option value="order">Orders</option>
                    <option value="repair">Repairs</option>
                    <option value="settings">Settings</option>
                    <option value="system">System</option>
                  </select>

                  <button
                    onClick={loadAllData}
                    className="p-1.5 rounded-xl bg-[#F3F7FC] hover:bg-[#DCEBFF] text-[#075CE5] transition cursor-pointer"
                    title="Reload logs"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5ECF5] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F3F7FC] border-b border-[#E5ECF5] text-[#718096] uppercase font-bold tracking-wider text-[10px]">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-3">Action Code</th>
                        <th className="py-3 px-3">Entity</th>
                        <th className="py-3 px-4">Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5ECF5] font-medium">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#F3F7FC]">
                          <td className="py-2.5 px-4 text-[#718096] text-[11px] whitespace-nowrap">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-[#DCEBFF] text-[#075CE5]">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-[#718096]">
                            {log.entityType}
                          </td>
                          <td className="py-2.5 px-4 text-[#10264D] text-xs">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                      {filteredLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#718096]">
                            No activity logs found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative border border-[#E5ECF5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECF5]">
              <h3 className="text-base font-black text-[#10264D]">
                {editingProduct ? `Edit Gadget: ${editingProduct.name}` : 'Publish New Gadget'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#718096] hover:text-[#10264D] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#10264D] mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 15 Pro Max 256GB"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#10264D] mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Samsung, Oraimo"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#10264D] mb-1">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl bg-white font-medium"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#10264D] mb-1">Selling Price (₦)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 1500000"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#10264D] mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#10264D]">
                    Product Images (URLs or Local Assets)
                  </label>
                  <label className="cursor-pointer inline-flex items-center px-2.5 py-1 bg-[#DCEBFF] hover:bg-[#c2dcff] text-[#075CE5] font-bold rounded-lg text-[11px] transition">
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
                  placeholder="/images/categories/smartphones.jpg (One per line)"
                  className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl font-mono text-[11px]"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                  <span className="text-[10px] text-[#718096] font-semibold">Presets:</span>
                  {[
                    { label: 'Phone', path: '/images/categories/smartphones.jpg' },
                    { label: 'Laptop', path: '/images/categories/laptops.jpg' },
                    { label: 'Tablet', path: '/images/categories/tablets.jpg' },
                    { label: 'Charger', path: '/images/categories/chargers.jpg' },
                    { label: 'Audio', path: '/images/categories/earpieces.jpg' },
                    { label: 'PowerBank', path: '/images/categories/powerbanks.jpg' },
                    { label: 'Watch', path: '/images/categories/smartwatches.jpg' },
                    { label: 'Case', path: '/images/categories/phonecases.jpg' },
                    { label: 'Glass', path: '/images/categories/screenprotectors.jpg' },
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
                      className="px-2 py-0.5 rounded-lg bg-[#F3F7FC] hover:bg-[#DCEBFF] hover:text-[#075CE5] text-[#718096] text-[10px] font-bold transition cursor-pointer"
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#10264D] mb-1">Product Description</label>
                <textarea
                  rows={2}
                  required
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="Describe gadget features, warranty, condition..."
                  className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t border-[#E5ECF5]">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.inStock}
                    onChange={(e) => setProdForm({ ...prodForm, inStock: e.target.checked })}
                    className="rounded text-[#075CE5] focus:ring-[#075CE5]"
                  />
                  <span className="font-bold text-[#10264D]">In Stock</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    className="rounded text-[#075CE5] focus:ring-[#075CE5]"
                  />
                  <span className="font-bold text-[#10264D]">Featured on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFlashDeal}
                    onChange={(e) => setProdForm({ ...prodForm, isFlashDeal: e.target.checked })}
                    className="rounded text-[#FF7900] focus:ring-[#FF7900]"
                  />
                  <span className="font-bold text-[#FF7900]">Flash Sale Deal</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#718096] font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#082B62] hover:bg-[#0b387e] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Gadget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPAIR UPDATE MODAL */}
      {selectedRepair && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-[#E5ECF5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5ECF5]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#718096] uppercase">
                  {selectedRepair.id}
                </span>
                <h3 className="text-base font-black text-[#10264D]">
                  Update Repair Job ({selectedRepair.brandModel})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRepair(null)}
                className="text-[#718096] hover:text-[#10264D] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#10264D] mb-1">
                  Advance Repair Status (Current: {selectedRepair.repairStatus})
                </label>
                <select
                  value={newRepairStatus}
                  onChange={(e) => setNewRepairStatus(e.target.value as RepairStatus)}
                  className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl bg-white font-bold"
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
                <label className="block font-bold text-[#10264D] mb-1">
                  Quoted Repair Price (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  value={repairQuote}
                  onChange={(e) => setRepairQuote(Number(e.target.value))}
                  placeholder="e.g. 45000"
                  className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl font-black text-[#082B62]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#10264D] mb-1">
                  Repair Payment Status
                </label>
                <select
                  value={repairPaymentStatus}
                  onChange={(e) => setRepairPaymentStatus(e.target.value as 'unpaid' | 'deposit_paid' | 'paid')}
                  className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl bg-white font-bold"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="paid">Paid in Full</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#10264D] mb-1">
                  Technician Diagnostic Notes &amp; Parts Replaced
                </label>
                <textarea
                  rows={3}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Notes visible to customer on live tracker..."
                  className="w-full px-3 py-2 border border-[#E5ECF5] rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-[#E5ECF5]">
                <button
                  type="button"
                  onClick={() => setSelectedRepair(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#718096] font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRepairModal}
                  className="px-5 py-2 bg-[#075CE5] hover:bg-[#064ec4] text-white font-bold rounded-xl shadow-xs cursor-pointer"
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
