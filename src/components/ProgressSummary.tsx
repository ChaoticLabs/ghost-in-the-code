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
  playerName: string;
  onClose: () => void;
}

export const ProgressSummary = ({ 
  gameState, 
  playerName,
  onClose 
}: ProgressSummaryProps) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const allChallenges = getAllChallengesFlat();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const summaryElement = summaryRef.current;
    if (!summaryElement) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progress Summary - ${playerName}</title>
  <style>
    ${getSummaryStyles()}
  </style>
</head>
<body>
  ${summaryElement.innerHTML}
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghost-debugger-progress-${playerName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
    return gameState.assessmentMetrics.conceptMastery.get(concept) || 0;
  };

  return (
    <div className="summary-modal-overlay" onClick={onClose}>
      <div className="summary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="summary-actions no-print">
          <button 
            className="summary-button summary-button--print" 
            onClick={handlePrint}
            aria-label="Print summary"
          >
            🖨️ Print
          </button>
          <button 
            className="summary-button summary-button--download" 
            onClick={handleDownload}
            aria-label="Download summary"
          >
            💾 Download
          </button>
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
                  <div 
                    className="summary-progress-fill" 
                    style={{ width: `${getConceptMastery('loop')}%` }}
                  ></div>
                </div>
                <div className="summary-concept-stats">
                  <span>{getConceptMastery('loop')}% Mastery</span>
                  <span>{conceptStats.loop.completed}/{conceptStats.loop.total} Completed</span>
                </div>
              </div>

              <div className="summary-concept-card">
                <h4 className="summary-concept-name">🔀 Conditionals</h4>
                <div className="summary-progress-bar">
                  <div 
                    className="summary-progress-fill" 
                    style={{ width: `${getConceptMastery('conditional')}%` }}
                  ></div>
                </div>
                <div className="summary-concept-stats">
                  <span>{getConceptMastery('conditional')}% Mastery</span>
                  <span>{conceptStats.conditional.completed}/{conceptStats.conditional.total} Completed</span>
                </div>
              </div>

              <div className="summary-concept-card">
                <h4 className="summary-concept-name">🧩 Logic</h4>
                <div className="summary-progress-bar">
                  <div 
                    className="summary-progress-fill" 
                    style={{ width: `${getConceptMastery('logic')}%` }}
                  ></div>
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
            <div className="summary-signature">
              <div className="summary-signature-line"></div>
              <p className="summary-signature-label">Educator Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Get summary styles for standalone HTML download
 */
function getSummaryStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: white;
      padding: 20px;
    }

    .summary-container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 40px;
    }

    .summary-header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 3px solid #6B46C1;
    }

    .summary-ghost-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .summary-title {
      font-size: 36px;
      color: #6B46C1;
      margin-bottom: 8px;
      font-weight: bold;
    }

    .summary-subtitle {
      font-size: 18px;
      color: #666;
    }

    .summary-player-info {
      text-align: center;
      margin-bottom: 32px;
    }

    .summary-player-name {
      font-size: 28px;
      color: #1A1F2E;
      margin-bottom: 8px;
      font-weight: bold;
    }

    .summary-generated-date,
    .summary-last-activity {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .summary-section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }

    .summary-section-title {
      font-size: 24px;
      color: #6B46C1;
      margin-bottom: 16px;
      font-weight: bold;
      border-bottom: 2px solid #eee;
      padding-bottom: 8px;
    }

    .summary-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .summary-stat-card {
      background: #f8f9fa;
      border: 2px solid #6B46C1;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .summary-stat-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .summary-stat-value {
      font-size: 36px;
      color: #6B46C1;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .summary-stat-label {
      font-size: 14px;
      color: #1A1F2E;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .summary-stat-detail {
      font-size: 12px;
      color: #666;
      min-height: 16px;
    }

    .summary-concepts {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .summary-concept-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
    }

    .summary-concept-name {
      font-size: 18px;
      color: #1A1F2E;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .summary-progress-bar {
      width: 100%;
      height: 24px;
      background: #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .summary-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6B46C1, #A3FF00);
      transition: width 0.3s ease;
    }

    .summary-concept-stats {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #666;
    }

    .summary-learning-stats {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }

    .summary-learning-stat {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .summary-learning-stat:last-child {
      border-bottom: none;
    }

    .summary-learning-label {
      font-size: 16px;
      color: #1A1F2E;
      font-weight: 500;
    }

    .summary-learning-value {
      font-size: 16px;
      color: #6B46C1;
      font-weight: bold;
    }

    .summary-badge-category {
      margin-bottom: 24px;
    }

    .summary-badge-category-title {
      font-size: 18px;
      color: #1A1F2E;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .summary-badge-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-badge-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .summary-badge-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .summary-badge-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .summary-badge-name {
      font-size: 16px;
      color: #1A1F2E;
      font-weight: 600;
    }

    .summary-badge-description {
      font-size: 14px;
      color: #666;
    }

    .summary-badge-date {
      font-size: 14px;
      color: #666;
      flex-shrink: 0;
    }

    .summary-footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 2px solid #eee;
      text-align: center;
    }

    .summary-footer-text {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
    }

    .summary-signature {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      max-width: 300px;
      margin-left: auto;
    }

    .summary-signature-line {
      width: 100%;
      height: 2px;
      background: #1A1F2E;
      margin-bottom: 8px;
    }

    .summary-signature-label {
      font-size: 14px;
      color: #666;
    }

    @media print {
      body {
        padding: 0;
      }

      .summary-container {
        max-width: 100%;
        padding: 20px;
      }

      .summary-section {
        page-break-inside: avoid;
      }
    }
  `;
}
