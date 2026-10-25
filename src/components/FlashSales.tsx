import React, { useState, useEffect } from 'react';
import { Zap, Clock, ChevronRight } from 'lucide-react';
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
  const flashProducts = products.filter((p) => p.isFlashDeal).slice(0, 4);

  // Live ticking countdown for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 9, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashProducts.length === 0) return null;

  return (
    <section className="bg-linear-to-r from-red-600 via-orange-600 to-amber-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-black animate-bounce shadow-md">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              SUPER FLASH SALES
              <span className="text-xs bg-yellow-300 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Up to 40% OFF
              </span>
            </h2>
            <p className="text-xs text-orange-100">Limited stock at Ondo showroom opposite Adeyemi</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
          <Clock className="w-4 h-4 text-yellow-300" />
          <span className="text-xs font-semibold text-gray-200">Ends in:</span>
          <div className="flex items-center space-x-1 font-mono font-bold text-sm">
            <span className="bg-black text-yellow-300 px-1.5 py-0.5 rounded">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-black text-yellow-300 px-1.5 py-0.5 rounded">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-black text-yellow-300 px-1.5 py-0.5 rounded">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Flash Products */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4">
        {flashProducts.map((product) => {
          const discountPct = product.originalPrice
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 15;

          return (
            <div
              key={product.id}
              className="bg-white rounded-xl overflow-hidden shadow-md text-slate-900 flex flex-col group hover:shadow-xl transition"
            >
              {/* Product Image + Tag */}
              <div 
                className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => onSelectProduct(product)}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 bg-red-600 text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-xs">
                  -{discountPct}%
                </span>
                {product.badge && (
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    {product.brand}
                  </span>
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-orange-600 cursor-pointer transition leading-snug mt-0.5"
                  >
                    {product.name}
                  </h3>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-100">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-red-600">
                      {formatNaira(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-[11px] text-gray-400 line-through">
                        {formatNaira(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-gray-500 font-medium mb-1">
                      <span>Stock left:</span>
                      <span className="font-bold text-red-600">{product.stock} units</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-linear-to-r from-orange-500 to-red-600 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(25, product.stock * 10))}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full mt-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition shadow-xs"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={onViewAllFlashDeals}
          className="inline-flex items-center text-xs font-bold text-white hover:text-yellow-300 transition"
        >
          View all discounted flash products &amp; tech accessories
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </section>
  );
};
