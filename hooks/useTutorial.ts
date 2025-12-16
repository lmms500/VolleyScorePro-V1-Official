
import { useState, useEffect, useCallback } from 'react';

const TUTORIAL_STORAGE_KEY = 'vs_pro_tutorials_v3';

// Available Tutorial Keys
export type TutorialKey = 'main' | 'manager' | 'history';

interface TutorialState {
  main: boolean;
  manager: boolean;
  history: boolean;
}

const DEFAULT_STATE: TutorialState = {
  main: false,
  manager: false,
  history: false
};

export const useTutorial = (isStandalone: boolean, isDisabled: boolean = false) => {
  const [tutorialState, setTutorialState] = useState<TutorialState>(DEFAULT_STATE);
  const [activeTutorial, setActiveTutorial] = useState<TutorialKey | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize State
  useEffect(() => {
    const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (saved) {
      try {
        setTutorialState(JSON.parse(saved));
      } catch (e) {
        setTutorialState(DEFAULT_STATE);
      }
    } else {
        // First Launch Logic for 'main'
        // Only trigger if not disabled
        if (!isDisabled) {
            setTimeout(() => setActiveTutorial('main'), 1000);
        }
    }
    setIsLoaded(true);
  }, []); // Run once on mount

  // Force close if disabled toggles to true
  useEffect(() => {
      if (isDisabled) {
          setActiveTutorial(null);
          setShowReminder(false);
      }
  }, [isDisabled]);

  // Reminder Logic (Only for PWA installs)
  useEffect(() => {
    if (isStandalone || isDisabled) return; 
    const interval = setInterval(() => {
      // Don't remind if tutorial is open
      if (activeTutorial) return;
      
      setShowReminder(prev => {
        if (!prev) return true;
        return prev;
      });
    }, 5 * 60 * 1000); // 5 Minutes

    return () => clearInterval(interval);
  }, [isStandalone, activeTutorial, isDisabled]);

  const saveState = (newState: TutorialState) => {
      setTutorialState(newState);
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(newState));
  };

  const triggerTutorial = useCallback((key: TutorialKey) => {
      if (!isDisabled && !tutorialState[key]) {
          setActiveTutorial(key);
      }
  }, [tutorialState, isDisabled]);

  const completeTutorial = useCallback((key: TutorialKey) => {
      const newState = { ...tutorialState, [key]: true };
      saveState(newState);
      setActiveTutorial(null);
  }, [tutorialState]);

  const resetTutorials = useCallback(() => {
      saveState(DEFAULT_STATE);
      // Optional: Trigger main tutorial again immediately?
      // setActiveTutorial('main');
  }, []);

  const dismissReminder = useCallback(() => {
    setShowReminder(false);
  }, []);

  return {
    activeTutorial,
    triggerTutorial,
    completeTutorial,
    resetTutorials,
    showReminder,
    dismissReminder,
    isLoaded
  };
};
