import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle, 
  ShieldCheck, 
  Navigation 
} from 'lucide-react';
import { 
  STORE_NAME, 
  STORE_LOCATION, 
  STORE_PHONE, 
  STORE_PHONE_INTL, 
  createWhatsAppUrl 
} from '../utils/formatters';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Inquiry about Gadget Purchase');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-[#082B62] rounded-3xl p-6 sm:p-10 text-white shadow-md border border-[#E5ECF5]">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs uppercase font-black tracking-widest text-[#FF7900] block">
            Visit Our Showroom &amp; Service Lab
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Contact &amp; Store Location
          </h1>
          <p className="text-xs sm:text-sm text-[#DCEBFF] leading-relaxed">
            Located right opposite Adeyemi College of Education, Ondo. Stop by for gadget purchases, live device testing, screen replacement, and diagnostic consultations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          {/* Main Address Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Store &amp; Workshop Address</h3>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {STORE_LOCATION}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Directly opposite the Adeyemi College gate on the main road, Ondo City, Ondo State.
              </p>
            </div>
          </div>

          {/* Phone & WhatsApp Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Call &amp; WhatsApp Hotline</h3>
              <a 
                href={`tel:${STORE_PHONE}`}
                className="text-base font-black text-slate-900 hover:text-orange-600 transition block mt-0.5"
              >
                {STORE_PHONE}
              </a>
              <p className="text-[11px] text-gray-500 mt-1">
                Available daily for device pricing, stock checks, and technician assistance.
              </p>
            </div>
            <a
              href={createWhatsAppUrl('Hello ICONTECH, I would like to inquire about your gadgets or repair services.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <MessageCircle className="w-4 h-4 mr-1 text-emerald-600" />
              Chat on WhatsApp Directly
            </a>
          </div>

          {/* Working Hours */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Store &amp; Lab Hours</h3>
              <div className="space-y-1 text-xs text-gray-600 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Monday – Saturday:</span>
                  <span className="font-bold text-slate-900">8:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday:</span>
                  <span className="font-bold text-slate-900">12:00 PM – 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Visual & Inquiry Form */}
        <div className="md:col-span-7 space-y-6">
          {/* Visual Location Showcase */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="relative h-48 bg-slate-800 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=900&auto=format&fit=crop&q=80"
                alt="Store location"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-orange-400 block">
                    📍 Landmark Guide
                  </span>
                  <span className="text-sm font-black">
                    Opposite Adeyemi College of Education, Ondo
                  </span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent('Adeyemi College of Education, Ondo, Nigeria')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition flex items-center"
                >
                  <Navigation className="w-3.5 h-3.5 mr-1" />
                  View Map
                </a>
              </div>
            </div>
          </div>

          {/* Quick Message Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-black text-gray-900 text-base">Send Us a Direct Message</h3>
            
            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-2 text-xs">
                <div className="flex items-center font-bold text-sm text-emerald-800">
                  <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Message Received!
                </div>
                <p>
                  Thank you, <strong>{name}</strong>. Our team will contact you at <strong>{phone}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-emerald-700 font-bold hover:underline block"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Ade"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 080..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden bg-white"
                  >
                    <option value="Inquiry about Gadget Purchase">Inquiry about Gadget Purchase</option>
                    <option value="Screen or Battery Repair Quote">Screen or Battery Repair Quote</option>
                    <option value="Bulk Order for Laptops / Chargers">Bulk Order for Laptops / Chargers</option>
                    <option value="In-Store Pickup Question">In-Store Pickup Question</option>
                    <option value="Other Assistance">Other Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Tell us what gadget or repair service you are looking for..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-[#075CE5] hover:bg-[#064ec4] text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Message</span>
                  </button>

                  <a
                    href={createWhatsAppUrl(`Hello ICONTECH, I am reaching out regarding: ${subject}. From: ${name || 'Customer'}. Message: ${message}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
