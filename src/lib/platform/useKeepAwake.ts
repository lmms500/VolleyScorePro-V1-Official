
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const useKeepAwake = (shouldKeepAwake: boolean) => {
  const isNative = Capacitor.isNativePlatform();
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const lockScreen = async () => {
      try {
        if (shouldKeepAwake) {
          if (isNative) {
            await KeepAwake.keepAwake();
          } else if ('wakeLock' in navigator) {
            // Web Fallback: WakeLock API
            if (!wakeLockRef.current) {
              wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            }
          }
        } else {
          if (isNative) {
            await KeepAwake.allowSleep();
          } else if (wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
          }
        }
      } catch (err) {
        console.debug('[KeepAwake] Guard triggered:', err);
      }
    };

    lockScreen();

    const handleVisibility = () => {
      if (!isNative && shouldKeepAwake && document.visibilityState === 'visible') {
        lockScreen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (isNative) {
        KeepAwake.allowSleep().catch(() => {});
      } else if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [shouldKeepAwake, isNative]);
};
