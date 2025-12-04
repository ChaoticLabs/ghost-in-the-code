# Challenge Validation Rules

## Overview

Validation rules prevent cheating and ensure players fix the actual bug rather than just hardcoding the output. Rules are defined in JSON challenge files and use regex patterns to check code structure.

## Solution Structure

The `solution` object in challenge JSON files defines how to validate player code:

```json
{
  "solution": {
    "type": "output-match",
    "expectedOutput": "Expected output here",
    "alternativeOutputs": ["Alternative 1", "Alternative 2"],
    "validationRules": [
      {
        "name": "rule-identifier",
        "description": "Technical description for developers",
        "pattern": "regex-pattern-here",
        "shouldMatch": true,
        "feedbackMessage": "Friendly message shown to players when rule fails"
      }
    ]
  }
}
```

### Solution Properties

- **type**: Always `"output-match"` (validates by comparing output)
- **expectedOutput**: The primary expected output string
- **alternativeOutputs**: (Optional) Array of alternative valid outputs
- **validationRules**: (Optional) Array of anti-cheat validation rules

## Alternative Outputs

Use `alternativeOutputs` when multiple outputs are valid:

### Example: Formatting Variations

```json
{
  "expectedOutput": "1, 2, 3",
  "alternativeOutputs": ["1,2,3", "1 2 3"]
}
```

### Example: Multiple Correct Answers

```json
{
  "expectedOutput": "The answer is 42",
  "alternativeOutputs": ["Answer: 42", "42 is the answer"]
}
```

### Example: Platform Differences

```json
{
  "expectedOutput": "Line 1\nLine 2",
  "alternativeOutputs": ["Line 1\r\nLine 2"]
}
```

### When to Use

- Different valid formatting styles
- Multiple mathematically correct answers
- Output with/without trailing whitespace
- Platform-specific line endings

### When NOT to Use

- Don't use for wrong answers or partial solutions
- Don't use to make challenges easier
- Use validation rules instead for structural requirements

## Adding Validation Rules

Validation rules prevent cheating and ensure code structure is correct:

## Rule Properties

- **name**: Unique identifier for the rule (kebab-case)
- **description**: Technical description (used if feedbackMessage is missing)
- **pattern**: Regex pattern as a string (will be converted to RegExp)
- **shouldMatch**: `true` if pattern must be found, `false` if it must not be found
- **feedbackMessage**: (Optional) Friendly, educational message shown to players

## Common Patterns

### Check for Operators

```json
{
  "name": "greater-than-or-equal",
  "description": "Must use >= for inclusive comparison",
  "pattern": ">=",
  "shouldMatch": true,
  "feedbackMessage": "You need to use >= instead of > to include the boundary value!"
}
```

### Check for Code Structure

```json
{
  "name": "has-if-statement",
  "description": "Code must contain conditional logic",
  "pattern": "if\\s*\\(",
  "shouldMatch": true,
  "feedbackMessage": "The if statement is missing! Keep the original code structure."
}
```

### Prevent Direct Cheating

```json
{
  "name": "no-direct-console-cheat",
  "description": "Code must contain logic, not just output",
  "pattern": "^[\\s]*console\\.log\\(['\"`][^'\"`]*['\"`]\\);?[\\s]*$",
  "shouldMatch": false,
  "feedbackMessage": "You can't just write the answer! Fix the actual bug in the code."
}
```

### Check for Variables

```json
{
  "name": "has-password-variable",
  "description": "Code must contain password variable",
  "pattern": "let\\s+password\\s*=|const\\s+password\\s*=",
  "shouldMatch": true,
  "feedbackMessage": "The password variable is missing! Keep the original code structure."
}
```

## Regex Tips

- Escape special characters: `\(`, `\)`, `\[`, `\]`, `\.`, `\+`, `\*`, etc.
- Use `\\s` for whitespace, `\\w` for word characters
- Use `|` for OR: `let\\s+|const\\s+` matches "let " or "const "
- Use `^` for start of string, `$` for end of string
- Use `.*` for any characters, `[^'"]` for anything except quotes

## Writing Good Feedback Messages

Feedback messages should be:
- **Friendly**: Use encouraging language with ghost emojis 👻
- **Educational**: Explain what's wrong and why
- **Actionable**: Tell players what to do to fix it
- **Kid-friendly**: Simple language for the target audience

### Good Examples

✅ "The password checker still uses '>' instead of '>='. A password that's exactly 8 characters should be strong too!"

✅ "You can't just delete everything and write the answer! Keep the password variable and if statement, then fix the comparison."

### Bad Examples

❌ "Invalid operator" (too technical, not helpful)

❌ "Pattern validation failed" (confusing, no guidance)

❌ "You're wrong" (discouraging, not educational)

## Testing Validation Rules

After adding rules, test them:

1. Try the correct solution - should pass
2. Try hardcoding the output - should fail with appropriate message
3. Try removing key code elements - should fail with appropriate message
4. Try wrong operators - should fail with appropriate message

Run tests: `npm test`

## Complete Example

Here's a full challenge solution with all features:

```json
{
  "solution": {
    "type": "output-match",
    "expectedOutput": "Count: 1\nCount: 2\nCount: 3",
    "alternativeOutputs": [
      "Count: 1\r\nCount: 2\r\nCount: 3"
    ],
    "validationRules": [
      {
        "name": "has-for-loop",
        "description": "Code must contain a for loop",
        "pattern": "for\\s*\\(",
        "shouldMatch": true,
        "feedbackMessage": "You need to use a for loop to count! Don't just write the output directly."
      },
      {
        "name": "has-increment",
        "description": "Loop must increment counter",
        "pattern": "i\\+\\+|i\\s*\\+=\\s*1",
        "shouldMatch": true,
        "feedbackMessage": "Your loop needs to increment the counter (i++) to count up!"
      }
    ]
  }
}
```

## Reference Examples

See these challenges for working examples:
- `src/data/challenges/cybersecurity.json` - cyber-basic-1 (comprehensive validation)
- `src/data/challenges/conditionals.json` - conditional-basic-1 (basic validation)
