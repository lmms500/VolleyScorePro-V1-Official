# Plano de Correção: Animações da Quadra Tática

## Problemas Identificados

### 1. Animações de MVP e Servidor "Feias e Mal Posicionadas"
**Causa:** O `contain: 'layout style paint'` adicionado ao `DraggablePlayer` está cropando os elementos que se estendem além do container:
- Server Ring: `-inset-2.5` (10px além das bordas)
- MVP Glow: `-inset-1` (4px além das bordas)

**Solução:** Remover `contain: paint` e usar apenas `contain: layout` ou remover completamente.

### 2. Badges dos Jogadores Piscando no Modo Fullscreen/Paisagem
**Causa Provável:** 
- Conflito de `layoutId` entre times
- Animações de layout do Framer Motion sendo re-triggeradas

**Solução:** 
- Manter o `layoutId` prefixado com `teamId` (já implementado)
- Usar `layout="position"` em vez de `layout` (já implementado)
- Remover `contain: paint` que pode estar causando re-renders

### 3. Nomes dos Jogadores Não Aparecem
**Causa:** O `contain: paint` está clipando o Name Label que é posicionado absolutamente fora do container principal.

**Solução:** Remover `contain: paint` do motion.div principal.

### 4. Reconhecimento de Voz Ainda Não Funciona
**Status:** Logging detalhado foi adicionado. Precisa verificar logs no dispositivo para identificar:
- Se o plugin está disponível
- Se a permissão foi concedida
- Qual erro específico está ocorrendo

## Mudanças Necessárias

### Arquivo: `src/features/court/components/VolleyballCourt.tsx`

#### Mudança 1: Remover `contain: paint` do DraggablePlayer

```typescript
// ANTES (linha 109)
contain: 'layout style paint'

// DEPOIS
contain: 'layout style'  // Remove 'paint' para permitir overflow visual
```

#### Mudança 2: Adicionar `overflow: visible` explicitamente

```typescript
style={{
    touchAction: 'none',
    transform: 'translateZ(0)',
    willChange: isDragging ? 'transform, opacity' : 'transform',
    contain: 'layout style',  // Sem 'paint'
    overflow: 'visible'        // Garante que elementos filhos não sejam clipados
}}
```

#### Mudança 3: Ajustar z-index dos elementos internos

Os elementos de MVP e Server Ring precisam ter z-index adequado para não serem sobrepostos:

```typescript
// Server Ring - precisa estar atrás do token mas visível
{isServer && (
    <motion.div
        layoutId={`serve-ring-${teamId}`}
        className="absolute -inset-2.5 rounded-full border-[4px] border-dashed border-cyan-400 animate-[spin_6s_linear_infinite]"
        style={{
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.7), 0 0 40px rgba(34, 211, 238, 0.4)',
            transform: 'translateZ(0)',
            willChange: 'transform',
            zIndex: 0  // Atrás do token
        }}
        transition={courtServeRingTransition}
    />
)}

// MVP Glow - precisa estar atrás do token mas visível
{isMVP && (
    <>
        <div
            className="absolute -inset-1 rounded-full animate-pulse"
            style={{
                boxShadow: '0 0 25px rgba(255, 255, 255, 0.8), 0 0 50px rgba(251, 191, 36, 0.5), inset 0 0 15px rgba(251, 191, 36, 0.3)',
                zIndex: 0
            }}
        />
        <div className="absolute inset-0 rounded-full ring-4 ring-white/90" style={{ zIndex: 0 }} />
        <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-amber-400" style={{ zIndex: 0 }} />
    </>
)}
```

#### Mudança 4: Garantir que o Name Label não seja clipado

O Name Label está posicionado com classes como `-top-5` ou `left-[100%]`, que o colocam fora do container. Precisamos garantir que o container pai não tenha `overflow: hidden`.

### Arquivo: Verificar containers pais

Verificar se há outros containers com `overflow: hidden` que possam estar clipando os elementos.

## Resumo das Correções

| Problema | Causa | Solução |
|----------|-------|---------|
| MVP/Servidor cropados | `contain: paint` | Remover `paint` do contain |
| Badges piscando | Conflito de layout | Manter layoutId prefixado + remover paint |
| Nomes não aparecem | `contain: paint` clipando | Remover `paint` + adicionar `overflow: visible` |
| Voz não funciona | ? | Verificar logs no dispositivo |

## Próximos Passos

1. Implementar correções no VolleyballCourt.tsx
2. Build e testar no dispositivo
3. Verificar logs de voz para diagnóstico adicional
