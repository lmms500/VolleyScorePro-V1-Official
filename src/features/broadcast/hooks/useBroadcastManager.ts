import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, TeamId, ActionLog } from '@types';
import {
  BroadcastManagerState,
  CelebrationType,
  LowerThirdData,
  BroadcastConfig,
  DEFAULT_BROADCAST_CONFIG,
} from '../types/broadcast';
import {
  getLastPointScorer,
  PlayerStatsResult,
  calculatePlayerStats,
} from '../utils/statsCalculator';

export function useBroadcastManager(state: GameState) {
  const [config, setConfig] = useState<BroadcastConfig>(DEFAULT_BROADCAST_CONFIG);
  const [managerState, setManagerState] = useState<BroadcastManagerState>({
    showStats: false,
    showLowerThirds: true,
    showFormation: false,
    activeLowerThird: null,
    pendingCelebration: null,
    celebrationTeam: null,
  });

  const prevScoreA = useRef(state.scoreA);
  const prevScoreB = useRef(state.scoreB);
  const prevSetsA = useRef(state.setsA);
  const prevSetsB = useRef(state.setsB);
  const prevIsMatchOver = useRef(state.isMatchOver);
  const lowerThirdTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const scoreChanged = 
      state.scoreA !== prevScoreA.current || 
      state.scoreB !== prevScoreB.current;

    const setWon = 
      state.setsA !== prevSetsA.current || 
      state.setsB !== prevSetsB.current;

    const matchEnded = state.isMatchOver && !prevIsMatchOver.current;

    if (matchEnded) {
      triggerCelebration('match', state.matchWinner);
    } else if (setWon) {
      const setWinner = state.setsA > prevSetsA.current ? 'A' : 'B';
      triggerCelebration('set', setWinner);
    } else if (scoreChanged) {
      const scoringTeam = state.scoreA > prevScoreA.current ? 'A' : 'B';
      triggerCelebration('point', scoringTeam);
      
      if (config.autoShowLowerThirds) {
        showPointScorerLowerThird();
      }
    }

    prevScoreA.current = state.scoreA;
    prevScoreB.current = state.scoreB;
    prevSetsA.current = state.setsA;
    prevSetsB.current = state.setsB;
    prevIsMatchOver.current = state.isMatchOver;
  }, [state.scoreA, state.scoreB, state.setsA, state.setsB, state.isMatchOver, state.matchWinner]);

  const triggerCelebration = useCallback((type: CelebrationType, team: TeamId | null) => {
    setManagerState((prev) => ({
      ...prev,
      pendingCelebration: type,
      celebrationTeam: team,
    }));
  }, []);

  const clearCelebration = useCallback(() => {
    setManagerState((prev) => ({
      ...prev,
      pendingCelebration: null,
      celebrationTeam: null,
    }));
  }, []);

  const showPointScorerLowerThird = useCallback(() => {
    const result = getLastPointScorer(
      state.matchLog,
      state.teamARoster,
      state.teamBRoster
    );

    if (!result) return;

    const teamRoster = result.teamId === 'A' ? state.teamARoster : state.teamBRoster;
    const playerStats = calculatePlayerStats(state.matchLog, teamRoster, result.teamId);
    const stats = playerStats.find((s) => s.playerId === result.player.id);

    const lowerThirdData: LowerThirdData = {
      type: 'point_scorer',
      player: result.player,
      teamId: result.teamId,
      stats,
    };

    setManagerState((prev) => ({
      ...prev,
      activeLowerThird: lowerThirdData,
    }));

    if (lowerThirdTimeout.current) {
      clearTimeout(lowerThirdTimeout.current);
    }

    lowerThirdTimeout.current = setTimeout(() => {
      setManagerState((prev) => ({
        ...prev,
        activeLowerThird: null,
      }));
    }, config.lowerThirdDuration);
  }, [state.matchLog, state.teamARoster, state.teamBRoster, config.lowerThirdDuration]);

  const showLowerThird = useCallback((data: LowerThirdData) => {
    setManagerState((prev) => ({
      ...prev,
      activeLowerThird: data,
    }));

    if (lowerThirdTimeout.current) {
      clearTimeout(lowerThirdTimeout.current);
    }

    lowerThirdTimeout.current = setTimeout(() => {
      setManagerState((prev) => ({
        ...prev,
        activeLowerThird: null,
      }));
    }, config.lowerThirdDuration);
  }, [config.lowerThirdDuration]);

  const hideLowerThird = useCallback(() => {
    if (lowerThirdTimeout.current) {
      clearTimeout(lowerThirdTimeout.current);
    }
    setManagerState((prev) => ({
      ...prev,
      activeLowerThird: null,
    }));
  }, []);

  const toggleStats = useCallback(() => {
    setManagerState((prev) => ({
      ...prev,
      showStats: !prev.showStats,
    }));
  }, []);

  const toggleFormation = useCallback(() => {
    setManagerState((prev) => ({
      ...prev,
      showFormation: !prev.showFormation,
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (lowerThirdTimeout.current) {
        clearTimeout(lowerThirdTimeout.current);
      }
    };
  }, []);

  return {
    config,
    setConfig,
    managerState,
    triggerCelebration,
    clearCelebration,
    showLowerThird,
    hideLowerThird,
    toggleStats,
    toggleFormation,
  };
}
