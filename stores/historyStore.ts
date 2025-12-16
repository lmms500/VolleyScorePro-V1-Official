import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { GameConfig, SetHistory, TeamId, ActionLog, Team } from '../types';
import { SecureStorage } from '../services/SecureStorage';

// --- TYPES (Derived/Extended from Core Types) ---

export type MatchSettings = GameConfig;
export type ScoreEvent = ActionLog;

export interface Match {
  id: string;                 // UUID
  date: string;               // ISO Date String
  timestamp: number;          // Unix Timestamp for sorting
  durationSeconds: number;    // Total match time
  
  teamAName: string;
  teamBName: string;
  
  teamARoster?: Team;
  teamBRoster?: Team;

  setsA: number;
  setsB: number;
  
  winner: TeamId | null;      // 'A' | 'B'
  
  sets: SetHistory[];
  actionLog?: ActionLog[];
  config: MatchSettings;
}

interface HistoryStoreState {
  matches: Match[];
}

interface HistoryStoreActions {
  addMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => void;
  clearHistory: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string, options?: { merge: boolean }) => { success: boolean; errors?: string[] };
  
  // NEW: Merges external matches (e.g. from Cloud Sync)
  mergeMatches: (newMatches: Match[]) => void;
}

const secureStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const data = await SecureStorage.load<string>(name);
    return data || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStorage.save(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStorage.remove(name);
  },
};

export const useHistoryStore = create<HistoryStoreState & HistoryStoreActions>()(
  persist(
    (set, get) => ({
      matches: [],

      addMatch: (match) => {
        set((state) => ({
          matches: [match, ...state.matches]
        }));
      },

      deleteMatch: (matchId) => {
        set((state) => ({
          matches: state.matches.filter((m) => m.id !== matchId)
        }));
      },

      clearHistory: () => {
        set({ matches: [] });
      },

      // NEW: Intelligent Merge for Cloud Sync
      mergeMatches: (newMatches) => {
          set((state) => {
              // Fix: Explicitly type the Map to ensure values are Match objects, avoiding 'unknown' errors
              const currentMap = new Map<string, Match>(state.matches.map(m => [m.id, m]));
              let changes = false;

              newMatches.forEach(m => {
                  if (!currentMap.has(m.id)) {
                      currentMap.set(m.id, m);
                      changes = true;
                  }
                  // We could add logic here to update existing matches if timestamp is newer
                  // For now, assuming immutable matches once saved
              });

              if (!changes) return state;

              const merged = Array.from(currentMap.values()).sort((a, b) => b.timestamp - a.timestamp);
              return { matches: merged };
          });
      },

      exportJSON: () => {
        const { matches } = get();
        return JSON.stringify(matches, null, 2);
      },

      importJSON: (jsonStr, options = { merge: true }) => {
        try {
          const parsed = JSON.parse(jsonStr);

          if (!Array.isArray(parsed)) {
            return { success: false, errors: ['Invalid format: Root must be an array.'] };
          }

          const validMatches: Match[] = [];
          const errors: string[] = [];

          parsed.forEach((item, index) => {
            if (
              typeof item.id === 'string' &&
              typeof item.timestamp === 'number' &&
              typeof item.teamAName === 'string' &&
              typeof item.teamBName === 'string' &&
              Array.isArray(item.sets)
            ) {
              validMatches.push(item as Match);
            } else {
              errors.push(`Item at index ${index} is missing required Match fields.`);
            }
          });

          if (validMatches.length === 0 && parsed.length > 0) {
            return { success: false, errors: ['No valid match records found in input.', ...errors] };
          }

          set((state) => {
            if (options.merge) {
              const existingIds = new Set(state.matches.map(m => m.id));
              const newUniqueMatches = validMatches.filter(m => !existingIds.has(m.id));
              const merged = [...newUniqueMatches, ...state.matches].sort((a, b) => b.timestamp - a.timestamp);
              return { matches: merged };
            } else {
              return { matches: validMatches.sort((a, b) => b.timestamp - a.timestamp) };
            }
          });

          return { 
            success: true, 
            errors: errors.length > 0 ? errors : undefined 
          };

        } catch (e) {
          return { success: false, errors: [(e as Error).message] };
        }
      }
    }),
    {
      name: 'vsp_matches_v1',
      storage: createJSONStorage(() => secureStorageAdapter),
      version: 1,
    }
  )
);