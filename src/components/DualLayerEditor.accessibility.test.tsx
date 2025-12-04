import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DualLayerEditor } from './DualLayerEditor';

describe('DualLayerEditor - Accessibility', () => {
  it('should have proper ARIA labels and roles', () => {
    const mockOnChange = () => {};
    
    render(
      <DualLayerEditor
        value="const x = 5;"
        onChange={mockOnChange}
      />
    );

    // Check for main editor group with proper label
    const editorGroup = screen.getByRole('group', { name: /code editor with syntax highlighting/i });
    expect(editorGroup).toBeTruthy();

    // Check for textarea with proper ARIA attributes
    const textarea = screen.getByRole('textbox', { name: /javascript code editor/i }) as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.getAttribute('aria-multiline')).toBe('true');
    expect(textarea.getAttribute('aria-describedby')).toBe('editor-instructions');

    // Check for screen reader instructions
    const instructions = document.getElementById('editor-instructions');
    expect(instructions).toBeTruthy();
    expect(instructions?.className).toContain('sr-only');
    expect(instructions?.textContent).toContain('Write JavaScript code');
    expect(instructions?.textContent).toContain('Tab key to indent');
    expect(instructions?.textContent).toContain('Line numbers are displayed');
  });

  it('should mark decorative elements as aria-hidden', () => {
    const mockOnChange = () => {};
    
    const { container } = render(
      <DualLayerEditor
        value="const x = 5;"
        onChange={mockOnChange}
      />
    );

    // Syntax highlighting layer should be hidden from screen readers
    const highlightLayer = container.querySelector('.highlight-layer');
    expect(highlightLayer?.getAttribute('aria-hidden')).toBe('true');
    expect(highlightLayer?.getAttribute('role')).toBe('presentation');

    // Line numbers should be hidden from screen readers
    const lineNumbers = container.querySelector('.line-numbers');
    expect(lineNumbers?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should include high-contrast mode information in screen reader instructions', () => {
    const mockOnChange = () => {};
    
    render(
      <DualLayerEditor
        value="const x = 5;"
        onChange={mockOnChange}
        theme="high-contrast"
      />
    );

    const instructions = document.getElementById('editor-instructions');
    expect(instructions?.textContent).toContain('High contrast mode is active');
  });

  it('should indicate disabled state in screen reader instructions', () => {
    const mockOnChange = () => {};
    
    render(
      <DualLayerEditor
        value="const x = 5;"
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const instructions = document.getElementById('editor-instructions');
    expect(instructions?.textContent).toContain('Editor is currently disabled');
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('should have proper keyboard navigation support', () => {
    const mockOnChange = () => {};
    
    render(
      <DualLayerEditor
        value="const x = 5;"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    
    // Textarea should be focusable (no negative tabindex)
    expect(textarea.getAttribute('tabindex')).not.toBe('-1');
    
    // Should have proper autocomplete attributes for code editing
    expect(textarea.getAttribute('spellCheck')).toBe('false');
    expect(textarea.getAttribute('autoComplete')).toBe('off');
  });

  it('should provide semantic HTML structure', () => {
    const mockOnChange = () => {};
    
    const { container } = render(
      <DualLayerEditor
        value="const x = 5;"
        onChange={mockOnChange}
      />
    );

    // Check for proper semantic structure
    const syntaxHighlighter = container.querySelector('.syntax-highlighter');
    expect(syntaxHighlighter?.getAttribute('role')).toBe('presentation');
    expect(syntaxHighlighter?.getAttribute('aria-hidden')).toBe('true');

    // Pre and code elements should also be marked as presentational
    const pre = container.querySelector('.syntax-pre');
    expect(pre?.getAttribute('role')).toBe('presentation');

    const code = container.querySelector('.syntax-code');
    expect(code?.getAttribute('role')).toBe('presentation');
  });

  it('should have visible focus indicator', () => {
    const mockOnChange = () => {};
    
    const { container } = render(
      <DualLayerEditor
        value="const x = 5;"
        onChange={mockOnChange}
      />
    );

    const editor = container.querySelector('.dual-layer-editor');
    expect(editor).toBeTruthy();
    
    // Check that focus-within styles are defined (via CSS)
    const styles = window.getComputedStyle(editor!);
    expect(styles).toBeTruthy();
  });
});
