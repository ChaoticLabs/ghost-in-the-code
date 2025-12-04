import { useMemo, useState, useEffect } from 'react';
import { tokenizeJavaScript, type SyntaxToken } from '../utils/syntaxTokenizer';
import './SyntaxHighlighter.css';

export interface SyntaxHighlighterProps {
  code: string;
  theme?: 'dark' | 'high-contrast';
  className?: string;
  maxCodeLength?: number;
  performanceThreshold?: number;
}

// Constants for performance optimization
const DEFAULT_MAX_CODE_LENGTH = 50000; // 50KB of code
const DEFAULT_PERFORMANCE_THRESHOLD = 100; // 100ms

const renderToken = (token: SyntaxToken, index: number): React.ReactElement => {
  const tokenClass = `syntax-${token.type}`;
  return (
    <span key={index} className={tokenClass}>
      {token.value}
    </span>
  );
};

export const SyntaxHighlighter = ({
  code,
  theme = 'dark',
  className = '',
  maxCodeLength = DEFAULT_MAX_CODE_LENGTH,
  performanceThreshold = DEFAULT_PERFORMANCE_THRESHOLD
}: SyntaxHighlighterProps) => {
  const [useFallback, setUseFallback] = useState(false);

  // Reset fallback mode when code becomes smaller
  useEffect(() => {
    if (code.length < maxCodeLength / 2 && useFallback) {
      setUseFallback(false);
    }
  }, [code.length, maxCodeLength, useFallback]);

  const highlightedContent = useMemo(() => {
    if (!code) {
      return null;
    }

    // Memory limit check - fallback to plain text for very large code blocks
    if (code.length > maxCodeLength) {
      console.warn(`Code length (${code.length}) exceeds maximum (${maxCodeLength}). Using plain text fallback.`);
      setUseFallback(true);
      return <span className="syntax-fallback">{code}</span>;
    }

    // If we've detected performance degradation, use fallback
    if (useFallback) {
      return <span className="syntax-fallback">{code}</span>;
    }

    try {
      const startTime = performance.now();
      const tokens = tokenizeJavaScript(code);
      const tokenizeTime = performance.now() - startTime;

      // Performance monitoring
      if (tokenizeTime > performanceThreshold) {
        console.warn(`Tokenization took ${tokenizeTime.toFixed(2)}ms (threshold: ${performanceThreshold}ms)`);
      }

      const renderStartTime = performance.now();
      const result = tokens.map((token, index) => renderToken(token, index));
      const renderTime = performance.now() - renderStartTime;

      if (renderTime > performanceThreshold) {
        console.warn(`Rendering took ${renderTime.toFixed(2)}ms (threshold: ${performanceThreshold}ms)`);
      }

      return result;
    } catch (error) {
      console.error('Syntax highlighting error:', error);
      setUseFallback(true);
      return <span className="syntax-fallback">{code}</span>;
    }
  }, [code, maxCodeLength, performanceThreshold, useFallback]);

  return (
    <div 
      className={`syntax-highlighter ${theme === 'high-contrast' ? 'high-contrast' : ''} ${className} ${useFallback ? 'fallback-mode' : ''}`}
      role="presentation"
      aria-hidden="true"
      data-fallback={useFallback}
    >
      <pre className="syntax-pre" role="presentation">
        <code className="syntax-code" role="presentation">
          {highlightedContent}
        </code>
      </pre>
    </div>
  );
};
