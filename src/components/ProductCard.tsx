import React from 'react';
import { Star, ShoppingCart, Check, ShieldCheck } from 'lucide-react';
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-lg transition duration-200 flex flex-col justify-between group">
      {/* Product Image Section */}
      <div 
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => onSelect(product)}
      >
        <img
          src={product.images[0] || `/images/categories/${product.category}.svg`}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `/images/categories/${product.category}.svg`;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-[11px] px-2 py-0.5 rounded shadow-xs">
            -{discount}%
          </span>
        )}

        {product.badge && (
          <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            {product.badge}
          </span>
        )}

        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="font-bold uppercase tracking-wider text-orange-600">
              {product.brand}
            </span>
            <div className="flex items-center text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-0.5 text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-[10px] ml-0.5">({product.reviewsCount})</span>
            </div>
          </div>

          <h3
            onClick={() => onSelect(product)}
            className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-orange-600 cursor-pointer transition leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing and Action */}
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          <div className="flex items-baseline gap-2 flex-wrap mb-2.5">
            <span className="text-base sm:text-lg font-black text-slate-950">
              {formatNaira(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-emerald-700 font-medium flex items-center">
              <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
              Ondo Store Ready
            </span>

            <button
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock || product.stock === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 ${
                product.inStock && product.stock > 0
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
