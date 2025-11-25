/**
 * Challenge loader with validation
 * Loads challenge data from JSON files and validates structure
 */

import type { Challenge, LevelIntroduction } from '../engine/types';
import { getAllLevelTypes, type LevelType } from './levelLoader';

// Dynamically import all challenge files
const challengeModules = import.meta.glob('./challenges/*.json', { eager: true });

/**
 * Validation error class for challenge data issues
 */
export class ChallengeValidationError extends Error {
  public challengeId?: string;
  
  constructor(message: string, challengeId?: string) {
    super(message);
    this.name = 'ChallengeValidationError';
    this.challengeId = challengeId;
  }
}

/**
 * Validates a single challenge object
 */
function validateChallenge(challenge: any, index: number, validTypes: string[]): void {
  const errors: string[] = [];

  // Required fields
  if (!challenge.id || typeof challenge.id !== 'string') {
    errors.push('Missing or invalid id');
  }
  if (!challenge.type || !validTypes.includes(challenge.type)) {
    errors.push(`Missing or invalid type (must be one of: ${validTypes.join(', ')})`);
  }
  if (!challenge.title || typeof challenge.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  if (!challenge.description || typeof challenge.description !== 'string') {
    errors.push('Missing or invalid description');
  }
  if (!challenge.tip || typeof challenge.tip !== 'string') {
    errors.push('Missing or invalid tip');
  }

  // Validate codeFragment
  if (!challenge.codeFragment || typeof challenge.codeFragment !== 'object') {
    errors.push('Missing or invalid codeFragment');
  } else {
    if (typeof challenge.codeFragment.initialCode !== 'string') {
      errors.push('codeFragment.initialCode must be a string');
    }
  }

  // Validate solution
  if (!challenge.solution || typeof challenge.solution !== 'object') {
    errors.push('Missing or invalid solution');
  } else {
    if (challenge.solution.type !== 'output-match') {
      errors.push('solution.type must be "output-match"');
    }
    if (typeof challenge.solution.expectedOutput !== 'string') {
      errors.push('solution.expectedOutput must be a string');
    }
    if (challenge.solution.alternativeOutputs && !Array.isArray(challenge.solution.alternativeOutputs)) {
      errors.push('solution.alternativeOutputs must be an array if provided');
    }
  }

  // Validate hints
  if (!Array.isArray(challenge.hints)) {
    errors.push('hints must be an array');
  } else if (challenge.hints.length === 0) {
    errors.push('hints array must contain at least one hint');
  } else {
    challenge.hints.forEach((hint: any, hintIndex: number) => {
      if (typeof hint !== 'string') {
        errors.push(`Hint ${hintIndex}: must be a string`);
      }
    });
  }

  // Validate educational content
  if (!challenge.educationalContent || typeof challenge.educationalContent !== 'string') {
    errors.push('Missing or invalid educationalContent');
  }

  if (errors.length > 0) {
    throw new ChallengeValidationError(
      `Challenge ${index + 1} (${challenge.id || 'unknown'}): ${errors.join(', ')}`,
      challenge.id
    );
  }
}

/**
 * Validates a challenge level
 */
function validateChallengeLevel(level: any, levelType: string, validTypes: string[]): void {
  if (!level.levelId || typeof level.levelId !== 'string') {
    throw new ChallengeValidationError(`${levelType}: Missing or invalid levelId`);
  }

  if (!Array.isArray(level.challenges)) {
    throw new ChallengeValidationError(`${levelType}: challenges must be an array`);
  }

  if (level.challenges.length === 0) {
    throw new ChallengeValidationError(`${levelType}: challenges array is empty`);
  }

  level.challenges.forEach((challenge: any, index: number) => {
    validateChallenge(challenge, index, validTypes);
  });
}

/**
 * Loads and validates all challenges dynamically
 */
export function loadAllChallenges(): Map<string, Challenge[]> {
  const challengeMap = new Map<string, Challenge[]>();
  const validTypes = getAllLevelTypes();

  try {
    // Dynamically load all challenge files
    Object.entries(challengeModules).forEach(([path, module]) => {
      // Extract filename without extension (e.g., 'loops' from './challenges/loops.json')
      const filename = path.split('/').pop()?.replace('.json', '') || '';
      const data = module as any;

      // Validate and load
      validateChallengeLevel(data, filename, validTypes);
      challengeMap.set(filename, data.challenges as Challenge[]);

      console.log(`  - ${filename}: ${data.challenges.length} challenges`);
    });

    console.log('✓ All challenges loaded and validated successfully');

    return challengeMap;
  } catch (error) {
    if (error instanceof ChallengeValidationError) {
      console.error('Challenge validation failed:', error.message);
      throw error;
    }
    throw new Error(`Failed to load challenges: ${error}`);
  }
}

/**
 * Gets challenges by type
 */
export function getChallengesByType(type: LevelType): Challenge[] {
  // Map singular type to plural filename (common convention)
  const typeMap: Record<string, string> = {
    loop: 'loops',
    conditional: 'conditionals',
    logic: 'logic',
    array: 'arrays',
    function: 'functions',
    cybersecurity: 'cybersecurity'
  };

  const challenges = loadAllChallenges();
  const filename = typeMap[type] || type;
  return challenges.get(filename) || [];
}

/**
 * Gets a specific challenge by ID
 */
export function getChallengeById(id: string): Challenge | undefined {
  const allChallenges = loadAllChallenges();
  
  for (const challenges of allChallenges.values()) {
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
      return challenge;
    }
  }
  
  return undefined;
}

/**
 * Gets all challenges as a flat array
 */
export function getAllChallengesFlat(): Challenge[] {
  const allChallenges = loadAllChallenges();
  const flat: Challenge[] = [];
  
  for (const challenges of allChallenges.values()) {
    flat.push(...challenges);
  }
  
  return flat;
}

/**
 * Gets challenge count by type
 */
export function getChallengeCount(): Record<string, number> & { total: number } {
  const allChallenges = loadAllChallenges();
  const counts: Record<string, number> = {};
  
  allChallenges.forEach((challenges, type) => {
    counts[type] = challenges.length;
  });
  
  counts.total = getAllChallengesFlat().length;
  
  return counts as Record<string, number> & { total: number };
}

/**
 * Gets level introduction by type
 */
export function getLevelIntroduction(type: LevelType): LevelIntroduction | null {
  // Map singular type to plural filename
  const typeMap: Record<string, string> = {
    loop: 'loops',
    conditional: 'conditionals',
    logic: 'logic',
    array: 'arrays',
    function: 'functions',
    cybersecurity: 'cybersecurity'
  };

  const filename = typeMap[type] || type;
  const path = `./challenges/${filename}.json`;
  const module = challengeModules[path];
  
  if (module) {
    const data = module as any;
    return data?.levelIntroduction || null;
  }
  
  return null;
}
