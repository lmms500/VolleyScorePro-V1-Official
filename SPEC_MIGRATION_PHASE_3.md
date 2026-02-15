# SPEC - Fase 3: Migração Final (Core Features)

> **Status:** ESPECIFICAÇÃO TÉCNICA
> **Data:** 2026-02-15
> **Autor:** Arquiteto de Software
> **Risco:** ALTO (move GameContext, useVolleyGame, reducers)
> **Pré-requisito:** Fases 1 e 2 concluídas com sucesso
> **Total de Arquivos:** ~85 arquivos migrados

---

## 1. Resumo Executivo

Esta é a **fase final** da migração estrutural do VolleyScore Pro.
Move todos os arquivos "core" restantes de `src/components/`, `src/hooks/`, `src/contexts/`, `src/reducers/`, `src/stores/`, `src/services/` e `src/utils/` para suas respectivas pastas dentro de `src/features/`.

Ao final desta fase, as pastas legadas (`src/components/`, `src/hooks/` parcial, `src/reducers/`, `src/stores/`, `src/services/`, `src/utils/`) serão **removidas** se estiverem vazias.

---

## 2. Escopo da Migração

### 2.1 Feature: Teams (19 arquivos)

| Tipo | Arquivo Atual | Novo Destino |
|------|---------------|--------------|
| **component** | `components/PlayerCard.tsx` | `features/teams/components/PlayerCard.tsx` |
| **component** | `components/TeamManager/AddPlayerForm.tsx` | `features/teams/components/AddPlayerForm.tsx` |
| **component** | `components/TeamManager/BenchArea.tsx` | `features/teams/components/BenchArea.tsx` |
| **component** | `components/TeamManager/PlayerContextMenu.tsx` | `features/teams/components/PlayerContextMenu.tsx` |
| **component** | `components/TeamManager/PlayerListItem.tsx` | `features/teams/components/PlayerListItem.tsx` |
| **component** | `components/TeamManager/ProfileCard.tsx` | `features/teams/components/ProfileCard.tsx` |
| **component** | `components/TeamManager/RosterBoard.tsx` | `features/teams/components/RosterBoard.tsx` |
| **component** | `components/TeamManager/RosterColumn.tsx` | `features/teams/components/RosterColumn.tsx` |
| **component** | `components/TeamManager/TeamColumn.tsx` | `features/teams/components/TeamColumn.tsx` |
| **component** | `components/TeamManager/TeamManagerUI.tsx` | `features/teams/components/TeamManagerUI.tsx` |
| **modal** | `components/modals/TeamManagerModal.tsx` | `features/teams/modals/TeamManagerModal.tsx` |
| **modal** | `components/modals/ProfileCreationModal.tsx` | `features/teams/modals/ProfileCreationModal.tsx` |
| **modal** | `components/modals/ProfileDetailsModal.tsx` | `features/teams/modals/ProfileDetailsModal.tsx` |
| **modal** | `components/modals/SubstitutionModal.tsx` | `features/teams/modals/SubstitutionModal.tsx` |
| **modal** | `components/modals/TeamStatsModal.tsx` | `features/teams/modals/TeamStatsModal.tsx` |
| **hook** | `hooks/useTeamGenerator.ts` | `features/teams/hooks/useTeamGenerator.ts` |
| **hook** | `hooks/usePlayerProfiles.ts` | `features/teams/hooks/usePlayerProfiles.ts` |
| **store** | `stores/rosterStore.ts` | `features/teams/store/rosterStore.ts` |
| **util** | `utils/rosterLogic.ts` | `features/teams/utils/rosterLogic.ts` |

### 2.2 Feature: Court (5 arquivos)

| Tipo | Arquivo Atual | Novo Destino |
|------|---------------|--------------|
| **component** | `components/Court/CourtLayout.tsx` | `features/court/components/CourtLayout.tsx` |
| **component** | `components/Court/VolleyballCourt.tsx` | `features/court/components/VolleyballCourt.tsx` |
| **component** | `components/Court/CourtHeader.tsx` | `features/court/components/CourtHeader.tsx` |
| **component** | `components/Court/CourtFooter.tsx` | `features/court/components/CourtFooter.tsx` |
| **modal** | `components/modals/CourtModal.tsx` | `features/court/modals/CourtModal.tsx` |

### 2.3 Feature: Broadcast (13 arquivos)

| Tipo | Arquivo Atual | Novo Destino |
|------|---------------|--------------|
| **screen** | `screens/BroadcastScreen.tsx` | `features/broadcast/screens/BroadcastScreen.tsx` |
| **component** | `components/Broadcast/BroadcastOverlay.tsx` | `features/broadcast/components/BroadcastOverlay.tsx` |
| **component** | `components/Broadcast/ObsScoreDisplay.tsx` | `features/broadcast/components/ObsScoreDisplay.tsx` |
| **modal** | `components/modals/LiveSyncModal.tsx` | `features/broadcast/modals/LiveSyncModal.tsx` |
| **hook** | `hooks/useSpectatorSync.ts` | `features/broadcast/hooks/useSpectatorSync.ts` |
| **hook** | `hooks/useSpectatorCount.ts` | `features/broadcast/hooks/useSpectatorCount.ts` |
| **hook** | `hooks/useRemoteTimeoutSync.ts` | `features/broadcast/hooks/useRemoteTimeoutSync.ts` |
| **hook** | `hooks/useTimeoutSync.ts` | `features/broadcast/hooks/useTimeoutSync.ts` |
| **hook** | `hooks/useTimerSync.ts` | `features/broadcast/hooks/useTimerSync.ts` |
| **hook** | `hooks/useSyncManager.ts` | `features/broadcast/hooks/useSyncManager.ts` |
| **service** | `services/SyncEngine.ts` | `features/broadcast/services/SyncEngine.ts` |
| **service** | `services/SyncService.ts` | `features/broadcast/services/SyncService.ts` |
| **service** | `services/TimeoutSyncService.ts` | `features/broadcast/services/TimeoutSyncService.ts` |

### 2.4 Feature: Game — CORE (47 arquivos)

| Tipo | Arquivo Atual | Novo Destino |
|------|---------------|--------------|
| **screen** | `screens/GameScreen.tsx` | `features/game/screens/GameScreen.tsx` |
| **screen** | `screens/index.ts` | `features/game/screens/index.ts` |
| **component** | `components/ScoreCardFullscreen.tsx` | `features/game/components/ScoreCardFullscreen.tsx` |
| **component** | `components/ScoreCardNormal.tsx` | `features/game/components/ScoreCardNormal.tsx` |
| **component** | `components/containers/ScoreCardContainer.tsx` | `features/game/components/ScoreCardContainer.tsx` |
| **component** | `components/Controls.tsx` | `features/game/components/Controls.tsx` |
| **component** | `components/HistoryBar.tsx` | `features/game/components/HistoryBar.tsx` |
| **component** | `components/MeasuredFullscreenHUD.tsx` | `features/game/components/MeasuredFullscreenHUD.tsx` |
| **component** | `components/Fullscreen/FloatingControlBar.tsx` | `features/game/components/FloatingControlBar.tsx` |
| **component** | `components/Fullscreen/FloatingTopBar.tsx` | `features/game/components/FloatingTopBar.tsx` |
| **component** | `components/Fullscreen/FullscreenMenuDrawer.tsx` | `features/game/components/FullscreenMenuDrawer.tsx` |
| **component** | `components/Fullscreen/TimeoutOverlay.tsx` | `features/game/components/TimeoutOverlay.tsx` |
| **modal** | `components/modals/MatchOverModal.tsx` | `features/game/modals/MatchOverModal.tsx` |
| **modal** | `components/modals/ScoutModal.tsx` | `features/game/modals/ScoutModal.tsx` |
| **modal** | `components/modals/ConfirmationModal.tsx` | `features/game/modals/ConfirmationModal.tsx` |
| **modal** | `components/modals/ModalManager.tsx` | `features/game/modals/ModalManager.tsx` |
| **context** | `contexts/GameContext.tsx` | `features/game/context/GameContext.tsx` |
| **context** | `contexts/TimerContext.tsx` | `features/game/context/TimerContext.tsx` |
| **context** | `contexts/TimeoutContext.tsx` | `features/game/context/TimeoutContext.tsx` |
| **hook** | `hooks/useVolleyGame.ts` | `features/game/hooks/useVolleyGame.ts` |
| **hook** | `hooks/useGameState.ts` | `features/game/hooks/useGameState.ts` |
| **hook** | `hooks/useGameActions.ts` | `features/game/hooks/useGameActions.ts` |
| **hook** | `hooks/useGameHandlers.ts` | `features/game/hooks/useGameHandlers.ts` |
| **hook** | `hooks/useGamePersistence.ts` | `features/game/hooks/useGamePersistence.ts` |
| **hook** | `hooks/useGameAudio.ts` | `features/game/hooks/useGameAudio.ts` |
| **hook** | `hooks/useScoreCardLogic.ts` | `features/game/hooks/useScoreCardLogic.ts` |
| **hook** | `hooks/useScoreGestures.ts` | `features/game/hooks/useScoreGestures.ts` |
| **hook** | `hooks/useScoreAnnouncer.ts` | `features/game/hooks/useScoreAnnouncer.ts` |
| **hook** | `hooks/useSensoryFX.ts` | `features/game/hooks/useSensoryFX.ts` |
| **hook** | `hooks/useMatchLifecycle.ts` | `features/game/hooks/useMatchLifecycle.ts` |
| **hook** | `hooks/useMatchSaver.ts` | `features/game/hooks/useMatchSaver.ts` |
| **hook** | `hooks/useHorizontalPages.ts` | `features/game/hooks/useHorizontalPages.ts` |
| **hook** | `hooks/useHudMeasure.ts` | `features/game/hooks/useHudMeasure.ts` |
| **hook** | `hooks/useCollider.ts` | `features/game/hooks/useCollider.ts` |
| **hook** | `hooks/useActiveTimeout.ts` | `features/game/hooks/useActiveTimeout.ts` |
| **hook** | `hooks/useTimeoutManager.ts` | `features/game/hooks/useTimeoutManager.ts` |
| **hook** | `hooks/useDynamicColorStyle.ts` | `features/game/hooks/useDynamicColorStyle.ts` |
| **hook** | `hooks/useAdaptiveAnimation.ts` | `features/game/hooks/useAdaptiveAnimation.ts` |
| **hook** | `hooks/useElementSize.ts` | `features/game/hooks/useElementSize.ts` |
| **hook** | `hooks/useCombinedGameState.ts` | `features/game/hooks/useCombinedGameState.ts` |
| **reducer** | `reducers/gameReducer.ts` | `features/game/reducers/gameReducer.ts` |
| **reducer** | `reducers/meta.ts` | `features/game/reducers/meta.ts` |
| **reducer** | `reducers/roster.ts` | `features/game/reducers/roster.ts` |
| **reducer** | `reducers/scoring.ts` | `features/game/reducers/scoring.ts` |
| **test** | `reducers/__tests__/ghost_teams_repro.test.ts` | `features/game/reducers/__tests__/ghost_teams_repro.test.ts` |
| **util** | `utils/gameLogic.ts` | `features/game/utils/gameLogic.ts` |
| **util** | `utils/balanceUtils.ts` | `features/game/utils/balanceUtils.ts` |

### 2.5 Serviço Residual: PDFService (1 arquivo)

| Tipo | Arquivo Atual | Novo Destino |
|------|---------------|--------------|
| **service** | `services/PDFService.ts` | `features/history/services/PDFService.ts` |

> Conforme PRD, PDFService pertence à feature History (exportação de relatórios).

---

## 3. Arquivos que PERMANECEM (NÃO migram)

### 3.1 Contextos Globais (`src/contexts/` — 8 arquivos ficam)

| Arquivo | Justificativa |
|---------|---------------|
| `AuthContext.tsx` | Cross-feature (autenticação global) |
| `LanguageContext.tsx` | Cross-feature (54 importadores) |
| `LayoutContext.tsx` | Cross-feature (layout global) |
| `ModalContext.tsx` | Cross-feature (~12 importadores) |
| `NotificationContext.tsx` | Cross-feature (~12 importadores) |
| `PerformanceContext.tsx` | Cross-feature (performance global) |
| `ResponsiveContext.tsx` | Cross-feature (responsividade) |
| `ThemeContext.tsx` | Cross-feature (tema global) |

### 3.2 Hook Global (`src/hooks/` — 1 arquivo fica)

| Arquivo | Justificativa |
|---------|---------------|
| `usePerformanceMonitor.ts` | Hook de infra global, sem domínio específico |

---

## 4. Análise de Risco Detalhada

### 4.1 Arquivos de RISCO CRÍTICO

| Arquivo | Importadores Estimados | Mitigação |
|---------|----------------------|-----------|
| `contexts/GameContext.tsx` | ~27 arquivos | Criar re-export temporário em `src/contexts/GameContext.tsx` que aponta para `@features/game/context/GameContext`. Remover apenas na fase de cleanup. |
| `hooks/useVolleyGame.ts` | ~5 arquivos | Poucos importadores diretos, risco controlado. |
| `reducers/gameReducer.ts` | ~3 arquivos | Importado por GameContext e testes. Risco baixo se GameContext migra junto. |
| `stores/rosterStore.ts` | ~8 arquivos | Usado por teams + game. Criar alias `@features/teams/store/rosterStore`. |
| `utils/gameLogic.ts` | ~5 arquivos | Usado por reducers e hooks de game. Migram juntos, risco baixo. |

### 4.2 Estratégia de Re-exports Temporários

Para os 3 contextos migrados (`GameContext`, `TimerContext`, `TimeoutContext`), o script cria **re-exports temporários** nos paths originais:

```typescript
// src/contexts/GameContext.tsx (re-export temporário)
export { GameProvider, useGame, useActions, useScore, useRoster } from '@features/game/context/GameContext';
```

Isso garante que qualquer import não atualizado pelo script continue funcionando. Esses re-exports devem ser removidos em um cleanup posterior.

### 4.3 Dependências Cross-Feature

| De → Para | Tipo | Resolução |
|-----------|------|-----------|
| `teams` → `game` | TeamManagerModal usa GameContext | Import via `@features/game/context/GameContext` |
| `broadcast` → `game` | Sync hooks leem GameContext | Import via `@features/game/context/GameContext` |
| `court` → `game` | CourtLayout usa GameContext | Import via `@features/game/context/GameContext` |
| `game` → `teams` | Reducers usam rosterLogic | Import via `@features/teams/utils/rosterLogic` |
| `game` → `teams` | ModalManager importa TeamManagerModal | Import via `@features/teams/modals/TeamManagerModal` |
| `history` → `game` | historyStore usa tipos de game | Import via `@types` (tipos compartilhados) |

---

## 5. Ordem de Execução Interna

A migração dentro desta fase segue uma ordem específica para minimizar quebras:

1. **PDFService** → `features/history/services/` (1 arquivo isolado)
2. **Teams** → `features/teams/` (19 arquivos, dependência de game é via context)
3. **Court** → `features/court/` (5 arquivos, menor blast radius)
4. **Broadcast** → `features/broadcast/` (13 arquivos, depende de game)
5. **Game** → `features/game/` (47 arquivos, **ÚLTIMO** — maior blast radius)
6. **Re-exports temporários** para GameContext, TimerContext, TimeoutContext
7. **Atualização global de imports** em todos os arquivos `.ts/.tsx`
8. **Limpeza de diretórios vazios**

---

## 6. Script de Migração

### `scripts/migrate-phase-3.cjs`

```javascript
#!/usr/bin/env node
/**
 * Migration Script - Phase 3: Core Features (Final)
 *
 * Migrates Teams, Court, Broadcast, Game features + PDFService
 * to the new src/features/ structure.
 *
 * Usage:
 *   node scripts/migrate-phase-3.cjs [--dry-run] [--verbose]
 *
 * Options:
 *   --dry-run    Simulate migration without making changes
 *   --verbose    Show detailed logging
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// ============================================================================
// CONFIGURATION
// ============================================================================

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

/**
 * Migration map: featureName -> { subdir: [relative paths from src/] }
 * Order matters: teams/court/broadcast first, game last.
 */
const MIGRATION_MAP = {
  // PDFService residual → history (1 file)
  history: {
    services: ['services/PDFService.ts'],
  },

  // Teams (19 files)
  teams: {
    components: [
      'components/PlayerCard.tsx',
      'components/TeamManager/AddPlayerForm.tsx',
      'components/TeamManager/BenchArea.tsx',
      'components/TeamManager/PlayerContextMenu.tsx',
      'components/TeamManager/PlayerListItem.tsx',
      'components/TeamManager/ProfileCard.tsx',
      'components/TeamManager/RosterBoard.tsx',
      'components/TeamManager/RosterColumn.tsx',
      'components/TeamManager/TeamColumn.tsx',
      'components/TeamManager/TeamManagerUI.tsx',
    ],
    modals: [
      'components/modals/TeamManagerModal.tsx',
      'components/modals/ProfileCreationModal.tsx',
      'components/modals/ProfileDetailsModal.tsx',
      'components/modals/SubstitutionModal.tsx',
      'components/modals/TeamStatsModal.tsx',
    ],
    hooks: [
      'hooks/useTeamGenerator.ts',
      'hooks/usePlayerProfiles.ts',
    ],
    store: ['stores/rosterStore.ts'],
    utils: ['utils/rosterLogic.ts'],
  },

  // Court (5 files)
  court: {
    components: [
      'components/Court/CourtLayout.tsx',
      'components/Court/VolleyballCourt.tsx',
      'components/Court/CourtHeader.tsx',
      'components/Court/CourtFooter.tsx',
    ],
    modals: ['components/modals/CourtModal.tsx'],
  },

  // Broadcast (13 files)
  broadcast: {
    screens: ['screens/BroadcastScreen.tsx'],
    components: [
      'components/Broadcast/BroadcastOverlay.tsx',
      'components/Broadcast/ObsScoreDisplay.tsx',
    ],
    modals: ['components/modals/LiveSyncModal.tsx'],
    hooks: [
      'hooks/useSpectatorSync.ts',
      'hooks/useSpectatorCount.ts',
      'hooks/useRemoteTimeoutSync.ts',
      'hooks/useTimeoutSync.ts',
      'hooks/useTimerSync.ts',
      'hooks/useSyncManager.ts',
    ],
    services: [
      'services/SyncEngine.ts',
      'services/SyncService.ts',
      'services/TimeoutSyncService.ts',
    ],
  },

  // Game - CORE (47 files) — LAST
  game: {
    screens: [
      'screens/GameScreen.tsx',
      'screens/index.ts',
    ],
    components: [
      'components/ScoreCardFullscreen.tsx',
      'components/ScoreCardNormal.tsx',
      'components/containers/ScoreCardContainer.tsx',
      'components/Controls.tsx',
      'components/HistoryBar.tsx',
      'components/MeasuredFullscreenHUD.tsx',
      'components/Fullscreen/FloatingControlBar.tsx',
      'components/Fullscreen/FloatingTopBar.tsx',
      'components/Fullscreen/FullscreenMenuDrawer.tsx',
      'components/Fullscreen/TimeoutOverlay.tsx',
    ],
    modals: [
      'components/modals/MatchOverModal.tsx',
      'components/modals/ScoutModal.tsx',
      'components/modals/ConfirmationModal.tsx',
      'components/modals/ModalManager.tsx',
    ],
    context: [
      'contexts/GameContext.tsx',
      'contexts/TimerContext.tsx',
      'contexts/TimeoutContext.tsx',
    ],
    hooks: [
      'hooks/useVolleyGame.ts',
      'hooks/useGameState.ts',
      'hooks/useGameActions.ts',
      'hooks/useGameHandlers.ts',
      'hooks/useGamePersistence.ts',
      'hooks/useGameAudio.ts',
      'hooks/useScoreCardLogic.ts',
      'hooks/useScoreGestures.ts',
      'hooks/useScoreAnnouncer.ts',
      'hooks/useSensoryFX.ts',
      'hooks/useMatchLifecycle.ts',
      'hooks/useMatchSaver.ts',
      'hooks/useHorizontalPages.ts',
      'hooks/useHudMeasure.ts',
      'hooks/useCollider.ts',
      'hooks/useActiveTimeout.ts',
      'hooks/useTimeoutManager.ts',
      'hooks/useDynamicColorStyle.ts',
      'hooks/useAdaptiveAnimation.ts',
      'hooks/useElementSize.ts',
      'hooks/useCombinedGameState.ts',
    ],
    reducers: [
      'reducers/gameReducer.ts',
      'reducers/meta.ts',
      'reducers/roster.ts',
      'reducers/scoring.ts',
    ],
    'reducers/__tests__': [
      'reducers/__tests__/ghost_teams_repro.test.ts',
    ],
    utils: [
      'utils/gameLogic.ts',
      'utils/balanceUtils.ts',
    ],
  },
};

/**
 * Re-export stubs to create at old paths for backward compatibility.
 * These prevent breakage from imports not caught by the regex updater.
 * Key = old path (relative to src/), Value = content of re-export file.
 */
const RE_EXPORTS = {
  'contexts/GameContext.tsx': `// Re-export temporário — remover após validação completa
export { GameProvider, useGame, useActions, useScore, useRoster } from '@features/game/context/GameContext';
`,
  'contexts/TimerContext.tsx': `// Re-export temporário — remover após validação completa
export { TimerProvider, useTimer } from '@features/game/context/TimerContext';
`,
  'contexts/TimeoutContext.tsx': `// Re-export temporário — remover após validação completa
export { TimeoutProvider, useTimeoutContext } from '@features/game/context/TimeoutContext';
`,
};

/**
 * Master import replacement map.
 * Applied globally to ALL .ts/.tsx files after physical moves.
 * Key = regex-safe old import path segment, Value = new alias path.
 *
 * Order matters: more specific patterns first.
 */
const IMPORT_REPLACEMENTS = [
  // ── Game Contexts (CRITICAL — highest import count) ──
  { pattern: /from ['"](\.\.\/)*(contexts\/GameContext|\.\/GameContext)['"](?!.*re-export)/g, replacement: "from '@features/game/context/GameContext'" },
  { pattern: /from ['"](\.\.\/)*(contexts\/TimerContext|\.\/TimerContext)['"](?!.*re-export)/g, replacement: "from '@features/game/context/TimerContext'" },
  { pattern: /from ['"](\.\.\/)*(contexts\/TimeoutContext|\.\/TimeoutContext)['"](?!.*re-export)/g, replacement: "from '@features/game/context/TimeoutContext'" },

  // ── Game Reducers ──
  { pattern: /from ['"](\.\.\/)*reducers\/gameReducer['"]/g, replacement: "from '@features/game/reducers/gameReducer'" },
  { pattern: /from ['"](\.\.\/)*reducers\/meta['"]/g, replacement: "from '@features/game/reducers/meta'" },
  { pattern: /from ['"](\.\.\/)*reducers\/roster['"]/g, replacement: "from '@features/game/reducers/roster'" },
  { pattern: /from ['"](\.\.\/)*reducers\/scoring['"]/g, replacement: "from '@features/game/reducers/scoring'" },

  // ── Game Screens ──
  { pattern: /from ['"](\.\.\/)*screens\/GameScreen['"]/g, replacement: "from '@features/game/screens/GameScreen'" },
  { pattern: /from ['"](\.\.\/)*screens\/index['"]/g, replacement: "from '@features/game/screens/index'" },
  { pattern: /from ['"](\.\.\/)*screens['"](?!\/)/g, replacement: "from '@features/game/screens'" },

  // ── Game Hooks ──
  { pattern: /from ['"](\.\.\/)*hooks\/useVolleyGame['"]/g, replacement: "from '@features/game/hooks/useVolleyGame'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameState['"]/g, replacement: "from '@features/game/hooks/useGameState'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameActions['"]/g, replacement: "from '@features/game/hooks/useGameActions'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameHandlers['"]/g, replacement: "from '@features/game/hooks/useGameHandlers'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGamePersistence['"]/g, replacement: "from '@features/game/hooks/useGamePersistence'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useGameAudio['"]/g, replacement: "from '@features/game/hooks/useGameAudio'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useScoreCardLogic['"]/g, replacement: "from '@features/game/hooks/useScoreCardLogic'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useScoreGestures['"]/g, replacement: "from '@features/game/hooks/useScoreGestures'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useScoreAnnouncer['"]/g, replacement: "from '@features/game/hooks/useScoreAnnouncer'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useSensoryFX['"]/g, replacement: "from '@features/game/hooks/useSensoryFX'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useMatchLifecycle['"]/g, replacement: "from '@features/game/hooks/useMatchLifecycle'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useMatchSaver['"]/g, replacement: "from '@features/game/hooks/useMatchSaver'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useHorizontalPages['"]/g, replacement: "from '@features/game/hooks/useHorizontalPages'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useHudMeasure['"]/g, replacement: "from '@features/game/hooks/useHudMeasure'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useCollider['"]/g, replacement: "from '@features/game/hooks/useCollider'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useActiveTimeout['"]/g, replacement: "from '@features/game/hooks/useActiveTimeout'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useTimeoutManager['"]/g, replacement: "from '@features/game/hooks/useTimeoutManager'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useDynamicColorStyle['"]/g, replacement: "from '@features/game/hooks/useDynamicColorStyle'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useAdaptiveAnimation['"]/g, replacement: "from '@features/game/hooks/useAdaptiveAnimation'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useElementSize['"]/g, replacement: "from '@features/game/hooks/useElementSize'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useCombinedGameState['"]/g, replacement: "from '@features/game/hooks/useCombinedGameState'" },

  // ── Game Utils ──
  { pattern: /from ['"](\.\.\/)*utils\/gameLogic['"]/g, replacement: "from '@features/game/utils/gameLogic'" },
  { pattern: /from ['"](\.\.\/)*utils\/balanceUtils['"]/g, replacement: "from '@features/game/utils/balanceUtils'" },

  // ── Game Components (root-level) ──
  { pattern: /from ['"](\.\.\/)*components\/ScoreCardFullscreen['"]/g, replacement: "from '@features/game/components/ScoreCardFullscreen'" },
  { pattern: /from ['"](\.\.\/)*components\/ScoreCardNormal['"]/g, replacement: "from '@features/game/components/ScoreCardNormal'" },
  { pattern: /from ['"](\.\.\/)*components\/Controls['"]/g, replacement: "from '@features/game/components/Controls'" },
  { pattern: /from ['"](\.\.\/)*components\/HistoryBar['"]/g, replacement: "from '@features/game/components/HistoryBar'" },
  { pattern: /from ['"](\.\.\/)*components\/MeasuredFullscreenHUD['"]/g, replacement: "from '@features/game/components/MeasuredFullscreenHUD'" },
  { pattern: /from ['"](\.\.\/)*components\/PlayerCard['"]/g, replacement: "from '@features/teams/components/PlayerCard'" },
  { pattern: /from ['"](\.\.\/)*components\/containers\/ScoreCardContainer['"]/g, replacement: "from '@features/game/components/ScoreCardContainer'" },

  // ── Game Fullscreen Components ──
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/FloatingControlBar['"]/g, replacement: "from '@features/game/components/FloatingControlBar'" },
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/FloatingTopBar['"]/g, replacement: "from '@features/game/components/FloatingTopBar'" },
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/FullscreenMenuDrawer['"]/g, replacement: "from '@features/game/components/FullscreenMenuDrawer'" },
  { pattern: /from ['"](\.\.\/)*components\/Fullscreen\/TimeoutOverlay['"]/g, replacement: "from '@features/game/components/TimeoutOverlay'" },
  // Relative shorthand (from within Fullscreen/)
  { pattern: /from ['"]\.\/FloatingControlBar['"]/g, replacement: "from '@features/game/components/FloatingControlBar'" },
  { pattern: /from ['"]\.\/FloatingTopBar['"]/g, replacement: "from '@features/game/components/FloatingTopBar'" },
  { pattern: /from ['"]\.\/FullscreenMenuDrawer['"]/g, replacement: "from '@features/game/components/FullscreenMenuDrawer'" },
  { pattern: /from ['"]\.\/TimeoutOverlay['"]/g, replacement: "from '@features/game/components/TimeoutOverlay'" },

  // ── Game Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/MatchOverModal['"]/g, replacement: "from '@features/game/modals/MatchOverModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ScoutModal['"]/g, replacement: "from '@features/game/modals/ScoutModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ConfirmationModal['"]/g, replacement: "from '@features/game/modals/ConfirmationModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ModalManager['"]/g, replacement: "from '@features/game/modals/ModalManager'" },

  // ── Teams Components ──
  { pattern: /from ['"](\.\.\/)*components\/TeamManager\/(\w+)['"]/g, replacement: "from '@features/teams/components/$2'" },
  // Relative shorthand (from within TeamManager/)
  { pattern: /from ['"]\.\/AddPlayerForm['"]/g, replacement: "from '@features/teams/components/AddPlayerForm'" },
  { pattern: /from ['"]\.\/BenchArea['"]/g, replacement: "from '@features/teams/components/BenchArea'" },
  { pattern: /from ['"]\.\/PlayerContextMenu['"]/g, replacement: "from '@features/teams/components/PlayerContextMenu'" },
  { pattern: /from ['"]\.\/PlayerListItem['"]/g, replacement: "from '@features/teams/components/PlayerListItem'" },
  { pattern: /from ['"]\.\/ProfileCard['"]/g, replacement: "from '@features/teams/components/ProfileCard'" },
  { pattern: /from ['"]\.\/RosterBoard['"]/g, replacement: "from '@features/teams/components/RosterBoard'" },
  { pattern: /from ['"]\.\/RosterColumn['"]/g, replacement: "from '@features/teams/components/RosterColumn'" },
  { pattern: /from ['"]\.\/TeamColumn['"]/g, replacement: "from '@features/teams/components/TeamColumn'" },
  { pattern: /from ['"]\.\/TeamManagerUI['"]/g, replacement: "from '@features/teams/components/TeamManagerUI'" },

  // ── Teams Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/TeamManagerModal['"]/g, replacement: "from '@features/teams/modals/TeamManagerModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ProfileCreationModal['"]/g, replacement: "from '@features/teams/modals/ProfileCreationModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/ProfileDetailsModal['"]/g, replacement: "from '@features/teams/modals/ProfileDetailsModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/SubstitutionModal['"]/g, replacement: "from '@features/teams/modals/SubstitutionModal'" },
  { pattern: /from ['"](\.\.\/)*components\/modals\/TeamStatsModal['"]/g, replacement: "from '@features/teams/modals/TeamStatsModal'" },

  // ── Teams Hooks ──
  { pattern: /from ['"](\.\.\/)*hooks\/useTeamGenerator['"]/g, replacement: "from '@features/teams/hooks/useTeamGenerator'" },
  { pattern: /from ['"](\.\.\/)*hooks\/usePlayerProfiles['"]/g, replacement: "from '@features/teams/hooks/usePlayerProfiles'" },

  // ── Teams Store ──
  { pattern: /from ['"](\.\.\/)*stores\/rosterStore['"]/g, replacement: "from '@features/teams/store/rosterStore'" },

  // ── Teams Utils ──
  { pattern: /from ['"](\.\.\/)*utils\/rosterLogic['"]/g, replacement: "from '@features/teams/utils/rosterLogic'" },

  // ── Court Components ──
  { pattern: /from ['"](\.\.\/)*components\/Court\/(\w+)['"]/g, replacement: "from '@features/court/components/$2'" },
  // Relative shorthand (from within Court/)
  { pattern: /from ['"]\.\/CourtLayout['"]/g, replacement: "from '@features/court/components/CourtLayout'" },
  { pattern: /from ['"]\.\/VolleyballCourt['"]/g, replacement: "from '@features/court/components/VolleyballCourt'" },
  { pattern: /from ['"]\.\/CourtHeader['"]/g, replacement: "from '@features/court/components/CourtHeader'" },
  { pattern: /from ['"]\.\/CourtFooter['"]/g, replacement: "from '@features/court/components/CourtFooter'" },

  // ── Court Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/CourtModal['"]/g, replacement: "from '@features/court/modals/CourtModal'" },

  // ── Broadcast Screen ──
  { pattern: /from ['"](\.\.\/)*screens\/BroadcastScreen['"]/g, replacement: "from '@features/broadcast/screens/BroadcastScreen'" },

  // ── Broadcast Components ──
  { pattern: /from ['"](\.\.\/)*components\/Broadcast\/(\w+)['"]/g, replacement: "from '@features/broadcast/components/$2'" },
  { pattern: /from ['"]\.\/BroadcastOverlay['"]/g, replacement: "from '@features/broadcast/components/BroadcastOverlay'" },
  { pattern: /from ['"]\.\/ObsScoreDisplay['"]/g, replacement: "from '@features/broadcast/components/ObsScoreDisplay'" },

  // ── Broadcast Modals ──
  { pattern: /from ['"](\.\.\/)*components\/modals\/LiveSyncModal['"]/g, replacement: "from '@features/broadcast/modals/LiveSyncModal'" },

  // ── Broadcast Hooks ──
  { pattern: /from ['"](\.\.\/)*hooks\/useSpectatorSync['"]/g, replacement: "from '@features/broadcast/hooks/useSpectatorSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useSpectatorCount['"]/g, replacement: "from '@features/broadcast/hooks/useSpectatorCount'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useRemoteTimeoutSync['"]/g, replacement: "from '@features/broadcast/hooks/useRemoteTimeoutSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useTimeoutSync['"]/g, replacement: "from '@features/broadcast/hooks/useTimeoutSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useTimerSync['"]/g, replacement: "from '@features/broadcast/hooks/useTimerSync'" },
  { pattern: /from ['"](\.\.\/)*hooks\/useSyncManager['"]/g, replacement: "from '@features/broadcast/hooks/useSyncManager'" },

  // ── Broadcast Services ──
  { pattern: /from ['"](\.\.\/)*services\/SyncEngine['"]/g, replacement: "from '@features/broadcast/services/SyncEngine'" },
  { pattern: /from ['"](\.\.\/)*services\/SyncService['"]/g, replacement: "from '@features/broadcast/services/SyncService'" },
  { pattern: /from ['"](\.\.\/)*services\/TimeoutSyncService['"]/g, replacement: "from '@features/broadcast/services/TimeoutSyncService'" },

  // ── History Service (PDFService residual) ──
  { pattern: /from ['"](\.\.\/)*services\/PDFService['"]/g, replacement: "from '@features/history/services/PDFService'" },

  // ── Catch-all: remaining relative ../components/modals/ imports ──
  { pattern: /from ['"](\.\.\/)+modals\/(\w+)['"]/g, replacement: "from '@/components/modals/$2'" },

  // ── Catch-all: convert remaining deep relative imports to aliases ──
  { pattern: /from ['"](\.\.\/){3,}contexts\/(\w+)['"]/g, replacement: "from '@contexts/$2'" },
  { pattern: /from ['"](\.\.\/){3,}hooks\/(\w+)['"]/g, replacement: "from '@hooks/$2'" },
  { pattern: /from ['"](\.\.\/){3,}features\/(\S+?)['"]/g, replacement: "from '@features/$2'" },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message, type = 'info') {
  const prefix = {
    info: chalk.blue('ℹ'),
    success: chalk.green('✓'),
    warning: chalk.yellow('⚠'),
    error: chalk.red('✖'),
    section: chalk.cyan('▸'),
  }[type] || chalk.blue('ℹ');
  console.log(`${prefix} ${message}`);
}

function logVerbose(message) {
  if (VERBOSE) {
    console.log(chalk.gray(`  ${message}`));
  }
}

/**
 * Moves file from source to destination (paths relative to SRC_DIR)
 */
async function moveFile(sourcePath, destPath) {
  const absSource = path.join(SRC_DIR, sourcePath);
  const absDest = path.join(SRC_DIR, destPath);

  if (!fs.existsSync(absSource)) {
    log(`Source not found (skipping): ${sourcePath}`, 'warning');
    return false;
  }

  if (DRY_RUN) {
    log(`[DRY RUN] Would move: ${sourcePath} → ${destPath}`, 'info');
    return true;
  }

  await fs.ensureDir(path.dirname(absDest));
  await fs.move(absSource, absDest, { overwrite: false });
  logVerbose(`Moved: ${sourcePath} → ${destPath}`);
  return true;
}

/**
 * Gets all .ts/.tsx files in src/ recursively
 */
function getAllTsFiles() {
  return glob.sync('**/*.{ts,tsx}', {
    cwd: SRC_DIR,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
    absolute: false,
  });
}

/**
 * Applies IMPORT_REPLACEMENTS to a single file
 */
async function updateImportsInFile(filePath) {
  const absPath = path.join(SRC_DIR, filePath);
  if (!fs.existsSync(absPath)) return false;

  let content = await fs.readFile(absPath, 'utf-8');
  const original = content;

  for (const { pattern, replacement } of IMPORT_REPLACEMENTS) {
    // Reset regex lastIndex (important for /g regexes)
    pattern.lastIndex = 0;
    content = content.replace(pattern, replacement);
  }

  if (content !== original) {
    if (DRY_RUN) {
      logVerbose(`[DRY RUN] Would update imports in: ${filePath}`);
    } else {
      await fs.writeFile(absPath, content, 'utf-8');
      logVerbose(`Updated imports: ${filePath}`);
    }
    return true;
  }
  return false;
}

/**
 * Creates re-export stub files at old context paths
 */
async function createReExports() {
  log('\nCreating re-export stubs for backward compatibility...', 'section');

  for (const [relativePath, content] of Object.entries(RE_EXPORTS)) {
    const absPath = path.join(SRC_DIR, relativePath);

    // Only create if the original was already moved (i.e., doesn't exist)
    if (fs.existsSync(absPath)) {
      log(`Re-export skipped (original still exists): ${relativePath}`, 'warning');
      continue;
    }

    if (DRY_RUN) {
      log(`[DRY RUN] Would create re-export: ${relativePath}`, 'info');
      continue;
    }

    await fs.ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, content, 'utf-8');
    log(`Created re-export: ${relativePath}`, 'success');
  }
}

/**
 * Cleans up empty directories after migration
 */
async function cleanupEmptyDirectories() {
  log('\nCleaning up empty directories...', 'section');

  const dirsToCheck = [
    // Leaf directories first (deepest first)
    'components/TeamManager',
    'components/Court',
    'components/Broadcast',
    'components/Fullscreen',
    'components/containers',
    'components/modals',
    'components',
    'reducers/__tests__',
    'reducers',
    'stores',
    'services',
    'utils',
    'screens',
  ];

  for (const dir of dirsToCheck) {
    const absDir = path.join(SRC_DIR, dir);

    if (!fs.existsSync(absDir)) continue;

    try {
      const contents = fs.readdirSync(absDir);
      // Filter out .DS_Store and similar
      const meaningful = contents.filter(f => !f.startsWith('.'));

      if (meaningful.length === 0) {
        if (DRY_RUN) {
          log(`[DRY RUN] Would remove empty directory: ${dir}/`, 'info');
        } else {
          fs.removeSync(absDir);
          log(`Removed empty directory: ${dir}/`, 'success');
        }
      } else {
        log(`Directory not empty (${meaningful.length} files remain): ${dir}/`, 'warning');
        if (VERBOSE) {
          meaningful.forEach(f => logVerbose(`  └─ ${f}`));
        }
      }
    } catch (err) {
      log(`Error checking directory ${dir}: ${err.message}`, 'error');
    }
  }
}

// ============================================================================
// MAIN MIGRATION LOGIC
// ============================================================================

async function migrateFeature(featureName, featureConfig) {
  console.log(chalk.bold.cyan(`\n📦 Migrating feature: ${featureName}`));

  let movedCount = 0;
  let skippedCount = 0;

  for (const [subdir, files] of Object.entries(featureConfig)) {
    for (const file of files) {
      const fileName = path.basename(file);
      // Handle nested subdirs like 'reducers/__tests__'
      const destPath = `features/${featureName}/${subdir}/${fileName}`;

      const success = await moveFile(file, destPath);
      if (success) {
        movedCount++;
      } else {
        skippedCount++;
      }
    }
  }

  log(`${featureName}: ${movedCount} moved, ${skippedCount} skipped`, 'success');
  return movedCount;
}

async function updateAllImports() {
  console.log(chalk.bold.cyan('\n🔗 Updating imports globally...'));

  const allFiles = getAllTsFiles();
  let updatedCount = 0;

  for (const file of allFiles) {
    const updated = await updateImportsInFile(file);
    if (updated) updatedCount++;
  }

  log(`Updated imports in ${updatedCount}/${allFiles.length} files`, 'success');
}

async function validateMigration() {
  console.log(chalk.bold.cyan('\n🔍 Validating migration...'));

  // 1. Check for orphaned source files
  let orphanedCount = 0;
  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    for (const files of Object.values(featureConfig)) {
      for (const file of files) {
        const absPath = path.join(SRC_DIR, file);
        if (fs.existsSync(absPath)) {
          log(`Orphaned file: ${file}`, 'warning');
          orphanedCount++;
        }
      }
    }
  }

  if (orphanedCount === 0) {
    log('All source files successfully moved', 'success');
  } else {
    log(`${orphanedCount} orphaned files found`, 'warning');
  }

  // 2. Check that destination files exist
  let missingCount = 0;
  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    for (const [subdir, files] of Object.entries(featureConfig)) {
      for (const file of files) {
        const fileName = path.basename(file);
        const destPath = path.join(SRC_DIR, 'features', featureName, subdir, fileName);
        if (!fs.existsSync(destPath)) {
          log(`Missing destination: features/${featureName}/${subdir}/${fileName}`, 'error');
          missingCount++;
        }
      }
    }
  }

  if (missingCount === 0) {
    log('All destination files verified', 'success');
  } else {
    log(`${missingCount} destination files missing`, 'error');
  }

  // 3. TypeScript compilation check
  log('\nRunning TypeScript check...', 'section');
  const { execSync } = require('child_process');

  try {
    execSync('npx tsc --noEmit 2>&1', {
      cwd: ROOT_DIR,
      stdio: 'pipe',
      timeout: 60000,
    });
    log('TypeScript compilation passed', 'success');
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : '';
    const errorLines = output.split('\n').filter(l => l.includes('error TS'));
    log(`TypeScript compilation failed (${errorLines.length} errors)`, 'error');

    // Show first 20 errors
    errorLines.slice(0, 20).forEach(line => {
      console.log(chalk.red(`  ${line.trim()}`));
    });

    if (errorLines.length > 20) {
      console.log(chalk.red(`  ... and ${errorLines.length - 20} more errors`));
    }

    return false;
  }

  return true;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(chalk.bold.cyan('\n🚀 VolleyScore Pro - Migration Phase 3 (Final)'));
  console.log(chalk.gray('================================================='));
  console.log(chalk.gray(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`));
  console.log(chalk.gray(`Verbose: ${VERBOSE ? 'ON' : 'OFF'}\n`));

  if (DRY_RUN) {
    log('DRY RUN mode — no files will be modified\n', 'warning');
  }

  // ── Step 1: Move files per feature ──
  let totalMoved = 0;
  for (const [featureName, featureConfig] of Object.entries(MIGRATION_MAP)) {
    totalMoved += await migrateFeature(featureName, featureConfig);
  }
  console.log(chalk.bold.green(`\n✓ Phase 3 file moves: ${totalMoved} files`));

  // ── Step 2: Create re-export stubs ──
  await createReExports();

  // ── Step 3: Update ALL imports globally ──
  await updateAllImports();

  // ── Step 4: Cleanup empty directories ──
  await cleanupEmptyDirectories();

  // ── Step 5: Validate (skip in dry-run) ──
  if (!DRY_RUN) {
    const valid = await validateMigration();

    if (valid) {
      console.log(chalk.bold.green('\n✨ Migration Phase 3 Complete!\n'));
    } else {
      console.log(chalk.bold.red('\n⚠ Migration completed with errors. Review above.\n'));
    }

    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  1. Review re-export stubs in src/contexts/ (temporary)'));
    console.log(chalk.gray('  2. Run: npm run dev'));
    console.log(chalk.gray('  3. Test all features manually'));
    console.log(chalk.gray('  4. Run: npm run build'));
    console.log(chalk.gray('  5. Commit: git add . && git commit -m "feat: migrate phase 3 core features"'));
    console.log(chalk.gray('  6. Plan cleanup: remove re-export stubs after full validation\n'));
  } else {
    console.log(chalk.bold.yellow('\n✓ Dry run complete — no changes made'));
    console.log(chalk.gray('Run without --dry-run to execute migration\n'));
  }
}

main().catch(error => {
  console.error(chalk.red('\n✖ Migration failed:'), error);
  process.exit(1);
});
```

---

## 7. Estado Final Esperado

### 7.1 Estrutura `src/features/` Completa (pós Fase 3)

```
src/features/
├── ads/                    # (Fase 2)
│   └── components/SmartBanner.tsx
├── broadcast/              # (Fase 3) ★ NOVO
│   ├── screens/BroadcastScreen.tsx
│   ├── components/
│   │   ├── BroadcastOverlay.tsx
│   │   └── ObsScoreDisplay.tsx
│   ├── modals/LiveSyncModal.tsx
│   ├── hooks/
│   │   ├── useSpectatorSync.ts
│   │   ├── useSpectatorCount.ts
│   │   ├── useRemoteTimeoutSync.ts
│   │   ├── useTimeoutSync.ts
│   │   ├── useTimerSync.ts
│   │   └── useSyncManager.ts
│   └── services/
│       ├── SyncEngine.ts
│       ├── SyncService.ts
│       └── TimeoutSyncService.ts
├── court/                  # (Fase 3) ★ NOVO
│   ├── components/
│   │   ├── CourtLayout.tsx
│   │   ├── VolleyballCourt.tsx
│   │   ├── CourtHeader.tsx
│   │   └── CourtFooter.tsx
│   └── modals/CourtModal.tsx
├── game/                   # (Fase 3) ★ NOVO
│   ├── screens/
│   │   ├── GameScreen.tsx
│   │   └── index.ts
│   ├── components/
│   │   ├── ScoreCardFullscreen.tsx
│   │   ├── ScoreCardNormal.tsx
│   │   ├── ScoreCardContainer.tsx
│   │   ├── Controls.tsx
│   │   ├── HistoryBar.tsx
│   │   ├── MeasuredFullscreenHUD.tsx
│   │   ├── FloatingControlBar.tsx
│   │   ├── FloatingTopBar.tsx
│   │   ├── FullscreenMenuDrawer.tsx
│   │   └── TimeoutOverlay.tsx
│   ├── modals/
│   │   ├── MatchOverModal.tsx
│   │   ├── ScoutModal.tsx
│   │   ├── ConfirmationModal.tsx
│   │   └── ModalManager.tsx
│   ├── context/
│   │   ├── GameContext.tsx
│   │   ├── TimerContext.tsx
│   │   └── TimeoutContext.tsx
│   ├── hooks/
│   │   ├── useVolleyGame.ts
│   │   ├── useGameState.ts
│   │   ├── useGameActions.ts
│   │   ├── useGameHandlers.ts
│   │   ├── useGamePersistence.ts
│   │   ├── useGameAudio.ts
│   │   ├── useScoreCardLogic.ts
│   │   ├── useScoreGestures.ts
│   │   ├── useScoreAnnouncer.ts
│   │   ├── useSensoryFX.ts
│   │   ├── useMatchLifecycle.ts
│   │   ├── useMatchSaver.ts
│   │   ├── useHorizontalPages.ts
│   │   ├── useHudMeasure.ts
│   │   ├── useCollider.ts
│   │   ├── useActiveTimeout.ts
│   │   ├── useTimeoutManager.ts
│   │   ├── useDynamicColorStyle.ts
│   │   ├── useAdaptiveAnimation.ts
│   │   ├── useElementSize.ts
│   │   └── useCombinedGameState.ts
│   ├── reducers/
│   │   ├── gameReducer.ts
│   │   ├── meta.ts
│   │   ├── roster.ts
│   │   ├── scoring.ts
│   │   └── __tests__/
│   │       └── ghost_teams_repro.test.ts
│   └── utils/
│       ├── gameLogic.ts
│       └── balanceUtils.ts
├── history/                # (Fase 2 + residual Fase 3)
│   ├── components/...
│   ├── modals/...
│   ├── store/historyStore.ts
│   ├── services/
│   │   ├── AnalysisEngine.ts
│   │   └── PDFService.ts    # ★ NOVO (Fase 3)
│   └── utils/...
├── settings/               # (Fase 2)
│   ├── components/...
│   └── modals/...
├── social/                 # (Fase 2)
│   ├── components/...
│   ├── hooks/...
│   └── services/...
├── teams/                  # (Fase 3) ★ NOVO
│   ├── components/
│   │   ├── PlayerCard.tsx
│   │   ├── AddPlayerForm.tsx
│   │   ├── BenchArea.tsx
│   │   ├── PlayerContextMenu.tsx
│   │   ├── PlayerListItem.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── RosterBoard.tsx
│   │   ├── RosterColumn.tsx
│   │   ├── TeamColumn.tsx
│   │   └── TeamManagerUI.tsx
│   ├── modals/
│   │   ├── TeamManagerModal.tsx
│   │   ├── ProfileCreationModal.tsx
│   │   ├── ProfileDetailsModal.tsx
│   │   ├── SubstitutionModal.tsx
│   │   └── TeamStatsModal.tsx
│   ├── hooks/
│   │   ├── useTeamGenerator.ts
│   │   └── usePlayerProfiles.ts
│   ├── store/rosterStore.ts
│   └── utils/rosterLogic.ts
├── tutorial/               # (Fase 2)
│   ├── components/...
│   ├── scenes/...
│   ├── visuals/...
│   ├── modals/...
│   ├── hooks/...
│   └── data/...
└── voice/                  # (Fase 2)
    ├── hooks/...
    ├── modals/...
    └── services/...
```

### 7.2 Pastas Legadas (Estado Pós-Migração)

| Pasta | Estado Esperado |
|-------|----------------|
| `src/components/` | **REMOVIDA** (vazia) |
| `src/hooks/` | **1 arquivo restante**: `usePerformanceMonitor.ts` |
| `src/contexts/` | **11 arquivos**: 8 globais + 3 re-exports temporários |
| `src/reducers/` | **REMOVIDA** (vazia) |
| `src/stores/` | **REMOVIDA** (vazia) |
| `src/services/` | **REMOVIDA** (vazia) |
| `src/utils/` | **REMOVIDA** (vazia) |
| `src/screens/` | **REMOVIDA** (vazia) |

### 7.3 Métricas

| Métrica | Antes (Fase 2) | Depois (Fase 3) |
|---------|----------------|-----------------|
| Arquivos em `src/components/` | 37 | 0 |
| Arquivos em `src/hooks/` (flat) | 30 | 1 |
| Arquivos em `src/contexts/` | 11 | 11 (8 globais + 3 re-exports) |
| Arquivos em `src/reducers/` | 5 | 0 |
| Arquivos em `src/stores/` | 1 | 0 |
| Arquivos em `src/services/` | 4 | 0 |
| Arquivos em `src/utils/` | 3 | 0 |
| Features em `src/features/` | 6 | **11** |
| Total de arquivos migrados (Fase 3) | — | **85** |

---

## 8. Checklist de Validação Pós-Migração

```
□ Script executado sem erros fatais
□ Re-exports temporários criados para GameContext, TimerContext, TimeoutContext
□ `npx tsc --noEmit` compila sem erros
□ `npm run build` gera bundle de produção
□ `npm run dev` inicia sem erros no console
□ Placar funciona (incrementar/decrementar pontuação)
□ Undo/Redo funciona
□ Timer funciona
□ Timeout funciona
□ Substituição de jogadores funciona
□ Quadra tática abre e exibe jogadores
□ Scout modal abre e registra ações
□ Broadcast screen funciona
□ Histórico de partidas abre
□ Team Manager abre e permite edição
□ Modo fullscreen funciona com controles
□ Pastas legadas vazias foram removidas
□ Nenhum import usando path relativo profundo (../../..) permanece
```

---

## 9. Plano de Rollback

Caso a migração falhe:

```bash
# Reverter todas as mudanças
git checkout -- .
git clean -fd src/features/

# Ou reverter arquivos específicos
git checkout -- src/components/ src/hooks/ src/contexts/ src/reducers/ src/stores/ src/services/ src/utils/ src/screens/
```

---

## 10. Fase de Cleanup (Pós-Validação)

Após validação completa (1-2 dias de uso):

1. **Remover re-exports temporários** de `src/contexts/` (GameContext, TimerContext, TimeoutContext)
2. **Atualizar `.clinerules`** com nova estrutura de pastas
3. **Atualizar PRD** marcando Lote 5 como CONCLUÍDO
4. **Remover scripts de migração** de `scripts/`

---

> **ATENÇÃO:** Este documento é uma ESPECIFICAÇÃO. Nenhum arquivo será movido até aprovação explícita e execução do script `migrate-phase-3.cjs`.
