
import React, { createContext, useContext, useMemo } from 'react';
import { useVolleyGame } from '../hooks/useVolleyGame';
import { GlobalLoader } from '../components/ui/GlobalLoader';

// Separamos o Contexto em Dados (State) e Ações (Dispatch/Methods)
type GameStateContextType = ReturnType<typeof useVolleyGame>['state'] & {
  isLoaded: boolean;
  canUndo: boolean;
  isMatchActive: boolean;
  isMatchPointA: boolean;
  isMatchPointB: boolean;
  isSetPointA: boolean;
  isSetPointB: boolean;
  isDeuce: boolean;
  isTieBreak: boolean;
  setsNeededToWin: number;
};

type GameActionsContextType = Omit<ReturnType<typeof useVolleyGame>, 'state' | 'isLoaded' | 'canUndo' | 'isMatchActive' | 'isMatchPointA' | 'isMatchPointB' | 'isSetPointA' | 'isSetPointB' | 'isDeuce' | 'isTieBreak' | 'setsNeededToWin'>;

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);
const GameActionsContext = createContext<GameActionsContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, isLoaded, ...actions } = useVolleyGame();

  const stateValue = useMemo(() => ({
    ...state,
    isLoaded,
    canUndo: state.actionLog.length > 0,
    isMatchActive: state.scoreA > 0 || state.scoreB > 0 || state.setsA > 0 || state.setsB > 0,
    // Adicione outros getters computados aqui se necessário para performance
  } as GameStateContextType), [state, isLoaded]);

  const actionsValue = useMemo(() => actions, [actions.addPoint]); // Memoiza os métodos estáveis

  if (!isLoaded) {
    return <GlobalLoader />;
  }

  return (
    <GameStateContext.Provider value={stateValue}>
      <GameActionsContext.Provider value={actionsValue}>
        {children}
      </GameActionsContext.Provider>
    </GameStateContext.Provider>
  );
};

// Hook unificado para manter compatibilidade, mas agora otimizado internamente
export const useGame = () => {
  const state = useContext(GameStateContext);
  const actions = useContext(GameActionsContext);
  if (!state || !actions) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return { ...state, state, ...actions };
};

// Hooks individuais para componentes que buscam performance extrema
export const useGameState = () => {
    const context = useContext(GameStateContext);
    if (!context) throw new Error('useGameState must be used within a GameProvider');
    return context;
};

export const useGameActions = () => {
    const context = useContext(GameActionsContext);
    if (!context) throw new Error('useGameActions must be used within a GameProvider');
    return context;
};
