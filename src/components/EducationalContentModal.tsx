/**
 * EducationalContentModal Component
 * 
 * Displays educational content when:
 * - A new challenge type is introduced
 * - A challenge is completed (shows summary)
 * 
 * Features:
 * - Age-appropriate language
 * - Skip/dismiss option
 * - Friendly ghost-themed design
 */

import { useEffect, useState } from 'react';
import type { Challenge } from '../engine/types';
import './EducationalContentModal.css';

interface EducationalContentModalProps {
  isVisible: boolean;
  challenge: Challenge | null;
  mode: 'introduction' | 'completion';
  onClose: () => void;
}

export function EducationalContentModal({
  isVisible,
  challenge,
  mode,
  onClose
}: EducationalContentModalProps) {
  const [hasSeenType, setHasSeenType] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load seen challenge types from localStorage
    const stored = localStorage.getItem('seenChallengeTypes');
    if (stored) {
      try {
        setHasSeenType(new Set(JSON.parse(stored)));
      } catch (error) {
        console.error('Failed to load seen challenge types:', error);
      }
    }
  }, []);

  const markTypeAsSeen = (type: string) => {
    const updated = new Set(hasSeenType);
    updated.add(type);
    setHasSeenType(updated);
    localStorage.setItem('seenChallengeTypes', JSON.stringify(Array.from(updated)));
  };

  const handleClose = () => {
    if (challenge && mode === 'introduction') {
      markTypeAsSeen(challenge.type);
    }
    onClose();
  };

  if (!isVisible || !challenge) {
    return null;
  }

  const getConceptTitle = (type: string): string => {
    switch (type) {
      case 'loop':
        return '🔄 Learning About Loops!';
      case 'conditional':
        return '🤔 Learning About Conditionals!';
      case 'logic':
        return '🧩 Learning About Logic!';
      default:
        return '📚 Learning Time!';
    }
  };

  const getConceptIntroduction = (type: string): string => {
    switch (type) {
      case 'loop':
        return "Loops are like doing something over and over again! Just like when you count to 10 or brush each tooth. In code, loops help us repeat actions without writing the same thing many times. Let's learn how to make loops work correctly!";
      case 'conditional':
        return "Conditionals are like making choices! Just like 'IF it's raining, THEN bring an umbrella.' In code, conditionals help the computer make decisions based on what's true or false. Let's learn how to help the computer choose wisely!";
      case 'logic':
        return "Logic puzzles are like solving mysteries! You need to think step-by-step and figure out what makes sense. In code, logic helps us solve problems by thinking carefully about each piece. Let's use our detective skills!";
      default:
        return "Let's learn something new about coding!";
    }
  };

  const title = mode === 'introduction' 
    ? challenge.title
    : '🎉 Great Job! You Did It!';

  const content = mode === 'introduction'
    ? challenge.description
    : challenge.educationalContent;
  
  // Show concept introduction only for first challenge of each type
  const showConceptIntro = mode === 'introduction' && !hasSeenType.has(challenge.type);

  return (
    <div className="educational-modal-overlay" onClick={handleClose}>
      <div className="educational-modal" onClick={(e) => e.stopPropagation()}>
        <div className="educational-modal-header">
          <h2 className="educational-modal-title">{title}</h2>
          <button
            className="educational-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="educational-modal-content">
          <div className="educational-modal-ghost">
            <span className="ghost-icon">👻</span>
          </div>
          
          {showConceptIntro && (
            <div className="educational-modal-concept-intro">
              <h3 className="concept-intro-title">{getConceptTitle(challenge.type)}</h3>
              <p className="concept-intro-text">{getConceptIntroduction(challenge.type)}</p>
            </div>
          )}
          
          {mode === 'introduction' && (
            <div className="educational-modal-challenge-intro">
              <h3 className="challenge-intro-title">Your Challenge:</h3>
              <p className="educational-modal-text">{content}</p>
            </div>
          )}

          {mode === 'completion' && (
            <>
              <p className="educational-modal-text">{content}</p>
              <div className="educational-modal-celebration">
                <span className="celebration-emoji">✨</span>
                <span className="celebration-emoji">🎊</span>
                <span className="celebration-emoji">⭐</span>
              </div>
            </>
          )}

          {mode === 'introduction' && (
            <div className="educational-modal-tip">
              <strong>💡 Tip:</strong> {challenge.tip}
            </div>
          )}
        </div>

        <div className="educational-modal-actions">
          <button
            className="educational-modal-button primary"
            onClick={handleClose}
          >
            {mode === 'introduction' ? "Let's Go!" : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
