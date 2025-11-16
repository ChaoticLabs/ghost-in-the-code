/**
 * Tests for code runner security
 */

import { runCode } from '../codeRunner';

describe('Code Runner Security', () => {
  describe('Network API Blocking', () => {
    test('blocks fetch API', () => {
      const code = `
        try {
          fetch('https://example.com');
          console.log('FAIL: fetch was not blocked');
        } catch (e) {
          console.log('PASS: fetch is blocked');
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toContain('PASS');
    });

    test('blocks XMLHttpRequest', () => {
      const code = `
        try {
          new XMLHttpRequest();
          console.log('FAIL: XMLHttpRequest was not blocked');
        } catch (e) {
          console.log('PASS: XMLHttpRequest is blocked');
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toContain('PASS');
    });

    test('blocks WebSocket', () => {
      const code = `
        try {
          new WebSocket('ws://example.com');
          console.log('FAIL: WebSocket was not blocked');
        } catch (e) {
          console.log('PASS: WebSocket is blocked');
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toContain('PASS');
    });
  });

  describe('Dangerous API Blocking', () => {
    test('blocks eval', () => {
      const code = `
        try {
          eval('console.log("evil")');
          console.log('FAIL: eval was not blocked');
        } catch (e) {
          console.log('PASS: eval is blocked');
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toContain('PASS');
    });

    test('blocks Function constructor', () => {
      const code = `
        try {
          new Function('return 1')();
          console.log('FAIL: Function was not blocked');
        } catch (e) {
          console.log('PASS: Function is blocked');
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toContain('PASS');
    });

    test('blocks setTimeout', () => {
      const code = `
        try {
          setTimeout(() => {}, 100);
          console.log('FAIL: setTimeout was not blocked');
        } catch (e) {
          console.log('PASS: setTimeout is blocked');
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toContain('PASS');
    });
  });

  describe('Infinite Loop Protection', () => {
    test('detects infinite while loop', () => {
      const code = `
        let i = 0;
        while (true) {
          i++;
        }
        console.log('Should not reach here');
      `;
      const result = runCode(code);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Infinite loop detected');
    });

    test('detects infinite for loop', () => {
      const code = `
        for (let i = 0; i < 10; i--) {
          // This will never end
        }
        console.log('Should not reach here');
      `;
      const result = runCode(code);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Infinite loop detected');
    });

    test('allows normal loops', () => {
      const code = `
        for (let i = 0; i < 5; i++) {
          console.log(i);
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toBe('0\n1\n2\n3\n4');
    });
  });

  describe('Resource Limits', () => {
    test('limits console.log calls', () => {
      const code = `
        for (let i = 0; i < 2000; i++) {
          console.log(i);
        }
      `;
      const result = runCode(code);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many console.log calls');
    });

    test('limits output length', () => {
      const code = `
        let longString = 'a'.repeat(20000);
        console.log(longString);
      `;
      const result = runCode(code);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Output too long');
    });
  });

  describe('Safe Code Execution', () => {
    test('executes valid code correctly', () => {
      const code = `
        let x = 5;
        let y = 10;
        console.log(x + y);
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toBe('15');
    });

    test('allows array operations', () => {
      const code = `
        let arr = [1, 2, 3];
        console.log(arr.length);
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toBe('3');
    });

    test('allows Math operations', () => {
      const code = `
        console.log(Math.max(5, 10));
      `;
      const result = runCode(code);
      expect(result.success).toBe(true);
      expect(result.output).toBe('10');
    });
  });
});
