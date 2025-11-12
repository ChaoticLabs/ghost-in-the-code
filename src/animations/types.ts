/**
 * Animation type definitions for Ghost in The Code
 */

export type AnimationType = 
  | 'codeHeal'
  | 'terminalGlow'
  | 'ghostCelebrate'
  | 'particleBurst';

export interface AnimationEvent {
  id: string;
  type: AnimationType;
  target?: string; // Optional target element selector or identifier
  duration?: number; // Duration in milliseconds
  delay?: number; // Delay before starting in milliseconds
  onComplete?: () => void;
}

export interface AnimationQueueItem extends AnimationEvent {
  status: 'pending' | 'playing' | 'completed';
  startTime?: number;
}

export interface AnimationState {
  queue: AnimationQueueItem[];
  currentAnimation: AnimationQueueItem | null;
  isPlaying: boolean;
}
