/**
 * matchValidation.ts — Pure validation logic for official match check-in
 * 
 * Determines whether a broadcast session has enough real, unique participants
 * to qualify as an "official" match for the global ranking.
 * 
 * Rules:
 * 1. Minimum participants = 2 × playersOnCourt for the game mode
 * 2. All participants must have unique Firebase UIDs
 * 3. All participants must be on unique devices (deviceFingerprint)
 */

import { GameModePreset } from '@types';
import { MatchParticipant, MatchValidationStatus } from '@types';

// --- Configuration ---

/** Minimum confirmed participants per game mode (2 × playersOnCourt) */
const REQUIRED_PLAYERS_MAP: Record<GameModePreset, number> = {
    'indoor-6v6': 12,
    'quads-5v5': 10,
    'beach-4v4': 8,
    'triples-3v3': 6,
    'beach-2v2': 4,
};

// --- Public API ---

/**
 * Get minimum number of checked-in players required for a mode to be official.
 */
export function getRequiredPlayers(preset: GameModePreset): number {
    return REQUIRED_PLAYERS_MAP[preset] ?? 4; // fallback to 2v2 minimum
}

export interface ValidationResult {
    status: MatchValidationStatus;
    isValidated: boolean;
    confirmedCount: number;
    requiredCount: number;
    /** Specific reasons why validation failed */
    issues: ValidationIssue[];
}

export type ValidationIssue =
    | { type: 'insufficient_players'; current: number; required: number }
    | { type: 'duplicate_uid'; uid: string }
    | { type: 'duplicate_device'; fingerprint: string };

/**
 * Validate whether a set of participants meets the requirements for an official match.
 * This is a pure function with no side effects — safe to call in reducers or renders.
 */
export function validateMatch(
    participants: MatchParticipant[],
    requiredPlayers: number
): ValidationResult {
    const issues: ValidationIssue[] = [];

    // 1. Check minimum count
    if (participants.length < requiredPlayers) {
        issues.push({
            type: 'insufficient_players',
            current: participants.length,
            required: requiredPlayers,
        });
    }

    // 2. Check unique UIDs
    const uidSet = new Set<string>();
    for (const p of participants) {
        if (uidSet.has(p.uid)) {
            issues.push({ type: 'duplicate_uid', uid: p.uid });
        }
        uidSet.add(p.uid);
    }

    // 3. Check unique devices
    const deviceSet = new Set<string>();
    for (const p of participants) {
        if (deviceSet.has(p.deviceFingerprint)) {
            issues.push({ type: 'duplicate_device', fingerprint: p.deviceFingerprint });
        }
        deviceSet.add(p.deviceFingerprint);
    }

    const isValidated = issues.length === 0 && participants.length >= requiredPlayers;

    return {
        status: getValidationStatus(uidSet.size, requiredPlayers, issues.length === 0),
        isValidated,
        confirmedCount: uidSet.size, // unique participants only
        requiredCount: requiredPlayers,
        issues,
    };
}

/**
 * Get a simple 3-tier status for UI display.
 */
export function getValidationStatus(
    uniqueCount: number,
    requiredCount: number,
    noIssues: boolean = true
): MatchValidationStatus {
    if (uniqueCount >= requiredCount && noIssues) return 'official';
    if (uniqueCount > 0) return 'casual';
    return 'insufficient';
}
