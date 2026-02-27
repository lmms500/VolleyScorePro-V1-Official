
// --- SERVICE & INFRASTRUCTURE TYPES ---

export type SyncStatus = 'synced' | 'desynced' | 'unlinked' | 'connecting';
export type SyncRole = 'host' | 'spectator' | 'local';

export interface LiveSession {
  id: string;
  hostUid: string;
  status: 'active' | 'finished';
  connectedCount: number;
  lastUpdate: number;
}

// --- OFFICIAL MATCH / CHECK-IN TYPES ---

export type MatchValidationStatus = 'insufficient' | 'casual' | 'official';

/**
 * Represents a logged-in player who checked into a broadcast session.
 * Stored in Firestore: /live_matches/{sessionId}/participants/{uid}
 */
export interface MatchParticipant {
  uid: string;
  profileId: string;
  name: string;
  avatar?: string;
  team: 'A' | 'B' | 'unassigned';
  deviceFingerprint: string;
  checkedInAt: number;
  role: 'host' | 'player';
}

/**
 * Tracks the official/validation state of a broadcast session.
 * Used locally and synced to the SyncSessionSchema in Firestore.
 */
export interface OfficialMatchSession {
  sessionId: string;
  hostUid: string;
  gameMode: string;
  requiredPlayers: number;
  isValidated: boolean;
  participantCount: number;
  validatedAt?: number;
}
