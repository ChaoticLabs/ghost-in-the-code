# Architecture Overview

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast dev server and optimized builds)
- **Animation:** Framer Motion
- **State Management:** React Context + useReducer
- **Persistence:** LocalStorage with versioning

### Backend / Infrastructure
- **IaC:** AWS CDK (TypeScript)
- **Hosting:** S3 + CloudFront
- **API:** API Gateway + Lambda
- **Voice:** Amazon Polly
- **Runtime:** Node.js 20.x

### Development
- **Language:** TypeScript (strict mode)
- **Testing:** Vitest
- **Linting:** ESLint
- **No Docker:** Local bundling with esbuild

## Design Philosophy

This is a **hackathon project** with these priorities:

1. **Core functionality first** - Features over polish
2. **Clean, understandable code** - Not production-grade, but readable
3. **Speed of development** - Demonstrable features quickly
4. **Public repository** - No credentials in code
5. **Simplified approaches** - Mock data and basic implementations are fine

## Key Design Decisions

### State Management
- **Why Context + useReducer?** Simple, no external dependencies, sufficient for game state
- **LocalStorage persistence** - Automatic save on state changes with versioning

### Challenge System
- **JSON-based data** - Easy to add new challenges without code changes
- **Type-safe loading** - TypeScript interfaces validate challenge structure
- **Modular organization** - Separate files per concept type

### Animation System
- **Framer Motion** - Declarative, performant, accessibility-first
- **GPU-accelerated** - Uses transforms for smooth animations
- **Reduced motion support** - Respects user preferences

### Lambda Functions
- **TypeScript** - Type safety for backend code
- **Local bundling** - esbuild compiles TS to JS, no Docker needed
- **Minimal dependencies** - Faster cold starts

### Security
- **Whitelist sandbox** - Only safe globals allowed
- **Iteration limits** - Prevents infinite loops
- **Resource limits** - Caps console output
- See [Security](development/security.md) for details

## Performance Considerations

- **Code splitting** - Vite automatically splits JSON challenge files
- **Debounced validation** - 150ms delay on syntax highlighting
- **Lazy loading** - Components loaded on demand
- **CloudFront CDN** - Global edge caching for fast delivery
- **S3 audio cache** - Polly responses cached to reduce API calls

## Accessibility

- **WCAG AAA contrast** - High contrast ratios throughout
- **Keyboard navigation** - All interactive elements accessible
- **Focus indicators** - 3px yellow outlines
- **Screen reader friendly** - Semantic HTML and ARIA labels
- **Reduced motion** - Animations disabled when preferred

## Browser Support

- **Modern browsers** - Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile browsers** - iOS Safari, Chrome for Android
- **Graceful degradation** - Fallbacks for older browsers
- See [Browser Compatibility](reference/browser-compat.md) for details

## Data Flow

```
User Input → GameBoard → Reducer → State Update → LocalStorage
                ↓
         CodeEditor → Validation → Success/Failure
                ↓
         Animations → Badge Check → State Update
```

## API Architecture

```
Frontend → API Gateway → Lambda (Polly) → S3 Cache
                                    ↓
                              Amazon Polly
```

## Future Considerations

If scaling beyond hackathon:
- Add proper backend with database
- Implement user accounts and authentication
- Add server-side code execution sandbox
- Implement rate limiting and monitoring
- Add comprehensive error tracking
