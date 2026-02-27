---
name: state-and-stores
description: >
  Manage state in VolleyScore-Pro using the correct pattern (Context, Zustand, or
  useReducer). Use when adding new state, modifying game logic, creating stores,
  debugging state issues, dispatching actions, working with reducers, context
  splitting, or any state management architecture decision.
---

# State Management — VolleyScore-Pro

## Decision Tree

```
State need → What type?
    ├─ Score/game updates → ScoreContext (hot path)
    ├─ Action dispatching → ActionsContext (stable, never re-renders)
    ├─ Team/player data → RosterContext (cold path)
    ├─ Persistent feature data → Zustand store with persist
    ├─ Complex local logic → useReducer
    ├─ Simple UI state → useState
    ├─ New reducer action → Add to sub-reducer (scoring/roster/meta)
    └─ New Zustand store → Creating a New Zustand Store template below
```

## Architecture Overview

VolleyScore-Pro uses a **3-layer state model**:

### Layer 1: React Context (App-Wide)
```
AuthContext        → Firebase user session
GameContext        → Core game state (split into 3 sub-contexts)
  ├─ ScoreContext  → HOT PATH (score, sets, serving — updates every point)
  ├─ ActionsContext → STABLE (dispatchers — never changes after mount)
  └─ RosterContext → COLD PATH (teams, players — updates rarely)
PerformanceContext → Device capabilities, animation toggles
TimerContext       → Match timer (high-frequency, isolated)
TimeoutContext     → Timeout state
ModalContext       → Open/close modals globally
NotificationContext → Toast notification queue
LanguageContext    → i18n translations (en/es/pt)
LayoutContext      → Fullscreen vs normal mode
ThemeContext       → Dark/light theme
ResponsiveContext  → Breakpoints, screen dimensions
```

### Layer 2: Zustand Stores (Feature-Scoped)
```
rosterStore.ts  → Team/player persistence (backup outside GameContext)
historyStore.ts → Match history cache
```

### Layer 3: useReducer (Complex Local State)
```
gameReducer.ts → Main game reducer, routes to sub-reducers:
  ├─ scoring.ts → POINT, SUBTRACT, TIMEOUT, TOGGLE_SIDES, SET_SERVER
  ├─ meta.ts    → APPLY_SETTINGS, RESET, TIMER, SYNC
  └─ roster.ts  → Everything else (teams, players, rotations)
```

## When to Use What

| Scenario | Pattern | Example |
|----------|---------|---------|
| Score updates (hot path) | ScoreContext | Score display, set indicator |
| Action dispatching | ActionsContext | Point buttons, undo |
| Team/player data | RosterContext | Roster board, player cards |
| Feature data persistence | Zustand store | Match history, saved rosters |
| Complex component logic | useReducer | Form wizards, multi-step flows |
| Simple UI state | useState | Modal open/close, input values |
| Auth & user session | AuthContext | Login, profile sync |
| Device config | PerformanceContext | Animation gating |

## GameContext — The Core

### Reading State
```tsx
// HOT — updates every point
const { scoreA, scoreB, setsA, setsB, servingTeam } = useScore();

// COLD — updates rarely
const { teamA, teamB, queue } = useRoster();

// STABLE — never re-renders
const { dispatch, point, subtract, timeout } = useGameActions();
```

### Dispatching Actions
```tsx
const { dispatch } = useGameActions();

// Score a point
dispatch({ type: 'POINT', team: 'A' });

// Subtract a point
dispatch({ type: 'SUBTRACT', team: 'B' });

// Call timeout
dispatch({ type: 'TIMEOUT', team: 'A' });

// Apply settings
dispatch({ type: 'APPLY_SETTINGS', config: newConfig });

// Reset game
dispatch({ type: 'RESET' });
```

### Game Reducer Sub-Reducers

**scoring.ts** handles:
- `POINT` — Add point, check set/match win, rotate serve
- `SUBTRACT` — Remove last point, restore previous state
- `TIMEOUT` — Register timeout for team
- `TOGGLE_SIDES` — Swap court sides
- `SET_SERVER` — Change serving team

**roster.ts** handles:
- `ADD_PLAYER`, `REMOVE_PLAYER`, `UPDATE_PLAYER`
- `SET_TEAM_NAME`, `SET_TEAM_COLOR`
- `SUBSTITUTE` — Replace player
- `ROTATE` — Clockwise rotation
- `GENERATE_TEAMS` — Auto-balance teams

**meta.ts** handles:
- `APPLY_SETTINGS` — Update game configuration
- `RESET` — Full game reset
- `SYNC_STATE` — Sync from broadcast
- `IMPORT_STATE` — Import saved state

## Creating a New Zustand Store
```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyStore {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((s) => ({ items: [...s.items, item] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),
    }),
    { name: 'my-store' } // localStorage key
  )
);
```

## Performance Rules

1. **Never subscribe to GameContext directly** — use ScoreContext/ActionsContext/RosterContext
2. **Memoize selectors** in Zustand with `useShallow`:
   ```tsx
   const items = useMyStore(useShallow(s => s.items));
   ```
3. **Wrap dispatchers in useCallback** when passing to children
4. **Separate high-frequency state** (timer, score) from low-frequency (settings, roster)
5. **Use memo() on components** that receive context values

## Action Logging
Every scoring action is logged for match replay:
```tsx
interface ActionLog {
  type: 'point' | 'timeout' | 'substitution' | 'rotation';
  team: 'A' | 'B';
  timestamp: number;
  previousState: Partial<GameState>;
  // ...additional metadata
}
```

## Key Files
- `src/features/game/context/GameContext.tsx`
- `src/features/game/reducers/gameReducer.ts`
- `src/features/game/reducers/scoring.ts`
- `src/features/game/reducers/roster.ts`
- `src/features/game/reducers/meta.ts`
- `src/features/teams/store/rosterStore.ts`
- `src/features/history/store/historyStore.ts`
- `src/contexts/` — All global contexts
