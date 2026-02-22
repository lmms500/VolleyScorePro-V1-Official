/**
 * Court Positioning Utility
 *
 * Provides logic to auto-position players in their correct court slots
 * based on their saved role (position), following the official volleyball
 * rotation numbering (Zones 1-6).
 *
 * Zone Map for 6v6 (array index → zone number):
 *   index 0 → Zone 1 (Serve / Back-Right)   → Setter (Levantador)
 *   index 1 → Zone 6 (Back-Center)           → Middle 2 (Central 2)
 *   index 2 → Zone 5 (Back-Left)             → Libero or Hitter 2
 *   index 3 → Zone 4 (Front-Left / Entry)    → Hitter (Ponteiro)
 *   index 4 → Zone 3 (Front-Center / Middle) → Middle 1 (Central 1)
 *   index 5 → Zone 2 (Front-Right / Exit)    → Opposite (Oposto)
 */

import { Player, PlayerRole } from '@types';

/**
 * Priority map: which array index (0-5) each role prefers.
 * For 6v6 indoor volleyball.
 */
const ROLE_PRIORITY_SLOTS: Record<PlayerRole, number[]> = {
    setter: [0],       // Zone 1 — server position
    opposite: [5],       // Zone 2 — exit/opposite position
    hitter: [3, 2],    // Zone 4 (entry), then Zone 5 (back-left)
    middle: [4, 1],    // Zone 3 (front-center), then Zone 6 (back-center)
    libero: [2],       // Zone 5 — back-left (libero defensive zone)
    none: [],        // No preference — fills remaining slots
};

/**
 * Role assignment order: defines which roles are placed first
 * to minimize conflicts.
 */
const ROLE_PLACEMENT_ORDER: PlayerRole[] = [
    'setter',
    'opposite',
    'libero',
    'middle',
    'hitter',
    'none',
];

/**
 * Returns a new player array (length = playersOnCourt) reordered
 * so that each player occupies the slot that best matches their role.
 *
 * Only works for 6v6 (playersOnCourt === 6). Other sizes return
 * the original array unchanged.
 *
 * @param players - Current players array (up to playersOnCourt length)
 * @param playersOnCourt - Number of players on court (default: 6)
 * @returns Reordered players array of length `playersOnCourt`
 */
export function autoPositionPlayersByRole(
    players: Player[],
    playersOnCourt: number = 6
): Player[] {
    // Only supported for 6v6 indoor — other modes return as-is
    if (playersOnCourt !== 6) return [...players];

    const slotCount = playersOnCourt;
    const result: (Player | null)[] = new Array(slotCount).fill(null);
    const unassigned: Player[] = [];

    // Separate players by role
    const byRole: Partial<Record<PlayerRole, Player[]>> = {};
    for (const player of players.slice(0, slotCount)) {
        const role: PlayerRole = player.role || 'none';
        if (!byRole[role]) byRole[role] = [];
        byRole[role]!.push(player);
    }

    const occupiedSlots = new Set<number>();

    // Place roles in priority order
    for (const role of ROLE_PLACEMENT_ORDER) {
        const rolePlayers = byRole[role] || [];
        const preferredSlots = ROLE_PRIORITY_SLOTS[role];

        for (const player of rolePlayers) {
            let placed = false;

            // Try each preferred slot
            for (const slot of preferredSlots) {
                if (!occupiedSlots.has(slot)) {
                    result[slot] = player;
                    occupiedSlots.add(slot);
                    placed = true;
                    break;
                }
            }

            // If no preferred slot available, add to unassigned
            if (!placed) {
                unassigned.push(player);
            }
        }
    }

    // Fill remaining slots with unassigned players (preserving relative order)
    let unassignedIdx = 0;
    for (let i = 0; i < slotCount; i++) {
        if (result[i] === null && unassignedIdx < unassigned.length) {
            result[i] = unassigned[unassignedIdx++];
        }
    }

    // Filter out any null slots (shouldn't happen with full team)
    return result.filter((p): p is Player => p !== null);
}
