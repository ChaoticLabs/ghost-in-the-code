# Concept Explanations

## Overview

Students can click a "Learn Concepts" button (📚) to open detailed explanations in a new tab without losing game progress.

## How It Works

### For Students
1. Click 📚 icon in top-right corner during any challenge
2. New tab opens with concept explanations
3. Study the concepts and code examples
4. Return to game - progress is preserved

### Content Includes
- Level overview and description
- Key concept explanations
- Interactive code examples with syntax highlighting
- Before/after comparisons (❌ incorrect → ✅ correct)
- Demo examples with explanations

## Available Concepts

Each level has tailored explanations:
- **Functions** ⚙️ - Function basics and parameters
- **Loops** 🔄 - For loops, while loops, iteration
- **Conditionals** 🤔 - If statements, boolean logic
- **Arrays** 📊 - Array manipulation and methods
- **Logic** 🧩 - Problem-solving patterns
- **Cybersecurity** 🔒 - Security concepts

## Technical Implementation

### Architecture
- **JSON-based content** - Separate file per concept in `src/data/conceptExplanations/`
- **Dynamic loading** - Imports appropriate JSON based on level type
- **New tab generation** - Creates standalone HTML with embedded CSS
- **Syntax highlighting** - Code examples are properly formatted

### Data Structure

```json
{
  "title": "Understanding Loops",
  "description": "Learn how loops work...",
  "concepts": [
    {
      "title": "For Loops",
      "explanation": "A for loop repeats code...",
      "codeExamples": [
        {
          "type": "demo",
          "code": "for (let i = 0; i < 5; i++) { ... }",
          "explanation": "This loop runs 5 times"
        },
        {
          "type": "comparison",
          "before": "for (let i = 0; i < 3; i++) { ... }",
          "after": "for (let i = 0; i < 5; i++) { ... }",
          "explanation": "Changed to run 5 times instead of 3"
        }
      ]
    }
  ],
  "readyMessage": "Ready to start coding!"
}
```

### Design System
- Reuses CSS variables from main app
- Consistent styling with game theme
- Responsive layout
- Print-friendly styles

## Adding New Concepts

1. Create JSON file: `src/data/conceptExplanations/[levelname].json`
2. Follow existing structure with title, description, concepts
3. Add code examples (demo or comparison type)
4. Update `loadConceptExplanation()` in `conceptExplanation.ts`
5. Test by clicking 📚 button in that level

## Benefits

- **Non-disruptive** - Doesn't interrupt game flow
- **Self-paced** - Students control study time
- **Comprehensive** - All key concepts explained
- **Accessible** - Clean, readable format
- **Modular** - Easy to add/update content

## Future Enhancements

- Interactive code playground in explanations
- Video tutorials embedded
- Downloadable PDF versions
- Search functionality
- Bookmarking favorite explanations
