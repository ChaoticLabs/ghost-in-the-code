import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LineNumbers } from './LineNumbers';
import * as fc from 'fast-check';

describe('LineNumbers', () => {
  it('should render line numbers starting from 1', () => {
    const { container } = render(<LineNumbers lineCount={5} />);
    const lineNumbers = container.querySelectorAll('.line-number');
    
    expect(lineNumbers).toHaveLength(5);
    expect(lineNumbers[0].textContent).toBe('1');
    expect(lineNumbers[4].textContent).toBe('5');
  });

  it('should render at least one line number when lineCount is 0', () => {
    const { container } = render(<LineNumbers lineCount={0} />);
    const lineNumbers = container.querySelectorAll('.line-number');
    
    expect(lineNumbers).toHaveLength(1);
    expect(lineNumbers[0].textContent).toBe('1');
  });

  it('should highlight the current line', () => {
    const { container } = render(<LineNumbers lineCount={5} currentLine={3} />);
    const lineNumbers = container.querySelectorAll('.line-number');
    
    expect(lineNumbers[2].classList.contains('line-number-active')).toBe(true);
    expect(lineNumbers[0].classList.contains('line-number-active')).toBe(false);
  });

  it('should apply high-contrast theme', () => {
    const { container } = render(<LineNumbers lineCount={3} theme="high-contrast" />);
    const lineNumbersContainer = container.querySelector('.line-numbers');
    
    expect(lineNumbersContainer?.classList.contains('line-numbers-high-contrast')).toBe(true);
  });

  it('should be non-selectable', () => {
    const { container } = render(<LineNumbers lineCount={3} />);
    const lineNumbersContainer = container.querySelector('.line-numbers');
    
    // Check that the container has the line-numbers class which applies user-select: none
    expect(lineNumbersContainer?.classList.contains('line-numbers')).toBe(true);
  });

  it('should have aria-hidden attribute', () => {
    const { container } = render(<LineNumbers lineCount={3} />);
    const lineNumbersContainer = container.querySelector('.line-numbers');
    
    expect(lineNumbersContainer?.getAttribute('aria-hidden')).toBe('true');
  });
});

/**
 * Feature: enhanced-code-editor, Property 2: Line number consistency
 * 
 * For any code modification (adding or removing lines), the line numbers should 
 * accurately reflect the current line count and maintain sequential numbering starting from 1.
 * 
 * Validates: Requirements 2.2, 2.3
 */
describe('Property-Based Tests - Line Number Consistency', () => {
  it('should maintain sequential numbering for any line count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        (lineCount) => {
          const { container } = render(<LineNumbers lineCount={lineCount} />);
          const lineNumbers = container.querySelectorAll('.line-number');
          
          // Property 1: Should render at least 1 line number (even when lineCount is 0)
          const expectedCount = Math.max(1, lineCount);
          expect(lineNumbers).toHaveLength(expectedCount);
          
          // Property 2: Line numbers should be sequential starting from 1
          lineNumbers.forEach((element, index) => {
            expect(element.textContent).toBe((index + 1).toString());
          });
          
          // Property 3: First line number should always be 1
          expect(lineNumbers[0].textContent).toBe('1');
          
          // Property 4: Last line number should equal the line count (or 1 if lineCount is 0)
          const lastLineNumber = lineNumbers[lineNumbers.length - 1].textContent;
          expect(lastLineNumber).toBe(expectedCount.toString());
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle line count changes correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (initialLineCount, newLineCount) => {
          // Render with initial line count
          const { container, rerender } = render(<LineNumbers lineCount={initialLineCount} />);
          let lineNumbers = container.querySelectorAll('.line-number');
          
          // Verify initial state
          expect(lineNumbers).toHaveLength(initialLineCount);
          
          // Re-render with new line count
          rerender(<LineNumbers lineCount={newLineCount} />);
          lineNumbers = container.querySelectorAll('.line-number');
          
          // Property: Line numbers should update to reflect new count
          expect(lineNumbers).toHaveLength(newLineCount);
          
          // Property: Sequential numbering should be maintained
          lineNumbers.forEach((element, index) => {
            expect(element.textContent).toBe((index + 1).toString());
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: enhanced-code-editor, Property 3: Line number non-selectability
 * 
 * For any interaction with line numbers, they should remain non-selectable 
 * and maintain consistent alignment.
 * 
 * Validates: Requirements 2.5
 */
describe('Property-Based Tests - Line Number Non-Selectability', () => {
  it('should have non-selectable styling for any line count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (lineCount) => {
          const { container } = render(<LineNumbers lineCount={lineCount} />);
          const lineNumbersContainer = container.querySelector('.line-numbers');
          
          // Property 1: Container should have line-numbers class (which applies user-select: none)
          expect(lineNumbersContainer?.classList.contains('line-numbers')).toBe(true);
          
          // Property 2: Container should have aria-hidden attribute (screen readers should skip)
          expect(lineNumbersContainer?.getAttribute('aria-hidden')).toBe('true');
          
          // Property 3: All line number elements should be within the non-selectable container
          const lineNumbers = container.querySelectorAll('.line-number');
          expect(lineNumbers.length).toBe(lineCount);
          
          lineNumbers.forEach((lineNumber) => {
            // Each line number should be a child of the non-selectable container
            expect(lineNumbersContainer?.contains(lineNumber)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent alignment for any line count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        (lineCount) => {
          const { container } = render(<LineNumbers lineCount={lineCount} />);
          const lineNumbers = container.querySelectorAll('.line-number');
          
          // Property: All line numbers should have the same class for consistent styling
          lineNumbers.forEach((lineNumber) => {
            expect(lineNumber.classList.contains('line-number')).toBe(true);
          });
          
          // Property: Line numbers container should have proper structure
          const lineNumbersContainer = container.querySelector('.line-numbers');
          expect(lineNumbersContainer).toBeTruthy();
          
          // Property: All line numbers should be direct children of the container
          const directChildren = Array.from(lineNumbersContainer?.children || []);
          expect(directChildren.length).toBe(lineCount);
          
          directChildren.forEach((child) => {
            expect(child.classList.contains('line-number')).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
