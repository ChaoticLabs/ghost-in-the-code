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
  ChallengeValidationError
} from './challengeLoader';
