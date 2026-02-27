---
name: stats-and-history
description: >
  Work on match history, statistics, analytics, and data visualization. Use when
  implementing charts, match replay, PDF exports, AI analysis, momentum graphs,
  player statistics, skill distribution, timeline visualization, or any
  stats/history-related feature.
---

# Analytics Engine — VolleyScore-Pro

## Decision Tree

```
Stats/history need → What type?
    ├─ Match history list → HistoryList + historyStore
    ├─ Match detail view → MatchDetail + MatchStatistics
    ├─ Point replay → MatchSequences + MatchTimeline
    ├─ Momentum/chart → MomentumGraph + SkillDistribution
    ├─ AI analysis → AnalysisEngine + ProAnalysis (Gemini)
    ├─ PDF export → PDFService (jsPDF)
    ├─ New statistic → Adding New Statistics workflow below
    └─ Data flow → GameContext actionLog → historyStore pipeline
```

## Features
- Match history list with search/filter
- Point-by-point match replay
- Momentum graphs (score trends over time)
- Player statistics aggregation
- Skill distribution charts
- AI-powered tactical analysis (Google Gemini)
- PDF report export
- Social share screenshots

## Architecture

### Data Flow
```
GameContext (actionLog[])
  → useMatchSaver (saves on match end)
  → historyStore (Zustand + IndexedDB)
  → AnalysisEngine (on-demand AI analysis)
  → PDFService / Social Share
```

### Components (src/features/history/components/)
| Component | Purpose |
|-----------|---------|
| `HistoryList` | Paginated match list |
| `MatchDetail` | Full match detail view |
| `MatchInfo` | Match metadata (teams, date, mode) |
| `MatchSequences` | Point-by-point replay |
| `MatchStatistics` | Stats overview cards |
| `MatchTimeline` | Visual timeline |
| `MatchTimeouts` | Timeout log |
| `MomentumGraph` | Score momentum chart |
| `ProAnalysis` | AI tactical analysis |
| `SkillDistribution` | Player skill chart |

### Services
- **AnalysisEngine.ts** — AI match analysis via Gemini
- **PDFService.ts** — jsPDF report generation
- **statsAggregator.ts** — Statistics computation

### Store (historyStore.ts)
```typescript
interface HistoryStore {
  matches: MatchHistory[];
  addMatch: (match: MatchHistory) => void;
  removeMatch: (id: string) => void;
  getMatch: (id: string) => MatchHistory | undefined;
  clearAll: () => void;
}
```

## Match History Data Model
```typescript
interface MatchHistory {
  id: string;
  date: number;
  mode: GameMode;
  teamA: { name, color, players, score, sets };
  teamB: { name, color, players, score, sets };
  sets: SetDetail[];
  actionLog: ActionLog[];
  duration: number;
  winner: 'A' | 'B';
}
```

## AI Analysis (AnalysisEngine.ts)
Uses Google Gemini to generate:
- Tactical summary
- Clutch moments identification
- Performance ratings per player
- Strategic recommendations
- Momentum shift analysis

## PDF Export (PDFService.ts)
Uses jsPDF to generate:
- Match summary page
- Score progression chart
- Player statistics table
- Timeline visualization

## Adding New Statistics
1. Add computation logic to `statsAggregator.ts`
2. Create visualization component in `components/`
3. Add to `MatchDetail` or `MatchStatistics` layout
4. Add i18n keys for labels
5. Test with various match data shapes

## Key Files
- `src/features/history/store/historyStore.ts`
- `src/features/history/services/AnalysisEngine.ts`
- `src/features/history/services/PDFService.ts`
- `src/features/history/services/statsAggregator.ts`
- `src/features/history/utils/statsEngine.ts`
- `src/features/history/utils/timelineGenerator.ts`
- `src/features/history/components/` — All visualization components
- `src/features/history/modals/HistoryModal.tsx`
