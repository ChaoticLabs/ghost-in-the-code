/**
 * Tests for high-contrast mode utilities
 */

import { describe, it, expect } from 'vitest';
import {
  detectSystemHighContrast,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  highContrastColors,
  validateHighContrastColors,
} from './highContrast';

describe('High-Contrast Utilities', () => {
  describe('detectSystemHighContrast', () => {
    it('should return a boolean value', () => {
      const result = detectSystemHighContrast();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate correct contrast ratio for same colors', () => {
      const ratio = calculateContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should handle hex colors correctly', () => {
      const ratio = calculateContrastRatio('#C792EA', '#0D1117');
      expect(ratio).toBeGreaterThan(1);
    });

    it('should handle rgb colors correctly', () => {
      const ratio = calculateContrastRatio('rgb(199, 146, 234)', 'rgb(13, 17, 23)');
      expect(ratio).toBeGreaterThan(1);
    });
  });

  describe('meetsWCAGAA', () => {
    it('should pass for high contrast combinations', () => {
      expect(meetsWCAGAA('#FFFFFF', '#000000')).toBe(true);
    });

    it('should fail for low contrast combinations', () => {
      expect(meetsWCAGAA('#888888', '#999999')).toBe(false);
    });

    it('should use different thresholds for large text', () => {
      // A ratio that passes for large text but not normal text
      const foreground = '#777777';
      const background = '#FFFFFF';
      const ratio = calculateContrastRatio(foreground, background);
      
      // Should be between 3:1 and 4.5:1
      expect(ratio).toBeGreaterThan(3);
      expect(ratio).toBeLessThanOrEqual(4.5);
      
      expect(meetsWCAGAA(foreground, background, true)).toBe(true);
      expect(meetsWCAGAA(foreground, background, false)).toBe(false);
    });
  });

  describe('meetsWCAGAAA', () => {
    it('should pass for very high contrast combinations', () => {
      expect(meetsWCAGAAA('#FFFFFF', '#000000')).toBe(true);
    });

    it('should fail for moderate contrast combinations', () => {
      expect(meetsWCAGAAA('#888888', '#FFFFFF')).toBe(false);
    });
  });

  describe('highContrastColors', () => {
    it('should have all required color properties', () => {
      expect(highContrastColors).toHaveProperty('background');
      expect(highContrastColors).toHaveProperty('foreground');
      expect(highContrastColors).toHaveProperty('keyword');
      expect(highContrastColors).toHaveProperty('string');
      expect(highContrastColors).toHaveProperty('number');
      expect(highContrastColors).toHaveProperty('comment');
      expect(highContrastColors).toHaveProperty('operator');
      expect(highContrastColors).toHaveProperty('punctuation');
      expect(highContrastColors).toHaveProperty('identifier');
      expect(highContrastColors).toHaveProperty('lineNumber');
      expect(highContrastColors).toHaveProperty('lineNumberActive');
    });

    it('should use valid hex color format', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      Object.values(highContrastColors).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe('validateHighContrastColors', () => {
    it('should validate that all colors meet WCAG AA standards', () => {
      const isValid = validateHighContrastColors();
      expect(isValid).toBe(true);
    });

    it('should verify each color individually meets WCAG AA', () => {
      const { background } = highContrastColors;
      
      expect(meetsWCAGAA(highContrastColors.keyword, background)).toBe(true);
      expect(meetsWCAGAA(highContrastColors.string, background)).toBe(true);
      expect(meetsWCAGAA(highContrastColors.number, background)).toBe(true);
      expect(meetsWCAGAA(highContrastColors.comment, background)).toBe(true);
      expect(meetsWCAGAA(highContrastColors.operator, background)).toBe(true);
      expect(meetsWCAGAA(highContrastColors.identifier, background)).toBe(true);
      expect(meetsWCAGAA(highContrastColors.lineNumber, background)).toBe(true);
    });
  });
});
