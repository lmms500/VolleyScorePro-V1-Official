# Broadcast Overlay Profissional - Plano de Implementação

## Visão Geral

Transformar o broadcast overlay do VolleyScore-Pro em um sistema de nível profissional, comparável aos utilizados em ligas internacionais de vôlei (FIVB, Champions League, Olympics), mantendo o design premium e refinado do aplicativo.

---

## Estado Atual

### Componentes Existentes

| Arquivo | Função |
|---------|--------|
| `BroadcastBar.tsx` | Barra principal compacta para OBS |
| `BroadcastOverlay.tsx` | Overlay alternativo bottom-center |
| `ObsScoreDisplay.tsx` | Display full-screen para OBS |
| `BroadcastScreen.tsx` | Tela de entrada do modo broadcast |

### Features Implementadas

- [x] Nomes dos times (truncados)
- [x] Logos dos times
- [x] Cores dinâmicas com glow
- [x] Score ticker animado (blur transition)
- [x] Indicadores de sets ganhos
- [x] Histórico de sets anteriores
- [x] Indicador de saque (volleyball icon)
- [x] Set Point / Match Point badges
- [x] Tie break info
- [x] Progress bars
- [x] Layout horizontal/vertical
- [x] Transparência para OBS

---

## Gap Analysis: Elementos de Ligas Profissionais

### Informações Faltando

| Elemento | Prioridade | Complexidade |
|----------|------------|--------------|
| Match Timer (cronômetro) | Alta | Baixa |
| Timeouts restantes visual | Alta | Baixa |
| Nome do evento/campeonato | Média | Baixa |
| Fase do torneio | Média | Baixa |
| Estatísticas de equipe | Alta | Alta |
| Lower thirds ( jogador) | Alta | Alta |
| Rotação atual (1-6) | Média | Média |
| Formação em quadra | Baixa | Alta |
| Celebrações animadas | Média | Média |
| Sponsor logos | Baixa | Média |

---

## Plano de Implementação

### Fase 1: Infraestrutura Base

#### 1.1 Broadcast Configuration System
**Arquivo**: `src/features/broadcast/config/BroadcastConfig.ts`

```typescript
interface BroadcastConfig {
  eventName: string;           // "Campeonato Paulista 2026"
  eventPhase: string;          // "Final", "Semifinal", "Quartas"
  venue: string;               // "Ginásio do Ibirapuera"
  broadcaster: string;         // "SporTV", "ESPN"
  showSponsors: boolean;       // Preparado para futuro
  theme: 'minimal' | 'espn' | 'olympic' | 'custom';
  autoShowLowerThirds: boolean;
  lowerThirdDuration: number;  // ms
}
```

#### 1.2 Match Timer Display
**Modificar**: `BroadcastBar.tsx`
- Adicionar cronômetro formatado (MM:SS)
- Fonte: `state.matchDurationSeconds` + `state.isTimerRunning`
- Posição: abaixo do indicador de set

#### 1.3 Timeouts Visual Counter
**Modificar**: `BroadcastBar.tsx`
- Adicionar indicadores de timeouts (0-2)
- Fonte: `state.timeoutsA`, `state.timeoutsB`
- Visual: ícones pequenos ao lado dos nomes

---

### Fase 2: Estatísticas em Tempo Real

#### 2.1 Stats Calculator Utility
**Arquivo**: `src/features/broadcast/utils/statsCalculator.ts`

Funções:
- `calculateTeamStats(matchLog, teamId)` - Calcula ataques, bloqueios, aces, erros
- `calculatePlayerStats(matchLog, playerId)` - Stats por jogador
- `getEfficiency(attempts, errors)` - Porcentagem de eficiência
- `getTopScorer(matchLog, teamRoster)` - Maior pontuador

#### 2.2 Team Stats Overlay Component
**Arquivo**: `src/features/broadcast/components/stats/TeamStatsOverlay.tsx`

Layout:
```
┌─────────────────────────────────────────┐
│           TEAM STATS                     │
├─────────────────┬───────────────────────┤
│     TEAM A      │       TEAM B          │
│  ───────────    │    ───────────        │
│  Ataques:  12   │    Ataques:   8       │
│  Bloqueios: 3   │    Bloqueios: 2       │
│  Aces:      2   │    Aces:      1       │
│  Erros:     4   │    Erros:     6       │
│  Eff:      58%  │    Eff:      42%      │
└─────────────────┴───────────────────────┘
```

#### 2.3 Top Player Overlay
**Arquivo**: `src/features/broadcast/components/stats/TopPlayerOverlay.tsx`

Mostra o maior pontuador da partida com foto/número.

---

### Fase 3: Lower Thirds System

#### 3.1 Lower Third Base Component
**Arquivo**: `src/features/broadcast/components/lower-thirds/LowerThird.tsx`

Animações:
- Entrada: slide da esquerda + fade in
- Saída: fade out
- Duração configurável

#### 3.2 Point Scorer Graphic
**Arquivo**: `src/features/broadcast/components/lower-thirds/PointScorerGraphic.tsx`

Exibido automaticamente quando:
- Jogador pontua (se `playerId` estiver registrado no `matchLog`)
- Auto-hide após 3 segundos

Layout:
```
┌──────────────────────────────────┐
│ ▌ 14  JOÃO SILVA                 │
│      PONTO!                      │
│      8 pontos na partida         │
└──────────────────────────────────┘
```

#### 3.3 Player Spotlight Graphic
**Arquivo**: `src/features/broadcast/components/lower-thirds/PlayerSpotlight.tsx`

Para substituições e destaques especiais.

---

### Fase 4: Rotação & Formação

#### 4.1 Rotation Display Component
**Arquivo**: `src/features/broadcast/components/formation/RotationDisplay.tsx`

Mostra posição atual de rotação (1-6) de cada time.
Indicador especial para Líbero.

#### 4.2 Court Formation Mini-Map (Opcional)
**Arquivo**: `src/features/broadcast/components/formation/CourtFormationOverlay.tsx`

Visual 2D simplificado da quadra com posições dos jogadores.

---

### Fase 5: Animações de Celebração

#### 5.1 Point Celebration
**Arquivo**: `src/features/broadcast/components/animations/PointCelebration.tsx`

Efeitos:
- Flash colorido rápido
- Glow pulse no score
- Partículas sutis (opcional)

#### 5.2 Set Win Celebration
**Arquivo**: `src/features/broadcast/components/animations/SetWinCelebration.tsx`

- Banner animado "SET [N]"
- Confetti lateral
- Som de celebração (se habilitado)

#### 5.3 Match Win Celebration
**Arquivo**: `src/features/broadcast/components/animations/MatchWinCelebration.tsx`

- Trophy icon animado
- Confetti em massa
- Nome do vencedor em destaque
- Score final

---

### Fase 6: Broadcast Manager & Control

#### 6.1 Broadcast Manager Hook
**Arquivo**: `src/features/broadcast/hooks/useBroadcastManager.ts`

Estado:
```typescript
interface BroadcastManagerState {
  activeOverlays: Set<string>;
  showStats: boolean;
  showLowerThirds: boolean;
  showFormation: boolean;
  lastPointScorer: Player | null;
  pendingCelebration: 'point' | 'set' | 'match' | null;
}
```

#### 6.2 Auto Graphics Hook
**Arquivo**: `src/features/broadcast/hooks/useAutoGraphics.ts`

Controla exibição automática de:
- Lower thirds de pontuador
- Celebrações
- Transições

---

### Fase 7: Event & Branding

#### 7.1 Event Header Component
**Arquivo**: `src/features/broadcast/components/event/EventHeader.tsx`

Topo da tela mostrando:
- Nome do campeonato
- Fase
- Local

#### 7.2 Match Intro Graphic
**Arquivo**: `src/features/broadcast/components/event/MatchIntroGraphic.tsx`

Animação de entrada no início da partida:
- Logos dos times
- Nomes
- Configuração (best of X)

---

## Estrutura de Arquivos Final

```
src/features/broadcast/
├── components/
│   ├── core/
│   │   ├── BroadcastBar.tsx          [ATUALIZAR]
│   │   ├── BroadcastOverlay.tsx      [ATUALIZAR]
│   │   └── ObsScoreDisplay.tsx       [ATUALIZAR]
│   ├── stats/
│   │   ├── TeamStatsOverlay.tsx      [NOVO]
│   │   ├── TopPlayerOverlay.tsx      [NOVO]
│   │   └── StatsComparison.tsx       [NOVO]
│   ├── lower-thirds/
│   │   ├── LowerThird.tsx            [NOVO]
│   │   ├── PointScorerGraphic.tsx    [NOVO]
│   │   └── PlayerSpotlight.tsx       [NOVO]
│   ├── formation/
│   │   ├── RotationDisplay.tsx       [NOVO]
│   │   └── CourtFormationOverlay.tsx [NOVO - opcional]
│   ├── animations/
│   │   ├── PointCelebration.tsx      [NOVO]
│   │   ├── SetWinCelebration.tsx     [NOVO]
│   │   └── MatchWinCelebration.tsx   [NOVO]
│   ├── event/
│   │   ├── EventHeader.tsx           [NOVO]
│   │   └── MatchIntroGraphic.tsx     [NOVO]
│   └── control/
│       └── BroadcastControlPanel.tsx [NOVO]
├── hooks/
│   ├── useBroadcastManager.ts        [NOVO]
│   ├── useStatsCalculator.ts         [NOVO]
│   └── useAutoGraphics.ts            [NOVO]
├── utils/
│   └── statsCalculator.ts            [NOVO]
├── config/
│   └── BroadcastConfig.ts            [NOVO]
├── types/
│   └── broadcast.ts                  [NOVO]
└── screens/
    └── BroadcastScreen.tsx           [ATUALIZAR]
```

---

## Dependências

### Atuais (já instaladas)
- framer-motion - Animações
- lucide-react - Ícones
- tailwindcss - Styling

### Novas (se necessário)
- canvas-confetti - Para celebrações (opcional)

---

## Ordem de Implementação Recomendada

1. **Fase 1**: Infraestrutura (timer, timeouts, config)
2. **Fase 5.1**: Point Celebration (impacto visual imediato)
3. **Fase 2**: Estatísticas (core feature)
4. **Fase 3**: Lower Thirds (profissionalismo)
5. **Fase 5.2/5.3**: Set/Match Celebrations
6. **Fase 4**: Rotação
7. **Fase 6**: Control Panel
8. **Fase 7**: Event Branding

---

## Estimativa

| Fase | Novos Arquivos | Arquivos Modificados | Linhas (est.) |
|------|----------------|---------------------|---------------|
| 1 | 2 | 3 | ~300 |
| 2 | 4 | 0 | ~400 |
| 3 | 4 | 0 | ~350 |
| 4 | 2 | 0 | ~200 |
| 5 | 3 | 0 | ~300 |
| 6 | 3 | 0 | ~250 |
| 7 | 2 | 0 | ~150 |
| **Total** | **20** | **3** | **~1950** |

---

## Notas de Design

### Cores
- Manter sistema dinâmico atual (team colors)
- Accent colors: cyan para serving, amber para set/match point
- Backgrounds: slate-950 com transparência

### Tipografia
- Font: atual do sistema (Geist/Inter)
- Weights: black para scores/títulos, bold para labels

### Animações
- Usar spring transitions (stiffness: 300-450, damping: 25-30)
- Blur effects para transições de números
- Respeitar `reducedMotion` preference

### Transparência OBS
- Todos os overlays devem ter background transparente
- Usar `bg-black/80` com `backdrop-blur`

---

## Checklist de Qualidade

- [ ] Funciona em 1920x1080 (1080p)
- [ ] Funciona em 1280x720 (720p)
- [ ] Performance: 60fps
- [ ] Sem memory leaks
- [ ] Acessível via teclado
- [ ] Respeita reduced motion
- [ ] OBS transparency funciona
- [ ] Sync em tempo real funciona
