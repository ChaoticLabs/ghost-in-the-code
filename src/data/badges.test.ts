/**
 * Tests for badge earning logic
 */

import { describe, it, expect } from 'vitest';
import { checkForNewBadges, BADGE_DEFINITIONS, type BadgeEarnStats } from './badges';
import type { Badge } from '../engine/types';

describe('Badge System', () => {
  describe('checkForNewBadges', () => {
    it('should award First Bug Fixed badge after completing first challenge', () => {
      const stats: BadgeEarnStats = {
        completedChallenges: new Set(['loop-basic-1']),
        challengesByType: new Map([['loop', ['loop-basic-1', 'loop-basic-2']]]),
        totalChallenges: 2,
        hintsUsedPerChallenge: new Map([['loop-basic-1', 0]]),
        currentBadges: []
      };

      const newBadges = checkForNewBadges(stats);
      
      expect(newBadges.length).toBeGreaterThan(0);
      expect(newBadges.some(b => b.id === 'first-bug-fixed')).toBe(true);
    });

    it('should award Loop Master badge after completing all loop challenges', () => {
      const stats: BadgeEarnStats = {
        completedChallenges: new Set(['loop-basic-1', 'loop-basic-2', 'loop-basic-3']),
        challengesByType: new Map([['loop', ['loop-basic-1', 'loop-basic-2', 'loop-basic-3']]]),
        totalChallenges: 3,
        hintsUsedPerChallenge: new Map(),
        currentBadges: []
      };

      const newBadges = checkForNewBadges(stats);
      
      expect(newBadges.some(b => b.id === 'loop-master')).toBe(true);
    });

    it('should award Hint-Free Hero after completing 5 challenges without hints', () => {
      const stats: BadgeEarnStats = {
        completedChallenges: new Set(['c1', 'c2', 'c3', 'c4', 'c5']),
        challengesByType: new Map([['loop', ['c1', 'c2', 'c3', 'c4', 'c5']]]),
        totalChallenges: 5,
        hintsUsedPerChallenge: new Map([
          ['c1', 0],
          ['c2', 0],
          ['c3', 0],
          ['c4', 0],
          ['c5', 0]
        ]),
        currentBadges: []
      };

      const newBadges = checkForNewBadges(stats);
      
      expect(newBadges.some(b => b.id === 'hint-free-hero')).toBe(true);
    });

    it('should not award Hint-Free Hero if hints were used', () => {
      const stats: BadgeEarnStats = {
        completedChallenges: new Set(['c1', 'c2', 'c3', 'c4', 'c5']),
        challengesByType: new Map([['loop', ['c1', 'c2', 'c3', 'c4', 'c5']]]),
        totalChallenges: 5,
        hintsUsedPerChallenge: new Map([
          ['c1', 0],
          ['c2', 1], // Used a hint
          ['c3', 0],
          ['c4', 0],
          ['c5', 0]
        ]),
        currentBadges: []
      };

      const newBadges = checkForNewBadges(stats);
      
      expect(newBadges.some(b => b.id === 'hint-free-hero')).toBe(false);
    });

    it('should not award already earned badges', () => {
      const existingBadge: Badge = {
        id: 'first-bug-fixed',
        name: 'First Bug Fixed',
        description: 'Complete your first challenge',
        iconUrl: '/badges/first-bug-fixed.svg',
        concept: 'loop',
        earnedDate: new Date().toISOString()
      };

      const stats: BadgeEarnStats = {
        completedChallenges: new Set(['loop-basic-1']),
        challengesByType: new Map([['loop', ['loop-basic-1', 'loop-basic-2']]]),
        totalChallenges: 2,
        hintsUsedPerChallenge: new Map([['loop-basic-1', 0]]),
        currentBadges: [existingBadge]
      };

      const newBadges = checkForNewBadges(stats);
      
      expect(newBadges.some(b => b.id === 'first-bug-fixed')).toBe(false);
    });

    it('should award Persistent Ghost Helper after 10 challenges', () => {
      const completedIds = Array.from({ length: 10 }, (_, i) => `c${i + 1}`);
      const stats: BadgeEarnStats = {
        completedChallenges: new Set(completedIds),
        challengesByType: new Map([['loop', completedIds]]),
        totalChallenges: 10,
        hintsUsedPerChallenge: new Map(),
        currentBadges: []
      };

      const newBadges = checkForNewBadges(stats);
      
      expect(newBadges.some(b => b.id === 'persistent-debugger')).toBe(true);
    });

    it('should award Ghost Whisperer after completing all challenges', () => {
      const completedIds = ['c1', 'c2', 'c3', 'c4', 'c5'];
      const stats: BadgeEarnStats = {
        completedChallenges: new Set(completedIds),
        challengesByType: new Map([['loop', completedIds]]),
        totalChallenges: 5,
        hintsUsedPerChallenge: new Map(),
        currentBadges: []
      };

      const newBadges = checkForNewBadges(stats);
      
      expect(newBadges.some(b => b.id === 'ghost-whisperer')).toBe(true);
    });
  });

  describe('BADGE_DEFINITIONS', () => {
    it('should have all required badges defined', () => {
      const requiredBadgeIds = [
        'loop-master',
        'conditional-champion',
        'logic-legend',
        'first-bug-fixed',
        'hint-free-hero',
        'persistent-debugger',
        'perfect-start',
        'ghost-whisperer'
      ];

      const definedIds = BADGE_DEFINITIONS.map(def => def.id);
      
      requiredBadgeIds.forEach(id => {
        expect(definedIds).toContain(id);
      });
    });

    it('should have valid categories for all badges', () => {
      const validCategories = ['concept', 'achievement', 'special'];
      
      BADGE_DEFINITIONS.forEach(def => {
        expect(validCategories).toContain(def.category);
      });
    });

    it('should have concept field for concept badges', () => {
      const conceptBadges = BADGE_DEFINITIONS.filter(def => def.category === 'concept');
      
      conceptBadges.forEach(def => {
        expect(def.concept).toBeDefined();
        expect(['loop', 'conditional', 'logic', 'array', 'function', 'cybersecurity']).toContain(def.concept);
      });
    });
  });
});
