/**
 * src/hooks/useTimeoutManager.ts (REFATORADO)
 *
 * Hook para gerenciar timeout state.
 * AGORA CONSOME CONTEXTS INTERNAMENTE - sem parâmetros.
 */

import { useRef, useEffect, useCallback } from 'react';
import { useActiveTimeout } from './useActiveTimeout';
import { useScore, useActions } from '@contexts/GameContext';
import { useModals } from '@contexts/ModalContext';
import { useNotification } from '@contexts/NotificationContext';
import { useTranslation } from '@contexts/LanguageContext';
import { TeamId } from '@types';

export interface TimeoutManagerReturn {
    activeTimeoutTeam: TeamId | null;
    timeoutSeconds: number;
    isTimeoutMinimized: boolean;
    startTimeout: (team: TeamId, initialSeconds?: number) => void;
    stopTimeout: () => void;
    minimizeTimeout: () => void;
    maximizeTimeout: () => void;
    handleTimeoutUndo: () => void;
    handleTacticalBoard: () => void;
}

/**
 * useTimeoutManager - Encapsula toda lógica de gerenciamento de timeout.
 *
 * Mudanças na refatoração:
 * - Agora consome useScore(), useActions(), useModals(), useNotification(), useTranslation() internamente
 * - Removida interface TimeoutManagerDeps (sem parâmetros)
 */
export function useTimeoutManager(): TimeoutManagerReturn {
    // --- CONTEXT CONSUMPTION (NOVO) ---
    const { timeoutsA, timeoutsB } = useScore();
    const { undo } = useActions();
    const { activeModal, openModal } = useModals();
    const { showNotification } = useNotification();
    const { t } = useTranslation();

    // --- CORE TIMEOUT STATE (INALTERADO) ---
    const {
        activeTeam: activeTimeoutTeam,
        secondsLeft: timeoutSeconds,
        isMinimized: isTimeoutMinimized,
        startTimeout,
        stopTimeout,
        minimize: minimizeTimeout,
        maximize: maximizeTimeout
    } = useActiveTimeout();

    // --- DETECTION LOGIC (INALTERADO) ---
    const prevTimeoutsA = useRef(timeoutsA);
    const prevTimeoutsB = useRef(timeoutsB);

    useEffect(() => {
        if (timeoutsA > prevTimeoutsA.current) startTimeout('A');
        if (timeoutsB > prevTimeoutsB.current) startTimeout('B');

        prevTimeoutsA.current = timeoutsA;
        prevTimeoutsB.current = timeoutsB;
    }, [timeoutsA, timeoutsB, startTimeout]);

    // --- AUTO-MINIMIZE (INALTERADO) ---
    useEffect(() => {
        if (activeTimeoutTeam && activeModal !== 'none' && !isTimeoutMinimized) {
            minimizeTimeout();
        }
    }, [activeModal, activeTimeoutTeam, isTimeoutMinimized, minimizeTimeout]);

    // --- HANDLERS (INALTERADOS) ---
    const handleTimeoutUndo = useCallback(() => {
        undo();
        stopTimeout();
        showNotification({ type: 'info', mainText: t('notifications.actionUndone') });
    }, [undo, t, showNotification, stopTimeout]);

    const handleTacticalBoard = useCallback(() => {
        minimizeTimeout();
        openModal('court');
    }, [minimizeTimeout, openModal]);

    return {
        activeTimeoutTeam,
        timeoutSeconds,
        isTimeoutMinimized,
        startTimeout,
        stopTimeout,
        minimizeTimeout,
        maximizeTimeout,
        handleTimeoutUndo,
        handleTacticalBoard
    };
}
