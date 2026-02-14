// src/hooks/useScoreCardLogic.ts

import { useState, useCallback, useMemo, useRef } from 'react';
import { TeamId, Team, SkillType, GameConfig, TeamColor } from '../types';
import { useScoreGestures } from './useScoreGestures';
import { useGameAudio } from './useGameAudio';
import { useHaptics } from './useHaptics';
import { HaloMode } from '../components/ui/HaloBackground';
import { usePerformanceSafe } from '../contexts/PerformanceContext';

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
  // --- Serviços ---
  const audio = useGameAudio(config);
  const haptics = useHaptics(true);
  const { config: perf } = usePerformanceSafe();

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
    if (isCritical) return 'critical';
    if (isLastScorer) return 'lastScorer';
    if (isServing) return 'serving';
    return 'idle';
  }, [isCritical, isLastScorer, isServing]);

  // --- Handlers ---
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
    audio.playTap();
    if (config.enablePlayerStats) {
      haptics.impact('light');
      setShowScout(true);
    } else {
      onAdd(teamId);
    }
  }, [config.enablePlayerStats, onAdd, teamId, audio, haptics, isInteractionLocked]);

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
