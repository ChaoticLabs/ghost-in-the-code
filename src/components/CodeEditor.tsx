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
  const [editedLines, setEditedLines] = useState<Map<number, string>>(new Map());
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when challenge changes
  useEffect(() => {
    setEditedLines(new Map());
    setFeedback(null);
    setIsSubmitting(false);
  }, [challenge.id]);

  const handleLineEdit = (lineNumber: number, content: string) => {
    const newEditedLines = new Map(editedLines);
    newEditedLines.set(lineNumber, content);
    setEditedLines(newEditedLines);
    // Clear feedback when user starts editing
    if (feedback) {
      setFeedback(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, lineNumber: number) => {
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
      handleLineEdit(lineNumber, newContent);
      
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
      
      handleLineEdit(lineNumber, newContent);
      
      // Set cursor position after the tab
      setTimeout(() => {
        textarea.setSelectionRange(cursorPosition + 2, cursorPosition + 2);
      }, 0);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Get the edited content for the buggy line
    const buggyLineNumber = challenge.solution.lineNumber;
    const editedContent = editedLines.get(buggyLineNumber);
    
    if (!editedContent) {
      setFeedback({
        message: "You haven't made any changes yet! Try editing the buggy line.",
        isCorrect: false
      });
      setIsSubmitting(false);
      return;
    }

    // Validate the solution
    const result = validateSolution(editedContent, challenge.solution);
    
    setFeedback({
      message: result.detailedFeedback || result.feedback,
      isCorrect: result.isCorrect
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

  const getLineContent = (lineNumber: number, originalContent: string): string => {
    return editedLines.get(lineNumber) ?? originalContent;
  };

  // Simple syntax highlighting using regex patterns
  const highlightSyntax = (code: string) => {
    // Keywords
    const keywords = /\b(let|const|var|if|else|for|while|function|return|console|log)\b/g;
    // Strings
    const strings = /(['"`])(.*?)\1/g;
    // Numbers
    const numbers = /\b(\d+)\b/g;
    // Comments
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
    
    let highlighted = code;
    
    // Apply highlighting (order matters)
    highlighted = highlighted.replace(comments, '<span class="syntax-comment">$1</span>');
    highlighted = highlighted.replace(strings, '<span class="syntax-string">$1$2$1</span>');
    highlighted = highlighted.replace(keywords, '<span class="syntax-keyword">$1</span>');
    highlighted = highlighted.replace(numbers, '<span class="syntax-number">$1</span>');
    
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <h2 className="challenge-title">{challenge.title}</h2>
        <p className="challenge-description">{challenge.description}</p>
      </div>

      <div className="code-container" style={{ position: 'relative' }}>
        {/* Code Heal Animation - just for the fixed line */}
        <CodeHeal 
          lineNumber={challenge.solution.lineNumber}
          isActive={showSuccessAnimation}
        />
        {challenge.codeFragment.lines.map((line) => {
          const isEditable = line.isEditable;
          const isBuggy = line.isBuggy;
          const lineContent = getLineContent(line.lineNumber, line.content);

          return (
            <div
              key={line.lineNumber}
              className={`code-line ${isBuggy ? 'buggy-line' : ''} ${isEditable ? 'editable-line' : ''}`}
            >
              <span className="line-number">{line.lineNumber}</span>
              {isEditable ? (
                <textarea
                  className="code-input"
                  value={lineContent}
                  onChange={(e) => handleLineEdit(line.lineNumber, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, line.lineNumber)}
                  rows={lineContent.split('\n').length}
                  spellCheck={false}
                  aria-label={`Edit line ${line.lineNumber}`}
                />
              ) : (
                <pre className="code-content">
                  <code>{highlightSyntax(line.content)}</code>
                </pre>
              )}
            </div>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback ${feedback.isCorrect ? 'feedback-success' : 'feedback-error'}`} role="alert">
          {feedback.message}
        </div>
      )}

      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={isSubmitting || (feedback?.isCorrect ?? false)}
        aria-label="Submit solution"
      >
        {isSubmitting ? 'Checking...' : feedback?.isCorrect ? 'Fixed! ✓' : 'Submit Solution'}
      </button>
    </div>
  );
};
