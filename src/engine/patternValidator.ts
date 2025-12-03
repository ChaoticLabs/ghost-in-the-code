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
    description: 'Uses >= operator',
    pattern: />=/,
    shouldMatch: true
  },
  
  hasLogicalAnd: {
    name: 'logical-and',
    description: 'Uses && (AND) operator',
    pattern: /&&/,
    shouldMatch: true
  },
  
  hasLogicalOr: {
    name: 'logical-or',
    description: 'Uses || (OR) operator',
    pattern: /\|\|/,
    shouldMatch: true
  },
  
  // Avoid console.log manipulation - detect hardcoded success messages
  noHardcodedSuccess: {
    name: 'no-hardcoded-success',
    description: 'Doesn\'t hardcode success messages in both branches',
    pattern: /console\.log\(['"`](?:Access granted|Password is strong|Encrypted:|Safe query:|Hash:)[^'"`]*['"`]\)[\s\S]*?console\.log\(['"`](?:Access granted|Password is strong|Encrypted:|Safe query:|Hash:)[^'"`]*['"`]\)/,
    shouldMatch: false
  },
  
  // Specific fixes
  hasCorrectLoopBounds: {
    name: 'correct-loop-bounds',
    description: 'Uses correct loop bounds (< instead of <=)',
    pattern: /i\s*<\s*\w+\.length/,
    shouldMatch: true
  },
  
  hasParameterizedQuery: {
    name: 'parameterized-query',
    description: 'Uses safe SQL query format',
    pattern: /SELECT \* FROM users WHERE id = \d+/,
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
        PatternRules.noHardcodedSuccess
      ];
      
    case 'cyber-basic-2': // Authentication
      return [
        PatternRules.hasLogicalAnd,
        PatternRules.noHardcodedSuccess
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
        PatternRules.noHardcodedSuccess
      ];
      
    default:
      return [PatternRules.noHardcodedSuccess];
  }
}