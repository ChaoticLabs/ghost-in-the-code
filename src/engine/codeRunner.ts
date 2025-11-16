/**
 * Safe JavaScript code runner for validating challenge solutions
 * Uses a whitelist approach and proper sandboxing
 */

export interface RunResult {
  success: boolean;
  output: string;
  error?: string;
}

// Maximum number of console.log calls
const MAX_LOG_CALLS = 1000;

// Maximum output length
const MAX_OUTPUT_LENGTH = 10000;

// Maximum loop iterations
const MAX_LOOP_ITERATIONS = 100000;

/**
 * Creates a safe sandbox environment with only whitelisted globals
 */
function createSandbox(logs: string[], logCallCount: { count: number }) {
  // Whitelist of safe globals and built-ins
  const sandbox = {
    // Safe console
    console: {
      log: (...args: unknown[]) => {
        logCallCount.count++;
        if (logCallCount.count > MAX_LOG_CALLS) {
          throw new Error(`Too many console.log calls! Maximum is ${MAX_LOG_CALLS}.`);
        }
        
        const logMessage = args.map(arg => {
          try {
            return String(arg);
          } catch {
            return '[object]';
          }
        }).join(' ');
        
        if (logs.join('\n').length + logMessage.length > MAX_OUTPUT_LENGTH) {
          throw new Error(`Output too long! Maximum is ${MAX_OUTPUT_LENGTH} characters.`);
        }
        
        logs.push(logMessage);
      }
    },
    
    // Safe built-in constructors and functions
    Array,
    Object,
    String,
    Number,
    Boolean,
    Math,
    Date,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    
    // Explicitly undefined/blocked globals
    // Note: eval is automatically blocked by strict mode, so we don't include it here
    Function: undefined,
    setTimeout: undefined,
    setInterval: undefined,
    setImmediate: undefined,
    clearTimeout: undefined,
    clearInterval: undefined,
    clearImmediate: undefined,
    fetch: undefined,
    XMLHttpRequest: undefined,
    WebSocket: undefined,
    EventSource: undefined,
    Worker: undefined,
    SharedWorker: undefined,
    ServiceWorker: undefined,
    importScripts: undefined,
    navigator: undefined,
    window: undefined,
    document: undefined,
    localStorage: undefined,
    sessionStorage: undefined,
    indexedDB: undefined,
    location: undefined,
    history: undefined,
    alert: undefined,
    confirm: undefined,
    prompt: undefined,
    open: undefined,
    close: undefined,
    postMessage: undefined,
    
    // Block access to global this
    globalThis: undefined,
    self: undefined,
    top: undefined,
    parent: undefined,
    frames: undefined,
  };
  
  return sandbox;
}

/**
 * Instruments code to detect infinite loops
 * More robust version that handles various loop formats
 */
function instrumentCode(code: string): string {
  let instrumented = code;
  
  // Track loop iterations with a more robust counter
  const loopCheck = `
    let __loopIterations = 0;
    const __maxIterations = ${MAX_LOOP_ITERATIONS};
    function __checkLoop() {
      if (++__loopIterations > __maxIterations) {
        throw new Error('Infinite loop detected! Loop ran more than ' + __maxIterations + ' times.');
      }
    }
  `;
  
  // Insert loop check into while loops (handles multiline conditions)
  instrumented = instrumented.replace(
    /while\s*\([^)]*\)\s*\{/gs,
    (match) => match + '\n  __checkLoop();'
  );
  
  // Insert loop check into for loops (handles multiline)
  instrumented = instrumented.replace(
    /for\s*\([^)]*\)\s*\{/gs,
    (match) => match + '\n  __checkLoop();'
  );
  
  // Insert loop check into do-while loops
  instrumented = instrumented.replace(
    /do\s*\{/g,
    (match) => match + '\n  __checkLoop();'
  );
  
  // Handle single-line loops without braces (convert to braced version)
  instrumented = instrumented.replace(
    /while\s*\([^)]*\)\s*(?!{)([^\n;]+;?)/gs,
    (match, body) => {
      return match.replace(body, `{\n  __checkLoop();\n  ${body.trim()}\n}`);
    }
  );
  
  instrumented = instrumented.replace(
    /for\s*\([^)]*\)\s*(?!{)([^\n;]+;?)/gs,
    (match, body) => {
      return match.replace(body, `{\n  __checkLoop();\n  ${body.trim()}\n}`);
    }
  );
  
  return loopCheck + '\n' + instrumented;
}

/**
 * Safely runs JavaScript code with sandboxing and protection
 */
export function runCode(code: string): RunResult {
  const logs: string[] = [];
  const logCallCount = { count: 0 };
  
  try {
    // Instrument code to detect infinite loops
    const instrumentedCode = instrumentCode(code);
    
    // Create sandbox with whitelisted globals
    const sandbox = createSandbox(logs, logCallCount);
    
    // Get all sandbox keys for the function parameters
    const sandboxKeys = Object.keys(sandbox);
    const sandboxValues = sandboxKeys.map(key => sandbox[key as keyof typeof sandbox]);
    
    // Additional security: Block constructor chain access and network APIs
    const securityWrapper = `
      // Block access to constructor chain
      Object.freeze(Object.prototype);
      Object.freeze(Array.prototype);
      Object.freeze(String.prototype);
      Object.freeze(Number.prototype);
      Object.freeze(Boolean.prototype);
      
      // Override constructor property to prevent escaping sandbox
      const blockConstructor = (obj) => {
        try {
          Object.defineProperty(obj, 'constructor', {
            get: () => { throw new Error('Access to constructor is blocked for security.'); },
            set: () => { throw new Error('Access to constructor is blocked for security.'); }
          });
        } catch (e) {
          // Already frozen or non-configurable
        }
      };
      
      // Block common escape vectors
      if (typeof Object !== 'undefined') blockConstructor(Object);
      if (typeof Array !== 'undefined') blockConstructor(Array);
      if (typeof String !== 'undefined') blockConstructor(String);
      
      // Additional network API blocking (in case they try to access via this or other means)
      const blockNetworkAccess = () => {
        const blockedAPIs = ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'navigator'];
        blockedAPIs.forEach(api => {
          try {
            if (typeof this !== 'undefined' && this[api]) {
              this[api] = undefined;
            }
          } catch (e) {
            // Ignore errors
          }
        });
      };
      blockNetworkAccess();
    `;
    
    // Wrap code in an IIFE to prevent variable leakage
    const wrappedCode = `
      "use strict";
      ${securityWrapper}
      (function() {
        ${instrumentedCode}
      })();
    `;
    
    // Create function with sandbox as parameters
    // This prevents access to outer scope and global objects
    const func = new Function(...sandboxKeys, wrappedCode);
    
    // Execute with sandbox values
    func(...sandboxValues);
    
    return {
      success: true,
      output: logs.join('\n')
    };
  } catch (error) {
    // Check if it's a security-related error
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide user-friendly error messages
    if (errorMessage.includes('is not defined')) {
      const match = errorMessage.match(/(\w+) is not defined/);
      if (match) {
        const varName = match[1];
        // Check if it's a blocked global
        if (['window', 'document', 'eval', 'Function', 'setTimeout', 'setInterval', 'fetch'].includes(varName)) {
          return {
            success: false,
            output: logs.join('\n'),
            error: `'${varName}' is not available in this sandbox for security reasons.`
          };
        }
      }
    }
    
    return {
      success: false,
      output: logs.join('\n'),
      error: errorMessage
    };
  }
}

/**
 * Normalize output for comparison
 */
export function normalizeOutput(output: string): string {
  return output
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
