# Plano de Correção: Áudio Craquelando + Flickering no Nome do Time

## Data: 2026-02-23
## Status: Análise Completa

---

## Problema 1: Áudio Craquelando no Android

### Sintomas
- O áudio fica "craquelando" (crackling) no Android
- Ocorre principalmente quando vários pontos são adicionados rapidamente
- O problema já havia sido corrigido anteriormente mas voltou

### Análise de Causa Raiz

#### Arquitetura Atual de Áudio
O sistema de áudio é composto por:

1. **[`AudioService.ts`](src/lib/audio/AudioService.ts)** - Singleton que gerencia Web Audio API
   - Usa `AudioContext` com `latencyHint: 'interactive'`
   - Possui um `DynamicsCompressor` na cadeia master
   - Cada som cria osciladores e gain nodes dinamicamente

2. **[`useSensoryFX.ts`](src/features/game/hooks/useSensoryFX.ts)** - Dispara sons baseado em mudanças de estado
   - Monitora `state.scoreA`, `state.scoreB`, etc.
   - Chama `audio.playScore()` quando pontuação aumenta

3. **[`useScoreCardLogic.ts`](src/features/game/hooks/useScoreCardLogic.ts)** - Dispara `audio.playTap()` no tap

#### Causas Identificadas

1. **Múltiplas chamadas simultâneas de áudio**
   - Quando pontos são adicionados rapidamente, múltiplos sons são disparados
   - Não há "debounce" ou "voice stealing" para prevenir sobreposição
   - Cada `playScore()` cria novos osciladores sem limite

2. **DynamicsCompressor com attack=0** (linha 93)
   ```typescript
   this.dynamicsCompressor.attack.value = 0;
   ```
   - Attack zero significa resposta instantânea
   - Pode causar artefatos quando múltiplos sons colidem

3. **Falta de pooling de vozes**
   - Cada chamada cria novo oscilador + gain node
   - Em rápidas sucessões, isso sobrecarrega o Android

### Solução Proposta

#### 1. Implementar Voice Pooling no AudioService
```typescript
// Adicionar ao AudioService:
private activeVoices: Set<OscillatorNode> = new Set();
private readonly MAX_VOICES = 8;

private limitVoices() {
  if (this.activeVoices.size >= this.MAX_VOICES) {
    // Remover voz mais antiga
    const oldest = this.activeVoices.values().next().value;
    if (oldest) {
      oldest.stop();
      this.activeVoices.delete(oldest);
    }
  }
}
```

#### 2. Ajustar DynamicsCompressor
```typescript
// Mudar de:
this.dynamicsCompressor.attack.value = 0;
// Para:
this.dynamicsCompressor.attack.value = 0.003; // 3ms attack
```

#### 3. Adicionar Debounce no playScore
```typescript
private lastScoreTime = 0;
private readonly SCORE_DEBOUNCE_MS = 50;

public playScore(lowGraphics: boolean) {
  const now = Date.now();
  if (now - this.lastScoreTime < this.SCORE_DEBOUNCE_MS) return;
  this.lastScoreTime = now;
  // ... resto do código
}
```

---

## Problema 2: Flickering no Nome do Time

### Sintomas
- O nome do time pisca levemente (flickering/glitching)
- Ocorre ao adicionar pontos no modo normal
- O problema já havia sido corrigido mas voltou

### Análise de Causa Raiz

#### Fluxo de Dados
```
GameContext.tsx
  └── RosterContext (teamARoster, teamBRoster)
       └── ScoreCardContainer.tsx
            └── team = teamId === 'A' ? teamARoster : teamBRoster
                 └── ScoreCardNormal.tsx (memo)
                      └── <h2>{team?.name}</h2>
```

#### Causas Identificadas

1. **Re-criação de objetos no reducer**
   - Em [`scoring.ts`](src/features/game/reducers/scoring.ts) linhas 40-54:
   ```typescript
   let nextTeamA = state.teamARoster;
   let nextTeamB = state.teamBRoster;
   // ...
   if (team === 'A') { 
     nextTeamA = { ...state.teamARoster, players: rotateClockwise(...), tacticalOffset: 0 }; 
   }
   ```
   - Mesmo quando não há rotação, novas referências podem ser criadas

2. **motion.div com layout prop**
   - Em [`ScoreCardNormal.tsx`](src/features/game/components/ScoreCardNormal.tsx) linha 94:
   ```typescript
   <motion.div
     layout
     transition={{ type: 'spring', stiffness: 300, damping: 30 }}
   ```
   - O `layout` prop força recálculo de layout em cada re-render

3. **motion.div interno com layout** (linha 129-155)
   ```typescript
   <motion.div
     layout
     className="flex items-center justify-center gap-3..."
   ```
   - Este envolve diretamente o nome do time
   - Re-renders causam animações de layout

4. **Dependências do RosterContext**
   - Em [`GameContext.tsx`](src/features/game/context/GameContext.tsx) linhas 170-200:
   - `rosterState` inclui `teamARoster` e `teamBRoster`
   - Mudanças no score causam re-criação de objetos no reducer
   - Isso propaga para todos os consumidores do contexto

### Solução Proposta

#### 1. Estabilizar referência do team no ScoreCardContainer
```typescript
// Em ScoreCardContainer.tsx, adicionar:
const team = useMemo(() => {
  return teamId === 'A' ? teamARoster : teamBRoster;
}, [teamId, teamARoster?.id, teamARoster?.name, teamARoster?.color, teamBRoster?.id, teamBRoster?.name, teamBRoster?.color]);
```

#### 2. Otimizar motion.div no ScoreCardNormal
```typescript
// Linha 94 - Remover layout ou usar layout="position"
<motion.div
  layout="position"  // Só anima posição, não tamanho
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
```

```typescript
// Linha 129 - Remover layout do container do nome
<motion.div
  // Remover layout prop completamente
  className="flex items-center justify-center gap-3..."
```

#### 3. Otimizar scoring reducer
```typescript
// Em scoring.ts, evitar re-criação desnecessária:
let nextTeamA = state.teamARoster;
let nextTeamB = state.teamBRoster;

// Só criar novo objeto se houver mudança real
if (!autoRotated) {
  // Manter referências originais se não houve rotação
  nextTeamA = state.teamARoster;
  nextTeamB = state.teamBRoster;
}
```

#### 4. Usar React.memo com comparação customizada (opcional)
```typescript
// Em ScoreCardNormal.tsx
const arePropsEqual = (prev: ScoreCardNormalProps, next: ScoreCardNormalProps) => {
  return (
    prev.teamId === next.teamId &&
    prev.team?.name === next.team?.name &&
    prev.team?.color === next.team?.color &&
    prev.score === next.score &&
    // ... outras props relevantes
  );
};

export const ScoreCardNormal = React.memo(ScoreCardNormalComponent, arePropsEqual);
```

---

## Plano de Implementação

### Fase 1: Correção do Áudio (Prioridade Alta)
1. [ ] Modificar `AudioService.ts` - Adicionar voice pooling
2. [ ] Modificar `AudioService.ts` - Ajustar DynamicsCompressor attack
3. [ ] Modificar `AudioService.ts` - Adicionar debounce no playScore
4. [ ] Testar em dispositivo Android real

### Fase 2: Correção do Flickering (Prioridade Alta)
1. [ ] Modificar `ScoreCardNormal.tsx` - Otimizar motion.div layout props
2. [ ] Modificar `ScoreCardContainer.tsx` - Estabilizar referência do team
3. [ ] Modificar `scoring.ts` - Evitar re-criação desnecessária de objetos
4. [ ] Testar em modo normal

### Fase 3: Validação
1. [ ] Testar adição rápida de pontos (5+ pontos em sequência)
2. [ ] Verificar áudio no Android
3. [ ] Verificar flickering no nome do time
4. [ ] Verificar se animações permanecem fluidas
5. [ ] Verificar se funcionalidade não foi alterada

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/lib/audio/AudioService.ts` | Voice pooling, compressor attack, debounce |
| `src/features/game/components/ScoreCardNormal.tsx` | Otimizar motion.div |
| `src/features/game/components/ScoreCardContainer.tsx` | Estabilizar team reference |
| `src/features/game/reducers/scoring.ts` | Evitar re-criação de objetos |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Voice pooling pode cortar sons importantes | Limitar a 8 vozes, remover apenas sons antigos |
| Debounce pode perder sons | Usar valor baixo (50ms) |
| Remover layout pode quebrar animações | Usar `layout="position"` como alternativa |
| Mudanças no reducer podem ter side effects | Testar extensivamente undo/redo |

---

## Notas Adicionais

- O problema do áudio é mais crítico no Android devido à menor capacidade de processamento de áudio
- O flickering pode ser mais visível em dispositivos com menor taxa de atualização de tela
- Ambos os problemas foram introduzidos gradualmente ao longo do tempo
- É importante manter a funcionalidade de animações enquanto corrige os glitches
