
import { Match } from "../store/historyStore";
import { MatchAnalysis } from '@types';
import { MATCH_ANALYSIS_SCHEMA } from '@features/voice/services/schemas';

export class AnalysisEngine {
  
  // Configuration
  private static apiKey: string = process.env.API_KEY || ''; 
  private static proxyUrl: string = process.env.VITE_AI_PROXY_URL || '';

  /**
   * Generates a professional tactical analysis of the match.
   * Routes to Proxy if available, otherwise falls back to local SDK.
   */
  public static async analyzeMatch(match: Match): Promise<MatchAnalysis | null> {
    try {
        if (this.proxyUrl) {
            return await this.remoteAnalyze(match);
        }
        
        if (this.apiKey) {
            return await this.localAnalyze(match);
        }

        console.warn("[AnalysisEngine] Service not configured.");
        return null;

    } catch (e) {
        console.error("[AnalysisEngine] Analysis Error:", e);
        return null;
    }
  }

  private static validateResponse(data: any): MatchAnalysis {
      // Defensive defaults to prevent UI crashes if AI hallucinates schema
      return {
          tacticalSummary: data?.tacticalSummary || "Análise indisponível no momento.",
          clutchMoment: data?.clutchMoment || "N/A",
          momentumAnalysis: data?.momentumAnalysis || "Dados insuficientes.",
          performanceTips: Array.isArray(data?.performanceTips) ? data.performanceTips : ["Continue treinando fundamentos.", "Foco na comunicação.", "Revise o posicionamento."],
          teamEfficiency: {
              attack: typeof data?.teamEfficiency?.attack === 'number' ? data.teamEfficiency.attack : 5,
              defense: typeof data?.teamEfficiency?.defense === 'number' ? data.teamEfficiency.defense : 5,
              consistency: typeof data?.teamEfficiency?.consistency === 'number' ? data.teamEfficiency.consistency : 5
          },
          futurePrediction: data?.futurePrediction || "Confronto equilibrado."
      };
  }

  private static async remoteAnalyze(match: Match): Promise<MatchAnalysis | null> {
      try {
          // Prepare a lighter payload for the wire
          const slimMatch = {
              id: match.id,
              sets: match.sets,
              setsA: match.setsA,
              setsB: match.setsB,
              teamAName: match.teamAName,
              teamBName: match.teamBName,
              actionLog: match.actionLog, // Main data source
              teamARoster: { players: match.teamARoster?.players.map(p => ({ id: p.id, name: p.name, number: p.number })) },
              teamBRoster: { players: match.teamBRoster?.players.map(p => ({ id: p.id, name: p.name, number: p.number })) }
          };

          const response = await fetch(this.proxyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  action: 'analyze_match',
                  payload: { match: slimMatch } 
              })
          });

          if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
          const result = await response.json();
          return this.validateResponse(result);

      } catch (error) {
          console.warn("[AnalysisEngine] Remote analysis failed, attempting local fallback.");
          if (this.apiKey) return this.localAnalyze(match);
          return null;
      }
  }

  private static async localAnalyze(match: Match): Promise<MatchAnalysis | null> {
    // Lazy load GoogleGenAI only when analysis is triggered (~40KB saved from initial bundle)
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    // Using gemini-3-pro-preview for deep reasoning tasks as per guidelines
    const model = "gemini-3-pro-preview"; 

    // 1. Player Mapping (ID -> Name #Number)
    const playerMap = new Map<string, string>();
    const rosterA = match.teamARoster?.players || [];
    const rosterB = match.teamBRoster?.players || [];
    
    [...rosterA, ...rosterB].forEach(p => {
        const num = p.number ? `#${p.number}` : '';
        playerMap.set(p.id, `${p.name} ${num}`.trim());
    });

    // 2. Basic Stats Pre-calculation
    const stats = {
        A: { name: match.teamAName, kills: 0, blocks: 0, aces: 0, errors: 0, total: 0 },
        B: { name: match.teamBName, kills: 0, blocks: 0, aces: 0, errors: 0, total: 0 }
    };

    // 3. Narrative Reconstruction
    const sortedLogs = [...(match.actionLog || [])].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    let currentScoreA = 0;
    let currentScoreB = 0;

    const fullLog = sortedLogs.map(l => {
        if (l.type === 'POINT') {
            const teamStats = l.team === 'A' ? stats.A : stats.B;
            teamStats.total++;
            
            if (l.skill === 'attack') teamStats.kills++;
            if (l.skill === 'block') teamStats.blocks++;
            if (l.skill === 'ace') teamStats.aces++;
            if (l.skill === 'opponent_error') teamStats.errors++;

            const playerName = l.playerId ? (playerMap.get(l.playerId) || 'Jogador Desconhecido') : 'Time';
            const skillLabel = l.skill ? l.skill.toUpperCase() : 'PONTO';
            const score = `${l.prevScoreA}-${l.prevScoreB}`;
            
            currentScoreA = l.prevScoreA + (l.team === 'A' ? 1 : 0);
            currentScoreB = l.prevScoreB + (l.team === 'B' ? 1 : 0);
            
            const isBreakPoint = l.prevServingTeam === l.team;
            const phase = isBreakPoint ? "BREAK POINT" : "SIDE-OUT";

            return `[${score}] ${l.team} (${teamStats.name}) marcou via ${skillLabel} (${phase}) - Atleta: ${playerName}`;
        }
        if (l.type === 'TIMEOUT') {
            return `[TIMEOUT] Pedido por ${l.team === 'A' ? match.teamAName : match.teamBName} (${currentScoreA}-${currentScoreB})`;
        }
        return null;
    }).filter(Boolean).join("\n");

    const prompt = `
      ATUE COMO: Um Treinador de Vôlei de Elite (Nível Internacional FIVB) e Cientista de Dados Esportivos.
      
      CONTEXTO DA PARTIDA:
      - ${match.teamAName} (Time A) vs ${match.teamBName} (Time B)
      - Placar Final (Sets): ${match.setsA} x ${match.setsB}
      - Parciais: ${match.sets.map(s => `${s.scoreA}-${s.scoreB}`).join(" | ")}
      
      ESTATÍSTICAS AGREGADAS:
      - ${match.teamAName}: ${stats.A.kills} Ataques, ${stats.A.blocks} Bloqueios, ${stats.A.aces} Aces. Pontos ganhos em erros do oponente: ${stats.A.errors}.
      - ${match.teamBName}: ${stats.B.kills} Ataques, ${stats.B.blocks} Bloqueios, ${stats.B.aces} Aces. Pontos ganhos em erros do oponente: ${stats.B.errors}.

      LOG CRONOLÓGICO DETALHADO (Play-by-Play):
      ${fullLog}

      SUA MISSÃO:
      Gere uma análise técnica profunda. Não descreva apenas o que aconteceu, explique O PORQUÊ.
      
      DIRETRIZES DE ANÁLISE:
      1. **Dinâmica K1 vs K2**: Analise a eficiência do Side-out (virada de bola) vs Break Points (pontos de saque/contra-ataque). Quem controlou o saque teve vantagem?
      2. **Momentum & Clutch**: Identifique "Runs" (sequências de pontos) e como Timeouts impactaram o fluxo. Quem jogou melhor acima do ponto 20?
      3. **Diagnóstico de Erros**: A vitória veio por mérito ofensivo ou excesso de erros não forçados do adversário?
      4. **Destaques**: Identifique padrões individuais (ex: "Jogador X foi decisivo no bloqueio no final do Set 2").

      Retorne estritamente um JSON compatível com o schema fornecido.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: MATCH_ANALYSIS_SCHEMA,
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 2048 } // Allow some budget for deep tactical analysis
        }
      });
      
      const rawData = JSON.parse(response.text || "{}");
      return this.validateResponse(rawData);
    } catch (e) {
      console.error("[AnalysisEngine] AI Coach Error:", e);
      throw e;
    }
  }
}
