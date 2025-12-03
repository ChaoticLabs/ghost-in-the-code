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
  
  // Second check: Pattern-based validation (if we have challenge info)
  if (challengeId) {
    const patternRules = createChallengeRules(challengeId);
    const patternResult = validateWithPatterns(playerCode, patternRules);
    
    if (!patternResult.isValid) {
      const clearFeedback = generateClearValidationFeedback(challengeId, patternResult);
      return {
        isCorrect: false,
        feedback: clearFeedback.main,
        detailedFeedback: clearFeedback.detailed,
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
 * Generates clear, educational feedback for validation failures
 */
function generateClearValidationFeedback(challengeId: string, patternResult: any): { main: string; detailed: string } {
  // Check what specific validation failed
  const failedRules = patternResult.reason.split('\n').filter((line: string) => line.startsWith('✗'));
  

  
  switch (challengeId) {
    case 'cyber-basic-1': // Password strength
      // Check for major cheating first (missing structure)
      if (failedRules.some((rule: string) => rule.includes('original logic structure') || rule.includes('password variable') || rule.includes('conditional logic'))) {
        return {
          main: "🚫 Whoa there! You can't just delete everything and write the answer! 👻",
          detailed: "The ghost needs you to fix the original code, not replace it! You need to keep the password variable, the if statement, and the length checking logic. Just change the '>' operator to '>=' to make it work correctly."
        };
      }
      // Then check for minor issues (wrong operator but structure intact)
      if (failedRules.some((rule: string) => rule.includes('>=') || rule.includes('greater-than-or-equal'))) {
        return {
          main: "🔍 The ghost notices you haven't fixed the comparison yet! 👻",
          detailed: "The password checker still uses '>' instead of '>='. Remember: a password that's exactly 8 characters should be considered strong too! Try changing the '>' to '>=' in your condition."
        };
      }
      // Console.log manipulation (but structure exists)
      if (failedRules.some((rule: string) => rule.includes('hardcode'))) {
        return {
          main: "🚫 Clever, but that's cheating! The ghost wants you to fix the logic, not the output! 👻",
          detailed: "You changed the console.log messages instead of fixing the actual bug. The real problem is in the condition that checks password length. Look for the '>' operator and think about what it should be!"
        };
      }
      break;
      
    case 'cyber-basic-2': // Authentication
      // Check for major cheating first (missing structure)
      if (failedRules.some((rule: string) => rule.includes('original logic structure') || rule.includes('username and password checking') || rule.includes('conditional logic'))) {
        return {
          main: "🚫 Hold on! You need to keep the original authentication logic! 👻",
          detailed: "The ghost wants you to fix the security bug, not delete the code! You need the username and password checking logic with the if statement. Just change the '||' operator to '&&' to make it secure."
        };
      }
      // Then check for operator issues
      if (failedRules.some((rule: string) => rule.includes('&&') || rule.includes('logical-and'))) {
        return {
          main: "🔐 The ghost's login is still not secure! 👻",
          detailed: "You need to use '&&' (AND) instead of '||' (OR). Right now, someone can log in with just the right username OR just the right password. For security, they need BOTH to be correct!"
        };
      }
      // Console.log manipulation
      if (failedRules.some((rule: string) => rule.includes('hardcode'))) {
        return {
          main: "🚫 Nice try, but you're changing the wrong thing! 👻",
          detailed: "The ghost needs you to fix the security logic, not just change what gets printed. Look at the '||' operator - that's what's making the login insecure!"
        };
      }
      break;
      
    case 'cyber-basic-3': // Cipher
      return {
        main: "🔤 The ghost's encryption is still backwards! 👻",
        detailed: "You need to ADD the shift value, not subtract it. Look for 'code - shift' and change it to 'code + shift' to make the letters move forward in the alphabet!"
      };
      
    case 'cyber-intermediate-1': // Rate limiter
      if (failedRules.some((rule: string) => rule.includes('>=') || rule.includes('greater-than-or-equal'))) {
        return {
          main: "🛡️ The account lock isn't working right! 👻",
          detailed: "The account should lock when someone reaches 3 failed attempts, not after 3. Change '>' to '>=' so that exactly 3 attempts will trigger the lock!"
        };
      }
      break;
      
    case 'cyber-intermediate-2': // SQL injection
      return {
        main: "💉 The ghost's database is still vulnerable to hackers! 👻",
        detailed: "You need to clean up the userId variable. Right now it contains dangerous SQL injection code. Change it to just '42' to make it safe!"
      };
      
    case 'cyber-intermediate-3': // Permission check
      if (failedRules.some((rule: string) => rule.includes('||') || rule.includes('logical-or'))) {
        return {
          main: "👑 The permission system is too strict! 👻",
          detailed: "Either an admin OR an owner should be able to delete files. Change '&&' to '||' so that having either permission is enough!"
        };
      }
      break;
      
    case 'cyber-advanced-1': // Hash function
      if (failedRules.some((rule: string) => rule.includes('loop') || rule.includes('<'))) {
        return {
          main: "🔢 The ghost's hash function is going out of bounds! 👻",
          detailed: "Your loop is trying to read past the end of the string. Change '<=' to '<' in your for loop condition to stay within the string boundaries!"
        };
      }
      break;
  }
  
  // Fallback for unknown cases
  return {
    main: "🤔 The ghost thinks you're on the right track, but something's not quite right! 👻",
    detailed: "You got the output correct, but the code logic still needs fixing. Look carefully at the operators and conditions in your code. What needs to be changed to make the logic work properly?"
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
