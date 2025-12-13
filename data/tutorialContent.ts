
import React from 'react';
import { 
  Trophy, Hand, Users, Edit3, UserCircle, RefreshCw, Scale, 
  Layout, MousePointerClick, History, FileText, PieChart
} from 'lucide-react';

export interface TutorialStep {
  id: string;
  titleKey: string;
  descKey: string;
  icon: any;
  color: string; // Tailwind color class for the graphic header (e.g. 'indigo', 'rose')
  visualId?: string; // Links to TutorialVisuals.tsx
  CustomComponent?: React.ReactNode;
}

export const TUTORIAL_SCENARIOS: Record<string, TutorialStep[]> = {
  // A. ONBOARDING (APP FIRST OPEN)
  main: [
    { 
      id: 'welcome', 
      titleKey: 'tutorial.welcome.title', 
      descKey: 'tutorial.welcome.desc', 
      icon: Trophy, 
      color: 'indigo',
      visualId: 'welcome_hero' 
    },
    { 
      id: 'gestures', 
      titleKey: 'tutorial.gestures.title', 
      descKey: 'tutorial.gestures.desc', 
      icon: Hand, 
      color: 'violet',
      visualId: 'gestures'
    },
    { 
      id: 'features', 
      titleKey: 'tutorial.features.title', 
      descKey: 'tutorial.features.desc', 
      icon: Layout, 
      color: 'emerald',
      visualId: 'match_score' 
    }
  ],

  // B. TEAM MANAGER (DEEP DIVE)
  manager: [
    { 
      id: 'intro', 
      titleKey: 'tutorial.manager.intro.title', 
      descKey: 'tutorial.manager.intro.desc', 
      icon: Users, 
      color: 'indigo',
      visualId: 'team_management'
    },
    { 
      id: 'edit', 
      titleKey: 'tutorial.manager.edit.title', 
      descKey: 'tutorial.manager.edit.desc', 
      icon: Edit3, 
      color: 'cyan',
      visualId: 'team_customization'
    },
    { 
      id: 'roster', 
      titleKey: 'tutorial.manager.roster.title', 
      descKey: 'tutorial.manager.roster.desc', 
      icon: MousePointerClick, 
      color: 'amber',
      visualId: 'team_management' // Reusing intent of moving players, but non-consecutive
    },
    { 
      id: 'profiles', 
      titleKey: 'tutorial.manager.profiles.title', 
      descKey: 'tutorial.manager.profiles.desc', 
      icon: UserCircle, 
      color: 'violet',
      visualId: 'player_profile'
    },
    { 
      id: 'rotation', 
      titleKey: 'tutorial.manager.rotation.title', 
      descKey: 'tutorial.manager.rotation.desc', 
      icon: RefreshCw, 
      color: 'rose',
      visualId: 'rotation'
    },
    { 
      id: 'balance', 
      titleKey: 'tutorial.manager.balance.title', 
      descKey: 'tutorial.manager.balance.desc', 
      icon: Scale, 
      color: 'emerald',
      visualId: 'skill_balance'
    }
  ],

  // C. HISTORY (DATA ANALYSIS)
  history: [
    { 
      id: 'summary', 
      titleKey: 'tutorial.history.summary.title', 
      descKey: 'tutorial.history.summary.desc', 
      icon: History, 
      color: 'slate',
      visualId: 'history_analytics'
    },
    { 
      id: 'timeline', 
      titleKey: 'tutorial.history.timeline.title', 
      descKey: 'tutorial.history.timeline.desc', 
      icon: FileText, 
      color: 'indigo',
      visualId: 'history_timeline'
    },
    { 
      id: 'analysis', 
      titleKey: 'tutorial.history.analysis.title', 
      descKey: 'tutorial.history.analysis.desc', 
      icon: PieChart, 
      color: 'amber',
      visualId: 'scout_mode' // Scout/Analysis view
    }
  ]
};
