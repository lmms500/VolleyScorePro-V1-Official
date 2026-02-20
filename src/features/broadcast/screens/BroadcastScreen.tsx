import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, TeamId } from '@types';
import { BroadcastBar } from '../components/core/BroadcastBar';
import { TeamStatsOverlay } from '../components/stats/TeamStatsOverlay';
import { TopPlayerOverlay } from '../components/stats/TopPlayerOverlay';
import { PointScorerGraphic } from '../components/lower-thirds/PointScorerGraphic';
import { RotationDisplay } from '../components/formation/RotationDisplay';
import { PointCelebration } from '../components/animations/PointCelebration';
import { SetWinCelebration } from '../components/animations/SetWinCelebration';
import { MatchWinCelebration } from '../components/animations/MatchWinCelebration';
import { EventHeader } from '../components/event/EventHeader';
import { DraggableCard } from '../components/ui/DraggableCard';
import {
  BroadcastConfig,
  DEFAULT_BROADCAST_CONFIG,
  CelebrationType,
  LowerThirdData
} from '../types/broadcast';
import { getLastPointScorer, calculatePlayerStats, PlayerStatsResult } from '../utils/statsCalculator';
import { getBroadcastConfig } from '../config/BroadcastConfig';
import { useDraggableOverlay } from '../hooks/useDraggableOverlay';
import { AnimatePresence, motion } from 'framer-motion';

interface BroadcastScreenProps {
  state: GameState;
  config?: Partial<BroadcastConfig>;
}

export const BroadcastScreen: React.FC<BroadcastScreenProps> = ({
  state,
  config: userConfig
}) => {
  const config: BroadcastConfig = {
    ...DEFAULT_BROADCAST_CONFIG,
    ...userConfig,
    ...getBroadcastConfig()
  };

  const { positions, isEditMode, updatePosition, resetPositions } = useDraggableOverlay();

  const [showStats, setShowStats] = useState(false);
  const [showFormation, setShowFormation] = useState(false);
  const [activeLowerThird, setActiveLowerThird] = useState<LowerThirdData | null>(null);

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

  const scoreAChanged = state.scoreA !== prevScoreA.current;
  const scoreBChanged = state.scoreB !== prevScoreB.current;
  const scoreChanged = scoreAChanged || scoreBChanged;

  const historyChanged = state.history.length !== prevHistoryLength.current;
  const matchEnded = state.isMatchOver && !prevIsMatchOver.current;

  useEffect(() => {
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
  }, [
    state.scoreA,
    state.scoreB,
    state.setsA,
    state.setsB,
    state.isMatchOver,
    state.matchWinner,
    state.history.length,
    historyChanged,
    matchEnded,
    scoreChanged,
    config.autoShowLowerThirds
  ]);

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
        case 'h':
          setActiveLowerThird(null);
          setShowStats(false);
          setShowFormation(false);
          break;
        case 'r':
          if (isEditMode) {
            resetPositions();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [clearCelebration, isEditMode, resetPositions]);

  useEffect(() => {
    return () => {
      if (lowerThirdTimeout.current) clearTimeout(lowerThirdTimeout.current);
    };
  }, []);

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

      <BroadcastBar
        state={state}
        showTimer={true}
        showTimeouts={true}
      />

      <AnimatePresence>
        {showStats && (
          <DraggableCard
            positionKey="teamStats"
            position={positions.teamStats}
            isEditMode={isEditMode}
            onPositionChange={updatePosition}
            defaultPosition={{ bottom: '8px', left: '50%' }}
          >
            <TeamStatsOverlay
              show={showStats}
              state={state}
              position="bottom"
            />
          </DraggableCard>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStats && (
          <DraggableCard
            positionKey="topPlayer"
            position={positions.topPlayer}
            isEditMode={isEditMode}
            onPositionChange={updatePosition}
            defaultPosition={{ bottom: '192px', right: '32px' }}
          >
            <TopPlayerOverlay
              show={showStats}
              state={state}
              position="right"
            />
          </DraggableCard>
        )}
      </AnimatePresence>

      <DraggableCard
        positionKey="rotationA"
        position={positions.rotationA}
        isEditMode={isEditMode}
        onPositionChange={updatePosition}
        defaultPosition={{ top: '50%', left: '32px' }}
      >
        <RotationDisplay
          show={showFormation}
          state={state}
          teamId="A"
          position="left"
        />
      </DraggableCard>

      <DraggableCard
        positionKey="rotationB"
        position={positions.rotationB}
        isEditMode={isEditMode}
        onPositionChange={updatePosition}
        defaultPosition={{ top: '50%', right: '32px' }}
      >
        <RotationDisplay
          show={showFormation}
          state={state}
          teamId="B"
          position="right"
        />
      </DraggableCard>

      <AnimatePresence>
        {activeLowerThird?.type === 'point_scorer' && activeLowerThird.player && (
          <PointScorerGraphic
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
          className="fixed top-4 right-4 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-4 py-2 z-50"
        >
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="text-sm font-bold">Modo Edição Ativo</span>
          </div>
          <div className="text-xs text-cyan-400/70 mt-1">
            Arraste os cards para reposicionar • [R] Resetar • [E] Sair
          </div>
        </motion.div>
      )}

      <div className="fixed bottom-4 right-4 pointer-events-none opacity-40">
        <div className="text-[10px] font-mono text-white/60 bg-black/40 px-2 py-1 rounded">
          [S] Stats • [F] Formação • [E] Editar • [R] Reset • [H] Ocultar • [ESC] Fechar
        </div>
      </div>
    </div>
  );
};
