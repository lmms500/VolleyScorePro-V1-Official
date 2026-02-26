import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { VoiceRecognitionCustom } from '../plugins/VoiceRecognitionCustomPlugin';
import type { RecognitionErrorEvent } from '../plugins/VoiceRecognitionCustomPlugin';
import { SpeechEngine } from './SpeechEngine';

export class NativeEngine implements SpeechEngine {
    private readonly isNative: boolean;
    private resultCallback?: (text: string, isFinal: boolean) => void;
    private visualFeedbackCallback?: (text: string) => void;
    private errorCallback?: (error: 'permission' | 'network' | 'generic') => void;
    private statusCallback?: (isListening: boolean) => void;

    private isListening: boolean = false;
    private listeners: PluginListenerHandle[] = [];
    private webRecognition: any = null;

    constructor() {
        this.isNative = Capacitor.isNativePlatform();
    }

    async start(language: string): Promise<void> {
        const langMap: Record<string, string> = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
        const locale = langMap[language] || 'en-US';

        if (this.isNative) {
            await this.startNative(locale);
        } else {
            await this.startWeb(locale);
        }
    }

    private async startNative(locale: string) {
        try {
            // Clean up previous listeners
            await this.removeNativeListeners();

            // Register event listeners BEFORE starting
            const partialListener = await VoiceRecognitionCustom.addListener('partialResults', (data) => {
                if (data.matches?.length > 0) {
                    const text = data.matches[0];
                    this.visualFeedbackCallback?.(text);
                    this.resultCallback?.(text, false);
                }
            });
            this.listeners.push(partialListener);

            const finalListener = await VoiceRecognitionCustom.addListener('finalResults', (data) => {
                if (data.matches?.length > 0) {
                    this.resultCallback?.(data.matches[0], true);
                }
            });
            this.listeners.push(finalListener);

            const stateListener = await VoiceRecognitionCustom.addListener('listeningState', (data) => {
                this.updateStatus(data.status === 'started');
            });
            this.listeners.push(stateListener);

            const errorListener = await VoiceRecognitionCustom.addListener('recognitionError', (data) => {
                this.handleNativeError(data);
            });
            this.listeners.push(errorListener);

            // Start recognition — resolves immediately, events arrive async
            // continuous: true keeps the mic active, auto-restarting after results
            // and recoverable errors until stop() is explicitly called
            await VoiceRecognitionCustom.start({
                language: locale,
                partialResults: true,
                continuous: true,
            });

            // Optimistic status update (will be corrected by listeningState event)
            this.updateStatus(true);

        } catch (e: any) {
            console.error('[NativeEngine] startNative failed:', e?.message || e);
            this.updateStatus(false);
            const msg = (e?.message || JSON.stringify(e)).toLowerCase();

            if (msg.includes('permission')) {
                this.errorCallback?.('permission');
            } else if (msg.includes('network') || msg.includes('internet')) {
                this.errorCallback?.('network');
            } else {
                this.errorCallback?.('generic');
            }
        }
    }

    private handleNativeError(data: RecognitionErrorEvent) {
        console.warn(`[NativeEngine] Recognition error: code=${data.errorCode} msg=${data.message} recoverable=${data.isRecoverable}`);

        if (data.isRecoverable) {
            // Plugin is handling retry internally — just log, don't propagate to UI
            return;
        }

        // Non-recoverable error — propagate to UI
        switch (data.message) {
            case 'PERMISSION_DENIED':
                this.errorCallback?.('permission');
                break;
            case 'NETWORK_ERROR':
                this.errorCallback?.('network');
                break;
            default:
                this.errorCallback?.('generic');
                break;
        }
    }

    private async removeNativeListeners() {
        try {
            await VoiceRecognitionCustom.removeAllListeners();
        } catch (e) {
            console.warn('[NativeEngine] removeAllListeners error:', e);
        }
        this.listeners = [];
    }

    private async startWeb(locale: string) {
        try {
            const SpeechRecognitionAPI = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
            if (!SpeechRecognitionAPI) {
                this.errorCallback?.('generic');
                return;
            }
            if (this.webRecognition) {
                try { this.webRecognition.abort(); } catch (e) { }
                this.webRecognition = null;
            }
            const recognition = new SpeechRecognitionAPI();
            recognition.lang = locale;
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => this.updateStatus(true);
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) finalTranscript += transcript;
                    else interimTranscript += transcript;
                }
                if (finalTranscript) this.resultCallback?.(finalTranscript.trim(), true);
                else if (interimTranscript) {
                    this.visualFeedbackCallback?.(interimTranscript.trim());
                    this.resultCallback?.(interimTranscript.trim(), false);
                }
            };
            recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') this.errorCallback?.('permission');
                else if (event.error === 'network') this.errorCallback?.('network');
                else if (event.error === 'no-speech' || event.error === 'aborted') this.updateStatus(false);
                else this.errorCallback?.('generic');
            };
            recognition.onend = () => { this.updateStatus(false); this.webRecognition = null; };
            this.webRecognition = recognition;
            recognition.start();
        } catch (e: any) {
            this.errorCallback?.('generic');
        }
    }

    async stop(): Promise<void> {
        if (this.isNative) {
            await VoiceRecognitionCustom.stop().catch((e: any) => console.warn('[NativeEngine] stop error:', e));
            await this.removeNativeListeners();
        } else if (this.webRecognition) {
            try { this.webRecognition.stop(); } catch (e) { }
            this.webRecognition = null;
        }
        this.updateStatus(false);
    }

    async destroy(): Promise<void> { await this.stop(); }
    onResult(callback: (text: string, isFinal: boolean) => void): void { this.resultCallback = callback; }
    onVisualFeedback(callback: (text: string) => void): void { this.visualFeedbackCallback = callback; }
    onError(callback: (error: 'permission' | 'network' | 'generic') => void): void { this.errorCallback = callback; }
    onStatusChange(callback: (isListening: boolean) => void): void { this.statusCallback = callback; }

    private updateStatus(listening: boolean) {
        if (this.isListening !== listening) {
            this.isListening = listening;
            this.statusCallback?.(listening);
        }
    }
}
