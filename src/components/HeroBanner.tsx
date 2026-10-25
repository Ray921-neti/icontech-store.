import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  Truck, 
  Zap, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

interface HeroBannerProps {
  onExploreDeals: () => void;
  onBookRepair: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreDeals, onBookRepair }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'ICONTECH Gadget Mega Deals',
      subtitle: 'Premium Smartphones, MacBooks & Accessories at Unbeatable Nigerian Naira Prices',
      badge: 'JUMIA & TEMU STYLE FLASH SALE',
      ctaText: 'Shop Hot Gadgets',
      bgGradient: 'from-orange-600 via-amber-600 to-rose-700',
      action: onExploreDeals,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Expert Gadget Repair Center',
      subtitle: 'Cracked screen? Dead battery? Water damage? Professional diagnostics opposite Adeyemi College, Ondo.',
      badge: 'SAME-DAY REPAIR SERVICE',
      ctaText: 'Book Free Diagnostic',
      bgGradient: 'from-blue-700 via-indigo-700 to-slate-900',
      action: onBookRepair,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Heavy Duty 40,000mAh Power Banks',
      subtitle: 'Keep your laptops and smartphones alive through any power outages with fast GaN chargers.',
      badge: 'TOP SELLER IN ONDO',
      ctaText: 'View Power Solutions',
      bgGradient: 'from-emerald-700 via-teal-700 to-slate-900',
      action: onExploreDeals,
      image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="space-y-4">
      {/* Main Hero Slider */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[340px] md:min-h-[380px] text-white flex items-center">
        {/* Background gradient transition */}
        <div className={`absolute inset-0 bg-linear-to-r ${slide.bgGradient} transition-all duration-700`} />
        
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wider bg-white/20 backdrop-blur-xs text-amber-200 uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
              {slide.badge}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              {slide.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-100 max-w-xl font-normal leading-relaxed drop-shadow-xs">
              {slide.subtitle}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={slide.action}
                className="px-6 py-3 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-amber-300 hover:text-slate-950 transition transform hover:-translate-y-0.5 shadow-lg flex items-center"
              >
                {slide.ctaText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={onBookRepair}
                className="px-6 py-3 rounded-full bg-slate-900/60 backdrop-blur-md text-white border border-white/30 font-bold text-sm hover:bg-slate-900/90 transition flex items-center"
              >
                <Wrench className="w-4 h-4 mr-2 text-orange-400" />
                Repair Phone/Laptop
              </button>
            </div>
          </div>

          <div className="hidden md:flex md:col-span-5 justify-center relative">
            <div className="relative w-72 h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform rotate-1 hover:rotate-0 transition duration-500">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-xs bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-center font-medium">
                📍 Opposite Adeyemi, Ondo • 07039420600
              </div>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentSlide ? 'w-8 bg-amber-400' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust & Value Props Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Genuine Guarantee</h4>
            <p className="text-[11px] text-gray-500">100% authentic tech with warranty</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Expert Repair Lab</h4>
            <p className="text-[11px] text-gray-500">Fast repair opposite Adeyemi</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Ondo Campus Pickup</h4>
            <p className="text-[11px] text-gray-500">In-store pickup &amp; delivery</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Nigerian Naira (₦)</h4>
            <p className="text-[11px] text-gray-500">Direct transfer or cash on pickup</p>
          </div>
        </div>
      </div>
    </div>
  );
};
