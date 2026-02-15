
import { Player, TeamId, SkillType, VoiceCommandIntent } from '@types';

// Schema defined inline to ensure strict typing with the SDK and remove external dependencies
// Using JSON Schema literals to avoid bundling @google/genai Type enum (~40KB saved)
const VOICE_COMMAND_SCHEMA = {
  type: 'object' as const,
  properties: {
    type: {
      type: 'string' as const,
      description: "Tipo do comando: 'point', 'timeout', 'server', 'undo', 'unknown'"
    },
    team: {
      type: 'string' as const,
      description: "ID do time: 'A' ou 'B'."
    },
    playerId: {
      type: 'string' as const,
      description: "UUID do jogador. 'unknown' se não encontrado."
    },
    skill: {
      type: 'string' as const,
      description: "Habilidade: 'attack', 'block', 'ace', 'opponent_error', 'generic'"
    },
    isNegative: {
      type: 'boolean' as const,
      description: "True se for correção/remover ponto."
    }
  },
  required: ["type", "isNegative"]
};

export class GeminiCommandService {
  private static instance: GeminiCommandService;

  // Configuration - Use import.meta.env for Vite compatibility
  private apiKey: string = import.meta.env.VITE_API_KEY || '';
  private proxyUrl: string = import.meta.env.VITE_AI_PROXY_URL || '';

  private constructor() { }

  public static getInstance(): GeminiCommandService {
    if (!GeminiCommandService.instance) {
      GeminiCommandService.instance = new GeminiCommandService();
    }
    return GeminiCommandService.instance;
  }

  /**
   * Main entry point. Decides between Local API or Cloud Gateway.
   */
  public async parseCommand(
    transcript: string,
    context: {
      teamAName: string;
      teamBName: string;
      playersA: Player[];
      playersB: Player[];
    }
  ): Promise<VoiceCommandIntent | null> {
    try {
      // SECURITY GATEWAY PATTERN
      // 1. Production Path: Use Proxy if available
      if (this.proxyUrl) {
        return await this.remoteParse(transcript, context);
      }

      // 2. Development Path: Use Local SDK if Key is available
      if (this.apiKey) {
        return await this.localParse(transcript, context);
      }

      console.warn("[Gemini] AI Service not configured (Missing Proxy URL or API Key)");
      return null;

    } catch (e) {
      console.error("[Gemini] Service Error:", e);
      return null;
    }
  }

  private validateParsedCommand(data: any): VoiceCommandIntent | null {
    if (!data || typeof data !== 'object') return null;
    // Ensure required fields
    if (!data.type) return null;

    const safeData = { ...data };
    if (typeof safeData.isNegative !== 'boolean') safeData.isNegative = false;
    if (safeData.type === 'unknown') return { type: 'unknown', confidence: 0, rawText: '' };

    // Map simplified AI structure to strictly typed intent
    return {
      type: safeData.type as any,
      team: safeData.team as TeamId,
      player: safeData.playerId ? { id: safeData.playerId, name: 'AI Identified' } : undefined,
      skill: safeData.skill as SkillType,
      isNegative: safeData.isNegative,
      confidence: 0.9, // AI confidence is generally high if it returns struct
      rawText: '' // Filled by caller if needed
    };
  }

  /**
   * Safe backend call. 
   * The backend should handle authentication and rate limiting.
   */
  private async remoteParse(transcript: string, context: any): Promise<VoiceCommandIntent | null> {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: Add App-Check token here if using Firebase App Check
        },
        body: JSON.stringify({
          action: 'parse_command',
          payload: { transcript, context }
        })
      });

      if (!response.ok) throw new Error(`Proxy error: ${response.status}`);

      const result = await response.json();
      return this.validateParsedCommand(result);
    } catch (error) {
      console.warn("[Gemini] Remote parse failed, attempting fallback if local key exists.");
      if (this.apiKey) return this.localParse(transcript, context);
      return null;
    }
  }

  /**
   * Client-side implementation.
   * NOTE: API Key is exposed here. Use only for development or protected builds.
   */
  private async localParse(transcript: string, context: any): Promise<VoiceCommandIntent | null> {
    // Lazy load GoogleGenAI only when voice commands are used (~40KB saved from initial bundle)
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    try {
      // Updated to gemini-3-flash-preview for optimal latency/cost on basic text tasks
      const model = "gemini-3-flash-preview";
      const prompt = this.buildPrompt(transcript, context);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: VOICE_COMMAND_SCHEMA,
          thinkingConfig: { thinkingBudget: 0 } // Zero latency priority for voice commands
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        return this.validateParsedCommand(result);
      }
      return null;
    } catch (e) {
      // Do not log full error object in prod to avoid leaking headers
      console.error("[Gemini] Local Parse Error");
      throw e;
    }
  }

  private buildPrompt(transcript: string, context: any): string {
    const rosterA = context.playersA.map((p: any) => `${p.name} (#${p.number})`).join(", ");
    const rosterB = context.playersB.map((p: any) => `${p.name} (#${p.number})`).join(", ");

    return `
        Interpret volleyball voice commands.
        Context:
        Team A: "${context.teamAName}" [${rosterA}]
        Team B: "${context.teamBName}" [${rosterB}]
        
        Input: "${transcript}"
        
        Rules:
        - Identify Team A/B based on name similarity.
        - Identify Player based on name/number similarity.
        - Skill keywords: Ace, Block, Attack, Out/Error.
        - "Remove point" -> isNegative: true.
      `;
  }
}
