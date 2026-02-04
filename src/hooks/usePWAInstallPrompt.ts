
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<IBeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // 🛡️ NATIVE KILL SWITCH
    if (isNative) {
        setIsIOS(false);
        setIsStandalone(true); 
        return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIPad = navigator.maxTouchPoints > 0 && /macintosh/.test(userAgent);
    setIsIOS(/iphone|ipad|ipod/.test(userAgent) || isIPad);

    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as IBeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isNative]);

  const promptInstall = useCallback(async () => {
    if (isNative || !deferredPrompt) return;

    try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    } catch (e) {
        console.warn("PWA Prompt failed", e);
    }
  }, [deferredPrompt, isNative]);

  return {
    isInstallable: !!deferredPrompt && !isStandalone && !isNative,
    isIOS: isIOS && !isStandalone && !isNative,
    isStandalone: isStandalone || isNative, 
    promptInstall
  };
};
