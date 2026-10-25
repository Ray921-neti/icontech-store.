import React, { useState } from 'react';
import { 
  Wrench, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Watch, 
  Camera, 
  Upload, 
  CheckCircle, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Copy, 
  Check, 
  Printer, 
  AlertCircle 
} from 'lucide-react';
import { createRepairJob } from '../services/storeService';
import { RepairJob } from '../types';
import { 
  formatNaira, 
  STORE_LOCATION, 
  STORE_PHONE, 
  createWhatsAppUrl 
} from '../utils/formatters';

interface RepairBookingViewProps {
  onTrackSubmittedRepair: (refId: string) => void;
}

export const RepairBookingView: React.FC<RepairBookingViewProps> = ({ onTrackSubmittedRepair }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [gadgetType, setGadgetType] = useState('Smartphone');
  const [brandModel, setBrandModel] = useState('');
  const [faultCategory, setFaultCategory] = useState('Screen Replacement');
  const [faultDescription, setFaultDescription] = useState('');
  const [passcode, setPasscode] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRepair, setCreatedRepair] = useState<RepairJob | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const gadgetTypes = [
    { label: 'Smartphone', icon: <Smartphone className="w-4 h-4" /> },
    { label: 'Laptop', icon: <Laptop className="w-4 h-4" /> },
    { label: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { label: 'Smartwatch', icon: <Watch className="w-4 h-4" /> },
    { label: 'Audio / Console / Other', icon: <Wrench className="w-4 h-4" /> },
  ];

  const commonFaults = [
    'Cracked Screen / Display Issues',
    'Battery Replacement / Fast Drain',
    'Charging Port / Not Charging',
    'Water / Liquid Damage Treatment',
    'Motherboard / No Power / IC Repair',
    'Speaker / Earpiece / Microphone',
    'Camera Glass / Lens Replacement',
    'OS Reinstallation / Software / Unlock',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Photo size should be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    if (!createdRepair) return;
    navigator.clipboard.writeText(createdRepair.id);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setError('Please enter a valid phone or WhatsApp number.');
      return;
    }
    if (!brandModel.trim()) {
      setError('Please specify your device brand and model (e.g. iPhone 13 Pro, HP Pavilion, etc.).');
      return;
    }
    if (!faultDescription.trim()) {
      setError('Please describe what happened to the device or the fault symptoms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const repairData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        gadgetType,
        brandModel: brandModel.trim(),
        faultCategory,
        faultDescription: faultDescription.trim(),
        passcodeProvided: passcode.trim() || undefined,
        photoUrl: photoPreview || undefined,
      };

      const job = await createRepairJob(repairData);
      setCreatedRepair(job);
    } catch (err) {
      console.error('Repair booking error:', err);
      setError('Could not record repair ticket. Please check connection or contact technician directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-orange-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-600/30 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 mr-1.5" />
            Official ICONTECH Repair Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Book Gadget Repair &amp; Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Professional micro-soldering, authentic screen replacements, battery tests, and water damage recovery opposite Adeyemi College of Education, Ondo.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-300">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-400" /> Free Diagnostics
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-400" /> Genuine Replacement Parts
            </span>
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-400" /> 90-Day Repair Warranty
            </span>
          </div>
        </div>
      </div>

      {createdRepair ? (
        /* Booking Confirmation Card */
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Repair Request Registered!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Your gadget repair ticket is live in our diagnostic system. Please bring or send your device to our service center.
            </p>
          </div>

          {/* Big Reference Box */}
          <div className="p-5 bg-orange-50 border-2 border-orange-300 rounded-2xl text-center space-y-3">
            <span className="text-xs font-bold text-orange-800 uppercase tracking-widest block">
              Repair Reference Number
            </span>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-3xl font-black text-slate-950 font-mono tracking-wider">
                {createdRepair.id}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 transition"
                title="Copy reference"
              >
                {copiedRef ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-orange-900">
              Use this reference to track progress live on our website or when chatting with our technician.
            </p>
          </div>

          {/* Ticket Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-gray-500 font-medium block">Customer Name:</span>
              <span className="font-bold text-gray-900 text-sm">{createdRepair.customerName}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Contact Phone:</span>
              <span className="font-bold text-gray-900 text-sm">{createdRepair.customerPhone}</span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Device Model:</span>
              <span className="font-bold text-gray-900 text-sm">
                {createdRepair.gadgetType} - {createdRepair.brandModel}
              </span>
            </div>
            <div>
              <span className="text-gray-500 font-medium block">Reported Fault:</span>
              <span className="font-bold text-gray-900 text-sm">{createdRepair.faultCategory}</span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-gray-200">
              <span className="text-gray-500 font-medium block">Service Center Drop-off Address:</span>
              <span className="font-bold text-slate-900 flex items-center mt-0.5">
                <MapPin className="w-4 h-4 mr-1 text-red-500 shrink-0" />
                {STORE_LOCATION} (Phone: {STORE_PHONE})
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => onTrackSubmittedRepair(createdRepair.id)}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Open Live Repair Status Tracker</span>
            </button>

            <a
              href={createWhatsAppUrl(
                `Hello ICONTECH Repair Tech, I just booked repair reference ${createdRepair.id} for my ${createdRepair.brandModel}. Issue: ${createdRepair.faultCategory}. My name is ${createdRepair.customerName}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Technician on WhatsApp</span>
            </a>

            <button
              onClick={() => window.print()}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-xl transition flex items-center justify-center space-x-1"
            >
              <Printer className="w-4 h-4" />
              <span>Print Device Drop-off Slip</span>
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-md space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Gadget Category Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
              1. Select Device Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {gadgetTypes.map((type) => (
                <button
                  key={type.label}
                  type="button"
                  onClick={() => setGadgetType(type.label)}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 ${
                    gadgetType === type.label
                      ? 'border-orange-600 bg-orange-50 text-orange-700 ring-2 ring-orange-200 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Device Brand & Model */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
              2. Device Brand &amp; Exact Model <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 14 Pro Max, Samsung Galaxy S23, HP Envy 15, MacBook Pro M1..."
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
              <div>
                <select
                  value={faultCategory}
                  onChange={(e) => setFaultCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden bg-white"
                >
                  {commonFaults.map((fault) => (
                    <option key={fault} value={fault}>
                      {fault}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Detailed Fault Description */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
              3. Fault Symptoms &amp; Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tell our technician what happened: e.g. Phone fell down and screen is blank, liquid spilled on keyboard, device overheating and restarting, etc."
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
            />
          </div>

          {/* 4. Optional Photo & Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Attach Photo of Damage <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-orange-500 transition">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Fault preview"
                      className="max-h-36 mx-auto rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="mt-2 text-[11px] text-red-600 hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-1">
                    <Camera className="w-6 h-6 mx-auto text-gray-400" />
                    <span className="text-xs text-orange-600 font-bold block">
                      Upload photo or take snapshot
                    </span>
                    <span className="text-[10px] text-gray-400 block">PNG, JPG up to 3MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Screen PIN / Passcode <span className="text-gray-400 font-normal">(Optional for post-repair testing)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1234 or leave blank if you will unlock in-person"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Our technicians respect customer privacy. Passcodes are only used to verify display touch and audio after repairs.
              </p>
            </div>
          </div>

          {/* 5. Customer Contact Info */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
              4. Your Contact Information <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
              <div>
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp Number (e.g. 080...)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="email"
                  placeholder="Email Address (Optional for digital invoice)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Location reassurance */}
          <div className="p-3.5 bg-orange-50/70 rounded-xl border border-orange-100 flex items-start space-x-2.5 text-xs text-orange-900">
            <MapPin className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Service Location: </span>
              {STORE_LOCATION}. Walk-in diagnostic hours: Mon–Sat 8:00 AM – 7:00 PM.
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl transition shadow-lg flex items-center justify-center space-x-2 disabled:bg-gray-400"
          >
            <Wrench className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering Repair Job...' : 'Submit Device for Diagnostic'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
