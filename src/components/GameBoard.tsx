import type { ReactNode } from 'react';
import { TerminalGlow, ParticleBurst } from '../animations/SuccessAnimations';
import './GameBoard.css';

interface GameBoardProps {
  levelName: string;
  challenge: number;
  totalChallenges: number;
  completedCount: number;
  codeEditor: ReactNode;
  ghostCharacter: ReactNode;
  hintPanel: ReactNode;
  onProgressClick: () => void;
  onLevelClick?: () => void;
  onSettingsClick?: () => void;
  onBadgeClick?: () => void;
  onProgressSummaryClick?: () => void;
  onConceptsClick?: () => void;
  badgeCount?: number;
  showSuccessAnimation?: boolean;
}

export const GameBoard = ({
  levelName,
  challenge,
  totalChallenges,
  completedCount,
  codeEditor,
  ghostCharacter,
  hintPanel,
  onProgressClick,
  onLevelClick,
  onSettingsClick,
  onBadgeClick,
  onProgressSummaryClick,
  onConceptsClick,
  badgeCount = 0,
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
          <button 
            className="level-button h1-style" 
            onClick={onLevelClick}
            aria-label="Back to level selection"
            title="Back to level selection"
          >
            {levelName}
          </button>
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
        <div className="header-actions">
          {onConceptsClick && (
            <button 
              className="icon-button" 
              onClick={onConceptsClick}
              aria-label="Learn concepts"
              title="Open concept explanations in new tab"
            >
              📚
            </button>
          )}
          {onProgressSummaryClick && (
            <button 
              className="icon-button" 
              onClick={onProgressSummaryClick}
              aria-label="View progress summary"
              title="View detailed progress summary"
            >
              📊
            </button>
          )}
          {onBadgeClick && (
            <button 
              className="icon-button icon-button--badge" 
              onClick={onBadgeClick}
              aria-label="View badges"
              title="View your badges"
            >
              🏆
              {badgeCount > 0 && (
                <span className="icon-button__badge-count">{badgeCount}</span>
              )}
            </button>
          )}
          {onSettingsClick && (
            <button 
              className="icon-button icon-button--settings" 
              onClick={onSettingsClick}
              aria-label="Open settings"
            >
              ⚙️
            </button>
          )}
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
      </div>
    </div>
  );
};
