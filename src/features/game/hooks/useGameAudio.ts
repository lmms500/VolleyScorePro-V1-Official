
import { useRef, useMemo, useEffect } from 'react';
import { GameConfig } from '@types';
import { audioService } from '@lib/audio/AudioService';

/**
 * Hook for playing game audio.
 * Uses refs for config values so the returned object is 100% stable (never recreated).
 * This prevents cascading re-renders in consumers that depend on audio functions.
 */
export const useGameAudio = (config: GameConfig) => {

  // Ensure service is initialized (lazy load)
  audioService.init();

  // Refs for config values - allows stable callbacks
  const enabledRef = useRef(config.enableSound);
  const lowGfxRef = useRef(config.lowGraphics);

  useEffect(() => { enabledRef.current = config.enableSound; }, [config.enableSound]);
  useEffect(() => { lowGfxRef.current = config.lowGraphics; }, [config.lowGraphics]);

  // Stable object - never recreated
  return useMemo(() => ({
    playTap: () => { if (enabledRef.current) audioService.playTap(); },
    playScore: () => { if (enabledRef.current) audioService.playScore(lowGfxRef.current); },
    playUndo: () => { if (enabledRef.current) audioService.playUndo(); },
    playWhistle: () => { if (enabledRef.current) audioService.playWhistle(lowGfxRef.current); },
    playSetPointAlert: () => { if (enabledRef.current) audioService.playSetPointAlert(lowGfxRef.current); },
    playMatchPointAlert: () => { if (enabledRef.current) audioService.playMatchPointAlert(lowGfxRef.current); },
    playSetWin: () => { if (enabledRef.current) audioService.playSetWin(lowGfxRef.current); },
    playMatchWin: () => { if (enabledRef.current) audioService.playMatchWin(lowGfxRef.current); },
    playSuddenDeath: () => { if (enabledRef.current) audioService.playSuddenDeath(lowGfxRef.current); },
    playSwap: () => { if (enabledRef.current) audioService.playSwap(); },
    playDeuce: () => { if (enabledRef.current) audioService.playDeuce(); },
    playUnlock: () => { if (enabledRef.current) audioService.playUnlock(); }
  }), []); // STABLE - never recreated
};
