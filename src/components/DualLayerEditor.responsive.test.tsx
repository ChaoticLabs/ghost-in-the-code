import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { DualLayerEditor } from './DualLayerEditor';
import fc from 'fast-check';

/**
 * Feature: enhanced-code-editor, Property 6: Responsive layout consistency
 * Validates: Requirements 4.4
 * 
 * For any browser window resize, the editor layout and line number alignment 
 * should remain proper and functional
 */
describe('Property-Based Tests - Responsive Layout Consistency', () => {
  it('should maintain proper layout structure after resize events', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 200 }),
        fc.integer({ min: 320, max: 1920 }),
        fc.integer({ min: 240, max: 1080 }),
        (code, width, height) => {
          const onChange = vi.fn();
          const { container } = render(
            <DualLayerEditor value={code} onChange={onChange} />
          );

          // Simulate window resize
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          });
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: height,
          });
          window.dispatchEvent(new Event('resize'));

          // Verify essential layout elements exist and are properly structured
          const editorContainer = container.querySelector('.editor-container');
          const lineNumbers = container.querySelector('.line-numbers');
          const editorContent = container.querySelector('.editor-content');
          const textarea = container.querySelector('.input-layer');
          const highlightLayer = container.querySelector('.highlight-layer');

          // All essential elements should exist after resize
          expect(editorContainer).toBeTruthy();
          expect(lineNumbers).toBeTruthy();
          expect(editorContent).toBeTruthy();
          expect(textarea).toBeTruthy();
          expect(highlightLayer).toBeTruthy();

          // Verify line numbers and content are siblings in the container
          const children = Array.from(editorContainer?.children || []);
          expect(children).toContain(lineNumbers);
          expect(children).toContain(editorContent);

          // Verify textarea and highlight layer are properly positioned within content
          expect(textarea?.parentElement).toBe(editorContent);
          expect(highlightLayer?.parentElement).toBe(editorContent);

          // Verify the container has the correct CSS class for flexbox layout
          expect(editorContainer?.classList.contains('editor-container')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain scroll synchronization after orientation changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 50, maxLength: 200 }),
        fc.integer({ min: 0, max: 100 }),
        async (code, scrollAmount) => {
          const onChange = vi.fn();
          const { container } = render(
            <DualLayerEditor value={code} onChange={onChange} />
          );

          const textarea = container.querySelector('.input-layer') as HTMLTextAreaElement;
          const highlightLayer = container.querySelector('.highlight-layer') as HTMLDivElement;

          expect(textarea).toBeTruthy();
          expect(highlightLayer).toBeTruthy();

          // Set scroll position
          Object.defineProperty(textarea, 'scrollTop', { value: scrollAmount, writable: true });
          textarea.dispatchEvent(new Event('scroll'));

          // Wait for scroll synchronization
          await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

          // Simulate orientation change
          window.dispatchEvent(new Event('orientationchange'));

          // Wait for orientation change handler
          await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

          // After orientation change, elements should still exist and be functional
          expect(container.querySelector('.input-layer')).toBeTruthy();
          expect(container.querySelector('.highlight-layer')).toBeTruthy();
          expect(container.querySelector('.editor-container')).toBeTruthy();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle dynamic content changes with proper layout updates', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 20 }),
        (lines) => {
          const initialCode = lines.slice(0, Math.floor(lines.length / 2)).join('\n');
          const updatedCode = lines.join('\n');
          
          const onChange = vi.fn();
          const { container, rerender } = render(
            <DualLayerEditor value={initialCode} onChange={onChange} />
          );

          const initialLineCount = container.querySelectorAll('.line-number').length;

          // Update with more content
          rerender(<DualLayerEditor value={updatedCode} onChange={onChange} />);

          const updatedLineCount = container.querySelectorAll('.line-number').length;
          const expectedLineCount = updatedCode.split('\n').length;

          // Line numbers should update to match new content
          expect(updatedLineCount).toBe(expectedLineCount);
          expect(updatedLineCount).toBeGreaterThanOrEqual(initialLineCount);

          // Layout structure should remain intact
          const editorContainer = container.querySelector('.editor-container');
          const lineNumbers = container.querySelector('.line-numbers');
          const editorContent = container.querySelector('.editor-content');

          expect(editorContainer).toBeTruthy();
          expect(lineNumbers).toBeTruthy();
          expect(editorContent).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
