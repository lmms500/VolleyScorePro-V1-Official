
import React, { memo, useCallback } from 'react';
import { TeamId, SkillType } from '@types';
import { useActions, useScore, useRoster } from '@contexts/GameContext';
import { useTranslation } from '@contexts/LanguageContext';
import { useGameAudio } from '@features/game/hooks/useGameAudio';
import { useNotification } from '@contexts/NotificationContext';
import { ScoreCardNormal } from '@features/game/components/ScoreCardNormal';

interface ScoreCardContainerProps {
  teamId: TeamId;
  isLocked?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  swappedSides?: boolean;
}

export const ScoreCardContainer: React.FC<ScoreCardContainerProps> = memo(({
  teamId,
  isLocked = false,
  onInteractionStart,
  onInteractionEnd,
  swappedSides = false
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  
  // Consume contexts
  const {
    scoreA, scoreB,
    setsA, setsB,
    servingTeam,
    isMatchPointA, isMatchPointB,
    isSetPointA, isSetPointB,
    isDeuce,
    inSuddenDeath,
    setsNeededToWin,
    lastScorerTeam,
    timeoutsA,
    timeoutsB
  } = useScore();

  const { 
    teamARoster, teamBRoster,
    config,
    syncRole
  } = useRoster();

  const { 
    addPoint, 
    subtractPoint, 
    setServer, 
    useTimeout 
  } = useActions();

  const audio = useGameAudio(config);

  // Computed values based on teamId
  const team = teamId === 'A' ? teamARoster : teamBRoster;
  const score = teamId === 'A' ? scoreA : scoreB;
  const setsWon = teamId === 'A' ? setsA : setsB;
  const isServing = servingTeam === teamId;
  const timeouts = teamId === 'A' ? timeoutsA : timeoutsB;
  const isMatchPoint = teamId === 'A' ? isMatchPointA : isMatchPointB;
  const isSetPoint = teamId === 'A' ? isSetPointA : isSetPointB;

  const isSpectator = syncRole === 'spectator';

  // O(1) from reducer - no more array reversal
  const isLastScorer = lastScorerTeam === teamId;

  // Handlers
  const handleAddPoint = useCallback((targetTeamId: TeamId, playerId?: string, skill?: SkillType) => {
    if (isSpectator) return;
    
    // Audio feedback
    audio.playTap();
    
    // Logic
    const metadata = (playerId && playerId !== 'unknown') 
      ? { playerId, skill: skill || 'generic' } 
      : undefined;
      
    addPoint(targetTeamId, metadata);

    // Notification
    const currentTeam = targetTeamId === 'A' ? teamARoster : teamBRoster;
    const color = currentTeam.color || (targetTeamId === 'A' ? 'indigo' : 'rose');
    
    let mainText = currentTeam.name;
    if (skill === 'opponent_error') {
      mainText = t('scout.skills.opponent_error');
    } else if (playerId && playerId !== 'unknown') {
      const player = currentTeam.players.find(p => p.id === playerId) 
                  || currentTeam.reserves?.find(p => p.id === playerId);
      if (player) mainText = player.name;
    }

    showNotification({ 
      type: 'success', 
      mainText, 
      subText: t('notifications.forTeam', { teamName: currentTeam.name }), 
      skill, 
      color 
    });
  }, [isSpectator, audio, addPoint, teamARoster, teamBRoster, t, showNotification]);

  const handleSubtract = useCallback(() => {
    if (isSpectator) return;
    subtractPoint(teamId);
  }, [isSpectator, subtractPoint, teamId]);

  const handleSetServer = useCallback(() => {
    if (isSpectator) return;
    setServer(teamId);
  }, [isSpectator, setServer, teamId]);

  const handleTimeout = useCallback(() => {
    if (isSpectator) return;
    useTimeout(teamId);
  }, [isSpectator, useTimeout, teamId]);

  return (
    <ScoreCardNormal
      teamId={teamId}
      team={team}
      score={score}
      setsWon={setsWon}
      isServing={isServing}
      onAdd={handleAddPoint}
      onSubtract={handleSubtract}
      onSetServer={handleSetServer}
      timeouts={timeouts}
      onTimeout={handleTimeout}
      isMatchPoint={isMatchPoint}
      isSetPoint={isSetPoint}
      isLastScorer={isLastScorer}
      isDeuce={isDeuce}
      inSuddenDeath={inSuddenDeath}
      setsNeededToWin={setsNeededToWin}
      colorTheme={team.color}
      isLocked={isLocked || isSpectator}
      onInteractionStart={onInteractionStart}
      onInteractionEnd={onInteractionEnd}
      config={config}
      swappedSides={swappedSides}
    />
  );
});
