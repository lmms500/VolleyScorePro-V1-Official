
import { Player, TeamId, SkillType, VoiceCommandIntent } from '@types';

// Schema defined inline to ensure strict typing with the SDK and remove external dependencies
// Using JSON Schema literals to avoid bundling @google/genai Type enum (~40KB saved)
const VOICE_COMMAND_SCHEMA = {
  type: 'object' as const,
  properties: {
    type: {
      type: 'string' as const,
      enum: ['point', 'timeout', 'server', 'swap', 'undo', 'unknown'],
      description: "Command type.",
    },
    team: {
      type: 'string' as const,
      enum: ['A', 'B'],
      description: "Team ID.",
    },
    playerId: {
      type: 'string' as const,
      description: "Player UUID from the roster. 'unknown' if not identified.",
    },
    playerName: {
      type: 'string' as const,
      description: "Player name as matched from the roster.",
    },
    skill: {
      type: 'string' as const,
      enum: ['attack', 'block', 'ace', 'opponent_error', 'generic'],
      description: "Skill type.",
    },
    isNegative: {
      type: 'boolean' as const,
      description: "True if it's a correction / remove point.",
    },
  },
  required: ['type', 'isNegative'],
};

const VALID_TYPES = new Set(['point', 'timeout', 'server', 'swap', 'undo', 'unknown']);
const VALID_SKILLS = new Set<string>(['attack', 'block', 'ace', 'opponent_error', 'generic']);

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

  private validateParsedCommand(data: any, transcript: string): VoiceCommandIntent | null {
    if (!data || typeof data !== 'object') return null;
    if (!data.type || !VALID_TYPES.has(data.type)) return null;

    const isNegative = typeof data.isNegative === 'boolean' ? data.isNegative : false;

    if (data.type === 'unknown') {
      return { type: 'unknown', confidence: 0, rawText: transcript };
    }

    const team: TeamId | undefined = (data.team === 'A' || data.team === 'B') ? data.team : undefined;
    const skill: SkillType | undefined = VALID_SKILLS.has(data.skill) ? data.skill : undefined;
    const playerName: string | undefined = data.playerName || undefined;
    const playerId: string | undefined = data.playerId && data.playerId !== 'unknown' ? data.playerId : undefined;

    return {
      type: data.type,
      team,
      player: playerId ? { id: playerId, name: playerName || playerId } : undefined,
      skill,
      isNegative,
      confidence: 0.9,
      rawText: transcript,
      debugMessage: ['[AI]', data.type, team && 'Team ' + team, playerName, skill && '(' + skill + ')'].filter(Boolean).join(' '),
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
      return this.validateParsedCommand(result, transcript);
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
      // Updated to gemini-2.0-flash-lite for optimal latency/cost on basic text tasks
      const model = "gemini-2.0-flash-lite";
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
        return this.validateParsedCommand(result, transcript);
      }
      return null;
    } catch (e) {
      // Do not log full error object in prod to avoid leaking headers
      console.error("[Gemini] Local Parse Error");
      throw e;
    }
  }

  private formatPlayer(p: Player): string {
    return p.number ? `${p.name} (#${p.number}, id:${p.id})` : `${p.name} (id:${p.id})`;
  }

  private buildPrompt(transcript: string, context: any): string {
    const rosterA = context.playersA.map((p: Player) => this.formatPlayer(p)).join(', ');
    const rosterB = context.playersB.map((p: Player) => this.formatPlayer(p)).join(', ');

    return [
      'You are a volleyball voice command parser. Return structured JSON.',
      '',
      'Context:',
      `  Team A: "${context.teamAName}" — Players: [${rosterA}]`,
      `  Team B: "${context.teamBName}" — Players: [${rosterB}]`,
      '',
      `Input: "${transcript}"`,
      '',
      'Command types:',
      '  point    — Score a point (team required, player/skill optional)',
      '  timeout  — Call a timeout (team required)',
      '  server   — Change serving team (team required)',
      '  swap     — Switch court sides (no team needed)',
      '  undo     — Undo last action (no team needed)',
      '  unknown  — Cannot interpret',
      '',
      'Skills: attack, block, ace, opponent_error, generic (default if unclear)',
      '',
      'Rules:',
      '  - Match team by name similarity (e.g. "Flamengo" → Team A if name matches)',
      '  - Match player by name or jersey number from the roster above',
      '  - Return the player id from the roster, not the name',
      '  - "Remove/subtract/cancel point" → isNegative: true',
      '  - If team cannot be determined, omit the team field',
      '  - Commands may be in Portuguese, English, or Spanish',
    ].join('\n');
  }
}
