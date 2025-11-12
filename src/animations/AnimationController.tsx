/**
 * AnimationController - Manages animation events and queuing
 * 
 * This controller provides a centralized system for triggering and managing
 * animations throughout the game. It supports sequential animation queuing
 * and completion callbacks.
 */

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type { AnimationEvent, AnimationQueueItem, AnimationState } from './types';

// Action types for animation state management
type AnimationAction =
  | { type: 'QUEUE_ANIMATION'; payload: AnimationEvent }
  | { type: 'START_ANIMATION'; payload: AnimationQueueItem }
  | { type: 'COMPLETE_ANIMATION'; payload: string }
  | { type: 'CLEAR_QUEUE' };

// Initial state
const initialState: AnimationState = {
  queue: [],
  currentAnimation: null,
  isPlaying: false,
};

// Reducer for animation state
function animationReducer(state: AnimationState, action: AnimationAction): AnimationState {
  switch (action.type) {
    case 'QUEUE_ANIMATION': {
      const queueItem: AnimationQueueItem = {
        ...action.payload,
        status: 'pending',
      };
      return {
        ...state,
        queue: [...state.queue, queueItem],
      };
    }

    case 'START_ANIMATION': {
      return {
        ...state,
        currentAnimation: { ...action.payload, status: 'playing', startTime: Date.now() },
        isPlaying: true,
      };
    }

    case 'COMPLETE_ANIMATION': {
      const updatedQueue = state.queue.filter(item => item.id !== action.payload);
      return {
        ...state,
        queue: updatedQueue,
        currentAnimation: null,
        isPlaying: false,
      };
    }

    case 'CLEAR_QUEUE': {
      return {
        ...state,
        queue: [],
        currentAnimation: null,
        isPlaying: false,
      };
    }

    default:
      return state;
  }
}

// Context type
interface AnimationContextType {
  state: AnimationState;
  dispatch: Dispatch<AnimationAction>;
  triggerAnimation: (event: Omit<AnimationEvent, 'id'>) => void;
  clearAnimations: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

// Provider component
interface AnimationProviderProps {
  children: ReactNode;
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  // Trigger a new animation
  const triggerAnimation = useCallback((event: Omit<AnimationEvent, 'id'>) => {
    const animationEvent: AnimationEvent = {
      ...event,
      id: `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      duration: event.duration || 2000, // Default 2 seconds
      delay: event.delay || 0,
    };

    dispatch({ type: 'QUEUE_ANIMATION', payload: animationEvent });
  }, []);

  // Clear all animations
  const clearAnimations = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  // Process animation queue
  useEffect(() => {
    if (!state.isPlaying && state.queue.length > 0) {
      const nextAnimation = state.queue[0];
      
      // Apply delay if specified
      const delay = nextAnimation.delay || 0;
      
      const timeoutId = setTimeout(() => {
        dispatch({ type: 'START_ANIMATION', payload: nextAnimation });
        
        // Schedule completion
        const duration = nextAnimation.duration || 2000;
        const completionTimeoutId = setTimeout(() => {
          // Call completion callback if provided
          if (nextAnimation.onComplete) {
            nextAnimation.onComplete();
          }
          
          dispatch({ type: 'COMPLETE_ANIMATION', payload: nextAnimation.id });
        }, duration);

        // Store timeout ID for cleanup
        return () => clearTimeout(completionTimeoutId);
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [state.isPlaying, state.queue]);

  return (
    <AnimationContext.Provider value={{ state, dispatch, triggerAnimation, clearAnimations }}>
      {children}
    </AnimationContext.Provider>
  );
}

// Hook to use animation controller
export function useAnimationController() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimationController must be used within an AnimationProvider');
  }
  return context;
}
