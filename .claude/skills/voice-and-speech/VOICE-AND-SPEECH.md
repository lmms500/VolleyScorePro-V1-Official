---
name: voice-and-speech
description: >
  Work on the voice control system including speech recognition, command parsing,
  TTS, and AI fallback. Use when implementing voice commands, fixing recognition
  issues, adding new voice features, working with speech APIs, microphone input,
  Gemini command parser, text-to-speech announcements, confidence thresholds,
  or any voice/speech-related feature.
---

# Voice Control System — VolleyScore-Pro

## Decision Tree

```
Voice need → What type?
    ├─ New voice command → Adding a New Voice Command workflow below
    ├─ Recognition issue → Engine Selection + Confidence Thresholds
    ├─ Command parsing → VoiceCommandParser (regex + fuzzy matching)
    ├─ AI fallback → GeminiCommandService (low confidence → Gemini)
    ├─ Text-to-speech → TTSService configuration below
    ├─ Speech engine → NativeEngine (Capacitor) vs SpeechEngine (Web)
    └─ Testing voice → Unit tests + accent/dialect testing below
```

## Architecture Overview

```
useVoiceControl (main orchestrator hook)
├─ Engine Selection
│  ├─ NativeEngine (Capacitor @capacitor-community/speech-recognition)
│  └─ SpeechEngine (Web Speech API — browser fallback)
├─ Recognition Pipeline
│  ├─ Audio capture → Speech-to-text
│  ├─ CommandBuffer (queues raw transcripts)
│  └─ CommandDeduplicator (prevents repeat execution)
├─ Command Parsing
│  ├─ VoiceCommandParser (local NLP — regex + fuzzy matching)
│  └─ GeminiCommandService (AI fallback via @google/genai)
├─ Validation
│  └─ Zod schemas (schemas.ts)
└─ Feedback
   ├─ TTSService (text-to-speech output)
   ├─ VoiceToast (visual feedback component)
   └─ AudioService (sound effects)
```

## Speech Recognition Engines

### NativeEngine (Mobile)
- Uses `@capacitor-community/speech-recognition` Capacitor plugin
- Custom Android plugin: `VoiceRecognitionCustomPlugin.ts`
- Supports continuous listening
- Better accuracy on mobile devices

### SpeechEngine (Web)
- Uses browser `SpeechRecognition` API (Chrome, Edge, Safari)
- Fallback for non-native environments
- `webkitSpeechRecognition` support

### Engine Selection (EngineSelector.ts)
```typescript
// Auto-selects based on platform:
// Capacitor native app → NativeEngine
// Browser → SpeechEngine
```

## Command Parser (VoiceCommandParser.ts)

### Supported Command Categories
| Category | Examples |
|----------|---------|
| Scoring | "ponto time A", "point team B", "ace" |
| Subtract | "tirar ponto", "subtract", "undo point" |
| Timeout | "tempo time A", "timeout team B" |
| Undo | "desfazer", "undo", "cancelar" |
| Serve | "saque time A", "serve team B" |
| Rotate | "rotação", "rotate" |
| Swap | "trocar lados", "swap sides" |
| Substitute | "substituir jogador 5 por 3" |

### Parsing Pipeline
1. **Normalize** — lowercase, remove accents, trim
2. **Pattern matching** — regex patterns per command type
3. **Team extraction** — identify "team A/B" or team name
4. **Player extraction** — identify player numbers/names
5. **Confidence scoring** — 0.0 to 1.0
6. **Ambiguity check** — flag uncertain matches

### Confidence Thresholds
```typescript
HIGH_CONFIDENCE = 0.8    // Execute immediately
MEDIUM_CONFIDENCE = 0.5  // Execute with visual confirmation
LOW_CONFIDENCE = 0.3     // Fall back to AI (Gemini)
REJECT = < 0.3           // Ignore
```

## AI Fallback (GeminiCommandService.ts)

When local parser confidence < 0.5, the transcript is sent to Google Gemini:
```typescript
// Uses @google/genai SDK
// API key: VITE_GEMINI_API_KEY
// Sends game context + transcript → structured command
```

Gemini returns structured JSON validated against Zod schemas.

## Text-to-Speech (TTSService.ts)

### Configuration
```typescript
interface TTSConfig {
  voice: 'male' | 'female';
  rate: number;     // 0.5 - 2.0
  pitch: number;    // 0.5 - 2.0
  frequency: 'all' | 'critical'; // Announce all points or only critical
}
```

### Announcement Types
- Score updates: "15 a 12, time A"
- Set wins: "Time A vence o set!"
- Match points: "Match point para time B!"
- Timeouts: "Tempo pedido pelo time A"
- Errors: "Comando não reconhecido"

## Adding a New Voice Command

1. **Define command in VoiceCommandParser.ts**:
   ```typescript
   // Add regex patterns for all supported languages
   const NEW_COMMAND_PATTERNS = {
     pt: [/nova\s*ação/i, /novo\s*comando/i],
     en: [/new\s*action/i, /new\s*command/i],
     es: [/nueva\s*acción/i, /nuevo\s*comando/i],
   };
   ```

2. **Add command type to schemas.ts** (Zod validation)

3. **Handle in useVoiceControl.ts** — map parsed command to game action

4. **Add TTS announcement** in TTSService or useScoreAnnouncer

5. **Update VoiceCommandsModal.tsx** — add to command reference UI

6. **Add i18n keys** for all command descriptions

## Key Files
- `src/features/voice/hooks/useVoiceControl.ts` — Main hook
- `src/features/voice/services/VoiceRecognitionService.ts` — Recognition wrapper
- `src/features/voice/services/VoiceCommandParser.ts` — NLP parser
- `src/features/voice/services/GeminiCommandService.ts` — AI fallback
- `src/features/voice/services/TTSService.ts` — Text-to-speech
- `src/features/voice/services/CommandBuffer.ts` — Command queue
- `src/features/voice/services/CommandDeduplicator.ts` — Dedup
- `src/features/voice/services/schemas.ts` — Zod schemas
- `src/features/voice/engines/EngineSelector.ts` — Engine picker
- `src/features/voice/engines/NativeEngine.ts` — Capacitor engine
- `src/features/voice/engines/SpeechEngine.ts` — Web API engine
- `src/features/voice/modals/VoiceCommandsModal.tsx` — Help modal
- `src/ui/VoiceToast.tsx` — Visual feedback

## Testing Voice Commands
- Unit tests: `src/features/voice/services/__tests__/`
- Test parser with various accent/dialect inputs
- Test confidence thresholds
- Test deduplication timing
- Test engine fallback behavior
