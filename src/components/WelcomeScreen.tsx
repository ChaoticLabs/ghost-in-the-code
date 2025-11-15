import { useState } from 'react';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStart: (playerName: string) => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        {/* Game Title */}
        <h1 className="game-title">
          Ghost in The Code
        </h1>
        
        {/* Ghost Character SVG - Cute Chibi Style */}
        <div className="ghost-container">
          <svg 
            className="ghost-character" 
            viewBox="0 0 200 240" 
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Friendly ghost character"
          >
            {/* Chibi ghost body - rounded and cute */}
            <path
              d="M 100 30 
                 C 55 30, 30 55, 30 100
                 C 30 120, 35 135, 35 150
                 L 35 195
                 L 50 180
                 L 65 195
                 L 80 180
                 L 100 195
                 L 120 180
                 L 135 195
                 L 150 180
                 L 165 195
                 L 165 150
                 C 165 135, 170 120, 170 100
                 C 170 55, 145 30, 100 30 Z"
              fill="rgba(255, 255, 255, 0.85)"
              className="ghost-body"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="2"
            />
            
            {/* Big chibi eyes - larger and rounder */}
            <ellipse cx="70" cy="90" rx="18" ry="22" fill="#1A1F2E" className="ghost-eye" />
            <ellipse cx="75" cy="85" rx="8" ry="10" fill="#FFFFFF" className="ghost-eye-shine" />
            
            <ellipse cx="130" cy="90" rx="18" ry="22" fill="#1A1F2E" className="ghost-eye" />
            <ellipse cx="135" cy="85" rx="8" ry="10" fill="#FFFFFF" className="ghost-eye-shine" />
            
            {/* Cute small smile */}
            <path
              d="M 80 125 Q 100 135, 120 125"
              stroke="#1A1F2E"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="ghost-smile"
            />
            
            {/* Rosy cheeks - pink/coral color */}
            <ellipse cx="50" cy="110" rx="12" ry="8" fill="#FF9AA2" opacity="0.6" className="ghost-blush" />
            <ellipse cx="150" cy="110" rx="12" ry="8" fill="#FF9AA2" opacity="0.6" className="ghost-blush" />
            
            {/* Cute little arms */}
            <ellipse 
              cx="25" 
              cy="120" 
              rx="15" 
              ry="10" 
              fill="rgba(255, 255, 255, 0.75)"
              className="ghost-arm-left"
            />
            <ellipse 
              cx="175" 
              cy="120" 
              rx="15" 
              ry="10" 
              fill="rgba(255, 255, 255, 0.75)"
              className="ghost-arm-right"
            />
          </svg>
        </div>

        {/* Tagline */}
        <p className="tagline">Help debug haunted code and save the digital world!</p>

        {/* Start Button */}
        <button 
          className="start-button"
          onClick={() => setShowNameInput(true)}
          aria-label="Start the game"
        >
          Start Debugging
        </button>

        <br/>
        
        {/* Instructions Toggle */}
        <button 
          className="instructions-toggle"
          onClick={() => setShowInstructions(!showInstructions)}
          aria-label={showInstructions ? "Hide instructions" : "Show instructions"}
        >
          {showInstructions ? '✕ Hide' : 'ℹ️ How to Play'}
        </button>

        {/* Name Input Modal */}
        {showNameInput && (
          <div className="instructions-overlay">
            <div className="instructions-content name-input-modal">
              <h2>Welcome, Ghost Debugger!</h2>
              <p className="name-input-prompt">What should we call you?</p>
              <input
                type="text"
                className="name-input"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && playerName.trim()) {
                    onStart(playerName.trim());
                  }
                }}
                autoFocus
                maxLength={20}
                aria-label="Enter your name"
              />
              <div className="name-input-buttons">
                <button 
                  className="close-instructions"
                  onClick={() => {
                    const name = playerName.trim() || 'Ghost Debugger';
                    onStart(name);
                  }}
                  aria-label="Start game"
                >
                  {playerName.trim() ? "Let's Go!" : 'Skip'}
                </button>
                <button 
                  className="close-instructions secondary"
                  onClick={() => setShowNameInput(false)}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Overlay */}
        {showInstructions && (
          <div className="instructions-overlay">
            <div className="instructions-content">
              <h2>How to Play</h2>
              <ul className="instructions-list">
                <li>
                  <span className="instruction-icon">🐛</span>
                  <span>Find bugs in the haunted code</span>
                </li>
                <li>
                  <span className="instruction-icon">✏️</span>
                  <span>Fix the buggy lines to solve each challenge</span>
                </li>
                <li>
                  <span className="instruction-icon">💡</span>
                  <span>Ask the ghost for hints if you get stuck</span>
                </li>
                <li>
                  <span className="instruction-icon">✨</span>
                  <span>Watch cool animations when you fix the code!</span>
                </li>
                <li>
                  <span className="instruction-icon">🏆</span>
                  <span>Earn badges as you master coding concepts</span>
                </li>
              </ul>
              <button 
                className="close-instructions"
                onClick={() => setShowInstructions(false)}
                aria-label="Close instructions"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
