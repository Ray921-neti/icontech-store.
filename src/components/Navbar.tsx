import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Wrench, 
  Package, 
  Phone, 
  MapPin, 
  Clock, 
  Menu, 
  X,
  User,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Smartphone,
  Laptop,
  Tablet,
  Zap,
  Headphones,
  BatteryCharging,
  Watch,
  Shield,
  Sparkles,
  Grid,
  Home
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { STORE_PHONE, STORE_LOCATION } from '../utils/formatters';
import { ProductCategory } from '../types';
import { CATEGORIES } from '../data/categories';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (cat: ProductCategory | 'all') => void;
  onOpenAdmin: () => void;
  onOpenCustomerAuth: (mode?: 'signin' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenAdmin,
  onOpenCustomerAuth,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAdmin, customerProfile, customerSignOut, isCustomer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'shop') {
      setActiveTab('shop');
    }
  };

  const handleSignOut = async () => {
    await customerSignOut();
    setActiveTab('home');
  };

  const customerFirstName = customerProfile?.name
    ? customerProfile.name.split(' ')[0]
    : 'Customer';

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-4 h-4 text-[#FF7900]" />;
      case 'Laptop': return <Laptop className="w-4 h-4 text-[#075CE5]" />;
      case 'Tablet': return <Tablet className="w-4 h-4 text-[#082B62]" />;
      case 'Zap': return <Zap className="w-4 h-4 text-[#FF7900]" />;
      case 'Headphones': return <Headphones className="w-4 h-4 text-[#075CE5]" />;
      case 'BatteryCharging': return <BatteryCharging className="w-4 h-4 text-[#082B62]" />;
      case 'Watch': return <Watch className="w-4 h-4 text-[#FF7900]" />;
      case 'Shield': return <Shield className="w-4 h-4 text-[#075CE5]" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-[#FF7900]" />;
      default: return <Grid className="w-4 h-4 text-[#082B62]" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* 1. TOP INFORMATION BAR (Deep Navy Blue #082B62) */}
      <div className="bg-[#082B62] text-white text-[11px] sm:text-xs py-2 px-4 border-b border-[#0b387e]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Left: Phone, Location, Opening Hours */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[#DCEBFF]">
            <a 
              href={`tel:${STORE_PHONE}`} 
              className="flex items-center hover:text-white transition font-medium"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5 text-[#FF7900] shrink-0" />
              <span>{STORE_PHONE}</span>
            </a>

            <span className="text-white/30 hidden sm:inline">|</span>

            <span className="hidden md:flex items-center text-[#DCEBFF]">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#FF7900] shrink-0" />
              <span>{STORE_LOCATION}</span>
            </span>

            <span className="text-white/30 hidden lg:inline">|</span>

            <span className="hidden lg:flex items-center text-[#DCEBFF]">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-[#FF7900] shrink-0" />
              <span>Mon – Sat: 8AM – 7PM, Sun: 12PM – 5PM</span>
            </span>
          </div>

          {/* Right: Track Order, Repair Status, Admin/Staff access */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[#DCEBFF] font-medium text-[11px] sm:text-xs">
            <button
              onClick={() => setActiveTab('order-track')}
              className="hover:text-white transition flex items-center hover:underline cursor-pointer"
            >
              Track Order
            </button>

            <span className="text-white/30">|</span>

            <button
              onClick={() => setActiveTab('repair-track')}
              className="hover:text-white transition flex items-center hover:underline cursor-pointer"
            >
              Repair Status
            </button>

            {/* Super Admin badge shortcut - strictly visible ONLY when authenticated as Super Admin */}
            {isAdmin && (
              <>
                <span className="text-white/30 hidden sm:inline">|</span>
                <button
                  onClick={onOpenAdmin}
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-[#FF7900] hover:bg-[#e66c00] text-white text-[10px] font-bold transition cursor-pointer"
                  title="Super Admin Dashboard"
                >
                  <ShieldCheck className="w-3 h-3 mr-1 text-white" />
                  <span>Admin Hub</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Clean White Background #FFFFFF) */}
      <div className="bg-[#FFFFFF] py-3.5 px-4 border-b border-[#E5ECF5]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo on Left */}
          <button 
            onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }} 
            className="flex flex-col text-left focus:outline-hidden cursor-pointer shrink-0"
          >
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-[#FF7900]">
                ICON
              </span>
              <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-[#082B62]">
                TECH
              </span>
            </div>
            <span className="text-[10px] italic font-semibold text-[#718096] -mt-1 tracking-tight">
              ...Smart Tech, Better Life
            </span>
          </button>

          {/* Large Center Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-2xl relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for gadgets, phones, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 rounded-full border border-[#E5ECF5] bg-[#F3F7FC] text-[#10264D] text-xs sm:text-sm focus:bg-white focus:border-[#075CE5] focus:ring-2 focus:ring-[#DCEBFF] focus:outline-hidden transition placeholder:text-[#718096]"
              />
              <Search className="w-4 h-4 text-[#718096] absolute left-4 top-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 bottom-1 px-5 bg-[#075CE5] hover:bg-[#064ec7] text-white font-bold text-xs rounded-full transition shadow-xs cursor-pointer flex items-center justify-center"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Controls: Account & Shopping Cart */}
          <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
            {/* Customer Account / Sign In */}
            {isCustomer && customerProfile ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('account')}
                  className="flex items-center space-x-2 text-left hover:opacity-90 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#DCEBFF] text-[#082B62] flex items-center justify-center font-black text-xs border border-[#E5ECF5]">
                    <User className="w-4 h-4 text-[#082B62]" />
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <span className="text-[10px] text-[#718096] block">Hello,</span>
                    <span className="text-xs font-bold text-[#10264D] block truncate max-w-[100px]">
                      {customerFirstName}
                    </span>
                  </div>
                </button>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex text-[#718096] hover:text-[#082B62] p-1 rounded-lg"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenCustomerAuth('signin')}
                className="flex items-center space-x-2 text-left hover:opacity-90 transition cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-[#F3F7FC] group-hover:bg-[#DCEBFF] text-[#082B62] flex items-center justify-center transition border border-[#E5ECF5]">
                  <User className="w-4 h-4 text-[#082B62]" />
                </div>
                <div className="hidden sm:block leading-tight text-left">
                  <span className="text-xs font-bold text-[#10264D] block group-hover:text-[#075CE5]">
                    Sign In
                  </span>
                  <span className="text-[10px] text-[#718096] block">
                    Create Account
                  </span>
                </div>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2 text-[#082B62] hover:text-[#075CE5] transition cursor-pointer group"
              aria-label="Shopping Cart"
            >
              <div className="relative p-1">
                <ShoppingCart className="w-7 h-7 text-[#082B62] group-hover:text-[#075CE5] transition" />
                <span className="absolute -top-1 -right-1 bg-[#FF7900] text-white font-black text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              </div>
              <span className="hidden sm:inline font-bold text-xs text-[#10264D] group-hover:text-[#075CE5]">
                Cart
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-[#082B62] rounded-lg hover:bg-[#F3F7FC]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row (When on small screens) */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search gadgets, phones, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-full border border-[#E5ECF5] bg-[#F3F7FC] text-[#10264D] text-xs focus:outline-hidden focus:border-[#075CE5]"
            />
            <Search className="w-4 h-4 text-[#718096] absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-[#075CE5] text-white text-xs rounded-full font-bold"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* 3. NAVIGATION BAR (Deep Navy Blue #082B62) */}
      <nav className="bg-[#082B62] text-white px-4 border-t border-[#0a3577] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-12">
          {/* Left: All Categories Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="h-9 px-4 rounded-lg bg-[#075CE5] hover:bg-[#064ec7] text-white font-bold text-xs flex items-center space-x-2 transition shadow-xs cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Categories Dropdown Floating Panel */}
            {categoriesDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setCategoriesDropdownOpen(false)} 
                />
                <div className="absolute left-0 top-11 w-64 bg-white rounded-xl shadow-2xl border border-[#E5ECF5] py-2 z-40 text-[#10264D] animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#718096] border-b border-[#E5ECF5]">
                    Browse Catalog
                  </div>
                  <div className="max-h-[380px] overflow-y-auto py-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setActiveTab('shop');
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-[#F3F7FC] hover:text-[#075CE5] transition flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <Grid className="w-4 h-4 mr-2.5 text-[#082B62]" />
                        All Products
                      </span>
                      <span className="text-[10px] text-[#718096]">View all</span>
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveTab('shop');
                          setCategoriesDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs font-medium hover:bg-[#F3F7FC] transition flex items-center justify-between ${
                          selectedCategory === cat.id ? 'text-[#075CE5] font-bold bg-[#DCEBFF]/40' : 'text-[#10264D]'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="mr-2.5">{getCategoryIcon(cat.iconName)}</span>
                          {cat.label}
                        </span>
                        <span className="text-[10px] text-[#718096]">{cat.itemCount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Center Links: Home, Repairs, Track Order, Contact */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'home' 
                  ? 'bg-white/15 text-white font-bold' 
                  : 'text-[#DCEBFF] hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#DCEBFF]" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveTab('repair-book')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'repair-book' 
                  ? 'bg-white/15 text-white font-bold' 
                  : 'text-[#DCEBFF] hover:text-white hover:bg-white/10'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Repairs</span>
            </button>

            <button
              onClick={() => setActiveTab('order-track')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'order-track' 
                  ? 'bg-white/15 text-white font-bold' 
                  : 'text-[#DCEBFF] hover:text-white hover:bg-white/10'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#DCEBFF]" />
              <span>Track Order</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'contact' 
                  ? 'bg-white/15 text-white font-bold' 
                  : 'text-[#DCEBFF] hover:text-white hover:bg-white/10'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#DCEBFF]" />
              <span>Contact</span>
            </button>
          </div>

          {/* Right: Orange "Book a Repair" Button */}
          <div className="flex items-center">
            <button
              onClick={() => setActiveTab('repair-book')}
              className="h-9 px-4 sm:px-5 rounded-full bg-[#FF7900] hover:bg-[#e06b00] text-white font-black text-xs flex items-center space-x-1.5 transition shadow-md cursor-pointer transform hover:scale-[1.02]"
            >
              <Wrench className="w-3.5 h-3.5 mr-1" />
              <span>Book a Repair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5ECF5] px-4 py-4 space-y-4 text-[#10264D] animate-in fade-in shadow-xl">
          {/* Mobile Profile State */}
          {isCustomer && customerProfile ? (
            <div className="p-3 bg-[#F3F7FC] border border-[#E5ECF5] rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-[#075CE5] text-white flex items-center justify-center font-bold text-xs">
                  {customerFirstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-[#10264D] text-xs block">{customerProfile.name}</span>
                  <span className="text-[10px] text-[#718096]">{customerProfile.phone}</span>
                </div>
              </div>
              <button
                onClick={() => { setActiveTab('account'); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-[#075CE5] hover:underline"
              >
                Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenCustomerAuth('signin'); setMobileMenuOpen(false); }}
                className="py-2.5 text-center text-xs font-bold rounded-xl border border-[#E5ECF5] bg-white text-[#10264D]"
              >
                Sign In
              </button>
              <button
                onClick={() => { onOpenCustomerAuth('signup'); setMobileMenuOpen(false); }}
                className="py-2.5 text-center text-xs font-bold rounded-xl bg-[#075CE5] text-white shadow-xs"
              >
                Create Account
              </button>
            </div>
          )}

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('home'); setSelectedCategory('all'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-left border flex items-center space-x-2 ${
                activeTab === 'home' ? 'bg-[#DCEBFF] border-[#075CE5] text-[#075CE5]' : 'border-[#E5ECF5] bg-white'
              }`}
            >
              <span>🏠 Home</span>
            </button>
            <button
              onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-left border flex items-center space-x-2 ${
                activeTab === 'shop' ? 'bg-[#DCEBFF] border-[#075CE5] text-[#075CE5]' : 'border-[#E5ECF5] bg-white'
              }`}
            >
              <span>🛍️ All Products</span>
            </button>
            <button
              onClick={() => { setActiveTab('repair-book'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-left border flex items-center space-x-2 ${
                activeTab === 'repair-book' ? 'bg-[#FF7900]/15 border-[#FF7900] text-[#FF7900]' : 'border-[#E5ECF5] bg-white'
              }`}
            >
              <span>🔧 Book Repair</span>
            </button>
            <button
              onClick={() => { setActiveTab('repair-track'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-left border flex items-center space-x-2 ${
                activeTab === 'repair-track' ? 'bg-[#DCEBFF] border-[#075CE5] text-[#075CE5]' : 'border-[#E5ECF5] bg-white'
              }`}
            >
              <span>📋 Track Repair</span>
            </button>
            <button
              onClick={() => { setActiveTab('order-track'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-left border flex items-center space-x-2 ${
                activeTab === 'order-track' ? 'bg-[#DCEBFF] border-[#075CE5] text-[#075CE5]' : 'border-[#E5ECF5] bg-white'
              }`}
            >
              <span>📦 Track Order</span>
            </button>
            <button
              onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl text-left border flex items-center space-x-2 ${
                activeTab === 'contact' ? 'bg-[#DCEBFF] border-[#075CE5] text-[#075CE5]' : 'border-[#E5ECF5] bg-white'
              }`}
            >
              <span>📍 Contact Store</span>
            </button>
          </div>

          {/* Quick Categories Bar in Mobile */}
          <div className="pt-2 border-t border-[#E5ECF5]">
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-2">
              Popular Categories
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveTab('shop');
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs bg-[#F3F7FC] hover:bg-[#DCEBFF] rounded-lg text-[#10264D] border border-[#E5ECF5]"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
