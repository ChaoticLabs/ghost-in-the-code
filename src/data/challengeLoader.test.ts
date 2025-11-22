/**
 * Tests for challenge loader
 * Validates that challenges load correctly and validation works
 */

import { describe, it, expect } from 'vitest';
import {
  loadAllChallenges,
  getChallengesByType,
  getChallengeById,
  getAllChallengesFlat,
  getChallengeCount
} from './challengeLoader';

describe('Challenge Loader', () => {
  it('should load all challenges without errors', () => {
    const challenges = loadAllChallenges();
    expect(challenges).toBeDefined();
    expect(challenges.size).toBe(6); // loops, conditionals, logic, arrays, functions, cybersecurity
  });

  it('should load loops challenges', () => {
    const loops = getChallengesByType('loop');
    expect(loops.length).toBeGreaterThan(0);
    expect(loops[0].type).toBe('loop');
  });

  it('should load conditionals challenges', () => {
    const conditionals = getChallengesByType('conditional');
    expect(conditionals.length).toBeGreaterThan(0);
    expect(conditionals[0].type).toBe('conditional');
  });

  it('should load logic challenges', () => {
    const logic = getChallengesByType('logic');
    expect(logic.length).toBeGreaterThan(0);
    expect(logic[0].type).toBe('logic');
  });

  it('should get challenge by ID', () => {
    const challenge = getChallengeById('loop-basic-1');
    expect(challenge).toBeDefined();
    expect(challenge?.id).toBe('loop-basic-1');
    expect(challenge?.type).toBe('loop');
  });

  it('should return undefined for non-existent challenge ID', () => {
    const challenge = getChallengeById('non-existent-id');
    expect(challenge).toBeUndefined();
  });

  it('should get all challenges as flat array', () => {
    const allChallenges = getAllChallengesFlat();
    expect(allChallenges.length).toBeGreaterThan(0);
    expect(Array.isArray(allChallenges)).toBe(true);
  });

  it('should get correct challenge counts', () => {
    const counts = getChallengeCount();
    expect(counts.loops).toBeGreaterThan(0);
    expect(counts.conditionals).toBeGreaterThan(0);
    expect(counts.logic).toBeGreaterThan(0);
    expect(counts.total).toBeGreaterThan(0);
    // Total should be sum of all challenge types
    expect(counts.total).toBeGreaterThanOrEqual(counts.loops + counts.conditionals + counts.logic);
  });

  it('should validate challenge structure', () => {
    const challenges = getAllChallengesFlat();
    
    challenges.forEach(challenge => {
      // Required fields
      expect(challenge.id).toBeDefined();
      expect(challenge.type).toMatch(/^(loop|conditional|logic|array|function|cybersecurity)$/);
      expect(challenge.title).toBeDefined();
      expect(challenge.description).toBeDefined();
      
      // Code fragment
      expect(challenge.codeFragment).toBeDefined();
      expect(typeof challenge.codeFragment).toBe('object');
      
      // Solution
      expect(challenge.solution).toBeDefined();
      expect(challenge.solution.type).toBe('output-match');
      expect(challenge.solution.expectedOutput).toBeDefined();
      
      // Hints
      expect(Array.isArray(challenge.hints)).toBe(true);
      expect(challenge.hints.length).toBeGreaterThan(0);
      
      // Educational content
      expect(challenge.educationalContent).toBeDefined();
    });
  });
});
