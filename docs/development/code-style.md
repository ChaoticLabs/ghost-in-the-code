# Code Style Guide

## TypeScript Guidelines

### Strict Mode
Always use strict mode (enabled in `tsconfig.json`):
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

### Type Safety
- Define proper interfaces for all data structures
- Use type guards for runtime type checking
- Avoid `any` - use `unknown` or proper types instead
- Leverage TypeScript's type inference where appropriate

```typescript
// ✅ Good
interface Challenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

function isChallenge(obj: unknown): obj is Challenge {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj
  );
}

// ❌ Bad
function processData(data: any) {
  return data.id;
}
```

## DRY Principle

Extract common logic, styles, and patterns into reusable components and utilities.

### Component Reuse
```typescript
// ✅ Good - Reusable button component
<IconButton 
  icon="📚" 
  onClick={handleClick}
  ariaLabel="Learn concepts"
/>

// ❌ Bad - Duplicated button code
<button className="icon-button" onClick={handleClick}>
  📚
</button>
```

### Utility Functions
```typescript
// ✅ Good - Shared utility
import { formatScore } from '@/utils/scoring';

// ❌ Bad - Duplicated logic
const score = Math.max(0, 100 - (hints * 15) - (attempts * 10));
```

### Shared Styles
```css
/* ✅ Good - Utility class */
.icon-button { /* ... */ }

/* ❌ Bad - Duplicated styles */
.learn-button { /* same styles */ }
.help-button { /* same styles */ }
```

## Self-Documenting Code

Code should be self-explanatory through clear naming and structure. Only add comments for complex logic that isn't immediately obvious.

```typescript
// ✅ Good - Clear naming, no comment needed
function calculateMasteryScore(hintsUsed: number, extraAttempts: number): number {
  const baseScore = 100;
  const hintPenalty = hintsUsed * 15;
  const attemptPenalty = extraAttempts * 10;
  return Math.max(0, baseScore - hintPenalty - attemptPenalty);
}

// ❌ Bad - Unclear naming, needs comment
function calc(h: number, a: number): number {
  // Calculate score based on hints and attempts
  return Math.max(0, 100 - (h * 15) - (a * 10));
}

// ✅ Good - Complex logic with helpful comment
function parseSSML(text: string, emotion: Emotion): string {
  // SSML prosody tags must be properly nested and closed
  // to avoid Polly synthesis errors
  const prosody = getProsodyForEmotion(emotion);
  return `<speak><prosody ${prosody}>${text}</prosody></speak>`;
}
```

### When to Comment
- **Complex algorithms** - Explain the "why" not the "what"
- **Non-obvious workarounds** - Browser quirks, API limitations
- **Business logic** - Domain-specific rules
- **TODOs** - Planned improvements

### When NOT to Comment
- **Obvious code** - `// Set name to value` for `name = value`
- **Redundant explanations** - Function already has clear name
- **Outdated comments** - Remove or update, don't leave stale

## Naming Conventions

### Variables and Functions
- Use camelCase
- Be descriptive and specific
- Boolean variables start with `is`, `has`, `should`

```typescript
// ✅ Good
const isCompleted = true;
const hasHintsRemaining = hints > 0;
const shouldShowAnimation = isCompleted && !reducedMotion;

// ❌ Bad
const completed = true;
const hints_remaining = hints > 0;
const show = isCompleted && !reducedMotion;
```

### Components
- Use PascalCase
- Name reflects purpose
- Avoid generic names

```typescript
// ✅ Good
<BadgeCollection />
<CodeEditor />
<SuccessAnimation />

// ❌ Bad
<Component1 />
<Editor />
<Animation />
```

### Constants
- Use UPPER_SNAKE_CASE for true constants
- Use camelCase for configuration objects

```typescript
// ✅ Good
const MAX_HINTS = 3;
const API_TIMEOUT = 5000;

const animationConfig = {
  duration: 1.5,
  easing: 'easeOut'
};

// ❌ Bad
const maxHints = 3;
const ANIMATION_CONFIG = { ... };
```

## File Organization

### Component Files
```typescript
// 1. Imports
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Component.css';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onComplete: () => void;
}

// 3. Constants
const ANIMATION_DURATION = 1.5;

// 4. Component
export function Component({ title, onComplete }: ComponentProps) {
  // Hooks
  const [state, setState] = useState(false);
  
  // Event handlers
  const handleClick = () => {
    setState(true);
    onComplete();
  };
  
  // Render
  return (
    <div onClick={handleClick}>
      {title}
    </div>
  );
}
```

### Utility Files
```typescript
// 1. Types
export interface Score {
  points: number;
  mastery: number;
}

// 2. Constants
const BASE_SCORE = 100;

// 3. Functions (pure functions first)
export function calculateScore(hints: number, attempts: number): number {
  return Math.max(0, BASE_SCORE - (hints * 15) - (attempts * 10));
}

// 4. Helper functions (internal)
function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}
```

## React Best Practices

### Hooks
- Call hooks at the top level
- Use custom hooks for reusable logic
- Memoize expensive calculations

```typescript
// ✅ Good
function Component() {
  const [state, setState] = useState(0);
  const memoizedValue = useMemo(() => expensiveCalc(state), [state]);
  
  return <div>{memoizedValue}</div>;
}

// ❌ Bad
function Component() {
  if (condition) {
    const [state, setState] = useState(0); // ❌ Conditional hook
  }
}
```

### Props
- Destructure props in function signature
- Use TypeScript interfaces for prop types
- Provide default values when appropriate

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}
```

## CSS Guidelines

### Use Utility Classes
Leverage shared utility classes from `index.css`:

```tsx
// ✅ Good
<button className="icon-button">📚</button>
<div className="modal-overlay">
  <div className="modal-container">
    {content}
  </div>
</div>

// ❌ Bad - Duplicating styles
<button style={{ padding: '8px', borderRadius: '8px' }}>📚</button>
```

### CSS Variables
Use CSS custom properties for consistency:

```css
/* ✅ Good */
.component {
  color: var(--color-primary);
  background: var(--color-dark-bg);
}

/* ❌ Bad */
.component {
  color: #A3FF00;
  background: #1A1F2E;
}
```

## Error Handling

### Basic Error Handling
```typescript
// ✅ Good
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  console.error('Failed to fetch data:', error);
  showErrorMessage('Unable to load data. Please try again.');
}

// ❌ Bad
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  // Silent failure
}
```

### Type Guards
```typescript
// ✅ Good
function processError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Testing

Focus on core functionality:
- Test critical game logic
- Test badge earning conditions
- Test challenge validation
- Skip trivial getters/setters

```typescript
// ✅ Good - Testing important logic
describe('calculateMasteryScore', () => {
  it('should return 100 for perfect completion', () => {
    expect(calculateMasteryScore(0, 0)).toBe(100);
  });
  
  it('should penalize hints', () => {
    expect(calculateMasteryScore(2, 0)).toBe(70);
  });
});
```

## Accessibility

- Use semantic HTML
- Provide ARIA labels for icon buttons
- Ensure keyboard navigation works
- Test with screen readers

```tsx
// ✅ Good
<button 
  className="icon-button"
  onClick={handleClick}
  aria-label="Learn concepts"
>
  📚
</button>

// ❌ Bad
<div onClick={handleClick}>📚</div>
```

## Performance

- Avoid premature optimization
- Use React.memo for expensive components
- Debounce rapid updates
- Lazy load large components

```typescript
// ✅ Good - Debounced validation
const debouncedValidate = useMemo(
  () => debounce(validateCode, 150),
  []
);
```
