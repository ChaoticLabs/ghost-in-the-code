# Security

## Code Sandbox Security

Ghost in The Code implements multiple layers of security to safely execute user-provided JavaScript code.

## Security Layers

### 1. Whitelist-Based Sandbox

Only explicitly allowed globals are available:
- `Array`, `Object`, `String`, `Number`, `Boolean`
- `Math`, `Date`, `JSON`
- `console` (with output limits)

All dangerous APIs are explicitly set to `undefined`:

**Code Execution:**
- `eval`
- `Function` constructor

**Timing:**
- `setTimeout`
- `setInterval`
- `setImmediate`

**Network:**
- `fetch`
- `XMLHttpRequest`
- `WebSocket`
- `EventSource`

**Workers:**
- `Worker`
- `SharedWorker`
- `ServiceWorker`
- `importScripts`

**Browser APIs:**
- `window`
- `document`
- `localStorage`
- `sessionStorage`
- `indexedDB`
- `navigator`

**Navigation:**
- `location`
- `history`
- `open`
- `close`

**User Interaction:**
- `alert`
- `confirm`
- `prompt`

**Global Access:**
- `globalThis`
- `self`
- `top`
- `parent`
- `frames`

### 2. Infinite Loop Protection

All loops are automatically instrumented with iteration counters:

```javascript
// User code:
for (let i = 0; i < 1000000; i++) {
  console.log(i);
}

// Transformed code:
let __loopCount = 0;
for (let i = 0; i < 1000000; i++) {
  if (++__loopCount > 100000) {
    throw new Error('Loop exceeded maximum iterations');
  }
  console.log(i);
}
```

**Maximum:** 100,000 iterations per execution

**Supported loops:**
- `while` loops
- `for` loops
- `do-while` loops
- Both braced and single-line loops

### 3. Resource Limits

**Console Output:**
- Maximum 1,000 `console.log()` calls
- Maximum 10,000 characters total output
- Prevents memory exhaustion

**Execution Time:**
- Iteration limits prevent long-running code
- No explicit timeout (relies on iteration limits)

### 4. Constructor Chain Protection

Prevents sandbox escape via prototype chain:

```javascript
// Freeze prototypes
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);
Object.freeze(String.prototype);
Object.freeze(Number.prototype);
Object.freeze(Boolean.prototype);

// Block constructor access
Object.defineProperty(Object.prototype, 'constructor', {
  get: () => undefined
});
```

### 5. Strict Mode Execution

All code runs in JavaScript strict mode:
- Prevents accidental global variable creation
- Catches common coding errors
- Disables dangerous features

```javascript
'use strict';
// User code here
```

### 6. Isolated Scope

Code runs in an IIFE (Immediately Invoked Function Expression):

```javascript
(function() {
  'use strict';
  // User code here
  // No access to outer scope
})();
```

## Implementation

### Sandbox Wrapper

```typescript
function executeSandboxedCode(code: string): ExecutionResult {
  // 1. Instrument loops
  const instrumentedCode = instrumentLoops(code);
  
  // 2. Create sandbox environment
  const sandbox = {
    console: createLimitedConsole(),
    Array, Object, String, Number, Boolean,
    Math, Date, JSON
  };
  
  // 3. Execute in isolated scope
  const wrappedCode = `
    'use strict';
    (function() {
      ${instrumentedCode}
    })();
  `;
  
  try {
    const fn = new Function(...Object.keys(sandbox), wrappedCode);
    fn(...Object.values(sandbox));
    return { success: true, output: getConsoleOutput() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Known Limitations

While these measures provide strong protection for a learning environment, they are **not 100% bulletproof**:

1. **Not a True Sandbox**
   - JavaScript's `Function` constructor cannot create truly isolated environments
   - Determined attackers might find escape vectors

2. **Browser Context**
   - Code still runs in the browser's JavaScript engine
   - Shares memory space with the application

3. **CPU Usage**
   - Malicious code could still consume CPU cycles
   - Mitigated by iteration limits but not eliminated

4. **Memory Usage**
   - Large data structures could consume memory
   - No explicit memory limits enforced

## Recommendations for Production

If deploying this application publicly, consider:

### 1. Web Workers
Move code execution to a Web Worker for better isolation:
```typescript
const worker = new Worker('sandbox-worker.js');
worker.postMessage({ code: userCode });
worker.onmessage = (e) => {
  handleResult(e.data);
};
```

### 2. Server-Side Execution
Use a proper sandboxed environment:
- **VM2** - Secure sandbox for Node.js
- **isolated-vm** - V8 isolates for true isolation
- **Docker containers** - OS-level isolation

### 3. Rate Limiting
Implement rate limiting on code execution:
- Limit executions per user per minute
- Implement cooldown periods
- Track and block abusive patterns

### 4. Content Security Policy
Add CSP headers to prevent XSS:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

### 5. Monitoring
Log and monitor code execution:
- Track execution times
- Log errors and exceptions
- Alert on suspicious patterns
- Implement abuse detection

## Testing Security

### Test Escape Attempts

```typescript
describe('Sandbox Security', () => {
  it('should block access to window', () => {
    const code = 'console.log(window);';
    const result = executeSandboxedCode(code);
    expect(result.output).toContain('undefined');
  });
  
  it('should block eval', () => {
    const code = 'eval("alert(1)");';
    const result = executeSandboxedCode(code);
    expect(result.success).toBe(false);
  });
  
  it('should prevent infinite loops', () => {
    const code = 'while(true) {}';
    const result = executeSandboxedCode(code);
    expect(result.success).toBe(false);
    expect(result.error).toContain('maximum iterations');
  });
});
```

## For Developers

When adding new features:

1. **Never add new globals** without security review
2. **Test escape vectors** for any new code execution paths
3. **Keep whitelist minimal** - only add what's necessary
4. **Document security implications** of new features
5. **Review third-party dependencies** for vulnerabilities

## Reporting Security Issues

If you discover a security vulnerability:
1. **Do not** open a public GitHub issue
2. Contact project maintainers privately
3. Provide detailed reproduction steps
4. Allow time for fix before public disclosure

## Security Checklist

- [x] Whitelist-based sandbox
- [x] Infinite loop protection
- [x] Resource limits (console output)
- [x] Constructor chain protection
- [x] Strict mode execution
- [x] Isolated scope (IIFE)
- [ ] Web Worker isolation (future)
- [ ] Server-side execution (future)
- [ ] Rate limiting (future)
- [ ] CSP headers (future)
- [ ] Monitoring and logging (future)
