
import { useCallback, useRef } from 'react';
import { Haptics, ImpactStyle as CapImpactStyle, NotificationType as CapNotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

type ImpactStyle = 'light' | 'medium' | 'heavy';
type NotificationType = 'success' | 'warning' | 'error';

export const useHaptics = (enabled: boolean = true) => {
  const isNative = Capacitor.isNativePlatform();
  const lastCallRef = useRef<number>(0);
  
  // Throttle: 100ms de intervalo mínimo entre vibrações
  const canTrigger = useCallback(() => {
    const now = Date.now();
    if (now - lastCallRef.current < 100) return false;
    lastCallRef.current = now;
    return true;
  }, []);

  const trigger = useCallback(async (pattern: number | number[]) => {
    if (!enabled || !canTrigger()) return;
    
    try {
      if (isNative) {
        await Haptics.vibrate({ duration: Array.isArray(pattern) ? pattern[0] : pattern });
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      // Falha silenciosa para manter estabilidade
    }
  }, [enabled, isNative, canTrigger]);

  const impact = useCallback(async (style: ImpactStyle) => {
    if (!enabled || !isNative || !canTrigger()) return;

    try {
      let capStyle = CapImpactStyle.Medium;
      if (style === 'light') capStyle = CapImpactStyle.Light;
      if (style === 'heavy') capStyle = CapImpactStyle.Heavy;
      
      await Haptics.impact({ style: capStyle });
    } catch (e) {}
  }, [enabled, isNative, canTrigger]);

  const notification = useCallback(async (type: NotificationType) => {
    if (!enabled || !isNative || !canTrigger()) return;

    try {
      let capType = CapNotificationType.Success;
      if (type === 'warning') capType = CapNotificationType.Warning;
      if (type === 'error') capType = CapNotificationType.Error;

      await Haptics.notification({ type: capType });
    } catch (e) {}
  }, [enabled, isNative, canTrigger]);

  return { impact, notification, trigger };
};
