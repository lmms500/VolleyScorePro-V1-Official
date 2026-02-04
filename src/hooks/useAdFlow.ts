
import { useState, useCallback } from 'react';
import { adService } from '../services/AdService';
import { useTranslation } from '../contexts/LanguageContext';

interface UseAdFlowReturn {
  showAdConfirm: boolean;
  triggerSupportAd: (onComplete: () => void) => void;
  confirmWatchAd: () => void;
  cancelWatchAd: () => void;
  isAdLoading: boolean;
}

export const useAdFlow = (): UseAdFlowReturn => {
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [isAdLoading, setIsAdLoading] = useState(false);
  
  const triggerSupportAd = useCallback((onComplete: () => void) => {
    // 50% chance to ask for support (Soft Monetization)
    // Or ask every time? Requirements say "User-Friendly", so maybe every time but strictly opt-in.
    // Let's ask every time for now as it's explicit Opt-in.
    setPendingCallback(() => onComplete);
    setShowAdConfirm(true);
  }, []);

  const confirmWatchAd = useCallback(async () => {
    setShowAdConfirm(false);
    setIsAdLoading(true);
    
    try {
        await adService.showInterstitial();
    } catch (e) {
        console.error("Ad failed", e);
    } finally {
        setIsAdLoading(false);
        // Execute callback regardless of ad success (don't block user flow)
        if (pendingCallback) pendingCallback();
        setPendingCallback(null);
    }
  }, [pendingCallback]);

  const cancelWatchAd = useCallback(() => {
    setShowAdConfirm(false);
    if (pendingCallback) pendingCallback();
    setPendingCallback(null);
  }, [pendingCallback]);

  return {
    showAdConfirm,
    triggerSupportAd,
    confirmWatchAd,
    cancelWatchAd,
    isAdLoading
  };
};
