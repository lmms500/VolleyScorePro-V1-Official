import React from 'react';
import { InteractiveGestureDemo } from './InteractiveGestureDemo';
import {
  DragDropScene,
  SubstitutionScene,
  RotationScene,
  SkillBalanceScene,
  BatchInputScene,
  MomentumScene,
  ScoutModeScene,
  ExportScene,
  VoiceControlScene,
  SettingsScene,
  TeamCompositionScene,
  PlayerStatsScene,
  WelcomeHeroScene,
  IndieDevScene
} from '../scenes';
import {
  AppLogoVisual,
  SceneCommandCenter,
  SceneProfiles,
  SceneHistorySummary,
  SceneInstall,
  AudioNarratorVisual
} from '../visuals';

// --- MAIN EXPORT ---
export const TutorialVisual: React.FC<{ visualId: string; colorTheme: any; isPaused: boolean; onComplete?: () => void }> = ({ visualId, colorTheme, isPaused, onComplete }) => {
    const color = colorTheme?.crown || 'text-indigo-500';

    const visualMap: Record<string, React.ReactElement> = {
        'welcome_hero': <WelcomeHeroScene isPaused={isPaused} />,
        'indie_dev': <IndieDevScene isPaused={isPaused} />,
        'app_logo': <AppLogoVisual isPaused={isPaused} />,
        'gestures': <InteractiveGestureDemo colorTheme={colorTheme} onComplete={onComplete || (() => {})} />,
        'settings_config': <SettingsScene color={color} isPaused={isPaused} />,
        'voice_control': <VoiceControlScene color={color} isPaused={isPaused} />,
        'audio_narrator': <AudioNarratorVisual color={color} isPaused={isPaused} />,
        'team_management': <SceneCommandCenter color={color} isPaused={isPaused} />,
        'team_composition': <TeamCompositionScene color={color} isPaused={isPaused} />,
        'drag_and_drop': <DragDropScene color={color} isPaused={isPaused} />,
        'player_profile': <SceneProfiles color={color} isPaused={isPaused} />,
        'player_stats': <PlayerStatsScene color={color} isPaused={isPaused} />,
        'substitutions': <SubstitutionScene color={color} isPaused={isPaused} />,
        'rotations': <RotationScene color={color} isPaused={isPaused} />,
        'skill_balance_v2': <SkillBalanceScene color={color} isPaused={isPaused} />,
        'batch_input': <BatchInputScene color={color} isPaused={isPaused} />,
        'history_analytics': <SceneHistorySummary color={color} isPaused={isPaused} />,
        'history_timeline': <MomentumScene color={color} isPaused={isPaused} />,
        'scout_mode_advanced': <ScoutModeScene color={color} isPaused={isPaused} />,
        'export_data': <ExportScene color={color} isPaused={isPaused} />,
        'install_app': <SceneInstall color={color} isPaused={isPaused} />,
    };

    return visualMap[visualId] || <WelcomeHeroScene isPaused={isPaused} />;
};
