import { useState, useEffect } from 'react';
import type { Challenge } from '../engine/types';
import { validateSolution } from '../engine/solutionValidator';
import { CodeHeal } from '../animations/SuccessAnimations';
import './CodeEditor.css';

interface CodeEditorProps {
  challenge: Challenge;
  onSuccess: () => void;
  onAttempt?: (isCorrect: boolean) => void;
  showSuccessAnimation?: boolean;
}

export const CodeEditor = ({ challenge, onSuccess, onAttempt, showSuccessAnimation = false }: CodeEditorProps) => {
  const [code, setCode] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean; output?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when challenge changes
  useEffect(() => {
    setCode(challenge.codeFragment.initialCode);
    setFeedback(null);
    setIsSubmitting(false);
  }, [challenge.id]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    // Clear feedback when user starts editing
    if (feedback) {
      setFeedback(null);
    }
  };

  const handleReset = () => {
    setCode(challenge.codeFragment.initialCode);
    setFeedback(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const currentContent = textarea.value;
      
      // Get the current line up to cursor
      const beforeCursor = currentContent.substring(0, cursorPosition);
      const afterCursor = currentContent.substring(cursorPosition);
      
      // Calculate indentation from the current line
      const currentLineStart = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = beforeCursor.substring(currentLineStart);
      const indentMatch = currentLine.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      
      // Check if we need to increase indentation
      const trimmedLine = currentLine.trim();
      let additionalIndent = '';
      
      // Add extra indent after opening braces, parentheses, or brackets
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[')) {
        additionalIndent = '  '; // 2 spaces
      }
      
      // Build the new content with proper indentation
      const newIndent = currentIndent + additionalIndent;
      const newContent = beforeCursor + '\n' + newIndent + afterCursor;
      
      // Update the content
      handleCodeChange(newContent);
      
      // Set cursor position after the indentation on the next frame
      setTimeout(() => {
        const newCursorPosition = cursorPosition + 1 + newIndent.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const currentContent = textarea.value;
      
      // Insert 2 spaces for tab
      const beforeCursor = currentContent.substring(0, cursorPosition);
      const afterCursor = currentContent.substring(cursorPosition);
      const newContent = beforeCursor + '  ' + afterCursor;
      
      handleCodeChange(newContent);
      
      // Set cursor position after the tab
      setTimeout(() => {
        textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
      }, 0);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Validate the solution by running the code with enhanced anti-cheating
    const result = validateSolution(code, challenge.solution, undefined, challenge.id);
    
    setFeedback({
      message: result.detailedFeedback || result.feedback,
      isCorrect: result.isCorrect,
      output: result.output
    });

    // Notify parent component
    if (onAttempt) {
      onAttempt(result.isCorrect);
    }

    if (result.isCorrect) {
      // Notify parent immediately - parent will handle animation timing
      onSuccess();
    }

    setIsSubmitting(false);
  };

  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <h2 className="challenge-title">{challenge.title}</h2>
        <p className="challenge-description text-white text-base leading-normal text-left">{challenge.description}</p>
        <div className="challenge-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-label">Tip:</span>
          <span className="tip-text text-white">{challenge.tip}</span>
        </div>
      </div>

      <div className="code-container" style={{ position: 'relative' }}>
        {/* Code Heal Animation */}
        <CodeHeal 
          lineNumber={1}
          isActive={showSuccessAnimation}
        />
        
        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          aria-label="Code editor"
          placeholder="Write your code here..."
        />
      </div>

      {feedback && (
        <div className={`feedback ${feedback.isCorrect ? 'feedback-success' : 'feedback-error'}`} role="alert">
          <div className="feedback-message">{feedback.message}</div>
          {feedback.output && (
            <div className="feedback-output">
              <strong>Output:</strong> {feedback.output}
            </div>
          )}
        </div>
      )}

      <div className="code-editor-actions">
        <button
          className="reset-button"
          onClick={handleReset}
          disabled={isSubmitting}
          aria-label="Reset code"
        >
          Reset
        </button>
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting || (feedback?.isCorrect ?? false)}
          aria-label="Run code"
        >
          {isSubmitting ? 'Running...' : feedback?.isCorrect ? 'Fixed! ✓' : 'Run Code'}
        </button>
      </div>
      
      <div className="code-safety-info">
        🛡️ Code runs in a safe sandbox with protection against infinite loops
      </div>
    </div>
  );
};
