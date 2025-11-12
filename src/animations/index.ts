/**
 * Animation System Exports
 * 
 * Central export point for the animation system including:
 * - AnimationProvider and useAnimationController for context management
 * - useAnimations hook for convenient animation triggering
 * - Type definitions for animation events and states
 */

export { AnimationProvider, useAnimationController } from './AnimationController';
export { useAnimations } from './useAnimations';
export type { 
  AnimationType, 
  AnimationEvent, 
  AnimationQueueItem, 
  AnimationState 
} from './types';
export type { AnimationOptions } from './useAnimations';
