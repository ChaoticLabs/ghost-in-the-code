/**
 * Level loader - loads level metadata and calculates progress
 */

import type { Challenge } from '../engine/types';
import levelsConfig from './levels.json';

// Dynamically derive LevelType from levels.json
export type LevelType = typeof levelsConfig[number]['type'];

export interface LevelConfig {
  type: LevelType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface LevelInfo extends LevelConfig {
  challengeCount: number;
  completedCount: number;
}

/**
 * Gets all valid level types from configuration
 */
export function getAllLevelTypes(): LevelType[] {
  return levelsConfig.map(l => l.type) as LevelType[];
}

/**
 * Gets level name with icon
 */
export function getLevelName(levelType: LevelType): string {
  const level = levelsConfig.find(l => l.type === levelType);
  return level ? `${level.title} ${level.icon}` : 'Level';
}

/**
 * Gets all level configurations
 */
export function getAllLevelConfigs(): LevelConfig[] {
  return levelsConfig as LevelConfig[];
}

/**
 * Gets level info with progress data
 */
export function getLevelInfo(
  allChallenges: Challenge[],
  completedChallengeIds: Set<string>
): LevelInfo[] {
  return levelsConfig.map(level => ({
    ...level,
    type: level.type,
    challengeCount: allChallenges.filter(c => c.type === level.type).length,
    completedCount: Array.from(completedChallengeIds).filter(id =>
      allChallenges.find(c => c.id === id && c.type === level.type)
    ).length
  }));
}
