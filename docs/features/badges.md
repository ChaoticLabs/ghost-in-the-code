# Badge System

## Overview

8 badges reward different achievements and encourage mastery of coding concepts.

## Badge Categories

### Concept Mastery (3 badges)
Earned by completing all challenges in a concept with high scores:

- **Loop Master** 🔄 - Complete all loop challenges
- **Conditional Champion** 🤔 - Complete all conditional challenges  
- **Logic Legend** 🧩 - Complete all logic challenges

**Requirement:** Complete all challenges in the concept type

### Achievement Badges (3 badges)
Earned through specific accomplishments:

- **First Bug Fixed** 🐛 - Complete your first challenge
- **Hint-Free Hero** 💡 - Complete 3 challenges without using hints
- **Persistent Ghost Helper** 🎯 - Complete 10 total challenges

### Special Badges (2 badges)
Earned through exceptional performance:

- **Perfect Start** ⭐ - Complete first 3 challenges without hints or extra attempts
- **Ghost Whisperer** 👻 - Achieve 90%+ mastery in all three concepts

## Badge Earning Logic

Badges are checked after each challenge completion:

```typescript
// Example: First Bug Fixed
if (completedChallenges.length === 1) {
  earnBadge('first-bug-fixed');
}

// Example: Hint-Free Hero
const hintFreeChallenges = completedChallenges.filter(
  c => c.hintsUsed === 0
);
if (hintFreeChallenges.length >= 3) {
  earnBadge('hint-free-hero');
}
```

## Badge Display

- **Badge Collection Modal** - View all earned badges
- **Unlock Animations** - Celebration when earning a badge
- **Progress Indicators** - Show progress toward unearned badges
- **Certificate Generation** - (Planned) Download badge certificates

## Badge Data Structure

```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'concept' | 'achievement' | 'special';
  requirement: string;
}
```

## Persistence

Badge progress is saved to LocalStorage:
- Earned badges list
- Challenge completion data
- Mastery scores
- Hint usage statistics

## Adding New Badges

1. Define badge in `src/data/badges.ts`
2. Add earning logic to `src/engine/useBadgeSystem.ts`
3. Update badge collection UI if needed
4. Test earning conditions

## Future Enhancements

- Custom SVG badge icons (currently using emoji)
- Downloadable badge certificates
- Social sharing of badges
- Leaderboard integration
- Time-based badges (speed challenges)
