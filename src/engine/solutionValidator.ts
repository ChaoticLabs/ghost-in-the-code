/**
 * Solution validation logic for Ghost in The Code
 * Validates player solutions by running code and checking output
 */

import type { Solution } from './types';
import { runCode, normalizeOutput } from './codeRunner';

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
  detailedFeedback?: string;
  output?: string;
  error?: string;
}

/**
 * Validates a player's solution by running the code and checking output
 */
export function validateSolution(
  playerCode: string,
  solution: Solution
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
      output: result.output
    };
  }
  
  // Normalize outputs for comparison
  const normalizedPlayerOutput = normalizeOutput(result.output);
  const normalizedExpectedOutput = normalizeOutput(solution.expectedOutput);
  
  // Check if output matches expected
  if (normalizedPlayerOutput === normalizedExpectedOutput) {
    return {
      isCorrect: true,
      feedback: "Perfect! You fixed the bug! 🎉",
      detailedFeedback: "The ghost is so happy! The code works perfectly now!",
      output: result.output
    };
  }
  
  // Check alternative outputs
  if (solution.alternativeOutputs) {
    for (const altOutput of solution.alternativeOutputs) {
      if (normalizedPlayerOutput === normalizeOutput(altOutput)) {
        return {
          isCorrect: true,
          feedback: "Great job! You fixed the bug! 🎉",
          detailedFeedback: "That's another way to solve it! The ghost approves!",
          output: result.output
        };
      }
    }
  }
  
  // Output doesn't match
  return {
    isCorrect: false,
    feedback: "Not quite! The output isn't right yet. 👻",
    detailedFeedback: `Expected: "${solution.expectedOutput}"\nYour output: "${result.output}"`,
    output: result.output
  };
}
