---
name: ai-coaching-gemini
description: >
  Implement AI-powered coaching and analysis features using Google Gemini. Use when
  building intelligent game analysis, real-time coaching suggestions, training
  recommendations, opponent analysis, tactical advice, post-match AI reports, or
  any Gemini API integration for volleyball intelligence.
---

# AI Coaching — VolleyScore-Pro

## Decision Tree

```
AI coaching need → What type?
    ├─ Real-time game advice → CoachingService + useRealTimeCoach
    ├─ Post-match analysis → AnalysisEngine + DeepAnalysis
    ├─ Training recommendations → TrainingPlanner
    ├─ Opponent scouting → OpponentAnalysis (match history)
    ├─ Gemini API integration → API Usage section below
    └─ Voice command AI fallback → GeminiCommandService (see voice-and-speech)
```

## Overview
Leverage AI (Google Gemini) to provide intelligent coaching insights, real-time game suggestions, and post-match analysis.

## Current AI Integration
- **GeminiCommandService.ts** — Voice command fallback parser
- **AnalysisEngine.ts** — Post-match tactical analysis
- **API**: `@google/genai` SDK with `VITE_GEMINI_API_KEY`

## Planned Features

### 1. Real-Time Game Advisor
```typescript
interface GameAdvice {
  type: 'tactical' | 'substitution' | 'timeout' | 'rotation';
  message: string;        // Localized suggestion
  confidence: number;     // 0-1
  reasoning: string;      // Why this suggestion
  urgency: 'low' | 'medium' | 'high';
}

// Triggers:
// - After 3 consecutive points lost → suggest timeout
// - After 5 points → suggest rotation analysis
// - Momentum shift detected → tactical advice
// - Skill imbalance detected → substitution suggestion
```

### 2. Post-Match Deep Analysis
Enhance existing AnalysisEngine with:
```typescript
interface DeepAnalysis {
  tacticalSummary: string;
  keyMoments: Moment[];           // Turning points
  playerRatings: PlayerRating[];  // Per-player performance
  teamChemistry: number;         // 0-100 score
  recommendations: string[];     // Improvement tips
  predictedOutcome: string;      // "If X, then Y"
  comparisonToHistory: string;   // Trends vs past matches
}
```

### 3. Training Recommendations
```typescript
interface TrainingPlan {
  focus: string[];          // Areas to improve
  drills: Drill[];          // Suggested exercises
  duration: string;         // Estimated training time
  priority: 'attack' | 'defense' | 'serve' | 'teamwork';
}
```

### 4. Opponent Analysis
If repeat opponents exist in match history:
- Win/loss record against opponent
- Their scoring patterns
- Suggested counter-strategies

## Implementation Guide

### Architecture
```
src/features/ai-coaching/
├── services/
│   ├── CoachingService.ts    — Real-time advice engine
│   ├── DeepAnalysis.ts       — Post-match AI analysis
│   ├── TrainingPlanner.ts    — Training recommendations
│   └── OpponentAnalysis.ts   — Opponent pattern detection
├── hooks/
│   ├── useRealTimeCoach.ts   — Subscribe to game events
│   ├── useMatchAnalysis.ts   — Request analysis
│   └── useTrainingPlan.ts    — Generate plans
├── components/
│   ├── CoachAdvice.tsx        — Real-time advice card
│   ├── AnalysisReport.tsx     — Full analysis view
│   ├── TrainingCard.tsx       — Training recommendation
│   └── CoachAvatar.tsx        — AI coach visual
└── modals/
    ├── CoachingModal.tsx      — Coaching settings
    └── AnalysisModal.tsx      — Full analysis modal
```

### Gemini API Usage
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

async function getCoachingAdvice(gameState: GameState): Promise<GameAdvice> {
  const prompt = buildCoachingPrompt(gameState);
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return parseAdvice(response);
}
```

### Prompt Engineering
- Include current game state (score, sets, momentum)
- Include player stats if available
- Include action log (last N events)
- Request structured JSON response
- Validate with Zod schemas

### Performance Considerations
- Debounce API calls (max 1 per 30 seconds during game)
- Cache analysis results
- Queue requests to avoid rate limits
- Provide offline fallback (rule-based heuristics)
- Configurable via feature flags

### i18n
- AI responses should be in the user's selected language
- Include language hint in Gemini prompts
- Add keys under `coaching.` namespace

## Feature Flags
```typescript
FEATURE_FLAGS.AI_COACHING = false; // Enable when ready
FEATURE_FLAGS.REAL_TIME_ADVICE = false;
FEATURE_FLAGS.TRAINING_PLANS = false;
```
