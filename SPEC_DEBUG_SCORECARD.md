# SPEC — Debug Crítico: Implementação das Correções de Performance

**Data:** 2026-02-14
**Engenheiro:** Claude (Performance Expert)
**Baseado em:** [PRD_DEBUG_SCORECARD.md](PRD_DEBUG_SCORECARD.md)

---

## 1. Isolamento do Timer do Hot Path (ScoreContext)

### 1.1 GameContext.tsx — Remover timer do ScoreContext

**Arquivo:** `src/contexts/GameContext.tsx`

**SEARCH:**
```typescript
// 2. Score Memo - Updates on points/timer. NO log arrays in deps.
  const scoreState = useMemo((): ScoreContextState => ({
      scoreA: game.state.scoreA,
      scoreB: game.state.scoreB,
      setsA: game.state.setsA,
      setsB: game.state.setsB,
      currentSet: game.state.currentSet,
      servingTeam: game.state.servingTeam,
      isMatchOver: game.state.isMatchOver,
      matchWinner: game.state.matchWinner,
      timeoutsA: game.state.timeoutsA,
      timeoutsB: game.state.timeoutsB,
      inSuddenDeath: game.state.inSuddenDeath,
      pendingSideSwitch: game.state.pendingSideSwitch,
      matchDurationSeconds: game.state.matchDurationSeconds,
      isTimerRunning: game.state.isTimerRunning,
      swappedSides: game.state.swappedSides,
      // Computed
      isMatchActive: game.isMatchActive,
      isMatchPointA: game.isMatchPointA,
      isMatchPointB: game.isMatchPointB,
      isSetPointA: game.isSetPointA,
      isSetPointB: game.isSetPointB,
      isDeuce: game.isDeuce,
      isTieBreak: game.isTieBreak,
      setsNeededToWin: game.setsNeededToWin,
      lastScorerTeam: game.state.lastScorerTeam  // O(1) from reducer
  }), [
      game.state.scoreA, game.state.scoreB, game.state.setsA, game.state.setsB,
      game.state.currentSet, game.state.servingTeam, game.state.isMatchOver,
      game.state.matchWinner, game.state.timeoutsA, game.state.timeoutsB,
      game.state.inSuddenDeath, game.state.pendingSideSwitch,
      game.state.matchDurationSeconds, game.state.isTimerRunning,
      game.state.swappedSides, game.state.lastScorerTeam,
      game.isMatchActive, game.isMatchPointA, game.isMatchPointB,
      game.isSetPointA, game.isSetPointB, game.isDeuce, game.isTieBreak, game.setsNeededToWin
  ]);
```

**REPLACE:**
```typescript
// 2. Score Memo - Updates ONLY on scoring events (NO TIMER).
  // Timer state lives in TimerContext and is consumed separately.
  const scoreState = useMemo((): ScoreContextState => ({
      scoreA: game.state.scoreA,
      scoreB: game.state.scoreB,
      setsA: game.state.setsA,
      setsB: game.state.setsB,
      currentSet: game.state.currentSet,
      servingTeam: game.state.servingTeam,
      isMatchOver: game.state.isMatchOver,
      matchWinner: game.state.matchWinner,
      timeoutsA: game.state.timeoutsA,
      timeoutsB: game.state.timeoutsB,
      inSuddenDeath: game.state.inSuddenDeath,
      pendingSideSwitch: game.state.pendingSideSwitch,
      swappedSides: game.state.swappedSides,
      // Computed
      isMatchActive: game.isMatchActive,
      isMatchPointA: game.isMatchPointA,
      isMatchPointB: game.isMatchPointB,
      isSetPointA: game.isSetPointA,
      isSetPointB: game.isSetPointB,
      isDeuce: game.isDeuce,
      isTieBreak: game.isTieBreak,
      setsNeededToWin: game.setsNeededToWin,
      lastScorerTeam: game.state.lastScorerTeam  // O(1) from reducer
  }), [
      game.state.scoreA, game.state.scoreB, game.state.setsA, game.state.setsB,
      game.state.currentSet, game.state.servingTeam, game.state.isMatchOver,
      game.state.matchWinner, game.state.timeoutsA, game.state.timeoutsB,
      game.state.inSuddenDeath, game.state.pendingSideSwitch,
      game.state.swappedSides, game.state.lastScorerTeam,
      game.isMatchActive, game.isMatchPointA, game.isMatchPointB,
      game.isSetPointA, game.isSetPointB, game.isDeuce, game.isTieBreak, game.setsNeededToWin
  ]);
```

**SEARCH (Interface ScoreContextState):**
```typescript
// --- 2. SCORE CONTEXT (Hot Path - Updates frequently, NO logs) ---
interface ScoreContextState {
    scoreA: number;
    scoreB: number;
    setsA: number;
    setsB: number;
    currentSet: number;
    servingTeam: TeamId | null;
    isMatchOver: boolean;
    matchWinner: TeamId | null;
    timeoutsA: number;
    timeoutsB: number;
    inSuddenDeath: boolean;
    pendingSideSwitch: boolean;
    matchDurationSeconds: number;
    isTimerRunning: boolean;
    swappedSides: boolean;

    // Computed
    isMatchActive: boolean;
    isMatchPointA: boolean;
    isMatchPointB: boolean;
    isSetPointA: boolean;
    isSetPointB: boolean;
    isDeuce: boolean;
    isTieBreak: boolean;
    setsNeededToWin: number;
    lastScorerTeam: TeamId | null;
}
```

**REPLACE:**
```typescript
// --- 2. SCORE CONTEXT (Hot Path - Updates ONLY on scoring events) ---
// IMPORTANT: Timer state (matchDurationSeconds, isTimerRunning) removed to prevent
// cascading re-renders every second. Use TimerContext instead.
interface ScoreContextState {
    scoreA: number;
    scoreB: number;
    setsA: number;
    setsB: number;
    currentSet: number;
    servingTeam: TeamId | null;
    isMatchOver: boolean;
    matchWinner: TeamId | null;
    timeoutsA: number;
    timeoutsB: number;
    inSuddenDeath: boolean;
    pendingSideSwitch: boolean;
    swappedSides: boolean;

    // Computed
    isMatchActive: boolean;
    isMatchPointA: boolean;
    isMatchPointB: boolean;
    isSetPointA: boolean;
    isSetPointB: boolean;
    isDeuce: boolean;
    isTieBreak: boolean;
    setsNeededToWin: number;
    lastScorerTeam: TeamId | null;
}
```

---

### 1.2 useTimerSync.ts — Eliminar dispatch a cada segundo

**Arquivo:** `src/hooks/useTimerSync.ts`

**SUBSTITUIR ARQUIVO COMPLETO:**

```typescript
/**
 * src/hooks/useTimerSync.ts
 *
 * Hook para sincronizar estado do timer (TimerContext) com estado do jogo (GameContext).
 *
 * IMPORTANTE: Não atualiza GameState a cada tick do timer (eliminado para performance).
 * Timer state é gerenciado exclusivamente pelo TimerContext.
 *
 * Sincronização bidirecional:
 * - Game start → Timer start
 * - Game reset → Timer reset
 */

import { useEffect } from 'react';
import { useScore, useLog } from '../contexts/GameContext';
import { useTimerControls } from '../contexts/TimerContext';

/**
 * Sincroniza controles de timer com eventos do jogo:
 * - Effect #1: Inicia timer quando primeiro ponto é marcado
 * - Effect #2: Reseta timer quando jogo é resetado
 *
 * REMOVIDO: Sync de matchDurationSeconds para evitar re-renders a cada segundo.
 * Componentes que precisam exibir timer devem usar useTimerValue() diretamente.
 */
export function useTimerSync(): void {
    const { scoreA, scoreB, setsA, setsB, isMatchOver } = useScore();
    const { history } = useLog();
    const timer = useTimerControls();

    // Effect #1: Start timer on first scoring event
    useEffect(() => {
        const isMatchActive = scoreA + scoreB + setsA + setsB > 0 || history.length > 0;
        if (isMatchActive && !timer.isRunning && !isMatchOver) {
            timer.start();
        } else if (isMatchOver && timer.isRunning) {
            timer.stop();
        }
    }, [scoreA, scoreB, setsA, setsB, history.length, isMatchOver, timer]);

    // Effect #2: Reset timer quando jogo é resetado (todas as contagens zeradas)
    useEffect(() => {
        if (scoreA === 0 && scoreB === 0 && setsA === 0 && setsB === 0 && history.length === 0) {
            timer.reset();
        }
    }, [scoreA, scoreB, setsA, setsB, history.length, timer]);
}
```

---

### 1.3 Atualizar consumidores de timer (se existirem)

**NOTA:** Buscar por usos de `matchDurationSeconds` e `isTimerRunning` nos componentes:

```bash
# Comando para encontrar consumidores:
grep -r "matchDurationSeconds\|isTimerRunning" src/components src/screens --include="*.tsx"
```

**Para cada consumidor encontrado:**
- Se o componente **exibe** o timer: trocar `useScore()` por `useTimerValue()`
- Se o componente **controla** o timer (start/stop): trocar por `useTimerControls()`

**Exemplo de refatoração:**

```typescript
// ANTES:
const { matchDurationSeconds, isTimerRunning } = useScore();

// DEPOIS (para display):
const { seconds } = useTimerValue();

// OU (para controles):
const { isRunning } = useTimerControls();
```

---

## 2. Correção do Stacking Context (Fullscreen Fantasma)

### 2.1 FullscreenLayout.tsx — Envolver em container com z-index

**Arquivo:** `src/components/layouts/FullscreenLayout.tsx`

**SEARCH:**
```typescript
    return (
        <>
            {/* Floating HUD + Controls */}
            <MeasuredFullscreenHUD
```

**REPLACE:**
```typescript
    return (
        <div className="relative z-10 w-full h-full flex flex-col">
            {/* Floating HUD + Controls */}
            <MeasuredFullscreenHUD
```

**SEARCH (final do return):**
```typescript
            </div>
        </>
    );
};
```

**REPLACE:**
```typescript
            </div>
        </div>
    );
};
```

---

### 2.2 GameScreen.tsx — Garantir z-index do motion wrapper

**Arquivo:** `src/screens/GameScreen.tsx`

**SEARCH:**
```typescript
                    {isFullscreen ? (
                        <motion.div
                            key="fullscreen"
                            className="absolute inset-0 w-full h-full flex flex-col"
```

**REPLACE:**
```typescript
                    {isFullscreen ? (
                        <motion.div
                            key="fullscreen"
                            className="absolute inset-0 w-full h-full flex flex-col z-[1]"
```

**SEARCH:**
```typescript
                    ) : (
                        <motion.div
                            key="normal"
                            className="absolute inset-0 w-full h-full flex flex-col"
```

**REPLACE:**
```typescript
                    ) : (
                        <motion.div
                            key="normal"
                            className="absolute inset-0 w-full h-full flex flex-col z-[1]"
```

---

## 3. Estabilização de Referências (GameScreen.tsx)

### 3.1 Memoizar voiceState

**Arquivo:** `src/screens/GameScreen.tsx`

**SEARCH:**
```typescript
    // Voice state object (passed to layouts)
    const voiceState = { isListening, toggleListening };
```

**REPLACE:**
```typescript
    // Voice state object (passed to layouts) - MEMOIZED to prevent re-renders
    const voiceState = useMemo(() => ({ isListening, toggleListening }), [isListening, toggleListening]);
```

**Importação necessária (verificar se já existe):**
```typescript
import React, { useState, useMemo, useCallback } from 'react';
```

---

### 3.2 Estabilizar callbacks de fullscreen

**Arquivo:** `src/screens/GameScreen.tsx`

**SEARCH:**
```typescript
    // --- FULLSCREEN STATE (único estado local) ---
    // Moved up to fix TS2448 (used in useAdLifecycle)
    const [isFullscreen, setIsFullscreen] = useState(false);
```

**REPLACE:**
```typescript
    // --- FULLSCREEN STATE (único estado local) ---
    // Moved up to fix TS2448 (used in useAdLifecycle)
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Stable callbacks for fullscreen toggle (prevent layout re-renders)
    const handleExitFullscreen = useCallback(() => setIsFullscreen(false), []);
    const handleEnterFullscreen = useCallback(() => setIsFullscreen(true), []);
```

**SEARCH:**
```typescript
                            <FullscreenLayout
                                handlers={handlers}
                                voiceState={voiceState}
                                onExitFullscreen={() => setIsFullscreen(false)}
                            />
```

**REPLACE:**
```typescript
                            <FullscreenLayout
                                handlers={handlers}
                                voiceState={voiceState}
                                onExitFullscreen={handleExitFullscreen}
                            />
```

**SEARCH:**
```typescript
                            <NormalLayout
                                handlers={handlers}
                                voiceState={voiceState}
                                onToggleFullscreen={() => setIsFullscreen(true)}
                            />
```

**REPLACE:**
```typescript
                            <NormalLayout
                                handlers={handlers}
                                voiceState={voiceState}
                                onToggleFullscreen={handleEnterFullscreen}
                            />
```

---

### 3.3 Ajustar AnimatePresence transition

**Arquivo:** `src/screens/GameScreen.tsx`

**SEARCH:**
```typescript
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
```

**REPLACE:**
```typescript
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{
                                type: "tween",
                                duration: 0.2,
                                ease: "easeInOut"
                            }}
```

**APLICAR EM AMBOS OS motion.div** (fullscreen e normal) — substituir as duas ocorrências da transição.

---

## 4. Otimização do useScoreCardLogic.ts

### 4.1 Estabilizar referências de audio e haptics com useRef

**Arquivo:** `src/hooks/useScoreCardLogic.ts`

**CÓDIGO COMPLETO REFATORADO:**

```typescript
// src/hooks/useScoreCardLogic.ts

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TeamId, Team, SkillType, GameConfig, TeamColor } from '../types';
import { useScoreGestures } from './useScoreGestures';
import { useGameAudio } from './useGameAudio';
import { useHaptics } from './useHaptics';
import { HaloMode } from '../components/ui/HaloBackground';
import { usePerformanceSafe } from '../contexts/PerformanceContext';

interface UseScoreCardLogicParams {
  teamId: TeamId;
  team: Team;
  onAdd: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
  onSubtract: () => void;
  config: GameConfig;
  isLocked: boolean;
  isMatchPoint: boolean;
  isSetPoint: boolean;
  isServing: boolean;
  isLastScorer: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  colorTheme?: TeamColor;
}

export const useScoreCardLogic = ({
  teamId,
  team,
  onAdd,
  onSubtract,
  config,
  isLocked,
  isMatchPoint,
  isSetPoint,
  isServing,
  isLastScorer,
  onInteractionStart,
  onInteractionEnd,
  colorTheme,
}: UseScoreCardLogicParams) => {
  // --- Serviços (audio já é estável internamente, haptics não) ---
  const audio = useGameAudio(config);
  const haptics = useHaptics(true);
  const { config: perf } = usePerformanceSafe();

  // CRITICAL FIX: Use refs to prevent callback recreation when haptics changes
  // useGameAudio already returns a stable object, but useHaptics can recreate
  const hapticsRef = useRef(haptics);
  useEffect(() => { hapticsRef.current = haptics; }, [haptics]);

  // --- Estado Local ---
  const [showScout, setShowScout] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // --- Valores Derivados ---
  const isCritical = isMatchPoint || isSetPoint;
  const resolvedColor = colorTheme || team.color || 'slate';

  const haloMode: HaloMode = useMemo(() => {
    if (isCritical) return 'critical';
    if (isLastScorer) return 'lastScorer';
    if (isServing) return 'serving';
    return 'idle';
  }, [isCritical, isLastScorer, isServing]);

  // --- Handlers (STABLE - use refs for services) ---
  const handleScoutClose = useCallback(() => {
    setShowScout(false);
    setIsInteractionLocked(true);
    const t = setTimeout(() => setIsInteractionLocked(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleScoutConfirm = useCallback((pid: string, skill: SkillType) => {
    onAdd(teamId, pid, skill);
  }, [onAdd, teamId]);

  const handleAddWrapper = useCallback(() => {
    if (isInteractionLocked) return;
    audio.playTap(); // audio is already stable
    if (config.enablePlayerStats) {
      hapticsRef.current.impact('light'); // use ref to avoid dependency
      setShowScout(true);
    } else {
      onAdd(teamId);
    }
  }, [config.enablePlayerStats, onAdd, teamId, audio, isInteractionLocked]);
  // Note: hapticsRef.current is NOT in deps - this is intentional and safe

  const handleSubtractWrapper = useCallback(() => {
    onSubtract();
  }, [onSubtract]);

  const handleInteractionStart = useCallback((e: React.PointerEvent) => {
    if (isLocked) return;
    setIsPressed(true);
    onInteractionStart?.();

    if (containerRef.current && perf.visual.rippleEffects) {
      const rect = containerRef.current.getBoundingClientRect();
      setRipple({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        id: Date.now(),
      });
    }
  }, [onInteractionStart, isLocked, perf.visual.rippleEffects]);

  const handleInteractionEnd = useCallback(() => {
    setIsPressed(false);
    onInteractionEnd?.();
  }, [onInteractionEnd]);

  const handlePointerCancel = useCallback(() => {
    setIsPressed(false);
    onInteractionEnd?.();
  }, [onInteractionEnd]);

  // --- Gesture Engine ---
  const gestureHandlers = useScoreGestures({
    onAdd: handleAddWrapper,
    onSubtract: handleSubtractWrapper,
    isLocked: isLocked || isInteractionLocked,
    onInteractionStart: handleInteractionStart,
    onInteractionEnd: handleInteractionEnd,
  });

  return {
    // Estado visual
    showScout,
    isPressed,
    ripple,
    haloMode,
    isCritical,
    resolvedColor,

    // Refs
    containerRef,

    // Handlers
    handleScoutClose,
    handleScoutConfirm,
    gestureHandlers,
    handlePointerCancel,

    // Serviços (expose original haptics for components that need it)
    haptics,
  };
};
```

**MUDANÇAS REALIZADAS:**
1. Adicionado `useRef` e `useEffect` para armazenar `haptics` em ref
2. Modificado `handleAddWrapper` para usar `hapticsRef.current.impact('light')` ao invés de `haptics.impact('light')`
3. Removido `haptics` da dependency array de `handleAddWrapper` (seguro porque usa ref)
4. Comentários explicando a técnica

---

## 5. Correções Complementares (Opcionais - Médio Impacto)

### 5.1 Eliminar polling do HaloPortal

**Arquivo:** `src/components/ui/HaloPortal.tsx`

**SEARCH:**
```typescript
        // Low-frequency poll (5x/s) detects movement from swaps, layout shifts, etc.
        // Cost: one getBoundingClientRect per 200ms = negligible
        const pollId = setInterval(() => {
            const moved = measure();
            if (moved) {
                // Movement detected — switch to RAF for smooth tracking
                startSmooth();
            }
        }, 200);
```

**REPLACE:**
```typescript
        // REMOVED: Low-frequency polling (was causing 5 getBoundingClientRect/s per card)
        // Now relying exclusively on ResizeObserver + window resize events
        // If swap animations are choppy, add event-driven trigger from swap handler
```

**SEARCH:**
```typescript
        return () => {
            clearInterval(pollId);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (rafStopRef.current) clearTimeout(rafStopRef.current);
            ro.disconnect();
            window.removeEventListener('resize', onResize);
        };
```

**REPLACE:**
```typescript
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (rafStopRef.current) clearTimeout(rafStopRef.current);
            ro.disconnect();
            window.removeEventListener('resize', onResize);
        };
```

**NOTA:** Se animações de swap ficarem desalinhadas, adicionar trigger explícito no `handleToggleSides`:
```typescript
// Em useGameHandlers.ts ou onde o swap é feito:
const handleToggleSides = useCallback(() => {
    toggleSides();
    // Trigger halo re-measure (se necessário)
    window.dispatchEvent(new Event('swapSides'));
}, [toggleSides]);
```

---

### 5.2 Limpar parâmetros não usados do useHudMeasure

**Arquivo:** `src/hooks/useHudMeasure.ts`

**SEARCH:**
```typescript
interface UseHudMeasureProps {
  leftScoreEl: HTMLElement | null;
  rightScoreEl: HTMLElement | null;
  enabled?: boolean;
  maxSets: number;
  version?: number;
}
```

**REPLACE:**
```typescript
interface UseHudMeasureProps {
  // REMOVED: leftScoreEl and rightScoreEl were unused in calculations
  // HUD positioning is purely window-based (centered)
  enabled?: boolean;
  maxSets: number;
  version?: number;
}
```

**SEARCH:**
```typescript
export function useHudMeasure({
  leftScoreEl,
  rightScoreEl,
  enabled = true,
  maxSets,
  version = 0
}: UseHudMeasureProps): HudPlacement {
```

**REPLACE:**
```typescript
export function useHudMeasure({
  enabled = true,
  maxSets,
  version = 0
}: UseHudMeasureProps): HudPlacement {
```

**Arquivo:** `src/components/layouts/FullscreenLayout.tsx`

**SEARCH:**
```typescript
    // --- LOCAL STATE ---
    const [interactingTeam, setInteractingTeam] = useState<TeamId | null>(null);
    const [scoreElA, setScoreElA] = useState<HTMLElement | null>(null);
    const [scoreElB, setScoreElB] = useState<HTMLElement | null>(null);
```

**REPLACE:**
```typescript
    // --- LOCAL STATE ---
    const [interactingTeam, setInteractingTeam] = useState<TeamId | null>(null);
```

**SEARCH:**
```typescript
    const hudPlacement = useHudMeasure({
        leftScoreEl: scoreElA,
        rightScoreEl: scoreElB,
        enabled: !config.voiceControlEnabled,
        maxSets: config.maxSets
    });
```

**REPLACE:**
```typescript
    const hudPlacement = useHudMeasure({
        enabled: !config.voiceControlEnabled,
        maxSets: config.maxSets
    });
```

**SEARCH (remover scoreRefCallback das props dos ScoreCardFullscreen - 2 ocorrências):**
```typescript
                            scoreRefCallback={setScoreElA}
```

**REPLACE:**
```typescript
                            {/* scoreRefCallback removed - not used by HUD */}
```

**SEARCH:**
```typescript
                            scoreRefCallback={setScoreElB}
```

**REPLACE:**
```typescript
                            {/* scoreRefCallback removed - not used by HUD */}
```

**Arquivo:** `src/components/ScoreCardFullscreen.tsx`

**SEARCH (na interface):**
```typescript
    scoreRefCallback?: (node: HTMLElement | null) => void;
```

**REPLACE:**
```typescript
    // scoreRefCallback removed - was unused by HUD measurement
```

**SEARCH (no componente):**
```typescript
    scoreRefCallback, isServing, isLastScorer = false, config, colorTheme
```

**REPLACE:**
```typescript
    isServing, isLastScorer = false, config, colorTheme
```

**SEARCH (no ScoreNumberDisplay):**
```typescript
    scoreRefCallback?: (node: HTMLElement | null) => void;
```

**REPLACE:**
```typescript
    // scoreRefCallback prop removed
```

**SEARCH:**
```typescript
    scoreRefCallback,
```

**REPLACE:**
```typescript
    // scoreRefCallback removed
```

**SEARCH:**
```typescript
                <div ref={scoreRefCallback} className="overflow-visible">
```

**REPLACE:**
```typescript
                <div className="overflow-visible">
```

---

## 6. Checklist de Implementação

### Ordem de Execução Recomendada:

- [ ] **1. Timer Isolation (GameContext + useTimerSync)**
  - [ ] 1.1 Atualizar interface `ScoreContextState` (remover timer fields)
  - [ ] 1.2 Atualizar useMemo do `scoreState` (remover deps de timer)
  - [ ] 1.3 Refatorar `useTimerSync.ts` (eliminar dispatch a cada segundo)
  - [ ] 1.4 Buscar e atualizar consumidores de `matchDurationSeconds`/`isTimerRunning`

- [ ] **2. Fullscreen Stacking Context**
  - [ ] 2.1 Envolver FullscreenLayout em `<div className="relative z-10 w-full h-full flex flex-col">`
  - [ ] 2.2 Adicionar `z-[1]` aos motion.div wrappers do GameScreen

- [ ] **3. GameScreen Stabilization**
  - [ ] 3.1 Memoizar `voiceState` com useMemo
  - [ ] 3.2 Criar `handleExitFullscreen` e `handleEnterFullscreen` com useCallback
  - [ ] 3.3 Substituir inline arrow functions pelas refs estáveis
  - [ ] 3.4 Ajustar AnimatePresence transition (spring → tween)

- [ ] **4. useScoreCardLogic Optimization**
  - [ ] 4.1 Adicionar `hapticsRef` com useRef
  - [ ] 4.2 Atualizar `handleAddWrapper` para usar ref
  - [ ] 4.3 Remover `haptics` da dependency array

- [ ] **5. Opcional: HaloPortal Polling**
  - [ ] 5.1 Remover setInterval de 200ms
  - [ ] 5.2 Testar animações de swap
  - [ ] 5.3 Se necessário, adicionar evento explícito 'swapSides'

- [ ] **6. Opcional: useHudMeasure Cleanup**
  - [ ] 6.1 Remover props `leftScoreEl`/`rightScoreEl` da interface
  - [ ] 6.2 Remover estados `scoreElA`/`scoreElB` do FullscreenLayout
  - [ ] 6.3 Remover prop `scoreRefCallback` do ScoreCardFullscreen

---

## 7. Validação e Testes

### 7.1 Métricas de Sucesso

Após implementação, validar:

| Métrica | Como medir | Antes | Alvo |
|---------|-----------|-------|------|
| Re-renders/segundo (idle) | React DevTools Profiler | ~25-35 | 0-2 |
| Re-renders por ponto | React DevTools Profiler | ~50+ | 8-12 |
| Transição para Fullscreen | Visual + timer | 300-500ms flickering | <200ms smooth |
| Conteúdo visível Fullscreen | Inspeção visual | Parcial | 100% |
| Long tasks >50ms | Chrome DevTools Performance | Frequentes | Raras |

### 7.2 Testes Manuais

1. **Flickering:**
   - ✅ Deixar jogo em idle (sem marcar pontos) por 10 segundos
   - ✅ Observar se placar pisca a cada segundo → **NÃO DEVE piscar**

2. **Fullscreen Fantasma:**
   - ✅ Entrar em fullscreen
   - ✅ Verificar se placar, nomes e botões estão visíveis → **DEVEM estar visíveis**
   - ✅ Verificar se background glow aparece → **DEVE aparecer sem encobrir**

3. **Performance na Marcação:**
   - ✅ Marcar 10 pontos seguidos rapidamente
   - ✅ Observar lag ou travamento → **NÃO DEVE travar**

4. **Animações:**
   - ✅ Swap de lados (toggleSides)
   - ✅ Halos devem acompanhar os números → **DEVE acompanhar suavemente**

---

## 8. Notas Adicionais

### 8.1 Sobre useGameAudio

**O hook já está otimizado!** Retorna objeto estável com `useMemo(() => ({ ... }), [])`. Não precisa de modificação.

### 8.2 Sobre useHaptics

O hook recria callbacks quando `enabled` ou `isNativePlatform` mudam. Como `enabled` é fixo (true) no useScoreCardLogic, a instabilidade vem de mudanças de plataforma (raro). A solução com `useRef` no useScoreCardLogic é suficiente e não requer modificar o hook original.

### 8.3 Sobre TimerContext

A arquitetura split do TimerContext (Controls vs Value) já está **perfeitamente implementada**. A correção se resume a **parar de despachar matchDurationSeconds para o GameState**.

### 8.4 BackgroundGlow Portal Strategy

Alternativa avançada (não obrigatória): ao invés de `createPortal`, renderizar inline com `position: fixed` e `z-0`. Isso garantiria respeito ao stacking context natural. Porém, a solução com z-index explícito no FullscreenLayout já resolve o problema.

---

**FIM DA SPEC**
