# Plano de Refatoração - VolleyScore Pro v2
## Clean Code para Desenvolvimento Assistido por IA

**Data:** 2026-02-04
**Status:** Em progresso

---

## ✅ CONCLUÍDO

### 1. MotionScenes.tsx (1.308 → 32 linhas)
**Arquivo original:** `src/components/tutorial/MotionScenes.tsx`

**O que foi feito:**
- Criada pasta `src/components/tutorial/scenes/`
- Dividido em 12 arquivos individuais:
  - `types.ts` - Interface MotionSceneProps
  - `TeamCompositionScene.tsx`
  - `PlayerStatsScene.tsx`
  - `DragDropScene.tsx`
  - `SubstitutionScene.tsx`
  - `RotationScene.tsx`
  - `SkillBalanceScene.tsx`
  - `BatchInputScene.tsx`
  - `MomentumScene.tsx`
  - `ScoutModeScene.tsx`
  - `ExportScene.tsx`
  - `VoiceControlScene.tsx`
  - `SettingsScene.tsx`
  - `index.ts` - Re-exports
- MotionScenes.tsx agora apenas re-exporta de `./scenes`
- **Build testado e funcionando**

---

### 2. TutorialVisuals.tsx (812 → 54 linhas)
**Arquivo original:** `src/components/tutorial/TutorialVisuals.tsx`

**O que foi feito:**
- Criada pasta `src/components/tutorial/visuals/`
- Dividido em 5 arquivos por categoria:
  - `types.ts` - VisualProps interface
  - `AppScenes.tsx` - AppLogoSVG, AppLogoVisual (~95 linhas)
  - `TeamScenes.tsx` - SceneCommandCenter, SceneDragDrop, SceneProfiles, SceneSubstitutions, SceneRotation, SceneBalance, SceneBatchInput (~280 linhas)
  - `HistoryScenes.tsx` - SceneHistorySummary, SceneMomentum, SceneScout, SceneExport (~175 linhas)
  - `SystemScenes.tsx` - SceneInstall, GesturesVisual, SettingsConfigVisual, AudioNarratorVisual (~175 linhas)
  - `index.ts` - Re-exports
- TutorialVisuals.tsx agora apenas importa dos novos arquivos e mantém o mapeador
- **Build testado e funcionando**

---

### 3. useVolleyGame.ts (356 → 126 linhas)
**Arquivo original:** `src/hooks/useVolleyGame.ts`

**O que foi feito:**
- Criados 4 hooks especializados em `src/hooks/`:
  - `useGameState.ts` (~60 linhas) - INITIAL_STATE + reducer + stateRef
  - `useGamePersistence.ts` (~110 linhas) - Load/save com split-state strategy
  - `useGameActions.ts` (~260 linhas) - Todas as actions wrapped com useCallback
  - `useTeamGenerator.ts` (~95 linhas) - generateTeams + balanceTeams
- `useVolleyGame.ts` agora é uma **FACADE** que compõe os hooks acima
- Interface de retorno 100% backward compatible
- **Build testado e funcionando**

---

### 4. ScoreCardContainer (MÉDIO RISCO)
**Arquivo original:** `src/App.tsx` (redução de props)

**O que foi feito:**
- Criado `src/components/containers/ScoreCardContainer.tsx`
- App.tsx agora usa `<ScoreCardContainer teamId="A|B" />`
- Reduzida a passagem de props (drill) em ~20 props por card
- **Build testado e funcionando**

---

## 🔄 PENDENTE

### 5. App.tsx (508 linhas) - ⚠️ ALTO RISCO

**Arquivo:** `src/App.tsx`

**ATENÇÃO:** Núcleo do app. Usar Opus 4.5.

**Plano de execução:**
1. App.tsx já está mais limpo com ScoreCardContainer
2. Extrair lógicas isoladas:

```
src/
├── App.tsx                     # Apenas providers (~50 linhas)
├── screens/
│   ├── GameScreen.tsx          # GameContent atual (~250 linhas)
│   ├── BroadcastScreen.tsx     # Modo transmissão OBS (~50 linhas)
│   └── components/
│       ├── TimeoutManager.tsx  # Lógica de timeout (~80 linhas)
│       └── SyncManager.tsx     # Lógica VolleyLink (~100 linhas)
```

3. **Ordem de extração:**
   - Primeiro: Extrair BroadcastScreen (linhas 366-373)
   - Segundo: Extrair TimeoutManager (linhas 102-134)
   - Terceiro: Extrair SyncManager (linhas 147-241)
   - Quarto: Limpar GameContent com ScoreCardContainer

---

## 📋 CHECKLIST DE EXECUÇÃO

Para cada arquivo refatorado:
- [ ] Criar novos arquivos
- [ ] Mover código preservando imports
- [ ] Atualizar arquivo original para importar/re-exportar
- [ ] `npm run build` - deve compilar sem erros
- [ ] Testar funcionalidade no app
- [ ] Commit se tudo OK

---

## 🎯 COMANDO PARA NOVO CHAT

Cole isto no início do novo chat:

```
Estou continuando uma refatoração do VolleyScore Pro v2.

Leia o arquivo c:\Dev\VolleyScore-Pro\REFACTORING_PLAN.md para ver o que foi feito e o que falta.

Os itens 1, 2, 3 e 4 já foram concluídos:
- MotionScenes.tsx ✅
- TutorialVisuals.tsx ✅
- useVolleyGame.ts ✅
- ScoreCardContainer ✅

Continue com o item 5 (App.tsx) - é ALTO RISCO e quero usar Opus 4.5.

Siga a arquitetura definida no .clinerules do projeto.
```

---

## 📁 ESTRUTURA FINAL ESPERADA

```
src/
├── components/
│   ├── tutorial/
│   │   ├── scenes/           ✅ FEITO
│   │   │   ├── types.ts
│   │   │   ├── *.Scene.tsx (12 arquivos)
│   │   │   └── index.ts
│   │   ├── visuals/          ✅ FEITO
│   │   │   ├── types.ts
│   │   │   ├── AppScenes.tsx
│   │   │   ├── TeamScenes.tsx
│   │   │   ├── HistoryScenes.tsx
│   │   │   ├── SystemScenes.tsx
│   │   │   └── index.ts
│   │   ├── MotionScenes.tsx  ✅ REFATORADO (re-export)
│   │   └── TutorialVisuals.tsx ✅ REFATORADO (mapeador)
│   └── containers/           ✅ FEITO
│       └── ScoreCardContainer.tsx
├── hooks/
│   ├── useVolleyGame.ts      ✅ REFATORADO (facade)
│   ├── useGameState.ts       ✅ FEITO
│   ├── useGamePersistence.ts ✅ FEITO
│   ├── useGameActions.ts     ✅ FEITO
│   └── useTeamGenerator.ts   ✅ FEITO
├── screens/                  ⏳ PENDENTE
│   ├── GameScreen.tsx
│   └── BroadcastScreen.tsx
└── App.tsx                   ⏳ PENDENTE (será simplificado)
```

---

*Última atualização: 2026-02-04 (Item 4 concluído - ScoreCardContainer)*
