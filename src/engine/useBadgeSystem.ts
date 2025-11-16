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

    console.log('Badge check stats:', {
      completedCount: stats.completedChallenges.size,
      totalChallenges: stats.totalChallenges,
      loopChallenges: challengesByType.get('loop')?.length || 0,
      conditionalChallenges: challengesByType.get('conditional')?.length || 0,
      logicChallenges: challengesByType.get('logic')?.length || 0,
      currentBadges: stats.currentBadges.map(b => b.id)
    });

    // Debug: Check loop badge specifically
    const loopChallenges = challengesByType.get('loop') || [];
    const completedLoops = loopChallenges.filter(id => stats.completedChallenges.has(id));
    console.log('Loop badge check:', {
      totalLoopChallenges: loopChallenges.length,
      completedLoopChallenges: completedLoops.length,
      loopChallengeIds: loopChallenges,
      completedLoopIds: completedLoops,
      allCompleted: loopChallenges.every(id => stats.completedChallenges.has(id))
    });

    const newBadges = checkForNewBadges(stats);

    if (newBadges.length > 0) {
      console.log('New badges earned:', newBadges.map(b => b.name));
    }

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
