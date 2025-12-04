/**
 * Tests for enhanced validation system
 */

import { validateSolution } from '../solutionValidator';
import { validateWithPatterns, PatternRules } from '../patternValidator';
import type { Solution } from '../types';

describe('Enhanced Validation', () => {
  test('should detect >= operator', () => {
    const code = 'if (password.length >= 8) { console.log("test"); }';
    const result = validateWithPatterns(code, [PatternRules.hasGreaterThanOrEqual]);
    
    expect(result.isValid).toBe(true);
    expect(result.matchedRules).toContain('greater-than-or-equal');
  });

  test('should detect && operator', () => {
    const code = 'if (user === correct && pass === correct) { console.log("test"); }';
    const result = validateWithPatterns(code, [PatternRules.hasLogicalAnd]);
    
    expect(result.isValid).toBe(true);
    expect(result.matchedRules).toContain('logical-and');
  });

  test('should reject hardcoded success in both branches', () => {
    const cheatingCode = `
      if (condition) {
        console.log('Password is strong!');
      } else {
        console.log('Password is strong!');
      }
    `;
    
    const result = validateWithPatterns(cheatingCode, [PatternRules.noHardcodedSuccess]);
    
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Fix the code logic');
  });

  test('should accept legitimate code structure', () => {
    const legitimateCode = `
      let password = 'Sp00ky1!';
      let isStrong = password.length >= 8;
      if (isStrong) {
        console.log('Password is strong!');
      } else {
        console.log('Password is too weak!');
      }
    `;

    const mockSolution: Solution = {
      type: 'output-match',
      expectedOutput: 'Password is strong!',
      alternativeOutputs: []
    };

    const result = validateSolution(legitimateCode, mockSolution, undefined, 'cyber-basic-1');
    
    expect(result.isCorrect).toBe(true);
  });

  test('should provide clear feedback for cheating attempts', () => {
    const cheatingCode = `
      let password = 'Sp00ky1!';
      let isStrong = password.length > 8;
      if (isStrong) {
        console.log('Password is strong!');
      } else {
        console.log('Password is strong!'); // Cheating!
      }
    `;

    const mockSolution: Solution = {
      type: 'output-match',
      expectedOutput: 'Password is strong!',
      alternativeOutputs: [],
      validationRules: [
        {
          name: 'greater-than-or-equal',
          description: 'Must use >= for inclusive comparison',
          pattern: '>=',
          shouldMatch: true,
          feedbackMessage: 'You need to use >= instead of > to include passwords that are exactly 8 characters long.'
        }
      ]
    };

    const result = validateSolution(cheatingCode, mockSolution, undefined, 'cyber-basic-1');
    
    expect(result.isCorrect).toBe(false);
    expect(result.validationMethod).toBe('pattern-validation');
    expect(result.detailedFeedback).toContain('8 characters');
  });

  test('should provide clear feedback for missing operator fix', () => {
    const wrongOperatorCode = `
      let password = 'Sp00ky1!';
      let isStrong = password.length > 8; // Still wrong operator
      if (isStrong) {
        console.log('Password is strong!');
      } else {
        console.log('Password is too weak!');
      }
    `;

    const mockSolution: Solution = {
      type: 'output-match',
      expectedOutput: 'Password is too weak!',
      alternativeOutputs: [],
      validationRules: [
        {
          name: 'greater-than-or-equal',
          description: 'Must use >= for inclusive comparison',
          pattern: '>=',
          shouldMatch: true,
          feedbackMessage: 'You need to use >= instead of > to include passwords that are exactly 8 characters long.'
        }
      ]
    };

    const result = validateSolution(wrongOperatorCode, mockSolution, undefined, 'cyber-basic-1');
    
    expect(result.isCorrect).toBe(false);
    expect(result.validationMethod).toBe('pattern-validation');
    expect(result.detailedFeedback).toContain('8 characters');
  });

  test('should catch direct console.log cheating', () => {
    const directCheatCode = `console.log('Password is strong!');`;

    const mockSolution: Solution = {
      type: 'output-match',
      expectedOutput: 'Password is strong!',
      alternativeOutputs: [],
      validationRules: [
        {
          name: 'no-direct-console-cheat',
          description: 'Code must contain the original logic structure',
          pattern: '^[\\s]*console\\.log\\([\'"`](?:Access granted|Password is strong|Encrypted:|Safe query:|Hash:)[^\'"`]*[\'"`]\\);?[\\s]*$',
          shouldMatch: false,
          feedbackMessage: 'You cannot just write the answer directly! Keep the original code structure.'
        },
        {
          name: 'has-password-variable',
          description: 'Code must contain password variable and logic',
          pattern: 'let\\s+password\\s*=|const\\s+password\\s*=',
          shouldMatch: true,
          feedbackMessage: 'The password variable is missing! Keep the original code structure.'
        }
      ]
    };

    const result = validateSolution(directCheatCode, mockSolution, undefined, 'cyber-basic-1');
    
    expect(result.isCorrect).toBe(false);
    expect(result.validationMethod).toBe('pattern-validation');
    expect(result.detailedFeedback).toContain('password variable');
  });
});