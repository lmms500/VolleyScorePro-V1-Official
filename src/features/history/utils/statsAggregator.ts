import { Match, ScoreEvent } from '../store/historyStore';
import { PlayerId, SkillType } from '@types';

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
}

export const calculateMatchStats = (match: Match): MatchStats => {
    const playerStats = new Map<string, PlayerStat>();
    const teamStats = {
        A: { attack: 0, block: 0, ace: 0, opponent_error: 0, total: 0 },
        B: { attack: 0, block: 0, ace: 0, opponent_error: 0, total: 0 }
    };

    const logs: ScoreEvent[] = match.actionLog || [];

    // Process logs
    logs.forEach(log => {
        if (log.type === 'POINT') {
            const teamId = log.team;
            const skill = log.skill || 'generic';

            // Team Aggregation
            teamStats[teamId].total++;
            if (skill === 'attack') teamStats[teamId].attack++;
            if (skill === 'block') teamStats[teamId].block++;
            if (skill === 'ace') teamStats[teamId].ace++;
            if (skill === 'opponent_error') teamStats[teamId].opponent_error++;

            // Player Aggregation
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

    // Sort helpers
    const getTop = (sorter: (a: PlayerStat, b: PlayerStat) => number) => {
        const sorted = [...allPlayers].sort(sorter);
        return sorted.length > 0 && sorter(sorted[0], { points: 0, skills: { attack: 0, block: 0, ace: 0, opponent_error: 0 } } as any) < 0 ? sorted[0] : undefined;
    };

    // Simple top checks - ensure > 0 to display
    const topScorer = allPlayers.sort((a, b) => b.points - a.points)[0];
    const topAttacker = allPlayers.sort((a, b) => b.skills.attack - a.skills.attack)[0];
    const topBlocker = allPlayers.sort((a, b) => b.skills.block - a.skills.block)[0];
    const topServer = allPlayers.sort((a, b) => b.skills.ace - a.skills.ace)[0];

    return {
        teamStats,
        topScorer: topScorer?.points > 0 ? topScorer : undefined,
        topAttacker: topAttacker?.skills.attack > 0 ? topAttacker : undefined,
        topBlocker: topBlocker?.skills.block > 0 ? topBlocker : undefined,
        topServer: topServer?.skills.ace > 0 ? topServer : undefined
    };
};
