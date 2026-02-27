---
name: court-layout
description: >
  Work on the volleyball court visualization, player positioning, rotations, and
  court-related animations. Use when modifying court layout, player positions, zone
  systems, sand textures, beach/indoor court modes, formation display, rotation
  logic, or court UI components.
---

# Court Visualization — VolleyScore-Pro

## Decision Tree

```
Court need → What type?
    ├─ Player position display → courtPositioning.ts + VolleyballCourt
    ├─ Rotation logic → Rotation Logic section below
    ├─ Game mode court layout → Game Mode Court Layouts below
    ├─ Court animation → Framer Motion + courtPlayerVariants
    ├─ Beach sand texture → BeachSandTexture (perf-gated)
    └─ New court feature → Adding New Court Features workflow below
```

## Overview
Visual representation of the volleyball court with player positions, rotations, and real-time updates.

## Components (src/features/court/components/)

| Component | Purpose |
|-----------|---------|
| `VolleyballCourt` | Main court renderer (SVG/canvas) |
| `CourtLayout` | Layout wrapper with zones |
| `CourtHeader` | Court info header |
| `CourtFooter` | Court actions footer |
| `BeachSandTexture` | Beach court sand effect |

### CourtModal
Full-screen court view modal in `src/features/court/modals/CourtModal.tsx`

## Court Positioning (courtPositioning.ts)

### Zone System (6v6)
```
┌─────────────────┐
│  4  │  3  │  2  │  ← Front row (net)
├─────┼─────┼─────┤
│  5  │  6  │  1  │  ← Back row (serve)
└─────────────────┘
```

### Position Calculation
```typescript
import { getPlayerPosition } from '@lib/utils/courtPositioning';

// Returns { x, y } coordinates for court rendering
const pos = getPlayerPosition(zone, courtWidth, courtHeight, isBeach);
```

### Rotation Logic
- Clockwise rotation: 1→2→3→4→5→6→1
- Triggered on serve change
- Animation: players smoothly transition to new positions

## Game Mode Court Layouts

### 6v6 Indoor
- 6 zones per side
- Standard rotation order
- Libero in zone 5/6

### 4v4 Beach
- 4 positions per side (2 front + 2 back)
- Simplified rotation

### 2v2 Beach
- 2 positions per side
- Simple left/right swap

## Court Animation (Framer Motion)
```tsx
// Player position transitions
<motion.div
  animate={{ x: position.x, y: position.y }}
  transition={scoutSpring}
/>

// Court player variants from animations.ts
import { courtPlayerVariants } from '@lib/utils/animations';
```

## Sand Texture (Beach Modes)
`BeachSandTexture.tsx` adds visual sand effect:
- CSS gradient patterns
- Subtle noise texture
- Performance-gated (disabled on LOW_END)

## Adding New Court Features
1. Modify `VolleyballCourt.tsx` for visual changes
2. Update `courtPositioning.ts` for position logic
3. Add animations to `animations.ts` if needed
4. Test all game modes (different player counts)
5. Ensure responsive layout (portrait + landscape)
6. Gate effects behind PerformanceContext

## Key Files
- `src/features/court/components/VolleyballCourt.tsx`
- `src/features/court/components/CourtLayout.tsx`
- `src/features/court/components/BeachSandTexture.tsx`
- `src/features/court/modals/CourtModal.tsx`
- `src/lib/utils/courtPositioning.ts`
- `src/lib/utils/animations.ts` — Court player variants
- `src/config/gameModes.ts` — Court layout definitions
