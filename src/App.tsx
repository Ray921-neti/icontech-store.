import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FlashSales } from './components/FlashSales';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { RepairBookingView } from './components/RepairBookingView';
import { RepairTrackingView } from './components/RepairTrackingView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { ContactView } from './components/ContactView';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { fetchProducts } from './services/storeService';
import { Product, ProductCategory, Order } from './types';
import { CATEGORIES } from './data/categories';
import { 
  STORE_NAME, 
  STORE_LOCATION, 
  STORE_PHONE, 
  createWhatsAppUrl, 
  formatNaira 
} from './utils/formatters';
import { 
  Wrench, 
  Sparkles, 
  SlidersHorizontal, 
  Filter, 
  Check, 
  MessageCircle, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Phone
} from 'lucide-react';

function Storefront() {
  const { addToCart, setIsCartOpen } = useCart();

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [trackingRepairRef, setTrackingRepairRef] = useState<string>('');

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Shop Filters
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000000);

  // Load products on mount
  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadCatalog();
  }, []);

  const handleAddToCart = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleSelectCategory = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSubmittedRepair = (refId: string) => {
    setTrackingRepairRef(refId);
    setActiveTab('repair-track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered and Sorted products for the Shop tab
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock = !onlyInStock || (prod.inStock && prod.stock > 0);
    const matchesPrice = prod.price <= maxPrice;

    return matchesCategory && matchesSearch && matchesStock && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const bestSellers = products.slice().sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Promotional Hero Slider */}
            <HeroBanner
              onExploreDeals={() => {
                setSelectedCategory('all');
                setActiveTab('shop');
              }}
              onBookRepair={() => setActiveTab('repair-book')}
            />

            {/* Flash Sales with Countdown */}
            <FlashSales
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onViewAllFlashDeals={() => {
                setSelectedCategory('all');
                setActiveTab('shop');
              }}
            />

            {/* Category Grid */}
            <CategoryGrid onSelectCategory={handleSelectCategory} />

            {/* Dedicated Repair Callout Card */}
            <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 space-y-2 max-w-xl">
                <span className="text-xs uppercase font-black tracking-widest text-orange-400 block">
                  Same-Day Repair Engineering
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Need Your iPhone, Samsung, or Laptop Repaired?
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Fast screen replacements, original batteries, charging port repair, and water damage recovery. Walk in today opposite Adeyemi College, Ondo.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('repair-book')}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Book Free Diagnostics
                  </button>
                  <button
                    onClick={() => setActiveTab('repair-track')}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition border border-white/20"
                  >
                    Track Existing Repair Ticket
                  </button>
                </div>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 text-xs space-y-2">
                <span className="font-bold text-orange-400 block text-xs">Ondo Service Center:</span>
                <p className="text-gray-300 font-medium">{STORE_LOCATION}</p>
                <p className="text-gray-300 font-bold">Call/WhatsApp: {STORE_PHONE}</p>
                <div className="pt-1 text-[11px] text-emerald-400 font-semibold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  90-Day Warranty on Replaced Parts
                </div>
              </div>
            </div>

            {/* Featured Products Showcase */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Featured Gadgets &amp; Hot Arrivals
                    <Sparkles className="w-4 h-4 text-orange-500" />
                  </h2>
                  <p className="text-xs text-gray-500">
                    Hand-picked top tier smartphones, laptops, and certified electronics
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setActiveTab('shop');
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 transition flex items-center"
                >
                  See All ({products.length})
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            </section>

            {/* Best Sellers in Ondo State */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Best Sellers &amp; Student Essentials
                  </h2>
                  <p className="text-xs text-gray-500">
                    High capacity power banks, GaN chargers, AirPods, and privacy screen protectors
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {bestSellers.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SHOP / ALL PRODUCTS CATALOG */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Header with breadcrumbs & active category title */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
                  Catalog &bull;{' '}
                  {selectedCategory === 'all'
                    ? 'All Categories'
                    : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {selectedCategory === 'all' ? 'All Gadgets & Accessories' : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Showing {filteredProducts.length} items with authentic Nigerian store warranty
                </p>
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-500">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white font-medium focus:outline-hidden"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Category Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs font-bold">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-full shrink-0 transition ${
                  selectedCategory === 'all'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Products ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-full shrink-0 transition ${
                    selectedCategory === cat.id
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                  <Filter className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">No products found</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    We could not find any products matching your current filters. Try resetting the category or search query.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: GADGET REPAIR BOOKING */}
        {activeTab === 'repair-book' && (
          <RepairBookingView onTrackSubmittedRepair={handleTrackSubmittedRepair} />
        )}

        {/* VIEW 4: GADGET REPAIR TRACKING */}
        {activeTab === 'repair-track' && (
          <RepairTrackingView initialRefId={trackingRepairRef} />
        )}

        {/* VIEW 5: CUSTOMER ORDER TRACKING */}
        {activeTab === 'order-track' && <OrderTrackingView />}

        {/* VIEW 6: CONTACT & STORE LOCATION */}
        {activeTab === 'contact' && <ContactView />}
      </div>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={createWhatsAppUrl('Hello ICONTECH, I am on your website and would like assistance with gadgets or repairs.')}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-105 group"
        aria-label="WhatsApp Support"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold group-hover:ml-2">
          Chat with ICONTECH
        </span>
      </a>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Global Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreProducts={() => {
          setSelectedCategory('all');
          setActiveTab('shop');
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={(order) => {
          // Success handled in modal
        }}
      />

      {/* Admin Dashboard Workspace */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}
