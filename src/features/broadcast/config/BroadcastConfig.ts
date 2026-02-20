import { BroadcastConfig, DEFAULT_BROADCAST_CONFIG } from '../types/broadcast';

const STORAGE_KEY = 'volleyscore_broadcast_config';

export function getBroadcastConfig(): BroadcastConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_BROADCAST_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load broadcast config:', e);
  }
  return DEFAULT_BROADCAST_CONFIG;
}

export function saveBroadcastConfig(config: Partial<BroadcastConfig>): void {
  try {
    const current = getBroadcastConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save broadcast config:', e);
  }
}

export function resetBroadcastConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to reset broadcast config:', e);
  }
}
