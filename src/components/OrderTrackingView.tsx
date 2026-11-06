import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Truck, 
  Store, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  MessageCircle,
  Banknote
} from 'lucide-react';
import { getOrderById } from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { 
  formatNaira, 
  formatDate, 
  STORE_LOCATION, 
  STORE_PHONE, 
  createWhatsAppUrl 
} from '../utils/formatters';

export const OrderTrackingView: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOrder: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'ready_for_pickup',
    'delivered',
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Authentication Required: Please sign in to your ICONTECH customer account to view your order tracking details.');
      return;
    }

    const cleanId = orderIdInput.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter your order reference (e.g. ICON-ORD-74921).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const found = await getOrderById(cleanId);
      if (!found) {
        setError(`No order found with reference "${cleanId}". Please check your receipt.`);
        setOrder(null);
        return;
      }

      // Strict ownership check: Only the customer who placed the order or admin can view
      if (!isAdmin && found.customerUid && found.customerUid !== user.uid) {
        setError('Access Restricted: You do not have permission to view this order. Please sign in with the account used to make the purchase.');
        setOrder(null);
        return;
      }

      if (phoneInput.trim()) {
        const p1 = phoneInput.replace(/[^0-9]/g, '');
        const p2 = found.customerPhone.replace(/[^0-9]/g, '');
        if (!p2.includes(p1) && !p1.includes(p2)) {
          setError('The phone number entered does not match the contact for this order.');
          setOrder(null);
          return;
        }
      }

      setOrder(found);
    } catch (e) {
      console.error('Order tracking error:', e);
      setError('Failed to fetch order or access denied by security rules.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-[#082B62] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#E5ECF5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-[#FF7900] block mb-1">
            Order Fulfillment Status
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Track Your Gadget Purchase
          </h1>
          <p className="text-xs text-[#DCEBFF] mt-1 max-w-lg">
            Check real-time dispatch and store-pickup availability for your smartphones, laptops, and accessories.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-xs">
          <span className="text-[#DCEBFF] block">Dispatch Department:</span>
          <a href={`tel:${STORE_PHONE}`} className="font-bold text-[#FF7900] text-sm hover:underline block">
            📞 {STORE_PHONE}
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5ECF5] p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-[#10264D] mb-1">
              Order Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ICON-ORD-10492"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono uppercase font-bold border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-[#10264D] mb-1">
              Customer Phone <span className="text-[#718096] font-normal">(Optional verify)</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 080..."
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#075CE5] hover:bg-[#064ec4] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center disabled:bg-gray-400 cursor-pointer"
            >
              <Search className="w-4 h-4 mr-1" />
              <span>{isLoading ? '...' : 'Track'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 block">
                {order.id}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Order for {order.customerName}
              </h2>
              <span className="text-xs text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="text-right space-y-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  order.orderStatus === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
              <div className="text-xs">
                <span className="text-gray-400">Payment: </span>
                <span className="font-bold capitalize text-slate-800">
                  {order.paymentStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered items breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
              Purchased Items ({order.items.length})
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&auto=format&fit=crop&q=80'}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {item.productName}
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      Qty: {item.quantity} × {formatNaira(item.price)}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment details & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-gray-800 block">Fulfillment Details</span>
              <p className="text-gray-600">
                <span className="font-semibold">Type:</span>{' '}
                <span className="capitalize">{order.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Door Delivery'}</span>
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Destination:</span> {order.deliveryAddress}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Contact:</span> {order.customerPhone}
              </p>
            </div>

            <div className="space-y-1.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-semibold text-gray-800">{formatNaira(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee:</span>
                  <span className="font-semibold text-gray-800">
                    {order.deliveryFee === 0 ? 'FREE' : formatNaira(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-1 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-orange-600">{formatNaira(order.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-gray-500">
                Payment Method: <span className="font-bold uppercase">{order.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          {/* Direct Support */}
          <div className="pt-2">
            <a
              href={createWhatsAppUrl(
                `Hello ICONTECH, I am checking on my purchase order ${order.id}. Total: ${formatNaira(order.totalAmount)}. Customer: ${order.customerName}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire about this Order on WhatsApp ({STORE_PHONE})</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
