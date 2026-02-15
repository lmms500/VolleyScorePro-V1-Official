
import { useState, useEffect } from 'react';
import { platformService, IPlatformCapabilities } from '@lib/platform/PlatformService';
import { Capacitor } from '@capacitor/core';

export interface PlatformState extends IPlatformCapabilities {
  platform: 'ios' | 'android' | 'web';
}

export const usePlatform = (): PlatformState => {
  const [state, setState] = useState<PlatformState>(() => ({
    isNative: platformService.isNative,
    isWeb: platformService.isWeb,
    isIOS: platformService.isIOS,
    isAndroid: platformService.isAndroid,
    isPWA: platformService.isPWA,
    isStandalone: platformService.isStandalone,
    platform: Capacitor.getPlatform() as 'ios' | 'android' | 'web'
  }));

  useEffect(() => {
    const handleResize = () => {
      // Re-check standalone status on resize/orientation change (edge cases)
      // We essentially force a re-read from the service which handles caching, 
      // but strictly for React reactivity we set state again if needed.
      setState({
        isNative: platformService.isNative,
        isWeb: platformService.isWeb,
        isIOS: platformService.isIOS,
        isAndroid: platformService.isAndroid,
        isPWA: platformService.isPWA,
        isStandalone: platformService.isStandalone,
        platform: Capacitor.getPlatform() as 'ios' | 'android' | 'web'
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
};
