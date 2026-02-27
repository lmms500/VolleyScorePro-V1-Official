---
name: webapp-testing
description: >
  Toolkit for E2E testing VolleyScore-Pro web application using Playwright. Use when
  testing UI interactions, verifying game flows, checking responsive layouts, debugging
  visual issues, capturing browser screenshots, viewing browser logs, writing Playwright
  tests, visual regression testing, or any browser-based end-to-end testing. For unit
  tests (reducers, utils, hooks), use the testing skill instead.
---

# Web Application Testing

Test VolleyScore-Pro using Playwright scripts for end-to-end verification.

## Decision Tree

```
Test request → What type?
    ├─ Visual verification → Screenshot comparison
    ├─ Game flow (scoring, sets) → Playwright interaction script
    ├─ Responsive layout → Multiple viewport screenshots
    ├─ Voice/speech UI → Mock speech API + verify UI state
    ├─ PWA functionality → Service worker + offline tests
    └─ Component interaction → Unit test with Vitest (use testing skill instead)
```

## Setup

VolleyScore-Pro uses Vite dev server on port 5173:

```bash
# Start dev server and run test
npx playwright test
# Or manually:
npm run dev &
npx playwright test --headed  # to see the browser
```

## Writing Playwright Tests

```typescript
import { test, expect } from '@playwright/test';

test('game scoring flow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Navigate to game screen
  // ... interact with scoring buttons
  // ... verify score display updates
});
```

## Reconnaissance-Then-Action Pattern

1. **Inspect rendered DOM**:
   ```typescript
   await page.screenshot({ path: '/tmp/inspect.png', fullPage: true });
   const content = await page.content();
   const buttons = await page.locator('button').all();
   ```

2. **Identify selectors** from inspection results

3. **Execute actions** using discovered selectors

## Critical Rules

- **Always wait for `networkidle`** before inspecting dynamic content
- **Use `data-testid` attributes** when available for reliable selectors
- **Test with reduced motion** for accessibility: `await page.emulateMedia({ reducedMotion: 'reduce' })`
- **Test multiple viewports**: mobile (375x667), tablet (768x1024), desktop (1280x720)

## VolleyScore-Pro Specific Patterns

### Game Flow Testing
```typescript
// Start a new game
await page.click('[data-testid="new-game"]');
// Score a point for team A
await page.click('[data-testid="score-team-a"]');
// Verify score updated
await expect(page.locator('[data-testid="score-display-a"]')).toHaveText('1');
```

### Glass UI Verification
```typescript
// Verify glass surface rendering
const glassSurface = page.locator('.glass-surface');
await expect(glassSurface).toBeVisible();
// Screenshot for visual regression
await glassSurface.screenshot({ path: '/tmp/glass-component.png' });
```

### Responsive Testing
```typescript
const viewports = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1280, height: 720, name: 'desktop' },
];

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.screenshot({ path: `/tmp/${vp.name}.png`, fullPage: true });
}
```

## Common Pitfalls

- **Don't** inspect DOM before `networkidle` on dynamic pages
- **Don't** use fragile selectors like `.class-name:nth-child(3)` — prefer `data-testid`
- **Don't** hardcode animation delays — use `waitForSelector` or `waitForFunction`
- **Do** use `page.waitForSelector()` for elements that appear after state changes
- **Do** mock Firebase auth for isolated testing
- **Do** test with `prefers-reduced-motion` to verify perf-gated animations

## Best Practices

- Use `sync_playwright()` for synchronous scripts
- Always close the browser when done
- Use descriptive selectors: `text=`, `role=`, CSS selectors, or IDs
- Add appropriate waits: `page.waitForSelector()` or `page.waitForTimeout()`
- Take screenshots at key checkpoints for visual verification
