/**
 * Feature Flags Configuration
 * VolleyScore Pro v2
 * 
 * Centralized feature toggles for A/B testing and gradual rollouts.
 */

export type FeatureFlag =
  | 'PLAYER_ANALYSIS_ENABLED'
  | 'AI_INSIGHTS_ENABLED'
  | 'VOICE_COMMANDS_ENABLED'
  | 'LIVE_BROADCAST_ENABLED'
  | 'ADMOB_ENABLED'
  | 'SOCIAL_SHARING_ENABLED';

const FLAGS: Record<FeatureFlag, boolean> = {
  // Core Features
  PLAYER_ANALYSIS_ENABLED: false, // DISABLED - AI features hidden
  AI_INSIGHTS_ENABLED: false,     // DISABLED - AI features hidden
  VOICE_COMMANDS_ENABLED: true,

  // Connectivity Features
  LIVE_BROADCAST_ENABLED: true,   // ENABLED - Live sync active
  SOCIAL_SHARING_ENABLED: true,

  // Monetization
  ADMOB_ENABLED: true,
};

/**
 * Check if a feature is enabled.
 * @param flag - The feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FLAGS[flag] ?? false;
}

/**
 * Get all feature flags (for debugging).
 */
export function getAllFlags(): Record<FeatureFlag, boolean> {
  return { ...FLAGS };
}
