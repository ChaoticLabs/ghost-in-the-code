/**
 * LocalStorage persistence layer for game state
 * Handles saving/loading game state with version migration and error handling
 */

import type { GameState, Badge } from './types';

const STORAGE_KEY = 'ghost-in-the-code-save';
const CURRENT_VERSION = '1.0.0';

/**
 * Serializable version of GameState for localStorage
 * Converts Sets and Maps to arrays and objects for JSON serialization
 */
export interface SavedGameState {
  version: string;
  lastPlayed: string;
  playerName?: string;
  progress: {
    completedChallenges: string[];
    currentLevel: number;
    currentChallenge: number;
    totalScore: number;
  };
  statistics: {
    hintsUsed: Record<string, number>;
    attemptsPerChallenge: Record<string, number>;
    timeSpent: number;
    firstAttemptSuccess: Record<string, boolean>;
    challengeCompletionTimes: Record<string, number>;
  };
  badges: {
    earned: Badge[];
    earnedDates: Record<string, string>;
  };
  preferences: {
    voiceEnabled: boolean;
    volume: number;
    fontSize: 'medium' | 'large' | 'xlarge';
    highContrastMode: boolean;
    reducedMotion: boolean;
  };
  educatorMetrics: {
    conceptMastery: Record<string, number>;
    lastExported?: string;
  };
}

/**
 * Convert GameState to SavedGameState for serialization
 */
function serializeGameState(state: GameState, playerName?: string): SavedGameState {
  return {
    version: CURRENT_VERSION,
    lastPlayed: new Date().toISOString(),
    playerName,
    progress: {
      completedChallenges: Array.from(state.completedChallenges),
      currentLevel: state.currentLevel,
      currentChallenge: state.currentChallenge,
      totalScore: state.score
    },
    statistics: {
      hintsUsed: Object.fromEntries(state.hintsUsed),
      attemptsPerChallenge: {},
      timeSpent: state.assessmentMetrics.timeSpentMinutes * 60,
      firstAttemptSuccess: {},
      challengeCompletionTimes: {}
    },
    badges: {
      earned: state.badges,
      earnedDates: state.badges.reduce((acc, badge) => {
        acc[badge.id] = badge.earnedDate;
        return acc;
      }, {} as Record<string, string>)
    },
    preferences: {
      voiceEnabled: true,
      volume: 80,
      fontSize: 'medium',
      highContrastMode: false,
      reducedMotion: false
    },
    educatorMetrics: {
      conceptMastery: Object.fromEntries(state.assessmentMetrics.conceptMastery)
    }
  };
}

/**
 * Convert SavedGameState back to GameState
 */
function deserializeGameState(saved: SavedGameState): GameState {
  return {
    currentLevel: saved.progress.currentLevel,
    currentChallenge: saved.progress.currentChallenge,
    completedChallenges: new Set(saved.progress.completedChallenges),
    hintsUsed: new Map(Object.entries(saved.statistics.hintsUsed)),
    score: saved.progress.totalScore,
    badges: saved.badges.earned,
    assessmentMetrics: {
      challengesCompleted: saved.progress.completedChallenges.length,
      conceptMastery: new Map(Object.entries(saved.educatorMetrics.conceptMastery)),
      averageAttempts: 0,
      totalHintsUsed: Object.values(saved.statistics.hintsUsed).reduce((sum, val) => sum + val, 0),
      timeSpentMinutes: saved.statistics.timeSpent / 60,
      lastActivity: saved.lastPlayed
    }
  };
}

/**
 * Migrate saved state from older versions to current version
 */
function migrateVersion(saved: SavedGameState): SavedGameState {
  // Currently only version 1.0.0 exists
  // Future migrations would go here
  if (saved.version === '1.0.0') {
    return saved;
  }

  // Example future migration:
  // if (saved.version === '0.9.0') {
  //   return migrate_0_9_to_1_0(saved);
  // }

  // If version is unknown, return as-is and hope for the best
  console.warn(`Unknown save version: ${saved.version}. Attempting to load anyway.`);
  return saved;
}

/**
 * Validate that saved state has required structure
 */
function validateSavedState(data: unknown): data is SavedGameState {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const saved = data as Partial<SavedGameState>;

  return !!(
    saved.version &&
    saved.progress &&
    typeof saved.progress.currentLevel === 'number' &&
    typeof saved.progress.currentChallenge === 'number' &&
    Array.isArray(saved.progress.completedChallenges)
  );
}

/**
 * Save game state to localStorage
 * @param state Current game state
 * @param playerName Optional player name for badges
 * @returns true if save was successful, false otherwise
 */
export function saveGameState(state: GameState, playerName?: string): boolean {
  try {
    const savedState = serializeGameState(state, playerName);
    const serialized = JSON.stringify(savedState);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save game state:', error);
    
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Game progress cannot be saved.');
    }
    
    return false;
  }
}

/**
 * Load game state from localStorage
 * @returns Loaded game state or null if no save exists or load failed
 */
export function loadGameState(): GameState | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized);
    
    if (!validateSavedState(parsed)) {
      console.error('Invalid save data structure');
      return null;
    }

    const migrated = migrateVersion(parsed);
    const gameState = deserializeGameState(migrated);
    
    return gameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Clear saved game state from localStorage
 * @returns true if clear was successful, false otherwise
 */
export function clearGameState(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear game state:', error);
    return false;
  }
}

/**
 * Check if a saved game exists
 * @returns true if a save exists, false otherwise
 */
export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check for saved game:', error);
    return false;
  }
}

/**
 * Get the last played timestamp from saved game
 * @returns ISO timestamp string or null if no save exists
 */
export function getLastPlayedTime(): string | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized);
    return parsed.lastPlayed || null;
  } catch (error) {
    console.error('Failed to get last played time:', error);
    return null;
  }
}

/**
 * Export game state as JSON for backup or sharing
 * @returns JSON string of saved state or null on error
 */
export function exportGameState(): string | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    return serialized;
  } catch (error) {
    console.error('Failed to export game state:', error);
    return null;
  }
}

/**
 * Import game state from JSON backup
 * @param jsonData JSON string of saved state
 * @returns true if import was successful, false otherwise
 */
export function importGameState(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    
    if (!validateSavedState(parsed)) {
      console.error('Invalid import data structure');
      return false;
    }

    localStorage.setItem(STORAGE_KEY, jsonData);
    return true;
  } catch (error) {
    console.error('Failed to import game state:', error);
    return false;
  }
}
