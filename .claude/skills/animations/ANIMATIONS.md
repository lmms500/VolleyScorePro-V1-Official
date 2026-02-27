---
name: animations
description: >
  Create and manage Framer Motion animations following VolleyScore-Pro patterns. Use
  when adding animations, transitions, gesture interactions, visual effects, springs,
  variants, shimmer, confetti, score ticker, stagger lists, AnimatePresence, or any
  motion-related work. Also covers performance-gated animation decisions.
---

# Animation System — VolleyScore-Pro

## Decision Tree

```
Animation need → What type?
    ├─ Modal/card enter/exit → scoutSlideVariants + AnimatePresence
    ├─ List stagger → staggerContainerVariants + staggerItemVariants
    ├─ Score change → ScoreTicker / scoreTickerVariants
    ├─ Celebration effect → Confetti / CriticalPointAnimation
    ├─ Button/tap feedback → whileTap={{ scale: 0.95 }} + scoutSpring
    ├─ Court player movement → courtPlayerVariants
    ├─ New custom animation → Create in animations.ts (workflow below)
    └─ Performance concern → PerformanceContext gating below
```

## Stack
- **Framer Motion v11** — Primary animation library
- **Tailwind CSS transitions** — Simple hover/focus states
- **CSS animations** — Keyframe-based effects (shimmer, pulse)

## Animation Library (src/lib/utils/animations.ts — 700+ lines)

### Core Springs
```typescript
import { scoutSpring, scoutSlideVariants } from '@lib/utils/animations';

// scoutSpring: { type: 'spring', stiffness: 300, damping: 30 }
// Use for snappy UI transitions (modals, cards, buttons)
```

### Available Variant Sets (50+)
| Variant | Purpose |
|---------|---------|
| `scoutSlideVariants` | Modal/card slide-in |
| `fadeInVariants` | Simple opacity fade |
| `slideUpVariants` | Slide from bottom |
| `scaleVariants` | Scale up from center |
| `staggerContainerVariants` | Parent for stagger children |
| `staggerItemVariants` | Child stagger animation |
| `courtPlayerVariants` | Court player position animations |
| `landingHeroVariants` | Landing page hero |
| `confettiVariants` | Celebration particles |
| `scoreTickerVariants` | Score number change |

### Usage Patterns

#### Modal Animation
```tsx
<motion.div
  variants={scoutSlideVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  <Modal>...</Modal>
</motion.div>
```

#### Staggered List
```tsx
<motion.ul variants={staggerContainerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={staggerItemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

#### Gesture-Based Scoring
```tsx
<motion.div
  whileTap={{ scale: 0.95 }}
  onTap={() => handleScore('A')}
  transition={scoutSpring}
/>
```

#### AnimatePresence (Mount/Unmount)
```tsx
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="unique"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

## Performance-Gated Animations

### Always check PerformanceContext:
```tsx
const { config } = usePerformance();

// Option 1: Skip animation entirely
if (!config.animations) return <div>{children}</div>;

// Option 2: Reduce animation complexity
const spring = config.animations
  ? scoutSpring
  : { duration: 0.15 }; // Simple tween fallback
```

### Adaptive Animation Hook
```tsx
const animConfig = useAdaptiveAnimation();
// Returns device-appropriate animation values
```

## Design Tokens (designTokens.ts)
```typescript
// Pre-configured animation classes:
designTokens.spring        // Standard spring config
designTokens.springBouncy  // More bounce
designTokens.springSnappy  // Quick snap
```

## Animation Categories

### UI Transitions
- Modal open/close
- Tab switching
- Drawer slide
- Dropdown appear

### Game Animations
- Score increment (ScoreTicker)
- Set win celebration (Confetti)
- Match point indicator (CriticalPointAnimation)
- Serve indicator pulse
- Court player movement

### Feedback Animations
- Button press (whileTap scale)
- Toast notification slide
- Voice toast appear/disappear
- Error shake

### Landing Page
- Hero parallax
- Feature card stagger
- Stats counter animation
- Roadmap timeline reveal

## Creating New Animations

1. **Define variants** in `animations.ts`:
   ```typescript
   export const myVariants = {
     hidden: { opacity: 0, y: 20 },
     visible: {
       opacity: 1, y: 0,
       transition: scoutSpring,
     },
     exit: { opacity: 0, y: -20 },
   };
   ```

2. **Gate behind performance check**
3. **Use existing springs** — don't create new spring configs
4. **Respect reduced motion** — provide static fallback
5. **Test on low-end device mode**

## Key Files
- `src/lib/utils/animations.ts` — All variants and springs
- `src/ui/designTokens.ts` — Animation tokens
- `src/ui/Confetti.tsx` — Confetti component
- `src/ui/CriticalPointAnimation.tsx` — Match/set point
- `src/ui/ScoreTicker.tsx` — Score number animation
- `src/ui/ShimmerEffect.tsx` — Shimmer (perf-gated)
- `src/features/game/hooks/useAdaptiveAnimation.ts`
- `src/lib/platform/animationConfig.ts`
