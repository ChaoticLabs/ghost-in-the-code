import { useState, useEffect } from 'react';
import { useGame } from './engine'
import { WelcomeScreen, GameBoard, CodeEditor, GhostCharacter, ProgressTracker, LevelCompleteTransition, SettingsPanel, HintPanel } from './components'
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
  const [showSettings, setShowSettings] = useState(false);
  const [ghostMessage, setGhostMessage] = useState("Hi! I'm here to help you debug code!");
  const [showGhostSpeechBubble, setShowGhostSpeechBubble] = useState(true);

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
    setGhostMessage("Amazing work! You fixed it! 🎉");
    setShowGhostSpeechBubble(true);
    
    // Reset animations after they complete (4.5 seconds for slow, curved particles)
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setGhostState('idle');
      setGhostMessage("Hi! I'm here to help you debug code!");
      
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

  const handleHintDisplayed = (hint: string) => {
    // Display hint in ghost's speech bubble
    setGhostState('thinking');
    setGhostMessage(hint);
    setShowGhostSpeechBubble(true);

    // Return to idle after a few seconds
    setTimeout(() => {
      setGhostState('idle');
      setGhostMessage("Hi! I'm here to help you debug code!");
    }, 5000);
  };

  const ghostCharacterComponent = (
    <GhostCharacter 
      state={ghostState}
      message={ghostMessage}
      showSpeechBubble={showGhostSpeechBubble}
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

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const hintPanelComponent = currentChallenge ? (
    <HintPanel 
      challenge={currentChallenge}
      onHintDisplayed={handleHintDisplayed}
    />
  ) : null;

  return (
    <>
      <GameBoard
        level={state.currentLevel}
        challenge={state.currentChallenge + 1}
        totalChallenges={challenges.length}
        completedCount={state.completedChallenges.size}
        codeEditor={codeEditorComponent}
        ghostCharacter={ghostCharacterComponent}
        hintPanel={hintPanelComponent}
        onProgressClick={handleProgressClick}
        onSettingsClick={handleSettingsClick}
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

      <SettingsPanel
        isVisible={showSettings}
        onClose={handleCloseSettings}
      />
    </>
  )
}

export default App
