---
name: ui-visual-patterns
description: >
  Apply the Scout Modal design language and VolleyScore-Pro design tokens when
  creating or modifying UI components. Use when working with shadows, glass surfaces,
  ring utilities, color themes, dark mode, design tokens, visual consistency, style
  bugs, GlassSurface, responsive spacing, or any visual design system concern.
---

# VolleyScore-Pro Design System

## Decision Tree

```
Visual/design need → What type?
    ├─ Shadow styling → Critical Shadow Rules below (merge outer+inset!)
    ├─ Glass effect → GlassSurface component (intensity: low/medium/high)
    ├─ Ring/border → Ring Utilities (ring-inset mandatory)
    ├─ Dropdown/floating → Dropdowns & Floating Menus shadow below
    ├─ Design tokens → designTokens.ts (closeButton, iconBox, etc.)
    ├─ Responsive spacing → r-* units section below
    ├─ Color/theme → Color System + ThemeContext
    ├─ Performance gating → PerformanceContext checks below
    └─ Layout/responsive → Use tailwind-advanced skill instead
```

You are working on VolleyScore-Pro, a premium volleyball PWA using the **Scout Modal design language**. Follow these rules strictly when creating or modifying any UI.

## Core Stack
- **Tailwind CSS v3.4** with custom responsive tokens
- **Framer Motion v11** for animations
- **GlassSurface.tsx** (`@ui/GlassSurface`) as the base glass component

## Critical Shadow Rules

### NEVER do this (Tailwind CSS variable collision — inset shadow is silently lost):
```tsx
// BAD — shadow-lg and shadow-[inset...] use the same CSS var
className="shadow-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
```

### ALWAYS merge into a single custom value:
```tsx
// GOOD — merged outer + inset in one declaration
className="shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.15)]"
```

### Acceptable shadow-2xl exceptions (do NOT merge these):
- Drag overlay floating avatars
- `drop-shadow-2xl` on text (CSS filter, not box-shadow)
- `shadow-2xl shadow-black/50` on full-height side panels (FullscreenMenuDrawer)
- `shadow-2xl shadow-[color]/[opacity]` color-modifier pairs on solid buttons with ring-inset
- ResultCard.tsx (social share screenshot, z-index:-50)
- Tutorial scene files (mock UI)

## Ring Utilities (Mandatory)
All ring usage MUST include `ring-inset`:
```tsx
className="ring-1 ring-inset ring-white/10"
```

## GlassSurface Component
Import: `import { GlassSurface } from '@ui/GlassSurface'`

Intensities: `low` | `medium` | `high` | `transparent`
- `medium` and `high` already include merged shadows — do NOT add extra shadows
- Use `low` for subtle backgrounds, `high` for prominent cards/modals

## Dropdowns & Floating Menus
```tsx
className="shadow-[0_20px_50px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.15)] ring-1 ring-inset ring-white/10"
```

## Design Tokens
Import: `import { designTokens } from '@ui/designTokens'`

Available tokens:
- `designTokens.closeButton` — standard close button classes
- `designTokens.iconBox` — gradient icon container
- `designTokens.glassContainer` — glass card preset
- `designTokens.activeState` — interactive state

## Responsive Spacing
Use responsive units instead of fixed values:
- Spacing: `r-1`, `r-2`, `r-3`, `r-4` (CSS custom property based)
- Font sizes: `r-xs`, `r-sm`, `r-base`, `r-lg`, `r-xl`, `r-2xl`

## Color System
- Team colors are dynamic — use `colorsDynamic.ts` utilities
- Always support dark mode (Tailwind `dark:` variants)
- Theme mode: `class` (manual toggle via ThemeContext)

## Performance Gating
Before adding visual effects, check PerformanceContext:
- Shimmer/blur/orbs: disabled in `ECONOMICO` and `REDUZIR_MOVIMENTO` modes
- Use `ShimmerEffect` component (auto-gates based on performance mode)
- Wrap expensive effects in performance checks:
```tsx
const { config } = usePerformance();
if (!config.backdropBlur) return null; // Skip blur on low-end devices
```

## File References
- Design tokens: `src/ui/designTokens.ts`
- Glass component: `src/ui/GlassSurface.tsx`
- Shimmer: `src/ui/ShimmerEffect.tsx`
- Colors: `src/lib/utils/colors.ts`, `src/lib/utils/colorsDynamic.ts`
- Performance: `src/contexts/PerformanceContext.tsx`
- Performance modes: `src/config/performanceModes.ts`

## Checklist Before Submitting UI Changes
1. No separate `shadow-X` + `shadow-[inset...]` (merged into one value)
2. All `ring-*` include `ring-inset`
3. GlassSurface medium/high used without extra shadows
4. Responsive units (`r-*`) instead of fixed `px`/`rem`
5. Performance-gated effects checked
6. Dark mode support verified
