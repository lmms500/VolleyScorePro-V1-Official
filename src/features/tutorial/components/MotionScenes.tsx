/**
 * MotionScenes - Micro-Experiências Visuais Animadas
 *
 * REFACTORED: This file now re-exports all scenes from the modular /scenes/ folder.
 * Each scene is in its own file for better maintainability and AI-assisted development.
 *
 * @see ./scenes/ for individual scene implementations
 */

// Re-export all scenes for backward compatibility
export {
  // Types
  type MotionSceneProps,

  // Team Manager Scenes
  TeamCompositionScene,
  PlayerStatsScene,
  DragDropScene,
  SubstitutionScene,
  RotationScene,
  SkillBalanceScene,
  BatchInputScene,

  // History & Analytics Scenes
  MomentumScene,
  ScoutModeScene,
  ExportScene,

  // Configuration & System Scenes
  VoiceControlScene,
  SettingsScene,
} from '../scenes';
