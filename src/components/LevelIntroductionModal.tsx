/**
 * LevelIntroductionModal - Shows educational content at the start of each level
 */

import type { LevelIntroduction } from '../engine/types';
import './LevelIntroductionModal.css';

interface LevelIntroductionModalProps {
  isVisible: boolean;
  introduction: LevelIntroduction | null;
  onClose: () => void;
}

export function LevelIntroductionModal({
  isVisible,
  introduction,
  onClose
}: LevelIntroductionModalProps) {
  if (!isVisible || !introduction) {
    return null;
  }

  return (
    <div className="level-intro-modal-overlay" onClick={onClose}>
      <div className="level-intro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="level-intro-content">
          <div className="level-intro-header">
            <h2 className="level-intro-title">{introduction.title}</h2>
            <button
              className="level-intro-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="level-intro-ghost">
            <span className="ghost-icon">👻</span>
          </div>

          <p className="level-intro-description">{introduction.description}</p>

          <div className="level-intro-concepts">
            <h3 className="concepts-title">What You'll Learn:</h3>
            {introduction.concepts.map((concept, index) => (
              <div key={index} className="concept-card">
                <h4 className="concept-name">{concept.name}</h4>
                <p className="concept-explanation">{concept.explanation}</p>
              </div>
            ))}
          </div>

          <p className="level-intro-ready">{introduction.readyMessage}</p>
        </div>

        <div className="level-intro-actions">
          <button
            className="level-intro-button"
            onClick={onClose}
          >
            Start Level!
          </button>
        </div>
      </div>
    </div>
  );
}
