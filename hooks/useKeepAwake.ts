
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

export const useKeepAwake = (shouldKeepAwake: boolean) => {
  const isNative = Capacitor.isNativePlatform();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const lockScreen = async () => {
      try {
        if (shouldKeepAwake) {
          if (isNative) {
            // Native Implementation
            await KeepAwake.keepAwake();
          } else {
            // Web Implementation (WakeLock API)
            if ('wakeLock' in navigator && !wakeLockRef.current) {
              wakeLockRef.current = await navigator.wakeLock.request('screen');
            }
          }
        } else {
          // Release Lock
          if (isNative) {
            await KeepAwake.allowSleep();
          } else {
            if (wakeLockRef.current) {
              await wakeLockRef.current.release();
              wakeLockRef.current = null;
            }
          }
        }
      } catch (err) {
        console.warn('KeepAwake failed:', err);
      }
    };

    lockScreen();

    // Re-acquire web lock on visibility change (tabs/minimizing clears it)
    const handleVisibilityChange = async () => {
      if (!isNative && shouldKeepAwake && document.visibilityState === 'visible') {
        lockScreen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Cleanup on unmount
      if (isNative) {
        KeepAwake.allowSleep().catch(() => {});
      } else {
        if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [shouldKeepAwake, isNative]);
};
