/**
 * React Context for game state management
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type { GameState } from './types';
import type { GameAction } from './gameActions';
import { gameReducer, initialGameState } from './gameReducer';
import { loadGameState, saveGameState } from './persistence';

interface GameContextType {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  // Initialize state with loaded data or default
  const [state, dispatch] = useReducer(
    gameReducer,
    initialGameState,
    (initial) => {
      const savedState = loadGameState();
      return savedState || initial;
    }
  );

  // Auto-save state whenever it changes
  useEffect(() => {
    saveGameState(state);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
