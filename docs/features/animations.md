# Animations

## Overview

Magical Halloween-themed success animations using Framer Motion celebrate challenge completion.

## Animation Types

### CodeHeal
Green healing wave sweeps across the fixed code:
- Gradient wave effect
- Left-to-right animation
- 1.5s duration
- Indicates code is "healed"

### TerminalGlow
Pulsing glow with corner emojis:
- Green glow effect around code editor
- Sparkle emojis in corners (✨)
- Pulsing animation
- 2s duration

### ParticleBurst
Curved, floating emoji particles across screen:
- 20 random emojis (🎃, 👻, ⭐, 🌟, ✨, 🎉)
- Curved paths using cubic bezier
- Staggered timing
- Floats up and fades out
- 3s duration

### GhostCelebrate
Bouncing, rotating ghost character:
- Bounce animation
- Rotation effect
- Scale changes
- 2s duration

## Implementation

All animations use Framer Motion:

```typescript
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>
```

## Performance

- **GPU-accelerated** - Uses `transform` and `opacity` only
- **No layout thrashing** - Avoids properties that trigger reflow
- **Staggered animations** - Prevents too many simultaneous animations
- **Cleanup** - Animations removed from DOM after completion

## Accessibility

Respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .animation {
    transition: none !important;
    animation: none !important;
  }
}
```

When reduced motion is preferred:
- Animations are disabled
- Instant state changes
- Functionality preserved

## Animation Triggers

Animations play when:
1. Challenge is successfully completed
2. Badge is earned
3. Level is completed
4. Ghost is clicked (celebration)

## Customization

### Add New Animation

1. Create animation component in `src/animations/`
2. Define motion variants
3. Add to `SuccessAnimations.tsx`
4. Trigger from game logic

Example:

```typescript
const variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  },
  exit: { 
    opacity: 0, 
    scale: 0,
    transition: { duration: 0.3 }
  }
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  {content}
</motion.div>
```

### Adjust Timing

Edit animation durations in component files:

```typescript
transition={{ 
  duration: 1.5,  // Total duration
  delay: 0.2,     // Start delay
  ease: "easeOut" // Easing function
}}
```

## Future Enhancements

- Sound effects synchronized with animations
- More animation variety (random selection)
- Particle physics (realistic movement)
- Confetti cannon effect
- Screen shake on big achievements
- Custom animations per badge type
