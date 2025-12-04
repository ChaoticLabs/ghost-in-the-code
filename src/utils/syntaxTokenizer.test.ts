import { describe, it, expect } from 'vitest';
import { JavaScriptTokenizer, tokenizeJavaScript, type SyntaxToken } from './syntaxTokenizer';
import * as fc from 'fast-check';

describe('JavaScriptTokenizer', () => {
  it('should tokenize basic JavaScript keywords', () => {
    const code = 'function test() { return true; }';
    const tokens = tokenizeJavaScript(code);
    
    const keywordTokens = tokens.filter(t => t.type === 'keyword');
    expect(keywordTokens).toHaveLength(3);
    expect(keywordTokens[0].value).toBe('function');
    expect(keywordTokens[1].value).toBe('return');
    expect(keywordTokens[2].value).toBe('true');
  });

  it('should tokenize string literals', () => {
    const code = `"hello" 'world' \`template\``;
    const tokens = tokenizeJavaScript(code);
    
    const stringTokens = tokens.filter(t => t.type === 'string');
    expect(stringTokens).toHaveLength(3);
    expect(stringTokens[0].value).toBe('"hello"');
    expect(stringTokens[1].value).toBe("'world'");
    expect(stringTokens[2].value).toBe('`template`');
  });

  it('should tokenize numbers', () => {
    const code = '42 3.14 0xFF 1e10';
    const tokens = tokenizeJavaScript(code);
    
    const numberTokens = tokens.filter(t => t.type === 'number');
    expect(numberTokens).toHaveLength(4);
    expect(numberTokens[0].value).toBe('42');
    expect(numberTokens[1].value).toBe('3.14');
    expect(numberTokens[2].value).toBe('0xFF');
    expect(numberTokens[3].value).toBe('1e10');
  });

  it('should tokenize comments', () => {
    const code = `// single line comment
    /* multi line
       comment */`;
    const tokens = tokenizeJavaScript(code);
    
    const commentTokens = tokens.filter(t => t.type === 'comment');
    expect(commentTokens).toHaveLength(2);
    expect(commentTokens[0].value).toBe('// single line comment');
    expect(commentTokens[1].value).toContain('/* multi line');
  });

  it('should tokenize operators', () => {
    const code = '=== !== <= >= && || ++ --';
    const tokens = tokenizeJavaScript(code);
    
    const operatorTokens = tokens.filter(t => t.type === 'operator');
    expect(operatorTokens).toHaveLength(8);
    expect(operatorTokens[0].value).toBe('===');
    expect(operatorTokens[1].value).toBe('!==');
  });

  it('should tokenize punctuation', () => {
    const code = '{ } [ ] ( ) ; ,';
    const tokens = tokenizeJavaScript(code);
    
    const punctuationTokens = tokens.filter(t => t.type === 'punctuation');
    expect(punctuationTokens).toHaveLength(8);
  });

  it('should tokenize identifiers', () => {
    const code = 'myVariable _private $jquery';
    const tokens = tokenizeJavaScript(code);
    
    const identifierTokens = tokens.filter(t => t.type === 'identifier');
    expect(identifierTokens).toHaveLength(3);
    expect(identifierTokens[0].value).toBe('myVariable');
    expect(identifierTokens[1].value).toBe('_private');
    expect(identifierTokens[2].value).toBe('$jquery');
  });

  it('should handle escaped strings', () => {
    const code = '"hello \\"world\\"" \'it\\\'s working\'';
    const tokens = tokenizeJavaScript(code);
    
    const stringTokens = tokens.filter(t => t.type === 'string');
    expect(stringTokens).toHaveLength(2);
    expect(stringTokens[0].value).toBe('"hello \\"world\\""');
    expect(stringTokens[1].value).toBe("'it\\'s working'");
  });

  it('should handle template literals with expressions', () => {
    const code = '`Hello ${name}!`';
    const tokens = tokenizeJavaScript(code);
    
    const stringTokens = tokens.filter(t => t.type === 'string');
    expect(stringTokens).toHaveLength(1);
    expect(stringTokens[0].value).toBe('`Hello ${name}!`');
  });

  it('should track line and column positions', () => {
    const code = `function test() {
  return 42;
}`;
    const tokens = tokenizeJavaScript(code);
    
    const functionToken = tokens.find(t => t.value === 'function');
    expect(functionToken?.line).toBe(1);
    expect(functionToken?.column).toBe(1);
    
    const returnToken = tokens.find(t => t.value === 'return');
    expect(returnToken?.line).toBe(2);
    expect(returnToken?.column).toBe(3);
  });

  it('should handle complex JavaScript code', () => {
    const code = `
    function fibonacci(n) {
      // Base cases
      if (n <= 1) return n;
      
      /* Recursive case */
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    const result = fibonacci(10);
    console.log(\`Result: \${result}\`);
    `;
    
    const tokens = tokenizeJavaScript(code);
    
    // Should have various token types
    expect(tokens.some(t => t.type === 'keyword')).toBe(true);
    expect(tokens.some(t => t.type === 'identifier')).toBe(true);
    expect(tokens.some(t => t.type === 'number')).toBe(true);
    expect(tokens.some(t => t.type === 'comment')).toBe(true);
    expect(tokens.some(t => t.type === 'string')).toBe(true);
    expect(tokens.some(t => t.type === 'operator')).toBe(true);
    expect(tokens.some(t => t.type === 'punctuation')).toBe(true);
  });
});


/**
 * Feature: enhanced-code-editor, Property 1: Syntax highlighting consistency
 * 
 * For any JavaScript code input, all keywords should be classified as 'keyword',
 * strings as 'string', numbers as 'number', and comments as 'comment'.
 * This ensures consistent token classification for syntax highlighting.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 */
describe('Property-Based Tests', () => {
  it('should consistently classify JavaScript tokens across all inputs', () => {
    // Generators for different JavaScript elements
    const jsKeywordGen = fc.constantFrom(
      'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
      'return', 'true', 'false', 'null', 'class', 'new', 'this'
    );

    const jsStringGen = fc.oneof(
      fc.string().map(s => `"${s.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`),
      fc.string().map(s => `'${s.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`),
      fc.string().map(s => `\`${s.replace(/`/g, '\\`')}\``)
    );

    const jsNumberGen = fc.oneof(
      fc.integer().map(n => n.toString()),
      fc.double({ noNaN: true, noDefaultInfinity: true }).map(n => n.toString()),
      fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `0x${n.toString(16)}`)
    );

    const jsCommentGen = fc.oneof(
      fc.string().map(s => `// ${s.replace(/\n/g, ' ')}`),
      fc.string().map(s => `/* ${s.replace(/\*\//g, '')} */`)
    );

    const jsIdentifierGen = fc.stringMatching(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)
      .filter(s => !['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
        'return', 'true', 'false', 'null', 'class', 'new', 'this', 'break', 'continue',
        'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'typeof',
        'instanceof', 'void', 'delete', 'in', 'of', 'do', 'export', 'import',
        'from', 'as', 'async', 'await', 'yield', 'static', 'extends', 'super',
        'with', 'debugger', 'enum', 'implements', 'interface', 'package', 'private',
        'protected', 'public'].includes(s));

    // Generator for JavaScript code snippets
    const jsCodeGen = fc.array(
      fc.oneof(
        jsKeywordGen.map(k => ({ type: 'keyword' as const, value: k })),
        jsStringGen.map(s => ({ type: 'string' as const, value: s })),
        jsNumberGen.map(n => ({ type: 'number' as const, value: n })),
        jsCommentGen.map(c => ({ type: 'comment' as const, value: c })),
        jsIdentifierGen.map(i => ({ type: 'identifier' as const, value: i }))
      ),
      { minLength: 1, maxLength: 20 }
    ).map(elements => {
      // Join elements with spaces to create valid code
      return elements.map(e => e.value).join(' ');
    });

    fc.assert(
      fc.property(jsCodeGen, (code) => {
        const tokens = tokenizeJavaScript(code);
        
        // Filter out whitespace tokens for validation
        const nonWhitespaceTokens = tokens.filter(t => t.type !== 'whitespace');

        // Property 1: All keywords should be classified as 'keyword'
        const keywordPattern = /^(function|const|let|var|if|else|for|while|return|true|false|null|class|new|this|break|continue|switch|case|default|try|catch|finally|throw|typeof|instanceof|void|delete|in|of|do|export|import|from|as|async|await|yield|static|extends|super|with|debugger|enum|implements|interface|package|private|protected|public)$/;
        for (const token of nonWhitespaceTokens) {
          if (keywordPattern.test(token.value)) {
            expect(token.type).toBe('keyword');
          }
        }

        // Property 2: All strings should be classified as 'string'
        const stringPattern = /^["'`].*["'`]$/;
        for (const token of nonWhitespaceTokens) {
          if (stringPattern.test(token.value)) {
            expect(token.type).toBe('string');
          }
        }

        // Property 3: All numbers should be classified as 'number'
        const numberPattern = /^(\d+\.?\d*|\.\d+|0x[0-9a-fA-F]+|\d+e[+-]?\d+)$/;
        for (const token of nonWhitespaceTokens) {
          if (numberPattern.test(token.value) && token.value !== '.') {
            expect(token.type).toBe('number');
          }
        }

        // Property 4: All comments should be classified as 'comment'
        const commentPattern = /^(\/\/.*|\/\*[\s\S]*\*\/)$/;
        for (const token of nonWhitespaceTokens) {
          if (commentPattern.test(token.value)) {
            expect(token.type).toBe('comment');
          }
        }

        // Property 5: Token positions should be consistent
        // Each token's end position should match the next token's start (accounting for whitespace)
        for (let i = 0; i < tokens.length - 1; i++) {
          expect(tokens[i].end).toBeLessThanOrEqual(tokens[i + 1].start);
        }

        // Property 6: All tokens should have valid positions
        for (const token of tokens) {
          expect(token.start).toBeGreaterThanOrEqual(0);
          expect(token.end).toBeGreaterThan(token.start);
          expect(token.line).toBeGreaterThanOrEqual(1);
          expect(token.column).toBeGreaterThanOrEqual(1);
        }
      }),
      { numRuns: 100 }
    );
  });
});
