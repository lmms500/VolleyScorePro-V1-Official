
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, getRedirectResult, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider, isFirebaseInitialized } from '../services/firebase';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

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
    // Debug checks
    if (!isFirebaseInitialized) {
      console.error("[Auth] Firebase failed to initialize.");
      const missingKeys = [];
      if (!import.meta.env.VITE_FIREBASE_API_KEY) missingKeys.push('VITE_FIREBASE_API_KEY');
      if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
      if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) missingKeys.push('VITE_FIREBASE_PROJECT_ID');

      if (missingKeys.length > 0) {
        alert(`Erro de Configuração: As seguintes chaves estão faltando no arquivo .env:\n\n${missingKeys.join('\n')}`);
      } else {
        alert("Erro de Inicialização do Firebase. Verifique o console para mais detalhes.");
      }
      return;
    }

    if (!auth || !googleProvider) {
      console.warn("[Auth] Firebase init passed but auth/provider is null.");
      alert("Erro Interno: Serviço de autenticação não disponível.");
      return;
    }

    try {
      setLoading(true);
      console.log("[Auth] Starting Google Sign-In...");

      // Native platforms use the Native Plugin (Fix for 'localhost' 403 error on Android)
      if (Capacitor.isNativePlatform()) {
        console.log("[Auth] Using Native Plugin flow (Android/iOS)");

        // 1. Native Sign-In
        const result = await FirebaseAuthentication.signInWithGoogle();

        // 2. Create Credential from ID Token
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);

        // 3. Sign-in to Firebase JS SDK (required for 'auth' object sync)
        const userCredential = await signInWithCredential(auth, credential);

        console.log("[Auth] Native Sign-in successful:", userCredential.user.displayName);
        setUser(userCredential.user);
      } else {
        console.log("[Auth] Using popup flow for web");
        // Force popup for all web (including mobile web) to avoid redirect issues on localhost
        const result = await signInWithPopup(auth, googleProvider);
        console.log("[Auth] Sign-in successful:", result.user.displayName);
        setUser(result.user);
      }
    } catch (error: any) {
      console.error("[Auth] Google Sign-In Failed:", error);

      // Mensagens de erro mais específicas
      if (error.code === 'auth/popup-closed-by-user') {
        // Ignorar silêncioso ou toast leve
        console.log("Login cancelado pelo usuário.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("Pop-up bloqueado pelo navegador. Por favor, permita pop-ups para este site (ícone na barra de endereço).");
      } else if (error.code === 'auth/unauthorized-domain') {
        alert(`Domínio não autorizado: ${window.location.hostname}\n\nAdicione este domínio em: Firebase Console -> Authentication -> Settings -> Authorized Domains`);
      } else if (error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.') {
        alert("Chave de API Inválida. Verifique VITE_FIREBASE_API_KEY no arquivo .env");
      } else if (error.code === 'auth/operation-not-allowed') {
        alert("Login com Google não está ativado no Firebase Console.\n\nVá em Authentication -> Sign-in method e ative o provedor Google.");
      } else {
        alert(`Erro ao fazer login (${error.code}): ${error.message}\n\nVeja o console (F12) para detalhes técnicos.`);
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
