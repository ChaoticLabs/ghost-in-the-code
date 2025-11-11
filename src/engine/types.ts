/**
 * Core type definitions for Ghost in The Code game engine
 */

export interface CodeLine {
  lineNumber: number;
  content: string;
  isEditable: boolean;
  isBuggy: boolean;
}

export interface CodeFragment {
  lines: CodeLine[];
  buggyLines: number[];
}

export interface Solution {
  type: 'line-replacement';
  lineNumber: number;
  correctContent: string;
  alternativeCorrectContent?: string[];
}

export interface Challenge {
  id: string;
  type: 'loop' | 'conditional' | 'logic';
  title: string;
  description: string;
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
