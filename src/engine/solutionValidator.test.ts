/**
 * Tests for solution validation logic
 */

import { describe, it, expect } from 'vitest';
import { validateSolution, validateLineReplacement } from './solutionValidator';
import type { Solution } from './types';

describe('validateSolution', () => {
  it('should validate correct solution with exact match', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  console.log('Boo!');\n  count++;"
    };

    const result = validateSolution("  console.log('Boo!');\n  count++;", solution);
    
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toContain('Perfect');
  });

  it('should validate correct solution with extra whitespace', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  console.log('Boo!');\n  count++;"
    };

    const result = validateSolution("  console.log('Boo!');  \n  count++;  ", solution);
    
    expect(result.isCorrect).toBe(true);
  });

  it('should validate alternative correct solutions', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  console.log('Boo!');\n  count++;",
      alternativeCorrectContent: ["  console.log('Boo!');\n  count = count + 1;"]
    };

    const result = validateSolution("  console.log('Boo!');\n  count = count + 1;", solution);
    
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toContain('Great job');
  });

  it('should reject incorrect solution', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  console.log('Boo!');\n  count++;"
    };

    const result = validateSolution("  console.log('Boo!');", solution);
    
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toBeTruthy();
  });

  it('should provide helpful feedback for missing lines', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  console.log('Boo!');\n  count++;"
    };

    const result = validateSolution("  console.log('Boo!');", solution);
    
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('close');
    expect(result.detailedFeedback).toBeTruthy();
  });

  it('should provide helpful feedback for extra lines', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  console.log('Boo!');"
    };

    const result = validateSolution("  console.log('Boo!');\n  count++;\n  extra++;", solution);
    
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('close');
    expect(result.detailedFeedback).toBeTruthy();
  });

  it('should provide feedback for partially correct solutions', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 1,
      correctContent: "for (let i = 1; i <= 3; i++) {"
    };

    const result = validateSolution("for (let i = 1; i <= 3; i--) {", solution);
    
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('close');
  });
});

describe('validateLineReplacement', () => {
  it('should validate correct line replacement', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  count++;"
    };

    const result = validateLineReplacement(3, "  count++;", solution);
    
    expect(result.isCorrect).toBe(true);
  });

  it('should reject replacement on wrong line', () => {
    const solution: Solution = {
      type: 'line-replacement',
      lineNumber: 3,
      correctContent: "  count++;"
    };

    const result = validateLineReplacement(2, "  count++;", solution);
    
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('not the buggy line');
  });
});
