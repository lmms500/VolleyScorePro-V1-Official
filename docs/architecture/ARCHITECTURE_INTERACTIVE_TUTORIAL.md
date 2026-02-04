📦 ARQUITETURA DE COMPONENTES - TUTORIAL INTERATIVO

═══════════════════════════════════════════════════════════════════════════════

🏗️ ÁRVORE DE COMPONENTES

```
<RichTutorialModal>
  │
  ├─ Props:
  │  ├─ isOpen: boolean
  │  ├─ tutorialKey: 'main' | 'manager' | ...
  │  ├─ onClose: (key) => void
  │  ├─ canInstall?: boolean
  │  ├─ isStandalone?: boolean
  │  └─ isIOS?: boolean
  │
  ├─ State:
  │  ├─ currentStepIndex: number
  │  ├─ direction: -1 | 0 | 1
  │  ├─ isPaused: boolean
  │  ├─ isReady: boolean
  │  └─ completedSteps: Set<string> ← ✨ NOVO
  │
  ├─ Logic:
  │  ├─ steps: TutorialStep[]
  │  ├─ currentStep: TutorialStep
  │  ├─ isStepInteractive: boolean ← ✨ NOVO
  │  ├─ isStepCompleted: boolean ← ✨ NOVO
  │  ├─ isNextButtonDisabled: boolean ← ✨ NOVO
  │  │
  │  └─ Handlers:
  │     ├─ handleNext()
  │     ├─ handleBack()
  │     ├─ handleSkip()
  │     ├─ handleStepComplete() ← ✨ NOVO
  │     └─ togglePause()
  │
  ├─ Visual Area (Left/Top):
  │  │
  │  └─ <AnimatePresence>
  │      │
  │      └─ <motion.div> key={`vis-${currentStep.id}`}
  │         │
  │         └─ <TutorialVisual
  │            │
  │            ├─ visualId: 'gestures'
  │            ├─ colorTheme: { crown, halo }
  │            ├─ isPaused: boolean
  │            └─ onComplete={handleStepComplete} ← ✨ NOVO
  │
  ├─ Text Area (Right/Bottom):
  │  │
  │  └─ Title, Description, Progress Dots, etc
  │
  └─ Navigation Area (Footer):
     │
     ├─ [VOLTAR] ou [SKIP] button
     │
     └─ [PRÓXIMO] button
        │
        ├─ disabled={isNextButtonDisabled}
        │
        ├─ className={
        │     isNextButtonDisabled ? 'opacity-50 cursor-not-allowed' 
        │     : `${haloClass} ${isStepCompleted ? 'animate-pulse' : ''}`
        │  }
        │
        └─ onClick={handleNext}


<TutorialVisual>
  │
  ├─ Props:
  │  ├─ visualId: string (e.g., 'gestures', 'settings_config')
  │  ├─ colorTheme: { crown, halo }
  │  ├─ isPaused: boolean
  │  └─ onComplete?: () => void ← ✨ NOVO
  │
  └─ Visual Map:
     │
     ├─ 'app_logo' → <AppLogoVisual />
     ├─ 'gestures' → <InteractiveGestureDemo /> ← ✨ NOVO
     ├─ 'settings_config' → <SettingsConfigVisual />
     ├─ 'voice_control' → <AudioNarratorVisual />
     ├─ ... (outras 10+ visualizações estáticas)
     │
     └─ default → <AppLogoVisual />


<InteractiveGestureDemo> ← ✨ NOVO COMPONENTE
  │
  ├─ Props:
  │  ├─ colorTheme: { crown, halo }
  │  └─ onComplete: () => void
  │
  ├─ State:
  │  ├─ score: number
  │  ├─ tasksCompleted: Set<string>
  │  ├─ currentPhase: 'tap' | 'swipe'
  │  ├─ showConfetti: boolean
  │  └─ completionMessage: string
  │
  ├─ Hooks:
  │  ├─ useHaptics(true) → { impact, notification }
  │  │
  │  └─ useScoreGestures({
  │     ├─ onAdd: handleAddScore
  │     ├─ onSubtract: handleSubtractScore
  │     └─ return { onPointerDown, onPointerUp, onPointerCancel }
  │  )
  │
  ├─ Handlers:
  │  ├─ handleAddScore() → TAP detected
  │  │  ├─ score++
  │  │  ├─ haptics.impact('light')
  │  │  ├─ confetti.show()
  │  │  ├─ tasksCompleted.add('tap')
  │  │  ├─ phase → 'swipe'
  │  │  └─ message → "Agora deslize..."
  │  │
  │  └─ handleSubtractScore() → SWIPE detected
  │     ├─ score--
  │     ├─ haptics.notification('success')
  │     ├─ confetti.show()
  │     ├─ tasksCompleted.add('swipe')
  │     ├─ setTimeout(() => onComplete(), 1000)
  │     └─ showBadge()
  │
  └─ Render:
     │
     ├─ <motion.div> Mini-Scoreboard [interativo]
     │  ├─ Gradiente branco/roxo
     │  ├─ Border 2px violeta
     │  ├─ Shadow xl
     │  │
     │  ├─ <motion.div> Score Display
     │  │  └─ Text: "00", "01", etc (scale animation)
     │  │
     │  ├─ <motion.div> Instructions
     │  │  └─ Text: "Tap..." ou "Swipe..."
     │  │
     │  ├─ Progress Buttons [✓ Tap] [  Swipe]
     │  │  ├─ Animação scale quando completo
     │  │  └─ Cor muda (slate → violeta)
     │  │
     │  └─ <AnimatePresence> Confetti Particles
     │     └─ 8x <motion.div> partículas
     │        ├─ w-2 h-2 roxo
     │        ├─ animate: {x, y, opacity, scale}
     │        └─ duration: 600ms
     │
     ├─ <motion.div> Phase Feedback
     │  └─ Text message transição suave
     │
     ├─ Gesture Indicators (TAP | SWIPE)
     │  ├─ [TAP] - piscando quando em fase 1
     │  └─ [SWIPE] - piscando quando em fase 2
     │
     └─ <AnimatePresence> Badge "Ready to Play!"
        └─ Spring bounce animation

```

═══════════════════════════════════════════════════════════════════════════════

🔄 FLUXO DE DADOS

```
INICIALIZAÇÃO
═════════════════════════════════════════════════════════════════════════════

RichTutorialModal.open = true
    ↓
useEffect([isOpen]) 
    ↓
setCurrentStepIndex(0) ← primeira etapa
setCompletedSteps(new Set()) ← limpa histórico
    ↓
currentStep = TUTORIAL_SCENARIOS[tutorialKey][0]
    ↓
currentStep.id = 'welcome' (first step)
isStepInteractive = false
isNextButtonDisabled = false (etapa não-interativa)


NAVEGAÇÃO PARA GESTURES
═════════════════════════════════════════════════════════════════════════════

handleNext() → setCurrentStepIndex(1)
    ↓
useEffect([currentStepIndex]) → resets isReady
    ↓
currentStep = TUTORIAL_SCENARIOS[tutorialKey][1]
    ↓
currentStep.id = 'gestures'
currentStep.isInteractive = true ← ✨ CHAVE
isStepCompleted = completedSteps.has('gestures') = false
isNextButtonDisabled = true ∧ false = TRUE ← ✨ BUTTON LOCKED


RENDERIZAÇÃO INICIAL
═════════════════════════════════════════════════════════════════════════════

<TutorialVisual 
  visualId="gestures"
  onComplete={handleStepComplete}
>
    ↓
visualMap['gestures'] = <InteractiveGestureDemo
  colorTheme={...}
  onComplete={handleStepComplete}
/>
    ↓
InteractiveGestureDemo renderiza:
  score: 0
  phase: 'tap'
  message: "Toque para adicionar um ponto"
  tasksCompleted: Set[]


INTERAÇÃO 1: TAP
═════════════════════════════════════════════════════════════════════════════

User taps on scoreboard
    ↓
onPointerDown/onPointerUp (from useScoreGestures)
    ↓
Gesture detection:
  - duration < 350ms? YES
  - movement < 8px? YES
    ↓
Gesture type = TAP
    ↓
handleAddScore() executes:
  
  1. setScore(1)
  2. haptics.impact('light') [async, non-blocking]
  3. setShowConfetti(true)
  4. setTimeout(() => setShowConfetti(false), 600)
  5. tasksCompleted.add('tap')
  6. setTasksCompleted(new Set(tasksCompleted))
  7. setCurrentPhase('swipe')
  8. setCompletionMessage('Agora deslize...')
    ↓
Re-render InteractiveGestureDemo:
  ✓ Score: 0 → 1 (animado)
  ✓ Confetti: aparece/desaparece (600ms)
  ✓ Phase label: TAP → SWIPE
  ✓ Progress: [✓] [ ]
  ✓ Message: atualizado


INTERAÇÃO 2: SWIPE DOWN
═════════════════════════════════════════════════════════════════════════════

User swipes down on scoreboard
    ↓
Gesture detection:
  - distance Y > 38px? YES
  - distance Y > X? YES (vertical dominante)
    ↓
Gesture type = SWIPE
    ↓
handleSubtractScore() executes:
  
  1. setScore(0)
  2. haptics.notification('success') [async, non-blocking]
  3. tasksCompleted.add('swipe')
  4. setTasksCompleted(new Set(tasksCompleted))
  5. setShowConfetti(true)
  6. setCompletionMessage('Perfeito! Você está pronto...')
  7. setTimeout(() => {
       onComplete() ← CALLBACK DISPARADO
     }, 1000)
    ↓
onComplete() = handleStepComplete() (from parent RichTutorialModal)
    ↓
handleStepComplete() executes:
  
  updated = new Set(completedSteps)
  updated.add('gestures')
  setCompletedSteps(updated)
    ↓
Re-render RichTutorialModal:
  
  isStepCompleted = completedSteps.has('gestures') = TRUE
  isNextButtonDisabled = true ∧ FALSE = FALSE ← ✨ BUTTON UNLOCKED
    ↓
Re-render Button:
  disabled = false
  className = `${colorTheme.halo} animate-pulse`
  opacity = 100%
  backgroundColor = violet (not slate)


NAVEGAÇÃO PÓS-CONCLUSÃO
═════════════════════════════════════════════════════════════════════════════

handleNext() executes:
    ↓
currentStepIndex (1) < steps.length (6)? YES
    ↓
setCurrentStepIndex(2)
setDirection(1)
    ↓
useEffect([currentStepIndex]) resets isReady
    ↓
Modal animates out (direction = 1)
    ↓
Modal animates in with new step:
  currentStep = TUTORIAL_SCENARIOS[tutorialKey][2]
  currentStep.id = 'config'
  isStepInteractive = false
  isNextButtonDisabled = false ← button ativo novamente
    ↓
<TutorialVisual visualId="settings_config">
    ↓
visualMap['settings_config'] = <SettingsConfigVisual />
    ↓
Modal renderiza nova etapa (continuação do tutorial)

```

═══════════════════════════════════════════════════════════════════════════════

📊 STATE MANAGEMENT

COMPLETEDSTEPS (Novo)
─────────────────────────────────────────────────────────────────────────────

Estrutura: Set<string>

Valores possíveis:
  • Set() → nenhuma etapa interativa completada
  • Set(['gestures']) → após completar etapa gestures
  • Set(['gestures', 'future_interactive_step']) → futura extensão

Modificadores:
  • setCompletedSteps(new Set(old.add(stepId)))
  • Reset em useEffect([isOpen]) → new Set()

Uso:
  • isStepCompleted = completedSteps.has(currentStep.id)
  • isNextButtonDisabled = isStepInteractive && !isStepCompleted
  • Botão ativa/desativa baseado nisto

═══════════════════════════════════════════════════════════════════════════════

🎯 DECISION TREE: QUANDO HABILITAR BOTÃO?

┌──────────────────────────────────────────┐
│ currentStep.isInteractive === true?       │
└────────┬─────────────────────────────────┘
         │
    YES  │  NO
         │  └─→ Button ALWAYS ENABLED
         │
    ┌────▼──────────────────────────┐
    │ completedSteps.has(step.id)?  │
    └────┬──────────────────────────┘
         │
    YES  │  NO
         │  └─→ Button DISABLED (gray, 50% opacity)
         │
    ┌────▼──────────────────────────┐
    │ Button ENABLED                │
    │ • Full color (violet)         │
    │ • 100% opacity               │
    │ • animate-pulse animation     │
    │ • onClick→handleNext()        │
    └───────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

💾 PERSISTÊNCIA

Atualmente: Nenhuma persistência do tutorial completado

Nota: completedSteps é resetado a cada abertura de modal 
      (design intencional - tutorial pode ser retomado)

Futuro: Poderia persistir em localStorage ou Firebase para:
        • Rastrear progresso do usuário
        • Skip tutorial se já completo
        • Analytics de tempo/tentativas

═══════════════════════════════════════════════════════════════════════════════

🔗 DEPENDENCIES

InteractiveGestureDemo depende de:
  ├─ useHaptics hook
  └─ useScoreGestures hook

RichTutorialModal depende de:
  ├─ TutorialVisual component
  ├─ TUTORIAL_SCENARIOS data
  ├─ useTranslation hook
  └─ resolveTheme utility

Nenhuma dependência circular.
Nenhuma depêndência externa além de React + Framer Motion.

═══════════════════════════════════════════════════════════════════════════════

✅ VALIDAÇÃO DE TIPOS

TutorialStep interface (tutorialContent.ts):
  interface TutorialStep {
    id: string;
    titleKey: string;
    descKey: string;
    icon: any;
    color: string;
    visualId?: string;
    CustomComponent?: React.ReactNode;
    isInteractive?: boolean; ← ✨ NEW
  }

InteractiveGestureDemo props (InteractiveGestureDemo.tsx):
  interface Props {
    colorTheme: {
      crown: string;
      halo: string;
    };
    onComplete: () => void;
  }

TutorialVisual props (TutorialVisuals.tsx):
  interface Props {
    visualId: string;
    colorTheme: any; // Como acima
    isPaused: boolean;
    onComplete?: () => void; ← ✨ NEW (optional)
  }

═══════════════════════════════════════════════════════════════════════════════
