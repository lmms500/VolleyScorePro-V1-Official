---
name: scoring-and-rules
description: >
  Implement or modify volleyball game rules, scoring logic, game modes, and match
  flow. Use when working on scoring, serve rotation, set management, deuce rules,
  sudden death, side swaps, court rotation, points, timeout logic, new game modes,
  or any game rule engine changes.
---

# Game Logic — VolleyScore-Pro

## Decision Tree

```
Game logic need → What type?
    ├─ Scoring bug/change → scoring.ts reducer + POINT/SUBTRACT flow
    ├─ Serve rotation → servingTeam logic in scoring.ts
    ├─ Deuce / sudden death → Scoring Rules section below
    ├─ Side swap (beach) → Side Swap section below
    ├─ New game mode → Adding a New Game Mode workflow below
    ├─ New action type → Adding a New Action Type workflow below
    ├─ Team/roster logic → roster.ts reducer (see players-and-rosters)
    └─ Game state shape → GameState interface below
```

## Volleyball Rules Engine

### Game Modes (src/config/gameModes.ts)
| Mode | Players | Points/Set | Sets to Win | Tie-break |
|------|---------|-----------|-------------|-----------|
| 6v6 Indoor | 6 per team | 25 | 3 (best of 5) | 15 (5th set) |
| 4v4 Beach | 4 per team | 21 | 2 (best of 3) | 15 (3rd set) |
| 2v2 Beach | 2 per team | 21 | 2 (best of 3) | 15 (3rd set) |
| 3v3 Triples | 3 per team | 25 | 2 (best of 3) | 15 |
| 5v5 Quads | 5 per team | 25 | 3 (best of 5) | 15 |

### Scoring Rules
1. **Standard play**: First to target points, must lead by 2
2. **Deuce**: When both teams reach target-1 (e.g., 24-24), play continues until 2-point lead
3. **Sudden death** (optional): At deuce + N points, next point wins (configurable)
4. **Tie-break set**: Lower point target (15), same deuce rules

### Serve Rotation
- Point scored → serving team keeps serve
- Point lost → serve passes to opponent
- Track `servingTeam: 'A' | 'B'` in state

### Side Swap (Beach)
- Regular sets: swap every 7 points (combined score)
- Tie-break: swap every 5 points

### Court Rotation
- After serve changes, players rotate clockwise (6v6)
- Position tracking per zone (1-6)

## Reducer Architecture

### Main Router: `gameReducer.ts`
Routes actions to sub-reducers based on action type.

### Scoring Reducer: `scoring.ts`
```typescript
// Key actions:
'POINT'        → { team: 'A' | 'B' }
'SUBTRACT'     → { team: 'A' | 'B' }
'TIMEOUT'      → { team: 'A' | 'B' }
'TOGGLE_SIDES' → {}
'SET_SERVER'   → { team: 'A' | 'B' }
```

**POINT flow:**
1. Increment score for team
2. Check if set is won (target points + lead by 2)
3. If set won → increment sets, check match win
4. If match won → set `isMatchOver = true`, `matchWinner`
5. Update serving team
6. Log action to `actionLog[]`
7. Check side swap conditions (beach modes)

**SUBTRACT flow:**
1. Restore previous state from action log
2. Decrement score
3. Recalculate set/match status

### Roster Reducer: `roster.ts`
Handles team composition changes:
- Add/remove/update players
- Substitutions (swap bench ↔ active)
- Rotations (clockwise shift)
- Team name/color changes

### Meta Reducer: `meta.ts`
Handles non-gameplay state:
- Settings changes
- Game reset
- Broadcast sync
- State import/export

## Game State Shape
```typescript
interface GameState {
  scoreA: number;
  scoreB: number;
  setsA: number;
  setsB: number;
  currentSet: number;
  servingTeam: 'A' | 'B';
  matchWinner: 'A' | 'B' | null;
  isMatchOver: boolean;
  timeoutsA: number;
  timeoutsB: number;
  inSuddenDeath: boolean;
  teamA: Team;
  teamB: Team;
  queue: Player[];
  config: GameConfig;
  actionLog: ActionLog[];
  // ... more fields
}
```

## Adding a New Game Mode
1. Add mode definition to `src/config/gameModes.ts`:
   ```typescript
   export const NEW_MODE: GameModeConfig = {
     id: 'new-mode',
     name: 'New Mode',
     playersPerTeam: N,
     pointsToWin: N,
     setsToWin: N,
     tieBreakPoints: N,
     courtLayout: { /* positions */ },
     benchLimit: N,
   };
   ```
2. Register in `GAME_MODES` map
3. Add i18n keys to all locale files (`en.json`, `es.json`, `pt.json`)
4. Update scoring logic if special rules apply
5. Add court layout positions if needed

## Adding a New Action Type
1. Define action in `src/@types/domain.ts`
2. Add case to appropriate sub-reducer
3. Add action log entry type
4. Update `useGameActions` hook to expose dispatcher
5. Add tests in `reducers/__tests__/`

## Key Files
- `src/config/gameModes.ts` — Mode definitions
- `src/config/constants.ts` — Game constants
- `src/features/game/reducers/gameReducer.ts` — Main reducer
- `src/features/game/reducers/scoring.ts` — Scoring logic
- `src/features/game/utils/gameLogic.ts` — Pure game logic functions
- `src/features/game/utils/balanceUtils.ts` — Team balancing
- `src/features/game/hooks/useVolleyGame.ts` — Main game hook
- `src/features/game/hooks/useGameState.ts` — State selectors
- `src/features/game/hooks/useGameActions.ts` — Action dispatchers

## Testing
Reducer tests in `src/features/game/reducers/__tests__/`:
- Test scoring to set win
- Test deuce scenarios
- Test sudden death
- Test serve rotation
- Test side swap triggers
- Test match completion
