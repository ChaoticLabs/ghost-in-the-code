/**
 * useAnimations - Custom hook for triggering specific animation types
 * 
 * Provides convenient methods for triggering the four main animation types:
 * - codeHeal: Lines of code glow and repair
 * - terminalGlow: Pulsing glow effect on editor
 * - ghostCelebrate: Ghost character happy animation
 * - particleBurst: Sparkles/particles on success
 */

import { useCallback } from 'react';
import { useAnimationController } from './AnimationController';

export interface AnimationOptions {
  target?: string;
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}

export function useAnimations() {
  const { triggerAnimation, clearAnimations, state } = useAnimationController();

  // Trigger code heal animation
  const codeHeal = useCallback((options: AnimationOptions = {}) => {
    triggerAnimation({
      type: 'codeHeal',
      duration: options.duration || 1500,
      delay: options.delay || 0,
      target: options.target,
      onComplete: options.onComplete,
    });
  }, [triggerAnimation]);

  // Trigger terminal glow animation
  const terminalGlow = useCallback((options: AnimationOptions = {}) => {
    triggerAnimation({
      type: 'terminalGlow',
      duration: options.duration || 2000,
      delay: options.delay || 0,
      target: options.target,
      onComplete: options.onComplete,
    });
  }, [triggerAnimation]);

  // Trigger ghost celebrate animation
  const ghostCelebrate = useCallback((options: AnimationOptions = {}) => {
    triggerAnimation({
      type: 'ghostCelebrate',
      duration: options.duration || 2000,
      delay: options.delay || 0,
      target: options.target,
      onComplete: options.onComplete,
    });
  }, [triggerAnimation]);

  // Trigger particle burst animation
  const particleBurst = useCallback((options: AnimationOptions = {}) => {
    triggerAnimation({
      type: 'particleBurst',
      duration: options.duration || 1500,
      delay: options.delay || 0,
      target: options.target,
      onComplete: options.onComplete,
    });
  }, [triggerAnimation]);

  // Trigger success sequence (all animations in order)
  const successSequence = useCallback((options: Omit<AnimationOptions, 'delay'> = {}) => {
    // Queue animations with delays for sequential effect
    codeHeal({ ...options, delay: 0 });
    terminalGlow({ ...options, delay: 500 });
    ghostCelebrate({ ...options, delay: 800 });
    particleBurst({ ...options, delay: 1200 });
  }, [codeHeal, terminalGlow, ghostCelebrate, particleBurst]);

  // Get current animation info
  const getCurrentAnimation = useCallback(() => {
    return state.currentAnimation;
  }, [state.currentAnimation]);

  // Check if animations are playing
  const isPlaying = useCallback(() => {
    return state.isPlaying;
  }, [state.isPlaying]);

  // Get queue length
  const getQueueLength = useCallback(() => {
    return state.queue.length;
  }, [state.queue.length]);

  return {
    // Individual animation triggers
    codeHeal,
    terminalGlow,
    ghostCelebrate,
    particleBurst,
    
    // Composite animations
    successSequence,
    
    // Utility functions
    clearAnimations,
    getCurrentAnimation,
    isPlaying,
    getQueueLength,
  };
}
