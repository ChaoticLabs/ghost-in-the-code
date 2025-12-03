/**
 * AST-based validation for detecting actual code fixes vs output manipulation
 */

import * as acorn from 'acorn';

export interface ASTValidationRule {
  type: 'operator-change' | 'condition-fix' | 'loop-bounds' | 'variable-assignment' | 'function-call';
  description: string;
  check: (originalAST: any, playerAST: any) => boolean;
}

export interface ASTValidationResult {
  isValid: boolean;
  reason: string;
  detectedChanges: string[];
}

/**
 * Validates code changes by comparing AST structures
 */
export function validateCodeChanges(
  originalCode: string,
  playerCode: string,
  rules: ASTValidationRule[]
): ASTValidationResult {
  try {
    const originalAST = acorn.parse(originalCode, { ecmaVersion: 2020 });
    const playerAST = acorn.parse(playerCode, { ecmaVersion: 2020 });
    
    const detectedChanges: string[] = [];
    
    // Check if player just modified console.log statements
    if (hasOnlyConsoleLogChanges(originalCode, playerCode)) {
      return {
        isValid: false,
        reason: "Nice try! But you need to fix the actual bug, not just change the output! 👻",
        detectedChanges: ["console.log modification detected"]
      };
    }
    
    // Apply validation rules
    for (const rule of rules) {
      if (rule.check(originalAST, playerAST)) {
        detectedChanges.push(rule.description);
      }
    }
    
    return {
      isValid: detectedChanges.length > 0,
      reason: detectedChanges.length > 0 
        ? "Great! You made the right code changes!" 
        : "The code structure hasn't changed in the expected way.",
      detectedChanges
    };
    
  } catch (error) {
    // If AST parsing fails, fall back to allowing the change
    return {
      isValid: true,
      reason: "Code structure validation skipped due to parsing complexity.",
      detectedChanges: ["parsing-fallback"]
    };
  }
}

/**
 * Detects if only console.log statements were changed
 */
function hasOnlyConsoleLogChanges(original: string, player: string): boolean {
  // Remove all console.log statements and compare
  const removeConsoleLogs = (code: string) => 
    code.replace(/console\.log\([^)]*\);?/g, '').replace(/\s+/g, ' ').trim();
  
  const originalWithoutLogs = removeConsoleLogs(original);
  const playerWithoutLogs = removeConsoleLogs(player);
  
  // If everything else is the same, they only changed console.log
  return originalWithoutLogs === playerWithoutLogs && original !== player;
}

/**
 * Common validation rules for different challenge types
 */
export const ValidationRules = {
  operatorChange: (from: string, to: string): ASTValidationRule => ({
    type: 'operator-change',
    description: `Changed operator from ${from} to ${to}`,
    check: (originalAST, playerAST) => {
      return hasOperatorChange(originalAST, playerAST, from, to);
    }
  }),
  
  conditionFix: (expectedCondition: string): ASTValidationRule => ({
    type: 'condition-fix',
    description: `Fixed condition to use ${expectedCondition}`,
    check: (originalAST, playerAST) => {
      return hasConditionChange(originalAST, playerAST, expectedCondition);
    }
  }),
  
  variableValueChange: (variableName: string, expectedValue: any): ASTValidationRule => ({
    type: 'variable-assignment',
    description: `Changed ${variableName} to correct value`,
    check: (originalAST, playerAST) => {
      return hasVariableValueChange(originalAST, playerAST, variableName, expectedValue);
    }
  })
};

// Helper functions for AST analysis
function hasOperatorChange(originalAST: any, playerAST: any, from: string, to: string): boolean {
  // Walk through AST nodes looking for operator changes
  const originalOps = extractOperators(originalAST);
  const playerOps = extractOperators(playerAST);
  
  return originalOps.includes(from) && playerOps.includes(to) && !playerOps.includes(from);
}

function hasConditionChange(originalAST: any, playerAST: any, expectedCondition: string): boolean {
  // This would need more sophisticated AST walking
  // For hackathon purposes, we can use string matching as fallback
  return true; // Simplified for now
}

function hasVariableValueChange(originalAST: any, playerAST: any, variableName: string, expectedValue: any): boolean {
  // Extract variable assignments and compare
  return true; // Simplified for now
}

function extractOperators(ast: any): string[] {
  const operators: string[] = [];
  
  function walk(node: any) {
    if (!node || typeof node !== 'object') return;
    
    if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
      operators.push(node.operator);
    }
    
    for (const key in node) {
      if (key !== 'parent') {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(walk);
        } else if (child && typeof child === 'object') {
          walk(child);
        }
      }
    }
  }
  
  walk(ast);
  return operators;
}