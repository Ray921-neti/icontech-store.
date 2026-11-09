import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { CustomerProfile } from '../types';
import { 
  normalizeNigerianPhone, 
  phoneToAuthEmail 
} from '../utils/formatters';
import { 
  fetchCustomerProfile, 
  saveCustomerProfile, 
  updateCustomerProfile 
} from '../services/storeService';

interface AuthContextType {
  user: User | null;
  customerProfile: CustomerProfile | null;
  isCustomer: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  customerSignUp: (name: string, phone: string, password: string) => Promise<CustomerProfile>;
  customerSignIn: (phoneOrEmail: string, password: string) => Promise<CustomerProfile>;
  customerSignOut: () => Promise<void>;
  updateCustomerProfileData: (updates: Partial<CustomerProfile>) => Promise<void>;
  resetPassword: (identifier: string) => Promise<string>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
  adminEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRIMARY_ADMIN_EMAIL = 'raydiamond108@gmail.com';
const CUSTOMER_SESSION_KEY = 'icontech_customer_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAdminDoc, setIsAdminDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Sync auth state and load customer profile from Firestore
  useEffect(() => {
    // Process redirect result if returning from signInWithRedirect (e.g. mobile/Android)
    getRedirectResult(auth)
      .then((cred) => {
        if (cred?.user) {
          console.log('Successfully completed Google sign-in via redirect:', cred.user.email);
        }
      })
      .catch((err: unknown) => {
        console.error('Redirect sign-in error:', err);
        const code = (err as { code?: string })?.code || '';
        const rawMsg = err instanceof Error ? err.message : 'Google redirect sign-in failed.';
        let message = rawMsg;
        if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
          message = 'Firebase Error (auth/unauthorized-domain): This domain (icontech-store.vercel.app) is not authorized in Firebase Authentication. Please add "icontech-store.vercel.app" to Firebase Console > Authentication > Settings > Authorized domains.';
        }
        setError(message);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Verify if user identity is recorded in the Firestore /admins/{uid} registry
        try {
          const adminRef = doc(db, 'admins', currentUser.uid);
          const adminSnap = await getDoc(adminRef);
          setIsAdminDoc(adminSnap.exists());
        } catch {
          setIsAdminDoc(false);
        }

        // Try fetching customer profile for this UID
        try {
          const profile = await fetchCustomerProfile(currentUser.uid);
          if (profile) {
            setCustomerProfile(profile);
            try {
              localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(profile));
            } catch (e) {
              console.warn('Storage warning', e);
            }
          }
        } catch (e) {
          console.warn('Could not load customer profile', e);
        }
      } else {
        setIsAdminDoc(false);
        // Only clear customer profile if not an offline fallback session
        if (!localStorage.getItem(CUSTOMER_SESSION_KEY)) {
          setCustomerProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Strictly ONE Super Administrator: only the verified owner account
  // No customer elevation, no secondary or staff accounts
  const isAdmin = Boolean(
    user !== null && 
    user.email && 
    user.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
  );

  const isCustomer = Boolean(customerProfile !== null);

  // 1. Customer Sign Up with Nigerian Phone + Password
  const customerSignUp = async (name: string, phone: string, password: string): Promise<CustomerProfile> => {
    setError(null);

    if (!name.trim()) {
      const err = 'Please enter your full name.';
      setError(err);
      throw new Error(err);
    }

    const phoneValidation = normalizeNigerianPhone(phone);
    if (!phoneValidation.isValid) {
      const err = phoneValidation.error || 'Invalid Nigerian phone number.';
      setError(err);
      throw new Error(err);
    }

    if (!password || password.length < 6) {
      const err = 'Password must be at least 6 characters.';
      setError(err);
      throw new Error(err);
    }

    const emailIdentifier = phoneToAuthEmail(phoneValidation.normalized);

    try {
      const cred = await createUserWithEmailAndPassword(auth, emailIdentifier, password);
      const newProfile: CustomerProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        phone: phoneValidation.formatted,
        normalizedPhone: phoneValidation.normalized,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveCustomerProfile(newProfile);
      setCustomerProfile(newProfile);
      try {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(newProfile));
      } catch (e) {
        console.warn('Storage warning', e);
      }
      return newProfile;
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      let message = 'Failed to create account. Please check details.';
      if (err instanceof Error) {
        if (err.message.includes('email-already-in-use')) {
          message = 'An account with this Nigerian phone number already exists. Please sign in instead.';
        } else if (err.message.includes('weak-password')) {
          message = 'Password is too weak. Please use at least 6 characters.';
        } else {
          message = err.message;
        }
      }
      setError(message);
      throw new Error(message);
    }
  };

  // 2. Customer Sign In with Nigerian Phone + Password
  const customerSignIn = async (phone: string, password: string): Promise<CustomerProfile> => {
    setError(null);

    const phoneValidation = normalizeNigerianPhone(phone);
    if (!phoneValidation.isValid) {
      const err = phoneValidation.error || 'Please enter a valid Nigerian phone number.';
      setError(err);
      throw new Error(err);
    }

    if (!password) {
      const err = 'Please enter your password.';
      setError(err);
      throw new Error(err);
    }

    const emailIdentifier = phoneToAuthEmail(phoneValidation.normalized);

    try {
      const cred = await signInWithEmailAndPassword(auth, emailIdentifier, password);
      let profile = await fetchCustomerProfile(cred.user.uid);

      if (!profile) {
        // Self-heal profile if needed
        profile = {
          uid: cred.user.uid,
          name: 'Customer',
          phone: phoneValidation.formatted,
          normalizedPhone: phoneValidation.normalized,
          createdAt: new Date().toISOString(),
        };
        await saveCustomerProfile(profile);
      }

      setCustomerProfile(profile);
      try {
        localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(profile));
      } catch (e) {
        console.warn('Storage warning', e);
      }
      return profile;
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      let message = 'Invalid phone number or password. Please verify your credentials.';
      if (err instanceof Error) {
        if (err.message.includes('user-not-found') || err.message.includes('wrong-password') || err.message.includes('invalid-credential')) {
          message = 'Incorrect phone number or password. Please try again or create an account.';
        } else {
          message = err.message;
        }
      }
      setError(message);
      throw new Error(message);
    }
  };

  // 3. Customer Sign Out
  const customerSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setCustomerProfile(null);
    try {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    } catch (e) {
      console.warn('Storage warning', e);
    }
  };

  // 4. Update Profile
  const updateCustomerProfileData = async (updates: Partial<CustomerProfile>) => {
    if (!customerProfile) return;
    const nextProfile = { ...customerProfile, ...updates, updatedAt: new Date().toISOString() };
    setCustomerProfile(nextProfile);
    try {
      localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(nextProfile));
    } catch (e) {
      console.warn('Storage warning', e);
    }
    await updateCustomerProfile(customerProfile.uid, updates);
  };

  // Password Reset Helper
  const resetPassword = async (identifier: string): Promise<string> => {
    setError(null);
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      await sendPasswordResetEmail(auth, trimmed);
      return `Password reset link sent to ${trimmed}. Please check your inbox.`;
    } else {
      const normalized = normalizeNigerianPhone(trimmed);
      if (!normalized) {
        throw new Error('Please enter a valid email address or 11-digit Nigerian phone number.');
      }
      return 'For phone-registered accounts, please message ICONTECH Support on WhatsApp at 07039420600 to verify and reset your PIN.';
    }
  };

  // Admin Google Sign In (Popup with automatic fallback to redirect on mobile/Android)
  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const rawMsg = err instanceof Error ? err.message : 'Google sign-in failed';
      console.error('Sign-in error:', err);

      // On Android and mobile browsers, popups are frequently blocked. Automatically attempt redirect.
      if (
        code === 'auth/popup-blocked' || 
        code === 'auth/cancelled-popup-request' ||
        rawMsg.includes('popup-blocked')
      ) {
        console.log('Popup was blocked by the browser. Falling back to redirect mode...');
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error('Redirect fallback error:', redirectErr);
        }
      }

      let message = rawMsg;
      if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
        message = 'Firebase Error (auth/unauthorized-domain): This domain (icontech-store.vercel.app) is not authorized in Firebase Authentication. Please add "icontech-store.vercel.app" to Firebase Console > Authentication > Settings > Authorized domains.';
      } else if (code === 'auth/popup-blocked') {
        message = 'The Google login popup was blocked by your browser. Please allow popups or use "Sign in with Google (Redirect Mode)".';
      } else if (code === 'auth/popup-closed-by-user') {
        message = 'Sign-in window was closed before completion.';
      }

      setError(message);
      throw new Error(message);
    }
  };

  // Explicit Direct Redirect Sign In for Android / Mobile
  const signInWithGoogleRedirect = async () => {
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const rawMsg = err instanceof Error ? err.message : 'Google redirect sign-in failed';
      let message = rawMsg;
      if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
        message = 'Firebase Error (auth/unauthorized-domain): This domain (icontech-store.vercel.app) is not authorized in Firebase Authentication. Please add "icontech-store.vercel.app" to Firebase Console > Authentication > Settings > Authorized domains.';
      }
      setError(message);
      throw new Error(message);
    }
  };

  // Universal Sign Out (including admin)
  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setCustomerProfile(null);
    setIsAdminDoc(false);
    try {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customerProfile,
        isCustomer,
        isAdmin,
        isLoading,
        error,
        customerSignUp,
        customerSignIn,
        customerSignOut,
        updateCustomerProfileData,
        resetPassword,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signOutUser,
        clearError,
        adminEmail: user?.email ? user.email : 'Authorized Administrator',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
