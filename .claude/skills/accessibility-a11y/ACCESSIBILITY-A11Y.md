---
name: accessibility-a11y
description: >
  Ensure VolleyScore-Pro meets WCAG 2.1 AA accessibility standards. Use when adding
  ARIA attributes, supporting screen readers, implementing reduced motion, fixing
  accessibility issues, auditing color contrast, touch targets, keyboard navigation,
  focus management, or any a11y-related work.
---

# Accessibility — VolleyScore-Pro

## Decision Tree

```
Accessibility need → What type?
    ├─ Screen reader support → ARIA Best Practices below
    ├─ Reduced motion → Performance Mode Integration below
    ├─ Keyboard navigation → Keyboard Patterns table below
    ├─ Color contrast issue → Color Contrast section below
    ├─ Touch target sizing → Touch Targets section below
    └─ Full a11y audit → WCAG Quick Reference + Checklist below
```

## Standards
- WCAG 2.1 AA compliance target
- `prefers-reduced-motion` respect
- Screen reader compatibility
- Touch target minimums (44x44px)

## Reduced Motion Support

### Performance Mode Integration
`REDUZIR_MOVIMENTO` mode disables all non-essential animations:
```tsx
const { config } = usePerformance();

// Check before animating:
if (config.reduceMotion) {
  // Use instant transitions or skip animation
  return { transition: { duration: 0 } };
}
```

### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Framer Motion
```tsx
// Use useReducedMotion hook:
import { useReducedMotion } from 'framer-motion';

const shouldReduce = useReducedMotion();
const variants = shouldReduce ? staticVariants : animatedVariants;
```

## ARIA Best Practices

### Score Display
```tsx
<div role="status" aria-live="polite" aria-label={`Score: ${scoreA} to ${scoreB}`}>
  <span aria-hidden="true">{scoreA}</span>
  <span aria-hidden="true">-</span>
  <span aria-hidden="true">{scoreB}</span>
</div>
```

### Interactive Elements
```tsx
// Buttons must have accessible names
<button aria-label={t('game.addPoint', { team: 'A' })} onClick={handleScore}>
  <PlusIcon aria-hidden="true" />
</button>

// Toggle buttons
<button aria-pressed={isActive} aria-label={t('settings.voiceControl')}>
  <MicIcon aria-hidden="true" />
</button>
```

### Modals
```tsx
<Modal
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">{title}</h2>
</Modal>
```

### Live Regions
```tsx
// Score announcements
<div aria-live="assertive" className="sr-only">
  {announcement}
</div>

// Toast notifications
<div role="alert" aria-live="polite">
  {notification.message}
</div>
```

## Touch Targets
- Minimum 44x44px for all interactive elements
- Score buttons should be large (full panel tap areas)
- Spacing between targets: minimum 8px

## Color Contrast
- Text on glass surfaces: ensure sufficient contrast
- Team colors: validate contrast ratios
- Use `ring-1 ring-inset ring-white/10` for edge definition

## Keyboard Navigation
- Tab order follows visual layout
- Focus visible indicators on interactive elements
- Escape closes modals
- Enter/Space activates buttons

## Screen Reader Testing
- Test with VoiceOver (iOS/macOS)
- Test with TalkBack (Android)
- Test with NVDA/JAWS (Windows)
- Verify score announcements are read correctly

## WCAG Quick Reference (Level AA)

| Principle | Requirement | Check |
|-----------|------------|-------|
| **Perceivable** | Text alternatives for images | All `<img>` have meaningful `alt` (or `alt=""` if decorative) |
| | Color contrast | 4.5:1 for normal text, 3:1 for large text |
| | Don't rely on color alone | Use icons, patterns, or text alongside color |
| **Operable** | Keyboard accessible | Every interactive element reachable via keyboard |
| | Visible focus indicator | `:focus-visible` styles on all interactive elements |
| | No keyboard traps | User can always Tab out of any component |
| **Understandable** | Page language set | `<html lang="...">` with correct locale |
| | Form labels | Every input has a visible `<label>` with `for` attribute |
| | Error identification | Errors described in text, not just red border |
| **Robust** | Valid HTML | Proper heading hierarchy (h1→h2→h3, no skipping) |
| | ARIA used correctly | Only when native HTML can't do it |

## Keyboard Patterns

| Component | Expected Keyboard Behavior |
|-----------|--------------------------|
| Button | `Enter` or `Space` activates |
| Modal/Dialog | `Escape` closes, focus trapped inside, returns focus on close |
| Dropdown/Menu | `Arrow keys` navigate, `Enter` selects, `Escape` closes |
| Tabs | `Arrow keys` switch tabs, `Tab` moves to panel content |
| Score buttons | Large touch targets, `Enter`/`Space` to score |

## ARIA — Only When Needed

```
Rule #1: Don't use ARIA if native HTML works.
  <button> not <div role="button">
  <nav> not <div role="navigation">
  <input type="checkbox"> not <div role="checkbox">
```

## Testing Commands

```bash
# Automated (catches ~30% of issues)
npx axe-core-cli http://localhost:5173
npx pa11y http://localhost:5173

# Chrome DevTools → Lighthouse → Accessibility audit
# Elements → Accessibility pane (inspect ARIA tree)
```

**Manual testing (catches the rest):**
- Tab through the entire page — can you reach and operate everything?
- Turn off CSS — does the content still make sense?
- Use a screen reader (VoiceOver on macOS, NVDA on Windows, TalkBack on Android)
- Zoom to 200% — does the layout break?

## Anti-Patterns

| Anti-Pattern | Fix |
|-------------|-----|
| `<div onClick>` instead of `<button>` | Use semantic HTML elements |
| Removing focus outlines (`:focus { outline: none }`) | Style `:focus-visible` instead |
| `tabindex="5"` (positive tabindex) | Use `tabindex="0"` or `-1` only |
| Color-only error indication | Add text + icon alongside color |
| Custom components without keyboard support | Implement full keyboard pattern |

## Checklist for New Components
1. All images have `alt` text (or `aria-hidden` if decorative)
2. Interactive elements have accessible names
3. Color is not the only way to convey information
4. Focus management for modals/dialogs
5. Animations respect reduced-motion preference
6. Touch targets meet 44x44px minimum
7. Screen reader tested
8. Keyboard navigation works (Tab, Enter, Space, Escape)
9. Color contrast meets WCAG AA (4.5:1 text, 3:1 large/UI)
10. No ARIA used where native HTML works

## Key Files
- `src/contexts/PerformanceContext.tsx` — Reduced motion config
- `src/config/performanceModes.ts` — REDUZIR_MOVIMENTO mode
- `src/ui/Modal.tsx` — Accessible modal base
- `src/index.css` — Global reduced-motion styles
