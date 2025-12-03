/**
 * Demo of the enhanced validation system
 * Run with: npx tsx validation-demo.ts
 */

import { validateSolution } from './src/engine/solutionValidator';
import type { Solution } from './src/engine/types';

// Example challenge solution
const passwordSolution: Solution = {
  type: 'output-match',
  expectedOutput: 'Password is strong!',
  alternativeOutputs: []
};

console.log('🎮 Ghost in The Code - Enhanced Validation Demo\n');

// Test 1: Cheating attempt (just changing console.log)
console.log('❌ Test 1: Cheating attempt');
const cheatingCode = `
let password = 'Sp00ky12';
let isStrong = password.length > 8;
if (isStrong) {
  console.log('Password is strong!'); // Changed output
} else {
  console.log('Password is strong!'); // Changed this too!
}`;

const cheatingResult = validateSolution(cheatingCode, passwordSolution, undefined, 'cyber-basic-1');
console.log(`Result: ${cheatingResult.isCorrect ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Feedback: ${cheatingResult.feedback}`);
console.log(`Method: ${cheatingResult.validationMethod}\n`);

// Test 2: Legitimate fix
console.log('✅ Test 2: Legitimate fix');
const legitimateCode = `
let password = 'Sp00ky12';
let isStrong = password.length >= 8; // Fixed the operator!
if (isStrong) {
  console.log('Password is strong!');
} else {
  console.log('Password is too weak!');
}`;

const legitimateResult = validateSolution(legitimateCode, passwordSolution, undefined, 'cyber-basic-1');
console.log(`Result: ${legitimateResult.isCorrect ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Feedback: ${legitimateResult.feedback}`);
console.log(`Method: ${legitimateResult.validationMethod}\n`);

// Test 3: Authentication challenge
console.log('🔐 Test 3: Authentication challenge');
const authSolution: Solution = {
  type: 'output-match',
  expectedOutput: 'Access granted!',
  alternativeOutputs: []
};

const authCode = `
let username = 'ghost';
let password = 'boo123';
let correctUser = 'ghost';
let correctPass = 'boo123';

if (username === correctUser && password === correctPass) { // Fixed && operator
  console.log('Access granted!');
} else {
  console.log('Access denied!');
}`;

const authResult = validateSolution(authCode, authSolution, undefined, 'cyber-basic-2');
console.log(`Result: ${authResult.isCorrect ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Feedback: ${authResult.feedback}`);
console.log(`Method: ${authResult.validationMethod}`);

console.log('\n🎉 Demo complete! The validation system successfully:');
console.log('• Detects when users just change console.log output');
console.log('• Validates that actual code logic was fixed');
console.log('• Provides helpful feedback to guide learning');
console.log('• Works flexibly across different challenge types');