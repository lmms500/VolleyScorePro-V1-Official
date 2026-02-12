/**
 * useMatchSaver - Hook para gerenciamento de salvamento de partidas
 *
 * Encapsula toda a lógica de:
 * - Auto-save quando partida termina
 * - Sync com Firebase (fire-and-forget)
 * - Atualização de estatísticas de jogadores
 * - Undo de salvamento
 *
 * Extrai ~60 linhas do ModalManager para hook reutilizável.
 */

import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useActions, useScore, useRoster } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useHistoryStore, Match } from '../stores/historyStore';
import { SyncService } from '../services/SyncService';
import { generateTimelineNodes } from '../utils/timelineGenerator';
import { calculateMatchDeltas } from '../utils/statsEngine';
import { TeamId } from '../types';

export interface UseMatchSaverReturn {
    /** ID da partida salva (null se não houver save ativo) */
    savedMatchId: string | null;

    /** Desfaz o salvamento: chama undo() + remove do historyStore */
    undoMatchSave: () => void;

    /** Limpa o ID salvo antes de navegação (nextGame/reset) */
    resetSaveState: () => void;
}

export function useMatchSaver(): UseMatchSaverReturn {
    // --- CONTEXTS ---
    const { batchUpdateStats, undo } = useActions();
    const {
        isMatchOver,
        matchWinner,
        scoreA,
        scoreB,
        setsA,
        setsB,
        matchDurationSeconds,
        history,
        matchLog
    } = useScore();
    const { teamAName, teamBName, teamARoster, teamBRoster, config } = useRoster();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const historyStore = useHistoryStore();

    // --- STATE ---
    const savedMatchIdRef = useRef<string | null>(null);
    const [activeSavedMatchId, setActiveSavedMatchId] = useState<string | null>(null);

    // --- AUTO-SAVE EFFECT ---
    useEffect(() => {
        // Match ended and not yet saved
        if (isMatchOver && matchWinner && !savedMatchIdRef.current) {
            // Guard: empty match
            if (history.length === 0 && scoreA === 0 && scoreB === 0) return;

            const newMatchId = uuidv4();
            savedMatchIdRef.current = newMatchId;
            setActiveSavedMatchId(newMatchId);

            // Build Match object
            const baseMatchData: Match = {
                id: newMatchId,
                date: new Date().toISOString(),
                timestamp: Date.now(),
                durationSeconds: matchDurationSeconds,
                teamAName: teamAName,
                teamBName: teamBName,
                teamARoster: teamARoster,
                teamBRoster: teamBRoster,
                setsA: setsA,
                setsB: setsB,
                winner: matchWinner,
                sets: history,
                actionLog: matchLog,
                config: config
            };

            // PERFORMANCE OPTIMIZATION: Generate timeline nodes ONCE before saving
            const timeline = generateTimelineNodes(baseMatchData, t);
            const finalMatchData = { ...baseMatchData, timeline };

            // Save locally
            historyStore.addMatch(finalMatchData);

            // Cloud Sync (fire-and-forget)
            if (user) {
                SyncService.pushMatch(user.uid, finalMatchData)
                    .then(syncSuccess => {
                        if (!syncSuccess) {
                            console.warn('[useMatchSaver] Match saved locally but cloud sync failed. Will retry next app launch.');
                        }
                    })
                    .catch(err => {
                        console.error('[useMatchSaver] Unexpected sync error:', err);
                    });
            }

            // Calculate and update player stats
            const playerTeamMap = new Map<string, TeamId>();
            const mapPlayer = (p: any, tid: TeamId) => {
                if (p.profileId) playerTeamMap.set(p.profileId, tid);
            };
            teamARoster.players.forEach(p => mapPlayer(p, 'A'));
            teamBRoster.players.forEach(p => mapPlayer(p, 'B'));

            const deltas = calculateMatchDeltas(matchLog, matchWinner, playerTeamMap);
            batchUpdateStats(deltas);

            // Success notification
            showNotification({
                type: 'success',
                mainText: t('notifications.matchSaved'),
                subText: user ? "Saved & Synced" : t('notifications.profileSynced'),
                systemIcon: 'save'
            });
        }
        // Match reset - clear saved state
        else if (!isMatchOver && savedMatchIdRef.current) {
            savedMatchIdRef.current = null;
            setActiveSavedMatchId(null);
        }
    }, [isMatchOver, matchWinner]); // Minimal deps - other values are stable or derived

    // --- UNDO HANDLER ---
    const undoMatchSave = () => {
        undo();
        if (activeSavedMatchId) {
            historyStore.deleteMatch(activeSavedMatchId);
            setActiveSavedMatchId(null);
            savedMatchIdRef.current = null;
        }
    };

    // --- RESET STATE (before navigation) ---
    const resetSaveState = () => {
        setActiveSavedMatchId(null);
    };

    return {
        savedMatchId: activeSavedMatchId,
        undoMatchSave,
        resetSaveState
    };
}
