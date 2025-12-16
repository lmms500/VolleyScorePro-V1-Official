
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// Supports Vite (import.meta.env) and Standard (process.env)
// ------------------------------------------------------------------

const getEnv = (key: string) => {
  // 1. Check Vite 'import.meta.env' (Modern Web)
  // Cast to any to bypass TS check for 'env' on ImportMeta
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env) {
    return meta.env[key] || meta.env[`VITE_${key}`];
  }
  // 2. Check Standard 'process.env' (Legacy/Test)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || process.env[`VITE_${key}`];
  }
  return undefined;
};

const apiKey = getEnv('FIREBASE_API_KEY');

const firebaseConfig = {
  apiKey: apiKey || "AIzaSy...", // Placeholder detection
  authDomain: "volleyscore-pro.firebaseapp.com",
  projectId: "volleyscore-pro",
  storageBucket: "volleyscore-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

export let isFirebaseInitialized = false;

let app;
let authExport;
let googleProviderExport;
let dbExport;

try {
    // Robust check: Ensure key exists and is not the default placeholder
    if (apiKey && !apiKey.startsWith('AIzaSy') && apiKey !== 'undefined') {
        app = initializeApp(firebaseConfig);
        authExport = getAuth(app);
        googleProviderExport = new GoogleAuthProvider();
        dbExport = getFirestore(app);
        isFirebaseInitialized = true;
        console.log("[Firebase] Initialized successfully.");
    } else {
        throw new Error("Missing or placeholder API Key");
    }
} catch (e) {
    console.warn("[Firebase] Initialization skipped:", (e as Error).message);
    
    // Mocks are kept minimal. Consuming services MUST check 'isFirebaseInitialized'.
    // Passing these mocks to actual Firebase SDK functions (like getDocs) will still fail,
    // so guards in services are mandatory.
    authExport = null;
    googleProviderExport = null;
    dbExport = null;
    isFirebaseInitialized = false;
}

export const auth = authExport;
export const googleProvider = googleProviderExport;
export const db = dbExport;