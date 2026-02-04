
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, terminate, persistentLocalCache, persistentMultipleTabManager, initializeFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION ENGINE
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validation: Log missing keys in production
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('[Firebase] Configuration missing or invalid key.', {
    apiKey: firebaseConfig.apiKey ? '✓' : '✗',
    authDomain: firebaseConfig.authDomain ? '✓' : '✗',
    projectId: firebaseConfig.projectId ? '✓' : '✗',
    storageBucket: firebaseConfig.storageBucket ? '✓' : '✗',
    messagingSenderId: firebaseConfig.messagingSenderId ? '✓' : '✗',
    appId: firebaseConfig.appId ? '✓' : '✗'
  });
}

export let isFirebaseInitialized = false;

let app;
let authExport: any = null;
let googleProviderExport: any = null;
let dbExport: any = null;

const initialize = async () => {
    try {
        if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIzaSy')) {
            if (!getApps().length) {
                app = initializeApp(firebaseConfig);
            } else {
                app = getApp();
            }
            
            authExport = getAuth(app);
            googleProviderExport = new GoogleAuthProvider();
            
            // Modern Firestore with persistent cache (replaces enableIndexedDbPersistence)
            dbExport = initializeFirestore(app, {
                localCache: persistentLocalCache({
                    tabManager: persistentMultipleTabManager()
                })
            });

            isFirebaseInitialized = true;
            console.log("[Firebase] 100% Operational.");
        } else {
            console.warn("[Firebase] Configuration missing or invalid key.");
        }
    } catch (e) {
        console.error("[Firebase] Fatal Initialization Error:", e);
    }
};

// Immediate invocation
initialize();

export const auth = authExport;
export const googleProvider = googleProviderExport;
export const db = dbExport;
