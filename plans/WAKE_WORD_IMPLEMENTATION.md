# Wake Word Detection — "Hey Score"

## Context

O sistema de voz atual requer ativacao manual (botao toggle ou push-to-talk). O objetivo e adicionar um **terceiro modo de ativacao** onde o microfone fica em escuta passiva de baixo consumo, esperando a frase "Hey Score". Ao detectar, ativa o reconhecimento de voz completo por ~6 segundos para receber o comando, e depois volta a escutar a wake word.

**Tecnologia escolhida:** [Picovoice Porcupine](https://picovoice.ai/platform/porcupine/) — SDK de wake word on-device, ~1% bateria em 12h, com plugin Capacitor disponivel. Free tier para uso pessoal (requer conta gratuita em [console.picovoice.ai](https://console.picovoice.ai) para treinar a keyword "Hey Score").

---

## State Machine

```
         start()
idle ──────────► listening_for_wake_word ◄──────────────┐
  ▲                     │                               │
  │     Porcupine       │ detecta "Hey Score"           │
  │     stop()          ▼                               │
  │              wake_word_detected                     │
  │              (haptic + audio beep)                  │
  │                     │ startNativeEngine()            │
  │                     ▼                               │
  │              listening_for_command ──── timeout 6s ──┘
  │                     │                               │
  │      isFinal result │                               │
  │                     ▼                               │
  └──────────── processing ─► stopNativeEngine() ───────┘
       stop()           restart Porcupine
```

Porcupine e SpeechRecognizer **nunca rodam simultaneamente**.

---

## Arquivos Novos

### 1. `src/features/voice/plugins/PorcupinePlugin.ts`
Bridge Capacitor tipado para `@capacitor-community/porcupine-wake-word`. Declara `start(options)`, `stop()`, listeners `wakeWordDetected` e `wakeWordError`. Segue o padrao de `src/features/voice/plugins/VoiceRecognitionCustomPlugin.ts`.

### 2. `src/features/voice/engines/WakeWordEngine.ts`
Classe central. Implementa `SpeechEngine` (mesma interface). Internamente compoe:
- `PorcupinePlugin` para deteccao da wake word
- `NativeEngine` para reconhecimento de comandos

Gerencia a state machine acima. Expoe callback adicional `onWakeWordPhase(cb)` para UI.

### 3. `src/features/voice/hooks/useWakeWordPhase.ts`
Hook auxiliar que mantem o `WakeWordPhase` como React state. Consumido pelo mic button para visual feedback.

---

## Arquivos Modificados

### 4. `src/@types/domain.ts`
Adicionar a `GameConfig`:
```ts
wakeWordMode: boolean;
porcupineAccessKey?: string;
wakeWordSensitivity?: number; // 0.0-1.0
```

### 5. `src/config/constants.ts`
Adicionar a `DEFAULT_CONFIG`:
```ts
wakeWordMode: false,
wakeWordSensitivity: 0.5,
```

### 6. `src/features/voice/engines/SpeechEngine.ts`
Adicionar metodo opcional a interface:
```ts
onWakeWordPhase?(callback: (phase: WakeWordPhase) => void): void;
```

### 7. `src/features/voice/engines/EngineSelector.ts`
Expandir factory para suportar `mode: 'native' | 'wake_word'`. Retornar `WakeWordEngine` quando `wake_word`.

### 8. `src/features/voice/services/VoiceRecognitionService.ts`
- Mudar `engine` de `readonly` para mutavel
- Adicionar `setMode(mode)` que destroi engine atual, cria nova, re-wira listeners
- Adicionar `onWakeWordPhase()` pass-through

### 9. `src/features/voice/hooks/useVoiceControl.ts`
- Nova prop `wakeWordMode: boolean`
- Novo state `wakeWordPhase`
- Effect para chamar `recognitionService.setMode()` quando modo muda
- Retornar `wakeWordPhase` no objeto de saida

### 10. `src/features/game/screens/GameScreen.tsx`
- Passar `wakeWordMode` para `useVoiceControl`
- Incluir `wakeWordPhase` no `voiceState`

### 11. Layouts e controles
- `src/layouts/FullscreenLayout.tsx` — estender `VoiceState` interface
- `src/features/game/components/FloatingControlBar.tsx` — mic button com 3 estados visuais:
  - `listening_for_wake_word`: icone `Radio` (lucide) + ring amber pulsante (`ring-2 ring-amber-400/60 animate-pulse`)
  - `listening_for_command`: icone `Mic` + filled azul (igual ao listening atual)
  - `idle`: icone `MicOff` (igual ao atual)

### 12. `src/features/settings/components/AudioTab.tsx`
Substituir toggle Push-to-Talk por seletor 3-vias:
```
[ Toggle ] [ Push-to-Talk ] [ Wake Word ]
```
Quando Wake Word selecionado, mostrar sub-painel com:
- Campo AccessKey do Picovoice (com link para console)
- Slider de sensibilidade (0.3-0.9)

---

## Setup Android

### 13. Instalar dependencia
```bash
npm install @capacitor-community/porcupine-wake-word
npx cap sync
```

### 14. `android/app/src/main/java/.../MainActivity.java`
Registrar plugin Porcupine ao lado do `VoiceRecognitionPlugin`.

### 15. Modelo wake word
Treinar "Hey Score" em [console.picovoice.ai](https://console.picovoice.ai), baixar `.ppn`, colocar em:
- `android/app/src/main/assets/hey-score_en_android.ppn`
- `public/models/hey-score_en_wasm.ppn` (para Web)

### 16. ProGuard
Adicionar a `android/app/proguard-rules.pro`:
```
-keep class ai.picovoice.** { *; }
```

---

## Ordem de Implementacao

1. Types: `domain.ts` + `constants.ts`
2. Instalar `@capacitor-community/porcupine-wake-word` + `npx cap sync`
3. `PorcupinePlugin.ts` (tipos e registration)
4. `WakeWordEngine.ts` (state machine completa)
5. `SpeechEngine.ts` (metodo opcional)
6. `EngineSelector.ts` + `VoiceRecognitionService.ts`
7. `useVoiceControl.ts` + `useWakeWordPhase.ts`
8. `GameScreen.tsx` + layouts + controles (UI)
9. `AudioTab.tsx` (settings)
10. Assets Android (`.ppn` file) + `MainActivity.java` + ProGuard
11. Teste end-to-end no dispositivo

---

## Verificacao

- [ ] Settings: ativar voz, selecionar Wake Word, inserir AccessKey
- [ ] Em jogo: mic button mostra icone Radio com pulse amber
- [ ] Dizer "Hey Score" → feedback haptico + audio, button muda para Mic azul
- [ ] Dizer comando ("Ponto A") → ponto marcado, volta para amber pulse
- [ ] Timeout 6s sem falar → volta para amber pulse sem acao
- [ ] Modos Toggle e Push-to-Talk continuam funcionando normalmente
- [ ] App em background → Porcupine pausa; foreground → resume
- [ ] Web sem .ppn → fallback gracioso para modo Toggle com warning no console

---

## Referencias

- [Picovoice Porcupine](https://picovoice.ai/platform/porcupine/)
- [Porcupine Android Quick Start](https://picovoice.ai/docs/quick-start/porcupine-android/)
- [Capacitor Porcupine Plugin](https://github.com/JulienLecoq/porcupine-wake-word)
- [Wake Word Detection Guide 2026](https://picovoice.ai/blog/complete-guide-to-wake-word/)
- [Picovoice Pricing](https://picovoice.ai/pricing/)
