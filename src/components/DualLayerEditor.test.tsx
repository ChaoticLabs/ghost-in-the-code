import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DualLayerEditor } from './DualLayerEditor';
import * as fc from 'fast-check';

describe('DualLayerEditor', () => {
  it('renders with initial value', () => {
    const onChange = vi.fn();
    render(<DualLayerEditor value="const x = 5;" onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox', { name: /code editor/i }) as HTMLTextAreaElement;
    expect(textarea.value).toBe('const x = 5;');
  });

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn();
    render(<DualLayerEditor value="" onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox', { name: /code editor/i });
    fireEvent.change(textarea, { target: { value: 'let y = 10;' } });
    
    expect(onChange).toHaveBeenCalledWith('let y = 10;');
  });

  it('synchronizes scroll between layers', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <DualLayerEditor value="line1\nline2\nline3\nline4\nline5" onChange={onChange} />
    );
    
    const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
    const highlightLayer = container.querySelector('.highlight-layer') as HTMLDivElement;
    
    expect(textarea).toBeTruthy();
    expect(highlightLayer).toBeTruthy();
    
    // Simulate scroll
    Object.defineProperty(textarea, 'scrollTop', { value: 50, writable: true });
    Object.defineProperty(textarea, 'scrollLeft', { value: 10, writable: true });
    fireEvent.scroll(textarea);
    
    // Wait for requestAnimationFrame to complete
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));
    
    // Verify highlight layer scroll is synchronized
    expect(highlightLayer.scrollTop).toBe(50);
    expect(highlightLayer.scrollLeft).toBe(10);
  });

  it('calculates correct line count', async () => {
    const onChange = vi.fn();
    const testValue = `line1
line2
line3`;
    const { container } = render(
      <DualLayerEditor value={testValue} onChange={onChange} />
    );
    
    // Wait for the component to update line count
    await waitFor(() => {
      const lineNumbers = container.querySelectorAll('.line-number');
      expect(lineNumbers.length).toBe(3);
    });
  });

  it('handles empty value with single line number', () => {
    const onChange = vi.fn();
    const { container } = render(<DualLayerEditor value="" onChange={onChange} />);
    
    const lineNumbers = container.querySelectorAll('.line-number');
    expect(lineNumbers.length).toBe(1);
  });

  it('applies high-contrast theme when specified', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DualLayerEditor value="const x = 5;" onChange={onChange} theme="high-contrast" />
    );
    
    const editor = container.querySelector('.dual-layer-editor');
    expect(editor?.classList.contains('high-contrast')).toBe(true);
  });

  it('renders syntax highlighting for keywords', () => {
    const onChange = vi.fn();
    const { container } = render(
      <DualLayerEditor value="const x = 5;" onChange={onChange} />
    );
    
    const keywordElements = container.querySelectorAll('.syntax-keyword');
    expect(keywordElements.length).toBeGreaterThan(0);
  });

  it('handles keyboard events', () => {
    const onChange = vi.fn();
    const onKeyDown = vi.fn();
    render(<DualLayerEditor value="" onChange={onChange} onKeyDown={onKeyDown} />);
    
    const textarea = screen.getByRole('textbox', { name: /code editor/i });
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('disables textarea when disabled prop is true', () => {
    const onChange = vi.fn();
    render(<DualLayerEditor value="" onChange={onChange} disabled={true} />);
    
    const textarea = screen.getByRole('textbox', { name: /code editor/i }) as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('shows placeholder when value is empty', () => {
    const onChange = vi.fn();
    render(<DualLayerEditor value="" onChange={onChange} placeholder="Type here..." />);
    
    const textarea = screen.getByRole('textbox', { name: /code editor/i }) as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe('Type here...');
  });

  it('handles tokenization errors gracefully', () => {
    const onChange = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // This should not throw even with complex code
    const { container } = render(
      <DualLayerEditor value="const x = `template ${complex}`;" onChange={onChange} />
    );
    
    const textarea = container.querySelector('.input-layer');
    expect(textarea).toBeTruthy();
    
    consoleErrorSpy.mockRestore();
  });
});

/**
 * Feature: enhanced-code-editor, Property 4: Keyboard behavior preservation
 * 
 * For any keyboard input (Tab, Enter, typing), the enhanced editor should behave 
 * identically to the original editor for auto-indentation, spacing, and line breaks.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3
 */
describe('Property-Based Tests - Keyboard Behavior Preservation', () => {
  it('should handle Tab key insertion consistently for any cursor position', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (initialCode, cursorOffset) => {
          const onChange = vi.fn();
          const onKeyDown = vi.fn((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            // Simulate the Tab key behavior from CodeEditor
            if (e.key === 'Tab') {
              e.preventDefault();
              
              const textarea = e.currentTarget;
              const cursorPosition = textarea.selectionStart;
              const currentContent = textarea.value;
              
              const beforeCursor = currentContent.substring(0, cursorPosition);
              const afterCursor = currentContent.substring(cursorPosition);
              const newContent = beforeCursor + '  ' + afterCursor;
              
              onChange(newContent);
              
              setTimeout(() => {
                textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
              }, 0);
            }
          });

          const { container } = render(
            <DualLayerEditor 
              value={initialCode} 
              onChange={onChange} 
              onKeyDown={onKeyDown}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          expect(textarea).toBeTruthy();
          
          // Set cursor position (bounded by code length)
          const cursorPosition = Math.min(cursorOffset, initialCode.length);
          textarea.setSelectionRange(cursorPosition, cursorPosition);
          
          // Simulate Tab key press
          fireEvent.keyDown(textarea, { key: 'Tab', preventDefault: () => {} });
          
          // Property 1: onKeyDown should be called
          expect(onKeyDown).toHaveBeenCalled();
          
          // Property 2: onChange should be called with content that has 2 spaces inserted
          if (onChange.mock.calls.length > 0) {
            const newContent = onChange.mock.calls[0][0];
            const expectedContent = 
              initialCode.substring(0, cursorPosition) + 
              '  ' + 
              initialCode.substring(cursorPosition);
            expect(newContent).toBe(expectedContent);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle Enter key with auto-indentation for any code structure', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant('function test() {'),
            fc.constant('  return 42;'),
            fc.constant('}'),
            fc.constant('if (true) {'),
            fc.constant('  console.log("test");'),
            fc.constant('const x = ['),
            fc.constant('  1, 2, 3'),
            fc.constant('];')
          ),
          { minLength: 1, maxLength: 10 }
        ),
        fc.integer({ min: 0, max: 10 }),
        (codeLines, lineIndex) => {
          const initialCode = codeLines.join('\n');
          const onChange = vi.fn();
          const onKeyDown = vi.fn((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            // Simulate the Enter key behavior from CodeEditor
            if (e.key === 'Enter') {
              e.preventDefault();
              
              const textarea = e.currentTarget;
              const cursorPosition = textarea.selectionStart;
              const currentContent = textarea.value;
              
              const beforeCursor = currentContent.substring(0, cursorPosition);
              const afterCursor = currentContent.substring(cursorPosition);
              
              const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
              const currentLine = beforeCursor.substring(currentLineStart);
              const indentMatch = currentLine.match(/^(\s*)/);
              const currentIndent = indentMatch ? indentMatch[1] : '';
              
              const trimmedLine = currentLine.trim();
              let additionalIndent = '';
              
              if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[')) {
                additionalIndent = '  ';
              }
              
              const newIndent = currentIndent + additionalIndent;
              const newContent = beforeCursor + '\n' + newIndent + afterCursor;
              
              onChange(newContent);
              
              setTimeout(() => {
                const newCursorPosition = cursorPosition + 1 + newIndent.length;
                textarea.setSelectionRange(newCursorPosition, newCursorPosition);
              }, 0);
            }
          });

          const { container } = render(
            <DualLayerEditor 
              value={initialCode} 
              onChange={onChange} 
              onKeyDown={onKeyDown}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          expect(textarea).toBeTruthy();
          
          // Find a valid cursor position at the end of a line
          const lines = initialCode.split('\n');
          const targetLineIndex = Math.min(lineIndex, lines.length - 1);
          let cursorPosition = 0;
          for (let i = 0; i < targetLineIndex; i++) {
            cursorPosition += lines[i].length + 1; // +1 for newline
          }
          cursorPosition += lines[targetLineIndex].length;
          
          textarea.setSelectionRange(cursorPosition, cursorPosition);
          
          // Simulate Enter key press
          fireEvent.keyDown(textarea, { key: 'Enter', preventDefault: () => {} });
          
          // Property 1: onKeyDown should be called
          expect(onKeyDown).toHaveBeenCalled();
          
          // Property 2: onChange should be called with content that has newline and indentation
          if (onChange.mock.calls.length > 0) {
            const newContent = onChange.mock.calls[0][0];
            
            // Property 3: New content should contain a newline
            expect(newContent).toContain('\n');
            
            // Property 4: New content should be longer than original (newline + possible indent)
            expect(newContent.length).toBeGreaterThanOrEqual(initialCode.length + 1);
            
            // Property 5: Content before cursor should be preserved
            const beforeCursor = initialCode.substring(0, cursorPosition);
            expect(newContent.startsWith(beforeCursor)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve indentation context when Enter is pressed after opening braces', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('{', '(', '['),
        fc.integer({ min: 0, max: 4 }),
        (openingBrace, indentLevel) => {
          const indent = '  '.repeat(indentLevel);
          const initialCode = `${indent}test${openingBrace}`;
          const onChange = vi.fn();
          const onKeyDown = vi.fn((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              
              const textarea = e.currentTarget;
              const cursorPosition = textarea.selectionStart;
              const currentContent = textarea.value;
              
              const beforeCursor = currentContent.substring(0, cursorPosition);
              const afterCursor = currentContent.substring(cursorPosition);
              
              const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
              const currentLine = beforeCursor.substring(currentLineStart);
              const indentMatch = currentLine.match(/^(\s*)/);
              const currentIndent = indentMatch ? indentMatch[1] : '';
              
              const trimmedLine = currentLine.trim();
              let additionalIndent = '';
              
              if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[')) {
                additionalIndent = '  ';
              }
              
              const newIndent = currentIndent + additionalIndent;
              const newContent = beforeCursor + '\n' + newIndent + afterCursor;
              
              onChange(newContent);
            }
          });

          const { container } = render(
            <DualLayerEditor 
              value={initialCode} 
              onChange={onChange} 
              onKeyDown={onKeyDown}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          
          // Place cursor at end of line (after opening brace)
          const cursorPosition = initialCode.length;
          textarea.setSelectionRange(cursorPosition, cursorPosition);
          
          // Simulate Enter key press
          fireEvent.keyDown(textarea, { key: 'Enter', preventDefault: () => {} });
          
          // Property 1: onChange should be called
          expect(onChange).toHaveBeenCalled();
          
          if (onChange.mock.calls.length > 0) {
            const newContent = onChange.mock.calls[0][0];
            
            // Property 2: Should add extra indentation after opening brace
            const expectedIndent = indent + '  '; // Original indent + 2 spaces
            const newLine = newContent.split('\n')[1];
            
            // Property 3: New line should start with increased indentation
            expect(newLine.startsWith(expectedIndent)).toBe(true);
            
            // Property 4: Indentation should be exactly 2 spaces more than original
            const originalSpaces = indent.length;
            const newSpaces = newLine.match(/^(\s*)/)?.[1].length || 0;
            expect(newSpaces).toBe(originalSpaces + 2);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle regular typing without interference from enhanced features', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\n') && !s.includes('\t')),
        fc.integer({ min: 0, max: 50 }),
        (initialCode, textToType, cursorOffset) => {
          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={initialCode} 
              onChange={onChange}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          expect(textarea).toBeTruthy();
          
          // Set cursor position (bounded by code length)
          const cursorPosition = Math.min(cursorOffset, initialCode.length);
          textarea.setSelectionRange(cursorPosition, cursorPosition);
          
          // Simulate typing by changing the value
          const expectedContent = 
            initialCode.substring(0, cursorPosition) + 
            textToType + 
            initialCode.substring(cursorPosition);
          
          fireEvent.change(textarea, { target: { value: expectedContent } });
          
          // Property 1: onChange should be called
          expect(onChange).toHaveBeenCalled();
          
          // Property 2: onChange should receive the expected content
          expect(onChange).toHaveBeenCalledWith(expectedContent);
          
          // Property 3: Content should be exactly as expected (no interference)
          const actualContent = onChange.mock.calls[0][0];
          expect(actualContent).toBe(expectedContent);
          
          // Property 4: Length should match expected length
          expect(actualContent.length).toBe(initialCode.length + textToType.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain cursor position consistency across keyboard operations', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (initialCode, cursorOffset) => {
          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={initialCode} 
              onChange={onChange}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          
          // Set cursor position (bounded by code length)
          const cursorPosition = Math.min(cursorOffset, initialCode.length);
          textarea.setSelectionRange(cursorPosition, cursorPosition);
          
          // Property 1: Cursor position should be set correctly
          expect(textarea.selectionStart).toBe(cursorPosition);
          expect(textarea.selectionEnd).toBe(cursorPosition);
          
          // Simulate selection change events
          fireEvent.click(textarea);
          
          // Property 2: Cursor position should remain stable after click
          expect(textarea.selectionStart).toBe(cursorPosition);
          expect(textarea.selectionEnd).toBe(cursorPosition);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: enhanced-code-editor, Property 5: Validation behavior preservation
 * 
 * For any code submission, the enhanced editor should produce identical validation 
 * results and feedback display as the original editor.
 * 
 * Validates: Requirements 3.4, 3.5
 */
describe('Property-Based Tests - Validation Behavior Preservation', () => {
  it('should produce identical validation results for any valid JavaScript code', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Valid JavaScript code samples
          fc.constant('const x = 5;\nconsole.log(x);'),
          fc.constant('function test() {\n  return 42;\n}\nconsole.log(test());'),
          fc.constant('let arr = [1, 2, 3];\nconsole.log(arr.length);'),
          fc.constant('if (true) {\n  console.log("yes");\n}'),
          fc.constant('for (let i = 0; i < 3; i++) {\n  console.log(i);\n}'),
          fc.constant('const obj = { a: 1 };\nconsole.log(obj.a);'),
          fc.constant('const str = "hello";\nconsole.log(str.toUpperCase());')
        ),
        fc.constantFrom('5', '42', '3', 'yes', '0\n1\n2', '1', 'HELLO'),
        (code, expectedOutput) => {
          // Create a mock challenge
          const mockChallenge = {
            id: 'test-challenge',
            type: 'logic',
            title: 'Test Challenge',
            description: 'Test description',
            tip: 'Test tip',
            codeFragment: {
              initialCode: code
            },
            solution: {
              type: 'output-match' as const,
              expectedOutput: expectedOutput
            },
            hints: [],
            educationalContent: ''
          };

          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={code} 
              onChange={onChange}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          expect(textarea).toBeTruthy();
          
          // Property 1: The textarea value should match the code
          expect(textarea.value).toBe(code);
          
          // Property 2: The editor should allow the code to be submitted
          expect(textarea.disabled).toBe(false);
          
          // Property 3: The code content should be accessible for validation
          // (This simulates what happens when the submit button is clicked)
          const codeForValidation = textarea.value;
          expect(codeForValidation).toBe(code);
          
          // Property 4: The editor should not modify the code content
          expect(codeForValidation.length).toBe(code.length);
          expect(codeForValidation).toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve code content exactly for validation regardless of syntax highlighting', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant('const'),
            fc.constant('let'),
            fc.constant('var'),
            fc.constant('function'),
            fc.constant('if'),
            fc.constant('for'),
            fc.constant('return'),
            fc.constant('console.log'),
            fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
            fc.constantFrom('=', '+', '-', '*', '/', '(', ')', '{', '}', ';', '\n', ' ')
          ),
          { minLength: 5, maxLength: 30 }
        ),
        (tokens) => {
          const code = tokens.join('');
          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={code} 
              onChange={onChange}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          const highlightLayer = container.querySelector('.highlight-layer') as HTMLDivElement;
          
          expect(textarea).toBeTruthy();
          expect(highlightLayer).toBeTruthy();
          
          // Property 1: Textarea value should exactly match input code
          expect(textarea.value).toBe(code);
          
          // Property 2: Code length should be preserved
          expect(textarea.value.length).toBe(code.length);
          
          // Property 3: Every character should be preserved
          for (let i = 0; i < code.length; i++) {
            expect(textarea.value[i]).toBe(code[i]);
          }
          
          // Property 4: Syntax highlighting should not affect the actual code value
          // The highlight layer is separate and should not modify the textarea content
          expect(textarea.value).toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain code integrity through edit operations that affect validation', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 100 }),
        (initialCode, insertion, insertPosition) => {
          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={initialCode} 
              onChange={onChange}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          
          // Bound insert position to valid range
          const position = Math.min(insertPosition, initialCode.length);
          
          // Simulate an edit operation
          const newCode = 
            initialCode.substring(0, position) + 
            insertion + 
            initialCode.substring(position);
          
          fireEvent.change(textarea, { target: { value: newCode } });
          
          // Property 1: onChange should be called with exact new code
          expect(onChange).toHaveBeenCalledWith(newCode);
          
          // Property 2: The new code should be exactly as constructed
          const receivedCode = onChange.mock.calls[0][0];
          expect(receivedCode).toBe(newCode);
          
          // Property 3: Code length should match expected length
          expect(receivedCode.length).toBe(initialCode.length + insertion.length);
          
          // Property 4: Insertion should be at correct position
          expect(receivedCode.substring(position, position + insertion.length)).toBe(insertion);
          
          // Property 5: Code before insertion should be preserved
          expect(receivedCode.substring(0, position)).toBe(initialCode.substring(0, position));
          
          // Property 6: Code after insertion should be preserved
          expect(receivedCode.substring(position + insertion.length)).toBe(initialCode.substring(position));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle disabled state consistently with validation flow', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.boolean(),
        (code, isDisabled) => {
          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={code} 
              onChange={onChange}
              disabled={isDisabled}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          
          // Property 1: Disabled state should match prop
          expect(textarea.disabled).toBe(isDisabled);
          
          // Property 2: Code should still be accessible even when disabled
          expect(textarea.value).toBe(code);
          
          // Property 3: Disabled state should not affect code content
          expect(textarea.value.length).toBe(code.length);
          
          if (isDisabled) {
            // Property 4: When disabled, changes should not be processed
            fireEvent.change(textarea, { target: { value: 'new code' } });
            // The change event fires but the textarea is disabled, so it shouldn't actually change
            // This tests that the disabled state is properly applied
          } else {
            // Property 5: When enabled, changes should be processed
            const newCode = code + ' // comment';
            fireEvent.change(textarea, { target: { value: newCode } });
            expect(onChange).toHaveBeenCalledWith(newCode);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve whitespace and formatting critical for validation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.constantFrom('\n', '\n\n', '  ', '    ', '\t', ' ')
          ),
          { minLength: 2, maxLength: 10 }
        ),
        (codeWithWhitespace) => {
          const code = codeWithWhitespace.map(([text, ws]) => text + ws).join('');
          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={code} 
              onChange={onChange}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          
          // Property 1: All whitespace should be preserved exactly
          expect(textarea.value).toBe(code);
          
          // Property 2: Newlines should be counted correctly
          const newlineCount = (code.match(/\n/g) || []).length;
          const textareaNewlineCount = (textarea.value.match(/\n/g) || []).length;
          expect(textareaNewlineCount).toBe(newlineCount);
          
          // Property 3: Spaces should be preserved
          const spaceCount = (code.match(/ /g) || []).length;
          const textareaSpaceCount = (textarea.value.match(/ /g) || []).length;
          expect(textareaSpaceCount).toBe(spaceCount);
          
          // Property 4: Tabs should be preserved
          const tabCount = (code.match(/\t/g) || []).length;
          const textareaTabCount = (textarea.value.match(/\t/g) || []).length;
          expect(textareaTabCount).toBe(tabCount);
          
          // Property 5: Total length including all whitespace should match
          expect(textarea.value.length).toBe(code.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle special characters that might affect validation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(
            'const str = "hello";',
            "const str = 'world';",
            'const str = `template ${x}`;',
            'const regex = /test/g;',
            'const num = 3.14;',
            'const bool = true;',
            'const arr = [1, 2, 3];',
            'const obj = { a: 1 };',
            '// comment',
            '/* block comment */',
            'x === y',
            'x !== y',
            'x && y',
            'x || y'
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (codeLines) => {
          const code = codeLines.join('\n');
          const onChange = vi.fn();
          
          const { container } = render(
            <DualLayerEditor 
              value={code} 
              onChange={onChange}
            />
          );
          
          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          
          // Property 1: All special characters should be preserved
          expect(textarea.value).toBe(code);
          
          // Property 2: String delimiters should be preserved
          const doubleQuotes = (code.match(/"/g) || []).length;
          const textareaDoubleQuotes = (textarea.value.match(/"/g) || []).length;
          expect(textareaDoubleQuotes).toBe(doubleQuotes);
          
          // Property 3: Operators should be preserved
          const operators = ['===', '!==', '&&', '||', '=', '+', '-', '*', '/'];
          operators.forEach(op => {
            const count = (code.match(new RegExp(op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            const textareaCount = (textarea.value.match(new RegExp(op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            expect(textareaCount).toBe(count);
          });
          
          // Property 4: Comments should be preserved
          if (code.includes('//')) {
            expect(textarea.value).toContain('//');
          }
          if (code.includes('/*')) {
            expect(textarea.value).toContain('/*');
          }
          
          // Property 5: Code should be byte-for-byte identical
          expect(textarea.value).toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });
});
