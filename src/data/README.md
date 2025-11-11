# Challenge Data Module

This module contains the challenge data structure and loader for Ghost in The Code.

## Structure

```
src/data/
├── challenges/           # JSON files containing challenge data
│   ├── loops.json       # Loop-related challenges
│   ├── conditionals.json # Conditional-related challenges
│   └── logic.json       # Logic puzzle challenges
├── challengeLoader.ts   # Challenge loader with validation
├── index.ts            # Module exports
└── README.md           # This file
```

## Usage

### Loading All Challenges

```typescript
import { loadAllChallenges } from './data';

const challenges = loadAllChallenges();
// Returns: Map<string, Challenge[]>
// Keys: 'loops', 'conditionals', 'logic'
```

### Getting Challenges by Type

```typescript
import { getChallengesByType } from './data';

const loopChallenges = getChallengesByType('loop');
const conditionalChallenges = getChallengesByType('conditional');
const logicChallenges = getChallengesByType('logic');
```

### Getting a Specific Challenge

```typescript
import { getChallengeById } from './data';

const challenge = getChallengeById('loop-basic-1');
if (challenge) {
  console.log(challenge.title); // "The Infinite Haunting"
}
```

### Getting All Challenges as Flat Array

```typescript
import { getAllChallengesFlat } from './data';

const allChallenges = getAllChallengesFlat();
// Returns: Challenge[]
```

### Getting Challenge Counts

```typescript
import { getChallengeCount } from './data';

const counts = getChallengeCount();
console.log(counts);
// { loops: 4, conditionals: 5, logic: 5, total: 14 }
```

## Challenge Data Structure

Each challenge follows this structure:

```typescript
interface Challenge {
  id: string;                    // Unique identifier
  type: 'loop' | 'conditional' | 'logic';
  title: string;                 // Challenge title
  description: string;           // What the player needs to do
  codeFragment: {
    lines: CodeLine[];           // Array of code lines
    buggyLines: number[];        // Line numbers with bugs
  };
  solution: {
    type: 'line-replacement';
    lineNumber: number;          // Which line to fix
    correctContent: string;      // The correct code
    alternativeCorrectContent?: string[]; // Alternative solutions
  };
  hints: string[];               // Array of hints (3 max)
  educationalContent: string;    // What the player learns
}
```

## Validation

The challenge loader automatically validates all challenges on load. It checks:

- Required fields are present and correct type
- Code fragments have valid structure
- Solutions are properly formatted
- Hints array is not empty
- Educational content is provided

If validation fails, a `ChallengeValidationError` is thrown with details about what's wrong.

## Adding New Challenges

To add new challenges:

1. Edit the appropriate JSON file in `challenges/`
2. Follow the existing structure
3. Run tests to validate: `npm test`
4. The loader will automatically pick up the new challenges

## Current Challenge Count

- **Loops**: 4 challenges (basic to intermediate)
- **Conditionals**: 5 challenges (basic to intermediate)
- **Logic**: 5 challenges (basic to intermediate)
- **Total**: 14 challenges
