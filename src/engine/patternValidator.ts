/**
 * Pattern-based validation for common code fixes
 */

export interface PatternRule {
  name: string;
  description: string;
  pattern: RegExp;
  shouldMatch: boolean; // true if pattern should be found, false if it shouldn't
}

export interface PatternValidationResult {
  isValid: boolean;
  reason: string;
  matchedRules: string[];
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
 * Create validation rules for specific challenges
 */
export function createChallengeRules(challengeId: string): PatternRule[] {
  switch (challengeId) {
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
      
    default:
      return [PatternRules.noHardcodedSuccess];
  }
}