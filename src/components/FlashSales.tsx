import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../utils/formatters';

interface FlashSalesProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewAllFlashDeals: () => void;
}

export const FlashSales: React.FC<FlashSalesProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onViewAllFlashDeals,
}) => {
  // Take up to 5 flash deals to match reference image layout
  const flashProducts = products.filter((p) => p.isFlashDeal).slice(0, 5);

  // Live ticking countdown for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          return { days: 0, hours: 12, minutes: 45, seconds: 30 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <section className="w-full space-y-4">
      {/* Flash Sales Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Navy Pill + Orange Countdown Timer Boxes */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dark Navy-Blue Rounded Flash Sales Heading */}
          <div className="bg-[#082B62] text-white px-5 py-2.5 rounded-full flex items-center space-x-2 shadow-xs">
            <Zap className="w-4 h-4 text-[#FF7900] fill-[#FF7900]" />
            <span className="font-black text-sm sm:text-base tracking-tight text-white">
              Flash Sales
            </span>
          </div>

          {/* Orange Countdown Timer Boxes */}
          <div className="flex items-center space-x-1.5 font-sans">
            {/* Days */}
            <div className="bg-[#FF7900] text-white rounded-lg px-2.5 py-1 text-center min-w-[44px] shadow-xs">
              <span className="font-black text-sm block leading-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-tight block mt-0.5 opacity-90">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="bg-[#FF7900] text-white rounded-lg px-2.5 py-1 text-center min-w-[44px] shadow-xs">
              <span className="font-black text-sm block leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-tight block mt-0.5 opacity-90">
                Hrs
              </span>
            </div>

            {/* Mins */}
            <div className="bg-[#FF7900] text-white rounded-lg px-2.5 py-1 text-center min-w-[44px] shadow-xs">
              <span className="font-black text-sm block leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-tight block mt-0.5 opacity-90">
                Mins
              </span>
            </div>

            {/* Secs */}
            <div className="bg-[#FF7900] text-white rounded-lg px-2.5 py-1 text-center min-w-[44px] shadow-xs">
              <span className="font-black text-sm block leading-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-tight block mt-0.5 opacity-90">
                Secs
              </span>
            </div>
          </div>
        </div>

        {/* Right: View All Deals Link */}
        <div>
          <button
            onClick={onViewAllFlashDeals}
            className="text-[#075CE5] hover:text-[#064ec7] font-bold text-xs sm:text-sm hover:underline flex items-center space-x-1 cursor-pointer transition"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* 5 Product Cards Arranged Horizontally */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {flashProducts.map((product) => {
          const discountPct = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 15;

          return (
            <div
              key={product.id}
              className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF5] hover:border-[#075CE5] shadow-xs hover:shadow-md transition-all duration-200 p-3 sm:p-4 flex flex-col justify-between group relative overflow-hidden text-left"
            >
              {/* Orange Discount Badge on Top-Left */}
              <span className="absolute top-2.5 left-2.5 bg-[#FF7900] text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-xs z-10">
                -{discountPct}%
              </span>

              {/* Product Image Displayed Prominently */}
              <div 
                className="relative w-full h-[140px] sm:h-[155px] flex items-center justify-center p-2 cursor-pointer bg-white"
                onClick={() => onSelectProduct(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Product Title */}
              <div className="mt-2">
                <h3
                  onClick={() => onSelectProduct(product)}
                  className="text-xs sm:text-sm font-bold text-[#10264D] truncate hover:text-[#075CE5] cursor-pointer transition"
                  title={product.name}
                >
                  {product.name}
                </h3>

                {/* Pricing: Crossed-out grey original price + Bold Royal Blue discounted price */}
                <div className="mt-1 flex items-baseline space-x-2 flex-wrap">
                  {product.originalPrice && (
                    <span className="text-[11px] sm:text-xs text-[#718096] line-through font-medium">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-black text-[#075CE5]">
                    {formatNaira(product.price)}
                  </span>
                </div>
              </div>

              {/* Blue Add to Cart Button */}
              <button
                onClick={() => onAddToCart(product)}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-[#075CE5] hover:bg-[#064ec7] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
