import { useState } from 'react';
import { useGame } from './engine'
import { WelcomeScreen, GameBoard } from './components'
import './App.css'

function App() {
  const { state } = useGame();
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  // Show welcome screen if game hasn't started
  if (!gameStarted) {
    return <WelcomeScreen onStart={handleStartGame} />;
  }

  // Placeholder components for GameBoard sections
  const codeEditorPlaceholder = (
    <div style={{ color: '#FFFFFF', fontSize: '1.125rem' }}>
      <h3 style={{ color: '#00D9FF', marginBottom: '1rem' }}>Code Editor</h3>
      <p style={{ marginBottom: '0.5rem' }}>This is where the interactive code editor will be displayed.</p>
      <p style={{ color: '#A3FF00' }}>Coming soon in task 12!</p>
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
      totalChallenges={10}
      codeEditor={codeEditorPlaceholder}
      ghostCharacter={ghostCharacterPlaceholder}
      progressTracker={progressTrackerPlaceholder}
      hintPanel={hintPanelPlaceholder}
    />
  )
}

export default App
