/**
 * Enhanced solution validation logic for Ghost in The Code
 * Validates player solutions using multiple techniques to prevent cheating
 */

import type { Solution } from './types';
import { runCode, normalizeOutput } from './codeRunner';
import { validateWithPatterns, createChallengeRules } from './patternValidator';

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
  detailedFeedback?: string;
  output?: string;
  error?: string;
  validationMethod?: string;
}

/**
 * Enhanced validation that checks both code structure and output
 */
export function validateSolution(
  playerCode: string,
  solution: Solution,
  originalCode?: string,
  challengeId?: string
): ValidationResult {
  // Run the player's code
  const result = runCode(playerCode);
  
  // If there's a runtime error
  if (!result.success) {
    return {
      isCorrect: false,
      feedback: "Oops! Your code has an error! 🐛",
      detailedFeedback: result.error || "There's a problem with your code. Check for syntax errors!",
      error: result.error,
      output: result.output,
      validationMethod: "runtime-error"
    };
  }
  
  // Normalize outputs for comparison
  const normalizedPlayerOutput = normalizeOutput(result.output);
  const normalizedExpectedOutput = normalizeOutput(solution.expectedOutput);
  
  // First check: Does output match?
  const outputMatches = normalizedPlayerOutput === normalizedExpectedOutput ||
    (solution.alternativeOutputs?.some(alt => 
      normalizedPlayerOutput === normalizeOutput(alt)
    ) ?? false);
  
  if (!outputMatches) {
    return {
      isCorrect: false,
      feedback: "Not quite! The output isn't right yet. 👻",
      detailedFeedback: `Expected: "${solution.expectedOutput}"\nYour output: "${result.output}"`,
      output: result.output,
      validationMethod: "output-mismatch"
    };
  }
  
  // Second check: Pattern-based validation (if we have challenge info)
  if (challengeId) {
    const patternRules = createChallengeRules(challengeId);
    const patternResult = validateWithPatterns(playerCode, patternRules);
    
    if (!patternResult.isValid) {
      return {
        isCorrect: false,
        feedback: "Nice try! But you need to fix the actual bug, not just change the output! 👻",
        detailedFeedback: patternResult.reason,
        output: result.output,
        validationMethod: "pattern-validation"
      };
    }
  }
  
  // All checks passed!
  return {
    isCorrect: true,
    feedback: "Perfect! You fixed the bug! 🎉",
    detailedFeedback: "The ghost is so happy! The code works perfectly now!",
    output: result.output,
    validationMethod: challengeId ? "enhanced-validation" : "output-only"
  };
}

/**
 * Legacy validation function for backward compatibility
 */
export function validateSolutionLegacy(
  playerCode: string,
  solution: Solution
): ValidationResult {
  return validateSolution(playerCode, solution);
}
