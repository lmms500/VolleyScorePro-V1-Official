/**
 * Game Mode Configuration Registry
 *
 * Central source of truth for all game mode presets.
 * Defines court limits, bench limits, and visual layout for each mode.
 */

import { GameModeConfig, GameModePreset, CourtLayoutConfig, GameMode, GameConfig } from '@types';

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
  gridRowsVertical: 2,
  gridColsVertical: 3,
  gridOrderTop: [0, 1, 2, 5, 4, 3], // Row 0 (Back): Z1(R), Z6(C), Z5(L) [Screen: L, C, R]. Row 1 (Front): Z2(R), Z3(C), Z4(L) [Screen: L, C, R].
  gridOrderBottom: [3, 4, 5, 2, 1, 0], // Row 0 (Front): Z4(L), Z3(C), Z2(R). Row 1 (Back): Z5(L), Z6(C), Z1(R).
  // Wait, indices:
  // Team A (Top): Row 0 (Back): P2(Z5), P1(Z6), P0(Z1). Row 1 (Front): P3(Z4), P4(Z3), P5(Z2).
  //  -> [2, 1, 0, 3, 4, 5] ??
  // Let's re-verify visual mapping.
  // Team A Left Side (Normal):
  // Col 0 (Back): Z5(P2), Z6(P1), Z1(P0).
  // Col 1 (Front): Z4(P3), Z3(P4), Z2(P5).
  // Row 0 (Top): Z5, Z4. Row 1 (Mid): Z6, Z3. Row 2 (Bot): Z1, Z2.
  // Rotated 90 CW (Team A Top):
  // Old Row 2 -> New Col 0. Old Row 1 -> New Col 1. Old Row 0 -> New Col 2.
  // Old Col 0 -> New Row 0 (Back). Old Col 1 -> New Row 1 (Front).
  //
  // Row 0 (Back): Old (2,0)=P0(Z1), Old(1,0)=P1(Z6), Old(0,0)=P2(Z5). -> [0, 1, 2]
  // Row 1 (Front): Old (2,1)=P5(Z2), Old(1,1)=P4(Z3), Old(0,1)=P3(Z4). -> [5, 4, 3]
  // So: [0, 1, 2, 5, 4, 3] is correct for "Left-to-Right" on screen?
  // Yes.
  //
  // Team B Right Side (Normal):
  // Col 0 (Front/Net), Col 1 (Back).
  // Row 0 (Top): Z2(P5), Z1(P0).
  // Row 1 (Mid): Z3(P4), Z6(P1).
  // Row 2 (Bot): Z4(P3), Z5(P2).
  // Rotated 90 CW (Team B Bottom):
  // Old Col 0 -> New Row 0 (Front/Net). Old Col 1 -> New Row 1 (Back).
  // Old Row 0 -> New Col 2. Old Row 2 -> New Col 0.
  //
  // Row 0 (Front): Old (2,0)=P3(Z4), Old(1,0)=P4(Z3), Old(0,0)=P5(Z2). -> [3, 4, 5]
  // Row 1 (Back): Old (2,1)=P2(Z5), Old(1,1)=P1(Z6), Old(0,1)=P0(Z1). -> [2, 1, 0]
  // So: [3, 4, 5, 2, 1, 0] is correct.

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
  gridRowsVertical: 2,
  gridColsVertical: 3,
  // 5v5 Logic (similar to 6v6 but with holes)
  // Team A Left:
  // [1 (TopLeft)] [2 (TopRight)] -> Row 0
  // [-]           [3 (MidRight)] -> Row 1
  // [0 (BotLeft)] [4 (BotRight)] -> Row 2
  // Rotated 90 CW (Team A Top):
  // Row 0 (Back): P0(0,0), -1(1,0), P1(2,0)? No.
  // Old Row 2 -> New Col 0. Old Row 1 -> New Col 1. Old Row 0 -> New Col 2.
  // Old Col 0 -> New Row 0 (Back). Old Col 1 -> New Row 1 (Front).
  //
  // Row 0 (Back): Old(2,0)=P0, Old(1,0)=-1, Old(0,0)=P1. -> [0, -1, 1]
  // Row 1 (Front): Old(2,1)=P4, Old(1,1)=P3, Old(0,1)=P2. -> [4, 3, 2]
  gridOrderTop: [0, -1, 1, 4, 3, 2],
  // Team B Right:
  // [4 (TopLeft)] [0 (TopRight)] -> Row 0
  // [3 (MidLeft)] [-]            -> Row 1
  // [2 (BotLeft)] [1 (BotRight)] -> Row 2
  // Rotated 90 CW (Team B Bottom):
  // Row 0 (Front): Old(2,0)=P2, Old(1,0)=P3, Old(0,0)=P4. -> [2, 3, 4]
  // Row 1 (Back): Old(2,1)=P1, Old(1,1)=-1, Old(0,1)=P0. -> [1, -1, 0]
  gridOrderBottom: [2, 3, 4, 1, -1, 0],
};

const LAYOUT_4V4: CourtLayoutConfig = {
  playersOnCourt: 4,
  benchLimit: 3,
  gridRows: 2,
  gridCols: 2,
  zoneMap: [1, 4, 3, 2],
  gridOrderLeft: [1, 2, 0, 3],
  gridOrderRight: [3, 0, 2, 1],
  gridRowsVertical: 2,
  gridColsVertical: 2,
  // 4v4 Left:
  // [1] [2]
  // [0] [3]
  // Top: [0, 1, 3, 2]
  gridOrderTop: [0, 1, 3, 2],
  // 4v4 Right:
  // [3] [0]
  // [2] [1]
  // Bottom: [2, 3, 1, 0]
  gridOrderBottom: [2, 3, 1, 0],
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
  gridRowsVertical: 2,
  gridColsVertical: 3,
  // 3v3 Left:
  // [1] [-]
  // [-] [2]
  // [0] [-]
  // Top:
  // Row 0 (Back): [0, -1, 1]
  // Row 1 (Front): [-1, 2, -1]
  gridOrderTop: [0, -1, 1, -1, 2, -1],
  // 3v3 Right:
  // [-] [0]
  // [2] [-]
  // [-] [1]
  // Bottom:
  // Row 0 (Front): [-1, 2, -1]
  // Row 1 (Back): [1, -1, 0]
  gridOrderBottom: [-1, 2, -1, 1, -1, 0],
};

const LAYOUT_2V2: CourtLayoutConfig = {
  playersOnCourt: 2,
  benchLimit: 1,
  gridRows: 1,
  gridCols: 2,
  zoneMap: [1, 2],
  gridOrderLeft: [0, 1],
  gridOrderRight: [1, 0],
  gridRowsVertical: 1,
  gridColsVertical: 2,
  // 2v2 Left: [0, 1] (Back Left, Back Right? Usually Side by Side)
  // [0] [1] (Vertical stack in landscape -> Wait 2v2 usually is side by side)
  // Grid Rows 1 means 1 row (vertical in landscape).
  // So P0 (Left), P1 (Right).
  // Rotated: P1 (Top), P0 (Bottom)? No.
  // Rotated 90 CW:
  // Old Left -> Top. Old Right -> Bottom.
  // So: P0 (Bottom? No, Left becomes Top).
  // Wait.
  // Left Baseline is Left. Right Baseline is Right.
  // P0 is closer to Left Baseline?
  // Let's assume standard side-by-side.
  // Top: [1, 0]
  // Bottom: [0, 1]
  gridOrderTop: [1, 0],
  gridOrderBottom: [0, 1],
};

// ============================================
// GAME MODE PRESETS
// ============================================

export const GAME_MODE_PRESETS: Record<GameModePreset, GameModeConfig> = {
  'indoor-6v6': {
    preset: 'indoor-6v6',
    label: 'gameModes.presets.indoor6v6',
    type: 'indoor',
    courtLayout: LAYOUT_6V6,
  },
  'quads-5v5': {
    preset: 'quads-5v5',
    label: 'gameModes.presets.quads5v5',
    type: 'indoor',
    courtLayout: LAYOUT_5V5,
  },
  'beach-4v4': {
    preset: 'beach-4v4',
    label: 'gameModes.presets.beach4v4',
    type: 'beach',
    courtLayout: LAYOUT_4V4,
  },
  'triples-3v3': {
    preset: 'triples-3v3',
    label: 'gameModes.presets.triples3v3',
    type: 'beach',
    courtLayout: LAYOUT_3V3,
  },
  'beach-2v2': {
    preset: 'beach-2v2',
    label: 'gameModes.presets.beach2v2',
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
