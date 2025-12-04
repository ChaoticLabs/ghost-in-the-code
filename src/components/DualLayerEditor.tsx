import { useState, useRef, useEffect, useCallback } from 'react';
import { LineNumbers } from './LineNumbers';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { SyntaxHighlighterErrorBoundary } from './SyntaxHighlighterErrorBoundary';
import { useDebounce } from '../utils/useDebounce';
import './DualLayerEditor.css';

interface DualLayerEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  theme?: 'dark' | 'high-contrast';
  debounceDelay?: number;
  maxCodeLength?: number;
  performanceThreshold?: number;
}

interface EditorState {
  scrollTop: number;
  scrollLeft: number;
  cursorPosition: number;
  lineCount: number;
}

export const DualLayerEditor = ({
  value,
  onChange,
  onKeyDown,
  placeholder = '// Write your code here...',
  className = '',
  disabled = false,
  theme = 'dark',
  debounceDelay = 150,
  maxCodeLength = 50000,
  performanceThreshold = 100
}: DualLayerEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    scrollTop: 0,
    scrollLeft: 0,
    cursorPosition: 0,
    lineCount: 1
  });

  // Debounce the code value for syntax highlighting to improve performance during rapid typing
  const debouncedValue = useDebounce(value, debounceDelay);
  const [highlightingError, setHighlightingError] = useState(false);

  // Calculate line count from code
  const calculateLineCount = useCallback((code: string): number => {
    if (!code) return 1;
    const lines = code.split('\n');
    return lines.length;
  }, []);

  // Update line count when value changes
  useEffect(() => {
    const lineCount = calculateLineCount(value);
    setEditorState(prev => ({ ...prev, lineCount }));
  }, [value, calculateLineCount]);

  // Synchronize scroll between textarea and highlight layer
  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !highlightRef.current) return;

    const scrollTop = textareaRef.current.scrollTop;
    const scrollLeft = textareaRef.current.scrollLeft;

    // Update highlight layer scroll using requestAnimationFrame for smooth updates
    // Fallback to setTimeout for older browsers
    const raf = window.requestAnimationFrame || ((callback: FrameRequestCallback) => window.setTimeout(callback, 16));
    raf(() => {
      if (highlightRef.current) {
        highlightRef.current.scrollTop = scrollTop;
        highlightRef.current.scrollLeft = scrollLeft;
      }
    });

    // Update state
    setEditorState(prev => ({
      ...prev,
      scrollTop,
      scrollLeft
    }));
  }, []);

  // Handle cursor position changes
  const handleSelectionChange = useCallback(() => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    setEditorState(prev => ({
      ...prev,
      cursorPosition
    }));
  }, []);

  // Handle layout changes with ResizeObserver (with fallback for older browsers)
  useEffect(() => {
    if (!containerRef.current) return;

    // Check for ResizeObserver support
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Force scroll synchronization on resize
          if (textareaRef.current && highlightRef.current) {
            const raf = window.requestAnimationFrame || ((callback: FrameRequestCallback) => window.setTimeout(callback, 16));
            raf(() => {
              if (textareaRef.current && highlightRef.current) {
                highlightRef.current.scrollTop = textareaRef.current.scrollTop;
                highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
              }
            });
          }

          // Log resize for debugging (can be removed in production)
          if (import.meta.env.DEV) {
            const { width, height } = entry.contentRect;
            console.debug(`Editor resized: ${width}x${height}`);
          }
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback: Use MutationObserver or polling for older browsers
      console.warn('ResizeObserver not supported, using fallback resize detection');
      
      let lastWidth = containerRef.current.offsetWidth;
      let lastHeight = containerRef.current.offsetHeight;
      
      const checkResize = () => {
        if (!containerRef.current) return;
        
        const currentWidth = containerRef.current.offsetWidth;
        const currentHeight = containerRef.current.offsetHeight;
        
        if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
          lastWidth = currentWidth;
          lastHeight = currentHeight;
          
          // Force scroll synchronization
          if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
          }
        }
      };
      
      const intervalId = setInterval(checkResize, 250);
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  // Handle window resize and orientation changes
  useEffect(() => {
    const handleWindowResize = () => {
      // Force scroll synchronization on window resize
      if (textareaRef.current && highlightRef.current) {
        const raf = window.requestAnimationFrame || ((callback: FrameRequestCallback) => window.setTimeout(callback, 16));
        raf(() => {
          if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
          }
        });
      }
    };

    // Add passive event listeners for better scroll performance on mobile
    const options: AddEventListenerOptions = { passive: true };
    
    window.addEventListener('resize', handleWindowResize, options);
    
    // Handle orientation change (mobile devices)
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', handleWindowResize, options);
    }

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if ('onorientationchange' in window) {
        window.removeEventListener('orientationchange', handleWindowResize);
      }
    };
  }, []);

  // Ensure scroll synchronization on mount and when value changes
  useEffect(() => {
    if (textareaRef.current && highlightRef.current) {
      const raf = window.requestAnimationFrame || ((callback: FrameRequestCallback) => window.setTimeout(callback, 16));
      raf(() => {
        if (textareaRef.current && highlightRef.current) {
          highlightRef.current.scrollTop = textareaRef.current.scrollTop;
          highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
      });
    }
  }, [value]);

  // Handle touch events for mobile devices
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Prevent zoom on double-tap for iOS
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Add touch event listeners with passive flag for better performance
    textarea.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      textarea.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);



  return (
    <div 
      className={`dual-layer-editor ${className} ${theme === 'high-contrast' ? 'high-contrast' : ''}`}
      role="group"
      aria-label="Code editor with syntax highlighting"
    >
      <div ref={containerRef} className="editor-container">
        {/* Line numbers gutter */}
        <LineNumbers
          lineCount={editorState.lineCount}
          theme={theme}
        />

        {/* Editor content area */}
        <div className="editor-content">
          {/* Syntax highlighting layer (background) */}
          <div
            ref={highlightRef}
            className="highlight-layer"
            aria-hidden="true"
            role="presentation"
          >
            <SyntaxHighlighterErrorBoundary
              onError={(error) => {
                console.error('Syntax highlighting failed:', error);
                setHighlightingError(true);
              }}
              fallback={
                <div className="syntax-highlighter" role="presentation">
                  <pre className="syntax-pre" role="presentation">
                    <code className="syntax-code syntax-fallback" role="presentation">
                      {value || ''}
                    </code>
                  </pre>
                </div>
              }
            >
              <SyntaxHighlighter
                code={debouncedValue || ''}
                theme={theme}
                maxCodeLength={maxCodeLength}
                performanceThreshold={performanceThreshold}
              />
            </SyntaxHighlighterErrorBoundary>
          </div>

          {/* Transparent textarea layer (foreground) */}
          <textarea
            ref={textareaRef}
            className="input-layer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onScroll={handleScroll}
            onSelect={handleSelectionChange}
            onClick={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            aria-label="JavaScript code editor"
            aria-describedby="editor-instructions"
            aria-multiline="true"
            role="textbox"
            placeholder={placeholder}
          />
          
          {/* Screen reader instructions (visually hidden) */}
          <div id="editor-instructions" className="sr-only">
            Write JavaScript code to solve the challenge. Use Tab key to indent, Enter to create new lines. 
            Line numbers are displayed on the left for reference. Syntax highlighting is applied automatically to help identify code elements.
            Keywords are highlighted in purple, strings in green, numbers in cyan, and comments in gray.
            {disabled && ' Editor is currently disabled.'}
            {theme === 'high-contrast' && ' High contrast mode is active for improved visibility.'}
            {highlightingError && ' Syntax highlighting is currently unavailable, displaying plain text.'}
          </div>
        </div>
      </div>
    </div>
  );
};
