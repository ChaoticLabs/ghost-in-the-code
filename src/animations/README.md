# Animation System

The Animation System provides a centralized way to manage and trigger animations throughout the Ghost in The Code game. It supports sequential animation queuing, completion callbacks, and four main animation types.

## Architecture

The system consists of:

1. **AnimationProvider**: React Context provider that manages animation state
2. **useAnimationController**: Low-level hook for direct animation control
3. **useAnimations**: High-level hook with convenient methods for each animation type
4. **Type definitions**: TypeScript interfaces for type safety

## Animation Types

### 1. codeHeal
Lines of code glow and repair when a bug is fixed.
- **Default Duration**: 1500ms
- **Use Case**: When player successfully fixes a code bug

### 2. terminalGlow
Pulsing glow effect on the code editor/terminal.
- **Default Duration**: 2000ms
- **Use Case**: Success feedback for the entire editor area

### 3. ghostCelebrate
Ghost character performs a happy/celebration animation.
- **Default Duration**: 2000ms
- **Use Case**: Positive reinforcement when challenges are completed

### 4. particleBurst
Sparkles and particle effects burst on screen.
- **Default Duration**: 1500ms
- **Use Case**: Visual celebration effect for achievements

## Setup

Wrap your app with the `AnimationProvider`:

```tsx
import { AnimationProvider } from './animations';

function App() {
  return (
    <AnimationProvider>
      <YourGameComponents />
    </AnimationProvider>
  );
}
```

## Usage

### Basic Usage

```tsx
import { useAnimations } from './animations';

function GameComponent() {
  const { codeHeal, ghostCelebrate } = useAnimations();

  const handleSuccess = () => {
    // Trigger a single animation
    codeHeal({
      target: 'line-5',
      onComplete: () => console.log('Animation done!')
    });
  };

  return <button onClick={handleSuccess}>Fix Bug</button>;
}
```

### Sequential Animations

```tsx
import { useAnimations } from './animations';

function ChallengeComplete() {
  const { codeHeal, terminalGlow, ghostCelebrate, particleBurst } = useAnimations();

  const celebrateSuccess = () => {
    // Queue multiple animations with delays
    codeHeal({ delay: 0 });
    terminalGlow({ delay: 500 });
    ghostCelebrate({ delay: 800 });
    particleBurst({ delay: 1200 });
  };

  return <button onClick={celebrateSuccess}>Complete Challenge</button>;
}
```

### Success Sequence

Use the built-in success sequence for common celebration patterns:

```tsx
import { useAnimations } from './animations';

function Challenge() {
  const { successSequence } = useAnimations();

  const handleChallengeComplete = () => {
    successSequence({
      onComplete: () => {
        // All animations finished
        console.log('Celebration complete!');
      }
    });
  };

  return <button onClick={handleChallengeComplete}>Submit Solution</button>;
}
```

## Animation Options

All animation methods accept an options object:

```typescript
interface AnimationOptions {
  target?: string;      // Optional target element selector
  duration?: number;    // Duration in milliseconds
  delay?: number;       // Delay before starting in milliseconds
  onComplete?: () => void; // Callback when animation completes
}
```

## Utility Functions

```tsx
import { useAnimations } from './animations';

function AnimationDebug() {
  const { 
    isPlaying, 
    getQueueLength, 
    getCurrentAnimation,
    clearAnimations 
  } = useAnimations();

  return (
    <div>
      <p>Playing: {isPlaying() ? 'Yes' : 'No'}</p>
      <p>Queue Length: {getQueueLength()}</p>
      <p>Current: {getCurrentAnimation()?.type || 'None'}</p>
      <button onClick={clearAnimations}>Clear All</button>
    </div>
  );
}
```

## Integration with Game State

The animation system is designed to work alongside the game state management:

```tsx
import { useGame } from '../engine';
import { useAnimations } from '../animations';

function CodeEditor() {
  const { dispatch } = useGame();
  const { successSequence } = useAnimations();

  const handleCorrectSolution = (challengeId: string) => {
    // Trigger animations
    successSequence({
      onComplete: () => {
        // Update game state after animations
        dispatch({ 
          type: 'COMPLETE_CHALLENGE', 
          payload: { challengeId, hintsUsed: 0, attempts: 1 } 
        });
      }
    });
  };

  return <div>...</div>;
}
```

## Performance Considerations

- Animations are queued and played sequentially to avoid overwhelming the browser
- Each animation has a default duration to ensure timely completion
- The queue can be cleared at any time using `clearAnimations()`
- Completion callbacks are guaranteed to fire after the animation duration

## Future Enhancements

The animation system is designed to be extensible. Future animation types can be added by:

1. Adding the new type to `AnimationType` in `types.ts`
2. Creating a method in `useAnimations.ts`
3. Implementing the visual animation in the appropriate component

## Requirements Satisfied

This implementation satisfies the following requirements:

- **3.1**: Animations trigger on challenge completion
- **3.2**: Multiple animation types (codeHeal, terminalGlow, ghostCelebrate, particleBurst)
- **3.3**: Sequential animation support through queuing
- **3.5**: Animation completion callbacks for coordination
