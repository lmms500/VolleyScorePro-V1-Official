
import { useState, useEffect, useCallback } from 'react';
import { usePWAInstallPrompt } from './usePWAInstallPrompt';
import { Capacitor } from '@capacitor/core';

export const useServiceWorker = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { isInstallable, promptInstall, isIOS, isStandalone } = usePWAInstallPrompt();

  const isNative = Capacitor.isNativePlatform();

  // 🛡️ NATIVE GUARD: If strictly native, return inert state immediately.
  // This prevents any PWA UI (Update Buttons, Install Prompts) from leaking into the App Store build.
  if (isNative) {
      return {
          needRefresh: false,
          offlineReady: false,
          updateServiceWorker: () => {},
          checkForUpdates: () => Promise.resolve(),
          closePrompt: () => {},
          isChecking: false,
          isInstallable: false, // Strict false for Native
          promptInstall: () => Promise.resolve(),
          isIOS: false,
          isStandalone: true // Native behaves like Standalone
      };
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const updateSW = async () => {
          try {
              const reg = await navigator.serviceWorker.getRegistration();
              if (reg) {
                  setRegistration(reg);
                  if (reg.waiting) setNeedRefresh(true);
              }
          } catch (error) {
              console.warn('Service Worker registration check failed:', error);
          }
      };
      
      updateSW();

      // Listen for controller change (NEW SW activated)
      // Only reload if user explicitly requested update via updateServiceWorker()
      let isUserInitiatedUpdate = false;
      
      const handleControllerChange = () => {
        if (isUserInitiatedUpdate) {
          window.location.reload();
        }
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Store reference to mark user-initiated updates
      (window as any).__markSWUpdateAsUserInitiated = () => {
        isUserInitiatedUpdate = true;
      };

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        delete (window as any).__markSWUpdateAsUserInitiated;
      };
    }
  }, []);

  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;
    
    setIsChecking(true);
    try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
            await reg.update();
            if (reg.waiting || reg.installing) {
                setNeedRefresh(true);
            }
            setRegistration(reg);
        }
    } catch (e) {
        console.error("Failed to check for updates:", e);
    } finally {
        setTimeout(() => setIsChecking(false), 500);
    }
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      // Mark that this is a user-initiated update, so we can reload on controller change
      if ((window as any).__markSWUpdateAsUserInitiated) {
        (window as any).__markSWUpdateAsUserInitiated();
      }
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    checkForUpdates,
    closePrompt,
    isChecking,
    isInstallable,
    promptInstall,
    isIOS,
    isStandalone
  };
};
