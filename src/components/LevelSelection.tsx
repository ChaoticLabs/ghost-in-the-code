/**
 * LevelSelection component - displays available levels for the user to choose from
 * Shows after the welcome screen and before entering a level
 */

import { motion } from 'framer-motion';
import { usePreferences } from '../engine';
import { ProgressBar } from './ProgressBar';
import type { LevelType } from '../data';
import './LevelSelection.css';

interface LevelInfo {
  type: LevelType;
  title: string;
  description: string;
  icon: string;
  color: string;
  challengeCount: number;
  completedCount: number;
}

interface LevelSelectionProps {
  levels: LevelInfo[];
  onSelectLevel: (levelType: LevelType) => void;
  onProgressSummaryClick?: () => void;
  onBadgeClick?: () => void;
  onSettingsClick?: () => void;
  badgeCount?: number;
}

export const LevelSelection = ({ 
  levels, 
  onSelectLevel,
  onProgressSummaryClick,
  onBadgeClick,
  onSettingsClick,
  badgeCount = 0
}: LevelSelectionProps) => {
  const { preferences } = usePreferences();
  const reducedMotion = preferences.reducedMotion;

  const getLevelStatus = (level: LevelInfo): 'locked' | 'available' | 'completed' => {
    if (level.completedCount === level.challengeCount && level.challengeCount > 0) {
      return 'completed';
    }
    return 'available';
  };

  return (
    <div className="level-selection-container">
      {/* Animated background */}
      <div className="level-selection-background" />

      <motion.div
        className="level-selection-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.5 }}
      >
        {/* Action Buttons - Top Right */}
        <div className="level-selection-actions">
          {onProgressSummaryClick && (
            <button 
              className="icon-button"
              onClick={onProgressSummaryClick}
              aria-label="View progress summary"
              title="Progress Summary"
            >
              📊
            </button>
          )}
          {onBadgeClick && (
            <button 
              className="icon-button icon-button--badge"
              onClick={onBadgeClick}
              aria-label="View badges"
              title="View Badges"
            >
              🏆
              {badgeCount > 0 && <span className="icon-button__badge-count">{badgeCount}</span>}
            </button>
          )}
          {onSettingsClick && (
            <button 
              className="icon-button icon-button--settings"
              onClick={onSettingsClick}
              aria-label="Open settings"
              title="Settings"
            >
              ⚙️
            </button>
          )}
        </div>

        {/* Header */}
        <div className="level-selection-header">
          <motion.div
            className="level-selection-ghost"
            animate={reducedMotion ? {} : {
              y: [-5, 5, -5],
              rotate: [-3, 3, -3]
            }}
            transition={reducedMotion ? {} : {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            👻
          </motion.div>
          <h1 className="level-selection-title">Choose Your Adventure!</h1>
          <p className="level-selection-subtitle">
            Pick a coding concept to master
          </p>
        </div>

        {/* Level Cards */}
        <div className="level-cards-grid">
          {levels.map((level, index) => {
            const status = getLevelStatus(level);
            const completionPercentage = level.challengeCount > 0
              ? Math.round((level.completedCount / level.challengeCount) * 100)
              : 0;

            return (
              <motion.div
                key={level.type}
                className={`level-card level-card--${status}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: reducedMotion ? 0.15 : 0.4,
                  delay: reducedMotion ? 0 : index * 0.1
                }}
                whileHover={reducedMotion ? {} : { scale: 1.05, y: -5 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                onClick={() => onSelectLevel(level.type)}
              >
                <div className="level-card-inner" style={{ borderColor: level.color }}>
                  {/* Icon */}
                  <div className="level-card-icon" style={{ color: level.color }}>
                    {level.icon}
                  </div>

                  {/* Title */}
                  <h2 className="level-card-title">{level.title}</h2>

                  {/* Description */}
                  <p className="level-card-description">{level.description}</p>

                  {/* Progress */}
                  <div className="level-card-progress">
                    <ProgressBar
                      percentage={completionPercentage}
                      color={level.color}
                      height="small"
                    />
                    <div className="progress-text">
                      {level.completedCount} / {level.challengeCount} Completed
                    </div>
                  </div>

                  {/* Status Badge */}
                  {status === 'completed' && (
                    <div className="level-card-badge level-card-badge--completed">
                      ✓ Completed
                    </div>
                  )}

                  {/* Start Button */}
                  <button className="level-card-button" style={{ backgroundColor: level.color }}>
                    {level.completedCount > 0 && level.completedCount < level.challengeCount
                      ? `Continue (${level.completedCount + 1}/${level.challengeCount})`
                      : level.completedCount === level.challengeCount && level.challengeCount > 0
                      ? 'Replay'
                      : 'Start'} →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
