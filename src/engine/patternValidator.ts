/**
 * Pattern-based validation for common code fixes
 */

import type { ValidationRule } from './types';

export interface PatternRule {
  name: string;
  description: string;
  pattern: RegExp;
  shouldMatch: boolean;
}

export interface PatternValidationResult {
  isValid: boolean;
  reason: string;
  matchedRules: string[];
}

/**
 * Converts JSON validation rules to PatternRule objects
 */
export function convertValidationRules(rules: ValidationRule[]): PatternRule[] {
  return rules.map(rule => ({
    name: rule.name,
    description: rule.feedbackMessage || rule.description,
    pattern: new RegExp(rule.pattern),
    shouldMatch: rule.shouldMatch
  }));
}

/**
 * Validates code using pattern matching rules
 */
export function validateWithPatterns(
  playerCode: string,
  rules: PatternRule[]
): PatternValidationResult {
  const matchedRules: string[] = [];
  let isValid = true;
  const reasons: string[] = [];
  
  for (const rule of rules) {
    const hasMatch = rule.pattern.test(playerCode);
    
    if (rule.shouldMatch && hasMatch) {
      matchedRules.push(rule.name);
      reasons.push(`✓ ${rule.description}`);
    } else if (!rule.shouldMatch && !hasMatch) {
      matchedRules.push(rule.name);
      reasons.push(`✓ ${rule.description}`);
    } else {
      isValid = false;
      if (rule.shouldMatch) {
        reasons.push(`✗ Missing: ${rule.description}`);
      } else {
        reasons.push(`✗ Found unwanted: ${rule.description}`);
      }
    }
  }
  
  return {
    isValid,
    reason: reasons.join('\n'),
    matchedRules
  };
}

/**
 * Common pattern rules for different challenge types
 */
export const PatternRules = {
  // Operator changes
  hasGreaterThanOrEqual: {
    name: 'greater-than-or-equal',
    description: 'Change > to >= for inclusive comparison',
    pattern: />=/,
    shouldMatch: true
  },
  
  hasLogicalAnd: {
    name: 'logical-and',
    description: 'Use && (AND) for secure authentication',
    pattern: /&&/,
    shouldMatch: true
  },
  
  hasLogicalOr: {
    name: 'logical-or',
    description: 'Use || (OR) for flexible permissions',
    pattern: /\|\|/,
    shouldMatch: true
  },
  
  // Avoid console.log manipulation - detect hardcoded success messages
  noHardcodedSuccess: {
    name: 'no-hardcoded-success',
    description: 'Fix the code logic instead of changing console.log output',
    pattern: /console\.log\(['"`](?:Access granted|Password is strong|Encrypted:|Safe query:|Hash:)[^'"`]*['"`]\)[\s\S]*?console\.log\(['"`](?:Access granted|Password is strong|Encrypted:|Safe query:|Hash:)[^'"`]*['"`]\)/,
    shouldMatch: false
  },

  // Detect when user just writes a single console.log with the answer
  noDirectConsoleLogCheat: {
    name: 'no-direct-console-cheat',
    description: 'Code must contain the original logic structure',
    pattern: /^[\s]*console\.log\(['"`](?:Access granted|Password is strong|Encrypted:|Safe query:|Hash:)[^'"`]*['"`]\);?[\s]*$/,
    shouldMatch: false
  },
  
  // Specific fixes
  hasCorrectLoopBounds: {
    name: 'correct-loop-bounds',
    description: 'Change <= to < to prevent array out-of-bounds',
    pattern: /i\s*<\s*\w+\.length/,
    shouldMatch: true
  },
  
  hasParameterizedQuery: {
    name: 'parameterized-query',
    description: 'Clean the userId to prevent SQL injection',
    pattern: /SELECT \* FROM users WHERE id = \d+/,
    shouldMatch: true
  },

  // Structure requirements - ensure original code elements are present
  hasPasswordVariable: {
    name: 'has-password-variable',
    description: 'Code must contain password variable and logic',
    pattern: /let\s+password\s*=|const\s+password\s*=/,
    shouldMatch: true
  },

  hasIfStatement: {
    name: 'has-if-statement', 
    description: 'Code must contain conditional logic (if statement)',
    pattern: /if\s*\(/,
    shouldMatch: true
  },

  hasUsernamePasswordCheck: {
    name: 'has-auth-check',
    description: 'Code must contain username and password checking logic',
    pattern: /username.*===.*correctUser|correctUser.*===.*username/,
    shouldMatch: true
  },

  hasForLoop: {
    name: 'has-for-loop',
    description: 'Code must contain the original for loop structure',
    pattern: /for\s*\(/,
    shouldMatch: true
  }
};

/**
 * Create fallback validation rules (used when challenge doesn't define its own)
 */
export function createFallbackRules(): PatternRule[] {
  return [PatternRules.noHardcodedSuccess];
}

/**
 * @deprecated Use validation rules from challenge JSON instead
 * Legacy function for backward compatibility with hardcoded rules
 */
export function createChallengeRules(challengeId: string): PatternRule[] {
  switch (challengeId) {
    // CYBERSECURITY CHALLENGES
    case 'cyber-basic-1': // Password strength
      return [
        PatternRules.hasGreaterThanOrEqual,
        PatternRules.noHardcodedSuccess,
        PatternRules.noDirectConsoleLogCheat,
        PatternRules.hasPasswordVariable,
        PatternRules.hasIfStatement
      ];
      
    case 'cyber-basic-2': // Authentication
      return [
        PatternRules.hasLogicalAnd,
        PatternRules.noHardcodedSuccess,
        PatternRules.noDirectConsoleLogCheat,
        PatternRules.hasUsernamePasswordCheck,
        PatternRules.hasIfStatement
      ];
      
    case 'cyber-intermediate-1': // Rate limiter
      return [
        PatternRules.hasGreaterThanOrEqual,
        PatternRules.noHardcodedSuccess
      ];
      
    case 'cyber-intermediate-2': // SQL injection
      return [
        PatternRules.hasParameterizedQuery,
        PatternRules.noHardcodedSuccess
      ];
      
    case 'cyber-intermediate-3': // Permission check
      return [
        PatternRules.hasLogicalOr,
        PatternRules.noHardcodedSuccess
      ];
      
    case 'cyber-advanced-1': // Hash function
      return [
        PatternRules.hasCorrectLoopBounds,
        PatternRules.noHardcodedSuccess,
        PatternRules.noDirectConsoleLogCheat,
        PatternRules.hasForLoop
      ];

    // CONDITIONAL CHALLENGES
    case 'conditional-basic-1': // Backwards door
      return [
        PatternRules.hasIfStatement,
        PatternRules.noDirectConsoleLogCheat,
        { name: 'has-hasKey-check', description: 'Code must check hasKey variable', pattern: /hasKey/, shouldMatch: true }
      ];

    case 'conditional-basic-2': // Wrong comparison
      return [
        PatternRules.hasGreaterThanOrEqual,
        PatternRules.hasIfStatement,
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'conditional-basic-3': // Missing else
      return [
        PatternRules.hasIfStatement,
        { name: 'has-else', description: 'Code must have else block', pattern: /else\s*{/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'conditional-basic-4': // Age check
      return [
        PatternRules.hasGreaterThanOrEqual,
        PatternRules.hasIfStatement,
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'conditional-intermediate-1': // Confused logic
      return [
        PatternRules.hasLogicalAnd,
        PatternRules.hasIfStatement,
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'conditional-intermediate-2': // Inverted check
      return [
        PatternRules.hasIfStatement,
        { name: 'has-not-operator', description: 'Code must use ! (NOT) operator', pattern: /!\s*isDoorLocked/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'conditional-intermediate-3': // Else if chain
      return [
        PatternRules.hasGreaterThanOrEqual,
        PatternRules.hasIfStatement,
        { name: 'has-else-if', description: 'Code must have else if structure', pattern: /else\s+if/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    // LOOP CHALLENGES
    case 'loop-basic-1': // Infinite haunting
      return [
        { name: 'has-while-loop', description: 'Code must contain while loop', pattern: /while\s*\(/, shouldMatch: true },
        { name: 'has-increment', description: 'Code must increment count', pattern: /count\s*\+\+|count\s*=\s*count\s*\+\s*1|count\s*\+=\s*1/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'loop-basic-2': // Wrong direction
      return [
        PatternRules.hasForLoop,
        { name: 'has-increment', description: 'Code must use i++ to count up', pattern: /i\s*\+\+/, shouldMatch: true },
        { name: 'starts-at-1', description: 'Loop must start at 1', pattern: /i\s*=\s*1/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'loop-basic-3': // Off by one
      return [
        PatternRules.hasForLoop,
        { name: 'has-less-than-equal', description: 'Loop must use <= to include 10', pattern: /<=\s*10/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'loop-basic-4': // Skipping ghost
      return [
        PatternRules.hasForLoop,
        { name: 'has-increment-by-2', description: 'Loop must increment by 2', pattern: /i\s*\+=\s*2/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'loop-basic-5': // Backwards counter
      return [
        PatternRules.hasForLoop,
        { name: 'has-decrement', description: 'Loop must use i-- to count down', pattern: /i\s*--/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'loop-intermediate-1': // Nested ghost party
      return [
        PatternRules.hasForLoop,
        { name: 'has-nested-loop', description: 'Code must have nested loops', pattern: /for\s*\([^)]*\)\s*{[^}]*for\s*\(/, shouldMatch: true },
        { name: 'inner-loop-correct', description: 'Inner loop must use <= 2', pattern: /treat\s*<=\s*2/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'loop-intermediate-2': // Array ghost
      return [
        PatternRules.hasForLoop,
        PatternRules.hasCorrectLoopBounds,
        { name: 'has-array', description: 'Code must contain friends array', pattern: /friends\s*=/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'loop-intermediate-3': // While loop mystery
      return [
        { name: 'has-while-loop', description: 'Code must contain while loop', pattern: /while\s*\(/, shouldMatch: true },
        { name: 'correct-condition', description: 'While condition must use < 5', pattern: /num\s*<\s*5/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    // ARRAY CHALLENGES
    case 'array-basic-1': // Missing item
      return [
        { name: 'has-push', description: 'Code must use push() method', pattern: /\.push\s*\(/, shouldMatch: true },
        { name: 'has-array', description: 'Code must contain friends array', pattern: /friends\s*=/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'array-basic-2': // Wrong index
      return [
        { name: 'has-length-minus-1', description: 'Code must use array.length - 1', pattern: /\.length\s*-\s*1/, shouldMatch: true },
        { name: 'has-array', description: 'Code must contain ghosts array', pattern: /ghosts\s*=/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'array-basic-3': // Incomplete loop
      return [
        PatternRules.hasForLoop,
        { name: 'uses-array-length', description: 'Loop must use treats.length', pattern: /treats\.length/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'array-intermediate-1': // Array search
      return [
        { name: 'has-includes', description: 'Code must use includes() method', pattern: /\.includes\s*\(/, shouldMatch: true },
        PatternRules.hasIfStatement,
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'array-intermediate-2': // Array filter
      return [
        PatternRules.hasForLoop,
        PatternRules.hasGreaterThanOrEqual,
        PatternRules.hasIfStatement,
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'array-intermediate-3': // Array sum
      return [
        PatternRules.hasForLoop,
        PatternRules.hasCorrectLoopBounds,
        { name: 'has-addition', description: 'Code must add array values', pattern: /total\s*\+=|total\s*=\s*total\s*\+/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'array-advanced-1': // Array reverse
      return [
        PatternRules.hasForLoop,
        { name: 'loop-half-length', description: 'Loop must iterate through half the array', pattern: /i\s*<\s*\w+\.length\s*\/\s*2/, shouldMatch: true },
        { name: 'has-swap', description: 'Code must swap array elements', pattern: /temp\s*=/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    // FUNCTION CHALLENGES
    case 'function-basic-1': // Missing call
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+\w+\s*\(/, shouldMatch: true },
        { name: 'has-function-call', description: 'Code must call the function', pattern: /sayBoo\s*\(\s*\)/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'function-basic-2': // Missing parameter
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+greet/, shouldMatch: true },
        { name: 'has-argument', description: 'Function call must include argument', pattern: /greet\s*\(\s*['"`]\w+['"`]\s*\)/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'function-basic-3': // Missing return
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+add/, shouldMatch: true },
        { name: 'has-return', description: 'Function must return value', pattern: /return\s+\w+/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'function-intermediate-1': // Wrong arguments
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+subtract/, shouldMatch: true },
        { name: 'correct-order', description: 'Arguments must be in correct order (10, 3)', pattern: /subtract\s*\(\s*10\s*,\s*3\s*\)/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'function-intermediate-2': // Validation function
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+isPositive/, shouldMatch: true },
        { name: 'correct-comparison', description: 'Must use > (not >=) for positive check', pattern: /num\s*>\s*0/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'function-intermediate-3': // Reusable loop
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+repeatMessage/, shouldMatch: true },
        PatternRules.hasForLoop,
        { name: 'correct-loop-bound', description: 'Loop must use < times', pattern: /i\s*<\s*times/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'function-advanced-1': // Default parameter
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+greet/, shouldMatch: true },
        { name: 'has-default-param', description: 'Parameter must have default value', pattern: /name\s*=\s*['"`]Ghost['"`]/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'function-advanced-2': // Recursive ghost
      return [
        { name: 'has-function', description: 'Code must define function', pattern: /function\s+countdown/, shouldMatch: true },
        { name: 'has-recursion', description: 'Function must call itself', pattern: /countdown\s*\(\s*n\s*-\s*1\s*\)/, shouldMatch: true },
        { name: 'correct-condition', description: 'Base case must use > 0', pattern: /n\s*>\s*0/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    // LOGIC CHALLENGES
    case 'logic-basic-1': // Swapped variables
      return [
        { name: 'has-temp-variable', description: 'Code must use temporary variable for swap', pattern: /let\s+temp\s*=|const\s+temp\s*=|var\s+temp\s*=/, shouldMatch: true },
        { name: 'has-chest-variables', description: 'Code must contain chest1 and chest2', pattern: /chest1.*chest2|chest2.*chest1/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'logic-basic-2': // Wrong order
      return [
        { name: 'has-total-variable', description: 'Code must define total variable', pattern: /let\s+total|const\s+total|var\s+total/, shouldMatch: true },
        { name: 'correct-order', description: 'Variable must be defined before use', pattern: /let\s+total\s*=.*console\.log/s, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'logic-basic-3': // Calculation error
      return [
        { name: 'has-multiplication', description: 'Code must multiply width and height', pattern: /width\s*\*\s*height|height\s*\*\s*width/, shouldMatch: true },
        { name: 'has-variables', description: 'Code must contain width and height variables', pattern: /width.*height|height.*width/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'logic-intermediate-1': // String number confusion
      return [
        { name: 'has-conversion', description: 'Code must convert strings to numbers', pattern: /Number\s*\(|parseInt\s*\(|parseFloat\s*\(|\+score/, shouldMatch: true },
        { name: 'has-score-variables', description: 'Code must contain score variables', pattern: /score1.*score2|score2.*score1/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];

    case 'logic-intermediate-2': // Array index mystery
      return [
        { name: 'uses-index-0', description: 'Code must use index 0 for first item', pattern: /ghosts\s*\[\s*0\s*\]/, shouldMatch: true },
        { name: 'has-array', description: 'Code must contain ghosts array', pattern: /ghosts\s*=/, shouldMatch: true },
        PatternRules.noDirectConsoleLogCheat
      ];
      
    default:
      return [PatternRules.noHardcodedSuccess];
  }
}