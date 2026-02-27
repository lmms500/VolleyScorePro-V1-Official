---
name: performance
description: >
  Optimize performance for VolleyScore-Pro across devices. Use when profiling,
  reducing re-renders, optimizing animations, code splitting, improving low-end
  device support, lazy loading, memoization, bundle size reduction, FPS monitoring,
  or configuring performance modes.
---

# Performance Optimization — VolleyScore-Pro

## Decision Tree

```
Performance need → What type?
    ├─ Component re-renders → Context Splitting + Memoization below
    ├─ Slow animations → Adaptive Animation + animationConfig below
    ├─ Large bundle size → Code Splitting + Lazy Loading below
    ├─ Low-end device support → Performance Modes + Device Detection
    ├─ Visual effect gating → PerformanceContext flags below
    ├─ FPS drops → usePerformanceMonitor + auto-downgrade
    └─ Full performance audit → Optimization Checklist below
```

## Performance Modes (src/config/performanceModes.ts)

| Mode | Target | Animations | Blur | Shimmer | Shadows |
|------|--------|-----------|------|---------|---------|
| LOW_END | Old/weak devices | Minimal | Off | Off | Simple |
| REDUZIR_MOVIMENTO | Accessibility | Off | Off | Off | Normal |
| ECONOMICO | Balanced (default) | Reduced | Off | Off | Normal |
| PERFORMANCE | Flagship devices | Full | On | On | Full |

## PerformanceContext

```tsx
const { config } = usePerformance();

// Available flags:
config.animations      // boolean — enable animations
config.backdropBlur    // boolean — enable blur effects
config.boxShadows      // boolean — enable complex shadows
config.shimmer         // boolean — enable shimmer effects
config.orbs            // boolean — enable background orbs
config.reduceMotion    // boolean — prefers-reduced-motion
```

## Device Detection (deviceDetection.ts)
Auto-detects device specs and maps to optimal performance mode:
```typescript
const device = detectDevice();
// { platform, brand, model, cores, ram, gpu, score }
// score < 3 → LOW_END
// score < 5 → ECONOMICO
// score >= 5 → PERFORMANCE
```

## React Optimization Patterns

### Context Splitting (Prevent Re-renders)
Game state is split into 3 contexts:
```
ScoreContext  → HOT (updates every second during play)
ActionsContext → STABLE (never changes — dispatchers)
RosterContext → COLD (updates on team changes only)
```

### Memoization
```tsx
// memo() for components that receive stable props
export const PlayerCard = memo(function PlayerCard({ player }: Props) { ... });

// useMemo for computed values
const sortedPlayers = useMemo(() =>
  players.sort((a, b) => b.skill - a.skill),
  [players]
);

// useCallback for event handlers passed as props
const handleScore = useCallback((team: 'A' | 'B') => {
  dispatch({ type: 'POINT', team });
}, [dispatch]);
```

### Code Splitting (Vite)
```typescript
// vite.config.ts — manual chunks
manualChunks: {
  'react-core': ['react', 'react-dom'],
  'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  'framer': ['framer-motion'],
  'icons': ['lucide-react'],
  'dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
}
```

### Lazy Loading
```tsx
const BroadcastScreen = lazy(() => import('@features/broadcast/screens/BroadcastScreen'));
const TutorialModal = lazy(() => import('@features/tutorial/modals/TutorialModal'));
```

## Animation Optimization

### Adaptive Animation (useAdaptiveAnimation.ts)
```tsx
const animConfig = useAdaptiveAnimation();
// Returns device-appropriate spring/duration values
// Low-end: shorter durations, no springs
// High-end: full spring physics
```

### animationConfig.ts
```typescript
// Device-aware animation tuning
export function getAnimationConfig(perf: PerformanceConfig) {
  if (!perf.animations) return INSTANT; // Skip all animations
  if (perf.reduceMotion) return REDUCED; // Minimal transitions
  return FULL; // Full spring physics
}
```

### Performance-Gated Effects
```tsx
// ShimmerEffect auto-gates:
<ShimmerEffect /> // Renders nothing in ECONOMICO/LOW_END

// Manual gating:
{config.backdropBlur && <div className="backdrop-blur-xl" />}
{config.orbs && <BackgroundGlow />}
```

## Bundle Size
- esbuild minification (faster than Terser)
- Console/debugger stripping in production
- Tree-shaking with ES modules
- Dynamic imports for heavy features

## Monitoring (usePerformanceMonitor.ts)
```tsx
const { fps, memory } = usePerformanceMonitor();
// Tracks FPS drops and memory usage
// Can auto-downgrade performance mode on sustained low FPS
```

## Optimization Checklist
1. Use correct context (Score vs Roster vs Actions)
2. `memo()` on list items and frequent re-renders
3. `useMemo`/`useCallback` for expensive ops
4. Gate visual effects behind PerformanceContext
5. Lazy-load heavy modals/features
6. Use `will-change` CSS sparingly
7. Avoid layout thrashing in animation loops
8. Virtual scrolling for long lists (react-virtuoso)

## Key Files
- `src/config/performanceModes.ts` — Mode definitions
- `src/contexts/PerformanceContext.tsx` — Provider
- `src/lib/platform/deviceDetection.ts` — Device profiling
- `src/lib/platform/animationConfig.ts` — Animation tuning
- `src/features/game/hooks/useAdaptiveAnimation.ts`
- `src/hooks/usePerformanceMonitor.ts`
- `src/ui/ShimmerEffect.tsx` — Gated shimmer
- `vite.config.ts` — Build optimization
