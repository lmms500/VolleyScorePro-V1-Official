# Auditoria Arquitetural - VolleyScore Pro

> **Data:** 2026-02-10
> **Auditor:** Claude (Arquiteto de Software Sr.)
> **Escopo:** `src/**/*` — 160+ arquivos, ~28.000 linhas
> **Metodologia:** Análise estática por princípios SOLID, Clean Code, DRY, SRP

---

## Resumo Executivo

O projeto demonstra **boas decisões arquiteturais já implementadas** — o Context foi dividido em três (Action/Score/Roster), o reducer foi fragmentado (scoring/roster/meta), e hooks como `useScoreGestures` já foram extraídos. Porém, a execução é **incompleta**: existem componentes orquestradores monolíticos, reconstruções redundantes de estado, e duplicação significativa de lógica entre variantes Normal/Fullscreen. A dívida técnica concentra-se em **6 áreas críticas** detalhadas abaixo.

### Métricas de Saúde

| Métrica | Valor | Alvo |
|---------|-------|------|
| Maior arquivo | `MatchOverModal.tsx` (433 loc) | < 250 loc |
| Componentes > 300 loc | **8 arquivos** | 0 |
| Hooks consumidos pelo GameScreen | **15+** | < 8 |
| Imports no GameScreen | **30+** | < 15 |
| Casts `as unknown as GameState` | **3 ocorrências** | 0 |
| Lógica duplicada entre ScoreCard variants | **~80%** | 0% |

---

## 1. God Components

### 1.1 `GameScreen.tsx` — O Orquestrador Supremo

| Atributo | Valor |
|----------|-------|
| **Linhas** | 431 |
| **Hooks consumidos** | 15 (`useActions`, `useScore`, `useRoster`, `useTranslation`, `useTimerControls`, `useAuth`, `useModals`, `useNotification`, `useAdFlow`, `usePerformanceMonitor`, `useTimeoutManager`, `useSyncManager`, `useVoiceControl`, `useHudMeasure`, `useGameAudio`, `useHaptics`, `useSensoryFX`, `useKeepAwake`, `useScoreAnnouncer`, `useImmersiveMode`, `useNativeIntegration`) |
| **useState** | 4 (`isFullscreen`, `interactingTeam`, `scoreElA`, `scoreElB`) |
| **useEffect** | 7 efeitos inline |
| **useCallback** | 10+ handlers |
| **Responsabilidades** | UI rendering, timer sync, online/offline detection, ad initialization, broadcast mode routing, fullscreen/normal toggle, audio/haptics orchestration, reduced motion sync |

**Diagnóstico:** Viola flagrantemente o **Single Responsibility Principle**. É um "Smart Component" que sabe demais — ele deveria ser um compositor puro de sub-árvores de componentes, delegando toda lógica a hooks e componentes filhos.

**Problemas específicos:**
- **Linhas 127-166:** `useSyncManager` recebe 16 parâmetros — claramente um code smell de acoplamento excessivo.
- **Linhas 186-202:** 4 `useEffect` para sync de timer que deveriam estar encapsulados num hook `useTimerSync`.
- **Linhas 70-73:** Reconstrução manual `{ ...scoreState, ...rosterState } as unknown as GameState` — type casting inseguro repetido em 3 locais.
- **Linhas 282-292:** `useVoiceControl` recebe 11+ parâmetros via props spreading.

**Refatoração proposta:**
```
GameScreen (compositor puro, ~100 loc)
├── useTimerSync()           ← extrair efeitos de timer
├── useOnlineStatus()        ← extrair detecção online/offline
├── useAdLifecycle()         ← extrair init e show/hide de ads
├── useFullscreenMode()      ← extrair toggle e estado fullscreen
├── NormalModeLayout         ← componente para modo normal
└── FullscreenModeLayout     ← componente para modo fullscreen
```

### 1.2 `MatchOverModal.tsx` — Modal com Lógica de Negócio

| Atributo | Valor |
|----------|-------|
| **Linhas** | 433 |
| **Responsabilidades** | Renderização de resultado, lógica de rotação/transferência, share/download com setTimeout, confetti, lazy-loading de análise, detecção de match no histórico |

**Diagnóstico:** O `transferAnalysis` (linhas 75-81) e `matchToAnalyze` (linhas 84-105) são **lógica de domínio pura** que não deveria viver num componente visual.

**Refatoração proposta:**
- Extrair `useTransferAnalysis(report)` — hook puro
- Extrair `useMatchLookup(savedMatchId, state)` — hook puro
- Extrair lógica de share para `useShareActions(state)` — já existe `useSocialShare`, mas o componente ainda gerencia o fluxo de render→timeout→share

### 1.3 `TeamManagerModal.tsx` — Orquestrador de Drag & Drop

| Atributo | Valor |
|----------|-------|
| **Linhas** | 326 |
| **Store selectors** | 16 chamadas individuais a `useRosterStore` |
| **Responsabilidades** | DnD, tab navigation, profile CRUD, bench activation, player search, player context menu, multiple confirmation modals |

**Diagnóstico:** Parcialmente decomposto (já tem `RosterBoard`, `ProfileCard`, `PlayerContextMenu`), mas o **handleDragEnd** (linhas 169-204) contém lógica de negócio complexa (validação de limites, redirect para bench, confirmação) que deveria estar num hook `useDragDrop`.

**Refatoração proposta:**
- Extrair `useTeamDragDrop({ courtA, courtB, queue, courtLimit, benchLimit })` — encapsula sensors, handlers, e validação
- Agrupar os 16 selectors do `useRosterStore` em 1-2 calls com selectors compostos

### 1.4 `FloatingTopBar.tsx` — Bem Composto, mas Longo

| Atributo | Valor |
|----------|-------|
| **Linhas** | 388 |
| **Sub-components inline** | 4 (`TimeoutDots`, `TimeoutButton`, `TeamInfoSmart`, `CenterDisplayStealth`) |

**Diagnóstico:** Arquitetura interna boa (sub-componentes com `memo`), mas os sub-componentes deveriam estar em **arquivos separados** dentro de `Fullscreen/`. O componente principal recebe **18 props** — indicador de que está recebendo estado demais.

**Refatoração proposta:**
- Mover sub-componentes para `Fullscreen/TopBar/` (TeamInfoSmart.tsx, TimeoutButton.tsx, CenterDisplay.tsx)
- Criar `TopBarProps` derivado do contexto, evitando prop-drilling de 18 valores

---

## 2. Duplicação de Código (DRY Violations)

### 2.1 CRÍTICO: ScoreCardNormal vs ScoreCardFullscreen — ~80% de Lógica Duplicada

| Lógica | ScoreCardNormal | ScoreCardFullscreen |
|--------|-----------------|---------------------|
| `showScout` + `isInteractionLocked` state | ✅ L55-56 | ✅ L107-108 |
| `handleScoutClose` com timeout 300ms | ✅ L62-66 | ✅ L138-143 |
| `handleAddWrapper` (stats → scout, else → add) | ✅ L73-82 | ✅ L145-154 |
| `handleSubtractWrapper` | ✅ L84-86 | ✅ L160-162 |
| `useScoreGestures` consumption | ✅ L113-119 | ✅ L164-170 |
| `useGameAudio` + `useHaptics` | ✅ L52-53 | ✅ L116-117 |
| `haloMode` computation | ✅ L144-149 | ✅ L177-182 |
| `HaloBackground` + `ScoreTicker` render | ✅ L260-284 | ✅ L58-95 |
| Ripple effect | ✅ L88-101 | ✅ L119-131 |

**Impacto:** Qualquer bugfix ou feature (ex: novo skill type, novo gesto) precisa ser feito em **2 arquivos**. Este é o maior risco de regressão do projeto.

**Refatoração proposta:**
```
useScoreCardLogic({ teamId, team, onAdd, onSubtract, config, isLocked })
→ retorna: { showScout, handleScoutClose, handleAdd, handleSubtract,
             gestureHandlers, haloMode, audio, haptics, ripple }

ScoreCardNormal  → usa useScoreCardLogic + renderiza layout normal
ScoreCardFullscreen → usa useScoreCardLogic + renderiza layout fullscreen
```

### 2.2 ALTO: Reconstrução de `GameState` com Cast Inseguro

| Arquivo | Linha | Código |
|---------|-------|--------|
| `GameScreen.tsx` | 70-73 | `{ ...scoreState, ...rosterState } as unknown as GameState` |
| `ModalManager.tsx` | 155 | `{ ...scoreState, ...rosterState } as unknown as GameState` |
| `MatchTab.tsx` | 35-36 | `{ ...scoreState, ...rosterState } as any` |
| `GameContext.tsx` | 232-237 | `{ ...score, ...roster } as unknown as GameState` |

**Diagnóstico:** O `as unknown as GameState` é um **red flag de type safety**. A split dos contexts criou uma desconexão entre o shape original (`GameState`) e os shapes dos sub-contexts. A reconstrução é manual e frágil.

**Refatoração proposta:**
- Criar `useCombinedGameState(): GameState` — hook utilitário que faz a reconstrução uma única vez, com proper typing
- OU redesenhar os types para que `ScoreContextState & RosterContextState ≡ GameState` naturalmente (sem cast)

### 2.3 ALTO: Cálculo de `lastScorer` Duplicado

| Arquivo | Código |
|---------|--------|
| `GameScreen.tsx:77-80` | `[...logs].reverse().find(log => log.type === 'POINT')` |
| `ScoreCardContainer.tsx:70-74` | `[...logs].reverse().find(log => log.type === 'POINT')` |

**Refatoração proposta:**
- Adicionar `lastScorerTeam` como campo computed no `ScoreContext` (calculado uma vez, consumido por N componentes)

### 2.4 MÉDIO: Guard `isSpectator` Repetido

O padrão `if (isSpectator) return;` aparece em:
- `GameScreen.tsx` — 5 handlers
- `ScoreCardContainer.tsx` — 4 handlers
- `useGameActions.ts` — 6 actions (`syncRole === 'spectator'`)

**Refatoração proposta:**
- O guard já existe em `useGameActions` (no reducer level). Removê-lo dos componentes de UI, que não deveriam saber sobre roles — apenas desabilitar interações via `disabled` prop.

### 2.5 MÉDIO: Scroll Header Hide/Show Pattern

Lógica idêntica de hide-on-scroll-down / show-on-scroll-up em:
- `TeamManagerModal.tsx:91-99`
- `HistoryList.tsx:221-230`

**Refatoração proposta:**
- Extrair `useScrollHeaderVisibility(scrollRef)` → `{ showHeader, onScroll }`

### 2.6 MÉDIO: SubstitutionModal — Duas Variantes de PlayerCard

`CompactPlayerCard` (landscape) e `PlayerCardBlock` (portrait) em `SubstitutionModal.tsx` compartilham:
- Mesma interface de props (7 props idênticas)
- Mesma lógica de `isSelected/isPending` styling
- Mesmo `pairIndex` badge

**Refatoração proposta:**
- Unificar em `SubstitutionPlayerCard` com prop `variant: 'compact' | 'block'`

---

## 3. Acoplamento de Estado

### 3.1 O "Facade Leak" do GameContext

**Positivo:** O `GameContext.tsx` já foi split em 3 contexts (`ActionContext`, `ScoreContext`, `RosterContext`). Decisão arquitetural excelente.

**Problema:** O hook `useGame()` (linha 224-245) reconstrói o "God Object" original, anulando o benefício da separação. Enquanto ele existir, componentes podem importá-lo e receber re-renders de TUDO.

**Refatoração proposta:**
- Deprecar `useGame()` formalmente com `@deprecated` JSDoc
- Auditar consumidores e migrar para `useActions()` / `useScore()` / `useRoster()` especificamente
- Após migração completa, remover `useGame()`

### 3.2 `useVolleyGame` — O God Hook (195 linhas)

É um facade hook que compõe:
- `usePlayerProfiles` — profiles
- `useGameState` — reducer + ref
- `useGamePersistence` — load/save
- `useGameActions` — 35+ actions
- `useTeamGenerator` — balancing

**Positivo:** Já usa composição de hooks menores. **Negativo:** Retorna um objeto com ~40 propriedades (linhas 162-198), misturando actions, state, computed values e meta. Componentes que importam isso recebem tudo.

**Status:** Aceitável como facade interna do provider. O problema real está nos consumidores que usam `useGame()` em vez dos hooks granulares.

### 3.3 `ModalManager.tsx` — Conhece Demais

O `ModalManager` importa `useActions`, `useScore`, `useRoster`, `useAuth`, `useHistoryStore`, `useTutorial`, `usePWAInstallPrompt`, `useServiceWorker`, `useSpectatorCount` e contém **lógica de salvamento de partida** (linhas 79-133).

**Diagnóstico:** O componente que deveria apenas orquestrar modais está fazendo **persistência de dados, sync com Firebase, cálculo de deltas de stats, e geração de timeline**. Viola SRP severamente.

**Refatoração proposta:**
- Extrair `useMatchSaver()` — encapsula toda a lógica de save/sync/stats (linhas 72-133)
- `ModalManager` deveria receber `savedMatchId` como prop e não calculá-lo internamente

### 3.4 `useSyncManager` — Parâmetros Excessivos

```typescript
useSyncManager({
    combinedState, setState, syncRole, sessionId, user, t,
    showNotification, activeTimeoutTeam, timeoutSeconds,
    isTimeoutMinimized, startTimeout, stopTimeout,
    minimizeTimeout, maximizeTimeout, isMatchOver,
    activeModal, openModal
})  // 17 parâmetros!
```

**Refatoração proposta:**
- Consumir contexts diretamente dentro do hook em vez de recebê-los como parâmetros
- Reduzir para `useSyncManager()` sem parâmetros, consumindo `useActions()`, `useScore()`, `useRoster()`, `useModals()` internamente

---

## 4. Inconsistências de UI

### 4.1 Botões: `<Button>` vs `<button>` Raw

Existe um componente `<Button>` em `ui/Button.tsx`, mas ele é **ignorado** em múltiplos locais:

| Arquivo | Botões raw com Tailwind longo |
|---------|-------------------------------|
| `TeamManagerModal.tsx` | 8+ botões com classes inline de 3-4 linhas |
| `HistoryList.tsx` | 6+ botões (export, filter, close) |
| `MatchTab.tsx` | Toggle buttons, preset buttons |
| `FloatingTopBar.tsx` | Timer button, server button |
| `FullscreenMenuDrawer.tsx` | Menu items |

**Impacto:** Inconsistência visual e manutenção difícil. Uma mudança no design system requer editar 30+ locais.

**Refatoração proposta:**
- Estender `<Button>` com variantes: `primary`, `secondary`, `ghost`, `danger`, `icon`, `toggle`
- Criar `<IconButton>` para botões de ação com ícone
- Criar `<ToggleSwitch>` para os toggles on/off que usam `ToggleRight/ToggleLeft`

### 4.2 Badge de Status (Match Point / Set Point / Deuce)

A configuração de badges é construída inline em:
- `ScoreCardNormal.tsx:132-141` — objeto `badgeConfig` com icon, text, className
- `FloatingTopBar.tsx:120-125` — lógica similar mas com classes diferentes

**Refatoração proposta:**
- Criar `getStatusBadgeConfig(state)` em `utils/gameLogic.ts` retornando `{ icon, text, className }`
- Criar componente `<StatusBadge mode="matchPoint" | "setPoint" | "deuce" | "suddenDeath" />`

### 4.3 Glass Surface / Card Patterns

Pelo menos 4 variantes de "glass card" espalhadas:

```css
/* Variante 1 */ bg-white/5 border-white/10 backdrop-blur-md
/* Variante 2 */ bg-white/60 dark:bg-white/[0.04] border-slate-200 dark:border-white/10
/* Variante 3 */ bg-slate-100 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5
/* Variante 4 */ bg-gradient-to-br from-white/10 to-white/5 border-white/20 dark:border-white/5
```

**Refatoração proposta:**
- Já existe `<GlassSurface>` — estender com variantes (`intensity: "low" | "medium" | "high" | "transparent"`)
- Substituir glass patterns inline pelo componente base

### 4.4 Tipografia de Labels

O padrão `text-[10px] font-black uppercase tracking-widest` aparece em **20+ locais**. Não há um token de design para esse micro-label.

**Refatoração proposta:**
- Definir classe utilitária em `index.css`: `.label-micro { @apply text-[10px] font-black uppercase tracking-widest; }`
- Ou criar componente `<MicroLabel>` / `<Caption>`

---

## 5. Outros Code Smells

### 5.1 `useGameActions.ts` — 300 Linhas de Boilerplate

O arquivo contém **35 useCallback wrappers** que são quase todos idênticos:
```typescript
const foo = useCallback((id: string) => {
    dispatch({ type: 'FOO', id });
}, [dispatch]);
```

**Refatoração proposta:**
- Criar factory `createAction(dispatch, type, mapper)` que gera callbacks automaticamente
- Reduzir de 300 linhas para ~80

### 5.2 `TeamManagerUI.tsx` — Multi-Component File (350 linhas)

Contém 4 componentes exportados (`ColorPicker`, `EditableTitle`, `TeamLogoUploader`, `BatchInputSection`) que não são relacionados entre si.

**Destaque:** `TeamLogoUploader` tem **lógica de extração de paleta de cores** (RGB→HSL, bucketing, distance calculation) inline — ~80 linhas de processamento de imagem dentro de um componente React.

**Refatoração proposta:**
- Mover cada componente para seu próprio arquivo em `TeamManager/`
- Extrair `extractDominantColors(imageSrc): { primary: string, secondary: string }` para `services/ImageService.ts` ou `utils/colorExtraction.ts`

### 5.3 `resolveTheme()` com Classes Tailwind Dinâmicas

```typescript
const createTheme = (color: string) => ({
    text: `text-${color}-500`,  // ⚠️ Tailwind não detecta isso no build!
    bg: `bg-${color}-500/20`,
});
```

**Diagnóstico:** Classes construídas dinamicamente (`text-${color}-500`) **não são detectadas pelo Tailwind CSS purge**. Funciona apenas porque todas as cores estão listadas em `safelist` ou são usadas em outros lugares. É um risco de regressão silenciosa.

**Refatoração proposta:**
- Usar lookup table com classes completas pré-definidas (como já é feito parcialmente)
- Verificar e documentar o `safelist` no `tailwind.config`

### 5.4 Console.logs em Produção

```
GameScreen.tsx:379 → console.log('📢 GameScreen: openModal(settings) chamado');
useVolleyGame.ts:62  → console.log('[VolleyGame] Initialized gameId ref...');
useVolleyGame.ts:123 → console.log('[VolleyGame] Started New Game:', newGameId);
```

**Refatoração proposta:**
- Substituir por `logger.debug()` do `utils/logger.ts` que já existe no projeto
- O logger pode ser silenciado em produção via feature flag

### 5.5 Funções Placeholder Vazias

```typescript
// useGameActions.ts:142-144
const revertPlayerChanges = useCallback((playerId: string) => {
    // Placeholder - não implementado no original
}, []);

// useGameActions.ts:182-184
const relinkProfile = useCallback((profile: PlayerProfile) => {
    // Placeholder - não implementado no original
}, []);
```

**Refatoração proposta:**
- Remover ou implementar. Placeholders esquecidos são dívida técnica passiva.

---

## 6. Tabela de Ofensores — Priorizada por Risco × Impacto

| # | Arquivo | Problema | Tipo | Risco | Impacto | Solução Proposta |
|---|---------|----------|------|-------|---------|------------------|
| 1 | `ScoreCardNormal.tsx` + `ScoreCardFullscreen.tsx` | ~80% de lógica duplicada entre variantes | DRY | **CRÍTICO** | **ALTO** | Extrair `useScoreCardLogic()` hook compartilhado |
| 2 | `GameScreen.tsx` | God Component — 15+ hooks, 30+ imports, 7 effects | SRP | **ALTO** | **ALTO** | Extrair `useTimerSync`, `useOnlineStatus`, `useAdLifecycle`; dividir em Normal/Fullscreen layouts |
| 3 | `ModalManager.tsx` | Lógica de save/sync/stats dentro de um componente de UI | SRP | **ALTO** | **ALTO** | Extrair `useMatchSaver()` hook |
| 4 | `GameContext.tsx` → `useGame()` | Facade "God Object" anula split de contexts | Coupling | **ALTO** | **MÉDIO** | Deprecar e migrar consumidores para hooks granulares |
| 5 | 4 arquivos | `as unknown as GameState` cast repetido | Type Safety | **ALTO** | **MÉDIO** | Criar `useCombinedGameState()` ou alinhar types |
| 6 | `GameScreen:77` + `ScoreCardContainer:70` | Cálculo `lastScorer` duplicado | DRY | **MÉDIO** | **MÉDIO** | Mover para computed value no `ScoreContext` |
| 7 | `useSyncManager` | 17 parâmetros — acoplamento excessivo | Coupling | **MÉDIO** | **MÉDIO** | Hook deve consumir contexts internamente |
| 8 | `TeamManagerUI.tsx` | 4 componentes + palette extraction inline | SRP | **MÉDIO** | **MÉDIO** | Separar em arquivos + extrair color extraction |
| 9 | `useGameActions.ts` | 300 linhas de boilerplate useCallback | Boilerplate | **BAIXO** | **MÉDIO** | Factory pattern para action creators |
| 10 | `SubstitutionModal.tsx` | `CompactPlayerCard` ≈ `PlayerCardBlock` duplicados | DRY | **MÉDIO** | **BAIXO** | Unificar com prop `variant` |
| 11 | 2 arquivos | Scroll header hide/show duplicado | DRY | **BAIXO** | **BAIXO** | Extrair `useScrollHeaderVisibility()` |
| 12 | 20+ arquivos | `<button>` raw com Tailwind longo vs `<Button>` | UI Consistency | **BAIXO** | **ALTO** | Estender `<Button>` com variantes + `<ToggleSwitch>` |
| 13 | 20+ arquivos | `text-[10px] font-black uppercase tracking-widest` repetido | UI Consistency | **BAIXO** | **MÉDIO** | Classe `.label-micro` ou componente `<MicroLabel>` |
| 14 | `FloatingTopBar.tsx` | 4 sub-componentes inline (388 linhas) | Organization | **BAIXO** | **BAIXO** | Mover para `Fullscreen/TopBar/` |
| 15 | `utils/colors.ts` | Classes Tailwind dinâmicas (`text-${color}-500`) | Purge Risk | **MÉDIO** | **BAIXO** | Usar lookup table com classes estáticas |
| 16 | 3+ arquivos | `console.log` em produção | Code Hygiene | **BAIXO** | **BAIXO** | Substituir por `logger.debug()` |
| 17 | `useGameActions.ts` | 2 funções placeholder vazias | Dead Code | **BAIXO** | **BAIXO** | Remover ou implementar |

---

## 7. Plano de Execução Sugerido (Fases)

### Fase 1 — Quick Wins (Baixo Risco, Alto Retorno)
1. Extrair `useScoreCardLogic()` — elimina duplicação #1
2. Criar `useCombinedGameState()` — elimina 4 casts inseguros
3. Mover `lastScorerTeam` para `ScoreContext` como computed
4. Extrair `useScrollHeaderVisibility()` — reuso imediato

### Fase 2 — Decomposição de God Components
5. Decompor `GameScreen` em hooks (`useTimerSync`, `useOnlineStatus`, etc.)
6. Extrair `useMatchSaver()` do `ModalManager`
7. Extrair `useTeamDragDrop()` do `TeamManagerModal`
8. Refatorar `useSyncManager` para consumir contexts internamente

### Fase 3 — Design System
9. Estender `<Button>` com variantes
10. Criar `<ToggleSwitch>`, `<StatusBadge>`, `<MicroLabel>`
11. Substituir botões raw por componentes base
12. Auditar e consolidar glass card patterns

### Fase 4 — Cleanup
13. Deprecar e remover `useGame()` facade
14. Separar `TeamManagerUI.tsx` em arquivos individuais
15. Factory para `useGameActions` boilerplate
16. Remover console.logs e dead code

---

## Apêndice: Arquivos por Tamanho (Top 20)

| # | Arquivo | Linhas | Risco |
|---|---------|--------|-------|
| 1 | `modals/MatchOverModal.tsx` | 433 | Médio |
| 2 | `screens/GameScreen.tsx` | 431 | **Alto** |
| 3 | `services/AudioService.ts` | 427 | Baixo |
| 4 | `modals/SubstitutionModal.tsx` | 389 | Médio |
| 5 | `Fullscreen/FloatingTopBar.tsx` | 388 | Baixo |
| 6 | `utils/balanceUtils.ts` | 384 | Baixo |
| 7 | `utils/rosterLogic.ts` | 369 | Baixo |
| 8 | `TeamManager/TeamManagerUI.tsx` | 350 | Médio |
| 9 | `ui/Confetti.tsx` | 347 | Baixo |
| 10 | `History/HistoryList.tsx` | 341 | Médio |
| 11 | `modals/RichTutorialModal.tsx` | 336 | Baixo |
| 12 | `History/MatchTimeline.tsx` | 335 | Baixo |
| 13 | `services/VoiceCommandParser.ts` | 330 | Baixo |
| 14 | `ScoreCardNormal.tsx` | 327 | **Alto** |
| 15 | `modals/TeamManagerModal.tsx` | 326 | **Alto** |
| 16 | `modals/ProfileCreationModal.tsx` | 324 | Baixo |
| 17 | `types/domain.ts` | 323 | Baixo |
| 18 | `Settings/SystemTab.tsx` | 319 | Baixo |
| 19 | `tutorial/visuals/TeamScenes.tsx` | 314 | Baixo |
| 20 | `services/SyncEngine.ts` | 307 | Baixo |

---

> **Nota Final:** Este projeto está em um estado **intermediário de refatoração** — as decisões certas foram tomadas (split de context, reducer fragmentado, hooks extraídos), mas a execução parou antes de completar o ciclo. A Fase 1 do plano acima pode ser executada com risco mínimo e ganho imediato de manutenibilidade.
