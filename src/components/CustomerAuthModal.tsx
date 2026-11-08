import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
  Wrench, 
  Truck, 
  Smartphone, 
  AlertCircle, 
  LogIn, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { normalizeNigerianPhone } from '../utils/formatters';

export interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
  isEmbedded?: boolean;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
  isEmbedded = false,
}) => {
  const { 
    customerSignIn, 
    customerSignUp, 
    signInWithGoogle, 
    resetPassword,
    error: authError, 
    clearError,
    isAdmin 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Phone number
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setFormError(null);
    setInfoMessage(null);
    clearError();
  }, [initialMode, isOpen]);

  if (!isOpen && !isEmbedded) return null;

  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setFormError(null);
    setInfoMessage(null);
    clearError();
  };

  const handleForgotPassword = async () => {
    setFormError(null);
    setInfoMessage(null);
    if (!identifier.trim()) {
      setInfoMessage(
        'Please enter your email or Nigerian phone number above, then click Forgot Password to receive reset instructions.'
      );
      return;
    }
    try {
      const msg = await resetPassword(identifier);
      setInfoMessage(msg);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not process password reset.');
    }
  };

  const handleAppleSignIn = () => {
    setInfoMessage(
      'Apple ID authentication is optimized for our upcoming iOS release. Please use your Nigerian Phone / WhatsApp number or Google Account on the web.'
    );
  };

  const handleGoogleAuth = async () => {
    setFormError(null);
    setInfoMessage(null);
    clearError();
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      setFormError(err instanceof Error ? err.message : 'Google authentication could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setInfoMessage(null);
    clearError();

    // If Admin role is selected, direct them to Google Admin authentication
    if (role === 'admin') {
      await handleGoogleAuth();
      return;
    }

    // Customer flow: validate phone / email
    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setFormError('Please enter your Nigerian phone number or registered email.');
      return;
    }

    const phoneVal = normalizeNigerianPhone(trimmedId);
    if (!phoneVal.isValid && !trimmedId.includes('@')) {
      setFormError(phoneVal.error || 'Please enter a valid 11-digit Nigerian phone number (e.g. 07039420600).');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setFormError('Please enter your full name.');
        return;
      }
      if (!password || password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Please re-enter.');
        return;
      }

      setIsSubmitting(true);
      try {
        const phoneToUse = phoneVal.isValid ? phoneVal.formatted : trimmedId;
        await customerSignUp(fullName.trim(), phoneToUse, password);
        onClose();
        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'Registration failed.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In mode
      if (!password) {
        setFormError('Please enter your password.');
        return;
      }

      setIsSubmitting(true);
      try {
        const phoneToUse = phoneVal.isValid ? phoneVal.formatted : trimmedId;
        await customerSignIn(phoneToUse, password);
        onClose();
        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'Sign in failed. Check your phone number and password.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const activeError = formError || authError;

  // The actual authentication card layout
  const authCardContent = (
    <>
      {/* Scoped CSS guaranteeing 45% left and 55% right side-by-side on desktop, plus mobile header */}
      <style>{`
        .icontech-auth-card {
          display: flex !important;
          flex-direction: column !important;
        }
        @media (min-width: 640px) {
          .icontech-auth-card {
            flex-direction: row !important;
            align-items: stretch !important;
          }
          .icontech-auth-left {
            display: flex !important;
            width: 45% !important;
            max-width: 45% !important;
            min-width: 45% !important;
            flex: 0 0 45% !important;
          }
          .icontech-auth-right {
            display: flex !important;
            width: 55% !important;
            max-width: 55% !important;
            min-width: 55% !important;
            flex: 0 0 55% !important;
          }
        }
        @media (max-width: 639px) {
          .icontech-auth-left {
            display: none !important;
          }
          .icontech-auth-right {
            width: 100% !important;
            max-width: 100% !important;
            flex: 1 1 auto !important;
          }
        }
      `}</style>

      <div className="icontech-auth-card bg-white rounded-2xl sm:rounded-3xl max-w-4xl lg:max-w-5xl w-full shadow-2xl relative overflow-hidden border border-slate-100 max-h-[96vh] sm:max-h-[90vh] my-auto">
        
        {/* ================= MOBILE COMPACT BRANDING HEADER (Visible ONLY on mobile screens < 640px) ================= */}
        <div className="sm:hidden bg-[#07132c] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-blue-600 to-sky-400 p-0.5 flex items-center justify-center shrink-0 shadow-sm">
              <div className="w-full h-full bg-[#07132c] rounded-[6px] flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1 leading-none">
                ICON<span className="text-sky-400">TECH</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-300 mt-0.5">
                Gadgets &bull; Repairs &bull; More
              </div>
            </div>
          </div>
          {!isEmbedded && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ================= LEFT SIDE: BRANDED HERO BANNER (Desktop: ~45% width, hidden on mobile) ================= */}
        <div 
          className="icontech-auth-left bg-linear-to-b from-[#07132c] via-[#091838] to-[#040a17] text-white p-6 lg:p-7 flex flex-col justify-between relative shrink-0 overflow-hidden"
          style={{ backgroundColor: '#07132c' }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-0 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand & Value Proposition Block */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-4 lg:mb-5">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#07132c] rounded-[10px] flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="text-xl font-black tracking-tight text-white flex items-center gap-1 leading-tight">
                  ICON<span className="text-sky-400">TECH</span>
                </div>
                <div className="text-[10px] font-bold tracking-wider text-slate-300">
                  Gadgets &bull; Repairs &bull; More
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl lg:text-[26px] font-black text-white leading-tight tracking-tight">
              Your Trusted <br />
              <span className="text-sky-400">Gadget Store &amp;</span> <br />
              <span className="text-sky-400">Repair Partner</span>
            </h2>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-normal">
              Buy genuine gadgets, get expert repairs, and enjoy reliable service — all in one place.
            </p>

            {/* 3 Pillars / Service Highlights */}
            <div className="space-y-2.5 mt-4 lg:mt-5">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Genuine Products</div>
                  <div className="text-[11px] text-slate-400">100% original gadgets</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Wrench className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Expert Repairs</div>
                  <div className="text-[11px] text-slate-400">Skilled &amp; certified technicians</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Fast &amp; Reliable</div>
                  <div className="text-[11px] text-slate-400">Quick delivery &amp; support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Gadgets Showcase Graphic (Desktop only, well-proportioned) */}
          <div className="relative z-10 pt-3 mt-auto">
            <img 
              src="/assets/login-gadgets.png" 
              alt="ICONTECH Gadgets Ecosystem & Tech Made Simple" 
              className="w-full h-auto rounded-xl object-contain drop-shadow-xl max-h-36 lg:max-h-40 mx-auto"
            />
          </div>
        </div>

        {/* ================= RIGHT SIDE: AUTHENTICATION FORM (Desktop: ~55% width, Mobile: 100%) ================= */}
        <div className="icontech-auth-right p-5 sm:p-6 lg:p-7 bg-white flex flex-col justify-between overflow-y-auto relative">
          
          {/* Close Button (Desktop Only) */}
          {!isEmbedded && (
            <button
              onClick={onClose}
              className="hidden sm:block absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div>
            {/* Top Mode Toggle Link */}
            <div className="flex items-center justify-between pr-8 sm:pr-10 mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-slate-500">
                {mode === 'signin' ? 'New customer?' : 'Already have an account?'}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[11px] sm:text-xs font-bold text-[#0066ff] hover:underline"
              >
                {mode === 'signin' ? 'Create Account' : 'Log In'}
              </button>
            </div>

            {/* Heading & Subtitle */}
            <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight">
              {role === 'admin' 
                ? 'Staff & Technician Portal' 
                : mode === 'signin' 
                  ? 'Welcome Back' 
                  : 'Create an Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {role === 'admin'
                ? 'Authorized access for ICONTECH service specialists and store managers'
                : mode === 'signin'
                  ? 'Log in to your ICONTECH account'
                  : 'Register to place orders and track gadget repair tickets'}
            </p>

            {/* Segmented Role Tabs: Customer vs Technician/Admin */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mt-4 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setRole('customer');
                  setFormError(null);
                  setInfoMessage(null);
                }}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  role === 'customer'
                    ? 'bg-[#0066ff] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('admin');
                  setFormError(null);
                  setInfoMessage(null);
                }}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                  role === 'admin'
                    ? 'bg-[#0066ff] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Technician / Admin</span>
              </button>
            </div>

            {/* Error Alert */}
            {activeError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2 mb-3.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{activeError}</span>
              </div>
            )}

            {/* Info Message */}
            {infoMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs flex items-start space-x-2 mb-3.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{infoMessage}</span>
              </div>
            )}

            {/* ================= ROLE: TECHNICIAN / ADMIN VIEW ================= */}
            {role === 'admin' ? (
              <div className="space-y-4 my-2">
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Firestore Security Protected</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Authorized Administrator Access Only. Please sign in with your verified ICONTECH administrative Google account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full h-12 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center space-x-3 transition shadow-xs bg-white"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Authorized Google Account</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Need technician credentials? Contact the store manager opposite Adeyemi College, Ondo.
                </p>
              </div>
            ) : (
              /* ================= ROLE: CUSTOMER VIEW ================= */
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name (Sign Up only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oluwaseun Adeleke"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 text-sm border border-slate-300 rounded-xl focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 focus:outline-hidden transition"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                )}

                {/* Email or Phone Number Input */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 07039420600 or your email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 text-sm border border-slate-300 rounded-xl focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 focus:outline-hidden font-medium transition"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-sm border border-slate-300 rounded-xl focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 focus:outline-hidden transition"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-3"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Sign Up only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-10 text-sm border border-slate-300 rounded-xl focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20 focus:outline-hidden transition"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-3"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password (Sign In only) */}
                {mode === 'signin' && (
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#0066ff] focus:ring-[#0066ff] mr-2"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-semibold text-[#0066ff] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Primary Action Button (Prominent & Mobile Touch Friendly) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-[#0066ff] hover:bg-[#0052cc] active:bg-[#0047b3] text-white font-black text-sm rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:bg-slate-400 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{mode === 'signin' ? 'Logging in...' : 'Creating Account...'}</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>{mode === 'signin' ? 'Log In' : 'Create Account'}</span>
                    </>
                  )}
                </button>

                {/* "OR" Divider */}
                <div className="relative my-3 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    OR
                  </span>
                </div>

                {/* Social Login Options */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isSubmitting}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2.5 transition bg-white"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAppleSignIn}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-2.5 transition bg-white"
                  >
                    <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.77-11.66-14.19-5.74-8.8-10.23-18.78-13.48-29.95-3.25-11.16-4.88-21.84-4.88-32.04 0-14.35 3.65-26.06 10.96-35.14 7.3-9.08 16.58-13.73 27.83-13.94 4.58 0 9.77 1.15 15.58 3.44 5.81 2.3 9.68 3.52 11.61 3.67 1.93-.15 5.92-1.42 11.97-3.81 6.04-2.39 11.06-3.44 15.06-3.17 11.09.64 19.86 4.38 26.31 11.23 6.45 6.84 10.63 15.09 12.53 24.74-9.78 5.86-14.61 13.97-14.5 24.33.11 8.24 3.28 15.19 9.5 20.84 6.22 5.66 13.76 9.17 22.61 10.53-.87 2.83-1.9 5.8-3.08 8.91zM119.22 31.81c0-7.39 2.66-14.42 7.99-21.09 5.33-6.68 12.01-10.58 20.03-11.72.33 1.96.49 3.81.49 5.56 0 7.39-2.78 14.48-8.33 21.27-5.55 6.8-12.28 10.74-20.18 11.83v-5.85z" />
                    </svg>
                    <span>Continue with Apple</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ================= BOTTOM: COMPACT SECURITY INFORMATION ================= */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="bg-sky-50/70 border border-sky-100/90 rounded-xl px-3 py-2 flex items-center space-x-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#0066ff] shrink-0" />
              <div className="text-slate-600 text-[11px] leading-tight">
                <span className="font-bold text-slate-800">Your information is secure</span> &bull; Protected by industry-standard encryption.
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );

  // If embedded in a page, render without black backdrop overlay
  if (isEmbedded) {
    return (
      <div className="w-full flex items-center justify-center p-2 sm:p-4">
        {authCardContent}
      </div>
    );
  }

  // Modal display: clean dark overlay without performance-heavy or blurry backdrop filters
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {authCardContent}
    </div>
  );
};
