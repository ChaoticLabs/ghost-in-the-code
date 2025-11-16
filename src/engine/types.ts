/**
 * Core type definitions for Ghost in The Code game engine
 */

export interface CodeFragment {
  initialCode: string;
}

export interface Solution {
  type: 'output-match';
  expectedOutput: string;
  alternativeOutputs?: string[];
}

export interface LevelConcept {
  name: string;
  explanation: string;
}

export interface LevelIntroduction {
  title: string;
  description: string;
  concepts: LevelConcept[];
  readyMessage: string;
}

export interface Challenge {
  id: string;
  type: 'loop' | 'conditional' | 'logic';
  title: string;
  description: string;
  tip: string;
  codeFragment: CodeFragment;
  solution: Solution;
  hints: string[];
  educationalContent: string;
}

export interface Badge {
  id: string;
  name: string;
  concept: 'loop' | 'conditional' | 'logic';
  earnedDate: string;
  description: string;
  iconUrl: string;
}

export interface AssessmentMetrics {
  challengesCompleted: number;
  conceptMastery: Map<string, number>;
  averageAttempts: number;
  totalHintsUsed: number;
  timeSpentMinutes: number;
  lastActivity: string;
}

export interface GameState {
  currentLevel: number;
  currentChallenge: number;
  completedChallenges: Set<string>;
  hintsUsed: Map<string, number>;
  score: number;
  badges: Badge[];
  assessmentMetrics: AssessmentMetrics;
}
