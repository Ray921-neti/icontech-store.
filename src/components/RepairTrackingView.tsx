import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Banknote,
  Calendar,
  UserCheck
} from 'lucide-react';
import { getRepairById } from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import { RepairJob, RepairStatus } from '../types';
import { 
  formatNaira, 
  formatDate, 
  STORE_LOCATION, 
  STORE_PHONE, 
  createWhatsAppUrl 
} from '../utils/formatters';

interface RepairTrackingViewProps {
  initialRefId?: string;
}

export const RepairTrackingView: React.FC<RepairTrackingViewProps> = ({ initialRefId }) => {
  const { user, isAdmin } = useAuth();
  const [referenceInput, setReferenceInput] = useState(initialRefId || '');
  const [phoneVerification, setPhoneVerification] = useState('');
  const [repair, setRepair] = useState<RepairJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOrder: RepairStatus[] = [
    'Received',
    'Diagnosing',
    'Awaiting Customer Approval',
    'Awaiting Parts',
    'Repairing',
    'Ready for Collection',
    'Completed',
  ];

  const searchRepair = async (ref: string, phone?: string) => {
    if (!user) {
      setError('Authentication Required: Please sign in to your ICONTECH customer account to view gadget repair diagnostics and price quotes.');
      return;
    }

    const cleanRef = ref.trim().toUpperCase();
    if (!cleanRef) {
      setError('Please enter your repair reference code (e.g. ICON-REP-10492).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const found = await getRepairById(cleanRef);
      if (!found) {
        setError(`No repair job found for reference "${cleanRef}". Please verify your ticket reference.`);
        setRepair(null);
        return;
      }

      // Strict ownership check: Only the customer who submitted the device or an admin can view
      if (!isAdmin && found.customerUid && found.customerUid !== user.uid) {
        setError('Access Restricted: You do not have permission to view this repair ticket. Please sign into the customer account used to book the repair.');
        setRepair(null);
        return;
      }

      // Verification check if phone provided
      if (phone && phone.trim()) {
        const cleanP1 = phone.replace(/[^0-9]/g, '');
        const cleanP2 = found.customerPhone.replace(/[^0-9]/g, '');
        if (!cleanP2.includes(cleanP1) && !cleanP1.includes(cleanP2)) {
          setError('Phone number does not match the customer record for this repair.');
          setRepair(null);
          return;
        }
      }

      setRepair(found);
    } catch (e) {
      console.error('Error fetching repair:', e);
      setError('Failed to fetch repair job status or access denied by security rules.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialRefId) {
      setReferenceInput(initialRefId);
      searchRepair(initialRefId);
    }
  }, [initialRefId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchRepair(referenceInput, phoneVerification);
  };

  const currentStatusIndex = repair ? statusOrder.indexOf(repair.repairStatus) : -1;
  const isCancelled = repair?.repairStatus === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Card */}
      <div className="bg-[#082B62] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#E5ECF5] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-black tracking-widest text-[#FF7900] block mb-1">
            Live Diagnostic Tracker
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Track Device Repair Progress
          </h1>
          <p className="text-xs text-[#DCEBFF] mt-1 max-w-lg">
            Track your smartphone, laptop, or gadget through all 7 diagnostic and micro-soldering stages in real-time.
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-xs space-y-1">
          <span className="text-[#DCEBFF] block">Service Center Hotline:</span>
          <a href={`tel:${STORE_PHONE}`} className="font-bold text-[#FF7900] text-sm hover:underline block">
            📞 {STORE_PHONE}
          </a>
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="bg-white rounded-2xl border border-[#E5ECF5] p-5 sm:p-6 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-[#10264D] mb-1">
                Repair Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ICON-REP-10492"
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono uppercase font-bold border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-[#10264D] mb-1">
                Customer Phone <span className="text-[#718096] font-normal">(Optional verify)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 08034567891"
                value={phoneVerification}
                onChange={(e) => setPhoneVerification(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E5ECF5] rounded-xl focus:border-[#075CE5] focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#075CE5] hover:bg-[#064ec4] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center space-x-1 disabled:bg-gray-400 cursor-pointer"
              >
                <Search className="w-4 h-4 mr-1" />
                <span>{isLoading ? '...' : 'Track'}</span>
              </button>
            </div>
          </div>

          {/* Quick Demo Pill References */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-500">
            <span>Try sample tickets:</span>
            <button
              type="button"
              onClick={() => {
                setReferenceInput('ICON-REP-10492');
                searchRepair('ICON-REP-10492');
              }}
              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-orange-100 hover:text-orange-700 text-gray-700 font-mono transition text-[11px]"
            >
              ICON-REP-10492 (Repairing)
            </button>
            <button
              type="button"
              onClick={() => {
                setReferenceInput('ICON-REP-10493');
                searchRepair('ICON-REP-10493');
              }}
              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-700 font-mono transition text-[11px]"
            >
              ICON-REP-10493 (Ready for Collection)
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {repair && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Highlight Banner */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                  Repair Reference: {repair.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {repair.gadgetType} • {repair.brandModel}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-medium">Current Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    repair.repairStatus === 'Ready for Collection' || repair.repairStatus === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : repair.repairStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-orange-100 text-orange-800 border border-orange-300'
                  }`}
                >
                  {repair.repairStatus}
                </span>
              </div>
            </div>

            {/* Visual 7-Stage Pipeline */}
            {!isCancelled && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                  Repair Stage Pipeline
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {statusOrder.map((step, idx) => {
                    const isPassed = currentStatusIndex >= idx;
                    const isCurrent = currentStatusIndex === idx;

                    return (
                      <div
                        key={step}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-200'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {isPassed && !isCurrent ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-current text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold leading-tight block">
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px] flex items-center">
                  <Wrench className="w-3.5 h-3.5 mr-1 text-orange-600" />
                  Technician Diagnostic Report
                </h4>
                <div className="space-y-1 text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-500">Reported Problem:</span>{' '}
                    <span className="font-medium text-slate-900">{repair.faultCategory}</span>
                  </p>
                  <p className="text-gray-600 italic">
                    "{repair.faultDescription}"
                  </p>
                  {repair.diagnosticNotes && (
                    <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                      <span className="font-bold block text-[11px]">Lab Findings:</span>
                      {repair.diagnosticNotes}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-gray-900 uppercase tracking-wider text-[11px] flex items-center">
                    <Banknote className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Quoted Cost &amp; Timeline
                  </h4>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-500">Quoted Repair Cost:</span>
                      <span className="text-base font-black text-slate-900">
                        {repair.quotedPrice ? formatNaira(repair.quotedPrice) : 'Pending Diagnosis Quote'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Status:</span>
                      <span className="font-bold capitalize text-slate-800">
                        {repair.paymentStatus?.replace(/_/g, ' ') || 'Unpaid'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estimated Completion:</span>
                      <span className="font-bold text-orange-700">
                        {repair.estimatedCompletion || 'Same-day / 24 hours'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500">
                  <span>Registered: {formatDate(repair.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Collection Instructions if Ready */}
            {repair.repairStatus === 'Ready for Collection' && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-2 text-xs text-emerald-950">
                <h4 className="font-black text-emerald-900 flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Your Device is Ready for Pickup!
                </h4>
                <p>
                  All diagnostic tests passed successfully. Please bring your repair reference{' '}
                  <strong className="font-mono">{repair.id}</strong> to our store to collect your device.
                </p>
                <p className="font-bold flex items-center text-emerald-900 pt-1">
                  <MapPin className="w-4 h-4 mr-1 text-red-500" />
                  Showroom: {STORE_LOCATION}
                </p>
              </div>
            )}

            {/* Direct WhatsApp Tech Assistance */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={createWhatsAppUrl(
                  `Hello ICONTECH Repair Department, I am checking on my repair ticket ${repair.id} (${repair.brandModel}). Current status is ${repair.repairStatus}. Please advise.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Repair Technician on WhatsApp</span>
              </a>

              <a
                href={`tel:${STORE_PHONE}`}
                className="py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Center ({STORE_PHONE})</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
