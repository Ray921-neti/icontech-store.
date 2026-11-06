import React from 'react';
import { Star, ShoppingCart, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { formatNaira } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5ECF5] hover:border-[#075CE5] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group relative text-left">
      {/* Product Image Section */}
      <div 
        className="relative w-full h-[160px] sm:h-[180px] p-3 flex items-center justify-center bg-white cursor-pointer overflow-hidden"
        onClick={() => onSelect(product)}
      >
        <img
          src={product.images[0] || `/images/categories/${product.category}.jpg`}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `/images/categories/${product.category}.jpg`;
          }}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Orange Discount Badge on Top-Left */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-[#FF7900] text-white font-black text-[11px] px-2 py-0.5 rounded-md shadow-xs z-10">
            -{discount}%
          </span>
        )}

        {/* Highlight Badge on Top-Right */}
        {product.badge && (
          <span className="absolute top-2.5 right-2.5 bg-[#082B62] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs z-10">
            {product.badge}
          </span>
        )}

        {/* Low Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Brand & Star Rating */}
          <div className="flex items-center justify-between text-[11px] text-[#718096] mb-1">
            <span className="font-bold uppercase tracking-wider text-[#075CE5]">
              {product.brand}
            </span>
            <div className="flex items-center text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-0.5 text-[#10264D]">{product.rating.toFixed(1)}</span>
              <span className="text-[#718096] text-[10px] ml-0.5">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="text-xs sm:text-sm font-bold text-[#10264D] line-clamp-2 hover:text-[#075CE5] cursor-pointer transition leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing and Action */}
        <div className="mt-3 pt-2.5 border-t border-[#E5ECF5]">
          <div className="flex items-baseline space-x-2 flex-wrap mb-2">
            <span className="text-sm sm:text-base font-black text-[#075CE5]">
              {formatNaira(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#718096] line-through">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center">
              <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
              In Store
            </span>

            {/* Blue Add to Cart Button */}
            <button
              onClick={() => onAddToCart(product)}
              className="py-1.5 px-3 rounded-xl bg-[#075CE5] hover:bg-[#064ec7] text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
