/**
 * Lightweight JavaScript syntax tokenizer for the enhanced code editor
 * Identifies keywords, strings, numbers, comments, operators, and identifiers
 */

export interface SyntaxToken {
  type: TokenType;
  value: string;
  start: number;
  end: number;
  line: number;
  column: number;
}

export type TokenType = 
  | 'keyword'     // if, for, function, const, let, var, etc.
  | 'string'      // "text", 'text', `template`
  | 'number'      // 123, 3.14, 0xFF
  | 'comment'     // // single line, /* multi line */
  | 'operator'    // +, -, *, /, =, ==, ===, etc.
  | 'punctuation' // {}, [], (), ;, :, ,
  | 'identifier'  // variable names, function names
  | 'whitespace'  // spaces, tabs, newlines
  | 'unknown';    // fallback for unrecognized tokens

// JavaScript keywords for syntax highlighting
const JAVASCRIPT_KEYWORDS = new Set([
  'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
  'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
  'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final',
  'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
  'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new',
  'null', 'package', 'private', 'protected', 'public', 'return', 'short',
  'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while',
  'with', 'yield'
]);

// Operators and punctuation patterns
const OPERATORS = [
  '===', '!==', '==', '!=', '<=', '>=', '<<', '>>', '>>>', '&&', '||',
  '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=',
  '=>', '...', '??', '?.', '**', '<', '>', '+', '-', '*', '/', '%', '=',
  '!', '&', '|', '^', '~', '?', ':'
];

const PUNCTUATION = ['{', '}', '[', ']', '(', ')', ';', ',', '.'];

export class JavaScriptTokenizer {
  private code: string;
  private position: number;
  private line: number;
  private column: number;
  private tokens: SyntaxToken[];

  constructor(code: string) {
    this.code = code;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  /**
   * Tokenize the entire code string
   */
  public tokenize(): SyntaxToken[] {
    this.tokens = [];
    this.position = 0;
    this.line = 1;
    this.column = 1;

    while (this.position < this.code.length) {
      this.tokenizeNext();
    }

    return this.tokens;
  }

  private tokenizeNext(): void {
    const char = this.code[this.position];

    // Skip whitespace but track position
    if (this.isWhitespace(char)) {
      this.tokenizeWhitespace();
      return;
    }

    // Comments
    if (char === '/' && this.peek() === '/') {
      this.tokenizeSingleLineComment();
      return;
    }

    if (char === '/' && this.peek() === '*') {
      this.tokenizeMultiLineComment();
      return;
    }

    // Strings
    if (char === '"' || char === "'") {
      this.tokenizeString(char);
      return;
    }

    // Template literals
    if (char === '`') {
      this.tokenizeTemplateLiteral();
      return;
    }

    // Numbers
    if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek()))) {
      this.tokenizeNumber();
      return;
    }

    // Operators (check multi-character first)
    const operatorToken = this.tokenizeOperator();
    if (operatorToken) {
      return;
    }

    // Punctuation
    if (PUNCTUATION.includes(char)) {
      this.addToken('punctuation', char);
      this.advance();
      return;
    }

    // Identifiers and keywords
    if (this.isIdentifierStart(char)) {
      this.tokenizeIdentifier();
      return;
    }

    // Unknown character - treat as single character token
    this.addToken('unknown', char);
    this.advance();
  }

  private tokenizeWhitespace(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    while (this.position < this.code.length && this.isWhitespace(this.code[this.position])) {
      if (this.code[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }

    const value = this.code.substring(start, this.position);
    this.tokens.push({
      type: 'whitespace',
      value,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }

  private tokenizeSingleLineComment(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    // Skip '//'
    this.advance();
    this.advance();

    // Read until end of line
    while (this.position < this.code.length && this.code[this.position] !== '\n') {
      this.advance();
    }

    const value = this.code.substring(start, this.position);
    this.tokens.push({
      type: 'comment',
      value,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }

  private tokenizeMultiLineComment(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    // Skip '/*'
    this.advance();
    this.advance();

    // Read until '*/'
    while (this.position < this.code.length - 1) {
      if (this.code[this.position] === '*' && this.code[this.position + 1] === '/') {
        this.advance();
        this.advance();
        break;
      }
      this.advance();
    }

    const value = this.code.substring(start, this.position);
    this.tokens.push({
      type: 'comment',
      value,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }

  private tokenizeString(quote: string): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    // Skip opening quote
    this.advance();

    while (this.position < this.code.length) {
      const char = this.code[this.position];

      if (char === quote) {
        // Found closing quote
        this.advance();
        break;
      }

      if (char === '\\') {
        // Skip escaped character
        this.advance();
        if (this.position < this.code.length) {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    const value = this.code.substring(start, this.position);
    this.tokens.push({
      type: 'string',
      value,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }

  private tokenizeTemplateLiteral(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    // Skip opening backtick
    this.advance();

    while (this.position < this.code.length) {
      const char = this.code[this.position];

      if (char === '`') {
        // Found closing backtick
        this.advance();
        break;
      }

      if (char === '\\') {
        // Skip escaped character
        this.advance();
        if (this.position < this.code.length) {
          this.advance();
        }
      } else if (char === '$' && this.peek() === '{') {
        // Handle template expression - for now, just skip to closing brace
        this.advance(); // $
        this.advance(); // {
        let braceCount = 1;
        
        while (this.position < this.code.length && braceCount > 0) {
          const current = this.code[this.position];
          if (current === '{') braceCount++;
          else if (current === '}') braceCount--;
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    const value = this.code.substring(start, this.position);
    this.tokens.push({
      type: 'string',
      value,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }

  private tokenizeNumber(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    // Handle hex numbers (0x...)
    if (this.code[this.position] === '0' && 
        (this.peek() === 'x' || this.peek() === 'X')) {
      this.advance(); // 0
      this.advance(); // x
      while (this.position < this.code.length && this.isHexDigit(this.code[this.position])) {
        this.advance();
      }
    } else {
      // Regular decimal numbers
      while (this.position < this.code.length && this.isDigit(this.code[this.position])) {
        this.advance();
      }

      // Handle decimal point
      if (this.position < this.code.length && 
          this.code[this.position] === '.' && 
          this.isDigit(this.peek())) {
        this.advance(); // .
        while (this.position < this.code.length && this.isDigit(this.code[this.position])) {
          this.advance();
        }
      }

      // Handle scientific notation
      if (this.position < this.code.length && 
          (this.code[this.position] === 'e' || this.code[this.position] === 'E')) {
        this.advance(); // e/E
        if (this.position < this.code.length && 
            (this.code[this.position] === '+' || this.code[this.position] === '-')) {
          this.advance(); // +/-
        }
        while (this.position < this.code.length && this.isDigit(this.code[this.position])) {
          this.advance();
        }
      }
    }

    const value = this.code.substring(start, this.position);
    this.tokens.push({
      type: 'number',
      value,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }

  private tokenizeOperator(): boolean {
    // Check for multi-character operators first (longest match)
    for (const op of OPERATORS.sort((a, b) => b.length - a.length)) {
      if (this.code.substring(this.position, this.position + op.length) === op) {
        this.addToken('operator', op);
        for (let i = 0; i < op.length; i++) {
          this.advance();
        }
        return true;
      }
    }
    return false;
  }

  private tokenizeIdentifier(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;

    while (this.position < this.code.length && this.isIdentifierPart(this.code[this.position])) {
      this.advance();
    }

    const value = this.code.substring(start, this.position);
    const type = JAVASCRIPT_KEYWORDS.has(value) ? 'keyword' : 'identifier';

    this.tokens.push({
      type,
      value,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }

  private addToken(type: TokenType, value: string): void {
    this.tokens.push({
      type,
      value,
      start: this.position,
      end: this.position + value.length,
      line: this.line,
      column: this.column
    });
  }

  private advance(): void {
    if (this.position < this.code.length) {
      if (this.code[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private peek(): string {
    return this.position + 1 < this.code.length ? this.code[this.position + 1] : '';
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isHexDigit(char: string): boolean {
    return /[0-9a-fA-F]/.test(char);
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_$]/.test(char);
  }

  private isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_$]/.test(char);
  }
}

/**
 * Convenience function to tokenize JavaScript code
 */
export function tokenizeJavaScript(code: string): SyntaxToken[] {
  const tokenizer = new JavaScriptTokenizer(code);
  return tokenizer.tokenize();
}