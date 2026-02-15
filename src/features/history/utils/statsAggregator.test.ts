import { calculateMatchStats } from './statsAggregator';
import { Match } from '../store/historyStore';
import { TeamId, SkillType } from '@types';

// Mock Match Data Helper
const createMockMatch = (logs: any[]): Match => ({
    id: 'test-match',
    date: '2023-01-01',
    timestamp: 123456789,
    durationSeconds: 3600,
    teamAName: 'Team A',
    teamBName: 'Team B',
    setsA: 3,
    setsB: 0,
    winner: 'A',
    sets: [],
    config: {} as any,
    teamARoster: {
        id: 'team-a', name: 'Team A', color: 'blue', players: [
            { id: 'p1', name: 'Player 1', skillLevel: 5, isFixed: false, originalIndex: 0 },
            { id: 'p2', name: 'Player 2', skillLevel: 5, isFixed: false, originalIndex: 1 }
        ], reserves: []
    },
    teamBRoster: {
        id: 'team-b', name: 'Team B', color: 'red', players: [
            { id: 'p3', name: 'Player 3', skillLevel: 5, isFixed: false, originalIndex: 0 }
        ], reserves: []
    },
    actionLog: logs
});

describe('statsAggregator', () => {
    it('should calculate team totals correctly', () => {
        const logs = [
            { type: 'POINT', team: 'A', skill: 'attack' },
            { type: 'POINT', team: 'A', skill: 'block' },
            { type: 'POINT', team: 'B', skill: 'ace' },
            { type: 'POINT', team: 'A', skill: 'opponent_error' },
        ];
        const match = createMockMatch(logs);
        const stats = calculateMatchStats(match);

        expect(stats.teamStats.A.total).toBe(3);
        expect(stats.teamStats.A.attack).toBe(1);
        expect(stats.teamStats.A.block).toBe(1);
        expect(stats.teamStats.A.opponent_error).toBe(1);

        expect(stats.teamStats.B.total).toBe(1);
        expect(stats.teamStats.B.ace).toBe(1);
    });

    it('should identify top scorer correctly', () => {
        const logs = [
            { type: 'POINT', team: 'A', playerId: 'p1', skill: 'attack' },
            { type: 'POINT', team: 'A', playerId: 'p1', skill: 'attack' },
            { type: 'POINT', team: 'A', playerId: 'p2', skill: 'block' },
        ];
        const match = createMockMatch(logs);
        const stats = calculateMatchStats(match);

        expect(stats.topScorer?.id).toBe('p1');
        expect(stats.topScorer?.points).toBe(2);
    });

    it('should identify top blocker correctly', () => {
        const logs = [
            { type: 'POINT', team: 'A', playerId: 'p1', skill: 'attack' },
            { type: 'POINT', team: 'A', playerId: 'p1', skill: 'attack' },
            { type: 'POINT', team: 'A', playerId: 'p2', skill: 'block' }, // Only block
        ];
        const match = createMockMatch(logs);
        const stats = calculateMatchStats(match);

        expect(stats.topBlocker?.id).toBe('p2');
        expect(stats.topBlocker?.skills.block).toBe(1);
    });

    it('should handle missing player IDs (generic team points)', () => {
        const logs = [
            { type: 'POINT', team: 'A', skill: 'attack' }, // No playerId
        ];
        const match = createMockMatch(logs);
        const stats = calculateMatchStats(match);

        expect(stats.teamStats.A.total).toBe(1);
        expect(stats.topScorer).toBeUndefined();
    });

    it('should return undefined for highlights if no stats exist', () => {
        const match = createMockMatch([]);
        const stats = calculateMatchStats(match);

        expect(stats.topScorer).toBeUndefined();
        expect(stats.topAttacker).toBeUndefined();
    });
});
