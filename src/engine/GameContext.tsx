/**
 * React Context for game state management
 */

import { createContext, useContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type { GameState } from './types';
import type { GameAction } from './gameActions';
import { gameReducer, initialGameState } from './gameReducer';

interface GameContextType {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

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
