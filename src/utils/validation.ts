/**
 * Team and Match Validation Utilities
 *
 * Provides validation functions for dynamic game modes.
 * Use these before starting matches or making roster changes.
 */

import { Team, GameConfig } from '../types';
import { getCourtLayoutFromConfig } from '../config/gameModes';

// ============================================
// TYPES
// ============================================

export interface TeamValidationResult {
  isValid: boolean;
  canStartMatch: boolean;
  playerCount: number;
  requiredPlayers: number;
  benchCount: number;
  benchLimit: number;
  warnings: string[];
  errors: string[];
}

export interface MatchValidationResult {
  canStart: boolean;
  teamAValidation: TeamValidationResult;
  teamBValidation: TeamValidationResult;
  reason?: string;
}

// ============================================
// TEAM VALIDATION
// ============================================

/**
 * Validate a team against the current game mode configuration.
 *
 * @param team - Team to validate
 * @param config - Current game configuration
 * @returns Detailed validation result
 */
export function validateTeamForMatch(
  team: Team,
  config: GameConfig
): TeamValidationResult {
  const layout = getCourtLayoutFromConfig(config);
  const { playersOnCourt, benchLimit } = layout;

  const playerCount = team.players.length;
  const benchCount = (team.reserves || []).length;

  const result: TeamValidationResult = {
    isValid: true,
    canStartMatch: false,
    playerCount,
    requiredPlayers: playersOnCourt,
    benchCount,
    benchLimit,
    warnings: [],
    errors: [],
  };

  // Check minimum players
  if (playerCount < playersOnCourt) {
    result.errors.push(
      `Faltam ${playersOnCourt - playerCount} jogadores. ` +
      `Necessário: ${playersOnCourt}, Atual: ${playerCount}`
    );
    result.isValid = false;
  }

  // Team can start if has minimum players
  if (playerCount >= playersOnCourt) {
    result.canStartMatch = true;
  }

  // Warn if over bench limit
  if (benchCount > benchLimit) {
    result.warnings.push(
      `Banco excede limite de ${benchLimit}. Atual: ${benchCount}`
    );
  }

  // Warn if no substitutes available
  if (playerCount === playersOnCourt && benchCount === 0) {
    result.warnings.push('Sem substitutos disponíveis no banco');
  }

  // Warn if team has too many players on court (shouldn't happen)
  if (playerCount > playersOnCourt) {
    result.warnings.push(
      `Time com ${playerCount} jogadores em quadra, ` +
      `máximo permitido: ${playersOnCourt}`
    );
  }

  return result;
}

/**
 * Validate if a match can start with the current teams.
 *
 * @param teamA - First team
 * @param teamB - Second team
 * @param config - Current game configuration
 * @returns Match validation result
 */
export function validateMatchStart(
  teamA: Team,
  teamB: Team,
  config: GameConfig
): MatchValidationResult {
  const teamAValidation = validateTeamForMatch(teamA, config);
  const teamBValidation = validateTeamForMatch(teamB, config);

  const result: MatchValidationResult = {
    canStart: true,
    teamAValidation,
    teamBValidation,
  };

  if (!teamAValidation.canStartMatch) {
    result.canStart = false;
    result.reason = `${teamA.name}: ${teamAValidation.errors.join(', ')}`;
  } else if (!teamBValidation.canStartMatch) {
    result.canStart = false;
    result.reason = `${teamB.name}: ${teamBValidation.errors.join(', ')}`;
  }

  return result;
}

/**
 * Check if a team is complete (has exactly the required players).
 *
 * @param team - Team to check
 * @param config - Current game configuration
 * @returns true if team has exactly playersOnCourt players
 */
export function isTeamComplete(team: Team, config: GameConfig): boolean {
  const layout = getCourtLayoutFromConfig(config);
  return team.players.length === layout.playersOnCourt;
}

/**
 * Check if a team's bench is full.
 *
 * @param team - Team to check
 * @param config - Current game configuration
 * @returns true if reserves have reached benchLimit
 */
export function isBenchFull(team: Team, config: GameConfig): boolean {
  const layout = getCourtLayoutFromConfig(config);
  return (team.reserves || []).length >= layout.benchLimit;
}

/**
 * Check if a team can accept more players on court.
 *
 * @param team - Team to check
 * @param config - Current game configuration
 * @returns true if team.players.length < playersOnCourt
 */
export function canAddToCourt(team: Team, config: GameConfig): boolean {
  const layout = getCourtLayoutFromConfig(config);
  return team.players.length < layout.playersOnCourt;
}

/**
 * Check if a team can accept more players on bench.
 *
 * @param team - Team to check
 * @param config - Current game configuration
 * @returns true if reserves.length < benchLimit
 */
export function canAddToBench(team: Team, config: GameConfig): boolean {
  const layout = getCourtLayoutFromConfig(config);
  return (team.reserves || []).length < layout.benchLimit;
}
