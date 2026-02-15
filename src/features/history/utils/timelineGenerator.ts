
import { Match } from '../store/historyStore';
import { TimelineNode, TeamId } from '@types';

export const generateTimelineNodes = (match: Match, t: (key: string) => string): TimelineNode[] => {
    if (!match.actionLog || match.actionLog.length === 0) return [];

    // 1. STRICT SORTING: The absolute source of truth is Time.
    const sortedLogs = (match.actionLog || [])
        .filter(l => (l.timestamp || 0) > 1000000) // Sanity check: ignore logs with missing/invalid timestamps
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // Determine accurate Start Time
    const firstLogTs = sortedLogs.length > 0 ? (sortedLogs[0].timestamp || 0) : 0;
    const estimatedStart = match.timestamp - (match.durationSeconds * 1000);
    const startTime = (firstLogTs > 0 && firstLogTs < match.timestamp) ? firstLogTs : estimatedStart;

    const nodes: TimelineNode[] = [];

    // Running State
    let scoreA = 0;
    let scoreB = 0;
    let currentSet = 1;
    const firstPointLog = sortedLogs.find(l => l.type === 'POINT');
    let wasInSuddenDeath = (firstPointLog && firstPointLog.prevInSuddenDeath) || false;

    // Staggering State
    let lastTeam: TeamId | null = null;
    let streakCount = 0;

    // Helper: Player Name Resolution
    const getPlayerName = (id: string | null | undefined): string => {
        if (!id || id === 'unknown') return '';
        const pA = match.teamARoster?.players.find(p => p.id === id) || match.teamARoster?.reserves?.find(p => p.id === id);
        if (pA) return pA.name;
        const pB = match.teamBRoster?.players.find(p => p.id === id) || match.teamBRoster?.reserves?.find(p => p.id === id);
        return pB ? pB.name : '';
    };

    // Helper: Format Time
    const getTimeLabel = (ts: number) => {
        const diff = Math.max(0, Math.floor((ts - startTime) / 60000));
        return `${diff}'`;
    };

    // 2. INITIAL NODE
    nodes.push({
        id: 'node-start',
        type: 'START',
        timestamp: startTime,
        timeLabel: '0\'',
        team: null,
        scoreSnapshot: '0-0',
        description: 'START',
        isTop: false,
        staggerLevel: 0
    });

    sortedLogs.forEach((log, idx) => {

        // Detect Sudden Death Transition
        if (log.type === 'POINT' && log.prevInSuddenDeath === true && !wasInSuddenDeath) {
            // Only add Sudden Death node if we are not at the very start of the match/set
            if (scoreA + scoreB > 0) {
                nodes.push({
                    id: `sd-start-${idx}`,
                    type: 'SUDDEN_DEATH',
                    timestamp: (log.timestamp || 0) - 1,
                    timeLabel: getTimeLabel((log.timestamp || 0)),
                    team: null,
                    scoreSnapshot: `${scoreA}-${scoreB}`,
                    description: t('status.sudden_death'),
                    isTop: false,
                    staggerLevel: 0
                });
            }
            wasInSuddenDeath = true;
            scoreA = 0;
            scoreB = 0;
        }
        else if (log.type === 'POINT' && log.prevInSuddenDeath === false) {
            wasInSuddenDeath = false;
        }

        if (log.type === 'POINT') {
            if (log.team === 'A') scoreA++; else scoreB++;

            if (log.team === lastTeam) {
                streakCount++;
            } else {
                streakCount = 0;
            }
            lastTeam = log.team;

            const staggerLevel = streakCount % 2;

            let desc = t('common.add');
            if (log.skill === 'attack') desc = t('scout.skills.attack');
            if (log.skill === 'block') desc = t('scout.skills.block');
            if (log.skill === 'ace') desc = t('scout.skills.ace');
            if (log.skill === 'opponent_error') desc = t('scout.skills.opponent_error');

            nodes.push({
                id: `node-${idx}`,
                type: 'POINT',
                timestamp: log.timestamp || 0,
                timeLabel: getTimeLabel(log.timestamp || 0),
                team: log.team,
                scoreSnapshot: `${scoreA}-${scoreB}`,
                description: desc,
                player: getPlayerName(log.playerId),
                skill: log.skill,
                isTop: log.team === 'A',
                staggerLevel: staggerLevel
            });

            // Set End Detection
            const setRecord = match.sets.find(s => s.setNumber === currentSet);
            if (setRecord && scoreA === setRecord.scoreA && scoreB === setRecord.scoreB) {
                nodes.push({
                    id: `set-end-${currentSet}`,
                    type: 'SET_END',
                    timestamp: (log.timestamp || 0) + 1,
                    timeLabel: getTimeLabel((log.timestamp || 0)),
                    team: null,
                    scoreSnapshot: `${scoreA}-${scoreB}`,
                    description: `SET ${currentSet}`,
                    isTop: false,
                    staggerLevel: 0
                });

                scoreA = 0;
                scoreB = 0;
                currentSet++;
                lastTeam = null;
                streakCount = 0;
                wasInSuddenDeath = false;
            }
        }
        else if (log.type === 'TIMEOUT') {
            nodes.push({
                id: `to-${idx}`,
                type: 'TIMEOUT',
                timestamp: log.timestamp || 0,
                timeLabel: getTimeLabel(log.timestamp || 0),
                team: log.team,
                scoreSnapshot: `${scoreA}-${scoreB}`,
                description: t('game.timeout'),
                isTop: log.team === 'A',
                staggerLevel: 2
            });
        }
    });

    // 3. END NODE
    const lastLogTs = sortedLogs.length > 0 ? (sortedLogs[sortedLogs.length - 1].timestamp || 0) : startTime;
    nodes.push({
        id: 'node-end',
        type: 'END',
        timestamp: lastLogTs + 1000,
        timeLabel: '',
        team: null,
        scoreSnapshot: '',
        description: 'END',
        isTop: false,
        staggerLevel: 0
    });

    return nodes;
};
