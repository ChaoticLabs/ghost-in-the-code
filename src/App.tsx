import { useState, useEffect } from 'react';
import { useGame } from './engine'
import { useBadgeSystem } from './engine/useBadgeSystem'
import { gameActions } from './engine/gameActions'
import { WelcomeScreen, GameBoard, CodeEditor, GhostCharacter, ProgressTracker, LevelCompleteTransition, SettingsPanel, HintPanel, EducationalContentModal, BadgeCollection, LevelIntroductionModal, ProgressSummary, LevelSelection, Footer } from './components'
import { getAllChallengesFlat, getChallengesByType, getLevelIntroduction, getLevelName, getLevelInfo } from './data'
import { openConceptExplanation } from './utils/conceptExplanation'
import type { Challenge, Badge, LevelIntroduction } from './engine/types'
import type { LevelType } from './data'
import './App.css'

/**
 * Get player name from localStorage or return default
 */
function getPlayerName(): string {
  try {
    const saved = localStorage.getItem('ghost-in-the-code-save');
    if (saved) {
      const data = JSON.parse(saved);
      return data.playerName || 'Ghost Debugger';
    }
  } catch (error) {
    console.error('Failed to get player name:', error);
  }
  return 'Ghost Debugger';
}

/**
 * App-level state that needs to be persisted
 */
interface AppState {
  gameStarted: boolean;
  showLevelSelection: boolean;
  currentLevelType: LevelType | null;
  currentChallengeIndex: number;
  hasSeenLevelIntro: boolean;
}

/**
 * Save app state to localStorage
 */
function saveAppState(state: AppState): void {
  try {
    localStorage.setItem('ghost-app-state', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
}

/**
 * Load app state from localStorage
 */
function loadAppState(): AppState | null {
  try {
    const saved = localStorage.getItem('ghost-app-state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load app state:', error);
  }
  return null;
}



function App() {
  const { state, dispatch } = useGame();
  
  // Load saved app state on mount
  const savedAppState = loadAppState();
  
  const [gameStarted, setGameStarted] = useState(savedAppState?.gameStarted || false);
  const [showLevelSelection, setShowLevelSelection] = useState(savedAppState?.showLevelSelection || false);
  const [currentLevelName, setCurrentLevelName] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [ghostState, setGhostState] = useState<'idle' | 'happy' | 'thinking' | 'celebrating'>('idle');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(savedAppState?.currentChallengeIndex || 0);
  const [showSettings, setShowSettings] = useState(false);
  const [ghostMessage, setGhostMessage] = useState("Hi! I'm here to help you debug code!");
  const [showGhostSpeechBubble, setShowGhostSpeechBubble] = useState(true);
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [educationalModalMode, setEducationalModalMode] = useState<'introduction' | 'completion'>('introduction');
  const [showBadgeCollection, setShowBadgeCollection] = useState(false);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  const [showLevelIntroduction, setShowLevelIntroduction] = useState(false);
  const [levelIntroduction, setLevelIntroduction] = useState<LevelIntroduction | null>(null);
  const [hasSeenLevelIntro, setHasSeenLevelIntro] = useState(savedAppState?.hasSeenLevelIntro || false);
  const [showProgressSummary, setShowProgressSummary] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [currentLevelType, setCurrentLevelType] = useState<LevelType | null>(savedAppState?.currentLevelType || null);
  
  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Use allChallenges for badge system so it checks against ALL challenges in the game
  const { checkAndAwardBadges } = useBadgeSystem(allChallenges);

  // Load all challenges on mount and restore level if needed
  useEffect(() => {
    try {
      const loadedChallenges = getAllChallengesFlat();
      setAllChallenges(loadedChallenges);
      
      // Restore the current level if we have saved state
      if (savedAppState?.currentLevelType && savedAppState.gameStarted) {
        const levelChallenges = getChallengesByType(savedAppState.currentLevelType);
        setChallenges(levelChallenges);
        setCurrentLevelName(getLevelName(savedAppState.currentLevelType));
        
        if (levelChallenges.length > 0) {
          const challengeIndex = Math.min(savedAppState.currentChallengeIndex, levelChallenges.length - 1);
          setCurrentChallenge(levelChallenges[challengeIndex]);
          setCurrentChallengeIndex(challengeIndex);
        }
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  }, []);

  // Check for missing badges on mount (after allChallenges is loaded)
  useEffect(() => {
    if (allChallenges.length > 0 && gameStarted) {
      console.log('Checking for missing badges on mount...');
      checkAndAwardBadges();
    }
  }, [allChallenges.length, gameStarted]);
  
  // Save app state whenever key state changes
  useEffect(() => {
    const appState: AppState = {
      gameStarted,
      showLevelSelection,
      currentLevelType,
      currentChallengeIndex,
      hasSeenLevelIntro
    };
    saveAppState(appState);
  }, [gameStarted, showLevelSelection, currentLevelType, currentChallengeIndex, hasSeenLevelIntro]);
  
  // Show educational introduction before each challenge (but not on initial load/restore)
  useEffect(() => {
    if (currentChallenge && gameStarted && !isInitialLoad) {
      // Show pre-challenge walkthrough for every challenge
      setEducationalModalMode('introduction');
      setShowEducationalModal(true);
      // Reset attempt count for new challenge
      setAttemptCount(0);
    }
    
    // After first render, mark as no longer initial load
    if (isInitialLoad && currentChallenge) {
      setIsInitialLoad(false);
    }
  }, [currentChallenge, gameStarted, isInitialLoad]);

  const handleStartGame = (playerName: string) => {
    // Save player name to localStorage
    try {
      const saved = localStorage.getItem('ghost-in-the-code-save');
      const data = saved ? JSON.parse(saved) : {};
      data.playerName = playerName;
      localStorage.setItem('ghost-in-the-code-save', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save player name:', error);
    }
    
    setShowLevelSelection(true);
  };



  const handleSelectLevel = (levelType: LevelType) => {
    const levelChallenges = getChallengesByType(levelType);
    setChallenges(levelChallenges);
    setCurrentLevelName(getLevelName(levelType));
    setCurrentLevelType(levelType);
    
    if (levelChallenges.length > 0) {
      // Find the first incomplete challenge in this level
      let resumeIndex = 0;
      for (let i = 0; i < levelChallenges.length; i++) {
        if (!state.completedChallenges.has(levelChallenges[i].id)) {
          resumeIndex = i;
          break;
        }
      }
      
      // If all challenges are completed, start from the beginning
      if (resumeIndex === 0 && state.completedChallenges.has(levelChallenges[0].id)) {
        // Check if ALL challenges in this level are completed
        const allCompleted = levelChallenges.every(c => state.completedChallenges.has(c.id));
        if (allCompleted) {
          // Start from beginning if replaying a completed level
          resumeIndex = 0;
        }
      }
      
      setCurrentChallenge(levelChallenges[resumeIndex]);
      setCurrentChallengeIndex(resumeIndex);
      setIsInitialLoad(false); // Mark as not initial load when selecting a level
      
      console.log(`Resuming ${levelType} level at challenge ${resumeIndex + 1}/${levelChallenges.length}`);
    }
    
    setShowLevelSelection(false);
    setGameStarted(true);
    
    // Show level introduction only if this is the first time entering this level
    const hasCompletedAnyInLevel = levelChallenges.some(c => state.completedChallenges.has(c.id));
    if (!hasSeenLevelIntro && !hasCompletedAnyInLevel) {
      const intro = getLevelIntroduction(levelType);
      if (intro) {
        setLevelIntroduction(intro);
        setShowLevelIntroduction(true);
      }
    }
  };

  const handleBackToLevelSelection = () => {
    setGameStarted(false);
    setShowLevelSelection(true);
    setHasSeenLevelIntro(false);
  };

  const handleChallengeSuccess = () => {
    console.log('Challenge completed successfully!');
    
    if (!currentChallenge) return;
    
    // Dispatch the complete challenge action to update game state
    const hintsUsed = state.hintsUsed.get(currentChallenge.id) || 0;
    const attempts = attemptCount + 1; // Include the successful attempt
    
    console.log(`Challenge ${currentChallenge.id} completed with ${hintsUsed} hints used and ${attempts} attempts`);
    console.log('Total hints used across all challenges:', state.assessmentMetrics.totalHintsUsed);
    console.log('Completed challenges:', Array.from(state.completedChallenges));
    console.log('Total challenges in game:', allChallenges.length);
    
    dispatch(gameActions.completeChallenge(currentChallenge.id, hintsUsed, attempts, currentChallenge.type));
    
    // Trigger all success animations
    setShowSuccessAnimation(true);
    setGhostState('celebrating');
    setGhostMessage("Amazing work! You fixed it! 🎉");
    setShowGhostSpeechBubble(true);
    
    // Check for newly earned badges (after state update)
    setTimeout(() => {
      const newBadges = checkAndAwardBadges();
      if (newBadges.length > 0) {
        // Show the first newly earned badge
        setNewlyEarnedBadge(newBadges[0]);
        console.log('New badge earned:', newBadges[0].name);
      }
    }, 100);
    
    // Show educational completion modal after a brief delay
    setTimeout(() => {
      setEducationalModalMode('completion');
      setShowEducationalModal(true);
    }, 2000);
    
    // Reset animations after they complete (4.5 seconds for slow, curved particles)
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setGhostState('idle');
      setShowGhostSpeechBubble(false);
    }, 5000);
  };

  const handleAttempt = (isCorrect: boolean) => {
    console.log('Attempt made:', isCorrect ? 'correct' : 'incorrect');
    
    // Track attempts (only count incorrect attempts, success is counted separately)
    if (!isCorrect) {
      setAttemptCount(prev => prev + 1);
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleBadgeClick = () => {
    setShowBadgeCollection(true);
  };

  const handleCloseBadgeCollection = () => {
    setShowBadgeCollection(false);
    setNewlyEarnedBadge(null);
  };

  const handleProgressSummaryClick = () => {
    setShowProgressSummary(true);
  };

  const handleCloseProgressSummary = () => {
    setShowProgressSummary(false);
  };

  const handleConceptsClick = async () => {
    if (currentLevelType) {
      const introduction = getLevelIntroduction(currentLevelType);
      if (introduction) {
        await openConceptExplanation(introduction, currentLevelName);
      }
    }
  };

  const handleResetGame = () => {
    // Reset all app state
    setGameStarted(false);
    setShowLevelSelection(false);
    setCurrentLevelType(null);
    setCurrentChallenge(null);
    setChallenges([]);
    setCurrentChallengeIndex(0);
    setHasSeenLevelIntro(false);
    setShowSettings(false);
    setShowBadgeCollection(false);
    setShowProgressSummary(false);
    setNewlyEarnedBadge(null);
    
    // Clear localStorage
    localStorage.removeItem('ghost-app-state');
  };

  // Show welcome screen if game hasn't started
  if (!gameStarted && !showLevelSelection) {
    return (
      <>
        <WelcomeScreen onStart={handleStartGame} />
        <Footer />
      </>
    );
  }

  // Show level selection screen
  if (showLevelSelection && !gameStarted) {
    const levelInfo = getLevelInfo(allChallenges, state.completedChallenges);

    return (
      <>
        <LevelSelection
          levels={levelInfo}
          onSelectLevel={handleSelectLevel}
          onProgressSummaryClick={handleProgressSummaryClick}
          onBadgeClick={handleBadgeClick}
          onSettingsClick={handleSettingsClick}
          badgeCount={state.badges.length}
        />
        
        {showProgressSummary && (
          <ProgressSummary
            gameState={state}
            playerName={getPlayerName()}
            onClose={handleCloseProgressSummary}
          />
        )}

        {showBadgeCollection && (
          <BadgeCollection
            badges={state.badges}
            onClose={handleCloseBadgeCollection}
            newlyEarnedBadgeId={newlyEarnedBadge?.id}
            playerName={getPlayerName()}
            totalChallenges={state.completedChallenges.size}
          />
        )}

        <SettingsPanel
          isVisible={showSettings}
          onClose={handleCloseSettings}
          onResetGame={handleResetGame}
        />
        <Footer />
      </>
    );
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
  };

  const handleGhostClick = () => {
    // Hide speech bubble when ghost is clicked
    setShowGhostSpeechBubble(false);
    setGhostState('idle');
  };

  const ghostCharacterComponent = (
    <GhostCharacter 
      state={ghostState}
      message={ghostMessage}
      showSpeechBubble={showGhostSpeechBubble}
      onGhostClick={handleGhostClick}
    />
  );

  const handleSelectChallenge = (index: number) => {
    if (index >= 0 && index < challenges.length) {
      setCurrentChallengeIndex(index);
      setCurrentChallenge(challenges[index]);
      setAttemptCount(0); // Reset attempts for the selected challenge
      console.log('Selected challenge:', index);
      
      // Close the progress modal after selection
      setShowProgressModal(false);
    }
  };

  const handleNextLevel = () => {
    console.log('Moving to next level...');
    
    // Close the level complete modal
    setShowLevelComplete(false);
    
    // Return to level selection so player can choose another level
    setGameStarted(false);
    setShowLevelSelection(true);
    setHasSeenLevelIntro(false);
    
    // Dispatch next level action to update game state
    dispatch(gameActions.nextLevel());
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

  const handleCloseLevelIntroduction = () => {
    setShowLevelIntroduction(false);
    setHasSeenLevelIntro(true);
  };

  const hintPanelComponent = currentChallenge ? (
    <HintPanel 
      challenge={currentChallenge}
      onHintDisplayed={handleHintDisplayed}
    />
  ) : null;

  // Calculate completed count for current level only
  const levelCompletedCount = challenges.filter(c => 
    state.completedChallenges.has(c.id)
  ).length;

  return (
    <>
      <GameBoard
        levelName={currentLevelName}
        challenge={currentChallengeIndex + 1}
        totalChallenges={challenges.length}
        completedCount={levelCompletedCount}
        codeEditor={codeEditorComponent}
        ghostCharacter={ghostCharacterComponent}
        hintPanel={hintPanelComponent}
        onProgressClick={handleProgressClick}
        onLevelClick={handleBackToLevelSelection}
        onSettingsClick={handleSettingsClick}
        onBadgeClick={handleBadgeClick}
        onProgressSummaryClick={handleProgressSummaryClick}
        onConceptsClick={handleConceptsClick}
        badgeCount={state.badges.length}
        showSuccessAnimation={showSuccessAnimation}
      />
      
      {showProgressModal && (
        <ProgressTracker
          challenges={challenges}
          completedChallengeIds={state.completedChallenges}
          currentChallengeIndex={currentChallengeIndex}
          onSelectChallenge={handleSelectChallenge}
          onClose={handleCloseProgress}
        />
      )}

      <LevelCompleteTransition
        isVisible={showLevelComplete}
        level={state.currentLevel}
        levelName={currentLevelName}
        earnedBadges={state.badges}
        onNextLevel={handleNextLevel}
        onClose={handleCloseLevelComplete}
      />

      <SettingsPanel
        isVisible={showSettings}
        onClose={handleCloseSettings}
        onResetGame={handleResetGame}
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
          playerName={getPlayerName()}
          totalChallenges={state.completedChallenges.size}
        />
      )}

      <LevelIntroductionModal
        isVisible={showLevelIntroduction}
        introduction={levelIntroduction}
        onClose={handleCloseLevelIntroduction}
      />

      {showProgressSummary && (
        <ProgressSummary
          gameState={state}
          playerName={getPlayerName()}
          onClose={handleCloseProgressSummary}
        />
      )}

      <Footer />
    </>
  )
}

export default App
