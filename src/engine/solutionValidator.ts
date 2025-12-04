/**
 * Enhanced solution validation logic for Ghost in The Code
 * Validates player solutions using multiple techniques to prevent cheating
 */

import type { Solution } from './types';
import { runCode, normalizeOutput } from './codeRunner';
import { validateWithPatterns, convertValidationRules, createFallbackRules } from './patternValidator';

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
  _originalCode?: string,
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
  
  // Second check: Pattern-based validation (if rules are defined)
  if (solution.validationRules && solution.validationRules.length > 0) {
    const patternRules = convertValidationRules(solution.validationRules);
    const patternResult = validateWithPatterns(playerCode, patternRules);
    
    if (!patternResult.isValid) {
      // Extract failed rule messages for better feedback
      const failedMessages = patternResult.reason
        .split('\n')
        .filter(line => line.startsWith('✗'))
        .map(line => line.replace('✗ Missing: ', '').replace('✗ Found unwanted: ', ''))
        .join(' ');
      
      return {
        isCorrect: false,
        feedback: "🚫 Nice try, but you need to fix the actual bug! 👻",
        detailedFeedback: failedMessages || patternResult.reason,
        output: result.output,
        validationMethod: "pattern-validation"
      };
    }
  } else if (challengeId) {
    // Fallback to basic anti-cheat if no rules defined
    const fallbackRules = createFallbackRules();
    const patternResult = validateWithPatterns(playerCode, fallbackRules);
    
    if (!patternResult.isValid) {
      return {
        isCorrect: false,
        feedback: "🚫 Clever, but that's cheating! Fix the code logic instead! 👻",
        detailedFeedback: patternResult.reason,
        output: result.output,
        validationMethod: "fallback-validation"
      };
    }
  }
  
  // All checks passed!
  return {
    isCorrect: true,
    feedback: "Perfect! You fixed the bug! 🎉",
    detailedFeedback: "The ghost is so happy! The code works perfectly now!",
    output: result.output,
    validationMethod: solution.validationRules ? "enhanced-validation" : "output-only"
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
