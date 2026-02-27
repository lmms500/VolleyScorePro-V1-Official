# Plano: Otimização do Sistema de Voz + Sistema de Gamificação Completo

## Contexto

O VolleyScore-Pro possui dois sistemas complexos que precisam de otimização e expansão:

1. **Sistema de Voz** — Pipeline completo (NativeEngine → CommandBuffer → VoiceCommandParser → Deduplicator → Ação) que funciona mas tem problemas no Android, não possui wake word, consome bateria e o parser de 941 linhas precisa de otimização.

2. **Sistema de Gamificação** — XP/Levels funcionam (500 XP/nível), leaderboard global existe (top 50), sistema de follow unidirecional funciona, mas faltam achievements, streaks, challenges e melhorias no social.

---

## TRACK A — Otimização do Sistema de Voz

### Fase 1: Correções Fundamentais Android + Auto-Recovery

**Problema:** Erros no Android usam apenas string matching (`PERMISSION_DENIED`, `NETWORK_ERROR`). O Android SpeechRecognizer retorna códigos numéricos que são ignorados. Além disso, quando a engine para inesperadamente (`intendedState === true` mas `isListening === false`), não há auto-restart.

**Arquivos a modificar:**

- `src/features/voice/engines/NativeEngine.ts` — Adicionar mapa de error codes Android + auto-restart web
  - Adicionar `ANDROID_ERROR_CODES` map (códigos 1-13 mapeados para tipo + recoverable)
  - No `handleNativeError`: checar `data.errorCode` primeiro, fallback para `data.message`
  - Para erros recuperáveis (NO_MATCH=7, SPEECH_TIMEOUT=6, RECOGNIZER_BUSY=8): log silencioso, sem propagação
  - No `startWeb`: adicionar auto-restart no `onend` — se não foi parado explicitamente, reiniciar após 500ms
  - Adicionar campo `private intentionalStop = false` para distinguir stop manual de timeout
  - No `stop()`: setar `intentionalStop = true`; no `onend`: checar flag antes de reiniciar

- `src/features/voice/services/VoiceRecognitionService.ts` — Auto-recovery com backoff
  - Tornar `engine` mutável (remover `readonly`)
  - Adicionar auto-restart: quando `updateStatus(false)` e `intendedState === true`, chamar `this.engine.start(this.lastLocale)` após delay
  - Backoff exponencial: 1s → 2s → 4s, max 3 tentativas em 30s
  - Resetar contador de tentativas quando `updateStatus(true)` (recuperou com sucesso)

- `src/features/voice/plugins/VoiceRecognitionCustomPlugin.ts` — Expandir tipo
  - Adicionar `androidErrorCode?: number` ao `RecognitionErrorEvent`

**Novo arquivo:** `src/features/voice/services/VoiceLogger.ts`
  - Buffer circular (últimos 100 eventos) em memória
  - Tipos de evento: `transcript_received`, `parse_result`, `ai_fallback`, `dedup_action`, `error`
  - Métodos: `record(event)`, `getLog()`, `getStats()` (success rate, avg confidence)
  - Integrar no `useVoiceControl.ts` nos pontos de decisão (após parse, após dedup, após execução)

---

### Fase 2: Otimização do Parser

**Problema:** Parser de 941 linhas com regex criados a cada chamada, vocabulários inline, e phonetic synonyms iterados por loop.

**Arquivos a modificar:**

- **Novo arquivo:** `src/features/voice/services/vocabulary.ts`
  - Extrair `PHONETIC_SYNONYMS`, `WRITTEN_NUMBERS`, `VOCABULARY` (~170 linhas) do parser
  - Exportar `getVocabulary(lang)`, `getPhoneticSynonyms(lang)`, `WRITTEN_NUMBERS`
  - Pré-compilar regex: cada synonym e written number vira `RegExp` no module load
  - Criar regex único combinado para WRITTEN_NUMBERS via `new RegExp(keys.join('|'), 'g')`

- `src/features/voice/services/VoiceCommandParser.ts` — Otimizar scoring + normalização
  - Importar vocabulário do novo módulo
  - `normalizeText`: usar regex pré-compilados ao invés de criar novos por chamada
  - `calculateAdaptiveConfidence`: refinar scoring:
    - Base: 0.75 (manter)
    - Team explícito: +0.15 (manter)
    - Player identificado: +0.10 (manter)
    - Skill detectada: +0.05 (manter)
    - **Novo:** Transcript curto (1-2 palavras sem team): -0.05
    - **Novo:** Player resolvido por fuzzy (Levenshtein, score 30): -0.10
    - **Novo:** Contexto inference concorda com detecção explícita: +0.05
  - Guardar método de resolução no `debugMessage` para analytics

---

### Fase 3: Redução de Latência do AI Fallback

**Arquivo a modificar:**

- `src/features/voice/services/GeminiCommandService.ts`
  - Preload do SDK: quando voice control ativado, disparar `import("@google/genai")` imediatamente (não esperar primeiro comando falhar)
  - Timeout de 2s via `Promise.race` + `AbortController` no `generateContent()`
  - Cache LRU simples: últimos 5 pares (transcript → result), validade de 10s
  - Se timeout: retornar `unknown` imediatamente em vez de travar UI

- `src/features/voice/hooks/useVoiceControl.ts` — Preload effect
  - Adicionar `useEffect` que chama preload quando `enabled` muda para `true`

---

### Fase 4: Wake Word (Picovoice Porcupine)

Seguir o plano existente em `plans/WAKE_WORD_IMPLEMENTATION.md` com os seguintes ajustes baseados na análise do código:

**Novos arquivos:**
- `src/features/voice/engines/WakeWordEngine.ts` — Wrapper Porcupine + SpeechRecognizer
  - State machine: `idle → listening_wake → wake_detected → listening_command → processing → idle`
  - Timeout de 10s após wake word detectado sem comando
  - Lifecycle: pausar Porcupine em `appStateChange` (background), resumir em foreground
  - Timeout máximo contínuo: 2 horas → auto-stop com notificação

**Arquivos a modificar:**
- `src/features/voice/engines/EngineSelector.ts` — Expandir factory
  - `EngineMode = 'native' | 'wake_word'`
  - `createSpeechEngine(mode)` retorna engine adequada

- `src/features/voice/services/VoiceRecognitionService.ts`
  - Adicionar `setMode(mode: EngineMode)` que destrói engine atual e cria nova
  - Remover `readonly` do campo `engine`

- `src/@types/domain.ts` — Adicionar a `GameConfig`:
  ```typescript
  voiceMode: 'toggle' | 'push_to_talk' | 'wake_word';
  wakeWordSensitivity?: number; // 0.0-1.0
  ```

- `src/config/constants.ts` — Defaults:
  ```typescript
  voiceMode: 'toggle',
  wakeWordSensitivity: 0.5,
  ```

- `src/features/settings/components/AudioTab.tsx` — UI de 3 opções (Toggle / Push-to-Talk / Wake Word)

---

### Fase 5: Voice Analytics & Telemetria

**Novo arquivo:** `src/features/voice/services/VoiceAnalytics.ts`
  - Zustand store com SecureStorage persistence (mesmo padrão de `historyStore.ts`)
  - Métricas por comando: timestamp, transcript, resultado (local_success/ai_success/unknown), confidence, latência, tipo, idioma, deduplicado
  - Summary: total de comandos, success rate, avg confidence, avg latência, AI fallback rate
  - UI: seção "Voice Stats" no developer mode das Settings (taxa de sucesso, confiança média, % AI fallback)

---

## TRACK B — Sistema de Gamificação

### Fase 6: Achievements & Badges

**Novos arquivos:**

- `src/features/gamification/data/achievements.ts` — Catálogo de conquistas
  ```typescript
  interface AchievementDef {
    id: string;
    nameKey: string;         // chave i18n
    descriptionKey: string;  // chave i18n
    icon: string;            // Lucide icon
    category: 'matches' | 'skills' | 'social' | 'streaks' | 'milestones';
    condition: AchievementCondition;
    xpReward: number;
    tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  }
  ```
  - ~30-40 achievements across tiers:
    - **Bronze:** Primeiro jogo (1 match), Primeiro MVP, 10 bloqueios, 10 aces
    - **Silver:** 50 matches, 100 ataques, 50 aces, 10 MVPs
    - **Gold:** 200 matches, 500 bloqueios, 5 MVPs seguidos, streak de 7 dias
    - **Diamond:** 1000 matches, 10.000 pontos, streak de 30 dias

- `src/features/gamification/services/AchievementEngine.ts` — Motor de avaliação
  - `evaluate(profile, matchDelta?, streakData?)` → retorna IDs novos desbloqueados
  - Compara stats do perfil atualizado contra condições de cada achievement
  - Para achievements de streak: recebe dados de streak (calculados na Fase 7)

- `src/features/gamification/components/AchievementBadge.tsx` — Badge individual (ícone, tier cor, tooltip)
- `src/features/gamification/components/AchievementsPanel.tsx` — Grid de todos achievements (desbloqueados em cor, trancados em cinza com barra de progresso)

**Arquivos a modificar:**

- `src/features/game/hooks/useMatchSaver.ts` — Após `batchUpdateStats(deltas)` (linha 126):
  - Chamar `AchievementEngine.evaluate()` para cada jogador com delta
  - Para novos achievements: adicionar ID ao `profile.achievements`, dar XP bônus, mostrar notificação celebratória

- `src/features/teams/modals/ProfileDetailsModal.tsx` — Adicionar aba/seção de achievements

- Arquivos i18n: `src/locales/en.json`, `src/locales/pt.json`, `src/locales/es.json` — Adicionar chaves de nome/descrição para cada achievement

---

### Fase 7: Sistema de Streaks

**Arquivos a modificar:**

- `src/@types/domain.ts` — Expandir `ProfileStats`:
  ```typescript
  currentDailyStreak: number;
  longestDailyStreak: number;
  lastPlayDate: string;        // YYYY-MM-DD
  currentWinStreak: number;
  longestWinStreak: number;
  currentMvpStreak: number;
  longestMvpStreak: number;
  ```

- `src/features/history/utils/statsEngine.ts` — Nova função + extensão do merge
  - Nova função `updateStreaks(current: ProfileStats, delta: StatsDelta): Partial<ProfileStats>`
    - Compara `lastPlayDate` com data de hoje para daily streak
    - Incrementa/reseta win streak baseado em `delta.matchesWon`
    - Incrementa/reseta MVP streak baseado em `delta.mvpCount`
    - Atualiza `longest*` se `current* > longest*`
  - Chamar `updateStreaks` dentro de `mergeStats` (linha 119)
  - Inicializar novos campos com 0 no `base` default

- `src/features/teams/modals/ProfileDetailsModal.tsx` — Exibir streak atual (ícone de chama + número)
- `src/features/social/components/GlobalLeaderboard.tsx` — Mostrar streak ao lado do XP

---

### Fase 8: Leaderboard Melhorado

**Arquivos a modificar:**

- `src/features/social/services/SocialService.ts` — Novos métodos:
  - `getWeeklyRanking()` — Filtrar no client pelo `lastMatchTimestamp` da última semana
  - `getMonthlyRanking()` — Filtrar no client pelo último mês
  - `getCategoryRanking(category: 'aces' | 'blocks' | 'attacks' | 'mvp')` — Ordenar por stat específica
  - Adicionar `lastMatchTimestamp` ao documento do leaderboard no `publishToLeaderboard`

- `src/features/social/components/GlobalLeaderboard.tsx` — Tabs adicionais:
  - Linha superior existente: `Global | Amigos | Ao Vivo`
  - **Nova** linha inferior de filtro: `[ Geral ] [ Semana ] [ Mês ]` + `[ XP ] [ Aces ] [ Bloqueios ]`
  - Reutilizar o mesmo componente de lista com diferentes dados

---

### Fase 9: Sistema de Challenges

**Novos arquivos:**

- `src/features/gamification/data/challenges.ts` — Definições de challenges
  ```typescript
  interface Challenge {
    id: string;
    nameKey: string;
    type: 'daily' | 'weekly';
    objective: { type: 'score_points' | 'play_matches' | 'win_matches' | 'get_mvp'; count: number; skill?: SkillType };
    xpReward: number;
  }
  ```
  - Diários (reset à meia-noite): "Marque 20 pontos", "Jogue 2 partidas", "Consiga 5 aces"
  - Semanais (reset segunda): "Vença 5 partidas", "Seja MVP 3 vezes", "Jogue 10 partidas"

- `src/features/gamification/services/ChallengeTracker.ts` — Zustand store com SecureStorage
  - Progress tracking per challenge
  - Reset automático (daily/weekly) baseado em timestamps
  - Atualizado no `useMatchSaver` após cada partida

- `src/features/gamification/components/ChallengeCard.tsx` — Card com nome, progresso (barra), XP reward

**Arquivo a modificar:**
- `src/features/game/hooks/useMatchSaver.ts` — Após stats + achievements, atualizar challenge progress

---

### Fase 10: Melhorias Sociais

**Arquivos a modificar:**

- `src/features/social/services/SocialService.ts` — Melhorar busca de jogadores
  - Adicionar campo `searchableNameLower` ao documento do leaderboard
  - Usar Firestore prefix query: `where('searchableNameLower', '>=', term)` ao invés de filtrar client-side

- `src/features/social/components/GlobalLeaderboard.tsx` — Mostrar amigos em comum
  - Na lista de resultados, se `targetProfile.friends` contém UIDs que também estão em `myProfile.friends`, mostrar "X amigos em comum"

- **Novo arquivo:** `src/features/gamification/services/ActivityFeed.ts`
  - Zustand store para notificações locais de atividade
  - Eventos: achievement desbloqueado por amigo, amigo subiu no ranking
  - Badge count no tab social
  - Sem push notifications (apenas in-app)

---

## Dependências e Ordem de Execução

```
TRACK A (Voz):     Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
TRACK B (Gamif.):  Fase 6 → Fase 7 → Fase 8 → Fase 9 → Fase 10
```

As duas tracks são **independentes** e podem ser executadas em paralelo. Dentro de cada track, a ordem é sequencial porque cada fase depende da anterior.

**Prioridade recomendada:**
1. Fase 1 (voice fixes) + Fase 6 (achievements) — em paralelo, impacto imediato
2. Fase 2 (parser opt) + Fase 7 (streaks) — em paralelo
3. Fase 3 (AI latency) + Fase 8 (leaderboard)
4. Fase 4 (wake word) + Fase 9 (challenges)
5. Fase 5 (analytics) + Fase 10 (social)

---

## Considerações Transversais

- **Offline-first:** Todos os novos stores Zustand usam `SecureStorage` (padrão do `historyStore.ts`). Sync com Firestore é fire-and-forget
- **Performance:** Achievement evaluation roda apenas no fim da partida (não durante gameplay). Voice analytics usa buffer em memória, persiste só em background/close
- **i18n:** Toda string user-facing usa `t()` do `LanguageContext`. Nomes de achievements/challenges são chaves i18n
- **Backward compat:** Novos campos em `ProfileStats` e `GameConfig` têm defaults. `mergeStats` já lida com `undefined` (linha 120)
- **3 idiomas:** PT/EN/ES para todos os textos novos

---

## Verificação

1. **Voice:** Ativar voz no toggle mode → falar "ponto time A" → deve executar com confidence ≥ 0.85. Repetir no Android emulator. Verificar logs no VoiceLogger
2. **Auto-restart:** Ativar voz → esperar silêncio até Web Speech API parar → verificar que reinicia automaticamente
3. **Achievements:** Jogar partida completa → verificar que achievements são avaliados → notificação aparece para novos desbloqueios
4. **Streaks:** Jogar uma partida → verificar daily streak = 1. Jogar outra no mesmo dia → streak mantém. Simular data diferente → streak incrementa
5. **Leaderboard:** Verificar tabs semanal/mensal filtram corretamente. Verificar busca por nome funciona
6. **Challenges:** Verificar que progresso atualiza após cada partida. Verificar reset diário/semanal
