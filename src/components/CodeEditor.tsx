import { useState } from 'react';
import type { Challenge } from '../engine/types';
import { validateSolution } from '../engine/solutionValidator';
import './CodeEditor.css';

interface CodeEditorProps {
  challenge: Challenge;
  onSuccess: () => void;
  onAttempt?: (isCorrect: boolean) => void;
}

export const CodeEditor = ({ challenge, onSuccess, onAttempt }: CodeEditorProps) => {
  const [editedLines, setEditedLines] = useState<Map<number, string>>(new Map());
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLineEdit = (lineNumber: number, content: string) => {
    const newEditedLines = new Map(editedLines);
    newEditedLines.set(lineNumber, content);
    setEditedLines(newEditedLines);
    // Clear feedback when user starts editing
    if (feedback) {
      setFeedback(null);
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
      // Delay success callback to show feedback
      setTimeout(() => {
        onSuccess();
      }, 1500);
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
        <h3 className="challenge-title">{challenge.title}</h3>
        <p className="challenge-description">{challenge.description}</p>
      </div>

      <div className="code-container">
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
