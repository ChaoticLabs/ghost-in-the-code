# EducationalContentModal Component

## Overview
The EducationalContentModal displays educational content to help kids learn coding concepts while playing Ghost in The Code.

## Features

### ✅ Task Requirements Met

1. **Modal/Overlay for Concept Explanations**
   - Full-screen overlay with centered modal
   - Ghost-themed design with animations
   - High contrast, accessible styling

2. **Display Explanation When New Challenge Type Introduced**
   - Automatically shows when player encounters a new challenge type (loop, conditional, logic)
   - Tracks seen types in localStorage to avoid repetition
   - Provides age-appropriate introduction to each concept

3. **Show Summary After Challenge Completion**
   - Displays educational content from challenge data after success
   - Shows celebration emojis and encouraging message
   - Explains what the player just learned

4. **Age-Appropriate Language**
   - Simple, friendly explanations for kids
   - Uses relatable analogies (counting, making choices, solving mysteries)
   - Encouraging tone throughout

5. **Skip/Dismiss Option**
   - "Skip Intro" button for introduction mode
   - Close button (X) in header
   - Click outside modal to dismiss
   - All actions properly tracked in localStorage

## Usage

```tsx
import { EducationalContentModal } from './components';

<EducationalContentModal
  isVisible={showModal}
  challenge={currentChallenge}
  mode="introduction" // or "completion"
  onClose={handleClose}
  onSkip={handleSkip} // optional
/>
```

## Props

- `isVisible`: boolean - Controls modal visibility
- `challenge`: Challenge | null - Current challenge with educational content
- `mode`: 'introduction' | 'completion' - Display mode
- `onClose`: () => void - Called when modal is closed
- `onSkip`: () => void - Optional callback for skip button

## Modes

### Introduction Mode
- Shows when player encounters a new challenge type
- Provides concept overview with friendly explanation
- Includes tip section with encouragement
- Has "Skip Intro" and "Let's Go!" buttons

### Completion Mode
- Shows after successfully completing a challenge
- Displays the challenge's educational content
- Shows celebration emojis
- Has "Continue" button

## Accessibility Features

- High contrast colors (WCAG AAA compliant)
- Large, readable text (1.25rem base)
- 44px minimum touch targets
- Keyboard navigation support
- Focus indicators (3px yellow outline)
- Reduced motion support
- Responsive design for mobile/tablet

## LocalStorage

The component uses localStorage to track:
- `seenChallengeTypes`: Array of challenge types the player has seen introductions for

## Animations

- Fade in overlay (0.3s)
- Slide up modal (0.3s)
- Floating ghost icon (3s loop)
- Bouncing celebration emojis (0.6s loop)
- All animations respect `prefers-reduced-motion`

## Integration

The modal is integrated into App.tsx and:
1. Shows automatically when a new challenge type loads
2. Shows after challenge completion (2s delay for animations)
3. Handles progression to next challenge on close
4. Marks challenge types as seen to avoid repetition
