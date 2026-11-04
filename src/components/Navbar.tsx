import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Wrench, 
  Package, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Menu, 
  X,
  Sparkles,
  User,
  MessageCircle,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { STORE_PHONE, STORE_LOCATION, createWhatsAppUrl } from '../utils/formatters';
import { ProductCategory } from '../types';

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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Notification / Contact & Customer Bar (Jumia/Temu style) */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Super Deals &amp; Same-Day Repair Service in Ondo!
            </span>
            <span className="hidden md:inline-flex items-center text-gray-300">
              <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
              {STORE_LOCATION}
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <a 
              href={`tel:${STORE_PHONE}`} 
              className="flex items-center hover:text-amber-400 transition"
            >
              <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span className="hidden sm:inline">Call: </span>{STORE_PHONE}
            </a>

            <a
              href={createWhatsAppUrl('Hello ICONTECH, I would like to inquire about a gadget or repair service.')}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center text-emerald-400 hover:text-emerald-300 transition font-medium"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1" />
              WhatsApp
            </a>

            {/* Desktop Customer Authentication in Top Bar */}
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-700">
              {isCustomer && customerProfile ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('account')}
                    className="flex items-center text-xs font-bold text-orange-400 hover:text-orange-300 transition"
                  >
                    <User className="w-3.5 h-3.5 mr-1" />
                    <span>Hi, {customerFirstName}</span>
                  </button>
                  <span className="text-gray-500">&bull;</span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-white transition flex items-center"
                    title="Sign Out"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenCustomerAuth('signin')}
                    className="text-gray-200 hover:text-orange-400 transition font-medium"
                  >
                    Sign In
                  </button>
                  <span className="text-gray-500">/</span>
                  <button
                    onClick={() => onOpenCustomerAuth('signup')}
                    className="text-orange-400 hover:text-orange-300 transition font-bold"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onOpenAdmin}
              className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-2 py-0.5 rounded transition"
              title="Staff Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
              {isAdmin ? 'Admin' : 'Staff'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }} 
              className="flex items-center text-left focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md font-black text-xl tracking-wider">
                IC
              </div>
              <div className="ml-2.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 block leading-tight">
                  ICON<span className="text-orange-600">TECH</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-gray-500 block">
                  Gadgets &amp; Repair Hub
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar - Center Marketplace Style */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-xl relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search phones, laptops, chargers, AirPods, repairs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-full border-2 border-orange-500 focus:border-orange-600 focus:outline-hidden text-sm bg-gray-50/50"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-5 bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs rounded-full transition shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Links & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Repair Booking CTA */}
            <button
              onClick={() => setActiveTab('repair-book')}
              className={`hidden lg:flex items-center px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'repair-book'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              <Wrench className="w-4 h-4 mr-1.5 text-orange-600" />
              Book Repair
            </button>

            {/* Customer Account Button */}
            {isCustomer && customerProfile ? (
              <button
                onClick={() => setActiveTab('account')}
                className={`hidden sm:flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  activeTab === 'account'
                    ? 'border-orange-600 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-800 hover:border-orange-400 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] mr-1.5 font-black">
                  {customerFirstName.charAt(0).toUpperCase()}
                </div>
                <span>My Account</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenCustomerAuth('signin')}
                className="hidden sm:flex items-center px-3 py-1.5 rounded-xl text-xs font-bold text-gray-800 hover:text-orange-600 hover:bg-orange-50 border border-gray-200 transition"
              >
                <User className="w-4 h-4 mr-1.5 text-gray-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Track Repair */}
            <button
              onClick={() => setActiveTab('repair-track')}
              className={`flex items-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'repair-track'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
              }`}
            >
              <Wrench className="w-4 h-4 mr-1 text-slate-500" />
              <span className="hidden md:inline">Track</span> Repair
            </button>

            {/* Track Order */}
            <button
              onClick={() => setActiveTab('order-track')}
              className={`flex items-center px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'order-track'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4 mr-1 text-slate-500" />
              <span className="hidden md:inline">Track</span> Order
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white font-bold text-[11px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center ring-2 ring-white animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search gadgets, accessories, repair..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 rounded-full border border-orange-400 focus:outline-hidden text-sm bg-gray-50"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-orange-600 text-white text-xs rounded-full font-medium"
            >
              Go
            </button>
          </div>
        </form>

        {/* Navigation Tabs Bar */}
        <nav className="mt-3 hidden md:flex items-center space-x-1 border-t border-gray-100 pt-2 text-xs font-semibold text-gray-700 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'home' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'shop' && selectedCategory === 'all' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-100'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => { setActiveTab('shop'); setSelectedCategory('smartphones'); }}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'shop' && selectedCategory === 'smartphones' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Smartphones
          </button>
          <button
            onClick={() => { setActiveTab('shop'); setSelectedCategory('laptops'); }}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'shop' && selectedCategory === 'laptops' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Laptops
          </button>
          <button
            onClick={() => { setActiveTab('shop'); setSelectedCategory('chargers'); }}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'shop' && selectedCategory === 'chargers' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Chargers &amp; Cables
          </button>
          <button
            onClick={() => { setActiveTab('shop'); setSelectedCategory('powerbanks'); }}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'shop' && selectedCategory === 'powerbanks' ? 'bg-orange-600 text-white' : 'hover:bg-gray-100'
            }`}
          >
            Power Banks
          </button>
          <button
            onClick={() => { setActiveTab('repair-book'); }}
            className={`px-3 py-1.5 rounded-md transition text-orange-600 font-bold ${
              activeTab === 'repair-book' ? 'bg-orange-600 text-white' : 'hover:bg-orange-50'
            }`}
          >
            🛠️ Gadget Repair Center
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'contact' ? 'bg-orange-600 text-white font-bold' : 'hover:bg-gray-100'
            }`}
          >
            Contact &amp; Store Location
          </button>

          {isCustomer && (
            <button
              onClick={() => setActiveTab('account')}
              className={`px-3 py-1.5 rounded-md transition font-bold text-orange-600 ${
                activeTab === 'account' ? 'bg-orange-600 text-white' : 'hover:bg-orange-50'
              }`}
            >
              👤 My Account
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-3">
          {/* Customer Auth Profile Bar in Mobile Menu */}
          {isCustomer && customerProfile ? (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                  {customerFirstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-xs block">{customerProfile.name}</span>
                  <span className="text-[10px] text-gray-500">{customerProfile.phone}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-600 font-bold px-2 py-1 rounded bg-white border border-red-200 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenCustomerAuth('signin');
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-xl bg-gray-100 text-gray-800 font-bold text-xs text-center hover:bg-gray-200"
              >
                Customer Sign In
              </button>
              <button
                onClick={() => {
                  onOpenCustomerAuth('signup');
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-xl bg-orange-600 text-white font-bold text-xs text-center hover:bg-orange-700"
              >
                Create Account
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`p-2 rounded-lg text-left ${activeTab === 'home' ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50'}`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); setMobileMenuOpen(false); }}
              className={`p-2 rounded-lg text-left ${activeTab === 'shop' ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50'}`}
            >
              🛍️ All Products
            </button>
            {isCustomer && (
              <button
                onClick={() => { setActiveTab('account'); setMobileMenuOpen(false); }}
                className={`p-2 rounded-lg text-left col-span-2 ${activeTab === 'account' ? 'bg-orange-600 text-white font-bold' : 'bg-orange-50 text-orange-700 font-bold'}`}
              >
                👤 My Account (Orders &amp; Repairs)
              </button>
            )}
            <button
              onClick={() => { setActiveTab('repair-book'); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg text-left bg-orange-600 text-white font-bold col-span-2 flex items-center justify-center"
            >
              <Wrench className="w-4 h-4 mr-2" /> Book Device Repair
            </button>
            <button
              onClick={() => { setActiveTab('repair-track'); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg text-left bg-gray-50 hover:bg-gray-100"
            >
              🔍 Track Repair Job
            </button>
            <button
              onClick={() => { setActiveTab('order-track'); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg text-left bg-gray-50 hover:bg-gray-100"
            >
              📦 Track My Order
            </button>
            <button
              onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg text-left bg-gray-50 hover:bg-gray-100 col-span-2"
            >
              📍 Contact: Opposite Adeyemi, Ondo
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>Customer Line: <strong>{STORE_PHONE}</strong></span>
            <button 
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="text-orange-600 font-bold hover:underline"
            >
              Staff / Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
