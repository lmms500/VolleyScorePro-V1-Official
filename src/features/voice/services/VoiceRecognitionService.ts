
import { Capacitor } from '@capacitor/core';
import { SpeechEngine } from '../engines/SpeechEngine';
import { createSpeechEngine } from '../engines/EngineSelector';
import { VoiceRecognitionCustom } from '../plugins/VoiceRecognitionCustomPlugin';

type ResultCallback = (text: string, isFinal: boolean) => void;
type VisualFeedbackCallback = (text: string) => void;
type ErrorCallback = (type: 'permission' | 'network' | 'generic') => void;
type StatusCallback = (isListening: boolean) => void;

export class VoiceRecognitionService {
  private static instance: VoiceRecognitionService;
  private readonly engine: SpeechEngine;

  private onResult?: ResultCallback;
  private onVisualFeedback?: VisualFeedbackCallback;
  private onError?: ErrorCallback;
  private onStatusChange?: StatusCallback;

  private intendedState: boolean = false;
  private lastLocale: string = 'pt-BR';

  private constructor() {
    this.engine = createSpeechEngine();
    this.setupEngineListeners();
  }

  public static getInstance(): VoiceRecognitionService {
    if (!VoiceRecognitionService.instance) {
      VoiceRecognitionService.instance = new VoiceRecognitionService();
    }
    return VoiceRecognitionService.instance;
  }

  private setupEngineListeners() {
    this.engine.onResult((text, isFinal) => this.handleResult(text, isFinal));
    this.engine.onVisualFeedback((text) => this.onVisualFeedback?.(text));
    this.engine.onError((err) => this.onError?.(err));
    this.engine.onStatusChange((status) => this.updateStatus(status));
  }

  public setCallbacks(
    onResult: ResultCallback,
    onVisualFeedback: VisualFeedbackCallback,
    onError: ErrorCallback,
    onStatusChange: StatusCallback,
  ) {
    this.onResult = onResult;
    this.onVisualFeedback = onVisualFeedback;
    this.onError = onError;
    this.onStatusChange = onStatusChange;
  }

  public async start(language: string) {
    this.intendedState = true;
    const langMap: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
    };
    this.lastLocale = langMap[language] || 'en-US';
    await this.engine.start(language);
  }

  public async stop() {
    this.intendedState = false;
    await this.engine.stop();
  }

  private handleResult(text: string, isFinal: boolean) {
    if (this.onResult) {
      this.onResult(text, isFinal);
    }
  }

  private updateStatus(listening: boolean) {
    if (this.onStatusChange) {
      this.onStatusChange(listening);
    }
  }

  public async isAvailable(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await VoiceRecognitionCustom.isAvailable();
        return result.available;
      } catch {
        return true;
      }
    }
    return !!(
      (globalThis as any).SpeechRecognition ||
      (globalThis as any).webkitSpeechRecognition
    );
  }
}
