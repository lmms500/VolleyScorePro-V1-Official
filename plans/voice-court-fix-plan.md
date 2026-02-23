# Plano de Correção: Comando por Voz + Glitch na Visão Tática

## Data: 2026-02-23
## Status: Análise Completa

---

## Problema 1: Comando por Voz Não Funciona no Android

### Sintomas
- Usuário ativa o botão de voz nas configurações
- Ao clicar no botão de microfone, aparece "Erro no reconhecimento de voz"
- O sistema não ativa o reconhecimento de voz

### Análise de Causa Raiz

#### Arquitetura Atual de Voz
O sistema de voz é composto por:

1. **[`VoiceRecognitionService.ts`](src/features/voice/services/VoiceRecognitionService.ts)** - Singleton que gerencia reconhecimento
   - Usa `@capacitor-community/speech-recognition` para nativo
   - Usa Web Speech API para web

2. **[`useVoiceControl.ts`](src/features/voice/hooks/useVoiceControl.ts)** - Hook que integra voz com ações do jogo

#### Fluxo de Inicialização
```
1. checkAvailability() → SpeechRecognition.available()
2. requestPermissions() → SpeechRecognition.requestPermissions()
3. start() → SpeechRecognition.start()
```

#### Possíveis Causas Identificadas

1. **Erro genérico sem detalhes**
   - Em [`VoiceRecognitionService.ts`](src/features/voice/services/VoiceRecognitionService.ts) linha 203:
   ```typescript
   this.handleError('generic');
   ```
   - O erro é capturado mas não logado com detalhes suficientes

2. **Permissão pode não ser persistente**
   - A permissão `RECORD_AUDIO` está no AndroidManifest.xml (linha 42)
   - Mas pode haver problema com permissões runtime do Android 13+

3. **Possível problema com o plugin Capacitor**
   - O plugin `@capacitor-community/speech-recognition` pode ter incompatibilidade
   - Necessário verificar se está instalado corretamente

4. **Missing Android Speech Recognition Intent**
   - Alguns dispositivos Android precisam de configuração adicional
   - O intent do Google Voice pode não estar disponível

### Solução Proposta

#### 1. Melhorar Logging de Erros
```typescript
// Em VoiceRecognitionService.ts internalStartNative
} catch (e: unknown) {
  const err = e as { message?: string; error?: string; code?: string };
  console.error('[VoiceService] Native Error:', {
    message: err.message,
    error: err.error,
    code: err.code,
    fullError: JSON.stringify(e)
  });
  // ... resto do tratamento
}
```

#### 2. Verificar Disponibilidade Antes de Iniciar
```typescript
// Adicionar verificação mais robusta
public async checkAvailability(): Promise<boolean> {
  if (this.isNative) {
    try {
      const { available } = await SpeechRecognition.available();
      if (!available) {
        console.warn('[VoiceService] Speech recognition not available on this device');
        return false;
      }
      // Verificar se há reconhecedor de voz instalado
      return true;
    } catch (e) {
      console.error('[VoiceService] Availability check failed:', e);
      return false;
    }
  }
  return !!this.webRecognition;
}
```

#### 3. Adicionar Tratamento para Android 13+
```typescript
// Verificar permissão de microfone explicitamente
public async requestPermissions(): Promise<boolean> {
  if (this.isNative) {
    try {
      const status = await SpeechRecognition.requestPermissions();
      this.hasPermission = status.speechRecognition === 'granted';
      if (!this.hasPermission) {
        console.warn('[VoiceService] Permission denied:', status);
      }
      return this.hasPermission;
    } catch (e) {
      console.error('[VoiceService] Permission request failed:', e);
      return false;
    }
  }
  return true;
}
```

#### 4. Verificar capacitor.config.ts
```typescript
// Verificar se o plugin está configurado
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    SpeechRecognition: {
      // Configurações específicas se necessárias
    }
  }
};
```

---

## Problema 2: Glitch/Flickering na Visão Tática

### Sintomas
- Ao rotacionar jogadores na visão tática, header e badges piscam
- Ocorre principalmente após reinstalar o aplicativo
- Nem sempre acontece - parece intermitente

### Análise de Causa Raiz

#### Arquitetura da Visão Tática
1. **[`CourtLayout.tsx`](src/features/court/components/CourtLayout.tsx)** - Container principal com DndContext
2. **[`VolleyballCourt.tsx`](src/features/court/components/VolleyballCourt.tsx)** - Renderiza jogadores na quadra
3. **[`CourtHeader.tsx`](src/features/court/components/CourtHeader.tsx)** - Header com placar

#### Possíveis Causas Identificadas

1. **layoutId em DraggablePlayer** (VolleyballCourt.tsx linha 92)
   ```typescript
   <motion.div
     layoutId={player.id}
     layout="position"
   ```
   - O `layoutId` pode causar flickering se o ID não for estável
   - Quando jogadores rotacionam, os IDs podem colidir temporariamente

2. **LayoutGroup pode causar re-flows**
   - O `LayoutGroup` do framer-motion coordena todas as animações
   - Pode causar flickering durante cálculos iniciais

3. **Falta de memoização em componentes filhos**
   - `MiniBadge` e `TimeoutControl` são memoizados
   - Mas outros componentes podem não ser

4. **Primeira renderização após instalação**
   - O cache de assets pode não estar pronto
   - Animações sendo calculadas pela primeira vez

### Solução Proposta

#### 1. Estabilizar layoutId
```typescript
// Em VolleyballCourt.tsx DraggablePlayer
<motion.div
  layoutId={`${teamId}-player-${player.id}`}  // ID único e estável
  layout="position"
  transition={{
    ...courtPlayerPositionTransition,
    // Adicionar delay para evitar colisões
    delay: isDragging ? 0 : 0.05
  }}
```

#### 2. Otimizar CourtHeader
```typescript
// Adicionar memoização mais agressiva
const CourtHeaderMemo = React.memo(CourtHeaderComponent, (prev, next) => {
  return (
    prev.scoreA === next.scoreA &&
    prev.scoreB === next.scoreB &&
    prev.servingTeam === next.servingTeam &&
    prev.teamA.name === next.teamA.name &&
    prev.teamB.name === next.teamB.name
    // ... outras props relevantes
  );
});
```

#### 3. Adicionar will-change para animações
```typescript
// Em DraggablePlayer
style={{
  touchAction: 'none',
  transform: 'translateZ(0)',
  willChange: isDragging ? 'transform, opacity' : 'transform',
  // Adicionar contain para isolar reflows
  contain: 'layout style paint'
}}
```

#### 4. Otimizar transições de rotação
```typescript
// Em animations.ts
export const courtPlayerPositionTransition = {
  type: 'spring',
  stiffness: 400,  // Aumentar para transição mais rápida
  damping: 30,
  mass: 0.5,       // Reduzir massa para menos inércia
};
```

---

## Plano de Implementação

### Fase 1: Correção do Comando por Voz (Prioridade Alta)
1. [ ] Adicionar logging detalhado em VoiceRecognitionService.ts
2. [ ] Verificar se o plugin @capacitor-community/speech-recognition está instalado
3. [ ] Testar permissões de microfone no Android
4. [ ] Adicionar tratamento específico para Android 13+
5. [ ] Testar em dispositivo Android real

### Fase 2: Correção do Glitch na Visão Tática (Prioridade Média)
1. [ ] Estabilizar layoutId em VolleyballCourt.tsx
2. [ ] Otimizar memoização em CourtHeader.tsx
3. [ ] Adicionar CSS containment em DraggablePlayer
4. [ ] Ajustar transições de rotação
5. [ ] Testar rotação após reinstalação

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/features/voice/services/VoiceRecognitionService.ts` | Logging, tratamento de erros |
| `src/features/court/components/VolleyballCourt.tsx` | Estabilizar layoutId, CSS containment |
| `src/features/court/components/CourtHeader.tsx` | Memoização otimizada |
| `src/lib/utils/animations.ts` | Ajustar transições |

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Mudanças no voice podem afetar web | Testar em ambas plataformas |
| layoutId pode quebrar drag & drop | Usar IDs únicos com prefixo de team |
| Memoização pode esconder updates | Usar comparação customizada |

---

## Notas Adicionais

- O problema de voz é mais crítico pois impede funcionalidade
- O glitch da visão tática é visual e intermitente
- Ambos os problemas podem estar relacionados a cache/estado inicial
