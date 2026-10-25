import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Truck, 
  Store, 
  CreditCard, 
  Banknote, 
  CheckCircle2, 
  ShieldAlert, 
  Phone, 
  Copy, 
  Check, 
  MessageCircle,
  Printer
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/storeService';
import { Order, PaymentMethod } from '../types';
import { 
  formatNaira, 
  STORE_LOCATION, 
  STORE_PHONE, 
  STORE_PHONE_INTL, 
  createWhatsAppUrl 
} from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, deliveryFee, totalAmount, clearCart } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [orderNotes, setOrderNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  if (!isOpen) return null;

  // Active delivery fee depends on pickup vs door delivery
  const effectiveDeliveryFee = deliveryMethod === 'pickup' ? 0 : deliveryFee;
  const grandTotal = subtotal + effectiveDeliveryFee;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('0123456789');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!customerName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setError('Please provide a valid active Nigerian phone / WhatsApp number (e.g. 080... or 070...).');
      return;
    }
    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setError('Please enter your full delivery address in Ondo State or Nigeria.');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress.trim() : `Store Pickup: ${STORE_LOCATION}`,
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0] || '',
        })),
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'bank_transfer' ? 'pending_verification' as const : 'unpaid' as const,
        notes: orderNotes.trim() || undefined,
      };

      const savedOrder = await createOrder(orderPayload);
      setConfirmedOrder(savedOrder);
      clearCart();
      onOrderSuccess(savedOrder);
    } catch (err: unknown) {
      console.error('Order creation error:', err);
      setError('Failed to record order. Please verify your internet connection or call our sales line 07039420600.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              {confirmedOrder ? 'Order Placed Successfully!' : 'Complete Your Purchase'}
            </h2>
            <p className="text-xs text-gray-300">
              {confirmedOrder
                ? 'Your order reference is generated and saved in our database.'
                : 'Secure checkout with cash on delivery/pickup or bank transfer.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmed Order Screen */}
        {confirmedOrder ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Thank You, {confirmedOrder.customerName}!
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                We have received your order. Our team at <strong>{STORE_LOCATION}</strong> is processing your items right away.
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700 block">
                Your Order Reference Number
              </span>
              <span className="text-2xl font-black text-slate-950 font-mono tracking-wider block">
                {confirmedOrder.id}
              </span>
              <p className="text-[11px] text-gray-500">
                Please save this reference code. You can track your order status anytime using this code.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Fulfillment Method:</span>
                <span className="font-bold text-gray-800 capitalize">
                  {confirmedOrder.deliveryMethod === 'pickup' ? 'In-Store Pickup (Opposite Adeyemi)' : 'Door Delivery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="font-bold text-gray-800 text-right max-w-xs">{confirmedOrder.deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Phone:</span>
                <span className="font-bold text-gray-800">{confirmedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Choice:</span>
                <span className="font-bold text-gray-800 capitalize">
                  {confirmedOrder.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {confirmedOrder.paymentStatus === 'pending_verification' ? 'Pending Transfer Verification' : 'Unpaid (Pay on Collection/Delivery)'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-orange-600">{formatNaira(confirmedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Bank Transfer Details if chosen */}
            {confirmedOrder.paymentMethod === 'bank_transfer' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center text-blue-900 font-bold">
                  <Banknote className="w-4 h-4 mr-1 text-blue-700" />
                  ICONTECH Official Bank Account Details
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank Name:</span>
                    <span className="font-bold text-gray-800">Moniepoint Microfinance Bank / Wema Bank</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Account Number:</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono font-bold text-slate-900">0123456789</span>
                      <button
                        onClick={handleCopyAccount}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Copy account"
                      >
                        {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Name:</span>
                    <span className="font-bold text-gray-800">ICONTECH ELECTRONICS</span>
                  </div>
                </div>
                <p className="text-[11px] text-blue-800">
                  ⚠️ Note: After making payment, please send your transfer receipt and Order Ref <strong>{confirmedOrder.id}</strong> to our WhatsApp for immediate verification.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <a
                href={createWhatsAppUrl(
                  `Hello ICONTECH, I just completed order ${confirmedOrder.id} for total of ${formatNaira(confirmedOrder.totalAmount)}. Customer Name: ${confirmedOrder.customerName}, Phone: ${confirmedOrder.customerPhone}. Please confirm.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm Order via WhatsApp ({STORE_PHONE})</span>
              </a>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print Order Receipt Slip</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-gray-500 hover:text-gray-800 text-xs font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Customer Contact Info */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                1. Customer Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tayo Babatunde"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address <span className="text-gray-400 font-normal">(Optional for receipt)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. tayo@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Delivery or In-Store Pickup */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                2. Fulfillment Method
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    deliveryMethod === 'delivery'
                      ? 'border-orange-600 bg-orange-50/50 text-orange-900 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold">Door Delivery</span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1">
                    {deliveryFee === 0 ? 'FREE across Ondo' : '₦2,500 standard delivery'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    deliveryMethod === 'pickup'
                      ? 'border-orange-600 bg-orange-50/50 text-orange-900 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold">Store Pickup (FREE)</span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1">
                    Opposite Adeyemi, Ondo
                  </span>
                </button>
              </div>

              {deliveryMethod === 'delivery' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Delivery Address &amp; Landmark <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. 14 Yaba Street, near Adeyemi College gate, Ondo town"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-orange-600" />
                    Pickup Location: {STORE_LOCATION}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Your gadget will be ready for inspection and collection within 1 hour of order placement.
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Payment Options (No fake online simulation) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                3. Payment Method
              </h3>
              <div className="space-y-2">
                <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="text-orange-600 focus:ring-orange-500 mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">Direct Bank Transfer</span>
                    <span className="text-gray-500 text-[11px]">
                      Transfer to ICONTECH official account; verified before dispatch or collection.
                    </span>
                  </div>
                </label>

                <label className="flex items-center p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={deliveryMethod === 'pickup' ? 'cash_on_pickup' : 'cash_on_delivery'}
                    checked={paymentMethod === (deliveryMethod === 'pickup' ? 'cash_on_pickup' : 'cash_on_delivery')}
                    onChange={() => setPaymentMethod(deliveryMethod === 'pickup' ? 'cash_on_pickup' : 'cash_on_delivery')}
                    className="text-orange-600 focus:ring-orange-500 mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-gray-900 block">
                      {deliveryMethod === 'pickup' ? 'Pay Cash / POS on Pickup' : 'Cash on Delivery (Ondo Town)'}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Pay when you physically inspect and receive your gadgets.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Note */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Order Notes / Special Requests <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Call before dispatching, preferred color variant, etc."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            {/* Total breakdown */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-gray-800">{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fulfillment Fee:</span>
                <span className="font-bold text-gray-800">
                  {effectiveDeliveryFee === 0 ? 'FREE' : formatNaira(effectiveDeliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t border-gray-200">
                <span>Grand Total:</span>
                <span className="text-orange-600">{formatNaira(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <span>Placing your order...</span>
              ) : (
                <span>Place Order ({formatNaira(grandTotal)})</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
