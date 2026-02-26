# Parakeet V3 Integration Analysis - VolleyScore Pro

## Executive Summary

O **Parakeet V3** (NVIDIA NeMo) é um modelo ASR (Automatic Speech Recognition) state-of-the-art que oferece:
- **WER (Word Error Rate)** significativamente menor que Google Speech Recognition
- Melhor performance em ambientes ruidosos (quadras de vôlei)
- Excelente reconhecimento de números e nomes próprios
- Suporte nativo a português brasileiro

---

## Options Comparison

### Option 1: NVIDIA Riva API (Cloud)

**Architecture:**
```
[App Mobile] → [Riva Speech API] → [NVIDIA Cloud/GPU Infrastructure]
```

**Pros:**
- ✅ Zero infraestrutura local
- ✅ Modelo sempre atualizado
- ✅ Baixa latência (~100-200ms streaming)
- ✅ Suporte oficial NVIDIA
- ✅ Streaming em tempo real

**Cons:**
- ❌ Custo por minuto de áudio (~$0.006/min estimates)
- ❌ Dependência de conectividade
- ❌ Dados de áudio enviados para cloud
- ❌ Requer conta NVIDIA Enterprise/Developer

**Implementation Complexity:** ⭐⭐ (Médio)

**Cost Estimate:**
- Free tier: 180 minutos/mês
- Paid: ~$0.006/minuto de áudio processado

---

### Option 2: Self-Hosted NeMo (On-Premise)

**Architecture:**
```
[App Mobile] → [Seu Servidor API] → [GPU Server com NeMo/Parakeet]
```

**Pros:**
- ✅ Controle total dos dados
- ✅ Sem custo por uso (apenas infra)
- ✅ Pode otimizar para domínio específico (vôlei)
- ✅ Funciona offline (se servidor local)

**Cons:**
- ❌ Requer GPU server (mínimo T4/A10)
- ❌ Complexidade de DevOps
- ❌ Manutenção e updates
- ❌ Latência depende da infra

**Implementation Complexity:** ⭐⭐⭐⭐ (Alto)

**Cost Estimate:**
- GPU Cloud (AWS G4dn): ~$0.50-1.00/hora
- GPU Cloud (Lambda Labs): ~$0.50/hora
- Ou servidor dedicado com GPU

---

### Option 3: Hybrid Approach (Recomendado)

**Architecture:**
```
[App Mobile]
    ├── [Google Speech Recognition] (fallback offline)
    └── [Parakeet V3 API] (quando online)
```

**Pros:**
- ✅ Funciona offline com Google
- ✅ Melhor precisão quando online
- ✅ Graceful degradation
- ✅ Custo controlado (só usa Parakeet quando necessário)

**Cons:**
- ❌ Complexidade de fallback
- ❌ Dois sistemas para manter

**Implementation Complexity:** ⭐⭐⭐ (Médio-Alto)

---

## Technical Implementation Details

### Parakeet V3 Model Specs

| Spec | Value |
|------|-------|
| Model Size | ~1GB (Parakeet-TDT) |
| Latency | 100-300ms (streaming) |
| Languages | 100+ (incl. pt-BR) |
| WER (pt-BR) | ~4-6% vs ~10-15% Google |
| GPU Memory | ~2-4GB VRAM |

### API Integration Pattern

```typescript
// Proposed interface for Parakeet service
interface ParakeetConfig {
  endpoint: string;        // API endpoint
  apiKey?: string;         // If cloud
  language: string;        // pt-BR, en-US, etc.
  streaming: boolean;      // Real-time vs batch
  domain?: 'volleyball';   // Custom vocabulary
}

interface ParakeetResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  words?: WordTiming[];    // For advanced features
}
```

---

## Recommendation for VolleyScore Pro

### Phase 1: Proof of Concept (2-3 dias)
1. Testar NVIDIA Riva API (free tier)
2. Implementar service adapter pattern
3. Comparar qualidade vs Google em cenários reais

### Phase 2: Integration (1 semana)
1. Criar `ParakeetRecognitionService` 
2. Implementar fallback para Google Speech
3. Adicionar configuração de preferência

### Phase 3: Optimization (Ongoing)
1. Custom vocabulary para vôlei
2. Fine-tuning para nomes de jogadores
3. Caching de modelos comuns

---

## Architecture Proposal

### Service Layer

```
src/features/voice/services/
├── VoiceRecognitionService.ts      # Existing (Google)
├── ParakeetRecognitionService.ts   # NEW: Parakeet V3
├── HybridRecognitionService.ts     # NEW: Fallback logic
└── RecognitionProvider.ts          # NEW: Factory/Strategy
```

### Configuration

```typescript
// src/config/voiceRecognition.ts
export const VOICE_RECOGNITION_CONFIG = {
  primaryProvider: 'parakeet' as const,  // or 'google'
  fallbackProvider: 'google' as const,
  parakeet: {
    endpoint: import.meta.env.VITE_PARAKEET_ENDPOINT,
    apiKey: import.meta.env.VITE_PARAKEET_API_KEY,
    streaming: true,
  },
  fallbackTimeout: 5000,  // Fallback after 5s if no response
};
```

---

## Next Steps

1. **Decisão de Provider**: Cloud (Riva) vs Self-Hosted
2. **Setup de Credenciais**: Conta NVIDIA ou servidor próprio
3. **Implementação do Service Adapter**
4. **Testes A/B**: Comparar qualidade em cenários reais
5. **Rollout Gradual**: Feature flag para usuários beta

---

## Questions to Answer

1. **Volume de uso estimado?** (minutos/dia de reconhecimento de voz)
2. **Requisito de offline?** (precisa funcionar sem internet?)
3. **Budget disponível?** (cloud vs self-hosted)
4. **Latência aceitável?** (tempo máximo de resposta)
5. **Privacidade de dados?** (áudio pode ir para cloud?)

---

## Conclusion

Para o VolleyScore Pro, recomendo começar com **Option 1 (NVIDIA Riva)** para PoC, pois:
- Menor barreira técnica inicial
- Free tier suficiente para testes
- Qualidade comprovada do Parakeet V3
- Migração para self-hosted é possível depois

Se o volume de uso for alto (>10k minutos/mês), avaliar **Option 2 (Self-Hosted)** para reduzir custos.

---

*Document created: 2026-02-23*
*Status: Analysis Complete - Awaiting Decision*
