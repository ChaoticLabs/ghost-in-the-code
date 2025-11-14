import { useState, useEffect } from 'react';
import { useGame } from './engine'
import { useBadgeSystem } from './engine/useBadgeSystem'
import { WelcomeScreen, GameBoard, CodeEditor, GhostCharacter, ProgressTracker, LevelCompleteTransition, SettingsPanel, HintPanel, EducationalContentModal, BadgeCollection } from './components'
import { getAllChallengesFlat } from './data'
import type { Challenge, Badge } from './engine/types'
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
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [educationalModalMode, setEducationalModalMode] = useState<'introduction' | 'completion'>('introduction');
  const [showBadgeCollection, setShowBadgeCollection] = useState(false);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  
  const { checkAndAwardBadges } = useBadgeSystem(challenges);

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

  // Show educational introduction before each challenge
  useEffect(() => {
    if (currentChallenge && gameStarted) {
      // Show pre-challenge walkthrough for every challenge
      setEducationalModalMode('introduction');
      setShowEducationalModal(true);
    }
  }, [currentChallenge, gameStarted]);

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
    
    // Check for newly earned badges
    const newBadges = checkAndAwardBadges();
    if (newBadges.length > 0) {
      // Show the first newly earned badge
      setNewlyEarnedBadge(newBadges[0]);
      console.log('New badge earned:', newBadges[0].name);
    }
    
    // Show educational completion modal after a brief delay
    setTimeout(() => {
      setEducationalModalMode('completion');
      setShowEducationalModal(true);
    }, 2000);
    
    // Reset animations after they complete (4.5 seconds for slow, curved particles)
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setGhostState('idle');
      setGhostMessage("Hi! I'm here to help you debug code!");
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

  const handleCloseEducationalModal = () => {
    setShowEducationalModal(false);
    
    // If we just completed a challenge, move to next challenge
    if (educationalModalMode === 'completion') {
      const nextIndex = currentChallengeIndex + 1;
      if (nextIndex >= challenges.length) {
        // Level complete! Show transition
        setShowLevelComplete(true);
      } else {
        // Move to next challenge
        setCurrentChallengeIndex(nextIndex);
        setCurrentChallenge(challenges[nextIndex]);
      }
    }
  };

  const handleBadgeClick = () => {
    setShowBadgeCollection(true);
  };

  const handleCloseBadgeCollection = () => {
    setShowBadgeCollection(false);
    setNewlyEarnedBadge(null);
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
        onBadgeClick={handleBadgeClick}
        badgeCount={state.badges.length}
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

      <EducationalContentModal
        isVisible={showEducationalModal}
        challenge={currentChallenge}
        mode={educationalModalMode}
        onClose={handleCloseEducationalModal}
      />

      {showBadgeCollection && (
        <BadgeCollection
          badges={state.badges}
          onClose={handleCloseBadgeCollection}
          newlyEarnedBadgeId={newlyEarnedBadge?.id}
        />
      )}
    </>
  )
}

export default App
