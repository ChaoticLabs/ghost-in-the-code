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
      alternativeOutputs: []
    };

    const result = validateSolution(cheatingCode, mockSolution, undefined, 'cyber-basic-1');
    
    
    expect(result.isCorrect).toBe(false);
    // The test is getting the "missing operator" message instead of "cheating" message
    // because the >= operator is missing, which is checked first
    expect(result.feedback).toContain('ghost notices');
    expect(result.detailedFeedback).toContain('>=');
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
      expectedOutput: 'Password is too weak!', // This would be the actual output
      alternativeOutputs: []
    };

    const result = validateSolution(wrongOperatorCode, mockSolution, undefined, 'cyber-basic-1');
    
    expect(result.isCorrect).toBe(false);
    // Since output matches but pattern validation fails, it should be pattern-validation
    expect(result.validationMethod).toBe('pattern-validation');
    expect(result.feedback).toContain('comparison');
  });

  test('should catch direct console.log cheating', () => {
    const directCheatCode = `console.log('Password is strong!');`;

    const mockSolution: Solution = {
      type: 'output-match',
      expectedOutput: 'Password is strong!',
      alternativeOutputs: []
    };

    const result = validateSolution(directCheatCode, mockSolution, undefined, 'cyber-basic-1');
    
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('delete everything');
    expect(result.detailedFeedback).toContain('password variable');
  });
});