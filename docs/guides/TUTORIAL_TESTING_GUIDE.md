🧪 TUTORIAL INTERATIVO - GUIA DE TESTES E VALIDAÇÃO

═══════════════════════════════════════════════════════════════════════════════

📋 CHECKLIST DE VALIDAÇÃO

┌─ TESTES FUNCIONAIS ──────────────────────────────────────────────────────┐
│                                                                          │
│ ✅ FASE 1: TAP (Toque)                                                  │
│    □ Modal abre na etapa de Gestures                                    │
│    □ Mini-placar exibe score = 00                                       │
│    □ Texto mostra: "Tente agora: Toque para adicionar um ponto"        │
│    □ Botão "Próximo" está DESABILITADO (cinza, opaco)                  │
│    □ Usuário toca no mini-placar                                        │
│    □ Score incrementa: 00 → 01 (animação visível)                      │
│    □ Confetes explodem (8 partículas visíveis)                         │
│    □ Card [✓ TAP] marcado como completo                                │
│    □ Fase muda para SWIPE automaticamente                               │
│    □ Texto atualiza: "Agora deslize para baixo para corrigir"         │
│    □ Indicador Swipe começa a piscar                                    │
│                                                                          │
│ ✅ FASE 2: SWIPE DOWN (Deslizar)                                        │
│    □ Usuário desliza para baixo no mini-placar                         │
│    □ Score decrementa: 01 → 00 (animação visível)                      │
│    □ Confetes explodem novamente (8 partículas)                        │
│    □ Card [✓ SWIPE] marcado como completo                              │
│    □ Badge "Ready to Play!" aparece com animação spring                │
│    □ Botão "Próximo" agora está ATIVO (colorido, opaco 100%)          │
│    □ Botão "Próximo" pulsa (animate-pulse)                             │
│                                                                          │
│ ✅ NAVEGAÇÃO PÓS-CONCLUSÃO                                              │
│    □ Usuário clica "Próximo"                                            │
│    □ Modal avança para próxima etapa (config/settings)                 │
│    □ Ou fecha se era última etapa                                       │
│    □ Step 'gestures' é marcado em completedSteps                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ TESTES VISUAIS ─────────────────────────────────────────────────────────┐
│                                                                          │
│ ✅ MINI-PLACAR                                                          │
│    □ Gradiente branco/violeta correto (light mode)                     │
│    □ Gradiente escuro correto (dark mode)                              │
│    □ Border roxo-violeta com 2px                                       │
│    □ Shadow profundo visível                                            │
│    □ Border radius (3xl) suave                                          │
│    □ Texto "Current Score" cinzento e pequeno                          │
│    □ Score (00/01) em texto gigante roxo-violeta                       │
│                                                                          │
│ ✅ INDICADORES DE FASE                                                  │
│    □ 2 botões circulares: [   ] [   ] inicialmente                     │
│    □ Após TAP: [✓ TAP] [ ] com fundo violeta e checkmark              │
│    □ Após SWIPE: [✓ TAP] [✓ SWIPE] ambos completos                    │
│    □ Cores de fundo mudam para cinzento/violeta conforme estado       │
│                                                                          │
│ ✅ CONFETES                                                             │
│    □ 8 partículas pequenas roxo-violetas                               │
│    □ Explodem em direções aleatórias                                    │
│    □ Desaparecem suavemente (fade out)                                 │
│    □ Não deixam rastro (saudável para performance)                     │
│                                                                          │
│ ✅ BADGE "READY TO PLAY!"                                              │
│    □ Aparece após swipe bem-sucedido                                    │
│    □ Animação spring bounce no tamanho                                  │
│    □ Ícone Zap (raio) visível                                          │
│    □ Fundo roxo-violeta, texto branco                                  │
│    □ Posição centralizada no container                                  │
│                                                                          │
│ ✅ BOTÃO "PRÓXIMO"                                                      │
│    □ Inicialmente cinza (slate-300) e opaco (50%)                      │
│    □ Texto desabilitado/desfocado visualmente                          │
│    □ Após sucesso: roxo-violeta e opaco (100%)                        │
│    □ Pulsa (pulse animation) continuamente                             │
│    □ Sombra (shadow-lg) ao redor                                       │
│    □ Arredondado (rounded-2xl)                                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ TESTES DE RESPOSTA AO TOQUE ────────────────────────────────────────────┐
│                                                                          │
│ ✅ DETECÇÃO DE TAP                                                      │
│    □ Um toque simples registra como TAP                                 │
│    □ Múltiplos taps rápidos incrementam score (cooldown 100ms)        │
│    □ Toque com micro-movimento (< 8px) ainda registra                 │
│    □ Toque longo (> 350ms) não é registrado como tap                  │
│    □ Toque + movimento grande (> 8px) não é tap                       │
│                                                                          │
│ ✅ DETECÇÃO DE SWIPE DOWN                                              │
│    □ Deslizar para baixo (Y > 38px) registra como SWIPE               │
│    □ Deslizar para cima não registra (deve ser para baixo)            │
│    □ Deslizar para esquerda/direita não registra (vertical dominante) │
│    □ Swipe rápido ou lento ambos funcionam                            │
│    □ Múltiplos swipes funcionam corretamente                          │
│                                                                          │
│ ✅ BLOQUEIO DE INTERAÇÃO                                               │
│    □ Após TAP, swipes não funcionam enquanto em fase TAP              │
│    □ Após completar SWIPE, taps não adicham novo comportamento        │
│    □ Após bloqueio, nova tentativa de TAP funciona normalmente        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ TESTES DE HAPTIC FEEDBACK ──────────────────────────────────────────────┐
│                                                                          │
│ ✅ MOBILE/NATIVE (Android/iOS com Capacitor)                          │
│    □ TAP: Sente vibração leve (impact light) ~10ms                    │
│    □ SWIPE: Sente vibração dupla/sucesso                              │
│    □ Vibração não atrasa a UI (fire-and-forget)                       │
│    □ Vibração desabilitada em modo DND não afeta funcionalidade       │
│                                                                          │
│ ✅ WEB/BROWSER (Fallback navigator.vibrate)                           │
│    □ TAP: Vibração padrão se suportado                                │
│    □ SWIPE: Padrão duplo se suportado                                 │
│    □ Sem erro se vibrate não suportado                                │
│    □ UI responsiva mesmo sem haptics                                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ TESTES DE ACESSIBILIDADE ───────────────────────────────────────────────┐
│                                                                          │
│ ✅ KEYBOARD NAVIGATION                                                  │
│    □ Botão "Próximo" focável com Tab                                   │
│    □ Botão desabilitado mostra estado de foco visual diferente        │
│    □ Enter/Space ativa botão quando focado e ativo                    │
│                                                                          │
│ ✅ SCREEN READER                                                        │
│    □ Score lido como "Current Score: 00"                              │
│    □ Fase ativa indicada ("Tap required", "Swipe required")          │
│    □ Botão estado indicado ("Next button: disabled/enabled")         │
│                                                                          │
│ ✅ CONTRASTE                                                            │
│    □ Texto roxo-violeta tem contraste OK contra fundo branco         │
│    □ Texto branco tem contraste OK contra fundo roxo-violeta         │
│    □ Modo escuro tem contraste adequado                               │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ TESTES DE PERFORMANCE ──────────────────────────────────────────────────┐
│                                                                          │
│ ✅ RENDERIZAÇÃO                                                         │
│    □ Componente renderiza < 100ms inicial                             │
│    □ Animações rodam a 60fps (suave, não gaguejada)                  │
│    □ Confetes não causam lag (8 partículas é OK)                     │
│    □ Transições de fase suaves (< 400ms)                             │
│                                                                          │
│ ✅ MEMORY USAGE                                                         │
│    □ Nenhum vazamento de memória após 10+ interações                  │
│    □ Listeners limpos quando modal fecha (useEffect cleanup)          │
│    □ State cleanup correto entre reset de tutorial                    │
│                                                                          │
│ ✅ BATTERY USAGE                                                        │
│    □ Sem animação quando isPaused=true (economiza bateria)           │
│    □ Confetes param após 600ms (não rodam infinitamente)             │
│    □ Haptics breves e não bloqueantes                                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

🧪 COMO EXECUTAR OS TESTES

PASSO 1: Iniciar a Aplicação
─────────────────────────────────────────────────────────────────────────────
$ npm install    # Se necessário
$ npm run dev    # Inicia Vite dev server

PASSO 2: Navegar para Tutorial
─────────────────────────────────────────────────────────────────────────────
1. Abrir app no navegador (http://localhost:5173)
2. Clicar em "Tutorial" ou "Help" → "Main Tutorial"
3. Clicar em "Gestures" (etapa 2)
4. Modal abre com InteractiveGestureDemo

PASSO 3: Testar Fase 1 (TAP)
─────────────────────────────────────────────────────────────────────────────
1. Observar score = 00
2. Ler instrução: "Toque para adicionar um ponto"
3. Observar botão "Próximo" em cinza (desabilitado)
4. TAP no mini-placar (toque simples)
   ✓ Score muda para 01
   ✓ Confetes explodem
   ✓ Indicador [✓ TAP] aparece
   ✓ Instrução muda para "Deslize para baixo"

PASSO 4: Testar Fase 2 (SWIPE)
─────────────────────────────────────────────────────────────────────────────
1. SWIPE DOWN no mini-placar (deslizar para baixo)
   ✓ Score volta para 00
   ✓ Confetes explodem
   ✓ Indicador [✓ SWIPE] aparece
   ✓ Badge "Ready to Play!" aparece
   ✓ Botão "Próximo" fica roxo e pulsa

PASSO 5: Testar Navegação
─────────────────────────────────────────────────────────────────────────────
1. Clicar botão "Próximo" (agora ativo)
   ✓ Avança para próxima etapa (Settings)
   ✓ Modal fecha ou mostra novo conteúdo

═══════════════════════════════════════════════════════════════════════════════

🔍 DEBUGGING TIPS

Se algo não funciona:

1. SCORE NÃO MUDA
   → Verificar se useScoreGestures está captando eventos
   → Console.log em handleAddScore / handleSubtractScore
   → Verificar se component é montado (AnimatePresence)

2. CONFETES NÃO APARECEM
   → Verificar se showConfetti state muda
   → Verificar CSS (pointer-events-none)
   → Verificar animate config em Framer Motion

3. BOTÃO NÃO DESBLOQUEIA
   → Verificar se onComplete() é chamado
   → Verificar se handleStepComplete() roda
   → Verificar estado completedSteps no React DevTools

4. HAPTIC NÃO FUNCIONA
   → Mobile: verificar se Capacitor está inicializado
   → Web: verificar se navigator.vibrate existe
   → Consola: procurar por catch de haptics

5. ANIMAÇÕES LENTAS
   → Verificar se GPU acceleration está habilitada
   → Verificar performance panel no DevTools
   → Reduzir complexity de efeitos simultâneos

═══════════════════════════════════════════════════════════════════════════════

📊 MÉTRICAS DE SUCESSO

Após implementação, esperamos:

✅ Tempo para completar tutorial: < 30 segundos (vs. 2+ minutos antes)
✅ Taxa de conclusão: 95%+ usuários completam gesture tutorial
✅ Confiança: 85%+ usuários sentem-se confiantes com gestos
✅ Engajamento: 5x+ interações por sessão (feedback immediato)
✅ Retenção: +15% aumento em users que retornam após primeiro uso

═══════════════════════════════════════════════════════════════════════════════

🚀 PRÓXIMOS PASSOS

□ Coletar feedback de usuários beta
□ Adicionar analytics: tempo, tentativas, drops
□ Criar variações: diferentes níveis de dificuldade
□ Expandir: outros steps interativos (voice, settings, etc)
□ Otimizar: testes A/B de messaging e timing

═══════════════════════════════════════════════════════════════════════════════

📞 SUPORTE

Dúvidas ou problemas?

1. Verificar TUTORIAL_INTERACTIVE_IMPLEMENTATION.md (detalhes técnicos)
2. Verificar TUTORIAL_INTERACTIVE_PT_BR.md (conceitos visuais)
3. Executar testes no checklist acima
4. Coletar logs do console (F12 → Console tab)

═══════════════════════════════════════════════════════════════════════════════
