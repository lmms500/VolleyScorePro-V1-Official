
import { useCallback } from 'react';
import { Haptics, ImpactStyle as CapImpactStyle, NotificationType as CapNotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

type ImpactStyle = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'warning' | 'error';

export const useHaptics = (enabled: boolean = true) => {
  const isNative = Capacitor.isNativePlatform();

  const trigger = useCallback(async (pattern: number | number[]) => {
    if (!enabled) return;
    
    try {
        if (isNative) {
            // Native: Use generic vibrate for custom patterns only if needed, 
            // but prefer impact/notification for best UX.
            // Capacitor vibrate takes duration in ms.
            await Haptics.vibrate({ duration: Array.isArray(pattern) ? pattern[0] : pattern });
        } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
            // Web: Full pattern support
            navigator.vibrate(pattern);
        }
    } catch (e) {
        // Fail silently - haptics are enhancement, not critical
        // console.warn("Haptics failed", e);
    }
  }, [enabled, isNative]);

  // Mimic iOS UIImpactFeedbackGenerator styles
  const impact = useCallback(async (style: ImpactStyle) => {
    if (!enabled) return;

    try {
        if (isNative) {
            let capStyle = CapImpactStyle.Medium;
            if (style === 'light') capStyle = CapImpactStyle.Light;
            if (style === 'heavy') capStyle = CapImpactStyle.Heavy;
            
            await Haptics.impact({ style: capStyle });
        } else {
            // Web Fallback: Simulate weight with duration
            switch (style) {
              case 'light': trigger(10); break;
              case 'medium': trigger(15); break;
              case 'heavy': trigger(25); break;
            }
        }
    } catch (e) {
        // Ignore
    }
  }, [trigger, enabled, isNative]);

  // Mimic iOS UINotificationFeedbackGenerator styles
  const notification = useCallback(async (type: NotificationType) => {
    if (!enabled) return;

    try {
        if (isNative) {
            let capType = CapNotificationType.Success;
            if (type === 'warning') capType = CapNotificationType.Warning;
            if (type === 'error') capType = CapNotificationType.Error;

            await Haptics.notification({ type: capType });
        } else {
            // Web Fallback: Distinct patterns
            switch (type) {
              case 'success': trigger([10, 30, 10]); break; // Double tap
              case 'warning': trigger([30, 50, 30]); break; // Long-short-long
              case 'error': trigger([50, 100, 50, 100, 50]); break; // Triple heavy
            }
        }
    } catch (e) {
        // Ignore
    }
  }, [trigger, enabled, isNative]);

  return { impact, notification, trigger };
};
