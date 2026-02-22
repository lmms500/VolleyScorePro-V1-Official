import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, TeamId } from '@types';
import { BroadcastBar } from '../components/core/BroadcastBar';
import { PointScorerGraphic } from '../components/lower-thirds/PointScorerGraphic';
import { RotationDisplay } from '../components/formation/RotationDisplay';
import { PointCelebration } from '../components/animations/PointCelebration';
import { SetWinCelebration } from '../components/animations/SetWinCelebration';
import { MatchWinCelebration } from '../components/animations/MatchWinCelebration';
import { EventHeader } from '../components/event/EventHeader';
import { DraggableCard, resetAllDraggablePositions } from '../components/ui/DraggableCard';
import { TeamStatsOverlay } from '../components/stats/TeamStatsOverlay';
import { TopPlayerOverlay } from '../components/stats/TopPlayerOverlay';
import {
  BroadcastConfig,
  DEFAULT_BROADCAST_CONFIG,
  CelebrationType,
  LowerThirdData
} from '../types/broadcast';
import { getLastPointScorer, calculatePlayerStats, PlayerStatsResult } from '../utils/statsCalculator';
import { getBroadcastConfig } from '../config/BroadcastConfig';
import { AnimatePresence, motion } from 'framer-motion';

interface BroadcastScreenProps {
  state: GameState;
  config?: Partial<BroadcastConfig>;
}

const DRAGGABLE_KEYS = ['broadcastBar', 'teamStats', 'topPlayer', 'rotationA', 'rotationB'];

export const BroadcastScreen: React.FC<BroadcastScreenProps> = ({
  state,
  config: userConfig
}) => {
  const config: BroadcastConfig = {
    ...DEFAULT_BROADCAST_CONFIG,
    ...userConfig,
    ...getBroadcastConfig()
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFormation, setShowFormation] = useState(false);
  const [activeLowerThird, setActiveLowerThird] = useState<LowerThirdData | null>(null);
  const [lowerThirdKey, setLowerThirdKey] = useState(0);

  const [celebrationType, setCelebrationType] = useState<CelebrationType | null>(null);
  const [celebrationTeam, setCelebrationTeam] = useState<TeamId | null>(null);
  const [celebrationSetData, setCelebrationSetData] = useState<{setNumber: number; scoreA: number; scoreB: number} | null>(null);

  const prevScoreA = useRef(state.scoreA);
  const prevScoreB = useRef(state.scoreB);
  const prevSetsA = useRef(state.setsA);
  const prevSetsB = useRef(state.setsB);
  const prevIsMatchOver = useRef(state.isMatchOver);
  const prevHistoryLength = useRef(state.history.length);
  const lowerThirdTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastPointRef = useRef<{ teamA: number; teamB: number }>({ teamA: 0, teamB: 0 });

  useEffect(() => {
    const matchEnded = state.isMatchOver && !prevIsMatchOver.current;
    const historyChanged = state.history.length !== prevHistoryLength.current;
    const scoreAChanged = state.scoreA !== prevScoreA.current;
    const scoreBChanged = state.scoreB !== prevScoreB.current;
    const scoreChanged = scoreAChanged || scoreBChanged;

    if (matchEnded) {
      setCelebrationType('match');
      setCelebrationTeam(state.matchWinner);
    } else if (historyChanged && state.history.length > 0) {
      const lastSet = state.history[state.history.length - 1];
      setCelebrationSetData({
        setNumber: lastSet.setNumber,
        scoreA: lastSet.scoreA,
        scoreB: lastSet.scoreB,
      });
      setCelebrationType('set');
      setCelebrationTeam(lastSet.winner);
    } else if (scoreChanged && !historyChanged) {
      setCelebrationType('point');
      const scoringTeam = state.scoreA > prevScoreA.current ? 'A' : 'B';
      setCelebrationTeam(scoringTeam);

      if (config.autoShowLowerThirds) {
        showPointScorerLowerThird();
      }
    }

    prevScoreA.current = state.scoreA;
    prevScoreB.current = state.scoreB;
    prevSetsA.current = state.setsA;
    prevSetsB.current = state.setsB;
    prevIsMatchOver.current = state.isMatchOver;
    prevHistoryLength.current = state.history.length;
  }, [state.scoreA, state.scoreB, state.setsA, state.setsB, state.isMatchOver, state.matchWinner, state.history, config.autoShowLowerThirds]);

  const showPointScorerLowerThird = useCallback(() => {
    const result = getLastPointScorer(
      state.matchLog,
      state.teamARoster,
      state.teamBRoster
    );

    if (!result) {
      setActiveLowerThird(null);
      return;
    }

    const teamRoster = result.teamId === 'A' ? state.teamARoster : state.teamBRoster;
    const playerStats = calculatePlayerStats(state.matchLog, teamRoster, result.teamId);
    const stats = playerStats.find((s) => s.playerId === result.player.id);

    setLowerThirdKey(prev => prev + 1);
    setActiveLowerThird({
      type: 'point_scorer',
      player: result.player,
      teamId: result.teamId,
      stats,
    });

    if (lowerThirdTimeout.current) {
      clearTimeout(lowerThirdTimeout.current);
    }

    lowerThirdTimeout.current = setTimeout(() => {
      setActiveLowerThird(null);
    }, config.lowerThirdDuration);
  }, [state.matchLog, state.teamARoster, state.teamBRoster, config.lowerThirdDuration]);

  const clearCelebration = useCallback(() => {
    setCelebrationType(null);
    setCelebrationTeam(null);
    setCelebrationSetData(null);
  }, []);

  const handleResetPositions = useCallback(() => {
    resetAllDraggablePositions(DRAGGABLE_KEYS);
    window.location.reload();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearCelebration();
        setActiveLowerThird(null);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 's':
          setShowStats((prev) => !prev);
          break;
        case 'f':
          setShowFormation((prev) => !prev);
          break;
        case 'e':
          setIsEditMode((prev) => !prev);
          break;
        case 'r':
          if (isEditMode) {
            handleResetPositions();
          }
          break;
        case 'h':
          setActiveLowerThird(null);
          setShowStats(false);
          setShowFormation(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [clearCelebration, isEditMode, handleResetPositions]);

  useEffect(() => {
    return () => {
      if (lowerThirdTimeout.current) clearTimeout(lowerThirdTimeout.current);
    };
  }, []);

  const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const h = typeof window !== 'undefined' ? window.innerHeight : 1080;

  return (
    <div className="w-full h-screen bg-transparent overflow-hidden">
      <style>
        {`
          html, body, #root { 
            background-color: transparent !important; 
            background: transparent !important; 
          }
        `}
      </style>

      <EventHeader
        show={!!(config.eventName || config.eventPhase)}
        state={state}
        eventName={config.eventName}
        eventPhase={config.eventPhase}
        venue={config.venue}
      />

      <DraggableCard
        positionKey="broadcastBar"
        defaultX={w / 2}
        defaultY={60}
        isEditMode={isEditMode}
      >
        <BroadcastBar state={state} showTimer={true} showTimeouts={true} />
      </DraggableCard>

      <AnimatePresence>
        {showStats && (
          <DraggableCard
            positionKey="teamStats"
            defaultX={w / 2}
            defaultY={h - 120}
            isEditMode={isEditMode}
          >
            <TeamStatsOverlay show={showStats} state={state} />
          </DraggableCard>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStats && (
          <DraggableCard
            positionKey="topPlayer"
            defaultX={w - 150}
            defaultY={h / 2}
            isEditMode={isEditMode}
          >
            <TopPlayerOverlay show={showStats} state={state} />
          </DraggableCard>
        )}
      </AnimatePresence>

      {showFormation && (
        <DraggableCard
          positionKey="rotationA"
          defaultX={150}
          defaultY={h / 2}
          isEditMode={isEditMode}
        >
          <RotationDisplay show={showFormation} state={state} teamId="A" />
        </DraggableCard>
      )}

      {showFormation && (
        <DraggableCard
          positionKey="rotationB"
          defaultX={w - 150}
          defaultY={h / 2 + 200}
          isEditMode={isEditMode}
        >
          <RotationDisplay show={showFormation} state={state} teamId="B" />
        </DraggableCard>
      )}

      <AnimatePresence>
        {activeLowerThird?.type === 'point_scorer' && activeLowerThird.player && (
          <PointScorerGraphic
            key={lowerThirdKey}
            show={true}
            player={activeLowerThird.player}
            teamId={activeLowerThird.teamId!}
            state={state}
            stats={activeLowerThird.stats as unknown as PlayerStatsResult}
            skill={state.matchLog.length > 0
              ? (state.matchLog[state.matchLog.length - 1] as any)?.skill
              : undefined
            }
          />
        )}
      </AnimatePresence>

      <PointCelebration
        trigger={celebrationType === 'point'}
        teamId={celebrationTeam}
        state={state}
        duration={600}
        onComplete={clearCelebration}
      />

      <SetWinCelebration
        trigger={celebrationType === 'set'}
        teamId={celebrationTeam}
        state={state}
        setNumber={celebrationSetData?.setNumber ?? state.currentSet}
        setScoreA={celebrationSetData?.scoreA}
        setScoreB={celebrationSetData?.scoreB}
        duration={5000}
        onComplete={clearCelebration}
        onDismiss={clearCelebration}
      />

      <MatchWinCelebration
        trigger={celebrationType === 'match'}
        teamId={celebrationTeam}
        state={state}
        duration={5000}
        onComplete={clearCelebration}
        onDismiss={clearCelebration}
      />

      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white rounded-lg px-4 py-2 z-[100]"
        >
          <span className="text-sm font-bold">Modo Edição</span>
          <span className="text-xs ml-2 opacity-80">Arraste os elementos • [R] Reset • [E] Sair</span>
        </motion.div>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-40">
        <div className="text-[10px] font-mono text-white/60 bg-black/40 px-3 py-1.5 rounded">
          [S] Stats • [F] Formação • [E] Editar • [H] Ocultar • [ESC] Fechar
        </div>
      </div>
    </div>
  );
};
