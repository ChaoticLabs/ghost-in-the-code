import type { ReactNode } from 'react';
import { TerminalGlow, ParticleBurst } from '../animations/SuccessAnimations';
import './GameBoard.css';

interface GameBoardProps {
  level: number;
  challenge: number;
  totalChallenges: number;
  completedCount: number;
  codeEditor: ReactNode;
  ghostCharacter: ReactNode;
  hintPanel: ReactNode;
  onProgressClick: () => void;
  onSettingsClick?: () => void;
  showSuccessAnimation?: boolean;
}

export const GameBoard = ({
  level,
  challenge,
  totalChallenges,
  completedCount,
  codeEditor,
  ghostCharacter,
  hintPanel,
  onProgressClick,
  onSettingsClick,
  showSuccessAnimation = false
}: GameBoardProps) => {
  const progressPercentage = totalChallenges > 0 
    ? Math.round((completedCount / totalChallenges) * 100) 
    : 0;

  return (
    <div className="game-board" style={{ position: 'relative' }}>
      {/* Success Animations Overlay - covers entire game board */}
      <TerminalGlow isActive={showSuccessAnimation} />
      <ParticleBurst isActive={showSuccessAnimation} centerX={50} centerY={40} particleCount={20} />
      {/* Level/Challenge Display Header */}
      <header className="game-header">
        <div className="level-info">
          <span className="level-label">Level {level}</span>
          <button 
            className="progress-button" 
            onClick={onProgressClick}
            aria-label="View progress tracker"
          >
            <span className="progress-button-text">
              Challenge {challenge} / {totalChallenges}
            </span>
            <span className="progress-button-percentage">
              {progressPercentage}%
            </span>
          </button>
        </div>
        {onSettingsClick && (
          <button 
            className="settings-button" 
            onClick={onSettingsClick}
            aria-label="Open settings"
          >
            ⚙️
          </button>
        )}
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
      </div>
    </div>
  );
};
