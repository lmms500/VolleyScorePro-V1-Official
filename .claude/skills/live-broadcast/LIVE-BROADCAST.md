---
name: live-broadcast
description: >
  Work on the live broadcast and OBS integration system. Use when implementing
  real-time sync, broadcast overlays, spectator features, streaming UI, lower
  thirds, score display for OBS, celebration animations, draggable overlay
  cards, or any broadcast/streaming-related component.
---

# Broadcast System — VolleyScore-Pro

## Decision Tree

```
Broadcast need → What type?
    ├─ Real-time sync → SyncEngine + Firebase below
    ├─ OBS overlay → ObsScoreDisplay + BroadcastOverlay
    ├─ Spectator view → SPECTATOR role + read-only sync
    ├─ Lower thirds/graphics → LowerThird + PointScorerGraphic
    ├─ Celebration animations → PointCelebration / SetWinCelebration / MatchWinCelebration
    ├─ Draggable elements → DraggableCard + useDraggableOverlay
    └─ New broadcast feature → Adding New Broadcast Features workflow below
```

## Overview
Real-time game broadcasting via Firebase Firestore with OBS-compatible overlays.

## Architecture

```
BroadcastScreen (main view)
├─ SyncEngine.ts (Firebase real-time sync)
│  ├─ CONTROLLER role → writes game state
│  └─ SPECTATOR role → reads game state
├─ Core Components
│  ├─ BroadcastBar → Control panel
│  ├─ BroadcastOverlay → Full overlay manager
│  └─ ObsScoreDisplay → OBS-compatible score
├─ Animations
│  ├─ PointCelebration → Per-point animation
│  ├─ SetWinCelebration → Set win fanfare
│  └─ MatchWinCelebration → Match end celebration
├─ Lower Thirds
│  ├─ LowerThird → Info banner
│  └─ PointScorerGraphic → Player highlight
├─ Stats Overlays
│  ├─ TeamStatsOverlay → Team statistics
│  └─ TopPlayerOverlay → MVP/top scorer
└─ Interactive
   └─ DraggableCard → Draggable overlay elements
```

## Sync Roles
```typescript
type SyncRole = 'CONTROLLER' | 'SPECTATOR' | 'NONE';

// CONTROLLER: The device running the match — writes state to Firestore
// SPECTATOR: Read-only viewers — subscribe to Firestore updates
// NONE: Local-only match, no sync
```

## SyncEngine (Firebase Real-Time)
```typescript
// Writes to: firestore/broadcasts/{matchId}
// Data: { gameState, timer, timeouts, spectatorCount }
// Update frequency: On every score change (debounced)
```

## Hooks
| Hook | Purpose |
|------|---------|
| `useBroadcastManager` | Main broadcast orchestrator |
| `useSyncManager` | Firebase sync lifecycle |
| `useTimerSync` | Sync match timer |
| `useTimeoutSync` | Sync timeout state |
| `useSpectatorSync` | Sync spectator presence |
| `useSpectatorCount` | Track viewer count |
| `useDraggableOverlay` | Drag overlay management |

## OBS Integration
- BroadcastScreen renders at `/broadcast` route
- Transparent background for OBS chroma key
- Fixed-position score display
- Customizable overlay positions (draggable)
- Lower thirds with team branding

## Adding New Broadcast Features
1. Create component in `src/features/broadcast/components/`
2. Add sync data to SyncEngine if real-time needed
3. Register in BroadcastOverlay for positioning
4. Add controls to BroadcastBar
5. Test with 2 devices (controller + spectator)

## Key Files
- `src/features/broadcast/screens/BroadcastScreen.tsx`
- `src/features/broadcast/services/SyncEngine.ts`
- `src/features/broadcast/hooks/useBroadcastManager.ts`
- `src/features/broadcast/components/core/`
- `src/features/broadcast/components/animations/`
- `src/features/broadcast/components/lower-thirds/`
- `src/features/broadcast/config/BroadcastConfig.ts`
- `src/features/broadcast/modals/LiveSyncModal.tsx`
