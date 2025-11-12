import { useState, useEffect } from 'react';
import { useGame } from '../engine';
import { gameActions } from '../engine/gameActions';
import type { Challenge } from '../engine/types';
import './HintPanel.css';

interface HintPanelProps {
  challenge: Challenge;
  onHintDisplayed?: (hint: string) => void;
}

const MAX_HINTS = 3;

export const HintPanel = ({ challenge, onHintDisplayed }: HintPanelProps) => {
  const { state, dispatch } = useGame();
  const [displayedHints, setDisplayedHints] = useState<string[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  // Get hints used for current challenge from game state
  const hintsUsedForChallenge = state.hintsUsed.get(challenge.id) || 0;

  // Load displayed hints from game state when challenge changes or on mount
  useEffect(() => {
    // Restore hints that were previously displayed based on game state
    const hintsToShow = Math.min(hintsUsedForChallenge, challenge.hints.length);
    const restoredHints = challenge.hints.slice(0, hintsToShow);
    setDisplayedHints(restoredHints);
    setCurrentHintIndex(hintsToShow);
  }, [challenge.id, hintsUsedForChallenge, challenge.hints]);

  const handleGetHint = () => {
    if (currentHintIndex >= challenge.hints.length || hintsUsedForChallenge >= MAX_HINTS) {
      return;
    }

    const nextHint = challenge.hints[currentHintIndex];
    
    // Add hint to displayed list
    setDisplayedHints(prev => [...prev, nextHint]);
    setCurrentHintIndex(prev => prev + 1);

    // Update game state
    dispatch(gameActions.useHint(challenge.id));

    // Notify parent component (for ghost speech bubble)
    if (onHintDisplayed) {
      onHintDisplayed(nextHint);
    }
  };

  const isHintButtonDisabled = 
    hintsUsedForChallenge >= MAX_HINTS || 
    currentHintIndex >= challenge.hints.length;

  const remainingHints = Math.min(
    MAX_HINTS - hintsUsedForChallenge,
    challenge.hints.length - currentHintIndex
  );

  return (
    <div className="hint-panel">
      <div className="hint-panel-header">
        <h3>Need Help?</h3>
        <div className="hint-counter" aria-live="polite">
          {hintsUsedForChallenge} / {MAX_HINTS} hints used
        </div>
      </div>

      <button
        className="hint-button"
        onClick={handleGetHint}
        disabled={isHintButtonDisabled}
        aria-label={`Get hint. ${remainingHints} hints remaining`}
      >
        {isHintButtonDisabled ? '💡 No More Hints' : `💡 Get Hint (${remainingHints} left)`}
      </button>

      {displayedHints.length > 0 && (
        <div className="hints-list" role="region" aria-label="Displayed hints">
          {displayedHints.map((hint, index) => (
            <div key={index} className="hint-item">
              <div className="hint-number">Hint {index + 1}</div>
              <div className="hint-text">{hint}</div>
            </div>
          ))}
        </div>
      )}

      {hintsUsedForChallenge >= MAX_HINTS && (
        <div className="hint-limit-message" role="status">
          You've used all your hints for this challenge. You can do it! 🎃
        </div>
      )}
    </div>
  );
};
