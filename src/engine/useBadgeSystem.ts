/**
 * Custom hook for badge system logic
 */

import { useCallback, useMemo } from 'react';
import type { Challenge } from './types';
import { checkForNewBadges, type BadgeEarnStats } from '../data/badges';
import { useGame } from './GameContext';
import { gameActions } from './gameActions';

/**
 * Hook for managing badge earning logic
 */
export function useBadgeSystem(challenges: Challenge[]) {
  const { state, dispatch } = useGame();

  // Build challenge map by type
  const challengesByType = useMemo(() => {
    const map = new Map<string, string[]>();
    challenges.forEach(challenge => {
      const existing = map.get(challenge.type) || [];
      existing.push(challenge.id);
      map.set(challenge.type, existing);
    });
    return map;
  }, [challenges]);

  /**
   * Check for newly earned badges based on current game state
   */
  const checkAndAwardBadges = useCallback(() => {
    const stats: BadgeEarnStats = {
      completedChallenges: state.completedChallenges,
      challengesByType,
      totalChallenges: challenges.length,
      hintsUsedPerChallenge: state.hintsUsed,
      currentBadges: state.badges
    };

    const newBadges = checkForNewBadges(stats);

    // Dispatch actions to add each new badge
    newBadges.forEach(badge => {
      dispatch(gameActions.addBadge(badge));
    });

    return newBadges;
  }, [state.completedChallenges, state.hintsUsed, state.badges, challengesByType, challenges.length, dispatch]);

  return {
    checkAndAwardBadges,
    currentBadges: state.badges
  };
}
