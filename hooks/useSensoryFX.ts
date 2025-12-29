
import { useEffect, useRef } from 'react';
import { GameState } from '../types';
import { useGameAudio } from './useGameAudio';
import { useHaptics } from './useHaptics';

/**
 * useSensoryFX - The Conductor
 * Watches GameState changes and triggers the appropriate Audio & Haptic feedback.
 * This decouples the "Trigger" (Button click) from the "Effect" (Game Event),
 * ensuring consistency and preventing audio glitches.
 */
export const useSensoryFX = (state: GameState) => {
  const audio = useGameAudio(state.config);
  const haptics = useHaptics(true);

  // Track previous state to detect edges
  const prevScoreA = useRef(state.scoreA);
  const prevScoreB = useRef(state.scoreB);
  const prevSwapped = useRef(state.swappedSides);
  const prevSuddenDeath = useRef(state.inSuddenDeath);
  const prevSet = useRef(state.currentSet);
  const prevMatchOver = useRef(state.isMatchOver);
  
  // Timeout Tracking
  const prevTimeoutsA = useRef(state.timeoutsA);
  const prevTimeoutsB = useRef(state.timeoutsB);

  useEffect(() => {
    // 1. SWAP SIDES
    if (state.swappedSides !== prevSwapped.current) {
        audio.playSwap();
        // Haptic Slide: Light -> Medium -> Light
        haptics.trigger([10, 50, 20]); 
        prevSwapped.current = state.swappedSides;
        return; 
    }

    // 2. SUDDEN DEATH ENTRY
    if (state.inSuddenDeath && !prevSuddenDeath.current) {
        audio.playSuddenDeath();
        haptics.notification('warning'); // Heavy double vibrate
        prevSuddenDeath.current = state.inSuddenDeath;
    }

    // 3. TIMEOUTS (New)
    if (state.timeoutsA > prevTimeoutsA.current || state.timeoutsB > prevTimeoutsB.current) {
        audio.playWhistle();
        haptics.notification('warning'); // Warning fits well for timeout alert
        
        prevTimeoutsA.current = state.timeoutsA;
        prevTimeoutsB.current = state.timeoutsB;
        return; 
    }

    // 4. SCORING LOGIC
    const scoreChanged = state.scoreA !== prevScoreA.current || state.scoreB !== prevScoreB.current;
    
    // Check Direction
    const scoreIncreased = state.scoreA > prevScoreA.current || state.scoreB > prevScoreB.current;
    const scoreDecreased = state.scoreA < prevScoreA.current || state.scoreB < prevScoreB.current;

    // Undo Feedback
    if (scoreChanged && scoreDecreased && !state.isMatchOver) {
        // Distinct "Retraction" feeling
        haptics.impact('medium');
    }

    // Detect Deuce State (Tied at Set Point threshold or higher)
    const isTieBreak = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
    const target = isTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;
    const isDeuce = state.scoreA === state.scoreB && state.scoreA >= target - 1;

    // Detect Critical Points
    const isMatchPoint = (state.scoreA >= target - 1 || state.scoreB >= target - 1) && 
                         (Math.abs(state.scoreA - state.scoreB) >= 1) && 
                         ((state.setsA === Math.ceil(state.config.maxSets/2)-1 && state.scoreA > state.scoreB) || (state.setsB === Math.ceil(state.config.maxSets/2)-1 && state.scoreB > state.scoreA));
    
    const isSetPoint = !isMatchPoint && (state.scoreA >= target - 1 || state.scoreB >= target - 1) && Math.abs(state.scoreA - state.scoreB) >= 1;

    if (scoreChanged && scoreIncreased) {
        if (state.isMatchOver) {
            audio.playMatchWin();
            haptics.notification('success'); // Success is usually a double tap
        } else if (isMatchPoint) {
            audio.playMatchPointAlert();
            // Heavy Impact + Oscillation
            haptics.trigger([50, 100, 50, 50]); 
        } else if (isSetPoint) {
            audio.playSetPointAlert();
            haptics.impact('heavy'); // Single heavy for set point
        } else if (isDeuce) {
            audio.playDeuce();
            haptics.impact('medium');
        } else {
            // Normal Point
            audio.playScore();
            haptics.impact('light');
        }
    }

    // 5. SET WIN (But not match win, handled above or via set increment)
    if (state.currentSet > prevSet.current && !state.isMatchOver) {
        audio.playSetWin();
        haptics.notification('success');
    }

    // Update Refs
    prevScoreA.current = state.scoreA;
    prevScoreB.current = state.scoreB;
    prevSet.current = state.currentSet;
    prevMatchOver.current = state.isMatchOver;
    prevSuddenDeath.current = state.inSuddenDeath;
    prevTimeoutsA.current = state.timeoutsA;
    prevTimeoutsB.current = state.timeoutsB;

  }, [
      state.scoreA, state.scoreB, state.swappedSides, state.inSuddenDeath, 
      state.currentSet, state.isMatchOver, state.config, audio, haptics,
      state.timeoutsA, state.timeoutsB
  ]);
};
