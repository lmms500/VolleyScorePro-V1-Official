import { Match, ScoreEvent } from '../store/historyStore';
import { PlayerId, SkillType, TeamId } from '@types';

export interface PlayerStat {
    id: PlayerId;
    name: string;
    points: number;
    skills: {
        attack: number;
        block: number;
        ace: number;
        opponent_error: number;
    };
}

export interface TeamStat {
    attack: number;
    block: number;
    ace: number;
    opponent_error: number;
    total: number;
}

export interface MatchStats {
    teamStats: {
        A: TeamStat;
        B: TeamStat;
    };
    topScorer?: PlayerStat;
    topAttacker?: PlayerStat;
    topBlocker?: PlayerStat;
    topServer?: PlayerStat;
    sequences: SequenceStats;
    timeouts: TimeoutStats;
    skillDistribution: SkillDistribution;
}

export interface SequenceStats {
    teamA: {
        longestStreak: number;
        currentStreak: number;
        totalRallies: number;
    };
    teamB: {
        longestStreak: number;
        currentStreak: number;
        totalRallies: number;
    };
}

export interface TimeoutStats {
    teamA: {
        total: number;
        moments: TimeoutMoment[];
    };
    teamB: {
        total: number;
        moments: TimeoutMoment[];
    };
}

export interface TimeoutMoment {
    setNumber: number;
    scoreA: number;
    scoreB: number;
    timestamp?: number;
}

export interface SkillDistribution {
    teamA: {
        attack: number;
        block: number;
        ace: number;
        opponentError: number;
    };
    teamB: {
        attack: number;
        block: number;
        ace: number;
        opponentError: number;
    };
}

export const calculateMatchStats = (match: Match): MatchStats => {
    const playerStats = new Map<string, PlayerStat>();
    const teamStats = {
        A: { attack: 0, block: 0, ace: 0, opponent_error: 0, total: 0 },
        B: { attack: 0, block: 0, ace: 0, opponent_error: 0, total: 0 }
    };

    const logs: ScoreEvent[] = match.actionLog || [];

    logs.forEach(log => {
        if (log.type === 'POINT') {
            const teamId = log.team;
            const skill = log.skill || 'generic';

            teamStats[teamId].total++;
            if (skill === 'attack') teamStats[teamId].attack++;
            if (skill === 'block') teamStats[teamId].block++;
            if (skill === 'ace') teamStats[teamId].ace++;
            if (skill === 'opponent_error') teamStats[teamId].opponent_error++;

            if (log.playerId) {
                const roster = teamId === 'A' ? match.teamARoster : match.teamBRoster;
                const player = roster?.players.find(p => p.id === log.playerId) ||
                    roster?.reserves.find(p => p.id === log.playerId);

                const playerName = player?.name || 'Unknown';

                if (!playerStats.has(log.playerId)) {
                    playerStats.set(log.playerId, {
                        id: log.playerId,
                        name: playerName,
                        points: 0,
                        skills: { attack: 0, block: 0, ace: 0, opponent_error: 0 }
                    });
                }

                const pStat = playerStats.get(log.playerId)!;
                pStat.points++;
                if (skill === 'attack' || skill === 'block' || skill === 'ace') {
                    pStat.skills[skill as 'attack' | 'block' | 'ace']++;
                }
            }
        }
    });

    const allPlayers = Array.from(playerStats.values());

    const topScorer = allPlayers.sort((a, b) => b.points - a.points)[0];
    const topAttacker = allPlayers.sort((a, b) => b.skills.attack - a.skills.attack)[0];
    const topBlocker = allPlayers.sort((a, b) => b.skills.block - a.skills.block)[0];
    const topServer = allPlayers.sort((a, b) => b.skills.ace - a.skills.ace)[0];

    const sequences = calculateSequences(logs);
    const timeouts = calculateTimeouts(logs, match);
    const skillDistribution = calculateSkillDistribution(teamStats);

    return {
        teamStats,
        topScorer: topScorer?.points > 0 ? topScorer : undefined,
        topAttacker: topAttacker?.skills.attack > 0 ? topAttacker : undefined,
        topBlocker: topBlocker?.skills.block > 0 ? topBlocker : undefined,
        topServer: topServer?.skills.ace > 0 ? topServer : undefined,
        sequences,
        timeouts,
        skillDistribution
    };
};

const calculateSequences = (logs: ScoreEvent[]): SequenceStats => {
    let teamALongestStreak = 0;
    let teamBLongestStreak = 0;
    let teamACurrentStreak = 0;
    let teamBCurrentStreak = 0;
    let teamATotalRallies = 0;
    let teamBTotalRallies = 0;

    let currentStreakA = 0;
    let currentStreakB = 0;
    let lastScoringTeam: TeamId | null = null;

    const pointLogs = logs.filter(l => l.type === 'POINT').sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    pointLogs.forEach(log => {
        if (log.type === 'POINT') {
            const team = log.team;

            if (team === 'A') {
                teamATotalRallies++;
                if (lastScoringTeam === 'A') {
                    currentStreakA++;
                } else {
                    currentStreakA = 1;
                    currentStreakB = 0;
                }
                teamACurrentStreak = currentStreakA;
                teamBCurrentStreak = 0;
                if (currentStreakA > teamALongestStreak) {
                    teamALongestStreak = currentStreakA;
                }
            } else {
                teamBTotalRallies++;
                if (lastScoringTeam === 'B') {
                    currentStreakB++;
                } else {
                    currentStreakB = 1;
                    currentStreakA = 0;
                }
                teamBCurrentStreak = currentStreakB;
                teamACurrentStreak = 0;
                if (currentStreakB > teamBLongestStreak) {
                    teamBLongestStreak = currentStreakB;
                }
            }
            lastScoringTeam = team;
        }
    });

    return {
        teamA: {
            longestStreak: teamALongestStreak,
            currentStreak: teamACurrentStreak,
            totalRallies: teamATotalRallies
        },
        teamB: {
            longestStreak: teamBLongestStreak,
            currentStreak: teamBCurrentStreak,
            totalRallies: teamBTotalRallies
        }
    };
};

const calculateTimeouts = (logs: ScoreEvent[], match: Match): TimeoutStats => {
    const teamATimeouts: TimeoutMoment[] = [];
    const teamBTimeouts: TimeoutMoment[] = [];

    const timeoutLogs = logs.filter(l => l.type === 'TIMEOUT').sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    timeoutLogs.forEach(log => {
        if (log.type === 'TIMEOUT') {
            const moment: TimeoutMoment = {
                setNumber: determineSetNumber(log.timestamp, match),
                scoreA: log.prevTimeoutsA,
                scoreB: log.prevTimeoutsB,
                timestamp: log.timestamp
            };

            if (log.team === 'A') {
                teamATimeouts.push(moment);
            } else {
                teamBTimeouts.push(moment);
            }
        }
    });

    return {
        teamA: {
            total: teamATimeouts.length,
            moments: teamATimeouts
        },
        teamB: {
            total: teamBTimeouts.length,
            moments: teamBTimeouts
        }
    };
};

const determineSetNumber = (timestamp: number | undefined, match: Match): number => {
    if (!timestamp || !match.sets) return 1;

    const setEndTimeStamps: number[] = [];
    let cumulativeTime = 0;

    match.sets.forEach((set, index) => {
        setEndTimeStamps.push(cumulativeTime);
        cumulativeTime += 300;
    });

    for (let i = setEndTimeStamps.length - 1; i >= 0; i--) {
        if (timestamp >= setEndTimeStamps[i]) {
            return i + 1;
        }
    }

    return 1;
};

const calculateSkillDistribution = (teamStats: { A: TeamStat; B: TeamStat }): SkillDistribution => {
    const calculatePercentage = (team: TeamStat) => {
        const total = team.attack + team.block + team.ace + team.opponent_error;
        if (total === 0) {
            return { attack: 0, block: 0, ace: 0, opponentError: 0 };
        }
        return {
            attack: Math.round((team.attack / total) * 100),
            block: Math.round((team.block / total) * 100),
            ace: Math.round((team.ace / total) * 100),
            opponentError: Math.round((team.opponent_error / total) * 100)
        };
    };

    return {
        teamA: calculatePercentage(teamStats.A),
        teamB: calculatePercentage(teamStats.B)
    };
};

export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
