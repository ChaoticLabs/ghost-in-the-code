/**
 * PreferencesContext - Manages user preferences including accessibility settings
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface UserPreferences {
  voiceEnabled: boolean;
  volume: number;
  fontSize: 'medium' | 'large' | 'xlarge';
  highContrastMode: boolean;
  reducedMotion: boolean;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  voiceEnabled: true,
  volume: 80,
  fontSize: 'medium',
  highContrastMode: false,
  reducedMotion: false,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREFERENCES_STORAGE_KEY = 'ghost-in-the-code-preferences';

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }

    // Check system preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check system preference for high contrast
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    return {
      ...defaultPreferences,
      reducedMotion: prefersReducedMotion,
      highContrastMode: prefersHighContrast,
    };
  });

  // Listen for system preference changes
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (!stored || !JSON.parse(stored).reducedMotion) {
        setPreferences(prev => ({
          ...prev,
          reducedMotion: e.matches,
        }));
      }
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (!stored || JSON.parse(stored).highContrastMode === undefined) {
        setPreferences(prev => ({
          ...prev,
          highContrastMode: e.matches,
        }));
      }
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    highContrastQuery.addEventListener('change', handleHighContrastChange);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [preferences]);

  // Apply font size to document
  useEffect(() => {
    // Remove all font size classes
    document.documentElement.classList.remove('font-size-medium', 'font-size-large', 'font-size-xlarge');
    
    // Add the current font size class
    document.documentElement.classList.add(`font-size-${preferences.fontSize}`);
  }, [preferences.fontSize]);

  // Apply high contrast mode to document
  useEffect(() => {
    if (preferences.highContrastMode) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [preferences.highContrastMode]);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreference, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
