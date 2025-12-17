
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface PlatformState {
  isNative: boolean;      // Capacitor (Android/iOS)
  isPWA: boolean;         // Web Standalone (PWA Instalado)
  isWeb: boolean;         // Browser regular (Chrome, Safari, etc)
  isIOS: boolean;
  isAndroid: boolean;
  platform: 'ios' | 'android' | 'web';
}

export const usePlatform = (): PlatformState => {
  const [state, setState] = useState<PlatformState>(() => {
    const native = Capacitor.isNativePlatform();
    const plat = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
    
    // Detecção inicial síncrona para evitar saltos de UI
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true
    );

    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    
    return {
      isNative: native,
      isPWA: isStandalone && !native,
      isWeb: !isStandalone && !native,
      isIOS: /iphone|ipad|ipod/.test(ua),
      isAndroid: /android/.test(ua),
      platform: plat
    };
  });

  useEffect(() => {
    const checkPlatform = () => {
      const native = Capacitor.isNativePlatform();
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      const ua = navigator.userAgent.toLowerCase();

      setState({
        isNative: native,
        isPWA: isStandalone && !native,
        isWeb: !isStandalone && !native,
        isIOS: /iphone|ipad|ipod/.test(ua),
        isAndroid: /android/.test(ua),
        platform: Capacitor.getPlatform() as 'ios' | 'android' | 'web'
      });
    };

    window.addEventListener('resize', checkPlatform);
    return () => window.removeEventListener('resize', checkPlatform);
  }, []);

  return state;
};
