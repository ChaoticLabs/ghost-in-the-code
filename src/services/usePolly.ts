import { useState, useCallback } from 'react';
import { pollyService } from './polly';

interface UsePollyReturn {
  speak: (text: string, emotion?: 'neutral' | 'excited' | 'encouraging') => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function usePolly(): UsePollyReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (
    text: string,
    emotion: 'neutral' | 'excited' | 'encouraging' = 'neutral'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await pollyService.speak(text, emotion);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to speak';
      setError(errorMessage);
      console.error('Polly error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    speak,
    isLoading,
    error,
    clearError,
  };
}
