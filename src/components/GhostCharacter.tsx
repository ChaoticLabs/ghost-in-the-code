import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePreferences } from '../engine';
import './GhostCharacter.css';

export type GhostState = 'idle' | 'happy' | 'thinking' | 'celebrating';

interface GhostCharacterProps {
  state?: GhostState;
  message?: string;
  showSpeechBubble?: boolean;
}

export const GhostCharacter = ({ 
  state = 'idle', 
  message = '',
  showSpeechBubble = false 
}: GhostCharacterProps) => {
  const { preferences } = usePreferences();
  const reducedMotion = preferences.reducedMotion;
  const [currentState, setCurrentState] = useState<GhostState>(state);

  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  // Animation variants for celebrating state
  const celebrateVariants = {
    initial: { 
      y: 0, 
      rotate: 0, 
      scale: 1 
    },
    celebrating: reducedMotion ? {
      y: 0,
      rotate: 0,
      scale: 1,
      transition: { duration: 0 }
    } : {
      y: [-30, -40, -30, 0],
      rotate: [-15, 0, 15, 0],
      scale: [1.1, 1.15, 1.1, 1],
      transition: {
        duration: 1.5,
        times: [0.25, 0.5, 0.75, 1],
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="ghost-character-container">
      {/* Speech Bubble */}
      {showSpeechBubble && message && (
        <div className="speech-bubble" role="status" aria-live="polite">
          <div className="speech-bubble-content">
            {message}
          </div>
          <div className="speech-bubble-tail" />
        </div>
      )}

      {/* Ghost Character SVG with Framer Motion */}
      <motion.svg 
        className={`ghost-character ghost-${currentState}`}
        viewBox="0 0 200 240" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Ghost character feeling ${currentState}`}
        variants={celebrateVariants}
        initial="initial"
        animate={currentState === 'celebrating' ? 'celebrating' : 'initial'}
      >
        {/* Ghost body - rounded and cute */}
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
        
        {/* Eyes - change based on state */}
        {currentState === 'thinking' ? (
          <>
            {/* Thinking eyes - looking up */}
            <ellipse cx="70" cy="80" rx="18" ry="22" fill="#1A1F2E" className="ghost-eye" />
            <ellipse cx="75" cy="75" rx="8" ry="10" fill="#FFFFFF" className="ghost-eye-shine" />
            
            <ellipse cx="130" cy="80" rx="18" ry="22" fill="#1A1F2E" className="ghost-eye" />
            <ellipse cx="135" cy="75" rx="8" ry="10" fill="#FFFFFF" className="ghost-eye-shine" />
          </>
        ) : currentState === 'happy' || currentState === 'celebrating' ? (
          <>
            {/* Happy eyes - closed/squinting */}
            <path
              d="M 55 90 Q 70 85, 85 90"
              stroke="#1A1F2E"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="ghost-eye-happy"
            />
            <path
              d="M 115 90 Q 130 85, 145 90"
              stroke="#1A1F2E"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className="ghost-eye-happy"
            />
          </>
        ) : (
          <>
            {/* Normal eyes */}
            <ellipse cx="70" cy="90" rx="18" ry="22" fill="#1A1F2E" className="ghost-eye" />
            <ellipse cx="75" cy="85" rx="8" ry="10" fill="#FFFFFF" className="ghost-eye-shine" />
            
            <ellipse cx="130" cy="90" rx="18" ry="22" fill="#1A1F2E" className="ghost-eye" />
            <ellipse cx="135" cy="85" rx="8" ry="10" fill="#FFFFFF" className="ghost-eye-shine" />
          </>
        )}
        
        {/* Mouth - changes based on state */}
        {currentState === 'happy' || currentState === 'celebrating' ? (
          <path
            d="M 70 125 Q 100 145, 130 125"
            stroke="#1A1F2E"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className="ghost-mouth-happy"
          />
        ) : currentState === 'thinking' ? (
          <ellipse 
            cx="100" 
            cy="125" 
            rx="8" 
            ry="6" 
            fill="#1A1F2E" 
            className="ghost-mouth-thinking"
          />
        ) : (
          <path
            d="M 80 125 Q 100 135, 120 125"
            stroke="#1A1F2E"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className="ghost-mouth"
          />
        )}
        
        {/* Rosy cheeks */}
        <ellipse 
          cx="50" 
          cy="110" 
          rx="12" 
          ry="8" 
          fill="#FF9AA2" 
          opacity="0.6" 
          className="ghost-blush" 
        />
        <ellipse 
          cx="150" 
          cy="110" 
          rx="12" 
          ry="8" 
          fill="#FF9AA2" 
          opacity="0.6" 
          className="ghost-blush" 
        />
        
        {/* Arms */}
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

        {/* Thinking symbols - only show when thinking */}
        {currentState === 'thinking' && (
          <g className="thinking-symbols">
            <text x="160" y="50" fontSize="24" fill="#00D9FF" className="thinking-symbol">?</text>
            <text x="175" y="35" fontSize="18" fill="#00D9FF" className="thinking-symbol" opacity="0.7">?</text>
            <text x="185" y="55" fontSize="14" fill="#00D9FF" className="thinking-symbol" opacity="0.5">?</text>
          </g>
        )}

        {/* Celebration sparkles - only show when celebrating */}
        {currentState === 'celebrating' && !reducedMotion && (
          <g className="celebration-sparkles">
            <motion.text 
              x="20" y="60" fontSize="28" fill="#A3FF00" className="sparkle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0.8],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              ✨
            </motion.text>
            <motion.text 
              x="170" y="70" fontSize="28" fill="#A3FF00" className="sparkle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0.8],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
            >
              ✨
            </motion.text>
            <motion.text 
              x="30" y="160" fontSize="24" fill="#FFD700" className="sparkle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0.8],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            >
              ⭐
            </motion.text>
            <motion.text 
              x="165" y="150" fontSize="24" fill="#FFD700" className="sparkle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0.8],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            >
              ⭐
            </motion.text>
          </g>
        )}
      </motion.svg>
    </div>
  );
};
