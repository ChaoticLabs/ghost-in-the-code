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
    expect(result.reason).toContain('hardcode success');
  });

  test('should accept legitimate code structure', () => {
    const legitimateCode = `
      let password = 'Sp00ky12';
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
});