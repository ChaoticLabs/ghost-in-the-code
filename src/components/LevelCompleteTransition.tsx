/**
 * LevelCompleteTransition - Screen transition animation for level completion
 * 
 * Displays a celebration screen when a player completes all challenges in a level,
 * showing earned badges, achievements, and a button to proceed to the next level.
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { Badge } from '../engine/types';
import './LevelCompleteTransition.css';

interface LevelCompleteTransitionProps {
  isVisible: boolean;
  level: number;
  earnedBadges: Badge[];
  onNextLevel: () => void;
  onClose?: () => void;
}

export const LevelCompleteTransition = ({
  isVisible,
  level,
  earnedBadges,
  onNextLevel,
  onClose
}: LevelCompleteTransitionProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="level-complete-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background with blur effect */}
          <motion.div
            className="level-complete-backdrop"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(10px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3 }}
          />

          {/* Main content card */}
          <motion.div
            className="level-complete-card"
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 20,
              stiffness: 300,
              delay: 0.1
            }}
          >
            {/* Celebration header */}
            <motion.div
              className="celebration-header"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div
                className="celebration-emoji"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                🎉
              </motion.div>
              
              <h2 className="level-complete-title">
                Level {level} Complete!
              </h2>
              
              <motion.div
                className="celebration-emoji"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5
                }}
              >
                👻
              </motion.div>
            </motion.div>

            {/* Success message */}
            <motion.p
              className="success-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Amazing work! You've debugged all the haunted code in this level!
            </motion.p>

            {/* Earned badges section */}
            {earnedBadges.length > 0 && (
              <motion.div
                className="earned-badges-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <h3 className="badges-title">Badges Earned</h3>
                <div className="badges-grid">
                  {earnedBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      className="badge-item"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 200,
                        delay: 0.9 + index * 0.1
                      }}
                    >
                      <div className="badge-icon">
                        {badge.iconUrl ? (
                          <img src={badge.iconUrl} alt={badge.name} />
                        ) : (
                          <span className="badge-emoji">
                            {badge.concept === 'loop' ? '🔄' : 
                             badge.concept === 'conditional' ? '🔀' : '🧩'}
                          </span>
                        )}
                      </div>
                      <div className="badge-info">
                        <p className="badge-name">{badge.name}</p>
                        <p className="badge-description">{badge.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              className="level-complete-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <motion.button
                className="next-level-button"
                onClick={onNextLevel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(163, 255, 0, 0.5)',
                    '0 0 30px rgba(163, 255, 0, 0.8)',
                    '0 0 20px rgba(163, 255, 0, 0.5)',
                  ],
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }}
              >
                <span className="button-text">Next Level</span>
                <motion.span
                  className="button-arrow"
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  →
                </motion.span>
              </motion.button>

              {onClose && (
                <button
                  className="close-button"
                  onClick={onClose}
                  aria-label="Close celebration screen"
                >
                  Stay on this level
                </button>
              )}
            </motion.div>

            {/* Floating celebration particles */}
            <div className="floating-particles">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="floating-particle"
                  initial={{ 
                    x: Math.random() * 100 - 50,
                    y: 100,
                    opacity: 0 
                  }}
                  animate={{
                    y: [-20, -100],
                    x: [
                      Math.random() * 100 - 50,
                      Math.random() * 100 - 50,
                    ],
                    opacity: [0, 1, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut'
                  }}
                >
                  {['✨', '⭐', '💚', '🌟'][i % 4]}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
