
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
