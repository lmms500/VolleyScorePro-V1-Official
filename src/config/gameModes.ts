/**
 * Game Mode Configuration Registry
 *
 * Central source of truth for all game mode presets.
 * Defines court limits, bench limits, and visual layout for each mode.
 */

import { GameModeConfig, GameModePreset, CourtLayoutConfig, GameMode, GameConfig } from '../types';

// ============================================
// COURT LAYOUT CONFIGURATIONS
// ============================================

const LAYOUT_6V6: CourtLayoutConfig = {
  playersOnCourt: 6,
  benchLimit: 6,
  gridRows: 3,
  gridCols: 2,
  zoneMap: [1, 6, 5, 4, 3, 2],
  gridOrderLeft: [2, 3, 1, 4, 0, 5],
  gridOrderRight: [5, 0, 4, 1, 3, 2],
};

const LAYOUT_5V5: CourtLayoutConfig = {
  playersOnCourt: 5,
  benchLimit: 4,
  gridRows: 3,
  gridCols: 2,
  zoneMap: [1, 5, 4, 3, 2],
  // Corrected for Clockwise Rotation (0->1->2->3->4)
  // Indices map to physical clockwise path: BotLeft -> TopLeft -> TopRight -> MidRight -> BotRight -> BotLeft
  // Team A (Left):
  // [1 (TopLeft)] [2 (TopRight)]
  // [-]           [3 (MidRight)]
  // [0 (BotLeft)] [4 (BotRight)]
  gridOrderLeft: [1, 2, -1, 3, 0, 4],

  // Team B (Right):
  // [4 (TopLeft)] [0 (TopRight)]
  // [3 (MidLeft)] [-]
  // [2 (BotLeft)] [1 (BotRight)]
  gridOrderRight: [4, 0, 3, -1, 2, 1],
};

const LAYOUT_4V4: CourtLayoutConfig = {
  playersOnCourt: 4,
  benchLimit: 3,
  gridRows: 2,
  gridCols: 2,
  zoneMap: [1, 4, 3, 2],
  gridOrderLeft: [1, 2, 0, 3],
  gridOrderRight: [3, 0, 2, 1],
};

const LAYOUT_3V3: CourtLayoutConfig = {
  playersOnCourt: 3,
  benchLimit: 2,
  gridRows: 3,
  gridCols: 2,
  zoneMap: [1, 2, 3], // Updated to 1,2,3 for clarity
  // Corrected for Clockwise Rotation (0->1->2) based on triangle path
  // Order: BotLeft(0) -> TopLeft(1) -> MidRight(2) -> BotLeft(0)

  // Team A (Left):
  // [1 (TopLeft)] [-]
  // [-]           [2 (Net)]
  // [0 (BotLeft)] [-]
  gridOrderLeft: [1, -1, -1, 2, 0, -1],

  // Team B (Right) - Mirrored:
  // Order: TopRight(0) -> BotRight(1) -> MidLeft(2) -> TopRight(0)
  // [-]           [0 (TopRight)]
  // [2 (Net)]     [-]
  // [-]           [1 (BotRight)]
  gridOrderRight: [-1, 0, 2, -1, -1, 1],
};

const LAYOUT_2V2: CourtLayoutConfig = {
  playersOnCourt: 2,
  benchLimit: 1,
  gridRows: 1,
  gridCols: 2,
  zoneMap: [1, 2],
  gridOrderLeft: [0, 1],
  gridOrderRight: [1, 0],
};

// ============================================
// GAME MODE PRESETS
// ============================================

export const GAME_MODE_PRESETS: Record<GameModePreset, GameModeConfig> = {
  'indoor-6v6': {
    preset: 'indoor-6v6',
    label: 'Indoor 6v6',
    type: 'indoor',
    courtLayout: LAYOUT_6V6,
  },
  'quads-5v5': {
    preset: 'quads-5v5',
    label: 'Quads 5v5',
    type: 'indoor',
    courtLayout: LAYOUT_5V5,
  },
  'beach-4v4': {
    preset: 'beach-4v4',
    label: 'Beach 4v4',
    type: 'beach',
    courtLayout: LAYOUT_4V4,
  },
  'triples-3v3': {
    preset: 'triples-3v3',
    label: 'Triples 3v3',
    type: 'beach',
    courtLayout: LAYOUT_3V3,
  },
  'beach-2v2': {
    preset: 'beach-2v2',
    label: 'Beach Doubles 2v2',
    type: 'beach',
    courtLayout: LAYOUT_2V2,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get full GameModeConfig based on mode and optional player count.
 * Provides backwards compatibility for states without modeConfig.
 *
 * @param mode - 'indoor' or 'beach'
 * @param playersOnCourt - Optional specific player count
 * @returns Full GameModeConfig object
 */
export function getGameModeConfig(
  mode: GameMode,
  playersOnCourt?: number
): GameModeConfig {
  // If specific player count provided, find matching preset
  if (playersOnCourt !== undefined) {
    const match = Object.values(GAME_MODE_PRESETS).find(
      p => p.courtLayout.playersOnCourt === playersOnCourt
    );
    if (match) return match;
  }

  // Default based on mode
  if (mode === 'beach') {
    return GAME_MODE_PRESETS['beach-4v4'];
  }

  // Default fallback: indoor 6v6
  return GAME_MODE_PRESETS['indoor-6v6'];
}

/**
 * Get court layout from GameConfig with backwards compatibility.
 * Use this when you need layout info from state.
 */
export function getCourtLayoutFromConfig(config: {
  mode: GameMode;
  modeConfig?: GameModeConfig
}): CourtLayoutConfig {
  if (config.modeConfig) {
    return config.modeConfig.courtLayout;
  }
  return getGameModeConfig(config.mode).courtLayout;
}

/**
 * Check if a grid order index is an empty slot.
 * Empty slots are represented by -1 in gridOrder arrays.
 */
export function isEmptySlot(gridOrderIndex: number): boolean {
  return gridOrderIndex === -1;
}

/**
 * Get the total grid slots (including empty) for a layout.
 */
export function getTotalGridSlots(layout: CourtLayoutConfig): number {
  return layout.gridRows * layout.gridCols;
}

/**
 * Get players on court count from config with backwards compatibility.
 * @param config - Game configuration object
 * @returns Number of players that should be on court
 */
export function getPlayersOnCourtFromConfig(config: GameConfig): number {
  return getCourtLayoutFromConfig(config).playersOnCourt;
}

/**
 * Get bench limit from config with backwards compatibility.
 * @param config - Game configuration object
 * @returns Maximum number of players allowed on bench
 */
export function getBenchLimitFromConfig(config: GameConfig): number {
  return getCourtLayoutFromConfig(config).benchLimit;
}
