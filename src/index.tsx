
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';

// [LOTE 8.2] StatusBar configuration REMOVED
// The custom SystemUi plugin in MainActivity.java handles edge-to-edge and immersive mode.
// Using Capacitor's StatusBar plugin here conflicts with our native implementation.

// Suppress Chrome extension message channel errors (Service Worker noise)
globalThis.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('message channel closed')) {
    event.preventDefault();
  }
});

// DEBUG: Log initialization
console.log('🚀 App initializing...', { NODE_ENV: process.env.NODE_ENV });
console.log('Root element:', document.getElementById('root'));

// --- SECURITY CONTEXT INITIALIZATION ---
// Strip console logs in production/native environments to prevent sensitive data leakage.
// This is critical for avoiding PII leaks via logcat/xcode logs.
if (process.env.NODE_ENV === 'production' || (Capacitor.isNativePlatform() && !(import.meta as any).env.DEV)) {
  const noop = () => { };
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  // We keep console.error and console.warn for critical crash reporting integration if needed
}

// Only register Service Worker if NOT native
// Wrapped in try-catch to prevent crashing app if CSP blocks dynamic import or script loading
if (!Capacitor.isNativePlatform()) {
  try {
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({ immediate: true });
    }).catch(e => {
      // Console debug is stripped in prod, so this is safe
      console.warn("PWA registration failed:", e);
    });
  } catch (e) {
    console.warn("PWA module import failed:", e);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
