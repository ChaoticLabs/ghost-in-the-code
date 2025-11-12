import { useState } from 'react';
import { GhostCharacter } from './GhostCharacter';
import type { GhostState } from './GhostCharacter';

/**
 * Demo component to showcase GhostCharacter states
 * This can be used for testing and demonstration purposes
 */
export const GhostCharacterDemo = () => {
  const [state, setState] = useState<GhostState>('idle');
  const [message, setMessage] = useState('');
  const [showBubble, setShowBubble] = useState(false);

  const stateMessages: Record<GhostState, string> = {
    idle: "Hi there! I'm here to help you debug code!",
    happy: "Great job! You're doing awesome!",
    thinking: "Hmm... let me think about this...",
    celebrating: "🎉 Amazing! You fixed the bug! 🎉"
  };

  const handleStateChange = (newState: GhostState) => {
    setState(newState);
    setMessage(stateMessages[newState]);
    setShowBubble(true);
  };

  return (
    <div style={{ padding: '2rem', background: '#1A1F2E', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>Ghost Character Demo</h1>
      
      <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <GhostCharacter 
          state={state} 
          message={message}
          showSpeechBubble={showBubble}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '2rem'
      }}>
        <button 
          onClick={() => handleStateChange('idle')}
          style={buttonStyle}
        >
          Idle
        </button>
        <button 
          onClick={() => handleStateChange('happy')}
          style={buttonStyle}
        >
          Happy
        </button>
        <button 
          onClick={() => handleStateChange('thinking')}
          style={buttonStyle}
        >
          Thinking
        </button>
        <button 
          onClick={() => handleStateChange('celebrating')}
          style={buttonStyle}
        >
          Celebrating
        </button>
        <button 
          onClick={() => setShowBubble(!showBubble)}
          style={buttonStyle}
        >
          Toggle Speech Bubble
        </button>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  background: '#6B46C1',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.2s',
};
