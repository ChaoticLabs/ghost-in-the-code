/**
 * Action types and creators for game state management
 */

import type { Badge } from './types';

export type GameAction =
  | { type: 'COMPLETE_CHALLENGE'; payload: { challengeId: string; hintsUsed: number; attempts: number } }
  | { type: 'NEXT_CHALLENGE' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'USE_HINT'; payload: { challengeId: string } }
  | { type: 'ADD_BADGE'; payload: Badge }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_SAVED_STATE'; payload: any };

export const gameActions = {
  completeChallenge: (challengeId: string, hintsUsed: number, attempts: number): GameAction => ({
    type: 'COMPLETE_CHALLENGE',
    payload: { challengeId, hintsUsed, attempts }
  }),

  nextChallenge: (): GameAction => ({
    type: 'NEXT_CHALLENGE'
  }),

  nextLevel: (): GameAction => ({
    type: 'NEXT_LEVEL'
  }),

  useHint: (challengeId: string): GameAction => ({
    type: 'USE_HINT',
    payload: { challengeId }
  }),

  addBadge: (badge: Badge): GameAction => ({
    type: 'ADD_BADGE',
    payload: badge
  }),

  updateScore: (points: number): GameAction => ({
    type: 'UPDATE_SCORE',
    payload: points
  }),

  resetGame: (): GameAction => ({
    type: 'RESET_GAME'
  }),

  loadSavedState: (state: any): GameAction => ({
    type: 'LOAD_SAVED_STATE',
    payload: state
  })
};
