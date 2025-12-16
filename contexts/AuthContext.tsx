
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isFirebaseInitialized } from '../services/firebase';
import { Capacitor } from '@capacitor/core';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseInitialized || !auth) {
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseInitialized || !auth || !googleProvider) {
        console.warn("Firebase not configured. Cannot sign in.");
        alert("Sync is not available. Please configure Firebase API Keys.");
        return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!isFirebaseInitialized || !auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
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
