

import { GameConfig } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  mode: 'indoor',
  maxSets: 5, // Official FIVB: Best of 5
  pointsPerSet: 25, // Sets 1-4 are 25 points
  hasTieBreak: true,
  tieBreakPoints: 15, // 5th set is 15 points
  deuceType: 'standard',
  rotationMode: 'standard',
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
  developerMode: false
};

export const MIN_LEAD_TO_WIN = 2;

export const SETS_TO_WIN_MATCH = (maxSets: number) => Math.ceil(maxSets / 2);

export const PLAYER_LIMIT_ON_COURT = 6;
export const PLAYERS_PER_TEAM = 6;