import { TeamId, Player, SkillType, ActionLog } from '@types';

export type BroadcastTheme = 'minimal' | 'espn' | 'olympic' | 'custom';

export interface BroadcastConfig {
  eventName: string;
  eventPhase: string;
  venue: string;
  broadcaster: string;
  theme: BroadcastTheme;
  autoShowLowerThirds: boolean;
  lowerThirdDuration: number;
  showStats: boolean;
  showFormation: boolean;
  reducedMotion: boolean;
}

export interface TeamStats {
  attacks: number;
  blocks: number;
  aces: number;
  opponentErrors: number;
  totalPoints: number;
  efficiency: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  playerNumber?: string;
  teamId: TeamId;
  attacks: number;
  blocks: number;
  aces: number;
  opponentErrors: number;
  totalPoints: number;
}

export interface BroadcastManagerState {
  showStats: boolean;
  showLowerThirds: boolean;
  showFormation: boolean;
  activeLowerThird: LowerThirdData | null;
  pendingCelebration: CelebrationType | null;
  celebrationTeam: TeamId | null;
}

export type CelebrationType = 'point' | 'set' | 'match';

export interface LowerThirdData {
  type: 'point_scorer' | 'player_spotlight' | 'substitution' | 'timeout';
  player?: Player;
  teamId?: TeamId;
  stats?: PlayerStats;
  customTitle?: string;
  customSubtitle?: string;
}

export interface RotationState {
  teamA: number;
  teamB: number;
}

export const DEFAULT_BROADCAST_CONFIG: BroadcastConfig = {
  eventName: '',
  eventPhase: '',
  venue: '',
  broadcaster: '',
  theme: 'minimal',
  autoShowLowerThirds: true,
  lowerThirdDuration: 3000,
  showStats: true,
  showFormation: false,
  reducedMotion: false,
};
