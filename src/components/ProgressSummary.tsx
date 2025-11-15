/**
 * ProgressSummary component - generates comprehensive progress summary document
 * Includes badges, challenges completed, time spent, and all statistics
 * Provides printable HTML and downloadable format
 */

import { useRef } from 'react';
import type { GameState, Badge } from '../engine/types';
import { BADGE_DEFINITIONS } from '../data/badges';
import { getAllChallengesFlat } from '../data';
import './ProgressSummary.css';

interface ProgressSummaryProps {
  gameState: GameState;
  playerName?: string;
  onClose: () => void;
}

/**
 * Get player name from localStorage
 */
function getPlayerName(): string {
  try {
    const saved = localStorage.getItem('ghost-in-the-code-save');
    if (saved) {
      const data = JSON.parse(saved);
      return data.playerName || 'Ghost Debugger';
    }
  } catch (error) {
    console.error('Failed to get player name:', error);
  }
  return 'Ghost Debugger';
}

export const ProgressSummary = ({ 
  gameState, 
  onClose 
}: ProgressSummaryProps) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const allChallenges = getAllChallengesFlat();
  
  // Always get the latest player name from localStorage
  const playerName = getPlayerName();



  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate statistics
  const totalChallenges = allChallenges.length;
  const completedChallenges = gameState.completedChallenges.size;
  const completionPercentage = totalChallenges > 0 
    ? Math.round((completedChallenges / totalChallenges) * 100) 
    : 0;

  // Calculate concept-specific statistics
  const conceptStats = {
    loop: { completed: 0, total: 0 },
    conditional: { completed: 0, total: 0 },
    logic: { completed: 0, total: 0 }
  };

  allChallenges.forEach(challenge => {
    conceptStats[challenge.type].total++;
    if (gameState.completedChallenges.has(challenge.id)) {
      conceptStats[challenge.type].completed++;
    }
  });

  // Calculate hints statistics
  const totalHintsUsed = Array.from(gameState.hintsUsed.values())
    .reduce((sum, count) => sum + count, 0);
  const averageHintsPerChallenge = completedChallenges > 0
    ? (totalHintsUsed / completedChallenges).toFixed(1)
    : '0.0';

  // Format time spent
  const hours = Math.floor(gameState.assessmentMetrics.timeSpentMinutes / 60);
  const minutes = Math.round(gameState.assessmentMetrics.timeSpentMinutes % 60);
  const timeSpentFormatted = hours > 0 
    ? `${hours}h ${minutes}m` 
    : `${minutes}m`;

  // Group badges by category
  const badgesByCategory = gameState.badges.reduce((acc, badge) => {
    const def = BADGE_DEFINITIONS.find(d => d.id === badge.id);
    const category = def?.category || 'special';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'concept':
        return 'Concept Mastery';
      case 'achievement':
        return 'Achievement';
      case 'special':
        return 'Special';
      default:
        return category;
    }
  };

  const getConceptMastery = (concept: string): number => {
    const mastery = gameState.assessmentMetrics.conceptMastery.get(concept);
    
    // If no mastery data exists but challenges are completed, calculate based on completion
    if (mastery === undefined || mastery === 0) {
      const stats = conceptStats[concept as keyof typeof conceptStats];
      if (stats && stats.completed > 0) {
        // Return completion percentage as a fallback
        return Math.round((stats.completed / stats.total) * 100);
      }
    }
    
    return mastery || 0;
  };

  return (
    <div className="summary-modal-overlay" onClick={onClose}>
      <div className="summary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="summary-actions">
          <button 
            className="summary-button summary-button--close" 
            onClick={onClose}
            aria-label="Close summary"
          >
            ✕ Close
          </button>
        </div>

        <div ref={summaryRef} className="summary-container">
          {/* Header */}
          <div className="summary-header">
            <div className="summary-ghost-icon">👻</div>
            <h1 className="summary-title">Progress Summary</h1>
            <p className="summary-subtitle">Ghost in The Code</p>
          </div>

          {/* Player Info */}
          <div className="summary-player-info">
            <h2 className="summary-player-name">{playerName}</h2>
            <p className="summary-generated-date">Generated: {currentDate}</p>
            {gameState.assessmentMetrics.lastActivity && (
              <p className="summary-last-activity">
                Last Activity: {formatDate(gameState.assessmentMetrics.lastActivity)}
              </p>
            )}
          </div>

          {/* Overall Statistics */}
          <div className="summary-section">
            <h3 className="summary-section-title">Overall Progress</h3>
            <div className="summary-stats-grid">
              <div className="summary-stat-card">
                <div className="summary-stat-icon">✅</div>
                <div className="summary-stat-value">{completedChallenges}</div>
                <div className="summary-stat-label">Challenges Completed</div>
                <div className="summary-stat-detail">out of {totalChallenges} total</div>
              </div>
              
              <div className="summary-stat-card">
                <div className="summary-stat-icon">📊</div>
                <div className="summary-stat-value">{completionPercentage}%</div>
                <div className="summary-stat-label">Completion Rate</div>
                <div className="summary-stat-detail">&nbsp;</div>
              </div>
              
              <div className="summary-stat-card">
                <div className="summary-stat-icon">🏆</div>
                <div className="summary-stat-value">{gameState.badges.length}</div>
                <div className="summary-stat-label">Badges Earned</div>
                <div className="summary-stat-detail">out of {BADGE_DEFINITIONS.length} total</div>
              </div>
              
              <div className="summary-stat-card">
                <div className="summary-stat-icon">⏱️</div>
                <div className="summary-stat-value">{timeSpentFormatted}</div>
                <div className="summary-stat-label">Time Spent</div>
                <div className="summary-stat-detail">&nbsp;</div>
              </div>
            </div>
          </div>

          {/* Concept Mastery */}
          <div className="summary-section">
            <h3 className="summary-section-title">Concept Mastery</h3>
            <div className="summary-concepts">
              <div className="summary-concept-card">
                <h4 className="summary-concept-name">🔁 Loops</h4>
                <div className="summary-progress-bar">
                  {getConceptMastery('loop') > 0 && (
                    <div 
                      className="summary-progress-fill" 
                      style={{ width: `${getConceptMastery('loop')}%` }}
                    ></div>
                  )}
                </div>
                <div className="summary-concept-stats">
                  <span>{getConceptMastery('loop')}% Mastery</span>
                  <span>{conceptStats.loop.completed}/{conceptStats.loop.total} Completed</span>
                </div>
              </div>

              <div className="summary-concept-card">
                <h4 className="summary-concept-name">🔀 Conditionals</h4>
                <div className="summary-progress-bar">
                  {getConceptMastery('conditional') > 0 && (
                    <div 
                      className="summary-progress-fill" 
                      style={{ width: `${getConceptMastery('conditional')}%` }}
                    ></div>
                  )}
                </div>
                <div className="summary-concept-stats">
                  <span>{getConceptMastery('conditional')}% Mastery</span>
                  <span>{conceptStats.conditional.completed}/{conceptStats.conditional.total} Completed</span>
                </div>
              </div>

              <div className="summary-concept-card">
                <h4 className="summary-concept-name">🧩 Logic</h4>
                <div className="summary-progress-bar">
                  {getConceptMastery('logic') > 0 && (
                    <div 
                      className="summary-progress-fill" 
                      style={{ width: `${getConceptMastery('logic')}%` }}
                    ></div>
                  )}
                </div>
                <div className="summary-concept-stats">
                  <span>{getConceptMastery('logic')}% Mastery</span>
                  <span>{conceptStats.logic.completed}/{conceptStats.logic.total} Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Statistics */}
          <div className="summary-section">
            <h3 className="summary-section-title">Learning Statistics</h3>
            <div className="summary-learning-stats">
              <div className="summary-learning-stat">
                <span className="summary-learning-label">Total Hints Used:</span>
                <span className="summary-learning-value">{totalHintsUsed}</span>
              </div>
              <div className="summary-learning-stat">
                <span className="summary-learning-label">Average Hints per Challenge:</span>
                <span className="summary-learning-value">{averageHintsPerChallenge}</span>
              </div>
              <div className="summary-learning-stat">
                <span className="summary-learning-label">Current Score:</span>
                <span className="summary-learning-value">{gameState.score}</span>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          {gameState.badges.length > 0 && (
            <div className="summary-section">
              <h3 className="summary-section-title">Earned Badges</h3>
              {Object.entries(badgesByCategory).map(([category, badges]) => (
                <div key={category} className="summary-badge-category">
                  <h4 className="summary-badge-category-title">{getCategoryLabel(category)}</h4>
                  <div className="summary-badge-list">
                    {badges.map(badge => (
                      <div key={badge.id} className="summary-badge-item">
                        <span className="summary-badge-icon">🏆</span>
                        <div className="summary-badge-info">
                          <span className="summary-badge-name">{badge.name}</span>
                          <span className="summary-badge-description">{badge.description}</span>
                        </div>
                        <span className="summary-badge-date">{formatDate(badge.earnedDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="summary-footer">
            <p className="summary-footer-text">
              Keep up the great work debugging haunted code! 👻
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
