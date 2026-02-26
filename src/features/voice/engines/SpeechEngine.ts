
export interface SpeechEngine {
    start(language: string): Promise<void>;
    stop(): Promise<void>;
    destroy(): Promise<void>;
    onResult(callback: (text: string, isFinal: boolean) => void): void;
    onVisualFeedback(callback: (text: string) => void): void;
    onError(callback: (error: 'permission' | 'network' | 'generic') => void): void;
    onStatusChange(callback: (isListening: boolean) => void): void;
}
