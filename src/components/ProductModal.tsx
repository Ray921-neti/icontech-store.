import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  CheckCircle, 
  Plus, 
  Minus,
  MessageCircle
} from 'lucide-react';
import { Product } from '../types';
import { formatNaira, STORE_LOCATION, STORE_PHONE, createWhatsAppUrl } from '../utils/formatters';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
  ];

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Gallery Side */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={images[activeImageIndex] || images[0] || `/images/categories/${product.category}.svg`}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `/images/categories/${product.category}.svg`;
                }}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow-sm">
                  SAVE {discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-orange-600 ring-2 ring-orange-200' : 'border-gray-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick in-store availability box */}
            <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-xs space-y-1.5 text-gray-700">
              <div className="flex items-center text-orange-800 font-bold">
                <MapPin className="w-4 h-4 mr-1 text-orange-600" />
                In-Store Showroom Available
              </div>
              <p className="text-[11px] text-gray-600">
                You can inspect, test, and collect this gadget physically at our store:{' '}
                <strong>{STORE_LOCATION}</strong>.
              </p>
            </div>
          </div>

          {/* Details Side */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {product.brand}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  Category: {product.category}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{product.reviewsCount} customer reviews</span>
                <span className="text-gray-300">|</span>
                <span className="text-emerald-700 font-bold flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Verified Stock
                </span>
              </div>

              {/* Pricing in Naira */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950">
                    {formatNaira(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatNaira(product.originalPrice)}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-xs font-bold text-emerald-700">
                    You save: {formatNaira(savings)} ({discount}% discount)
                  </p>
                )}
                <p className="text-[11px] text-gray-500">
                  Prices inclusive of store warranty and free device setup at Ondo store.
                </p>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Product Overview
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Key Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key}>
                        <span className="font-semibold text-gray-500">{key}:</span>{' '}
                        <span className="text-gray-800 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block">Total Price:</span>
                  <span className="text-base font-black text-orange-600">
                    {formatNaira(product.price * quantity)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  disabled={!product.inStock || product.stock === 0}
                  className="py-3 px-4 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-xs sm:text-sm transition flex items-center justify-center border border-orange-200"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </button>

                <button
                  onClick={() => {
                    onBuyNow(product, quantity);
                    onClose();
                  }}
                  disabled={!product.inStock || product.stock === 0}
                  className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center shadow-md"
                >
                  Buy Now (Checkout)
                </button>
              </div>

              {/* Inquire on WhatsApp */}
              <div className="text-center pt-1">
                <a
                  href={createWhatsAppUrl(`Hello ICONTECH, I am interested in buying ${product.name} priced at ${formatNaira(product.price)}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Have questions? Chat directly with sales on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
