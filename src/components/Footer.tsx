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
  Heart,
  User 
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
    <footer className="bg-[#082B62] text-white mt-16 border-t border-[#0b387e]">
      {/* Upper features bar */}
      <div className="border-b border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-[#FF7900] shrink-0 border border-white/10">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Physical Showroom</h4>
              <p className="text-[#DCEBFF] mt-0.5">{STORE_LOCATION}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-emerald-400 shrink-0 border border-white/10">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Instant Call &amp; WhatsApp</h4>
              <p className="text-[#DCEBFF] mt-0.5">{STORE_PHONE}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-[#075CE5] shrink-0 border border-white/10">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Expert Diagnostics</h4>
              <p className="text-[#DCEBFF] mt-0.5">Same-day screen &amp; battery replacements</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-amber-400 shrink-0 border border-white/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Genuine Warranty</h4>
              <p className="text-[#DCEBFF] mt-0.5">Authentic gadgets with store guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer links */}
      <div className="max-w-7xl mx-auto py-12 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 text-xs">
        {/* Brand column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="text-2xl font-black italic tracking-tighter flex items-center">
              <span className="text-[#FF7900]">ICON</span>
              <span className="text-white">TECH</span>
            </div>
          </div>
          <p className="text-[11px] text-[#DCEBFF]/80 italic font-medium -mt-2">
            ...Smart Tech, Better Life
          </p>
          <p className="text-[#DCEBFF] text-xs leading-relaxed max-w-sm">
            Ondo State's leading hub for genuine smartphones, MacBooks, laptops, heavy-duty power banks, audio gadgets, and professional hardware repair engineering.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            <a
              href={createWhatsAppUrl('Hello ICONTECH, I would like to inquire about gadget sales and repair services.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition text-xs shadow-md"
            >
              <MessageCircle className="w-4 h-4 mr-1.5 fill-white text-white" />
              Chat on WhatsApp
            </a>
            <a
              href={`tel:${STORE_PHONE}`}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition text-xs border border-white/20"
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
          <ul className="space-y-2 text-[#DCEBFF]">
            <li>
              <button
                onClick={() => onSelectCategory('smartphones')}
                className="hover:text-[#FF7900] transition cursor-pointer"
              >
                Smartphones (iPhones &amp; Galaxy)
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('laptops')}
                className="hover:text-[#FF7900] transition cursor-pointer"
              >
                Laptops &amp; MacBooks
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('powerbanks')}
                className="hover:text-[#FF7900] transition cursor-pointer"
              >
                Heavy Duty Power Banks
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('chargers')}
                className="hover:text-[#FF7900] transition cursor-pointer"
              >
                GaN Fast Chargers &amp; Cables
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('earpieces')}
                className="hover:text-[#FF7900] transition cursor-pointer"
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
          <ul className="space-y-2 text-[#DCEBFF]">
            <li>
              <button
                onClick={() => onNavigate('repair-book')}
                className="hover:text-[#FF7900] transition flex items-center cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 mr-1 text-[#FF7900]" />
                Book Gadget Repair
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('repair-track')}
                className="hover:text-[#FF7900] transition flex items-center cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 mr-1 text-[#DCEBFF]" />
                Track Repair Status
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('order-track')}
                className="hover:text-[#FF7900] transition flex items-center cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Track Order Delivery
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('account')}
                className="hover:text-[#FF7900] transition flex items-center cursor-pointer"
              >
                <User className="w-3.5 h-3.5 mr-1 text-[#FF7900]" />
                Customer Account &amp; Orders
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-[#FF7900] transition flex items-center cursor-pointer"
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
          <div className="text-[#DCEBFF] space-y-1">
            <p>Mon - Sat: 8:00am - 7:00pm</p>
            <p>Sunday: 12:00pm - 5:00pm</p>
            <p className="text-[11px] text-[#DCEBFF]/70 pt-1">
              Opposite Adeyemi College, Ondo City
            </p>
          </div>

          <div className="pt-3">
            <span className="inline-flex items-center text-[11px] text-[#DCEBFF]/60 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#FF7900]" />
              Official Verified Electronics Hub
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-4 px-4 text-center text-[11px] text-[#DCEBFF]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} ICONTECH Electronics &amp; Repair Hub. All rights reserved.</span>
          <span className="flex items-center text-[#DCEBFF]">
            Built for Nigerian Tech Enthusiasts in Ondo State
          </span>
        </div>
      </div>
    </footer>
  );
};
