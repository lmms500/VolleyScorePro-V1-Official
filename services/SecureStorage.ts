
import { get, set, del } from 'idb-keyval';

/**
 * SecureStorage Service v4.0 (Unified High-Capacity Engine)
 * 
 * ARCHITECTURE CHANGE:
 * We now use `idb-keyval` (IndexedDB) for ALL platforms (Web, iOS, Android).
 * 
 * Why?
 * 1. Capacitor `Preferences` (SharedPreferences/UserDefaults) has a low storage limit (~2MB).
 *    Storing full Match History + Action Logs causes crashes/data loss on Native.
 * 2. Modern WebViews (WKWebView/Chrome) support IndexedDB fully.
 * 3. It provides async, non-blocking I/O for large JSON blobs.
 */

const APP_PREFIX = 'vs_pro_';

export const SecureStorage = {
  /**
   * Saves data. Objects are automatically stringified.
   */
  async save<T>(key: string, data: T): Promise<void> {
    const fullKey = APP_PREFIX + key;
    const value = JSON.stringify(data);

    try {
      // Use IndexedDB for capacity and performance on all platforms
      await set(fullKey, value);
    } catch (error) {
      console.error('[Storage] Save Error:', error);
      // Fallback to LocalStorage (Synchronous, lower capacity, but safe backup)
      try { localStorage.setItem(fullKey, value); } catch(e){}
    }
  },

  /**
   * Loads data. Handles parsing automatically.
   */
  async load<T>(key: string): Promise<T | null> {
    const fullKey = APP_PREFIX + key;
    let raw: string | undefined | null = null;

    try {
      // Try IndexedDB first
      raw = await get<string>(fullKey);
      
      // Migration/Fallback: Check LocalStorage if IDB empty
      // This handles migration from older versions or fallback scenarios
      if (!raw) {
          raw = localStorage.getItem(fullKey);
          if (raw) {
              // Self-healing: Move to IDB for future performance
              await set(fullKey, raw); 
          }
      }

      if (!raw) return null;

      return JSON.parse(raw) as T;

    } catch (error) {
      console.error('[Storage] Load Error:', error);
      return null;
    }
  },

  async remove(key: string) {
    const fullKey = APP_PREFIX + key;
    try {
        await del(fullKey);
        localStorage.removeItem(fullKey);
    } catch (e) {
        console.warn('[Storage] Remove failed', e);
    }
  }
};
