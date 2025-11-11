/**
 * Game state reducer for managing state transitions
 */

import type { GameState } from './types';
import type { GameAction } from './gameActions';

export const initialGameState: GameState = {
  currentLevel: 1,
  currentChallenge: 0,
  completedChallenges: new Set<string>(),
  hintsUsed: new Map<string, number>(),
  score: 0,
  badges: [],
  assessmentMetrics: {
    challengesCompleted: 0,
    conceptMastery: new Map<string, number>(),
    averageAttempts: 0,
    totalHintsUsed: 0,
    timeSpentMinutes: 0,
    lastActivity: new Date().toISOString()
  }
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'COMPLETE_CHALLENGE': {
      const { challengeId, hintsUsed, attempts } = action.payload;
      const newCompletedChallenges = new Set(state.completedChallenges);
      newCompletedChallenges.add(challengeId);

      // Calculate score bonus (fewer hints and attempts = higher score)
      const baseScore = 100;
      const hintPenalty = hintsUsed * 10;
      const attemptPenalty = (attempts - 1) * 5;
      const earnedScore = Math.max(baseScore - hintPenalty - attemptPenalty, 10);

      // Update assessment metrics
      const totalChallenges = state.assessmentMetrics.challengesCompleted + 1;
      const totalAttempts = state.assessmentMetrics.averageAttempts * state.assessmentMetrics.challengesCompleted + attempts;
      const newAverageAttempts = totalAttempts / totalChallenges;

      return {
        ...state,
        completedChallenges: newCompletedChallenges,
        score: state.score + earnedScore,
        assessmentMetrics: {
          ...state.assessmentMetrics,
          challengesCompleted: totalChallenges,
          averageAttempts: newAverageAttempts,
          totalHintsUsed: state.assessmentMetrics.totalHintsUsed + hintsUsed,
          lastActivity: new Date().toISOString()
        }
      };
    }

    case 'NEXT_CHALLENGE': {
      return {
        ...state,
        currentChallenge: state.currentChallenge + 1
      };
    }

    case 'NEXT_LEVEL': {
      return {
        ...state,
        currentLevel: state.currentLevel + 1,
        currentChallenge: 0
      };
    }

    case 'USE_HINT': {
      const { challengeId } = action.payload;
      const newHintsUsed = new Map(state.hintsUsed);
      const currentHints = newHintsUsed.get(challengeId) || 0;
      newHintsUsed.set(challengeId, currentHints + 1);

      return {
        ...state,
        hintsUsed: newHintsUsed
      };
    }

    case 'ADD_BADGE': {
      return {
        ...state,
        badges: [...state.badges, action.payload]
      };
    }

    case 'UPDATE_SCORE': {
      return {
        ...state,
        score: state.score + action.payload
      };
    }

    case 'RESET_GAME': {
      return initialGameState;
    }

    case 'LOAD_SAVED_STATE': {
      // Reconstruct Sets and Maps from saved data
      const savedState = action.payload;
      return {
        ...savedState,
        completedChallenges: new Set(savedState.completedChallenges || []),
        hintsUsed: new Map(Object.entries(savedState.hintsUsed || {})),
        assessmentMetrics: {
          ...savedState.assessmentMetrics,
          conceptMastery: new Map(Object.entries(savedState.assessmentMetrics?.conceptMastery || {}))
        }
      };
    }

    default:
      return state;
  }
}
