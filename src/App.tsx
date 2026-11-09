import React, { useState, useEffect, useMemo } from 'react';
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
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerAccountView } from './components/CustomerAccountView';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
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
  searchAndRankProducts, 
  createWhatsAppGadgetRequestUrl, 
  POPULAR_SEARCH_TERMS 
} from './utils/searchUtils';
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
  Phone,
  ChevronUp,
  Search,
  X
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
  const [customerAuthModal, setCustomerAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin',
  });

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

  // Floating Scroll to Top Visibility Listener
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Synchronize URL hash with activeTab and handle deep links
  useEffect(() => {
    const handleLocationRouting = () => {
      const rawHash = window.location.hash.toLowerCase().replace('#', '');
      const params = new URLSearchParams(window.location.search);

      // 1. Direct tracking parameter deep-links
      const trackParam = params.get('track') || params.get('repair');
      if (trackParam) {
        setTrackingRepairRef(trackParam);
        setActiveTab('repair-track');
        return;
      }

      // 2. Auth modal triggers
      if (rawHash === 'login' || rawHash === 'signin' || rawHash === 'auth' || params.get('auth') === 'signin' || params.get('login') === 'true') {
        setCustomerAuthModal({ isOpen: true, mode: 'signin' });
      } else if (rawHash === 'signup' || rawHash === 'register' || params.get('auth') === 'signup') {
        setCustomerAuthModal({ isOpen: true, mode: 'signup' });
      } else if (rawHash === 'admin') {
        setIsAdminOpen(true);
      } else if (['home', 'shop', 'repair-book', 'repair-track', 'order-track', 'contact', 'account'].includes(rawHash)) {
        setActiveTab(rawHash);
      }
    };

    handleLocationRouting();
    window.addEventListener('hashchange', handleLocationRouting);
    return () => window.removeEventListener('hashchange', handleLocationRouting);
  }, []);

  // Update URL hash when tab changes so browser refresh and back/forward buttons work
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (window.location.hash.replace('#', '') !== tab) {
      window.location.hash = `#${tab}`;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Show button after user scrolls past 300px
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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

  // Filtered and Sorted products for the Shop tab using multi-token relevance engine
  const filteredProducts = useMemo(() => {
    let list = products;

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((prod) => prod.category === selectedCategory);
    }

    // 2. Stock Filter
    if (onlyInStock) {
      list = list.filter((prod) => prod.inStock && prod.stock > 0);
    }

    // 3. Max Price Filter
    list = list.filter((prod) => prod.price <= maxPrice);

    // 4. Multi-token, Specification-aware Search & Relevance Ranking
    if (searchQuery.trim() !== '') {
      list = searchAndRankProducts(list, searchQuery);
    } else {
      // Standard Sort Order when not searching
      list = [...list].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
    }

    return list;
  }, [products, selectedCategory, searchQuery, onlyInStock, maxPrice, sortBy]);

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const bestSellers = products.slice().sort((a, b) => b.reviewsCount - a.reviewsCount).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F3F7FC] flex flex-col text-[#10264D] font-sans selection:bg-[#075CE5] selection:text-white">
      {/* Navigation Bar with Live Jumia-style Search */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenCustomerAuth={(mode = 'signin') => setCustomerAuthModal({ isOpen: true, mode })}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 sm:space-y-10">
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-8 sm:space-y-10">
            {/* 1. Promotional Hero Banner */}
            <HeroBanner
              onExploreDeals={() => {
                setSelectedCategory('all');
                setActiveTab('shop');
              }}
              onBookRepair={() => setActiveTab('repair-book')}
            />

            {/* 2. Product Categories directly below Hero Banner */}
            <CategoryGrid onSelectCategory={handleSelectCategory} />

            {/* 3. Flash Sales with Countdown */}
            <FlashSales
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onViewAllFlashDeals={() => {
                setSelectedCategory('all');
                setActiveTab('shop');
              }}
            />

            {/* 4. Dedicated Repair Callout Card */}
            <div className="bg-[#082B62] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#E5ECF5] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 space-y-2 max-w-xl text-left">
                <span className="text-xs uppercase font-black tracking-widest text-[#FF7900] block">
                  Same-Day Repair Engineering
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                  Need Your iPhone, Samsung, or Laptop Repaired?
                </h3>
                <p className="text-xs sm:text-sm text-[#DCEBFF] leading-relaxed">
                  Fast screen replacements, original batteries, charging port repair, and water damage recovery. Walk in today opposite Adeyemi College, Ondo.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('repair-book')}
                    className="px-6 py-2.5 bg-[#FF7900] hover:bg-[#e06b00] text-white font-bold text-xs sm:text-sm rounded-full transition shadow-sm flex items-center cursor-pointer"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Book Free Diagnostics
                  </button>
                  <button
                    onClick={() => setActiveTab('repair-track')}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-full transition border border-white/20 cursor-pointer"
                  >
                    Track Existing Repair Ticket
                  </button>
                </div>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto bg-[#0b387e] p-4 rounded-2xl border border-white/10 text-xs space-y-2 text-left">
                <span className="font-bold text-[#FF7900] block text-xs">Ondo Service Center:</span>
                <p className="text-[#DCEBFF] font-medium">{STORE_LOCATION}</p>
                <p className="text-white font-bold">Call/WhatsApp: {STORE_PHONE}</p>
                <div className="pt-1 text-[11px] text-emerald-300 font-semibold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  90-Day Warranty on Replaced Parts
                </div>
              </div>
            </div>

            {/* Featured Products Showcase */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#10264D] tracking-tight flex items-center gap-2">
                    Featured Gadgets &amp; Hot Arrivals
                    <Sparkles className="w-4 h-4 text-[#FF7900]" />
                  </h2>
                  <p className="text-xs text-[#718096]">
                    Hand-picked top tier smartphones, laptops, and certified electronics
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setActiveTab('shop');
                  }}
                  className="text-xs font-bold text-[#075CE5] hover:text-[#064ec4] transition flex items-center cursor-pointer"
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
                  <h2 className="text-xl sm:text-2xl font-black text-[#10264D] tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#075CE5]" />
                    Best Sellers &amp; Student Essentials
                  </h2>
                  <p className="text-xs text-[#718096]">
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
            <div className="bg-white rounded-2xl border border-[#E5ECF5] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#FF7900] uppercase tracking-wider block">
                  Catalog &bull;{' '}
                  {selectedCategory === 'all'
                    ? 'All Categories'
                    : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#10264D] mt-0.5">
                  {selectedCategory === 'all' ? 'All Gadgets & Accessories' : CATEGORIES.find((c) => c.id === selectedCategory)?.label}
                </h1>
                <p className="text-xs text-[#718096] mt-1">
                  Showing {filteredProducts.length} items with authentic Nigerian store warranty
                </p>
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#718096]">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-[#E5ECF5] rounded-xl bg-white text-[#10264D] font-medium focus:outline-hidden focus:border-[#075CE5]"
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
                className={`px-3.5 py-2 rounded-full shrink-0 transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#075CE5] text-white shadow-sm'
                    : 'bg-white border border-[#E5ECF5] text-[#10264D] hover:bg-[#F3F7FC]'
                }`}
              >
                All Products ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-full shrink-0 transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#075CE5] text-white shadow-sm'
                      : 'bg-white border border-[#E5ECF5] text-[#10264D] hover:bg-[#F3F7FC]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Active Search Query Status Bar */}
            {searchQuery.trim() !== '' && (
              <div className="bg-[#DCEBFF] border border-[#075CE5]/20 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center space-x-3 text-xs text-[#082B62]">
                  <div className="w-8 h-8 rounded-xl bg-[#075CE5] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#718096] block">Search Results for:</span>
                    <span className="text-sm font-black text-[#10264D]">
                      "{searchQuery}" <span className="text-xs font-bold text-[#075CE5]">({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found)</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-1.5 bg-white hover:bg-[#F3F7FC] text-[#075CE5] border border-[#E5ECF5] text-xs font-bold rounded-xl flex items-center space-x-1.5 transition shadow-2xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear Search</span>
                  </button>
                </div>
              </div>
            )}

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
              <div className="bg-white rounded-3xl border border-[#E5ECF5] p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Search className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-black text-[#10264D] text-lg sm:text-xl">
                    {searchQuery.trim() ? `No products matching "${searchQuery}"` : 'No products found'}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto leading-relaxed">
                    {searchQuery.trim()
                      ? 'We couldn\'t find any gadget matching your keywords in the active catalogue. If you need this specific phone or model, our store in Ondo can source or verify physical stock for you!'
                      : 'We could not find any products matching your current filters. Try resetting the category or price range.'}
                  </p>
                </div>

                {/* WhatsApp Gadget Request Button */}
                {searchQuery.trim() ? (
                  <div className="space-y-4">
                    <a
                      href={createWhatsAppGadgetRequestUrl(searchQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Request "{searchQuery}" on WhatsApp (Fast Sourcing)</span>
                    </a>

                    {/* Popular Searches Shortcuts */}
                    <div className="pt-4 border-t border-[#E5ECF5] space-y-2">
                      <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
                        Popular Searches in Ondo
                      </span>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {POPULAR_SEARCH_TERMS.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setSearchQuery(term);
                              setSelectedCategory('all');
                            }}
                            className="text-xs font-semibold bg-[#F3F7FC] hover:bg-[#DCEBFF] hover:text-[#075CE5] text-[#10264D] px-3 py-1.5 rounded-xl border border-[#E5ECF5] transition cursor-pointer"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setOnlyInStock(false);
                      setMaxPrice(2000000);
                    }}
                    className="px-5 py-2.5 bg-[#075CE5] text-white text-xs font-bold rounded-xl hover:bg-[#064ec4] transition cursor-pointer shadow-xs"
                  >
                    Reset All Filters &amp; View All Products
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: GADGET REPAIR BOOKING */}
        {activeTab === 'repair-book' && (
          <RepairBookingView
            onTrackSubmittedRepair={handleTrackSubmittedRepair}
            onRequireLogin={() => setCustomerAuthModal({ isOpen: true, mode: 'signin' })}
          />
        )}

        {/* VIEW 4: GADGET REPAIR TRACKING */}
        {activeTab === 'repair-track' && (
          <RepairTrackingView initialRefId={trackingRepairRef} />
        )}

        {/* VIEW 5: CUSTOMER ORDER TRACKING */}
        {activeTab === 'order-track' && <OrderTrackingView />}

        {/* VIEW 6: CONTACT & STORE LOCATION */}
        {activeTab === 'contact' && <ContactView />}

        {/* VIEW 7: CUSTOMER ACCOUNT DASHBOARD */}
        {activeTab === 'account' && (
          <CustomerAccountView
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTrackRepair={(refId) => {
              setTrackingRepairRef(refId);
              setActiveTab('repair-track');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onTrackOrder={(orderId) => {
              setActiveTab('order-track');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenLogin={() => setCustomerAuthModal({ isOpen: true, mode: 'signin' })}
          />
        )}

        {/* VIEW 8: DEDICATED LOGIN / REGISTRATION VIEW */}
        {activeTab === 'login' && (
          <div className="py-2 sm:py-6 flex items-center justify-center">
            <CustomerAuthModal
              isOpen={true}
              isEmbedded={true}
              onClose={() => setActiveTab('home')}
              onSuccess={() => setActiveTab('home')}
            />
          </div>
        )}
      </div>

      {/* Floating Action Buttons (WhatsApp & Scroll to Top matching reference image) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end space-y-2.5 pointer-events-none">
        {/* Floating Scroll to Top Button (Royal Blue #075CE5) */}
        <button
          onClick={scrollToTop}
          className={`pointer-events-auto w-11 h-11 rounded-full bg-[#075CE5] hover:bg-[#064ec4] text-white shadow-xl border border-white/20 transition-all duration-300 transform flex items-center justify-center group ${
            showScrollTop
              ? 'opacity-100 translate-y-0 scale-100 cursor-pointer'
              : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
          }`}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform stroke-[2.5]" />
        </button>

        {/* Floating WhatsApp Quick Action Button (Vibrant WhatsApp Green #25D366) */}
        <a
          href={createWhatsAppUrl('Hello ICONTECH, I am on your website and would like assistance with gadgets or repairs.')}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto bg-[#25D366] hover:bg-[#20bd5a] text-white p-3 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-105 group border border-white/20 cursor-pointer"
          aria-label="WhatsApp Support"
        >
          <MessageCircle className="w-6 h-6 fill-white text-white" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold group-hover:ml-2">
            Chat with ICONTECH
          </span>
        </a>
      </div>

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
        onOpenCustomerAuth={(mode) => setCustomerAuthModal({ isOpen: true, mode: mode || 'signin' })}
      />

      {/* Customer Authentication Modal (Sign In / Create Account) */}
      <CustomerAuthModal
        isOpen={customerAuthModal.isOpen}
        initialMode={customerAuthModal.mode}
        onClose={() => setCustomerAuthModal((prev) => ({ ...prev, isOpen: false }))}
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
    <ErrorBoundary fallbackTitle="ICONTECH Gadget Storefront">
      <AuthProvider>
        <CartProvider>
          <Storefront />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
