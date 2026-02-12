
import { describe, it, expect } from 'vitest';
import { metaReducer } from '../meta';
import { GameState, Team, Player } from '../../types';
import { INITIAL_STATE } from '../../hooks/useGameState';

// Helpers
const createPlayer = (name: string, id: string, skill: number) => ({
    id, name, skillLevel: skill, isFixed: false, originalIndex: 0
});

const createTeam = (id: string, players: Player[]) => ({
    id, name: `Team ${id}`, color: 'slate', players, reserves: [], hasActiveBench: false
});

describe('Ghost Teams Reproduction - Large Roster Switching', () => {

    const createLargeState = (playerCount: number = 20): GameState => {
        // Create 20 players
        const players = Array.from({ length: playerCount }, (_, i) =>
            createPlayer(`Player ${i + 1}`, `${i + 1}`, 10)
        );

        // Initial Mode: Indoor 6v6
        // Team A: 6, Team B: 6, Queue: Remaining (8)

        const courtA = players.slice(0, 6);
        const courtB = players.slice(6, 12);
        const queuePlayers = players.slice(12);

        // Split queue into teams of 6 (or whatever remains)
        // 8 players -> Team Q1 (6), Team Q2 (2)? 
        // Or if we just simulate "imported list", typically they fill up teams.
        // Let's create semi-realistic queue teams.
        const q1 = queuePlayers.slice(0, 6);
        const q2 = queuePlayers.slice(6);

        return {
            ...INITIAL_STATE,
            teamARoster: { ...INITIAL_STATE.teamARoster, players: courtA },
            teamBRoster: { ...INITIAL_STATE.teamBRoster, players: courtB },
            queue: [
                createTeam('Q1', q1),
                createTeam('Q2', q2)
            ],
            config: {
                ...INITIAL_STATE.config,
                mode: 'indoor' as const,
                modeConfig: {
                    preset: 'indoor-6v6',
                    label: 'Indoor 6v6',
                    type: 'indoor',
                    courtLayout: { playersOnCourt: 6, benchLimit: 6, gridRows: 3, gridCols: 2, zoneMap: [1, 6, 5, 4, 3, 2], gridOrderLeft: [], gridOrderRight: [] }
                }
            }
        };
    };

    it('should handle switching 6v6 -> 2v2 -> 5v5 without ghost teams', () => {
        let state = createLargeState(20);

        // --- Step 1: Switch to 2v2 ---
        console.log('--- Switching to 2v2 ---');
        const config2v2 = {
            ...state.config,
            mode: 'beach',
            modeConfig: {
                preset: 'beach-2v2',
                courtLayout: { playersOnCourt: 2 }
            }
        };

        state = metaReducer(state, {
            type: 'APPLY_SETTINGS',
            config: config2v2 as any,
            shouldReset: false
        });

        // 20 players / 2 per team = 10 teams total.
        // Court A (2) + Court B (2) + Queue (16 players = 8 teams).
        // Expect Queue length to be 8.

        expect(state.teamARoster.players).toHaveLength(2);
        expect(state.teamBRoster.players).toHaveLength(2);

        const queueCount2v2 = state.queue.length;
        console.log(`2v2 Queue Count: ${queueCount2v2}`);

        // Assert no empty teams
        const ghostTeams2v2 = state.queue.filter(t => t.players.length === 0);
        expect(ghostTeams2v2).toHaveLength(0);

        // Assert total player count preserved
        const totalPlayers2v2 = state.teamARoster.players.length + state.teamBRoster.players.length + state.queue.flatMap(t => t.players).length;
        expect(totalPlayers2v2).toBe(20);


        // --- Step 2: Switch to 5v5 ---
        console.log('--- Switching to 5v5 ---');
        const config5v5 = {
            ...state.config,
            mode: 'indoor',
            modeConfig: {
                preset: 'quads-5v5',
                courtLayout: { playersOnCourt: 5 }
            }
        };

        state = metaReducer(state, {
            type: 'APPLY_SETTINGS',
            config: config5v5 as any,
            shouldReset: false
        });

        // 20 players / 5 per team = 4 teams total.
        // Court A (5) + Court B (5) + Queue (10 players = 2 teams).

        expect(state.teamARoster.players).toHaveLength(5);
        expect(state.teamBRoster.players).toHaveLength(5);

        const queueCount5v5 = state.queue.length;
        console.log(`5v5 Queue Count: ${queueCount5v5}`);

        // Assert no empty teams (This is likely where it fails if bugs exist)
        const ghostTeams5v5 = state.queue.filter(t => t.players.length === 0);
        expect(ghostTeams5v5).toHaveLength(0);

        // Check for "Teleporting" issues (duplicate IDs or weird state)
        const allIds = [
            ...state.teamARoster.players.map(p => p.id),
            ...state.teamBRoster.players.map(p => p.id),
            ...state.queue.flatMap(t => t.players.map(p => p.id))
        ];
        const uniqueIds = new Set(allIds);
        expect(uniqueIds.size).toBe(20);
    });
});
