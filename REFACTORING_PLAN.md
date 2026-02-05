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

### 5. App.tsx (509 → 45 linhas) - ✅ TOTALMENTE CONCLUÍDO
**Arquivo:** `src/App.tsx`

**O que foi feito:**
- Criada pasta `src/screens/` com:
  - `BroadcastScreen.tsx` (~35 linhas) - Tela dedicada para modo transmissão OBS/Spectator
  - `GameScreen.tsx` (~290 linhas) - Toda UI do jogo extraída do App.tsx
  - `index.ts` - Re-exports
- Criado `src/hooks/useTimeoutManager.ts` (~95 linhas) - Encapsula toda lógica de timeout
- Criado `src/hooks/useSyncManager.ts` (~175 linhas) - Encapsula toda lógica de VolleyLink Live
- App.tsx agora contém **APENAS providers** (~45 linhas)
- ScoreCardContainer usado no modo normal (reduz prop drilling)
- **Redução total:** 509 → 45 linhas (~91% menor!)
- **Build testado e funcionando**

---

## 📋 CHECKLIST DE EXECUÇÃO

Para cada arquivo refatorado:
- [x] Criar novos arquivos
- [x] Mover código preservando imports
- [x] Atualizar arquivo original para importar/re-exportar
- [x] `npm run build` - deve compilar sem erros
- [ ] Testar funcionalidade no app (manual)
- [ ] Commit se tudo OK

**Status:** Build passando ✅

---

## 🎯 COMANDO PARA NOVO CHAT

Cole isto no início do novo chat:

```
Estou continuando uma refatoração do VolleyScore Pro v2.

Leia o arquivo c:\Dev\VolleyScore-Pro\REFACTORING_PLAN.md para ver o que foi feito.

Todos os 5 itens principais foram concluídos:
- MotionScenes.tsx ✅ (1.308 → 32 linhas)
- TutorialVisuals.tsx ✅ (812 → 54 linhas)
- useVolleyGame.ts ✅ (356 → 126 linhas)
- ScoreCardContainer ✅ (novo componente)
- App.tsx ✅ (509 → 45 linhas) - **TOTALMENTE REFATORADO**

Novos arquivos criados:
- useTimeoutManager.ts (~95 linhas)
- useSyncManager.ts (~175 linhas)
- BroadcastScreen.tsx (~35 linhas)
- GameScreen.tsx (~290 linhas) ✅ NOVO

**Refatoração concluída!**
- App.tsx agora contém apenas providers
- GameScreen.tsx contém toda a UI do jogo
- ScoreCardContainer usado no modo normal

Siga a arquitetura definida no .clinerules do projeto.
```

---

## 📁 ESTRUTURA FINAL

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
│   ├── useTeamGenerator.ts   ✅ FEITO
│   ├── useTimeoutManager.ts  ✅ FEITO (novo)
│   └── useSyncManager.ts     ✅ FEITO (novo)
├── screens/                  ✅ FEITO
│   ├── BroadcastScreen.tsx   (~35 linhas)
│   ├── GameScreen.tsx        ✅ NOVO (~290 linhas)
│   └── index.ts
└── App.tsx                   ✅ REFATORADO (509 → 45 linhas - apenas providers)
```

---

*Última atualização: 2026-02-04 (Refatoração completa - App.tsx 509 → 45 linhas)*
