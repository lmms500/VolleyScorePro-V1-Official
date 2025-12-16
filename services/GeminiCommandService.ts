
import { GoogleGenAI, Type } from "@google/genai";
import { Player, TeamId, SkillType } from "../types";
import { SecureStorage } from "./SecureStorage";

const commandSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, description: "One of: 'point', 'timeout', 'server', 'undo', 'unknown'" },
    team: { type: Type.STRING, description: "'A' or 'B'. Infer from context, team name, or player name." },
    playerId: { type: Type.STRING, description: "The UUID of the player if mentioned and identified in the roster. Use 'unknown' if player is mentioned but not in roster." },
    skill: { type: Type.STRING, description: "One of: 'attack', 'block', 'ace', 'opponent_error'" },
    isNegative: { type: Type.BOOLEAN, description: "True if the user wants to REMOVE/UNDO a point." }
  }
};

export class GeminiCommandService {
  private static instance: GeminiCommandService;
  private devAi: GoogleGenAI | null = null;

  private constructor() {
    // SECURITY: Strictly prioritize the environment variable API key as per protocol.
    // This ensures the system is "pre-configured" when the env var is present.
    if (process.env.API_KEY) {
      this.devAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
  }

  public static getInstance(): GeminiCommandService {
    if (!GeminiCommandService.instance) {
      GeminiCommandService.instance = new GeminiCommandService();
    }
    return GeminiCommandService.instance;
  }

  public async parseCommand(
    transcript: string, 
    context: {
      teamAName: string;
      teamBName: string;
      playersA: Player[];
      playersB: Player[];
    }
  ): Promise<any> {
    
    let aiClient = this.devAi;

    // HYBRID FALLBACK: In a deployed native app without baked-in env vars, 
    // allow the user's stored key to take precedence if available.
    try {
        const gameState = await SecureStorage.load<any>('action_log');
        if (gameState && gameState.config && gameState.config.userApiKey) {
            console.debug("[Gemini] Using User-Provided API Key");
            aiClient = new GoogleGenAI({ apiKey: gameState.config.userApiKey });
        }
    } catch (e) {
        // Ignore storage errors, fall back to dev key
    }

    if (!aiClient) {
        console.warn("[Gemini] No API Key available. Voice intelligence disabled.");
        return null;
    }

    return this.parseLocal(aiClient, transcript, context);
  }

  private async parseLocal(client: GoogleGenAI, transcript: string, context: any): Promise<any> {
    try {
      // Use Flash model for low-latency voice command processing
      const model = "gemini-2.5-flash"; 
      const prompt = this.buildPrompt(transcript, context);

      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: commandSchema,
          // Disable thinking for voice commands to ensure maximum speed/responsiveness
          thinkingConfig: { thinkingBudget: 0 } 
        }
      });

      if (response.text) {
          return JSON.parse(response.text);
      }
      return null;
    } catch (e) {
      console.error("[Gemini] API Error:", e);
      return null;
    }
  }

  private buildPrompt(transcript: string, context: any): string {
      const rosterA = context.playersA.map((p: any) => `${p.name} (ID: ${p.id})`).join(", ");
      const rosterB = context.playersB.map((p: any) => `${p.name} (ID: ${p.id})`).join(", ");

      // Enhanced prompt with phonetic guards for volleyball terms
      return `
        You are an expert Volleyball Referee Assistant. Analyze the spoken command: "${transcript}".
        
        MATCH CONTEXT:
        - Team A: "${context.teamAName}" (Roster: ${rosterA})
        - Team B: "${context.teamBName}" (Roster: ${rosterB})
        
        PHONETIC & SEMANTIC RULES:
        1. **TEAM IDENTIFICATION**:
           - Map transcript text to Team 'A' or 'B'.
           - Fuzzy match names (e.g., "Flu" matches "Fluminense").
           - "Home" -> 'A', "Guest" -> 'B'.

        2. **SERVE / POSSESSION (Critical)**:
           - Keywords: "Serve", "Side out", "Rotate", "Ball to".
           - Phonetic Corrections: "Sack", "Surf", "Search", "Safe" -> Treat as "Serve".
           - "Serve [Team]" -> type: 'server', team: [A/B].
           - "Side out" implies the non-serving team takes possession.

        3. **SCORING (Critical)**:
           - Keywords: "Point", "Score", "Goal", "+1".
           - Phonetic Corrections: "Pint", "Paint", "Port", "Pot" -> Treat as "Point".
           - "Point [Team]" -> type: 'point', team: [A/B].
           - "Ace" -> type: 'point', skill: 'ace'.
           - "Block" / "Roof" -> type: 'point', skill: 'block'.
           - "Kill" / "Spike" -> type: 'point', skill: 'attack'.

        4. **PLAYER ATTRIBUTION**: 
           - Match player names from the roster context.
           - If a name is unique across both rosters, assign to that team.
           - "Point by John" (where John is in Team A) -> type: 'point', team: 'A', playerId: [John's ID].

        5. **SYSTEM COMMANDS**:
           - "Timeout" / "Time out" -> type: 'timeout'.
           - "Undo" / "Correction" / "Fix" -> type: 'undo'.
        
        Output JSON matching the schema.
      `;
  }
}
