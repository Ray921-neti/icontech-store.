import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Wrench, 
  Package, 
  ShieldCheck, 
  Clock, 
  MessageCircle, 
  Heart 
} from 'lucide-react';
import { STORE_NAME, STORE_LOCATION, STORE_PHONE, createWhatsAppUrl } from '../utils/formatters';
import { ProductCategory } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigate,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-slate-950 text-white mt-16 border-t border-slate-800">
      {/* Upper features bar */}
      <div className="border-b border-slate-800/80 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-600/20 text-orange-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Physical Showroom</h4>
              <p className="text-gray-400 mt-0.5">{STORE_LOCATION}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Call &amp; WhatsApp</h4>
              <p className="text-gray-400 mt-0.5">{STORE_PHONE}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Expert Diagnostics</h4>
              <p className="text-gray-400 mt-0.5">Same-day screen &amp; battery replacements</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Genuine Warranty</h4>
              <p className="text-gray-400 mt-0.5">Authentic gadgets with store guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 text-xs">
        {/* Brand column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-lg text-white">
              IC
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              ICON<span className="text-orange-500">TECH</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
            Ondo State's leading hub for genuine smartphones, MacBooks, laptops, heavy-duty power banks, audio gadgets, and professional hardware repair engineering.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <a
              href={createWhatsAppUrl('Hello ICONTECH, I would like to inquire about gadget sales and repair services.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-xs shadow-md"
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              Chat on WhatsApp
            </a>
            <a
              href={`tel:${STORE_PHONE}`}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold transition text-xs"
            >
              Call {STORE_PHONE}
            </a>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-black text-white text-xs uppercase tracking-wider">
            Popular Categories
          </h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button
                onClick={() => onSelectCategory('smartphones')}
                className="hover:text-orange-400 transition"
              >
                Smartphones (iPhones &amp; Galaxy)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('laptops')}
                className="hover:text-orange-400 transition"
              >
                Laptops &amp; MacBooks
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('powerbanks')}
                className="hover:text-orange-400 transition"
              >
                Heavy Duty Power Banks
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('chargers')}
                className="hover:text-orange-400 transition"
              >
                GaN Fast Chargers &amp; Cables
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('earpieces')}
                className="hover:text-orange-400 transition"
              >
                AirPods &amp; Wireless Audio
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Services & Repair */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-black text-white text-xs uppercase tracking-wider">
            Repair &amp; Support Hub
          </h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button
                onClick={() => onNavigate('repair-book')}
                className="hover:text-orange-400 transition flex items-center"
              >
                <Wrench className="w-3.5 h-3.5 mr-1 text-orange-500" />
                Book Gadget Repair
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('repair-track')}
                className="hover:text-orange-400 transition flex items-center"
              >
                <Wrench className="w-3.5 h-3.5 mr-1 text-blue-400" />
                Track Repair Status
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('order-track')}
                className="hover:text-orange-400 transition flex items-center"
              >
                <Package className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Track Order Delivery
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-orange-400 transition flex items-center"
              >
                <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
                Visit Store (Opposite Adeyemi)
              </button>
            </li>
          </ul>
        </div>

        {/* Store Hours & Admin */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="font-black text-white text-xs uppercase tracking-wider">
            Store Hours
          </h4>
          <div className="text-gray-400 space-y-1">
            <p>Mon - Sat: 8:00am - 7:00pm</p>
            <p>Sunday: 12:00pm - 5:00pm</p>
            <p className="text-[11px] text-gray-500 pt-1">
              Opposite Adeyemi College, Ondo City
            </p>
          </div>

          <div className="pt-3">
            <button
              onClick={onOpenAdmin}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Staff / Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 py-4 px-4 text-center text-[11px] text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ICONTECH Electronics &amp; Repair Hub. All rights reserved.</span>
          <span className="flex items-center">
            Built for Nigerian Tech Enthusiasts in Ondo State
          </span>
        </div>
      </div>
    </footer>
  );
};
