
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
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

    // 1. Handle Redirect Result (Crucial for Native/Mobile Chrome flows)
    getRedirectResult(auth).then((result) => {
        if (result?.user) {
            console.log("[Auth] Redirect sign-in success:", result.user.displayName);
            setUser(result.user);
        }
    }).catch((error) => {
        console.error("[Auth] Redirect error:", error);
    });

    // 2. Main Observer
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseInitialized || !auth || !googleProvider) {
        console.warn("[Auth] Firebase not initialized. Login unavailable.");
        alert("Firebase não está configurado corretamente. Verifique a configuração no arquivo .env");
        return;
    }

    try {
      setLoading(true);
      console.log("[Auth] Starting Google Sign-In...");
      
      // Native platforms or small screens prefer redirect for better UX and reliability
      if (Capacitor.isNativePlatform() || window.innerWidth < 768) {
        console.log("[Auth] Using redirect flow for mobile/native");
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.log("[Auth] Using popup flow for desktop");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("[Auth] Sign-in successful:", result.user.displayName);
        setUser(result.user);
      }
    } catch (error: any) {
      console.error("[Auth] Google Sign-In Failed:", error);
      
      // Mensagens de erro mais específicas
      if (error.code === 'auth/popup-closed-by-user') {
        alert("Login cancelado. Por favor, tente novamente.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("Pop-up bloqueado pelo navegador. Por favor, permita pop-ups para este site.");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert("Domínio não autorizado. Configure o domínio no Firebase Console.\n\nVeja o arquivo GOOGLE_AUTH_FIX.md para instruções.");
      } else {
        alert(`Erro ao fazer login: ${error.message}\n\nVeja o console para mais detalhes.`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseInitialized || !auth) return;
    try {
        await signOut(auth);
        setUser(null);
    } catch (e) {
        console.error("[Auth] Logout error:", e);
    }
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
