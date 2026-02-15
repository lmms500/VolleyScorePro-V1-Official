# PRD - Lote 5: Reorganização Estrutural de Pastas (Feature-Based Architecture)

> **Status:** PLANEJAMENTO
> **Data:** 2026-02-14
> **Autor:** Arquiteto de Software
> **Total de Arquivos:** ~238 arquivos em `src/`

---

## 1. Estrutura de Pastas Atual (Resumo)

```
src/
├── App.tsx                          # Entry point (Provider tree)
├── index.tsx                        # ReactDOM + PWA bootstrap
├── constants.ts                     # Game constants
├── types.ts                         # Re-export barrel (domain, ui, services)
├── vite-env.d.ts
├── index.css
├── metadata.json
│
├── config/                          # 3 arquivos
│   ├── featureFlags.ts
│   ├── gameModes.ts
│   └── performanceModes.ts
│
├── data/                            # 1 arquivo
│   └── tutorialContent.ts
│
├── locales/                         # 3 arquivos (en, es, pt)
│
├── theme/                           # 2 arquivos (colors, spacing)
│
├── types/                           # 3 arquivos (domain, services, ui)
│
├── components/                      # 112 arquivos (!)
│   ├── Controls.tsx                 # Controles do jogo
│   ├── HistoryBar.tsx               # Barra de histórico inline
│   ├── MeasuredFullscreenHUD.tsx    # HUD fullscreen
│   ├── PlayerCard.tsx               # Card de jogador (DnD)
│   ├── ScoreCardFullscreen.tsx      # Placar fullscreen
│   ├── ScoreCardNormal.tsx          # Placar normal
│   ├── Ads/SmartBanner.tsx
│   ├── Broadcast/ (2)
│   ├── containers/ScoreCardContainer.tsx
│   ├── Court/ (4)
│   ├── Fullscreen/ (4)
│   ├── History/ (5)
│   ├── layouts/ (5)
│   ├── modals/ (16)
│   ├── Settings/ (4)
│   ├── Share/ (1)
│   ├── Social/ (1)
│   ├── TeamManager/ (9)
│   ├── tutorial/ (3 + 13 scenes + 6 visuals)
│   └── ui/ (25)
│
├── contexts/                        # 11 arquivos
│   ├── AuthContext.tsx
│   ├── GameContext.tsx
│   ├── LanguageContext.tsx
│   ├── LayoutContext.tsx
│   ├── ModalContext.tsx
│   ├── NotificationContext.tsx
│   ├── PerformanceContext.tsx
│   ├── ResponsiveContext.tsx
│   ├── ThemeContext.tsx
│   ├── TimeoutContext.tsx
│   └── TimerContext.tsx
│
├── hooks/                           # 40 arquivos (flat, sem agrupamento)
│
├── reducers/                        # 5 arquivos
│   ├── gameReducer.ts
│   ├── meta.ts, roster.ts, scoring.ts
│   └── __tests__/
│
├── screens/                         # 3 arquivos
│   ├── BroadcastScreen.tsx
│   ├── GameScreen.tsx
│   └── index.ts
│
├── services/                        # 16 arquivos
│   ├── AdService.ts, AnalysisEngine.ts, AudioService.ts
│   ├── BackupService.ts, firebase.ts, GeminiCommandService.ts
│   ├── ImageService.ts, io.ts, PDFService.ts, PlatformService.ts
│   ├── SecureStorage.ts, SocialService.ts, SyncEngine.ts
│   ├── SyncService.ts, TimeoutSyncService.ts, TTSService.ts
│   ├── VoiceCommandParser.ts, VoiceRecognitionService.ts
│   └── ai/schemas.ts
│
├── stores/                          # 2 arquivos
│   ├── historyStore.ts
│   └── rosterStore.ts
│
└── utils/                           # 14 arquivos (flat, sem agrupamento)
```

### Problemas Identificados

| Problema | Detalhe |
|----------|---------|
| **`components/` é um "mega-bucket"** | 112 arquivos misturando domínios (Game, Teams, History, Settings, Broadcast, Tutorial) |
| **`hooks/` flat com 40 hooks** | Hooks de game, audio, sync, platform, UI todos no mesmo nível |
| **Arquivos "órfãos" em `components/`** | `Controls.tsx`, `HistoryBar.tsx`, `PlayerCard.tsx`, `MeasuredFullscreenHUD.tsx` sem pasta temática |
| **`modals/` mistura todos os domínios** | 16 modais de Game, Teams, History, Settings, Tutorial num só lugar |
| **Acoplamento alto via contextos** | `LanguageContext` importado por 54 arquivos, `GameContext` por 27 |
| **`types.ts` barrel no root** | 111 arquivos dependem de `../types` ou `../../types` |
| **Services sem agrupamento** | Voice (3 arquivos) e Sync (3 arquivos) misturados com Ad, Image, PDF |

---

## 2. Árvore de Diretórios Proposta

```
src/
├── App.tsx                              # Entry point (inalterado)
├── index.tsx                            # Bootstrap (inalterado)
├── index.css                            # Estilos globais
├── vite-env.d.ts
├── metadata.json
│
├── @types/                              # Tipos globais (barrel + domain, ui, services)
│   ├── index.ts                         # Re-export barrel (ex-types.ts)
│   ├── domain.ts
│   ├── services.ts
│   └── ui.ts
│
├── config/                              # Configurações globais (mantém)
│   ├── constants.ts                     # (ex-src/constants.ts)
│   ├── featureFlags.ts
│   ├── gameModes.ts
│   └── performanceModes.ts
│
├── locales/                             # i18n (mantém)
│   ├── en.json
│   ├── es.json
│   └── pt.json
│
├── theme/                               # Design tokens (mantém)
│   ├── colors.ts
│   └── spacing.ts
│
├── ui/                                  # Design System Atômico (componentes reutilizáveis)
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── BackgroundGlow.tsx
│   ├── Confetti.tsx
│   ├── CriticalPointAnimation.tsx
│   ├── ErrorBoundary.tsx
│   ├── FloatingTimeout.tsx
│   ├── GestureHint.tsx
│   ├── GlassSurface.tsx
│   ├── GlobalLoader.tsx
│   ├── HaloBackground.tsx
│   ├── HaloPortal.tsx
│   ├── IconButton.tsx
│   ├── InstallReminder.tsx
│   ├── Modal.tsx
│   ├── ModalHeader.tsx
│   ├── NotificationToast.tsx
│   ├── PageIndicator.tsx
│   ├── ReloadPrompt.tsx
│   ├── ScoreTicker.tsx
│   ├── SkillSlider.tsx
│   ├── TeamLogo.tsx
│   ├── ToggleGroup.tsx
│   ├── TrackingGlow.tsx
│   ├── VoiceToast.tsx
│   └── index.ts
│
├── layouts/                             # Layouts globais de página
│   ├── FullscreenLayout.tsx
│   ├── NormalLayout.tsx
│   ├── CourtPage.tsx
│   ├── GameOverlays.tsx
│   └── HorizontalPagesContainer.tsx
│
├── contexts/                            # Contextos globais (cross-feature)
│   ├── AuthContext.tsx
│   ├── LanguageContext.tsx
│   ├── LayoutContext.tsx
│   ├── ModalContext.tsx
│   ├── NotificationContext.tsx
│   ├── PerformanceContext.tsx
│   ├── ResponsiveContext.tsx
│   └── ThemeContext.tsx
│
├── lib/                                 # Serviços e infra compartilhados
│   ├── firebase.ts
│   ├── audio/
│   │   └── AudioService.ts
│   ├── haptics/
│   │   └── useHaptics.ts               # (ex-hooks/useHaptics.ts)
│   ├── platform/
│   │   ├── PlatformService.ts
│   │   ├── usePlatform.ts              # (ex-hooks/usePlatform.ts)
│   │   ├── useKeepAwake.ts
│   │   ├── useImmersiveMode.ts
│   │   ├── useNativeIntegration.ts
│   │   ├── useSafeAreaInsets.ts
│   │   └── deviceDetection.ts          # (ex-utils/deviceDetection.ts)
│   ├── storage/
│   │   ├── SecureStorage.ts
│   │   └── BackupService.ts
│   ├── ads/
│   │   ├── AdService.ts
│   │   ├── useAdFlow.ts
│   │   └── useAdLifecycle.ts
│   ├── pwa/
│   │   ├── useServiceWorker.ts
│   │   ├── usePWAInstallPrompt.ts
│   │   └── useOnlineStatus.ts
│   ├── image/
│   │   └── ImageService.ts
│   └── utils/                           # Utilitários puros (sem domínio)
│       ├── animations.ts
│       ├── colors.ts
│       ├── colorsDynamic.ts
│       ├── logger.ts
│       ├── responsive.ts
│       ├── security.ts
│       ├── stringUtils.ts
│       └── validation.ts
│
├── features/
│   │
│   ├── game/                            # CORE: Mecânica do jogo
│   │   ├── screens/
│   │   │   └── GameScreen.tsx
│   │   ├── components/
│   │   │   ├── ScoreCardFullscreen.tsx
│   │   │   ├── ScoreCardNormal.tsx
│   │   │   ├── ScoreCardContainer.tsx
│   │   │   ├── Controls.tsx
│   │   │   ├── HistoryBar.tsx
│   │   │   ├── MeasuredFullscreenHUD.tsx
│   │   │   ├── FloatingControlBar.tsx
│   │   │   ├── FloatingTopBar.tsx
│   │   │   ├── FullscreenMenuDrawer.tsx
│   │   │   └── TimeoutOverlay.tsx
│   │   ├── modals/
│   │   │   ├── MatchOverModal.tsx
│   │   │   ├── ScoutModal.tsx
│   │   │   ├── ConfirmationModal.tsx
│   │   │   └── ModalManager.tsx
│   │   ├── hooks/
│   │   │   ├── useVolleyGame.ts
│   │   │   ├── useGameState.ts
│   │   │   ├── useGameActions.ts
│   │   │   ├── useGameHandlers.ts
│   │   │   ├── useGamePersistence.ts
│   │   │   ├── useGameAudio.ts
│   │   │   ├── useScoreCardLogic.ts
│   │   │   ├── useScoreGestures.ts
│   │   │   ├── useScoreAnnouncer.ts
│   │   │   ├── useSensoryFX.ts
│   │   │   ├── useMatchLifecycle.ts
│   │   │   ├── useMatchSaver.ts
│   │   │   ├── useHorizontalPages.ts
│   │   │   ├── useHudMeasure.ts
│   │   │   ├── useCollider.ts
│   │   │   ├── useActiveTimeout.ts
│   │   │   ├── useTimeoutManager.ts
│   │   │   ├── useDynamicColorStyle.ts
│   │   │   ├── useAdaptiveAnimation.ts
│   │   │   ├── useElementSize.ts
│   │   │   └── useCombinedGameState.ts
│   │   ├── context/
│   │   │   ├── GameContext.tsx
│   │   │   ├── TimerContext.tsx
│   │   │   └── TimeoutContext.tsx
│   │   ├── reducers/
│   │   │   ├── gameReducer.ts
│   │   │   ├── meta.ts
│   │   │   ├── roster.ts
│   │   │   ├── scoring.ts
│   │   │   └── __tests__/
│   │   │       └── ghost_teams_repro.test.ts
│   │   └── utils/
│   │       ├── gameLogic.ts
│   │       └── balanceUtils.ts
│   │
│   ├── teams/                           # Gerenciamento de times e jogadores
│   │   ├── components/
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── AddPlayerForm.tsx
│   │   │   ├── BenchArea.tsx
│   │   │   ├── PlayerContextMenu.tsx
│   │   │   ├── PlayerListItem.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── RosterBoard.tsx
│   │   │   ├── RosterColumn.tsx
│   │   │   ├── TeamColumn.tsx
│   │   │   └── TeamManagerUI.tsx
│   │   ├── modals/
│   │   │   ├── TeamManagerModal.tsx
│   │   │   ├── ProfileCreationModal.tsx
│   │   │   ├── ProfileDetailsModal.tsx
│   │   │   ├── SubstitutionModal.tsx
│   │   │   └── TeamStatsModal.tsx
│   │   ├── hooks/
│   │   │   ├── useTeamGenerator.ts
│   │   │   └── usePlayerProfiles.ts
│   │   ├── store/
│   │   │   └── rosterStore.ts
│   │   └── utils/
│   │       └── rosterLogic.ts
│   │
│   ├── court/                           # Quadra visual e posicionamento
│   │   ├── components/
│   │   │   ├── CourtLayout.tsx
│   │   │   ├── VolleyballCourt.tsx
│   │   │   ├── CourtHeader.tsx
│   │   │   └── CourtFooter.tsx
│   │   └── modals/
│   │       └── CourtModal.tsx
│   │
│   ├── history/                         # Histórico e análise
│   │   ├── components/
│   │   │   ├── HistoryList.tsx
│   │   │   ├── MatchDetail.tsx
│   │   │   ├── MatchTimeline.tsx
│   │   │   ├── MomentumGraph.tsx
│   │   │   └── ProAnalysis.tsx
│   │   ├── modals/
│   │   │   └── HistoryModal.tsx
│   │   ├── store/
│   │   │   └── historyStore.ts
│   │   ├── services/
│   │   │   ├── AnalysisEngine.ts
│   │   │   └── PDFService.ts
│   │   └── utils/
│   │       ├── statsEngine.ts
│   │       └── timelineGenerator.ts
│   │
│   ├── settings/                        # Configurações
│   │   ├── components/
│   │   │   ├── AppTab.tsx
│   │   │   ├── MatchTab.tsx
│   │   │   ├── SystemTab.tsx
│   │   │   └── SettingsUI.tsx
│   │   └── modals/
│   │       └── SettingsModal.tsx
│   │
│   ├── broadcast/                       # Live sync, OBS, spectator
│   │   ├── screens/
│   │   │   └── BroadcastScreen.tsx
│   │   ├── components/
│   │   │   ├── BroadcastOverlay.tsx
│   │   │   └── ObsScoreDisplay.tsx
│   │   ├── modals/
│   │   │   └── LiveSyncModal.tsx
│   │   ├── hooks/
│   │   │   ├── useSpectatorSync.ts
│   │   │   ├── useSpectatorCount.ts
│   │   │   ├── useRemoteTimeoutSync.ts
│   │   │   ├── useTimeoutSync.ts
│   │   │   ├── useTimerSync.ts
│   │   │   └── useSyncManager.ts
│   │   └── services/
│   │       ├── SyncEngine.ts
│   │       ├── SyncService.ts
│   │       └── TimeoutSyncService.ts
│   │
│   ├── social/                          # Compartilhamento e leaderboard
│   │   ├── components/
│   │   │   ├── GlobalLeaderboard.tsx
│   │   │   └── ResultCard.tsx
│   │   ├── hooks/
│   │   │   └── useSocialShare.ts
│   │   └── services/
│   │       ├── SocialService.ts
│   │       └── io.ts
│   │
│   ├── voice/                           # Controle por voz e IA
│   │   ├── hooks/
│   │   │   └── useVoiceControl.ts
│   │   ├── modals/
│   │   │   └── VoiceCommandsModal.tsx
│   │   └── services/
│   │       ├── VoiceRecognitionService.ts
│   │       ├── VoiceCommandParser.ts
│   │       ├── GeminiCommandService.ts
│   │       ├── TTSService.ts
│   │       └── ai/
│   │           └── schemas.ts
│   │
│   ├── tutorial/                        # Onboarding e tutorial
│   │   ├── components/
│   │   │   ├── InteractiveGestureDemo.tsx
│   │   │   ├── MotionScenes.tsx
│   │   │   └── TutorialVisuals.tsx
│   │   ├── scenes/
│   │   │   ├── BatchInputScene.tsx
│   │   │   ├── DragDropScene.tsx
│   │   │   ├── ExportScene.tsx
│   │   │   ├── MomentumScene.tsx
│   │   │   ├── PlayerStatsScene.tsx
│   │   │   ├── RotationScene.tsx
│   │   │   ├── ScoutModeScene.tsx
│   │   │   ├── SettingsScene.tsx
│   │   │   ├── SkillBalanceScene.tsx
│   │   │   ├── SubstitutionScene.tsx
│   │   │   ├── TeamCompositionScene.tsx
│   │   │   ├── VoiceControlScene.tsx
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── visuals/
│   │   │   ├── AppScenes.tsx
│   │   │   ├── HistoryScenes.tsx
│   │   │   ├── SystemScenes.tsx
│   │   │   ├── TeamScenes.tsx
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── modals/
│   │   │   ├── RichTutorialModal.tsx
│   │   │   └── TutorialModal.tsx
│   │   ├── hooks/
│   │   │   └── useTutorial.ts
│   │   └── data/
│   │       └── tutorialContent.ts
│   │
│   └── ads/                             # Publicidade (SmartBanner)
│       └── components/
│           └── SmartBanner.tsx
│
└── hooks/                               # Hooks globais remanescentes (shared)
    └── usePerformanceMonitor.ts
```

---

## 3. Tabela de Migração Completa

### 3.1 Root Files

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/types.ts` | `src/@types/index.ts` | Barrel de tipos centralizado |
| `src/types/domain.ts` | `src/@types/domain.ts` | Tipos de domínio |
| `src/types/services.ts` | `src/@types/services.ts` | Tipos de serviços |
| `src/types/ui.ts` | `src/@types/ui.ts` | Tipos de UI |
| `src/constants.ts` | `src/config/constants.ts` | Agrupar configuração com config |
| `src/App.tsx` | `src/App.tsx` | **Mantém** (entry point) |
| `src/index.tsx` | `src/index.tsx` | **Mantém** (bootstrap) |
| `src/index.css` | `src/index.css` | **Mantém** |
| `src/vite-env.d.ts` | `src/vite-env.d.ts` | **Mantém** |
| `src/metadata.json` | `src/metadata.json` | **Mantém** |

### 3.2 Design System (`components/ui/` -> `src/ui/`)

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/ui/Badge.tsx` | `src/ui/Badge.tsx` | Componente atômico reutilizável |
| `src/components/ui/Button.tsx` | `src/ui/Button.tsx` | Componente atômico reutilizável |
| `src/components/ui/BackgroundGlow.tsx` | `src/ui/BackgroundGlow.tsx` | Efeito visual reutilizável |
| `src/components/ui/Confetti.tsx` | `src/ui/Confetti.tsx` | Efeito visual reutilizável |
| `src/components/ui/CriticalPointAnimation.tsx` | `src/ui/CriticalPointAnimation.tsx` | Animação reutilizável |
| `src/components/ui/ErrorBoundary.tsx` | `src/ui/ErrorBoundary.tsx` | Wrapper reutilizável |
| `src/components/ui/FloatingTimeout.tsx` | `src/ui/FloatingTimeout.tsx` | Componente UI compartilhado |
| `src/components/ui/GestureHint.tsx` | `src/ui/GestureHint.tsx` | Componente UI compartilhado |
| `src/components/ui/GlassSurface.tsx` | `src/ui/GlassSurface.tsx` | Componente visual base |
| `src/components/ui/GlobalLoader.tsx` | `src/ui/GlobalLoader.tsx` | Componente global |
| `src/components/ui/HaloBackground.tsx` | `src/ui/HaloBackground.tsx` | Efeito visual |
| `src/components/ui/HaloPortal.tsx` | `src/ui/HaloPortal.tsx` | Efeito visual |
| `src/components/ui/IconButton.tsx` | `src/ui/IconButton.tsx` | Componente atômico |
| `src/components/ui/InstallReminder.tsx` | `src/ui/InstallReminder.tsx` | Componente UI global |
| `src/components/ui/Modal.tsx` | `src/ui/Modal.tsx` | Componente base |
| `src/components/ui/ModalHeader.tsx` | `src/ui/ModalHeader.tsx` | Componente base |
| `src/components/ui/NotificationToast.tsx` | `src/ui/NotificationToast.tsx` | Componente global |
| `src/components/ui/PageIndicator.tsx` | `src/ui/PageIndicator.tsx` | Componente UI |
| `src/components/ui/ReloadPrompt.tsx` | `src/ui/ReloadPrompt.tsx` | Componente global |
| `src/components/ui/ScoreTicker.tsx` | `src/ui/ScoreTicker.tsx` | Componente visual |
| `src/components/ui/SkillSlider.tsx` | `src/ui/SkillSlider.tsx` | Input reutilizável |
| `src/components/ui/TeamLogo.tsx` | `src/ui/TeamLogo.tsx` | Componente visual |
| `src/components/ui/ToggleGroup.tsx` | `src/ui/ToggleGroup.tsx` | Input reutilizável |
| `src/components/ui/TrackingGlow.tsx` | `src/ui/TrackingGlow.tsx` | Efeito visual |
| `src/components/ui/VoiceToast.tsx` | `src/ui/VoiceToast.tsx` | Componente global |
| `src/components/ui/index.ts` | `src/ui/index.ts` | Barrel export |

### 3.3 Layouts (`components/layouts/` -> `src/layouts/`)

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/layouts/FullscreenLayout.tsx` | `src/layouts/FullscreenLayout.tsx` | Layout global de página |
| `src/components/layouts/NormalLayout.tsx` | `src/layouts/NormalLayout.tsx` | Layout global de página |
| `src/components/layouts/CourtPage.tsx` | `src/layouts/CourtPage.tsx` | Layout de página |
| `src/components/layouts/GameOverlays.tsx` | `src/layouts/GameOverlays.tsx` | Overlays globais |
| `src/components/layouts/HorizontalPagesContainer.tsx` | `src/layouts/HorizontalPagesContainer.tsx` | Container de layout |

### 3.4 Feature: Game (Core)

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/screens/GameScreen.tsx` | `src/features/game/screens/GameScreen.tsx` | Tela principal do jogo |
| `src/screens/index.ts` | `src/features/game/screens/index.ts` | Barrel export |
| `src/components/ScoreCardFullscreen.tsx` | `src/features/game/components/ScoreCardFullscreen.tsx` | Componente core do jogo |
| `src/components/ScoreCardNormal.tsx` | `src/features/game/components/ScoreCardNormal.tsx` | Componente core do jogo |
| `src/components/containers/ScoreCardContainer.tsx` | `src/features/game/components/ScoreCardContainer.tsx` | Container do placar |
| `src/components/Controls.tsx` | `src/features/game/components/Controls.tsx` | Controles do jogo |
| `src/components/HistoryBar.tsx` | `src/features/game/components/HistoryBar.tsx` | Barra inline do jogo |
| `src/components/MeasuredFullscreenHUD.tsx` | `src/features/game/components/MeasuredFullscreenHUD.tsx` | HUD do jogo |
| `src/components/Fullscreen/FloatingControlBar.tsx` | `src/features/game/components/FloatingControlBar.tsx` | Controle fullscreen |
| `src/components/Fullscreen/FloatingTopBar.tsx` | `src/features/game/components/FloatingTopBar.tsx` | Top bar fullscreen |
| `src/components/Fullscreen/FullscreenMenuDrawer.tsx` | `src/features/game/components/FullscreenMenuDrawer.tsx` | Menu drawer fullscreen |
| `src/components/Fullscreen/TimeoutOverlay.tsx` | `src/features/game/components/TimeoutOverlay.tsx` | Overlay de timeout |
| `src/components/modals/MatchOverModal.tsx` | `src/features/game/modals/MatchOverModal.tsx` | Modal de fim de partida |
| `src/components/modals/ScoutModal.tsx` | `src/features/game/modals/ScoutModal.tsx` | Modal de scout |
| `src/components/modals/ConfirmationModal.tsx` | `src/features/game/modals/ConfirmationModal.tsx` | Modal de confirmação |
| `src/components/modals/ModalManager.tsx` | `src/features/game/modals/ModalManager.tsx` | Orquestrador de modais |
| `src/contexts/GameContext.tsx` | `src/features/game/context/GameContext.tsx` | Contexto core do jogo |
| `src/contexts/TimerContext.tsx` | `src/features/game/context/TimerContext.tsx` | Timer do jogo |
| `src/contexts/TimeoutContext.tsx` | `src/features/game/context/TimeoutContext.tsx` | Timeout do jogo |
| `src/hooks/useVolleyGame.ts` | `src/features/game/hooks/useVolleyGame.ts` | Hook orquestrador do jogo |
| `src/hooks/useGameState.ts` | `src/features/game/hooks/useGameState.ts` | Estado do jogo |
| `src/hooks/useGameActions.ts` | `src/features/game/hooks/useGameActions.ts` | Ações do jogo |
| `src/hooks/useGameHandlers.ts` | `src/features/game/hooks/useGameHandlers.ts` | Handlers do jogo |
| `src/hooks/useGamePersistence.ts` | `src/features/game/hooks/useGamePersistence.ts` | Persistência do jogo |
| `src/hooks/useGameAudio.ts` | `src/features/game/hooks/useGameAudio.ts` | Áudio do jogo |
| `src/hooks/useScoreCardLogic.ts` | `src/features/game/hooks/useScoreCardLogic.ts` | Lógica do placar |
| `src/hooks/useScoreGestures.ts` | `src/features/game/hooks/useScoreGestures.ts` | Gestos de pontuação |
| `src/hooks/useScoreAnnouncer.ts` | `src/features/game/hooks/useScoreAnnouncer.ts` | Anúncio de pontuação |
| `src/hooks/useSensoryFX.ts` | `src/features/game/hooks/useSensoryFX.ts` | Efeitos sensoriais |
| `src/hooks/useMatchLifecycle.ts` | `src/features/game/hooks/useMatchLifecycle.ts` | Ciclo de vida da partida |
| `src/hooks/useMatchSaver.ts` | `src/features/game/hooks/useMatchSaver.ts` | Salvamento da partida |
| `src/hooks/useHorizontalPages.ts` | `src/features/game/hooks/useHorizontalPages.ts` | Paginação horizontal |
| `src/hooks/useHudMeasure.ts` | `src/features/game/hooks/useHudMeasure.ts` | Medição do HUD |
| `src/hooks/useCollider.ts` | `src/features/game/hooks/useCollider.ts` | Detecção de colisão UI |
| `src/hooks/useActiveTimeout.ts` | `src/features/game/hooks/useActiveTimeout.ts` | Timeout ativo |
| `src/hooks/useTimeoutManager.ts` | `src/features/game/hooks/useTimeoutManager.ts` | Gerenciador de timeout |
| `src/hooks/useDynamicColorStyle.ts` | `src/features/game/hooks/useDynamicColorStyle.ts` | Estilo dinâmico |
| `src/hooks/useAdaptiveAnimation.ts` | `src/features/game/hooks/useAdaptiveAnimation.ts` | Animação adaptativa |
| `src/hooks/useElementSize.ts` | `src/features/game/hooks/useElementSize.ts` | Medição de elementos |
| `src/hooks/useCombinedGameState.ts` | `src/features/game/hooks/useCombinedGameState.ts` | Estado combinado |
| `src/reducers/gameReducer.ts` | `src/features/game/reducers/gameReducer.ts` | Reducer principal |
| `src/reducers/meta.ts` | `src/features/game/reducers/meta.ts` | Reducer de metadata |
| `src/reducers/roster.ts` | `src/features/game/reducers/roster.ts` | Reducer de roster |
| `src/reducers/scoring.ts` | `src/features/game/reducers/scoring.ts` | Reducer de pontuação |
| `src/reducers/__tests__/ghost_teams_repro.test.ts` | `src/features/game/reducers/__tests__/ghost_teams_repro.test.ts` | Teste do reducer |
| `src/utils/gameLogic.ts` | `src/features/game/utils/gameLogic.ts` | Lógica pura do jogo |
| `src/utils/balanceUtils.ts` | `src/features/game/utils/balanceUtils.ts` | Balanceamento de times |

### 3.5 Feature: Teams

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/PlayerCard.tsx` | `src/features/teams/components/PlayerCard.tsx` | Card de jogador |
| `src/components/TeamManager/AddPlayerForm.tsx` | `src/features/teams/components/AddPlayerForm.tsx` | Form de jogador |
| `src/components/TeamManager/BenchArea.tsx` | `src/features/teams/components/BenchArea.tsx` | Área de reservas |
| `src/components/TeamManager/PlayerContextMenu.tsx` | `src/features/teams/components/PlayerContextMenu.tsx` | Menu de contexto |
| `src/components/TeamManager/PlayerListItem.tsx` | `src/features/teams/components/PlayerListItem.tsx` | Item de lista |
| `src/components/TeamManager/ProfileCard.tsx` | `src/features/teams/components/ProfileCard.tsx` | Card de perfil |
| `src/components/TeamManager/RosterBoard.tsx` | `src/features/teams/components/RosterBoard.tsx` | Board de elenco |
| `src/components/TeamManager/RosterColumn.tsx` | `src/features/teams/components/RosterColumn.tsx` | Coluna de elenco |
| `src/components/TeamManager/TeamColumn.tsx` | `src/features/teams/components/TeamColumn.tsx` | Coluna de time |
| `src/components/TeamManager/TeamManagerUI.tsx` | `src/features/teams/components/TeamManagerUI.tsx` | UI principal |
| `src/components/modals/TeamManagerModal.tsx` | `src/features/teams/modals/TeamManagerModal.tsx` | Modal principal |
| `src/components/modals/ProfileCreationModal.tsx` | `src/features/teams/modals/ProfileCreationModal.tsx` | Criação de perfil |
| `src/components/modals/ProfileDetailsModal.tsx` | `src/features/teams/modals/ProfileDetailsModal.tsx` | Detalhes de perfil |
| `src/components/modals/SubstitutionModal.tsx` | `src/features/teams/modals/SubstitutionModal.tsx` | Modal de substituição |
| `src/components/modals/TeamStatsModal.tsx` | `src/features/teams/modals/TeamStatsModal.tsx` | Estatísticas do time |
| `src/hooks/useTeamGenerator.ts` | `src/features/teams/hooks/useTeamGenerator.ts` | Gerador de times |
| `src/hooks/usePlayerProfiles.ts` | `src/features/teams/hooks/usePlayerProfiles.ts` | Perfis de jogadores |
| `src/stores/rosterStore.ts` | `src/features/teams/store/rosterStore.ts` | Store do elenco |
| `src/utils/rosterLogic.ts` | `src/features/teams/utils/rosterLogic.ts` | Lógica de elenco |

### 3.6 Feature: Court

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/Court/CourtLayout.tsx` | `src/features/court/components/CourtLayout.tsx` | Layout da quadra |
| `src/components/Court/VolleyballCourt.tsx` | `src/features/court/components/VolleyballCourt.tsx` | Visualização da quadra |
| `src/components/Court/CourtHeader.tsx` | `src/features/court/components/CourtHeader.tsx` | Header da quadra |
| `src/components/Court/CourtFooter.tsx` | `src/features/court/components/CourtFooter.tsx` | Footer da quadra |
| `src/components/modals/CourtModal.tsx` | `src/features/court/modals/CourtModal.tsx` | Modal da quadra |

### 3.7 Feature: History

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/History/HistoryList.tsx` | `src/features/history/components/HistoryList.tsx` | Lista de partidas |
| `src/components/History/MatchDetail.tsx` | `src/features/history/components/MatchDetail.tsx` | Detalhe da partida |
| `src/components/History/MatchTimeline.tsx` | `src/features/history/components/MatchTimeline.tsx` | Timeline |
| `src/components/History/MomentumGraph.tsx` | `src/features/history/components/MomentumGraph.tsx` | Gráfico de momentum |
| `src/components/History/ProAnalysis.tsx` | `src/features/history/components/ProAnalysis.tsx` | Análise Pro |
| `src/components/modals/HistoryModal.tsx` | `src/features/history/modals/HistoryModal.tsx` | Modal de histórico |
| `src/stores/historyStore.ts` | `src/features/history/store/historyStore.ts` | Store do histórico |
| `src/services/AnalysisEngine.ts` | `src/features/history/services/AnalysisEngine.ts` | Motor de análise |
| `src/services/PDFService.ts` | `src/features/history/services/PDFService.ts` | Exportação PDF |
| `src/utils/statsEngine.ts` | `src/features/history/utils/statsEngine.ts` | Motor de estatísticas |
| `src/utils/timelineGenerator.ts` | `src/features/history/utils/timelineGenerator.ts` | Gerador de timeline |

### 3.8 Feature: Settings

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/Settings/AppTab.tsx` | `src/features/settings/components/AppTab.tsx` | Aba do app |
| `src/components/Settings/MatchTab.tsx` | `src/features/settings/components/MatchTab.tsx` | Aba de partida |
| `src/components/Settings/SystemTab.tsx` | `src/features/settings/components/SystemTab.tsx` | Aba de sistema |
| `src/components/Settings/SettingsUI.tsx` | `src/features/settings/components/SettingsUI.tsx` | Componentes UI |
| `src/components/modals/SettingsModal.tsx` | `src/features/settings/modals/SettingsModal.tsx` | Modal de settings |

### 3.9 Feature: Broadcast

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/screens/BroadcastScreen.tsx` | `src/features/broadcast/screens/BroadcastScreen.tsx` | Tela de broadcast |
| `src/components/Broadcast/BroadcastOverlay.tsx` | `src/features/broadcast/components/BroadcastOverlay.tsx` | Overlay OBS |
| `src/components/Broadcast/ObsScoreDisplay.tsx` | `src/features/broadcast/components/ObsScoreDisplay.tsx` | Display OBS |
| `src/components/modals/LiveSyncModal.tsx` | `src/features/broadcast/modals/LiveSyncModal.tsx` | Modal de sync |
| `src/hooks/useSpectatorSync.ts` | `src/features/broadcast/hooks/useSpectatorSync.ts` | Sync de espectadores |
| `src/hooks/useSpectatorCount.ts` | `src/features/broadcast/hooks/useSpectatorCount.ts` | Contagem de espectadores |
| `src/hooks/useRemoteTimeoutSync.ts` | `src/features/broadcast/hooks/useRemoteTimeoutSync.ts` | Sync remoto de timeout |
| `src/hooks/useTimeoutSync.ts` | `src/features/broadcast/hooks/useTimeoutSync.ts` | Sync de timeout |
| `src/hooks/useTimerSync.ts` | `src/features/broadcast/hooks/useTimerSync.ts` | Sync de timer |
| `src/hooks/useSyncManager.ts` | `src/features/broadcast/hooks/useSyncManager.ts` | Gerenciador de sync |
| `src/services/SyncEngine.ts` | `src/features/broadcast/services/SyncEngine.ts` | Motor de sync |
| `src/services/SyncService.ts` | `src/features/broadcast/services/SyncService.ts` | Serviço de sync |
| `src/services/TimeoutSyncService.ts` | `src/features/broadcast/services/TimeoutSyncService.ts` | Sync de timeout |

### 3.10 Feature: Social

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/Social/GlobalLeaderboard.tsx` | `src/features/social/components/GlobalLeaderboard.tsx` | Leaderboard |
| `src/components/Share/ResultCard.tsx` | `src/features/social/components/ResultCard.tsx` | Card de resultado |
| `src/hooks/useSocialShare.ts` | `src/features/social/hooks/useSocialShare.ts` | Compartilhamento |
| `src/services/SocialService.ts` | `src/features/social/services/SocialService.ts` | Serviço social |
| `src/services/io.ts` | `src/features/social/services/io.ts` | Import/Export |

### 3.11 Feature: Voice

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/hooks/useVoiceControl.ts` | `src/features/voice/hooks/useVoiceControl.ts` | Hook de voz |
| `src/components/modals/VoiceCommandsModal.tsx` | `src/features/voice/modals/VoiceCommandsModal.tsx` | Modal de voz |
| `src/services/VoiceRecognitionService.ts` | `src/features/voice/services/VoiceRecognitionService.ts` | Reconhecimento |
| `src/services/VoiceCommandParser.ts` | `src/features/voice/services/VoiceCommandParser.ts` | Parser |
| `src/services/GeminiCommandService.ts` | `src/features/voice/services/GeminiCommandService.ts` | Gemini AI |
| `src/services/TTSService.ts` | `src/features/voice/services/TTSService.ts` | Text-to-speech |
| `src/services/ai/schemas.ts` | `src/features/voice/services/ai/schemas.ts` | Schemas IA |

### 3.12 Feature: Tutorial

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/tutorial/InteractiveGestureDemo.tsx` | `src/features/tutorial/components/InteractiveGestureDemo.tsx` | Demo interativa |
| `src/components/tutorial/MotionScenes.tsx` | `src/features/tutorial/components/MotionScenes.tsx` | Cenas de animação |
| `src/components/tutorial/TutorialVisuals.tsx` | `src/features/tutorial/components/TutorialVisuals.tsx` | Visuais do tutorial |
| `src/components/tutorial/scenes/*.tsx` | `src/features/tutorial/scenes/*.tsx` | Todas as cenas |
| `src/components/tutorial/visuals/*.tsx` | `src/features/tutorial/visuals/*.tsx` | Todos os visuais |
| `src/components/modals/RichTutorialModal.tsx` | `src/features/tutorial/modals/RichTutorialModal.tsx` | Modal rich |
| `src/components/modals/TutorialModal.tsx` | `src/features/tutorial/modals/TutorialModal.tsx` | Modal simples |
| `src/hooks/useTutorial.ts` | `src/features/tutorial/hooks/useTutorial.ts` | Hook do tutorial |
| `src/data/tutorialContent.ts` | `src/features/tutorial/data/tutorialContent.ts` | Conteúdo |

### 3.13 Feature: Ads

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/components/Ads/SmartBanner.tsx` | `src/features/ads/components/SmartBanner.tsx` | Banner inteligente |

### 3.14 Lib (Serviços Compartilhados)

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/services/firebase.ts` | `src/lib/firebase.ts` | Infra central |
| `src/services/AudioService.ts` | `src/lib/audio/AudioService.ts` | Serviço de áudio |
| `src/hooks/useHaptics.ts` | `src/lib/haptics/useHaptics.ts` | Feedback tátil (19 importadores) |
| `src/services/PlatformService.ts` | `src/lib/platform/PlatformService.ts` | Serviço de plataforma |
| `src/hooks/usePlatform.ts` | `src/lib/platform/usePlatform.ts` | Hook de plataforma |
| `src/hooks/useKeepAwake.ts` | `src/lib/platform/useKeepAwake.ts` | Keep awake |
| `src/hooks/useImmersiveMode.ts` | `src/lib/platform/useImmersiveMode.ts` | Modo imersivo |
| `src/hooks/useNativeIntegration.ts` | `src/lib/platform/useNativeIntegration.ts` | Integração nativa |
| `src/hooks/useSafeAreaInsets.ts` | `src/lib/platform/useSafeAreaInsets.ts` | Safe area |
| `src/utils/deviceDetection.ts` | `src/lib/platform/deviceDetection.ts` | Detecção de device |
| `src/services/SecureStorage.ts` | `src/lib/storage/SecureStorage.ts` | Armazenamento seguro |
| `src/services/BackupService.ts` | `src/lib/storage/BackupService.ts` | Backup |
| `src/services/AdService.ts` | `src/lib/ads/AdService.ts` | Serviço de ads |
| `src/hooks/useAdFlow.ts` | `src/lib/ads/useAdFlow.ts` | Flow de ads |
| `src/hooks/useAdLifecycle.ts` | `src/lib/ads/useAdLifecycle.ts` | Lifecycle de ads |
| `src/hooks/useServiceWorker.ts` | `src/lib/pwa/useServiceWorker.ts` | Service worker |
| `src/hooks/usePWAInstallPrompt.ts` | `src/lib/pwa/usePWAInstallPrompt.ts` | Install prompt |
| `src/hooks/useOnlineStatus.ts` | `src/lib/pwa/useOnlineStatus.ts` | Status online |
| `src/services/ImageService.ts` | `src/lib/image/ImageService.ts` | Serviço de imagem |
| `src/utils/animations.ts` | `src/lib/utils/animations.ts` | Utilitário de animações |
| `src/utils/colors.ts` | `src/lib/utils/colors.ts` | Utilitário de cores (31 importadores) |
| `src/utils/colorsDynamic.ts` | `src/lib/utils/colorsDynamic.ts` | Cores dinâmicas |
| `src/utils/logger.ts` | `src/lib/utils/logger.ts` | Logger |
| `src/utils/responsive.ts` | `src/lib/utils/responsive.ts` | Responsividade |
| `src/utils/security.ts` | `src/lib/utils/security.ts` | Segurança |
| `src/utils/stringUtils.ts` | `src/lib/utils/stringUtils.ts` | Strings |
| `src/utils/validation.ts` | `src/lib/utils/validation.ts` | Validação |

### 3.15 Hooks Globais Remanescentes

| Arquivo Atual | Novo Destino | Justificativa |
|---------------|--------------|---------------|
| `src/hooks/usePerformanceMonitor.ts` | `src/hooks/usePerformanceMonitor.ts` | Hook global de infra |

---

## 4. Análise de Risco

### 4.1 Arquivos de RISCO CRÍTICO (> 40 importadores)

| Arquivo | Importadores | Risco | Estratégia de Mitigação |
|---------|-------------|-------|------------------------|
| `src/types.ts` (+ types/*) | **111 arquivos** | CRÍTICO | Mover para `src/@types/index.ts` e criar path alias `@types` no tsconfig. Manter re-export temporário no path antigo até completar migração. |
| `src/contexts/LanguageContext.tsx` | **54 arquivos** | CRÍTICO | **NÃO MOVER** — permanece em `src/contexts/`. É verdadeiramente cross-feature. Criar path alias `@contexts/LanguageContext`. |

### 4.2 Arquivos de RISCO ALTO (20-40 importadores)

| Arquivo | Importadores | Risco | Estratégia de Mitigação |
|---------|-------------|-------|------------------------|
| `src/utils/colors.ts` | **31 arquivos** | ALTO | Mover para `src/lib/utils/colors.ts`. Criar path alias `@lib/utils/colors`. |
| `src/contexts/GameContext.tsx` | **27 arquivos** | ALTO | Mover para `src/features/game/context/`. Criar re-export em `src/contexts/GameContext.tsx` temporariamente. Migrar imports em fases. |

### 4.3 Arquivos de RISCO MÉDIO (10-20 importadores)

| Arquivo | Importadores | Risco | Estratégia de Mitigação |
|---------|-------------|-------|------------------------|
| `src/hooks/useHaptics.ts` | **19 arquivos** | MÉDIO | Mover para `src/lib/haptics/`. Hook é cross-feature, justifica estar em `lib/`. |
| `src/constants.ts` | **~15 arquivos** | MÉDIO | Mover para `src/config/constants.ts`. Simples — poucos importadores. |
| `src/contexts/ModalContext.tsx` | **~12 arquivos** | MÉDIO | Permanece em `src/contexts/` — é cross-feature. |
| `src/contexts/NotificationContext.tsx` | **~12 arquivos** | MÉDIO | Permanece em `src/contexts/` — é cross-feature. |
| `src/contexts/TimerContext.tsx` | **~10 arquivos** | MÉDIO | Mover para `src/features/game/context/`. Majoritariamente usado por game/broadcast. |

### 4.4 Dependências Circulares Potenciais

| Cenário | Detalhe | Mitigação |
|---------|---------|-----------|
| `game` <-> `teams` | `TeamManagerModal` usa `GameContext`; reducers usam `rosterLogic` | Manter types compartilhados em `@types`. Comunicação via contexts globais. |
| `game` <-> `broadcast` | Sync hooks leem `GameContext`; `GameScreen` usa sync hooks | Broadcast depende de game (unidirecional). OK. |
| `history` <-> `game` | `historyStore` usa tipos de game; `MatchSaver` grava no history | Comunicação via stores (Zustand). Sem dependência circular direta. |
| `court` <-> `teams` | `CourtLayout` gerencia substituições via modal | `SubstitutionModal` pode ficar em teams ou ser shared. |

### 4.5 Ordem de Migração Recomendada (Fases)

| Fase | Escopo | Justificativa |
|------|--------|---------------|
| **Fase 0** | Configurar path aliases no `tsconfig.json` (`@types`, `@ui`, `@lib`, `@features`, `@contexts`, `@layouts`, `@config`) | Zero risco, habilita migração incremental |
| **Fase 1** | `src/@types/` + `src/config/constants.ts` | Fundação — todos dependem de types |
| **Fase 2** | `src/ui/` (Design System) | Auto-contido, sem dependências em features |
| **Fase 3** | `src/lib/` (serviços compartilhados) | Infra que features vão consumir |
| **Fase 4** | `src/layouts/` | Depende apenas de ui/ e contexts/ |
| **Fase 5** | `src/features/tutorial/` | Mais isolado, menor blast radius |
| **Fase 6** | `src/features/voice/` | Isolado, poucos importadores |
| **Fase 7** | `src/features/social/` | Isolado |
| **Fase 8** | `src/features/settings/` | Poucos imports cruzados |
| **Fase 9** | `src/features/history/` | Depende de stores |
| **Fase 10** | `src/features/teams/` + `src/features/court/` | Acoplados entre si |
| **Fase 11** | `src/features/broadcast/` | Depende de game context |
| **Fase 12** | `src/features/game/` (CORE) | **Último** — mais arriscado, maior blast radius |
| **Fase 13** | Remover re-exports temporários, limpar imports antigos | Cleanup final |

---

## 5. Path Aliases Recomendados (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@types": ["./src/@types"],
      "@types/*": ["./src/@types/*"],
      "@ui": ["./src/ui"],
      "@ui/*": ["./src/ui/*"],
      "@lib/*": ["./src/lib/*"],
      "@features/*": ["./src/features/*"],
      "@contexts/*": ["./src/contexts/*"],
      "@layouts/*": ["./src/layouts/*"],
      "@config/*": ["./src/config/*"],
      "@hooks/*": ["./src/hooks/*"]
    }
  }
}
```

> **Nota:** Vite também precisa de configuração correspondente via `vite-tsconfig-paths` plugin ou `resolve.alias` no `vite.config.ts`.

---

## 6. Métricas Esperadas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Arquivos em `src/components/` | 112 | 0 (eliminado) |
| Arquivos em `src/hooks/` (flat) | 40 | 1 (apenas global) |
| Arquivos em `src/services/` (flat) | 16 | 0 (distribuídos em features/lib) |
| Profundidade máxima de import relativo | `../../../../` | `@features/game/hooks/...` (alias) |
| Features identificáveis pela estrutura | 0 | 11 domínios claros |
| Tempo para encontrar "onde fica X" | Alto (busca mental) | Baixo (domínio evidente) |

---

## 7. Regras de Governança Pós-Migração

1. **Cada feature é auto-contida**: componentes, hooks, modais, store, services e utils da feature vivem dentro da sua pasta.
2. **Sem import cruzado entre features**: Features se comunicam via `contexts/`, `@types`, ou `lib/`. Nunca importe de `features/A/` dentro de `features/B/`.
3. **`src/ui/` é o Design System**: Apenas componentes genéricos, sem lógica de negócio.
4. **`src/lib/` é infraestrutura**: Serviços utilitários sem conhecimento de domínio.
5. **`src/contexts/` é global**: Apenas contextos verdadeiramente cross-feature (Language, Auth, Modal, Notification, Performance, Responsive, Theme, Layout).
6. **Path aliases obrigatórios**: Todo import usa `@features/`, `@ui/`, `@lib/`, etc. Eliminar imports relativos profundos (`../../..`).

---

> **ATENÇÃO:** Este documento é apenas o PLANO. Nenhum arquivo será movido até aprovação explícita e execução do Lote 5.
