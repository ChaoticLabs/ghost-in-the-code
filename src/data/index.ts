/**
 * Data module exports
 * Provides access to challenge data and loading utilities
 */

export {
  loadAllChallenges,
  getChallengesByType,
  getChallengeById,
  getAllChallengesFlat,
  getChallengeCount,
  getLevelIntroduction,
  ChallengeValidationError
} from './challengeLoader';

export {
  BADGE_DEFINITIONS,
  checkForNewBadges,
  getBadgeDefinition,
  getBadgesByCategory
} from './badges';

export type { BadgeDefinition, BadgeEarnStats } from './badges';
