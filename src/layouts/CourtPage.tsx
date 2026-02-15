import React, { useCallback } from 'react';
import { useScore, useLog, useRoster, useActions } from '@contexts/GameContext';
import { CourtLayout } from '@features/court/components/CourtLayout';
import { TeamId, SkillType } from '@types';

interface CourtPageProps {
    onDragActiveChange: (isDragging: boolean) => void;
}

export const CourtPage: React.FC<CourtPageProps> = ({ onDragActiveChange }) => {
    const {
        scoreA, scoreB, setsA, setsB, currentSet, servingTeam,
        timeoutsA, timeoutsB, inSuddenDeath, isDeuce,
        isMatchPointA, isMatchPointB, isSetPointA, isSetPointB
    } = useScore();
    const { matchLog } = useLog();
    const { teamARoster, teamBRoster, config } = useRoster();
    const { manualRotate, addPoint, subtractPoint, swapPositions, substitutePlayers, useTimeout } = useActions();

    const handleAddPoint = useCallback((teamId: TeamId, playerId?: string, skill?: SkillType) => {
        const metadata = playerId ? { playerId, skill: skill || 'generic' } : undefined;
        addPoint(teamId, metadata);
    }, [addPoint]);

    return (
        <div className="w-full h-full">
            <CourtLayout
                teamA={teamARoster}
                teamB={teamBRoster}
                scoreA={scoreA}
                scoreB={scoreB}
                servingTeam={servingTeam}
                onManualRotate={manualRotate}
                onAddPoint={handleAddPoint}
                onSubtractPoint={subtractPoint}
                onMovePlayer={swapPositions}
                onSubstitute={substitutePlayers}
                onTimeoutA={() => useTimeout('A')}
                onTimeoutB={() => useTimeout('B')}
                timeoutsA={timeoutsA}
                timeoutsB={timeoutsB}
                currentSet={currentSet}
                setsA={setsA}
                setsB={setsB}
                isMatchPointA={isMatchPointA}
                isMatchPointB={isMatchPointB}
                isSetPointA={isSetPointA}
                isSetPointB={isSetPointB}
                isDeuce={isDeuce}
                inSuddenDeath={inSuddenDeath}
                matchLog={matchLog}
                config={config}
                variant="inline"
                onDragActiveChange={onDragActiveChange}
                nameRotation={-90}
                courtRotation={90}
            />
        </div>
    );
};
