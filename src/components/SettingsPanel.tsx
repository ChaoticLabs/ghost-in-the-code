/**
 * SettingsPanel - User preferences and accessibility settings
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferences, useGame } from '../engine';
import { gameActions } from '../engine/gameActions';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SettingsPanel = ({ isVisible, onClose }: SettingsPanelProps) => {
  const { preferences, updatePreference, resetPreferences } = usePreferences();
  const { dispatch } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    updatePreference(key, !preferences[key]);
  };

  const handleFontSizeChange = (size: 'medium' | 'large' | 'xlarge') => {
    updatePreference('fontSize', size);
  };

  const handleVolumeChange = (volume: number) => {
    updatePreference('volume', volume);
  };

  const handleResetGame = () => {
    dispatch(gameActions.resetGame());
    setShowResetConfirm(false);
    onClose();
    // Reload the page to reset to first challenge
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="settings-panel"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-header">
              <h2 className="settings-title">Settings</h2>
              <button
                className="settings-close-button"
                onClick={onClose}
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            <div className="settings-content">
              {/* Accessibility Section */}
              <section className="settings-section">
                <h3 className="settings-section-title">Accessibility</h3>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="reduced-motion" className="setting-label">
                      Reduced Motion
                    </label>
                    <p className="setting-description">
                      Replace animations with simple fades
                    </p>
                  </div>
                  <button
                    id="reduced-motion"
                    className={`toggle-button ${preferences.reducedMotion ? 'active' : ''}`}
                    onClick={() => handleToggle('reducedMotion')}
                    role="switch"
                    aria-checked={preferences.reducedMotion}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="high-contrast" className="setting-label">
                      High Contrast Mode
                    </label>
                    <p className="setting-description">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <button
                    id="high-contrast"
                    className={`toggle-button ${preferences.highContrastMode ? 'active' : ''}`}
                    onClick={() => handleToggle('highContrastMode')}
                    role="switch"
                    aria-checked={preferences.highContrastMode}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label className="setting-label">Font Size</label>
                    <p className="setting-description">
                      Adjust text size for readability
                    </p>
                  </div>
                  <div className="font-size-buttons">
                    <button
                      className={`font-size-button ${preferences.fontSize === 'medium' ? 'active' : ''}`}
                      onClick={() => handleFontSizeChange('medium')}
                      aria-label="Medium font size"
                    >
                      A
                    </button>
                    <button
                      className={`font-size-button ${preferences.fontSize === 'large' ? 'active' : ''}`}
                      onClick={() => handleFontSizeChange('large')}
                      aria-label="Large font size"
                      style={{ fontSize: '1.125rem' }}
                    >
                      A
                    </button>
                    <button
                      className={`font-size-button ${preferences.fontSize === 'xlarge' ? 'active' : ''}`}
                      onClick={() => handleFontSizeChange('xlarge')}
                      aria-label="Extra large font size"
                      style={{ fontSize: '1.25rem' }}
                    >
                      A
                    </button>
                  </div>
                </div>
              </section>

              {/* Audio Section */}
              <section className="settings-section">
                <h3 className="settings-section-title">Audio</h3>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="voice-enabled" className="setting-label">
                      Ghost Voice
                    </label>
                    <p className="setting-description">
                      Enable voice narration
                    </p>
                  </div>
                  <button
                    id="voice-enabled"
                    className={`toggle-button ${preferences.voiceEnabled ? 'active' : ''}`}
                    onClick={() => handleToggle('voiceEnabled')}
                    role="switch"
                    aria-checked={preferences.voiceEnabled}
                  >
                    <span className="toggle-slider" />
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <label htmlFor="volume" className="setting-label">
                      Volume
                    </label>
                    <p className="setting-description">
                      {preferences.volume}%
                    </p>
                  </div>
                  <input
                    id="volume"
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="volume-slider"
                    disabled={!preferences.voiceEnabled}
                  />
                </div>
              </section>

              {/* Reset Buttons */}
              <div className="settings-actions">
                <button
                  className="reset-button"
                  onClick={resetPreferences}
                >
                  Reset Settings
                </button>
              </div>

              {/* Danger Zone - Reset Game */}
              <section className="settings-section danger-zone">
                <h3 className="settings-section-title danger-title">Danger Zone</h3>
                <div className="danger-zone-content">
                  <div className="setting-info">
                    <p className="setting-label">Reset Game Progress</p>
                    <p className="setting-description">
                      This will clear all your progress, completed challenges, hints used, and badges. You'll start from the beginning.
                    </p>
                  </div>
                  {!showResetConfirm ? (
                    <button
                      className="reset-game-button"
                      onClick={() => setShowResetConfirm(true)}
                    >
                      Reset Game
                    </button>
                  ) : (
                    <div className="reset-confirm">
                      <p className="reset-confirm-text">Are you sure?</p>
                      <div className="reset-confirm-buttons">
                        <button
                          className="reset-confirm-yes"
                          onClick={handleResetGame}
                        >
                          Yes, Reset
                        </button>
                        <button
                          className="reset-confirm-no"
                          onClick={() => setShowResetConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
