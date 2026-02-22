/**
 * Motion Scenes - Modular Animation Components
 *
 * Each scene is a self-contained animated component for the tutorial system.
 * Split from the original 1,308-line MotionScenes.tsx for better maintainability.
 */

// Types
export type { MotionSceneProps } from './types';

// Welcome & Introduction Scenes
export { WelcomeHeroScene } from './WelcomeHeroScene';
export { IndieDevScene } from './IndieDevScene';

// Team Manager Scenes
export { TeamCompositionScene } from './TeamCompositionScene';
export { PlayerStatsScene } from './PlayerStatsScene';
export { DragDropScene } from './DragDropScene';
export { SubstitutionScene } from './SubstitutionScene';
export { RotationScene } from './RotationScene';
export { SkillBalanceScene } from './SkillBalanceScene';
export { BatchInputScene } from './BatchInputScene';

// History & Analytics Scenes
export { MomentumScene } from './MomentumScene';
export { ScoutModeScene } from './ScoutModeScene';
export { ExportScene } from './ExportScene';

// Configuration & System Scenes
export { VoiceControlScene } from './VoiceControlScene';
export { SettingsScene } from './SettingsScene';
