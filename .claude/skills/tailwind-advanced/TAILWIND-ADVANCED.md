---
name: tailwind-advanced
description: Advanced Tailwind CSS v3.4 patterns for VolleyScore-Pro. Covers responsive design, container queries, advanced grid/flexbox, dark mode, custom utilities, and performance-aware styling. Use when dealing with complex layouts, responsive breakpoints, Tailwind configuration, custom utilities, or optimizing CSS output. Complements ui-visual-patterns (which covers shadows, glass, rings, tokens).
---

# Advanced Tailwind CSS Patterns

> **Note**: For shadow merging, glass surfaces, ring-inset, and design tokens, use the `ui-visual-patterns` skill instead. This skill covers layout, responsive, and advanced utility patterns.

## Decision Tree

```
Tailwind need → What type?
    ├─ Shadow/glass/ring/token → Use ui-visual-patterns skill
    ├─ Responsive layout → Breakpoints section below
    ├─ Complex grid/flex → Layout patterns below
    ├─ Custom utility needed → Extend theme below
    ├─ Bundle size concern → Purge/optimization below
    └─ Dark mode / theming → Theme section below
```

## Responsive Breakpoints

VolleyScore-Pro breakpoints (mobile-first):

| Breakpoint | Size | Use Case |
|-----------|------|----------|
| Default | <640px | Mobile phones (primary target) |
| `sm:` | ≥640px | Large phones, landscape |
| `md:` | ≥768px | Tablets |
| `lg:` | ≥1024px | Small laptops, broadcast view |
| `xl:` | ≥1280px | Desktop, OBS overlay |

### Responsive Patterns

```tsx
// Score display — scales with viewport
<div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
  {score}
</div>

// Grid layout — stacks on mobile, side-by-side on tablet+
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <TeamPanel team={teamA} />
  <TeamPanel team={teamB} />
</div>

// Court layout — full width mobile, centered on desktop
<div className="w-full lg:max-w-4xl lg:mx-auto">
  <CourtView />
</div>
```

## Layout Patterns

### Game Screen Layout (Full Viewport)
```tsx
<div className="h-dvh flex flex-col">
  <header className="shrink-0 h-14">...</header>
  <main className="flex-1 min-h-0 overflow-hidden">...</main>
  <footer className="shrink-0">...</footer>
</div>
```

### Safe Area (Capacitor/PWA)
```tsx
<div className="pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
  ...
</div>
```

### Aspect Ratio for Court
```tsx
<div className="aspect-[2/1] max-w-full"> {/* Beach volleyball court ratio */}
  <CourtSVG />
</div>
```

## Typography Scale

```tsx
// Consistent type scale for the app
<h1 className="text-2xl sm:text-3xl font-bold">     {/* Page titles */}
<h2 className="text-xl sm:text-2xl font-semibold">  {/* Section headers */}
<h3 className="text-lg font-medium">                {/* Card titles */}
<p className="text-sm sm:text-base">                 {/* Body text */}
<span className="text-xs text-white/60">             {/* Captions/labels */}
```

## Animation Classes (Performance-Gated)

```tsx
// Always check PerformanceContext before using transitions
const { config } = usePerformance();

<div className={cn(
  'transform-gpu', // Force GPU layer
  config.reduceMotion ? '' : 'transition-all duration-300 ease-out'
)}>
```

## Custom Utilities

### Screen Reader Only
```tsx
<span className="sr-only">{accessibleLabel}</span>
```

### Line Clamp
```tsx
<p className="line-clamp-2">{longText}</p>
```

### Scrollbar Hide
```tsx
<div className="overflow-y-auto scrollbar-hide">...</div>
```

## Performance Optimization

### Avoid These Patterns
| Bad | Why | Good |
|-----|-----|------|
| `backdrop-blur-xl` everywhere | Heavy GPU cost | Use GlassSurface with PerformanceContext |
| Arbitrary values `[42px]` | Breaks consistency | Use theme scale values |
| `!important` via `!` prefix | Hard to override | Fix specificity instead |
| Inline styles for layout | Breaks purging | Use Tailwind classes |

### Bundle Size
- Tailwind purges unused CSS automatically via `content` config
- Avoid `@apply` in CSS files — use utility classes directly
- Group common patterns in React components, not CSS abstractions

## Conditional Classes

Always use the project's `cn()` utility (from `@lib/utils`):

```tsx
import { cn } from '@lib/utils';

<button className={cn(
  'px-4 py-2 rounded-lg font-medium',
  'transition-colors duration-200',
  isActive
    ? 'bg-blue-500 text-white'
    : 'bg-white/10 text-white/60 hover:bg-white/20',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
```

## Key Files
- `tailwind.config.ts` — Theme configuration, custom colors, plugins
- `src/index.css` — Global styles, @tailwind directives
- `src/lib/utils/index.ts` — `cn()` utility (clsx + tailwind-merge)
- `src/ui/designTokens.ts` — Reusable design token classes
