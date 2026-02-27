---
name: tournaments
description: >
  Implement tournament and competition management features. Use when building
  brackets, round-robin systems, multi-match events, league management, pool
  play, single/double elimination, king of court, tournament scheduling,
  standings, or any competition-related feature.
---

# Tournament Mode — VolleyScore-Pro

## Decision Tree

```
Tournament need → What type?
    ├─ Single/double elimination → BracketGenerator + BracketView
    ├─ Round-robin → generateRoundRobin + RoundRobinTable
    ├─ Pool play → PoolStage + PoolPlayView → Playoffs
    ├─ King of court → Queue-based rotation system
    ├─ Standings/rankings → StandingsCalculator + StandingsTable
    ├─ Tournament state → tournamentStore (Zustand)
    └─ Match integration → TournamentMatch → regular game flow
```

## Overview
Enable organizing and managing volleyball tournaments with multiple teams and matches.

## Planned Features

### 1. Tournament Formats
```typescript
type TournamentFormat =
  | 'single-elimination'    // Bracket, lose once = out
  | 'double-elimination'    // Two-loss elimination
  | 'round-robin'           // Everyone plays everyone
  | 'pool-play'             // Groups → playoffs
  | 'king-of-court';        // Winner stays, loser rotates

interface Tournament {
  id: string;
  name: string;
  format: TournamentFormat;
  teams: Team[];
  matches: TournamentMatch[];
  currentRound: number;
  status: 'setup' | 'in-progress' | 'completed';
  startDate: number;
  rules: TournamentRules;
}
```

### 2. Bracket System
```typescript
interface Bracket {
  rounds: BracketRound[];
  // Visualize as bracket tree
}

interface BracketRound {
  roundNumber: number;
  name: string;         // "Quarterfinals", "Semifinals", "Final"
  matches: TournamentMatch[];
}

interface TournamentMatch {
  id: string;
  roundNumber: number;
  teamA: Team | null;   // null = TBD (pending previous match)
  teamB: Team | null;
  score?: { setsA: number, setsB: number };
  winner?: 'A' | 'B';
  scheduledTime?: number;
  court?: string;        // Court assignment
}
```

### 3. Round-Robin Scheduling
```typescript
// Auto-generate round-robin schedule:
// N teams → N-1 rounds, each team plays once per round
// Handle odd number of teams (bye)
function generateRoundRobin(teams: Team[]): Schedule;
```

### 4. Pool Play → Playoffs
```typescript
interface PoolStage {
  pools: Pool[];          // Groups A, B, C, D
  advanceCount: number;   // Top N from each pool
}

interface Pool {
  name: string;
  teams: Team[];
  matches: TournamentMatch[];
  standings: PoolStanding[];
}
```

### 5. King of Court
- Popular in beach volleyball
- Winner stays on court
- Loser goes to end of queue
- Perfect for pick-up games with 3+ teams

## Implementation Guide

### Architecture
```
src/features/tournament/
├── components/
│   ├── TournamentSetup.tsx     — Create/configure tournament
│   ├── BracketView.tsx         — Visual bracket display
│   ├── RoundRobinTable.tsx     — Round-robin standings
│   ├── PoolPlayView.tsx        — Pool stage display
│   ├── MatchCard.tsx           — Tournament match card
│   ├── StandingsTable.tsx      — Overall standings
│   └── ScheduleView.tsx        — Match schedule
├── hooks/
│   ├── useTournament.ts        — Tournament state management
│   ├── useBracket.ts           — Bracket generation/updates
│   └── useScheduler.ts         — Schedule generation
├── services/
│   ├── TournamentEngine.ts     — Format logic, scheduling
│   ├── BracketGenerator.ts     — Bracket algorithms
│   └── StandingsCalculator.ts  — Points, tiebreakers
├── store/
│   └── tournamentStore.ts      — Zustand persistence
├── modals/
│   ├── TournamentModal.tsx     — Main tournament modal
│   └── MatchResultModal.tsx    — Enter match results
└── utils/
    ├── bracketUtils.ts         — Bracket tree operations
    ├── schedulingAlgorithm.ts  — Round-robin, pool algorithms
    └── tiebreakers.ts          — Tiebreaker rules
```

### Integration with Game System
- Each tournament match = regular VolleyScore game
- On match end → auto-update tournament state
- Bracket advances automatically
- Standings recalculate in real-time

### Data Persistence
- Zustand store with IndexedDB persistence
- Optional Firebase sync for shared tournaments
- Export tournament results (PDF, share)

### UI/UX Considerations
- Bracket should be swipeable/scrollable on mobile
- Use team colors in bracket visualization
- Highlight current match
- Show upcoming matches notification
- Support court assignments (multi-court venues)

### i18n
Add keys under `tournament.` namespace:
- Format names, round names, status labels
- "Quarterfinals", "Semifinals", "Final", "3rd Place"
