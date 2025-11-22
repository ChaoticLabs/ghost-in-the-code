import { useState, useCallback } from 'react';
import { pollyService } from './polly';
import { usePreferences } from '../engine';

interface UsePollyReturn {
  speak: (text: string, emotion?: 'neutral' | 'excited' | 'encouraging') => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isEnabled: boolean;
}

export function usePolly(): UsePollyReturn {
  const { preferences } = usePreferences();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (
    text: string,
    emotion: 'neutral' | 'excited' | 'encouraging' = 'neutral'
  ) => {
    if (!preferences.voiceEnabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const volume = preferences.volume / 100;
      await pollyService.speak(text, emotion, volume);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to speak';
      setError(errorMessage);
      console.error('Polly error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [preferences.voiceEnabled, preferences.volume]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    speak,
    isLoading,
    error,
    clearError,
    isEnabled: preferences.voiceEnabled,
  };
}
