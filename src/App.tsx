import { useState, useEffect } from 'react';
import { useGame } from './engine'
import { WelcomeScreen, GameBoard, CodeEditor } from './components'
import { getAllChallengesFlat } from './data'
import type { Challenge } from './engine/types'
import './App.css'

function App() {
  const { state } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Load challenges on mount
  useEffect(() => {
    try {
      const allChallenges = getAllChallengesFlat();
      setChallenges(allChallenges);
      if (allChallenges.length > 0) {
        setCurrentChallenge(allChallenges[0]);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  }, []);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleChallengeSuccess = () => {
    console.log('Challenge completed successfully!');
    // TODO: Progress to next challenge (will be implemented in later tasks)
  };

  const handleAttempt = (isCorrect: boolean) => {
    console.log('Attempt made:', isCorrect ? 'correct' : 'incorrect');
    // TODO: Track attempts in game state (will be implemented in later tasks)
  };

  // Show welcome screen if game hasn't started
  if (!gameStarted) {
    return <WelcomeScreen onStart={handleStartGame} />;
  }

  // Code editor component
  const codeEditorComponent = currentChallenge ? (
    <CodeEditor
      challenge={currentChallenge}
      onSuccess={handleChallengeSuccess}
      onAttempt={handleAttempt}
    />
  ) : (
    <div style={{ color: '#FFFFFF', fontSize: '1.125rem' }}>
      <p style={{ color: '#FF9500' }}>Loading challenge...</p>
    </div>
  );

  const ghostCharacterPlaceholder = (
    <div style={{ color: '#FFFFFF', textAlign: 'center', fontSize: '1.125rem' }}>
      <h3 style={{ color: '#A3FF00', marginBottom: '1rem' }}>Ghost Character</h3>
      <p>👻</p>
      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Coming soon in task 13!</p>
    </div>
  );

  const progressTrackerPlaceholder = (
    <div style={{ color: '#FFFFFF', fontSize: '1.125rem' }}>
      <h3 style={{ color: '#6B46C1', marginBottom: '1rem' }}>Progress Tracker</h3>
      <p>Level progress and challenge map will be displayed here.</p>
      <p style={{ color: '#A3FF00', fontSize: '0.875rem', marginTop: '0.5rem' }}>Coming soon in task 14!</p>
    </div>
  );

  const hintPanelPlaceholder = (
    <div style={{ color: '#FFFFFF', fontSize: '1.125rem' }}>
      <h3 style={{ color: '#FF9500', marginBottom: '1rem' }}>Hint Panel</h3>
      <p>Hints and tips will appear here when you need help.</p>
      <p style={{ color: '#A3FF00', fontSize: '0.875rem', marginTop: '0.5rem' }}>Coming soon in task 15!</p>
    </div>
  );

  return (
    <GameBoard
      level={state.currentLevel}
      challenge={state.currentChallenge}
      totalChallenges={challenges.length}
      codeEditor={codeEditorComponent}
      ghostCharacter={ghostCharacterPlaceholder}
      progressTracker={progressTrackerPlaceholder}
      hintPanel={hintPanelPlaceholder}
    />
  )
}

export default App
