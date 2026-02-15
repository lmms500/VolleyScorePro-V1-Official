# PRD — Debug Crítico: Estabilidade e Visibilidade do Placar

**Data:** 2026-02-14
**Autor:** Claude (Arquiteto de Software / Especialista em Performance React)
**Escopo:** Flickering do placar, Fullscreen "fantasma", Lags na marcação de pontos

---

## 1. Diagnóstico da Causa Raiz

### 1.1 Fullscreen "Fantasma" — Conteúdo invisível

**Severidade:** Crítica
**Sintoma:** Ao entrar em fullscreen, apenas BackgroundGlow e Halos aparecem. Placar, nomes e botões estão invisíveis.

**Causa Raiz Identificada: Competição de z-index + `createPortal` sobrepondo o conteúdo**

| Camada | Componente | z-index / Posicionamento | Problema |
|--------|-----------|--------------------------|----------|
| Background | `BackgroundGlow` (animated mode) | `createPortal → document.body`, `z-[-1]` com `inset: -150` | Renderizado **fora** do container React; `mix-blend-multiply` + `saturate-150` + `blur-[90px]` com opacity 0.6-0.8 em fullscreen **pode encobrir conteúdo** quando o stacking context é reiniciado |
| Halo (Normal) | `HaloPortal` | `createPortal → document.body`, `fixed z-0` | Portal global com `z-0` — fica **acima** do container do fullscreen no stacking order do body |
| Layout | `motion.div` (GameScreen) | `absolute inset-0` | O wrapper do `AnimatePresence` tem `initial={{ opacity: 0 }}` — se a animação spring não resolver corretamente, **o conteúdo fica preso em `opacity: 0`** |
| Conteúdo | `FullscreenLayout` children | Renderizado como Fragment (`<>`) | **Sem container próprio com z-index definido** — os filhos competem diretamente com os portais no document.body |

**Diagnóstico detalhado:**

1. **`AnimatePresence mode="wait"` + spring transition:** O `mode="wait"` no `GameScreen:199` exige que o layout `normal` complete seu `exit` **antes** de montar o `fullscreen`. A transição spring (`stiffness: 300, damping: 30`) pode levar ~300-500ms para resolver. Se o componente desmonta/remonta durante essa janela (ex: por re-render do contexto), o `AnimatePresence` reinicia o ciclo e o `fullscreen` nunca chega a `opacity: 1`.

2. **BackgroundGlow em fullscreen aumenta opacity para 0.6-0.8:** No modo animated (`GameScreen:185-190`), o `BackgroundGlow` renderiza via `createPortal` no `document.body` com `blur-[90px]` e circles de `70vmax`. Em fullscreen, a opacity sobe para 0.60-0.80. Como o portal está **fora** da árvore React do fullscreen layout, ele não respeita o stacking context do `motion.div` wrapper, podendo pintar **sobre** o conteúdo.

3. **`FullscreenLayout` retorna Fragment (`<>`):** Diferente do `NormalLayout` que tem containers com z-index explícito, o `FullscreenLayout:118` retorna um Fragment. Isso significa que `MeasuredFullscreenHUD`, `FloatingTopBar`, `FloatingControlBar` e o `div` dos score cards **não compartilham um stacking context isolado**. Eles são filhos diretos do `motion.div` do `GameScreen`, mas competem no z-stack com os portais do `BackgroundGlow` e `HaloPortal`.

4. **`useHudMeasure` não depende dos elementos DOM:** O `calculateLayout` (`useHudMeasure:38-78`) ignora `leftScoreEl` e `rightScoreEl` — calcula posição apenas com `window.innerWidth/Height`. Os parâmetros `scoreElA`/`scoreElB` são passados (`FullscreenLayout:111-116`) mas **nunca usados** no cálculo. Isso não causa o "fantasma" diretamente, mas significa que o HUD pode estar posicionado corretamente mesmo quando os score cards estão invisíveis, gerando a ilusão de que "só o glow aparece".

### 1.2 Flickering do Placar (Normal + Fullscreen)

**Severidade:** Alta
**Sintoma:** O placar pisca e trava em ambos os modos.

**Causa Raiz: Cadeia de re-renders a cada segundo via `useTimerSync`**

```
Timer tick (1s)
  → timerValue.seconds muda
  → useTimerSync Effect #3 dispara setState({ type: 'SET_MATCH_DURATION' })
  → useReducer no useVolleyGame produz novo state
  → game.state.matchDurationSeconds muda
  → ScoreContext memo recalcula (matchDurationSeconds está nas deps)
  → TODOS os consumidores de useScore() re-renderizam
  → ScoreCardNormal, ScoreCardFullscreen, FullscreenLayout, NormalLayout...
  → Cada ScoreCard recria AnimatePresence, motion.div, ScoreTicker
  → FLICKERING
```

**Prova no código:**

- `GameContext.tsx:159`: `game.state.matchDurationSeconds` está na dependency array do `useMemo` do `scoreState`
- `useTimerSync.ts:36-41`: Effect #3 dispara `setState` **a cada segundo** quando `timerValue.seconds !== matchDurationSeconds`
- Isso invalida o `scoreState` memo **a cada segundo**, causando re-render em cascata de **todo componente** que chama `useScore()`

**Agravantes:**

1. **`useCombinedGameState` amplifica o problema:** Consumido no `GameScreen:89`, depende de `[scoreState, logState, rosterState]`. Como `scoreState` muda a cada segundo, `combinedState` também muda. Isso é passado para `useSensoryFX(combinedState)` e `useScoreAnnouncer({ state: combinedState })`, potencialmente triggerando mais side-effects.

2. **`voiceState` recriado a cada render:** Em `GameScreen:167`, `const voiceState = { isListening, toggleListening }` cria um **novo objeto** a cada render. Como é passado como prop para `FullscreenLayout` e `NormalLayout`, esses componentes re-renderizam mesmo que `isListening`/`toggleListening` não tenham mudado.

3. **`onExitFullscreen={() => setIsFullscreen(false)}`:** Arrow function inline (`GameScreen:216`) cria nova referência a cada render, invalidando qualquer `memo` no `FullscreenLayout`.

4. **`useScoreCardLogic` recria callbacks quando `audio`/`haptics` mudam:** `handleAddWrapper` (`useScoreCardLogic:78-87`) depende de `audio` e `haptics`. Se esses hooks retornam novas referências (provável — `useGameAudio` e `useHaptics` são chamados dentro do hook), os callbacks mudam a cada render, invalidando o `memo` do `ScoreCardFullscreen`.

### 1.3 Lags na Marcação de Pontos

**Severidade:** Alta
**Sintoma:** Engasgos ao tocar para marcar ponto.

**Causa Raiz: Acumulação de trabalho síncrono + animações concorrentes**

1. **Caminho crítico do `addPoint`:**
   ```
   Tap → useScoreGestures → handleAddWrapper
     → audio.playTap() (Web Audio API — síncrono se buffer não carregado)
     → setShowScout(true) OU addPoint(teamId)
     → useReducer dispatch → novo state
     → ScoreContext invalida → re-render cascade
     → HaloBackground flash effect (setTimeout + setState)
     → ScoreTicker animação (framer-motion)
     → BackgroundGlow re-render (portal)
     → HaloPortal re-measure (getBoundingClientRect + setPosition)
     → useTimerSync Effect #3 (setState novamente)
   ```

2. **`HaloPortal` polling a 200ms:** `HaloPortal:62-67` faz `setInterval(measure, 200)` com `getBoundingClientRect` — 5 chamadas/segundo **por ScoreCard** no modo Normal. Isso força recalculation de layout (layout thrashing) durante animações.

3. **`LayoutGroup` + `layout` prop em múltiplos componentes:** `ScoreCardNormal` usa `GlassSurface` com `layout` e `layoutId`, e `FullscreenLayout:174` envolve os cards em `LayoutGroup`. Layout animations do framer-motion trigam `getBoundingClientRect` síncronos em cada frame de animação.

4. **`SuddenDeathOverlay` ativo durante jogo:** Montado sempre no `GameScreen:191-193`, re-renderiza quando `inSuddenDeath` ou `isMatchOver` mudam — mas como está no mesmo `AnimatePresence` tree, pode competir por recursos de animação.

---

## 2. Análise de Performance — Mapa de Re-renders

### 2.1 Fluxo de Re-render por Tick do Timer (a cada 1 segundo)

```
useTimerSync Effect #3
  └→ setState({ type: 'SET_MATCH_DURATION' })
      └→ useVolleyGame reducer produz novo state
          └→ GameProvider re-renders
              ├→ scoreState useMemo INVALIDA (matchDurationSeconds mudou)
              │   ├→ GameScreen (useScore consumer)
              │   │   ├→ useCombinedGameState INVALIDA
              │   │   │   ├→ useSensoryFX(combinedState) — possíveis side effects
              │   │   │   └→ useScoreAnnouncer — possíveis side effects
              │   │   ├→ voiceState = { ... } — NOVA REFERÊNCIA
              │   │   ├→ BackgroundGlow re-render
              │   │   └→ AnimatePresence re-avaliar children
              │   ├→ FullscreenLayout (useScore consumer)
              │   │   ├→ ScoreCardFullscreen A re-render
              │   │   │   ├→ useScoreCardLogic — callbacks possivelmente novos
              │   │   │   ├→ HaloBackground re-render
              │   │   │   └→ ScoreTicker re-render
              │   │   ├→ ScoreCardFullscreen B re-render
              │   │   ├→ MeasuredFullscreenHUD re-render
              │   │   └→ FloatingControlBar re-render
              │   └→ NormalLayout (useScore consumer)
              │       ├→ ScoreCardContainer → ScoreCardNormal A/B re-render
              │       ├→ HaloPortal × 2 re-measure
              │       └→ HistoryBar re-render
              └→ rosterState/logState — SEM mudança (correto)
```

**Estimativa de componentes afetados por tick:** ~25-35 componentes
**Frequência:** 1x/segundo
**Resultado:** Main thread ocupada 50-100ms por segundo com re-renders desnecessários

### 2.2 Componentes que NÃO precisam re-renderizar no tick

| Componente | Consome `matchDurationSeconds`? | Deveria re-renderizar? |
|---|---|---|
| ScoreCardNormal | Não | **Não** |
| ScoreCardFullscreen | Não | **Não** |
| HaloBackground | Não | **Não** |
| HaloPortal | Não | **Não** |
| FloatingControlBar | Não | **Não** |
| FloatingTopBar | Não | **Não** |
| Controls | Não | **Não** |
| HistoryBar | Não | **Não** |
| BackgroundGlow | Não | **Não** |

### 2.3 `useCombinedGameState` — Amplificador de Re-renders

O hook em `useCombinedGameState.ts:26-80` depende de `[scoreState, logState, rosterState]`. Como `scoreState` é um **objeto novo** a cada invalidação do memo no `GameContext`, o `useMemo` do `useCombinedGameState` **sempre invalida** quando qualquer campo do ScoreContext muda — incluindo `matchDurationSeconds`.

Consumidores afetados:
- `useSensoryFX(combinedState)` — re-executa effects
- `useScoreAnnouncer({ state: combinedState })` — re-avalia anúncios
- `BroadcastScreen` (se ativo) — re-render completo

---

## 3. Plano de Correção

### 3.1 [CRÍTICO] Extrair `matchDurationSeconds` e `isTimerRunning` do ScoreContext

**Problema:** Timer polui o hot path do score, causando re-render a cada segundo.

**Solução:** Criar um `TimerDisplayContext` separado (ou mover para o `TimerContext` existente).

```
Antes: ScoreContext = { scoreA, scoreB, ..., matchDurationSeconds, isTimerRunning }
Depois: ScoreContext = { scoreA, scoreB, ... }  (SEM timer)
         TimerContext = { matchDurationSeconds, isTimerRunning, seconds, ... }
```

**Arquivos afetados:**
- `src/contexts/GameContext.tsx` — remover `matchDurationSeconds` e `isTimerRunning` das deps do `scoreState`
- `src/hooks/useTimerSync.ts` — consumir/produzir via TimerContext diretamente, sem dispatch para o reducer principal
- Componentes que exibem timer (se houver) — migrar para `useTimerValue()`

**Impacto esperado:** Elimina ~25 re-renders/segundo. ScoreContext só invalida em eventos de pontuação real.

### 3.2 [CRÍTICO] Corrigir stacking context do Fullscreen

**Problema:** Fragment no `FullscreenLayout` + portais no `document.body` criam competição de z-index.

**Solução:**

1. Envolver o conteúdo do `FullscreenLayout` em um `div` com `position: relative` e `z-index` explícito (`z-[10]` ou superior), criando um **stacking context isolado**.

2. Garantir que o `motion.div` wrapper no `GameScreen` (que faz a transição `opacity: 0 → 1`) tenha `z-index` superior aos portais do `BackgroundGlow`.

3. Considerar mover o `BackgroundGlow` animated mode para **dentro** da árvore React (usando CSS `position: fixed` no próprio componente) ao invés de `createPortal`, para respeitar o stacking context natural.

**Arquivos afetados:**
- `src/components/layouts/FullscreenLayout.tsx` — envolver children em container com z-index
- `src/screens/GameScreen.tsx` — adicionar `z-[1]` ao `motion.div` do fullscreen
- `src/components/ui/BackgroundGlow.tsx` — revisar estratégia de portal vs inline

### 3.3 [CRÍTICO] Estabilizar `AnimatePresence mode="wait"`

**Problema:** Re-renders durante a transição spring podem reiniciar o ciclo de animação, prendendo o componente em `opacity: 0`.

**Solução:**

1. Substituir a transição spring por uma transição `tween` com duração fixa e curta (~200ms) para o `initial/animate/exit` do layout switch.

2. Alternativa: usar `mode="sync"` ao invés de `mode="wait"` para permitir que o novo layout monte imediatamente sem esperar o exit do anterior.

3. Memoizar os children do `AnimatePresence` para evitar que re-renders do `GameScreen` causem remontagem dos layouts.

**Arquivos afetados:**
- `src/screens/GameScreen.tsx:199-238` — ajustar transition e/ou mode do AnimatePresence

### 3.4 [ALTO] Estabilizar referências de props no GameScreen

**Problema:** `voiceState`, `onExitFullscreen` e `onToggleFullscreen` são recriados a cada render.

**Solução:**

1. Memoizar `voiceState`:
   ```ts
   const voiceState = useMemo(() => ({ isListening, toggleListening }), [isListening, toggleListening]);
   ```

2. Extrair callbacks para `useCallback`:
   ```ts
   const handleExitFullscreen = useCallback(() => setIsFullscreen(false), []);
   const handleEnterFullscreen = useCallback(() => setIsFullscreen(true), []);
   ```

**Arquivos afetados:**
- `src/screens/GameScreen.tsx:167, 216, 235`

### 3.5 [ALTO] Estabilizar referências internas do `useScoreCardLogic`

**Problema:** `audio` e `haptics` possivelmente criam novas referências a cada render, invalidando callbacks memoizados.

**Solução:**

1. Verificar e garantir que `useGameAudio` e `useHaptics` retornam referências estáveis (memoizadas internamente).

2. Se não for possível estabilizar, usar `useRef` para armazenar `audio` e `haptics` e acessar via `.current` dentro dos callbacks:
   ```ts
   const audioRef = useRef(audio);
   audioRef.current = audio;
   // Em callbacks: audioRef.current.playTap()
   ```

**Arquivos afetados:**
- `src/hooks/useScoreCardLogic.ts`
- `src/hooks/useGameAudio.ts` (verificar memoização)
- `src/hooks/useHaptics.ts` (verificar memoização)

### 3.6 [MÉDIO] Eliminar polling do `HaloPortal`

**Problema:** `setInterval(measure, 200)` + `getBoundingClientRect` causa layout thrashing.

**Solução:**

1. Remover o `setInterval` de 200ms.
2. Manter apenas o `ResizeObserver` e o listener de `resize`/`orientationchange`.
3. Para acompanhar animações de swap, usar um `MutationObserver` no atributo `style` ou, melhor, disparar a medição via callback explícito quando o swap acontecer (event-driven ao invés de polling).

**Arquivos afetados:**
- `src/components/ui/HaloPortal.tsx`

### 3.7 [MÉDIO] Otimizar `useCombinedGameState`

**Problema:** Recria o objeto `GameState` completo sempre que qualquer contexto muda.

**Solução:**

1. **Curto prazo:** Após a correção 3.1, o `scoreState` só muda em eventos reais, reduzindo drasticamente a frequência de invalidação.

2. **Médio prazo:** Converter para usar `useRef` para dados voláteis (`matchDurationSeconds`) e só expor dados "estáveis" via o memo. Consumidores que precisam do timer leem diretamente do `TimerContext`.

3. **Longo prazo:** Considerar eliminar `useCombinedGameState` — cada consumidor deveria usar apenas o contexto que precisa (`useScore`, `useRoster`, `useLog`).

**Arquivos afetados:**
- `src/hooks/useCombinedGameState.ts`
- `src/screens/GameScreen.tsx` (reduzir uso do `combinedState`)

### 3.8 [BAIXO] useHudMeasure — Limpar parâmetros não utilizados

**Problema:** `leftScoreEl` e `rightScoreEl` são passados mas ignorados no cálculo.

**Solução:** Ou utilizar os elementos DOM para cálculo preciso do posicionamento, ou remover os parâmetros e simplificar a interface. Atualmente são dead code.

**Arquivos afetados:**
- `src/hooks/useHudMeasure.ts`
- `src/components/layouts/FullscreenLayout.tsx` (remover `setScoreElA/B` se não necessários)

---

## 4. Priorização e Ordem de Execução

| # | Correção | Severidade | Impacto | Esforço |
|---|----------|-----------|---------|---------|
| 1 | 3.1 — Extrair timer do ScoreContext | Crítico | Elimina flickering | Médio |
| 2 | 3.2 — Corrigir z-index do Fullscreen | Crítico | Restaura visibilidade | Baixo |
| 3 | 3.3 — Estabilizar AnimatePresence | Crítico | Elimina flash de opacity:0 | Baixo |
| 4 | 3.4 — Estabilizar props do GameScreen | Alto | Reduz re-renders em cascata | Baixo |
| 5 | 3.5 — Estabilizar refs do useScoreCardLogic | Alto | Previne invalidação de memo | Baixo |
| 6 | 3.6 — Eliminar polling do HaloPortal | Médio | Reduz layout thrashing | Baixo |
| 7 | 3.7 — Otimizar useCombinedGameState | Médio | Reduz amplificação | Médio |
| 8 | 3.8 — Limpar useHudMeasure | Baixo | Code hygiene | Baixo |

**Ordem recomendada:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

A correção #1 (timer) é a mais impactante pois elimina a causa raiz do re-render contínuo. As correções #2 e #3 resolvem o fullscreen fantasma. As demais são otimizações incrementais que previnem regressões futuras.

---

## 5. Métricas de Sucesso

| Métrica | Antes (estimado) | Depois (alvo) |
|---------|-------------------|---------------|
| Re-renders/segundo (idle com timer) | ~25-35 componentes | 0 (apenas timer display) |
| Re-renders por ponto marcado | ~50+ componentes | ~8-12 componentes |
| Tempo de transição Normal→Fullscreen | 300-500ms (com flicker) | <200ms (sem flicker) |
| Conteúdo visível no Fullscreen | Parcial/Invisível | 100% visível |
| Layout thrashing por HaloPortal | 10 getBoundingClientRect/s | 0 (event-driven) |
| Long tasks detectadas (>50ms) | Frequentes | Raras |
