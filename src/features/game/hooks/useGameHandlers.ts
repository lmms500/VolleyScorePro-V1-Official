/**
 * src/hooks/useGameHandlers.ts
 *
 * Hook centralizado para todos os handlers de interação do jogo.
 * Encapsula lógica de audio, haptics, notificações e guards de spectator.
 */

import { useCallback, useMemo } from 'react';
import { useActions, useRoster } from '@contexts/GameContext';
import { useGameAudio } from './useGameAudio';
import { useHaptics } from '@lib/haptics/useHaptics';
import { TeamId, SkillType } from '@types';

export interface GameHandlers {
    // Point handlers
    handleAddPoint: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
    handleAddA: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
    handleAddB: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
    handleSubA: () => void;
    handleSubB: () => void;

    // Action handlers
    handleUndo: () => void;
    handleToggleSides: () => void;

    // Reset/rotation handlers (with ads)
    handleResetWithAd: () => void;
    handleNextGame: () => void;
}

/**
 * Centraliza todos os handlers de interação do GameScreen.
 * Consome contextos internamente para evitar prop drilling.
 *
 * @param triggerSupportAd - Função injetada do GameScreen para compartilhar o estado do modal de Ads
 * @returns {GameHandlers} - Objeto com todos os handlers memoizados
 */
export function useGameHandlers(triggerSupportAd: (onComplete: () => void) => void): GameHandlers {
    const { addPoint, subtractPoint, toggleSides, resetMatch, rotateTeams, undo } = useActions();
    const { syncRole, config } = useRoster();
    const audio = useGameAudio(config);
    const haptics = useHaptics(true);

    const isSpectator = syncRole === 'spectator';

    // --- POINT HANDLERS ---

    const handleAddPoint = useCallback((teamId: TeamId, playerId?: string, skill?: SkillType) => {
        if (isSpectator) return;

        const metadata = (() => {
            if (playerId && playerId !== 'unknown') return { playerId, skill: skill || 'generic' };
            if (skill && skill !== 'generic') return { playerId: 'unknown', skill };
            return undefined;
        })();

        audio.playTap();
        addPoint(teamId, metadata);
    }, [addPoint, audio, isSpectator]);

    // Stable handlers for ScoreCardFullscreen (prevents re-renders)
    const handleAddA = useCallback(
        (_teamId: TeamId, playerId?: string, skill?: SkillType) => {
            handleAddPoint('A', playerId, skill);
        },
        [handleAddPoint]
    );

    const handleAddB = useCallback(
        (_teamId: TeamId, playerId?: string, skill?: SkillType) => {
            handleAddPoint('B', playerId, skill);
        },
        [handleAddPoint]
    );

    const handleSubA = useCallback(() => {
        if (isSpectator) return;
        subtractPoint('A');
    }, [subtractPoint, isSpectator]);

    const handleSubB = useCallback(() => {
        if (isSpectator) return;
        subtractPoint('B');
    }, [subtractPoint, isSpectator]);

    // --- ACTION HANDLERS ---

    const handleUndo = useCallback(() => {
        if (isSpectator) return;

        undo();
        audio.playUndo();
        haptics.impact('medium');
    }, [undo, audio, haptics, isSpectator]);

    const handleToggleSides = useCallback(() => {
        if (isSpectator) return;

        toggleSides();
        haptics.impact('light');
    }, [toggleSides, isSpectator, haptics]);

    // --- RESET/ROTATION HANDLERS (with ad support) ---

    const performReset = useCallback(() => {
        resetMatch();
    }, [resetMatch]);

    const handleResetWithAd = useCallback(() => {
        if (config.adsRemoved) {
            performReset();
        } else {
            triggerSupportAd(performReset);
        }
    }, [config.adsRemoved, triggerSupportAd, performReset]);

    const handleNextGame = useCallback(() => {
        if (config.adsRemoved) {
            rotateTeams();
        } else {
            triggerSupportAd(() => rotateTeams());
        }
    }, [config.adsRemoved, triggerSupportAd, rotateTeams]);

    // Memoize entire handler object to prevent re-creation on every render
    return useMemo(() => ({
        handleAddPoint,
        handleAddA,
        handleAddB,
        handleSubA,
        handleSubB,
        handleUndo,
        handleToggleSides,
        handleResetWithAd,
        handleNextGame
    }), [
        handleAddPoint,
        handleAddA,
        handleAddB,
        handleSubA,
        handleSubB,
        handleUndo,
        handleToggleSides,
        handleResetWithAd,
        handleNextGame
    ]);
}
