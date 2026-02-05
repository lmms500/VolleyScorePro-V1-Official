
import { GameConfig, GameMode } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  mode: 'indoor',
  maxSets: 5, // Official FIVB: Best of 5
  pointsPerSet: 25, // Sets 1-4 are 25 points
  hasTieBreak: true,
  tieBreakPoints: 15, // 5th set is 15 points
  deuceType: 'standard',
  rotationMode: 'standard',
  autoSwapSides: true, // Padrão: troca automática ativa (especialmente Beach)
  enablePlayerStats: false,
  enableSound: true,
  voiceControlEnabled: false,
  announceScore: false,
  voiceGender: 'female',
  voiceRate: 1.0,
  voicePitch: 1.0,
  announcementFreq: 'all',
  lowGraphics: false,
  reducedMotion: false,
  // Default Security & Access State
  adsRemoved: false,
  developerMode: false,
  // Added missing broadcastTheme to satisfy GameConfig type
  broadcastTheme: 'minimal'
};

export const MIN_LEAD_TO_WIN = 2;

export const SETS_TO_WIN_MATCH = (maxSets: number) => Math.ceil(maxSets / 2);

// Dynamic Court Limits
export const INDOOR_COURT_LIMIT = 6;
export const BEACH_COURT_LIMIT = 4;

// Dynamic Bench Limits
export const INDOOR_BENCH_LIMIT = 6;
export const BEACH_BENCH_LIMIT = 3;

// Helper to get court limit based on mode
export const getPlayersOnCourt = (mode: GameMode) => mode === 'beach' ? BEACH_COURT_LIMIT : INDOOR_COURT_LIMIT;

// Helper to get bench limit based on mode
export const getBenchLimit = (mode: GameMode) => mode === 'beach' ? BEACH_BENCH_LIMIT : INDOOR_BENCH_LIMIT;

// Legacy constant for backwards compatibility where mode isn't available (defaulting to max)
export const PLAYER_LIMIT_ON_COURT = 6;
export const PLAYERS_PER_TEAM = 6; // Max roster size logic (can be overridden by dynamic logic)

// ========================================
// FEATURE FLAGS - PlayStore Release v1.0
// ========================================
// These flags control experimental/premium features during alpha launch
export const FEATURE_FLAGS = {
  // Real-time Broadcasting (VolleyLink Live)
  // Disabled for initial PlayStore release to focus on core functionality
  ENABLE_LIVE_SYNC: true,
  ENABLE_BROADCAST_OVERLAY: true,

  // Artificial Intelligence / Gemini Integration
  // Disabled for initial release; requires additional optimization
  ENABLE_AI_VOICE_COMMANDS: false,
  ENABLE_GEMINI_SERVICE: false,

  // Cloud Sync (Firebase sync - can stay enabled for backup/auth)
  ENABLE_CLOUD_SYNC: true,
  ENABLE_GOOGLE_AUTH: true,

  // Developer / Debug Features
  ENABLE_DEVELOPER_MODE: false,
  ENABLE_CONSOLE_LOGS: false,
};
