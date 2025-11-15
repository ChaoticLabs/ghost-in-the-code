import { useState, useEffect } from 'react';
import { useGame } from './engine'
import { useBadgeSystem } from './engine/useBadgeSystem'
import { gameActions } from './engine/gameActions'
import { WelcomeScreen, GameBoard, CodeEditor, GhostCharacter, ProgressTracker, LevelCompleteTransition, SettingsPanel, HintPanel, EducationalContentModal, BadgeCollection, LevelIntroductionModal, ProgressSummary, LevelSelection } from './components'
import type { LevelType } from './components'
import { getAllChallengesFlat, getChallengesByType, getLevelIntroduction } from './data'
import type { Challenge, Badge, LevelIntroduction } from './engine/types'
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

function App() {
  const { state, dispatch } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [currentLevelName, setCurrentLevelName] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
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
  const [showLevelIntroduction, setShowLevelIntroduction] = useState(false);
  const [levelIntroduction, setLevelIntroduction] = useState<LevelIntroduction | null>(null);
  const [hasSeenLevelIntro, setHasSeenLevelIntro] = useState(false);
  const [showProgressSummary, setShowProgressSummary] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  const { checkAndAwardBadges } = useBadgeSystem(challenges);

  // Load all challenges on mount
  useEffect(() => {
    try {
      const loadedChallenges = getAllChallengesFlat();
      setAllChallenges(loadedChallenges);
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
      // Reset attempt count for new challenge
      setAttemptCount(0);
    }
  }, [currentChallenge, gameStarted]);

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

  const getLevelName = (levelType: LevelType): string => {
    switch (levelType) {
      case 'loop':
        return 'Loops 🔄';
      case 'conditional':
        return 'Conditionals 🔀';
      case 'logic':
        return 'Logic Puzzles 🧩';
      default:
        return 'Level';
    }
  };

  const handleSelectLevel = (levelType: LevelType) => {
    const levelChallenges = getChallengesByType(levelType);
    setChallenges(levelChallenges);
    setCurrentLevelName(getLevelName(levelType));
    
    if (levelChallenges.length > 0) {
      setCurrentChallenge(levelChallenges[0]);
      setCurrentChallengeIndex(0);
    }
    
    setShowLevelSelection(false);
    setGameStarted(true);
    
    // Show level introduction
    if (!hasSeenLevelIntro) {
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
    
    dispatch(gameActions.completeChallenge(currentChallenge.id, hintsUsed, attempts));
    
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
      setGhostMessage("Hi! I'm here to help you debug code!");
    }, 4500);
  };

  const handleAttempt = (isCorrect: boolean) => {
    console.log('Attempt made:', isCorrect ? 'correct' : 'incorrect');
    
    // Track attempts (only count incorrect attempts, success is counted separately)
    if (!isCorrect) {
      setAttemptCount(prev => prev + 1);
    }
  };

  // Show welcome screen if game hasn't started
  if (!gameStarted && !showLevelSelection) {
    return <WelcomeScreen onStart={handleStartGame} />;
  }

  // Show level selection screen
  if (showLevelSelection && !gameStarted) {
    const levelInfo = [
      {
        type: 'loop' as LevelType,
        title: 'Loops',
        description: 'Learn how to repeat actions and create efficient code with loops!',
        icon: '🔄',
        color: '#00D9FF',
        challengeCount: allChallenges.filter(c => c.type === 'loop').length,
        completedCount: Array.from(state.completedChallenges).filter(id => 
          allChallenges.find(c => c.id === id && c.type === 'loop')
        ).length
      },
      {
        type: 'conditional' as LevelType,
        title: 'Conditionals',
        description: 'Master decision-making in code with if statements and conditions!',
        icon: '🔀',
        color: '#A3FF00',
        challengeCount: allChallenges.filter(c => c.type === 'conditional').length,
        completedCount: Array.from(state.completedChallenges).filter(id => 
          allChallenges.find(c => c.id === id && c.type === 'conditional')
        ).length
      },
      {
        type: 'logic' as LevelType,
        title: 'Logic Puzzles',
        description: 'Solve tricky problems and think like a programmer!',
        icon: '🧩',
        color: '#FF9500',
        challengeCount: allChallenges.filter(c => c.type === 'logic').length,
        completedCount: Array.from(state.completedChallenges).filter(id => 
          allChallenges.find(c => c.id === id && c.type === 'logic')
        ).length
      }
    ];

    return (
      <LevelSelection
        levels={levelInfo}
        onSelectLevel={handleSelectLevel}
      />
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

  const handleCloseLevelIntroduction = () => {
    setShowLevelIntroduction(false);
    setHasSeenLevelIntro(true);
  };

  const handleProgressSummaryClick = () => {
    setShowProgressSummary(true);
  };

  const handleCloseProgressSummary = () => {
    setShowProgressSummary(false);
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
        levelName={currentLevelName}
        challenge={state.currentChallenge + 1}
        totalChallenges={challenges.length}
        completedCount={state.completedChallenges.size}
        codeEditor={codeEditorComponent}
        ghostCharacter={ghostCharacterComponent}
        hintPanel={hintPanelComponent}
        onProgressClick={handleProgressClick}
        onLevelClick={handleBackToLevelSelection}
        onSettingsClick={handleSettingsClick}
        onBadgeClick={handleBadgeClick}
        onProgressSummaryClick={handleProgressSummaryClick}
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
    </>
  )
}

export default App
