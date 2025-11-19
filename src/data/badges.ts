/**
 * Badge definitions and earning logic
 */

import type { Badge } from '../engine/types';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'concept' | 'achievement' | 'special';
  concept?: 'loop' | 'conditional' | 'logic' | 'array' | 'function' | 'cybersecurity';
  earnCondition: (stats: BadgeEarnStats) => boolean;
}

export interface BadgeEarnStats {
  completedChallenges: Set<string>;
  challengesByType: Map<string, string[]>;
  totalChallenges: number;
  hintsUsedPerChallenge: Map<string, number>;
  currentBadges: Badge[];
}

/**
 * All available badges in the game
 */
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Concept Mastery Badges
  {
    id: 'loop-master',
    name: 'Loop Master',
    description: 'Complete all loop challenges',
    iconUrl: '/badges/loop-master.svg',
    category: 'concept',
    concept: 'loop',
    earnCondition: (stats) => {
      const loopChallenges = stats.challengesByType.get('loop') || [];
      if (loopChallenges.length === 0) return false;
      return loopChallenges.every(id => stats.completedChallenges.has(id));
    }
  },
  {
    id: 'conditional-champion',
    name: 'Conditional Champion',
    description: 'Complete all conditional challenges',
    iconUrl: '/badges/conditional-champion.svg',
    category: 'concept',
    concept: 'conditional',
    earnCondition: (stats) => {
      const conditionalChallenges = stats.challengesByType.get('conditional') || [];
      if (conditionalChallenges.length === 0) return false;
      return conditionalChallenges.every(id => stats.completedChallenges.has(id));
    }
  },
  {
    id: 'logic-legend',
    name: 'Logic Legend',
    description: 'Complete all logic puzzle challenges',
    iconUrl: '/badges/logic-legend.svg',
    category: 'concept',
    concept: 'logic',
    earnCondition: (stats) => {
      const logicChallenges = stats.challengesByType.get('logic') || [];
      if (logicChallenges.length === 0) return false;
      return logicChallenges.every(id => stats.completedChallenges.has(id));
    }
  },
  {
    id: 'array-ace',
    name: 'Array Ace',
    description: 'Complete all array challenges',
    iconUrl: '/badges/array-ace.svg',
    category: 'concept',
    concept: 'array',
    earnCondition: (stats) => {
      const arrayChallenges = stats.challengesByType.get('array') || [];
      if (arrayChallenges.length === 0) return false;
      return arrayChallenges.every(id => stats.completedChallenges.has(id));
    }
  },
  {
    id: 'function-wizard',
    name: 'Function Wizard',
    description: 'Complete all function challenges',
    iconUrl: '/badges/function-wizard.svg',
    category: 'concept',
    concept: 'function',
    earnCondition: (stats) => {
      const functionChallenges = stats.challengesByType.get('function') || [];
      if (functionChallenges.length === 0) return false;
      return functionChallenges.every(id => stats.completedChallenges.has(id));
    }
  },
  {
    id: 'security-guardian',
    name: 'Security Guardian',
    description: 'Complete all cybersecurity challenges',
    iconUrl: '/badges/security-guardian.svg',
    category: 'concept',
    concept: 'cybersecurity',
    earnCondition: (stats) => {
      const cyberChallenges = stats.challengesByType.get('cybersecurity') || [];
      if (cyberChallenges.length === 0) return false;
      return cyberChallenges.every(id => stats.completedChallenges.has(id));
    }
  },

  // Achievement Badges
  {
    id: 'first-bug-fixed',
    name: 'First Bug Fixed',
    description: 'Complete your first challenge',
    iconUrl: '/badges/first-bug-fixed.svg',
    category: 'achievement',
    earnCondition: (stats) => {
      return stats.completedChallenges.size >= 1;
    }
  },
  {
    id: 'hint-free-hero',
    name: 'Hint-Free Hero',
    description: 'Complete 5 challenges without using hints',
    iconUrl: '/badges/hint-free-hero.svg',
    category: 'achievement',
    earnCondition: (stats) => {
      let hintFreeChallenges = 0;
      stats.completedChallenges.forEach(challengeId => {
        const hintsUsed = stats.hintsUsedPerChallenge.get(challengeId) || 0;
        if (hintsUsed === 0) {
          hintFreeChallenges++;
        }
      });
      return hintFreeChallenges >= 5;
    }
  },
  {
    id: 'persistent-debugger',
    name: 'Persistent Ghost Helper',
    description: 'Complete 10 challenges total',
    iconUrl: '/badges/persistent-debugger.svg',
    category: 'achievement',
    earnCondition: (stats) => {
      return stats.completedChallenges.size >= 10;
    }
  },

  // Special Badges
  {
    id: 'perfect-start',
    name: 'Perfect Start',
    description: 'Complete the first 3 challenges without any hints',
    iconUrl: '/badges/perfect-start.svg',
    category: 'special',
    earnCondition: (stats) => {
      if (stats.completedChallenges.size < 3) return false;
      
      // Check first 3 challenges (assuming they're in order)
      const firstThree = Array.from(stats.completedChallenges).slice(0, 3);
      return firstThree.every(id => (stats.hintsUsedPerChallenge.get(id) || 0) === 0);
    }
  },
  {
    id: 'ghost-whisperer',
    name: 'Ghost Whisperer',
    description: 'Complete all challenges in the game',
    iconUrl: '/badges/ghost-whisperer.svg',
    category: 'special',
    earnCondition: (stats) => {
      return stats.completedChallenges.size === stats.totalChallenges && stats.totalChallenges > 0;
    }
  }
];

/**
 * Check which new badges should be earned based on current stats
 * @param stats Current game statistics
 * @returns Array of newly earned badges
 */
export function checkForNewBadges(stats: BadgeEarnStats): Badge[] {
  const newBadges: Badge[] = [];
  const earnedBadgeIds = new Set(stats.currentBadges.map(b => b.id));

  for (const definition of BADGE_DEFINITIONS) {
    // Skip if already earned
    if (earnedBadgeIds.has(definition.id)) {
      continue;
    }

    // Check if earn condition is met
    if (definition.earnCondition(stats)) {
      const badge: Badge = {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        iconUrl: definition.iconUrl,
        concept: definition.concept || 'loop', // Default to loop if not specified
        earnedDate: new Date().toISOString()
      };
      newBadges.push(badge);
    }
  }

  return newBadges;
}

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find(def => def.id === badgeId);
}

/**
 * Get all badge definitions for a specific category
 */
export function getBadgesByCategory(category: 'concept' | 'achievement' | 'special'): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter(def => def.category === category);
}
