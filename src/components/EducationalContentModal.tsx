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
  onSkip?: () => void;
}

export function EducationalContentModal({
  isVisible,
  challenge,
  mode,
  onClose,
  onSkip
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

  const handleSkip = () => {
    if (challenge && mode === 'introduction') {
      markTypeAsSeen(challenge.type);
    }
    if (onSkip) {
      onSkip();
    } else {
      onClose();
    }
  };

  if (!isVisible || !challenge) {
    return null;
  }

  // Don't show introduction if already seen this type
  if (mode === 'introduction' && hasSeenType.has(challenge.type)) {
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
    ? getConceptTitle(challenge.type)
    : '🎉 Great Job! You Did It!';

  const content = mode === 'introduction'
    ? getConceptIntroduction(challenge.type)
    : challenge.educationalContent;

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
          
          <p className="educational-modal-text">{content}</p>

          {mode === 'introduction' && (
            <div className="educational-modal-tip">
              <strong>💡 Tip:</strong> Take your time and read the challenge carefully. 
              I'm here to help if you need hints!
            </div>
          )}

          {mode === 'completion' && (
            <div className="educational-modal-celebration">
              <span className="celebration-emoji">✨</span>
              <span className="celebration-emoji">🎊</span>
              <span className="celebration-emoji">⭐</span>
            </div>
          )}
        </div>

        <div className="educational-modal-actions">
          {mode === 'introduction' && (
            <button
              className="educational-modal-button secondary"
              onClick={handleSkip}
            >
              Skip Intro
            </button>
          )}
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
