import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  loginWithAdminCode: (code: string) => boolean;
  signOutUser: () => Promise<void>;
  adminEmail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Bootstrapped authorized admin email
const PRIMARY_ADMIN_EMAIL = 'raydiamond108@gmail.com';
const ADMIN_PASSCODE = 'icontech2026';
const ADMIN_SESSION_KEY = 'icontech_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPasscodeAdmin, setHasPasscodeAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = Boolean(
    hasPasscodeAdmin || 
    (user !== null && (user.email === PRIMARY_ADMIN_EMAIL || (user.email ? user.email.endsWith('@icontech.ng') : false)))
  );

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      console.error('Sign-in error:', err);
      setError(msg);
      throw err;
    }
  };

  const loginWithAdminCode = (code: string): boolean => {
    if (code.trim() === ADMIN_PASSCODE) {
      setHasPasscodeAdmin(true);
      try {
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch (e) {
        console.warn('Storage error', e);
      }
      return true;
    }
    return false;
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setHasPasscodeAdmin(false);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        error,
        signInWithGoogle,
        loginWithAdminCode,
        signOutUser,
        adminEmail: PRIMARY_ADMIN_EMAIL,
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
