import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  Wrench, 
  LogOut, 
  CheckCircle, 
  Edit3, 
  Clock, 
  Package, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCustomerOrders, fetchCustomerRepairs } from '../services/storeService';
import { Order, RepairJob } from '../types';
import { formatNaira, formatDate, STORE_LOCATION, STORE_PHONE } from '../utils/formatters';

interface CustomerAccountViewProps {
  onNavigateTab: (tab: string) => void;
  onTrackRepair: (refId: string) => void;
  onTrackOrder: (refId: string) => void;
  onOpenLogin?: () => void;
}

export const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({
  onNavigateTab,
  onTrackRepair,
  onTrackOrder,
  onOpenLogin,
}) => {
  const { customerProfile, customerSignOut, updateCustomerProfileData } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'orders' | 'repairs'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (customerProfile) {
      setEditName(customerProfile.name);
      setEditEmail(customerProfile.email || '');
      setEditAddress(customerProfile.defaultAddress || '');

      // Load customer orders and repairs
      async function loadHistory() {
        if (!customerProfile) return;
        setLoadingRecords(true);
        try {
          const [custOrders, custRepairs] = await Promise.all([
            fetchCustomerOrders(customerProfile.uid, customerProfile.phone),
            fetchCustomerRepairs(customerProfile.uid, customerProfile.phone),
          ]);
          setOrders(custOrders);
          setRepairs(custRepairs);
        } catch (e) {
          console.error('Failed to load customer records:', e);
        } finally {
          setLoadingRecords(false);
        }
      }
      loadHistory();
    }
  }, [customerProfile]);

  if (!customerProfile) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-md space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">You Are Not Signed In</h3>
        <p className="text-xs text-gray-500">
          Sign in or create an ICONTECH account to manage your gadgets, past orders, and device repair tickets.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => (onOpenLogin ? onOpenLogin() : onNavigateTab('login'))}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-md"
          >
            Sign In / Register Now
          </button>
          <button
            onClick={() => onNavigateTab('home')}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setProfileError(null);

    try {
      await updateCustomerProfileData({
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        defaultAddress: editAddress.trim() || undefined,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile:', e);
      setProfileError(e instanceof Error ? e.message : 'Failed to update profile. Please try again.');
    }
  };

  const handleSignOutClick = async () => {
    await customerSignOut();
    onNavigateTab('home');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Profile Header Banner */}
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-orange-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center font-black text-2xl text-white shadow-lg border-2 border-white/20">
            {customerProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {customerProfile.name}
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                Active Customer
              </span>
            </div>
            <p className="text-xs text-orange-200 mt-0.5 flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1" />
              {customerProfile.phone}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Member since: {formatDate(customerProfile.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOutClick}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-600/90 text-white font-bold text-xs transition border border-white/20 flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center animate-in fade-in">
          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {profileError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center animate-in fade-in">
          <AlertCircle className="w-4 h-4 mr-2 text-red-600 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      {/* Account Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'profile'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile &amp; Address</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'orders'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('repairs')}
          className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 shrink-0 ${
            activeSubTab === 'repairs'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>My Gadget Repairs ({repairs.length})</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. Profile Details & Editor */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Customer Information
              </h3>
              <p className="text-xs text-gray-500">
                Manage your personal contact info and default delivery address.
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 flex items-center space-x-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nigerian Phone Number
                </label>
                <input
                  type="text"
                  disabled
                  value={customerProfile.phone}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Registered authentication phone number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-gray-400 font-normal">(Optional for invoices)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Default Delivery Address in Ondo / Nigeria
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 12 Adeyemi Road, Ondo City"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-md"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Customer Name</span>
                <span className="text-sm font-bold text-slate-900">{customerProfile.name}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Verified Phone Number</span>
                <span className="text-sm font-bold text-slate-900">{customerProfile.phone}</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Email Address</span>
                <span className="text-sm font-medium text-slate-800">
                  {customerProfile.email || 'No email attached'}
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-gray-400 font-bold block uppercase text-[10px]">Default Delivery Address</span>
                <span className="text-sm font-medium text-slate-800">
                  {customerProfile.defaultAddress || 'None saved (enter at checkout)'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Customer Orders */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {loadingRecords ? (
            <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200">
              Loading your purchase history...
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        {ord.id}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Placed on {formatDate(ord.createdAt)} &bull; {ord.items.length} item(s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>

                      <button
                        onClick={() => onTrackOrder(ord.id)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center"
                      >
                        <span>Track</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="space-y-1.5 text-xs">
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-gray-700">
                        <span>
                          {item.quantity}x {item.productName}
                        </span>
                        <span className="font-black text-slate-900">
                          {formatNaira(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Payment: <strong className="capitalize">{ord.paymentStatus.replace(/_/g, ' ')}</strong> ({ord.paymentMethod.replace(/_/g, ' ')})
                    </span>
                    <span className="font-black text-base text-orange-600">
                      Total: {formatNaira(ord.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="font-bold text-gray-800 text-sm">No Orders Placed Yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore our catalog for genuine smartphones, laptops, power banks, and accessories.
              </p>
              <button
                onClick={() => onNavigateTab('shop')}
                className="px-5 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition"
              >
                Browse Gadgets Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Customer Gadget Repairs */}
      {activeSubTab === 'repairs' && (
        <div className="space-y-4">
          {loadingRecords ? (
            <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-200">
              Loading your repair records...
            </div>
          ) : repairs.length > 0 ? (
            <div className="space-y-3">
              {repairs.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-mono font-black text-slate-900 text-sm block">
                        {rep.id}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {rep.gadgetType} &bull; {rep.brandModel}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          rep.repairStatus === 'Ready for Collection' || rep.repairStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {rep.repairStatus}
                      </span>

                      <button
                        onClick={() => onTrackRepair(rep.id)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center"
                      >
                        <span>Live Status</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-500">Reported Problem:</span>{' '}
                      {rep.faultCategory}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-500">Quoted Price:</span>{' '}
                      <span className="font-bold text-slate-900">
                        {rep.quotedPrice ? formatNaira(rep.quotedPrice) : 'Pending Diagnostics'}
                      </span>
                    </div>
                    {rep.diagnosticNotes && (
                      <div className="sm:col-span-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                        <strong>Technician Note:</strong> {rep.diagnosticNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="font-bold text-gray-800 text-sm">No Repair Requests Logged</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Need a broken screen, bad battery, or water damage fixed? Book a diagnostic session in seconds.
              </p>
              <button
                onClick={() => onNavigateTab('repair-book')}
                className="px-5 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition"
              >
                Book Gadget Repair
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
