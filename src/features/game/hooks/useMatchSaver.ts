/**
 * useMatchSaver - Hook para gerenciamento de salvamento de partidas
 *
 * Encapsula toda a lógica de:
 * - Auto-save quando partida termina
 * - Sync com Firebase (fire-and-forget)
 * - Official match validation (check-in system)
 * - Atualização de estatísticas de jogadores
 * - Undo de salvamento
 *
 * Extrai ~60 linhas do ModalManager para hook reutilizável.
 */

import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useActions, useScore, useLog, useRoster } from '@contexts/GameContext';
import { useTimerValue } from '@contexts/TimerContext';
import { useAuth } from '@contexts/AuthContext';
import { useTranslation } from '@contexts/LanguageContext';
import { useNotification } from '@contexts/NotificationContext';
import { useHistoryStore, Match } from '@features/history/store/historyStore';
import { SyncService } from '@features/broadcast/services/SyncService';
import { OfficialMatchService } from '@features/broadcast/services/OfficialMatchService';
import { SyncEngine } from '@features/broadcast/services/SyncEngine';
import { generateTimelineNodes } from '@features/history/utils/timelineGenerator';
import { calculateMatchDeltas } from '@features/history/utils/statsEngine';
import { validateMatch, getRequiredPlayers } from '@features/broadcast/utils/matchValidation';
import { TeamId, GameModePreset } from '@types';

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
    } = useScore();
    const { seconds: matchDurationSeconds } = useTimerValue();
    const { history, matchLog } = useLog();
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

            // --- Async save with official match validation ---
            const saveMatch = async () => {
                const syncEngine = SyncEngine.getInstance();
                const sessionId = (config as any).sessionId as string | undefined;
                const syncRole = (config as any).syncRole as string | undefined;
                const isInBroadcast = syncRole === 'host' && sessionId;

                let isOfficialMatch = false;
                let participantUids: string[] = [];

                // If playing in a broadcast session as host, check participants
                if (isInBroadcast && sessionId) {
                    try {
                        const participants = await syncEngine.getParticipants(sessionId);
                        const preset = config.modeConfig?.preset as GameModePreset | undefined;
                        const requiredPlayers = preset
                            ? getRequiredPlayers(preset)
                            : (config.modeConfig?.courtLayout?.playersOnCourt ?? 6) * 2;

                        const validationResult = validateMatch(participants, requiredPlayers);
                        isOfficialMatch = validationResult.isValidated;
                        participantUids = participants.map(p => p.uid);
                    } catch (e) {
                        console.warn('[useMatchSaver] Failed to check official status:', e);
                    }
                }

                // Build Match object
                const baseMatchData: Match = {
                    id: newMatchId,
                    date: new Date().toISOString(),
                    timestamp: Date.now(),
                    durationSeconds: matchDurationSeconds,
                    teamAName,
                    teamBName,
                    teamARoster,
                    teamBRoster,
                    setsA,
                    setsB,
                    winner: matchWinner,
                    sets: history,
                    actionLog: matchLog,
                    config,
                    // Official match fields
                    isOfficialMatch,
                    sessionId: sessionId || undefined,
                    participantUids: participantUids.length > 0 ? participantUids : undefined,
                };

                // Generate timeline nodes ONCE before saving
                const timeline = generateTimelineNodes(baseMatchData, t);
                const finalMatchData = { ...baseMatchData, timeline };

                // Save locally
                historyStore.addMatch(finalMatchData);

                // Cloud Sync (fire-and-forget)
                if (user) {
                    SyncService.pushMatch(user.uid, finalMatchData)
                        .then(syncSuccess => {
                            if (!syncSuccess) {
                                console.warn('[useMatchSaver] Match saved locally but cloud sync failed.');
                            }
                        })
                        .catch(err => {
                            console.error('[useMatchSaver] Unexpected sync error:', err);
                        });

                    // Submit to global history if official
                    if (isOfficialMatch && sessionId) {
                        OfficialMatchService.getInstance()
                            .submitOfficialMatch(finalMatchData, user.uid, sessionId, participantUids)
                            .then(success => {
                                if (success) {
                                    showNotification({
                                        type: 'success',
                                        mainText: t('officialMatch.submittedToGlobal'),
                                        subText: '🟢 ' + t('officialMatch.badge'),
                                        systemIcon: 'save'
                                    });
                                }
                            })
                            .catch(err => {
                                console.error('[useMatchSaver] Official match submission error:', err);
                            });
                    }
                }

                // Calculate and update player stats
                const playerTeamMap = new Map<string, TeamId>();
                const mapPlayer = (p: any, tid: TeamId) => {
                    if (p.profileId) playerTeamMap.set(p.profileId, tid);
                };
                teamARoster.players.forEach(p => mapPlayer(p, 'A'));
                teamBRoster.players.forEach(p => mapPlayer(p, 'B'));

                const rosterMap = new Map<string, string>();
                const mapRoster = (p: any) => {
                    if (p.id && p.profileId) rosterMap.set(p.id, p.profileId);
                };
                teamARoster.players.forEach(mapRoster);
                teamBRoster.players.forEach(mapRoster);

                const deltas = calculateMatchDeltas(matchLog, matchWinner, playerTeamMap, rosterMap);
                batchUpdateStats(deltas);

                // Success notification
                showNotification({
                    type: 'success',
                    mainText: t('notifications.matchSaved'),
                    subText: user ? "Saved & Synced" : t('notifications.profileSynced'),
                    systemIcon: 'save'
                });
            };

            // Execute async save
            saveMatch().catch(err => {
                console.error('[useMatchSaver] Save failed:', err);
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
