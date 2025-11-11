import type { ReactNode } from 'react';
import './GameBoard.css';

interface GameBoardProps {
  level: number;
  challenge: number;
  totalChallenges: number;
  codeEditor: ReactNode;
  ghostCharacter: ReactNode;
  progressTracker: ReactNode;
  hintPanel: ReactNode;
}

export const GameBoard = ({
  level,
  challenge,
  totalChallenges,
  codeEditor,
  ghostCharacter,
  progressTracker,
  hintPanel
}: GameBoardProps) => {
  return (
    <div className="game-board">
      {/* Level/Challenge Display Header */}
      <header className="game-header">
        <div className="level-info">
          <span className="level-label">Level {level}</span>
          <span className="challenge-counter">
            Challenge {challenge} / {totalChallenges}
          </span>
        </div>
      </header>

      {/* Main Game Grid */}
      <div className="game-grid">
        {/* Left Column: Code Editor */}
        <section className="code-section" aria-label="Code editor">
          {codeEditor}
        </section>

        {/* Right Column: Ghost and Hints */}
        <aside className="sidebar">
          {/* Ghost Character */}
          <div className="ghost-section" aria-label="Ghost character">
            {ghostCharacter}
          </div>

          {/* Hint Panel */}
          <div className="hint-section" aria-label="Hints">
            {hintPanel}
          </div>
        </aside>

        {/* Bottom: Progress Tracker */}
        <section className="progress-section" aria-label="Progress tracker">
          {progressTracker}
        </section>
      </div>
    </div>
  );
};
