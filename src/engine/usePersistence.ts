/**
 * React hook for accessing persistence utilities
 */

import { useCallback } from 'react';
import {
  hasSavedGame,
  getLastPlayedTime,
  clearGameState,
  exportGameState,
  importGameState
} from './persistence';

/**
 * Hook providing persistence utility functions
 */
export function usePersistence() {
  const checkHasSavedGame = useCallback(() => {
    return hasSavedGame();
  }, []);

  const getLastPlayed = useCallback(() => {
    return getLastPlayedTime();
  }, []);

  const clearSave = useCallback(() => {
    return clearGameState();
  }, []);

  const exportSave = useCallback(() => {
    return exportGameState();
  }, []);

  const importSave = useCallback((jsonData: string) => {
    return importGameState(jsonData);
  }, []);

  return {
    hasSavedGame: checkHasSavedGame,
    getLastPlayedTime: getLastPlayed,
    clearGameState: clearSave,
    exportGameState: exportSave,
    importGameState: importSave
  };
}
