import { useMemo } from 'react';
import type { Challenge } from '../engine/types';
import { ProgressBar } from './ProgressBar';
import './ProgressTracker.css';

interface ProgressTrackerProps {
  challenges: Challenge[];
  completedChallengeIds: Set<string>;
  currentChallengeIndex: number;
  onSelectChallenge?: (index: number) => void;
  onClose: () => void;
}

interface ChallengeStatus {
  challenge: Challenge;
  index: number;
  status: 'completed' | 'current' | 'locked';
  isSelectable: boolean;
}

export const ProgressTracker = ({
  challenges,
  completedChallengeIds,
  currentChallengeIndex,
  onSelectChallenge,
  onClose
}: ProgressTrackerProps) => {
  const challengeStatuses = useMemo<ChallengeStatus[]>(() => {
    return challenges.map((challenge, index) => {
      const isCompleted = completedChallengeIds.has(challenge.id);
      const isCurrent = index === currentChallengeIndex;

      return {
        challenge,
        index,
        status: isCompleted ? 'completed' : isCurrent ? 'current' : 'locked',
        isSelectable: isCompleted || isCurrent
      };
    });
  }, [challenges, completedChallengeIds, currentChallengeIndex]);

  const completedInCurrentLevel = useMemo(() => {
    return challenges.filter(challenge => completedChallengeIds.has(challenge.id)).length;
  }, [challenges, completedChallengeIds]);

  const progressPercentage = useMemo(() => {
    if (challenges.length === 0) return 0;
    return Math.round((completedInCurrentLevel / challenges.length) * 100);
  }, [challenges.length, completedInCurrentLevel]);

  const challengesByType = useMemo(() => {
    const groups: Record<string, ChallengeStatus[]> = {};

    challengeStatuses.forEach(status => {
      const type = status.challenge.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(status);
    });

    return groups;
  }, [challengeStatuses]);

  const handleChallengeClick = (status: ChallengeStatus) => {
    if (status.isSelectable && onSelectChallenge) {
      onSelectChallenge(status.index);
      onClose();
    }
  };

  const getStatusIcon = (status: 'completed' | 'current' | 'locked') => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'current':
        return '▶';
      case 'locked':
        return '🔒';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'loop':
        return 'Loops';
      case 'conditional':
        return 'Conditionals';
      case 'logic':
        return 'Logic Puzzles';
      case 'array':
        return 'Arrays';
      case 'function':
        return 'Functions';
      case 'cybersecurity':
        return 'Cybersecurity';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="progress-modal-overlay" onClick={onClose}>
      <div className="progress-modal" onClick={(e) => e.stopPropagation()}>
        <div className="progress-tracker">
          <div className="progress-summary">
            <div className="progress-header">
              <h2 className="progress-title">Your Progress</h2>
              <button className="progress-modal-close" onClick={onClose} aria-label="Close progress tracker">
                ✕
              </button>
            </div>
            
            <div className="progress-stats">
              <span className="challenge-counter" aria-label="Challenge progress">
                Challenge {currentChallengeIndex + 1} / {challenges.length}
              </span>
              <span className="progress-percentage" aria-label="Completion percentage">
                {progressPercentage}% Complete
              </span>
            </div>

            <ProgressBar
              percentage={progressPercentage}
              label={`${completedInCurrentLevel} / ${challenges.length}`}
              showLabel={true}
              height="large"
            />
          </div>

          <div className="level-map">
            <h3 className="level-map-title">Challenge Map</h3>
            
            {Object.entries(challengesByType).map(([type, statuses]) => {
              if (statuses.length === 0) return null;

              return (
                <div key={type} className="challenge-type-group">
                  <h4 className="challenge-type-label">{getTypeLabel(type)}</h4>
                  <div className="challenge-nodes">
                    {statuses.map((status) => (
                      <button
                        key={status.challenge.id}
                        className={`challenge-node challenge-node--${status.status}`}
                        onClick={() => handleChallengeClick(status)}
                        disabled={!status.isSelectable}
                        aria-label={`${status.challenge.title} - ${status.status}`}
                        title={status.challenge.title}
                      >
                        <span className="challenge-node-icon" aria-hidden="true">
                          {getStatusIcon(status.status)}
                        </span>
                        <span className="challenge-node-number">{status.index + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="progress-legend">
            <div className="legend-item">
              <span className="legend-icon legend-icon--completed">✓</span>
              <span className="legend-label">Completed</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon legend-icon--current">▶</span>
              <span className="legend-label">Current</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon legend-icon--locked">🔒</span>
              <span className="legend-label">Locked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
