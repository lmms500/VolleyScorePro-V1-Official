import { useRef, useEffect, useCallback } from 'react';
import { useActiveTimeout } from './useActiveTimeout';
import { TeamId } from '../types';

interface TimeoutManagerDeps {
    timeoutsA: number;
    timeoutsB: number;
    activeModal: string;
    undo: () => void;
    t: (key: string, params?: Record<string, unknown>) => string;
    showNotification: (opts: { type: string; mainText: string; subText?: string }) => void;
    openModal: (modal: string) => void;
}

interface TimeoutManagerReturn {
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
 * useTimeoutManager - Encapsula toda lógica de gerenciamento de timeout
 *
 * Responsabilidades:
 * - Detecta quando um timeout é acionado (via mudança em timeoutsA/B)
 * - Auto-minimiza quando modais abrem
 * - Fornece handlers para undo e tactical board
 */
export function useTimeoutManager(deps: TimeoutManagerDeps): TimeoutManagerReturn {
    const {
        timeoutsA,
        timeoutsB,
        activeModal,
        undo,
        t,
        showNotification,
        openModal
    } = deps;

    // Core timeout state from useActiveTimeout
    const {
        activeTeam: activeTimeoutTeam,
        secondsLeft: timeoutSeconds,
        isMinimized: isTimeoutMinimized,
        startTimeout,
        stopTimeout,
        minimize: minimizeTimeout,
        maximize: maximizeTimeout
    } = useActiveTimeout();

    // Track previous timeout counts to detect new timeouts
    const prevTimeoutsA = useRef(timeoutsA);
    const prevTimeoutsB = useRef(timeoutsB);

    // Detect timeout trigger
    useEffect(() => {
        if (timeoutsA > prevTimeoutsA.current) startTimeout('A');
        if (timeoutsB > prevTimeoutsB.current) startTimeout('B');

        // Update refs
        prevTimeoutsA.current = timeoutsA;
        prevTimeoutsB.current = timeoutsB;
    }, [timeoutsA, timeoutsB, startTimeout]);

    // Auto-minimize timeout when modals open
    useEffect(() => {
        if (activeTimeoutTeam && activeModal !== 'none' && !isTimeoutMinimized) {
            minimizeTimeout();
        }
    }, [activeModal, activeTimeoutTeam, isTimeoutMinimized, minimizeTimeout]);

    // Handler: Undo timeout action
    const handleTimeoutUndo = useCallback(() => {
        undo();
        stopTimeout();
        showNotification({ type: 'info', mainText: t('notifications.actionUndone') });
    }, [undo, t, showNotification, stopTimeout]);

    // Handler: Open tactical board
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
