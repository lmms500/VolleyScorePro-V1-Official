
import { OverlayTheme } from './ui';
import { SyncRole } from './services';

// --- CORE DOMAIN TYPES ---

export type TeamId = 'A' | 'B';
export type DeuceType = 'standard' | 'sudden_death_3pt';
export type RotationMode = 'standard' | 'balanced';
export type GameMode = 'indoor' | 'beach';
export type SkillType = 'attack' | 'block' | 'ace' | 'opponent_error' | 'generic';
export type PlayerId = string;
export type PlayerRole = 'setter' | 'hitter' | 'middle' | 'libero' | 'none';
export type TeamColor = string;

// --- DYNAMIC GAME MODE TYPES ---

export type GameModePreset =
  | 'indoor-6v6'
  | 'beach-4v4'
  | 'beach-2v2'
  | 'triples-3v3'
  | 'quads-5v5';

export interface CourtLayoutConfig {
  playersOnCourt: 2 | 3 | 4 | 5 | 6;
  benchLimit: number;
  gridRows: 1 | 2 | 3;
  gridCols: 2 | 3;
  /**
   * Zone numbers for visual display.
   * Index 0 = Server (Zone 1 always).
   * Length must match playersOnCourt.
   */
  zoneMap: number[];
  /**
   * Grid order for left-side team.
   * Maps grid visual positions to player array indices.
   * Use -1 for empty slots (odd player counts like 3, 5).
   */
  gridOrderLeft: number[];
  /**
   * Grid order for right-side team (mirrored).
   * Use -1 for empty slots.
   */
  gridOrderRight: number[];
  /**
   * Optional: Grid rows for vertical (portrait) layout.
   */
  gridRowsVertical?: number;
  /**
   * Optional: Grid cols for vertical (portrait) layout.
   */
  gridColsVertical?: number;
  /**
   * Optional: Grid order for top team in portrait mode (Team A).
   */
  gridOrderTop?: number[];
  /**
   * Optional: Grid order for bottom team in portrait mode (Team B).
   */
  gridOrderBottom?: number[];
}

export interface GameModeConfig {
  preset: GameModePreset;
  label: string;
  type: GameMode; // 'indoor' | 'beach' for backwards compatibility
  courtLayout: CourtLayoutConfig;
}

export interface ProfileStats {
  matchesPlayed: number;
  matchesWon: number;
  totalPoints: number;
  attacks: number;
  blocks: number;
  aces: number;
  mvpCount: number;
}

export interface PlayerProfile {
  id: PlayerId;
  name: string;
  skillLevel: number;
  number?: string;
  avatar?: string;
  role?: PlayerRole;
  stats?: ProfileStats;
  createdAt: number;
  lastUpdated: number;
  // Adicionado para suportar compartilhamento em rankings globais
  isPublic?: boolean;
}

export interface GameConfig {
  mode: GameMode;
  /**
   * New: Full mode configuration object.
   * If undefined, derive from `mode` for backwards compatibility.
   */
  modeConfig?: GameModeConfig;
  maxSets: 1 | 3 | 5;
  pointsPerSet: 15 | 21 | 25;
  hasTieBreak: boolean;
  tieBreakPoints: 15 | 25;
  deuceType: DeuceType;
  rotationMode: RotationMode;
  autoSwapSides: boolean; // Troca automática de lados (Beach: a cada 7 pts ou 5 no tie-break)
  enablePlayerStats: boolean;
  enableSound: boolean;
  voiceControlEnabled: boolean;
  announceScore: boolean;
  voiceGender: 'male' | 'female';
  voiceRate: number;
  voicePitch: number;
  announcementFreq: 'all' | 'critical_only';
  lowGraphics: boolean;
  reducedMotion: boolean;
  userApiKey?: string;
  adsRemoved: boolean;
  developerMode: boolean;
  broadcastTheme: OverlayTheme;
}

export interface Player {
  id: string;
  profileId?: PlayerId;
  name: string;
  number?: string;
  skillLevel: number;
  role?: PlayerRole;
  isFixed: boolean;
  fixedSide?: 'A' | 'B' | null;
  originalIndex: number;
  displayOrder?: number;
}

export interface Team {
  id: string;
  name: string;
  color: TeamColor;
  logo?: string;
  players: Player[];
  reserves: Player[];
  hasActiveBench?: boolean;
  tacticalOffset?: number;
}

export interface SetHistory {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  winner: TeamId;
}

export interface RotationReport {
  outgoingTeam: Team;
  incomingTeam: Team;
  retainedPlayers: Player[];
  stolenPlayers: Player[];
  queueAfterRotation: Team[];
  logs?: string[];
}

export interface DeletedPlayerRecord {
  player: Player;
  originId: string;
  timestamp: number;
}

export interface RosterSnapshot {
  teamARoster: Team;
  teamBRoster: Team;
  queue: Team[];
  rotationReport: RotationReport | null;
}

// --- VISUALIZATION TYPES ---

export interface TimelineNode {
  id: string;
  type: 'START' | 'POINT' | 'TIMEOUT' | 'SET_END' | 'SUDDEN_DEATH' | 'END';
  timestamp: number;
  timeLabel: string;
  team: TeamId | null;
  scoreSnapshot: string;
  description: string;
  player?: string;
  skill?: SkillType;

  // Visualization Props
  isTop: boolean;
  staggerLevel: number;
}

// --- AI & ANALYSIS TYPES ---

export interface TeamEfficiency {
  attack: number;
  defense: number;
  consistency: number;
}

export interface MatchAnalysis {
  tacticalSummary: string;
  clutchMoment: string;
  momentumAnalysis: string;
  performanceTips: string[];
  teamEfficiency: TeamEfficiency;
  futurePrediction: string;
}

export interface VoiceCommandIntent {
  type: 'point' | 'timeout' | 'server' | 'swap' | 'undo' | 'unknown';
  team?: TeamId;
  player?: { id: string; name: string };
  skill?: SkillType;
  isNegative?: boolean;
  confidence: number;
  rawText: string;
  debugMessage?: string;
  requiresMoreInfo?: boolean;
  isAmbiguous?: boolean;
  ambiguousCandidates?: string[];
}

export type ActionLog =
  | {
    type: 'POINT';
    team: TeamId;
    prevScoreA: number;
    prevScoreB: number;
    prevServingTeam: TeamId | null;
    prevInSuddenDeath: boolean;
    prevSwappedSides: boolean;
    timestamp?: number;
    playerId?: string | null;
    skill?: SkillType;
    autoRotated?: boolean;
  }
  | {
    type: 'TIMEOUT';
    team: TeamId;
    prevTimeoutsA: number;
    prevTimeoutsB: number;
    timestamp?: number;
  }
  | {
    type: 'ROTATION';
    snapshot: RosterSnapshot;
    timestamp?: number;
  }
  | {
    type: 'MANUAL_ROTATION';
    teamId: string;
    direction: 'clockwise' | 'counter';
    timestamp?: number;
  };

export type GameAction =
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'POINT'; team: TeamId; metadata?: { playerId: string, skill: SkillType } }
  | { type: 'SUBTRACT_POINT'; team: TeamId }
  | { type: 'TIMEOUT'; team: TeamId }
  | { type: 'UNDO' }
  | { type: 'RESET_MATCH'; gameId?: string }
  | { type: 'TOGGLE_SIDES' }
  | { type: 'SET_SERVER'; team: TeamId }
  | { type: 'APPLY_SETTINGS'; config: GameConfig; shouldReset: boolean }
  | { type: 'ROTATE_TEAMS'; gameId?: string }
  | { type: 'RESET_TIMER' }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'ROSTER_UPDATE_TEAM_NAME'; teamId: string; name: string }
  | { type: 'ROSTER_UPDATE_TEAM_COLOR'; teamId: string; color: TeamColor }
  | { type: 'ROSTER_UPDATE_TEAM_LOGO'; teamId: string; logo: string }
  | { type: 'ROSTER_UPDATE_PLAYER'; playerId: string; updates: Partial<Player> }
  | { type: 'ROSTER_ADD_PLAYER'; player: Player; targetId: string }
  | { type: 'ROSTER_RESTORE_PLAYER'; player: Player; targetId: string; index?: number }
  | { type: 'ROSTER_REMOVE_PLAYER'; playerId: string }
  | { type: 'ROSTER_DELETE_PLAYER'; playerId: string }
  | { type: 'ROSTER_MOVE_PLAYER'; playerId: string; fromId: string; toId: string; newIndex?: number }
  | { type: 'ROSTER_SUBSTITUTE'; teamId: string; playerInId: string; playerOutId: string }
  | { type: 'ROSTER_SWAP_POSITIONS'; teamId: string; indexA: number; indexB: number }
  | { type: 'ROSTER_UNDO_REMOVE' }
  | { type: 'ROSTER_COMMIT_DELETIONS' }
  | { type: 'ROSTER_TOGGLE_FIXED'; playerId: string }
  | { type: 'ROSTER_TOGGLE_BENCH'; teamId: string }
  | { type: 'ROSTER_SET_MODE'; mode: RotationMode }
  | { type: 'ROSTER_BALANCE'; courtA: Team; courtB: Team; queue: Team[] }
  | { type: 'ROSTER_SORT'; teamId: string; criteria: 'name' | 'number' | 'skill' }
  | { type: 'ROSTER_GENERATE'; courtA: Team; courtB: Team; queue: Team[] }
  | { type: 'ROSTER_SYNC_PROFILES'; profiles: Map<string, PlayerProfile> }
  | { type: 'ROSTER_UNLINK_PROFILE'; profileId: string }
  | { type: 'ROSTER_ENSURE_TEAM_IDS' }
  | { type: 'ROSTER_RESET_ALL' }
  | { type: 'ROSTER_QUEUE_REORDER'; fromIndex: number; toIndex: number }
  | { type: 'ROSTER_DISBAND_TEAM'; teamId: string }
  | { type: 'ROSTER_RESTORE_TEAM'; team: Team; index: number }
  | { type: 'MANUAL_ROTATION'; teamId: string; direction: 'clockwise' | 'counter' }
  | { type: 'SET_SYNC_ROLE'; role: SyncRole; sessionId?: string }
  | { type: 'DISCONNECT_SYNC' }
  | { type: 'SET_MATCH_DURATION'; duration: number };

export interface GameState {
  gameId: string;        // Identificador único da partida atual
  gameCreatedAt: number; // Data de criação da partida
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number;
  history: SetHistory[];
  actionLog: ActionLog[];
  matchLog: ActionLog[];
  lastScorerTeam: TeamId | null;
  lastSnapshot?: GameState;
  isMatchOver: boolean;
  matchWinner: TeamId | null;
  servingTeam: TeamId | null;
  swappedSides: boolean;
  config: GameConfig;
  timeoutsA: number;
  timeoutsB: number;
  inSuddenDeath: boolean;
  pendingSideSwitch: boolean;
  matchDurationSeconds: number;
  isTimerRunning: boolean;
  teamARoster: Team;
  teamBRoster: Team;
  queue: Team[];
  rotationReport: RotationReport | null;
  deletedPlayerHistory: DeletedPlayerRecord[];
  rotationMode: RotationMode;
  syncRole: SyncRole;
  sessionId?: string;
  connectedSpectators?: number;
}
