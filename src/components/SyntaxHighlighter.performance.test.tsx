import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SyntaxHighlighter } from './SyntaxHighlighter';

describe('SyntaxHighlighter - Performance and Error Handling', () => {
  describe('Memory limits', () => {
    it('should fallback to plain text for very large code blocks', () => {
      const largeCode = 'x'.repeat(60000); // Exceeds default 50KB limit
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { container } = render(
        <SyntaxHighlighter code={largeCode} maxCodeLength={50000} />
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Code length')
      );
      expect(container.querySelector('.syntax-fallback')).toBeTruthy();
      expect(container.querySelector('.fallback-mode')).toBeTruthy();

      consoleWarnSpy.mockRestore();
    });

    it('should handle normal-sized code without fallback', () => {
      const normalCode = 'const x = 42;';
      
      const { container } = render(
        <SyntaxHighlighter code={normalCode} maxCodeLength={50000} />
      );

      expect(container.querySelector('.syntax-highlighter')).toBeTruthy();
      expect(container.querySelector('.syntax-keyword')).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should handle empty code gracefully', () => {
      const { container } = render(
        <SyntaxHighlighter code="" />
      );

      expect(container.querySelector('.syntax-highlighter')).toBeTruthy();
    });
  });

  describe('Performance monitoring', () => {
    it('should accept custom performance threshold', () => {
      const code = 'const x = 42;';
      
      const { container } = render(
        <SyntaxHighlighter 
          code={code} 
          performanceThreshold={50}
        />
      );

      expect(container.querySelector('.syntax-highlighter')).toBeTruthy();
    });

    it('should accept custom max code length', () => {
      const code = 'x'.repeat(1000);
      
      const { container } = render(
        <SyntaxHighlighter 
          code={code} 
          maxCodeLength={2000}
        />
      );

      expect(container.querySelector('.syntax-highlighter')).toBeTruthy();
    });
  });

  describe('Theme support with performance features', () => {
    it('should apply high-contrast theme with fallback mode', () => {
      const largeCode = 'x'.repeat(60000);
      
      const { container } = render(
        <SyntaxHighlighter 
          code={largeCode} 
          theme="high-contrast"
          maxCodeLength={50000}
        />
      );

      expect(container.querySelector('.high-contrast')).toBeTruthy();
      expect(container.querySelector('.fallback-mode')).toBeTruthy();
    });
  });
});
