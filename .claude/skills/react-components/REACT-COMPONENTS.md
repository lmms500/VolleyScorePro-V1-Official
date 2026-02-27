---
name: react-components
description: >
  Create new React components following VolleyScore-Pro architecture patterns. Use
  when building new UI components, feature modules, modals, screens, pages, buttons,
  cards, forms, layouts, hooks, or any React component creation/refactoring task.
---

# Component Factory — VolleyScore-Pro

## Decision Tree

```
Component need → What type?
    ├─ Full-screen page → Page template + layouts/
    ├─ Modal/dialog → Modal Template below + ui-visual-patterns
    ├─ Feature component → Feature folder structure below
    ├─ Shared UI component → src/ui/ + GlassSurface
    ├─ Custom hook → Hook Template below
    ├─ State management → State Management Decision Tree below
    └─ Animation integration → Import from animations.ts
```

You are creating components for VolleyScore-Pro, a React 19 + Vite + Tailwind CSS + Framer Motion PWA.

## Project Architecture

### Import Aliases
Always use path aliases (never relative `../../`):
```tsx
import { GlassSurface } from '@ui/GlassSurface';
import { useGameActions } from '@features/game/hooks/useGameActions';
import { useTranslation } from '@contexts/LanguageContext';
import { cn } from '@lib/utils';
```

Available aliases: `@/`, `@ui/`, `@lib/`, `@features/`, `@contexts/`, `@config/`, `@types/`

### File Organization by Feature
```
src/features/{feature-name}/
├── components/       # UI components
├── hooks/           # Feature-specific hooks
├── modals/          # Modal components
├── services/        # Business logic services
├── store/           # Zustand stores (if needed)
├── utils/           # Utility functions
├── reducers/        # useReducer reducers (if needed)
├── types/           # Feature-specific types
└── index.ts         # Barrel exports
```

### Shared UI goes in `src/ui/`
Reusable, feature-agnostic components: buttons, modals, badges, loaders.

## Component Patterns

### Standard Component Template
```tsx
import { memo } from 'react';
import { motion } from 'framer-motion';
import { GlassSurface } from '@ui/GlassSurface';
import { useTranslation } from '@contexts/LanguageContext';

interface MyComponentProps {
  // Always type props with an interface
}

export const MyComponent = memo(function MyComponent({ ...props }: MyComponentProps) {
  const { t } = useTranslation();

  return (
    <GlassSurface intensity="medium" className="p-r-4">
      {/* content */}
    </GlassSurface>
  );
});
```

### Modal Template
```tsx
import { Modal } from '@ui/Modal';
import { ModalHeader } from '@ui/ModalHeader';
import { GlassSurface } from '@ui/GlassSurface';

interface MyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyModal({ isOpen, onClose }: MyModalProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={t('modal.title')} onClose={onClose} />
      <div className="p-r-4 space-y-r-3">
        {/* content */}
      </div>
    </Modal>
  );
}
```

### Hook Template
```tsx
import { useState, useCallback, useMemo } from 'react';

export function useMyFeature() {
  // State
  const [data, setData] = useState<MyType | null>(null);

  // Memoized computations
  const derived = useMemo(() => /* ... */, [data]);

  // Stable callbacks
  const action = useCallback(() => {
    // ...
  }, []);

  return { data, derived, action };
}
```

## Key Conventions

1. **memo() for list items and frequently re-rendered components**
2. **useCallback for event handlers passed to children**
3. **useMemo for expensive computations**
4. **Separate hot/cold contexts** — Score updates are hot path, roster is cold
5. **Framer Motion variants** — Use existing variants from `@lib/utils/animations.ts`
6. **Icons from lucide-react** — `import { Icon } from 'lucide-react'`
7. **Translations** — All user-facing strings via `t('key')` from LanguageContext
8. **Responsive** — Use `r-*` spacing, test portrait + landscape

## State Management Decision Tree

- **UI-local state** → `useState`
- **Complex local state** → `useReducer`
- **Feature data (persist across components)** → Zustand store
- **App-wide state (auth, theme, game)** → React Context
- **Game scoring** → `GameContext` with `gameReducer`

## Animation Integration
```tsx
import { scoutSpring, scoutSlideVariants } from '@lib/utils/animations';

// Use predefined springs
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={scoutSpring}
/>

// Or use variants
<motion.div variants={scoutSlideVariants} initial="hidden" animate="visible" />
```

## Types
Core domain types in `src/@types/domain.ts`:
- `Team`, `Player`, `PlayerProfile`
- `GameState`, `GameConfig`, `GameMode`
- `ActionLog`, `MatchHistory`

## Don'ts
- Don't create new CSS files — use Tailwind utilities
- Don't add external dependencies without justification
- Don't bypass the design system (use GlassSurface, designTokens)
- Don't use `any` type — always provide proper TypeScript types
- Don't create god components — split into focused pieces
