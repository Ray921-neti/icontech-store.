import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Headphones 
} from 'lucide-react';

interface HeroBannerProps {
  onExploreDeals: () => void;
  onBookRepair: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreDeals, onBookRepair }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: 'ICONTECH',
      headingLine1: 'Your One-Stop',
      headingLine2: 'Gadget Store',
      tagline: 'Buy • Repair • Upgrade',
      description: 'Top brands. Great prices. Excellent service.',
      ctaText: 'Shop Now',
      action: onExploreDeals,
    },
    {
      badge: 'EXPERT LAB',
      headingLine1: 'Fast & Reliable',
      headingLine2: 'Gadget Repairs',
      tagline: 'Same-Day Diagnostics',
      description: 'Screen, battery, and motherboard engineering in Ondo.',
      ctaText: 'Book Diagnostics',
      action: onBookRepair,
    },
    {
      badge: 'MEGA POWER',
      headingLine1: 'Heavy-Duty',
      headingLine2: 'Power Banks',
      tagline: 'Stay Powered 24/7',
      description: '40,000mAh monster batteries with fast GaN chargers.',
      ctaText: 'View Power Banks',
      action: onExploreDeals,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#E5ECF5] shadow-sm bg-gradient-to-r from-[#E8F1FC] via-[#F1F6FD] to-[#FFFFFF] min-h-[420px] md:min-h-[460px] flex items-center">
      {/* Background Soft Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#DCEBFF]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-72 h-72 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />

      {/* Main Grid: Content (Left) + Device Showcase & Trust Highlights (Right) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Headlines & CTA */}
        <div className="lg:col-span-5 space-y-4 text-left">
          {/* Orange Brand Badge */}
          <div>
            <span className="inline-block bg-[#FF7900] text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
              {slide.badge}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-black tracking-tight leading-[1.08]">
            <span className="text-[#082B62] block">{slide.headingLine1}</span>
            <span className="text-[#075CE5] block">{slide.headingLine2}</span>
          </h1>

          {/* Subtitle & Tagline */}
          <div className="space-y-1">
            <p className="text-xl sm:text-2xl font-bold text-[#082B62] tracking-tight">
              {slide.tagline}
            </p>
            <p className="text-sm sm:text-base text-[#718096] font-medium">
              {slide.description}
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <button
              onClick={slide.action}
              className="inline-flex items-center px-7 py-3 rounded-full bg-[#075CE5] hover:bg-[#064ec7] text-white font-bold text-sm shadow-md transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{slide.ctaText}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Center / Right: Gadgets Showcase & Trust Highlights */}
        <div className="lg:col-span-7 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          {/* Gadget Showcase on circular platform */}
          <div className="relative flex-1 flex items-center justify-center w-full min-h-[260px] sm:min-h-[300px]">
            {/* White pedestal ring/shadow */}
            <div className="absolute bottom-2 w-72 sm:w-96 h-20 bg-gradient-to-t from-[#DCEBFF]/80 to-transparent rounded-[100%] blur-md" />
            <div className="absolute bottom-6 w-64 sm:w-80 h-10 bg-white/90 rounded-[100%] shadow-md border border-white/80" />

            {/* Composite Device Display */}
            <div className="relative z-10 w-full max-w-[460px] flex items-center justify-center">
              {/* Device Layout Arrangement */}
              <div className="relative w-full h-[250px] sm:h-[280px] flex items-center justify-center">
                {/* 1. Slim Modern Laptop in center-back */}
                <div className="absolute bottom-8 z-10 w-64 sm:w-72 transform -translate-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=80"
                    alt="Laptop"
                    className="w-full h-auto object-contain drop-shadow-xl rounded-lg"
                  />
                </div>

                {/* 2. Premium Smartphone on left */}
                <div className="absolute bottom-6 left-2 sm:left-4 z-20 w-24 sm:w-28 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80"
                    alt="Smartphone"
                    className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
                  />
                </div>

                {/* 3. AirPods Pro in open charging case in center-front */}
                <div className="absolute bottom-3 z-30 w-20 sm:w-24 transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=80"
                    alt="AirPods"
                    className="w-full h-auto object-contain drop-shadow-lg rounded-xl"
                  />
                </div>

                {/* 4. Smartwatch with colorful screen face */}
                <div className="absolute bottom-4 right-16 sm:right-24 z-25 w-16 sm:w-20 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80"
                    alt="Smartwatch"
                    className="w-full h-auto object-contain drop-shadow-xl rounded-xl"
                  />
                </div>

                {/* 5. Over-Ear Headphones on far right */}
                <div className="absolute bottom-6 -right-2 sm:right-2 z-20 w-24 sm:w-32 transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80"
                    alt="Headphones"
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Far Right: Three Stacked Trust / Service Highlights */}
          <div className="w-full sm:w-56 shrink-0 flex flex-col space-y-2.5 z-20">
            {/* Highlight 1: Trusted Store */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E5ECF5] shadow-xs flex items-center space-x-3 transition hover:shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#075CE5] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight text-left">
                <h4 className="text-xs font-bold text-[#10264D]">Trusted Store</h4>
                <p className="text-[10px] text-[#718096]">Shop with Confidence</p>
              </div>
            </div>

            {/* Highlight 2: Fast Delivery */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E5ECF5] shadow-xs flex items-center space-x-3 transition hover:shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#075CE5] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight text-left">
                <h4 className="text-xs font-bold text-[#10264D]">Fast Delivery</h4>
                <p className="text-[10px] text-[#718096]">Across Nigeria</p>
              </div>
            </div>

            {/* Highlight 3: Expert Support */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E5ECF5] shadow-xs flex items-center space-x-3 transition hover:shadow-md">
              <div className="w-9 h-9 rounded-xl bg-[#075CE5] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight text-left">
                <h4 className="text-xs font-bold text-[#10264D]">Expert Support</h4>
                <p className="text-[10px] text-[#718096]">Always Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/35 hover:bg-slate-900/60 text-white flex items-center justify-center transition shadow-md cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/35 hover:bg-slate-900/60 text-white flex items-center justify-center transition shadow-md cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel Dot Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-6 bg-[#075CE5]' : 'w-2 bg-[#CBD5E1] hover:bg-[#94A3B8]'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
