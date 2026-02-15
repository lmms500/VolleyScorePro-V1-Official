import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export class TTSService {
  private static instance: TTSService;
  private isNative: boolean;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Speak the provided text using the best available engine.
   * @param text The text to speak
   * @param language BCP-47 language tag (e.g., 'en-US', 'pt-BR')
   * @param genderPreference 'male' | 'female' (Best effort)
   * @param rate Speed multiplier (0.5 to 2.0)
   * @param pitch Pitch multiplier (0.5 to 2.0)
   */
  public async speak(
    text: string, 
    language: string, 
    genderPreference: 'male' | 'female' = 'female',
    rate: number = 1.0,
    pitch: number = 1.0
  ): Promise<void> {
    if (this.isNative) {
      await this.speakNative(text, language, rate, pitch); 
    } else {
      this.speakWeb(text, language, genderPreference, rate, pitch);
    }
  }

  private async speakNative(text: string, language: string, rate: number, pitch: number) {
    try {
      // Basic stop to clear queue
      await TextToSpeech.stop();
      
      await TextToSpeech.speak({
        text,
        lang: language,
        rate: rate, // Plugin accepts 0.1 to roughly 2.0+ depending on platform
        pitch: pitch, // Plugin accepts 0.5 to 2.0
        volume: 1.0,
        category: 'ambient', // Android: plays even if ringer is off usually
      });
    } catch (e) {
      console.warn('Native TTS Error, falling back to Web:', e);
      this.speakWeb(text, language, 'female', rate, pitch);
    }
  }

  private speakWeb(text: string, language: string, genderPreference: 'male' | 'female', rate: number, pitch: number) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate; // Web API: 0.1 to 10
    utterance.pitch = pitch; // Web API: 0 to 2

    // Best effort gender matching for Web
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const targetGender = genderPreference;
      const maleKeywords = ['male', 'david', 'daniel', 'rishi', 'fred', 'george'];
      const femaleKeywords = ['female', 'zira', 'samantha', 'google', 'karen', 'moira', 'victoria'];
      const keywords = targetGender === 'male' ? maleKeywords : femaleKeywords;

      const exactMatch = voices.find(v => 
        v.lang.startsWith(language.split('-')[0]) && 
        keywords.some(k => v.name.toLowerCase().includes(k))
      );

      if (exactMatch) {
        utterance.voice = exactMatch;
      } else {
        // Fallback: just language match
        const langMatch = voices.find(v => v.lang.startsWith(language.split('-')[0]));
        if (langMatch) utterance.voice = langMatch;
      }
    }

    // Small delay to prevent cutting off sound effects
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 300);
  }
}

export const ttsService = TTSService.getInstance();