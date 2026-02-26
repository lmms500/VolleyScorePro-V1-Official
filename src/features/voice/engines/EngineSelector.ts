
import { SpeechEngine } from './SpeechEngine';
import { NativeEngine } from './NativeEngine';

export type EngineMode = 'native';

export function createSpeechEngine(_mode?: EngineMode): SpeechEngine {
    // Always use NativeEngine — it auto-detects platform internally
    // (Android → SpeechRecognizer, Web → Web Speech API)
    return new NativeEngine();
}
