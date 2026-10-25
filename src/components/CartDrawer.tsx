import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatNaira, STORE_LOCATION } from '../utils/formatters';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreProducts,
}) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryFee,
    totalAmount,
    totalItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-black tracking-tight">
              Your Shopping Cart ({totalItems})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery Progress Bar */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 text-xs">
          {subtotal >= 100000 ? (
            <p className="text-emerald-800 font-bold flex items-center">
              🎉 Congratulations! You unlocked FREE Delivery in Ondo State!
            </p>
          ) : (
            <p className="text-amber-800 font-medium">
              Add <span className="font-bold">{formatNaira(100000 - subtotal)}</span> more for FREE Ondo delivery!
            </p>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-base">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Browse our high-quality smartphones, laptops, power banks, and accessories.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onExploreProducts();
                }}
                className="px-6 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-full hover:bg-orange-700 transition shadow-md"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover bg-white shrink-0 border border-gray-200"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {item.product.name}
                  </h4>
                  <span className="text-[11px] text-gray-500 block">
                    {formatNaira(item.product.price)} each
                  </span>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-300 rounded-md bg-white">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:bg-gray-100 transition"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:bg-gray-100 transition"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-black text-slate-900">
                      {formatNaira(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items):</span>
                <span className="font-semibold text-gray-900">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1 text-gray-500" />
                  Estimated Delivery / Pickup:
                </span>
                <span className="font-semibold text-gray-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-gray-100">
                <span>Total Amount:</span>
                <span className="text-orange-600 text-base">{formatNaira(totalAmount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                <span className="flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Pay on Delivery or Bank Transfer
                </span>
                <button
                  onClick={clearCart}
                  className="text-gray-400 hover:text-red-600 transition"
                >
                  Empty cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
