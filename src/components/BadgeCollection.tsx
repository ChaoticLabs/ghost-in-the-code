/**
 * BadgeCollection component - displays earned badges with unlock animations
 */

import { useState, useEffect } from 'react';
import type { Badge } from '../engine/types';
import { BADGE_DEFINITIONS } from '../data/badges';
import { BadgeCertificate } from './BadgeCertificate';
import './BadgeCollection.css';

interface BadgeCollectionProps {
  badges: Badge[];
  onClose: () => void;
  newlyEarnedBadgeId?: string;
  playerName?: string;
  totalChallenges: number;
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

export const BadgeCollection = ({ 
  badges, 
  onClose, 
  newlyEarnedBadgeId,
  totalChallenges 
}: BadgeCollectionProps) => {
  const [animatingBadgeId, setAnimatingBadgeId] = useState<string | undefined>(newlyEarnedBadgeId);
  const [showCertificate, setShowCertificate] = useState(false);
  
  // Always get the latest player name from localStorage
  const playerName = getPlayerName();

  useEffect(() => {
    if (newlyEarnedBadgeId) {
      setAnimatingBadgeId(newlyEarnedBadgeId);
      // Clear animation after it completes
      const timer = setTimeout(() => {
        setAnimatingBadgeId(undefined);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newlyEarnedBadgeId]);

  const earnedBadgeIds = new Set(badges.map(b => b.id));

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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

  // Group badges by category
  const badgesByCategory = BADGE_DEFINITIONS.reduce((acc, def) => {
    if (!acc[def.category]) {
      acc[def.category] = [];
    }
    acc[def.category].push(def);
    return acc;
  }, {} as Record<string, typeof BADGE_DEFINITIONS>);

  return (
    <div className="badge-modal-overlay" onClick={onClose}>
      <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="badge-collection">
          <div className="badge-header">
            <h2 className="badge-title">Ghost In The Code Badges</h2>
            <button 
              className="badge-modal-close" 
              onClick={onClose}
              aria-label="Close badge collection"
            >
              ✕
            </button>
          </div>

          <div className="badge-stats">
            <span className="badge-count">
              {badges.length} / {BADGE_DEFINITIONS.length} Badges Earned
            </span>
            <span className="badge-count" style={{ marginLeft: '1rem', color: '#00D9FF' }}>
              💡 {totalChallenges} Challenges Completed
            </span>
          </div>

          <div className="badge-categories">
            {Object.entries(badgesByCategory).map(([category, definitions]) => (
              <div key={category} className="badge-category">
                <h3 className="badge-category-title">{getCategoryLabel(category)}</h3>
                <div className="badge-grid">
                  {definitions.map((def) => {
                    const earnedBadge = badges.find(b => b.id === def.id);
                    const isEarned = earnedBadgeIds.has(def.id);
                    const isAnimating = animatingBadgeId === def.id;

                    return (
                      <div
                        key={def.id}
                        className={`badge-card ${isEarned ? 'badge-card--earned' : 'badge-card--locked'} ${isAnimating ? 'badge-card--animating' : ''}`}
                        title={isEarned ? `Earned ${earnedBadge ? formatDate(earnedBadge.earnedDate) : ''}` : 'Not yet earned'}
                      >
                        <div className="badge-icon-container">
                          <div className="badge-icon">
                            {isEarned ? '🏆' : '🔒'}
                          </div>
                          {isAnimating && (
                            <div className="badge-unlock-animation">
                              <div className="badge-sparkle"></div>
                              <div className="badge-sparkle"></div>
                              <div className="badge-sparkle"></div>
                            </div>
                          )}
                        </div>
                        <div className="badge-info">
                          <h4 className="badge-name">{def.name}</h4>
                          <p className="badge-description">{def.description}</p>
                          {earnedBadge && (
                            <span className="badge-date">
                              {formatDate(earnedBadge.earnedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="badge-actions">
          {badges.length > 0 && (
            <>
              <button 
                className="badge-action-button badge-action-button--primary" 
                onClick={() => setShowCertificate(true)}
              >
                📜 View Certificate
              </button>
            </>
          )}
          <button className="badge-action-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {showCertificate && (
        <BadgeCertificate
          playerName={playerName}
          badges={badges}
          totalChallenges={totalChallenges}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};
