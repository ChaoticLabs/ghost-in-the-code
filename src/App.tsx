import { useGame, gameActions } from './engine'
import './App.css'

function App() {
  const { state, dispatch } = useGame();

  const handleCompleteChallenge = () => {
    dispatch(gameActions.completeChallenge('test-challenge-1', 1, 2));
  };

  const handleNextChallenge = () => {
    dispatch(gameActions.nextChallenge());
  };

  const handleUseHint = () => {
    dispatch(gameActions.useHint('test-challenge-1'));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Ghost in The Code - Game State Demo</h1>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Current Game State</h2>
        <p><strong>Level:</strong> {state.currentLevel}</p>
        <p><strong>Challenge:</strong> {state.currentChallenge}</p>
        <p><strong>Score:</strong> {state.score}</p>
        <p><strong>Completed Challenges:</strong> {state.completedChallenges.size}</p>
        <p><strong>Total Hints Used:</strong> {state.assessmentMetrics.totalHintsUsed}</p>
        <p><strong>Challenges Completed:</strong> {state.assessmentMetrics.challengesCompleted}</p>
        <p><strong>Average Attempts:</strong> {state.assessmentMetrics.averageAttempts.toFixed(2)}</p>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button onClick={handleCompleteChallenge}>
          Complete Challenge
        </button>
        <button onClick={handleNextChallenge}>
          Next Challenge
        </button>
        <button onClick={handleUseHint}>
          Use Hint
        </button>
        <button onClick={() => dispatch(gameActions.nextLevel())}>
          Next Level
        </button>
        <button onClick={() => dispatch(gameActions.resetGame())}>
          Reset Game
        </button>
      </div>
    </div>
  )
}

export default App
