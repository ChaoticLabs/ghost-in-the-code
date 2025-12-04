# Challenge System

## Overview

14 challenges across 3 concept types teach kids coding fundamentals through interactive debugging.

## Challenge Types

### Loops (4 challenges)
Learn repetition and iteration:
- Basic for loops
- While loops
- Loop conditions
- Nested loops

### Conditionals (5 challenges)
Master decision-making:
- If statements
- If-else logic
- Else-if chains
- Boolean conditions
- Comparison operators

### Logic Puzzles (5 challenges)
Solve tricky problems:
- Pattern recognition
- Logical reasoning
- Problem decomposition
- Algorithm thinking

## Challenge Structure

Each challenge is defined in JSON:

```json
{
  "id": "loop-1",
  "title": "The Repeating Ghost",
  "description": "Help the ghost repeat its message!",
  "difficulty": "easy",
  "concept": "loops",
  "code": [
    "function greet() {",
    "  for (let i = 0; i < 3; i++) {",
    "    console.log('Boo!');",
    "  }",
    "}"
  ],
  "buggyLines": [1],
  "solution": "  for (let i = 0; i < 5; i++) {",
  "hints": [
    "Look at the loop condition",
    "How many times should it repeat?",
    "Change the number in the condition"
  ],
  "explanation": "Loops repeat code multiple times..."
}
```

## Challenge Flow

1. **Introduction** - Concept explanation before first challenge of each type
2. **Challenge Display** - Show buggy code with highlighted editable lines
3. **User Edit** - Student fixes the buggy line(s)
4. **Validation** - Check if solution matches expected fix
5. **Feedback** - Success animation or error message
6. **Learning Summary** - Post-challenge explanation
7. **Progress Update** - Track completion and mastery

## Validation

Validation is flexible:
- Whitespace-insensitive comparison
- Accepts multiple valid solutions
- Provides specific error feedback
- Tracks attempts and hints used

## Hint System

Three-level progressive hints:
1. **Gentle nudge** - Points to the problem area
2. **Specific guidance** - Explains what needs to change
3. **Direct help** - Almost gives away the answer

Hint usage affects mastery score but doesn't prevent completion.

## Scoring

Each challenge starts at 100 points:
- **-15 points** per hint used
- **-10 points** per extra attempt
- Minimum score: 0 points

Concept mastery = average of all challenge scores in that concept.

## Adding New Challenges

1. Create JSON file in `src/data/challenges/`
2. Follow the challenge interface structure
3. Add to `challengeLoader.ts`
4. Test validation logic
5. Add concept explanations if new type

See existing challenge files for examples.
