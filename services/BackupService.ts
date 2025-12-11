
import { SecureStorage } from './SecureStorage';
import { downloadJSON } from './io';

/**
 * VolleyScore Pro - Data Backup Engine
 * Aggregates all persistent stores into a portable JSON format.
 */

const BACKUP_VERSION = '1.0.0';

// Storage Keys (Must match those used in hooks/stores)
const KEY_HISTORY = 'vsp_matches_v1';
const KEY_PROFILES = 'player_profiles_master';
const KEY_GAME_STATE = 'action_log';

export interface BackupSchema {
  meta: {
    version: string;
    appVersion: string;
    timestamp: number;
    platform: string;
  };
  data: {
    history: any;
    profiles: any;
    gameState: any;
  };
  checksum?: string;
}

export const BackupService = {
  
  /**
   * Generates a complete backup of the application state.
   */
  async generateBackup(): Promise<void> {
    try {
      // 1. Gather Data
      const history = await SecureStorage.load(KEY_HISTORY);
      const profiles = await SecureStorage.load(KEY_PROFILES);
      const gameState = await SecureStorage.load(KEY_GAME_STATE);

      // 2. Build Schema
      const backup: BackupSchema = {
        meta: {
          version: BACKUP_VERSION,
          appVersion: '2.0.6',
          timestamp: Date.now(),
          platform: navigator.userAgent
        },
        data: {
          history: history || null,
          profiles: profiles || [],
          gameState: gameState || null
        }
      };

      // 3. Export
      const filename = `volleyscore_backup_${new Date().toISOString().split('T')[0]}`;
      await downloadJSON(filename, backup);

    } catch (e) {
      console.error("[Backup] Generation failed", e);
      throw new Error("Failed to generate backup.");
    }
  },

  /**
   * Restores data from a parsed JSON object.
   * @param rawJson The raw object parsed from file
   * @returns boolean indicating success
   */
  async restoreBackup(rawJson: any): Promise<boolean> {
    try {
      // 1. Validation
      if (!rawJson || !rawJson.meta || !rawJson.data) {
        throw new Error("Invalid backup format.");
      }

      // Basic schema check
      const { history, profiles, gameState } = rawJson.data;

      // 2. Write to Stores (IndexedDB via SecureStorage)
      if (history) {
        // Zustand persist expects a specific stringified structure usually, 
        // but SecureStorage.load returns the parsed object. 
        // SecureStorage.save expects object.
        await SecureStorage.save(KEY_HISTORY, history);
      }

      if (profiles && Array.isArray(profiles)) {
        await SecureStorage.save(KEY_PROFILES, profiles);
      }

      if (gameState) {
        await SecureStorage.save(KEY_GAME_STATE, gameState);
      }

      // 3. Cleanup & Integrity
      console.log("[Backup] Restore successful. Reloading app...");
      return true;

    } catch (e) {
      console.error("[Backup] Restore failed", e);
      return false;
    }
  }
};
