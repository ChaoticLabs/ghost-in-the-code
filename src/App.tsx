import { useState, useEffect } from 'react';
import { useGame } from './engine'
import { WelcomeScreen, GameBoard, CodeEditor, GhostCharacter, ProgressTracker, LevelCompleteTransition } from './components'
import { getAllChallengesFlat } from './data'
import type { Challenge } from './engine/types'
import './App.css'

function App() {
  const { state } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [ghostState, setGhostState] = useState<'idle' | 'happy' | 'thinking' | 'celebrating'>('idle');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

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
    
    // Trigger all success animations
    setShowSuccessAnimation(true);
    setGhostState('celebrating');
    
    // Reset animations after they complete (4.5 seconds for slow, curved particles)
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setGhostState('idle');
      
      // Check if this was the last challenge in the level
      const nextIndex = currentChallengeIndex + 1;
      if (nextIndex >= challenges.length) {
        // Level complete! Show transition
        setShowLevelComplete(true);
      } else {
        // Move to next challenge
        setCurrentChallengeIndex(nextIndex);
        setCurrentChallenge(challenges[nextIndex]);
      }
    }, 4500);
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
      showSuccessAnimation={showSuccessAnimation}
    />
  ) : (
    <div style={{ color: '#FFFFFF', fontSize: '1.125rem' }}>
      <p style={{ color: '#FF9500' }}>Loading challenge...</p>
    </div>
  );

  const ghostCharacterComponent = (
    <GhostCharacter 
      state={ghostState}
      message={ghostState === 'celebrating' ? "Amazing work! You fixed it! 🎉" : "Hi! I'm here to help you debug code!"}
      showSpeechBubble={true}
    />
  );

  const handleSelectChallenge = (index: number) => {
    if (index >= 0 && index < challenges.length) {
      setCurrentChallengeIndex(index);
      setCurrentChallenge(challenges[index]);
      // TODO: Update game state with selected challenge (will be implemented in later tasks)
      console.log('Selected challenge:', index);
    }
  };

  const handleNextLevel = () => {
    console.log('Moving to next level...');
    // TODO: Implement level progression logic in future tasks
    // For now, just close the modal
    setShowLevelComplete(false);
    // Could reset to first challenge or load next level's challenges
  };

  const handleCloseLevelComplete = () => {
    setShowLevelComplete(false);
  };

  const handleProgressClick = () => {
    setShowProgressModal(true);
  };

  const handleCloseProgress = () => {
    setShowProgressModal(false);
  };

  const hintPanelPlaceholder = (
    <div style={{ color: '#FFFFFF', fontSize: '1.125rem' }}>
      <h3 style={{ color: '#FF9500', marginBottom: '1rem' }}>Hint Panel</h3>
      <p>Hints and tips will appear here when you need help.</p>
      <p style={{ color: '#A3FF00', fontSize: '0.875rem', marginTop: '0.5rem' }}>Coming soon in task 15!</p>
    </div>
  );

  return (
    <>
      <GameBoard
        level={state.currentLevel}
        challenge={state.currentChallenge + 1}
        totalChallenges={challenges.length}
        completedCount={state.completedChallenges.size}
        codeEditor={codeEditorComponent}
        ghostCharacter={ghostCharacterComponent}
        hintPanel={hintPanelPlaceholder}
        onProgressClick={handleProgressClick}
        showSuccessAnimation={showSuccessAnimation}
      />
      
      {showProgressModal && (
        <ProgressTracker
          challenges={challenges}
          completedChallengeIds={state.completedChallenges}
          currentChallengeIndex={state.currentChallenge}
          onSelectChallenge={handleSelectChallenge}
          onClose={handleCloseProgress}
        />
      )}

      <LevelCompleteTransition
        isVisible={showLevelComplete}
        level={state.currentLevel}
        earnedBadges={state.badges}
        onNextLevel={handleNextLevel}
        onClose={handleCloseLevelComplete}
      />
    </>
  )
}

export default App
