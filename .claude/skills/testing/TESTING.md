---
name: testing
description: >
  Write and run unit tests for VolleyScore-Pro using Vitest. Use when creating
  unit tests, testing reducers, testing utilities, testing hooks, fixing test
  failures, setting up test infrastructure, mocking contexts/Firebase/Capacitor,
  or checking code coverage. For E2E/browser testing, use the webapp-testing skill.
---

# Testing & QA — VolleyScore-Pro

## Decision Tree

```
Testing need → What type?
    ├─ Unit test (reducer, util, service) → Vitest below
    ├─ Hook test → Vitest + vi.mock for dependencies
    ├─ E2E / browser test → Use webapp-testing skill instead
    ├─ Test coverage report → npx vitest run --coverage
    ├─ Mock setup → Mocking Patterns section below
    └─ Test infrastructure → Vitest Configuration below
```

## Test Stack
- **Unit Tests**: Vitest 4.x
- **E2E Tests**: Playwright 1.58
- **Test Location**: Co-located `__tests__/` folders + `e2e/` root folder

## Vitest (Unit Tests)

### Configuration
- Config in `vite.config.ts` (Vitest plugin)
- Same path aliases as production code

### Running Tests
```bash
npx vitest                    # Watch mode
npx vitest run                # Single run
npx vitest run --coverage     # With coverage
npx vitest run src/features/game  # Specific feature
```

### Test File Convention
```
src/features/{feature}/
├── reducers/
│   └── __tests__/
│       └── scoring.test.ts
├── services/
│   └── __tests__/
│       └── VoiceCommandParser.test.ts
└── utils/
    └── statsAggregator.test.ts
```

### Writing Unit Tests
```typescript
import { describe, it, expect, vi } from 'vitest';
import { scoringReducer } from '../scoring';

describe('scoringReducer', () => {
  it('should add a point to team A', () => {
    const state = createInitialState();
    const result = scoringReducer(state, { type: 'POINT', team: 'A' });
    expect(result.scoreA).toBe(1);
  });

  it('should detect set win at 25 with 2-point lead', () => {
    const state = { ...createInitialState(), scoreA: 24, scoreB: 22 };
    const result = scoringReducer(state, { type: 'POINT', team: 'A' });
    expect(result.setsA).toBe(1);
    expect(result.scoreA).toBe(0); // Reset for new set
  });
});
```

### What to Test (Unit)
- **Reducers**: All action types, edge cases (deuce, sudden death, match end)
- **Utilities**: Pure functions (gameLogic, balanceUtils, statsAggregator)
- **Services**: VoiceCommandParser patterns, AnalysisEngine processing
- **Hooks**: Complex logic hooks (mock dependencies with `vi.mock`)

## E2E Tests (Playwright)

For browser-based E2E testing, use the **webapp-testing** skill instead.
It covers Playwright scripts, visual regression, responsive testing, and game flow verification.

## Test Patterns

### Mocking Contexts
```typescript
import { vi } from 'vitest';

vi.mock('@contexts/LanguageContext', () => ({
  useTranslation: () => ({ t: (key: string) => key, language: 'en' }),
}));
```

### Mocking Capacitor
```typescript
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false, getPlatform: () => 'web' },
}));
```

### Mocking Firebase
```typescript
vi.mock('@lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));
```

## Priority Test Areas (Unit)
1. **Scoring reducer** — Critical business logic, must be bulletproof
2. **Voice command parser** — Many edge cases with accents/dialects
3. **Team balancing** — Algorithm correctness
4. **Stats aggregation** — Data accuracy
5. **Game logic utilities** — Pure functions with edge cases

## Key Files
- `src/features/game/reducers/__tests__/` — Reducer tests
- `src/features/voice/services/__tests__/` — Voice parser tests
- `src/features/history/utils/statsAggregator.test.ts`
- `vite.config.ts` — Vitest config
