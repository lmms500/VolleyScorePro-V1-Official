---
name: architecture
description: Architecture decision records (ADR), system design, and structural planning for VolleyScore-Pro. Use when making architectural decisions, designing new features end-to-end, planning data flow, choosing between implementation approaches, or documenting technical decisions for the project.
---

# Architecture & ADR

## Decision Tree

```
Architecture need → What type?
    ├─ New feature design → End-to-end design template below
    ├─ Technical decision → Write ADR
    ├─ Refactoring plan → Analyze impact + migration plan
    ├─ Performance architecture → Check performance skill + this
    └─ Data flow design → State flow diagram
```

## Architecture Decision Record (ADR) Template

Store ADRs in `docs/adr/` (create if needed):

```markdown
# ADR-{NNN}: {Title}

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-{NNN}

## Context
What is the issue? What forces are at play?

## Decision
What was decided and why.

## Consequences
### Positive
- ...
### Negative
- ...
### Risks
- ...
```

## VolleyScore-Pro Architecture Overview

```
┌─────────────────────────────────────────┐
│              Pages (routes)              │
├─────────────────────────────────────────┤
│         Feature Modules                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ │
│  │ Game │ │Voice │ │Teams │ │History │ │
│  │      │ │      │ │      │ │        │ │
│  └──┬───┘ └──┬───┘ └──┬───┘ └───┬────┘ │
│     │        │        │         │       │
├─────┼────────┼────────┼─────────┼───────┤
│     │   Shared UI (GlassSurface,        │
│     │   Modal, Button, designTokens)    │
├─────┼────────┼────────┼─────────┼───────┤
│     │   Contexts & State                │
│     │   (11 React Contexts + stores)    │
├─────┼────────┼────────┼─────────┼───────┤
│     │   Lib / Services                  │
│     │   (Firebase, Audio, Storage,      │
│     │    Haptics, Platform, PWA)        │
├─────┼────────┼────────┼─────────┼───────┤
│     │   Capacitor / Native              │
└─────┴────────┴────────┴─────────┴───────┘
```

## Feature Design Template

When designing a new feature end-to-end:

### 1. Requirements
- What does the feature do?
- Who uses it? (player, spectator, referee)
- What game modes does it apply to?

### 2. Data Model
- What state is needed?
- Where does it live? (local state, context, Firestore)
- What's the data shape (TypeScript interface)?

### 3. Components
- What UI components are needed?
- Which existing components can be reused?
- What modals/overlays are needed?

### 4. State Flow
```
User Action → Event Handler → Reducer/Store → State Update → Re-render
                                    ↓
                              Side Effects (Firebase, Analytics, Haptics)
```

### 5. Integration Points
- Which existing contexts need access?
- Does it need i18n strings?
- Does it affect game flow/scoring?
- Does it need voice commands?
- Does it need offline support?

### 6. File Structure
```
src/features/{feature-name}/
├── components/    — UI components
├── hooks/         — Custom hooks
├── modals/        — Modal components
├── services/      — API/Firebase calls
├── store/         — State management
├── reducers/      — Reducer logic
├── utils/         — Helper functions
└── index.ts       — Public exports
```

## Key Architectural Principles

1. **Feature modules are self-contained** — Each feature in `src/features/` owns its components, hooks, state, and services
2. **Shared UI is in `src/ui/`** — Reusable components that aren't feature-specific
3. **Contexts for cross-cutting concerns** — Performance, Theme, Auth, Game state, etc.
4. **Path aliases** — Always use `@ui/`, `@features/`, `@lib/`, `@contexts/`, `@config/`
5. **Progressive enhancement** — Features degrade gracefully on low-end devices (PerformanceContext)
6. **Offline-first** — Core game functionality works without network

## When to Write an ADR

- Choosing between libraries/frameworks
- Changing data model or state management approach
- Adding a new external service integration
- Changing build/deploy pipeline
- Any decision that affects multiple features
- Any decision that's hard to reverse
