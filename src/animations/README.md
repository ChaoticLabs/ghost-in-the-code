# Success Animations

This directory contains the animation system for Ghost in The Code, built with Framer Motion.

## Overview

The success animations provide cute, Halloween-themed visual feedback when players successfully fix bugs in challenges. All animations are designed to complete within 2.5 seconds for a snappy, satisfying feel and respect accessibility preferences.

**Theme:** Friendly Halloween with sparkles (✨), stars (⭐), pumpkins (🎃), ghosts (👻), and green hearts (💚).

## Components

### SuccessAnimations.tsx

Contains four main animation components:

#### 1. CodeHeal
Cute healing effect for fixed code lines with a sweeping green wave and sparkle emojis (✨💚).

```tsx
<CodeHeal 
  lineNumber={2} 
  isActive={true}
  onComplete={() => console.log('Heal complete')}
/>
```

**Props:**
- `lineNumber`: The line number to animate
- `isActive`: Whether the animation is active
- `onComplete`: Callback when animation completes

**Duration:** 1.5 seconds

**Visual Effects:**
- Green healing wave sweeps across the line
- Sparkle (✨) and green heart (💚) emojis travel along the line
- Glowing effect with drop shadows

#### 2. TerminalGlow
Pulsing glow effect on the code editor with cute Halloween emojis in the corners.

```tsx
<TerminalGlow 
  isActive={true}
  onComplete={() => console.log('Glow complete')}
/>
```

**Props:**
- `isActive`: Whether the animation is active
- `onComplete`: Callback when animation completes

**Duration:** 2 seconds

**Visual Effects:**
- Pulsing green border glow around the editor
- Radial gradient background glow
- Corner emojis appear in sequence: ✨ (top-left), ⭐ (top-right), 🎃 (bottom-left), 👻 (bottom-right)
- Each emoji spins and fades with staggered timing

#### 3. ParticleBurst
Halloween-themed emoji particles that burst outward across the **entire screen** in a celebratory explosion.

```tsx
<ParticleBurst 
  isActive={true}
  centerX={50}
  centerY={40}
  particleCount={20}
  onComplete={() => console.log('Burst complete')}
/>
```

**Props:**
- `isActive`: Whether the animation is active
- `centerX`: X position as percentage (default: 50)
- `centerY`: Y position as percentage (default: 40)
- `particleCount`: Number of particles (default: 20)
- `onComplete`: Callback when animation completes

**Duration:** 3 seconds (slowed down for graceful effect)

**Visual Effects:**
- Random Halloween emojis: ✨, ⭐, 🎃, 👻, 💚, 🌟, 💫
- Particles burst outward in a circular pattern **across the entire viewport**
- Travel distance: 200-500 pixels from center
- Each particle rotates smoothly (600°) with gentle easing
- Scales gradually through 6 keyframes for smooth motion
- Staggered delays (0-0.3s) for natural, flowing feel
- Enhanced glowing effects with multiple drop shadows
- Uses `position: fixed` to cover full screen
- Slower, more graceful animation allows players to appreciate the celebration

#### 4. SuccessAnimation (Combined)
Orchestrates all animations in sequence for a complete success effect.

```tsx
<SuccessAnimation 
  isActive={true}
  fixedLineNumber={2}
  onComplete={() => console.log('All animations complete')}
/>
```

**Props:**
- `isActive`: Whether the animation is active
- `fixedLineNumber`: The line number that was fixed (optional)
- `onComplete`: Callback when all animations complete

**Duration:** 2.5 seconds total

**Sequence:**
1. CodeHeal starts immediately (0ms)
2. TerminalGlow starts at 300ms
3. ParticleBurst starts at 600ms

All animations overlap for a smooth, flowing celebration effect!

### GhostCharacter.tsx (Enhanced)

The ghost character now uses Framer Motion for the celebrating state:

```tsx
<GhostCharacter 
  state="celebrating"
  message="Amazing work! You fixed it! 🎉"
  showSpeechBubble={true}
/>
```

**Celebrating Animation:**
- Bounces up and down
- Rotates left and right
- Scales up slightly
- Shows animated sparkles (✨) and stars (⭐)

**Duration:** 1.5 seconds

## Usage in GameBoard

The success animations are applied to the **entire GameBoard** for maximum visual impact:

```tsx
// In App.tsx
const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

const handleChallengeSuccess = () => {
  // Trigger all success animations
  setShowSuccessAnimation(true);
  setGhostState('celebrating');
  
  // Reset animations after they complete
  setTimeout(() => {
    setShowSuccessAnimation(false);
    setGhostState('idle');
  }, 2500);
};

// Pass to GameBoard
<GameBoard
  showSuccessAnimation={showSuccessAnimation}
  // ... other props
/>
```

```tsx
// In GameBoard.tsx
<div className="game-board" style={{ position: 'relative' }}>
  {/* Success Animations cover entire viewport */}
  <TerminalGlow isActive={showSuccessAnimation} />
  <ParticleBurst 
    isActive={showSuccessAnimation} 
    centerX={50} 
    centerY={40} 
    particleCount={20} 
  />
  
  {/* Game content */}
</div>
```

**Note:** ParticleBurst uses `position: fixed` to ensure particles spread across the entire screen, not just the GameBoard container.

```tsx
// In CodeEditor.tsx - Only CodeHeal for the fixed line
<div className="code-container" style={{ position: 'relative' }}>
  <CodeHeal 
    lineNumber={challenge.solution.lineNumber}
    isActive={showSuccessAnimation}
  />
  {/* code lines */}
</div>
```

**Why GameBoard-level animations?**
- Creates a more immersive celebration experience
- Particles and glow effects cover the entire screen
- Ghost character celebration syncs with the visual effects
- Makes the success feel more impactful and rewarding

## Accessibility

All animations respect user preferences:

### Reduced Motion
When `prefers-reduced-motion: reduce` is detected:
- All animations are disabled
- Simple opacity fades are used instead
- Ghost character remains static

### High Contrast Mode
When `prefers-contrast: high` is detected:
- Glow effects are more pronounced
- Border widths are increased
- Colors are more saturated

## Animation Timing

All animations are designed to complete within 3 seconds for a graceful, satisfying celebration:

| Animation | Duration | Delay | Total Time |
|-----------|----------|-------|------------|
| CodeHeal | 1500ms | 0ms | 1500ms |
| TerminalGlow | 2000ms | 300ms | 2300ms |
| ParticleBurst | 3000ms | 600ms | 3600ms* |
| GhostCelebrate | 1500ms | 0ms | 1500ms |

**Maximum total time:** 3000ms (3 seconds)

*ParticleBurst extends slightly beyond the 3s window but fades out gracefully

The animations overlap intentionally to create a smooth, flowing celebration effect rather than sequential steps. The slower particle animation allows players to fully appreciate the Halloween-themed celebration!

## Performance

- Uses CSS transforms for GPU acceleration
- Framer Motion optimizes animations automatically
- Particles are limited to 15 by default (reduced for better performance)
- Emoji-based particles are lightweight (no image assets needed)
- Animations clean up properly on unmount
- Bounce easing creates natural, playful movement

## Future Enhancements

Potential improvements for future tasks:
- Sound effects synchronized with animations
- More particle types (stars, hearts, code symbols)
- Customizable animation speeds
- Animation presets for different challenge types
- Level-specific celebration animations
