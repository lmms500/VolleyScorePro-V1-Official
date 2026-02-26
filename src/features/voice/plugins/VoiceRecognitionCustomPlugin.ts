import { registerPlugin } from '@capacitor/core';
import type { Plugin, PluginListenerHandle } from '@capacitor/core';

export interface StartOptions {
  language: string;
  partialResults?: boolean;
  continuous?: boolean;
}

export interface PartialResultsEvent {
  matches: string[];
}

export interface FinalResultsEvent {
  matches: string[];
}

export interface ListeningStateEvent {
  status: 'started' | 'stopped';
}

export interface RecognitionErrorEvent {
  errorCode: number;
  message: string;
  isRecoverable: boolean;
}

export interface VoiceRecognitionCustomPlugin extends Plugin {
  start(options: StartOptions): Promise<void>;
  stop(): Promise<void>;
  isAvailable(): Promise<{ available: boolean }>;

  addListener(eventName: 'partialResults', handler: (event: PartialResultsEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'finalResults', handler: (event: FinalResultsEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'listeningState', handler: (event: ListeningStateEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'recognitionError', handler: (event: RecognitionErrorEvent) => void): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const VoiceRecognitionCustom = registerPlugin<VoiceRecognitionCustomPlugin>('VoiceRecognitionCustom');
