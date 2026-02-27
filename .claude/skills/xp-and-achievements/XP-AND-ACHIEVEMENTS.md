---
name: xp-and-achievements
description: >
  Implement gamification features like XP, levels, achievements, badges, streaks,
  and rewards. Use when adding motivational mechanics, player progression, daily/
  weekly challenges, leaderboard enhancements, rank systems, XP calculations,
  achievement unlock animations, or any gamification-related feature.
---

# Gamification — VolleyScore-Pro

## Decision Tree

```
Gamification need → What type?
    ├─ XP & levels → PlayerProgression + XP sources below
    ├─ Achievements/badges → Achievement system + examples below
    ├─ Daily/weekly challenges → Challenge interface below
    ├─ Streaks → Login/win/play streak tracking
    ├─ Leaderboard → Enhanced leaderboard (see social-and-sharing)
    ├─ UI components → XPBar, AchievementCard, StreakIndicator
    └─ Integration → Event-driven pattern (subscribe to game events)
```

## Overview
Add game-like reward systems to motivate players and increase retention. This is a future feature being planned (see `plans/VOICE_AND_GAMIFICATION_PLAN.md`).

## Planned Features

### 1. Player XP & Levels
```typescript
interface PlayerProgression {
  xp: number;
  level: number;
  nextLevelXp: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
}

// XP Sources:
// +10 XP per match played
// +5 XP per set won
// +20 XP per match won
// +50 XP for MVP
// +15 XP for ace streak (3+)
// +30 XP for comeback win (down 0-1 sets)
```

### 2. Achievements & Badges
```typescript
interface Achievement {
  id: string;
  name: string;           // i18n key
  description: string;    // i18n key
  icon: string;           // lucide-react icon name
  condition: AchievementCondition;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: number;    // timestamp
}

// Example Achievements:
// "First Blood" — Score your first point
// "Iron Wall" — Block 10 attacks in one match
// "Ace Machine" — 5 aces in one set
// "Comeback Kid" — Win after being down 0-1 sets
// "Perfect Set" — Win a set 25-0
// "Marathon" — Play a set that goes to 30+ points
// "Voice Commander" — Use 50 voice commands
// "Streak Master" — Win 5 matches in a row
```

### 3. Daily/Weekly Challenges
```typescript
interface Challenge {
  id: string;
  type: 'daily' | 'weekly';
  description: string;
  target: number;
  progress: number;
  reward: { xp: number; badge?: string };
  expiresAt: number;
}

// Daily: "Play 2 matches", "Score 30 points"
// Weekly: "Win 5 matches", "Try all game modes"
```

### 4. Streaks
- Login streaks (daily app open)
- Win streaks (consecutive match wins)
- Play streaks (consecutive days with matches)
- Visual streak indicator in UI

### 5. Leaderboard Enhancement
- Global ranking by XP
- Weekly/monthly leaderboards
- Friends leaderboard (social integration)
- Achievement showcase on profile

## Implementation Guide

### Data Model
Add to `PlayerProfile` in `src/@types/domain.ts`:
```typescript
interface PlayerProfile {
  // ... existing fields
  progression: PlayerProgression;
  achievements: Achievement[];
  challenges: Challenge[];
  streaks: {
    login: number;
    wins: number;
    plays: number;
  };
}
```

### State Management
- Use Zustand store for gamification data (persistent)
- Sync achievements to Firebase for cross-device
- Track progress in real-time during matches

### UI Components to Create
- `XPBar.tsx` — XP progress bar with level indicator
- `AchievementCard.tsx` — Achievement display card
- `AchievementUnlockModal.tsx` — Celebration on unlock
- `ChallengeList.tsx` — Daily/weekly challenge tracker
- `LeaderboardEnhanced.tsx` — Ranked leaderboard
- `StreakIndicator.tsx` — Streak counter/flame icon
- `PlayerRankBadge.tsx` — Rank badge display

### Integration Points
- After each point: check achievement progress
- After each match: award XP, check achievements, update streaks
- On app open: check login streak, refresh daily challenges
- On profile view: show progression, achievements, rank

### Animation
- XP bar fill animation
- Achievement unlock celebration (confetti + modal)
- Level up animation (gold burst + sound)
- Streak counter increment

### i18n
Add keys under `gamification.` namespace in all locale files.

## Architecture Considerations
- Keep gamification logic separate from core game logic
- Create `src/features/gamification/` feature module
- Use event-driven pattern (subscribe to game events)
- Offline-first: track locally, sync to Firebase when online
