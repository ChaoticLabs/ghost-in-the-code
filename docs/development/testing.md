# Testing

## Overview

Testing focuses on core functionality only - no need for exhaustive coverage in this hackathon project.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

### What We Test
- **Badge earning logic** - Ensure badges are awarded correctly
- **Challenge validation** - Verify solution checking works
- **State management** - Test reducer actions and state updates
- **Data loading** - Validate challenge data structure

### What We Don't Test
- UI components (visual testing not needed for hackathon)
- Trivial getters/setters
- Third-party library wrappers
- Simple utility functions

## Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = setupTestData();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

## Example Tests

### Badge Logic
```typescript
describe('Badge System', () => {
  it('should award First Bug Fixed after first challenge', () => {
    const state = {
      completedChallenges: [{ id: 'loop-1', score: 100 }],
      earnedBadges: []
    };
    
    const badges = checkBadges(state);
    
    expect(badges).toContain('first-bug-fixed');
  });
  
  it('should award Hint-Free Hero after 3 hint-free completions', () => {
    const state = {
      completedChallenges: [
        { id: 'loop-1', hintsUsed: 0 },
        { id: 'loop-2', hintsUsed: 0 },
        { id: 'loop-3', hintsUsed: 0 }
      ],
      earnedBadges: ['first-bug-fixed']
    };
    
    const badges = checkBadges(state);
    
    expect(badges).toContain('hint-free-hero');
  });
});
```

### Challenge Validation
```typescript
describe('Challenge Validation', () => {
  it('should accept correct solution', () => {
    const challenge = {
      solution: '  for (let i = 0; i < 5; i++) {',
      buggyLines: [1]
    };
    
    const userCode = '  for (let i = 0; i < 5; i++) {';
    
    expect(validateSolution(userCode, challenge)).toBe(true);
  });
  
  it('should ignore whitespace differences', () => {
    const challenge = {
      solution: '  for (let i = 0; i < 5; i++) {',
      buggyLines: [1]
    };
    
    const userCode = 'for (let i = 0; i < 5; i++) {';
    
    expect(validateSolution(userCode, challenge)).toBe(true);
  });
});
```

### State Management
```typescript
describe('Game Reducer', () => {
  it('should complete challenge and update state', () => {
    const initialState = {
      currentChallenge: 'loop-1',
      completedChallenges: [],
      score: 0
    };
    
    const action = {
      type: 'COMPLETE_CHALLENGE',
      payload: { challengeId: 'loop-1', score: 85 }
    };
    
    const newState = gameReducer(initialState, action);
    
    expect(newState.completedChallenges).toHaveLength(1);
    expect(newState.score).toBe(85);
  });
});
```

## Mocking

### API Calls
```typescript
import { vi } from 'vitest';

describe('Voice Service', () => {
  it('should fetch audio from API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ audioUrl: 'https://...' })
    });
    
    global.fetch = mockFetch;
    
    const result = await getVoiceAudio('Hello');
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/voice'),
      expect.any(Object)
    );
    expect(result.audioUrl).toBeDefined();
  });
});
```

### LocalStorage
```typescript
describe('Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should save game state to localStorage', () => {
    const state = { score: 100, level: 5 };
    
    saveGameState(state);
    
    const saved = localStorage.getItem('gameState');
    expect(JSON.parse(saved)).toEqual(state);
  });
});
```

## Testing Philosophy

For this hackathon project:
- **Test what matters** - Focus on game logic and critical paths
- **Keep it simple** - No complex test setups
- **Fast feedback** - Tests should run quickly
- **Readable tests** - Clear test names and assertions
- **Don't over-test** - 100% coverage is not the goal

## Future Testing Enhancements

If scaling beyond hackathon:
- Add E2E tests with Playwright
- Visual regression testing
- Performance testing
- Accessibility testing with axe
- Integration tests for API endpoints
