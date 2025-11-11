/**
 * Solution validation logic for Ghost in The Code
 * Validates player solutions against challenge requirements
 */

import type { Solution } from './types';

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
  detailedFeedback?: string;
}

/**
 * Normalizes a string for comparison by removing extra whitespace
 * while preserving meaningful structure
 */
function normalizeWhitespace(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*([{};,()])\s*/g, '$1') // Remove spaces around punctuation
    .replace(/\n\s*/g, '\n'); // Normalize line breaks
}

/**
 * Validates a player's solution against the correct solution
 * Supports multiple valid solutions and whitespace-insensitive comparison
 */
export function validateSolution(
  playerSolution: string,
  correctSolution: Solution
): ValidationResult {
  // Normalize the player's solution
  const normalizedPlayerSolution = normalizeWhitespace(playerSolution);
  
  // Normalize the correct solution
  const normalizedCorrectSolution = normalizeWhitespace(correctSolution.correctContent);
  
  // Check if the player's solution matches the primary correct solution
  if (normalizedPlayerSolution === normalizedCorrectSolution) {
    return {
      isCorrect: true,
      feedback: "Perfect! You fixed the bug! 🎉",
      detailedFeedback: "The ghost is so happy! The code works perfectly now!"
    };
  }
  
  // Check alternative correct solutions if they exist
  if (correctSolution.alternativeCorrectContent && correctSolution.alternativeCorrectContent.length > 0) {
    for (const alternative of correctSolution.alternativeCorrectContent) {
      const normalizedAlternative = normalizeWhitespace(alternative);
      if (normalizedPlayerSolution === normalizedAlternative) {
        return {
          isCorrect: true,
          feedback: "Great job! You fixed the bug! 🎉",
          detailedFeedback: "That's another way to solve it! The ghost approves!"
        };
      }
    }
  }
  
  // Solution is incorrect - provide helpful feedback
  return generateDetailedFeedback(
    normalizedPlayerSolution,
    normalizedCorrectSolution
  );
}

/**
 * Generates detailed feedback for incorrect solutions
 * Helps guide the player toward the correct answer
 */
function generateDetailedFeedback(
  playerSolution: string,
  correctSolution: string
): ValidationResult {
  // Check if the player is close (partial match)
  const playerLines = playerSolution.split('\n').filter(line => line.trim());
  const correctLines = correctSolution.split('\n').filter(line => line.trim());
  
  // Count matching lines
  let matchingLines = 0;
  const minLength = Math.min(playerLines.length, correctLines.length);
  
  for (let i = 0; i < minLength; i++) {
    if (playerLines[i] === correctLines[i]) {
      matchingLines++;
    }
  }
  
  // Provide contextual feedback based on how close they are
  if (matchingLines === correctLines.length - 1 && playerLines.length === correctLines.length) {
    return {
      isCorrect: false,
      feedback: "Almost there! You're very close! 👻",
      detailedFeedback: "The ghost sees you're on the right track. Check one of your lines carefully!"
    };
  }
  
  if (matchingLines > 0) {
    return {
      isCorrect: false,
      feedback: "Getting warmer! Some parts are right! 🔥",
      detailedFeedback: "You've got some of it correct, but there's still a bug hiding. Keep trying!"
    };
  }
  
  // Check if they added/removed lines
  if (playerLines.length < correctLines.length) {
    return {
      isCorrect: false,
      feedback: "Hmm, something seems to be missing... 🤔",
      detailedFeedback: "The ghost thinks you might need to add something to fix this bug!"
    };
  }
  
  if (playerLines.length > correctLines.length) {
    return {
      isCorrect: false,
      feedback: "That's a bit too much code! 📝",
      detailedFeedback: "Try to keep it simple. You might have added extra lines that aren't needed."
    };
  }
  
  // Generic feedback for completely wrong solutions
  return {
    isCorrect: false,
    feedback: "Not quite! The ghost is still confused. Try again! 👻",
    detailedFeedback: "Don't worry! Debugging takes practice. Maybe try asking for a hint?"
  };
}

/**
 * Validates a specific line replacement in the code
 * Used when the player edits a specific line
 */
export function validateLineReplacement(
  lineNumber: number,
  newContent: string,
  solution: Solution
): ValidationResult {
  // Check if the line number matches the solution's target line
  if (lineNumber !== solution.lineNumber) {
    return {
      isCorrect: false,
      feedback: "That's not the buggy line! 🔍",
      detailedFeedback: `The ghost says the bug is on line ${solution.lineNumber}, not line ${lineNumber}!`
    };
  }
  
  // Validate the content using the main validation function
  return validateSolution(newContent, solution);
}
