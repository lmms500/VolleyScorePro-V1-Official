---
name: players-and-rosters
description: >
  Work on team and player management features. Use when implementing rosters,
  player profiles, skill-based balancing, substitutions, bench management,
  drag-and-drop reordering, team customization, player stats, Firebase profile
  sync, or any team/player-related feature.
---

# Team Management — VolleyScore-Pro

## Decision Tree

```
Team/player need → What type?
    ├─ Roster management → RosterBoard + RosterColumn
    ├─ Player profiles → PlayerCard + ProfileDetailsModal
    ├─ Team balancing → balanceUtils.ts (snake draft algorithm)
    ├─ Substitutions → SubstitutionModal + bench management
    ├─ Drag-and-drop → @dnd-kit integration below
    ├─ Firebase sync → useProfileSync + ProfileSyncManager
    ├─ New player stat → Adding New Player Stats workflow below
    └─ Team customization → SET_TEAM_NAME / SET_TEAM_COLOR actions
```

## Features
- Dynamic roster creation per game mode (2v2 to 6v6)
- Player profiles with skill levels, stats, and avatars
- Skill-based team auto-balancing
- Bench management and substitutions
- Drag-and-drop roster reordering (@dnd-kit)
- Firebase profile sync
- Team color and name customization

## Data Model

```typescript
interface PlayerProfile {
  id: string;
  name: string;
  skillLevel: number;      // 1-5 scale
  avatar?: string;
  role?: string;            // Setter, Libero, Outside, etc.
  number?: number;
  stats: {
    matches: number;
    points: number;
    attacks: number;
    blocks: number;
    aces: number;
    mvps: number;
  };
  experience: number;
  level: number;            // Gamification level
}

interface Team {
  id: string;
  name: string;
  color: string;
  logo?: string;
  players: Player[];
  reserves: Player[];       // Bench players
  hasActiveBench: boolean;
  tacticalOffset: number;
}
```

## Architecture

### Components (src/features/teams/components/)
| Component | Purpose |
|-----------|---------|
| `TeamManagerUI` | Main team management interface |
| `RosterBoard` | Grid layout for both teams |
| `RosterColumn` | Single team column |
| `TeamColumn` | Team info + players |
| `BenchArea` | Bench/reserve players |
| `PlayerCard` | Individual player card (draggable) |
| `PlayerListItem` | Compact player list view |
| `AddPlayerForm` | New player creation form |
| `ProfileCard` | Detailed player profile |
| `ProfileSyncManager` | Firebase sync indicator |

### Hooks
- `usePlayerProfiles` — CRUD for player profiles (IndexedDB + Firebase)
- `useProfileSync` — Firebase Firestore profile sync
- `useTeamGenerator` — Auto-generate balanced teams from player pool

### Store (rosterStore.ts — Zustand)
Persistent roster backup outside GameContext for:
- Saved team configurations
- Player profile library
- Quick team recall

### Modals
- `TeamManagerModal` — Full team management
- `ProfileCreationModal` — Create/edit player
- `ProfileDetailsModal` — View player details + stats
- `SubstitutionModal` — Swap bench ↔ active
- `TeamStatsModal` — Team statistics

## Team Balancing Algorithm (balanceUtils.ts)
```
1. Sort all players by skill level (descending)
2. Distribute alternating (snake draft) to teams
3. Calculate team average skill
4. Fine-tune with swaps to minimize skill gap
5. Respect role requirements (e.g., 1 setter per team)
```

## Drag-and-Drop (@dnd-kit)
- `@dnd-kit/core` for drag engine
- `@dnd-kit/sortable` for sortable lists
- Drag players between teams, to/from bench
- Visual feedback with drag overlays

## Adding New Player Stats
1. Add field to `PlayerProfile` interface in `src/@types/domain.ts`
2. Update `usePlayerProfiles` hook for persistence
3. Add UI in `ProfileDetailsModal` or `PlayerCard`
4. Update `statsAggregator.ts` for history tracking
5. Add i18n keys

## Key Files
- `src/features/teams/components/` — All team UI
- `src/features/teams/hooks/usePlayerProfiles.ts`
- `src/features/teams/hooks/useTeamGenerator.ts`
- `src/features/teams/store/rosterStore.ts`
- `src/features/teams/utils/rosterLogic.ts`
- `src/features/teams/modals/` — All modals
- `src/features/game/utils/balanceUtils.ts`
- `src/@types/domain.ts` — Type definitions
