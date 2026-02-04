
import { get, set, del, update } from 'idb-keyval';

/**
 * SecureStorage Service v4.2 (Resilient & Atomic)
 */

const APP_PREFIX = 'vs_pro_';

export const SecureStorage = {
  async save<T>(key: string, data: T): Promise<void> {
    const fullKey = APP_PREFIX + key;
    const value = JSON.stringify(data);

    try {
      // Gravação atômica em IndexedDB
      await set(fullKey, value);
      
      // Redundância Crítica: Se for o estado do jogo ou perfis, salva um backup secundário
      if (key === 'action_log' || key === 'player_profiles_master') {
          localStorage.setItem(`${fullKey}_bak`, value);
      }
    } catch (error) {
      console.error('[Storage] Persistent Write Error:', error);
      try { localStorage.setItem(fullKey, value); } catch(e){}
    }
  },

  async load<T>(key: string): Promise<T | null> {
    const fullKey = APP_PREFIX + key;
    let raw: string | undefined | null = null;

    try {
      // 1. Tenta a fonte primária (IDB)
      raw = await get<string>(fullKey);
      
      // 2. Se falhar, tenta restaurar do backup do localStorage
      if (!raw) {
          raw = localStorage.getItem(`${fullKey}_bak`) || localStorage.getItem(fullKey);
          if (raw) {
              console.warn(`[Storage] Auto-recovered ${key} from backup.`);
              await set(fullKey, raw); // Auto-heal IDB
          }
      }

      if (!raw) return null;

      // Verificação de Integridade Básica
      const parsed = JSON.parse(raw);
      return parsed as T;

    } catch (error) {
      console.error('[Storage] Load/Integrity Error:', error);
      return null;
    }
  },

  async remove(key: string) {
    const fullKey = APP_PREFIX + key;
    try {
        await del(fullKey);
        localStorage.removeItem(fullKey);
        localStorage.removeItem(`${fullKey}_bak`);
    } catch (e) {
        console.warn('[Storage] Remove failed', e);
    }
  }
};
