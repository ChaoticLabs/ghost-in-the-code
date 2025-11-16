# Security Measures

## Code Sandbox Security

Ghost in The Code implements multiple layers of security to safely execute user-provided JavaScript code:

### 1. Whitelist-Based Sandbox
- Only explicitly allowed globals are available (Array, Object, String, Number, Boolean, Math, Date, JSON)
- All dangerous APIs are explicitly set to `undefined`:
  - **Code Execution**: `eval`, `Function` constructor
  - **Timing**: `setTimeout`, `setInterval`, `setImmediate`
  - **Network**: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`
  - **Workers**: `Worker`, `SharedWorker`, `ServiceWorker`, `importScripts`
  - **Browser APIs**: `window`, `document`, `localStorage`, `sessionStorage`, `indexedDB`, `navigator`
  - **Navigation**: `location`, `history`, `open`, `close`
  - **User Interaction**: `alert`, `confirm`, `prompt`
  - **Global Access**: `globalThis`, `self`, `top`, `parent`, `frames`

### 2. Infinite Loop Protection
- All loops (while, for, do-while) are automatically instrumented
- Maximum 100,000 iterations per execution
- Throws clear error message when limit is exceeded
- Handles both braced and single-line loops

### 3. Resource Limits
- **Console Output**: Maximum 1,000 `console.log()` calls
- **Output Length**: Maximum 10,000 characters total
- Prevents memory exhaustion and DoS attacks

### 4. Constructor Chain Protection
- Freezes `Object.prototype`, `Array.prototype`, etc.
- Blocks access to `.constructor` property
- Prevents sandbox escape via prototype chain

### 5. Strict Mode Execution
- All code runs in JavaScript strict mode
- Prevents accidental global variable creation
- Catches common coding errors

### 6. Isolated Scope
- Code runs in an IIFE (Immediately Invoked Function Expression)
- No access to outer scope or global variables
- Each execution is completely isolated

## Known Limitations

While these measures provide strong protection for a learning environment, they are not 100% bulletproof:

1. **Not a True Sandbox**: JavaScript's `Function` constructor cannot create a truly isolated environment
2. **Browser Context**: Code still runs in the browser's JavaScript engine
3. **CPU Usage**: Malicious code could still consume CPU cycles (mitigated by iteration limits)

## Recommendations for Production

If deploying this application publicly, consider:

1. **Web Workers**: Move code execution to a Web Worker for better isolation
2. **Server-Side Execution**: Use a proper sandboxed environment (e.g., VM2, isolated-vm)
3. **Rate Limiting**: Implement rate limiting on code execution
4. **Content Security Policy**: Add CSP headers to prevent XSS
5. **Monitoring**: Log and monitor code execution for abuse patterns

## For Developers

When adding new features:
- Never add new globals to the sandbox without security review
- Test any new code execution paths for escape vectors
- Keep the whitelist minimal - only add what's necessary
- Document any security implications of new features

## Reporting Security Issues

If you discover a security vulnerability, please report it to the project maintainers privately before public disclosure.
