// src/hooks/useScoreCardLogic.ts

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TeamId, Team, SkillType, GameConfig, TeamColor } from '@types';
import { useScoreGestures } from './useScoreGestures';
import { useGameAudio } from './useGameAudio';
import { useHaptics } from '@lib/haptics/useHaptics';
import { HaloMode } from '@ui/HaloBackground';
import { usePerformanceSafe } from '@contexts/PerformanceContext';

interface UseScoreCardLogicParams {
  teamId: TeamId;
  team: Team;
  onAdd: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
  onSubtract: () => void;
  config: GameConfig;
  isLocked: boolean;
  isMatchPoint: boolean;
  isSetPoint: boolean;
  isServing: boolean;
  isLastScorer: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  colorTheme?: TeamColor;
}

export const useScoreCardLogic = ({
  teamId,
  team,
  onAdd,
  onSubtract,
  config,
  isLocked,
  isMatchPoint,
  isSetPoint,
  isServing,
  isLastScorer,
  onInteractionStart,
  onInteractionEnd,
  colorTheme,
}: UseScoreCardLogicParams) => {
  // --- Serviços (audio já é estável internamente, haptics não) ---
  const audio = useGameAudio(config);
  const haptics = useHaptics(true);
  const { config: perf } = usePerformanceSafe();

  // CRITICAL FIX: Use refs to prevent callback recreation when haptics changes
  // useGameAudio already returns a stable object, but useHaptics can recreate
  const hapticsRef = useRef(haptics);
  useEffect(() => { hapticsRef.current = haptics; }, [haptics]);

  // --- Estado Local ---
  const [showScout, setShowScout] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Valores Derivados ---
  const isCritical = isMatchPoint || isSetPoint;
  const resolvedColor = colorTheme || team.color || 'slate';

  const haloMode: HaloMode = useMemo(() => {
    if (isMatchPoint) return 'critical';
    if (isLastScorer) return 'lastScorer';
    if (isServing) return 'serving';
    return 'idle';
  }, [isMatchPoint, isLastScorer, isServing]);

  // --- Handlers (STABLE - use refs for services) ---
  const handleScoutClose = useCallback(() => {
    setShowScout(false);
    setIsInteractionLocked(true);
    const t = setTimeout(() => setIsInteractionLocked(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleScoutConfirm = useCallback((pid: string, skill: SkillType) => {
    onAdd(teamId, pid, skill);
  }, [onAdd, teamId]);

  const handleAddWrapper = useCallback(() => {
    if (isInteractionLocked) return;
    audio.playTap(); // audio is already stable
    if (config.enablePlayerStats) {
      hapticsRef.current.impact('light'); // use ref to avoid dependency
      setShowScout(true);
    } else {
      onAdd(teamId);
    }
  }, [config.enablePlayerStats, onAdd, teamId, audio, isInteractionLocked]);
  // Note: hapticsRef.current is NOT in deps - this is intentional and safe

  const handleSubtractWrapper = useCallback(() => {
    onSubtract();
  }, [onSubtract]);

  const handleInteractionStart = useCallback((e: React.PointerEvent) => {
    if (isLocked) return;
    setIsPressed(true);
    onInteractionStart?.();

    if (containerRef.current && perf.visual.rippleEffects) {
      const rect = containerRef.current.getBoundingClientRect();
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        id: Date.now(),
      });
    }
  }, [onInteractionStart, isLocked, perf.visual.rippleEffects]);

  const handleInteractionEnd = useCallback(() => {
    setIsPressed(false);
    onInteractionEnd?.();
  }, [onInteractionEnd]);

  const handlePointerCancel = useCallback(() => {
    setIsPressed(false);
    onInteractionEnd?.();
  }, [onInteractionEnd]);

  // --- Gesture Engine ---
  const gestureHandlers = useScoreGestures({
    onAdd: handleAddWrapper,
    onSubtract: handleSubtractWrapper,
    isLocked: isLocked || isInteractionLocked,
    onInteractionStart: handleInteractionStart,
    onInteractionEnd: handleInteractionEnd,
  });

  return {
    // Estado visual
    showScout,
    isPressed,
    ripple,
    haloMode,
    isCritical,
    resolvedColor,

    // Refs
    containerRef,

    // Handlers
    handleScoutClose,
    handleScoutConfirm,
    gestureHandlers,
    handlePointerCancel,

    // Serviços
    haptics,
  };
};
