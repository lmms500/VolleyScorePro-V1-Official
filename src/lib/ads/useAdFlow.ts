
import { useState, useCallback } from 'react';
import { adService } from '@lib/ads/AdService';
import { logger } from '@lib/utils/logger';

interface UseAdFlowReturn {
  showAdConfirm: boolean;
  triggerSupportAd: (onComplete: () => void) => void;
  triggerMatchEndAd: (onComplete: () => void) => void;
  confirmWatchAd: () => void;
  cancelWatchAd: () => void;
  isAdLoading: boolean;
}

const MATCH_END_AD_PROBABILITY = 0.30;

export const useAdFlow = (): UseAdFlowReturn => {
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [isAdLoading, setIsAdLoading] = useState(false);

  const shouldShowMatchEndAd = useCallback(() => {
    // Respect AdService frequency cap (max per session + cooldown)
    if (!adService.canShowInterstitial()) return false;
    return Math.random() < MATCH_END_AD_PROBABILITY;
  }, []);

  const triggerSupportAd = useCallback((onComplete: () => void) => {
    if (!adService.canShowInterstitial()) {
      onComplete();
      return;
    }
    setPendingCallback(() => onComplete);
    setShowAdConfirm(true);
  }, []);

  const triggerMatchEndAd = useCallback((onComplete: () => void) => {
    if (shouldShowMatchEndAd()) {
      setPendingCallback(() => onComplete);
      setShowAdConfirm(true);
    } else {
      onComplete();
    }
  }, [shouldShowMatchEndAd]);

  const confirmWatchAd = useCallback(async () => {
    setShowAdConfirm(false);
    setIsAdLoading(true);

    try {
      await adService.showInterstitial();
    } catch (e) {
      logger.error('[AdFlow] Ad failed', e);
    } finally {
      setIsAdLoading(false);
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
    triggerMatchEndAd,
    confirmWatchAd,
    cancelWatchAd,
    isAdLoading
  };
};
