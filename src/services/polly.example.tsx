/**
 * Example component showing how to use the Polly service
 * This file is for reference only and is not used in the app
 */

import { usePolly } from './usePolly';

export function PollyExample() {
  const { speak, isLoading, error, clearError } = usePolly();

  const handleSpeak = async (text: string, emotion: 'neutral' | 'excited' | 'encouraging' = 'neutral') => {
    try {
      await speak(text, emotion);
    } catch (err) {
      console.error('Failed to speak:', err);
    }
  };

  return (
    <div>
      <h2>Polly Voice Examples</h2>
      
      {error && (
        <div style={{ color: 'red', padding: '1rem', background: '#fee' }}>
          Error: {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => handleSpeak("Hello! Welcome to Ghost in The Code!", "excited")}
          disabled={isLoading}
        >
          {isLoading ? 'Speaking...' : 'Welcome Message'}
        </button>

        <button 
          onClick={() => handleSpeak("Let me think about that...", "neutral")}
          disabled={isLoading}
        >
          {isLoading ? 'Speaking...' : 'Thinking'}
        </button>

        <button 
          onClick={() => handleSpeak("Great job! You're doing amazing!", "encouraging")}
          disabled={isLoading}
        >
          {isLoading ? 'Speaking...' : 'Encouragement'}
        </button>

        <button 
          onClick={() => handleSpeak("Boo! Did I scare you?", "excited")}
          disabled={isLoading}
        >
          {isLoading ? 'Speaking...' : 'Ghost Greeting'}
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Usage in Your Component:</h3>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
{`import { usePolly } from '../services';

function MyComponent() {
  const { speak, isLoading, error } = usePolly();
  
  const handleClick = async () => {
    await speak("Hello world!", "excited");
  };
  
  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? "Speaking..." : "Speak"}
    </button>
  );
}`}
        </pre>
      </div>
    </div>
  );
}
